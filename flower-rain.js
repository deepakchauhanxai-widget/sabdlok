/**
 * ============================================================
 * flower-engine.js — शब्दलोक Flower Animation Engine
 * ------------------------------------------------------------
 * Premium cinematic flower animation for poetry websites.
 * All flowers appear BEHIND your content by default (z-index: 0)
 * ============================================================
 */

(function () {
  'use strict';

  // ---- Constants ----
  const FLOWER_TYPES = ['🌸', '🌺', '🌼', '💮', '🌷', '🍃'];
  const PARTICLE_COLORS = ['white', 'gold', 'pink'];

  // ---- Configuration ----
  const CONFIG = {
    flowerCountDesktop: 45,
    flowerCountMobile: 22,
    particleCountIntro: 18,
    particleCountRegular: 4,
    introDuration: 2000,
    windMinInterval: 8000,
    windMaxInterval: 20000,
    mouseRadius: 180,
    mouseForce: 0.035,
  };

  // ---- Feature detection ----
  const isMobile = window.innerWidth < 768;
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = !isMobile;

  // ---- DOM references ----
  let layer = null;
  let flowers = [];
  let particles = [];
  let flowerPool = [];
  let particlePool = [];

  // ---- State ----
  let animationId = null;
  let isPaused = false;
  let isIntro = true;
  let introStartTime = 0;
  let windStrength = 0;
  let windTarget = 0;
  let windTimer = 0;
  let nextWindChange = 0;
  let mouseX = -9999;
  let mouseY = -9999;
  let mouseInside = false;
  let frameCount = 0;

  // ---- Wind Engine ----
  class WindEngine {
    constructor() {
      this.strength = 0;
      this.target = 0;
      this.smooth = 0.012;
      this.elapsed = 0;
      this.interval = this.randomInterval();
    }

    randomInterval() {
      return CONFIG.windMinInterval + Math.random() * (CONFIG.windMaxInterval - CONFIG.windMinInterval);
    }

    update(delta) {
      this.elapsed += delta;
      this.strength += (this.target - this.strength) * this.smooth;

      if (this.elapsed >= this.interval) {
        this.elapsed = 0;
        this.interval = this.randomInterval();
        const mode = Math.random();
        let magnitude;
        if (mode < 0.35) {
          magnitude = 0.08 + Math.random() * 0.22;
        } else if (mode < 0.70) {
          magnitude = 0.30 + Math.random() * 0.40;
        } else {
          magnitude = 0.70 + Math.random() * 0.70;
        }
        const dir = Math.random() > 0.5 ? 1 : -1;
        this.target = dir * magnitude;
      }
    }

    getStrength() {
      return this.strength;
    }
  }

  // ---- Flower ----
  class Flower {
    constructor() {
      this.el = document.createElement('span');
      this.el.className = 'sl-flower';
      this.el.textContent = FLOWER_TYPES[Math.floor(Math.random() * FLOWER_TYPES.length)];

      this.x = 0;
      this.y = 0;
      this.rotation = 0;
      this.rotationSpeed = 0;
      this.size = 1.8;
      this.opacity = 0.85;
      this.speed = 0.6;
      this.drift = 0;
      this.swingAmp = 30;
      this.swingFreq = 0.01;
      this.swingPhase = 0;
      this.depth = 'medium';
      this.isActive = false;
      this.flipDirection = 1;
      this.flipTimer = 0;
      this.delay = 0;
      this.delayTimer = 0;
    }

    init(x, y, depth) {
      this.x = x;
      this.y = y;
      this.depth = depth || this.randomDepth();

      if (this.depth === 'close') {
        this.size = 2.6 + Math.random() * 1.2;
        this.speed = 0.20 + Math.random() * 0.25;
        this.opacity = 0.80 + Math.random() * 0.15;
        this.el.classList.add('sl-flower--close');
        this.el.classList.remove('sl-flower--far');
      } else if (this.depth === 'far') {
        this.size = 1.0 + Math.random() * 0.8;
        this.speed = 0.70 + Math.random() * 0.50;
        this.opacity = 0.55 + Math.random() * 0.25;
        this.el.classList.add('sl-flower--far');
        this.el.classList.remove('sl-flower--close');
      } else {
        this.size = 1.6 + Math.random() * 1.2;
        this.speed = 0.40 + Math.random() * 0.40;
        this.opacity = 0.70 + Math.random() * 0.20;
        this.el.classList.remove('sl-flower--close', 'sl-flower--far');
      }

      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 3.2;
      if (Math.random() > 0.7) {
        this.flipDirection = Math.random() > 0.5 ? 1 : -1;
        this.flipTimer = 100 + Math.random() * 300;
      } else {
        this.flipDirection = 0;
        this.flipTimer = 0;
      }

      this.swingAmp = 20 + Math.random() * 60;
      this.swingFreq = 0.005 + Math.random() * 0.018;
      this.swingPhase = Math.random() * Math.PI * 2;
      this.drift = (Math.random() - 0.5) * 0.4;

      this.el.textContent = FLOWER_TYPES[Math.floor(Math.random() * FLOWER_TYPES.length)];
      this.el.style.fontSize = this.size + 'rem';
      this.el.style.opacity = this.opacity;
      this.el.style.zIndex = Math.floor(this.size * 10);

      this.delay = Math.random() * 1.5;
      this.delayTimer = 0;
      this.isActive = true;
      this.updateTransform();
    }

    randomDepth() {
      const r = Math.random();
      if (r < 0.28) return 'close';
      if (r < 0.62) return 'medium';
      return 'far';
    }

    update(wind, delta, viewportHeight, viewportWidth) {
      if (!this.isActive) return;

      if (this.delayTimer < this.delay) {
        this.delayTimer += delta;
        return;
      }

      const windFactor = this.depth === 'close' ? 0.6 : this.depth === 'far' ? 1.4 : 1.0;
      const windEffect = wind * windFactor * 0.6;

      this.swingPhase += this.swingFreq * delta * 60;
      const swingOffset = Math.sin(this.swingPhase) * this.swingAmp * 0.6;

      this.drift += (windEffect - this.drift * 0.02) * 0.01;

      const speedFactor = this.depth === 'close' ? 0.7 : this.depth === 'far' ? 1.3 : 1.0;
      const fallSpeed = this.speed * speedFactor;
      const introBoost = isIntro ? 1.5 : 1.0;

      this.x += this.drift * 0.8 + swingOffset * 0.04 + windEffect * 0.3;
      this.y += fallSpeed * introBoost * (0.8 + Math.random() * 0.4) * delta * 60;

      this.rotation += this.rotationSpeed * delta * 60;

      if (this.flipDirection !== 0) {
        this.flipTimer -= delta * 1000;
        if (this.flipTimer <= 0) {
          this.flipDirection = -this.flipDirection;
          this.flipTimer = 150 + Math.random() * 400;
          this.rotationSpeed = (Math.random() - 0.5) * 3.0 * this.flipDirection;
        }
      }

      if (isDesktop && mouseInside) {
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.mouseRadius && dist > 1) {
          const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius * CONFIG.mouseForce;
          const angle = Math.atan2(dy, dx);
          this.x += Math.cos(angle) * force * 2.5;
          this.y += Math.sin(angle) * force * 2.5;
        }
      }

      if (this.y > viewportHeight + 100) {
        this.recycle();
        return;
      }

      if (this.y < -200) {
        this.recycle();
        return;
      }

      if (this.x < -120) this.x = viewportWidth + 60;
      if (this.x > viewportWidth + 120) this.x = -60;

      this.updateTransform();
    }

    updateTransform() {
      this.el.style.transform =
        'translate3d(' + this.x + 'px, ' + this.y + 'px, 0) ' +
        'rotate(' + this.rotation + 'deg) ' +
        'scale(' + (1 + Math.sin(this.swingPhase) * 0.04) + ')';
    }

    recycle() {
      this.isActive = false;
      this.el.style.opacity = '0';
      this.el.style.transform = 'translate3d(-9999px, -9999px, 0)';
      flowerPool.push(this);
    }

    activate(x, y, depth) {
      this.x = x;
      this.y = y;
      this.depth = depth || this.randomDepth();

      this.size = this.depth === 'close' ? 2.6 + Math.random() * 1.2 :
        this.depth === 'far' ? 1.0 + Math.random() * 0.8 :
        1.6 + Math.random() * 1.2;
      this.speed = this.depth === 'close' ? 0.20 + Math.random() * 0.25 :
        this.depth === 'far' ? 0.70 + Math.random() * 0.50 :
        0.40 + Math.random() * 0.40;
      this.opacity = this.depth === 'close' ? 0.80 + Math.random() * 0.15 :
        this.depth === 'far' ? 0.55 + Math.random() * 0.25 :
        0.70 + Math.random() * 0.20;

      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 3.2;
      this.flipDirection = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
      this.flipTimer = this.flipDirection !== 0 ? 100 + Math.random() * 300 : 0;
      this.swingAmp = 20 + Math.random() * 60;
      this.swingFreq = 0.005 + Math.random() * 0.018;
      this.swingPhase = Math.random() * Math.PI * 2;
      this.drift = (Math.random() - 0.5) * 0.4;

      this.el.textContent = FLOWER_TYPES[Math.floor(Math.random() * FLOWER_TYPES.length)];
      this.el.style.fontSize = this.size + 'rem';
      this.el.style.opacity = this.opacity;
      this.el.style.zIndex = Math.floor(this.size * 10);

      this.el.classList.remove('sl-flower--close', 'sl-flower--far');
      if (this.depth === 'close') this.el.classList.add('sl-flower--close');
      else if (this.depth === 'far') this.el.classList.add('sl-flower--far');

      this.delay = Math.random() * 1.5;
      this.delayTimer = 0;
      this.isActive = true;
      this.updateTransform();
    }
  }

  // ---- Particle ----
  class Particle {
    constructor() {
      this.el = document.createElement('div');
      this.el.className = 'sl-particle';
      this.isActive = false;
      this.x = 0;
      this.y = 0;
      this.size = 0;
      this.opacity = 0;
      this.life = 0;
      this.maxLife = 0;
      this.speedY = 0;
      this.speedX = 0;
      this.twinkleSpeed = 0;
      this.twinklePhase = 0;
    }

    init(x, y) {
      this.x = x;
      this.y = y;
      this.size = 3 + Math.random() * 8;
      this.opacity = 0.4 + Math.random() * 0.6;
      this.life = 0;
      this.maxLife = 3 + Math.random() * 5;
      this.speedY = -0.1 - Math.random() * 0.3;
      this.speedX = (Math.random() - 0.5) * 0.2;
      this.twinkleSpeed = 0.02 + Math.random() * 0.06;
      this.twinklePhase = Math.random() * Math.PI * 2;

      const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
      this.el.className = 'sl-particle sl-particle--' + color;

      this.el.style.width = this.size + 'px';
      this.el.style.height = this.size + 'px';
      this.el.style.left = this.x + 'px';
      this.el.style.top = this.y + 'px';
      this.el.style.opacity = this.opacity;
      this.isActive = true;
      this.updateTransform();
    }

    update(delta) {
      if (!this.isActive) return;

      this.life += delta;
      const lifeRatio = this.life / this.maxLife;

      if (lifeRatio >= 1) {
        this.isActive = false;
        this.el.style.opacity = '0';
        particlePool.push(this);
        return;
      }

      this.x += this.speedX * delta * 60;
      this.y += this.speedY * delta * 60;

      const fade = 1 - Math.pow(lifeRatio, 1.5);
      this.opacity = fade * (0.4 + Math.random() * 0.1);

      this.twinklePhase += this.twinkleSpeed * delta * 60;
      const twinkle = 0.6 + 0.4 * Math.sin(this.twinklePhase);

      this.el.style.left = this.x + 'px';
      this.el.style.top = this.y + 'px';
      this.el.style.opacity = this.opacity * twinkle;
      this.updateTransform();
    }

    updateTransform() {
      this.el.style.transform = 'translate3d(0, 0, 0) scale(' +
        (1 + 0.15 * Math.sin(this.twinklePhase)) + ')';
    }

    recycle() {
      this.isActive = false;
      this.el.style.opacity = '0';
      particlePool.push(this);
    }
  }

  // ---- Engine ----
  class FlowerEngine {
    constructor() {
      if (isReducedMotion) {
        return;
      }

      layer = document.createElement('div');
      layer.className = 'sl-flower-layer';
      // Flowers will be behind everything by default (z-index: 0)
      // You can override this in your CSS if needed
      document.body.appendChild(layer);

      this.wind = new WindEngine();
      this.wind.target = (Math.random() - 0.5) * 0.6;
      this.wind.strength = this.wind.target;

      const flowerCount = isMobile ? CONFIG.flowerCountMobile : CONFIG.flowerCountDesktop;

      // Create pool
      for (let i = 0; i < flowerCount * 1.5; i++) {
        const flower = new Flower();
        flowerPool.push(flower);
        layer.appendChild(flower.el);
      }

      // Spawn initial flowers
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      for (let i = 0; i < flowerCount; i++) {
        const flower = this.acquireFlower();
        if (flower) {
          const x = Math.random() * viewportWidth;
          const y = -50 - Math.random() * viewportHeight * 0.5;
          const depth = flower.randomDepth();
          flower.activate(x, y, depth);
          flowers.push(flower);
        }
      }

      // Particle pool
      for (let i = 0; i < 30; i++) {
        const p = new Particle();
        particlePool.push(p);
        layer.appendChild(p.el);
      }

      this.spawnIntroParticles();

      introStartTime = performance.now();
      isIntro = true;

      nextWindChange = performance.now() + this.wind.interval;

      this.bindEvents();
      this.lastTime = performance.now();
      this.startAnimation();

      document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }

    acquireFlower() {
      if (flowerPool.length > 0) {
        return flowerPool.pop();
      }
      const f = new Flower();
      layer.appendChild(f.el);
      return f;
    }

    spawnIntroParticles() {
      const count = CONFIG.particleCountIntro;
      for (let i = 0; i < count; i++) {
        const p = this.acquireParticle();
        if (p) {
          const x = Math.random() * window.innerWidth;
          const y = Math.random() * window.innerHeight * 0.6;
          p.init(x, y);
          particles.push(p);
        }
      }
    }

    spawnRegularParticles() {
      const count = CONFIG.particleCountRegular;
      for (let i = 0; i < count; i++) {
        const p = this.acquireParticle();
        if (p) {
          const x = Math.random() * window.innerWidth;
          const y = Math.random() * window.innerHeight * 0.5 + window.innerHeight * 0.1;
          p.init(x, y);
          particles.push(p);
        }
      }
    }

    acquireParticle() {
      if (particlePool.length > 0) {
        return particlePool.pop();
      }
      const p = new Particle();
      layer.appendChild(p.el);
      return p;
    }

    bindEvents() {
      if (isDesktop) {
        window.addEventListener('mousemove', this.onMouseMove.bind(this), { passive: true });
        window.addEventListener('mouseleave', this.onMouseLeave.bind(this), { passive: true });
      }
      window.addEventListener('resize', this.onResize.bind(this), { passive: true });
    }

    onMouseMove(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      mouseInside = true;
    }

    onMouseLeave() {
      mouseInside = false;
      mouseX = -9999;
      mouseY = -9999;
    }

    onResize() {
      // Viewport handled each frame
    }

    handleVisibilityChange() {
      if (document.hidden) {
        isPaused = true;
      } else {
        isPaused = false;
        this.lastTime = performance.now();
      }
    }

    startAnimation() {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      this.lastTime = performance.now();
      this.loop = this.animate.bind(this);
      animationId = requestAnimationFrame(this.loop);
    }

    animate(timestamp) {
      if (isPaused) {
        animationId = requestAnimationFrame(this.loop);
        return;
      }

      const delta = Math.min((timestamp - this.lastTime) / 1000, 0.05);
      this.lastTime = timestamp;

      if (isIntro && timestamp - introStartTime > CONFIG.introDuration) {
        isIntro = false;
      }

      this.wind.update(delta * 1000);
      const wind = this.wind.getStrength();

      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      const targetCount = isMobile ? CONFIG.flowerCountMobile : CONFIG.flowerCountDesktop;
      
      for (let i = flowers.length - 1; i >= 0; i--) {
        const flower = flowers[i];
        if (!flower.isActive) {
          flowers.splice(i, 1);
          continue;
        }
        flower.update(wind, delta, viewportHeight, viewportWidth);
      }

      while (flowers.length < targetCount) {
        const f = this.acquireFlower();
        if (f) {
          const x = Math.random() * viewportWidth;
          const y = -50 - Math.random() * viewportHeight * 0.6;
          f.activate(x, y);
          flowers.push(f);
        } else {
          break;
        }
      }

      if (isIntro && flowers.length < targetCount * 1.3) {
        const f = this.acquireFlower();
        if (f) {
          const x = Math.random() * viewportWidth;
          const y = -50 - Math.random() * viewportHeight * 0.3;
          f.activate(x, y);
          flowers.push(f);
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (!p.isActive) {
          particles.splice(i, 1);
          continue;
        }
        p.update(delta);
      }

      if (!isIntro && Math.random() < 0.008 && particles.length < 25) {
        this.spawnRegularParticles();
      }

      if (isIntro && Math.random() < 0.03) {
        const p = this.acquireParticle();
        if (p) {
          const x = Math.random() * viewportWidth;
          const y = Math.random() * viewportHeight * 0.4;
          p.init(x, y);
          particles.push(p);
        }
      }

      frameCount++;
      animationId = requestAnimationFrame(this.loop);
    }

    destroy() {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }

      if (layer && layer.parentNode) {
        layer.parentNode.removeChild(layer);
      }

      flowers = [];
      particles = [];
      flowerPool = [];
      particlePool = [];

      window.removeEventListener('mousemove', this.onMouseMove);
      window.removeEventListener('mouseleave', this.onMouseLeave);
      window.removeEventListener('resize', this.onResize);
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  // ---- Initialise ----
  function init() {
    if (isReducedMotion) {
      return;
    }

    if (window.__flowerEngine) {
      return;
    }

    const engine = new FlowerEngine();
    window.__flowerEngine = engine;

    window.__flowerEngineDestroy = function () {
      if (window.__flowerEngine) {
        window.__flowerEngine.destroy();
        window.__flowerEngine = null;
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { passive: true });
  } else {
    init();
  }

})();
