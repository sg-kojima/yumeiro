'use strict';
// バイト＆おしゃべり（えいご）。おきゃくさんの えいごを きいて、こたえを えらんで、まねして いう。

/* ---------- えいごの よみあげ ---------- */
let enVoice = null;
function pickEnVoice() {
  if (!('speechSynthesis' in window)) return;
  const vs = speechSynthesis.getVoices().filter(v => /^en[-_]/i.test(v.lang));
  const pref = ['Samantha', 'Karen', 'Moira', 'Tessa', 'Daniel', 'Google US English'];
  enVoice = vs.find(v => pref.some(p => v.name.includes(p))) || vs.find(v => /en[-_]US/i.test(v.lang)) || vs[0] || null;
}
if ('speechSynthesis' in window) { pickEnVoice(); speechSynthesis.onvoiceschanged = pickEnVoice; }
function speakEn(text, slow) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = enVoice ? enVoice.lang : 'en-US';
  if (enVoice) u.voice = enVoice;
  u.rate = slow ? 0.55 : 0.85;
  u.pitch = 1.1;
  speechSynthesis.speak(u);
}

/* ---------- かいわの ないよう ---------- */
// reply: おきゃくさん（npc）の ことばに こたえる。listen: きいて いみを えらぶ。
const kidEn = () => (S.kidNameEn || '').trim();
const kidKana = () => (S.kidNameKana || '').trim();
const R = (en, kana, ja, ok = false) => ({ en, kana, ja, ok });

const SCENES = [
  {
    id: 'hello', title: 'あいさつ', job: 'こうえんで あいさつ', icon: '🌟', place: 'park', pay: 30,
    turns: [
      { npc: 'Good morning!', kana: 'グッ モーニン!', ja: 'おはよう!', choices: [R('Good morning!', 'グッ モーニン!', 'おはよう!', true), R('Good night!', 'グッ ナイト!', 'おやすみ!')] },
      { npc: 'How are you?', kana: 'ハウ アー ユー?', ja: 'げんき?', choices: [R("I'm fine, thank you!", 'アイム ファイン、サンキュー!', 'げんきだよ、ありがとう!', true), R("I'm a cat.", 'アイム ア キャット', 'わたしは ねこです')] },
      { npc: 'Nice day today!', kana: 'ナイス デイ トゥデイ!', ja: 'きょうは いい てんきだね!', choices: [R('Yes! It is sunny!', 'イエス! イット イズ サニー!', 'うん! はれだね!', true), R('Passport, please.', 'パスポート、プリーズ', 'パスポートを ください')] },
      { npc: 'See you later!', kana: 'シー ユー レイター!', ja: 'また あとでね!', choices: [R('Bye-bye! See you!', 'バイバイ! シー ユー!', 'バイバイ! またね!', true), R('Good morning!', 'グッ モーニン!', 'おはよう!')] },
    ],
  },
  {
    id: 'me', title: 'じこしょうかい', job: 'あたらしい ともだち', icon: '💖', place: 'park', pay: 35,
    turns: [
      { npc: "Hi! What's your name?", kana: 'ハイ! ワッツ ユア ネーム?', ja: 'こんにちは! おなまえは?', needName: true,
        choices: () => [R(`My name is ${kidEn()}.`, `マイ ネーム イズ ${kidKana()}`, `わたしの なまえは ${kidKana()}です`, true), R("I'm hungry.", 'アイム ハングリー', 'おなかが すいた')] },
      { npc: 'Nice to meet you!', kana: 'ナイス トゥ ミーチュー!', ja: 'よろしくね!', choices: [R('Nice to meet you, too!', 'ナイス トゥ ミーチュー トゥー!', 'こちらこそ よろしくね!', true), R('Excuse me.', 'エクスキューズ ミー', 'すみません')] },
      { npc: 'Where are you from?', kana: 'ウェア アー ユー フロム?', ja: 'どこから きたの?', choices: [R("I'm from Japan.", 'アイム フロム ジャパン', 'にほんから きたよ', true), R("I'm from the moon.", 'アイム フロム ザ ムーン', 'つきから きたよ')] },
      { npc: 'What do you like?', kana: 'ワット ドゥー ユー ライク?', ja: 'なにが すき?', choices: [R('I like cake!', 'アイ ライク ケーキ!', 'ケーキが すき!', true), R("I'm sorry.", 'アイム ソーリー', 'ごめんなさい')] },
      { npc: 'Me too! Let’s be friends!', kana: 'ミー トゥー! レッツ ビー フレンズ!', ja: 'わたしも! ともだちに なろう!', choices: [R('Yes! Let’s be friends!', 'イエス! レッツ ビー フレンズ!', 'うん! ともだちに なろう!', true), R('Window, please.', 'ウィンドウ、プリーズ', 'まどがわで おねがいします')] },
    ],
  },
  {
    id: 'food', title: 'レストラン', job: 'レストランで ちゅうもん', icon: '🍽️', place: 'cafe', pay: 40,
    turns: [
      { npc: 'Hello! What would you like?', kana: 'ハロー! ワット ウッジュー ライク?', ja: 'こんにちは! なにに しますか?', choices: [R('Spaghetti, please.', 'スパゲッティ、プリーズ', 'スパゲッティを ください', true), R("I'm sleepy.", 'アイム スリーピー', 'ねむいです')] },
      { npc: 'Anything to drink?', kana: 'エニシング トゥ ドリンク?', ja: 'のみものは?', choices: [R('Orange juice, please.', 'オレンジ ジュース、プリーズ', 'オレンジジュースを ください', true), R("I'm from Japan.", 'アイム フロム ジャパン', 'にほんから きたよ')] },
      { type: 'listen', npc: "That's six dollars.", kana: 'ザッツ シックス ダラーズ', ja: '6ドルです', q: 'いくらって いってる?', options: ['2ドル', '6ドル', '10ドル'], answer: '6ドル' },
      { npc: 'Here you are!', kana: 'ヒア ユー アー!', ja: 'はい、どうぞ!', choices: [R('Is it hot?', 'イズ イット ホット?', 'あついですか?', true), R('Good night!', 'グッ ナイト!', 'おやすみ!')] },
      { type: 'listen', npc: "Yes, it's hot. Be careful!", kana: 'イエス、イッツ ホット。ビー ケアフル!', ja: 'うん、あついよ。きを つけてね!', q: 'スパゲッティは どう?', options: ['あつい', 'つめたい', 'からい'], answer: 'あつい' },
      { npc: 'Enjoy your meal!', kana: 'エンジョイ ユア ミール!', ja: 'めしあがれ!', choices: [R('Thank you!', 'サンキュー!', 'ありがとう!', true), R('Go straight.', 'ゴー ストレート', 'まっすぐ いって')] },
    ],
  },
  {
    id: 'shop', title: 'おみせ', job: 'おみやげやさん', icon: '🛍️', place: 'shop', pay: 40,
    turns: [
      { npc: 'Hi! Can I help you?', kana: 'ハイ! キャナイ ヘルプ ユー?', ja: 'いらっしゃいませ! なにか おさがし?', choices: [R("I'm just looking. Thank you.", 'アイム ジャスト ルッキング。サンキュー', 'みているだけです。ありがとう', true), R("I'm a cat.", 'アイム ア キャット', 'わたしは ねこです')] },
      { npc: 'This bear is very cute!', kana: 'ディス ベア イズ ベリー キュート!', ja: 'この くま とっても かわいいよ!', choices: [R('How much is this?', 'ハウ マッチ イズ ディス?', 'これは いくらですか?', true), R('Where is the pool?', 'ウェア イズ ザ プール?', 'プールは どこ?')] },
      { type: 'listen', npc: "It's ten dollars.", kana: 'イッツ テン ダラーズ', ja: '10ドルです', q: 'いくらって いってる?', options: ['3ドル', '7ドル', '10ドル'], answer: '10ドル' },
      { npc: 'Do you want it?', kana: 'ドゥー ユー ウォント イット?', ja: 'ほしい?', choices: [R("Yes, please! I'll take it.", 'イエス、プリーズ! アイル テイク イット', 'はい! これを ください', true), R('To Hawaii!', 'トゥ ハワイ!', 'ハワイへ!')] },
      { npc: 'Thank you! Have a nice day!', kana: 'サンキュー! ハヴ ア ナイス デイ!', ja: 'ありがとう! よい いちにちを!', choices: [R('Thank you! You too!', 'サンキュー! ユー トゥー!', 'ありがとう! あなたもね!', true), R('Spaghetti, please.', 'スパゲッティ、プリーズ', 'スパゲッティを ください')] },
    ],
  },
  {
    id: 'way', title: 'みちを きく', job: 'まいごの おてつだい', icon: '🗺️', place: 'street', pay: 40,
    turns: [
      { npc: 'Hi! Are you OK?', kana: 'ハイ! アー ユー オーケー?', ja: 'こんにちは! だいじょうぶ?', choices: [R('Excuse me. Where is the toilet?', 'エクスキューズ ミー。ウェア イズ ザ トイレット?', 'すみません。トイレは どこですか?', true), R('Orange juice, please.', 'オレンジ ジュース、プリーズ', 'オレンジジュースを ください')] },
      { type: 'listen', npc: 'Go straight and turn left.', kana: 'ゴー ストレート アンド ターン レフト', ja: 'まっすぐ いって ひだりに まがってね', q: 'どう いけば いい?', options: ['⬆️ まっすぐ → ⬅️ ひだり', '⬆️ まっすぐ → ➡️ みぎ', '⬇️ うしろ'], answer: '⬆️ まっすぐ → ⬅️ ひだり' },
      { type: 'listen', npc: "It's next to the shop.", kana: 'イッツ ネクスト トゥ ザ ショップ', ja: 'おみせの となりだよ', q: 'トイレは どこ?', options: ['おみせの となり', 'ホテルの なか', 'こうえんの まえ'], answer: 'おみせの となり' },
      { npc: "You're welcome! Bye!", kana: 'ユア ウェルカム! バイ!', ja: 'どういたしまして! バイバイ!', choices: [R('Thank you so much!', 'サンキュー ソー マッチ!', 'ほんとうに ありがとう!', true), R("I'm just looking.", 'アイム ジャスト ルッキング', 'みているだけです')] },
    ],
  },
  {
    id: 'airport', title: 'くうこう', job: 'くうこうの カウンター', icon: '✈️', place: 'airport', pay: 45,
    turns: [
      { npc: 'Hello! Passport, please.', kana: 'ハロー! パスポート、プリーズ', ja: 'こんにちは! パスポートを みせてね', choices: [R('Here you are.', 'ヒア ユー アー', 'はい、どうぞ', true), R('No, thank you.', 'ノー、サンキュー', 'いいえ、けっこうです')] },
      { npc: 'Where are you going?', kana: 'ウェア アー ユー ゴーイング?', ja: 'どこへ いくの?', choices: [R('To Hawaii!', 'トゥ ハワイ!', 'ハワイへ!', true), R('To the toilet.', 'トゥ ザ トイレット', 'トイレへ')] },
      { npc: 'Window or aisle?', kana: 'ウィンドウ オア アイル?', ja: 'まどがわ? つうろがわ?', choices: [R('Window, please!', 'ウィンドウ、プリーズ!', 'まどがわで おねがいします!', true), R('Chocolate, please!', 'チョコレート、プリーズ!', 'チョコレートを ください!')] },
      { type: 'listen', npc: 'Your gate is number eight.', kana: 'ユア ゲート イズ ナンバー エイト', ja: 'ゲートは 8ばんです', q: 'なんばん ゲート?', options: ['3ばん', '8ばん', '11ばん'], answer: '8ばん' },
      { npc: 'Have a nice flight!', kana: 'ハヴ ア ナイス フライト!', ja: 'いい たびを!', choices: [R('Thank you!', 'サンキュー!', 'ありがとう!', true), R("I'm just looking.", 'アイム ジャスト ルッキング', 'みているだけです')] },
    ],
  },
  {
    id: 'hotel', title: 'ホテル', job: 'ホテルの フロント', icon: '🛏️', place: 'hotel', pay: 45,
    turns: [
      { npc: 'Welcome to the hotel!', kana: 'ウェルカム トゥ ザ ホテル!', ja: 'ホテルへ ようこそ!', choices: [R('Hello! We have a reservation.', 'ハロー! ウィー ハヴ ア リザベーション', 'こんにちは! よやく しています', true), R('Orange juice, please.', 'オレンジ ジュース、プリーズ', 'オレンジジュースを ください')] },
      { type: 'listen', npc: 'Your room is on the tenth floor.', kana: 'ユア ルーム イズ オン ザ テンス フロア', ja: 'おへやは 10かいです', q: 'おへやは なんかい?', options: ['1かい', '7かい', '10かい'], answer: '10かい' },
      { npc: 'Do you need anything?', kana: 'ドゥー ユー ニード エニシング?', ja: 'なにか ほしい ものは ある?', choices: [R('Where is the pool?', 'ウェア イズ ザ プール?', 'プールは どこですか?', true), R('Gate eight, please.', 'ゲート エイト、プリーズ', '8ばんゲートを ください')] },
      { type: 'listen', npc: 'The pool is on the top floor.', kana: 'ザ プール イズ オン ザ トップ フロア', ja: 'プールは いちばん うえの かいだよ', q: 'プールは どこ?', options: ['いちばん うえ', '1かい', 'ちか'], answer: 'いちばん うえ' },
      { npc: 'Have a nice stay!', kana: 'ハヴ ア ナイス ステイ!', ja: 'ゆっくり すごしてね!', choices: [R('Thank you very much!', 'サンキュー ベリー マッチ!', 'どうも ありがとう!', true), R('Go straight.', 'ゴー ストレート', 'まっすぐ いって')] },
    ],
  },
  {
    id: 'party', title: 'パーティ', job: 'おたんじょうびかい', icon: '🎂', place: 'party', pay: 45,
    turns: [
      { npc: 'Welcome! Come in!', kana: 'ウェルカム! カム イン!', ja: 'いらっしゃい! はいって!', choices: [R('Happy birthday!', 'ハッピー バースデー!', 'おたんじょうび おめでとう!', true), R('Window, please!', 'ウィンドウ、プリーズ!', 'まどがわで おねがいします!')] },
      { npc: 'Thank you! How old am I?', kana: 'サンキュー! ハウ オールド アム アイ?', ja: 'ありがとう! わたし なんさいに なったと おもう?', choices: [R('Are you eight?', 'アー ユー エイト?', '8さい?', true), R("I'm from Japan.", 'アイム フロム ジャパン', 'にほんから きたよ')] },
      { type: 'listen', npc: "Yes! I'm eight years old!", kana: 'イエス! アイム エイト イヤーズ オールド!', ja: 'そう! 8さいに なったよ!', q: 'なんさいに なった?', options: ['6さい', '8さい', '10さい'], answer: '8さい' },
      { npc: 'This is for you!', kana: 'ディス イズ フォー ユー!', ja: 'これ、あなたに!', choices: [R('Wow! Thank you! I love it!', 'ワオ! サンキュー! アイ ラブ イット!', 'わあ! ありがとう! だいすき!', true), R('Go straight.', 'ゴー ストレート', 'まっすぐ いって')] },
      { type: 'listen', npc: "Let's eat cake and sing!", kana: 'レッツ イート ケーキ アンド シング!', ja: 'ケーキを たべて うたおう!', q: 'なにを する?', options: ['ケーキと うた', 'プールと おひるね', 'でんしゃと えき'], answer: 'ケーキと うた' },
      { npc: 'Bye-bye! Thank you for coming!', kana: 'バイバイ! サンキュー フォー カミング!', ja: 'バイバイ! きてくれて ありがとう!', choices: [R('Thank you! It was fun!', 'サンキュー! イット ワズ ファン!', 'ありがとう! たのしかった!', true), R('Passport, please.', 'パスポート、プリーズ', 'パスポートを ください')] },
    ],
  },
  {
    id: 'ice', title: 'アイスやさん', job: 'アイスクリームやさん', icon: '🍦', place: 'ice', pay: 40,
    turns: [
      { npc: 'Hi! Which flavor?', kana: 'ハイ! ウィッチ フレイバー?', ja: 'こんにちは! なにあじに する?', choices: [R('Strawberry, please!', 'ストロベリー、プリーズ!', 'いちごを ください!', true), R("I'm from Japan.", 'アイム フロム ジャパン', 'にほんから きたよ')] },
      { npc: 'Cup or cone?', kana: 'カップ オア コーン?', ja: 'カップ? コーン?', choices: [R('Cone, please!', 'コーン、プリーズ!', 'コーンで おねがいします!', true), R('Window, please!', 'ウィンドウ、プリーズ!', 'まどがわで おねがいします!')] },
      { type: 'listen', npc: 'Small, medium, or large?', kana: 'スモール、ミディアム、オア ラージ?', ja: 'ちいさい? ふつう? おおきい?', q: 'なにを きいてる?', options: ['おおきさ', 'あじ', 'なまえ'], answer: 'おおきさ' },
      { npc: 'Here you are!', kana: 'ヒア ユー アー!', ja: 'はい、どうぞ!', choices: [R('Yummy! Thank you!', 'ヤミー! サンキュー!', 'おいしい! ありがとう!', true), R('Go straight.', 'ゴー ストレート', 'まっすぐ いって')] },
    ],
  },
  {
    id: 'zoo', title: 'どうぶつえん', job: 'どうぶつえんの ガイド', icon: '🐘', place: 'zoo', pay: 45,
    turns: [
      { npc: 'Look! What animal is this?', kana: 'ルック! ワット アニマル イズ ディス?', ja: 'みて! これは なんの どうぶつ?', choices: [R("It's an elephant!", 'イッツ アン エレファント!', 'ぞうだよ!', true), R("It's a hotel!", 'イッツ ア ホテル!', 'ホテルだよ!')] },
      { type: 'listen', npc: 'The monkey is eating a banana.', kana: 'ザ モンキー イズ イーティング ア バナナ', ja: 'おさるが バナナを たべているよ', q: 'おさるは なにを たべてる?', options: ['バナナ', 'りんご', 'アイス'], answer: 'バナナ' },
      { npc: 'Do you like animals?', kana: 'ドゥー ユー ライク アニマルズ?', ja: 'どうぶつは すき?', choices: [R('Yes! I love pandas!', 'イエス! アイ ラブ パンダズ!', 'うん! パンダが だいすき!', true), R('Cone, please!', 'コーン、プリーズ!', 'コーンで おねがいします!')] },
      { type: 'listen', npc: 'The panda is sleeping.', kana: 'ザ パンダ イズ スリーピング', ja: 'パンダは ねているよ', q: 'パンダは なにしてる?', options: ['ねている', 'たべている', 'はしっている'], answer: 'ねている' },
      { npc: "Let's take a picture!", kana: 'レッツ テイク ア ピクチャー!', ja: 'しゃしんを とろう!', choices: [R('OK! Say cheese!', 'オーケー! セイ チーズ!', 'いいよ! はい、チーズ!', true), R("I'm just looking.", 'アイム ジャスト ルッキング', 'みているだけです')] },
    ],
  },
  {
    id: 'train', title: 'でんしゃ', job: 'えきの あんないがかり', icon: '🚃', place: 'train', pay: 45,
    turns: [
      { npc: 'Hello! Can I help you?', kana: 'ハロー! キャナイ ヘルプ ユー?', ja: 'こんにちは! おてつだい しようか?', choices: [R('Which train goes to the zoo?', 'ウィッチ トレイン ゴーズ トゥ ザ ズー?', 'どうぶつえんへ いく でんしゃは どれ?', true), R("I'm sleepy.", 'アイム スリーピー', 'ねむいです')] },
      { type: 'listen', npc: 'Take the red line.', kana: 'テイク ザ レッド ライン', ja: 'あかい せんに のってね', q: 'なにいろの せん?', options: ['あか', 'あお', 'みどり'], answer: 'あか' },
      { type: 'listen', npc: 'Get off at the third stop.', kana: 'ゲット オフ アット ザ サード ストップ', ja: '3つめの えきで おりてね', q: 'いくつめで おりる?', options: ['1つめ', '3つめ', '5つめ'], answer: '3つめ' },
      { npc: 'Have a good trip!', kana: 'ハヴ ア グッド トリップ!', ja: 'いってらっしゃい!', choices: [R('Thank you for your help!', 'サンキュー フォー ユア ヘルプ!', 'おしえてくれて ありがとう!', true), R('Strawberry, please!', 'ストロベリー、プリーズ!', 'いちごを ください!')] },
    ],
  },
  {
    id: 'feel', title: 'きもちを つたえる', job: 'ホテルの あさごはん', icon: '🥞', place: 'hotel', pay: 40,
    turns: [
      { npc: 'Good morning! Did you sleep well?', kana: 'グッ モーニン! ディジュー スリープ ウェル?', ja: 'おはよう! よく ねむれた?', choices: [R('Yes! I slept well!', 'イエス! アイ スレプト ウェル!', 'うん! よく ねむれたよ!', true), R('Gate eight, please.', 'ゲート エイト、プリーズ', '8ばんゲートを ください')] },
      { npc: 'Are you hungry?', kana: 'アー ユー ハングリー?', ja: 'おなか すいた?', choices: [R("Yes, I'm hungry!", 'イエス、アイム ハングリー!', 'うん、おなか すいた!', true), R("It's an elephant!", 'イッツ アン エレファント!', 'ぞうだよ!')] },
      { npc: 'Pancakes or eggs?', kana: 'パンケーキズ オア エッグズ?', ja: 'パンケーキ? たまご?', choices: [R('Pancakes, please!', 'パンケーキズ、プリーズ!', 'パンケーキを ください!', true), R('Take the red line.', 'テイク ザ レッド ライン', 'あかい せんに のってね')] },
      { npc: 'Oh no! Are you OK?', kana: 'オー ノー! アー ユー オーケー?', ja: 'あら! だいじょうぶ?', choices: [R("I'm cold. Can I have a blanket?", 'アイム コールド。キャナイ ハヴ ア ブランケット?', 'さむいです。もうふを もらえますか?', true), R('Yummy! Thank you!', 'ヤミー! サンキュー!', 'おいしい! ありがとう!')] },
      { npc: 'Sure! Here you are.', kana: 'シュア! ヒア ユー アー', ja: 'もちろん! はい、どうぞ', choices: [R('Thank you! I feel better.', 'サンキュー! アイ フィール ベター', 'ありがとう! げんきに なったよ', true), R('Cup or cone?', 'カップ オア コーン?', 'カップ? コーン?')] },
    ],
  },
];

function engState() {
  if (!S.eng) S.eng = { stars: {}, said: {} };
  return S.eng;
}

/* ---------- ばしょの え ---------- */
function placeBG(place) {
  const svg = {
    park: `<rect width="400" height="200" fill="#bfe6ff"/><rect y="120" width="400" height="80" fill="#9fdc84"/><circle cx="340" cy="40" r="22" fill="#ffe680"/>
      <g transform="translate(60 60)"><rect x="-4" y="30" width="8" height="40" fill="#c99a6b"/><circle cy="24" r="30" fill="#7fd06a"/></g><g transform="translate(300 70)"><rect x="-4" y="26" width="8" height="34" fill="#c99a6b"/><circle cy="20" r="24" fill="#ffb3cc"/></g>`,
    cafe: `<rect width="400" height="200" fill="#ffe9c7"/><g fill="#ffd28a">${Array.from({ length: 10 }, (_, i) => `<rect x="${i * 40}" width="20" height="120"/>`).join('')}</g>
      <rect y="120" width="400" height="80" fill="#c98a5a"/><rect y="112" width="400" height="14" fill="#ff7a59"/>
      <rect x="140" y="20" width="120" height="44" rx="8" fill="#3d5a4a" stroke="#c98a5a" stroke-width="5"/><text x="200" y="40" font-size="13" fill="#ffe680" text-anchor="middle" font-weight="bold">SPAGHETTI</text><text x="200" y="56" font-size="11" fill="#fff" text-anchor="middle">PANCAKE · JUICE</text>`,
    shop: `<rect width="400" height="200" fill="#fff3c9"/><g fill="#fff">${Array.from({ length: 30 }, (_, i) => `<circle cx="${(i * 47) % 400}" cy="${(i * 31) % 120}" r="3"/>`).join('')}</g>
      <rect x="20" y="40" width="360" height="8" fill="#d9a86c"/><rect x="20" y="90" width="360" height="8" fill="#d9a86c"/><rect y="130" width="400" height="70" fill="#ffb3cc"/>
      <text x="60" y="38" font-size="26">🧸</text><text x="130" y="38" font-size="26">🎀</text><text x="200" y="88" font-size="26">👛</text><text x="280" y="38" font-size="26">🍪</text><text x="330" y="88" font-size="26">🧺</text>`,
    street: `<rect width="400" height="200" fill="#bfe6ff"/><rect x="20" y="30" width="90" height="100" fill="#ffd0de"/><rect x="290" y="20" width="100" height="110" fill="#c9f0e4"/><rect x="130" y="50" width="70" height="80" fill="#fff3c9"/>
      <rect y="130" width="400" height="70" fill="#cfd6de"/><g fill="#fff">${Array.from({ length: 8 }, (_, i) => `<rect x="${i * 54}" y="160" width="30" height="6"/>`).join('')}</g>
      <rect x="226" y="40" width="6" height="90" fill="#5b4040"/><rect x="232" y="44" width="54" height="20" rx="4" fill="#4ab3ff"/><text x="259" y="58" font-size="11" fill="#fff" text-anchor="middle" font-weight="bold">TOILET</text>`,
    airport: `<rect width="400" height="200" fill="#e6f4ff"/><rect x="0" y="20" width="400" height="70" fill="#bfe6ff"/><path d="M60 50 l60 -8 l14 -20 l8 2 l-6 20 l40 -4 l8 -8 l6 2 l-4 12 l-110 16z" fill="#fff" stroke="#7cb8e0" stroke-width="2"/>
      <rect x="250" y="30" width="130" height="40" rx="6" fill="#2d3a4a"/><text x="315" y="48" font-size="11" fill="#ffd45c" text-anchor="middle" font-weight="bold">DEPARTURES</text><text x="315" y="63" font-size="11" fill="#7cf0a0" text-anchor="middle">HAWAII  8</text>
      <rect y="130" width="400" height="70" fill="#d6dde6"/><rect x="40" y="110" width="320" height="30" rx="6" fill="#4ab3ff"/>`,
    hotel: `<rect width="400" height="200" fill="#fff6e6"/><path d="M0 0 h400 v30 q-25 20 -50 0 q-25 20 -50 0 q-25 20 -50 0 q-25 20 -50 0 q-25 20 -50 0 q-25 20 -50 0 q-25 20 -50 0 q-25 20 -50 0z" fill="#ffcf5a"/>
      <rect x="150" y="44" width="100" height="30" rx="6" fill="#b48ef0"/><text x="200" y="64" font-size="14" fill="#fff" text-anchor="middle" font-weight="bold">HOTEL</text>
      <rect y="130" width="400" height="70" fill="#e8c798"/><rect x="40" y="104" width="320" height="34" rx="8" fill="#c98a5a"/><text x="330" y="100" font-size="20">🛎️</text><text x="50" y="100" font-size="22">🪴</text>`,
    party: `<rect width="400" height="200" fill="#fff0f6"/><path d="M0 10 Q200 60 400 10" fill="none" stroke="#c9a" stroke-width="2"/>
      ${Array.from({ length: 12 }, (_, i) => { const x = 16 + i * 33, y = 10 + 50 * (1 - Math.pow((x - 200) / 200, 2)) * .9; return `<path d="M${x - 9} ${y} h18 l-9 16z" fill="${['#ff9fc1', '#ffd45c', '#8fdcc8', '#a98cf0', '#7cc6ff'][i % 5]}"/>`; }).join('')}
      <rect y="130" width="400" height="70" fill="#f3dcc5"/><rect x="120" y="104" width="160" height="36" rx="8" fill="#fff" stroke="#e8c0d0" stroke-width="3"/>
      <g transform="translate(200 70)"><rect x="-30" y="10" width="60" height="30" rx="6" fill="#ffd0de" stroke="#e57ea6" stroke-width="2"/><rect x="-30" y="10" width="60" height="9" fill="#fff"/>${[-16, 0, 16].map(x => `<rect x="${x - 2}" y="-6" width="4" height="16" fill="#7cc6ff"/><path d="M${x} -14 q4 5 0 8 q-4 -3 0 -8z" fill="#ffb43c"/>`).join('')}</g>
      ${[[50, 60, '#ff8fb8'], [340, 50, '#7cc6ff'], [370, 90, '#ffd45c']].map(([x, y, c]) => `<ellipse cx="${x}" cy="${y}" rx="16" ry="20" fill="${c}"/><path d="M${x} ${y + 20} q4 20 -4 40" stroke="#c9a" fill="none"/>`).join('')}`,
    ice: `<rect width="400" height="200" fill="#e9fbff"/><g fill="#ffd6e6">${Array.from({ length: 10 }, (_, i) => `<rect x="${i * 40}" width="20" height="40"/>`).join('')}</g><path d="M0 40 ${Array.from({ length: 10 }, (_, i) => `q10 14 20 0 q10 14 20 0`).join(' ')} V0 H0z" fill="#ff9fc1"/>
      <rect y="120" width="400" height="80" fill="#c9f0e4"/><rect x="60" y="96" width="280" height="40" rx="8" fill="#fff" stroke="#9fd8e8" stroke-width="3"/>
      ${['#ffc0d6', '#fff3b0', '#c99a75', '#b5e8a3', '#ddd3f5'].map((c, i) => `<ellipse cx="${100 + i * 50}" cy="110" rx="18" ry="10" fill="${c}"/>`).join('')}
      <g transform="translate(330 30)"><path d="M0 20 l12 36 l12 -36z" fill="#eab676"/><circle cx="12" cy="16" r="13" fill="#ffc0d6"/></g>`,
    zoo: `<rect width="400" height="200" fill="#c8ecff"/><rect y="118" width="400" height="82" fill="#b2e39e"/><circle cx="60" cy="40" r="20" fill="#ffe680"/>
      <g transform="translate(250 60)"><ellipse cx="40" cy="44" rx="44" ry="30" fill="#b9c3cf" stroke="#8792a0" stroke-width="2"/><circle cx="80" cy="30" r="22" fill="#b9c3cf" stroke="#8792a0" stroke-width="2"/><path d="M96 38 q14 20 0 40" stroke="#8792a0" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="84" cy="24" r="3" fill="#5b4040"/><ellipse cx="66" cy="30" rx="12" ry="16" fill="#a3aebb"/><rect x="10" y="64" width="12" height="20" fill="#b9c3cf"/><rect x="54" y="64" width="12" height="20" fill="#b9c3cf"/></g>
      <g transform="translate(70 90)"><circle cx="20" cy="20" r="20" fill="#fff" stroke="#5b4040" stroke-width="2"/><circle cx="4" cy="4" r="7" fill="#3d2b2b"/><circle cx="36" cy="4" r="7" fill="#3d2b2b"/><ellipse cx="12" cy="18" rx="5" ry="6" fill="#3d2b2b"/><ellipse cx="28" cy="18" rx="5" ry="6" fill="#3d2b2b"/><ellipse cx="20" cy="28" rx="3" ry="2" fill="#3d2b2b"/></g>
      <g fill="#c99a6b">${Array.from({ length: 20 }, (_, i) => `<rect x="${i * 20}" y="140" width="6" height="40"/>`).join('')}<rect y="148" width="400" height="5"/></g>`,
    train: `<rect width="400" height="200" fill="#eef4fa"/><rect y="0" width="400" height="26" fill="#cfd6de"/><rect x="40" y="34" width="150" height="34" rx="6" fill="#2d3a4a"/><text x="115" y="56" font-size="12" fill="#ffd45c" text-anchor="middle" font-weight="bold">RED LINE → ZOO</text>
      <g transform="translate(220 50)"><rect width="170" height="80" rx="16" fill="#fff" stroke="#ff6b6b" stroke-width="4"/><rect y="56" width="170" height="10" fill="#ff6b6b"/>${[0, 1, 2].map(i => `<rect x="${14 + i * 52}" y="14" width="40" height="30" rx="6" fill="#bfe6ff"/>`).join('')}</g>
      <rect y="134" width="400" height="66" fill="#d6dde6"/><rect y="134" width="400" height="8" fill="#ffd45c"/>
      <g>${[0, 1, 2, 3, 4].map(i => `<circle cx="${60 + i * 60}" cy="96" r="9" fill="${i === 2 ? '#ff6b6b' : '#fff'}" stroke="#ff6b6b" stroke-width="3"/>`).join('')}<rect x="60" y="94" width="240" height="4" fill="#ff6b6b"/></g>`,
  }[place];
  return `<svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">${svg}</svg>`;
}

/* ---------- がめん: バイト（しごと えらび） ---------- */
function screenWork(msg) {
  setArea('work');
  const st = engState();
  $('#app').innerHTML = `
    <div class="screen work">
      <header class="bar">
        <button class="iconbtn" id="back" aria-label="まちへ">🗺️</button>
        <h2>バイト＆おしゃべり</h2>
        ${walletHTML()}
      </header>
      <div class="workhead">
        <div class="wh-char bounce">${charSVG(S.partner, 'happy', S.wear)}</div>
        <div class="bubble">${msg || 'えいごで おしゃべりする おしごとだよ! どれに する?'}</div>
        <button class="btn sub" id="book">📚 フレーズずかん</button>
      </div>
      <div class="jobs">
        ${SCENES.map(sc => {
          const stars = st.stars[sc.id] || 0;
          return `<button class="job" data-id="${sc.id}"><span class="job-bg">${placeBG(sc.place)}</span>
            <span class="job-body"><span class="job-ic">${sc.icon}</span><b>${sc.job}</b><small>${sc.title}</small>
            <span class="job-stars">${[1, 2, 3].map(i => `<i class="${i <= stars ? 'on' : ''}">★</i>`).join('')}</span><span class="job-pay">${sc.pay}円〜</span></span></button>`;
        }).join('')}
      </div>
    </div>`;
  $('#back').onclick = () => screenField();
  $('#book').onclick = () => screenPhrasebook();
  $$('.job').forEach(b => b.onclick = () => { sfx('tap'); startJob(SCENES.find(s => s.id === b.dataset.id)); });
}

/* ---------- かいわ ---------- */
function startJob(sc) {
  const others = Object.keys(CHARS).filter(id => id !== S.partner);
  const npc = pick(others);
  const turns = sc.turns.filter(t => !t.needName || (kidEn() && kidKana()));
  const g = { i: 0, first: 0, total: turns.length };
  $('#app').innerHTML = `
    <div class="screen work">
      <header class="bar">
        <button class="iconbtn" id="back" aria-label="もどる">↩️</button>
        <h2>${sc.job}</h2>
        ${walletHTML()}
      </header>
      <div class="layout">
        <section class="interior talkscene">
          <div class="ts-bg">${placeBG(sc.place)}</div>
          <div class="ts-npc" id="npc">${charSVG(npc, 'happy')}</div>
          <div class="ts-me" id="me">${charSVG(S.partner, 'happy', S.wear)}</div>
          <div class="ts-say en" id="npcsay"></div>
          <div class="ts-progress" id="tsprog"></div>
        </section>
        <section class="panel" id="q"></section>
      </div>
    </div>`;
  $('#back').onclick = () => { speechSynthesis && speechSynthesis.cancel(); screenWork(); };

  const npcSay = (t) => {
    $('#npcsay').innerHTML = `<b>${t.npc}</b><small>${t.kana}</small><span class="ja hidden">${t.ja}</span>
      <span class="ts-btns"><button class="mini-btn" data-a="play">🔊</button><button class="mini-btn" data-a="slow">🐢</button><button class="mini-btn" data-a="ja">にほんご</button></span>`;
    $('#npcsay').classList.remove('pop'); void $('#npcsay').offsetWidth; $('#npcsay').classList.add('pop');
    $('#npc').classList.remove('talk'); void $('#npc').offsetWidth; $('#npc').classList.add('talk');
    $$('#npcsay .mini-btn').forEach(b => b.onclick = () => {
      if (b.dataset.a === 'ja') $('#npcsay .ja').classList.toggle('hidden');
      else speakEn(t.npc, b.dataset.a === 'slow');
    });
    setTimeout(() => speakEn(t.npc), 300);
  };

  const next = () => {
    if (g.i >= turns.length) return finishJob(sc, g, npc);
    $('#tsprog').innerHTML = turns.map((_, k) => `<span class="${k < g.i ? 'done' : k === g.i ? 'now' : ''}"></span>`).join('');
    const t = turns[g.i];
    npcSay(t);
    if (t.type === 'listen') listenTurn(t); else replyTurn(t);
  };

  function listenTurn(t) {
    let tries = 0;
    $('#q').innerHTML = `<div class="qcard">
      <div class="qhead"><span class="qtitle">👂 きいて こたえよう</span></div>
      <p class="qtext">${t.q}</p>
      <div class="choices">${shuffle(t.options).map(o => `<button class="choice" data-v="${o}">${o}</button>`).join('')}</div>
      <div class="qhint"></div></div>`;
    $$('.choice').forEach(b => b.onclick = () => {
      if (b.dataset.v === t.answer) {
        sfx('ok'); record('eng', tries === 0); if (!tries) g.first++;
        $('.qhint').innerHTML = `⭕ せいかい! 「${t.ja}」って いってたよ`;
        sparkle(b, 8); celebrate(tries === 0); $$('.choice').forEach(x => x.disabled = true);
        $('#me').innerHTML = charSVG(S.partner, 'happy', S.wear);
        setTimeout(() => { g.i++; next(); }, 1800);
      } else {
        tries++; streak = 0; sfx('ng'); b.classList.add('wrong');
        $('.qhint').innerHTML = `💡 もう いちど きいてみよう。🐢 で ゆっくり きけるよ`;
        speakEn(t.npc, true);
      }
    });
  }

  function replyTurn(t) {
    const choices = shuffle(typeof t.choices === 'function' ? t.choices() : t.choices);
    let tries = 0;
    $('#q').innerHTML = `<div class="qcard">
      <div class="qhead"><span class="qtitle">💬 なんて こたえる?</span></div>
      <div class="replies">${choices.map((c, k) => `<div class="reply" data-k="${k}">
        <button class="reply-main"><b>${c.en}</b><small>${c.kana}</small><span class="ja">${c.ja}</span></button>
        <button class="mini-btn" data-play="${k}" aria-label="きく">🔊</button></div>`).join('')}</div>
      <div class="qhint"></div></div>`;
    $$('[data-play]').forEach(b => b.onclick = () => speakEn(choices[+b.dataset.play].en));
    $$('.reply-main').forEach(b => b.onclick = () => {
      const c = choices[+b.parentNode.dataset.k];
      if (c.ok) {
        sfx('ok'); record('eng', tries === 0); if (!tries) g.first++;
        sparkle(b, 8); celebrate(tries === 0);
        setTimeout(() => repeatStep(c), 1300);
      } else {
        tries++; streak = 0; sfx('ng');
        b.parentNode.classList.add('wrong');
        $('#npc').innerHTML = charSVG(npc, 'normal');
        $('.qhint').innerHTML = `💡 「${c.ja}」だと へんかも? 「${t.ja}」に あう こたえを さがそう`;
      }
    });
  }

  function repeatStep(c) {
    engState().said[c.en] = (engState().said[c.en] || 0) + 1;
    save();
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    $('#q').innerHTML = `<div class="qcard repeat">
      <div class="qhead"><span class="qtitle">🗣️ まねして いってみよう!</span></div>
      <div class="say-big"><b>${c.en}</b><small>${c.kana}</small><span class="ja">${c.ja}</span></div>
      <div class="row"><button class="btn sub" id="p1">🔊 きく</button><button class="btn sub" id="p2">🐢 ゆっくり</button>${Rec ? '<button class="btn pink" id="mic">🎤 マイクで いう</button>' : ''}</div>
      <div class="qhint"></div>
      <div class="row"><button class="btn ok" id="said">いえた!</button></div></div>`;
    speakEn(c.en);
    $('#p1').onclick = () => speakEn(c.en);
    $('#p2').onclick = () => speakEn(c.en, true);
    $('#me').innerHTML = charSVG(S.partner, 'happy', S.wear);
    $('#me').classList.remove('talk'); void $('#me').offsetWidth; $('#me').classList.add('talk');
    if (Rec) $('#mic').onclick = () => listenMic(Rec, c.en, $('.qhint'));
    $('#said').onclick = () => {
      sfx('coin');
      $('#npcsay').innerHTML = `<b>${pick(['Great!', 'Good job!', 'Wonderful!', 'Nice!'])}</b><small>${pick(['すごい!', 'じょうず!', 'ばっちり!'])}</small>`;
      g.i++;
      setTimeout(next, 700);
    };
  }

  next();
}

// マイクで いえたか しらべる（ネットが ないと つかえないことが ある）
function listenMic(Rec, target, out) {
  let r;
  try { r = new Rec(); } catch (e) { out.innerHTML = 'マイクが つかえないみたい。「いえた!」を おしてね'; return; }
  r.lang = 'en-US';
  r.interimResults = false;
  r.maxAlternatives = 3;
  out.innerHTML = '🎤 きいてるよ… いってみて!';
  const norm = (s) => s.toLowerCase().replace(/[^a-z' ]/g, ' ').split(/\s+/).filter(Boolean);
  r.onresult = (e) => {
    const want = norm(target);
    let best = 0;
    for (const alt of e.results[0]) {
      const got = norm(alt.transcript);
      const hit = want.filter(w => got.includes(w)).length / want.length;
      best = Math.max(best, hit);
    }
    if (best >= 0.6) { sfx('ok'); out.innerHTML = `🌟 じょうず! ちゃんと きこえたよ! (${Math.round(best * 100)}点)`; sparkle(out, 12); }
    else out.innerHTML = `もう すこし! 🔊 で きいてから もう いちど いってみよう`;
  };
  r.onerror = () => { out.innerHTML = 'うまく きこえなかったみたい。「いえた!」で すすめるよ'; };
  try { r.start(); } catch (e) { out.innerHTML = 'マイクが つかえないみたい。「いえた!」を おしてね'; }
}

function finishJob(sc, g, npc) {
  const ratio = g.first / g.total;
  const stars = ratio >= 0.99 ? 3 : ratio >= 0.6 ? 2 : 1;
  const st = engState();
  st.stars[sc.id] = Math.max(st.stars[sc.id] || 0, stars);
  const pay = sc.pay + g.first * 5;
  S.money += pay;
  save();
  addXP(3 + stars);
  sfx('fanfare');
  speakEn('Thank you! Great job!');
  $('#npcsay').innerHTML = `<b>Thank you! Great job!</b><small>サンキュー! グレイト ジョブ!</small>`;
  $('#npc').innerHTML = charSVG(npc, 'happy');
  $('#npc').classList.add('jump');
  $('#q').innerHTML = `<div class="qcard done">
    <div class="bigstars">${[1, 2, 3].map(i => `<i class="${i <= stars ? 'on' : ''}">★</i>`).join('')}</div>
    <h3>おしごと かんりょう!</h3>
    <p class="pay">おきゅうりょう <b>${pay}円</b> 🪙</p>
    <p class="muted">いっかいで わかった: ${g.first} / ${g.total}</p>
    <div class="row"><button class="btn ok" id="again">もう いっかい</button><button class="btn sub" id="list">ほかの おしごと</button></div></div>`;
  sparkle($('.bigstars'), 20);
  bumpWallet();
  $('#again').onclick = () => startJob(sc);
  $('#list').onclick = () => screenWork('おつかれさま! つぎは どれに する?');
}

/* ---------- フレーズずかん ---------- */
function screenPhrasebook() {
  setArea('work');
  const st = engState();
  const lines = (sc) => sc.turns.flatMap(t => {
    const npc = [{ en: t.npc, kana: t.kana, ja: t.ja, who: 'おきゃくさん' }];
    if (t.type === 'listen') return npc;
    const ch = (typeof t.choices === 'function' ? (kidEn() ? t.choices() : []) : t.choices).filter(c => c.ok);
    return [...npc, ...ch.map(c => ({ ...c, who: 'わたし' }))];
  });
  $('#app').innerHTML = `
    <div class="screen work">
      <header class="bar">
        <button class="iconbtn" id="back" aria-label="もどる">↩️</button>
        <h2>フレーズずかん</h2>
        ${walletHTML()}
      </header>
      <p class="muted center">タップすると えいごが きけるよ。✓ は まねして いえた フレーズ</p>
      <div class="book">
        ${SCENES.map(sc => `<section class="booksec"><h3>${sc.icon} ${sc.title}</h3>
          ${lines(sc).map(l => `<button class="phrase ${l.who === 'わたし' ? 'mine' : ''}" data-en="${l.en.replace(/"/g, '&quot;')}">
            <span class="who">${l.who}</span><b>${l.en}</b><small>${l.kana}</small><span class="ja">${l.ja}</span>${st.said[l.en] ? '<span class="ok">✓</span>' : ''}</button>`).join('')}
        </section>`).join('')}
      </div>
    </div>`;
  $('#back').onclick = () => screenWork();
  $$('.phrase').forEach(b => b.onclick = () => speakEn(b.dataset.en));
}
