document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('main-canvas');

    // UI References
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');

    const deviceTypeEl = document.getElementById('device-type');
    const resizeModeEl = document.getElementById('resize-mode');
    const aspectRatioEl = document.getElementById('aspect-ratio');
    const bgColorEl = document.getElementById('bg-color');

    const durationEl = document.getElementById('duration');
    const durationValEl = document.getElementById('duration-val');
    const holdStartEl = document.getElementById('hold-start');

    const playBtn = document.getElementById('play-btn');
    const exportBtn = document.getElementById('export-btn');

    // New Refs
    const radiusWrapper = document.getElementById('radius-wrapper');
    const cornerRadiusEl = document.getElementById('corner-radius');
    const radiusValEl = document.getElementById('radius-val');

    // Shadow Refs
    const shadowSizeEl = document.getElementById('shadow-size');
    const shadowSizeValEl = document.getElementById('shadow-size-val');
    const shadowOpacityEl = document.getElementById('shadow-opacity');
    const shadowOpacityValEl = document.getElementById('shadow-opacity-val');
    const resetShadowBtn = document.getElementById('reset-shadow-btn');

    const btnPortrait = document.getElementById('btn-portrait');
    const btnLandscape = document.getElementById('btn-landscape');

    const frameWidthEl = document.getElementById('frame-width');
    const frameHeightEl = document.getElementById('frame-height');
    const resetSizeBtn = document.getElementById('reset-size-btn');

    // Init Renderer
    const renderer = new CanvasRenderer(canvas, {
        onSizeChange: (w, h) => {
            frameWidthEl.value = Math.round(w);
            frameHeightEl.value = Math.round(h);
        }
    });

    // --- Inputs ---

    // File Drop
    dropZone.onclick = () => fileInput.click();
    dropZone.ondragover = (e) => { e.preventDefault(); dropZone.style.borderColor = '#3b82f6'; };
    dropZone.ondragleave = (e) => { e.preventDefault(); dropZone.style.borderColor = '#3f3f46'; };
    dropZone.ondrop = (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#3f3f46';
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    };

    fileInput.onchange = (e) => {
        if (e.target.files[0]) handleFile(e.target.files[0]);
    };

    function handleFile(file) {
        dropZone.innerHTML = `<p>${file.name}</p>`;
        renderer.loadContent(file);
    }

    // Config Changes
    deviceTypeEl.onchange = (e) => {
        const type = e.target.value;
        renderer.setConfig({ deviceType: type });

        // Toggle radius visibility
        if (type === 'none') {
            radiusWrapper.classList.remove('hidden');
        } else {
            radiusWrapper.classList.add('hidden');
        }
    };

    // Orientation
    const setOrientation = (o) => {
        // Toggle Buttons
        if (o === 'portrait') {
            btnPortrait.classList.add('active');
            btnLandscape.classList.remove('active');
        } else {
            btnLandscape.classList.add('active');
            btnPortrait.classList.remove('active');
        }
        renderer.setConfig({ orientation: o });
    };

    btnPortrait.onclick = () => setOrientation('portrait');
    btnLandscape.onclick = () => setOrientation('landscape');

    // Radius
    cornerRadiusEl.oninput = (e) => {
        const val = e.target.value;
        radiusValEl.textContent = val;
        renderer.setConfig({ cornerRadius: Number(val) });
    };

    // Manual Size
    const updateSize = () => {
        const w = Number(frameWidthEl.value);
        const h = Number(frameHeightEl.value);
        renderer.setFrameSize(w, h);
    };
    frameWidthEl.onchange = updateSize;
    frameHeightEl.onchange = updateSize;

    resetSizeBtn.onclick = () => {
        renderer.resetSize();
    };

    // Other Configs
    resizeModeEl.onchange = (e) => renderer.setConfig({ resizeMode: e.target.value });

    if (aspectRatioEl) {
        aspectRatioEl.onchange = (e) => {
            const [w, h] = e.target.value.split(':').map(Number);
            // Default width basis 1920
            let finalW = 1920;
            let finalH = 1920 * (h / w);

            // If aspect is vertical e.g. 9:16
            if (h > w) {
                // Should we keep width 1920 and really tall height? 
                // Or limit height to 1920?
                // Let's stick to width 1920 for quality.
            }
            // Round
            finalW = Math.round(finalW);
            finalH = Math.round(finalH);

            renderer.setConfig({ width: finalW, height: finalH });
        };
    }

    // Check if bgColorEl exists (it should)
    if (bgColorEl) {
        bgColorEl.oninput = (e) => renderer.setConfig({ bgColor: e.target.value });
    }

    durationEl.oninput = (e) => {
        durationValEl.textContent = `${e.target.value}s`;
        renderer.setConfig({ duration: Number(e.target.value) });
    };

    holdStartEl.oninput = (e) => {
        document.getElementById('hold-start-val').textContent = `${e.target.value}s`;
        renderer.setConfig({ holdStart: Number(e.target.value) });
    };

    // --- New Animation Controls ---
    const animationStyleEl = document.getElementById('animation-style');
    const intervalSettingsEl = document.getElementById('interval-settings');
    const customStopsSettingsEl = document.getElementById('custom-stops-settings');
    const scrollIncrementEl = document.getElementById('scroll-increment');
    const incrementValEl = document.getElementById('increment-val');

    // Timeline Refs
    const timelineSlider = document.getElementById('timeline-slider');
    const timelineThumb = document.getElementById('timeline-thumb');

    // State
    let stops = [];
    let stopElements = [];

    // Init
    const initAnimationControls = () => {

        // 1. Style Selection
        const updateStyle = () => {
            const style = animationStyleEl.value;
            // Config Map
            // linear -> scrollMode: 'continuous'
            // interval -> scrollMode: 'interval' (needs implementation in renderer or just reuse human+calculated stops)
            // custom -> scrollMode: 'human' + custom stops

            // Renderer Mapping
            // We'll reuse 'human' mode for both Interval and Custom, just handling stops generation differently.
            // Or add explicit modes to renderer for clarity.
            // Let's pass the style directly as 'scrollMode' if we update renderer to match.
            // Or map here.

            if (style === 'linear') {
                intervalSettingsEl.classList.add('hidden');
                customStopsSettingsEl.classList.add('hidden');
                renderer.setConfig({ scrollMode: 'linear', stops: [] });
            } else if (style === 'interval') {
                intervalSettingsEl.classList.remove('hidden');
                customStopsSettingsEl.classList.add('hidden');
                updateIntervalStops(); // Calculate stops
                renderer.setConfig({ scrollMode: 'human' }); // Use segmented logic
            } else if (style === 'custom') {
                intervalSettingsEl.classList.add('hidden');
                customStopsSettingsEl.classList.remove('hidden');
                renderer.setConfig({ scrollMode: 'human', stops: [...stops] });
            }
        };

        animationStyleEl.onchange = updateStyle;

        // 2. Interval Logic
        const updateIntervalStops = () => {
            if (animationStyleEl.value !== 'interval') return;
            const pct = Number(scrollIncrementEl.value);
            incrementValEl.textContent = `${pct}%`;

            // Calculate stops: e.g. 25 -> 0.25, 0.50, 0.75
            // 100 / 25 = 4 segments -> 3 stops.
            const newStops = [];
            let current = pct;
            while (current < 100) {
                newStops.push(current / 100);
                current += pct;
            }
            renderer.setConfig({ stops: newStops });
        };

        scrollIncrementEl.oninput = updateIntervalStops;

        // 3. Custom Timeline Logic (Vertical)

        // Click Track to Add Stop
        timelineSlider.onclick = (e) => {
            if (animationStyleEl.value !== 'custom') return;
            // Filter out clicks on dots
            if (e.target.classList.contains('timeline-stop')) return;

            const rect = timelineSlider.getBoundingClientRect();
            // Vertical: Use Y
            const y = e.clientY - rect.top;
            const ratio = Math.max(0, Math.min(1, y / rect.height));

            addStop(ratio);
        };

        // Scrubbing (Mouse Move) - Vertical
        timelineSlider.onmousemove = (e) => {
            if (e.buttons === 1) { // dragging
                const rect = timelineSlider.getBoundingClientRect();
                const y = e.clientY - rect.top;
                const ratio = Math.max(0, Math.min(1, y / rect.height));

                timelineThumb.style.top = (ratio * 100) + '%';
                // Preview on renderer
                renderer.scrollToPreview(ratio);
            }
        };
    };

    function addStop(ratio) {
        stops.push(ratio);
        stops.sort((a, b) => a - b); // Sort numerically
        renderCustomStops();
        renderer.setConfig({ stops: [...stops] });
    }

    function removeStop(index) {
        stops.splice(index, 1);
        renderCustomStops();
        renderer.setConfig({ stops: [...stops] });
    }

    function renderCustomStops() {
        // Clear existing stop elements
        stopElements.forEach(el => el.remove());
        stopElements = [];

        stops.forEach((ratio, index) => {
            const dot = document.createElement('div');
            dot.className = 'timeline-stop';
            // Vertical positioning
            dot.style.top = (ratio * 100) + '%';
            dot.title = `Stop at ${Math.round(ratio * 100)}%`;

            dot.ondblclick = (e) => {
                e.stopPropagation();
                removeStop(index);
            };

            timelineSlider.appendChild(dot);
            stopElements.push(dot);
        });
    }

    initAnimationControls();



    // Shadow Settings
    shadowSizeEl.oninput = (e) => {
        const val = e.target.value;
        shadowSizeValEl.textContent = `${val}x`;
        renderer.setConfig({ shadowSize: Number(val) });
    };

    shadowOpacityEl.oninput = (e) => {
        const val = e.target.value;
        shadowOpacityValEl.textContent = `${val}x`;
        renderer.setConfig({ shadowOpacity: Number(val) });
    };

    resetShadowBtn.onclick = () => {
        shadowSizeEl.value = 1;
        shadowOpacityEl.value = 1;
        shadowSizeValEl.textContent = "1.0x";
        shadowOpacityValEl.textContent = "1.0x";
        renderer.setConfig({ shadowSize: 1, shadowOpacity: 1 });
    };

    // Actions
    playBtn.onclick = () => {
        if (renderer.isPlaying) {
            renderer.stop();
            playBtn.textContent = "Preview Animation";
        } else {
            renderer.play(() => {
                playBtn.textContent = "Preview Animation";
            });
            playBtn.textContent = "Stop";
        }
    };

    exportBtn.onclick = () => {
        renderer.startExport();
    };

    // Initial UI Sync
    // Trigger devicetype change to set initial visibility logic
    deviceTypeEl.dispatchEvent(new Event('change'));
    if (aspectRatioEl) aspectRatioEl.dispatchEvent(new Event('change'));
    // Orientation defaults to landscape in renderer, check buttons?
    // Renderer defaults to macbook/landscape.
    // UI buttons default: Portrait active? Update UI to match renderer default
    setOrientation('landscape');

});
