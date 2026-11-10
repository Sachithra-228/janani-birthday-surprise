(() => {
  const CANDLES = 29;
  const WISHES = [
    "Happy Birthday, <em>Akka</em>! You light up every room you walk into. ✨",
    "Here's to your beautiful smile — the best thing in any photo. 😊",
    "Every memory with you is one I treasure. 💖",
    "You make ordinary days feel like celebrations. 🎉",
    "Strong, kind and graceful — that's you, Janani. 🌸",
    "May every dream you hold come true this year. 🌟",
    "Thank you for all the laughs and all the love. 😂❤️",
    "You deserve all the happiness in the world. 🌈",
    "Never lose that sparkle in your eyes. ✨",
    "Cheers to growing, glowing and shining even brighter! 🥂",
    "Twenty-nine years of you — the world is better for it. 🌍💕"
  ];
  const $ = (s) => document.querySelector(s);
  const song = $('#song');

  /* ---------- build gallery ---------- */
  const gallery = $('#gallery');
  WISHES.forEach((w, i) => {
    const n = String(i + 1).padStart(2, '0');
    const candleNo = Math.round(((i + 1) * CANDLES) / WISHES.length);
    const card = document.createElement('div');
    card.className = 'card';
    card.style.setProperty('--r', ((i % 2 ? 1 : -1) * (1 + (i % 3))) + 'deg');
    card.innerHTML = `<div class="frame"><img loading="lazy" src="assets/images/photo${n}.jpg" alt="Janani"><div class="age">${candleNo}</div></div><p>${w}</p><span class="candle-note">candle ${candleNo} of ${CANDLES}</span>`;
    gallery.appendChild(card);
  });

  /* ---------- melting candle bar ---------- */
  const bar = $('#candleBar');
  const mcs = [];
  for (let i = 0; i < CANDLES; i++) { const d = document.createElement('div'); d.className = 'mc out'; bar.appendChild(d); mcs.push(d); }

  const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }), { threshold: .25 });
  document.querySelectorAll('.card').forEach(c => io.observe(c));
  const nums = document.querySelectorAll('.num');
  let confettiOn = false;
  const fio = new IntersectionObserver((es) => es.forEach(e => {
    if (e.isIntersecting) {
      nums.forEach((n, i) => setTimeout(() => n.classList.add('in'), i * 350));
      if (!confettiOn) { confettiOn = true; startConfetti(); }
    }
  }), { threshold: .4 });
  fio.observe($('#finale'));

  function onScroll() {
    const g = gallery.getBoundingClientRect();
    const start = window.innerHeight * 0.4;
    const total = g.height - window.innerHeight * 0.3;
    const p = Math.min(1, Math.max(0, (start - g.top) / total));
    const melted = Math.round(p * CANDLES);
    mcs.forEach((m, i) => m.classList.toggle('melt', i < melted));
    bar.classList.toggle('show', window.scrollY > window.innerHeight * 0.6);
  }
  addEventListener('scroll', onScroll, { passive: true });

  /* ---------- intro / countdown ---------- */
  let started = false;
  $('#startBtn').addEventListener('click', () => {
    if (started) return; started = true;
    song.currentTime = 0; song.play().catch(() => {});
    $('#startBox').classList.add('hidden');
    const c = $('#count'); c.classList.remove('hidden');
    let n = 3; const el = $('#countNum'); el.textContent = n;
    const t = setInterval(() => {
      n--;
      if (n > 0) { el.textContent = n; el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; }
      else { clearInterval(t); c.classList.add('hidden'); $('#intro').classList.add('gone'); startCake(); }
    }, 1000);
  });

  $('#mute').addEventListener('click', (e) => { song.muted = !song.muted; e.target.textContent = song.muted ? '🔇' : '🔊'; });
  $('#replay').addEventListener('click', () => { document.body.classList.add('locked'); scrollTo(0, 0); resetCake(); startCake(); });

  /* ---------- 3D cake ---------- */
  const canvas = $('#cake');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  scene.add(new THREE.AmbientLight(0xffc9e6, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 0.8); key.position.set(4, 8, 5); scene.add(key);
  const glow = new THREE.PointLight(0xffaa55, 1.6, 14); glow.position.set(0, 4.5, 0); scene.add(glow);

  const cake = new THREE.Group(); scene.add(cake);
  const mat = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .5 }, o));
  const tier = (r, h, y, color) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 64), mat(color)); m.position.y = y + h / 2; cake.add(m);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, .09, 12, 64), mat(0xffffff, { roughness: .3 }));
    ring.rotation.x = Math.PI / 2; ring.position.y = y + h; cake.add(ring);
    const ring2 = ring.clone(); ring2.position.y = y; cake.add(ring2);
    return y + h;
  };
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.4, .2, 64), mat(0xf5e6ff, { metalness: .4, roughness: .25 })); plate.position.y = -.1; cake.add(plate);
  let y = tier(2.4, 1.2, 0, 0xff8fc0);
  y = tier(1.7, 1.0, y, 0xffd1e6);
  y = tier(1.0, .9, y, 0xffb347 + 0x0);
  const topY = y;
  // cherries / decor on tiers
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; const s = new THREE.Mesh(new THREE.SphereGeometry(.12, 16, 16), mat(0xc2185b, { roughness: .2 })); s.position.set(Math.cos(a) * 2.4, 1.28, Math.sin(a) * 2.4); cake.add(s); }

  // candles: 14 + 10 + 5 = 29
  const flames = [], candleMeshes = [];
  const rings = [{ n: 14, r: 2.0, y: 1.2 }, { n: 10, r: 1.35, y: 2.2 }, { n: 5, r: .55, y: topY }];
  const colors = [0xffffff, 0xffe066, 0x9fe8ff, 0xffa6d0, 0xc9a6ff];
  let k = 0;
  rings.forEach(R => {
    for (let i = 0; i < R.n; i++) {
      const a = i / R.n * Math.PI * 2 + (R.n === 10 ? .3 : 0);
      const g = new THREE.Group(); g.position.set(Math.cos(a) * R.r, R.y, Math.sin(a) * R.r);
      const c = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, .55, 12), mat(colors[k % colors.length])); c.position.y = .275; g.add(c);
      const f = new THREE.Mesh(new THREE.SphereGeometry(.1, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffc34d }));
      f.scale.set(.8, 1.5, .8); f.position.y = .7; g.add(f);
      const halo = new THREE.Mesh(new THREE.SphereGeometry(.2, 12, 12), new THREE.MeshBasicMaterial({ color: 0xff9a3c, transparent: true, opacity: .25 }));
      halo.position.y = .7; g.add(halo);
      f.userData = { halo, ph: Math.random() * 6 }; flames.push(f);
      cake.add(g); k++;
    }
  });

  // sparkle dust + smoke
  const dustGeo = new THREE.BufferGeometry(); const N = 260; const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - .5) * 16; pos[i * 3 + 1] = Math.random() * 9 - 2; pos[i * 3 + 2] = (Math.random() - .5) * 16 - 2; }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xffd36b, size: .07, transparent: true, opacity: .8 })); scene.add(dust);
  const smoke = []; let blown = false, running = false, t0 = 0, blowTimer = null;

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight; renderer.setSize(w, h, false);
    camera.aspect = w / h; const portrait = w / h < .9;
    camera.position.set(0, portrait ? 7.5 : 5.2, portrait ? 13.5 : 9.5); camera.lookAt(0, 1.6, 0); camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize); resize();

  function blowOut() {
    if (blown) return; blown = true;
    $('#heroSub').textContent = '…and poof! Wish made 🌟';
    flames.forEach((f, i) => {
      setTimeout(() => {
        f.userData.out = 1; f.userData.halo.visible = false;
        for (let s = 0; s < 3; s++) {
          const m = new THREE.Mesh(new THREE.SphereGeometry(.09, 8, 8), new THREE.MeshBasicMaterial({ color: 0xcccccc, transparent: true, opacity: .6 }));
          const wp = new THREE.Vector3(); f.getWorldPosition(wp); m.position.copy(wp); m.userData.v = .01 + Math.random() * .015; scene.add(m); smoke.push(m);
        }
      }, i * 60);
    });
    setTimeout(() => {
      $('#scrollHint').classList.remove('hidden'); document.body.classList.remove('locked'); bar.classList.remove('show');
    }, flames.length * 60 + 800);
  }

  function startCake() {
    if (!running) { running = true; t0 = performance.now(); requestAnimationFrame(loop); }
    $('#heroSub').textContent = 'Make a wish, Janani…';
    clearTimeout(blowTimer); blowTimer = setTimeout(blowOut, 14000);
  }
  function resetCake() {
    blown = false; flames.forEach(f => { f.userData.out = 0; f.scale.set(.8, 1.5, .8); f.userData.halo.visible = true; });
    $('#scrollHint').classList.add('hidden'); $('#intro').classList.remove('gone'); $('#startBox').classList.remove('hidden'); started = false;
    mcs.forEach(m => m.classList.remove('melt'));
  }

  function loop(now) {
    requestAnimationFrame(loop);
    const t = (now - t0) / 1000;
    cake.rotation.y = t * .25;
    cake.scale.setScalar(Math.min(1, t * 1.2 + .001));
    flames.forEach(f => {
      if (f.userData.out) { const s = Math.max(0, f.scale.x - .06); f.scale.set(s, s * 1.8, s); }
      else { const fl = 1 + Math.sin(t * 14 + f.userData.ph) * .12; f.scale.set(.8 * fl, 1.5 * (1 + Math.sin(t * 11 + f.userData.ph) * .12), .8 * fl); f.userData.halo.scale.setScalar(fl); }
    });
    glow.intensity = blown ? Math.max(0, glow.intensity - .02) : 1.4 + Math.sin(t * 9) * .25;
    smoke.forEach(m => { m.position.y += m.userData.v; m.position.x += Math.sin(t * 3 + m.position.y) * .003; m.material.opacity -= .004; m.scale.multiplyScalar(1.006); });
    dust.rotation.y = t * .03;
    renderer.render(scene, camera);
  }

  /* ---------- confetti ---------- */
  function startConfetti() {
    const c = $('#confetti'), ctx = c.getContext('2d');
    const fit = () => { c.width = c.clientWidth; c.height = c.clientHeight; }; fit(); addEventListener('resize', fit);
    const cols = ['#ffd36b', '#ff5fa2', '#b79cff', '#7ee7ff', '#fff'];
    const ps = Array.from({ length: 120 }, () => ({ x: Math.random() * c.width, y: Math.random() * -c.height, s: 4 + Math.random() * 6, v: 1 + Math.random() * 2.5, a: Math.random() * 6, c: cols[Math.floor(Math.random() * cols.length)] }));
    (function draw() {
      ctx.clearRect(0, 0, c.width, c.height);
      ps.forEach(p => { p.y += p.v; p.a += .05; p.x += Math.sin(p.a); if (p.y > c.height) { p.y = -10; p.x = Math.random() * c.width; }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); });
      requestAnimationFrame(draw);
    })();
  }
})();
