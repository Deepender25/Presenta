class VideoExporter {
    constructor() {
        this.encoder = null;
        this.muxer = null;
        this.cancelFlag = false;
    }

    async export(renderer, config, onProgress, onComplete) {
        this.cancelFlag = false;

        if (typeof WebMMuxer === 'undefined') {
            console.error("WebMMuxer not found");
            onComplete(false, "WebMMuxer library not loaded. Check internet connection.");
            return;
        }

        if (typeof VideoEncoder === 'undefined') {
            console.error("VideoEncoder not found");
            onComplete(false, "Your browser does not support VideoEncoder (WebCodecs). Please use Chrome, Edge, or Safari 15+.");
            return;
        }

        const { width, height, fps, duration, bitrate, format } = config;
        const isMp4 = format === 'mp4';

        let muxer;
        let videoEncoder;
        let videoConfig;

        if (isMp4) {
            if (typeof Mp4Muxer === 'undefined') {
                console.error("Mp4Muxer not found");
                onComplete(false, "Mp4Muxer library not loaded.");
                return;
            }

            muxer = new Mp4Muxer.Muxer({
                target: new Mp4Muxer.ArrayBufferTarget(),
                video: {
                    codec: 'avc', // or 'hevc' if supported, but avc is safer
                    width: width,
                    height: height
                },
                fastStart: 'in-memory' // Needed for streaming-like playback support
            });

            videoEncoder = new VideoEncoder({
                output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
                error: (e) => {
                    console.error("VideoEncoder Error:", e);
                    onComplete(false, e);
                }
            });

            // H.264 (AVC) Config
            // avc1.4d002a = High Profile, Level 4.2 (Common for 1080p/4K)
            // avc1.42001f = Baseline (Very compatible)
            videoConfig = {
                codec: 'avc1.4d002a',
                width: width,
                height: height,
                bitrate: bitrate || 10_000_000,
                framerate: fps
            };

        } else {
            // WebM (VP9)
            muxer = new WebMMuxer.Muxer({
                target: new WebMMuxer.ArrayBufferTarget(),
                video: {
                    codec: 'V_VP9',
                    width: width,
                    height: height,
                    frameRate: fps
                }
            });

            videoEncoder = new VideoEncoder({
                output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
                error: (e) => {
                    console.error("VideoEncoder Error:", e);
                    onComplete(false, e);
                }
            });

            videoConfig = {
                codec: 'vp09.00.10.08',
                width: width,
                height: height,
                bitrate: bitrate || 10_000_000,
                framerate: fps
            };
        }

        // Check support
        try {
            if (isMp4) {
                // Try a list of AVC profiles from best to most compatible
                // avc1.6400xx = High
                // avc1.4d00xx = Main
                // avc1.4200xx = Baseline
                const codecsToCheck = [
                    'avc1.640034', // High Profile, Level 5.2 
                    'avc1.64002a', // High Profile, Level 4.2 (Standard 4K/1080p)
                    'avc1.64001f', // High Profile, Level 3.1
                    'avc1.4d002a', // Main Profile, Level 4.2
                    'avc1.4d001f', // Main Profile, Level 3.1
                    'avc1.42001f', // Baseline, Level 3.1
                    'avc1.42E01E'  // Constrained Baseline (Android/iOS/Safe)
                ];

                let supportedCodec = null;
                for (const codec of codecsToCheck) {
                    videoConfig.codec = codec;
                    const support = await VideoEncoder.isConfigSupported(videoConfig);
                    if (support.supported) {
                        supportedCodec = codec;
                        console.log("Found supported H.264 codec:", codec);
                        break;
                    }
                }

                if (!supportedCodec) {
                    onComplete(false, "MP4 (H.264) export is not supported by your browser/device configuration. Please use standard WebM.");
                    return;
                }
                // config already set to supported one
            } else {
                // WebM Check
                const support = await VideoEncoder.isConfigSupported(videoConfig);
                if (!support.supported) {
                    onComplete(false, "WebM (VP9) codec not supported.");
                    return;
                }
            }
        } catch (e) {
            console.error("Codec check error:", e);
            onComplete(false, "Codec check failed: " + e.message);
            return;
        }

        videoEncoder.configure(videoConfig);

        // --- Rendering Loop ---
        const totalFrames = Math.ceil(duration * fps);
        const frameBackendDuration = 1 / fps; // seconds

        // Stop current animation
        renderer.stop();
        renderer.isExporting = true;

        // Save original renderer state
        const originalTime = renderer.currentTime;

        // --- Iterative Frame Processing Loop ---
        // Uses a for-loop with explicit yields to prevent browser freeze,
        // especially critical for image exports where there's no natural async pause.
        const processFrames = async () => {
            for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
                if (this.cancelFlag) {
                    videoEncoder.close();
                    renderer.isExporting = false;
                    onComplete(false, "Cancelled");
                    return;
                }

                // 1. Set Time
                const time = frameIndex * frameBackendDuration;
                renderer.currentTime = time;

                // 2. For video: seek to exact time and wait
                if (renderer.contentType === 'video' && renderer.content) {
                    const seekTarget = time % renderer.content.duration;
                    renderer.content.currentTime = seekTarget;

                    await new Promise(resolve => {
                        const onSeeked = () => {
                            renderer.content.removeEventListener('seeked', onSeeked);
                            resolve();
                        };
                        renderer.content.addEventListener('seeked', onSeeked, { once: true });
                        // Safety timeout in case seeked never fires
                        setTimeout(resolve, 100);
                    });
                }

                // 3. Draw frame to canvas (synchronous for both image and video)
                renderer.draw();

                // 4. Create bitmap from canvas
                const bitmap = await createImageBitmap(renderer.canvas);

                const frame = new VideoFrame(bitmap, {
                    timestamp: frameIndex * (1000000 / fps), // microseconds
                    duration: (1000000 / fps)
                });

                // 5. Close bitmap IMMEDIATELY to free GPU memory (~33MB per frame at 4K)
                bitmap.close();

                // 6. Encode with proper back-pressure
                // Wait until encoder queue drains to prevent OOM
                while (videoEncoder.encodeQueueSize > 3) {
                    await new Promise(r => setTimeout(r, 5));
                }

                videoEncoder.encode(frame, { keyFrame: frameIndex % (fps * 2) === 0 });
                frame.close();

                // 7. Report progress and ALWAYS yield to keep browser responsive
                onProgress(frameIndex / totalFrames);
                await new Promise(r => setTimeout(r, 0));
            }

            // All frames encoded — finalize
            await videoEncoder.flush();
            muxer.finalize();
            const buffer = muxer.target.buffer;
            const blob = new Blob([buffer], { type: isMp4 ? 'video/mp4' : 'video/webm' });

            renderer.isExporting = false;
            renderer.currentTime = originalTime;
            renderer.draw();

            onComplete(true, blob);
        };

        // Start
        processFrames();
    }

    cancel() {
        this.cancelFlag = true;
    }
}
