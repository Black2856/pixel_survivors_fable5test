// game.js — メインエンジン
'use strict';

// ============================================================
// ブートストラップ
// ============================================================
const cvs = document.getElementById('game');
const ctx = cvs.getContext('2d');
let W = innerWidth, H = innerHeight;
function resize() {
  W = innerWidth; H = innerHeight;
  cvs.width = W; cvs.height = H;
  ctx.imageSmoothingEnabled = false;
}
addEventListener('resize', resize);
resize();

const SCALE = 3;
const TAU = Math.PI * 2;

const $ = id => document.getElementById(id);
const ui = {
  hud: $('hud'), xpfill: $('xpfill'), lvltext: $('lvltext'), timer: $('timer'),
  kills: $('kills'), combo: $('combo'), icons: $('weapon-icons'),
  bossbar: $('bossbar'), bossfill: $('bossfill'), bossname: $('bossname'),
  title: $('title-screen'), lvup: $('levelup-screen'), cards: $('cards'), lvupTitle: $('lvup-title'),
  over: $('gameover-screen'), goStats: $('go-stats'), reroll: $('reroll-btn'),
  vict: $('victory-screen'), vStats: $('v-stats'), pressStart: $('press-start'),
  pause: $('pause-screen'), banner: $('banner'), ann: $('announce'),
  flash: $('flash'), hurt: $('hurt-vignette'),
};
const show = e => e.classList.remove('hidden');
const hide = e => e.classList.add('hidden');

// ============================================================
// ユーティリティ
// ============================================================
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[(Math.random() * a.length) | 0];
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const dist2 = (ax, ay, bx, by) => { const dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; };
function hash2(x, y) {
  let h = (x * 73856093) ^ (y * 19349663);
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967296;
}
function fmtTime(t) {
  const m = (t / 60) | 0, s = (t % 60) | 0;
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

// ============================================================
// スプライトアクセス(欠損時はマゼンタ矩形でフォールバック)
// ============================================================
function makePlaceholder(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = '#f0f';
  g.fillRect(0, 0, w, h);
  return { frames: [c], w, h };
}
const _sprCache = {};
function spr(path, w = 12, h = 12) {
  if (_sprCache[path]) return _sprCache[path];
  let o = window.SPRITES;
  for (const k of path.split('.')) o = o && o[k];
  const r = (o && o.frames && o.frames.length) ? o : makePlaceholder(w, h);
  _sprCache[path] = r;
  return r;
}
const whiteCache = new Map();
function whiteOf(c) {
  let w = whiteCache.get(c);
  if (!w) {
    w = document.createElement('canvas');
    w.width = c.width; w.height = c.height;
    const g = w.getContext('2d');
    g.drawImage(c, 0, 0);
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = '#fff';
    g.fillRect(0, 0, w.width, w.height);
    whiteCache.set(c, w);
  }
  return w;
}
function drawSpr(sp, fi, x, y, o = {}) {
  const f = sp.frames[fi % sp.frames.length];
  const sc = (o.scale || 1) * SCALE, w = sp.w * sc, h = sp.h * sc;
  const sx = x - cam.x, sy = y - cam.y;
  if (sx < -w - 80 || sx > W + w + 80 || sy < -h - 80 || sy > H + h + 80) return;
  ctx.save();
  ctx.translate(sx, sy);
  if (o.rot) ctx.rotate(o.rot);
  if (o.flip) ctx.scale(-1, 1);
  if (o.alpha !== undefined) ctx.globalAlpha = o.alpha;
  ctx.drawImage(o.white ? whiteOf(f) : f, -w / 2, -h / 2, w, h);
  ctx.restore();
}

// ============================================================
// 状態
// ============================================================
let state = 'title'; // title | play | levelup | pause | over | victory
const cam = { x: 0, y: 0 };
let S = null, player = null;
let enemies = [], projs = [], eprojs = [], gems = [], drops = [], parts = [], floats = [], rings = [], boltsFx = [], zones = [], slashes = [];
let nextId = 1;
let dtReal = 0;

function xpFor(level) { return Math.floor(3 + level * 2.4 + Math.pow(level, 1.7)); }

function initRun() {
  S = {
    time: 0, kills: 0, totalDmg: 0, stage: 1, combo: 0, comboT: 0,
    gemStreak: 0, gemStreakT: 0, shake: 0, freeze: 0, ts: 1, tsBack: 0,
    schedIdx: 0, spawnT: 0, eliteT: 110, spawnCfg: null, ambT: 0,
    boss: null, pendingLv: 0, hudDirty: true,
    loop: 1, loopStart: 0, rerolls: 3, victoryT: 0,
    weaponSlots: 5, passiveSlots: 5,
  };
  player = {
    x: 0, y: 0, hp: 100, maxhp: 100, baseSpeed: 165, level: 1, xp: 0, xpNext: xpFor(1),
    weapons: {}, passives: {}, artifacts: {}, ifr: 0, facing: 1, animT: 0, moving: false, dead: false,
    speed: 165, magnetR: 90, cdMult: 1, regen: 0, areaMult: 1, rangeMult: 1, sizeMult: 1,
    bonus: { atk: 0, hp: 0, spd: 0, cd: 0, area: 0, size: 0 }, // 強化先が尽きた後のランダム微強化の累積
  };
  enemies = []; projs = []; eprojs = []; gems = []; drops = [];
  parts = []; floats = []; rings = []; boltsFx = []; zones = []; slashes = [];
  recalc();
  hide(ui.bossbar);
  ui.hurt.classList.remove('lowhp');
}

function recalc() {
  const pv = player.passives, af = player.artifacts, b = player.bonus;
  const supK = af.amp ? 1.5 : 1;   // 増幅の魔石: 補助系パッシブの効力+50%
  const vitK = af.aegis ? 2 : 1;   // 不動の重鎧: 生命系パッシブの効力+100%
  // 狂気の懐中時計: ブーツ・魔導書の効力+30%
  player.speed = player.baseSpeed * (1 + (af.clock ? 0.13 : 0.10) * (pv.boots || 0)) * (af.aegis ? 0.6 : 1) * (1 + b.spd);
  player.maxhp = Math.round((100 + 20 * vitK * (pv.heart || 0)) * (1 + b.hp));
  player.hp = Math.min(player.hp, player.maxhp);
  player.magnetR = 90 * (1 + 0.4 * supK * (pv.magnet || 0));
  player.cdMult = Math.pow(af.clock ? 0.909 : 0.93, pv.tome || 0) * Math.max(0.05, 1 - b.cd);
  player.regen = 0.6 * vitK * (pv.regen || 0);
  player.areaMult = (1 + 0.12 * supK * (pv.area || 0)) * (1 + b.area);
  player.rangeMult = 1 + 0.10 * supK * (pv.range || 0);
  player.sizeMult = (1 + 0.20 * supK * (pv.size || 0)) * (1 + b.size);
}

// 攻撃倍率(HPで変動するため毎ヒット計算)
// 狂戦士の血晶: パワークリスタルの効力が現在HP比に比例(満タンで150%・瀕死で0%)
function dmgMultNow() {
  const pv = player.passives, af = player.artifacts;
  let powEff = 0.12 * (af.amp ? 0.85 : 1) * (pv.power || 0); // 増幅の魔石: パワークリスタル効力-15%
  if (af.frenzy) powEff *= (player.hp / player.maxhp) * 1.5;
  return 1 + powEff + player.bonus.atk;
}

// クリティカル率(賭博師のダイスがコンボ数で変動するため毎ヒット計算)
function critNow() {
  const af = player.artifacts;
  let lensEff = 0.07 * (player.passives.lens || 0);
  if (af.amp) lensEff *= 0.85;                 // 増幅の魔石: クローバー効力-15%
  if (af.dice) lensEff *= 0.75 + 0.01 * S.combo; // 賭博師のダイス: 効力-25%・コンボ1につき+1%
  return 0.05 + lensEff;
}

// ============================================================
// 入力
// ============================================================
const keys = {};
// タイトルは2段階入力: 初回の操作でタイトル曲を再生(ブラウザの自動再生制限対策)、次の操作で開始
let titleArmed = false;
function armTitle() {
  if (titleArmed) return false;
  titleArmed = true;
  AudioMan.playMusic('title');
  ui.pressStart.textContent = 'PRESS ENTER / CLICK';
  return true;
}
addEventListener('keydown', e => {
  AudioMan.unlock();
  keys[e.code] = true;
  if (e.code === 'KeyM') AudioMan.toggleMute();
  if (e.code === 'Escape') {
    if (state === 'play') pauseGame();
    else if (state === 'pause') resumeGame();
  }
  if (state === 'title') {
    if (armTitle()) return;
    if (e.code === 'Enter' || e.code === 'Space') startRun();
  }
  if (state === 'over' && e.code === 'KeyR') restart();
  if (state === 'victory' && e.code === 'Enter') startEndless();
  if (state === 'levelup') {
    if (e.code === 'Digit1') chooseCard(0);
    if (e.code === 'Digit2') chooseCard(1);
    if (e.code === 'Digit3') chooseCard(2);
    if (e.code === 'Digit4') chooseCard(3);
    if (e.code === 'KeyR') reroll();
  }
});
addEventListener('keyup', e => keys[e.code] = false);
addEventListener('pointerdown', () => {
  AudioMan.unlock();
  if (state === 'title') {
    if (armTitle()) return;
    startRun();
  }
});
$('btn-retry').addEventListener('click', restart);
$('btn-endless').addEventListener('click', () => startEndless());
$('btn-totitle').addEventListener('click', () => goTitle());
ui.reroll.addEventListener('click', () => reroll());

// ============================================================
// 演出ヘルパー
// ============================================================
function flashScreen(a) {
  ui.flash.style.transition = 'none';
  ui.flash.style.opacity = a;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    ui.flash.style.transition = 'opacity .45s';
    ui.flash.style.opacity = 0;
  }));
}
function addShake(n) { S.shake = Math.max(S.shake, n); }
function freeze(t) { S.freeze = Math.max(S.freeze, t); }
function slowmo(scale, dur) { S.ts = scale; S.tsBack = dur; }
function announce(txt, sub) {
  ui.ann.innerHTML = txt + (sub ? `<span class="a-sub">${sub}</span>` : '');
  ui.ann.classList.remove('pop');
  void ui.ann.offsetWidth;
  ui.ann.classList.add('pop');
}
function showBanner(main, sub, dur = 2600) {
  ui.banner.innerHTML = main + (sub ? `<span class="b-sub">${sub}</span>` : '');
  show(ui.banner);
  setTimeout(() => hide(ui.banner), dur);
}
function burst(x, y, o = {}) {
  const n = o.n || 10;
  for (let i = 0; i < n; i++) {
    if (parts.length > 700) parts.shift();
    const a = rand(0, TAU), sp = rand(o.sp0 || 40, o.sp1 || 190);
    parts.push({
      x, y,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (o.up || 0),
      g: o.g !== undefined ? o.g : 340,
      life: rand(0.3, 0.7) * (o.life || 1), t: 0,
      size: rand(2, 5) * (o.size || 1),
      col: pick(o.cols || ['#fff']),
    });
  }
}
function addFloat(x, y, txt, col, size) {
  if (floats.length > 90) floats.shift();
  floats.push({ x, y, txt, col: col || '#fff', size: size || 12, t: 0, life: 0.8, vy: -50 });
}
function addRing(x, y, maxR, col, lw) {
  rings.push({ x, y, t: 0, life: 0.45, maxR, col: col || '#fff', lw: lw || 3 });
}
function comboPop() {
  S.comboT = 1.5;
  show(ui.combo);
  ui.combo.textContent = 'x' + S.combo;
  ui.combo.classList.remove('pop');
  void ui.combo.offsetWidth;
  ui.combo.classList.add('pop');
  const m = { 15: 'COMBO x15!', 30: 'RAMPAGE!!', 60: 'MASSACRE!!!', 100: 'GODLIKE!!!!', 200: 'LEGENDARY!!!!!' };
  if (m[S.combo]) { announce(m[S.combo]); AudioMan.select(); }
}

// ============================================================
// 画面遷移
// ============================================================
function startRun() {
  hide(ui.title); hide(ui.over);
  initRun();
  state = 'play';
  show(ui.hud);
  AudioMan.playMusic('field1');
  flashScreen(0.3);
  openStartChoice(); // 初期武器を選んでから開始
}
function restart() {
  AudioMan.unlock();
  startRun();
}
function pauseGame() { state = 'pause'; show(ui.pause); AudioMan.pauseMusic(); }
function resumeGame() { state = 'play'; hide(ui.pause); AudioMan.resumeMusic(); }

function gameOver() {
  if (player.dead) return;
  player.dead = true;
  state = 'over';
  AudioMan.stopMusic(1.2);
  AudioMan.death();
  burst(player.x, player.y, { n: 46, cols: ['#ff5050', '#fff', '#ffd23f'], sp1: 320, size: 1.4 });
  addRing(player.x, player.y, 140, '#ff5050', 5);
  addShake(16);
  flashScreen(0.5);
  setTimeout(() => { ui.goStats.innerHTML = statsHTML(); show(ui.over); }, 1100);
}
function statsHTML() {
  return `周回 ${S.loop}<br>生存時間 ${fmtTime(S.time)}<br>レベル ${player.level}<br>討伐数 ${S.kills}<br>総ダメージ ${Math.round(S.totalDmg)}`;
}

// ---- STAGE 3 クリアリザルト ----
function showVictory() {
  state = 'victory';
  ui.vStats.innerHTML = statsHTML();
  show(ui.vict);
  AudioMan.playMusic('title');
  flashScreen(0.5);
}
function startEndless() {
  if (state !== 'victory') return;
  hide(ui.vict);
  S.loop = 2;
  S.schedIdx = 0;
  S.loopStart = S.time;
  S.stage = 1;
  state = 'play';
  AudioMan.select();
  AudioMan.playMusic('field1');
  showBanner('ENDLESS MODE', 'LOOP 2 START', 3000);
  announce('ENDLESS MODE', '敵はさらに強くなる…');
}
function goTitle() {
  if (state !== 'victory') return;
  hide(ui.vict);
  hide(ui.hud);
  initRun(); // タイトル背景用にワールドをリセット
  state = 'title';
  show(ui.title);
  AudioMan.playMusic('title');
}

// ============================================================
// 空間グリッド
// ============================================================
const grid = new Map();
const CELL = 84;
function buildGrid() {
  grid.clear();
  for (const e of enemies) {
    const k = Math.floor(e.x / CELL) + ',' + Math.floor(e.y / CELL);
    let a = grid.get(k);
    if (!a) { a = []; grid.set(k, a); }
    a.push(e);
  }
}
function forEachInRadius(x, y, r, cb) {
  const x0 = Math.floor((x - r - 40) / CELL), x1 = Math.floor((x + r + 40) / CELL);
  const y0 = Math.floor((y - r - 40) / CELL), y1 = Math.floor((y + r + 40) / CELL);
  for (let gx = x0; gx <= x1; gx++) for (let gy = y0; gy <= y1; gy++) {
    const a = grid.get(gx + ',' + gy);
    if (!a) continue;
    for (const e of a) {
      if (e.hp <= 0) continue;
      const rr = r + e.r;
      if (dist2(x, y, e.x, e.y) < rr * rr) cb(e);
    }
  }
}
function nearestEnemy(x, y, maxD) {
  let best = null, bd = maxD * maxD;
  for (const e of enemies) {
    if (e.hp <= 0) continue;
    const d = dist2(x, y, e.x, e.y);
    if (d < bd) { bd = d; best = e; }
  }
  return best;
}

// ============================================================
// プレイヤー
// ============================================================
function updPlayer(dt) {
  let dx = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0);
  let dy = (keys.KeyS || keys.ArrowDown ? 1 : 0) - (keys.KeyW || keys.ArrowUp ? 1 : 0);
  if (dx || dy) {
    const m = Math.hypot(dx, dy);
    dx /= m; dy /= m;
    player.x += dx * player.speed * dt;
    player.y += dy * player.speed * dt;
    player.moving = true;
    if (dx) player.facing = dx < 0 ? -1 : 1;
    player.animT += dt;
  } else player.moving = false;
  if (player.ifr > 0) player.ifr -= dt;
  if (player.regen > 0 && player.hp < player.maxhp && !player.dead) {
    player.hp = Math.min(player.maxhp, player.hp + player.regen * dt);
  }
}

function hurtPlayer(d) {
  if (player.ifr > 0 || player.dead) return;
  player.hp -= d;
  player.ifr = 0.8;
  AudioMan.hurt();
  addShake(7);
  burst(player.x, player.y, { n: 8, cols: ['#ff5050', '#ffb0b0'] });
  addFloat(player.x, player.y - 30, '-' + d, '#ff6060', 15);
  ui.hurt.classList.add('hitflash');
  setTimeout(() => ui.hurt.classList.remove('hitflash'), 200);
  if (player.hp <= 0) { player.hp = 0; gameOver(); }
}
function heal(n) {
  const before = player.hp;
  player.hp = Math.min(player.maxhp, player.hp + n);
  const got = Math.round(player.hp - before);
  if (got > 0) {
    addFloat(player.x, player.y - 30, '+' + got, '#7cfc8a', 14);
    burst(player.x, player.y, { n: 10, cols: ['#7cfc8a', '#d2ffd9'], up: 80, g: 60 });
    AudioMan.heal();
  }
}

function gainXP(v) {
  player.xp += v;
  let leveled = false;
  while (player.xp >= player.xpNext) {
    player.xp -= player.xpNext;
    player.level++;
    player.xpNext = xpFor(player.level);
    S.pendingLv++;
    leveled = true;
  }
  if (leveled && state === 'play') openLevelUp();
}

// ============================================================
// 武器
// ============================================================
function addWeapon(name) {
  const w = player.weapons[name];
  if (w) w.lv = Math.min(5, w.lv + 1);
  else player.weapons[name] = { lv: 1, t: 0.3, tick: 0, angle: 0, slashN: 0, slashT: 0 };
  S.hudDirty = true;
}
function wstat(name) { return DATA.weapons[name].lv[player.weapons[name].lv - 1]; }

function updWeapons(dt) {
  for (const name in player.weapons) {
    const w = player.weapons[name];
    const st = DATA.weapons[name].lv[w.lv - 1];
    switch (name) {

      case 'bolt': {
        w.t -= dt;
        if (w.t <= 0) {
          w.t = st.cd * player.cdMult;
          const tgt = nearestEnemy(player.x, player.y, 560 * player.rangeMult);
          const base = tgt ? Math.atan2(tgt.y - player.y, tgt.x - player.x)
                           : (player.facing > 0 ? 0 : Math.PI);
          // 双面の魔鏡: 反対方向にも同時発射(ダメージ -25%)
          const mirror = player.artifacts.mirror;
          const fireVolley = dir => {
            for (let i = 0; i < st.count; i++) {
              const a = dir + (i - (st.count - 1) / 2) * 0.14;
              projs.push({
                kind: 'bolt', x: player.x, y: player.y - 8,
                vx: Math.cos(a) * st.speed, vy: Math.sin(a) * st.speed,
                dmg: st.dmg * (mirror ? 0.75 : 1), pierce: st.pierce,
                life: 1.3 * player.rangeMult, t: 0, rot: a, hit: new Set(),
              });
            }
          };
          fireVolley(base);
          if (mirror) fireVolley(base + Math.PI);
          AudioMan.shoot();
        }
        break;
      }

      case 'blade': {
        w.angle += st.rot * dt;
        const bladeR = st.radius * player.areaMult;
        for (let i = 0; i < st.count; i++) {
          const a = w.angle + (TAU / st.count) * i;
          const bx = player.x + Math.cos(a) * bladeR;
          const by = player.y + Math.sin(a) * bladeR;
          forEachInRadius(bx, by, 16 * player.sizeMult, e => {
            if ((e._bcd || 0) > S.time) return;
            e._bcd = S.time + 0.38;
            hitEnemy(e, st.dmg, a + Math.PI / 2, player.artifacts.bleed ? { bleed: true } : {});
          });
        }
        break;
      }

      case 'thunder': {
        w.t -= dt;
        if (w.t <= 0) {
          const visible = enemies.filter(e =>
            e.hp > 0 &&
            Math.abs(e.x - player.x) < W / 2 + 40 &&
            Math.abs(e.y - player.y) < H / 2 + 40);
          if (!visible.length) { w.t = 0.4; break; }
          w.t = st.cd * player.cdMult;
          // 連鎖の雷核: ダメージ-35%、直撃地点最寄りの敵1体へ連鎖
          const tDmg = st.dmg * (player.artifacts.chain ? 0.65 : 1);
          const tAoe = st.aoe * player.areaMult;
          for (let i = 0; i < st.strikes && visible.length; i++) {
            const e = visible.splice((Math.random() * visible.length) | 0, 1)[0];
            boltsFx.push({ x: e.x, y: e.y, t: 0, life: 0.22, seed: rand(0, 99) });
            burst(e.x, e.y, { n: 12, cols: ['#fff7ae', '#ffe14d', '#fff'], sp1: 240, up: 60 });
            addRing(e.x, e.y, tAoe, '#ffe14d', 3);
            forEachInRadius(e.x, e.y, tAoe, t2 => hitEnemy(t2, tDmg, rand(0, TAU)));
            if (player.artifacts.chain) {
              let near = null, bd = 320 * 320;
              for (const c of enemies) {
                if (c === e || c.hp <= 0) continue;
                const d = dist2(e.x, e.y, c.x, c.y);
                if (d < bd) { bd = d; near = c; }
              }
              if (near) {
                boltsFx.push({ chain: true, x1: e.x, y1: e.y, x2: near.x, y2: near.y, t: 0, life: 0.18 });
                burst(near.x, near.y, { n: 7, cols: ['#fff7ae', '#ffe14d'], sp1: 180 });
                hitEnemy(near, tDmg, rand(0, TAU));
              }
            }
          }
          AudioMan.zap();
          flashScreen(0.1);
          addShake(3);
        }
        break;
      }

      case 'aura': {
        w.tick -= dt;
        if (w.tick <= 0) {
          w.tick = st.tick;
          let hitN = 0;
          forEachInRadius(player.x, player.y, st.radius * player.areaMult, e => {
            const a = Math.atan2(e.y - player.y, e.x - player.x);
            hitEnemy(e, st.dmg, a, { kb: 35, small: true });
            hitN++;
          });
          // 聖杯の加護: オーラがダメージを与えるたびHP1%回復
          if (hitN > 0 && player.artifacts.holyleech && player.hp < player.maxhp) {
            player.hp = Math.min(player.maxhp, player.hp + player.maxhp * 0.01);
            if (Math.random() < 0.4) {
              parts.push({ x: player.x + rand(-14, 14), y: player.y + rand(-10, 4), vx: 0, vy: -42, g: 0, life: 0.5, t: 0, size: 2.5, col: '#7cfc8a' });
            }
          }
        }
        break;
      }

      case 'axe': {
        w.t -= dt;
        if (w.t <= 0) {
          w.t = st.cd * player.cdMult;
          for (let i = 0; i < st.count; i++) {
            projs.push({
              kind: 'axe', x: player.x, y: player.y - 10,
              vx: (rand(60, 190) * (Math.random() < 0.5 ? -1 : 1) * (i % 2 ? 1 : 0.6) + player.facing * 40) * player.rangeMult,
              vy: rand(-470, -350), g: 760,
              dmg: st.dmg, life: 3.2, t: 0, rot: 0, hit: new Set(),
            });
          }
          AudioMan.shoot();
        }
        break;
      }

      case 'wisp': {
        w.t -= dt;
        if (w.t <= 0) {
          w.t = st.cd * player.cdMult;
          // 狩猟の精霊石: 射程・追尾・弾速 +20% / ダメージ -20%
          const hunt = player.artifacts.wisphunter;
          const wSpd = 260 * (hunt ? 1.2 : 1);
          for (let i = 0; i < st.count; i++) {
            const a = rand(0, TAU);
            projs.push({
              kind: 'wisp', x: player.x, y: player.y,
              vx: Math.cos(a) * wSpd, vy: Math.sin(a) * wSpd,
              dmg: st.dmg * (hunt ? 0.8 : 1), pierce: st.pierce,
              life: 2.8 * player.rangeMult * (hunt ? 1.2 : 1), t: 0, tgt: null, hit: new Set(),
            });
          }
          AudioMan.shoot();
        }
        break;
      }

      case 'fire': {
        w.t -= dt;
        if (w.t <= 0) {
          w.t = st.cd * player.cdMult;
          const tgt = nearestEnemy(player.x, player.y, 560);
          const base = tgt ? Math.atan2(tgt.y - player.y, tgt.x - player.x)
                           : (player.facing > 0 ? 0 : Math.PI);
          for (let i = 0; i < st.count; i++) {
            const a = base + (i - (st.count - 1) / 2) * 0.22;
            projs.push({
              kind: 'fire', x: player.x, y: player.y - 6,
              vx: Math.cos(a) * 320, vy: Math.sin(a) * 320,
              dmg: st.dmg, burn: st.burn, pierce: 99,
              life: 1.2 * player.rangeMult * (player.artifacts.fireburst ? 0.75 : 1),
              t: 0, rot: a, hit: new Set(),
            });
          }
          AudioMan.fireS();
        }
        break;
      }

      case 'blizzard': {
        w.t -= dt;
        if (w.t <= 0) {
          const tgt = nearestEnemy(player.x, player.y, Math.max(W, H) / 2);
          if (!tgt) { w.t = 0.5; break; }
          w.t = st.cd * player.cdMult;
          zones.push({
            kind: 'bliz', x: tgt.x, y: tgt.y,
            r: st.radius * player.areaMult * (player.artifacts.blizzwalk ? 0.9 : 1),
            t: 0, dur: st.dur, tick: 0, dmg: st.dmg, slow: st.slow,
          });
          AudioMan.blizzS();
        }
        break;
      }

      case 'bhole': {
        w.t -= dt;
        if (w.t <= 0) {
          const tgt = nearestEnemy(player.x, player.y, 520 * player.rangeMult);
          if (!tgt) { w.t = 0.5; break; }
          w.t = st.cd * player.cdMult;
          const a = Math.atan2(tgt.y - player.y, tgt.x - player.x);
          projs.push({
            kind: 'bhole', x: player.x, y: player.y - 6,
            vx: Math.cos(a) * 300, vy: Math.sin(a) * 300,
            dmg: 0, life: 1.5 * player.rangeMult, t: 0, rot: a, hit: new Set(),
          });
          AudioMan.shoot();
        }
        break;
      }

      case 'katana': {
        w.t -= dt;
        if (w.t <= 0 && w.slashN <= 0) {
          w.t = st.cd * player.cdMult;
          w.slashN = st.count; // 連続斬撃の残り回数
          w.slashT = 0;
        }
        if (w.slashN > 0) {
          w.slashT -= dt;
          if (w.slashT <= 0) {
            w.slashT = 0.14;
            w.slashN--;
            const reach = st.aoe * player.areaMult;
            // 斬撃ごとに最も近い敵へ再照準(いなければ向いている方向)
            const tgt = nearestEnemy(player.x, player.y, 480);
            const ang = tgt ? Math.atan2(tgt.y - player.y, tgt.x - player.x)
                            : (player.facing > 0 ? 0 : Math.PI);
            const cx = player.x + Math.cos(ang) * reach * 0.55;
            const cy = player.y + Math.sin(ang) * reach * 0.55;
            forEachInRadius(cx, cy, reach * 0.6, e => {
              hitEnemy(e, st.dmg, ang, player.artifacts.bleed ? { bleed: true } : {});
            });
            slashes.push({ x: player.x, y: player.y, ang, reach, t: 0, life: 0.18, flip: (w.slashN % 2) === 0 });
            AudioMan.slashS();
          }
        }
        break;
      }
    }
  }
}

// ブラックホール生成(事象の地平線: ダメージ-50%・持続+100%)
function spawnBlackhole(x, y) {
  const st = wstat('bhole');
  const af = player.artifacts;
  zones.push({
    kind: 'bhole', x, y,
    r: st.radius * player.areaMult,
    t: 0, dur: st.dur * (af.horizon ? 2 : 1), tick: 0,
    dmg: st.dmg * (af.horizon ? 0.5 : 1), pull: st.pull,
  });
  addRing(x, y, st.radius * player.areaMult, '#b06ef0', 3);
  AudioMan.bholeS();
}

// ============================================================
// ゾーン(ブリザード / ブラックホール)
// ============================================================
function updZones(dt) {
  for (let i = zones.length - 1; i >= 0; i--) {
    const z = zones[i];
    z.t += dt;
    if (z.kind === 'bhole') {
      // 吸引(ボスは引き寄せない)
      forEachInRadius(z.x, z.y, z.r, e => {
        if (e.boss) return;
        const d = Math.sqrt(dist2(e.x, e.y, z.x, z.y));
        if (d < 6) return;
        const a = Math.atan2(z.y - e.y, z.x - e.x);
        const step = Math.min(z.pull * dt, d - 4);
        e.x += Math.cos(a) * step;
        e.y += Math.sin(a) * step;
      });
      // 0.1秒毎の持続ダメージ
      z.tick -= dt;
      if (z.tick <= 0) {
        z.tick = 0.1;
        forEachInRadius(z.x, z.y, z.r, e => hitEnemy(e, z.dmg, rand(0, TAU), { kb: 0, small: true }));
      }
      // 渦パーティクル(外周から中心へ落ちる)
      if (Math.random() < 0.7 && parts.length < 650) {
        const a = rand(0, TAU), rr = z.r * rand(0.5, 1);
        parts.push({
          x: z.x + Math.cos(a) * rr, y: z.y + Math.sin(a) * rr,
          vx: -Math.cos(a) * rr * 2.2, vy: -Math.sin(a) * rr * 2.2, g: 0,
          life: rand(0.25, 0.45), t: 0, size: rand(1.5, 3), col: pick(['#b06ef0', '#7a3fd0', '#fff']),
        });
      }
      if (z.t > z.dur) zones.splice(i, 1);
      continue;
    }
    // 吹雪の羅針盤: プレイヤーへゆっくり移動
    if (player.artifacts.blizzwalk) {
      const a = Math.atan2(player.y - z.y, player.x - z.x);
      z.x += Math.cos(a) * 42 * dt;
      z.y += Math.sin(a) * 42 * dt;
    }
    z.tick -= dt;
    if (z.tick <= 0) {
      z.tick = 0.5;
      forEachInRadius(z.x, z.y, z.r, e => {
        hitEnemy(e, z.dmg, rand(0, TAU), { kb: 0, small: true });
        if (!e.boss) { e.slowT = 1.0; e.slowMult = z.slow; }
      });
    }
    // 雪片パーティクル
    if (Math.random() < 0.5 && parts.length < 650) {
      const a = rand(0, TAU), rr = Math.sqrt(Math.random()) * z.r;
      parts.push({
        x: z.x + Math.cos(a) * rr, y: z.y + Math.sin(a) * rr - 20,
        vx: rand(-20, 20), vy: rand(30, 70), g: 0,
        life: rand(0.4, 0.9), t: 0, size: rand(1.5, 3), col: pick(['#d9f2ff', '#9fdcff', '#fff']),
      });
    }
    if (z.t > z.dur) zones.splice(i, 1);
  }
}

function prad(p) {
  // 弾の当たり判定 = 攻撃サイズ(ジャイアントリング)
  switch (p.kind) {
    case 'bolt': return 12 * player.sizeMult;
    case 'axe': return 16 * player.sizeMult;
    case 'wisp': return 14 * player.sizeMult;
    case 'fire': return 13 * player.sizeMult;
    case 'bhole': return 14;
    default: return 12;
  }
}

function updProjs(dt) {
  for (let i = projs.length - 1; i >= 0; i--) {
    const p = projs[i];
    p.t += dt;
    switch (p.kind) {
      case 'bolt':
        p.x += p.vx * dt; p.y += p.vy * dt;
        break;
      case 'bhole':
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (Math.random() < 0.5 && parts.length < 650) {
          parts.push({ x: p.x, y: p.y, vx: rand(-20, 20), vy: rand(-20, 20), g: 0, life: 0.3, t: 0, size: rand(1.5, 3), col: pick(['#b06ef0', '#7a3fd0']) });
        }
        break;
      case 'fire':
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (Math.random() < 0.55 && parts.length < 650) {
          parts.push({ x: p.x, y: p.y, vx: rand(-24, 24), vy: rand(-30, 10), g: 0, life: 0.3, t: 0, size: rand(2, 3.5), col: pick(['#ff5a2a', '#ffb13d']) });
        }
        break;
      case 'axe':
        p.vy += p.g * dt;
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.rot += 9 * dt;
        break;
      case 'wisp': {
        const hunt = player.artifacts.wisphunter;
        if (!p.tgt || p.tgt.hp <= 0) p.tgt = nearestEnemy(p.x, p.y, 380 * (hunt ? 1.2 : 1));
        if (p.tgt) {
          const ta = Math.atan2(p.tgt.y - p.y, p.tgt.x - p.x);
          let cur = Math.atan2(p.vy, p.vx);
          let d = ((ta - cur + Math.PI * 3) % TAU) - Math.PI;
          const turn = (hunt ? 6.6 : 5.5) * dt;
          cur += clamp(d, -turn, turn);
          const sp = Math.hypot(p.vx, p.vy);
          p.vx = Math.cos(cur) * sp;
          p.vy = Math.sin(cur) * sp;
        }
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (Math.random() < 0.45 && parts.length < 650) {
          parts.push({ x: p.x, y: p.y, vx: rand(-18, 18), vy: rand(-18, 18), g: 0, life: 0.32, t: 0, size: 2.5, col: '#7ef0e0' });
        }
        break;
      }
    }
    let dead = false;
    forEachInRadius(p.x, p.y, prad(p), e => {
      if (dead || p.hit.has(e.id)) return;
      // 重力弾: 最初の接触地点でブラックホールを展開
      if (p.kind === 'bhole') {
        dead = true;
        spawnBlackhole(p.x, p.y);
        return;
      }
      p.hit.add(e.id);
      const o = {};
      if (p.kind === 'fire') o.burn = p.burn;
      if (p.kind === 'axe' && player.artifacts.bleed) o.bleed = true;
      hitEnemy(e, p.dmg, Math.atan2(p.vy, p.vx), o);
      // 爆裂の火薬庫: ファイアー着弾時に爆発(威力60%の範囲ダメージ)
      if (p.kind === 'fire' && player.artifacts.fireburst) {
        burst(e.x, e.y, { n: 18, cols: ['#ff5a2a', '#ffb13d', '#fff3c4'], sp1: 270 });
        addRing(e.x, e.y, 88, '#ff8c42', 4);
        forEachInRadius(e.x, e.y, 88, t2 => {
          if (t2 !== e) hitEnemy(t2, p.dmg * 0.6, rand(0, TAU));
        });
      }
      if (p.kind === 'bolt' || p.kind === 'wisp') {
        if (p.pierce > 0) p.pierce--;
        else dead = true;
      }
    });
    if (p.t > p.life) {
      if (p.kind === 'bhole' && !dead) spawnBlackhole(p.x, p.y); // 不発防止: 射程端でも展開
      dead = true;
    }
    if (p.kind === 'axe' && p.y > player.y + H / 2 + 140) dead = true;
    if (dead) projs.splice(i, 1);
  }
}

// ============================================================
// ダメージ・撃破
// ============================================================
function hitEnemy(e, base, ang, o = {}) {
  if (e.hp <= 0) return;
  let dmg = base * dmgMultNow();
  if (e.bleedT > 0 && e.bleedSt) dmg *= 1 + 0.05 * e.bleedSt; // 出血: スタック毎に被ダメージ+5%
  const crit = Math.random() < critNow();
  if (crit) dmg *= 2 + (player.artifacts.critdmg ? 0.25 : 0);
  dmg = Math.max(1, Math.round(dmg));
  e.hp -= dmg;
  S.totalDmg += dmg;
  e.flash = 0.08;
  if (o.bleed) { e.bleedT = 5; e.bleedSt = Math.min(6, (e.bleedSt || 0) + 1); }
  if (o.burn) {
    e.burnDps = Math.max(e.burnDps || 0, o.burn);
    e.burnT = 3;
  }
  if (!e.boss) {
    const kb = o.kb !== undefined ? o.kb : (e.r > 28 ? 40 : 120);
    e.kx += Math.cos(ang) * kb;
    e.ky += Math.sin(ang) * kb;
  }
  if (!o.small || crit || Math.random() < 0.4) {
    addFloat(e.x + rand(-8, 8), e.y - e.r - 10, String(dmg), crit ? '#ffd23f' : '#fff', crit ? 17 : 11);
  }
  if (crit) burst(e.x, e.y, { n: 5, cols: ['#ffd23f', '#fff'], sp1: 150 });
  AudioMan.hit();
  if (e.hp <= 0) killEnemy(e, ang);
}

function killEnemy(e, ang) {
  S.kills++;
  S.combo++;
  comboPop();
  burst(e.x, e.y, {
    n: e.boss ? 90 : (e.elite ? 26 : 9),
    cols: [e.col, '#fff', '#ffd23f'],
    sp1: e.boss ? 400 : 210,
    size: e.elite || e.boss ? 1.6 : 1,
  });
  AudioMan.kill();
  if (e.boss) { onBossDeath(e); return; }
  dropGem(e.x, e.y, e.xp);
  if (e.elite) {
    drops.push({ kind: 'chest', x: e.x, y: e.y, t: 0 });
    for (let i = 0; i < 4; i++) dropGem(e.x + rand(-34, 34), e.y + rand(-34, 34), 5);
    freeze(0.09);
    addShake(8);
    addRing(e.x, e.y, 80, '#ffd23f', 4);
    announce('ELITE 撃破!');
  } else if (Math.random() < 0.012) {
    drops.push({ kind: 'heart', x: e.x, y: e.y, t: 0 });
  } else if (Math.random() < 0.004) {
    drops.push({ kind: 'magnet', x: e.x, y: e.y, t: 0 });
  }
}

function dropGem(x, y, v) {
  if (gems.length > 350) { const g0 = gems.shift(); if (gems.length) gems[0].v += g0.v; }
  gems.push({ x, y, v, t: rand(0, 9), hom: false, sp: 120 });
}

// ============================================================
// 敵
// ============================================================
function loopMul() { return 1 + (S.loop - 1) * 1.2; }

function spawnEnemy(type, opts = {}) {
  const d = DATA.enemies[type];
  const a = rand(0, TAU), R = Math.hypot(W, H) / 2 + 90;
  const x = opts.x !== undefined ? opts.x : player.x + Math.cos(a) * R;
  const y = opts.y !== undefined ? opts.y : player.y + Math.sin(a) * R;
  const pact = player.artifacts.pact ? 1.15 : 1; // 悪魔の契約書: 敵ステータス+15%
  const hpMul = (1 + S.time * 0.0055) * (opts.elite ? 9 : 1) * loopMul() * pact;
  const spdMul = (1 + (S.loop - 1) * 0.25) * pact * (player.artifacts.clock ? 1.15 : 1); // 狂気の懐中時計: 敵速度+15%
  enemies.push({
    id: nextId++, type, x, y,
    hp: d.hp * hpMul, maxhp: d.hp * hpMul,
    spd: d.spd * (opts.elite ? 0.85 : rand(0.9, 1.1)) * spdMul,
    dmg: Math.round(d.dmg * pact), xp: opts.elite ? 25 : d.xp,
    r: d.r * SCALE * (opts.elite ? 1.6 : 1),
    col: d.col, elite: !!opts.elite, scale: opts.elite ? 1.6 : 1,
    t: rand(0, 9), seed: rand(0, 9), kx: 0, ky: 0, flash: 0, boss: null,
  });
}

function updEnemies(dt) {
  for (const e of enemies) {
    if (e.hp <= 0) continue;
    e.t += dt;
    if (e.flash > 0) e.flash -= dt;
    // 燃焼ダメージ(0.5秒毎にまとめて適用)
    if (e.burnT > 0) {
      e.burnT -= dt;
      e.burnAcc = (e.burnAcc || 0) + e.burnDps * dt;
      e.burnTick = (e.burnTick || 0) - dt;
      if (e.burnTick <= 0) {
        e.burnTick = 0.5;
        const d = Math.round(e.burnAcc);
        if (d >= 1) {
          e.burnAcc -= d;
          e.hp -= d;
          S.totalDmg += d;
          addFloat(e.x + rand(-6, 6), e.y - e.r - 6, String(d), '#ff9b3d', 10);
          if (e.hp <= 0) { killEnemy(e, 0); continue; }
        }
      }
      if (Math.random() < 0.2 && parts.length < 650) {
        parts.push({ x: e.x + rand(-e.r, e.r) * 0.6, y: e.y + rand(-e.r, e.r) * 0.6, vx: rand(-12, 12), vy: rand(-55, -25), g: 0, life: 0.4, t: 0, size: rand(2, 3.5), col: pick(['#ff5a2a', '#ffb13d']) });
      }
    }
    if (e.slowT > 0) e.slowT -= dt;
    if (e.bleedT > 0) {
      e.bleedT -= dt;
      if (e.bleedT <= 0) e.bleedSt = 0; // 出血が切れたらスタック消滅
      if (Math.random() < 0.1 && parts.length < 650) {
        parts.push({ x: e.x + rand(-e.r, e.r) * 0.5, y: e.y, vx: rand(-10, 10), vy: rand(20, 60), g: 220, life: 0.45, t: 0, size: 2, col: '#d8333f' });
      }
    }
    if (e.boss) {
      bossAI(e, dt);
    } else {
      const a = Math.atan2(player.y - e.y, player.x - e.x);
      let wob = 0;
      if (e.type === 'bat') wob = Math.sin(e.t * 7 + e.seed) * 0.55;
      else if (e.type === 'ghost') wob = Math.sin(e.t * 3 + e.seed) * 0.7;
      const aa = a + wob;
      const spd = e.spd * (e.slowT > 0 ? e.slowMult : 1);
      e.x += Math.cos(aa) * spd * dt;
      e.y += Math.sin(aa) * spd * dt;
    }
    e.x += e.kx * dt; e.y += e.ky * dt;
    const dec = Math.exp(-9 * dt);
    e.kx *= dec; e.ky *= dec;
    // プレイヤー接触
    const rr = e.r + 18;
    if (player.ifr <= 0 && !player.dead && dist2(e.x, e.y, player.x, player.y) < rr * rr) {
      hurtPlayer(e.dmg);
    }
  }
  // 軽い相互分離
  for (const e of enemies) {
    if (e.hp <= 0 || e.boss) continue;
    forEachInRadius(e.x, e.y, e.r * 0.2, n => {
      if (n === e || n.boss) return;
      const d2v = dist2(e.x, e.y, n.x, n.y);
      const minD = (e.r + n.r) * 0.55;
      if (d2v < minD * minD && d2v > 0.01) {
        const d = Math.sqrt(d2v);
        const f = (minD - d) / d * 0.4;
        const px = (e.x - n.x) * f, py = (e.y - n.y) * f;
        e.x += px; e.y += py;
        n.x -= px; n.y -= py;
      }
    });
  }
  enemies = enemies.filter(e => e.hp > 0);
}

// ============================================================
// ボス
// ============================================================
function spawnBoss(key) {
  const b = DATA.bosses[key];
  AudioMan.roar();
  AudioMan.warning();
  AudioMan.playMusic(b.music);
  showBanner('&#9888; WARNING &#9888;', b.name);
  addShake(10);
  const a = rand(0, TAU), R = Math.hypot(W, H) / 2 + 130;
  const pact = player.artifacts.pact ? 1.15 : 1;
  const hp = b.hp * (1 + S.time * 0.0008) * loopMul() * pact;
  const bspd = b.spd * (1 + (S.loop - 1) * 0.25) * pact * (player.artifacts.clock ? 1.15 : 1);
  const e = {
    id: nextId++, type: key, boss: key, name: b.name,
    x: player.x + Math.cos(a) * R, y: player.y + Math.sin(a) * R,
    hp, maxhp: hp, spd: bspd, dmg: Math.round(b.dmg * pact), r: b.r, col: b.col, xp: 0,
    t: 0, seed: 0, kx: 0, ky: 0, flash: 0, elite: false, scale: 1,
    ai: { phase: 'chase', pt: 0, atkT: 3, sumT: 7, ringT: 3, aimT: 2,
          tpT: 5, spiralT: 3.5, spiralN: 0, spiralGap: 0, spA: 0, enraged: false },
  };
  enemies.push(e);
  S.boss = e;
  show(ui.bossbar);
  ui.bossname.textContent = b.name;
}

function fireBall(x, y, ang, spd, kind, dmg) {
  eprojs.push({
    kind: kind || 'ball', x, y,
    vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
    t: 0, life: 7, dmg: dmg || 14, rot: 0, curve: 0,
  });
}

function bossAI(e, dt) {
  const ai = e.ai;
  const a = Math.atan2(player.y - e.y, player.x - e.x);
  const distP = Math.sqrt(dist2(e.x, e.y, player.x, player.y));

  switch (e.boss) {
    case 'king': {
      if (ai.phase === 'chase') {
        e.x += Math.cos(a) * e.spd * dt;
        e.y += Math.sin(a) * e.spd * dt;
        ai.atkT -= dt;
        if (ai.atkT <= 0) { ai.phase = 'tele'; ai.pt = 0.8; }
      } else if (ai.phase === 'tele') {
        ai.pt -= dt;
        e.flash = (Math.sin(ai.pt * 30) > 0) ? 0.05 : 0; // 赤point: 点滅で予兆
        if (ai.pt <= 0) { ai.phase = 'charge'; ai.dir = a; ai.pt = 0.8; AudioMan.roar(); }
      } else { // charge
        ai.pt -= dt;
        e.x += Math.cos(ai.dir) * 330 * dt;
        e.y += Math.sin(ai.dir) * 330 * dt;
        if (Math.random() < 0.5) burst(e.x, e.y, { n: 2, cols: ['#7fae4e', '#4a6e30'], sp1: 80 });
        if (ai.pt <= 0) { ai.phase = 'chase'; ai.atkT = 5.5; }
      }
      ai.sumT -= dt;
      if (ai.sumT <= 0) {
        ai.sumT = 9;
        for (let i = 0; i < 4; i++) spawnEnemy('zombie', { x: e.x + rand(-70, 70), y: e.y + rand(-70, 70) });
        burst(e.x, e.y, { n: 16, cols: ['#6fae4e', '#3a5d28'], sp1: 200 });
      }
      break;
    }

    case 'wyrm': {
      const want = 270;
      const dir = distP > want ? a : a + Math.PI;
      const speedK = Math.abs(distP - want) > 50 ? 1 : 0.25;
      e.x += Math.cos(dir) * e.spd * speedK * dt + Math.cos(a + Math.PI / 2) * 55 * dt;
      e.y += Math.sin(dir) * e.spd * speedK * dt + Math.sin(a + Math.PI / 2) * 55 * dt;
      ai.ringT -= dt;
      if (ai.ringT <= 0) {
        ai.ringT = 4.6;
        for (let i = 0; i < 16; i++) fireBall(e.x, e.y, (TAU / 16) * i + rand(0, 0.3), 150, 'ball', 14);
        AudioMan.boom();
        addShake(5);
        burst(e.x, e.y, { n: 14, cols: ['#e8e6da', '#b8b4a0'], sp1: 180 });
      }
      ai.aimT -= dt;
      if (ai.aimT <= 0) {
        ai.aimT = 2.3;
        for (let i = -1; i <= 1; i++) fireBall(e.x, e.y, a + i * 0.22, 230, 'ball', 14);
        AudioMan.shoot();
      }
      ai.sumT -= dt;
      if (ai.sumT <= 0) {
        ai.sumT = 11;
        for (let i = 0; i < 3; i++) spawnEnemy('bat', { x: e.x + rand(-60, 60), y: e.y + rand(-60, 60) });
      }
      break;
    }

    case 'reaper': {
      e.x += Math.cos(a) * e.spd * dt;
      e.y += Math.sin(a) * e.spd * dt;
      ai.tpT -= dt;
      if (ai.tpT <= 0) {
        ai.tpT = ai.enraged ? 4 : 6.5;
        burst(e.x, e.y, { n: 22, cols: ['#b98fff', '#2b1b4a'], sp1: 240 });
        const ta = rand(0, TAU);
        e.x = player.x + Math.cos(ta) * rand(180, 260);
        e.y = player.y + Math.sin(ta) * rand(180, 260);
        burst(e.x, e.y, { n: 22, cols: ['#b98fff', '#fff'], sp1: 240 });
        flashScreen(0.12);
        AudioMan.zap();
      }
      ai.spiralT -= dt;
      if (ai.spiralT <= 0 && ai.spiralN <= 0) {
        ai.spiralT = ai.enraged ? 2.6 : 4;
        ai.spiralN = 14;
        ai.spiralGap = 0;
      }
      if (ai.spiralN > 0) {
        ai.spiralGap -= dt;
        if (ai.spiralGap <= 0) {
          ai.spiralGap = 0.07;
          ai.spiralN--;
          ai.spA += 0.55;
          fireBall(e.x, e.y, ai.spA, 190, 'scythe', 18);
        }
      }
      if (!ai.enraged && e.hp < e.maxhp * 0.3) {
        ai.enraged = true;
        e.spd *= 1.5;
        announce('死神が激昂した!!');
        AudioMan.roar();
        addShake(10);
      }
      break;
    }
  }
}

function onBossDeath(e) {
  S.boss = null;
  hide(ui.bossbar);
  freeze(0.12);
  slowmo(0.25, 1.5);
  flashScreen(0.6);
  addShake(18);
  burst(e.x, e.y, { n: 100, cols: [e.col, '#ffd23f', '#fff', '#ff8c42'], sp1: 430, size: 1.8, life: 1.4 });
  addRing(e.x, e.y, 280, '#ffd23f', 6);
  addRing(e.x, e.y, 190, '#fff', 4);
  AudioMan.boom();
  eprojs = [];
  for (let i = 0; i < 14; i++) dropGem(e.x + rand(-100, 100), e.y + rand(-100, 100), 20);
  drops.push({ kind: 'heart', x: e.x + 40, y: e.y, t: 0 });
  drops.push({ kind: 'magnet', x: e.x - 40, y: e.y, t: 0 });
  // アーティファクト宝珠(取得時に未所持から3択。全所持後は微強化の10倍効果)
  drops.push({ kind: 'artifact', x: e.x, y: e.y + 50, t: 0 });
  if (e.boss === 'reaper') {
    if (S.loop === 1) {
      // 初回クリア → 撃破演出後にリザルト画面(エンドレス移行 or タイトルへ)
      AudioMan.stopMusic(1.4);
      S.victoryT = 1.7;
      return;
    }
    // エンドレス中(2周目以降)はそのままループ継続
    S.loop++;
    S.schedIdx = 0;
    S.loopStart = S.time;
    S.stage = 1;
    announce('LOOP ' + S.loop + ' START!', '敵はさらに強くなる…');
    AudioMan.playMusic('field1');
    return;
  }
  S.stage = Math.min(3, S.stage + 1);
  announce('STAGE ' + S.stage, DATA.palettes[S.stage - 1].label);
  AudioMan.playMusic('field' + S.stage);
}

// ============================================================
// アーティファクト
// ============================================================
function applyArtifact(key) {
  player.artifacts[key] = true;
  const a = DATA.artifacts[key];
  if (key === 'wslot') S.weaponSlots++;
  if (key === 'pslot') S.passiveSlots++;
  recalc();
  S.hudDirty = true;
  AudioMan.artifact();
  flashScreen(0.45);
  freeze(0.08);
  addShake(8);
  addRing(player.x, player.y, 180, '#b06ef0', 6);
  addRing(player.x, player.y, 120, '#fff', 4);
  burst(player.x, player.y, { n: 44, cols: ['#b06ef0', '#7a3fd0', '#ffd23f', '#fff', '#ff6ec7'], sp1: 340, up: 120 });
  announce('ARTIFACT!', a.name + ' — ' + a.desc);
}

// ============================================================
// 敵弾
// ============================================================
function updEprojs(dt) {
  for (let i = eprojs.length - 1; i >= 0; i--) {
    const p = eprojs[i];
    p.t += dt;
    if (p.kind === 'scythe') {
      p.rot += 12 * dt;
      const cur = Math.atan2(p.vy, p.vx) + 0.4 * dt;
      const sp = Math.hypot(p.vx, p.vy);
      p.vx = Math.cos(cur) * sp;
      p.vy = Math.sin(cur) * sp;
    }
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (!player.dead && player.ifr <= 0 && dist2(p.x, p.y, player.x, player.y) < 26 * 26) {
      hurtPlayer(p.dmg);
      eprojs.splice(i, 1);
      continue;
    }
    if (p.t > p.life) eprojs.splice(i, 1);
  }
}

// ============================================================
// ジェム・ドロップ
// ============================================================
function updGems(dt) {
  for (let i = gems.length - 1; i >= 0; i--) {
    const g = gems[i];
    g.t += dt;
    const d2v = dist2(g.x, g.y, player.x, player.y);
    if (!g.hom && d2v < player.magnetR * player.magnetR) g.hom = true;
    if (g.hom) {
      g.sp += 1400 * dt;
      const a = Math.atan2(player.y - g.y, player.x - g.x);
      g.x += Math.cos(a) * g.sp * dt;
      g.y += Math.sin(a) * g.sp * dt;
    }
    if (d2v < 20 * 20) {
      gems.splice(i, 1);
      S.gemStreak++;
      S.gemStreakT = 0.9;
      AudioMan.gem(S.gemStreak);
      burst(player.x, player.y - 10, { n: 3, cols: ['#6ee7ff', '#fff'], sp1: 90, g: 0, life: 0.5 });
      gainXP(g.v * (player.artifacts.pact ? 1.5 : 1)); // 悪魔の契約書: 獲得経験値+50%
    }
  }
}

function updDrops(dt) {
  for (let i = drops.length - 1; i >= 0; i--) {
    const d = drops[i];
    d.t += dt;
    if (dist2(d.x, d.y, player.x, player.y) < 30 * 30) {
      drops.splice(i, 1);
      if (d.kind === 'heart') heal(30);
      else if (d.kind === 'artifact') openArtifactChoice();
      else if (d.kind === 'magnet') {
        for (const g of gems) { g.hom = true; g.sp = Math.max(g.sp, 500); }
        AudioMan.magnetS();
        addRing(player.x, player.y, 260, '#6ee7ff', 4);
        announce('MAGNET!', 'すべてのジェムを吸引!');
      } else if (d.kind === 'chest') {
        openChest();
      }
    }
  }
}

function openChest() {
  AudioMan.chest();
  flashScreen(0.35);
  freeze(0.06);
  burst(player.x, player.y, { n: 36, cols: ['#ffd23f', '#ff8c42', '#7cfc8a', '#6ee7ff', '#ff6ec7'], sp1: 300, up: 120 });
  addRing(player.x, player.y, 130, '#ffd23f', 5);
  const up = Object.keys(player.weapons).filter(k => player.weapons[k].lv < 5);
  if (up.length) {
    const k = pick(up);
    addWeapon(k);
    announce('TREASURE!', DATA.weapons[k].name + ' レベルアップ!');
  } else {
    heal(50);
    announce('TREASURE!', 'HPを50回復!');
  }
}

// ============================================================
// スポナー
// ============================================================
function updSpawner(dt) {
  const sc = DATA.schedule;
  const elapsed = S.time - S.loopStart; // 周回内経過時間
  while (S.schedIdx < sc.length && elapsed >= sc[S.schedIdx].t) {
    const entry = sc[S.schedIdx++];
    if (entry.boss) spawnBoss(entry.boss);
    else if (entry.event === 'horde') horde();
    else S.spawnCfg = entry;
  }
  const cfg = S.spawnCfg;
  if (!cfg) return;
  S.spawnT -= dt;
  if (S.spawnT <= 0) {
    S.spawnT = cfg.interval / ((1 + (S.loop - 1) * 0.25) * (player.artifacts.clock ? 1.15 : 1)); // 周回毎に出現率+25%・懐中時計で+15%
    if (enemies.length < cfg.max) spawnEnemy(pick(cfg.types));
  }
  if (S.time > 100) {
    S.eliteT -= dt;
    if (S.eliteT <= 0) {
      S.eliteT = 70;
      spawnEnemy(pick(cfg.types), { elite: true });
      showBanner('ELITE 出現!!', '', 1600);
      AudioMan.warning();
    }
  }
}

function horde() {
  showBanner('HORDE INCOMING!!', '大群が迫ってくる…!', 2200);
  AudioMan.warning();
  addShake(6);
  const cfg = S.spawnCfg || { types: ['zombie'] };
  const R = Math.hypot(W, H) / 2 + 70;
  for (let i = 0; i < 42; i++) {
    const a = (TAU / 42) * i;
    spawnEnemy(pick(cfg.types), { x: player.x + Math.cos(a) * R, y: player.y + Math.sin(a) * R });
  }
}

// ============================================================
// レベルアップUI
// ============================================================
let currentChoices = [];
let lvupMode = 'level'; // 'level' | 'artifact' | 'start'

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildChoices() {
  const pool = [];
  const wCount = Object.keys(player.weapons).length;
  const pCount = Object.keys(player.passives).length;
  for (const k in DATA.weapons) {
    const w = player.weapons[k];
    if (!w) {
      if (wCount < S.weaponSlots) pool.push({ type: 'weapon', key: k, nu: true }); // 武器枠に空きがある時のみ新規候補
    } else if (w.lv < 5) pool.push({ type: 'weapon', key: k });
  }
  for (const k in DATA.passives) {
    const lv = player.passives[k] || 0;
    if (lv === 0) {
      if (pCount < S.passiveSlots) pool.push({ type: 'passive', key: k });
    } else if (lv < 5) pool.push({ type: 'passive', key: k });
  }
  return shuffle(pool).slice(0, 3);
}

function descFor(c) {
  if (c.type === 'skip') {
    return lvupMode === 'artifact'
      ? 'ランダムなステータスを大きく強化する(攻撃力+10% など)'
      : 'ランダムなステータスを少し強化する(攻撃力+1% など)';
  }
  if (c.type === 'artifact') return DATA.artifacts[c.key].desc;
  if (c.type === 'passive') return DATA.passives[c.key].desc;
  const info = DATA.weapons[c.key];
  if (c.nu) return info.desc;
  const lv = player.weapons[c.key].lv;
  const cur = info.lv[lv - 1], nxt = info.lv[lv];
  const diffs = [];
  for (const k in nxt) {
    if (nxt[k] !== cur[k]) diffs.push(`${DATA.statLabels[k] || k} ${cur[k]}→${nxt[k]}`);
  }
  return diffs.join(' / ') || info.desc;
}

// 強化先が尽きた後のランダム微強化(mult=10 でアーティファクト版の10倍効果)
function applyMicroBuff(mult = 1) {
  const opts = [
    ['atk',  0.01,  '攻撃力'],
    ['hp',   0.01,  '最大HP'],
    ['spd',  0.005, '移動速度'],
    ['cd',   0.002, 'クールタイム'],
    ['area', 0.01,  '攻撃範囲'],
    ['size', 0.01,  '弾サイズ'],
  ];
  const [k, v, label] = pick(opts);
  player.bonus[k] += v * mult;
  recalc();
  const pct = v * mult * 100;
  const txt = label + (k === 'cd' ? ' -' : ' +') + (pct % 1 ? pct.toFixed(1) : pct) + '%';
  addFloat(player.x, player.y - 44, txt, '#ffd23f', 13);
  burst(player.x, player.y, { n: 14, cols: ['#ffd23f', '#fff'], sp1: 190, up: 80 });
  if (mult > 1) {
    announce('MAX POWER!', txt);
    AudioMan.artifact();
    flashScreen(0.3);
    addRing(player.x, player.y, 150, '#ffd23f', 5);
  } else {
    AudioMan.levelup();
  }
}

function openLevelUp() {
  // 強化できるものが残っていない場合はメニューを出さずランダム微強化
  if (!buildChoices().length) {
    S.pendingLv--;
    applyMicroBuff(1);
    if (S.pendingLv > 0) openLevelUp();
    return;
  }
  state = 'levelup';
  lvupMode = 'level';
  ui.lvupTitle.textContent = 'LEVEL UP!';
  show(ui.reroll);
  S.pendingLv--;
  AudioMan.levelup();
  flashScreen(0.25);
  addRing(player.x, player.y, 130, '#ffd23f', 5);
  burst(player.x, player.y, { n: 28, cols: ['#ffd23f', '#fff', '#6ee7ff'], sp1: 260, up: 100 });
  rollChoices();
  show(ui.lvup);
}

// アーティファクト選択(ボスドロップ取得時・リロール可)
function openArtifactChoice() {
  const unowned = Object.keys(DATA.artifacts).filter(k => !player.artifacts[k]);
  if (!unowned.length) { applyMicroBuff(10); return; } // 全所持後は微強化の10倍効果
  state = 'levelup';
  lvupMode = 'artifact';
  ui.lvupTitle.textContent = 'ARTIFACT!';
  show(ui.reroll);
  rollChoices();
  show(ui.lvup);
  AudioMan.artifact();
  flashScreen(0.35);
}

// 初期武器選択(ゲーム開始時・リロール可)
function openStartChoice() {
  state = 'levelup';
  lvupMode = 'start';
  ui.lvupTitle.textContent = '初期武器を選択!';
  show(ui.reroll);
  rollChoices();
  show(ui.lvup);
  AudioMan.levelup();
}

function rollChoices() {
  if (lvupMode === 'artifact') {
    const unowned = Object.keys(DATA.artifacts).filter(k => !player.artifacts[k]);
    currentChoices = shuffle(unowned).slice(0, 3).map(k => ({ type: 'artifact', key: k }));
    currentChoices.push({ type: 'skip' }); // スキップカードは常設(リロール対象外)
  } else if (lvupMode === 'start') {
    currentChoices = shuffle(Object.keys(DATA.weapons)).slice(0, 3)
      .map(k => ({ type: 'weapon', key: k, nu: true }));
  } else {
    currentChoices = buildChoices();
    currentChoices.push({ type: 'skip' }); // スキップカードは常設(リロール対象外)
  }
  renderCards();
  ui.reroll.textContent = `リロール (${S.rerolls})`;
  ui.reroll.disabled = S.rerolls <= 0;
}

function reroll() {
  if (state !== 'levelup' || S.rerolls <= 0) return;
  S.rerolls--;
  AudioMan.select();
  flashScreen(0.12);
  rollChoices();
}

function renderCards() {
  ui.cards.innerHTML = '';
  currentChoices.forEach((c, i) => {
    const info = c.type === 'weapon' ? DATA.weapons[c.key]
               : c.type === 'passive' ? DATA.passives[c.key]
               : c.type === 'artifact' ? DATA.artifacts[c.key]
               : { name: 'スキップ', desc: '', icon: 'skip' };
    const d = document.createElement('div');
    d.className = 'card';
    let tag = '';
    if (c.type === 'weapon') {
      tag = c.nu ? '<span class="c-tag new">NEW!</span>'
                 : `<span class="c-tag">Lv ${player.weapons[c.key].lv} → ${player.weapons[c.key].lv + 1}</span>`;
    } else if (c.type === 'passive') {
      const lv = player.passives[c.key] || 0;
      tag = lv === 0 ? '<span class="c-tag new">NEW!</span>'
                     : `<span class="c-tag">Lv ${lv} → ${lv + 1}</span>`;
    } else if (c.type === 'artifact') {
      tag = '<span class="c-tag art">ARTIFACT</span>';
    }
    d.innerHTML = tag + `<div class="c-name">${info.name}</div><div class="c-desc">${descFor(c)}</div>`;
    const ic = c.type === 'artifact' ? spr('items.artifact', 10, 12) : spr('icons.' + info.icon);
    const cv = document.createElement('canvas');
    cv.width = ic.w; cv.height = ic.h;
    cv.getContext('2d').drawImage(ic.frames[0], 0, 0);
    d.insertBefore(cv, d.firstChild);
    d.addEventListener('mouseenter', () => AudioMan.click());
    d.addEventListener('click', () => chooseCard(i));
    ui.cards.appendChild(d);
  });
}

function chooseCard(i) {
  const c = currentChoices[i];
  if (!c) return;
  AudioMan.select();
  if (c.type === 'weapon') addWeapon(c.key);
  else if (c.type === 'passive') { player.passives[c.key] = (player.passives[c.key] || 0) + 1; recalc(); S.hudDirty = true; }
  else if (c.type === 'artifact') applyArtifact(c.key);
  else if (c.type === 'skip') applyMicroBuff(lvupMode === 'artifact' ? 10 : 1);
  hide(ui.lvup);
  flashScreen(0.18);
  if (lvupMode === 'start') announce('STAGE 1', DATA.palettes[0].label);
  if (S.pendingLv > 0) { openLevelUp(); return; }
  state = 'play';
}

// ============================================================
// HUD
// ============================================================
function rebuildIcons() {
  ui.icons.innerHTML = '';
  const add = (icon, lv) => {
    const d = document.createElement('div');
    d.className = 'wicon';
    const ic = spr('icons.' + icon);
    const cv = document.createElement('canvas');
    cv.width = ic.w; cv.height = ic.h;
    cv.getContext('2d').drawImage(ic.frames[0], 0, 0);
    d.appendChild(cv);
    const b = document.createElement('span');
    b.className = 'wlv';
    b.textContent = lv;
    d.appendChild(b);
    ui.icons.appendChild(d);
  };
  for (const k in player.weapons) add(DATA.weapons[k].icon, player.weapons[k].lv);
  for (const k in player.passives) add(DATA.passives[k].icon, player.passives[k]);
  // アーティファクト(紫枠・レベルなし)
  for (const k in player.artifacts) {
    const d = document.createElement('div');
    d.className = 'wicon art';
    d.title = DATA.artifacts[k].name;
    const ic = spr('items.artifact', 10, 12);
    const cv = document.createElement('canvas');
    cv.width = ic.w; cv.height = ic.h;
    cv.getContext('2d').drawImage(ic.frames[0], 0, 0);
    d.appendChild(cv);
    ui.icons.appendChild(d);
  }
}

function updateHUD() {
  if (!S) return;
  if (S.hudDirty) { rebuildIcons(); S.hudDirty = false; }
  ui.xpfill.style.width = clamp(player.xp / player.xpNext * 100, 0, 100) + '%';
  ui.lvltext.textContent = 'LV ' + player.level;
  ui.timer.textContent = fmtTime(S.time);
  ui.kills.innerHTML = '&#9760; ' + S.kills;
  if (S.comboT <= 0 && S.combo === 0) hide(ui.combo);
  if (S.boss && S.boss.hp > 0) {
    ui.bossfill.style.width = clamp(S.boss.hp / S.boss.maxhp * 100, 0, 100) + '%';
  }
  const ratio = player.hp / player.maxhp;
  ui.hurt.classList.toggle('lowhp', ratio < 0.3 && !player.dead && state !== 'over');
}

// ============================================================
// 描画
// ============================================================
function drawGround() {
  const pal = DATA.palettes[S.stage - 1];
  ctx.fillStyle = pal.bg;
  ctx.fillRect(0, 0, W, H);
  const T = 48;
  const x0 = Math.floor(cam.x / T), x1 = Math.floor((cam.x + W) / T);
  const y0 = Math.floor(cam.y / T), y1 = Math.floor((cam.y + H) / T);
  for (let tx = x0; tx <= x1; tx++) for (let ty = y0; ty <= y1; ty++) {
    const h = hash2(tx, ty);
    if (h > 0.13) continue;
    const px = tx * T - cam.x + (hash2(tx + 7, ty) * 30) | 0;
    const py = ty * T - cam.y + (hash2(tx, ty + 7) * 30) | 0;
    if (h < 0.05) {
      ctx.fillStyle = pal.decoA;
      ctx.fillRect(px, py, 9, 4);
      ctx.fillRect(px + 2, py - 4, 4, 4);
    } else if (h < 0.09) {
      ctx.fillStyle = pal.decoB;
      ctx.fillRect(px, py, 7, 7);
    } else if (h < 0.115) {
      ctx.fillStyle = pal.accent;
      ctx.fillRect(px, py, 4, 4);
    } else {
      ctx.fillStyle = pal.flower;
      ctx.fillRect(px + 2, py, 3, 3);
      ctx.fillStyle = pal.accent;
      ctx.fillRect(px + 2, py + 3, 2, 4);
    }
  }
}

function drawAura() {
  const w = player.weapons.aura;
  if (!w) return;
  const st = DATA.weapons.aura.lv[w.lv - 1];
  const R = st.radius * player.areaMult * (1 + Math.sin(S.time * 5) * 0.04);
  const px = player.x - cam.x, py = player.y - cam.y;
  const g = ctx.createRadialGradient(px, py, R * 0.3, px, py, R);
  g.addColorStop(0, 'rgba(255,230,120,0)');
  g.addColorStop(0.8, 'rgba(255,220,100,0.10)');
  g.addColorStop(1, 'rgba(255,210,80,0.22)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(px, py, R, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,225,120,0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawHpBar(x, y, w, h, ratio, fg) {
  ctx.fillStyle = 'rgba(0,0,0,.65)';
  ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
  ctx.fillStyle = fg;
  ctx.fillRect(x, y, w * clamp(ratio, 0, 1), h);
}

function render() {
  if (!S) { ctx.fillStyle = '#0b0813'; ctx.fillRect(0, 0, W, H); return; }
  drawGround();

  // ジェム
  const gemS = spr('items.gemS'), gemM = spr('items.gemM'), gemL = spr('items.gemL');
  for (const g of gems) {
    const sp2 = g.v >= 15 ? gemL : g.v >= 3 ? gemM : gemS;
    const bob = Math.sin(g.t * 4) * 3;
    drawSpr(sp2, (g.t * 4) | 0, g.x, g.y + bob, { scale: 0.8 });
  }
  // ドロップ
  for (const d of drops) {
    const sp2 = spr('items.' + (d.kind === 'chest' ? 'chest' : d.kind));
    drawSpr(sp2, (d.t * 3) | 0, d.x, d.y + Math.sin(d.t * 3) * 3, {});
  }

  drawAura();

  // ゾーン(ブリザード / ブラックホール)
  for (const z of zones) {
    const zx = z.x - cam.x, zy = z.y - cam.y;
    const k = Math.min(1, z.t * 4) * Math.min(1, (z.dur - z.t) * 2.5);
    if (z.kind === 'bhole') {
      const g2 = ctx.createRadialGradient(zx, zy, 2, zx, zy, z.r);
      g2.addColorStop(0, `rgba(10,5,20,${0.85 * k})`);
      g2.addColorStop(0.35, `rgba(60,28,110,${0.45 * k})`);
      g2.addColorStop(1, 'rgba(120,70,200,0)');
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.arc(zx, zy, z.r, 0, TAU);
      ctx.fill();
      // 回転する降着円盤
      ctx.save();
      ctx.translate(zx, zy);
      ctx.rotate(S.time * 6);
      ctx.strokeStyle = `rgba(176,110,240,${0.8 * k})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, z.r * 0.4, z.r * 0.16, 0, 0, TAU);
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = `rgba(0,0,0,${0.9 * k})`;
      ctx.beginPath();
      ctx.arc(zx, zy, z.r * 0.13, 0, TAU);
      ctx.fill();
      continue;
    }
    const g = ctx.createRadialGradient(zx, zy, z.r * 0.2, zx, zy, z.r);
    g.addColorStop(0, `rgba(160,220,255,${0.10 * k})`);
    g.addColorStop(1, `rgba(120,190,255,${0.26 * k})`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(zx, zy, z.r, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = `rgba(200,235,255,${0.5 * k})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // エンティティ(y順ソート)
  const ents = [];
  for (const e of enemies) ents.push(e);
  if (!player.dead) ents.push(player);
  ents.sort((a2, b2) => a2.y - b2.y);
  for (const e of ents) {
    if (e === player) {
      // 無敵中は点滅
      if (player.ifr > 0 && ((player.ifr * 12) | 0) % 2 === 0) continue;
      const fi = player.moving ? ((player.animT * 8) | 0) % 4 : 0;
      drawSpr(spr('player', 16, 16), fi, player.x, player.y, { flip: player.facing < 0 });
      drawHpBar(player.x - cam.x - 22, player.y - cam.y - 34, 44, 5, player.hp / player.maxhp,
        player.hp / player.maxhp > 0.35 ? '#5ee05e' : '#ff5050');
    } else {
      const sp2 = e.boss ? spr('bosses.' + e.boss, 36, 36) : spr('enemies.' + e.type, 14, 16);
      const fi = (e.t * 6) | 0;
      const flip = player.x < e.x;
      const bob = (e.type === 'ghost' || e.boss === 'reaper') ? Math.sin(e.t * 3) * 4 : 0;
      if (e.elite) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255,210,63,.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(e.x - cam.x, e.y - cam.y + e.r * 0.7, e.r, 0, TAU);
        ctx.stroke();
        ctx.restore();
      }
      drawSpr(sp2, fi, e.x, e.y + bob, {
        flip, scale: e.scale,
        white: e.flash > 0,
        alpha: e.type === 'ghost' ? 0.85 : 1,
      });
      if (e.elite) {
        drawHpBar(e.x - cam.x - 20, e.y - cam.y - e.r - 14, 40, 4, e.hp / e.maxhp, '#ffd23f');
      }
    }
  }

  // 自弾(ボルト/アックス/ウィスプは攻撃サイズで拡大表示)
  const szM = player.sizeMult;
  for (const p of projs) {
    if (p.kind === 'bolt') drawSpr(spr('proj.bolt', 8, 4), (p.t * 10) | 0, p.x, p.y, { rot: p.rot, scale: szM });
    else if (p.kind === 'axe') drawSpr(spr('proj.axe', 9, 9), 0, p.x, p.y, { rot: p.rot, scale: szM });
    else if (p.kind === 'wisp') drawSpr(spr('proj.wisp', 8, 8), (p.t * 10) | 0, p.x, p.y, { scale: szM });
    else if (p.kind === 'fire') drawSpr(spr('proj.fire', 8, 8), (p.t * 12) | 0, p.x, p.y, { rot: p.rot, scale: szM });
    else if (p.kind === 'bhole') drawSpr(spr('proj.bhole', 8, 8), (p.t * 8) | 0, p.x, p.y, { rot: p.rot });
  }
  // 刀の斬撃(三日月アーク)
  for (const s of slashes) {
    const k = s.t / s.life;
    ctx.save();
    ctx.translate(s.x - cam.x + Math.cos(s.ang) * s.reach * 0.3, s.y - cam.y + Math.sin(s.ang) * s.reach * 0.3);
    ctx.rotate(s.ang);
    ctx.scale(1, s.flip ? 1 : -1);
    ctx.globalAlpha = 1 - k;
    const r = s.reach * (0.55 + 0.25 * k);
    ctx.beginPath();
    ctx.arc(0, 0, r, -1.1, 1.1);
    ctx.strokeStyle = 'rgba(200,230,255,.9)';
    ctx.lineWidth = 7 * (1 - k) + 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.93, -0.9, 0.9);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3 * (1 - k) + 1;
    ctx.stroke();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  // ブレード
  const bw = player.weapons.blade;
  if (bw && !player.dead) {
    const st = DATA.weapons.blade.lv[bw.lv - 1];
    const bladeR = st.radius * player.areaMult;
    for (let i = 0; i < st.count; i++) {
      const a = bw.angle + (TAU / st.count) * i;
      drawSpr(spr('proj.blade', 10, 10), 0,
        player.x + Math.cos(a) * bladeR,
        player.y + Math.sin(a) * bladeR,
        { rot: a + S.time * 14, scale: szM });
    }
  }
  // 敵弾
  for (const p of eprojs) {
    drawSpr(spr('proj.' + p.kind, 6, 6), (p.t * 8) | 0, p.x, p.y, { rot: p.rot });
  }

  // 落雷
  for (const b of boltsFx) {
    const k = 1 - b.t / b.life;
    if (b.chain) {
      // 連鎖稲妻(横方向の電撃線)
      ctx.save();
      ctx.globalAlpha = k;
      ctx.beginPath();
      const mx = (b.x1 + b.x2) / 2 + rand(-14, 14), my = (b.y1 + b.y2) / 2 + rand(-14, 14);
      ctx.moveTo(b.x1 - cam.x, b.y1 - cam.y);
      ctx.lineTo(mx - cam.x, my - cam.y);
      ctx.lineTo(b.x2 - cam.x, b.y2 - cam.y);
      ctx.strokeStyle = 'rgba(255,240,150,.6)';
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      continue;
    }
    ctx.save();
    ctx.globalAlpha = k;
    const sx = b.x - cam.x, sy = b.y - cam.y;
    ctx.beginPath();
    let yy = sy - 380, xx = sx + Math.sin(b.seed) * 40;
    ctx.moveTo(xx, yy);
    for (let i = 1; i <= 7; i++) {
      const t = i / 7;
      xx = sx + (1 - t) * Math.sin(b.seed + i * 3.7) * 34;
      yy = sy - 380 * (1 - t);
      ctx.lineTo(xx, yy);
    }
    ctx.strokeStyle = 'rgba(255,240,150,.55)';
    ctx.lineWidth = 7;
    ctx.stroke();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();
  }

  // パーティクル
  for (const p of parts) {
    ctx.globalAlpha = clamp(1 - p.t / p.life, 0, 1);
    ctx.fillStyle = p.col;
    const s = p.size;
    ctx.fillRect(p.x - cam.x - s / 2, p.y - cam.y - s / 2, s, s);
  }
  ctx.globalAlpha = 1;

  // リング
  for (const r of rings) {
    const k = r.t / r.life;
    ctx.globalAlpha = (1 - k) * 0.8;
    ctx.strokeStyle = r.col;
    ctx.lineWidth = r.lw * (1 - k) + 1;
    ctx.beginPath();
    ctx.arc(r.x - cam.x, r.y - cam.y, r.maxR * (0.2 + 0.8 * k), 0, TAU);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // ダメージ数字
  ctx.textAlign = 'center';
  for (const f of floats) {
    const k = f.t / f.life;
    ctx.globalAlpha = clamp(1 - k * k, 0, 1);
    ctx.font = `${f.size}px 'Press Start 2P', monospace`;
    const fx = f.x - cam.x, fy = f.y - cam.y + f.vy * f.t;
    ctx.fillStyle = '#000';
    ctx.fillText(f.txt, fx + 2, fy + 2);
    ctx.fillStyle = f.col;
    ctx.fillText(f.txt, fx, fy);
  }
  ctx.globalAlpha = 1;
}

// ============================================================
// FX更新
// ============================================================
function updFx(dt) {
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    p.t += dt;
    if (p.t > p.life) { parts.splice(i, 1); continue; }
    p.vy += p.g * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
  }
  for (let i = floats.length - 1; i >= 0; i--) {
    floats[i].t += dt;
    if (floats[i].t > floats[i].life) floats.splice(i, 1);
  }
  for (let i = rings.length - 1; i >= 0; i--) {
    rings[i].t += dt;
    if (rings[i].t > rings[i].life) rings.splice(i, 1);
  }
  for (let i = boltsFx.length - 1; i >= 0; i--) {
    boltsFx[i].t += dt;
    if (boltsFx[i].t > boltsFx[i].life) boltsFx.splice(i, 1);
  }
  for (let i = slashes.length - 1; i >= 0; i--) {
    slashes[i].t += dt;
    if (slashes[i].t > slashes[i].life) slashes.splice(i, 1);
  }
  // 環境パーティクル
  S.ambT -= dt;
  if (S.ambT <= 0) {
    S.ambT = 0.07;
    const pal = DATA.palettes[S.stage - 1];
    if (parts.length < 600) {
      parts.push({
        x: cam.x + rand(0, W), y: cam.y + (pal.rise ? H + 10 : rand(0, H)),
        vx: rand(-14, 14), vy: pal.rise ? rand(-60, -25) : rand(8, 22),
        g: 0, life: rand(2, 4), t: 0, size: rand(1.5, 3), col: pal.amb,
      });
    }
  }
}

// ============================================================
// メイン更新
// ============================================================
function update(dt) {
  S.time += dt;
  updPlayer(dt);
  buildGrid();
  updWeapons(dt);
  updZones(dt);
  updProjs(dt);
  updEnemies(dt);
  updEprojs(dt);
  updGems(dt);
  updDrops(dt);
  updSpawner(dt);
  updFx(dt);
  if (S.comboT > 0) { S.comboT -= dt; if (S.comboT <= 0) { S.combo = 0; hide(ui.combo); } }
  if (S.gemStreakT > 0) { S.gemStreakT -= dt; if (S.gemStreakT <= 0) S.gemStreak = 0; }
  if (S.victoryT > 0) { S.victoryT -= dt; if (S.victoryT <= 0) showVictory(); }
}

// ============================================================
// メインループ
// ============================================================
let last = 0;
function frame(ts) {
  requestAnimationFrame(frame);
  const dt = Math.min((ts - last) / 1000, 1 / 30);
  last = ts;
  dtReal = dt;

  if (S) {
    if (S.shake > 0) S.shake = Math.max(0, S.shake - 55 * dt);
    if (S.freeze > 0) {
      S.freeze -= dt;
      updCam();
      render();
      updateHUD();
      return;
    }
    if (S.tsBack > 0) {
      S.tsBack -= dt;
      S.ts = Math.min(1, S.ts + dt * 0.7);
      if (S.tsBack <= 0) S.ts = 1;
    }
  }

  if (state === 'play') {
    update(dt * S.ts);
  } else if ((state === 'title' || state === 'over' || state === 'victory') && S) {
    updFx(dt); // タイトル背景・死亡/リザルト演出中もパーティクルを動かす
  }

  updCam();
  render();
  updateHUD();
}

function updCam() {
  if (!S) return;
  const sx = S.shake > 0.5 ? rand(-S.shake, S.shake) : 0;
  const sy = S.shake > 0.5 ? rand(-S.shake, S.shake) : 0;
  cam.x = player.x - W / 2 + sx;
  cam.y = player.y - H / 2 + sy;
}

// タイトル画面の背景用にワールドを初期化しておく
initRun();
requestAnimationFrame(frame);
