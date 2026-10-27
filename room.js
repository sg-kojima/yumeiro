'use strict';
// おへや: かべがみ・ゆか・かぐの え、もようがえ（ドラッグで うごかす）、ともだちが あそびに くる。

const FL = 'stroke="#5b4040" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"';
// x, y = ゆかに おく ばしょ（%・したの まんなか）、w = はば（%）、wall = かべに かける もの
const FURN = {
  bed:      { x: 78, y: 92, w: 30, svg: `<svg viewBox="0 0 120 80"><rect x="6" y="10" width="16" height="64" rx="6" fill="#c9a8ef" ${FL}/><rect x="14" y="38" width="100" height="26" rx="8" fill="#fff" ${FL}/><rect x="36" y="34" width="80" height="22" rx="9" fill="#ffb3cc" ${FL}/><path d="M44 42 h64" stroke="#fff" stroke-width="3" stroke-dasharray="4 6"/><rect x="18" y="28" width="26" height="16" rx="7" fill="#fff" ${FL}/><rect x="14" y="62" width="8" height="12" fill="#c9a8ef" ${FL}/><rect x="104" y="62" width="8" height="12" fill="#c9a8ef" ${FL}/></svg>` },
  sofa:     { x: 22, y: 90, w: 26, svg: `<svg viewBox="0 0 110 70"><rect x="14" y="10" width="82" height="34" rx="14" fill="#8fdcc8" ${FL}/><rect x="4" y="30" width="22" height="30" rx="10" fill="#8fdcc8" ${FL}/><rect x="84" y="30" width="22" height="30" rx="10" fill="#8fdcc8" ${FL}/><rect x="22" y="36" width="66" height="22" rx="8" fill="#b8eedf" ${FL}/><rect x="40" y="18" width="18" height="16" rx="6" fill="#ffd45c" ${FL}/><path d="M12 60 v6 M98 60 v6" ${FL}/></svg>` },
  books:    { x: 9, y: 70, w: 15, svg: `<svg viewBox="0 0 60 90"><rect x="4" y="4" width="52" height="82" rx="5" fill="#e8b98a" ${FL}/><path d="M6 32 h48 M6 60 h48" ${FL}/>${[['#ff8fb8', 10], ['#7cc6ff', 17], ['#ffd45c', 24], ['#a98cf0', 31]].map(([c, x]) => `<rect x="${x}" y="12" width="6" height="19" rx="1.5" fill="${c}" stroke="#5b4040" stroke-width="1.6"/>`).join('')}${[['#8fdcc8', 12], ['#ff9d3b', 19], ['#ff8fb8', 40]].map(([c, x]) => `<rect x="${x}" y="40" width="6" height="19" rx="1.5" fill="${c}" stroke="#5b4040" stroke-width="1.6"/>`).join('')}<circle cx="40" cy="78" r="6" fill="#ffd45c" stroke="#5b4040" stroke-width="1.6"/><rect x="14" y="68" width="14" height="14" rx="3" fill="#7cc6ff" stroke="#5b4040" stroke-width="1.6"/></svg>` },
  plant:    { x: 4, y: 94, w: 10, svg: `<svg viewBox="0 0 50 70"><path d="M25 40 C10 34 6 18 14 10 C20 18 22 28 25 40 C28 26 32 12 42 8 C46 22 38 34 25 40Z" fill="#7fd06a" ${FL}/><path d="M25 42 C18 28 24 20 25 16" fill="none" ${FL}/><path d="M12 40 h26 l-4 26 h-18z" fill="#ffb3cc" ${FL}/><rect x="10" y="38" width="30" height="7" rx="3" fill="#ff8fb8" ${FL}/></svg>` },
  teddy:    { x: 60, y: 96, w: 10, svg: `<svg viewBox="0 0 50 54"><circle cx="13" cy="10" r="7" fill="#d9a46f" ${FL}/><circle cx="37" cy="10" r="7" fill="#d9a46f" ${FL}/><ellipse cx="25" cy="40" rx="15" ry="12" fill="#d9a46f" ${FL}/><circle cx="25" cy="21" r="14" fill="#e8b98a" ${FL}/><ellipse cx="25" cy="25" rx="6" ry="4.5" fill="#fff3e2"/><circle cx="20" cy="18" r="1.8" fill="#5b4040"/><circle cx="30" cy="18" r="1.8" fill="#5b4040"/><circle cx="25" cy="23" r="1.6" fill="#5b4040"/><path d="M20 33 l5 3 l5 -3 l-5 -2z" fill="#ff8fb8" stroke="#5b4040" stroke-width="1.4"/></svg>` },
  table:    { x: 44, y: 86, w: 18, svg: `<svg viewBox="0 0 80 54"><ellipse cx="40" cy="14" rx="36" ry="9" fill="#fff" ${FL}/><path d="M6 16 q34 14 68 0" fill="#ffd3e3" ${FL}/><path d="M22 20 v30 M58 20 v30" ${FL} stroke-width="3.4"/><rect x="30" y="2" width="12" height="9" rx="3" fill="#fff" ${FL}/><path d="M42 4 a4 4 0 0 1 0 6" fill="none" stroke="#5b4040" stroke-width="1.8"/><circle cx="54" cy="8" r="4" fill="#ffd45c" stroke="#5b4040" stroke-width="1.6"/></svg>` },
  lamp:     { x: 33, y: 80, w: 8, svg: `<svg viewBox="0 0 40 100"><path d="M8 4 h24 l6 26 h-36z" fill="#fff3b0" ${FL}/><path d="M20 30 v62" ${FL} stroke-width="3"/><ellipse cx="20" cy="94" rx="12" ry="4" fill="#c9a8ef" ${FL}/><g class="lamp-glow"><ellipse cx="20" cy="34" rx="22" ry="8" fill="#fff6a0" opacity=".55"/></g></svg>` },
  piano:    { x: 88, y: 66, w: 22, svg: `<svg viewBox="0 0 100 80"><rect x="6" y="4" width="88" height="50" rx="6" fill="#ff8fb8" ${FL}/><rect x="6" y="40" width="88" height="14" fill="#fff" ${FL}/>${Array.from({ length: 7 }, (_, i) => `<path d="M${18 + i * 11} 40 v14" stroke="#5b4040" stroke-width="1.4"/>`).join('')}${[0, 1, 3, 4, 5].map(i => `<rect x="${15 + i * 11}" y="40" width="6" height="8" fill="#5b4040"/>`).join('')}<rect x="12" y="54" width="8" height="22" fill="#ff8fb8" ${FL}/><rect x="80" y="54" width="8" height="22" fill="#ff8fb8" ${FL}/><path d="M30 18 q4 -8 8 0 M60 14 l0 14" stroke="#fff" stroke-width="2.6" fill="none"/><circle cx="58" cy="28" r="3" fill="#fff"/></svg>` },
  toybox:   { x: 70, y: 78, w: 14, svg: `<svg viewBox="0 0 64 56"><rect x="4" y="22" width="56" height="30" rx="5" fill="#7cc6ff" ${FL}/><path d="M4 22 h56 l-4 -8 h-48z" fill="#5aa8de" ${FL}/><circle cx="20" cy="12" r="7" fill="#ffd45c" ${FL}/><path d="M34 14 l6 -10 l6 10z" fill="#ff8fb8" ${FL}/><rect x="26" y="30" width="12" height="10" rx="3" fill="#fff" ${FL}/><path d="M10 44 h44" stroke="#fff" stroke-width="3" stroke-dasharray="3 5"/></svg>` },
  aquarium: { x: 56, y: 72, w: 16, svg: `<svg viewBox="0 0 70 70"><rect x="6" y="6" width="58" height="42" rx="6" fill="#bfe6ff" ${FL}/><path d="M8 18 h54" stroke="#fff" stroke-width="2"/><path d="M14 46 q2 -14 -2 -22 M20 46 q3 -10 0 -16" stroke="#6cb85a" stroke-width="3" fill="none" stroke-linecap="round"/><g class="aq-fish"><path d="M34 30 c4 -6 12 -6 15 0 c-3 6 -11 6 -15 0z" fill="#ff9d3b" stroke="#5b4040" stroke-width="1.6"/><path d="M48 30 l5 -4 v8z" fill="#ff9d3b" stroke="#5b4040" stroke-width="1.6"/></g><circle cx="44" cy="16" r="2" fill="#fff"/><circle cx="48" cy="11" r="1.5" fill="#fff"/><rect x="10" y="48" width="50" height="16" rx="3" fill="#e8b98a" ${FL}/></svg>` },
  dresser:  { x: 14, y: 76, w: 15, svg: `<svg viewBox="0 0 60 90"><ellipse cx="30" cy="22" rx="18" ry="20" fill="#eaf7ff" stroke="#c9a8ef" stroke-width="5"/><path d="M22 12 l6 -4 M20 20 l12 -10" stroke="#fff" stroke-width="3" stroke-linecap="round"/><rect x="6" y="44" width="48" height="42" rx="5" fill="#fff" ${FL}/><path d="M6 64 h48" ${FL}/><circle cx="30" cy="54" r="2.5" fill="#ff8fb8"/><circle cx="30" cy="75" r="2.5" fill="#ff8fb8"/><circle cx="48" cy="40" r="4" fill="#ff8fb8" stroke="#5b4040" stroke-width="1.5"/></svg>` },
  cushion:  { x: 40, y: 98, w: 11, svg: `<svg viewBox="0 0 50 30"><path d="M4 16 C4 4 46 4 46 16 C46 28 4 28 4 16Z" fill="#ffd45c" ${FL}/><path d="M25 9 v14 M14 16 h22" stroke="#e0a400" stroke-width="2"/><circle cx="25" cy="16" r="3" fill="#fff"/></svg>` },
  clock:    { x: 50, y: 30, w: 9, wall: true, svg: `<svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="21" fill="#fff" stroke="#a98cf0" stroke-width="5"/><path d="M25 25 v-12 M25 25 l8 5" stroke="#5b4040" stroke-width="2.6" stroke-linecap="round"/>${[0, 90, 180, 270].map(a => `<circle cx="${25 + 15 * Math.sin(a * Math.PI / 180)}" cy="${25 - 15 * Math.cos(a * Math.PI / 180)}" r="2" fill="#ff8fb8"/>`).join('')}</svg>` },
  picture:  { x: 72, y: 34, w: 14, wall: true, svg: `<svg viewBox="0 0 70 54"><rect x="4" y="4" width="62" height="46" rx="4" fill="#ffd45c" ${FL}/><rect x="10" y="10" width="50" height="34" fill="#bfe6ff"/><path d="M10 44 l14 -16 l10 10 l8 -8 l18 14z" fill="#8fd47c"/><circle cx="48" cy="20" r="5" fill="#fff6a0"/></svg>` },
  shelf:    { x: 30, y: 36, w: 16, wall: true, svg: `<svg viewBox="0 0 80 44"><rect x="4" y="32" width="72" height="7" rx="3" fill="#e8b98a" ${FL}/><rect x="10" y="12" width="14" height="20" rx="3" fill="#ffb3cc" ${FL}/><path d="M34 32 c0 -12 12 -12 12 0" fill="#8fd47c" ${FL}/><circle cx="40" cy="16" r="5" fill="#ff8fb8" ${FL}/><rect x="54" y="18" width="16" height="14" rx="3" fill="#7cc6ff" ${FL}/><path d="M58 18 v-4 h8 v4" fill="none" stroke="#5b4040" stroke-width="1.8"/></svg>` },
  garland:  { x: 50, y: 12, w: 46, wall: true, svg: `<svg viewBox="0 0 200 30"><path d="M4 4 Q100 26 196 4" fill="none" stroke="#c9a" stroke-width="2"/>${Array.from({ length: 9 }, (_, i) => { const x = 14 + i * 21, y = 4 + 18 * (1 - Math.pow((x - 100) / 96, 2)) * .62; return `<path d="M${x - 7} ${y} h14 l-7 12z" fill="${['#ff9fc1', '#ffd45c', '#8fdcc8', '#a98cf0', '#7cc6ff'][i % 5]}" stroke="#5b4040" stroke-width="1.4"/>`; }).join('')}</svg>` },
};

const WALLS = {
  dot:    { name: 'みずたま', css: 'radial-gradient(#ead9ff 2.5px, transparent 3.5px) 0 0 / 26px 26px, #fdf6ff', icon: '#ead9ff' },
  stripe: { name: 'ストライプ', css: 'repeating-linear-gradient(90deg, #ffe1ec 0 22px, #fff4f8 22px 44px)', icon: '#ffc0d6' },
  star:   { name: 'おほしさま', css: 'radial-gradient(circle, #fff6b0 0 3px, transparent 4px) 0 0 / 40px 40px, radial-gradient(circle, #ffffff 0 2px, transparent 3px) 20px 20px / 40px 40px, #cfe9ff', icon: '#cfe9ff' },
  check:  { name: 'チェック', css: 'repeating-linear-gradient(0deg, rgba(143,212,124,.25) 0 16px, transparent 16px 32px), repeating-linear-gradient(90deg, rgba(143,212,124,.25) 0 16px, transparent 16px 32px), #f4fff0', icon: '#c9efc0' },
};
const FLOORS = {
  wood:   { name: 'フローリング', css: 'repeating-linear-gradient(90deg, #f3dcc5 0 46px, #ead0b4 46px 48px)', icon: '#f3dcc5' },
  pink:   { name: 'ピンクの じゅうたん', css: 'radial-gradient(#ffd0de 2px, transparent 3px) 0 0 / 14px 14px, #ffe6ef', icon: '#ffd0de' },
  tile:   { name: 'ミントの タイル', css: 'repeating-linear-gradient(0deg, #c9f0e4 0 30px, #fff 30px 32px), #c9f0e4', icon: '#9fe3cf' },
};

function roomState() {
  if (!S.room) S.room = { wall: 'dot', floor: 'wood', pos: {}, hide: [] };
  return S.room;
}
const isFurn = (id) => !!FURN[id];
const furnIcon = (id) => FURN[id] ? FURN[id].svg : WALLS[id.replace('wall_', '')] ? `<span class="swatch" style="background:${WALLS[id.replace('wall_', '')].css}"></span>` : `<span class="swatch" style="background:${FLOORS[id.replace('floor_', '')].css}"></span>`;

// おみせの かぐ（おうちで つかう もの）
(function addRoomItems() {
  const more = [
    { id: 'cushion',  name: 'クッション',   price: 100 },
    { id: 'lamp',     name: 'スタンドライト', price: 160 },
    { id: 'shelf',    name: 'かべの たな',  price: 170 },
    { id: 'garland',  name: 'ガーランド',   price: 190 },
    { id: 'table',    name: 'おちゃの テーブル', price: 240 },
    { id: 'toybox',   name: 'おもちゃばこ', price: 260 },
    { id: 'aquarium', name: 'すいそう',     price: 320 },
    { id: 'dresser',  name: 'ドレッサー',   price: 380 },
    { id: 'piano',    name: 'ピアノ',       price: 520 },
    { id: 'wall_stripe', name: 'かべがみ（ストライプ）', price: 120 },
    { id: 'wall_star',   name: 'かべがみ（おほしさま）', price: 150 },
    { id: 'wall_check',  name: 'かべがみ（チェック）',   price: 150 },
    { id: 'floor_pink',  name: 'ゆか（じゅうたん）',     price: 130 },
    { id: 'floor_tile',  name: 'ゆか（タイル）',         price: 130 },
  ];
  more.forEach(m => ITEMS.push({ ...m, cat: 'room' }));
  const rooms = ITEMS.filter(i => i.cat === 'room').sort((a, b) => a.price - b.price);
  rooms.forEach(i => { i.icon = furnIcon(i.id); ITEMS.splice(ITEMS.indexOf(i), 1); });
  ITEMS.push(...rooms);
})();

function roomHTML(inner) {
  const rs = roomState();
  const owned = S.owned.filter(id => isFurn(id) && !rs.hide.includes(id));
  const furn = owned.map(id => {
    const f = FURN[id], [x, y] = rs.pos[id] || [f.x, f.y];
    return `<button class="furn2 ${f.wall ? 'wall' : ''} f-${id}" data-f="${id}" style="left:${x}%;top:${y}%;width:${f.w}%;z-index:${f.wall ? 1 : Math.round(y)}">${f.svg}</button>`;
  }).join('');
  return `<section class="room room2" id="room" style="--wall:${WALLS[rs.wall].css};--floor:${FLOORS[rs.floor].css}">
      <div class="r-wall"></div><div class="r-floor"></div>
      <div class="r-window"><div class="r-sky"><i></i></div><span class="r-cur l"></span><span class="r-cur r"></span></div>
      <div class="r-door" id="door"><span></span></div>
      <div class="r-light"></div>
      ${furn}
      <div class="rug"></div>
      ${inner}
      <div id="guests"></div>
      <div class="r-edit-tip">かぐを ドラッグして うごかそう</div>
    </section>`;
}

// かぐを タップした ときの おたのしみ
function furnFun(id, el) {
  const pop = (t) => { const s = document.createElement('span'); s.className = 'fun-pop'; s.textContent = t; el.appendChild(s); setTimeout(() => s.remove(), 900); };
  if (id === 'piano') {
    const notes = [523, 587, 659, 698, 784, 880, 988, 1047];
    if (S.settings.sound && window.AudioContext) {
      try {
        const ctx = (window.__pianoCtx = window.__pianoCtx || new (window.AudioContext || window.webkitAudioContext)());
        [0, 2, 4, 7].forEach((k, i) => {
          const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + i * 0.18;
          o.type = 'triangle'; o.frequency.value = notes[(k + rnd(0, 3)) % 8];
          g.gain.setValueAtTime(.18, t); g.gain.exponentialRampToValueAtTime(.001, t + .5);
          o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + .5);
        });
      } catch (e) { /* おと なし */ }
    }
    pop('♪♫');
  } else if (id === 'lamp') { el.classList.toggle('off'); sfx('tap'); }
  else if (id === 'teddy') { pop('ぎゅっ♡'); sfx('tap'); }
  else if (id === 'aquarium') { pop(`${(S.fish && S.fish.caught) || 0}ひき つったよ`); sfx('tap'); }
  else if (id === 'toybox') { pop(pick(['ボール!', 'つみき!', 'にんぎょう!'])); sfx('coin'); }
  else if (id === 'clock') { const d = new Date(); pop(`${d.getHours()}じ ${d.getMinutes()}ふん`); sfx('tap'); }
  else { pop(pick(['♡', '✨', 'かわいい!'])); sfx('tap'); }
  el.classList.remove('wiggle'); void el.offsetWidth; el.classList.add('wiggle');
}

function initRoom() {
  const room = $('#room'), rs = roomState();
  let editing = false;
  $$('.furn2', room).forEach(el => {
    const id = el.dataset.f;
    let drag = null;
    el.addEventListener('pointerdown', (e) => {
      if (!editing) return;
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      drag = { sx: e.clientX, sy: e.clientY, x: parseFloat(el.style.left), y: parseFloat(el.style.top) };
      el.classList.add('dragging');
    });
    el.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const r = room.getBoundingClientRect();
      const f = FURN[id];
      const x = Math.min(96, Math.max(4, drag.x + (e.clientX - drag.sx) / r.width * 100));
      const y = Math.min(f.wall ? 58 : 100, Math.max(f.wall ? 10 : 62, drag.y + (e.clientY - drag.sy) / r.height * 100));
      el.style.left = x + '%'; el.style.top = y + '%';
      if (!f.wall) el.style.zIndex = Math.round(y);
    });
    const end = () => {
      if (!drag) return;
      drag = null;
      el.classList.remove('dragging');
      rs.pos[id] = [Math.round(parseFloat(el.style.left)), Math.round(parseFloat(el.style.top))];
      save();
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('click', (e) => { e.stopPropagation(); if (!editing) furnFun(id, el); });
  });
  return {
    setEditing(on) { editing = on; room.classList.toggle('editing', on); },
  };
}

// もようがえ パネル
function decorPanelHTML() {
  const rs = roomState();
  const walls = Object.keys(WALLS).filter(k => k === 'dot' || S.owned.includes('wall_' + k));
  const floors = Object.keys(FLOORS).filter(k => k === 'wood' || S.owned.includes('floor_' + k));
  const furn = S.owned.filter(isFurn);
  return `<div class="mini decor">
    <h3>🛋️ もようがえ</h3>
    <p class="muted">かぐを ドラッグで うごかせるよ。タップで だす・しまう</p>
    <div class="chips">${furn.length ? furn.map(id => `<button class="chip furnchip ${rs.hide.includes(id) ? '' : 'on'}" data-show="${id}"><span class="fc-pic">${FURN[id].svg}</span></button>`).join('') : '<p class="muted">かぐは おかいもので かえるよ</p>'}</div>
    <div class="decor-row"><b>かべがみ</b>${walls.map(k => `<button class="swbtn ${rs.wall === k ? 'on' : ''}" data-wall="${k}" style="background:${WALLS[k].css}" aria-label="${WALLS[k].name}"></button>`).join('')}</div>
    <div class="decor-row"><b>ゆか</b>${floors.map(k => `<button class="swbtn ${rs.floor === k ? 'on' : ''}" data-floor="${k}" style="background:${FLOORS[k].css}" aria-label="${FLOORS[k].name}"></button>`).join('')}</div>
    <div class="row"><button class="btn ok" id="decorDone">できた!</button></div>
  </div>`;
}

/* ---------- ともだちが あそびに くる ---------- */
const VISIT_TALK = [
  ['きょうは なにして あそぶ?', 'おへや かわいいね!'],
  ['この ソファ ふかふか〜', 'いいなあ!'],
  ['ケーキ つくるの じょうずに なった?', 'うん! こんど もってくるね'],
  ['いけで さかな つった?', 'プログラムで つったよ!'],
  ['えいごで あいさつ できる?', 'Hello! Nice to meet you!'],
  ['あした こうえん いこうよ', 'いいね! とけい クイズ しよう'],
];
function startVisit(onEnd) {
  const others = Object.keys(CHARS).filter(id => id !== S.partner);
  const g = $('#guests');
  const door = $('#door');
  door.classList.add('open');
  sfx('ok');
  g.innerHTML = others.map((id, i) => `<div class="guest g${i}" data-id="${id}"><div class="guest-in">${charSVG(id, 'happy')}</div><div class="gbubble"></div></div>`).join('');
  const today = new Date().toDateString();
  const first = S.visitDay !== today;
  if (first) { S.visitDay = today; save(); }
  setTimeout(() => { door.classList.remove('open'); }, 1600);
  const sayG = (k, text, ms = 2600) => {
    const b = $$('.gbubble', g)[k];
    if (!b) return;
    b.textContent = text; b.classList.add('show');
    clearTimeout(b._tm); b._tm = setTimeout(() => b.classList.remove('show'), ms);
  };
  setTimeout(() => {
    sayG(0, `${nameOf(S.partner)}、あそびに きたよ!`);
    setTimeout(() => sayG(1, 'おじゃまします〜'), 900);
    if (first) setTimeout(() => { addXP(3); }, 1800);
  }, 1300);
  $$('.guest', g).forEach((el, k) => el.onclick = (e) => {
    e.stopPropagation();
    const inner = el.querySelector('.guest-in');
    inner.classList.remove('jump'); void inner.offsetWidth; inner.classList.add('jump');
    sfx('tap');
    sayG(k, pick(['えへへ', `${nameOf(el.dataset.id)}だよ!`, 'たのしいね!', 'なでなで うれしい', 'また あそぼうね']));
  });
  return {
    talk() {
      const [a, b] = pick(VISIT_TALK);
      const k = rnd(0, 1);
      sayG(k, a, 3000);
      setTimeout(() => { $('#pbubble').textContent = b; }, 1200);
      sfx('tap');
    },
    party(foodId) {
      S.food[foodId]--;
      const pt = pet();
      pt.hunger = Math.min(100, pt.hunger + (FOOD_POWER[foodId] || 20));
      save();
      const room = $('#room');
      room.insertAdjacentHTML('beforeend', `<div class="party-food">${item(foodId).icon}</div>`);
      $$('.guest-in', g).forEach(x => { x.classList.remove('jump'); void x.offsetWidth; x.classList.add('jump'); });
      sayG(0, 'おいしい〜!'); sayG(1, 'ありがとう!');
      $('#pbubble').textContent = 'みんなで たべると おいしいね!';
      sfx('fanfare');
      sparkle(room, 16);
      addXP(4);
    },
    bye() {
      sayG(0, 'またね〜!'); sayG(1, 'バイバイ!');
      $('#door').classList.add('open');
      $$('.guest', g).forEach(el => el.classList.add('leave'));
      sfx('tap');
      setTimeout(() => { g.innerHTML = ''; $('#door') && $('#door').classList.remove('open'); onEnd && onEnd(); }, 1500);
    },
  };
}
