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

        let frameIndex = 0;

        const processFrame = async () => {
            if (this.cancelFlag) {
                videoEncoder.close();
                renderer.isExporting = false;
                onComplete(false, "Cancelled");
                return;
            }

            if (frameIndex >= totalFrames) {
                // Finish
                await videoEncoder.flush();
                muxer.finalize();
                const buffer = muxer.target.buffer;
                const blob = new Blob([buffer], { type: isMp4 ? 'video/mp4' : 'video/webm' });

                renderer.isExporting = false;
                renderer.currentTime = originalTime; // Restore
                renderer.draw(); // Restore view

                onComplete(true, blob);
                return;
            }

            // 1. Set Time
            const time = frameIndex * frameBackendDuration;
            renderer.currentTime = time;

            // 2. Draw (Synchronous Canvas Draw)
            // Ideally renderer.draw() should be synchronous or we await it if it has async parts (images usually preloaded)
            // Given renderer.js, draw() seems synchronous except for video.
            // For video content, we need to seek the video element.

            if (renderer.contentType === 'video' && renderer.content) {
                // Seek video to exact time
                renderer.content.currentTime = time % renderer.content.duration; // Loop support

                // Wait for 'seeked' event? 
                // In many browsers setting currentTime is not instant.
                await new Promise(resolve => {
                    const onSeeked = () => {
                        renderer.content.removeEventListener('seeked', onSeeked);
                        resolve();
                    };
                    renderer.content.addEventListener('seeked', onSeeked, { once: true });

                    // Fallback if already seeked or fast
                    if (Math.abs(renderer.content.currentTime - (time % renderer.content.duration)) < 0.1) {
                        // Sometimes it's instant, but safe to wait for event
                    }
                });
            }

            renderer.draw(); // Draw to canvas

            // 3. Create VideoFrame
            // We need a bitmap or can pass canvas directly.
            // Converting canvas to bitmap is async.
            const bitmap = await createImageBitmap(renderer.canvas);

            const frame = new VideoFrame(bitmap, {
                timestamp: frameIndex * (1000000 / fps), // microseconds
                duration: (1000000 / fps)
            });

            // 4. Encode
            // encode() is non-blocking but we should monitor queue depth to avoid OOM
            if (videoEncoder.encodeQueueSize > 5) {
                // Wait a bit to let encoder catch up
                await new Promise(r => setTimeout(r, 10)); // simple yield
            }

            videoEncoder.encode(frame, { keyFrame: frameIndex % (fps * 2) === 0 });
            frame.close(); // Important to close frame to release memory

            // Progress
            if (frameIndex % 10 === 0) {
                onProgress(frameIndex / totalFrames);
                // Yield to UI to allow progress bar update and cancel button click
                await new Promise(r => setTimeout(r, 0));
            }

            frameIndex++;
            processFrame(); // Next frame (recursive/loop)
        };

        // Start Loop
        processFrame();
    }

    cancel() {
        this.cancelFlag = true;
    }
}
