'use strict';
// ジュース いれかえ: いろんな いろの ジュースを うつしかえて、1ぽんに 1しょく だけに する パズル。
// ボトルを タップ → うつしたい ボトルを タップ。いっぱいに なった ボトルは キャップを しめて「のうひん」。

const JC_CAP = 4;
const JC_COLORS = [
  { id: 'ichigo', name: 'いちご',   c: '#ff86b0', d: '#e0588a', icon: 'strawberry' },
  { id: 'orange', name: 'オレンジ', c: '#ffa64a', d: '#e07c1c', icon: 'juice' },
  { id: 'lemon',  name: 'レモン',   c: '#ffe04d', d: '#d9b310', icon: 'star' },
  { id: 'melon',  name: 'メロン',   c: '#86d66c', d: '#4f9e3a', icon: 'leaf' },
  { id: 'budou',  name: 'ぶどう',   c: '#ac84ea', d: '#7d55c4', icon: 'blueberry' },
  { id: 'soda',   name: 'ソーダ',   c: '#62bcff', d: '#2f8ad6', icon: 'cloud' },
  { id: 'choco',  name: 'ココア',   c: '#b47a56', d: '#7e4e32', icon: 'choco' },
];

function juiceState() {
  if (!S.juice) S.juice = { lv: 1, clears: 0 };
  return S.juice;
}
// レベルごとの いろの かず（あきボトルは いつも 2ほん）
const jcColors = (lv) => (lv <= 1 ? 3 : lv <= 3 ? 4 : lv <= 6 ? 5 : lv <= 10 ? 6 : 7);
const jcPrize = (lv) => 10 + Math.min(lv, 10) * 2;

/* ---- ルール ---- */
const jcTop = (b) => b[b.length - 1];
const jcDone = (b) => b.length === JC_CAP && b.every(x => x === b[0]);
function jcRun(b) {
  let n = 0;
  for (let i = b.length - 1; i >= 0 && b[i] === jcTop(b); i--) n++;
  return n;
}
function jcCanPour(bs, i, j) {
  const a = bs[i], b = bs[j];
  if (i === j || !a.length || jcDone(a) || b.length >= JC_CAP) return false;
  return !b.length || jcTop(b) === jcTop(a);
}
function jcPour(bs, i, j) {
  const n = Math.min(jcRun(bs[i]), JC_CAP - bs[j].length);
  for (let k = 0; k < n; k++) bs[j].push(bs[i].pop());
  return n;
}
const jcWon = (bs) => bs.every(b => !b.length || jcDone(b));

// こたえを さがす（ヒントと、とけるか どうかの チェック）
function jcSolve(start, limit = 60000) {
  const key = (bs) => bs.map(b => b.join('')).sort().join('|');
  const seen = new Set([key(start)]);
  let nodes = 0;
  const path = [];
  function dfs(bs) {
    if (jcWon(bs)) return true;
    if (++nodes > limit) return false;
    for (let i = 0; i < bs.length; i++) {
      for (let j = 0; j < bs.length; j++) {
        if (!jcCanPour(bs, i, j)) continue;
        // ぜんぶ おなじ いろの ボトルを あきボトルへ うつすのは むだ
        if (!bs[j].length && bs[i].every(x => x === bs[i][0])) continue;
        const nb = bs.map(b => b.slice());
        jcPour(nb, i, j);
        const k = key(nb);
        if (seen.has(k)) continue;
        seen.add(k);
        path.push([i, j]);
        if (dfs(nb)) return true;
        path.pop();
      }
    }
    return false;
  }
  return dfs(start.map(b => b.slice())) ? path : null;
}

function jcMake(lv) {
  const n = jcColors(lv);
  for (let t = 0; t < 40; t++) {
    const pool = shuffle(Array.from({ length: n * JC_CAP }, (_, i) => String(Math.floor(i / JC_CAP))));
    const bs = Array.from({ length: n }, (_, i) => pool.slice(i * JC_CAP, i * JC_CAP + JC_CAP));
    if (bs.some(b => b.every(x => x === b[0]))) continue;
    bs.push([], []);
    if (jcSolve(bs)) return bs;
  }
  // まず ありえないけど、ねんのため かんたんな ならびに
  const bs = Array.from({ length: n }, (_, i) => [i, (i + 1) % n, i, (i + 1) % n].map(String));
  bs.push([], []);
  return bs;
}

/* ---- え ---- */
function jcBottleHTML(b, i) {
  const done = jcDone(b);
  const col = done ? JC_COLORS[+b[0]] : null;
  return `<button class="jc-btl ${done ? 'done' : ''}" data-i="${i}" aria-label="ボトル ${i + 1}">
    <span class="jc-cap" style="${col ? `--cc:${col.c};--cd:${col.d}` : ''}"></span>
    <span class="jc-neck"></span>
    <span class="jc-body">
      ${b.map((x, k) => `<i class="jc-l ${k === b.length - 1 ? 'top' : ''}" style="--c:${JC_COLORS[+x].c};--d:${JC_COLORS[+x].d};--k:${k}"></i>`).join('')}
      <span class="jc-shine"></span>
      ${col ? `<span class="jc-label"><span class="jc-lic">${iconSVG(col.icon)}</span>${col.name}</span>` : ''}
    </span>
  </button>`;
}

function startJuiceGame() {
  setArea('patisserie');
  const st = juiceState();
  const lv = st.lv;
  const G = { bs: jcMake(lv), hist: [], moves: 0, hint: false, sel: -1, busy: false, over: false };
  G.start = G.bs.map(b => b.slice());

  $('#app').innerHTML = `
    <div class="screen juice">
      <header class="bar">
        <button class="iconbtn" id="back" aria-label="パティスリーへ">↩️</button>
        <h2>ジュース いれかえ</h2>
        ${walletHTML()}
      </header>
      <div class="mg-hud">
        <div class="mg-box"><small>レベル</small><b>${lv}</b></div>
        <div class="mg-box"><small>うつした</small><b id="jcmoves">0</b></div>
        <button class="btn sub" id="jcundo">もどす</button>
        <button class="btn sub" id="jchint">ヒント</button>
        <button class="btn sub" id="jcreset">さいしょから</button>
      </div>
      <div class="jc-wrap">
        <div class="mg-side">
          <div class="mg-buddy bounce">${charSVG(S.partner, 'happy', [...S.wear.filter(w => w !== 'apron'), 'apron'])}</div>
          <div class="bubble mg-say" id="jcsay">おなじ いろの ジュースを 1ぽんに あつめよう!</div>
        </div>
        <section class="jc-table" id="jctable">
          <div class="jc-shelf" id="jcshelf"></div>
          <div class="jc-counter"></div>
        </section>
      </div>
    </div>`;
  const shelf = $('#jcshelf');
  const say = (txt) => { const s = $('#jcsay'); s.textContent = txt; s.classList.remove('pop'); void s.offsetWidth; s.classList.add('pop'); };

  function draw() {
    shelf.style.setProperty('--n', G.bs.length);
    shelf.classList.toggle('two', G.bs.length > 7);
    shelf.innerHTML = G.bs.map(jcBottleHTML).join('');
    $$('.jc-btl', shelf).forEach(el => { el.onclick = () => tap(+el.dataset.i); });
    if (G.sel >= 0) $$('.jc-btl', shelf)[G.sel].classList.add('up');
    $('#jcmoves').textContent = G.moves;
    $('#jcundo').disabled = !G.hist.length || G.over;
  }

  function tap(i) {
    if (G.busy || G.over) return;
    const els = $$('.jc-btl', shelf);
    $$('.hint', shelf).forEach(e => e.classList.remove('hint'));
    if (G.sel < 0) {
      if (!G.bs[i].length || jcDone(G.bs[i])) { shake(els[i]); return; }
      G.sel = i; sfx('tap'); els[i].classList.add('up');
      return;
    }
    const from = G.sel;
    G.sel = -1;
    els[from].classList.remove('up');
    if (from === i) return;
    if (!jcCanPour(G.bs, from, i)) {
      shake(els[i]); sfx('ng');
      say(G.bs[i].length >= JC_CAP ? 'その ボトルは もう いっぱい!' : 'うえの いろが おなじ ときだけ うつせるよ');
      return;
    }
    pourAnim(from, i);
  }
  function shake(el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }

  function pourAnim(from, to) {
    G.busy = true;
    const els = $$('.jc-btl', shelf);
    const a = els[from].getBoundingClientRect(), b = els[to].getBoundingClientRect();
    const left = b.left < a.left;
    const dx = b.left - a.left + (left ? b.width * .55 : -b.width * .55), dy = b.top - a.top - a.height * .38;
    const el = els[from];
    el.classList.add('pouring');
    el.style.transform = `translate(${dx}px, ${dy}px) rotate(${left ? -62 : 62}deg)`;
    const col = JC_COLORS[+jcTop(G.bs[from])];
    setTimeout(() => {
      const stream = document.createElement('i');
      stream.className = 'jc-stream';
      stream.style.background = col.c;
      stream.style.left = (b.left + b.width / 2 - shelf.getBoundingClientRect().left) + 'px';
      stream.style.top = (b.top - shelf.getBoundingClientRect().top - 6) + 'px';
      stream.style.height = (b.height * .5) + 'px';
      shelf.appendChild(stream);
      G.hist.push(G.bs.map(x => x.slice()));
      jcPour(G.bs, from, to);
      G.moves++;
      sfx('tap');
      setTimeout(() => {
        el.style.transform = '';
        setTimeout(() => {
          G.busy = false;
          draw();
          const tEl = $$('.jc-btl', shelf)[to];
          if (jcDone(G.bs[to])) {
            sfx('coin');
            tEl.classList.add('capon');
            sparkle(tEl, 8);
            say(`${JC_COLORS[+G.bs[to][0]].name}ジュース のうひん!`);
          }
          if (jcWon(G.bs)) setTimeout(finish, 600);
          else if (!jcSolve(G.bs, 20000)) say('うごかせなく なったかも。「もどす」を つかってみて!');
        }, 260);
      }, 380);
    }, 300);
  }

  function finish() {
    G.over = true;
    const star = !G.hint;
    const yen = jcPrize(lv) + (star ? 5 : 0);
    S.money += yen;
    st.clears++;
    st.lv = lv + 1;
    addXP(2 + Math.min(lv, 5));
    save();
    bumpWallet();
    celebrate(true);
    sfx('fanfare');
    const ov = document.createElement('div');
    ov.className = 'ct-start';
    ov.innerHTML = `<div class="ct-card done">
      <div class="reveal bounce">${charSVG(S.partner, 'happy', S.wear)}</div>
      <h3>ぜんぶ のうひん できた!</h3>
      <p>レベル ${lv} クリア ・ ${G.moves}かい うつしたよ</p>
      ${star ? '<p>ヒントなしで できたね <span class="ct-best">★ +5円</span></p>' : ''}
      <p class="pay">おこづかい <b>${yen}円</b></p>
      <div class="row"><button class="btn ok" id="jcnext">つぎの レベルへ</button><button class="btn sub" id="jcout">パティスリーへ</button></div></div>`;
    $('#jctable').appendChild(ov);
    sparkle($('.reveal', ov), 16);
    $('#jcnext').onclick = () => { sfx('tap'); startJuiceGame(); };
    $('#jcout').onclick = () => screenPatisserie();
  }

  $('#back').onclick = () => screenPatisserie();
  $('#jcundo').onclick = () => {
    if (G.busy || !G.hist.length) return;
    G.bs = G.hist.pop(); G.sel = -1; G.moves = Math.max(0, G.moves - 1);
    sfx('tap'); draw(); say('1かい もどしたよ');
  };
  $('#jcreset').onclick = () => {
    if (G.busy) return;
    G.bs = G.start.map(b => b.slice()); G.hist = []; G.moves = 0; G.sel = -1;
    sfx('tap'); draw(); say('さいしょの ならびに もどしたよ');
  };
  $('#jchint').onclick = () => {
    if (G.busy || G.over) return;
    const path = jcSolve(G.bs);
    if (!path) { say('このままだと むずかしいよ。「もどす」か「さいしょから」で やりなおそう'); sfx('ng'); return; }
    G.hint = true;
    G.sel = -1;
    draw();
    const [i, j] = path[0];
    const els = $$('.jc-btl', shelf);
    els[i].classList.add('hint', 'from');
    els[j].classList.add('hint');
    say('「ここから」の ボトルを、もう 1つの ひかってる ボトルへ うつしてみて');
  };
  window.__juice = { G, tap };
  draw();
}
