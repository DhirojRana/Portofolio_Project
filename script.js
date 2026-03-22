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



  // SEASON TOGGLE (Autumn <-> Winter)
  const seasonToggle = document.getElementById('seasonToggle');
  let savedSeason = localStorage.getItem('season') || 'autumn';
  let isWinter = savedSeason === 'winter';
  function applySeason() {
    document.documentElement.classList.toggle('winter', isWinter);
    seasonToggle.textContent = isWinter ? '\uD83C\uDF42' : '\u2744\uFE0F';
    seasonToggle.setAttribute('data-tooltip', isWinter ? 'Switch to Autumn' : 'Switch to Winter');
  }
  applySeason();
  seasonToggle.addEventListener('click', () => {
    isWinter = !isWinter;
    localStorage.setItem('season', isWinter ? 'winter' : 'autumn');
    applySeason();
  });

  // HERO CANVAS — Seasonal drifting effects (Leaves / Snow)
  const canvas = document.getElementById('heroCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], mouse = { x: -999, y: -999 };

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  const leafImg = new Image();
  leafImg.src = 'leaf.png';

  // Draw a maple-style leaf
  function drawLeaf(x, y, size, rotation, opacity, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = opacity;
    
    if (leafImg.complete && leafImg.naturalWidth !== 0) {
      // Use the provided image
      ctx.drawImage(leafImg, -size, -size, size * 2, size * 2);
    } else {
      // Fallback simple leaf shape
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.bezierCurveTo(size * 1.5, -size * 0.5, size * 1.5, size * 0.5, 0, size);
      ctx.bezierCurveTo(-size * 1.5, size * 0.5, -size * 1.5, -size * 0.5, 0, -size);
      ctx.fillStyle = color;
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(0, size);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
    
    ctx.restore();
  }

  // Draw a simple 6-pointed snowflake
  function drawSnowflake(x, y, size, rotation, opacity) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = opacity;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;

    for (let i = 0; i < 6; i++) {
        ctx.rotate(Math.PI / 3);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, size);
        ctx.moveTo(0, size * 0.5);
        ctx.lineTo(size * 0.2, size * 0.6);
        ctx.moveTo(0, size * 0.5);
        ctx.lineTo(-size * 0.2, size * 0.6);
        ctx.stroke();
    }
    ctx.restore();
  }

  const autumnColors = ['#D35400', '#E67E22', '#F1C40F', '#C0392B', '#A04000'];

  class Particle {
    constructor() { this.reset(true); }

    reset(rand) {
      this.x = Math.random() * W;
      this.y = rand ? Math.random() * H : -20;
      this.size = Math.random() * 12 + 10; // Slightly larger for image assets
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = Math.random() * 1.5 + 0.5; // Fall speed
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.05;
      this.opacity = Math.random() * 0.4 + 0.2;
      this.color = autumnColors[Math.floor(Math.random() * autumnColors.length)];
      this.swaySpeed = Math.random() * 0.05 + 0.02;
      this.swayOffset = Math.random() * Math.PI * 2;
    }

    update(tick) {
      const isWinter = document.documentElement.classList.contains('winter');
      
      // Horizontal sway
      const sway = Math.sin(tick * this.swaySpeed + this.swayOffset);
      this.x += this.vx + sway * 0.5;
      this.y += this.vy;
      this.rotation += this.rotSpeed;

      // Mouse interaction — push away
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        const force = (100 - dist) / 100;
        this.x += (dx / dist) * force * 5;
        this.y += (dy / dist) * force * 5;
      }

      // Reset when off screen
      if (this.y > H + 20 || this.x < -20 || this.x > W + 20) {
        this.reset(false);
      }
    }

    draw() {
      const isWinter = document.documentElement.classList.contains('winter');
      if (isWinter) {
        drawSnowflake(this.x, this.y, this.size * 0.6, this.rotation, this.opacity);
      } else {
        drawLeaf(this.x, this.y, this.size, this.rotation, this.opacity, this.color);
      }
    }
  }

  function init() {
    resize();
    particles = [];
    for (let i = 0; i < 40; i++) {
      particles.push(new Particle());
    }
  }

  init();
  window.addEventListener('resize', () => { init(); });

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

  function animate() {
    ctx.clearRect(0, 0, W, H);
    let tick = performance.now() * 0.01;
    particles.forEach(p => {
      p.update(tick);
      p.draw();
    });
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
