'use strict';
// すうじ がったい: おなじ かずを くっつけて 2ばいに する パズル（4×4）。
// スワイプ（やじるしキー）で ぜんぶの タイルが すべる。とちゅうから つづきも できる。

const MG_N = 4;
const MG_TIER = { 2: 'cherry', 4: 'strawberry', 8: 'cookie', 16: 'cupcake', 32: 'icecream', 64: 'pudding', 128: 'cake', 256: 'heart', 512: 'star', 1024: 'rainbow', 2048: 'sparkle' };
const MG_COLOR = { 2: ['#fff4f8', '#d76b93'], 4: ['#ffe3ee', '#d4567f'], 8: ['#ffd1b8', '#c2602e'], 16: ['#ffe6a3', '#a8741a'], 32: ['#d8f3c2', '#4f8a2c'], 64: ['#c6ecf7', '#2b7b98'], 128: ['#d9d2ff', '#5d4fb8'], 256: ['#ffc8de', '#c23a72'], 512: ['#ffe066', '#9a6a00'], 1024: ['#b7f0e0', '#1f8466'], 2048: ['#ff9fc1', '#fff'] };
// はじめて つくると おこづかい
const MG_PRIZE = { 32: 2, 64: 3, 128: 5, 256: 8, 512: 12, 1024: 20, 2048: 40 };
const MG_UNDO = 3;

function mergeState() {
  if (!S.merge) S.merge = { best: 0, top: 0, game: null };
  return S.merge;
}

function startMergeGame(fresh) {
  setArea('park');
  const st = mergeState();
  if (fresh || !st.game) st.game = { tiles: [], score: 0, got: [], undo: MG_UNDO, hist: [], over: false };
  const G = st.game;
  let uid = 1;
  G.tiles.forEach(t => { t.id = uid++; });

  $('#app').innerHTML = `
    <div class="screen park merge">
      <header class="bar">
        <button class="iconbtn" id="back" aria-label="こうえんへ">↩️</button>
        <h2>すうじ がったい</h2>
        ${walletHTML()}
      </header>
      <div class="mg-hud">
        <div class="mg-box"><small>てんすう</small><b id="mgscore">0</b></div>
        <div class="mg-box"><small>さいこう</small><b id="mgbest">${st.best}</b></div>
        <button class="btn sub mg-undo" id="mgundo">もどす <span id="mgun"></span></button>
        <button class="btn sub" id="mgnew">さいしょから</button>
      </div>
      <div class="mg-wrap">
        <div class="mg-side">
          <div class="mg-buddy bounce">${charSVG(S.partner, 'happy', S.wear)}</div>
          <div class="bubble mg-say" id="mgsay">おなじ かずを くっつけよう!</div>
          <div class="mg-goal" id="mggoal"></div>
        </div>
        <section class="mg-board" id="mgboard">
          ${Array.from({ length: MG_N * MG_N }, () => '<i class="mg-cell"></i>').join('')}
        </section>
      </div>
    </div>`;
  const board = $('#mgboard');
  $('#back').onclick = () => { save(); screenPark(); };
  $('#mgnew').onclick = () => {
    if (G.tiles.length > 2 && !G.over && !confirm('いまの パズルを やめて さいしょから にする?')) return;
    sfx('tap'); startMergeGame(true);
  };

  const els = new Map();
  const tileHTML = (v) => `<span class="mg-ic">${iconSVG(MG_TIER[v] || 'sparkle')}</span><b>${v}</b>`;
  function place(t, el) {
    el.style.setProperty('--r', t.r);
    el.style.setProperty('--c', t.c);
    const [bg, fg] = MG_COLOR[t.v] || MG_COLOR[2048];
    el.style.setProperty('--bg', bg);
    el.style.setProperty('--fg', fg);
    el.dataset.v = t.v;
    el.classList.toggle('long', t.v >= 1000);
  }
  function draw(newIds = [], popIds = []) {
    const alive = new Set(G.tiles.map(t => t.id));
    for (const [id, el] of els) if (!alive.has(id)) { el.remove(); els.delete(id); }
    for (const t of G.tiles) {
      let el = els.get(t.id);
      if (!el) {
        el = document.createElement('div');
        el.className = 'mg-tile';
        board.appendChild(el);
        els.set(t.id, el);
      }
      if (el.dataset.v !== String(t.v)) el.innerHTML = tileHTML(t.v);
      place(t, el);
      if (newIds.includes(t.id)) { el.classList.remove('pop', 'new'); void el.offsetWidth; el.classList.add('new'); }
      if (popIds.includes(t.id)) { el.classList.remove('pop', 'new'); void el.offsetWidth; el.classList.add('pop'); }
    }
    $('#mgscore').textContent = G.score;
    $('#mgbest').textContent = st.best;
    $('#mgun').textContent = '×' + G.undo;
    $('#mgundo').disabled = !G.undo || !G.hist.length;
    const top = Math.max(0, ...G.tiles.map(t => t.v));
    const next = Object.keys(MG_PRIZE).map(Number).find(v => v > top && !G.got.includes(v)) || Object.keys(MG_PRIZE).map(Number).find(v => !G.got.includes(v));
    $('#mggoal').innerHTML = next ? `<small>つぎの めあて</small><div class="mg-mini" style="--bg:${MG_COLOR[next][0]};--fg:${MG_COLOR[next][1]}">${tileHTML(next)}</div><small>つくると <b>${MG_PRIZE[next]}円</b></small>` : '<small>ぜんぶ たっせい!</small>';
  }

  const at = (r, c) => G.tiles.find(t => t.r === r && t.c === c);
  function spawn() {
    const empty = [];
    for (let r = 0; r < MG_N; r++) for (let c = 0; c < MG_N; c++) if (!at(r, c)) empty.push([r, c]);
    if (!empty.length) return null;
    const [r, c] = pick(empty);
    const t = { id: uid++, r, c, v: Math.random() < .88 ? 2 : 4 };
    G.tiles.push(t);
    return t.id;
  }
  function canMove() {
    if (G.tiles.length < MG_N * MG_N) return true;
    return G.tiles.some(t => { const a = at(t.r, t.c + 1), b = at(t.r + 1, t.c); return (a && a.v === t.v) || (b && b.v === t.v); });
  }
  const say = (txt) => { const s = $('#mgsay'); s.textContent = txt; s.classList.remove('pop'); void s.offsetWidth; s.classList.add('pop'); };

  let busy = false;
  function move(dr, dc) {
    if (busy || G.over) return;
    const snap = { tiles: G.tiles.map(t => ({ r: t.r, c: t.c, v: t.v })), score: G.score };
    const order = [...G.tiles].sort((a, b) => (dr ? (b.r - a.r) * dr : (b.c - a.c) * dc));
    const merged = new Set(), gone = [];
    let moved = false, gain = 0;
    for (const t of order) {
      let r = t.r, c = t.c;
      for (;;) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nr >= MG_N || nc < 0 || nc >= MG_N) break;
        const o = G.tiles.find(x => x !== t && !gone.includes(x) && x.r === nr && x.c === nc);
        if (!o) { r = nr; c = nc; continue; }
        if (o.v === t.v && !merged.has(o.id) && !merged.has(t.id)) { r = nr; c = nc; gone.push(t); o.nv = o.v * 2; merged.add(o.id); }
        break;
      }
      if (r !== t.r || c !== t.c) { t.r = r; t.c = c; moved = true; }
    }
    if (!moved) { const b = $('#mgboard'); b.classList.remove('nudge'); void b.offsetWidth; b.classList.add('nudge'); return; }
    G.hist = [snap];
    busy = true;
    draw();
    setTimeout(() => {
      G.tiles = G.tiles.filter(t => !gone.includes(t));
      const pops = [];
      for (const t of G.tiles) if (t.nv) { t.v = t.nv; delete t.nv; gain += t.v; pops.push(t.id); }
      G.score += gain;
      if (G.score > st.best) st.best = G.score;
      const nid = spawn();
      draw([nid], pops);
      busy = false;
      if (pops.length) {
        sfx(pops.length > 1 ? 'coin' : 'tap');
        const top = Math.max(...G.tiles.map(t => t.v));
        if (top > st.top) st.top = top;
        for (const v of Object.keys(MG_PRIZE).map(Number)) {
          if (top >= v && !G.got.includes(v)) {
            G.got.push(v);
            S.money += MG_PRIZE[v];
            bumpWallet();
            celebrate(true);
            say(`${v} が できた! +${MG_PRIZE[v]}円`);
            addXP(v >= 128 ? 3 : 1);
          }
        }
      }
      if (!canMove()) finish();
      save();
    }, 130);
  }

  function finish() {
    G.over = true;
    sfx('fanfare');
    const top = Math.max(...G.tiles.map(t => t.v));
    const earned = G.got.reduce((a, v) => a + MG_PRIZE[v], 0);
    const ov = document.createElement('div');
    ov.className = 'ct-start';
    ov.innerHTML = `<div class="ct-card done">
      <div class="reveal bounce">${charSVG(S.partner, 'happy', S.wear)}</div>
      <h3>うごかせなく なったよ</h3>
      <p>いちばん おおきい かず <b>${top}</b></p>
      <p>てんすう ${G.score}${G.score >= st.best ? ' <span class="ct-best">さいこう!</span>' : ''}</p>
      <p class="pay">もらった おこづかい <b>${earned}円</b></p>
      ${G.undo && G.hist.length ? '<p class="muted">「もどす」で 1て まえに もどることも できるよ</p>' : ''}
      <div class="row">${G.undo && G.hist.length ? '<button class="btn sub" id="mgback1">もどす</button>' : ''}<button class="btn ok" id="mgagain">もう いっかい</button><button class="btn sub" id="mgpark">こうえんへ</button></div></div>`;
    board.appendChild(ov);
    sparkle($('.reveal', ov), 16);
    $('#mgagain').onclick = () => startMergeGame(true);
    $('#mgpark').onclick = () => { st.game = null; save(); screenPark('がったい たのしかったね!'); };
    if ($('#mgback1')) $('#mgback1').onclick = () => { ov.remove(); G.over = false; undo(); };
  }

  function undo() {
    if (!G.undo || !G.hist.length || busy) return;
    const snap = G.hist.pop();
    G.undo--;
    G.score = snap.score;
    G.tiles = snap.tiles.map(t => ({ ...t, id: uid++ }));
    els.forEach(el => el.remove()); els.clear();
    sfx('tap');
    draw();
    save();
  }
  $('#mgundo').onclick = undo;

  // スワイプ
  let sx = 0, sy = 0, down = false;
  board.addEventListener('pointerdown', (e) => { down = true; sx = e.clientX; sy = e.clientY; });
  board.addEventListener('pointerup', (e) => {
    if (!down) return; down = false;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) move(0, dx > 0 ? 1 : -1); else move(dy > 0 ? 1 : -1, 0);
  });
  board.addEventListener('pointercancel', () => { down = false; });
  const onKey = (e) => {
    if (!document.body.contains(board)) return document.removeEventListener('keydown', onKey);
    const d = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] }[e.key];
    if (d) { e.preventDefault(); move(...d); }
  };
  document.addEventListener('keydown', onKey);
  window.__merge = { G, move, undo };

  if (!G.tiles.length) { spawn(); spawn(); save(); }
  draw(G.tiles.map(t => t.id));
  if (G.over || !canMove()) finish();
}
