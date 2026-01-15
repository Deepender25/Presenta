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

    holdStartEl.oninput = (e) => renderer.setConfig({ holdStart: Number(e.target.value) });

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
