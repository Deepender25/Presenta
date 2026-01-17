class CanvasRenderer {
    constructor(canvas, callbacks) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.callbacks = callbacks || {};

        // Default Config
        this.config = {
            width: 1920,
            height: 1080, // Default 16:9
            bgColor: '#ECECEC',
            deviceType: 'browser',
            orientation: 'landscape',
            resizeMode: 'fit',
            duration: 5,
            holdStart: 1,
            scrollMode: 'continuous', // 'continuous' or 'human'
            stops: [], // Array of ratios 0-1
            holdStop: 1, // Duration to hold at each stop
            cornerRadius: 0,
            fps: 60,
            fps: 60,
            shadowSize: 1,
            shadowOpacity: 1,
            bgImage: null // Image Object or null
        };

        // Frame State
        this.frame = { width: 1200, height: 800, x: 0, y: 0 };

        // Interaction State
        this.interaction = { dragging: false, handle: null, startX: 0, startY: 0, startW: 0, startH: 0 };

        this.content = null;
        this.contentType = null;
        this.isPlaying = false;
        this.currentTime = 0;
        this.animationId = null;
        this.mediaRecorder = null;
        this.recordedChunks = [];

        this.init();
    }

    init() {
        this.resizeCanvas();
        // Don't force resize yet, wait for setConfig or load
        this.draw();
        this.setupInteraction();
    }

    setupInteraction() {
        // ... (Interaction Logic same as before)
        const getCanvasCoords = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
        };

        this.canvas.addEventListener('mousedown', (e) => {
            if (this.isPlaying) return;
            const pos = getCanvasCoords(e);
            const handle = this.getHitHandle(pos.x, pos.y);
            if (handle) {
                this.interaction.dragging = true;
                this.interaction.handle = handle;
                this.interaction.startX = pos.x;
                this.interaction.startY = pos.y;
                this.interaction.startW = this.frame.width;
                this.interaction.startH = this.frame.height;
                this.interaction.startRatio = this.frame.width / this.frame.height; // Capture ratio
                this.canvas.style.cursor = 'grabbing';
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.interaction.dragging) {
                if (!this.isPlaying) {
                    const pos = getCanvasCoords(e);
                    const handle = this.getHitHandle(pos.x, pos.y);
                    this.setCursor(handle);
                }
                return;
            }
            const pos = getCanvasCoords(e);
            const dx = pos.x - this.interaction.startX;
            const dy = pos.y - this.interaction.startY;

            let newW = this.interaction.startW;
            let newH = this.interaction.startH;
            const handle = this.interaction.handle;

            if (handle.includes('e')) newW += dx * 2;
            if (handle.includes('w')) newW -= dx * 2;
            if (handle.includes('s')) newH += dy * 2;
            if (handle.includes('n')) newH -= dy * 2;

            // Aspect Ratio Lock for Corners
            if (handle.length === 2) {
                // If it's a corner (nw, ne, sw, se), lock the ratio.
                // We use the Width as the driver for smoothness
                newH = newW / this.interaction.startRatio;
            }

            if (newW < 200) newW = 200;
            if (newH < 200) newH = 200;

            // Constrain to canvas? Optional but good idea for "cover" bug
            if (newW > this.canvas.width - 40) newW = this.canvas.width - 40;
            if (newH > this.canvas.height - 40) newH = this.canvas.height - 40;

            this.frame.width = Math.round(newW);
            this.frame.height = Math.round(newH);
            this.updateFramePosition();
            this.draw();
            if (this.callbacks.onSizeChange) this.callbacks.onSizeChange(this.frame.width, this.frame.height);
        });

        window.addEventListener('mouseup', () => {
            this.interaction.dragging = false;
            this.interaction.handle = null;
            this.canvas.style.cursor = 'default';
        });
    }

    setCursor(handle) { /* ... same ... */
        if (!handle) { this.canvas.style.cursor = 'default'; return; }
        if (handle === 'nw' || handle === 'se') this.canvas.style.cursor = 'nwse-resize';
        else if (handle === 'ne' || handle === 'sw') this.canvas.style.cursor = 'nesw-resize';
        else if (handle === 'n' || handle === 's') this.canvas.style.cursor = 'ns-resize';
        else if (handle === 'w' || handle === 'e') this.canvas.style.cursor = 'ew-resize';
    }

    getHitHandle(x, y) { /* ... same ... */
        const { width, height, x: fx, y: fy } = this.frame;
        const margin = 20;
        if (Math.abs(x - (fx)) < margin && Math.abs(y - (fy)) < margin) return 'nw';
        if (Math.abs(x - (fx + width)) < margin && Math.abs(y - (fy)) < margin) return 'ne';
        if (Math.abs(x - (fx + width)) < margin && Math.abs(y - (fy + height)) < margin) return 'se';
        if (Math.abs(x - (fx)) < margin && Math.abs(y - (fy + height)) < margin) return 'sw';
        if (Math.abs(x - fx) < margin && y > fy && y < fy + height) return 'w';
        if (Math.abs(x - (fx + width)) < margin && y > fy && y < fy + height) return 'e';
        if (Math.abs(y - fy) < margin && x > fx && x < fx + width) return 'n';
        if (Math.abs(y - (fy + height)) < margin && x > fx && x < fx + width) return 's';
        return null;
    }

    resizeCanvas() {
        this.canvas.width = this.config.width;
        this.canvas.height = this.config.height;
        this.updateFramePosition();
        this.draw();
    }

    updateFramePosition() {
        // Enforce fit on internal interactions or config changes if desired? 
        // No, let user resize freely, but initial defaults should fit.
        // Actually, let's just center.
        this.frame.x = (this.canvas.width - this.frame.width) / 2;
        this.frame.y = (this.canvas.height - this.frame.height) / 2;
    }

    setConfig(newConfig) {
        let resettingDevice = false;
        if (newConfig.deviceType && newConfig.deviceType !== this.config.deviceType) {
            this.setDeviceDefaults(newConfig.deviceType);
            this.config.deviceType = newConfig.deviceType;
            resettingDevice = true;

            // Sync orientation
            if (this.frame.width < this.frame.height) this.config.orientation = 'portrait';
            else this.config.orientation = 'landscape';
        }

        if (newConfig.orientation && newConfig.orientation !== this.config.orientation) {
            const reqPortrait = newConfig.orientation === 'portrait';
            if (!resettingDevice) {
                const t = this.frame.width; this.frame.width = this.frame.height; this.frame.height = t;
                // Fit after rotation
                this.fitFrameToCanvas();
            } else {
                const isPortrait = this.frame.width < this.frame.height;
                if (isPortrait !== reqPortrait) {
                    const t = this.frame.width; this.frame.width = this.frame.height; this.frame.height = t;
                    this.fitFrameToCanvas();
                }
            }
        }

        // Check if canvas size changing
        const sizeChanged = (newConfig.width && newConfig.width !== this.config.width) ||
            (newConfig.height && newConfig.height !== this.config.height);

        this.config = { ...this.config, ...newConfig };

        if (sizeChanged) {
            this.resizeCanvas(); // Actually resize the element
            this.setDeviceDefaults(this.config.deviceType);
        }

        this.updateFramePosition();
        this.draw();

        if (this.callbacks.onSizeChange) this.callbacks.onSizeChange(this.frame.width, this.frame.height);
    }

    setFrameSize(w, h) {
        this.frame.width = w; this.frame.height = h;
        this.updateFramePosition(); this.draw();
    }

    setDeviceDefaults(type) {
        let w, h;
        // Reducing defaults slightly to ensure they look good instantly on 1080p canvas
        switch (type) {
            case 'macbook': w = 1000; h = 640; break; // ~16:10 reduced
            case 'browser': w = 1100; h = 750; break;
            case 'ipad': w = 940; h = 700; break; // ~4:3 (Landscape Default)
            case 'iphone': w = 390; h = 844; break; // Standard iPhone 14
            case 'none': default: w = 1000; h = 625; // 16:10 Landscape
        }
        this.frame.width = w; this.frame.height = h;

        // Auto-fit to ensure we don't start overflowing
        this.fitFrameToCanvas();
    }

    fitFrameToCanvas() {
        const padding = 100; // Comfortable breathing room
        const maxWidth = this.canvas.width - padding;
        const maxHeight = this.canvas.height - padding;

        let scale = 1;
        if (this.frame.width > maxWidth) scale = Math.min(scale, maxWidth / this.frame.width);
        if (this.frame.height > maxHeight) scale = Math.min(scale, maxHeight / this.frame.height);

        if (scale < 1) {
            this.frame.width = Math.round(this.frame.width * scale);
            this.frame.height = Math.round(this.frame.height * scale);
        }
        // Force minimums
        if (this.frame.width < 200) this.frame.width = 200;
        if (this.frame.height < 200) this.frame.height = 200;
    }

    resetSize() {
        this.setDeviceDefaults(this.config.deviceType);
        // Orientation handling?
        const isPortrait = this.config.orientation === 'portrait';
        const currentIsPortrait = this.frame.width < this.frame.height;
        if (isPortrait !== currentIsPortrait) {
            const t = this.frame.width; this.frame.width = this.frame.height; this.frame.height = t;
            this.fitFrameToCanvas(); // Re-fit after rotation
        }

        this.updateFramePosition();
        if (this.callbacks.onSizeChange) this.callbacks.onSizeChange(this.frame.width, this.frame.height);
        this.draw();
    }

    // ... Load/Play/Stop methods
    async loadContent(file) {
        const objectUrl = URL.createObjectURL(file);
        if (file.type.startsWith('video')) {
            this.content = document.createElement('video');
            this.content.src = objectUrl;
            this.content.muted = true;
            this.content.loop = true;
            await this.content.play(); this.content.pause(); this.content.currentTime = 0;
            this.contentType = 'video';
        } else {
            const img = new Image();
            img.src = objectUrl;
            await new Promise(r => img.onload = r);
            this.content = img;
            this.contentType = 'image';
        }
        this.currentTime = 0; this.draw();
    }
    timestamp() { return window.performance.now(); }
    play(cb) {
        if (this.isPlaying) return;
        this.previewProgress = null; // Clear preview
        this.isPlaying = true; this.startTime = null; this.lastFrameTime = this.timestamp();
        const loop = (now) => {
            if (!this.isPlaying) return;
            if (!this.startTime) this.startTime = now;
            const elapsed = (now - this.startTime) / 1000;
            this.currentTime = elapsed;

            // Calculate total duration based on stops if in human mode
            let totalDuration = this.config.holdStart + this.config.duration;
            if (this.config.scrollMode === 'human' && this.config.stops.length > 0) {
                totalDuration += this.config.stops.length * this.config.holdStop;
            }
            totalDuration += 2; // Buffer

            if (this.currentTime > totalDuration) { this.stop(); if (cb) cb(); return; }
            this.draw();
            if (this.contentType === 'video') this.content.currentTime = this.currentTime % this.content.duration;
            this.animationId = requestAnimationFrame(loop);
        };
        this.animationId = requestAnimationFrame(loop);
    }
    stop() { this.isPlaying = false; cancelAnimationFrame(this.animationId); this.currentTime = 0; this.previewProgress = null; this.draw(); }

    // --- Drawing ---
    draw() {
        const { bgColor, deviceType, cornerRadius } = this.config;
        const { width: fw, height: fh, x: fx, y: fy } = this.frame;
        const ctx = this.ctx;

        // 1. Background
        if (this.config.bgImage) {
            const img = this.config.bgImage;
            // Cover logic
            const ratio = img.naturalWidth / img.naturalHeight;
            const canvasRatio = this.canvas.width / this.canvas.height;
            let dw = this.canvas.width;
            let dh = this.canvas.height;

            if (ratio > canvasRatio) {
                dw = dh * ratio; // Too wide, fit height, crop width
            } else {
                dh = dw / ratio; // Too tall, fit width, crop height
            }

            const dx = (this.canvas.width - dw) / 2;
            const dy = (this.canvas.height - dh) / 2;

            ctx.drawImage(img, dx, dy, dw, dh);
        } else {
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // 2. Setup Device Parameters
        let bezel = 0; // The black border
        let shell = 0; // The metallic outer casing (Macbook/iPad)
        let r = 0; // Radius of screen content/bezel

        // Scale Factor (Defaults to 1)
        const scale = this.config.scale || 1;

        if (deviceType === 'macbook') {
            shell = 0; // Removed silver edge
            bezel = 14 * scale; // Reduced by ~20% (was 18)
            r = 10 * scale; // Slightly rounded geometric screen
        } else if (deviceType === 'ipad') {
            shell = 0;
            bezel = 24 * scale; // Reduced by 20% (was 30)
            r = 18 * scale; // Soft screen corners
        } else if (deviceType === 'iphone') {
            shell = 0;
            bezel = 20 * scale; // Reduced by ~10% (was 22)
            r = 30 * scale; // Reduced from 42 (Outer becomes 50 instead of 62)
        } else if (deviceType === 'browser') {
            // Browser: No bezel, just header
            bezel = 0; shell = 0; r = 10 * scale;
        } else {
            // None
            bezel = 0; shell = 0; r = cornerRadius * scale;
        }

        // 3. Draw Shadow
        const totalPadding = bezel + shell;
        if (this.content || deviceType !== 'none') {
            ctx.save();

            const { shadowSize, shadowOpacity } = this.config;

            // Base shadow values
            let sBlur = 60;
            let sOffsetY = 30;
            let sBaseOpacity = 0.4;

            if (deviceType === 'browser') {
                sBlur = 40;
                sOffsetY = 20;
                sBaseOpacity = 0.25;
            }

            // Apply Multipliers
            const downsampled = scale > 1.5;

            if (downsampled) {
                // High-Res Export Fix: Downsampled Shadow Pipeline
                // Render shadow on a small temp canvas (1080p scale), then upscale it.
                // This bypasses browser limitations on large blur radii (>200px).
                const downScale = 1.0 / scale;
                const shW = Math.ceil(this.canvas.width * downScale);
                const shH = Math.ceil(this.canvas.height * downScale);

                const shC = document.createElement('canvas'); // Temp Canvas
                shC.width = shW;
                shC.height = shH;
                const shCtx = shC.getContext('2d');

                // Standard Low-Res Shadow Settings
                shCtx.shadowBlur = sBlur * shadowSize;
                shCtx.shadowOffsetY = sOffsetY * shadowSize;
                shCtx.shadowColor = `rgba(0,0,0,${sBaseOpacity * shadowOpacity})`;

                // Transform context to map 4K coords -> Low-Res coords
                shCtx.scale(downScale, downScale);

                // Draw Shadow Caster
                shCtx.fillStyle = '#000'; // Casts shadow

                if (deviceType === 'browser') {
                    // Browser Shape
                    this.roundRect(shCtx, fx, fy, fw, fh, r);
                    shCtx.fillStyle = '#fff'; shCtx.fill();
                } else if (deviceType !== 'none') {
                    // Device Shape
                    this.roundRect(shCtx, fx - totalPadding, fy - totalPadding, fw + totalPadding * 2, fh + totalPadding * 2, r + totalPadding / 2);
                    shCtx.fill();
                } else {
                    // None Shape
                    this.roundRect(shCtx, fx, fy, fw, fh, r);
                    shCtx.fillStyle = '#fff'; shCtx.fill();
                }

                // Composite the perfect low-res shadow onto the high-res canvas (Upscale)
                ctx.drawImage(shC, 0, 0, this.canvas.width, this.canvas.height);

            } else {
                // Standard Direct Rendering (Low-Res / Preview)
                ctx.shadowBlur = sBlur * shadowSize * scale;
                ctx.shadowOffsetY = sOffsetY * shadowSize * scale;
                ctx.shadowColor = `rgba(0,0,0,${sBaseOpacity * shadowOpacity})`;

                ctx.fillStyle = (deviceType === 'none' || deviceType === 'browser') ? 'rgba(0,0,0,0)' : '#000';

                // Draw shapes
                if (deviceType === 'browser') {
                    this.roundRect(ctx, fx, fy, fw, fh, r);
                    ctx.fillStyle = '#fff'; ctx.fill();
                } else if (deviceType !== 'none') {
                    this.roundRect(ctx, fx - totalPadding, fy - totalPadding, fw + totalPadding * 2, fh + totalPadding * 2, r + totalPadding / 2);
                    ctx.fill();
                } else {
                    this.roundRect(ctx, fx, fy, fw, fh, r);
                    ctx.fillStyle = '#fff'; ctx.fill();
                }
            }
            ctx.restore();
        }

        // 4. Draw Device Body
        if (deviceType !== 'none' && deviceType !== 'browser') {
            const bx = fx - bezel;
            const by = fy - bezel;
            const bw = fw + bezel * 2;
            const bh = fh + bezel * 2;

            // Perfect Corner Logic: Outer Radius = Inner Radius + Bezel Thickness
            const br = r + bezel;

            // Inner Bezel (Black) - No Detail Shell
            ctx.fillStyle = '#080808';
            this.roundRect(ctx, bx, by, bw, bh, br);
            ctx.fill();
        }

        // 5. Decorations (Browser Header Only - Notches Removed)
        let contentYOffset = 0;

        if (deviceType === 'browser') {
            const headerH = 40 * scale;
            ctx.fillStyle = '#f3f4f6'; // Light grey
            const headerR = { tl: 10 * scale, tr: 10 * scale, br: 0, bl: 0 };
            this.roundRect(ctx, fx, fy, fw, headerH, headerR);
            ctx.fill();
            // Divider
            ctx.fillStyle = '#e5e7eb';
            ctx.fillRect(fx, fy + headerH - (1 * scale), fw, 1 * scale);
            // Traffic Lights
            const tlY = fy + (20 * scale);
            const tlR = 6 * scale;
            const tlGap = 20 * scale;
            const tlStart = fx + (24 * scale);

            ctx.fillStyle = '#ff5f56'; ctx.beginPath(); ctx.arc(tlStart, tlY, tlR, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffbd2e'; ctx.beginPath(); ctx.arc(tlStart + tlGap, tlY, tlR, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#27c93f'; ctx.beginPath(); ctx.arc(tlStart + tlGap * 2, tlY, tlR, 0, Math.PI * 2); ctx.fill();

            // Address Bar hint
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.roundRect(fx + (90 * scale), fy + (8 * scale), fw - (110 * scale), 24 * scale, 4 * scale);
            ctx.fill();

            contentYOffset = headerH;
        }

        // (Macbook/iPhone Notches Removed Block used to be here)

        // 6. Draw Content
        if (this.content) {
            ctx.save();
            // Clip Area
            ctx.beginPath();
            let clipY = fy + contentYOffset;
            let clipH = fh - contentYOffset;
            let clipR = r;

            if (deviceType === 'browser') clipR = { tl: 0, tr: 0, br: 10, bl: 10 };

            this.roundRect(ctx, fx, clipY, fw, clipH, clipR);
            ctx.clip();

            this.drawContent(ctx, fx, clipY, fw, clipH);
            ctx.restore();

            // Overlay: Notch for MacBook
            // Overlay: Notch for MacBook
            if (deviceType === 'macbook') {
                // Proportional sizing
                const notchW = Math.round(fw * 0.09); // ~9% of screen width (Reduced from 11%)
                const notchH = Math.round(notchW * 0.19); // Aspect ratio for notch ~ 5.2:1

                const notchX = fx + (fw - notchW) / 2;
                const notchY = fy; // Top edge

                // Radii proportional or clamped
                const rVal = Math.max(4, notchH * 0.3);
                const notchR = { tl: 0, tr: 0, bl: rVal, br: rVal };

                ctx.fillStyle = '#080808'; // Match bezel
                this.roundRect(ctx, notchX, notchY, notchW, notchH, notchR);
                ctx.fill();
            }

            // iPad Camera (Top Center Bezel)
            if (deviceType === 'ipad') {
                const camR = 5 * scale; // Increased size (was 3)
                const camY = fy - (bezel / 2);
                const camX = fx + (fw / 2);

                // Lens Housing (Gray shade as requested)
                ctx.fillStyle = '#3a3a3c';
                ctx.beginPath(); ctx.arc(camX, camY, camR, 0, Math.PI * 2); ctx.fill();

                // Inner Glass Reflection (Lighter gray to be noticeable)
                ctx.fillStyle = '#636366';
                ctx.beginPath(); ctx.arc(camX, camY, camR * 0.6, 0, Math.PI * 2); ctx.fill();
            }

        } else {
            // Placeholder
            ctx.fillStyle = '#333';
            ctx.font = '500 24px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText("Drop Content Here", fx + fw / 2, fy + fh / 2);
        }

        // 7. Handles (Removed Visuals, logic remains in setupInteraction)
        // if (!this.isPlaying) {
        //    this.drawHandles(ctx, fx, fy, fw, fh);
        // }
    }

    // ... (drawContent, drawHandles, roundRect, startExport same, just ensure they are included)
    scrollToPreview(progress) {
        this.previewProgress = progress;
        if (!this.previewFrameRequest) {
            this.previewFrameRequest = requestAnimationFrame(() => {
                this.draw();
                this.previewFrameRequest = null;
            });
        }
    }

    drawContent(ctx, x, y, w, h) {
        let scrollY = 0;
        if (this.contentType === 'image') {
            const { duration, holdStart } = this.config;
            const contentRatio = this.content.naturalWidth / this.content.naturalHeight;
            let drawW = w;
            let drawH = drawW / contentRatio;

            if (this.config.resizeMode === 'fill') {
                const frameRatio = w / h;
                if (contentRatio > frameRatio) {
                    drawH = h;
                    drawW = drawH * contentRatio;
                }
            }
            const maxScroll = drawH - h;
            if (maxScroll > 0) {
                let progress = 0;

                if (this.previewProgress !== undefined && this.previewProgress !== null) {
                    progress = this.previewProgress;
                } else {
                    let t = this.currentTime - holdStart;
                    if (t < 0) t = 0;

                    // Support 'human' with stops. 'linear' or 'continuous' ignores stops.
                    if (this.config.scrollMode === 'human' && this.config.stops.length > 0) {
                        progress = this.calculateSegmentedProgress(t);
                    } else {
                        // Linear/Continuous Mode
                        progress = t / duration;
                        if (progress > 1) progress = 1;

                        // Default ease for 'continuous' look
                        // If user strictly wants 'linear' (constant speed), we could change this.
                        // "Linear Smooth (Constant)" text.
                        // Let's use linear if explicitly set to a 'linear' strict mode? 
                        // But usually "Smooth" implies ease.
                        // Let's stick to Ease-In-Out for aesthetic unless requested otherwise.
                        progress = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
                    }
                }

                scrollY = progress * maxScroll;
            }
            let offsetX = 0;
            if (drawW > w) offsetX = (drawW - w) / 2;
            ctx.drawImage(this.content, x - offsetX, y - scrollY, drawW, drawH);
        } else if (this.contentType === 'video') {
            ctx.drawImage(this.content, x, y, w, h);
        }
    }
    drawHandles(ctx, x, y, w, h) {
        ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;

        // Dashed border for active feel?
        ctx.save();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
        ctx.strokeRect(x, y, w, h);
        ctx.restore();

        const size = 10;
        const handles = [
            [x, y], [x + w, y], [x + w, y + h], [x, y + h],
            [x + w / 2, y], [x + w / 2, y + h], [x, y + h / 2], [x + w, y + h / 2]
        ];
        handles.forEach(([hx, hy]) => {
            ctx.beginPath();
            ctx.rect(hx - size / 2, hy - size / 2, size, size);
            ctx.fill();
            ctx.stroke();
        });
    }
    roundRect(ctx, x, y, w, h, r) {
        if (typeof r === 'number') r = { tl: r, tr: r, br: r, bl: r };
        else r = { tl: 0, tr: 0, br: 0, bl: 0, ...r };
        if (Array.isArray(r)) r = { tl: r[0], tr: r[1], br: r[2], bl: r[3] };
        ctx.beginPath();
        ctx.moveTo(x + r.tl, y);
        ctx.lineTo(x + w - r.tr, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
        ctx.lineTo(x + w, y + h - r.br);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
        ctx.lineTo(x + r.bl, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl);
        ctx.lineTo(x, y + r.tl);
        ctx.quadraticCurveTo(x, y, x + r.tl, y);
        ctx.closePath();
    }
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    calculateSegmentedProgress(timeElapsed) {
        // Prepare segments: 0 -> stop1 -> stop2 -> ... -> 1
        // We need to distribute the main 'duration' across the movement segments proportional to distance.
        // And inject 'holdStop' duration at each stop.

        const stops = [0, ...this.config.stops.sort((a, b) => a - b), 1];
        const moves = [];

        let totalDistance = 1;
        // Logic: Total movement time is this.config.duration.
        // We allocate that time to segments based on distance coverage.

        for (let i = 0; i < stops.length - 1; i++) {
            const startStr = stops[i];
            const endStr = stops[i + 1];
            const dist = endStr - startStr;
            const moveTime = dist * this.config.duration;
            moves.push({
                type: 'move',
                start: startStr,
                end: endStr,
                duration: moveTime
            });
            // Add hold after move, unless it's the last one (scrolled to bottom)
            // Actually, usually we don't hold at the very end (100%), we just finish?
            // The prompt says "stop every quarter...".
            // If we have a stop at 100%, we hold there. If 1 is added automatically, we might not want to hold?
            // Let's assume stops added by user are strictly < 1. 
            // If user adds 0.25, 0.5, 0.75.
            // 0 -> 0.25 (Move) -> Hold -> 0.25 -> 0.5 (Move) -> Hold...

            // The 'stops' array includes 1 at the end.
            // If i < stops.length - 2, it means endStr is a user-defined stop (or 0 if user defined 0?).
            // Let's check if endStr is < 1 to decide if we hold.
            if (endStr < 1) {
                moves.push({
                    type: 'hold',
                    val: endStr,
                    duration: this.config.holdStop
                });
            }
        }

        // Now walk through time
        let localTime = timeElapsed;
        for (const segment of moves) {
            if (localTime <= segment.duration) {
                if (segment.type === 'hold') {
                    return segment.val;
                } else {
                    // Move
                    const p = localTime / segment.duration;
                    const eased = this.easeInOutQuad(p);
                    return segment.start + (segment.end - segment.start) * eased;
                }
            }
            localTime -= segment.duration;
        }

        return 1; // Finished
    }

    setScrollRatio(ratio) {
        if (!this.content) return;
        // Use the existing logic in drawContent which checks previewProgress
        this.previewProgress = Math.max(0, Math.min(1, ratio));
        this.draw();
    }

    clearPreview() {
        this.previewProgress = null;
        this.draw();
    }

    startExport(quality, format) {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') return;

        // 1. Determine Resolution
        let targetW = 1920;
        let targetH = 1080;
        // Default 1080p, check for 4K
        if (quality && quality.includes('4K')) {
            targetW = 3840;
            targetH = 2160;
        }

        // 2. Determine Format / MimeType
        let mimeType = 'video/webm;codecs=vp9';
        let ext = 'webm';
        if (format === 'MP4') {
            // Check support
            if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1.42E01E,mp4a.40.2')) {
                mimeType = 'video/mp4;codecs=avc1.42E01E,mp4a.40.2';
                ext = 'mp4';
            } else if (MediaRecorder.isTypeSupported('video/mp4')) {
                mimeType = 'video/mp4';
                ext = 'mp4';
            } else {
                console.warn("MP4 export not supported by this browser. Falling back to WebM.");
            }
        }

        // 3. Save Original State
        const origCanvasW = this.canvas.width;
        const origCanvasH = this.canvas.height;
        const origFrameW = this.frame.width;
        const origFrameH = this.frame.height;
        const origRadius = this.config.cornerRadius;
        const origShadow = this.config.shadowSize;

        // 4. Resize Canvas & Scale Content
        // Calculate scale relative to current canvas
        const scale = targetW / origCanvasW;

        this.canvas.width = targetW;
        this.canvas.height = targetH;

        // Scale Frame
        this.frame.width = Math.round(origFrameW * scale);
        this.frame.height = Math.round(origFrameH * scale);

        // Set Global Scale for draw()
        this.config.scale = scale;

        this.updateFramePosition();
        this.draw();

        const stream = this.canvas.captureStream(60);
        this.recordedChunks = [];

        // Increase bitrate for higher text clarity (especially 4K)
        const options = { mimeType: mimeType, videoBitsPerSecond: targetW > 1920 ? 25000000 : 8000000 };

        try {
            this.mediaRecorder = new MediaRecorder(stream, options);
        } catch (e) {
            console.error("MediaRecorder error:", e);
            // Fallback to basic
            this.mediaRecorder = new MediaRecorder(stream);
        }

        this.mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) this.recordedChunks.push(e.data); };
        this.mediaRecorder.onstop = () => {
            const blob = new Blob(this.recordedChunks, { type: mimeType.split(';')[0] });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.style.display = 'none'; a.href = url;
            a.download = `presenta-export.${ext}`;
            document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url);

            // Restore Original State
            this.config.scale = 1;
            this.canvas.width = origCanvasW;
            this.canvas.height = origCanvasH;
            this.frame.width = origFrameW;
            this.frame.height = origFrameH;

            this.updateFramePosition();
            this.draw();
        };

        this.mediaRecorder.start();
        this.play(() => { this.mediaRecorder.stop(); });
    }
}
