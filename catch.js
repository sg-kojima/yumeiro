'use strict';
// おかしキャッチ: おちてくる コインや おかしを かごで うけとめる。30びょうで おこづかいが もらえる。

const CATCH_ITEMS = [
  { kind: 'coin', val: 2, w: 30 },
  { kind: 'coin', val: 2, w: 30 },
  { kind: 'cookie', val: 1, w: 18 },
  { kind: 'strawberry', val: 1, w: 18 },
  { kind: 'cupcake', val: 1, w: 18 },
  { kind: 'cherry', val: 1, w: 18 },
  { kind: 'star', val: 5, w: 5 },
  { kind: 'mud', val: 0, w: 12 },
];
const CATCH_SECS = 30;
const CATCH_MAX_YEN = 50;

function mudSVG() {
  return `<svg viewBox="0 0 48 48"><circle cx="24" cy="26" r="17" fill="#9a6b45" stroke="#5b4040" stroke-width="2.5"/>
    <circle cx="17" cy="20" r="4" fill="#b98a62"/><circle cx="30" cy="33" r="2.5" fill="#7a5236"/><circle cx="33" cy="20" r="2" fill="#7a5236"/>
    <path d="M17 29 q3 -3 6 0 M25 29 q3 -3 6 0" stroke="#3d2b2b" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>`;
}

function pickCatchItem() {
  const total = CATCH_ITEMS.reduce((a, it) => a + it.w, 0);
  let r = Math.random() * total;
  for (const it of CATCH_ITEMS) { if ((r -= it.w) < 0) return it; }
  return CATCH_ITEMS[0];
}

function startCatchGame() {
  setArea('park');
  $('#app').innerHTML = `
    <div class="screen park catch">
      <header class="bar">
        <button class="iconbtn" id="back" aria-label="こうえんへ">↩️</button>
        <h2>おかし キャッチ</h2>
        ${walletHTML()}
      </header>
      <div class="ct-hud">
        <div class="ct-time"><span id="ctbar"></span></div>
        <div class="ct-score"><span class="ct-coin">${iconSVG('coin')}</span><b id="ctscore">0</b><small>円</small></div>
      </div>
      <section class="ct-field" id="ctfield">
        <div class="ct-cloud c1">${iconSVG('cloud')}</div><div class="ct-cloud c2">${iconSVG('cloud')}</div>
        <div class="ct-player" id="ctplayer"><div class="ct-char">${charSVG(S.partner, 'happy', S.wear)}</div><div class="ct-basket">${iconSVG('basket')}</div></div>
        <div class="ct-start" id="ctstart">
          <div class="ct-card">
            <h3>おかし キャッチ</h3>
            <p>ゆびで ${nameOf(S.partner)}を うごかして、おちてくる ものを かごで うけとめよう!</p>
            <div class="ct-legend">
              <span>${iconSVG('coin')}<b>+2円</b></span><span>${iconSVG('cookie')}<b>+1円</b></span><span>${iconSVG('star')}<b>+5円</b></span><span>${mudSVG()}<b>くらくら</b></span>
            </div>
            <button class="btn ok big" id="ctgo">スタート!</button>
            ${S.catchBest ? `<p class="muted">いままでの さいこう: ${S.catchBest}円</p>` : ''}
          </div>
        </div>
      </section>
    </div>`;
  $('#back').onclick = () => { g.over = true; screenPark(); };

  const field = $('#ctfield'), player = $('#ctplayer');
  const g = { score: 0, caught: 0, over: false, started: false, t: 0, x: .5, target: .5, items: [], spawnIn: 0, stunUntil: 0 };
  window.__catch = g;

  const setTarget = (clientX) => {
    const r = field.getBoundingClientRect();
    g.target = Math.min(.94, Math.max(.06, (clientX - r.left) / r.width));
  };
  field.addEventListener('pointerdown', (e) => { if (g.started) setTarget(e.clientX); });
  field.addEventListener('pointermove', (e) => { if (g.started && (e.buttons || e.pointerType !== 'mouse')) setTarget(e.clientX); });
  const onKey = (e) => {
    if (!document.body.contains(field)) return document.removeEventListener('keydown', onKey);
    if (e.key === 'ArrowLeft') g.target = Math.max(.06, g.target - .12);
    if (e.key === 'ArrowRight') g.target = Math.min(.94, g.target + .12);
  };
  document.addEventListener('keydown', onKey);

  const popText = (x, y, text, cls) => {
    const p = document.createElement('div');
    p.className = 'ct-pop ' + (cls || '');
    p.textContent = text;
    p.style.left = x + 'px'; p.style.top = y + 'px';
    field.appendChild(p);
    setTimeout(() => p.remove(), 800);
  };

  function spawn(W) {
    const it = pickCatchItem();
    const el = document.createElement('div');
    el.className = 'ct-item ' + it.kind;
    el.innerHTML = it.kind === 'mud' ? mudSVG() : iconSVG(it.kind);
    const size = Math.max(40, Math.min(62, W * .085));
    el.style.width = el.style.height = size + 'px';
    field.appendChild(el);
    const H = field.clientHeight;
    // だんだん はやく なる
    const speed = H / (2.6 - Math.min(1, g.t / CATCH_SECS) * 1.0);
    g.items.push({ ...it, el, size, x: size / 2 + Math.random() * (W - size), y: -size, vy: speed * (.85 + Math.random() * .3), spin: (Math.random() - .5) * 200, rot: 0 });
  }

  let last = 0;
  function frame(now) {
    if (g.over || !document.body.contains(field)) return;
    const dt = Math.min(.05, (now - (last || now)) / 1000);
    last = now;
    g.t += dt;
    const W = field.clientWidth, H = field.clientHeight;

    // じかん
    $('#ctbar').style.width = Math.max(0, 100 - g.t / CATCH_SECS * 100) + '%';
    if (g.t >= CATCH_SECS) return finish();

    // うごく
    const stunned = now < g.stunUntil;
    if (!stunned) g.x += (g.target - g.x) * Math.min(1, dt * 12);
    player.style.left = (g.x * 100) + '%';
    player.classList.toggle('dizzy', stunned);
    player.classList.toggle('left', g.target < g.x - .01);

    // でてくる
    g.spawnIn -= dt;
    if (g.spawnIn <= 0) { spawn(W); g.spawnIn = .75 - Math.min(1, g.t / CATCH_SECS) * .35; }

    // おちる・うけとめる
    const pr = player.getBoundingClientRect(), fr = field.getBoundingClientRect();
    const bx = pr.left - fr.left + pr.width / 2, catchY = pr.top - fr.top + pr.height * .55, halfW = pr.width * .5;
    for (const it of g.items) {
      if (it.done) continue;
      it.y += it.vy * dt;
      it.rot += it.spin * dt;
      it.el.style.transform = `translate(${it.x - it.size / 2}px, ${it.y - it.size / 2}px) rotate(${it.rot}deg)`;
      if (it.y >= catchY - it.size * .3 && it.y <= catchY + it.size * .4 && Math.abs(it.x - bx) < halfW) {
        it.done = true;
        it.el.remove();
        if (it.kind === 'mud') {
          sfx('ng');
          g.stunUntil = now + 900;
          popText(bx, catchY - 50, 'くらくら〜', 'bad');
        } else {
          g.score += it.val;
          g.caught++;
          sfx(it.kind === 'star' ? 'fanfare' : it.kind === 'coin' ? 'coin' : 'tap');
          popText(it.x, catchY - 40, `+${it.val}`, it.kind === 'star' ? 'star' : '');
          if (it.kind === 'star') sparkle(player, 8);
          $('#ctscore').textContent = Math.min(g.score, CATCH_MAX_YEN);
          const sc = $('.ct-score'); sc.classList.remove('pop'); void sc.offsetWidth; sc.classList.add('pop');
          player.classList.remove('gulp'); void player.offsetWidth; player.classList.add('gulp');
        }
      } else if (it.y > H + it.size) {
        it.done = true;
        it.el.remove();
      }
    }
    g.items = g.items.filter(it => !it.done);
    requestAnimationFrame(frame);
  }

  function finish() {
    g.over = true;
    g.items.forEach(it => it.el.remove());
    const yen = Math.min(g.score, CATCH_MAX_YEN);
    const best = yen > (S.catchBest || 0);
    if (best) S.catchBest = yen;
    S.money += yen;
    save();
    addXP(2 + Math.floor(yen / 10));
    sfx('fanfare');
    const ov = document.createElement('div');
    ov.className = 'ct-start';
    ov.innerHTML = `<div class="ct-card done">
      <div class="reveal bounce">${charSVG(S.partner, 'happy', S.wear)}</div>
      <h3>おしまい!</h3>
      <p>${g.caught}こ キャッチ!</p>
      <p class="pay">おこづかい <b>${yen}円</b></p>
      ${g.score > CATCH_MAX_YEN ? `<p class="muted">1かいで もらえるのは ${CATCH_MAX_YEN}円 までだよ</p>` : ''}
      ${best ? '<p class="ct-best">さいこう きろく!</p>' : ''}
      <div class="row"><button class="btn ok" id="ctagain">もう いっかい</button><button class="btn sub" id="cttopark">こうえんへ</button></div></div>`;
    field.appendChild(ov);
    sparkle($('.reveal', ov), 20);
    bumpWallet();
    $('#ctagain').onclick = () => startCatchGame();
    $('#cttopark').onclick = () => screenPark('たくさん とれたね!');
  }

  $('#ctgo').onclick = () => {
    sfx('ok');
    $('#ctstart').remove();
    let n = 3;
    const cd = document.createElement('div');
    cd.className = 'ct-count';
    field.appendChild(cd);
    const tick = () => {
      if (!document.body.contains(field)) return;
      if (n === 0) { cd.remove(); g.started = true; requestAnimationFrame(frame); return; }
      cd.textContent = n; cd.classList.remove('go'); void cd.offsetWidth; cd.classList.add('go');
      sfx('tap'); n--; setTimeout(tick, 650);
    };
    tick();
  };
}
