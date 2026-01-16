document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('main-canvas');

    // UI References
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');

    const deviceTypeEl = document.getElementById('device-type');
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
    // resizeModeEl removed

    // Aspect Ratio Buttons
    const aspectRatioGroup = document.getElementById('aspect-ratio-group');
    if (aspectRatioGroup) {
        const buttons = aspectRatioGroup.querySelectorAll('.toggle-btn');
        buttons.forEach(btn => {
            btn.onclick = () => {
                // Update Active State
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update Select Value (for compatibility/logic reuse)
                const val = btn.dataset.value;
                if (aspectRatioEl) {
                    aspectRatioEl.value = val;
                    aspectRatioEl.dispatchEvent(new Event('change'));
                }
            };
        });
    }

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
        bgColorEl.oninput = (e) => {
            renderer.setConfig({ bgColor: e.target.value });
            const hexSpan = document.getElementById('bg-color-hex');
            if (hexSpan) hexSpan.textContent = e.target.value;
        };
    }

    durationEl.oninput = (e) => {
        durationValEl.textContent = `${e.target.value}s`;
        renderer.setConfig({ duration: Number(e.target.value) });
    };

    holdStartEl.oninput = (e) => {
        document.getElementById('hold-start-val').textContent = `${e.target.value}s`;
        renderer.setConfig({ holdStart: Number(e.target.value) });
    };

    // ... (rest of animation/timeline logic unchanged) ...

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

    // resetShadowBtn.onclick ... (Removed from UI)

    // Actions
    playBtn.onclick = () => {
        const btnText = playBtn.querySelector('.btn-text');
        if (renderer.isPlaying) {
            renderer.stop();
            if (btnText) btnText.textContent = "Preview Animation";
        } else {
            renderer.play(() => {
                if (btnText) btnText.textContent = "Preview Animation";
            });
            if (btnText) btnText.textContent = "Stop Preview";
        }
    };

    exportBtn.onclick = () => {
        renderer.startExport();
    };

    // Initial UI Sync
    // Trigger devicetype change to set initial visibility logic
    deviceTypeEl.dispatchEvent(new Event('change'));
    // Trigger aspect ratio to set initial
    if (aspectRatioEl) aspectRatioEl.dispatchEvent(new Event('change'));

    // Collapsible Logic
    const setupCollapsible = (header, content) => {
        if (header && content) {
            header.onclick = () => {
                const isHidden = content.classList.contains('hidden');
                if (isHidden) {
                    content.classList.remove('hidden');
                    header.classList.add('active');
                } else {
                    content.classList.add('hidden');
                    header.classList.remove('active');
                }
            };
        }
    };

    // Device Size
    const sizeHeader = document.getElementById('device-size-header');
    const sizeContent = document.getElementById('device-size-content');
    setupCollapsible(sizeHeader, sizeContent);

    // Corner Radius
    const radiusHeader = document.getElementById('radius-header');
    const radiusContent = document.getElementById('radius-content');
    setupCollapsible(radiusHeader, radiusContent);

    // Shadow Settings
    const shadowHeader = document.getElementById('shadow-header');
    const shadowContent = document.getElementById('shadow-content');
    setupCollapsible(shadowHeader, shadowContent);

    setOrientation('landscape');

});
