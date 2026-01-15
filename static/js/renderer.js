class CanvasRenderer {
    constructor(canvas, callbacks) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.callbacks = callbacks || {};

        // Default Config
        this.config = {
            width: 1920,
            height: 1080, // Default 16:9
            bgColor: '#121212',
            deviceType: 'browser',
            orientation: 'landscape',
            resizeMode: 'fit',
            duration: 5,
            holdStart: 1,
            cornerRadius: 0,
            fps: 60
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
            case 'ipad': w = 700; h = 940; break; // ~3:4
            case 'iphone': w = 390; h = 844; break; // Standard iPhone 14
            case 'none': default: w = 800; h = 800; // Smaller starter liquid
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
        this.isPlaying = true; this.startTime = null; this.lastFrameTime = this.timestamp();
        const loop = (now) => {
            if (!this.isPlaying) return;
            if (!this.startTime) this.startTime = now;
            const elapsed = (now - this.startTime) / 1000;
            this.currentTime = elapsed;
            const totalDuration = this.config.holdStart + this.config.duration + 2;
            if (this.currentTime > totalDuration) { this.stop(); if (cb) cb(); return; }
            this.draw();
            if (this.contentType === 'video') this.content.currentTime = this.currentTime % this.content.duration;
            this.animationId = requestAnimationFrame(loop);
        };
        this.animationId = requestAnimationFrame(loop);
    }
    stop() { this.isPlaying = false; cancelAnimationFrame(this.animationId); this.currentTime = 0; this.draw(); }

    // --- Drawing ---
    draw() {
        const { bgColor, deviceType, cornerRadius } = this.config;
        const { width: fw, height: fh, x: fx, y: fy } = this.frame;
        const ctx = this.ctx;

        // 1. Background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 2. Setup Device Parameters
        let bezel = 0; // The black border
        let shell = 0; // The metallic outer casing (Macbook/iPad)
        let r = 0; // Radius of screen content/bezel

        if (deviceType === 'macbook') {
            shell = 0; // Removed silver edge
            bezel = 24;
            r = 10; // Slightly rounded geometric screen
        } else if (deviceType === 'ipad') {
            shell = 0;
            bezel = 30; // Slightly thinner bezel than before for better proportion
            r = 18; // Soft screen corners
        } else if (deviceType === 'iphone') {
            shell = 0;
            bezel = 20; // Reduced by ~10% (was 22)
            r = 30; // Reduced from 42 (Outer becomes 50 instead of 62)
        } else if (deviceType === 'browser') {
            // Browser: No bezel, just header
            bezel = 0; shell = 0; r = 10;
        } else {
            // None
            bezel = 0; shell = 0; r = cornerRadius;
        }

        // 3. Draw Shadow
        const totalPadding = bezel + shell;
        if (this.content || deviceType !== 'none') {
            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,0.4)';
            ctx.shadowBlur = 60;
            ctx.shadowOffsetY = 30;
            // Draw the 'shadow caster' shape (Outer Shell)
            ctx.fillStyle = (deviceType === 'none' || deviceType === 'browser') ? 'rgba(0,0,0,0)' : '#000';

            // For browser, shadow is cast by content rect (or window rect)
            if (deviceType === 'browser') {
                ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 20;
                this.roundRect(ctx, fx, fy, fw, fh, r);
                // Note: we don't fill here because browser header/content fill later.
                // But to cast shadow we need to fill.
                ctx.fillStyle = '#fff';
                ctx.fill();
            } else if (deviceType !== 'none') {
                this.roundRect(ctx, fx - totalPadding, fy - totalPadding, fw + totalPadding * 2, fh + totalPadding * 2, r + totalPadding / 2);
                ctx.fill();
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
            const headerH = 40;
            ctx.fillStyle = '#f3f4f6'; // Light grey
            const headerR = { tl: 10, tr: 10, br: 0, bl: 0 };
            this.roundRect(ctx, fx, fy, fw, headerH, headerR);
            ctx.fill();
            // Divider
            ctx.fillStyle = '#e5e7eb';
            ctx.fillRect(fx, fy + headerH - 1, fw, 1);
            // Traffic Lights
            ctx.fillStyle = '#ff5f56'; ctx.beginPath(); ctx.arc(fx + 24, fy + 20, 6, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffbd2e'; ctx.beginPath(); ctx.arc(fx + 44, fy + 20, 6, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#27c93f'; ctx.beginPath(); ctx.arc(fx + 64, fy + 20, 6, 0, Math.PI * 2); ctx.fill();

            // Address Bar hint
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.roundRect(fx + 90, fy + 8, fw - 110, 24, 4);
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

            // (Overlaid Notches Removed)

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
                let t = this.currentTime - holdStart;
                if (t < 0) t = 0;
                let progress = t / duration;
                if (progress > 1) progress = 1;
                progress = progress * progress * (3 - 2 * progress);
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
    startExport() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') return;
        const stream = this.canvas.captureStream(60);
        this.recordedChunks = [];
        this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
        this.mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) this.recordedChunks.push(e.data); };
        this.mediaRecorder.onstop = () => {
            const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.style.display = 'none'; a.href = url; a.download = 'show-off-export.webm';
            document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url);
        };
        this.mediaRecorder.start();
        this.play(() => { this.mediaRecorder.stop(); });
    }
}
