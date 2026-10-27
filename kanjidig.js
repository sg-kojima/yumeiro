'use strict';
// かんじ はっくつ: つちを ほって、うまっている かんじの せきばんを みつける。
// すこし ほって「わかった!」で あてる。すくない かずで あてるほど ほしが ふえる。

const DIG_N = 6;          // 6×6 ブロック
const DIG_ROUNDS = 5;
const digStars = (n) => (n <= 10 ? 3 : n <= 18 ? 2 : 1);

function startKanjiDig() {
  setArea('kanji');
  const st = kanjiState();
  if (!st.dug) st.dug = {};
  const g = { round: 0, stars: 0, bonus: 0, coins: 0, used: new Set(), found: [] };

  $('#app').innerHTML = `
    <div class="screen kanji kdig">
      <header class="bar">
        <button class="iconbtn" id="back" aria-label="としょかんへ">↩️</button>
        <h2>かんじ はっくつ</h2>
        ${walletHTML()}
      </header>
      <div class="kj-progress" id="kjprog"></div>
      <div class="kd-wrap">
        <section class="kd-site" id="kdsite"></section>
        <section class="kd-side" id="kdside"></section>
      </div>
    </div>`;
  $('#back').onclick = () => screenKanji();
  const site = $('#kdsite'), side = $('#kdside');

  function nextRound() {
    if (g.round >= DIG_ROUNDS) return finish();
    $('#kjprog').innerHTML = Array.from({ length: DIG_ROUNDS }, (_, k) => `<span class="${k < g.round ? 'done' : k === g.round ? 'now' : ''}"></span>`).join('');
    let d; do { d = pickKanji(); } while (g.used.has(d.k) && g.used.size < 150);
    g.used.add(d.k);
    const r = { d, dug: 0, miss: 0, done: false, wrong: new Set() };
    const near = shuffle(KANJI_DATA.filter(x => x.k !== d.k && Math.abs(x.strokes - d.strokes) <= 2)).slice(0, 3).map(x => x.k);
    r.opts = shuffle(uniq([d.k, ...near, ...shuffle(KANJI_ALL)]).slice(0, 4));
    // ブロック: いわ（2かい たたく）と コインを すこし まぜる
    const cells = Array.from({ length: DIG_N * DIG_N }, (_, i) => ({ i, hp: Math.random() < .16 ? 2 : 1, coin: false }));
    shuffle(cells).slice(0, 2).forEach(c => { c.coin = true; });
    r.cells = cells;
    site.classList.remove('mini');

    site.innerHTML = `
      <div class="kd-tablet"><span class="kd-kanji">${d.k}</span></div>
      <div class="kd-dirt">${cells.map(c => `<button class="kd-b ${c.hp > 1 ? 'rock' : ''} d${Math.floor(c.i / DIG_N)}" data-i="${c.i}" style="--v:${(c.i * 37) % 5}" aria-label="ほる"></button>`).join('')}</div>`;
    drawSide(r);

    $$('.kd-b', site).forEach(b => b.onpointerdown = (e) => {
      e.preventDefault();
      if (r.done || r.guessing) return;
      const c = r.cells[+b.dataset.i];
      if (c.hp <= 0) return;
      c.hp--;
      if (c.hp > 0) { b.classList.add('crack'); sfx('tap'); return; }
      r.dug++;
      b.classList.add('gone');
      crumbs(b);
      sfx('tap');
      if (c.coin) { g.coins++; S.money++; bumpWallet(); sfx('coin'); popAt(b, '+1円'); }
      drawSide(r);
    });
  }

  function crumbs(b) {
    const rr = b.getBoundingClientRect(), sr = site.getBoundingClientRect();
    for (let k = 0; k < 5; k++) {
      const p = document.createElement('i');
      p.className = 'kd-crumb';
      p.style.left = (rr.left - sr.left + rr.width / 2) + 'px';
      p.style.top = (rr.top - sr.top + rr.height / 2) + 'px';
      p.style.setProperty('--dx', rnd(-40, 40) + 'px');
      p.style.setProperty('--dy', rnd(-50, 10) + 'px');
      site.appendChild(p);
      setTimeout(() => p.remove(), 600);
    }
  }
  function popAt(b, text) {
    const rr = b.getBoundingClientRect(), sr = site.getBoundingClientRect();
    const p = document.createElement('div');
    p.className = 'ct-pop star';
    p.textContent = text;
    p.style.left = (rr.left - sr.left + rr.width / 2) + 'px';
    p.style.top = (rr.top - sr.top) + 'px';
    site.appendChild(p);
    setTimeout(() => p.remove(), 800);
  }

  function starsNow(r) { return Math.max(1, digStars(r.dug) - r.miss); }

  function drawSide(r) {
    const s = starsNow(r);
    side.innerHTML = `
      <div class="kd-buddy">${charSVG(S.partner, r.done ? 'happy' : 'normal', S.wear)}</div>
      <div class="bubble kd-say">${r.say || (r.dug === 0 ? 'つちを タップして ほってみよう!' : r.dug < 6 ? 'なにが でてくるかな…' : 'わかったら「わかった!」を おしてね')}</div>
      <div class="kd-meter"><span>ほった かず <b>${r.dug}</b></span><span class="kd-stars">${'★'.repeat(s)}<i>${'☆'.repeat(3 - s)}</i></span></div>
      ${r.guessing ? `<div class="kd-opts">${r.opts.map(k => `<button class="choice kd-opt" data-k="${k}" ${r.wrong.has(k) ? 'disabled' : ''}>${k}</button>`).join('')}</div>
        <button class="btn sub" id="kdmore">もっと ほる</button>`
        : `<button class="btn ok big" id="kdguess" ${r.dug === 0 ? 'disabled' : ''}>わかった!</button>`}`;
    if ($('#kdguess')) $('#kdguess').onclick = () => { sfx('tap'); r.guessing = true; r.say = 'どの かんじかな?'; drawSide(r); };
    if ($('#kdmore')) $('#kdmore').onclick = () => { sfx('tap'); r.guessing = false; r.say = ''; drawSide(r); };
    $$('.kd-opt', side).forEach(b => b.onclick = () => guess(r, b.dataset.k, b));
  }

  function guess(r, k, btn) {
    if (k !== r.d.k) {
      sfx('ng');
      r.miss++;
      r.wrong.add(k);
      btn.classList.add('ng');
      r.guessing = false;
      r.say = 'ちがう みたい… もうすこし ほってみよう';
      setTimeout(() => drawSide(r), 450);
      return;
    }
    r.done = true;
    const s = starsNow(r);
    g.stars += s;
    const ks = kanjiState();
    if (!r.miss) { ks.ok[r.d.k] = (ks.ok[r.d.k] || 0) + 1; if (ks.ng[r.d.k]) ks.ng[r.d.k]--; } else ks.ng[r.d.k] = (ks.ng[r.d.k] || 0) + 1;
    ks.dug[r.d.k] = Math.max(ks.dug[r.d.k] || 0, s);
    g.found.push({ k: r.d.k, s });
    save();
    celebrate(!r.miss);
    // のこりの つちが くずれて せきばんが ひかる
    $$('.kd-b:not(.gone)', site).forEach((b, i) => setTimeout(() => b.classList.add('gone'), i * 12));
    setTimeout(() => site.classList.add('found'), 300);
    setTimeout(() => reveal(r, s), 1300);
  }

  function reveal(r, s) {
    site.classList.remove('found');
    site.classList.add('mini');
    const w = pick(r.d.words);
    const pool = KANJI_DATA.flatMap(x => x.words).filter(x => x.yomi !== w.yomi && Math.abs(x.yomi.length - w.yomi.length) <= 1);
    const opts = shuffle(uniq([w.yomi, ...shuffle(pool).map(x => x.yomi)]).slice(0, 4));
    side.innerHTML = `
      <div class="kd-card">
        <div class="kd-got"><span>${r.d.k}</span><small>${'★'.repeat(s)}</small></div>
        <p>はっけん! ${r.d.strokes}かくの かんじ</p>
        <p class="kd-q">ボーナス もんだい<br><span class="kj-word">${markK(w.word, r.d.k)}</span><br>よみかたは?</p>
        <div class="kd-opts yomi">${opts.map(o => `<button class="choice kd-yomi" data-y="${o}">${o}</button>`).join('')}</div>
      </div>`;
    speak('ボーナス もんだい。よみかたを えらんでね');
    $$('.kd-yomi', side).forEach(b => b.onclick = () => {
      const ok = b.dataset.y === w.yomi;
      sfx(ok ? 'ok' : 'ng');
      if (ok) { g.bonus += 2; celebrate(true); }
      $$('.kd-yomi', side).forEach(x => { x.disabled = true; if (x.dataset.y === w.yomi) x.classList.add('ok'); });
      if (!ok) b.classList.add('ng');
      const words = r.d.words.map(x => `${x.word}（${x.yomi}）`).join('　');
      speak(r.d.words.map(x => x.yomi).join('、'));
      $('.kd-card', side).insertAdjacentHTML('beforeend', `<p class="kd-words">${ok ? 'せいかい! +2円<br>' : ''}${words}</p>
        <button class="btn ok" id="kdnext">${g.round + 1 >= DIG_ROUNDS ? 'けっか を みる' : 'つぎを ほる'}</button>`);
      $('#kdnext').onclick = () => { sfx('tap'); g.round++; nextRound(); };
    });
  }

  function finish() {
    const yen = g.stars + g.bonus;
    S.money += yen;
    save();
    addXP(2 + Math.floor(g.stars / 4));
    sfx('fanfare');
    $('#kjprog').innerHTML = '';
    const total = Object.keys(kanjiState().dug).length;
    $('.kd-wrap').innerHTML = `<section class="panel kj-panel"><div class="qcard done">
      <div class="reveal bounce">${charSVG(S.partner, 'happy', S.wear)}</div>
      <h3>はっくつ だいせいこう!</h3>
      <div class="kd-found">${g.found.map(f => `<span><b>${f.k}</b><small>${'★'.repeat(f.s)}</small></span>`).join('')}</div>
      <p class="pay">ほし ${g.stars}こ ＋ ボーナス ${g.bonus}円${g.coins ? ` ＋ コイン ${g.coins}円` : ''}</p>
      <p>おこづかい <b>${yen + g.coins}円</b></p>
      <p class="muted">いままでに ほりだした かんじ: ${total} / ${KANJI_ALL.length}じ</p>
      <div class="row"><button class="btn ok" id="again">もう いっかい</button><button class="btn sub" id="toLib">としょかんへ</button></div></div></section>`;
    sparkle($('.reveal'), 20);
    bumpWallet();
    $('#again').onclick = () => startKanjiDig();
    $('#toLib').onclick = () => screenKanji('いっぱい ほりだしたね!');
  }

  nextRound();
}
