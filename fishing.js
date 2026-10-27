'use strict';
// いけの さかなつり（プログラミング）: やじるしの ブロックを ならべて ボートを うごかし、さかなの ところで「つる」。

const FISH_LEVELS = [
  { map: ['.....', '.....', 'S..F.', '.....', '.....'], tip: 'みぎに 3かい すすんで「つる」だよ' },
  { map: ['..F..', '.....', '.....', '..S..', '.....'], tip: 'うえに すすもう' },
  { map: ['.....', '...F.', '.....', '.S...', '.....'], tip: 'みぎと うえを くみあわせよう' },
  { map: ['.....', '.....', 'S.#F.', '.....', '.....'], tip: 'いわを よけて すすもう' },
  { map: ['F....', '.....', '.....', '.....', '....S'], tip: 'ブロックを タップすると「くりかえし」の かずが かわるよ', repeat: true },
  { map: ['.F...', '.....', '.S...', '.....', '.F...'], tip: 'さかなは 2ひき。ぜんぶ つろう', repeat: true },
  { map: ['....F', '.###.', '.....', '.#...', 'S#..F'], tip: 'いわの すきまを とおろう', repeat: true },
  { map: ['F...F', '.....', '..S..', '.....', 'F....'], tip: '3びき つれるかな?', repeat: true },
];
const FISH_COLORS = ['#ff9d3b', '#7cc6ff', '#ff8fb8', '#ffd45c', '#a98cf0'];
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const CMD_LABEL = { up: 'うえ', down: 'した', left: 'ひだり', right: 'みぎ', fish: 'つる' };

function fishState() {
  if (!S.fish) S.fish = { level: 0, caught: 0, stars: {} };
  return S.fish;
}

// ステージ 9 から さきは じどうで つくる
function randomFishLevel(n) {
  for (;;) {
    const g = Array.from({ length: 5 }, () => Array(5).fill('.'));
    const cells = shuffle(Array.from({ length: 25 }, (_, i) => [i % 5, Math.floor(i / 5)]));
    const [sx, sy] = cells[0];
    g[sy][sx] = 'S';
    const nf = n % 3 === 0 ? 3 : 2;
    cells.slice(1, 1 + nf).forEach(([x, y]) => { g[y][x] = 'F'; });
    cells.slice(1 + nf, 1 + nf + rnd(3, 5)).forEach(([x, y]) => { g[y][x] = '#'; });
    // ぜんぶの さかなに いけるか しらべる
    const seen = new Set([sx + ',' + sy]), q = [[sx, sy]];
    while (q.length) {
      const [x, y] = q.shift();
      for (const [dx, dy] of Object.values(DIRS)) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx > 4 || ny > 4 || g[ny][nx] === '#' || seen.has(nx + ',' + ny)) continue;
        seen.add(nx + ',' + ny); q.push([nx, ny]);
      }
    }
    const ok = g.every((row, y) => row.every((c, x) => c !== 'F' || seen.has(x + ',' + y)));
    if (ok) return { map: g.map(r => r.join('')), tip: 'じぶんで かんがえて みよう!', repeat: true };
  }
}

function arrowSVG(dir) {
  const rot = { up: 0, right: 90, down: 180, left: 270 }[dir];
  return `<svg viewBox="0 0 40 40"><path transform="rotate(${rot} 20 20)" d="M20 6 L33 21 H25 V34 H15 V21 H7 Z" fill="#fff" stroke="#5b4040" stroke-width="2.4" stroke-linejoin="round"/></svg>`;
}
function rodSVG() {
  return `<svg viewBox="0 0 40 40"><path d="M8 34 L30 8" stroke="#c98a4a" stroke-width="4" stroke-linecap="round"/><path d="M30 8 Q36 20 32 30" fill="none" stroke="#5b4040" stroke-width="1.5"/>
    <path d="M32 30 q3 4 -1 6 q-3 0 -2 -3" fill="none" stroke="#5b4040" stroke-width="2"/><circle cx="32" cy="27" r="3" fill="#ff6b6b" stroke="#5b4040" stroke-width="1.5"/></svg>`;
}
function fishSVG(col) {
  return `<svg viewBox="0 0 48 32"><path d="M6 16 C14 2 32 2 38 16 C32 30 14 30 6 16 Z" fill="${col}" stroke="#5b4040" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M37 16 L46 7 L46 25 Z" fill="${col}" stroke="#5b4040" stroke-width="2.2" stroke-linejoin="round"/><circle cx="15" cy="13" r="2.4" fill="#5b4040"/>
    <path d="M22 9 q4 7 0 14" fill="none" stroke="#5b4040" stroke-width="1.5" opacity=".5"/><ellipse cx="13" cy="20" rx="3" ry="1.6" fill="#fff" opacity=".6"/></svg>`;
}
function rockSVG() {
  return `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="32" rx="20" ry="12" fill="#9fdcff" opacity=".7"/><path d="M8 32 C8 18 18 12 26 13 C36 14 42 22 40 32 Z" fill="#b9b1a8" stroke="#5b4040" stroke-width="2.2" stroke-linejoin="round"/>
    <ellipse cx="20" cy="20" rx="5" ry="3" fill="#fff" opacity=".5"/><circle cx="34" cy="14" r="5" fill="#8fd47c" stroke="#5b4040" stroke-width="1.8"/></svg>`;
}
function boatSVG() {
  return `<svg viewBox="0 0 80 40"><path d="M4 12 H76 L66 34 H14 Z" fill="#ff9fc1" stroke="#5b4040" stroke-width="2.6" stroke-linejoin="round"/><path d="M8 18 H72" stroke="#fff" stroke-width="3"/></svg>`;
}

function screenFishing() {
  setArea('pond');
  const fs = fishState();
  const n = fs.level;
  const lv = n < FISH_LEVELS.length ? FISH_LEVELS[n] : randomFishLevel(n);
  const W = 5, H = 5;
  let start = null;
  const fish = [], rocks = new Set();
  lv.map.forEach((row, y) => [...row].forEach((c, x) => {
    if (c === 'S') start = [x, y];
    if (c === 'F') fish.push({ x, y, col: FISH_COLORS[fish.length % FISH_COLORS.length], got: false });
    if (c === '#') rocks.add(x + ',' + y);
  }));
  const prog = [];
  const MAX = 12;
  let runs = 0, running = false;

  $('#app').innerHTML = `
    <div class="screen fishscreen">
      <header class="bar">
        <button class="iconbtn" id="back" aria-label="まちへ">🗺️</button>
        <h2>いけで さかなつり</h2>
        ${walletHTML()}
      </header>
      <div class="layout">
        <section class="fp-wrap">
          <div class="fp-stage">ステージ ${n + 1}</div>
          <div class="fp-grid" id="grid" style="--w:${W};--h:${H}">
            ${Array.from({ length: W * H }, (_, i) => { const x = i % W, y = Math.floor(i / W); return `<div class="fp-cell">${rocks.has(x + ',' + y) ? rockSVG() : ''}</div>`; }).join('')}
            ${fish.map((f, i) => `<div class="fp-fish" data-i="${i}" style="left:${f.x / W * 100}%;top:${f.y / H * 100}%;width:${100 / W}%;height:${100 / H}%">${fishSVG(f.col)}</div>`).join('')}
            <div class="fp-boat" id="boat" style="width:${100 / W}%;height:${100 / H}%"><div class="fp-boat-in"><div class="fp-char">${charSVG(S.partner, 'happy', S.wear)}</div>${boatSVG()}</div></div>
          </div>
        </section>
        <section class="panel">
          <div class="qcard fp-panel">
            <div class="qhead"><span class="qtitle">プログラム</span><span class="fp-count" id="count">0 / ${MAX}</span></div>
            <p class="fp-tip">${lv.tip}</p>
            <div class="fp-prog" id="prog"></div>
            <div class="fp-cmds">
              ${['up', 'left', 'right', 'down'].map(d => `<button class="fp-cmd dir ${d}" data-c="${d}">${arrowSVG(d)}<small>${CMD_LABEL[d]}</small></button>`).join('')}
              <button class="fp-cmd fish" data-c="fish">${rodSVG()}<small>つる</small></button>
              <button class="fp-cmd del" id="del"><b>⌫</b><small>けす</small></button>
            </div>
            <div class="qhint" id="fphint"></div>
            <div class="row"><button class="btn sub" id="clear">ぜんぶ けす</button><button class="btn ok" id="run">▶ スタート</button></div>
          </div>
        </section>
      </div>
    </div>`;
  $('#back').onclick = () => { running = false; screenField(); };

  const boat = $('#boat');
  let bx = start[0], by = start[1];
  const putBoat = (x, y, anim = true) => {
    boat.style.transition = anim ? '' : 'none';
    boat.style.left = (x / W * 100) + '%';
    boat.style.top = (y / H * 100) + '%';
  };
  putBoat(bx, by, false);

  const drawProg = () => {
    $('#prog').innerHTML = prog.length ? prog.map((p, i) => `<button class="fp-block ${p.c}" data-i="${i}">${p.c === 'fish' ? rodSVG() : arrowSVG(p.c)}${p.n > 1 ? `<b class="fp-times">×${p.n}</b>` : ''}</button>`).join('')
      : '<span class="muted">したの ブロックを タップして ならべよう</span>';
    $('#count').textContent = `${prog.length} / ${MAX}`;
    $$('.fp-block').forEach(b => b.onclick = () => {
      if (running) return;
      const p = prog[+b.dataset.i];
      if (lv.repeat && p.c !== 'fish') { p.n = p.n % 4 + 1; sfx('tap'); drawProg(); }
      else { toast(lv.repeat ? '「つる」は くりかえし できないよ' : 'ステージ5から「くりかえし」が つかえるよ'); }
    });
  };
  drawProg();

  $$('.fp-cmd[data-c]').forEach(b => b.onclick = () => {
    if (running) return;
    if (prog.length >= MAX) { toast(lv.repeat ? `ブロックは ${MAX}こ まで。タップで くりかえしに しよう` : `ブロックは ${MAX}こ まで`); return; }
    const c = b.dataset.c;
    // おなじ むきが つづいたら くりかえしに まとめる（ステージ5から）
    const last = prog[prog.length - 1];
    if (lv.repeat && last && last.c === c && c !== 'fish' && last.n < 4) last.n++;
    else prog.push({ c, n: 1 });
    sfx('tap');
    drawProg();
  });
  $('#del').onclick = () => { if (running) return; prog.pop(); sfx('tap'); drawProg(); };
  $('#clear').onclick = () => { if (running) return; prog.length = 0; drawProg(); };

  const hint = $('#fphint');
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const reset = () => {
    bx = start[0]; by = start[1]; putBoat(bx, by, false);
    fish.forEach((f, i) => { f.got = false; $(`.fp-fish[data-i="${i}"]`).className = 'fp-fish'; });
    $$('.fp-block').forEach(b => b.classList.remove('now', 'bad'));
  };

  $('#run').onclick = async () => {
    if (running || !prog.length) { if (!prog.length) toast('ブロックを ならべてね'); return; }
    running = true; runs++;
    reset();
    hint.innerHTML = '';
    $('#run').disabled = true;
    let crashed = false;
    for (let i = 0; i < prog.length && running && !crashed; i++) {
      const p = prog[i];
      $$('.fp-block').forEach((b, k) => b.classList.toggle('now', k === i));
      for (let r = 0; r < p.n && !crashed; r++) {
        if (p.c === 'fish') {
          boat.classList.remove('cast'); void boat.offsetWidth; boat.classList.add('cast');
          await sleep(500);
          const f = fish.find(f => !f.got && f.x === bx && f.y === by);
          if (f) {
            f.got = true;
            const el = $(`.fp-fish[data-i="${fish.indexOf(f)}"]`);
            el.classList.add('caught');
            sfx('coin'); sparkle(el, 8);
          } else { sfx('ng'); hint.innerHTML = '💧 ここには さかなが いないみたい…'; }
          await sleep(500);
          continue;
        }
        const [dx, dy] = DIRS[p.c];
        const nx = bx + dx, ny = by + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H || rocks.has(nx + ',' + ny)) {
          // ごつん
          boat.style.transform = `translate(${dx * 18}%, ${dy * 18}%)`;
          sfx('ng');
          await sleep(180);
          boat.style.transform = '';
          boat.classList.add('bump');
          $$('.fp-block')[i].classList.add('bad');
          hint.innerHTML = `💥 ごつん! ${nx < 0 || ny < 0 || nx >= W || ny >= H ? 'いけの そとには いけないよ' : 'いわに ぶつかったよ'}。ひかった ブロックを なおそう`;
          crashed = true;
          await sleep(500);
          boat.classList.remove('bump');
          break;
        }
        bx = nx; by = ny;
        boat.classList.toggle('flip', dx < 0 ? true : dx > 0 ? false : boat.classList.contains('flip'));
        putBoat(bx, by);
        sfx('tap');
        await sleep(420);
      }
    }
    $$('.fp-block').forEach(b => b.classList.remove('now'));
    if (!document.body.contains(boat)) return;
    running = false;
    $('#run').disabled = false;
    if (crashed) return;
    if (fish.every(f => f.got)) return clear();
    const left = fish.filter(f => !f.got).length;
    if (!hint.innerHTML) hint.innerHTML = `🐟 さかなが あと ${left}ひき いるよ。プログラムを たして みよう`;
    else hint.innerHTML += `<br>🐟 あと ${left}ひき`;
  };

  function clear() {
    const stars = runs === 1 ? 3 : runs <= 3 ? 2 : 1;
    fs.stars[n] = Math.max(fs.stars[n] || 0, stars);
    fs.caught += fish.length;
    fs.level = n + 1;
    const yen = 10 + stars * 5;
    S.money += yen;
    save();
    addXP(2 + stars);
    celebrate(runs === 1);
    bumpWallet();
    setTimeout(() => {
      if (!document.body.contains(boat)) return;
      $('.fp-panel').innerHTML = `<div class="bigstars">${[1, 2, 3].map(i => `<i class="${i <= stars ? 'on' : ''}">★</i>`).join('')}</div>
        <h3 class="center">ステージ ${n + 1} クリア!</h3>
        <p class="center">${fish.length}ひき つれたよ（これまでに ${fs.caught}ひき）</p>
        <p class="pay center">おこづかい <b>${yen}円</b></p>
        <p class="muted center">${runs === 1 ? 'いっかいで せいこう! プログラマーだね!' : `${runs}かいめで せいこう。なおして できたね!`}</p>
        <div class="row"><button class="btn ok" id="next">つぎの ステージ</button><button class="btn sub" id="redo">もう いっかい</button></div>`;
      $('.fp-panel').classList.add('done');
      $('#next').onclick = () => screenFishing();
      $('#redo').onclick = () => { fs.level = n; save(); screenFishing(); };
    }, 1200);
  }
}
