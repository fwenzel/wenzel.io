export class PretzelAnimation {
  constructor() {
    this.ctx = null;
    this.canvas = null;
    this.width = 0;
    this.height = 0;
    this.pretzels = [];
    this.sprites = [];
    this.fade = 0.2;
  }

  init(ctx, canvas) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.sprites = this.buildPretzelSprites();
    this.reset();
  }

  onResize(width, height) {
    this.width = width;
    this.height = height;
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, width, height);
    this.reset();
  }

  reset() {
    const density = Math.max(8, Math.min(24, (this.width * this.height) / 40000));
    const count = Math.round(density);
    this.pretzels = Array.from({ length: count }, () => this.spawnPretzel());
  }

  spawnPretzel() {
    const sprite = this.sprites[Math.floor(Math.random() * this.sprites.length)];
    const size = 36 + Math.random() * 110;
    const speed = 30 + Math.random() * 90;
    const edge = Math.floor(Math.random() * 4);
    let x = 0;
    let y = 0;
    let angle = 0;
    if (edge === 0) {
      x = -size;
      y = Math.random() * this.height;
      angle = (-0.35 + Math.random() * 0.7) * Math.PI;
    } else if (edge === 1) {
      x = this.width + size;
      y = Math.random() * this.height;
      angle = (0.65 + Math.random() * 0.7) * Math.PI;
    } else if (edge === 2) {
      x = Math.random() * this.width;
      y = -size;
      angle = (0.15 + Math.random() * 0.7) * Math.PI;
    } else {
      x = Math.random() * this.width;
      y = this.height + size;
      angle = (-0.85 + Math.random() * 0.7) * Math.PI;
    }
    return {
      sprite,
      x,
      y,
      size,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (-0.7 + Math.random() * 1.4) * Math.PI,
      alpha: 0.5 + Math.random() * 0.4,
    };
  }

  update(dt) {
    const step = dt / 1000;
    const margin = 180;
    for (let i = 0; i < this.pretzels.length; i += 1) {
      const pretzel = this.pretzels[i];
      pretzel.x += pretzel.vx * step;
      pretzel.y += pretzel.vy * step;
      pretzel.rotation += pretzel.rotationSpeed * step;
      if (
        pretzel.x < -margin ||
        pretzel.x > this.width + margin ||
        pretzel.y < -margin ||
        pretzel.y > this.height + margin
      ) {
        this.pretzels[i] = this.spawnPretzel();
      }
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.fillStyle = `rgba(5, 6, 8, ${this.fade})`;
    ctx.fillRect(0, 0, this.width, this.height);
    for (const pretzel of this.pretzels) {
      const sprite = pretzel.sprite;
      if (!sprite || !sprite.complete) continue;
      const scale = pretzel.size / sprite.width;
      const drawWidth = sprite.width * scale;
      const drawHeight = sprite.height * scale;
      ctx.save();
      ctx.translate(pretzel.x, pretzel.y);
      ctx.rotate(pretzel.rotation);
      ctx.globalAlpha = pretzel.alpha;
      ctx.drawImage(sprite, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.restore();
    }
  }

  buildPretzelSprites() {
    const sprite = new Image();
    sprite.src = "img/pretzel.svg";
    return [sprite];
  }
}
