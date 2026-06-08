// Simple Terraria-like prototype on HTML Canvas
// World of tiles, player physics, mining/placing, and a camera

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Handle resolution and DPR
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Constants
const TILE_SIZE = 16; // px
const WORLD_W = 256; // tiles
const WORLD_H = 128; // tiles
const GRAVITY = 0.6;
const MOVE_SPEED = 2.2;
const JUMP_FORCE = 9.2;
const MAX_FALL = 14;

// Movement tuning
const MAX_SPEED = 3.5;
const ACCEL = 0.25;
const FRICTION = 0.12;
const AIR_DRAG = 0.04;
const COYOTE_TIME = 120; // ms window after leaving ground
const JUMP_BUFFER = 150; // ms window after pressing jump

// Day/Night
const DAY_LENGTH_MS = 120000; // 120s per full cycle
let gameTimeMs = 0;
let timeOfDay = 0; // 0..1
let gameState = 'menu';

// Tiles
const TILES = {
  AIR: 0,
  DIRT: 1,
  GRASS: 2,
  STONE: 3,
  SAND: 4,
};
const TILE_COLOR = {
  [TILES.AIR]: null,
  [TILES.DIRT]: '#7a4b2b',
  [TILES.GRASS]: '#4caf50',
  [TILES.STONE]: '#6d7077',
  [TILES.SAND]: '#d6c394',
};

// Procedural textures for tiles and sprites
function makeTileTexture(baseColor, noiseColor) {
  const c = document.createElement('canvas');
  c.width = TILE_SIZE; c.height = TILE_SIZE;
  const g = c.getContext('2d');
  // base
  g.fillStyle = baseColor; g.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  // ruido
  g.fillStyle = noiseColor;
  for (let i = 0; i < 24; i++) {
    const x = Math.random() * TILE_SIZE;
    const y = Math.random() * TILE_SIZE;
    const r = Math.random() * 2 + 0.5;
    g.globalAlpha = 0.18 + Math.random() * 0.25;
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
  // borde interior
  g.globalAlpha = 0.25; g.strokeStyle = 'rgba(0,0,0,0.35)';
  g.strokeRect(0.5, 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
  // luz superior
  const grad = g.createLinearGradient(0, 0, 0, TILE_SIZE);
  grad.addColorStop(0, 'rgba(255,255,255,0.06)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.globalAlpha = 1;
  g.fillStyle = grad; g.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  return c;
}
const TILE_TEXTURES = {
  [TILES.DIRT]: makeTileTexture('#7a4b2b', '#4c2f1a'),
  [TILES.GRASS]: makeTileTexture('#4caf50', '#2f7a36'),
  [TILES.STONE]: makeTileTexture('#6d7077', '#46484d'),
  [TILES.SAND]: makeTileTexture('#d6c394', '#b9a87b'),
};

// Simple sprite generator for player/enemy
function drawPlayerSprite(ctx, x, y, w, h, facingLeft, walking) {
  ctx.save();
  ctx.translate(x + w/2, y + h/2);
  if (facingLeft) ctx.scale(-1, 1);
  ctx.translate(-w/2, -h/2);
  // Body
  ctx.fillStyle = '#3a7bd5';
  ctx.fillRect(2, 6, w-4, h-8);
  // Head
  ctx.fillStyle = '#f1d2b6';
  ctx.fillRect(3, 0, w-6, Math.floor(h*0.35));
  // Eyes
  ctx.fillStyle = '#222';
  ctx.fillRect(6, 6, 2, 2);
  ctx.fillRect(w-8, 6, 2, 2);
  // Legs animation
  ctx.fillStyle = '#2b5ca0';
  const t = (gameTimeMs / 120) % (Math.PI*2);
  const offset = walking ? Math.sin(t) * 2 : 0;
  ctx.fillRect(4, h-8 + offset, 4, 8);
  ctx.fillRect(w-8, h-8 - offset, 4, 8);
  ctx.restore();
}
function drawSlimeSprite(ctx, x, y, w, h, phase) {
  ctx.save();
  const squish = Math.sin(phase) * 0.1;
  ctx.translate(x, y + h * squish);
  ctx.fillStyle = '#67c26f';
  ctx.fillRect(0, 0, w, h * (1 - squish));
  // Eyes
  ctx.fillStyle = '#17391a';
  ctx.fillRect(4, 4, 3, 3);
  ctx.fillRect(w-7, 4, 3, 3);
  ctx.restore();
}

function isSolid(tile) {
  return tile !== TILES.AIR;
}

// Input
const keys = new Set();
let lastOnGroundAt = 0;
let lastJumpPressedAt = -Infinity;

window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (gameState === 'menu' && (k === 'enter' || k === ' ')) { e.preventDefault(); startGame(); return; }
  keys.add(k);
  if ([" ", "arrowup", "w"].includes(k)) {
    e.preventDefault();
    lastJumpPressedAt = gameTimeMs; // jump buffer
  }
  if (k === 's') saveWorld();
  if (k === 'l') loadWorld();
  if (k === 'f') toggleFullscreen();
});
window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));

// Mouse
const mouse = { x: 0, y: 0, left: false, right: false };
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});
canvas.addEventListener('mousedown', (e) => {
  if (gameState === 'menu') { startGame(); return; }
  if (e.button === 0) mouse.left = true;
  if (e.button === 2) mouse.right = true;
});
canvas.addEventListener('mouseup', (e) => {
  if (e.button === 0) mouse.left = false;
  if (e.button === 2) mouse.right = false;
});
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

// Hotbar ítems (se reemplaza más abajo por HOTBAR_ITEMS)
// Nota: se elimina el hotbar de tiles para evitar conflicto con ítems.

// Simple 1D value noise for terrain height
function valueNoise1D(x, seed) {
  const n = Math.sin((x + seed * 1000) * 12.9898) * 43758.5453;
  return n - Math.floor(n);
}
function smoothNoise1D(x, seed) {
  return (valueNoise1D(x - 1, seed) + valueNoise1D(x, seed) + valueNoise1D(x + 1, seed)) / 3;
}
function octaveNoise1D(x, seed) {
  // 3 octaves
  const o1 = smoothNoise1D(x / 8, seed);
  const o2 = smoothNoise1D(x / 16, seed) * 0.5;
  const o3 = smoothNoise1D(x / 32, seed) * 0.25;
  return (o1 + o2 + o3) / (1 + 0.5 + 0.25);
}

// World generation
const world = new Array(WORLD_H).fill(0).map(() => new Array(WORLD_W).fill(TILES.AIR));
const seed = Math.floor(Math.random() * 10000);
function generateWorld() {
  const seaLevel = Math.floor(WORLD_H * 0.55);
  for (let x = 0; x < WORLD_W; x++) {
    const hNoise = octaveNoise1D(x, seed);
    const height = Math.floor(seaLevel - 12 + hNoise * 24); // surface height
    for (let y = WORLD_H - 1; y >= 0; y--) {
      if (y > height) {
        // underground
        const depth = y - height;
        world[y][x] = depth > 10 ? TILES.STONE : TILES.DIRT;
      } else if (y === height) {
        // surface
        world[y][x] = TILES.GRASS;
      } else {
        world[y][x] = TILES.AIR;
      }
      // beach zone near seaLevel becomes sand at top
      if (y === height && Math.abs(height - seaLevel) <= 3) {
        world[y][x] = TILES.SAND;
      }
    }
  }
}

function getTile(tx, ty) {
  if (tx < 0 || ty < 0 || tx >= WORLD_W || ty >= WORLD_H) return TILES.STONE; // solid border
  return world[ty][tx];
}
function setTile(tx, ty, tile) {
  if (tx < 0 || ty < 0 || tx >= WORLD_W || ty >= WORLD_H) return;
  world[ty][tx] = tile;
}

// Save/Load and fullscreen
function saveWorld() {
  try {
    const data = { world, player };
    localStorage.setItem('terr_world_v1', JSON.stringify(data));
    console.log('Mundo guardado');
  } catch (e) { console.warn('No se pudo guardar:', e); }
}
function loadWorld() {
  try {
    const raw = localStorage.getItem('terr_world_v1');
    if (!raw) return;
    const data = JSON.parse(raw);
    if (Array.isArray(data.world)) {
      for (let y = 0; y < Math.min(WORLD_H, data.world.length); y++) {
        for (let x = 0; x < Math.min(WORLD_W, data.world[y].length); x++) {
          world[y][x] = data.world[y][x] | 0;
        }
      }
    }
    if (data.player) {
      player.x = data.player.x || player.x;
      player.y = data.player.y || player.y;
    }
    console.log('Mundo cargado');
  } catch (e) { console.warn('No se pudo cargar:', e); }
}
function toggleFullscreen() {
  const el = document.documentElement;
  if (!document.fullscreenElement) {
    (canvas.requestFullscreen ? canvas.requestFullscreen() : el.requestFullscreen()).catch(()=>{});
  } else {
    document.exitFullscreen && document.exitFullscreen();
  }
}

// Player
const player = {
  x: WORLD_W * TILE_SIZE * 0.5,
  y: TILE_SIZE * 40,
  w: 12,
  h: 24,
  vx: 0,
  vy: 0,
  onGround: false,
  facingLeft: false,
  health: 100,
};

function rectVsWorldCollision(px, py, pw, ph) {
  // Sample tiles overlapped by the player's AABB
  const left = Math.floor(px / TILE_SIZE);
  const right = Math.floor((px + pw - 1) / TILE_SIZE);
  const top = Math.floor(py / TILE_SIZE);
  const bottom = Math.floor((py + ph - 1) / TILE_SIZE);
  const colliders = [];
  for (let ty = top; ty <= bottom; ty++) {
    for (let tx = left; tx <= right; tx++) {
      const t = getTile(tx, ty);
      if (isSolid(t)) colliders.push({ tx, ty });
    }
  }
  return colliders;
}

function resolveCollisions() {
  // Horizontal
  player.x += player.vx;
  let colliders = rectVsWorldCollision(player.x, player.y, player.w, player.h);
  for (const c of colliders) {
    const tileRect = { x: c.tx * TILE_SIZE, y: c.ty * TILE_SIZE, w: TILE_SIZE, h: TILE_SIZE };
    if (player.vx > 0) {
      player.x = tileRect.x - player.w;
    } else if (player.vx < 0) {
      player.x = tileRect.x + tileRect.w;
    }
    player.vx = 0;
  }
  // Vertical
  player.y += player.vy;
  colliders = rectVsWorldCollision(player.x, player.y, player.w, player.h);
  player.onGround = false;
  for (const c of colliders) {
    const tileRect = { x: c.tx * TILE_SIZE, y: c.ty * TILE_SIZE, w: TILE_SIZE, h: TILE_SIZE };
    if (player.vy > 0) {
      player.y = tileRect.y - player.h; // landed on top
      player.onGround = true;
    } else if (player.vy < 0) {
      player.y = tileRect.y + tileRect.w; // bumped head
    }
    player.vy = 0;
  }
}

function updatePlayer(dt, deltaMs) {
  // Input
  const left = keys.has('a') || keys.has('arrowleft');
  const right = keys.has('d') || keys.has('arrowright');
  player.facingLeft = left && !right ? true : right && !left ? false : player.facingLeft;
  // Horizontal movement with accel/friction
  if (left) player.vx -= ACCEL;
  if (right) player.vx += ACCEL;
  if (!left && !right) {
    player.vx *= (player.onGround ? (1 - FRICTION) : (1 - AIR_DRAG));
  }
  // Clamp speed
  if (player.vx > MAX_SPEED) player.vx = MAX_SPEED;
  if (player.vx < -MAX_SPEED) player.vx = -MAX_SPEED;
  // Gravity
  player.vy += GRAVITY;
  if (player.vy > MAX_FALL) player.vy = MAX_FALL;
  // Jump with coyote time + jump buffer
  const canCoyote = (gameTimeMs - lastOnGroundAt) <= COYOTE_TIME;
  const buffered = (gameTimeMs - lastJumpPressedAt) <= JUMP_BUFFER;
  if ((player.onGround || canCoyote) && buffered) {
    player.vy = -JUMP_FORCE;
    player.onGround = false;
    lastJumpPressedAt = -Infinity; // consume buffer
  }
  resolveCollisions();
  if (player.onGround) lastOnGroundAt = gameTimeMs;
}

// Camera
const camera = { x: 0, y: 0 };
function updateCamera() {
  const viewW = canvas.width / (window.devicePixelRatio || 1);
  const viewH = canvas.height / (window.devicePixelRatio || 1);
  const targetX = player.x + player.w / 2 - viewW / 2;
  const targetY = player.y + player.h / 2 - viewH / 2;
  // Smooth follow
  camera.x += (targetX - camera.x) * 0.15;
  camera.y += (targetY - camera.y) * 0.15;
  const maxX = WORLD_W * TILE_SIZE - viewW;
  const maxY = WORLD_H * TILE_SIZE - viewH;
  if (camera.x < 0) camera.x = 0;
  if (camera.y < 0) camera.y = 0;
  if (camera.x > maxX) camera.x = Math.max(0, maxX);
  if (camera.y > maxY) camera.y = Math.max(0, maxY);
}

// Mining and placing (progress-based)
const REACH = TILE_SIZE * 5; // 5 tiles reach
const HARDNESS = {
  [TILES.AIR]: 0,
  [TILES.DIRT]: 300,
  [TILES.GRASS]: 200,
  [TILES.STONE]: 800,
  [TILES.SAND]: 250,
};
const mining = { active: false, tx: 0, ty: 0, progressMs: 0 };

function screenToWorld(x, y) {
  const viewX = x; // CSS pixels
  const viewY = y;
  const wx = camera.x + viewX;
  const wy = camera.y + viewY;
  return { x: wx, y: wy };
}

function beginMining(tx, ty) {
  mining.active = true;
  mining.tx = tx; mining.ty = ty; mining.progressMs = 0;
}
function stopMining() {
  mining.active = false; mining.progressMs = 0;
}
function updateMining(deltaMs) {
  // Solo minar si tenemos herramienta seleccionada
  const sel = typeof getSelectedItem === 'function' ? getSelectedItem() : null;
  if (!mouse.left || !sel || sel.type !== 'tool') { stopMining(); return; }
  const wpos = screenToWorld(mouse.x, mouse.y);
  const dx = wpos.x - (player.x + player.w / 2);
  const dy = wpos.y - (player.y + player.h / 2);
  if (Math.hypot(dx, dy) > REACH) { stopMining(); return; }
  const tx = Math.floor(wpos.x / TILE_SIZE);
  const ty = Math.floor(wpos.y / TILE_SIZE);
  const t = getTile(tx, ty);
  if (!isSolid(t)) { stopMining(); return; }
  if (!mining.active || mining.tx !== tx || mining.ty !== ty) beginMining(tx, ty);
  const required = HARDNESS[t] || 300;
  const speed = sel.miningSpeedMultiplier || 1.0;
  mining.progressMs += deltaMs * speed;
  if (mining.progressMs >= required) {
    setTile(tx, ty, TILES.AIR);
    const drop = tileToItem[t];
    if (drop) addItem(drop.id, 1);
    stopMining();
  }
}

function tryPlace() {
  const wpos = screenToWorld(mouse.x, mouse.y);
  const dx = wpos.x - (player.x + player.w / 2);
  const dy = wpos.y - (player.y + player.h / 2);
  if (Math.hypot(dx, dy) > REACH) return;
  const tx = Math.floor(wpos.x / TILE_SIZE);
  const ty = Math.floor(wpos.y / TILE_SIZE);
  const sel = typeof getSelectedItem === 'function' ? getSelectedItem() : null;
  if (!sel || sel.type !== 'block') return;
  if (getTile(tx, ty) === TILES.AIR) {
    const tileRect = { x: tx * TILE_SIZE, y: ty * TILE_SIZE, w: TILE_SIZE, h: TILE_SIZE };
    const overlaps = !(
      player.x + player.w <= tileRect.x ||
      player.x >= tileRect.x + tileRect.w ||
      player.y + player.h <= tileRect.y ||
      player.y >= tileRect.y + tileRect.h
    );
    if (!overlaps && getCount(sel.id) > 0) {
      setTile(tx, ty, sel.tile);
      removeItem(sel.id, 1);
    }
  }
}

// Enemigos: estado, spawn, actualización y colisiones
const enemies = [];
const ENEMY_MAX_SPEED = 2.0;
const ENEMY_ACCEL = 0.12;
const ENEMY_DAMAGE = 10;
const ENEMY_HIT_COOLDOWN_MS = 600;
const ENEMY_CHASE_RADIUS = TILE_SIZE * 10; // ~10 tiles

function findSurfaceY(tx) {
  for (let ty = 0; ty < WORLD_H - 1; ty++) {
    if (getTile(tx, ty) === TILES.AIR && isSolid(getTile(tx, ty + 1))) return ty;
  }
  return null;
}

function spawnEnemies(count) {
  enemies.length = 0;
  for (let i = 0; i < count; i++) {
    const tx = Math.floor(Math.random() * (WORLD_W - 4)) + 2;
    const sy = findSurfaceY(tx);
    if (sy == null) continue;
    const w = 14, h = 12;
    enemies.push({
      x: tx * TILE_SIZE + (Math.random() * TILE_SIZE * 0.5),
      y: sy * TILE_SIZE - h,
      w, h,
      vx: 0, vy: 0,
      phase: Math.random() * Math.PI * 2,
      lastHitAt: -Infinity,
      health: 30,
      maxHealth: 30,
      dead: false,
    });
  }
}

function rectVsWorldCollisionEntity(ex, ey, ew, eh) {
  const left = Math.floor(ex / TILE_SIZE);
  const right = Math.floor((ex + ew - 1) / TILE_SIZE);
  const top = Math.floor(ey / TILE_SIZE);
  const bottom = Math.floor((ey + eh - 1) / TILE_SIZE);
  const colliders = [];
  for (let ty = top; ty <= bottom; ty++) {
    for (let tx = left; tx <= right; tx++) {
      const t = getTile(tx, ty);
      if (isSolid(t)) colliders.push({ tx, ty });
    }
  }
  return colliders;
}

function resolveEnemyCollisions(e) {
  // Horizontal
  e.x += e.vx;
  let colliders = rectVsWorldCollisionEntity(e.x, e.y, e.w, e.h);
  for (const c of colliders) {
    const tileRect = { x: c.tx * TILE_SIZE, y: c.ty * TILE_SIZE, w: TILE_SIZE, h: TILE_SIZE };
    if (e.vx > 0) e.x = tileRect.x - e.w; else if (e.vx < 0) e.x = tileRect.x + tileRect.w;
    e.vx = 0;
  }
  // Vertical
  e.y += e.vy;
  colliders = rectVsWorldCollisionEntity(e.x, e.y, e.w, e.h);
  for (const c of colliders) {
    const tileRect = { x: c.tx * TILE_SIZE, y: c.ty * TILE_SIZE, w: TILE_SIZE, h: TILE_SIZE };
    if (e.vy > 0) e.y = tileRect.y - e.h; else if (e.vy < 0) e.y = tileRect.y + tileRect.w;
    e.vy = 0;
  }
}

function aabbOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return !(ax + aw <= bx || ax >= bx + bw || ay + ah <= by || ay >= by + bh);
}

function updateEnemies(dt) {
  for (const e of enemies) {
    // Chase player if close
    const dx = (player.x + player.w / 2) - (e.x + e.w / 2);
    const dy = (player.y + player.h / 2) - (e.y + e.h / 2);
    const dist = Math.hypot(dx, dy);
    if (dist < ENEMY_CHASE_RADIUS) {
      const dir = Math.sign(dx) || 0;
      e.vx += dir * ENEMY_ACCEL;
    } else {
      // Mild friction when idle
      e.vx *= 0.92;
    }
    // Clamp horizontal
    if (e.vx > ENEMY_MAX_SPEED) e.vx = ENEMY_MAX_SPEED;
    if (e.vx < -ENEMY_MAX_SPEED) e.vx = -ENEMY_MAX_SPEED;

    // Gravity
    e.vy += GRAVITY;
    if (e.vy > MAX_FALL) e.vy = MAX_FALL;

    // Collisions against world
    resolveEnemyCollisions(e);

    // Player collision: damage + knockback with cooldown
    if (aabbOverlap(e.x, e.y, e.w, e.h, player.x, player.y, player.w, player.h)) {
      if ((gameTimeMs - e.lastHitAt) >= ENEMY_HIT_COOLDOWN_MS) {
        player.health = Math.max(0, player.health - ENEMY_DAMAGE);
        const kdir = Math.sign(player.x - e.x) || 1;
        player.vx += kdir * 3.6;
        player.vy -= 6.0;
        e.lastHitAt = gameTimeMs;
      }
    }

    // Animate phase for slime squish
    e.phase += dt * 0.6;
  }
}

// Partículas de muerte de enemigos
 const particles = [];
 function spawnDeathParticles(x, y, count = 10) {
   for (let i = 0; i < count; i++) {
     const ang = Math.random() * Math.PI * 2;
     const sp = Math.random() * 2 + 1;
     particles.push({
       x, y,
       vx: Math.cos(ang) * sp,
       vy: Math.sin(ang) * sp,
       life: 500,
       ttl: 500,
       size: 2 + Math.random() * 2,
     });
   }
 }
 function updateParticles(deltaMs) {
   for (let i = particles.length - 1; i >= 0; i--) {
     const p = particles[i];
     p.vy += 0.02;
     p.x += p.vx;
     p.y += p.vy;
     p.life -= deltaMs;
     if (p.life <= 0) particles.splice(i, 1);
   }
 }
 function renderParticles(ctx) {
   for (const p of particles) {
     const alpha = Math.max(0, Math.min(1, p.life / p.ttl));
     ctx.fillStyle = `rgba(255,255,255,${alpha})`;
     ctx.fillRect(p.x - camera.x, p.y - camera.y, p.size, p.size);
   }
 }
 
 // Render
// Parallax background assets
const stars = Array.from({ length: 200 }, () => ({
  x: Math.random() * WORLD_W * TILE_SIZE,
  y: Math.random() * WORLD_H * TILE_SIZE,
  r: Math.random() * 1.5 + 0.3,
}));

function drawBackground(viewW, viewH) {
  // Day/night color
  const t = timeOfDay; // 0..1
  const skyTop = `hsl(220, 40%, ${Math.round(10 + 20 * (1 - Math.cos(t * 2 * Math.PI)))}%)`;
  const skyBottom = `hsl(220, 30%, ${Math.round(12 + 25 * (1 - Math.cos(t * 2 * Math.PI)))}%)`;
  const g = ctx.createLinearGradient(0, 0, 0, viewH);
  g.addColorStop(0, skyTop);
  g.addColorStop(1, skyBottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, viewW, viewH);

  // Stars parallax (visible more at night)
  const starAlpha = 0.2 + 0.8 * (1 - Math.cos(t * 2 * Math.PI)) * 0.5; // darker night
  ctx.save();
  ctx.globalAlpha = starAlpha;
  ctx.fillStyle = '#fff';
  for (const s of stars) {
    const sx = (s.x - camera.x * 0.2);
    const sy = (s.y - camera.y * 0.1);
    if (sx >= -5 && sy >= -5 && sx <= viewW + 5 && sy <= viewH + 5) {
      ctx.beginPath();
      ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Distant mountains parallax
  ctx.fillStyle = '#2a2d33';
  ctx.beginPath();
  ctx.moveTo(-camera.x * 0.3, viewH * 0.7 - camera.y * 0.05);
  for (let i = 0; i <= viewW + 200; i += 20) {
    const x = i - (camera.x * 0.3 % 200);
    const y = viewH * 0.7 + Math.sin((i + camera.x * 0.002)) * 12 - camera.y * 0.05;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(viewW + 200, viewH);
  ctx.lineTo(-200, viewH);
  ctx.closePath();
  ctx.fill();

  // Night overlay darkness
  const darkness = 0.25 + 0.35 * (1 - Math.cos(t * 2 * Math.PI));
  ctx.fillStyle = `rgba(0,0,0,${darkness})`;
  ctx.fillRect(0, 0, viewW, viewH);
}

function startGame() {
  gameState = 'playing';
  gameTimeMs = DAY_LENGTH_MS * 0.25; // comenzar de día (mediodía)
}
function render() {
  const viewW = canvas.width / (window.devicePixelRatio || 1);
  const viewH = canvas.height / (window.devicePixelRatio || 1);

  drawBackground(viewW, viewH);

  // Visible tile range
  const startX = Math.floor(camera.x / TILE_SIZE);
  const startY = Math.floor(camera.y / TILE_SIZE);
  const endX = Math.ceil((camera.x + viewW) / TILE_SIZE);
  const endY = Math.ceil((camera.y + viewH) / TILE_SIZE);

  for (let ty = startY; ty <= endY; ty++) {
    if (ty < 0 || ty >= WORLD_H) continue;
    for (let tx = startX; tx <= endX; tx++) {
      if (tx < 0 || tx >= WORLD_W) continue;
      const t = getTile(tx, ty);
      const tex = TILE_TEXTURES[t];
      if (!tex) continue;
      const sx = tx * TILE_SIZE - camera.x;
      const sy = ty * TILE_SIZE - camera.y;
      ctx.drawImage(tex, sx, sy);
    }
  }

  // Player
  const walking = Math.abs(player.vx) > 0.15 && player.onGround;
  // sombra
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(player.x - camera.x + player.w / 2, player.y - camera.y + player.h, player.w * 0.5, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  drawPlayerSprite(ctx, player.x - camera.x, player.y - camera.y, player.w, player.h, player.facingLeft, walking);
  // Enemies
  for (const e of enemies) {
    if (e.dead) continue;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(e.x - camera.x + e.w / 2, e.y - camera.y + e.h, e.w * 0.5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    drawSlimeSprite(ctx, e.x - camera.x, e.y - camera.y, e.w, e.h, e.phase);
    // Flash de golpe
    if (e.hitFlashAt && (gameTimeMs - e.hitFlashAt) < 120) {
      ctx.fillStyle = 'rgba(255,60,60,0.35)';
      ctx.fillRect(e.x - camera.x, e.y - camera.y, e.w, e.h);
    }
    // Barra de vida
    const maxH = e.maxHealth || e.health || 30;
    const ratio = Math.max(0, Math.min(1, (e.health || maxH) / maxH));
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(e.x - camera.x, e.y - camera.y - 4, e.w, 3);
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(e.x - camera.x, e.y - camera.y - 4, e.w * ratio, 3);
  }
  // Partículas
  renderParticles(ctx);
  // Mining progress bar
  if (mining.active) {
    const sx = mining.tx * TILE_SIZE - camera.x;
    const sy = mining.ty * TILE_SIZE - camera.y;
    const req = HARDNESS[getTile(mining.tx, mining.ty)] || 300;
    const p = Math.max(0, Math.min(1, mining.progressMs / req));
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(sx + 2, sy + TILE_SIZE - 4, (TILE_SIZE - 4) * p, 3);
  }

  // UI overlay
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(8, 8, 460, 100);
  ctx.fillStyle = '#eaeaea';
  ctx.font = '12px Segoe UI, Arial, sans-serif';
  ctx.fillText('A/D moverse, W/Espacio saltar (coyote+buffer).', 14, 26);
  ctx.fillText('Ratón: Izq mantener para minar (progreso), Der colocar.', 14, 44);
  ctx.fillText('Hotbar 1-5 | Guardar S | Cargar L | Fullscreen F', 14, 62);
  ctx.fillText('Día/Noche (~120s), Enemigos activos.', 14, 80);
  // Health bar
  ctx.fillStyle = '#c62828';
  ctx.fillRect(14, 92, 200, 10);
  ctx.fillStyle = '#66bb6a';
  ctx.fillRect(14, 92, Math.max(0, Math.min(1, player.health / 100)) * 200, 10);

  // Hotbar de ítems con iconos y cantidades
  const hbX = 14, hbY = 110, slot = 22;
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = i === selectedIndex ? '#fff' : '#999';
    ctx.strokeRect(hbX + i * (slot + 6), hbY, slot, slot);
    const it = HOTBAR_ITEMS[i];
    if (it && it.icon) {
      ctx.drawImage(it.icon, hbX + i * (slot + 6) + 1, hbY + 1, slot - 2, slot - 2);
    }
    ctx.fillStyle = '#ccc';
    ctx.font = '11px Segoe UI';
    if (it && it.type === 'block') {
      const c = getCount(it.id);
      ctx.fillText(String(c), hbX + i * (slot + 6) + slot - 14, hbY + slot - 6);
    } else {
      ctx.fillText(String(i + 1), hbX + i * (slot + 6) + 6, hbY + 18);
    }
  }
  // Pantalla de inicio
  if (gameState !== 'playing') {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(viewW * 0.5 - 140, viewH * 0.5 - 70, 280, 140);
    ctx.fillStyle = '#fff';
    ctx.font = '18px Segoe UI';
    ctx.fillText('Terr — Prototipo', viewW * 0.5 - 90, viewH * 0.5 - 30);
    ctx.font = '14px Segoe UI';
    ctx.fillText('Click o Enter para empezar', viewW * 0.5 - 110, viewH * 0.5 + 10);
    ctx.fillText('WASD para moverse, 1-5 hotbar', viewW * 0.5 - 110, viewH * 0.5 + 32);
  }
}

// Game loop
let last = performance.now();
function loop(now) {
  const deltaMs = Math.max(0, now - last);
  const dt = Math.min(deltaMs / 16.666, 3); // ~60fps, clamp
  last = now;
  gameTimeMs += deltaMs;
  timeOfDay = (gameTimeMs % DAY_LENGTH_MS) / DAY_LENGTH_MS;
  updateCamera();
  if (gameState === 'playing') {
    updatePlayer(dt, deltaMs);
    handleCombat(deltaMs);
    updateMining(deltaMs);
    updateEnemies(dt);
    if (mouse.right) tryPlace();
  }
  updateParticles(deltaMs);
  for (let i = enemies.length - 1; i >= 0; i--) {
    if (enemies[i].dead && (gameTimeMs - (enemies[i].deathAt || 0)) > 600) enemies.splice(i, 1);
  }
  render();
  requestAnimationFrame(loop);
}

// Initialize
generateWorld();
spawnEnemies(24);
requestAnimationFrame(loop);

// Actions
// (mining handled per-frame with updateMining; placement on right click)

// Item system: definitions, icons, inventory and hotbar
const ITEM_TYPES = { weapon: 'weapon', tool: 'tool', block: 'block', consumable: 'consumable' };
function makeIcon(color, glyph) {
  const c = document.createElement('canvas'); c.width = 20; c.height = 20; const g = c.getContext('2d');
  g.fillStyle = '#222'; g.fillRect(0, 0, 20, 20);
  g.fillStyle = color; g.fillRect(2, 2, 16, 16);
  g.fillStyle = '#fff'; g.font = '12px Segoe UI'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(glyph, 10, 10);
  return c;
}
const ITEMS = {
  WOOD_SWORD: { id: 'WOOD_SWORD', type: ITEM_TYPES.weapon, name: 'Espada madera', damage: 15, reach: TILE_SIZE * 3.5, cooldownMs: 350, icon: makeIcon('#8d6e63', 'S') },
  STONE_SWORD: { id: 'STONE_SWORD', type: ITEM_TYPES.weapon, name: 'Espada piedra', damage: 22, reach: TILE_SIZE * 3.8, cooldownMs: 350, icon: makeIcon('#6d7077', 'S') },
  WOOD_PICKAXE: { id: 'WOOD_PICKAXE', type: ITEM_TYPES.tool, name: 'Pico madera', miningSpeedMultiplier: 1.0, icon: makeIcon('#8d6e63', 'P') },
  STONE_PICKAXE: { id: 'STONE_PICKAXE', type: ITEM_TYPES.tool, name: 'Pico piedra', miningSpeedMultiplier: 1.6, icon: makeIcon('#6d7077', 'P') },
  DIRT_BLOCK: { id: 'DIRT_BLOCK', type: ITEM_TYPES.block, name: 'Tierra', tile: TILES.DIRT, icon: makeIcon('#7a4b2b', 'B') },
  GRASS_BLOCK: { id: 'GRASS_BLOCK', type: ITEM_TYPES.block, name: 'Césped', tile: TILES.GRASS, icon: makeIcon('#4caf50', 'B') },
  STONE_BLOCK: { id: 'STONE_BLOCK', type: ITEM_TYPES.block, name: 'Piedra', tile: TILES.STONE, icon: makeIcon('#6d7077', 'B') },
  SAND_BLOCK: { id: 'SAND_BLOCK', type: ITEM_TYPES.block, name: 'Arena', tile: TILES.SAND, icon: makeIcon('#d6c394', 'B') },
  HEALTH_POTION: { id: 'HEALTH_POTION', type: ITEM_TYPES.consumable, name: 'Poción', heal: 30, icon: makeIcon('#c62828', '+') },
};
const tileToItem = { [TILES.DIRT]: ITEMS.DIRT_BLOCK, [TILES.GRASS]: ITEMS.GRASS_BLOCK, [TILES.STONE]: ITEMS.STONE_BLOCK, [TILES.SAND]: ITEMS.SAND_BLOCK };
const inventory = new Map();
function addItem(itemId, count = 1) { inventory.set(itemId, (inventory.get(itemId) || 0) + count); }
function removeItem(itemId, count = 1) {
  const cur = inventory.get(itemId) || 0; const next = Math.max(0, cur - count); inventory.set(itemId, next); return next;
}
function getCount(itemId) { return inventory.get(itemId) || 0; }
let HOTBAR_ITEMS = [ITEMS.WOOD_SWORD, ITEMS.WOOD_PICKAXE, ITEMS.DIRT_BLOCK, ITEMS.STONE_BLOCK, ITEMS.SAND_BLOCK];
let selectedIndex = 0;
window.addEventListener('keydown', (e) => {
  const n = parseInt(e.key, 10);
  if (n >= 1 && n <= 5) { selectedIndex = n - 1; }
  if (e.key.toLowerCase() === 'r') { // quick cycle weapon/tool
    selectedIndex = (selectedIndex + 1) % HOTBAR_ITEMS.length;
  }
});
function getSelectedItem() { return HOTBAR_ITEMS[selectedIndex]; }
// Seed some inventory counts for blocks
addItem(ITEMS.DIRT_BLOCK.id, 20);
addItem(ITEMS.STONE_BLOCK.id, 10);
addItem(ITEMS.SAND_BLOCK.id, 8);

// Combate: ataque con arma y muerte con partículas
let lastAttackAt = -Infinity;
function handleCombat(deltaMs) {
  if (!mouse.left) return;
  const sel = typeof getSelectedItem === 'function' ? getSelectedItem() : null;
  if (!sel || sel.type !== 'weapon') return;
  if ((gameTimeMs - lastAttackAt) < (sel.cooldownMs || 300)) return;
  lastAttackAt = gameTimeMs;
  const facing = player.facingLeft ? -1 : 1;
  const px = player.x + player.w / 2;
  const py = player.y + player.h / 2;
  const reach = sel.reach || TILE_SIZE * 3;
  const aw = reach;
  const ah = player.h * 0.8;
  const ax = px + facing * (player.w / 2 + aw * 0.5) - aw * 0.5;
  const ay = py - ah * 0.5;
  for (const e of enemies) {
    if (e.dead) continue;
    if (aabbOverlap(ax, ay, aw, ah, e.x, e.y, e.w, e.h)) {
      e.health = Math.max(0, (e.health ?? e.maxHealth ?? 20) - (sel.damage || 10));
      e.hitFlashAt = gameTimeMs;
      const kdir = facing;
      e.vx += kdir * 2.8;
      e.vy -= 3.5;
      if (e.health <= 0 && !e.dead) {
        e.dead = true;
        e.deathAt = gameTimeMs;
        spawnDeathParticles(e.x + e.w / 2, e.y + e.h / 2, 12);
      }
    }
  }
}