export class DvdAnimation {
  constructor() {
    this.ctx = null;
    this.canvas = null;
    this.width = 0;
    this.height = 0;
    this.fade = 0.18;
    this.palette = [
      { h: 200, s: 90, l: 60 },
      { h: 120, s: 75, l: 55 },
      { h: 46, s: 95, l: 58 },
      { h: 330, s: 80, l: 62 },
      { h: 12, s: 90, l: 56 },
    ];
    this.colorIndex = 0;
    this.position = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
    this.drawWidth = 0;
    this.drawHeight = 0;
    this.halfWidth = 0;
    this.halfHeight = 0;
    this.logo = null;
    this.logoAspect = 2.28;
    this.svgText = null;
    this.pendingLoad = null;
  }

  init(ctx, canvas) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.loadSvg();
    const rect = canvas.getBoundingClientRect();
    if (rect.width && rect.height) {
      this.onResize(rect.width, rect.height);
    } else {
      this.reset();
    }
  }

  onResize(width, height) {
    this.width = width;
    this.height = height;
    this.updateDrawSize();
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, width, height);
    this.reset();
  }

  reset() {
    if (!this.width || !this.height) return;
    this.colorIndex = Math.floor(Math.random() * this.palette.length);
    this.refreshLogo();
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.max(90, Math.min(220, Math.min(this.width, this.height) * 0.35));
    this.velocity.x = Math.cos(angle) * speed;
    this.velocity.y = Math.sin(angle) * speed;
    this.resetPosition();
  }

  resetPosition() {
    if (!this.width || !this.height) return;
    this.position.x = this.halfWidth + Math.random() * Math.max(1, this.width - this.halfWidth * 2);
    this.position.y =
      this.halfHeight + Math.random() * Math.max(1, this.height - this.halfHeight * 2);
  }

  loadSvg() {
    if (this.pendingLoad || this.svgText) return;
    this.pendingLoad = fetch("img/dvd.svg")
      .then((res) => res.text())
      .then((text) => {
        this.svgText = text;
        this.refreshLogo();
      })
      .catch(() => {
        this.svgText = null;
      });
  }

  updateDrawSize() {
    const maxHeight = Math.max(36, Math.min(this.height * 0.16, 120));
    let targetHeight = maxHeight;
    let targetWidth = targetHeight * this.logoAspect;
    const maxWidth = this.width * 0.8;
    if (targetWidth > maxWidth) {
      targetWidth = maxWidth;
      targetHeight = targetWidth / this.logoAspect;
    }
    this.drawWidth = targetWidth;
    this.drawHeight = targetHeight;
    this.halfWidth = targetWidth / 2;
    this.halfHeight = targetHeight / 2;
  }

  refreshLogo() {
    if (!this.svgText) return;
    const color = this.palette[this.colorIndex];
    const main = this.formatHsl(color.h, color.s, color.l);
    const coloredSvg = this.injectFill(this.svgText, main);
    const image = new Image();
    image.onload = () => {
      if (image.width && image.height) {
        this.logoAspect = image.width / image.height;
        this.updateDrawSize();
      }
      this.logo = image;
    };
    image.src = `data:image/svg+xml;utf8,${encodeURIComponent(coloredSvg)}`;
  }

  injectFill(svgText, fill) {
    const match = svgText.match(/<svg\b[^>]*>/);
    if (!match) return svgText;
    const tag = match[0];
    let nextTag;
    if (/\sfill=/.test(tag)) {
      nextTag = tag.replace(/\sfill="[^"]*"/, ` fill="${fill}"`);
    } else {
      nextTag = tag.replace("<svg", `<svg fill="${fill}"`);
    }
    return svgText.replace(tag, nextTag);
  }

  update(dt) {
    const step = dt / 1000;
    this.position.x += this.velocity.x * step;
    this.position.y += this.velocity.y * step;
    let bounced = false;

    if (this.position.x - this.halfWidth <= 0) {
      this.position.x = this.halfWidth;
      this.velocity.x = Math.abs(this.velocity.x);
      bounced = true;
    } else if (this.position.x + this.halfWidth >= this.width) {
      this.position.x = this.width - this.halfWidth;
      this.velocity.x = -Math.abs(this.velocity.x);
      bounced = true;
    }

    if (this.position.y - this.halfHeight <= 0) {
      this.position.y = this.halfHeight;
      this.velocity.y = Math.abs(this.velocity.y);
      bounced = true;
    } else if (this.position.y + this.halfHeight >= this.height) {
      this.position.y = this.height - this.halfHeight;
      this.velocity.y = -Math.abs(this.velocity.y);
      bounced = true;
    }

    if (bounced) {
      this.advanceColor();
    }
  }

  advanceColor() {
    this.colorIndex = (this.colorIndex + 1) % this.palette.length;
    this.refreshLogo();
  }

  render() {
    const ctx = this.ctx;
    ctx.fillStyle = `rgba(5, 6, 8, ${this.fade})`;
    ctx.fillRect(0, 0, this.width, this.height);
    if (!this.logo || !this.logo.complete) return;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      this.logo,
      this.position.x - this.halfWidth,
      this.position.y - this.halfHeight,
      this.drawWidth,
      this.drawHeight
    );
    ctx.restore();
  }

  formatHsl(h, s, l) {
    return `hsl(${h}, ${s}%, ${l}%)`;
  }
}
