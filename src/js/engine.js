export class AnimationEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.animations = new Map();
    this.active = null;
    this.activeName = null;
    this.overlay = null;
    this.lastTime = 0;
    this.resizeObserver = null;
    this.transition = null;
    this.viewportWidth = 0;
    this.viewportHeight = 0;
  }

  register(name, animation) {
    this.animations.set(name, animation);
  }

  start(name) {
    const next = this.animations.get(name);
    if (!next) {
      throw new Error(`Unknown animation: ${name}`);
    }
    this.active = next;
    this.activeName = name;
    this.active.init(this.ctx, this.canvas);
    if (this.overlay) {
      this.overlay.init(this.ctx, this.canvas);
    }
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.tick(t));
  }

  tick(time) {
    if (!this.active) return;
    const dt = Math.min(64, time - this.lastTime);
    this.lastTime = time;
    this.active.update(dt);
    if (this.overlay) {
      this.overlay.update(dt);
    }
    this.active.render();
    if (this.overlay) {
      this.overlay.render();
    }
    if (this.transition) {
      this.renderTransition(dt);
    }
    requestAnimationFrame((t) => this.tick(t));
  }

  bindResize() {
    const resize = () => {
      const { width, height } = this.canvas.getBoundingClientRect();
      const scale = window.devicePixelRatio || 1;
      this.canvas.width = Math.max(1, Math.floor(width * scale));
      this.canvas.height = Math.max(1, Math.floor(height * scale));
      this.ctx.setTransform(scale, 0, 0, scale, 0, 0);
      this.viewportWidth = width;
      this.viewportHeight = height;
      if (this.active) this.active.onResize(width, height);
      if (this.overlay) this.overlay.onResize(width, height);
    };

    if ("ResizeObserver" in window) {
      this.resizeObserver = new ResizeObserver(resize);
      this.resizeObserver.observe(this.canvas);
    } else {
      window.addEventListener("resize", resize);
    }
    resize();
  }

  setOverlay(overlay) {
    this.overlay = overlay;
  }

  switchTo(name) {
    if (!name || name === this.activeName) return;
    const next = this.animations.get(name);
    if (!next) {
      throw new Error(`Unknown animation: ${name}`);
    }
    this.transition = {
      phase: "out",
      elapsed: 0,
      duration: 800,
      nextName: name,
    };
  }

  renderTransition(dt) {
    if (!this.transition) return;
    const ctx = this.ctx;
    const transition = this.transition;
    transition.elapsed += dt;
    const progress = Math.min(1, transition.elapsed / transition.duration);
    if (transition.phase === "out" && progress >= 1) {
      const next = this.animations.get(transition.nextName);
      this.active = next;
      this.activeName = transition.nextName;
      this.active.init(this.ctx, this.canvas);
      if (this.viewportWidth && this.viewportHeight) {
        this.active.onResize(this.viewportWidth, this.viewportHeight);
      }
      transition.phase = "in";
      transition.elapsed = 0;
    }
    const alpha =
      transition.phase === "out"
        ? progress
        : 1 - Math.min(1, transition.elapsed / transition.duration);
    ctx.save();
    ctx.fillStyle = `rgba(5, 6, 8, ${alpha})`;
    ctx.fillRect(0, 0, this.viewportWidth, this.viewportHeight);
    ctx.restore();
    if (transition.phase === "in" && transition.elapsed >= transition.duration) {
      this.transition = null;
    }
  }
}
