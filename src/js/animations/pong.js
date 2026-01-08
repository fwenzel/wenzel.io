export class PongAnimation {
  constructor() {
    this.ctx = null;
    this.canvas = null;
    this.width = 0;
    this.height = 0;
    this.paddleHeight = 80;
    this.paddleWidth = 10;
    this.paddleInset = 24;
    this.ballRadius = 6;
    this.leftPaddle = { y: 0, vy: 0 };
    this.rightPaddle = { y: 0, vy: 0 };
    this.ball = { x: 0, y: 0, vx: 0, vy: 0 };
    this.fade = 0.18;
    this.leftError = (Math.random() - 0.5) * 16;
    this.rightError = (Math.random() - 0.5) * 16;
  }

  init(ctx, canvas) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.reset();
  }

  onResize(width, height) {
    this.width = width;
    this.height = height;
    this.paddleHeight = Math.max(70, Math.min(140, height * 0.18));
    this.paddleWidth = Math.max(8, Math.min(14, width * 0.015));
    this.ballRadius = Math.max(5, Math.min(9, width * 0.01));
    this.paddleInset = Math.max(18, Math.min(40, width * 0.05));
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, width, height);
    this.reset();
  }

  reset() {
    this.leftError = (Math.random() - 0.5) * 18;
    this.rightError = (Math.random() - 0.5) * 18;
    this.leftPaddle.y = this.height / 2;
    this.rightPaddle.y = this.height / 2;
    this.leftPaddle.vy = 0;
    this.rightPaddle.vy = 0;
    this.ball.x = this.width / 2;
    this.ball.y = this.height / 2;
    const baseSpeed = Math.max(180, Math.min(320, this.width * 0.25));
    const angle = (Math.random() * 0.6 - 0.3) * Math.PI;
    const direction = Math.random() > 0.5 ? 1 : -1;
    this.ball.vx = Math.cos(angle) * baseSpeed * direction;
    this.ball.vy = Math.sin(angle) * baseSpeed;
  }

  update(dt) {
    const step = dt / 1000;
    const leftTarget = this.getPaddleTargetY("left");
    const rightTarget = this.getPaddleTargetY("right");
    this.updatePaddle(this.leftPaddle, leftTarget, step, 0.9);
    this.updatePaddle(this.rightPaddle, rightTarget, step, 0.75);

    this.ball.x += this.ball.vx * step;
    this.ball.y += this.ball.vy * step;

    if (this.ball.y - this.ballRadius <= 0 || this.ball.y + this.ballRadius >= this.height) {
      this.ball.vy *= -1;
      this.ball.y = Math.max(this.ballRadius, Math.min(this.height - this.ballRadius, this.ball.y));
    }

    const leftX = this.paddleInset + this.paddleWidth;
    const rightX = this.width - this.paddleInset - this.paddleWidth;
    if (this.ball.vx < 0 && this.ball.x - this.ballRadius <= leftX) {
      this.handlePaddleHit(this.leftPaddle, leftX);
    } else if (this.ball.vx > 0 && this.ball.x + this.ballRadius >= rightX) {
      this.handlePaddleHit(this.rightPaddle, rightX);
    }

    if (this.ball.x < -this.ballRadius * 4 || this.ball.x > this.width + this.ballRadius * 4) {
      this.reset();
    }
  }

  updatePaddle(paddle, targetY, step, trackingStrength) {
    const reaction = (targetY - paddle.y) * trackingStrength;
    const maxSpeed = Math.max(160, Math.min(320, this.height * 0.6));
    paddle.vy += reaction * step * 6;
    paddle.vy = Math.max(-maxSpeed, Math.min(maxSpeed, paddle.vy));
    paddle.y += paddle.vy * step;
    paddle.vy *= 0.92;
    const half = this.paddleHeight / 2;
    paddle.y = Math.max(half, Math.min(this.height - half, paddle.y));
  }

  getPaddleTargetY(side) {
    const paddleX =
      side === "left"
        ? this.paddleInset + this.paddleWidth
        : this.width - this.paddleInset - this.paddleWidth;
    const movingToward =
      (side === "left" && this.ball.vx < 0) ||
      (side === "right" && this.ball.vx > 0);
    const error = side === "left" ? this.leftError : this.rightError;

    if (!movingToward || Math.abs(this.ball.vx) < 10) {
      return this.ball.y + error;
    }

    const timeToPaddle = (paddleX - this.ball.x) / this.ball.vx;
    const projectedY = this.ball.y + this.ball.vy * timeToPaddle;
    return this.reflectY(projectedY) + error;
  }

  reflectY(value) {
    if (this.height <= 0) return value;
    const period = (this.height - this.ballRadius) * 2;
    if (period <= 0) return value;
    let wrapped = value;
    if (wrapped < 0 || wrapped > this.height) {
      wrapped = ((wrapped % period) + period) % period;
      if (wrapped > this.height) {
        wrapped = period - wrapped;
      }
    }
    return Math.max(this.ballRadius, Math.min(this.height - this.ballRadius, wrapped));
  }

  handlePaddleHit(paddle, paddleX) {
    const half = this.paddleHeight / 2;
    if (this.ball.y < paddle.y - half || this.ball.y > paddle.y + half) {
      return;
    }
    const offset = (this.ball.y - paddle.y) / half;
    const bounce = offset * Math.PI * 0.35;
    const speed = Math.min(420, Math.hypot(this.ball.vx, this.ball.vy) * 1.03);
    const direction = this.ball.vx < 0 ? 1 : -1;
    this.ball.vx = Math.cos(bounce) * speed * direction;
    this.ball.vy = Math.sin(bounce) * speed;
    if (direction > 0) {
      this.ball.x = paddleX + this.ballRadius + 1;
    } else {
      this.ball.x = paddleX - this.ballRadius - 1;
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.fillStyle = `rgba(5, 6, 8, ${this.fade})`;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = "rgba(210, 210, 210, 0.7)";
    const dashHeight = 12;
    const gap = 18;
    for (let y = gap; y < this.height - gap; y += dashHeight + gap) {
      ctx.fillRect(this.width / 2 - 1, y, 2, dashHeight);
    }

    ctx.fillStyle = "rgba(235, 235, 235, 0.85)";
    ctx.fillRect(
      this.paddleInset,
      this.leftPaddle.y - this.paddleHeight / 2,
      this.paddleWidth,
      this.paddleHeight
    );
    ctx.fillRect(
      this.width - this.paddleInset - this.paddleWidth,
      this.rightPaddle.y - this.paddleHeight / 2,
      this.paddleWidth,
      this.paddleHeight
    );

    ctx.beginPath();
    ctx.arc(this.ball.x, this.ball.y, this.ballRadius, 0, Math.PI * 2);
    ctx.fill();
  }
}
