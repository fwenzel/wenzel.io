export class MystifyAnimation {
  constructor() {
    this.ctx = null;
    this.canvas = null;
    this.width = 0;
    this.height = 0;
    this.groups = [];
    this.fade = 0.1;
    this.time = 0;
  }

  init(ctx, canvas) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.reset();
  }

  reset() {
    this.groups = [];
    const groupCount = 3;
    const pointsPerGroup = 5;
    for (let i = 0; i < groupCount; i += 1) {
      const hue = Math.floor(Math.random() * 360);
      const points = [];
      const velocities = [];
      for (let p = 0; p < pointsPerGroup; p += 1) {
        points.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
        });
        const speed = 40 + Math.random() * 80;
        const angle = Math.random() * Math.PI * 2;
        velocities.push({
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
        });
      }
      this.groups.push({ hue, points, velocities });
    }
  }

  onResize(width, height) {
    this.width = width;
    this.height = height;
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, width, height);
    this.reset();
  }

  update(dt) {
    this.time += dt / 1000;
    const step = dt / 1000;
    for (const group of this.groups) {
      group.points.forEach((pt, i) => {
        const vel = group.velocities[i];
        pt.x += vel.x * step;
        pt.y += vel.y * step;
        if (pt.x <= 0 || pt.x >= this.width) vel.x *= -1;
        if (pt.y <= 0 || pt.y >= this.height) vel.y *= -1;
        pt.x = Math.max(0, Math.min(this.width, pt.x));
        pt.y = Math.max(0, Math.min(this.height, pt.y));
      });
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.fillStyle = `rgba(0, 0, 0, ${this.fade})`;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.lineWidth = 2;
    ctx.globalCompositeOperation = "lighter";

    for (const group of this.groups) {
      ctx.strokeStyle = `hsla(${group.hue}, 90%, 65%, 0.85)`;
      ctx.beginPath();
      group.points.forEach((pt, idx) => {
        if (idx === 0) {
          ctx.moveTo(pt.x, pt.y);
        } else {
          ctx.lineTo(pt.x, pt.y);
        }
      });
      ctx.closePath();
      ctx.stroke();
    }

    ctx.globalCompositeOperation = "source-over";
  }
}
