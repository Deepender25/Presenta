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
    const fitContentBtn = document.getElementById('fit-content-btn');

    // Init Renderer
    const renderer = new CanvasRenderer(canvas, {
        onSizeChange: (w, h) => {
            frameWidthEl.value = Math.round(w);
            frameHeightEl.value = Math.round(h);
        },
        onDurationChange: (d) => {
            durationEl.value = d;
            durationValEl.textContent = `${d}s`;
            // Renderer config is already updated internally by the time this is called?
            // Or should we update it? 
            // Better to just update UI, assuming renderer did its own update.
            // Actually, app.js listeners might trigger setConfig again if we aren't careful.
            // But updating input value programmatically doesn't trigger 'input' event usually.
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
        dropZone.innerHTML = `<p class="file-name" title="${file.name}">${file.name}</p>`;
        renderer.loadContent(file);

        // Conditional Button Visibility
        const fitBtn = document.getElementById('fit-content-btn');
        if (fitBtn) {
            if (file.type.startsWith('video')) {
                fitBtn.style.display = 'inline-flex';
            } else {
                fitBtn.style.display = 'none';
            }
        }
    }

    // Config Changes
    deviceTypeEl.onchange = (e) => {
        const type = e.target.value;
        // renderer.setConfig({ deviceType: type }); // Removed to allow atomic update below

        // Toggle radius visibility
        if (type === 'none') {
            radiusWrapper.classList.remove('hidden');
        } else {
            radiusWrapper.classList.add('hidden');
        }

        // Determine Default Orientation
        let targetOrientation = 'landscape';
        if (type === 'iphone') {
            targetOrientation = 'portrait';
        }

        // Update UI Buttons Manually
        if (targetOrientation === 'portrait') {
            btnPortrait.classList.add('active');
            btnLandscape.classList.remove('active');
        } else {
            btnLandscape.classList.add('active');
            btnPortrait.classList.remove('active');
        }

        // Atomic Update to Renderer
        renderer.setConfig({
            deviceType: type,
            orientation: targetOrientation
        });
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

    if (fitContentBtn) {
        fitContentBtn.onclick = () => {
            renderer.fitFrameToContent();
        };
    }

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
    const bgColorText = document.getElementById('bg-color-text');
    if (bgColorEl && bgColorText) {
        // Picker -> Text & Renderer
        bgColorEl.oninput = (e) => {
            const val = e.target.value.toUpperCase();
            renderer.setConfig({ bgColor: val });
            bgColorText.value = val;
        };

        // Text -> Picker & Renderer
        bgColorText.oninput = (e) => {
            let val = e.target.value;
            // Enforce # prefix
            if (!val.startsWith('#')) {
                val = '#' + val;
                e.target.value = val;
            }

            // simple hex regex check
            if (/^#[0-9A-F]{6}$/i.test(val)) {
                renderer.setConfig({ bgColor: val });
                bgColorEl.value = val;
            }
        };

        // Blur to format
        bgColorText.onblur = (e) => {
            let val = e.target.value;
            // If valid hex, ensure formatted
            if (!val.startsWith('#')) val = '#' + val;
            if (/^#[0-9A-F]{6}$/i.test(val)) {
                e.target.value = val.toUpperCase();
            } else {
                // Revert to picker value if invalid
                e.target.value = bgColorEl.value.toUpperCase();
            }
        };

        // Reset Button
        const bgColorResetBtn = document.getElementById('bg-color-reset-btn');
        if (bgColorResetBtn) {
            bgColorResetBtn.onclick = () => {
                const defaultColor = '#ECECEC';
                renderer.setConfig({ bgColor: defaultColor });
                bgColorEl.value = defaultColor;
                bgColorText.value = defaultColor;
            };
        }
    }

    // Background Image
    const bgImageUploadBtn = document.getElementById('bg-image-upload-btn');
    const bgImageInput = document.getElementById('bg-image-input');
    const bgImageFilename = document.getElementById('bg-image-filename');
    const bgImageRemoveBtn = document.getElementById('bg-image-remove-btn');

    bgImageUploadBtn.onclick = () => bgImageInput.click();

    bgImageInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            bgImageFilename.textContent = file.name;
            const img = new Image();
            img.onload = () => {
                renderer.setConfig({ bgImage: img });
            };
            img.src = URL.createObjectURL(file);
        }
    };

    bgImageRemoveBtn.onclick = () => {
        bgImageInput.value = ''; // Reset input
        bgImageFilename.textContent = 'Upload Image...';
        renderer.setConfig({ bgImage: null });
    };

    durationEl.oninput = (e) => {
        durationValEl.textContent = `${e.target.value}s`;
        renderer.setConfig({ duration: Number(e.target.value) });
    };

    holdStartEl.oninput = (e) => {
        document.getElementById('hold-start-val').textContent = `${e.target.value}s`;
        renderer.setConfig({ holdStart: Number(e.target.value) });
    };

    // --- Animation Settings & Timeline ---
    const animationStyleEl = document.getElementById('animation-style');
    const humanSettingsContainer = document.getElementById('human-settings-container');
    const humanModeGroup = document.getElementById('human-mode-group'); // Segmented Control
    const intervalSettings = document.getElementById('interval-settings');
    const customStopsSettings = document.getElementById('custom-stops-settings');
    const scrollIncrementEl = document.getElementById('scroll-increment');
    const incrementValEl = document.getElementById('increment-val');
    const timelineSlider = document.getElementById('timeline-slider');

    let customStops = [];
    let currentHumanMode = 'fixed'; // 'fixed' or 'custom'

    // 1. Dropdown Change
    animationStyleEl.onchange = (e) => {
        const mode = e.target.value;
        if (mode === 'human') {
            humanSettingsContainer.classList.remove('hidden');
            // Re-apply current sub-mode logic
            applyHumanMode();
        } else {
            // Linear
            humanSettingsContainer.classList.add('hidden');
            renderer.setConfig({ scrollMode: 'continuous', stops: [] });
        }
    };

    // 2. Sub-mode Segmented Control
    const humanBtns = humanModeGroup.querySelectorAll('.toggle-btn');
    humanBtns.forEach(btn => {
        btn.onclick = () => {
            humanBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentHumanMode = btn.dataset.value;
            applyHumanMode();
        };
    });

    const applyHumanMode = () => {
        if (currentHumanMode === 'fixed') {
            intervalSettings.classList.remove('hidden');
            customStopsSettings.classList.add('hidden');
            updateIntervalStops();
        } else {
            intervalSettings.classList.add('hidden');
            customStopsSettings.classList.remove('hidden');
            renderer.setConfig({ scrollMode: 'human', stops: customStops });
            renderTimeline(); // Force render fixed stops
        }
    };

    // Interval Logic
    const updateIntervalStops = () => {
        const val = Number(scrollIncrementEl.value);
        incrementValEl.textContent = `${val}%`;

        const stops = [];
        let current = val;
        while (current < 100) {
            stops.push(current / 100);
            current += val;
        }
        renderer.setConfig({ scrollMode: 'human', stops: stops });
    };

    scrollIncrementEl.oninput = updateIntervalStops;

    // Trigger initial state
    animationStyleEl.dispatchEvent(new Event('change'));

    // Custom Timeline Logic
    // Drag Helper
    // Drag Helper
    const startDrag = (initialX, index, dot) => {
        const rect = timelineSlider.getBoundingClientRect();
        let hasMoved = false;

        const onMove = (moveEvent) => {
            const dx = Math.abs(moveEvent.clientX - initialX);
            if (dx > 2) hasMoved = true; // Threshold for movement

            let newRatio = (moveEvent.clientX - rect.left) / rect.width;
            if (newRatio < 0.01) newRatio = 0.01;
            if (newRatio > 0.99) newRatio = 0.99;

            customStops[index] = newRatio;
            dot.style.left = `${newRatio * 100}%`;
            dot.title = `Stop at ${Math.round(newRatio * 100)}%`;

            // LIVE PREVIEW
            if (renderer.setScrollRatio) {
                renderer.setScrollRatio(newRatio);
            }
        };

        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);

            // Only re-render if actually moved, to preserve DOM for DoubleClick
            if (hasMoved) {
                customStops.sort((a, b) => a - b);
                renderTimeline();
                renderer.setConfig({ stops: customStops });
                // Reset preview to first frame
                renderer.clearPreview();
            }
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    };

    const renderTimeline = () => {
        // Clear existing stops (dots) - keep track/progress
        const existingDots = timelineSlider.querySelectorAll('.timeline-stop');
        existingDots.forEach(d => d.remove());

        // Render Fixed Stops (0% and 100%)
        [0, 1].forEach(pos => {
            const dot = document.createElement('div');
            dot.className = 'timeline-stop fixed';
            dot.style.left = `${pos * 100}%`;
            dot.title = pos === 0 ? "Start (0%)" : "End (100%)";

            // Hover Preview
            dot.onmouseenter = () => { if (renderer.setScrollRatio) renderer.setScrollRatio(pos); };
            dot.onmouseleave = () => { if (renderer.clearPreview) renderer.clearPreview(); };

            timelineSlider.appendChild(dot);
        });

        // Render Custom Stops
        customStops.forEach((stopVal, index) => {
            const dot = document.createElement('div');
            dot.className = 'timeline-stop custom';
            dot.style.left = `${stopVal * 100}%`;
            dot.title = `Stop at ${Math.round(stopVal * 100)}% (Drag to move, DblClick to remove)`;

            // Drag Logic
            dot.onmousedown = (e) => {
                e.stopPropagation();
                startDrag(e.clientX, index, dot);
            };

            // Hover Preview
            dot.onmouseenter = () => { if (renderer.setScrollRatio) renderer.setScrollRatio(stopVal); };
            dot.onmouseleave = () => { if (renderer.clearPreview) renderer.clearPreview(); };

            // Remove on dblclick
            dot.ondblclick = (e) => {
                e.stopPropagation();
                customStops.splice(index, 1);
                renderTimeline();
                renderer.setConfig({ stops: customStops });
            };

            timelineSlider.appendChild(dot);
        });
    };

    timelineSlider.onmousedown = (e) => {
        // Add stop if clicked on track (not on an existing dot)
        if (!e.target.classList.contains('timeline-stop')) {
            const rect = timelineSlider.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            let ratio = clickX / rect.width;

            // Avoid adding too close to edges
            if (ratio < 0.02 || ratio > 0.98) return;

            // Immediate Preview on Click
            if (renderer.setScrollRatio) {
                renderer.setScrollRatio(ratio);
            }

            customStops.push(ratio);
            customStops.sort((a, b) => a - b);

            renderTimeline();
            renderer.setConfig({ stops: customStops });

            // Immediately drag new point
            const newIndex = customStops.indexOf(ratio);
            const customDots = timelineSlider.querySelectorAll('.timeline-stop.custom');
            const dot = customDots[newIndex];
            if (dot) {
                // Pass current mouse position to startDrag
                startDrag(e.clientX, newIndex, dot);
            }
        }
    };

    // Hover preview?
    timelineSlider.onmousemove = (e) => {
        const rect = timelineSlider.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        // Pass to renderer for preview scrolling if we want?
        // renderer.scrollToPreview(ratio); 
        // Optional: Implementing drag scrubbing would be nice but simple hover is okay for now.
    };

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

    const exportQualityEl = document.getElementById('export-quality');
    const exportFormatEl = document.getElementById('export-format');

    // Export Logic
    const exportOverlay = document.getElementById('export-overlay');
    const cancelExportBtn = document.getElementById('cancel-export-btn');
    const sidebar = document.getElementById('sidebar');

    const setExportUI = (active) => {
        if (active) {
            exportOverlay.classList.remove('hidden');
            sidebar.classList.add('disabled');
        } else {
            exportOverlay.classList.add('hidden');
            sidebar.classList.remove('disabled');
        }
    };

    exportBtn.onclick = () => {
        const quality = exportQualityEl.value;
        const format = exportFormatEl.value;

        setExportUI(true);

        renderer.startExport(quality, format, (success) => {
            // Callback on complete or cancel
            setExportUI(false);
            if (!success) {
                console.log("Export cancelled by user.");
            }
        });
    };

    cancelExportBtn.onclick = () => {
        renderer.cancelExport();
        // UI reset handled by startExport callback, but we can force it just in case
        // actually renderer.cancelExport() sets flag, which triggers onstop, which fires callback false.
        // So setExportUI(false) will happen there.
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

    // --- Custom Dropdown Implementation ---
    const setupCustomDropdowns = () => {
        const selects = document.querySelectorAll('select:not(.hidden):not(.no-custom), select.hidden#aspect-ratio');
        // Note: aspect-ratio might be hidden initially by CSS but we want to customize it if we unhide it?
        // Actually, the aspect-ratio UI uses buttons, and the select is hidden. We should IGNOR hidden selects usually.
        // But let's stick to visible ones plus explicit targets.

        const targetSelects = document.querySelectorAll('select:not(.no-custom)');

        targetSelects.forEach(select => {
            if (select.classList.contains('customized')) return; // Avoid double init
            if (select.hasAttribute('hidden') || select.classList.contains('hidden')) {
                // If it's the aspect-ratio select which is hidden because we use buttons, we skip it.
                return;
            }

            select.classList.add('hidden', 'customized'); // Hide native

            // Wrapper
            const wrapper = document.createElement('div');
            wrapper.className = 'custom-select-wrapper';

            // Header
            const header = document.createElement('div');
            header.className = 'custom-select-header';
            const selectedOption = select.options[select.selectedIndex];
            header.innerHTML = `
                <span class="selected-text">${selectedOption ? selectedOption.text : ''}</span>
                <svg class="chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            `;

            // List
            const list = document.createElement('div');
            list.className = 'custom-select-list hidden';

            Array.from(select.options).forEach((opt, index) => {
                const item = document.createElement('div');
                item.className = `custom-select-option ${index === select.selectedIndex ? 'selected' : ''}`;
                item.textContent = opt.text;
                item.dataset.value = opt.value;

                item.onclick = (e) => {
                    e.stopPropagation();
                    select.value = opt.value;
                    select.dispatchEvent(new Event('change'));

                    header.querySelector('.selected-text').textContent = opt.text;
                    list.querySelectorAll('.custom-select-option').forEach(el => el.classList.remove('selected'));
                    item.classList.add('selected');
                    list.classList.add('hidden');
                    header.classList.remove('active');
                };
                list.appendChild(item);
            });

            // Append List to Body to avoid clipping/z-index issues
            document.body.appendChild(list);

            // Update Position logic
            const updatePosition = () => {
                const rect = header.getBoundingClientRect();
                const viewportHeight = window.innerHeight;

                // Allow some padding
                const padding = 10;
                const spaceBelow = viewportHeight - rect.bottom - padding;
                const spaceAbove = rect.top - padding;

                // Reset styles
                list.style.bottom = 'auto';
                list.style.top = 'auto';
                list.style.maxHeight = '300px'; // Reset to default max

                // Logic: Prefer Down if fits, or if Down has MORE space than Up (and neither fits perfectly)
                // But we want to avoid clipping. 

                if (spaceBelow >= 300 || spaceBelow >= spaceAbove) {
                    // Down
                    list.style.top = `${rect.bottom + 4}px`;
                    list.style.left = `${rect.left}px`;
                    list.style.width = `${rect.width}px`;

                    // Constrain Height
                    if (spaceBelow < 300) {
                        list.style.maxHeight = `${spaceBelow}px`;
                    }
                } else {
                    // Up (Flip)
                    const bottomPos = viewportHeight - rect.top + 4;
                    list.style.bottom = `${bottomPos}px`;
                    list.style.left = `${rect.left}px`;
                    list.style.width = `${rect.width}px`;

                    // Constrain Height
                    if (spaceAbove < 300) {
                        list.style.maxHeight = `${spaceAbove}px`;
                    }
                }
            };

            // Header Click
            header.onclick = (e) => {
                e.stopPropagation();

                // Close others
                document.querySelectorAll('.custom-select-list').forEach(l => {
                    if (l !== list) l.classList.add('hidden');
                });
                document.querySelectorAll('.custom-select-header').forEach(h => {
                    if (h !== header) h.classList.remove('active');
                });

                if (list.classList.contains('hidden')) {
                    // Open
                    updatePosition();
                    list.classList.remove('hidden');
                    header.classList.add('active');
                } else {
                    // Close
                    list.classList.add('hidden');
                    header.classList.remove('active');
                }
            };

            // Handle resize to close dropdowns
            window.addEventListener('resize', () => {
                if (!list.classList.contains('hidden')) {
                    list.classList.add('hidden');
                    header.classList.remove('active');
                }
            });

            wrapper.appendChild(header);
            // wrapper.appendChild(list); // Moved to body
            select.parentNode.insertBefore(wrapper, select.nextSibling);

            // Sync external changes
            select.addEventListener('change', () => {
                const newText = select.options[select.selectedIndex].text;
                header.querySelector('.selected-text').textContent = newText;
                list.querySelectorAll('.custom-select-option').forEach(el => {
                    if (el.dataset.value === select.value) el.classList.add('selected');
                    else el.classList.remove('selected');
                });
            });
        });

        // Global Click to Close
        document.addEventListener('click', (e) => {
            // Ignore if clicking inside a custom select (list or header)
            if (e.target.closest('.custom-select-list') || e.target.closest('.custom-select-header')) return;

            document.querySelectorAll('.custom-select-list').forEach(l => l.classList.add('hidden'));
            document.querySelectorAll('.custom-select-header').forEach(h => h.classList.remove('active'));
        });
    };

    setupCustomDropdowns();
});
