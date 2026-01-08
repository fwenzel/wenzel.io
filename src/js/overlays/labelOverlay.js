export class LabelOverlay {
  constructor() {
    this.ctx = null;
    this.canvas = null;
    this.width = 0;
    this.height = 0;
    this.label = null;
    this.labelMetrics = null;
    this.glitchTimer = 0;
    this.nextGlitchIn = 3 + Math.random() * 6;
  }

  init(ctx, canvas) {
    this.ctx = ctx;
    this.canvas = canvas;
    if (this.width && this.height) {
      this.labelMetrics = this.computeLabelMetrics();
      this.label = this.buildLabel();
    }
  }

  onResize(width, height) {
    this.width = width;
    this.height = height;
    this.labelMetrics = this.computeLabelMetrics();
    this.label = this.buildLabel();
  }

  update(dt) {
    this.updateLabel(dt / 1000);
    this.updateGlitch(dt / 1000);
  }

  render() {
    this.renderLabels();
  }

  buildLabel() {
    if (!this.labelMetrics) {
      this.labelMetrics = this.computeLabelMetrics();
    }
    const { width: textWidth, height: textHeight, margin } = this.labelMetrics;
    const minX = margin + textWidth / 2;
    const maxX = Math.max(minX, this.width - margin - textWidth / 2);
    const minY = margin + textHeight / 2;
    const maxY = Math.max(minY, this.height - margin - textHeight / 2);
    return {
      x: minX + Math.random() * (maxX - minX),
      y: minY + Math.random() * (maxY - minY),
      alpha: 0,
      direction: 1,
      speed: 0.08 + Math.random() * 0.05,
    };
  }

  updateLabel(step) {
    if (!this.label) return;
    this.label.alpha += this.label.direction * this.label.speed * step;
    if (this.label.alpha >= 0.5) {
      this.label.alpha = 0.5;
      this.label.direction = -1;
    }
    if (this.label.alpha <= 0) {
      this.label = this.buildLabel();
    }
  }

  renderLabels() {
    const ctx = this.ctx;
    if (!this.label) return;
    if (!this.labelMetrics || !this.labelMetrics.sprite) return;
    const { sprite, scale } = this.labelMetrics;
    if (!sprite.complete) return;
    const drawWidth = sprite.width * scale;
    const drawHeight = sprite.height * scale;
    ctx.save();
    ctx.globalAlpha = this.label.alpha;
    ctx.imageSmoothingEnabled = false;
    const baseX = this.label.x - drawWidth / 2;
    const baseY = this.label.y - drawHeight / 2;
    this.renderStatic(ctx, baseX, baseY, drawWidth, drawHeight);
    const jitter = this.glitchTimer > 0 ? (Math.random() - 0.5) * 12 : 0;
    ctx.drawImage(sprite, baseX + jitter, baseY, drawWidth, drawHeight);
    if (this.glitchTimer > 0) {
      const sliceCount = 3 + Math.floor(Math.random() * 4);
      for (let i = 0; i < sliceCount; i += 1) {
        const sliceHeight = Math.max(2, Math.floor(drawHeight * 0.1));
        const sy = Math.floor(Math.random() * (drawHeight - sliceHeight));
        const dy = baseY + sy + (Math.random() - 0.5) * 10;
        const dx = baseX + (Math.random() - 0.5) * 18;
        ctx.drawImage(
          sprite,
          0,
          sy / scale,
          sprite.width,
          sliceHeight / scale,
          dx,
          dy,
          drawWidth,
          sliceHeight
        );
      }
    }
    ctx.restore();
  }

  computeLabelMetrics() {
    const targetSize = Math.max(18, Math.min(this.width, this.height) * 0.06);
    const text = "wenzel.io";
    const font = this.getPixelFont();
    const baseWidth = text.length * font.width + (text.length - 1) * font.spacing;
    const baseHeight = font.height;
    const sprite = this.buildLabelSprite(text, font, baseWidth, baseHeight);
    const scale = targetSize / baseHeight;
    const margin = Math.max(24, targetSize * 0.75);
    return {
      width: baseWidth * scale,
      height: baseHeight * scale,
      margin,
      scale,
      sprite,
    };
  }

  getPixelFont() {
    return {
      width: 5,
      height: 7,
      spacing: 1,
      glyphs: {
        w: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
        e: ["01110", "10001", "11111", "10000", "10000", "10001", "01110"],
        n: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
        z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
        l: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
        i: ["00100", "00000", "01100", "00100", "00100", "00100", "01110"],
        o: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
        ".": ["00000", "00000", "00000", "00000", "00000", "00100", "00100"],
      },
    };
  }

  buildLabelSprite(text, font, width, height) {
    const rects = [];
    let cursorX = 0;
    for (const char of text) {
      const glyph = font.glyphs[char] || font.glyphs["."];
      glyph.forEach((row, y) => {
        for (let x = 0; x < row.length; x += 1) {
          if (row[x] === "1") {
            rects.push(`<rect x="${cursorX + x}" y="${y}" width="1" height="1" />`);
          }
        }
      });
      cursorX += font.width + font.spacing;
    }
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <g fill="#aaaaaa">${rects.join("")}</g>
      </svg>
    `.trim();
    const sprite = new Image();
    sprite.src = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    return sprite;
  }

  renderStatic(ctx, baseX, baseY, drawWidth, drawHeight) {
    const chance = this.glitchTimer > 0 ? 0.5 : 0.08;
    if (Math.random() > chance) return;
    const speckles = this.glitchTimer > 0 ? 40 : 14;
    ctx.save();
    ctx.globalAlpha *= this.glitchTimer > 0 ? 0.6 : 0.35;
    ctx.fillStyle = "#b8b8b8";
    for (let i = 0; i < speckles; i += 1) {
      const x = baseX + Math.random() * drawWidth;
      const y = baseY + Math.random() * drawHeight;
      const size = Math.random() > 0.7 ? 2 : 1;
      ctx.fillRect(x, y, size, size);
    }
    ctx.restore();
  }

  updateGlitch(step) {
    this.nextGlitchIn -= step;
    if (this.nextGlitchIn <= 0) {
      this.glitchTimer = 0.35 + Math.random() * 0.5;
      this.nextGlitchIn = 1.8 + Math.random() * 4;
    }
    if (this.glitchTimer > 0) {
      this.glitchTimer = Math.max(0, this.glitchTimer - step);
    }
  }
}
