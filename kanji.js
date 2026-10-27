'use strict';
// かんじの としょかん: かんけん8きゅう（3ねんせいの かんじ 200じ）の れんしゅう。
// データ: かんじ|かくすう|ことば:よみ,ことば:よみ

const KANJI_DATA = `
悪|11|悪い:わるい,悪人:あくにん
安|6|安い:やすい,安心:あんしん
暗|13|暗い:くらい,暗記:あんき
医|7|医者:いしゃ,医学:いがく
委|8|委員:いいん,委員会:いいんかい
意|13|意味:いみ,用意:ようい
育|8|育てる:そだてる,体育:たいいく
員|10|店員:てんいん,全員:ぜんいん
院|10|病院:びょういん,入院:にゅういん
飲|12|飲む:のむ,飲食:いんしょく
運|12|運ぶ:はこぶ,運動:うんどう
泳|8|泳ぐ:およぐ,水泳:すいえい
駅|14|駅前:えきまえ,駅長:えきちょう
央|5|中央:ちゅうおう
横|15|横:よこ,横断:おうだん
屋|9|屋上:おくじょう,本屋:ほんや
温|12|温かい:あたたかい,気温:きおん
化|4|化ける:ばける,文化:ぶんか
荷|10|荷物:にもつ,出荷:しゅっか
界|9|世界:せかい
開|12|開く:ひらく,開会:かいかい
階|12|二階:にかい,一階:いっかい
寒|12|寒い:さむい,寒中:かんちゅう
感|13|感じる:かんじる,感心:かんしん
漢|13|漢字:かんじ
館|16|図書館:としょかん,旅館:りょかん
岸|8|岸:きし,海岸:かいがん
起|10|起きる:おきる,起立:きりつ
期|12|学期:がっき,時期:じき
客|9|お客さん:おきゃくさん,客船:きゃくせん
究|7|研究:けんきゅう
急|9|急ぐ:いそぐ,急行:きゅうこう
級|9|学級:がっきゅう,上級:じょうきゅう
宮|10|お宮:おみや,王宮:おうきゅう
球|11|野球:やきゅう,球:たま
去|5|去る:さる,去年:きょねん
橋|16|橋:はし,鉄橋:てっきょう
業|13|工業:こうぎょう,作業:さぎょう
曲|6|曲がる:まがる,作曲:さっきょく
局|7|薬局:やっきょく,放送局:ほうそうきょく
銀|14|銀行:ぎんこう,銀色:ぎんいろ
区|4|区切る:くぎる,区間:くかん
苦|8|苦い:にがい,苦しい:くるしい
具|8|道具:どうぐ,家具:かぐ
君|7|君:きみ,田中君:たなかくん
係|9|係:かかり,係員:かかりいん
軽|12|軽い:かるい,軽食:けいしょく
血|6|血:ち,出血:しゅっけつ
決|7|決める:きめる,決心:けっしん
研|9|研究:けんきゅう,研ぐ:とぐ
県|9|県:けん,県立:けんりつ
庫|10|車庫:しゃこ,金庫:きんこ
湖|12|湖:みずうみ,湖面:こめん
向|6|向く:むく,方向:ほうこう
幸|8|幸せ:しあわせ,幸運:こううん
港|12|港:みなと,空港:くうこう
号|5|番号:ばんごう,信号:しんごう
根|10|根:ね,屋根:やね
祭|11|お祭り:おまつり,祭日:さいじつ
皿|5|皿:さら,大皿:おおざら
仕|5|仕事:しごと,仕方:しかた
死|6|死ぬ:しぬ,生死:せいし
使|8|使う:つかう,天使:てんし
始|8|始める:はじめる,開始:かいし
指|9|指:ゆび,指先:ゆびさき
歯|12|歯:は,虫歯:むしば
詩|13|詩:し,詩人:しじん
次|6|次:つぎ,目次:もくじ
事|8|火事:かじ,用事:ようじ
持|9|持つ:もつ,気持ち:きもち
式|6|入学式:にゅうがくしき,式:しき
実|8|実:み,実力:じつりょく
写|5|写す:うつす,写真:しゃしん
者|8|学者:がくしゃ,作者:さくしゃ
主|5|主人:しゅじん,主:ぬし
守|6|守る:まもる,お守り:おまもり
取|8|取る:とる,取り出す:とりだす
酒|10|お酒:おさけ,日本酒:にほんしゅ
受|8|受ける:うける,受け取る:うけとる
州|6|九州:きゅうしゅう,本州:ほんしゅう
拾|9|拾う:ひろう
終|11|終わる:おわる,終点:しゅうてん
習|11|習う:ならう,練習:れんしゅう
集|12|集める:あつめる,集合:しゅうごう
住|7|住む:すむ,住所:じゅうしょ
重|9|重い:おもい,体重:たいじゅう
宿|11|宿題:しゅくだい,宿:やど
所|8|場所:ばしょ,台所:だいどころ
暑|12|暑い:あつい,暑中:しょちゅう
助|7|助ける:たすける,助手:じょしゅ
昭|9|昭和:しょうわ
消|10|消す:けす,消火:しょうか
商|11|商店:しょうてん,商品:しょうひん
章|11|文章:ぶんしょう
勝|12|勝つ:かつ,勝負:しょうぶ
乗|9|乗る:のる,乗車:じょうしゃ
植|12|植える:うえる,植物:しょくぶつ
申|5|申す:もうす
身|7|身:み,身長:しんちょう
神|9|神様:かみさま,神社:じんじゃ
真|10|真ん中:まんなか,真上:まうえ
深|11|深い:ふかい,深海:しんかい
進|11|進む:すすむ,前進:ぜんしん
世|5|世の中:よのなか,世界:せかい
整|16|整える:ととのえる,整理:せいり
昔|8|昔:むかし,昔話:むかしばなし
全|6|全部:ぜんぶ,全く:まったく
相|9|相手:あいて,相談:そうだん
送|9|送る:おくる,放送:ほうそう
想|13|感想:かんそう,予想:よそう
息|10|息:いき,休息:きゅうそく
速|10|速い:はやい,時速:じそく
族|11|家族:かぞく,水族館:すいぞくかん
他|5|他:ほか,他人:たにん
打|5|打つ:うつ,打者:だしゃ
対|7|反対:はんたい,対話:たいわ
待|9|待つ:まつ,期待:きたい
代|5|代わる:かわる,時代:じだい
第|11|第一:だいいち
題|18|問題:もんだい,題名:だいめい
炭|9|炭:すみ,石炭:せきたん
短|12|短い:みじかい,短気:たんき
談|15|相談:そうだん,談話:だんわ
着|12|着る:きる,着地:ちゃくち
注|8|注ぐ:そそぐ,注意:ちゅうい
柱|9|柱:はしら,電柱:でんちゅう
丁|2|一丁目:いっちょうめ,包丁:ほうちょう
帳|11|手帳:てちょう,通帳:つうちょう
調|15|調べる:しらべる,体調:たいちょう
追|9|追う:おう,追加:ついか
定|8|定める:さだめる,予定:よてい
庭|10|庭:にわ,校庭:こうてい
笛|11|笛:ふえ,口笛:くちぶえ
鉄|13|鉄:てつ,地下鉄:ちかてつ
転|11|転ぶ:ころぶ,自転車:じてんしゃ
都|11|都:みやこ,東京都:とうきょうと
度|9|今度:こんど,温度:おんど
投|7|投げる:なげる,投手:とうしゅ
豆|7|豆:まめ,大豆:だいず
島|10|島:しま,半島:はんとう
湯|12|お湯:おゆ,湯気:ゆげ
登|12|登る:のぼる,登山:とざん
等|12|等しい:ひとしい,一等:いっとう
動|11|動く:うごく,動物:どうぶつ
童|12|童話:どうわ,童心:どうしん
農|13|農家:のうか,農業:のうぎょう
波|8|波:なみ,電波:でんぱ
配|10|配る:くばる,心配:しんぱい
倍|10|二倍:にばい,倍:ばい
箱|15|箱:はこ,本箱:ほんばこ
畑|9|畑:はたけ,田畑:たはた
発|9|出発:しゅっぱつ,発見:はっけん
反|4|反対:はんたい,反る:そる
坂|7|坂:さか,坂道:さかみち
板|8|板:いた,黒板:こくばん
皮|5|皮:かわ,毛皮:けがわ
悲|12|悲しい:かなしい,悲鳴:ひめい
美|9|美しい:うつくしい,美人:びじん
鼻|14|鼻:はな,鼻血:はなぢ
筆|12|筆:ふで,筆者:ひっしゃ
氷|5|氷:こおり,氷山:ひょうざん
表|8|表:おもて,発表:はっぴょう
秒|9|一秒:いちびょう,秒速:びょうそく
病|10|病気:びょうき,病:やまい
品|9|品物:しなもの,作品:さくひん
負|9|負ける:まける,勝負:しょうぶ
部|11|部屋:へや,全部:ぜんぶ
服|8|服:ふく,洋服:ようふく
福|13|福:ふく,幸福:こうふく
物|8|物:もの,動物:どうぶつ
平|5|平ら:たいら,平和:へいわ
返|7|返す:かえす,返事:へんじ
勉|10|勉強:べんきょう
放|8|放す:はなす,放送:ほうそう
味|8|味:あじ,意味:いみ
命|8|命:いのち,生命:せいめい
面|9|お面:おめん,地面:じめん
問|11|問い:とい,問題:もんだい
役|7|役:やく,役者:やくしゃ
薬|16|薬:くすり,薬局:やっきょく
由|5|自由:じゆう,理由:りゆう
油|8|油:あぶら,石油:せきゆ
有|6|有る:ある,有名:ゆうめい
遊|12|遊ぶ:あそぶ,遊園地:ゆうえんち
予|4|予定:よてい,予習:よしゅう
羊|6|羊:ひつじ,羊毛:ようもう
洋|9|洋服:ようふく,海洋:かいよう
葉|12|葉:は,言葉:ことば
陽|12|太陽:たいよう,陽気:ようき
様|14|様子:ようす,王様:おうさま
落|12|落ちる:おちる,落葉:らくよう
流|10|流れる:ながれる,流行:りゅうこう
旅|10|旅:たび,旅行:りょこう
両|6|両手:りょうて,両親:りょうしん
緑|14|緑:みどり,緑地:りょくち
礼|5|お礼:おれい,礼:れい
列|6|列:れつ,行列:ぎょうれつ
練|14|練習:れんしゅう,練る:ねる
路|13|道路:どうろ,線路:せんろ
和|8|平和:へいわ,和室:わしつ
`.trim().split('\n').map(line => {
  const [k, st, ws] = line.split('|');
  return { k, strokes: +st, words: ws.split(',').map(w => { const [word, yomi] = w.split(':'); return { word, yomi }; }) };
});
const KANJI_ALL = KANJI_DATA.map(d => d.k);

function kanjiState() {
  if (!S.kanji) S.kanji = { ok: {}, ng: {} };
  return S.kanji;
}
const kanjiLevel = (k) => Math.min(3, kanjiState().ok[k] || 0); // 3かい せいかいで マスター
const kanjiByK = (k) => KANJI_DATA.find(d => d.k === k);

// にがて・まだの かんじを おおめに だす
function pickKanji() {
  const st = kanjiState();
  const w = KANJI_DATA.map(d => (st.ng[d.k] ? 4 : 0) + (3 - kanjiLevel(d.k)) + 1);
  let r = Math.random() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < w.length; i++) { if ((r -= w[i]) < 0) return KANJI_DATA[i]; }
  return KANJI_DATA[0];
}

const markK = (word, k) => word.replace(k, `<b class="kj-hl">${k}</b>`);

function genKanjiRead(d) {
  const w = pick(d.words);
  const pool = KANJI_DATA.flatMap(x => x.words).filter(x => x.yomi !== w.yomi && Math.abs(x.yomi.length - w.yomi.length) <= 1);
  const opts = uniq([w.yomi, ...shuffle(pool).map(x => x.yomi)]).slice(0, 4);
  return {
    kind: 'choice', cat: 'kanji', k: d.k, title: '📖 よみかた',
    text: `<span class="kj-word">${markK(w.word, d.k)}</span><br>この ことばの よみかたは?`,
    speak: 'この ことばの よみかたを えらんでね',
    answer: w.yomi, options: shuffle(opts),
    hints: [`「${d.k}」の よみかたを おもいだそう`], reveal: `${w.word}（${w.yomi}）`,
  };
}

function genKanjiWrite(d) {
  const w = pick(d.words);
  const near = shuffle(KANJI_DATA.filter(x => x.k !== d.k && Math.abs(x.strokes - d.strokes) <= 2)).slice(0, 3).map(x => x.k);
  const opts = uniq([d.k, ...near, ...shuffle(KANJI_ALL)]).slice(0, 4);
  return {
    kind: 'choice', cat: 'kanji', k: d.k, title: '✏️ かきとり',
    text: `<span class="kj-word">${w.word.replace(d.k, '<span class="kj-box">？</span>')}</span><br><span class="kj-yomi">${w.yomi}</span><br>？に はいる かんじは どれ?`,
    speak: `${w.yomi}。はいる かんじを えらんでね`,
    answer: d.k, options: shuffle(opts), big: true,
    hints: [`「${w.yomi}」の いみを かんがえよう`], reveal: `${w.word}（${w.yomi}）`,
  };
}

function genKanjiStrokes(d) {
  return {
    kind: 'keypad', cat: 'kanji', k: d.k, title: '🔢 かくすう', suffix: 'かく',
    text: `<span class="kj-big">${d.k}</span><br>この かんじは なんかくで かく?`,
    speak: 'この かんじは なんかくで かくかな',
    answer: d.strokes, hints: ['ゆびで なぞりながら かぞえてみよう'], reveal: `${d.strokes}かく`,
  };
}

function screenKanji(msg) {
  setArea('kanji');
  const st = kanjiState();
  const master = KANJI_ALL.filter(k => kanjiLevel(k) >= 3).length;
  $('#app').innerHTML = `
    <div class="screen kanji">
      <header class="bar">
        <button class="iconbtn" id="back" aria-label="まちへ">🗺️</button>
        <h2>かんじの としょかん</h2>
        ${walletHTML()}
      </header>
      <div class="layout">
        <section class="interior kj-room">
          <div class="kj-shelf">${Array.from({ length: 18 }, (_, i) => `<i style="background:${['#ff9fc1', '#7cc6ff', '#ffd45c', '#8fdcc8', '#a98cf0', '#ff9d3b'][i % 6]};height:${70 + (i * 37) % 30}%"></i>`).join('')}</div>
          <div class="kj-me bounce">${charSVG(S.partner, 'happy', S.wear)}</div>
          <div class="bubble kj-bubble">${msg || 'かんけん 8きゅうに むけて がんばろう!'}</div>
          <div class="kj-meter"><b>マスター ${master} / ${KANJI_ALL.length}じ</b><span><i style="width:${master / KANJI_ALL.length * 100}%"></i></span></div>
        </section>
        <section class="menu">
          <button class="gamecard kd-gc" data-mode="dig"><span class="gc-ic kj-ic kd-ic">⛏</span><span><b>かんじ はっくつ</b><small>つちを ほって かくれた かんじを あてよう</small></span></button>
          <button class="gamecard" data-mode="mix"><span class="gc-ic kj-ic">漢</span><span><b>れんしゅう テスト</b><small>よみ・かき・かくすう 10もん</small></span></button>
          <button class="gamecard" data-mode="read"><span class="gc-ic kj-ic">よ</span><span><b>よみかた</b><small>ことばの よみかたを えらぶ</small></span></button>
          <button class="gamecard" data-mode="write"><span class="gc-ic kj-ic">か</span><span><b>かきとり</b><small>はいる かんじを えらぶ</small></span></button>
          <button class="gamecard" data-mode="trace"><span class="gc-ic kj-ic">✍</span><span><b>なぞりがき</b><small>ゆびで かいて おぼえよう</small></span></button>
          <button class="gamecard" data-mode="cards"><span class="gc-ic kj-ic">★</span><span><b>かんじカード</b><small>200じの おぼえぐあいを みる</small></span></button>
        </section>
      </div>
    </div>`;
  $('#back').onclick = () => screenField();
  $$('[data-mode]').forEach(b => b.onclick = () => {
    sfx('tap');
    const m = b.dataset.mode;
    if (m === 'cards') screenKanjiCards();
    else if (m === 'dig') startKanjiDig();
    else if (m === 'trace') startKanjiTrace();
    else startKanjiTest(m);
  });
  void st;
}

function kanjiFrame(title) {
  $('#app').innerHTML = `
    <div class="screen kanji">
      <header class="bar">
        <button class="iconbtn" id="back" aria-label="としょかんへ">↩️</button>
        <h2>${title}</h2>
        ${walletHTML()}
      </header>
      <div class="kj-progress" id="kjprog"></div>
      <section class="panel kj-panel" id="q"></section>
    </div>`;
  $('#back').onclick = () => screenKanji();
}

function startKanjiTest(mode) {
  const N = 10;
  kanjiFrame(mode === 'read' ? 'よみかた' : mode === 'write' ? 'かきとり' : 'れんしゅう テスト');
  const g = { i: 0, score: 0, used: new Set() };
  const next = () => {
    if (g.i >= N) return finish();
    $('#kjprog').innerHTML = Array.from({ length: N }, (_, k) => `<span class="${k < g.i ? 'done' : k === g.i ? 'now' : ''}"></span>`).join('');
    let d; do { d = pickKanji(); } while (g.used.has(d.k) && g.used.size < 150);
    g.used.add(d.k);
    const type = mode === 'mix' ? pick(['read', 'read', 'write', 'write', 'strokes']) : mode;
    const q = type === 'read' ? genKanjiRead(d) : type === 'write' ? genKanjiWrite(d) : genKanjiStrokes(d);
    askQuestion($('#q'), q, (first) => {
      const st = kanjiState();
      if (first) { st.ok[d.k] = (st.ok[d.k] || 0) + 1; g.score++; if (st.ng[d.k]) st.ng[d.k]--; }
      else st.ng[d.k] = (st.ng[d.k] || 0) + 1;
      save();
      g.i++;
      next();
    });
    $('#q').classList.toggle('bigchoice', !!q.big);
  };
  const finish = () => {
    const yen = 10 + g.score * 2;
    S.money += yen;
    save();
    addXP(2 + Math.floor(g.score / 3));
    sfx('fanfare');
    $('#kjprog').innerHTML = '';
    $('#q').innerHTML = `<div class="qcard done"><div class="reveal bounce">${charSVG(S.partner, 'happy', S.wear)}</div>
      <h3>${g.score >= 9 ? 'すごい! ごうかく レベル!' : g.score >= 7 ? 'よく できました!' : 'おつかれさま!'}</h3>
      <p class="pay">${g.score} / ${N} もん いっかいで せいかい</p><p>おこづかい <b>${yen}円</b></p>
      <p class="muted">かんけん 8きゅうは 7わり（7もん）くらいで ごうかくだよ</p>
      <div class="row"><button class="btn ok" id="again">もう いっかい</button><button class="btn sub" id="toLib">としょかんへ</button></div></div>`;
    sparkle($('.reveal'), 20);
    bumpWallet();
    $('#again').onclick = () => startKanjiTest(mode);
    $('#toLib').onclick = () => screenKanji(g.score >= 7 ? 'その ちょうし!' : 'つぎも がんばろう!');
  };
  next();
}

/* なぞりがき: おおきな かんじの うえを ゆびで なぞる（かくじゅんの はんていは しない） */
function startKanjiTrace(k) {
  const d = k ? kanjiByK(k) : pickKanji();
  kanjiFrame('なぞりがき');
  $('#q').innerHTML = `<div class="qcard kj-trace">
    <div class="qhead"><span class="qtitle">✍ ゆびで なぞろう</span><span class="muted">${d.strokes}かく</span></div>
    <div class="kj-words">${d.words.map(w => `<span><em>${markK(w.word, d.k)}</em><small>${w.yomi}</small></span>`).join('')}</div>
    <div class="kj-pad"><span class="kj-ghost">${d.k}</span><canvas id="pad"></canvas></div>
    <div class="row"><button class="btn sub" id="clr">けす</button><button class="btn sub" id="hide">おてほんを かくす</button><button class="btn ok" id="ok">かけた!</button></div>
  </div>`;
  const cv = $('#pad'), box = cv.parentNode;
  const dpr = window.devicePixelRatio || 1;
  const size = () => { const r = box.getBoundingClientRect(); cv.width = r.width * dpr; cv.height = r.height * dpr; };
  size();
  const ctx = cv.getContext('2d');
  const pen = () => { ctx.lineWidth = Math.max(10, cv.width / 22); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#4a3b47'; };
  pen();
  let drawing = false, strokes = 0;
  const pos = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * dpr, (e.clientY - r.top) * dpr]; };
  cv.addEventListener('pointerdown', (e) => { e.preventDefault(); cv.setPointerCapture(e.pointerId); drawing = true; strokes++; const [x, y] = pos(e); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + .1, y + .1); ctx.stroke(); });
  cv.addEventListener('pointermove', (e) => { if (!drawing) return; const [x, y] = pos(e); ctx.lineTo(x, y); ctx.stroke(); });
  ['pointerup', 'pointercancel'].forEach(ev => cv.addEventListener(ev, () => { drawing = false; }));
  $('#clr').onclick = () => { ctx.clearRect(0, 0, cv.width, cv.height); strokes = 0; };
  $('#hide').onclick = () => { $('.kj-ghost').classList.toggle('off'); $('#hide').textContent = $('.kj-ghost').classList.contains('off') ? 'おてほんを だす' : 'おてほんを かくす'; };
  $('#ok').onclick = () => {
    if (!strokes) { toast('ゆびで かいてみてね'); return; }
    celebrate(true);
    const st = kanjiState();
    st.traced = st.traced || {};
    st.traced[d.k] = (st.traced[d.k] || 0) + 1;
    S.money += 2; save(); bumpWallet();
    setTimeout(() => startKanjiTrace(), 1300);
  };
}

/* かんじカード: 200じの おぼえぐあい */
function screenKanjiCards() {
  setArea('kanji');
  const st = kanjiState();
  $('#app').innerHTML = `
    <div class="screen kanji">
      <header class="bar">
        <button class="iconbtn" id="back" aria-label="としょかんへ">↩️</button>
        <h2>かんじカード</h2>
        ${walletHTML()}
      </header>
      <p class="muted center">★3つで マスター。タップすると なぞりがきが できるよ</p>
      <div class="kj-cards">${KANJI_DATA.map(d => { const lv = kanjiLevel(d.k); return `<button class="kj-card lv${lv} ${st.ng[d.k] ? 'weak' : ''}" data-k="${d.k}"><b>${d.k}</b><small>${'★'.repeat(lv)}${'☆'.repeat(3 - lv)}</small></button>`; }).join('')}</div>
    </div>`;
  $('#back').onclick = () => screenKanji();
  $$('.kj-card').forEach(b => b.onclick = () => { sfx('tap'); startKanjiTrace(b.dataset.k); });
}
