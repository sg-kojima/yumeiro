'use strict';
// ゆめいろタウン 試作版（パティスリー＋おかいもの）

/* ---------- データ ---------- */
const SAVE_KEY = 'yumeiro-save-v1';
const DEFAULT_STATE = () => ({
  v: 1,
  partner: null,
  names: { coco: 'ココ', luna: 'ルナ', berry: 'ベリー' },
  money: 100,
  food: {},          // id -> こすう
  owned: [],         // ふく・かぐ の id
  wear: [],          // きている ふく
  cakes: [],         // かざってある ケーキ
  served: 0,
  stats: {},         // kuku/kasa/nagasa/gram/total/change -> {ok, ng}
  settings: { dans: [2, 3, 4, 5, 6, 7, 8, 9], challenge: true, sound: true, voice: true },
});

let S = load();
function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return Object.assign(DEFAULT_STATE(), JSON.parse(raw));
  } catch (e) { /* はじめから */ }
  return DEFAULT_STATE();
}
function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* ほぞんできない環境 */ }
}
function record(cat, ok) {
  const s = S.stats[cat] || (S.stats[cat] = { ok: 0, ng: 0 });
  ok ? s.ok++ : s.ng++;
  save();
}
const nameOf = (id) => {
  const own = S.names[id];
  if (own && own !== CHARS[id].name) return own;
  return (CHAR_IMAGES[id] && CHAR_IMAGES[id].name) || CHARS[id].name;
};

const ITEMS = [
  { id: 'apple',   cat: 'food',  name: 'りんご',       icon: '🍎', price: 30 },
  { id: 'onigiri', cat: 'food',  name: 'おにぎり',     icon: '🍙', price: 40 },
  { id: 'milk',    cat: 'food',  name: 'ミルク',       icon: '🥛', price: 50 },
  { id: 'cookie',  cat: 'food',  name: 'クッキー',     icon: '🍪', price: 60 },
  { id: 'pudding', cat: 'food',  name: 'プリン',       icon: '🍮', price: 80 },
  { id: 'pancake', cat: 'food',  name: 'ホットケーキ', icon: '🥞', price: 90 },
  { id: 'flower',  cat: 'wear',  name: 'おはなかざり', price: 100 },
  { id: 'bow',     cat: 'wear',  name: 'おおきなリボン', price: 120 },
  { id: 'glasses', cat: 'wear',  name: 'めがね',       price: 150 },
  { id: 'apron',   cat: 'wear',  name: 'エプロン',     price: 160 },
  { id: 'muffler', cat: 'wear',  name: 'マフラー',     price: 180 },
  { id: 'hat',     cat: 'wear',  name: 'むぎわらぼうし', price: 220 },
  { id: 'crown',   cat: 'wear',  name: 'キラキラかんむり', price: 450 },
  { id: 'plant',   cat: 'room',  name: 'うえきばち',   icon: '🪴', price: 150 },
  { id: 'clock',   cat: 'room',  name: 'とけい',       icon: '⏰', price: 180 },
  { id: 'teddy',   cat: 'room',  name: 'ぬいぐるみ',   icon: '🧸', price: 220 },
  { id: 'picture', cat: 'room',  name: 'え',           icon: '🖼️', price: 260 },
  { id: 'books',   cat: 'room',  name: 'ほんだな',     icon: '📚', price: 300 },
  { id: 'sofa',    cat: 'room',  name: 'ソファ',       icon: '🛋️', price: 350 },
  { id: 'bed',     cat: 'room',  name: 'ベッド',       icon: '🛏️', price: 480 },
];
const item = (id) => ITEMS.find(i => i.id === id);

const FLAVORS = [
  { topping: '🍓', top: 'いちご',       cream: '#ffd0de', creamName: 'いちごクリーム' },
  { topping: '🫐', top: 'ブルーベリー', cream: '#ddd3f5', creamName: 'ブルーベリークリーム' },
  { topping: '🍒', top: 'さくらんぼ',   cream: '#ffffff', creamName: 'なまクリーム' },
  { topping: '🍫', top: 'チョコ',       cream: '#c99a75', creamName: 'チョコクリーム' },
  { topping: '🍑', top: 'もも',         cream: '#ffe2c6', creamName: 'ももクリーム' },
];

/* ---------- 小さな道具 ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const uniq = (arr) => [...new Set(arr)];

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.tm);
  toast.tm = setTimeout(() => t.classList.remove('show'), 2200);
}

let actx = null;
function sfx(kind) {
  if (!S.settings.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const notes = { ok: [784, 1047, 1319], ng: [330, 262], coin: [1319, 1760], tap: [880], fanfare: [523, 659, 784, 1047, 1319] }[kind] || [880];
    notes.forEach((f, i) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = kind === 'ng' ? 'triangle' : 'sine';
      o.frequency.value = f;
      const t0 = actx.currentTime + i * (kind === 'fanfare' ? 0.11 : 0.09);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.18, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.28);
      o.connect(g).connect(actx.destination);
      o.start(t0); o.stop(t0 + 0.3);
    });
  } catch (e) { /* 音なし */ }
}

function speak(text) {
  if (!S.settings.voice || !('speechSynthesis' in window)) return;
  const clean = text.replace(/[\u{1F300}-\u{1FAFF}☀-➿️]/gu, '').replace(/×/g, 'かける').replace(/dL/g, 'デシリットル').replace(/mL/g, 'ミリリットル').replace(/(\d)L/g, '$1リットル').replace(/mm/g, 'ミリ').replace(/cm/g, 'センチ').replace(/kg/g, 'キログラム').replace(/(\d)g/g, '$1グラム');
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = 'ja-JP';
  u.rate = 0.95;
  u.pitch = 1.15;
  speechSynthesis.speak(u);
}

function walletHTML() {
  return `<div class="wallet" id="wallet"><span class="purse">👛</span><b>${S.money}</b><small>円</small></div>`;
}
function bumpWallet() {
  const w = $('#wallet');
  if (!w) return;
  w.outerHTML = walletHTML();
  $('#wallet').classList.add('pop');
}

function setArea(area) {
  document.body.dataset.area = area;
  const colors = { park: '#e3f6d6', field: '#dff5d8', home: '#efe6ff', patisserie: '#fde4ef', shop: '#fff1c9', settings: '#eef2f6', start: '#efe6ff', work: '#fff3d1', pond: '#dff3ff', kanji: '#e8f0ff' };
  $('meta[name="theme-color"]').setAttribute('content', colors[area] || '#fde4ef');
}

// せいかいの おいわい: はなまる スタンプ・かみふぶき・パートナーが とびだす
let streak = 0;
function hanamaruSVG() {
  const petals = Array.from({ length: 10 }, (_, i) => `<g transform="rotate(${i * 36} 60 60)"><ellipse class="hm-petal" style="--i:${i}" cx="104" cy="60" rx="13" ry="9"/></g>`).join('');
  return `<svg viewBox="0 0 120 120"><g class="hm-petals">${petals}</g>
    <circle cx="60" cy="60" r="38" fill="#fff"/>
    <path class="hm-ring" d="M62 26 a34 34 0 1 1 -4 0.2 c16 1 26 12 27 26" fill="none" stroke="#ff4f7b" stroke-width="7" stroke-linecap="round"/>
    <text x="58" y="70" font-size="14" font-weight="bold" fill="#ff4f7b" text-anchor="middle">せいかい</text></svg>`;
}
function celebrate(first = true) {
  streak = first ? streak + 1 : 0;
  const ov = document.createElement('div');
  ov.className = 'yay' + (first ? ' big' : '');
  const words = first ? ['すごい!', 'やったね!', 'ばっちり!', 'てんさい!', 'さすが!'] : ['できたね!', 'よく がんばったね!'];
  const colors = ['#ff8fb8', '#ffd45c', '#7cc6ff', '#8fd8b8', '#b48ef0', '#ff9d3b'];
  ov.innerHTML = `<div class="yay-stamp">${hanamaruSVG()}</div>
    ${streak >= 2 ? `<div class="yay-streak">${streak} れんぞく!</div>` : ''}
    <div class="yay-confetti">${Array.from({ length: first ? 28 : 12 }, () => `<i style="background:${pick(colors)};--dx:${rnd(-220, 220)}px;--dy:${rnd(-260, -60)}px;--r:${rnd(-540, 540)}deg;--d:${(Math.random() * .25).toFixed(2)}s;${Math.random() < .4 ? 'border-radius:50%;' : ''}"></i>`).join('')}</div>
    ${S.partner ? `<div class="yay-buddy"><div class="yay-char">${charSVG(S.partner, 'happy', S.wear)}</div><span class="yay-say">${pick(words)}</span></div>` : ''}`;
  document.body.appendChild(ov);
  if (first && streak >= 3) setTimeout(() => sfx('coin'), 250);
  setTimeout(() => ov.remove(), 1500);
}

function sparkle(el, n = 14) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    s.className = 'spark';
    s.textContent = pick(['✨', '⭐', '💖', '🌟', '💫']);
    s.style.left = (r.left + r.width / 2) + 'px';
    s.style.top = (r.top + r.height / 2) + 'px';
    s.style.setProperty('--dx', rnd(-140, 140) + 'px');
    s.style.setProperty('--dy', rnd(-150, 40) + 'px');
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1100);
  }
}

/* ---------- がめん: はじめに ---------- */
function screenStart() {
  setArea('start');
  $('#app').innerHTML = `
    <div class="screen start">
      <h1 class="logo">ゆめいろタウン</h1>
      <p class="lead">いっしょに あそぶ パートナーを えらんでね</p>
      <div class="pick3">
        ${Object.keys(CHARS).map(id => `
          <button class="pickcard" data-id="${id}">
            <div class="bounce">${charSVG(id, 'happy')}</div>
            <b>${nameOf(id)}</b>
            <small>${(CHAR_IMAGES[id] && CHAR_IMAGES[id].desc) || CHARS[id].desc}</small>
          </button>`).join('')}
      </div>
    </div>`;
  $$('.pickcard').forEach(b => b.onclick = () => {
    const id = b.dataset.id;
    S.partner = id;
    save();
    sfx('fanfare');
    sparkle(b, 20);
    speak(`${nameOf(id)}と いっしょに がんばろう`);
    setTimeout(screenField, 900);
  });
}

/* ---------- がめん: タウン（フィールド） ---------- */
// ざひょうは ワールド（スクロールできる ひろい フィールド）の なかの %。land＝よこながの がめん、port＝たてながの がめん
const PLACES = {
  patisserie: { name: 'ゆめいろパティスリー', land: [20, 44], port: [27, 29] },
  shop:       { name: 'おかいもの',           land: [80, 44], port: [73, 29] },
  park:       { name: 'ひだまり こうえん',     land: [50, 38], port: [73, 93] },
  home:       { name: 'おうち',               land: [21, 89], port: [27, 55] },
  work:       { name: 'バイト＆おしゃべり',   land: [79, 89], port: [73, 55] },
  library:    { name: 'かんじの としょかん',   land: [50, 95], port: [27, 93] },
};
const SIGN_ICON = { patisserie: 'cake', shop: 'bag', park: 'flower2', home: 'heart', work: 'star', library: 'books' };
const PLAZA = { land: [50, 64], port: [50, 72] };
// ワールドの おおきさ（がめんの なんばいか）と さいていの px
const WORLD = { land: { kx: 1.6, ky: 1.5, minW: 1100, minH: 700 }, port: { kx: 1.6, ky: 1.5, minW: 580, minH: 1000 } };

// たてもの・かざりの え（SVG）
const OL = 'stroke-linejoin="round" stroke-linecap="round"';
function scallop(x, y, w, n, r, fills, stroke) {
  const step = w / n;
  return Array.from({ length: n }, (_, i) => `<path d="M${x + i * step} ${y} h${step} v${r * 0.4} a${step / 2} ${r} 0 0 1 -${step} 0z" fill="${fills[i % fills.length]}" stroke="${stroke}" stroke-width="1.5" ${OL}/>`).join('');
}
function drips(x, y, w, n, fill, stroke) {
  const s = w / n;
  let d = `M${x} ${y - 8} h${w} v8`;
  for (let i = 0; i < n; i++) d += ` q-${s / 2} ${10 + (i % 3) * 5} -${s} 0`;
  return `<path d="${d}z" fill="${fill}" stroke="${stroke}" stroke-width="1.5" ${OL}/>`;
}
function sprinkles(x, y, w, h, n) {
  const cols = ['#ff7eb0', '#7fd6c2', '#ffd45c', '#a98cf0', '#7cc6ff'];
  let s = '';
  for (let i = 0; i < n; i++) {
    const px = x + ((i * 37) % 97) / 97 * w, py = y + ((i * 53) % 89) / 89 * h, rot = (i * 47) % 180;
    s += `<rect x="${px}" y="${py}" width="6" height="2.4" rx="1.2" fill="${cols[i % 5]}" transform="rotate(${rot} ${px + 3} ${py + 1})"/>`;
  }
  return s;
}
const heartPath = (cx, cy, s) => `M${cx} ${cy + s * 0.9} C${cx - s * 1.6} ${cy - s * 0.1} ${cx - s * 0.7} ${cy - s * 1.3} ${cx} ${cy - s * 0.4} C${cx + s * 0.7} ${cy - s * 1.3} ${cx + s * 1.6} ${cy - s * 0.1} ${cx} ${cy + s * 0.9}Z`;


function registerSVG() {
  return `<svg viewBox="0 0 120 90"><rect x="8" y="40" width="104" height="46" rx="10" fill="#ffb3cc" stroke="#e57ea6" stroke-width="3"/>
    <rect x="20" y="10" width="62" height="34" rx="8" fill="#fff" stroke="#e57ea6" stroke-width="3"/><rect x="28" y="17" width="46" height="16" rx="4" fill="#c9f0e4"/>
    <text x="51" y="30" font-size="11" font-weight="bold" fill="#3f9a7d" text-anchor="middle">¥ ♡</text>
    ${[0, 1, 2].map(r => [0, 1, 2, 3].map(c => `<rect x="${22 + c * 14}" y="${50 + r * 10}" width="10" height="7" rx="2" fill="#fff"/>`).join('')).join('')}
    <rect x="84" y="50" width="20" height="26" rx="5" fill="#ffd45c" stroke="#e09520" stroke-width="2"/><path d="${heartPath(94, 62, 4)}" fill="#fff"/></svg>`;
}

function treeSVG(kind) {
  const c = { green: ['#8fd47c', '#6cb85a', '#b5e8a3'], pink: ['#ffc0d6', '#f39abb', '#ffe0ea'], mint: ['#9fe3cf', '#6cc7ad', '#cbf3e7'] }[kind];
  return `<svg viewBox="0 0 60 80"><ellipse cx="30" cy="77" rx="14" ry="3" fill="rgba(0,0,0,.1)"/><rect x="26" y="46" width="8" height="30" rx="3" fill="#c99a6b" stroke="#a87a4e" stroke-width="2"/>
    <circle cx="30" cy="30" r="24" fill="${c[0]}" stroke="${c[1]}" stroke-width="2.5"/><circle cx="21" cy="22" r="7" fill="${c[2]}"/>
    ${kind === 'pink' ? '<circle cx="38" cy="36" r="3" fill="#fff"/><circle cx="22" cy="40" r="2.5" fill="#fff"/>' : '<circle cx="40" cy="34" r="3" fill="#ff7e8e"/><circle cx="24" cy="40" r="3" fill="#ff7e8e"/>'}</svg>`;
}
function flowerSVG(col) {
  return `<svg viewBox="0 0 30 34"><path d="M15 18 v14" stroke="#6cb85a" stroke-width="2.5"/><ellipse cx="10" cy="28" rx="5" ry="2.5" fill="#8fd47c" transform="rotate(-30 10 28)"/>
    <g fill="${col}">${[0, 72, 144, 216, 288].map(a => `<circle cx="${15 + 6 * Math.sin(a * Math.PI / 180)}" cy="${12 - 6 * Math.cos(a * Math.PI / 180)}" r="5"/>`).join('')}</g><circle cx="15" cy="12" r="3.5" fill="#ffe680"/></svg>`;
}
function garlandSVG(n = 14) {
  const cols = ['#ff9fc1', '#ffd45c', '#8fdcc8', '#a98cf0', '#7cc6ff'];
  const w = 100 / n;
  return `<svg class="garland" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 1 Q50 6 100 1" fill="none" stroke="#c9a" stroke-width=".4"/>
    ${Array.from({ length: n }, (_, i) => { const x = i * w + w * 0.15, y = 1 + 5 * (1 - Math.pow((i * w + w / 2 - 50) / 50, 2)) * 0.95; return `<path d="M${x} ${y - 0.6} h${w * 0.7} l-${w * 0.35} 4z" fill="${cols[i % 5]}"/>`; }).join('')}</svg>`;
}


let walkerPos = null;
function screenField(msg) {
  setArea('field');
  $('#app').innerHTML = `
    <div class="screen fieldscreen">
      <header class="bar">
        <button class="iconbtn gear" id="gear" aria-label="おうちのひと">⚙️</button>
        <h2>ゆめいろタウン</h2>
        ${walletHTML()}
      </header>
      <div class="field" id="field">
        <div class="fscroll" id="fscroll"><div class="world" id="world">
          <div id="fscene"></div>
          <div class="cloud c1"></div><div class="cloud c2"></div><div class="cloud c3"></div><div class="cloud c4"></div>
          ${garlandSVG(26)}
          <button class="pond" id="plaza" aria-label="いけ">${pondSVG()}</button>
          <div id="blds"></div>
          <div class="walker" id="walker"><div class="wflip"><div class="wbody">${charSVG(S.partner, 'happy', S.wear)}</div></div><div class="wbubble" id="wbubble"></div></div>
        </div></div>
        <p class="fieldhint">タップで いどう・ゆびで スクロール</p>
      </div>
    </div>`;
  const field = $('#field'), scroller = $('#fscroll'), world = $('#world');
  const mode = () => (field.clientWidth > field.clientHeight * 1.1 ? 'land' : 'port');
  let m = mode();
  const others = Object.keys(CHARS).filter(id => id !== S.partner);
  const friends = others.map((id, i) => {
    const el = document.createElement('div');
    el.className = 'walker friend-w';
    el.innerHTML = `<div class="wflip"><div class="wbody">${charSVG(id, 'normal')}</div></div><div class="wbubble"></div>`;
    world.appendChild(el);
    el.onclick = (e) => { e.stopPropagation(); say(el, pick([`${nameOf(id)}だよ!`, 'こんにちは〜', 'いっしょに あそぼ!', 'ケーキ たべたいな']), 2000); sfx('tap'); };
    return { id, el, pos: null };
  });

  function layout() {
    m = mode();
    const wd = WORLD[m];
    world.style.width = Math.round(Math.max(wd.minW, field.clientWidth * wd.kx)) + 'px';
    world.style.height = Math.round(Math.max(wd.minH, field.clientHeight * wd.ky)) + 'px';
    const pz = PLAZA[m];
    $('#plaza').style.left = pz[0] + '%'; $('#plaza').style.top = pz[1] + '%';
    $('#blds').innerHTML = Object.entries(PLACES).map(([id, p]) => `
      <button class="bld ${p.locked ? 'locked' : ''}" data-place="${id}" style="left:${p[m][0]}%;top:${p[m][1]}%;z-index:${p[m][1]}">
        ${buildingSVG(id)}<span class="bname s-${id}"><span class="bn-ic">${iconSVG(SIGN_ICON[id])}</span>${p.name}</span>
      </button>`).join('');
    $$('.bld').forEach(b => b.onclick = (e) => { e.stopPropagation(); if (dragged()) return; goPlace(b.dataset.place); });
    $('#fscene').innerHTML = fieldSceneSVG(world, m);
    if (!walkerPos || walkerPos.m !== m) walkerPos = { m, x: pz[0] + (m === 'land' ? -9 : 0), y: pz[1] + (m === 'land' ? 11 : 10) };
    place($('#walker'), walkerPos.x, walkerPos.y);
    friends.forEach((f, i) => { f.pos = { x: pz[0] + (i ? 16 : -16), y: pz[1] + 5 }; place(f.el, f.pos.x, f.pos.y); });
  }
  // カメラ: キャラが がめんの そとに でそうなら ゆっくり おいかける
  function follow(x, y, force) {
    const px = x / 100 * world.clientWidth, py = y / 100 * world.clientHeight;
    const vx = px - scroller.scrollLeft, vy = py - scroller.scrollTop, vw = scroller.clientWidth, vh = scroller.clientHeight;
    if (!force && vx > vw * .18 && vx < vw * .82 && vy > vh * .2 && vy < vh * .85) return;
    scroller.scrollTo({ left: px - vw / 2, top: py - vh * .55, behavior: force === 'now' ? 'auto' : 'smooth' });
  }
  // マウスでの ドラッグ（ゆびは ブラウザの スクロールを そのまま つかう）
  let drag = null, dragEnd = 0;
  const dragged = () => Date.now() - dragEnd < 250;
  scroller.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse' || e.button !== 0) return; drag = { x: e.clientX, y: e.clientY, l: scroller.scrollLeft, t: scroller.scrollTop, moved: false }; });
  addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 8) return;
    drag.moved = true; scroller.classList.add('dragging');
    scroller.scrollLeft = drag.l - dx; scroller.scrollTop = drag.t - dy;
  });
  addEventListener('pointerup', () => { if (drag && drag.moved) dragEnd = Date.now(); drag = null; scroller.classList.remove('dragging'); });
  function place(el, x, y) { el.style.transition = 'none'; el.style.left = x + '%'; el.style.top = y + '%'; el.style.zIndex = Math.round(y); }
  function walk(el, from, x, y, cb) {
    const dx = (x - from.x) * world.clientWidth / 100, dy = (y - from.y) * world.clientHeight / 100;
    const dur = Math.max(0.25, Math.hypot(dx, dy) / 260);
    if (Math.abs(dx) > 4) el.querySelector('.wflip').style.transform = dx < 0 ? 'scaleX(-1)' : '';
    el.classList.add('walking');
    void el.offsetWidth;
    el.style.transition = `left ${dur}s linear, top ${dur}s linear`;
    el.style.left = x + '%'; el.style.top = y + '%'; el.style.zIndex = Math.round(Math.max(y, from.y));
    from.x = x; from.y = y;
    clearTimeout(el._tm);
    el._tm = setTimeout(() => { el.classList.remove('walking'); el.style.zIndex = Math.round(y); cb && cb(); }, dur * 1000);
  }
  function say(el, text, ms = 2600) {
    const b = el.querySelector('.wbubble');
    b.textContent = text; b.classList.add('show');
    clearTimeout(b._tm); b._tm = setTimeout(() => b.classList.remove('show'), ms);
  }
  let busy = false;
  function goPlace(id) {
    if (busy) return;
    const p = PLACES[id];
    sfx('tap');
    busy = true;
    follow(p[m][0], p[m][1] - 6);
    walk($('#walker'), walkerPos, p[m][0], p[m][1] + 3, () => {
      busy = false;
      if (p.locked) { say($('#walker'), 'ここは まだ じゅんびちゅう みたい'); return; }
      const el = $(`.bld[data-place="${id}"]`);
      el.classList.add('enter');
      sfx('ok');
      setTimeout(() => {
        walkerPos.y += 4;
        if (id === 'patisserie') screenPatisserie();
        else if (id === 'shop') screenShop();
        else if (id === 'park') screenPark();
        else if (id === 'work') screenWork();
        else if (id === 'library') screenKanji();
        else screenHome();
      }, 380);
    });
  }
  $('#plaza').onclick = (e) => {
    e.stopPropagation();
    if (busy || dragged()) return;
    busy = true; sfx('tap');
    const pz = PLAZA[m];
    walk($('#walker'), walkerPos, pz[0] + (m === 'land' ? 9 : 14), pz[1] + 2, () => { busy = false; sfx('ok'); setTimeout(screenFishing, 250); });
  };
  world.onclick = (e) => {
    if (busy || dragged()) return;
    const r = world.getBoundingClientRect();
    const x = Math.min(97, Math.max(3, (e.clientX - r.left) / r.width * 100));
    const y = Math.min(98, Math.max(16, (e.clientY - r.top) / r.height * 100));
    walk($('#walker'), walkerPos, x, y);
  };
  $('#walker').onclick = (e) => {
    e.stopPropagation();
    const w = $('#walker .wbody');
    w.classList.remove('jump'); void w.offsetWidth; w.classList.add('jump');
    say($('#walker'), pick(['えへへ♪', 'どこに いく?', 'だいすき!', 'ケーキ つくろう!', 'おかいもの いきたいな']));
    sfx('tap');
  };

  layout();
  follow(PLAZA[m][0], PLAZA[m][1] - 7, 'now');
  say($('#walker'), msg || petWish() || pick(['きょうは どこに いく?', `${nameOf(S.partner)}だよ! いこう!`, 'いいてんき〜']), 3000);
  // ともだちが うろうろ
  const tick = () => {
    if (!document.body.contains(field)) return;
    const f = pick(friends), pz = PLAZA[m];
    walk(f.el, f.pos, Math.min(92, Math.max(8, pz[0] + rnd(-22, 22))), Math.min(96, Math.max(24, pz[1] + rnd(-12, 10))));
    setTimeout(tick, rnd(2200, 4200));
  };
  setTimeout(tick, 1500);
  let rsz = 0;
  const onResize = () => {
    if (!document.body.contains(field)) { removeEventListener('resize', onResize); return; }
    clearTimeout(rsz);
    rsz = setTimeout(() => { if (!document.body.contains(field)) return; layout(); follow(walkerPos.x, walkerPos.y - 8, 'now'); }, 180);
  };
  addEventListener('resize', onResize);
  longPress($('#gear'), screenSettings, () => toast('おうちのひとは ながおし してね'));
}

/* ---------- がめん: おうち ---------- */

/* ---------- そだてる（パートナー） ---------- */
const LEVELS = [0, 30, 80, 150, 250];
const STAGE_NAMES = ['ベビー', 'キッズ', 'キラキラ', 'ようせい', 'プリンセス'];
const FOOD_POWER = { apple: 15, onigiri: 25, milk: 15, cookie: 20, pudding: 30, pancake: 35 };

function pet() {
  if (!S.pet) S.pet = { xp: 0, hunger: 70, clean: 80, energy: 80, last: Date.now(), pats: 0, patDay: '' };
  const p = S.pet, now = Date.now(), min = (now - (p.last || now)) / 60000;
  if (min > 1) {
    p.hunger = Math.max(0, p.hunger - min / 6);
    p.clean = Math.max(0, p.clean - min / 10);
    p.energy = Math.max(0, p.energy - min / 8);
    p.last = now;
  }
  return p;
}
const petLevel = () => { const xp = pet().xp; let lv = 0; LEVELS.forEach((t, i) => { if (xp >= t) lv = i; }); return lv; };
function petMood() {
  const p = pet();
  if (p.energy < 25) return 'sleepy';
  if (p.hunger < 25 || p.clean < 20) return 'sad';
  return 'happy';
}
function petWish() {
  const p = pet();
  if (p.hunger < 25) return 'おなか すいたよ…';
  if (p.energy < 25) return 'ねむたいなあ…';
  if (p.clean < 20) return 'おふろ はいりたいな';
  return null;
}
// けいけんちを ふやす。レベルアップしたら へんしん
function addXP(n) {
  const before = petLevel();
  pet().xp += n;
  save();
  const after = petLevel();
  if (after > before) setTimeout(() => levelUpFx(after), 600);
}
function levelUpFx(lv) {
  const ov = document.createElement('div');
  ov.className = 'levelup';
  ov.innerHTML = `<div class="lu-rays"></div>
    <div class="lu-char lu-before">${charSVG(S.partner, 'happy', S.wear, lv - 1)}</div>
    <div class="lu-char lu-after">${charSVG(S.partner, 'happy', S.wear, lv)}</div>
    <div class="lu-text"><b>レベルアップ!</b><span>${nameOf(S.partner)}が 「${STAGE_NAMES[lv]}」に へんしん したよ!</span></div>
    <button class="btn ok">やったー!</button>`;
  document.body.appendChild(ov);
  sfx('fanfare');
  setTimeout(() => sfx('fanfare'), 1500);
  setTimeout(() => sparkle(ov.querySelector('.lu-after'), 30), 1500);
  speak(`レベルアップ! ${nameOf(S.partner)}が ${STAGE_NAMES[lv]}に へんしん したよ`);
  ov.querySelector('button').onclick = () => { ov.remove(); if (document.body.dataset.area === 'home') screenHome('みて みて! かわったでしょ?'); };
}

function barHTML(label, icon, val, cls) {
  return `<div class="stat ${cls}"><span class="st-ic">${icon}</span><span class="st-l">${label}</span><span class="st-bar"><i style="width:${Math.round(val)}%"></i></span></div>`;
}

function screenHome(msg) {
  setArea('home');
  const p = S.partner, pt = pet(), lv = petLevel();
  const foods = ITEMS.filter(i => i.cat === 'food' && S.food[i.id] > 0);
  const clothes = ITEMS.filter(i => i.cat === 'wear' && S.owned.includes(i.id));
  const next = LEVELS[lv + 1];
  const xpPct = next ? (pt.xp - LEVELS[lv]) / (next - LEVELS[lv]) * 100 : 100;
  const mood = petMood();
  save();
  $('#app').innerHTML = `
    <div class="screen home">
      <header class="bar">
        <button class="iconbtn" id="back" aria-label="まちへ">🗺️</button>
        <h2>${nameOf(p)}の おへや</h2>
        ${walletHTML()}
      </header>
      <div class="layout">
        ${roomHTML(`
          <div class="partner ${mood === 'sleepy' ? 'sway' : 'bounce'} ${pt.clean < 20 ? 'dirty' : ''}" id="partner">${charSVG(p, mood, S.wear)}</div>
          <div class="bubble" id="pbubble">${msg || petWish() || pick(['きょうは なにして あそぶ?', 'なでなで して〜', 'ケーキ つくりに いこう!', `${nameOf(p)}だよ! よろしくね`])}</div>`)}
        <section class="menu" id="homemenu">
          <div class="mini homeacts">
            <button class="btn sub" id="decor">🛋️ もようがえ</button>
            <button class="btn pink" id="invite">🏠 ともだちを よぶ</button>
          </div>
          <div class="mini visitcard hidden" id="visitcard">
            <h3>🎉 ともだちが きてるよ</h3>
            <div class="row"><button class="btn sub" id="v-talk">💬 おしゃべり</button><button class="btn sub" id="v-bye">👋 ばいばい</button></div>
            <p class="muted">おやつを えらぶと みんなで パーティ!</p>
            <div class="chips">${foods.length ? foods.map(f => `<button class="chip" data-party="${f.id}">${f.icon}<small>×${S.food[f.id]}</small></button>`).join('') : '<p class="muted">おやつは おかいもので かえるよ</p>'}</div>
          </div>
          <div class="mini petcard">
            <div class="lvrow"><span class="lv">Lv.${lv + 1}</span><b>${STAGE_NAMES[lv]}</b><span class="xpbar"><i style="width:${xpPct}%"></i></span><small>${next ? `あと ${next - pt.xp}` : 'MAX'}</small></div>
            ${barHTML('おなか', '🍙', pt.hunger, 'h')}
            ${barHTML('きれい', '💧', pt.clean, 'c')}
            ${barHTML('げんき', '⭐', pt.energy, 'e')}
            <div class="care">
              <button class="carebtn" data-care="bath"><span>🛁</span>おふろ</button>
              <button class="carebtn" data-care="sleep"><span>🌙</span>ねる</button>
              <button class="carebtn" data-care="pat"><span>💖</span>なでる</button>
            </div>
          </div>
          <div class="mini">
            <h3>🍽️ ごはんを あげる</h3>
            <div class="chips">${foods.length ? foods.map(f => `<button class="chip" data-food="${f.id}">${f.icon}<small>×${S.food[f.id]}</small></button>`).join('') : '<p class="muted">おかいもので かえるよ</p>'}</div>
          </div>
          <div class="mini">
            <h3>👗 きせかえ</h3>
            <div class="chips">${clothes.length ? clothes.map(c => `<button class="chip wear ${S.wear.includes(c.id) ? 'on' : ''}" data-wear="${c.id}">${c.name}</button>`).join('') : '<p class="muted">ふくは まだ ないよ</p>'}</div>
          </div>
        </section>
      </div>
    </div>`;

  $('#back').onclick = () => screenField();
  const roomCtl = initRoom();
  let visit = null;
  $('#decor').onclick = () => {
    sfx('tap');
    const menu = $('#homemenu');
    const keep = menu.innerHTML;
    menu.innerHTML = decorPanelHTML();
    roomCtl.setEditing(true);
    const rs = roomState();
    $$('[data-show]', menu).forEach(b => b.onclick = () => {
      const id = b.dataset.show;
      rs.hide = rs.hide.includes(id) ? rs.hide.filter(h => h !== id) : [...rs.hide, id];
      save(); sfx('tap');
      screenHome(); $('#decor').click();
    });
    $$('[data-wall]', menu).forEach(b => b.onclick = () => { rs.wall = b.dataset.wall; save(); sfx('tap'); screenHome(); $('#decor').click(); });
    $$('[data-floor]', menu).forEach(b => b.onclick = () => { rs.floor = b.dataset.floor; save(); sfx('tap'); screenHome(); $('#decor').click(); });
    $('#decorDone').onclick = () => { roomCtl.setEditing(false); sfx('ok'); screenHome('すてきな おへやに なったね!'); };
    void keep;
  };
  $('#invite').onclick = () => {
    if (visit) return;
    visit = startVisit(() => { visit = null; $('#visitcard').classList.add('hidden'); $('.homeacts').classList.remove('hidden'); });
    $('.homeacts').classList.add('hidden');
    $('#visitcard').classList.remove('hidden');
  };
  $('#v-talk').onclick = () => visit && visit.talk();
  $('#v-bye').onclick = () => visit && visit.bye();
  $$('[data-party]').forEach(b => b.onclick = () => {
    if (!visit || !(S.food[b.dataset.party] > 0)) return;
    visit.party(b.dataset.party);
    const n = S.food[b.dataset.party];
    b.querySelector('small').textContent = '×' + n;
    if (!n) b.remove();
  });
  $('#partner').onclick = () => care('pat');
  $$('[data-care]').forEach(b => b.onclick = () => care(b.dataset.care));
  $$('[data-food]').forEach(b => b.onclick = () => feed(b.dataset.food));
  $$('[data-wear]').forEach(b => b.onclick = () => {
    const id = b.dataset.wear;
    S.wear = S.wear.includes(id) ? S.wear.filter(w => w !== id) : [...S.wear, id];
    save();
    sfx('tap');
    screenHome(S.wear.includes(id) ? 'にあう? えへへ' : 'ぬいだよ');
  });
}

let caring = false;
function care(kind) {
  if (caring) return;
  const pt = pet(), el = $('#partner'), room = $('#room');
  if (kind === 'pat') {
    const today = new Date().toDateString();
    if (pt.patDay !== today) { pt.patDay = today; pt.pats = 0; }
    el.classList.remove('jump'); void el.offsetWidth; el.classList.add('jump');
    sfx('tap');
    sparkle(el, 5);
    $('#pbubble').textContent = pick(['えへへ♪', 'くすぐったい〜', 'だいすき!', 'もっと なでて〜']);
    if (pt.pats < 10) { pt.pats++; addXP(1); }
    save();
    return;
  }
  caring = true;
  if (kind === 'bath') {
    room.classList.add('bathing');
    room.insertAdjacentHTML('beforeend', `<div class="bubbles">${Array.from({ length: 16 }, (_, i) => `<i style="left:${rnd(5, 90)}%;animation-delay:${(i * 0.12).toFixed(2)}s;width:${rnd(14, 34)}px"></i>`).join('')}</div>`);
    $('#pbubble').textContent = 'あわあわ〜 ♪';
    sfx('ok');
    setTimeout(() => {
      const gain = pt.clean < 70 ? 4 : 1;
      pt.clean = 100; save(); addXP(gain); caring = false;
      screenHome('さっぱり! ピカピカだよ');
    }, 2600);
  } else if (kind === 'sleep') {
    room.classList.add('night');
    el.innerHTML = charSVG(S.partner, 'sleepy', S.wear);
    $('#pbubble').textContent = 'おやすみ… すやすや';
    setTimeout(() => {
      const gain = pt.energy < 70 ? 4 : 1;
      pt.energy = 100; save(); addXP(gain); caring = false;
      screenHome('おはよう! げんき いっぱい!');
    }, 3000);
  }
}

function feed(id) {
  if (!(S.food[id] > 0) || caring) return;
  caring = true;
  S.food[id]--;
  const pt = pet();
  const full = pt.hunger >= 95;
  pt.hunger = Math.min(100, pt.hunger + (FOOD_POWER[id] || 20));
  save();
  const p = $('#partner');
  p.classList.remove('bounce');
  p.classList.add('chew');
  p.innerHTML = charSVG(S.partner, 'happy', S.wear) + `<span class="eating">${item(id).icon}</span>`;
  $('#pbubble').textContent = 'もぐもぐ… おいしい!';
  sfx('coin');
  setTimeout(() => { sparkle(p, 10); sfx('ok'); }, 1300);
  setTimeout(() => { caring = false; addXP(full ? 1 : 5); screenHome(full ? 'もう おなか いっぱい〜' : 'ごちそうさま! おいしかった♪'); }, 2200);
}

function longPress(el, onLong, onShort) {
  let tm = null, fired = false;
  const start = (e) => { e.preventDefault(); fired = false; tm = setTimeout(() => { fired = true; onLong(); }, 1200); };
  const end = () => { clearTimeout(tm); if (!fired && onShort) onShort(); };
  el.addEventListener('touchstart', start, { passive: false });
  el.addEventListener('touchend', end);
  el.addEventListener('mousedown', start);
  el.addEventListener('mouseup', end);
  el.addEventListener('mouseleave', () => clearTimeout(tm));
}

/* ---------- もんだいの部品 ---------- */
// q = {kind:'keypad'|'choice'|'build', cat, title, text, visual, answer, suffix, options, units, target, hints:[], reveal}
function askQuestion(el, q, done, opts = {}) {
  let tries = 0, typed = '', pieces = [];
  window.__lastQ = q; // テスト用
  el.innerHTML = `
    <div class="qcard">
      <div class="qhead"><span class="qtitle">${q.title}</span><button class="iconbtn say" aria-label="よみあげ">🔊</button></div>
      <p class="qtext">${q.text}</p>
      ${q.visual ? `<div class="qvisual">${q.visual}</div>` : ''}
      <div class="qhint" aria-live="polite"></div>
      <div class="qanswer"></div>
      ${opts.skippable ? '<button class="linkbtn skip">きょうは パスする</button>' : ''}
    </div>`;
  const ans = $('.qanswer', el), hint = $('.qhint', el);
  $('.say', el).onclick = () => speak(q.speak || q.text.replace(/<[^>]+>/g, ''));
  if (opts.skippable) $('.skip', el).onclick = () => done(null);

  if (q.kind === 'keypad') {
    ans.innerHTML = `
      <div class="kp-display"><span class="kp-val"></span><span class="kp-suf">${q.suffix || ''}</span></div>
      <div class="keypad">
        ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-k="${n}">${n}</button>`).join('')}
        <button data-k="del" class="kdel">けす</button><button data-k="0">0</button><button data-k="ok" class="kok">こたえる</button>
      </div>`;
    const show = () => { $('.kp-val', el).textContent = typed || '?'; };
    show();
    $$('.keypad button', el).forEach(b => b.onclick = () => {
      const k = b.dataset.k;
      if (k === 'del') typed = typed.slice(0, -1);
      else if (k === 'ok') { if (typed) check(Number(typed) === q.answer); return; }
      else if (typed.length < 4) typed = (typed === '0' ? '' : typed) + k;
      sfx('tap');
      show();
    });
  } else if (q.kind === 'choice') {
    ans.innerHTML = `<div class="choices">${q.options.map(o => `<button class="choice" data-v="${o}">${o}</button>`).join('')}</div>`;
    $$('.choice', el).forEach(b => b.onclick = () => {
      const ok = b.dataset.v === String(q.answer);
      if (!ok) b.classList.add('wrong');
      check(ok, b);
    });
  } else if (q.kind === 'build') {
    ans.innerHTML = `
      <div class="bowl ${q.bowlClass || ''}"><div class="bowl-in"></div><span class="bowl-label">${q.bowlLabel || ''}</span></div>
      <div class="units">${q.units.map((u, i) => `<button class="unitbtn" data-u="${i}">${u.html}<small>${u.label}</small></button>`).join('')}</div>
      <div class="row"><button class="btn sub undo">ひとつ もどす</button><button class="btn ok finish">できた!</button></div>`;
    const draw = () => { $('.bowl-in', el).innerHTML = pieces.map(i => `<span class="piece">${q.units[i].html}</span>`).join(''); };
    $$('.unitbtn', el).forEach(b => b.onclick = () => { if (pieces.length < 30) { pieces.push(+b.dataset.u); sfx('tap'); draw(); } });
    $('.undo', el).onclick = () => { pieces.pop(); draw(); };
    $('.finish', el).onclick = () => {
      if (!pieces.length) return;
      const sum = pieces.reduce((s, i) => s + q.units[i].value, 0);
      check(sum === q.target);
    };
  }

  if (q.kind === 'array') {
    // トッピングを 1れつずつ ならべる（九九の かぞえあげ）
    let rows = 0;
    ans.innerHTML = `
      <div class="arraycake"><div class="arows"></div></div>
      <div class="row"><button class="btn sub minus">1れつ へらす</button><button class="btn pink plus">＋ ${q.per}こ のせる</button></div>
      <div class="row"><button class="btn ok finish">できた!</button></div>`;
    const draw = () => {
      $('.arows', el).innerHTML = Array.from({ length: rows }, (_, i) => `<div class="arow"><span class="acount">${q.per * (i + 1)}</span>${Array.from({ length: q.per }, () => `<span>${q.emoji}</span>`).join('')}</div>`).join('') || '<p class="muted">まだ なにも のってないよ</p>';
    };
    draw();
    $('.plus', el).onclick = () => { if (rows < 12) { rows++; sfx('tap'); draw(); } };
    $('.minus', el).onclick = () => { if (rows > 0) { rows--; draw(); } };
    $('.finish', el).onclick = () => { if (rows) check(rows * q.per === q.target); };
    pieces = { reset: () => { rows = 0; draw(); } };
  } else if (q.kind === 'pour') {
    // ながおしで そそぐ
    let level = 0, tm = null;
    ans.innerHTML = `
      <div class="pourwrap">
        <div class="jug" aria-hidden="true"><div class="jugbody" style="background:${q.color}"></div><div class="stream"></div></div>
        <div class="mcup"><div class="mfill" style="background:${q.color}"></div>${Array.from({ length: 10 }, (_, i) => `<span class="mline" style="bottom:${(i + 1) * 10}%">${i + 1 === 10 ? '1L' : i + 1 === 5 ? '5dL' : ''}</span>`).join('')}<small>1L ます</small></div>
      </div>
      <div class="row"><button class="btn sub less">すこし もどす</button><button class="btn pink pour">ながおしで そそぐ</button></div>
      <div class="row"><button class="btn ok finish">できた!</button></div>`;
    const draw = () => { $('.mfill', el).style.height = level * 10 + '%'; };
    const stop = () => { clearInterval(tm); tm = null; el.querySelector('.pourwrap').classList.remove('pouring'); };
    const start = (e) => {
      e.preventDefault();
      if (tm) return;
      el.querySelector('.pourwrap').classList.add('pouring');
      tm = setInterval(() => {
        if (level >= 10) { stop(); toast('いっぱいだよ!'); return; }
        level++; sfx('tap'); draw();
      }, 450);
    };
    const pb = $('.pour', el);
    ['pointerdown'].forEach(ev => pb.addEventListener(ev, start));
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => pb.addEventListener(ev, stop));
    $('.less', el).onclick = () => { if (level > 0) { level--; draw(); } };
    $('.finish', el).onclick = () => { stop(); if (level) check(level === q.target); };
    pieces = { reset: () => { stop(); level = 0; draw(); } };
  } else if (q.kind === 'slider') {
    // ナイフを うごかして きる
    let mm = 20;
    ans.innerHTML = `
      <div class="cutwrap"><svg class="cutsvg" viewBox="0 -18 600 138"></svg>
      <input type="range" class="knife" min="0" max="130" step="1" value="${mm}" aria-label="ナイフ"></div>
      <div class="row"><button class="btn sub nudge" data-d="-1">◀ 1mm</button><button class="btn sub nudge" data-d="1">1mm ▶</button></div>
      <p class="muted center nudge-tip">ボタンを ながおしすると 1cmずつ うごくよ</p>
      <div class="row"><button class="btn ok finish">ここで きる!</button></div>`;
    const draw = () => {
      const x0 = 20, sc = 4, x = x0 + mm * sc;
      let t = '';
      for (let i = 0; i <= 130; i++) {
        const h = i % 10 === 0 ? 22 : i % 5 === 0 ? 15 : 9;
        t += `<line x1="${x0 + i * sc}" y1="72" x2="${x0 + i * sc}" y2="${72 + h}" stroke="#7a5a3a" stroke-width="${i % 10 === 0 ? 1.6 : 1}"/>`;
        if (i % 10 === 0) t += `<text x="${x0 + i * sc}" y="112" font-size="13" text-anchor="middle" fill="#7a5a3a">${i / 10}</text>`;
      }
      $('.cutsvg', el).innerHTML = `
        <rect x="${x0}" y="22" width="${130 * sc}" height="42" rx="8" fill="#f6d79b" stroke="#d8ad62" stroke-width="2"/>
        <rect x="${x0}" y="22" width="${130 * sc}" height="12" rx="6" fill="${q.color}"/>
        <rect x="${x0}" y="22" width="${mm * sc}" height="42" rx="8" fill="rgba(255,143,184,.25)"/>
        <rect x="${x0 - 12}" y="68" width="${130 * sc + 24}" height="50" rx="6" fill="#fff6d6" stroke="#e1c27b" stroke-width="2"/>${t}
        <g transform="translate(${x} 0)"><line x1="0" y1="14" x2="0" y2="70" stroke="#ff5a6e" stroke-width="3" stroke-dasharray="5 4"/>
        <path d="M-9 -2 h18 v14 l-9 6 l-9 -6z" fill="#dfe6ee" stroke="#5b4040" stroke-width="2" stroke-linejoin="round"/><rect x="-5" y="-14" width="10" height="13" rx="3" fill="#ff9fc1" stroke="#5b4040" stroke-width="2"/></g>`;
      $('.knife', el).value = mm;
    };
    draw();
    $('.knife', el).oninput = (e) => { mm = +e.target.value; draw(); };
    // タップで 1mm、ながおしで 1cmずつ
    const move = (d) => { const nm = Math.max(0, Math.min(130, mm + d)); if (nm !== mm) { mm = nm; sfx('tap'); draw(); } };
    $$('.nudge', el).forEach(b => {
      const d = +b.dataset.d;
      let hold = null, rep = null, long = false;
      const end = () => { clearTimeout(hold); clearInterval(rep); hold = rep = null; };
      b.addEventListener('pointerdown', (e) => {
        e.preventDefault(); end(); long = false;
        hold = setTimeout(() => { long = true; b.classList.add('holding'); move(d * 10); rep = setInterval(() => move(d * 10), 420); }, 380);
      });
      b.addEventListener('pointerup', () => { const wasLong = long; end(); b.classList.remove('holding'); if (!wasLong) move(d); });
      ['pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, () => { end(); b.classList.remove('holding'); }));
      b.addEventListener('contextmenu', (e) => e.preventDefault());
    });
    $('.finish', el).onclick = () => check(mm === q.target);
  }

  if (q.kind === 'setclock') {
    let hh = 12, mm = 0;
    ans.innerHTML = `
      <div class="setclock"><div class="sc-face"></div>
        <div class="sc-ctrl">
          <div class="sc-row"><span class="sc-l short">みじかい はり（じ）</span><button class="btn sub" data-a="h-">−</button><button class="btn sub" data-a="h+">＋</button></div>
          <div class="sc-row"><span class="sc-l long">ながい はり（ふん）</span><button class="btn sub" data-a="m-">−5</button><button class="btn sub" data-a="m+">＋5</button></div>
        </div></div>
      <div class="row"><button class="btn ok finish">これで OK!</button></div>`;
    const draw = () => { $('.sc-face', el).innerHTML = clockSVG(hh, mm, { color: '#9fe3cf' }); };
    draw();
    $$('[data-a]', el).forEach(b => b.onclick = () => {
      const a = b.dataset.a;
      if (a === 'h+') hh = hh % 12 + 1;
      if (a === 'h-') hh = (hh + 10) % 12 + 1;
      if (a === 'm+') { mm += 5; if (mm === 60) { mm = 0; hh = hh % 12 + 1; } }
      if (a === 'm-') { mm -= 5; if (mm < 0) { mm = 55; hh = (hh + 10) % 12 + 1; } }
      sfx('tap'); draw();
    });
    $('.finish', el).onclick = () => check(hh === q.h && mm === q.m);
  }

  function check(ok, btn) {
    if (ok) {
      sfx('ok');
      record(q.cat, tries === 0);
      el.querySelector('.qcard').classList.add('correct');
      hint.innerHTML = `<span class="maru">⭕</span> ${pick(['せいかい!', 'すごい!', 'やったね!', 'ばっちり!'])}`;
      sparkle(btn || hint, 8);
      celebrate(tries === 0);
      $$('button', ans).forEach(b => b.disabled = true);
      setTimeout(() => done(tries === 0), 1400);
      return;
    }
    tries++;
    streak = 0;
    sfx('ng');
    typed = '';
    if (q.kind === 'keypad') $('.kp-val', el).textContent = '?';
    if (q.kind === 'build') { pieces = []; $('.bowl-in', el).innerHTML = ''; }
    if (pieces && pieces.reset) pieces.reset();
    if (opts.onWrong) opts.onWrong(tries);
    if (tries <= (q.hints || []).length) {
      hint.innerHTML = `💡 ${q.hints[tries - 1]}`;
    } else {
      record(q.cat, false);
      hint.innerHTML = `💡 こたえは <b>${q.reveal}</b> だよ。つぎは できるよ!`;
      $$('button', ans).forEach(b => b.disabled = true);
      const nx = document.createElement('button');
      nx.className = 'btn ok';
      nx.textContent = 'わかった!';
      nx.onclick = () => done(false);
      hint.appendChild(nx);
    }
    el.querySelector('.qcard').classList.remove('shake'); void el.offsetWidth;
    el.querySelector('.qcard').classList.add('shake');
  }
}

/* ---------- もんだいづくり ---------- */
function genKuku(flavor) {
  const a = pick(S.settings.dans.length ? S.settings.dans : [2, 3, 4, 5]);
  const b = rnd(2, 9);
  const steps = Array.from({ length: b - 1 }, (_, i) => a * (i + 1)).join(', ');
  const r = Math.random();
  if (r < 0.35) {
    return {
      kind: 'array', cat: 'kuku', title: '① トッピング（九九）', per: a, target: a * b, emoji: flavor.topping,
      text: `${flavor.top}${flavor.topping}を ぜんぶで <b>${a * b}こ</b> のせてね。<b>${a}こずつ</b> ならべよう!`,
      speak: `${flavor.top}を ぜんぶで ${a * b}こ のせてね。${a}こずつ ならべよう`,
      hints: [`${a}のだんで かぞえよう。${a}, ${a * 2}, ${a * 3}, …`, `${a} × □ = ${a * b}。□は いくつ?`],
      reveal: `${b}れつ（${a} × ${b} = ${a * b}）`,
    };
  }
  if (r < 0.55) {
    const right = `${a} × ${b}`;
    const opts = uniq([right, `${a} ＋ ${b}`, `${a} × ${b + 1}`, `${a + 1} × ${b}`]);
    return {
      kind: 'choice', cat: 'kuku', title: '① トッピング（九九）',
      text: `${flavor.top}${flavor.topping}の ならびかたに あう しきは どれ?`,
      speak: `${flavor.top}の ならびかたに あう しきは どれ?`,
      visual: `<div class="dots" style="--cols:${a};--fs:${a * b > 40 ? 15 : a * b > 20 ? 19 : 24}px">${Array.from({ length: a * b }, () => `<span>${flavor.topping}</span>`).join('')}</div>`,
      answer: right, options: shuffle(opts),
      hints: [`よこに ${a}こ、それが なんれつ あるかな?`],
      reveal: `${a} × ${b}（${a}こずつ ${b}れつ）`,
    };
  }
  return {
    kind: 'keypad', cat: 'kuku', suffix: 'こ', title: '① トッピング（九九）',
    text: `${flavor.top}${flavor.topping}を <b>${a}こずつ</b>、<b>${b}れつ</b> ならべるよ。ぜんぶで なんこ いるかな?`,
    speak: `${flavor.top}を ${a}こずつ、${b}れつ ならべるよ。ぜんぶで なんこ いるかな?`,
    visual: `<div class="dots" style="--cols:${a};--fs:${a * b > 40 ? 15 : a * b > 20 ? 19 : 24}px">${Array.from({ length: a * b }, () => `<span>${flavor.topping}</span>`).join('')}</div>`,
    answer: a * b,
    hints: [`しきは <b>${a} × ${b}</b> だよ`, `${a}のだん: ${steps}, …? つぎは?`],
    reveal: `${a} × ${b} = ${a * b}こ`,
  };
}

const fmtDL = (dl) => [Math.floor(dl / 10) ? `${Math.floor(dl / 10)}L` : '', dl % 10 ? `${dl % 10}dL` : ''].filter(Boolean).join(' ');
const MASU_L = '<span class="masu L">1L</span>';
const MASU_DL = '<span class="masu dL">1dL</span>';

function genKasa(flavor) {
  const r = Math.random();
  if (r < 0.3) {
    const dl = rnd(2, 9), useML = Math.random() < 0.4;
    const label = useML ? `${dl * 100}mL` : `${dl}dL`;
    return {
      kind: 'pour', cat: 'kasa', title: '② クリーム（かさ）', target: dl, color: flavor.cream === '#ffffff' ? '#fff8ef' : flavor.cream,
      text: `1L ますに ${flavor.creamName}を <b>${label}</b> いれてね。ボタンを ながおし すると そそげるよ!`,
      speak: `いちリットルますに ${flavor.creamName}を ${label} いれてね`,
      hints: [useML ? `100mL = 1dL だよ。${label} は なんdL?` : 'ますの めもり 1つが 1dL だよ'],
      reveal: `${dl}dL の めもり まで`,
    };
  }
  if (r < 0.55) {
    let dl;
    do { dl = rnd(2, 25); } while (dl % 10 === 0 && Math.random() < 0.7);
    return {
      kind: 'build', cat: 'kasa', title: '② クリーム（かさ）',
      text: `${flavor.creamName}を <b>${fmtDL(dl)}</b> いれてね。ますを タップしよう!`,
      speak: `${flavor.creamName}を ${fmtDL(dl)} いれてね`,
      units: [{ label: '1L ます', value: 10, html: MASU_L }, { label: '1dL ます', value: 1, html: MASU_DL }],
      target: dl, bowlLabel: 'ボウル',
      hints: [`1L ますが ${Math.floor(dl / 10)}こ、1dL ますが ${dl % 10}こ だよ`, '1L は 10dL と おなじ だよ'],
      reveal: `1L ます ${Math.floor(dl / 10)}こ と 1dL ます ${dl % 10}こ`,
    };
  }
  const facts = [
    () => ({ text: '1L は なんdL?', answer: '10dL', options: ['1dL', '10dL', '100dL'], hint: '1L ますに 1dL ますで 10かい いれると いっぱいに なるよ' }),
    () => ({ text: '1dL は なんmL?', answer: '100mL', options: ['10mL', '100mL', '1000mL'], hint: 'mL は とても すくない かさ。1dL は mL が 100こ ぶん' }),
    () => ({ text: '1L は なんmL?', answer: '1000mL', options: ['10mL', '100mL', '1000mL'], hint: 'ぎゅうにゅうパックの かさ が 1L = 1000mL だよ' }),
    () => {
      let n; do { n = rnd(11, 29); } while (n % 10 === 0);
      const L = Math.floor(n / 10), d = n % 10;
      return { text: `${n}dL は なんL なんdL?`, answer: `${L}L ${d}dL`, options: uniq([`${L}L ${d}dL`, `${d}L ${L}dL`, `${n}L`, `${L + 1}L ${d}dL`]), hint: '10dL で 1L に なるよ' };
    },
    () => { const n = rnd(2, 9); return { text: `${n * 100}mL は なんdL?`, answer: `${n}dL`, options: [`${n}dL`, `${n * 10}dL`, `${n * 100}dL`], hint: '100mL で 1dL だよ' }; },
    () => { const d = rnd(5, 9), big = rnd(11, 15); const pair = shuffle([['1L', 10], [`${d}dL`, d], [fmtDL(big), big]]).slice(0, 2); const a = pair[0][1] > pair[1][1] ? pair[0][0] : pair[1][0]; return { text: `おおいのは どっち? <b>${pair[0][0]}</b> と <b>${pair[1][0]}</b>`, answer: a, options: [pair[0][0], pair[1][0]], hint: '1L = 10dL に なおして くらべよう' }; },
  ];
  const f = pick(facts)();
  return { kind: 'choice', cat: 'kasa', title: '② クリーム（かさ）', text: f.text, answer: f.answer, options: shuffle(f.options), hints: [f.hint], reveal: f.answer };
}

function rulerSVG(mm) {
  const s = 4, x0 = 20;
  let ticks = '';
  for (let i = 0; i <= 140; i++) {
    const h = i % 10 === 0 ? 22 : i % 5 === 0 ? 15 : 9;
    ticks += `<line x1="${x0 + i * s}" y1="44" x2="${x0 + i * s}" y2="${44 + h}" stroke="#7a5a3a" stroke-width="${i % 10 === 0 ? 1.6 : 1}"/>`;
    if (i % 10 === 0) ticks += `<text x="${x0 + i * s}" y="82" font-size="13" text-anchor="middle" fill="#7a5a3a">${i / 10}</text>`;
  }
  return `<svg class="ruler" viewBox="0 0 600 92" xmlns="http://www.w3.org/2000/svg">
    <rect x="${x0}" y="10" width="${mm * s}" height="28" rx="6" fill="#8b5a3c"/>
    <rect x="${x0 + 4}" y="14" width="${Math.max(mm * s - 8, 0)}" height="8" rx="4" fill="#b98262"/>
    <rect x="${x0 - 12}" y="42" width="${140 * s + 24}" height="46" rx="6" fill="#fff6d6" stroke="#e1c27b" stroke-width="2"/>
    ${ticks}<text x="${x0 + 140 * s + 6}" y="60" font-size="11" fill="#7a5a3a">cm</text>
  </svg>`;
}
const fmtMM = (mm) => [Math.floor(mm / 10) ? `${Math.floor(mm / 10)}cm` : '', mm % 10 ? `${mm % 10}mm` : ''].filter(Boolean).join(' ');

function genNagasa(flavor) {
  const r = Math.random();
  let mm; do { mm = rnd(25, 128); } while (mm % 10 === 0);
  const cm = Math.floor(mm / 10), m = mm % 10;
  if (r < 0.3) {
    return {
      kind: 'slider', cat: 'nagasa', title: '③ ロールケーキを きる（ながさ）', target: mm, size: cm, color: (flavor && flavor.cream) || '#fff',
      text: `ロールケーキを はしから <b>${fmtMM(mm)}</b> の ところで きってね。ナイフを うごかそう!`,
      hints: ['ながい めもりが 1cm、みじかい めもりが 1mm だよ', `${cm}cm の めもりから、みじかい めもりを ${m}こ すすめよう`],
      reveal: `${fmtMM(mm)}`,
    };
  }
  if (r < 0.55) {
    const opts = uniq([fmtMM(mm), fmtMM(mm + 1), fmtMM(mm - 10), m !== cm && m > 0 ? `${m}cm ${cm}mm` : fmtMM(mm + 10)]).slice(0, 4);
    return {
      kind: 'choice', cat: 'nagasa', title: '③ かざりの ながさ',
      text: 'チョコの ぼうの ながさは どれかな?',
      visual: rulerSVG(mm), answer: fmtMM(mm), options: shuffle(opts),
      hints: ['ながい めもりが 1cm、みじかい めもりが 1mm だよ'], reveal: fmtMM(mm), size: cm,
    };
  }
  if (r < 0.8) {
    return {
      kind: 'keypad', cat: 'nagasa', suffix: 'mm', title: '③ ケーキの おおきさ',
      text: `ケーキの はこは <b>${cm}cm ${m}mm</b>。なんmm かな?`,
      answer: mm, hints: ['1cm は 10mm だよ', `${cm}cm = ${cm * 10}mm。それに ${m}mm を たすと?`], reveal: `${mm}mm`, size: cm,
    };
  }
  const f = pick([
    { text: '1cm は なんmm?', answer: '10mm', options: ['1mm', '10mm', '100mm'] },
    { text: `<b>${mm}mm</b> は なんcm なんmm?`, answer: fmtMM(mm), options: uniq([fmtMM(mm), `${m}cm ${cm}mm`, `${mm}cm`, fmtMM(mm + 10)]) },
  ]);
  return { kind: 'choice', cat: 'nagasa', title: '③ ケーキの おおきさ', text: f.text, answer: f.answer, options: shuffle(f.options), hints: ['10mm で 1cm に なるよ'], reveal: f.answer, size: cm };
}

const W100 = '<span class="weight w100">100g</span>', W10 = '<span class="weight w10">10g</span>';
function genGram() {
  if (Math.random() < 0.7) {
    const g = rnd(12, 48) * 10;
    return {
      kind: 'build', cat: 'gram', title: '★ ちょっとむずかしいチャレンジ（グラム）',
      text: `こむぎこを <b>${g}g</b> はかるよ。おもりを のせてね!`,
      speak: `こむぎこを ${g}グラム はかるよ。おもりを のせてね`,
      units: [{ label: '100g', value: 100, html: W100 }, { label: '10g', value: 10, html: W10 }],
      target: g, bowlClass: 'scale', bowlLabel: 'はかり',
      hints: [`100g が ${Math.floor(g / 100)}こ と、10g が ${(g % 100) / 10}こ`], reveal: `100g ${Math.floor(g / 100)}こ と 10g ${(g % 100) / 10}こ`,
    };
  }
  return { kind: 'choice', cat: 'gram', title: '★ ちょっとむずかしいチャレンジ（グラム）', text: '1kg は なんg?', answer: '1000g', options: shuffle(['10g', '100g', '1000g']), hints: ['k は 1000 という いみ だよ'], reveal: '1000g' };
}

/* ---------- がめん: こうえん ---------- */

function playgroundSVG() {
  return `<svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice">
    <g stroke="#fff" stroke-width="5" stroke-linecap="round">${Array.from({ length: 21 }, (_, i) => `<path d="M${i * 20} 70 v22"/>`).join('')}<path d="M0 76 H400" stroke-width="4"/></g>
    <g transform="translate(330 30)"><rect x="-3" y="30" width="7" height="44" fill="#c99a6b"/><circle cx="0" cy="22" r="28" fill="#8fd47c" stroke="#6cb85a" stroke-width="3"/><circle cx="-10" cy="12" r="8" fill="#b5e8a3"/><circle cx="10" cy="30" r="4" fill="#ff7e8e"/></g>
    <g transform="translate(22 66)"><path d="M0 120 L14 0 M110 120 L96 0 M8 2 H102" stroke="#7cc6ff" stroke-width="7" stroke-linecap="round"/>
      <g class="swingseat"><path d="M40 2 V88 M64 2 V88" stroke="#5b4040" stroke-width="2"/><rect x="34" y="86" width="36" height="8" rx="3" fill="#ff9fc1" stroke="#5b4040" stroke-width="2"/></g></g>
    <g transform="translate(270 70)"><path d="M0 120 V20 M24 120 V20" stroke="#ff9fc1" stroke-width="6"/><path d="M0 44 h24 M0 70 h24 M0 96 h24" stroke="#ff9fc1" stroke-width="4"/><rect x="-6" y="12" width="36" height="12" rx="4" fill="#ff8fb8" stroke="#5b4040" stroke-width="2"/>
      <path d="M30 18 C56 22 64 80 112 120 L94 124 C60 92 50 40 26 30Z" fill="#ffd45c" stroke="#e0a400" stroke-width="2.5" stroke-linejoin="round"/></g>
    <ellipse cx="200" cy="188" rx="56" ry="14" fill="#f6e2b0" stroke="#e0c27b" stroke-width="3"/><path d="M186 184 l7 -9 l7 9z" fill="#ff9d3b"/><path d="M214 186 q6 -8 12 0" fill="#7cc6ff"/>
  </svg>`;
}

function screenPark(msg) {
  setArea('park');
  const others = Object.keys(CHARS).filter(id => id !== S.partner);
  $('#app').innerHTML = `
    <div class="screen park">
      <header class="bar">
        <button class="iconbtn" id="back" aria-label="まちへ">🗺️</button>
        <h2>ひだまり こうえん</h2>
        ${walletHTML()}
      </header>
      <div class="layout">
        <section class="interior park-in">
          <div class="pk-sky"><span class="pk-sun"></span></div>
          <div class="pk-bg">${playgroundSVG()}</div>
          <div class="pk-swing sway">${charSVG(others[0], 'happy')}</div>
          <div class="pk-slide">${charSVG(others[1], 'happy')}</div>
          <div class="pk-me bounce">${charSVG(S.partner, petMood(), S.wear)}</div>
          <div class="bubble pk-bubble">${msg || 'こうえんで なにして あそぶ?'}</div>
        </section>
        <section class="menu">
          <button class="gamecard clock" id="g-clock"><span class="gc-ic">⏰</span><span><b>とけい クイズ</b><small>なんじ なんぷん? ぴったり あわせよう</small></span></button>
          <button class="gamecard acorn" id="g-acorn"><span class="gc-ic">${iconSVG('acorn')}</span><span><b>どんぐり ひろい</b><small>ひろって かぞえて グラフに しよう</small></span></button>
          <button class="gamecard catch" id="g-catch"><span class="gc-ic">${iconSVG('basket')}</span><span><b>おかし キャッチ</b><small>30びょうで コインを あつめて おこづかい!</small></span></button>
          <button class="gamecard merge" id="g-merge"><span class="gc-ic mg-gc"><b>2</b><b>2</b></span><span><b>すうじ がったい</b><small>おなじ かずを くっつけて おおきく しよう</small></span></button>
          <p class="muted center">あそぶと ${nameOf(S.partner)}が せいちょう して、おこづかい ももらえるよ</p>
        </section>
      </div>
    </div>`;
  $('#back').onclick = () => screenField();
  $('#g-clock').onclick = () => { sfx('tap'); startClockGame(); };
  $('#g-acorn').onclick = () => { sfx('tap'); startAcornGame(); };
  $('#g-catch').onclick = () => { sfx('tap'); startCatchGame(); };
  $('#g-merge').onclick = () => { sfx('tap'); startMergeGame(); };
}

function parkReward(score, total) {
  const yen = 10 + score * 5;
  S.money += yen;
  save();
  addXP(2 + score);
  return yen;
}

function parkFrame(title) {
  $('#app').innerHTML = `
    <div class="screen park">
      <header class="bar">
        <button class="iconbtn" id="back" aria-label="こうえんへ">↩️</button>
        <h2>${title}</h2>
        ${walletHTML()}
      </header>
      <div class="layout">
        <section class="interior park-in small-scene" id="scene"></section>
        <section class="panel" id="q"></section>
      </div>
    </div>`;
  $('#back').onclick = () => screenPark();
}

/* とけい */
function clockSVG(h, m, opts = {}) {
  const ha = ((h % 12) + m / 60) * 30, ma = m * 6;
  let ticks = '';
  for (let i = 0; i < 60; i++) {
    const a = i * 6 * Math.PI / 180, r1 = i % 5 ? 43 : 39, r2 = 46;
    ticks += `<line x1="${60 + r1 * Math.sin(a)}" y1="${60 - r1 * Math.cos(a)}" x2="${60 + r2 * Math.sin(a)}" y2="${60 - r2 * Math.cos(a)}" stroke="#5b4040" stroke-width="${i % 5 ? 1 : 2.4}"/>`;
  }
  const nums = Array.from({ length: 12 }, (_, i) => { const a = (i + 1) * 30 * Math.PI / 180; return `<text x="${60 + 31 * Math.sin(a)}" y="${60 - 31 * Math.cos(a) + 5}" font-size="13" font-weight="bold" text-anchor="middle" fill="#5b4040">${i + 1}</text>`; }).join('');
  return `<svg class="clocksvg" viewBox="-6 -10 132 136">
    <circle cx="14" cy="4" r="10" fill="#ffd45c" stroke="#5b4040" stroke-width="2.4"/><circle cx="106" cy="4" r="10" fill="#ffd45c" stroke="#5b4040" stroke-width="2.4"/>
    <circle cx="60" cy="60" r="56" fill="${opts.color || '#ff9fc1'}" stroke="#5b4040" stroke-width="2.6"/><circle cx="60" cy="60" r="48" fill="#fff" stroke="#5b4040" stroke-width="2"/>
    ${ticks}${nums}
    <line x1="60" y1="60" x2="${60 + 24 * Math.sin(ha * Math.PI / 180)}" y2="${60 - 24 * Math.cos(ha * Math.PI / 180)}" stroke="#e06c98" stroke-width="6" stroke-linecap="round"/>
    <line x1="60" y1="60" x2="${60 + 38 * Math.sin(ma * Math.PI / 180)}" y2="${60 - 38 * Math.cos(ma * Math.PI / 180)}" stroke="#4a95d1" stroke-width="4" stroke-linecap="round"/>
    <circle cx="60" cy="60" r="4" fill="#5b4040"/>
    <path d="M40 116 l-6 8 M80 116 l6 8" stroke="#5b4040" stroke-width="3" stroke-linecap="round"/></svg>`;
}
const fmtTime = (h, m) => `${h}じ${m ? ` ${m}ふん` : ''}`;
const EVENTS = ['ブランコに のる', 'おやつを たべる', 'すなばで あそぶ', 'すべりだいを する', 'おうちに かえる', 'ピクニックを する'];

function genClockQ() {
  const h = rnd(1, 12), m = pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, rnd(1, 59)]);
  const ev = pick(EVENTS);
  const r = Math.random();
  if (r < 0.4) {
    const right = fmtTime(h, m);
    const opts = uniq([right, fmtTime(h === 12 ? 1 : h + 1, m), fmtTime(h, (m + 30) % 60), fmtTime(m >= 5 && m <= 60 ? Math.round(m / 5) || 12 : h, h * 5 % 60)]).slice(0, 4);
    return { kind: 'choice', cat: 'clock', title: 'とけいを よもう', text: `${ev} じかんだよ。いま なんじ なんぷん?`, visual: clockSVG(h, m), answer: right, options: shuffle(opts),
      hints: ['みじかい はりが 「じ」、ながい はりが 「ふん」だよ', 'ながい はりの すうじ 1つは 5ふん。1→5ふん、2→10ふん…'], reveal: right };
  }
  if (r < 0.7) {
    const add = pick([10, 15, 20, 30, 40, 60]);
    const m0 = pick([0, 10, 15, 20, 30]), t = h * 60 + m0 + add;
    const h2 = ((Math.floor(t / 60) - 1) % 12) + 1, m2 = t % 60;
    const right = fmtTime(h2, m2);
    const opts = uniq([right, fmtTime(h, (m0 + add) % 60), fmtTime(h2 === 12 ? 1 : h2 + 1, m2), fmtTime(h2, (m2 + 10) % 60)]);
    return { kind: 'choice', cat: 'clock', title: 'じかんの けいさん', text: `いまは ${fmtTime(h, m0)}。<b>${add === 60 ? '1じかん' : add + 'ふん'}</b> あとに ${ev}よ。なんじ なんぷん かな?`, visual: clockSVG(h, m0), answer: right, options: shuffle(opts),
      hints: ['60ぷんで 1じかん すすむよ', `${m0}ふん ＋ ${add}ふん を けいさん しよう`], reveal: right };
  }
  return { kind: 'setclock', cat: 'clock', title: 'とけいを あわせよう', h, m: Math.round(m / 5) * 5 % 60, text: `<b>${fmtTime(h, Math.round(m / 5) * 5 % 60)}</b>に ${ev}よ。とけいを あわせてね!`,
    hints: ['みじかい はりは 「じ」の すうじの ちかくだよ', 'ながい はりは 5ふんずつ うごくよ'], reveal: fmtTime(h, Math.round(m / 5) * 5 % 60) };
}

function startClockGame() {
  parkFrame('とけい クイズ');
  const g = { n: 0, score: 0, total: 5 };
  const next = () => {
    if (g.n >= g.total) return parkDone(g, 'とけい はかせ!');
    g.n++;
    $('#scene').innerHTML = `<div class="pk-progress">${Array.from({ length: g.total }, (_, i) => `<span class="dot ${i < g.n - 1 ? 'done' : i === g.n - 1 ? 'now' : ''}">${i + 1}</span>`).join('')}</div>
      <div class="pk-me bounce">${charSVG(S.partner, 'happy', S.wear)}</div><div class="bubble pk-bubble">${pick(['とけい よめるかな?', 'がんばって!', 'あと ちょっと!'])}</div>`;
    askQuestion($('#q'), genClockQ(), (first) => { if (first) g.score++; next(); });
  };
  next();
}

/* どんぐり ひろい（ひょうと グラフ） */
const PICKS = [
  { id: 'acorn', name: 'どんぐり' }, { id: 'pinecone', name: 'まつぼっくり' }, { id: 'leaf', name: 'もみじ' }, { id: 'flower2', name: 'おはな' },
];
function startAcornGame() {
  parkFrame('どんぐり ひろい');
  const counts = PICKS.map(() => rnd(1, 7));
  if (new Set(counts).size < 4) counts[rnd(0, 3)] = 8; // いちばん おおいのが わかるように
  const items = shuffle(counts.flatMap((c, k) => Array.from({ length: c }, () => k)));
  const got = PICKS.map(() => 0);
  $('#scene').innerHTML = `<div class="pk-ground">${items.map((k, i) => `<button class="pk-item" data-p="${k}" style="left:${rnd(5, 84)}%;top:${rnd(44, 90)}%;--r:${rnd(-30, 30)}deg">${iconSVG(PICKS[k].id)}</button>`).join('')}</div>
    <div class="pk-basket">${iconSVG('basket')}</div>`;
  const tableHTML = (show) => `<table class="tally"><tr>${PICKS.map(p => `<th>${iconSVG(p.id)}<small>${p.name}</small></th>`).join('')}</tr><tr>${got.map(c => `<td>${show ? c : '?'}</td>`).join('')}</tr></table>`;
  $('#q').innerHTML = `<div class="qcard"><div class="qhead"><span class="qtitle">① ぜんぶ ひろおう</span></div><p class="qtext">こうえんに おちている ものを タップして ひろってね。</p><div class="tallywrap">${tableHTML(true)}</div><p class="muted" id="left">のこり ${items.length}こ</p></div>`;
  let left = items.length;
  $$('.pk-item').forEach(b => b.onclick = () => {
    if (b.classList.contains('got')) return;
    b.classList.add('got');
    got[+b.dataset.p]++;
    left--;
    sfx('coin');
    $('.tallywrap').innerHTML = tableHTML(true);
    $('#left').textContent = `のこり ${left}こ`;
    if (!left) setTimeout(() => graphStep(), 600);
  });

  function graphStep() {
    const max = Math.max(...counts);
    const fill = PICKS.map(() => 0);
    $('#q').innerHTML = `<div class="qcard"><div class="qhead"><span class="qtitle">② グラフに しよう</span><button class="iconbtn say">🔊</button></div>
      <p class="qtext">ひょうを みて、かずだけ ○を ぬってね。（したから じゅんに タップ）</p>
      <div class="tallywrap">${tableHTML(true)}</div>
      <div class="graph">${PICKS.map((p, k) => `<div class="gcol" data-k="${k}">${Array.from({ length: max }, (_, i) => `<button class="gcell" data-k="${k}" data-i="${i}"></button>`).reverse().join('')}<span class="glabel">${iconSVG(p.id)}</span></div>`).join('')}</div>
      <div class="qhint"></div>
      <div class="row"><button class="btn ok finish">できた!</button></div></div>`;
    $('.say').onclick = () => speak('ひょうを みて、かずだけ まるを ぬってね');
    $$('.gcell').forEach(c => c.onclick = () => {
      const k = +c.dataset.k, i = +c.dataset.i;
      fill[k] = fill[k] === i + 1 ? i : i + 1;
      $$(`.gcell[data-k="${k}"]`).forEach(x => x.classList.toggle('on', +x.dataset.i < fill[k]));
      sfx('tap');
    });
    let tries = 0;
    $('.finish').onclick = () => {
      if (fill.every((f, k) => f === got[k])) { sfx('ok'); record('graph', tries === 0); sparkle($('.graph'), 10); celebrate(tries === 0); setTimeout(() => questions(tries === 0), 1400); return; }
      tries++; sfx('ng');
      const bad = fill.findIndex((f, k) => f !== got[k]);
      $('.qhint').innerHTML = `💡 ${PICKS[bad].name}は ${got[bad]}こ だよ。○の かずを かぞえてみよう`;
    };
  }

  function questions(graphOK) {
    const g = { score: graphOK ? 1 : 0, total: 3 };
    const maxK = got.indexOf(Math.max(...got));
    const [a, b] = shuffle([0, 1, 2, 3]).slice(0, 2);
    const hi = got[a] >= got[b] ? a : b, lo = hi === a ? b : a;
    const qs = [
      { kind: 'choice', cat: 'graph', title: '③ グラフを よもう', text: 'いちばん おおいのは どれ?', answer: PICKS[maxK].name, options: PICKS.map(p => p.name), hints: ['いちばん たかい グラフを さがそう'], reveal: PICKS[maxK].name },
      { kind: 'keypad', cat: 'graph', suffix: 'こ', title: '③ グラフを よもう', text: `${PICKS[hi].name}は ${PICKS[lo].name}より なんこ おおい?`, answer: got[hi] - got[lo], hints: [`${got[hi]} − ${got[lo]} を けいさん しよう`], reveal: `${got[hi] - got[lo]}こ` },
    ];
    const graphMini = `<div class="graph mini">${PICKS.map((p, k) => `<div class="gcol">${Array.from({ length: Math.max(...got) }, (_, i) => `<span class="gcell ${i < got[k] ? 'on' : ''}"></span>`).reverse().join('')}<span class="glabel">${iconSVG(p.id)}</span></div>`).join('')}</div>`;
    const run = (i) => {
      if (i >= qs.length) return parkDone(g, 'グラフ めいじん!');
      askQuestion($('#q'), { ...qs[i], visual: graphMini }, (first) => { if (first) g.score++; run(i + 1); });
    };
    run(0);
  }
}

function parkDone(g, title) {
  const yen = parkReward(g.score, g.total);
  sfx('fanfare');
  $('#q').innerHTML = `<div class="qcard done"><div class="reveal bounce">${charSVG(S.partner, 'happy', S.wear)}</div>
    <h3>${title}</h3><p class="pay">${g.score} / ${g.total} もん いっかいで せいかい!</p><p>おこづかい <b>${yen}円</b></p>
    <div class="row"><button class="btn ok" id="again">もう いっかい</button><button class="btn sub" id="toPark">こうえんへ</button></div></div>`;
  sparkle($('.reveal'), 20);
  bumpWallet();
  $('#again').onclick = () => (title.includes('とけい') ? startClockGame() : startAcornGame());
  $('#toPark').onclick = () => screenPark('たのしかったね!');
}

/* ---------- がめん: パティスリー ---------- */
function screenPatisserie() {
  setArea('patisserie');
  const others = Object.keys(CHARS).filter(id => id !== S.partner);
  $('#app').innerHTML = `
    <div class="screen patis">
      <header class="bar">
        <button class="iconbtn" id="back" aria-label="まちへ">🗺️</button>
        <h2>ゆめいろパティスリー</h2>
        ${walletHTML()}
      </header>
      <div class="layout">
        <section class="interior patis-room">
          ${garlandSVG(10)}
          <div class="lamps"><i></i><i></i><i></i></div>
          <div class="wallrow">
            <div class="window"><span>☁️</span></div>
            <div class="menuboard"><b>きょうの おすすめ</b><span>🍓 ショートケーキ</span><span>🍫 チョコケーキ</span><span>🍑 ももケーキ</span></div>
            <div class="window"><span>🌈</span></div>
          </div>
          <div class="showcase">
            <h3>ショーケース <small>${S.cakes.length}こ</small></h3>
            <div class="shelf">${S.cakes.length ? S.cakes.slice(-12).map(c => `<div class="mini-cake">${cakeSVG(c)}</div>`).join('') : '<p class="muted">ケーキを つくると ここに かざれるよ</p>'}</div>
          </div>
          <div class="crew">
            <div class="sway small">${charSVG(S.partner, 'happy', [...S.wear.filter(w => w !== 'apron'), 'apron'])}</div>
            <div class="bubble">きょうも おいしい ケーキを つくろう!</div>
          </div>
          <div class="counter-front"><span class="cstand">${cakeSVG({ topping: '🍓', cream: '#ffd0de', size: 8 })}</span><span class="cbell">🛎️</span></div>
        </section>
        <section class="menu">
          <button class="bigbtn" id="call">🔔 おきゃくさんを よぶ</button>
          <p class="muted center">ケーキ 1こ で <b>50円〜</b>。いっぱい せいかい すると ボーナス!</p>
          <div class="cafe">
            <div class="friends">${others.map(id => `<div class="friend sway">${charSVG(id, 'happy')}<small>${nameOf(id)}</small></div>`).join('')}</div>
            <div class="table"><span>☕</span><span>🍰</span><span>🧃</span></div>
          </div>
        </section>
      </div>
    </div>`;
  $('#back').onclick = () => screenField();
  $('#call').onclick = () => { sfx('tap'); startOrder(); };
}

function startOrder() {
  const others = Object.keys(CHARS).filter(id => id !== S.partner);
  const customer = pick(others);
  const flavor = pick(FLAVORS);
  const steps = [() => genKuku(flavor), () => genKasa(flavor), () => genNagasa(flavor)];
  if (S.settings.challenge) steps.push(() => genGram());
  const order = { customer, flavor, steps, idx: 0, firstTry: 0, challenge: false, cake: { topping: '', cream: '#f6d79b', size: 10 } };

  $('#app').innerHTML = `
    <div class="screen patis">
      <header class="bar">
        <button class="iconbtn" id="back" aria-label="おみせへ">↩️</button>
        <h2>ちゅうもん</h2>
        ${walletHTML()}
      </header>
      <div class="layout">
        <section class="counter interior patis-room">
          ${garlandSVG(10)}
          <div class="cust">
            <div class="bounce" id="cust">${charSVG(customer, 'happy')}</div>
            <div class="bubble big"><b>${nameOf(customer)}</b>「${flavor.top}の ケーキを ください!」</div>
          </div>
          <div class="wipwrap"><div class="wip" id="wip"></div><div class="stand"></div></div>
          <div class="steps" id="steps"></div>
        </section>
        <section class="panel" id="q"></section>
      </div>
    </div>`;
  $('#back').onclick = () => screenPatisserie();
  speak(`${nameOf(customer)}だよ。${flavor.top}の ケーキを ください`);
  drawWip(order);
  nextStep(order);
}

function drawWip(order) {
  const c = order.cake;
  $('#wip').innerHTML = c.topping || order.idx > 0 ? cakeSVG(c) : '<div class="emptyplate">🍽️</div>';
  $('#steps').innerHTML = order.steps.map((_, i) => `<span class="dot ${i < order.idx ? 'done' : i === order.idx ? 'now' : ''} ${i === 3 ? 'star' : ''}">${i === 3 ? '★' : i + 1}</span>`).join('');
}

function nextStep(order) {
  if (order.idx >= order.steps.length) return finishOrder(order);
  const q = order.steps[order.idx]();
  const isChallenge = order.idx === 3;
  askQuestion($('#q'), q, (first) => {
    if (order.idx === 0) order.cake.topping = order.flavor.topping;
    if (order.idx === 1) order.cake.cream = order.flavor.cream;
    if (order.idx === 2) order.cake.size = q.size || 10;
    if (first && !isChallenge) order.firstTry++;
    if (isChallenge && first) order.challenge = true;
    order.idx++;
    drawWip(order);
    nextStep(order);
  }, {
    skippable: isChallenge,
    onWrong: () => {
      const c = $('#cust');
      c.innerHTML = charSVG(order.customer, 'sad');
      setTimeout(() => { if ($('#cust')) $('#cust').innerHTML = charSVG(order.customer, 'happy'); }, 1200);
    },
  });
}

function finishOrder(order) {
  const firstTryMain = Math.min(order.firstTry, 3);
  const pay = 50 + firstTryMain * 10 + (order.challenge ? 20 : 0);
  S.money += pay;
  S.served++;
  S.cakes.push(order.cake);
  addXP(3 + firstTryMain);
  if (S.cakes.length > 30) S.cakes.shift();
  save();
  sfx('fanfare');
  setTimeout(() => sfx('coin'), 600);
  $('#q').innerHTML = `
    <div class="qcard done">
      <div class="reveal">${cakeSVG(order.cake)}</div>
      <h3>ケーキの できあがり!</h3>
      <p class="pay">おきゅうりょう <b>${pay}円</b> 🪙</p>
      <ul class="paylist">
        <li>ケーキ 50円</li>
        ${firstTryMain ? `<li>いっかいで せいかい ボーナス ${firstTryMain * 10}円</li>` : ''}
        ${order.challenge ? '<li>★チャレンジ ボーナス 20円</li>' : ''}
      </ul>
      <div class="row"><button class="btn ok" id="again">つぎの おきゃくさん</button><button class="btn sub" id="home">まちへ もどる</button></div>
    </div>`;
  $('#cust').innerHTML = charSVG(order.customer, 'happy');
  $('#cust').classList.add('jump');
  sparkle($('.reveal'), 22);
  bumpWallet();
  speak(`ありがとう! おきゅうりょう ${pay}えん`);
  $('#again').onclick = () => startOrder();
  $('#home').onclick = () => screenField(`${pay}円 かせいだね! すごーい!`);
}

/* ---------- がめん: おかいもの ---------- */
let cart = [];
let shopTab = 'food';
const COINS = [
  { v: 1000, cls: 'bill', label: '1000' },
  { v: 500, cls: 'c500', label: '500' },
  { v: 100, cls: 'c100', label: '100' },
  { v: 50, cls: 'c50', label: '50' },
  { v: 10, cls: 'c10', label: '10' },
];
const coinHTML = (c) => `<span class="coin ${c.cls}">${c.label}</span>`;

function screenShop() {
  setArea('shop');
  const tabs = { food: '🍙 ごはん', wear: '🎀 ふく', room: '🛋️ かぐ' };
  const list = ITEMS.filter(i => i.cat === shopTab);
  $('#app').innerHTML = `
    <div class="screen shop">
      <header class="bar">
        <button class="iconbtn" id="back" aria-label="まちへ">🗺️</button>
        <h2>おかいもの</h2>
        ${walletHTML()}
      </header>
      <div class="shop-awning"></div>
      <nav class="tabs">${Object.entries(tabs).map(([k, v]) => `<button class="tab ${k === shopTab ? 'on' : ''}" data-tab="${k}">${v}</button>`).join('')}</nav>
      <div class="goods shop-room">
        ${list.map(it => {
          const have = it.cat !== 'food' && S.owned.includes(it.id);
          const inCart = cart.includes(it.id) && it.cat !== 'food';
          const pic = it.cat === 'wear' ? `<div class="wearpic">${charSVG(S.partner, 'happy', [it.id])}</div>` : `<div class="icon">${it.icon}</div>`;
          return `<button class="good ${have ? 'have' : ''}" data-id="${it.id}" ${have || inCart ? 'disabled' : ''}>
            ${pic}<b>${it.name}</b><span class="price"><i></i>${it.price}円</span>${have ? '<span class="tag">もってる</span>' : inCart ? '<span class="tag">かごの なか</span>' : ''}
          </button>`;
        }).join('')}
      </div>
      <footer class="cartbar">
        <div class="cart">🧺 ${cart.length ? cart.map((id, i) => `<button class="cartitem" data-i="${i}">${item(id).icon || '🎀'}<small>${item(id).price}円</small></button>`).join('') : '<span class="muted">かいたい ものを えらんでね（3こまで）</span>'}</div>
        <button class="btn ok" id="checkout" ${cart.length ? '' : 'disabled'}>おかいけい</button>
      </footer>
    </div>`;
  $('#back').onclick = () => { cart = []; screenField(); };
  $$('[data-tab]').forEach(b => b.onclick = () => { shopTab = b.dataset.tab; sfx('tap'); screenShop(); });
  $$('.good').forEach(b => b.onclick = () => {
    if (cart.length >= 3) { toast('かごは 3こ までだよ'); return; }
    cart.push(b.dataset.id);
    sfx('tap');
    screenShop();
  });
  $$('.cartitem').forEach(b => b.onclick = () => { cart.splice(+b.dataset.i, 1); screenShop(); });
  $('#checkout').onclick = () => checkout();
}

function checkout() {
  const items = cart.map(item);
  const total = items.reduce((s, i) => s + i.price, 0);
  $('#app').innerHTML = `
    <div class="screen shop">
      <header class="bar">
        <button class="iconbtn" id="back" aria-label="もどる">↩️</button>
        <h2>おかいけい</h2>
        ${walletHTML()}
      </header>
      <div class="layout">
        <section class="register interior shop-in">
          ${garlandSVG(8)}
          <div class="cashreg">${registerSVG()}</div>
          <div class="clerk sway small">${charSVG(Object.keys(CHARS).find(id => id !== S.partner), 'happy')}</div>
          <div class="receipt">
            <h3>レシート</h3>
            ${items.map(i => `<div class="rline"><span>${i.icon || '🎀'} ${i.name}</span><b>${i.price}円</b></div>`).join('')}
            <div class="rline total"><span>ごうけい</span><b id="rtotal">？円</b></div>
            <div class="rline" id="rpaid" hidden><span>はらった</span><b></b></div>
            <div class="rline" id="rchange" hidden><span>おつり</span><b>？円</b></div>
          </div>
        </section>
        <section class="panel" id="q"></section>
      </div>
    </div>`;
  $('#back').onclick = () => screenShop();

  const afterTotal = () => {
    $('#rtotal').textContent = `${total}円`;
    if (total > S.money) {
      sfx('ng');
      $('#q').innerHTML = `<div class="qcard"><p class="qtext">あれれ… おさいふには <b>${S.money}円</b>。<br><b>${total - S.money}円</b> たりないよ。</p>
        <p class="muted">パティスリーで かせいでこよう!</p>
        <div class="row"><button class="btn ok" id="fix">かごを へらす</button><button class="btn sub" id="earn">ケーキを つくりにいく</button></div></div>`;
      $('#fix').onclick = () => screenShop();
      $('#earn').onclick = () => screenPatisserie();
      return;
    }
    pay(total, items);
  };

  if (items.length === 1) { afterTotal(); return; }
  const nums = items.map(i => i.price);
  askQuestion($('#q'), {
    kind: 'keypad', cat: 'total', suffix: '円', title: 'ごうけいは いくら?',
    text: nums.map(n => `${n}円`).join(' ＋ ') + ' ＝ ?',
    speak: nums.map(n => `${n}えん`).join(' たす ') + ' は いくら?',
    visual: `<div class="column">${nums.map((n, i) => `<div>${i ? '＋' : '　'}<span>${String(n).padStart(3, ' ')}</span></div>`).join('')}<div class="line"></div></div>`,
    answer: total,
    hints: ['くらいを そろえて、一のくらい から たそう', nums.length === 2 ? `${nums[0]} に ${Math.floor(nums[1] / 100) * 100 || nums[1]} を たすと ${nums[0] + (Math.floor(nums[1] / 100) * 100 || nums[1])}。のこりは?` : `まず ${nums[0]} ＋ ${nums[1]} ＝ ${nums[0] + nums[1]}。それに ${nums[2]} を たそう`],
    reveal: `${total}円`,
  }, afterTotal);
}

function pay(total, items) {
  let tray = [];
  const draw = () => {
    const sum = tray.reduce((s, v) => s + v, 0);
    $('#q').innerHTML = `
      <div class="qcard">
        <div class="qhead"><span class="qtitle">おかねを だそう</span><button class="iconbtn say" aria-label="よみあげ">🔊</button></div>
        <p class="qtext"><b>${total}円</b> だよ。おさいふから おかねを だしてね。<br><small class="muted">おさいふには ${S.money}円 あるよ</small></p>
        <div class="tray">${tray.length ? tray.map((v, i) => `<button class="traycoin" data-i="${i}">${coinHTML(COINS.find(c => c.v === v))}</button>`).join('') : '<span class="muted">ここに おかねを のせてね</span>'}</div>
        <div class="purse-coins">${COINS.map(c => `<button class="coinbtn" data-v="${c.v}" ${sum + c.v > S.money ? 'disabled' : ''}>${coinHTML(c)}</button>`).join('')}</div>
        <div class="qhint"></div>
        <div class="row"><button class="btn ok" id="paybtn" ${tray.length ? '' : 'disabled'}>これで はらう</button></div>
      </div>`;
    $('.say').onclick = () => speak(`${total}えん だよ。おさいふから おかねを だしてね`);
    $$('.coinbtn').forEach(b => b.onclick = () => { tray.push(+b.dataset.v); tray.sort((a, b) => b - a); sfx('coin'); draw(); });
    $$('.traycoin').forEach(b => b.onclick = () => { tray.splice(+b.dataset.i, 1); draw(); });
    $('#paybtn').onclick = () => {
      if (sum < total) {
        sfx('ng');
        $('.qhint').innerHTML = `💡 それだと たりないよ。もうすこし だそう`;
        return;
      }
      const big = tray.find(v => sum - v >= total);
      if (big) {
        $('.qhint').innerHTML = `💡 ${big}円 は なくても たりるよ。ださなくて いいかも?`;
        sfx('ng');
        return;
      }
      $('#rpaid').hidden = false;
      $('#rpaid b').textContent = `${sum}円`;
      sfx('coin');
      if (sum === total) {
        record('change', true);
        complete(total, items, 'ぴったり! おつりは なしだよ');
        return;
      }
      $('#rchange').hidden = false;
      askChange(total, sum, items);
    };
  };
  draw();
}

function askChange(total, paid, items) {
  const ch = paid - total;
  const up = Math.ceil(total / 100) * 100;
  askQuestion($('#q'), {
    kind: 'keypad', cat: 'change', suffix: '円', title: 'おつりは いくら?',
    text: `${paid}円 はらったよ。<b>${total}円</b> だから、おつりは?`,
    speak: `${paid}えん はらったよ。${total}えん だから、おつりは いくら?`,
    visual: `<div class="column"><div>　<span>${String(paid).padStart(4, ' ')}</span></div><div>−<span>${String(total).padStart(4, ' ')}</span></div><div class="line"></div></div>`,
    answer: ch,
    hints: [`しきは ${paid} − ${total} だよ`, up < paid && up !== total ? `${total}円 から ${up}円 まで あと ${up - total}円。${up}円 から ${paid}円 まで あと ${paid - up}円。あわせると?` : `${total}円 から かぞえて、${paid}円 まで あと いくら?`],
    reveal: `${ch}円`,
  }, () => {
    $('#rchange b').textContent = `${ch}円`;
    complete(total, items, `おつりは ${ch}円。ありがとう!`);
  });
}

function complete(total, items, msg) {
  S.money -= total;
  items.forEach(i => {
    if (i.cat === 'food') S.food[i.id] = (S.food[i.id] || 0) + 1;
    else if (!S.owned.includes(i.id)) S.owned.push(i.id);
    if (i.cat === 'wear' && !S.wear.includes(i.id)) S.wear.push(i.id);
  });
  cart = [];
  save();
  sfx('fanfare');
  $('#q').innerHTML = `
    <div class="qcard done">
      <div class="reveal bounce">${charSVG(S.partner, 'happy', S.wear)}</div>
      <h3>おかいもの せいこう!</h3>
      <p>${msg}</p>
      <p class="muted">${items.map(i => i.icon || '🎀').join(' ')} を かったよ</p>
      <div class="row"><button class="btn ok" id="home">おうちで みる</button><button class="btn sub" id="more">もっと かう</button></div>
    </div>`;
  sparkle($('.reveal'), 20);
  bumpWallet();
  speak(msg);
  $('#home').onclick = () => screenHome('かってくれて ありがとう!');
  $('#more').onclick = () => screenShop();
}

/* ---------- がめん: おうちのひと ---------- */
function screenSettings() {
  setArea('settings');
  const st = S.settings;
  const rate = (k) => { const s = S.stats[k]; return s ? `${s.ok}/${s.ok + s.ng}（${Math.round(s.ok / Math.max(1, s.ok + s.ng) * 100)}%）` : '—'; };
  $('#app').innerHTML = `
    <div class="screen settings">
      <header class="bar">
        <button class="iconbtn" id="back" aria-label="まちへ">🗺️</button>
        <h2>おうちのひと</h2>
        ${walletHTML()}
      </header>
      <div class="setwrap">
        <section class="setcard">
          <h3>なまえ</h3>
          ${Object.keys(CHARS).map(id => `<label class="namerow"><span class="mini-face">${charSVG(id)}</span><input data-name="${id}" value="${nameOf(id)}" maxlength="8"> <small>${CHARS[id].kind}</small></label>`).join('')}
          <label class="namerow"><span>こどもの なまえ（えいご）</span><input id="kidEn" value="${S.kidNameEn || ''}" placeholder="Hana" maxlength="12"></label>
          <label class="namerow"><span>よみかた（カタカナ）</span><input id="kidKana" value="${S.kidNameKana || ''}" placeholder="ハナ" maxlength="10"></label>
          <p class="muted">いれると えいごの「じこしょうかい」で なまえを いう もんだいが でます。</p>
          ${Object.keys(CHAR_IMAGES_ALL).length ? `<div class="charset-pick"><b>キャラの え</b>
            <label><input type="radio" name="charset" value="image" ${S.settings.charset !== 'original' ? 'checked' : ''}> ${Object.values(CHAR_IMAGES_ALL).map(c => c.name).join('・')}</label>
            <label><input type="radio" name="charset" value="original" ${S.settings.charset === 'original' ? 'checked' : ''}> うごく オリジナル</label></div>` : ''}
          <button class="btn sub" id="repick">パートナーを えらびなおす</button>
        </section>
        ${typeof myPicsCardHTML === 'function' ? myPicsCardHTML() : ''}
        <section class="setcard">
          <h3>九九で だす だん</h3>
          <div class="dans">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => `<label><input type="checkbox" data-dan="${d}" ${st.dans.includes(d) ? 'checked' : ''}>${d}のだん</label>`).join('')}</div>
          <label class="toggle"><input type="checkbox" id="challenge" ${st.challenge ? 'checked' : ''}> ★グラムの チャレンジを だす（3年生）</label>
          <label class="toggle"><input type="checkbox" id="sound" ${st.sound ? 'checked' : ''}> こうかおん</label>
          <label class="toggle"><input type="checkbox" id="voice" ${st.voice ? 'checked' : ''}> よみあげ</label>
        </section>
        <section class="setcard">
          <h3>せいかいりつ（いっかいめで せいかい／ぜんぶ）</h3>
          <table class="stats">
            <tr><td>九九</td><td>${rate('kuku')}</td></tr>
            <tr><td>かさ</td><td>${rate('kasa')}</td></tr>
            <tr><td>ながさ</td><td>${rate('nagasa')}</td></tr>
            <tr><td>グラム</td><td>${rate('gram')}</td></tr>
            <tr><td>ごうけい</td><td>${rate('total')}</td></tr>
            <tr><td>おつり</td><td>${rate('change')}</td></tr>
            <tr><td>とけい</td><td>${rate('clock')}</td></tr>
            <tr><td>ひょうと グラフ</td><td>${rate('graph')}</td></tr>
            <tr><td>えいご</td><td>${rate('eng')}</td></tr>
            <tr><td>かんじ</td><td>${rate('kanji')}</td></tr>
          </table>
          <p class="muted">つくった ケーキ: ${S.served}こ</p>
        </section>
        <section class="setcard">
          <h3>おかね・データ</h3>
          <div class="row"><button class="btn sub" id="plus">+100円</button><button class="btn sub" id="minus">−100円</button></div>
          <button class="btn danger" id="reset">ぜんぶ はじめから</button>
          <p class="muted">データは この iPad / iPhone の なかだけに ほぞん されます。</p>
        </section>
      </div>
    </div>`;
  $('#back').onclick = () => screenField();
  $$('[data-name]').forEach(i => i.onchange = () => { S.names[i.dataset.name] = i.value.trim() || CHARS[i.dataset.name].name; save(); });
  $$('[data-dan]').forEach(c => c.onchange = () => {
    st.dans = $$('[data-dan]').filter(x => x.checked).map(x => +x.dataset.dan);
    save();
  });
  $$('[name="charset"]').forEach(r => r.onchange = () => { S.settings.charset = r.value; save(); applyCharset(); screenSettings(); });
  if (typeof bindMyPics === 'function') bindMyPics(() => screenSettings());
  $('#kidEn').onchange = (e) => { S.kidNameEn = e.target.value.trim(); save(); };
  $('#kidKana').onchange = (e) => { S.kidNameKana = e.target.value.trim(); save(); };
  ['challenge', 'sound', 'voice'].forEach(k => $('#' + k).onchange = (e) => { st[k] = e.target.checked; save(); });
  $('#plus').onclick = () => { S.money += 100; save(); bumpWallet(); };
  $('#minus').onclick = () => { S.money = Math.max(0, S.money - 100); save(); bumpWallet(); };
  $('#repick').onclick = () => { S.partner = null; S.wear = []; save(); screenStart(); };
  $('#reset').onclick = () => {
    if (confirm('お金・もちもの・ケーキ・きろくを ぜんぶ けして はじめから にしますか?')) {
      S = DEFAULT_STATE(); save(); screenStart();
    }
  };
}

/* ---------- はじまり ---------- */
document.addEventListener('gesturestart', (e) => e.preventDefault());
// じぶんの え（IndexedDB）を よみこんでから はじめる
Promise.race([
  typeof loadMyPics === 'function' ? loadMyPics().catch(() => {}) : Promise.resolve(),
  new Promise(r => setTimeout(r, 1500)),
]).then(() => {
  applyCharset();
  S.partner ? screenField() : screenStart();
});

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
