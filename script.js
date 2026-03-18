// SCROLL PROGRESS
  const progressBar = document.getElementById('progress-bar');
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const scrolled = window.scrollY / (h.scrollHeight - h.clientHeight);
    progressBar.style.width = (scrolled * 100) + '%';
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });

  // NAV MOBILE
  document.getElementById('navToggle').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('open');
  });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => document.getElementById('navLinks').classList.remove('open'));
  });

  // DARK MODE
  const darkToggle = document.getElementById('darkToggle');
  let savedDark = localStorage.getItem('dark');
  let dark = savedDark !== null ? savedDark === 'true' : true;
  function applyDark() {
    document.documentElement.classList.toggle('dark', dark);
    darkToggle.textContent = dark ? '☀️' : '🌙';
  }
  applyDark();
  darkToggle.addEventListener('click', () => {
    dark = !dark;
    localStorage.setItem('dark', dark);
    applyDark();
  });

  // HERO CANVAS — drifting sunset stars
  const canvas = document.getElementById('heroCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, stars = [], mouse = { x: -999, y: -999 };

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); stars = []; init(); });

  // Track mouse over the hero
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

  // Draw a crisp 4-point star ✦
  function drawStar(x, y, outerR, innerR, rotation) {
    const pts = 4;
    ctx.beginPath();
    for (let i = 0; i < pts * 2; i++) {
      const angle = (i * Math.PI) / pts + rotation;
      const r = i % 2 === 0 ? outerR : innerR;
      i === 0
        ? ctx.moveTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r)
        : ctx.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
    }
    ctx.closePath();
  }

  class Star {
    constructor() { this.reset(true); }

    reset(rand) {
      this.x   = rand ? Math.random() * W : (Math.random() > 0.5 ? -20 : W + 20);
      this.y   = rand ? Math.random() * H : Math.random() * H;
      this.outerR     = Math.random() * 6 + 5;      // 5–11px — noticeably bigger
      this.innerR     = this.outerR * 0.32;
      this.vx         = (Math.random() - 0.5) * 0.30;
      this.vy         = (Math.random() - 0.5) * 0.30;
      this.rotation   = Math.random() * Math.PI;
      this.rotSpeed   = (Math.random() - 0.5) * 0.007;
      this.baseOpacity     = Math.random() * 0.55 + 0.25;
      this.twinkleSpeed    = Math.random() * 0.03 + 0.01;
      this.twinkleOffset   = Math.random() * Math.PI * 2;
      this.sparkle    = 0;   // 0–1, bursts on hover
      this.sparkleDecay = 0;
    }

    update(t) {
      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotSpeed;

      // Twinkle
      const twinkle = 0.55 + 0.45 * Math.sin(t * this.twinkleSpeed + this.twinkleOffset);
      this.currentOpacity = this.baseOpacity * twinkle;

      // Hover proximity sparkle
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radius = 90;
      if (dist < radius) {
        this.sparkle = Math.max(this.sparkle, 1 - dist / radius);
        this.sparkleDecay = 0.025;
      }
      if (this.sparkle > 0) {
        this.sparkle = Math.max(0, this.sparkle - this.sparkleDecay);
        this.rotSpeed = (Math.random() - 0.5) * 0.04; // spin faster while sparkling
      }

      if (this.x < -30 || this.x > W + 30 || this.y < -30 || this.y > H + 30) this.reset(false);
    }

    draw() {
      const boosted   = this.currentOpacity + this.sparkle * 0.6;
      const sizeBoost = 1 + this.sparkle * 0.7;
      const OR = this.outerR * sizeBoost;
      const IR = this.innerR * sizeBoost;

      // Pick colour: warm white-gold core, orange rim
      // Core star: near-white with warm tint
      const coreAlpha = Math.min(1, boosted);
      // Glow: rich amber-orange
      const glowAlpha = Math.min(0.9, boosted * 0.85);

      ctx.save();

      // Outer glow — amber
      ctx.shadowColor  = `rgba(255, 140, 40, ${glowAlpha})`;
      ctx.shadowBlur   = OR * (3 + this.sparkle * 5);
      ctx.fillStyle    = `rgba(255, 220, 130, ${coreAlpha})`;
      drawStar(this.x, this.y, OR, IR, this.rotation);
      ctx.fill();

      // Inner bright core — almost white
      ctx.shadowBlur  = OR * 1.2;
      ctx.shadowColor = `rgba(255, 255, 210, ${coreAlpha})`;
      ctx.fillStyle   = `rgba(255, 252, 220, ${Math.min(1, coreAlpha + 0.2)})`;
      drawStar(this.x, this.y, OR * 0.45, IR * 0.45, this.rotation);
      ctx.fill();

      ctx.restore();
    }
  }

  function init() {
    for (let i = 0; i < 52; i++) stars.push(new Star());
  }
  init();

  let tick = 0;
  function animate() {
    ctx.clearRect(0, 0, W, H);
    tick++;
    stars.forEach(s => { s.update(tick); s.draw(); });
    requestAnimationFrame(animate);
  }
  animate();

  // SCROLL REVEAL
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal, .timeline-item').forEach(el => revealObs.observe(el));

  // CONTACT FORM
  function handleSubmit() {
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const msg = document.getElementById('contactMsg').value.trim();
    if (!name || !email || !msg) { alert('Please fill in all fields.'); return; }
    const success = document.getElementById('formSuccess');
    success.style.display = 'flex';
    document.getElementById('contactName').value = '';
    document.getElementById('contactEmail').value = '';
    document.getElementById('contactMsg').value = '';
    setTimeout(() => success.style.display = 'none', 5000);
  }
