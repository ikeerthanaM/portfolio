const canvas = document.getElementById('ocean-canvas');
const ctx = canvas.getContext('2d');
const overlayEl = document.getElementById('world-overlay');
const articleReaderEl = document.getElementById('article-reader');

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

document.getElementById('close-reader').addEventListener('click', () => {
  articleReaderEl.classList.add('hidden');
});

// ==========================================
// 1. WORLD COORDINATES & OMNIDIRECTIONAL CAMERA
// ==========================================
const WORLD_BOUNDS = {
  minX: -1150,
  maxX: 1450,
  minY: -380,
  maxY: 3350
};

const camera = {
  x: 420 - width / 2,
  y: -height * 0.42
};

let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragMoved = false;

const pointer = {
  screenX: width / 2,
  screenY: height / 2,
  worldX: 420,
  worldY: 0
};

window.addEventListener(
  'wheel',
  (e) => {
    if (!articleReaderEl.classList.contains('hidden')) return;
    e.preventDefault();
    camera.x += e.deltaX;
    camera.y += e.deltaY;
    clampCamera();
  },
  { passive: false }
);

canvas.addEventListener('pointerdown', (e) => {
  isDragging = true;
  dragMoved = false;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  updatePointer(e);
});

window.addEventListener('pointermove', (e) => {
  updatePointer(e);
  if (isDragging) {
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    if (Math.hypot(dx, dy) > 5) dragMoved = true;
    camera.x -= dx;
    camera.y -= dy;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    clampCamera();
  }
});

window.addEventListener('pointerup', (e) => {
  updatePointer(e);
  if (!dragMoved) {
    handleWorldTap(pointer.worldX, pointer.worldY);
  }
  isDragging = false;
});

function updatePointer(e) {
  pointer.screenX = e.clientX;
  pointer.screenY = e.clientY;
  pointer.worldX = e.clientX + camera.x;
  pointer.worldY = e.clientY + camera.y;
}

function clampCamera() {
  const maxCamX = Math.max(WORLD_BOUNDS.minX, WORLD_BOUNDS.maxX - width);
  const maxCamY = Math.max(WORLD_BOUNDS.minY, WORLD_BOUNDS.maxY - height);
  camera.x = Math.max(WORLD_BOUNDS.minX, Math.min(maxCamX, camera.x));
  camera.y = Math.max(WORLD_BOUNDS.minY, Math.min(maxCamY, camera.y));
}

// ==========================================
// 2. PORTFOLIO DATA & 7 DEPTH FISHES
// ==========================================
let portfolioData = {};

async function fetchPortfolioData() {
  try {
    const res = await fetch('/api/portfolio');
    if (res.ok) {
      portfolioData = await res.json();
    }
  } catch (err) {
    console.error('Could not load portfolio data:', err);
  }
}
fetchPortfolioData();

const FISH_STAGES = [
  { key: 'education', label: 'Education', depthY: 430, baseX: 280, speed: 0.72, size: 1.05, color: '#ff9f43', accent: '#feca57' },
  { key: 'interests', label: 'Interests', depthY: 860, baseX: 560, speed: -0.62, size: 1.02, color: '#ff6b6b', accent: '#ff9ff3' },
  { key: 'skills', label: 'Skills', depthY: 1290, baseX: 250, speed: 0.85, size: 1.12, color: '#1dd1a1', accent: '#48dbfb' },
  { key: 'projects', label: 'Projects', depthY: 1730, baseX: 580, speed: -0.75, size: 1.18, color: '#54a0ff', accent: '#00d2d3' },
  { key: 'achievements', label: 'Achievements', depthY: 2170, baseX: 300, speed: 0.68, size: 1.15, color: '#f368e0', accent: '#ff9ff3' },
  { key: 'digitalFootprints', label: 'Digital Footprints', depthY: 2610, baseX: 540, speed: -0.58, size: 1.12, color: '#a29bfe', accent: '#74b9ff' },
  { key: 'articles', label: 'Articles', depthY: 3040, baseX: 380, speed: 0.52, size: 1.25, color: '#ffeaa7', accent: '#fab1a0' }
];

const fishes = FISH_STAGES.map((stage, idx) => ({
  ...stage,
  x: stage.baseX,
  y: stage.depthY,
  phase: idx * 1.3,
  dir: stage.speed >= 0 ? 1 : -1,
  selectedPulse: 0,
  isOpen: false
}));

// Active visual states for each of the 7 bespoke reveals
const activeReveals = {
  education: { open: false, progress: 0, items: [] },
  interests: { open: false, progress: 0, items: [] },
  skills: { open: false, bubbles: [] },
  projects: { open: false, cards: [] },
  achievements: { open: false, progress: 0, items: [], chestX: 380, chestY: 2290 },
  digitalFootprints: { open: false, orbs: [] },
  articles: { open: false, bottles: [] }
};

async function onFishClick(fish) {
  fish.selectedPulse = 1.0;
  // Refresh latest data from API so admin edits reflect immediately
  await fetchPortfolioData();
  const items = portfolioData[fish.key] || [];

  // Toggle closed if already open
  if (fish.isOpen) {
    fish.isOpen = false;
    closeReveal(fish.key);
    return;
  }

  fish.isOpen = true;

  if (fish.key === 'education') {
    // 1. Education: Long timeline thread spat out from fish's mouth
    activeReveals.education = { open: true, progress: 0, items };
  } else if (fish.key === 'interests') {
    // 2. Interests: Sunken stone/parchment tablets on a rocky underwater ledge
    activeReveals.interests = { open: true, progress: 0, items };
  } else if (fish.key === 'skills') {
    // 3. Skills: Pop-up bubbles floating around the fish
    activeReveals.skills = {
      open: true,
      bubbles: items.map((item, i) => ({
        item,
        offsetX: (i - (items.length - 1) / 2) * 145,
        offsetY: -85 - (i % 2) * 55,
        currentScale: 0,
        phase: i * 1.1
      }))
    };
  } else if (fish.key === 'projects') {
    // 4. Projects: Interactive Sonar / Compass cards with clickable live links
    activeReveals.projects = {
      open: true,
      cards: items.map((item, i) => ({
        item,
        worldX: 260 + (i % 2) * 320,
        worldY: fish.depthY + 135 + Math.floor(i / 2) * 190
      }))
    };
    syncDomOverlays();
  } else if (fish.key === 'achievements') {
    // 5. Achievements: Sunken brass treasure chest on a deep rocky shelf bursting with golden medallions
    activeReveals.achievements = {
      open: true,
      progress: 0,
      items,
      chestX: Math.max(240, Math.min(640, fish.x)),
      chestY: fish.depthY + 135
    };
  } else if (fish.key === 'digitalFootprints') {
    // 6. Digital Footprints: Glowing pearl/plankton orbs grouped by category
    activeReveals.digitalFootprints = {
      open: true,
      orbs: items.map((item, i) => ({
        item,
        worldX: 230 + (i % 3) * 185,
        worldY: fish.depthY + 125 + Math.floor(i / 3) * 145,
        phase: i * 0.9
      }))
    };
    syncDomOverlays();
  } else if (fish.key === 'articles') {
    // 7. Articles: Message in a bottle — each article falls in its own corked bottle!
    activeReveals.articles = {
      open: true,
      bottles: items.map((item, i) => ({
        item,
        x: fish.x + (i - (items.length - 1) / 2) * 115,
        y: fish.y + 10,
        targetY: fish.depthY + 165 + (i % 2) * 28,
        vy: 0,
        angle: (Math.random() - 0.5) * 0.5,
        settled: false,
        phase: i * 1.4
      }))
    };
  }
}

function closeReveal(key) {
  if (key === 'education') activeReveals.education.open = false;
  if (key === 'interests') activeReveals.interests.open = false;
  if (key === 'skills') activeReveals.skills.open = false;
  if (key === 'projects') {
    activeReveals.projects.open = false;
    syncDomOverlays();
  }
  if (key === 'achievements') activeReveals.achievements.open = false;
  if (key === 'digitalFootprints') {
    activeReveals.digitalFootprints.open = false;
    syncDomOverlays();
  }
  if (key === 'articles') activeReveals.articles.open = false;
}

// Sync HTML overlays for Sonar Project Cards & Glowing Pearl Links
function syncDomOverlays() {
  overlayEl.innerHTML = '';

  if (activeReveals.projects.open) {
    activeReveals.projects.cards.forEach((cardData, idx) => {
      const div = document.createElement('div');
      div.className = 'sonar-card';
      div.dataset.type = 'project';
      div.dataset.idx = idx;
      const { item } = cardData;
      div.innerHTML = `
        <div class="sonar-header">
          <span>SONAR LOCK // 0${idx + 1}</span>
          <span class="sonar-ping"></span>
        </div>
        <h3>${escapeHtml(item.title || 'Project')}</h3>
        <div class="sonar-tech">${escapeHtml(item.techStack || '')}</div>
        <div class="sonar-desc">${escapeHtml(item.description || '')}</div>
        ${item.link ? `<a class="sonar-link" href="${escapeHtml(item.link)}" target="_blank" rel="noopener">Open Signal ↗</a>` : ''}
      `;
      overlayEl.appendChild(div);
    });
  }

  if (activeReveals.digitalFootprints.open) {
    activeReveals.digitalFootprints.orbs.forEach((orbData, idx) => {
      const a = document.createElement('a');
      a.className = 'pearl-orb';
      a.dataset.type = 'pearl';
      a.dataset.idx = idx;
      a.href = orbData.item.url || '#';
      a.target = '_blank';
      a.rel = 'noopener';
      a.innerHTML = `
        <span class="pearl-platform">${escapeHtml(orbData.item.platform || 'Link')}</span>
        <span class="pearl-handle">${escapeHtml(orbData.item.handle || '')}</span>
      `;
      overlayEl.appendChild(a);
    });
  }
}

function updateDomOverlayPositions() {
  const children = overlayEl.children;
  for (let i = 0; i < children.length; i++) {
    const el = children[i];
    const idx = Number(el.dataset.idx);
    if (el.dataset.type === 'project' && activeReveals.projects.cards[idx]) {
      const c = activeReveals.projects.cards[idx];
      el.style.left = `${c.worldX - camera.x}px`;
      el.style.top = `${c.worldY - camera.y}px`;
    } else if (el.dataset.type === 'pearl' && activeReveals.digitalFootprints.orbs[idx]) {
      const o = activeReveals.digitalFootprints.orbs[idx];
      const bobY = Math.sin(waveState.phase * 1.4 + o.phase) * 7;
      el.style.left = `${o.worldX - camera.x}px`;
      el.style.top = `${o.worldY + bobY - camera.y}px`;
    }
  }
}

function openArticleBottle(article) {
  document.getElementById('reader-title').textContent = article.title || 'Untitled Article';
  document.getElementById('reader-date').textContent = article.date ? `Published: ${article.date}` : '';
  document.getElementById('reader-body').innerHTML = article.content || '<p>Empty parchment.</p>';
  articleReaderEl.classList.remove('hidden');
}

// ==========================================
// 3. RANDOM OCEAN WAVES ENGINE
// ==========================================
const waveState = {
  currentAmplitude: 7,
  targetAmplitude: 7,
  nextEventTimer: 3.5,
  phase: 0
};

function updateWaves(dt) {
  waveState.phase += dt * 1.8;
  waveState.nextEventTimer -= dt;

  if (waveState.nextEventTimer <= 0) {
    const roll = Math.random();
    if (roll < 0.45) {
      waveState.targetAmplitude = 6 + Math.random() * 6;
      waveState.nextEventTimer = 3 + Math.random() * 4;
    } else if (roll < 0.8) {
      waveState.targetAmplitude = 18 + Math.random() * 12;
      waveState.nextEventTimer = 2.5 + Math.random() * 3;
    } else {
      waveState.targetAmplitude = 36 + Math.random() * 20;
      waveState.nextEventTimer = 2.2 + Math.random() * 2.5;
    }
  }

  waveState.currentAmplitude += (waveState.targetAmplitude - waveState.currentAmplitude) * dt * 1.4;
}

function getWaterSurfaceY(worldX) {
  if (worldX < -60) return 0;
  const shoreDamp = Math.min(1, Math.max(0, (worldX + 60) / 220));
  const primary = Math.sin(worldX * 0.012 + waveState.phase) * waveState.currentAmplitude;
  const secondary = Math.cos(worldX * 0.027 - waveState.phase * 1.3) * (waveState.currentAmplitude * 0.35);
  return (primary + secondary) * shoreDamp;
}

// ==========================================
// 4. OLD MAN, BOAT, PEN & SHARK COMBAT GAME
// ==========================================
const boat = { x: 420, y: 0, angle: 0 };
const oldMan = {
  posture: 'sitting',
  postureTimer: 5,
  oarAngle: 0.4,
  handX: 0,
  handY: 0,
  legFlex: 0,
  hitCooldown: 0
};

const shark = {
  centerX: 420,
  orbitAngle: 0,
  x: 420,
  y: 145,
  dir: 1,
  state: 'circling',
  attackTimer: 5.5,
  stunTimer: 0,
  irritateFlash: 0
};

function updateOldManAndBoat(dt) {
  oldMan.postureTimer -= dt;
  if (oldMan.postureTimer <= 0) {
    if (oldMan.posture === 'sitting') {
      oldMan.posture = 'standing';
      oldMan.postureTimer = 4 + Math.random() * 3;
    } else if (oldMan.posture === 'standing') {
      oldMan.posture = 'rowing';
      oldMan.postureTimer = 5 + Math.random() * 3;
    } else {
      oldMan.posture = 'sitting';
      oldMan.postureTimer = 5 + Math.random() * 4;
    }
  }

  const leftY = getWaterSurfaceY(boat.x - 55);
  const rightY = getWaterSurfaceY(boat.x + 55);
  boat.y = (leftY + rightY) / 2 - 6;
  boat.angle = Math.atan2(rightY - leftY, 110);

  if (oldMan.posture === 'rowing') {
    boat.x += Math.sin(waveState.phase * 0.8) * 18 * dt;
  }
  boat.x = Math.max(220, Math.min(720, boat.x));

  const dx = pointer.worldX - boat.x;
  const dy = pointer.worldY - (boat.y - 25);
  const targetOarAngle = Math.atan2(dy, dx);
  oldMan.oarAngle += (targetOarAngle - oldMan.oarAngle) * Math.min(1, dt * 12);

  const reach = Math.min(1, Math.hypot(dx, dy) / 220);
  oldMan.handX = Math.cos(oldMan.oarAngle) * (16 + reach * 12);
  oldMan.handY = Math.sin(oldMan.oarAngle) * (12 + reach * 10);
  oldMan.legFlex = Math.sin(oldMan.oarAngle * 2) * 6 + reach * 5;

  if (oldMan.hitCooldown > 0) oldMan.hitCooldown -= dt;
}

function updateShark(dt) {
  shark.centerX = boat.x;

  if (shark.stunTimer > 0) {
    shark.stunTimer -= dt;
    shark.x += shark.dir * 190 * dt;
    shark.y += 45 * dt;
    if (shark.stunTimer <= 0) {
      shark.state = 'circling';
      shark.attackTimer = 4 + Math.random() * 4;
    }
    return;
  }

  if (shark.state === 'circling') {
    shark.orbitAngle += dt * 1.15;
    const targetX = shark.centerX + Math.cos(shark.orbitAngle) * 165;
    const targetY = 135 + Math.sin(shark.orbitAngle * 2) * 28;
    shark.dir = targetX >= shark.x ? 1 : -1;
    shark.x += (targetX - shark.x) * dt * 3;
    shark.y += (targetY - shark.y) * dt * 3;

    shark.attackTimer -= dt;
    if (shark.attackTimer <= 0) shark.state = 'attacking';
  } else if (shark.state === 'attacking') {
    const targetX = boat.x + Math.sin(waveState.phase * 3) * 25;
    const targetY = boat.y + 18;
    const dx = targetX - shark.x;
    const dy = targetY - shark.y;
    const dist = Math.hypot(dx, dy);
    shark.dir = dx >= 0 ? 1 : -1;

    if (dist > 12) {
      shark.x += (dx / dist) * 145 * dt;
      shark.y += (dy / dist) * 145 * dt;
    } else {
      boat.angle += Math.sin(performance.now() * 0.04) * 0.06;
      shark.irritateFlash = 0.4;
      if (Math.random() < dt * 0.8) {
        shark.state = 'circling';
        shark.attackTimer = 4 + Math.random() * 3;
      }
    }
  }

  if (shark.irritateFlash > 0) shark.irritateFlash -= dt;

  const oarLength = 95;
  const oarTipX = boat.x + oldMan.handX + Math.cos(oldMan.oarAngle) * oarLength;
  const oarTipY = boat.y - 22 + oldMan.handY + Math.sin(oldMan.oarAngle) * oarLength;

  if (Math.hypot(oarTipX - shark.x, oarTipY - shark.y) < 48 && oldMan.hitCooldown <= 0) {
    shark.stunTimer = 1.6;
    shark.state = 'stunned';
    shark.dir = shark.x >= boat.x ? 1 : -1;
    oldMan.hitCooldown = 0.7;
    spawnSplash(shark.x, shark.y, 12);
  }
}

// ==========================================
// 5. SEASHORE BOY & BLUE KITE
// ==========================================
const kiteScene = {
  boyX: -480,
  boyY: -22,
  kiteBaseX: -240,
  kiteBaseY: -410,
  kiteX: -240,
  kiteY: -410,
  wobbleAmp: 4,
  wobblePhase: 0
};

function updateKite(dt) {
  kiteScene.wobblePhase += dt * 11;
  kiteScene.wobbleAmp += (4 - kiteScene.wobbleAmp) * dt * 2.2;
  kiteScene.kiteX = kiteScene.kiteBaseX + Math.sin(kiteScene.wobblePhase * 0.4) * (10 + kiteScene.wobbleAmp * 0.6);
  kiteScene.kiteY = kiteScene.kiteBaseY + Math.cos(kiteScene.wobblePhase * 0.3) * (6 + kiteScene.wobbleAmp * 0.4);
}

// ==========================================
// 6. AMBIENT UNDERWATER PARTICLES
// ==========================================
const bubbles = Array.from({ length: 60 }, () => ({
  x: -200 + Math.random() * 1500,
  y: 80 + Math.random() * 3200,
  r: 1.5 + Math.random() * 4,
  speed: 14 + Math.random() * 26,
  wobble: Math.random() * Math.PI * 2
}));

const marineSnow = Array.from({ length: 95 }, () => ({
  x: -200 + Math.random() * 1600,
  y: 120 + Math.random() * 3200,
  size: 1 + Math.random() * 2.2,
  alpha: 0.15 + Math.random() * 0.35,
  drift: Math.random() * Math.PI * 2
}));

const splashes = [];
function spawnSplash(x, y, count) {
  for (let i = 0; i < count; i++) {
    splashes.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 140,
      vy: -40 - Math.random() * 90,
      life: 0.6 + Math.random() * 0.3
    });
  }
}

// ==========================================
// 7. CLICK / TAP HIT DETECTION
// ==========================================
function handleWorldTap(wx, wy) {
  // 1. Check Message-in-a-Bottle clicks first
  if (activeReveals.articles.open) {
    for (const bottle of activeReveals.articles.bottles) {
      if (Math.hypot(wx - bottle.x, wy - bottle.y) < 34) {
        openArticleBottle(bottle.item);
        return;
      }
    }
  }

  // 2. Check Kite or Kite Thread
  const handX = kiteScene.boyX + 12;
  const handY = kiteScene.boyY - 34;
  if (
    Math.hypot(wx - kiteScene.kiteX, wy - kiteScene.kiteY) < 45 ||
    pointToSegmentDistance(wx, wy, handX, handY, kiteScene.kiteX, kiteScene.kiteY) < 24
  ) {
    kiteScene.wobbleAmp = 34;
    return;
  }

  // 3. Check the 7 Underwater Fishes
  for (const fish of fishes) {
    const hitW = 78 * fish.size;
    const hitH = 40 * fish.size;
    if (Math.abs(wx - fish.x) <= hitW && Math.abs(wy - fish.y) <= hitH) {
      onFishClick(fish);
      return;
    }
  }
}

function pointToSegmentDistance(px, py, x1, y1, x2, y2) {
  const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}

// ==========================================
// 8. RENDERING PIPELINE
// ==========================================
function render(dt) {
  ctx.clearRect(0, 0, width, height);

  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  drawSkyAndSun();
  drawOceanBodyAndDepthGradient();
  drawUnderwaterLightRays();
  drawSeashoreAndBoyWithKite();
  drawSeafloorDetails();
  drawUnderwaterParticles(dt);

  // Render active bespoke reveals behind/around fishes
  drawEducationTimelineReveal(dt);
  drawInterestsTabletsReveal(dt);
  drawSkillsBubblesReveal(dt);
  drawSonarBeamsReveal(dt);
  drawAchievementsChestReveal(dt);
  drawFootprintConstellationReveal(dt);
  drawArticlesBottlesReveal(dt);

  drawFishes(dt);
  drawShark();
  drawOldManAndBoat();
  drawWaterSurfaceLine();
  drawSplashes(dt);

  ctx.restore();
  updateDomOverlayPositions();
}

// --- BESPOKE REVEAL #1: EDUCATION TIMELINE THREAD FROM FISH MOUTH ---
function drawEducationTimelineReveal(dt) {
  const rev = activeReveals.education;
  if (!rev.open) return;
  rev.progress = Math.min(1, rev.progress + dt * 1.4);

  const eduFish = fishes[0];
  // Fish mouth position
  const mouthX = eduFish.x + eduFish.dir * 52 * eduFish.size;
  const mouthY = eduFish.y + 2;

  const items = rev.items.length
    ? rev.items
    : [{ institution: 'No Education Entries Yet', degree: 'Add in /admin', year: '', details: '' }];

  const totalSpan = Math.max(240, items.length * 165) * rev.progress;
  const dir = eduFish.x > 480 ? -1 : 1;

  // Glowing golden-white silk thread unspooling from fish mouth
  ctx.save();
  ctx.strokeStyle = '#ffeaa7';
  ctx.lineWidth = 2.5;
  ctx.shadowColor = '#feca57';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(mouthX, mouthY);
  const steps = 32;
  for (let s = 1; s <= steps; s++) {
    const t = s / steps;
    const tx = mouthX + dir * totalSpan * t;
    const ty = mouthY + 38 * Math.sin(t * Math.PI * 0.65) + Math.sin(waveState.phase * 1.5 + t * 6) * 5;
    ctx.lineTo(tx, ty);
  }
  ctx.stroke();
  ctx.restore();

  // Timeline knots & cards hanging along the thread in chronological order
  items.forEach((item, i) => {
    const ratio = (i + 0.65) / (items.length + 0.3);
    if (rev.progress < ratio * 0.8) return;

    const kx = mouthX + dir * totalSpan * ratio;
    const ky = mouthY + 38 * Math.sin(ratio * Math.PI * 0.65) + Math.sin(waveState.phase * 1.5 + ratio * 6) * 5;

    // Thread knot
    ctx.fillStyle = '#feca57';
    ctx.beginPath();
    ctx.arc(kx, ky, 6, 0, Math.PI * 2);
    ctx.fill();

    // Hanging tag card
    const cardW = 148;
    const cardH = 88;
    const cx = kx - cardW / 2;
    const cy = ky + 14;

    ctx.fillStyle = 'rgba(7, 36, 58, 0.88)';
    ctx.strokeStyle = 'rgba(254, 202, 87, 0.75)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(cx, cy, cardW, cardH, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#feca57';
    ctx.font = '700 11px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(truncateText(item.year || `Stage ${i + 1}`, 22), cx + 10, cy + 18);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 12px "Segoe UI", sans-serif';
    ctx.fillText(truncateText(item.institution || '', 20), cx + 10, cy + 36);

    ctx.fillStyle = '#bae6fd';
    ctx.font = '11px "Segoe UI", sans-serif';
    ctx.fillText(truncateText(item.degree || '', 22), cx + 10, cy + 53);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px "Segoe UI", sans-serif';
    ctx.fillText(truncateText(item.details || '', 24), cx + 10, cy + 70);
  });
}

// --- BESPOKE REVEAL #2: INTERESTS SUNKEN PARCHMENT / STONE TABLETS ON ROCKY LEDGE ---
function drawInterestsTabletsReveal(dt) {
  const rev = activeReveals.interests;
  if (!rev.open) return;
  rev.progress = Math.min(1, rev.progress + dt * 1.8);

  const intFish = fishes[1];
  const ledgeY = intFish.depthY + 145;
  const startX = 180;

  // Underwater rocky ledge
  ctx.fillStyle = '#1b2838';
  ctx.beginPath();
  ctx.moveTo(startX - 40, ledgeY + 25);
  ctx.quadraticCurveTo(startX + 260, ledgeY - 8, startX + 640, ledgeY + 28);
  ctx.lineTo(startX + 620, ledgeY + 58);
  ctx.lineTo(startX - 20, ledgeY + 55);
  ctx.closePath();
  ctx.fill();

  const items = rev.items.length
    ? rev.items
    : [{ title: 'No Interests Yet', description: 'Add interests in /admin' }];

  items.forEach((item, i) => {
    const tx = startX + 30 + i * 185;
    const rise = (1 - rev.progress) * 40;
    const ty = ledgeY - 92 + rise;

    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate((i % 2 === 0 ? -1 : 1) * 0.04);

    // Carved stone/parchment tablet
    ctx.fillStyle = '#d8c39e';
    ctx.strokeStyle = '#7f6a49';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(0, 0, 165, 102, [18, 18, 6, 6]);
    ctx.fill();
    ctx.stroke();

    // Inner carved border
    ctx.strokeStyle = 'rgba(92, 71, 40, 0.45)';
    ctx.lineWidth = 1;
    ctx.strokeRect(7, 7, 151, 88);

    ctx.fillStyle = '#3b2814';
    ctx.font = '700 13px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText(truncateText(item.title || '', 20), 14, 28);

    ctx.fillStyle = '#4a3520';
    ctx.font = '11px Georgia, serif';
    wrapCanvasText(ctx, item.description || '', 14, 48, 138, 15, 3);
    ctx.restore();
  });
}

// --- BESPOKE REVEAL #3: SKILLS POP-UP BUBBLES ---
function drawSkillsBubblesReveal(dt) {
  const rev = activeReveals.skills;
  if (!rev.open) return;

  const skillFish = fishes[2];
  const list = rev.bubbles.length
    ? rev.bubbles
    : [{ item: { name: 'Add Skills', category: 'Admin', level: '/admin' }, offsetX: 0, offsetY: -95, currentScale: 1, phase: 0 }];

  list.forEach((b) => {
    b.currentScale += (1 - b.currentScale) * dt * 6;
    b.phase += dt * 2.2;

    const bx = skillFish.x + b.offsetX + Math.sin(b.phase) * 8;
    const by = skillFish.y + b.offsetY + Math.cos(b.phase * 1.2) * 7;
    const r = 56 * b.currentScale;

    ctx.save();
    ctx.translate(bx, by);

    // Translucent iridescent bubble
    const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    grad.addColorStop(0.7, 'rgba(72, 219, 251, 0.22)');
    grad.addColorStop(1, 'rgba(29, 209, 161, 0.65)');

    ctx.fillStyle = grad;
    ctx.strokeStyle = 'rgba(200, 250, 255, 0.85)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Specular bubble highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.36, -r * 0.36, r * 0.2, r * 0.1, -0.6, 0, Math.PI * 2);
    ctx.fill();

    // Skill text inside bubble
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 12px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(truncateText(b.item.name || '', 15), 0, -6);

    ctx.fillStyle = '#a7f3d0';
    ctx.font = '600 10px "Segoe UI", sans-serif';
    ctx.fillText(truncateText(b.item.level || '', 16), 0, 10);

    ctx.fillStyle = '#bae6fd';
    ctx.font = '9px "Segoe UI", sans-serif';
    ctx.fillText(truncateText(b.item.category || '', 16), 0, 24);

    ctx.restore();
  });
}

// --- BESPOKE REVEAL #4: SONAR SWEEP RINGS BEHIND PROJECT CARDS ---
function drawSonarBeamsReveal(dt) {
  const rev = activeReveals.projects;
  if (!rev.open) return;

  const projFish = fishes[3];
  const pulseRadius = ((performance.now() * 0.08) % 180) + 20;

  ctx.save();
  ctx.strokeStyle = `rgba(0, 245, 212, ${Math.max(0, 0.45 - pulseRadius / 420)})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(projFish.x, projFish.y, pulseRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

// --- BESPOKE REVEAL #5: ACHIEVEMENTS SUNKEN TREASURE CHEST & GOLDEN MEDALLIONS ---
function drawAchievementsChestReveal(dt) {
  const rev = activeReveals.achievements;
  if (!rev.open) return;
  rev.progress = Math.min(1, rev.progress + dt * 1.6);

  const cx = rev.chestX;
  const cy = rev.chestY;

  // Rocky outcrop under the chest
  ctx.fillStyle = '#102033';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 24, 95, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Golden light beams radiating from open chest
  const beamGrad = ctx.createLinearGradient(cx, cy - 10, cx, cy - 160);
  beamGrad.addColorStop(0, 'rgba(255, 215, 0, 0.45)');
  beamGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
  ctx.fillStyle = beamGrad;
  ctx.beginPath();
  ctx.moveTo(cx - 26, cy - 8);
  ctx.lineTo(cx + 26, cy - 8);
  ctx.lineTo(cx + 140, cy - 160);
  ctx.lineTo(cx - 140, cy - 160);
  ctx.closePath();
  ctx.fill();

  // Treasure Chest Base
  ctx.fillStyle = '#6f3e1d';
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(cx - 34, cy - 12, 68, 34, 5);
  ctx.fill();
  ctx.stroke();

  // Open Chest Lid tilted back
  ctx.save();
  ctx.translate(cx - 34, cy - 12);
  ctx.rotate(-0.48 * rev.progress);
  ctx.fillStyle = '#854d27';
  ctx.beginPath();
  ctx.roundRect(0, -16, 68, 16, [8, 8, 0, 0]);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Floating Golden Achievement Medallions
  const items = rev.items.length
    ? rev.items
    : [{ title: 'No Achievements Yet', issuer: 'Add in /admin', date: '' }];

  items.forEach((item, i) => {
    const spreadX = (i - (items.length - 1) / 2) * 185;
    const mx = cx + spreadX * rev.progress;
    const my = cy - 95 - (i % 2) * 32 + Math.sin(waveState.phase * 1.5 + i) * 5;

    // Gold shimmer border card
    ctx.fillStyle = 'rgba(26, 20, 8, 0.9)';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(mx - 82, my - 34, 164, 68, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fcd34d';
    ctx.font = '700 12px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`★ ${truncateText(item.title || '', 19)}`, mx, my - 10);

    ctx.fillStyle = '#fde68a';
    ctx.font = '11px "Segoe UI", sans-serif';
    ctx.fillText(truncateText(`${item.issuer || ''} ${item.date ? `(${item.date})` : ''}`, 24), mx, my + 8);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '10px "Segoe UI", sans-serif';
    ctx.fillText(truncateText(item.description || '', 25), mx, my + 23);
  });
}

// --- BESPOKE REVEAL #6: DIGITAL FOOTPRINTS CONSTELLATION FILAMENTS ---
function drawFootprintConstellationReveal(dt) {
  const rev = activeReveals.digitalFootprints;
  if (!rev.open || rev.orbs.length < 2) return;

  ctx.save();
  ctx.strokeStyle = 'rgba(162, 155, 254, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  rev.orbs.forEach((o, i) => {
    const bobY = Math.sin(waveState.phase * 1.4 + o.phase) * 7;
    if (i === 0) ctx.moveTo(o.worldX, o.worldY + bobY);
    else ctx.lineTo(o.worldX, o.worldY + bobY);
  });
  ctx.stroke();
  ctx.restore();
}

// --- BESPOKE REVEAL #7: MESSAGE IN A BOTTLE FALLING IN THE ABYSS ---
function drawArticlesBottlesReveal(dt) {
  const rev = activeReveals.articles;
  if (!rev.open) return;

  rev.bottles.forEach((b) => {
    if (!b.settled) {
      b.vy += 240 * dt;
      b.y += b.vy * dt;
      b.angle += Math.sin(performance.now() * 0.008 + b.phase) * 0.03;
      if (b.y >= b.targetY) {
        b.y = b.targetY;
        b.settled = true;
      }
    } else {
      b.y = b.targetY + Math.sin(waveState.phase * 1.3 + b.phase) * 6;
    }

    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.angle + Math.sin(waveState.phase + b.phase) * 0.08);

    // Glass Bottle Glow
    ctx.shadowColor = '#74b9ff';
    ctx.shadowBlur = 14;

    // Bottle Body
    ctx.fillStyle = 'rgba(129, 236, 236, 0.34)';
    ctx.strokeStyle = '#81ecec';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(-14, -18, 28, 44, 8);
    ctx.fill();
    ctx.stroke();

    // Bottle Neck
    ctx.fillRect(-6, -30, 12, 12);
    ctx.strokeRect(-6, -30, 12, 12);

    // Cork Stopper
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#d4a373';
    ctx.fillRect(-5, -35, 10, 6);

    // Rolled Parchment Scroll Visible Inside Bottle
    ctx.fillStyle = '#f9f1dc';
    ctx.save();
    ctx.rotate(0.22);
    ctx.fillRect(-6, -10, 12, 28);
    ctx.strokeStyle = '#b08968';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-6, 4);
    ctx.lineTo(6, 4);
    ctx.stroke();
    ctx.restore();

    // Floating Label Tag under Bottle
    ctx.rotate(-(b.angle + Math.sin(waveState.phase + b.phase) * 0.08));
    ctx.fillStyle = '#ffeaa7';
    ctx.font = '700 11px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(truncateText(b.item.title || 'Article', 18), 0, 42);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px "Segoe UI", sans-serif';
    ctx.fillText('Tap bottle to uncork', 0, 55);

    ctx.restore();
  });
}

// ==========================================
// 9. EXISTING WORLD RENDERERS
// ==========================================
function drawSkyAndSun() {
  const skyGrad = ctx.createLinearGradient(0, -450, 0, 20);
  skyGrad.addColorStop(0, '#4fa3e3');
  skyGrad.addColorStop(0.65, '#8fd3f4');
  skyGrad.addColorStop(1, '#d4f1f9');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(WORLD_BOUNDS.minX - 200, -500, 3200, 560);

  ctx.fillStyle = 'rgba(255, 244, 180, 0.85)';
  ctx.beginPath();
  ctx.arc(820, -190, 52, 0, Math.PI * 2);
  ctx.fill();
}

function drawOceanBodyAndDepthGradient() {
  const seaGrad = ctx.createLinearGradient(0, 0, 0, WORLD_BOUNDS.maxY);
  seaGrad.addColorStop(0.0, '#18a4c8');
  seaGrad.addColorStop(0.15, '#0d7ea8');
  seaGrad.addColorStop(0.35, '#095682');
  seaGrad.addColorStop(0.58, '#063759');
  seaGrad.addColorStop(0.80, '#042038');
  seaGrad.addColorStop(1.0, '#020e1c');

  ctx.fillStyle = seaGrad;
  ctx.beginPath();
  ctx.moveTo(-80, 0);
  for (let x = -80; x <= WORLD_BOUNDS.maxX + 200; x += 20) {
    ctx.lineTo(x, getWaterSurfaceY(x));
  }
  ctx.lineTo(WORLD_BOUNDS.maxX + 200, WORLD_BOUNDS.maxY + 200);
  ctx.lineTo(-80, WORLD_BOUNDS.maxY + 200);
  ctx.closePath();
  ctx.fill();
}

function drawUnderwaterLightRays() {
  ctx.save();
  for (let i = 0; i < 6; i++) {
    const rayX = 120 + i * 210 + Math.sin(waveState.phase * 0.4 + i) * 25;
    const rayGrad = ctx.createLinearGradient(rayX, 0, rayX + 90, 950);
    rayGrad.addColorStop(0, 'rgba(180, 245, 255, 0.16)');
    rayGrad.addColorStop(1, 'rgba(180, 245, 255, 0)');
    ctx.fillStyle = rayGrad;
    ctx.beginPath();
    ctx.moveTo(rayX - 25, 0);
    ctx.lineTo(rayX + 35, 0);
    ctx.lineTo(rayX + 160, 950);
    ctx.lineTo(rayX - 60, 950);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawWaterSurfaceLine() {
  ctx.strokeStyle = 'rgba(235, 252, 255, 0.85)';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  for (let x = -60; x <= WORLD_BOUNDS.maxX + 200; x += 14) {
    const y = getWaterSurfaceY(x);
    if (x === -60) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawSeashoreAndBoyWithKite() {
  const sandGrad = ctx.createLinearGradient(-1150, -60, 120, 3400);
  sandGrad.addColorStop(0, '#f4d58d');
  sandGrad.addColorStop(0.04, '#e0b96b');
  sandGrad.addColorStop(0.25, '#8c7449');
  sandGrad.addColorStop(1, '#181c24');

  ctx.fillStyle = sandGrad;
  ctx.beginPath();
  ctx.moveTo(WORLD_BOUNDS.minX - 100, -45);
  ctx.lineTo(-360, -25);
  ctx.quadraticCurveTo(-120, -10, 40, 180);
  ctx.lineTo(140, 3400);
  ctx.lineTo(WORLD_BOUNDS.minX - 100, 3400);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.beginPath();
  ctx.ellipse(-75 + Math.sin(waveState.phase) * 14, -2, 42, 6, 0.12, 0, Math.PI * 2);
  ctx.fill();

  const bx = kiteScene.boyX;
  const by = kiteScene.boyY;

  ctx.save();
  ctx.translate(bx, by);

  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-4, -22);
  ctx.lineTo(-8, 0);
  ctx.moveTo(4, -22);
  ctx.lineTo(9, 0);
  ctx.stroke();

  ctx.fillStyle = '#e63946';
  ctx.beginPath();
  ctx.roundRect(-9, -44, 18, 24, 5);
  ctx.fill();

  ctx.fillStyle = '#d4a373';
  ctx.beginPath();
  ctx.arc(0, -52, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1b1b1b';
  ctx.beginPath();
  ctx.arc(-1, -54, 8.2, Math.PI, Math.PI * 2.1);
  ctx.fill();

  ctx.strokeStyle = '#d4a373';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(4, -39);
  ctx.lineTo(14, -34);
  ctx.moveTo(-4, -38);
  ctx.lineTo(11, -32);
  ctx.stroke();

  ctx.fillStyle = '#8d5524';
  ctx.fillRect(10, -37, 6, 8);
  ctx.restore();

  const startX = bx + 13;
  const startY = by - 34;
  const endX = kiteScene.kiteX;
  const endY = kiteScene.kiteY;

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  const segments = 24;
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const baseX = startX + (endX - startX) * t;
    const baseY = startY + (endY - startY) * t;
    const envelope = Math.sin(t * Math.PI);
    const offset = Math.sin(t * 10 - kiteScene.wobblePhase) * kiteScene.wobbleAmp * envelope;
    ctx.lineTo(baseX - offset * 0.7, baseY + offset * 0.7);
  }
  ctx.stroke();

  ctx.save();
  ctx.translate(endX, endY);
  const kiteTilt = 0.38 + Math.sin(kiteScene.wobblePhase * 0.5) * (kiteScene.wobbleAmp * 0.012);
  ctx.rotate(kiteTilt);

  ctx.fillStyle = '#0096c7';
  ctx.beginPath();
  ctx.moveTo(0, -26);
  ctx.lineTo(20, 0);
  ctx.lineTo(0, 28);
  ctx.lineTo(-20, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#48cae4';
  ctx.beginPath();
  ctx.moveTo(0, -26);
  ctx.lineTo(20, 0);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#caf0f8';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(0, -26);
  ctx.lineTo(0, 28);
  ctx.moveTo(-20, 0);
  ctx.lineTo(20, 0);
  ctx.stroke();

  ctx.strokeStyle = '#00b4d8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, 28);
  for (let t = 1; t <= 12; t++) {
    ctx.lineTo(Math.sin(kiteScene.wobblePhase + t * 0.7) * (4 + kiteScene.wobbleAmp * 0.25), 28 + t * 5);
  }
  ctx.stroke();
  ctx.restore();
}

function drawOldManAndBoat() {
  ctx.save();
  ctx.translate(boat.x, boat.y);
  ctx.rotate(boat.angle);

  ctx.fillStyle = '#5c3a21';
  ctx.beginPath();
  ctx.ellipse(0, -4, 62, 10, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  if (oldMan.posture === 'rowing') {
    drawFountainPen(-32, -7, 0.15);
  }

  ctx.save();
  const isStanding = oldMan.posture === 'standing';
  const hipY = isStanding ? -28 : -11;
  const shoulderY = isStanding ? -54 : -36;

  ctx.strokeStyle = '#3d405b';
  ctx.lineWidth = 5.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (isStanding) {
    ctx.moveTo(-5, hipY);
    ctx.lineTo(-10 - oldMan.legFlex * 0.4, -4);
    ctx.moveTo(5, hipY);
    ctx.lineTo(10 + oldMan.legFlex * 0.4, -4);
  } else {
    ctx.moveTo(-4, hipY);
    ctx.lineTo(12, hipY - 4 - oldMan.legFlex * 0.3);
    ctx.lineTo(16, -3);
  }
  ctx.stroke();

  ctx.fillStyle = '#e07a5f';
  ctx.beginPath();
  ctx.roundRect(-10, shoulderY, 20, hipY - shoulderY + 3, 5);
  ctx.fill();

  const headY = shoulderY - 10;
  ctx.fillStyle = '#d4a373';
  ctx.beginPath();
  ctx.arc(0, headY, 8.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f1faee';
  ctx.beginPath();
  ctx.arc(2, headY + 3, 7.5, 0, Math.PI);
  ctx.fill();

  ctx.fillStyle = '#e9c46a';
  ctx.beginPath();
  ctx.ellipse(0, headY - 6, 16, 4, -0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, headY - 7, 8, Math.PI, Math.PI * 2);
  ctx.fill();

  const handPosX = oldMan.handX;
  const handPosY = shoulderY + 8 + oldMan.handY * 0.6;

  ctx.save();
  ctx.translate(handPosX, handPosY);
  ctx.rotate(oldMan.oarAngle);

  ctx.strokeStyle = '#deb887';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-22, 0);
  ctx.lineTo(88, 0);
  ctx.stroke();

  ctx.fillStyle = '#c68b59';
  ctx.beginPath();
  ctx.ellipse(86, 0, 16, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = '#d4a373';
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(-6, shoulderY + 5);
  ctx.lineTo(handPosX, handPosY);
  ctx.moveTo(6, shoulderY + 5);
  ctx.lineTo(handPosX + 6, handPosY + 2);
  ctx.stroke();

  if (oldMan.posture !== 'rowing') {
    drawFountainPen(handPosX - 6, handPosY - 8, -0.75);
  }

  ctx.restore();

  const hullGrad = ctx.createLinearGradient(0, -10, 0, 20);
  hullGrad.addColorStop(0, '#9c6644');
  hullGrad.addColorStop(1, '#582f0e');
  ctx.fillStyle = hullGrad;

  ctx.beginPath();
  ctx.moveTo(-68, -6);
  ctx.lineTo(68, -6);
  ctx.quadraticCurveTo(54, 18, 0, 18);
  ctx.quadraticCurveTo(-54, 18, -68, -6);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#ddb892';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-66, -4);
  ctx.lineTo(66, -4);
  ctx.stroke();

  ctx.restore();
}

function drawFountainPen(x, y, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = '#1d3557';
  ctx.fillRect(-10, -2, 16, 4);
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.moveTo(6, -2);
  ctx.lineTo(13, 0);
  ctx.lineTo(6, 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawShark() {
  ctx.save();
  ctx.translate(shark.x, shark.y);
  ctx.scale(shark.dir, 1);

  if (shark.stunTimer > 0) {
    ctx.rotate(Math.sin(performance.now() * 0.03) * 0.35);
  }

  const tailWag = Math.sin(performance.now() * 0.012) * 8;
  ctx.fillStyle = shark.irritateFlash > 0 ? '#ef476f' : '#4a5759';
  ctx.beginPath();
  ctx.moveTo(46, 0);
  ctx.quadraticCurveTo(15, -18, -32, -8);
  ctx.lineTo(-54, -20 + tailWag);
  ctx.lineTo(-44, 0);
  ctx.lineTo(-54, 18 + tailWag);
  ctx.lineTo(-32, 8);
  ctx.quadraticCurveTo(15, 16, 46, 0);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-4, -12);
  ctx.lineTo(-16, -32);
  ctx.lineTo(-22, -10);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#ced4da';
  ctx.beginPath();
  ctx.ellipse(8, 5, 28, 6, 0, 0, Math.PI);
  ctx.fill();

  ctx.fillStyle = '#ffbe0b';
  ctx.beginPath();
  ctx.arc(28, -3, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#2b2d42';
  ctx.lineWidth = 1.5;
  for (let g = 0; g < 3; g++) {
    ctx.beginPath();
    ctx.moveTo(10 - g * 4, -4);
    ctx.lineTo(9 - g * 4, 4);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSeafloorDetails() {
  const floorY = WORLD_BOUNDS.maxY;
  ctx.fillStyle = '#010811';
  ctx.fillRect(-100, floorY - 30, 1750, 250);

  for (let i = 0; i < 18; i++) {
    const kx = 120 + i * 75;
    const kh = 70 + (i % 4) * 35;
    ctx.strokeStyle = 'rgba(16, 95, 85, 0.45)';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(kx, floorY - 20);
    for (let s = 1; s <= 6; s++) {
      const sway = Math.sin(waveState.phase * 0.7 + i + s * 0.6) * 10;
      ctx.lineTo(kx + sway, floorY - 20 - (kh / 6) * s);
    }
    ctx.stroke();
  }
}

function drawUnderwaterParticles(dt) {
  ctx.strokeStyle = 'rgba(200, 245, 255, 0.35)';
  ctx.lineWidth = 1;
  for (const b of bubbles) {
    b.y -= b.speed * dt;
    b.wobble += dt * 2;
    if (b.y < 20) b.y = WORLD_BOUNDS.maxY - 40;
    ctx.beginPath();
    ctx.arc(b.x + Math.sin(b.wobble) * 5, b.y, b.r, 0, Math.PI * 2);
    ctx.stroke();
  }

  for (const p of marineSnow) {
    p.drift += dt * 0.6;
    ctx.fillStyle = `rgba(210, 240, 255, ${p.alpha})`;
    ctx.beginPath();
    ctx.arc(p.x + Math.cos(p.drift) * 8, p.y + Math.sin(p.drift) * 4, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFishes(dt) {
  for (const fish of fishes) {
    fish.phase += dt * 2.4;
    // Slow down swimming slightly while open so user can read comfortably
    const swimMult = fish.isOpen ? 0.25 : 1;
    fish.x += fish.speed * 42 * swimMult * dt;
    fish.y = fish.depthY + Math.sin(fish.phase * 0.7) * 10;

    if (fish.x > 860) {
      fish.x = 860;
      fish.speed = -Math.abs(fish.speed);
      fish.dir = -1;
    } else if (fish.x < 180) {
      fish.x = 180;
      fish.speed = Math.abs(fish.speed);
      fish.dir = 1;
    }

    if (fish.selectedPulse > 0) fish.selectedPulse = Math.max(0, fish.selectedPulse - dt * 2);

    const isHovered =
      Math.abs(pointer.worldX - fish.x) <= 78 * fish.size &&
      Math.abs(pointer.worldY - fish.y) <= 40 * fish.size;

    ctx.save();
    ctx.translate(fish.x, fish.y);
    const scale = fish.size * (isHovered || fish.isOpen ? 1.08 : 1) + fish.selectedPulse * 0.12;
    ctx.scale(scale, scale);

    if (fish.depthY > 1100 || fish.isOpen) {
      ctx.shadowColor = fish.accent;
      ctx.shadowBlur = isHovered || fish.isOpen ? 24 : 12;
    }

    ctx.save();
    ctx.scale(fish.dir, 1);
    const tailSwing = Math.sin(fish.phase * 2.2) * 7;

    ctx.fillStyle = fish.color;
    ctx.beginPath();
    ctx.moveTo(54, 0);
    ctx.quadraticCurveTo(22, -28, -34, -14);
    ctx.lineTo(-62, -26 + tailSwing);
    ctx.lineTo(-50, 0);
    ctx.lineTo(-62, 26 + tailSwing);
    ctx.lineTo(-34, 14);
    ctx.quadraticCurveTo(22, 28, 54, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = fish.accent;
    ctx.beginPath();
    ctx.moveTo(4, -20);
    ctx.lineTo(-14, -34);
    ctx.lineTo(-20, -16);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(34, -5, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(35.5, -5, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.shadowBlur = 0;
    ctx.font = '700 14px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#071324';
    ctx.fillText(fish.label, 0, 1);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(fish.label, -1, 0);

    ctx.restore();
  }
}

function drawSplashes(dt) {
  for (let i = splashes.length - 1; i >= 0; i--) {
    const s = splashes[i];
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.vy += 260 * dt;
    s.life -= dt;
    if (s.life <= 0) {
      splashes.splice(i, 1);
      continue;
    }
    ctx.fillStyle = `rgba(224, 247, 255, ${s.life})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ==========================================
// 10. TEXT HELPERS & MAIN LOOP
// ==========================================
function truncateText(str, max) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

function wrapCanvasText(context, text, x, y, maxWidth, lineHeight, maxLines) {
  const words = text.split(' ');
  let line = '';
  let lineCount = 0;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    if (context.measureText(testLine).width > maxWidth && n > 0) {
      context.fillText(line.trim(), x, y);
      line = words[n] + ' ';
      y += lineHeight;
      lineCount++;
      if (lineCount >= maxLines - 1) {
        context.fillText(truncateText(line.trim(), 22), x, y);
        return;
      }
    } else {
      line = testLine;
    }
  }
  context.fillText(line.trim(), x, y);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

let lastTime = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  updateWaves(dt);
  updateOldManAndBoat(dt);
  updateShark(dt);
  updateKite(dt);
  render(dt);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);