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

  // HERO CANVAS — floating particle network
  const canvas = document.getElementById('heroCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); particles = []; init(); });

  function init() {
    for (let i = 0; i < 55; i++) particles.push(new Particle());
  }

  class Particle {
    constructor() { this.reset(true); }
    reset(rand) {
      this.x = rand ? Math.random() * W : (Math.random() > 0.5 ? -10 : W + 10);
      this.y = Math.random() * H;
      this.size = Math.random() * 2 + 0.5;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.opacity = Math.random() * 0.55 + 0.1;
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < -20 || this.x > W + 20 || this.y < -20 || this.y > H + 20) this.reset(false);
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(79,70,229,${this.opacity})`;
      ctx.fill();
    }
  }

  init();

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 110) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(79,70,229,${0.07 * (1 - d / 110)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
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
