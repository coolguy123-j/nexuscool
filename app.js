/* ══════════════════════════════════════════════════════
   NEXUS ARCADE — app.js
══════════════════════════════════════════════════════ */

const $ = id => document.getElementById(id);
const qs = sel => document.querySelector(sel);
const qsa = sel => document.querySelectorAll(sel);

// ── STARFIELD CANVAS ───────────────────────────────────
(function () {
  const canvas = document.createElement('canvas');
  $('starfield').appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let W, H, stars = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function makeStars(n) {
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.4 + 0.2,
      a: Math.random(),
      speed: Math.random() * 0.003 + 0.001,
      twinkle: Math.random() * Math.PI * 2,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const t = Date.now() / 1000;
    stars.forEach(s => {
      const alpha = s.a * (0.5 + 0.5 * Math.sin(t * s.speed * 60 + s.twinkle));
      // color mix: white / blue / purple
      const hue = 230 + Math.sin(s.twinkle) * 40;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, 80%, 85%, ${alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resize();
  makeStars(260);
  draw();
  window.addEventListener('resize', () => { resize(); makeStars(260); });
})();

// ── NEBULA PARTICLES ───────────────────────────────────
(function () {
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden';
  document.body.appendChild(container);

  const colors = [
    'rgba(108,99,255,0.35)',
    'rgba(0,212,255,0.25)',
    'rgba(255,45,135,0.2)',
  ];
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    const size = Math.random() * 3 + 1;
    p.style.cssText = `
      position:absolute; border-radius:50%;
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      top:${Math.random() * 100}%;
      background:${colors[i % 3]};
      animation: floatUp ${6 + Math.random() * 8}s ${Math.random() * 6}s linear infinite;
    `;
    container.appendChild(p);
  }
  const style = document.createElement('style');
  style.textContent = `
    @keyframes floatUp {
      0%  { opacity:0; transform:translateY(0) scale(.8) }
      15% { opacity:1 }
      80% { opacity:.4 }
      100%{ opacity:0; transform:translateY(-70px) scale(1.1) }
    }`;
  document.head.appendChild(style);
})();

// ── VIEW MANAGEMENT ────────────────────────────────────
const VIEWS = ['home', 'library', 'categories', 'proxy', 'ai', 'android'];
let currentView = 'home';

function showView(name) {
  VIEWS.forEach(v => {
    const el = $('view-' + v);
    if (el) el.style.display = v === name ? 'block' : 'none';
  });
  qsa('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === name));
  currentView = name;
  if (name === 'home') startHero(); else stopHero();
}

// ── HERO SLIDER ────────────────────────────────────────
const FEATURED_IDS = ['slope', 'minecraft', 'cuphead', 'buckshot', 'retrobowl', 'geodash', 'pizzatower', 'fnaf1', 'hollowknight', 'terraria'];
let heroIdx = 0, heroTimer;

function getFeatured() {
  return FEATURED_IDS.map(id => GAMES.find(g => g.id === id)).filter(Boolean);
}

function setHero(idx) {
  const featured = getFeatured();
  const g = featured[idx];
  if (!g) return;

  const img = $('hero-img');
  img.style.transition = 'opacity .35s';
  img.style.opacity = '0';
  setTimeout(() => {
    img.src = g.thumb;
    img.style.opacity = '1';
    img.onerror = () => { img.src = fallback(g.id); };
  }, 200);

  $('hero-title').textContent = g.title;
  $('hero-cat').textContent = g.cat;
  $('hero-play').onclick = () => openGame(g);

  qsa('.hero-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
}

function buildHeroDots() {
  const container = $('hero-dots');
  container.innerHTML = '';
  getFeatured().forEach((_, i) => {
    const b = document.createElement('button');
    b.className = 'hero-dot' + (i === 0 ? ' active' : '');
    b.onclick = () => { heroIdx = i; setHero(i); };
    container.appendChild(b);
  });
}

function startHero() {
  buildHeroDots();
  setHero(heroIdx);
  heroTimer = setInterval(() => {
    heroIdx = (heroIdx + 1) % getFeatured().length;
    setHero(heroIdx);
  }, 4500);
}

function stopHero() { clearInterval(heroTimer); }

// ── UTILS ──────────────────────────────────────────────
function fallback(id) {
  return `https://picsum.photos/seed/${id}/400/225`;
}

const CAT_COLORS = {
  Horror:      'linear-gradient(135deg,#4a0010,#1a0008)',
  Arcade:      'linear-gradient(135deg,#0a1a4a,#020a1e)',
  Action:      'linear-gradient(135deg,#3a1200,#1a0800)',
  Sports:      'linear-gradient(135deg,#003a1a,#001508)',
  Simulation:  'linear-gradient(135deg,#1a0240,#08011a)',
  Adventure:   'linear-gradient(135deg,#2a1800,#100900)',
  Racing:      'linear-gradient(135deg,#2a0030,#100015)',
  Multiplayer: 'linear-gradient(135deg,#001a3a,#000c1a)',
  Strategy:    'linear-gradient(135deg,#002a2a,#001010)',
};

const CAT_ACCENT = {
  Horror:'#ff3a5c', Arcade:'#3b82f6', Action:'#f97316', Sports:'#22c55e',
  Simulation:'#a855f7', Adventure:'#eab308', Racing:'#ec4899',
  Multiplayer:'#06b6d4', Strategy:'#14b8a6',
};

// ── MAKE CARD ──────────────────────────────────────────
function makeCard(game, delay = 0) {
  const card = document.createElement('div');
  card.className = 'card';
  card.style.animationDelay = delay + 's';

  const hotBadge = game.hot
    ? `<div class="card-hot"><div class="hot-tag">🔥 HOT</div></div>` : '';

  card.innerHTML = `
    <div class="card-thumb">
      <img src="${game.thumb}" alt="${game.title}" loading="lazy"
           onerror="this.src='${fallback(game.id)}'"/>
      <div class="card-overlay">
        <button class="play-btn">
          <svg width="11" height="11" fill="currentColor" viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z"/></svg>
          PLAY NOW
        </button>
      </div>
      <div class="card-badge">${game.cat}</div>
      ${hotBadge}
    </div>
    <div class="card-info">
      <div class="card-title">${game.title}</div>
      <div class="card-meta">
        <span class="card-genre">${game.cat}</span>
      </div>
    </div>`;

  card.addEventListener('click', () => openGame(game));
  return card;
}

function renderGrid(container, games) {
  container.innerHTML = '';
  if (!games.length) {
    container.innerHTML = `<div class="empty"><div class="empty-icon">🛸</div><h3>No games found</h3></div>`;
    return;
  }
  games.forEach((g, i) => container.appendChild(makeCard(g, Math.min(i * 0.04, 0.5))));
}

// ── OPEN GAME MODAL ────────────────────────────────────
function openGame(game) {
  $('modal-thumb').src = game.thumb;
  $('modal-thumb').onerror = () => { $('modal-thumb').src = fallback(game.id); };
  $('modal-title').textContent = game.title;
  $('modal-cat').textContent = game.cat;
  $('modal-iframe').src = game.src;
  $('modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  $('modal').classList.remove('open');
  setTimeout(() => { $('modal-iframe').src = ''; }, 300);
  document.body.style.overflow = '';
}

// ── VIEWS: BUILD ───────────────────────────────────────
function buildHotGrid() {
  const hot = GAMES.filter(g => g.hot).slice(0, 12);
  $('hot-count').textContent = hot.length + ' Games';
  renderGrid($('hot-grid'), hot);
}

function buildAllGrid() {
  $('all-count').textContent = GAMES.length + ' Games';
  renderGrid($('all-grid'), GAMES);
}

function buildLibrary(filter = 'All') {
  const filtered = filter === 'All' ? GAMES : GAMES.filter(g => g.cat === filter);
  $('lib-count').textContent = filtered.length + ' Games';
  renderGrid($('lib-grid'), filtered);
}

function buildCatBar() {
  const bar = $('cat-bar');
  bar.innerHTML = '';
  const cats = ['All', ...new Set(GAMES.map(g => g.cat))];
  cats.forEach(c => {
    const b = document.createElement('button');
    b.className = 'cat-pill' + (c === 'All' ? ' active' : '');
    b.textContent = c;
    b.onclick = () => {
      qsa('.cat-pill').forEach(p => p.classList.remove('active'));
      b.classList.add('active');
      buildLibrary(c);
    };
    bar.appendChild(b);
  });
}

function buildCategories() {
  const grid = $('cat-grid-el');
  const gamesGrid = $('cat-games-el');
  grid.innerHTML = '';
  grid.style.display = 'grid';
  gamesGrid.style.display = 'none';
  $('cat-back-btn').style.display = 'none';
  $('cat-header-title').textContent = 'Categories';

  const cats = {};
  GAMES.forEach(g => {
    cats[g.cat] = cats[g.cat] || [];
    cats[g.cat].push(g);
  });

  Object.entries(cats).forEach(([cat, games]) => {
    const card = document.createElement('div');
    card.className = 'cat-card';
    const accent = CAT_ACCENT[cat] || '#6c63ff';
    card.innerHTML = `
      <div class="cat-bg" style="background:${CAT_COLORS[cat] || CAT_COLORS.Arcade}"></div>
      <div class="cat-overlay">
        <div class="cat-name" style="color:${accent};text-shadow:0 0 20px ${accent}44">${cat}</div>
        <div class="cat-cnt">${games.length} Games</div>
      </div>`;

    card.onclick = () => {
      grid.style.display = 'none';
      gamesGrid.style.display = 'grid';
      $('cat-back-btn').style.display = 'flex';
      $('cat-header-title').textContent = cat;
      renderGrid(gamesGrid, games);
    };
    grid.appendChild(card);
  });
}

// ── SEARCH ─────────────────────────────────────────────
$('search').addEventListener('input', function () {
  const q = this.value.trim().toLowerCase();
  if (!q) return;
  showView('library');
  buildCatBar();
  const filtered = GAMES.filter(g =>
    g.title.toLowerCase().includes(q) || g.cat.toLowerCase().includes(q)
  );
  $('lib-count').textContent = filtered.length + ' Games';
  renderGrid($('lib-grid'), filtered);
});

// ── NAV CLICKS ─────────────────────────────────────────
qsa('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const v = btn.dataset.view;
    showView(v);
    if (v === 'library') { buildCatBar(); buildLibrary(); }
    if (v === 'categories') buildCategories();
  });
});

// ── MODAL CONTROLS ─────────────────────────────────────
$('close-modal').addEventListener('click', closeModal);
$('modal').addEventListener('click', e => { if (e.target === $('modal')) closeModal(); });
$('fullscreen-btn').addEventListener('click', () => {
  const f = $('modal-iframe');
  (f.requestFullscreen || f.webkitRequestFullscreen || f.msRequestFullscreen).call(f);
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ── CATEGORY BACK ──────────────────────────────────────
$('cat-back-btn').addEventListener('click', () => {
  buildCategories();
});

// ── INIT ───────────────────────────────────────────────
buildHotGrid();
buildAllGrid();
startHero();
showView('home');
