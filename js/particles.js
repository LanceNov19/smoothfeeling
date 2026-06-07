class ParticleEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas || !this.canvas.getContext) {
      this.disabled = true;
      console.warn('Canvas not supported, particles disabled');
      return;
    }
    this.disabled = false;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.incomingParticles = [];
    this.transitionProgress = 0;
    this.isTransitioning = false;
    this.currentConfig = null;
    this.densityMultiplier = 1.0;
    this.animationId = null;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.maxParticles = Math.min(
      Math.floor((this.canvas.width * this.canvas.height) / 10000) * this.densityMultiplier,
      200
    );
    if (window.innerWidth < 640) {
      this.maxParticles = Math.min(this.maxParticles, Math.floor(this.maxParticles * 0.5));
    }
  }

  setConfig(config, densityPercent) {
    this.currentConfig = config;
    this.densityMultiplier = (densityPercent || 40) / 100;
    this.resize();

    if (this.isTransitioning) {
      this.incomingParticles = [];
      this.transitionProgress = 0;
    } else {
      this.isTransitioning = true;
      this.transitionProgress = 0;
      this.incomingParticles = [];
    }

    if (!this.animationId) {
      this.animate();
    }
  }

  animate() {
    if (this.disabled) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.isTransitioning) {
      this.transitionProgress += 0.016;
      if (this.transitionProgress >= 1) {
        this.transitionProgress = 1;
        this.isTransitioning = false;
        this.particles = this.incomingParticles;
        this.incomingParticles = [];
      }
    }

    if (this.isTransitioning) {
      const keepCount = Math.floor(this.particles.length * (1 - this.transitionProgress));
      if (this.particles.length > keepCount) {
        this.particles.length = keepCount;
      }
    }

    const targetCount = this.isTransitioning
      ? Math.floor(this.maxParticles * this.transitionProgress)
      : this.maxParticles;
    const pool = this.isTransitioning ? this.incomingParticles : this.particles;
    while (pool.length < targetCount) {
      pool.push(this.createParticle());
    }

    for (const p of this.particles) {
      this.updateParticle(p);
      this.drawParticle(p, this.isTransitioning ? (1 - this.transitionProgress) : 1);
    }

    if (this.isTransitioning) {
      for (const p of this.incomingParticles) {
        this.updateParticle(p);
        this.drawParticle(p, this.transitionProgress);
      }
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  createParticle() {
    const cfg = this.currentConfig;
    return {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      size: cfg.size.min + Math.random() * (cfg.size.max - cfg.size.min),
      speed: cfg.speed.min + Math.random() * (cfg.speed.max - cfg.speed.min),
      color: cfg.particleColors[Math.floor(Math.random() * cfg.particleColors.length)],
      opacity: cfg.opacity.min + Math.random() * (cfg.opacity.max - cfg.opacity.min),
      dirX: (Math.random() - 0.5) * 2,
      dirY: (Math.random() - 0.5) * 2
    };
  }

  updateParticle(p) {
    const cfg = this.currentConfig;

    switch (cfg.direction) {
      case 'up':
        p.y -= p.speed;
        p.x += (p.dirX * p.speed * 0.3);
        break;
      case 'down':
        p.y += p.speed;
        p.x += (p.dirX * p.speed * 0.3);
        break;
      case 'random':
      default:
        p.x += p.dirX * p.speed;
        p.y += p.dirY * p.speed;
        break;
    }

    const margin = 50;
    if (p.x < -margin) p.x = this.canvas.width + margin;
    if (p.x > this.canvas.width + margin) p.x = -margin;
    if (p.y < -margin) p.y = this.canvas.height + margin;
    if (p.y > this.canvas.height + margin) p.y = -margin;
  }

  drawParticle(p, alphaMultiplier) {
    const ctx = this.ctx;
    const alpha = p.opacity * alphaMultiplier;
    ctx.globalAlpha = alpha;

    switch (this.currentConfig.shape) {
      case 'line':
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x, p.y + p.size * 3);
        ctx.stroke();
        break;
      case 'circle':
      default:
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        break;
    }

    ctx.globalAlpha = 1;
  }

  setDensity(percent) {
    this.densityMultiplier = percent / 100;
    this.resize();
  }
}
