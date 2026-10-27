'use strict';
// ちゅうしゃじょう だっしゅつ: くるまを まえ・うしろに すべらせて、ピンクの くるまを でぐちから だす パズル（6×6）。
// くるまは ゆびで ドラッグ。たて むきの くるまは たてだけ、よこ むきは よこだけ うごく。

const CP_N = 6;
const CP_ROW = 2; // でぐちの ある ぎょう
const CP_COLORS = ['#7cc6ff', '#ffd45c', '#8fd8b8', '#b48ef0', '#ffb36b', '#9ad0f0', '#c9e37a', '#f7a8a8', '#c7b3e8', '#7fd6c2', '#ffcf8a'];

function parkingState() {
  if (!S.parking) S.parking = { lv: 1, clears: 0 };
  return S.parking;
}
// レベルごとの くるまの かず と、いちばん すくない てかずの めやす
function cpSpec(lv) {
  if (lv <= 1) return { cars: [3, 4], min: [2, 3] };
  if (lv <= 2) return { cars: [4, 5], min: [3, 4] };
  if (lv <= 4) return { cars: [5, 7], min: [4, 6] };
  if (lv <= 7) return { cars: [6, 8], min: [6, 9] };
  if (lv <= 11) return { cars: [7, 10], min: [8, 12] };
  return { cars: [8, 11], min: [10, 18] };
}
const cpPrize = (lv) => 10 + Math.min(lv, 10) * 2;

/* ---- ルール ---- */
// くるま: { h: よこむき?, len, fix: うごかない ほうの ざひょう }、いち（pos）は べつの はいれつ
function cpGrid(cars, pos, skip = -1) {
  const g = new Int8Array(CP_N * CP_N).fill(-1);
  cars.forEach((car, i) => {
    if (i === skip) return;
    for (let k = 0; k < car.len; k++) {
      const r = car.h ? car.fix : pos[i] + k, c = car.h ? pos[i] + k : car.fix;
      g[r * CP_N + c] = i;
    }
  });
  return g;
}
// くるま i が うごける はんい [さいしょう, さいだい]
function cpRange(cars, pos, i) {
  const g = cpGrid(cars, pos, i), car = cars[i];
  const free = (p) => p >= 0 && p < CP_N && g[(car.h ? car.fix * CP_N + p : p * CP_N + car.fix)] < 0;
  let lo = pos[i], hi = pos[i];
  while (free(lo - 1)) lo--;
  while (free(hi + car.len)) hi++;
  return [lo, hi];
}
const cpWon = (pos) => pos[0] === CP_N - 2;

// いちばん みじかい てじゅん（1かい すべらせる＝1て）
function cpSolve(cars, start, limit = 40000) {
  const key = (p) => String.fromCharCode(...p.map(x => 48 + x));
  const k0 = key(start);
  const prev = new Map([[k0, null]]);
  let q = [start];
  while (q.length) {
    const nq = [];
    for (const p of q) {
      if (cpWon(p)) {
        const path = [];
        let k = key(p);
        while (prev.get(k)) { const [pk, mv] = prev.get(k); path.unshift(mv); k = pk; }
        return path;
      }
      const pk = key(p);
      for (let i = 0; i < cars.length; i++) {
        const [lo, hi] = cpRange(cars, p, i);
        for (let v = lo; v <= hi; v++) {
          if (v === p[i]) continue;
          const np = p.slice(); np[i] = v;
          const k = key(np);
          if (prev.has(k)) continue;
          prev.set(k, [pk, [i, v]]);
          nq.push(np);
        }
      }
      if (prev.size > limit) return null;
    }
    q = nq;
  }
  return null;
}

function cpMake(lv) {
  const sp = cpSpec(lv);
  const t0 = Date.now();
  let best = null;
  for (let n = 0; n < 4000; n++) {
    if (best && (Date.now() - t0 > (lv >= 6 ? 600 : 350) || (best.min >= sp.min[0] && best.min <= sp.min[1]))) break;
    const cars = [{ h: true, len: 2, fix: CP_ROW, color: '#ff8fb8', me: true }];
    const pos = [rnd(0, lv <= 1 ? 2 : 1)];
    const want = rnd(sp.cars[0], sp.cars[1]);
    for (let tries = 0; cars.length < want && tries < 80; tries++) {
      const h = Math.random() < .45, len = Math.random() < .28 ? 3 : 2;
      const fix = rnd(0, CP_N - 1), p = rnd(0, CP_N - len);
      if (h && fix === CP_ROW) continue;
      const car = { h, len, fix };
      const g = cpGrid(cars, pos);
      let ok = true;
      for (let k = 0; k < len && ok; k++) if (g[h ? fix * CP_N + p + k : (p + k) * CP_N + fix] >= 0) ok = false;
      if (!ok) continue;
      cars.push(car); pos.push(p);
    }
    const path = cpSolve(cars, pos);
    if (!path || path.length < 1) continue;
    const m = path.length;
    const score = m > sp.min[1] ? -1 : m;
    if (!best || score > best.score) best = { cars, pos, min: m, score };
  }
  if (!best) best = { cars: [{ h: true, len: 2, fix: CP_ROW, color: '#ff8fb8', me: true }, { h: false, len: 2, fix: 3, color: '' }], pos: [0, 2], min: 2 };
  best.cars.forEach((c, i) => { if (!c.me) { c.color = CP_COLORS[(i * 7 + lv) % CP_COLORS.length]; c.flip = Math.random() < .5; } });
  return best;
}

/* ---- え ---- */
// くるまを うえから みた え（よこむき・みぎが まえ）
function cpCarSVG(car) {
  const L = car.len * 100, line = '#7b5a4f';
  const wheels = [L * .22, L - L * .22].map(x => `<rect x="${x - 15}" y="4" width="30" height="16" rx="7" fill="#5b4a52"/><rect x="${x - 15}" y="80" width="30" height="16" rx="7" fill="#5b4a52"/>`).join('');
  let body;
  if (car.len === 3) {
    // トラック: まえに うんてんせき、うしろに にだい
    body = `<rect x="${L - 120}" y="34" width="30" height="32" fill="#9a8a96" stroke="${line}" stroke-width="3"/>
      <rect x="8" y="10" width="${L - 116}" height="80" rx="14" fill="${car.color}" stroke="${line}" stroke-width="4"/>
      <rect x="18" y="20" width="${L - 136}" height="60" rx="8" fill="#fff" opacity=".55"/>
      <path d="M34 34 H${L - 142} M34 50 H${L - 142} M34 66 H${L - 142}" stroke="${car.color}" stroke-width="6" stroke-linecap="round"/>
      <rect x="${L - 98}" y="14" width="88" height="72" rx="22" fill="${car.color}" stroke="${line}" stroke-width="4"/>
      <path d="M${L - 40} 24 q16 26 0 52" fill="none" stroke="#dff3ff" stroke-width="12" stroke-linecap="round"/>
      <path d="M${L - 40} 24 q16 26 0 52" fill="none" stroke="${line}" stroke-width="2.5" stroke-linecap="round" opacity=".5"/>
      <rect x="${L - 88}" y="22" width="34" height="10" rx="5" fill="#fff" opacity=".55"/>`;
  } else {
    body = `<rect x="6" y="12" width="${L - 12}" height="76" rx="28" fill="${car.color}" stroke="${line}" stroke-width="4"/>
      <rect x="${L * .3}" y="22" width="${L * .36}" height="56" rx="16" fill="#fff" opacity=".35"/>
      <path d="M${L * .7} 22 q16 28 0 56" fill="none" stroke="#dff3ff" stroke-width="13" stroke-linecap="round"/>
      <path d="M${L * .24} 26 q-10 24 0 48" fill="none" stroke="#dff3ff" stroke-width="9" stroke-linecap="round"/>
      <rect x="22" y="20" width="${L * .3}" height="9" rx="4.5" fill="#fff" opacity=".6"/>
      ${car.me ? `<path d="${heartPath(L * .48, 50, 11)}" fill="#fff" stroke="${line}" stroke-width="2.5" stroke-linejoin="round"/>` : ''}`;
  }
  const lights = `<circle cx="${L - 12}" cy="24" r="6" fill="#fff3a8" stroke="${line}" stroke-width="2"/><circle cx="${L - 12}" cy="76" r="6" fill="#fff3a8" stroke="${line}" stroke-width="2"/>`;
  const art = `<rect x="10" y="18" width="${L - 16}" height="76" rx="26" fill="rgba(90,60,80,.18)"/>${wheels}${body}${lights}`;
  const flip = car.flip ? `translate(${L} 0) scale(-1 1)` : '';
  if (car.h) return `<svg viewBox="0 0 ${L} 100"><g transform="${flip}">${art}</g></svg>`;
  return `<svg viewBox="0 0 100 ${L}"><g transform="translate(100 0) rotate(90)"><g transform="${flip}">${art}</g></g></svg>`;
}

function startParkingGame() {
  setArea('shop');
  const st = parkingState();
  const lv = st.lv;
  const puz = cpMake(lv);
  const cars = puz.cars;
  const G = { pos: puz.pos.slice(), hist: [], moves: 0, hint: false, over: false };

  $('#app').innerHTML = `
    <div class="screen cpark">
      <header class="bar">
        <button class="iconbtn" id="back" aria-label="おかいものへ">↩️</button>
        <h2>ちゅうしゃじょう だっしゅつ</h2>
        ${walletHTML()}
      </header>
      <div class="mg-hud">
        <div class="mg-box"><small>レベル</small><b>${lv}</b></div>
        <div class="mg-box"><small>うごかした</small><b id="cpmoves">0</b></div>
        <div class="mg-box"><small>めやす</small><b>${puz.min}</b></div>
        <button class="btn sub" id="cpundo">もどす</button>
        <button class="btn sub" id="cphint">ヒント</button>
        <button class="btn sub" id="cpreset">さいしょから</button>
      </div>
      <div class="cp-wrap">
        <div class="mg-side">
          <div class="mg-buddy bounce">${charSVG(S.partner, 'happy', S.wear)}</div>
          <div class="bubble mg-say" id="cpsay">くるまを ゆびで うごかして、ピンクの くるまを でぐちへ!</div>
        </div>
        <section class="cp-lot" id="cplot">
          <div class="cp-grid" id="cpgrid">
            <div class="cp-exit"><b>でぐち</b><span class="cp-arrow">➜</span></div>
          </div>
        </section>
      </div>
    </div>`;
  const grid = $('#cpgrid');
  const say = (txt) => { const s = $('#cpsay'); s.textContent = txt; s.classList.remove('pop'); void s.offsetWidth; s.classList.add('pop'); };

  const els = cars.map((car, i) => {
    const el = document.createElement('div');
    el.className = `cp-car ${car.h ? 'h' : 'v'}${car.me ? ' me' : ''}`;
    el.style.setProperty('--len', car.len);
    el.style.setProperty('--fix', car.fix);
    el.innerHTML = cpCarSVG(car);
    grid.appendChild(el);
    el.addEventListener('pointerdown', (e) => grab(e, i));
    return el;
  });
  const setPos = (i, p) => els[i].style.setProperty('--p', p);
  function draw() {
    G.pos.forEach((p, i) => setPos(i, p));
    $('#cpmoves').textContent = G.moves;
    $('#cpundo').disabled = !G.hist.length || G.over;
  }
  const clearHint = () => { $$('.cp-ghost', grid).forEach(g => g.remove()); els.forEach(e => e.classList.remove('hint')); };

  // ドラッグ
  let drag = null;
  function grab(e, i) {
    if (G.over || drag) return;
    e.preventDefault();
    clearHint();
    const car = cars[i];
    const [lo, hi] = cpRange(cars, G.pos, i);
    const cell = grid.getBoundingClientRect().width / CP_N;
    drag = { i, lo, hi, start: G.pos[i], at: car.h ? e.clientX : e.clientY, cell, id: e.pointerId, cur: G.pos[i] };
    els[i].classList.add('drag');
    try { els[i].setPointerCapture(e.pointerId); } catch (er) { /* なし */ }
    sfx('tap');
  }
  function onMove(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const car = cars[drag.i];
    const d = ((car.h ? e.clientX : e.clientY) - drag.at) / drag.cell;
    drag.cur = Math.max(drag.lo, Math.min(drag.hi, drag.start + d));
    setPos(drag.i, drag.cur);
  }
  function onUp(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const { i, start } = drag;
    const p = Math.round(drag.cur);
    els[i].classList.remove('drag');
    drag = null;
    if (p !== start) {
      G.hist.push(G.pos.slice());
      G.pos[i] = p;
      G.moves++;
      sfx('tap');
    }
    draw();
    if (cpWon(G.pos)) finish();
  }
  grid.addEventListener('pointermove', onMove);
  grid.addEventListener('pointerup', onUp);
  grid.addEventListener('pointercancel', onUp);

  function finish() {
    G.over = true;
    draw();
    els[0].classList.add('out');
    sfx('coin');
    const star = !G.hint && G.moves <= puz.min + 2;
    const yen = cpPrize(lv) + (star ? 5 : 0);
    S.money += yen;
    st.clears++;
    st.lv = lv + 1;
    addXP(2 + Math.min(lv, 5));
    save();
    setTimeout(() => {
      bumpWallet();
      celebrate(true);
      sfx('fanfare');
      const ov = document.createElement('div');
      ov.className = 'ct-start';
      ov.innerHTML = `<div class="ct-card done">
        <div class="reveal bounce">${charSVG(S.partner, 'happy', S.wear)}</div>
        <h3>だっしゅつ せいこう!</h3>
        <p>レベル ${lv} クリア ・ ${G.moves}かい うごかしたよ（めやす ${puz.min}かい）</p>
        ${star ? '<p>すくない かずで できたね <span class="ct-best">★ +5円</span></p>' : ''}
        <p class="pay">おこづかい <b>${yen}円</b></p>
        <div class="row"><button class="btn ok" id="cpnext">つぎの レベルへ</button><button class="btn sub" id="cpout">おかいものへ</button></div></div>`;
      $('#cplot').appendChild(ov);
      sparkle($('.reveal', ov), 16);
      $('#cpnext').onclick = () => { sfx('tap'); startParkingGame(); };
      $('#cpout').onclick = () => screenShop();
    }, 750);
  }

  $('#back').onclick = () => screenShop();
  $('#cpundo').onclick = () => {
    if (drag || !G.hist.length || G.over) return;
    clearHint();
    G.pos = G.hist.pop(); G.moves = Math.max(0, G.moves - 1);
    sfx('tap'); draw(); say('1かい もどしたよ');
  };
  $('#cpreset').onclick = () => {
    if (drag || G.over) return;
    clearHint();
    G.pos = puz.pos.slice(); G.hist = []; G.moves = 0;
    sfx('tap'); draw(); say('さいしょの ならびに もどしたよ');
  };
  $('#cphint').onclick = () => {
    if (drag || G.over) return;
    clearHint();
    const path = cpSolve(cars, G.pos);
    if (!path || !path.length) return;
    G.hint = true;
    const [i, v] = path[0];
    els[i].classList.add('hint');
    const gh = document.createElement('div');
    gh.className = `cp-ghost ${cars[i].h ? 'h' : 'v'}`;
    gh.style.setProperty('--len', cars[i].len);
    gh.style.setProperty('--fix', cars[i].fix);
    gh.style.setProperty('--p', v);
    grid.appendChild(gh);
    say('ひかってる くるまを、てんせんの ところまで うごかしてみて');
  };
  window.__parking = { G, cars, puz, els };
  draw();
}
