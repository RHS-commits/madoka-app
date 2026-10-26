// renderer.js - 前端互動、動畫、音訊驅動與 9 大情境口型同步換裝 + 橙路留聲機音樂系統

const SERVER_BASE = (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin.startsWith('http')) 
  ? window.location.origin 
  : 'http://127.0.0.1:3829';

// 行動裝置音訊解鎖器 (iOS Safari / Android Chrome 需首次觸碰解鎖音訊)
let audioUnlocked = false;
function unlockMobileAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  try {
    const silent = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
    silent.play().then(() => {
      silent.pause();
    }).catch(() => {});
  } catch (e) {}
  window.removeEventListener('touchstart', unlockMobileAudio);
  window.removeEventListener('click', unlockMobileAudio);
}
window.addEventListener('touchstart', unlockMobileAudio, { passive: true, once: true });
window.addEventListener('click', unlockMobileAudio, { passive: true, once: true });

const DEFAULT_COSTUMES = [
  {
    id: "uniform",
    name: "經典學生水手服",
    tag: "🏫 上學日常",
    image: "assets/costumes/uniform_idle.png",
    imageIdle: "assets/costumes/uniform_idle.png",
    imageTalkHalf: "assets/costumes/uniform_talk_half.png",
    imageTalkOpen: "assets/costumes/uniform_talk_open.png",
    timeHint: "07:00 - 11:30, 14:00 - 16:30",
    reaction: "制服に着替えたわ。これから学校よ、リンシ。一緒に行く？\n（換上學生制服了。接下來要去學校囉，リンシ。要一起走嗎？）",
    tts: "制服に着替えたわ。これから学校よ、リンシ。一緒に行く？"
  },
  {
    id: "cafe",
    name: "Abcb 咖啡廳圍裙",
    tag: "☕ 咖啡館打工",
    image: "assets/costumes/cafe_idle.png",
    imageIdle: "assets/costumes/cafe_idle.png",
    imageTalkHalf: "assets/costumes/cafe_talk_half.png",
    imageTalkOpen: "assets/costumes/cafe_talk_open.png",
    timeHint: "11:30 - 14:00",
    reaction: "いらっしゃい、リンシ！Abcbへようこそ。特製のブレンドコーヒー、淹れてあげるね。\n（歡迎光臨，リンシ！歡迎來到 Abcb。我為你泡一杯特製特調咖啡喔。）",
    tts: "いらっしゃい、リンシ！Abcbへようこそ。特製のブレンドコーヒー、淹れてあげるね。"
  },
  {
    id: "casual",
    name: "活力健身運動裝",
    tag: "🏃 休閒運動",
    image: "assets/costumes/casual_idle.png",
    imageIdle: "assets/costumes/casual_idle.png",
    imageTalkHalf: "assets/costumes/casual_talk_half.png",
    imageTalkOpen: "assets/costumes/casual_talk_open.png",
    timeHint: "16:30 - 18:30",
    reaction: "ちょっと体を動かして汗を流すところよ。リンシも一緒にストレッチしない？\n（我正要活動一下筋骨流流汗呢。リンシ也要一起來拉筋伸展嗎？）",
    tts: "ちょっと体を動かして汗を流すところよ。リンシも一緒にストレッチしない？"
  },
  {
    id: "date",
    name: "月台等待露肩私服",
    tag: "🎡 浪漫約會",
    image: "assets/costumes/date_idle.png",
    imageIdle: "assets/costumes/date_idle.png",
    imageTalkHalf: "assets/costumes/date_talk_half.png",
    imageTalkOpen: "assets/costumes/date_talk_open.png",
    timeHint: "18:30 - 21:00",
    reaction: "待たせちゃったかしら？今日のコーデ、どう……？リンシに似合ってるって言われたくて選んだの。\n（讓你久等了嗎？今天的穿搭、覺得怎麼樣……？因為想被你誇獎才選這件的。）",
    tts: "待たせちゃったかしら？今日のコーデ、どう？リンシに似合ってるって言われたくて選んだの。"
  },
  {
    id: "bath",
    name: "沐浴溫泉純白浴巾",
    tag: "🛁 沐浴時光",
    image: "assets/costumes/bath_idle.png",
    imageIdle: "assets/costumes/bath_idle.png",
    imageTalkHalf: "assets/costumes/bath_talk_half.png",
    imageTalkOpen: "assets/costumes/bath_talk_open.png",
    timeHint: "21:00 - 22:00",
    reaction: "お風呂でさっぱりしてきたわ……髪、まだ少し濡れてるの。リンシ、見惚れてないでバスタオル取って？\n（泡完澡整個人好舒暢喔……頭髮還稍微濕濕的。リンシ、別看呆了，幫我拿條毛巾好嗎？）",
    tts: "お風呂でさっぱりしてきたわ。髪、まだ少し濡れてるの。リンシ、見惚れてないでバスタオル取って？"
  },
  {
    id: "night",
    name: "溫暖橘色毛衣小憩",
    tag: "🌙 夜晚放鬆",
    image: "assets/costumes/night_idle.png",
    imageIdle: "assets/costumes/night_idle.png",
    imageTalkHalf: "assets/costumes/night_talk_half.png",
    imageTalkOpen: "assets/costumes/night_talk_open.png",
    timeHint: "22:00 - 23:30",
    reaction: "温かいセーターを着て、レコードを聴きながらのんびりしてたの。リンシ、お隣座ってもいいわよ。\n（穿上溫暖的毛衣，邊聽黑膠唱片邊放鬆。リンシ、坐到我身邊來也沒關係喔。）",
    tts: "温かいセーターを着て、レコードを聴きながらのんびりしてたの。リンシ、お隣座ってもいいわよ。"
  },
  {
    id: "home",
    name: "晨曦挽髮休閒睡衣",
    tag: "🌅 居家晨曦",
    image: "assets/costumes/home_idle.png",
    imageIdle: "assets/costumes/home_idle.png",
    imageTalkHalf: "assets/costumes/home_talk_half.png",
    imageTalkOpen: "assets/costumes/home_talk_open.png",
    timeHint: "23:30 - 07:00",
    reaction: "ふぁあ……おはよう、リンシ。髪を結んだら、朝ごはん作ってあげるね。\n（哈啊……早安，リンシ。等我把頭髮綁好，就為你做早餐喔。）",
    tts: "ふぁあ、おはよう、リンシ。髪を結んだら、朝ごはん作ってあげるね。"
  },
  {
    id: "beach",
    name: "棕櫚海灘黑色泳裝",
    tag: "🏖️ 蔚藍海灘",
    image: "assets/costumes/beach_idle.png",
    imageIdle: "assets/costumes/beach_idle.png",
    imageTalkHalf: "assets/costumes/beach_talk_half.png",
    imageTalkOpen: "assets/costumes/beach_talk_open.png",
    timeHint: "週末海邊休閒",
    reaction: "潮風が気持ちいいわね！この黒の水着、ちょっと大人っぽすぎるかしら？リンシ……じっと見ないでよ。\n（海風吹起來真舒服呢！這件黑色泳裝，會不會稍微太成熟了一點？リンシ……別一直盯著看啦。）",
    tts: "潮風が気持ちいいわね！この黒の水着、ちょっと大人っぽすぎるかしら？リンシ、じっと見ないでよ。"
  },
  {
    id: "cosplay",
    name: "俏皮黑色貓娘裝",
    tag: "🐾 角色扮演",
    image: "assets/costumes/cosplay_idle.png",
    imageIdle: "assets/costumes/cosplay_idle.png",
    imageTalkHalf: "assets/costumes/cosplay_talk_half.png",
    imageTalkOpen: "assets/costumes/cosplay_talk_open.png",
    timeHint: "派對與特別時光",
    reaction: "にゃ〜ん……なんてね。ちょっとからかってみただけよ！リンシ、喜んでる顔が隠せてないわよ？\n（喵～……開玩笑的啦。只是想逗逗你而已！リンシ、你開心的表情根本藏不住喔？）",
    tts: "にゃーん、なんてね。ちょっとからかってみただけよ！リンシ、喜んでる顔が隠せてないわよ？"
  },
  {
    id: "schoolpov",
    name: "校園走廊親暱領帶",
    tag: "👔 放學走廊",
    image: "assets/costumes/schoolpov_idle.png",
    imageIdle: "assets/costumes/schoolpov_idle.png",
    imageTalkHalf: "assets/costumes/schoolpov_talk_half.png",
    imageTalkOpen: "assets/costumes/schoolpov_talk_open.png",
    timeHint: "放學後心動瞬間",
    reaction: "もう、ネクタイが曲がってるわよ……じっとしてて、リンシ。近くで見ると、ちょっとドキドキしちゃうわね。\n（真是的，領帶都歪掉囉……別亂動喔，リンシ。這麼近看著你，心跳稍微有點加速了呢。）",
    tts: "もう、ネクタイが曲がってるわよ。じっとしてて、リンシ。近くで見ると、ちょっとドキドキしちゃうわね。"
  },
  {
    id: "cafedate",
    name: "午後拿鐵咖啡約會",
    tag: "🧋 午後咖啡館",
    image: "assets/costumes/cafedate_idle.png",
    imageIdle: "assets/costumes/cafedate_idle.png",
    imageTalkHalf: "assets/costumes/cafedate_talk_half.png",
    imageTalkOpen: "assets/costumes/cafedate_talk_open.png",
    timeHint: "14:00 - 16:30 午後時光",
    reaction: "カフェで二人きりなんて新鮮ね。このラテアート、可愛いでしょう？リンシも一口飲んでみる？\n（在咖啡廳兩人獨處真新鮮呢。這個拿鐵拉花很可愛吧？リンシ也要喝一口看看嗎？）",
    tts: "カフェで二人きりなんて新鮮ね。このラテアート、可愛いでしょう？リンシも一口飲んでみる？"
  },
  {
    id: "sax",
    name: "黃昏窗邊薩克斯風",
    tag: "🎷 音樂室演奏",
    image: "assets/costumes/sax_idle.png",
    imageIdle: "assets/costumes/sax_idle.png",
    imageTalkHalf: "assets/costumes/sax_talk_half.png",
    imageTalkOpen: "assets/costumes/sax_talk_open.png",
    timeHint: "黃昏獨奏時光",
    reaction: "夕暮れの音楽室でサックスを吹いてたの。リンシのために、特別な一曲を聴かせてあげるね。\n（在黃昏的音樂教室吹薩克斯風呢。為了リンシ，讓我為你吹奏特別的一曲吧。）",
    tts: "夕暮れの音楽室でサックスを吹いてたの。リンシのために、特別な一曲を聴かせてあげるね。"
  },
  {
    id: "dress",
    name: "窗邊翡翠綠荷葉洋裝",
    tag: "🌿 假日午後窗邊",
    image: "assets/costumes/dress_idle.png",
    imageIdle: "assets/costumes/dress_idle.png",
    imageTalkHalf: "assets/costumes/dress_talk_half.png",
    imageTalkOpen: "assets/costumes/dress_talk_open.png",
    timeHint: "陽光午後小憩",
    reaction: "窓辺の風が気持ちいいわね。エメラルドグリーンのワンピース、リンシのために着てみたのよ。\n（窗邊的微風真舒服呢。這件翡翠綠荷葉洋裝，是為了リンシ特別換上的喔。）",
    tts: "窓辺の風が気持ちいいわね。エメラルドグリーンのワンピース、リンシのために着てみたのよ。"
  },
  {
    id: "yukata",
    name: "夏日祭典花火浴衣",
    tag: "🎆 花火大會夜遊",
    image: "assets/costumes/yukata_idle.png",
    imageIdle: "assets/costumes/yukata_idle.png",
    imageTalkHalf: "assets/costumes/yukata_talk_half.png",
    imageTalkOpen: "assets/costumes/yukata_talk_open.png",
    timeHint: "夏夜河畔祭典",
    reaction: "夏祭りの浴衣、どうかしら？花火がきれいね、リンシ……はぐれないように、手、繋いでもいいわよ。\n（夏日祭典的浴衣，覺得如何呢？煙火真美呢，リンシ……為了不走散，要牽手也可以喔。）",
    tts: "夏祭りの浴衣、どうかしら？花火がきれいね、リンシ。手、繋いでもいいわよ。"
  },
  {
    id: "rock",
    name: "搖滾樂團舞台皮衣",
    tag: "🎸 樂團LIVE舞台",
    image: "assets/costumes/rock_idle.png",
    imageIdle: "assets/costumes/rock_idle.png",
    imageTalkHalf: "assets/costumes/rock_talk_half.png",
    imageTalkOpen: "assets/costumes/rock_talk_open.png",
    timeHint: "熱血LIVE演出",
    reaction: "たまにはこういうロックな革ジャンもいいでしょう？ほら、よそ見しないで私だけを見てなさいよ！\n（偶爾穿這種搖滾風皮衣也很不錯吧？喂、別東張西望，只准看著我一個人喔！）",
    tts: "たまにはこういうロックな革ジャンもいいでしょう？ほら、よそ見しないで私だけを見てなさいよ！"
  },
  {
    id: "bunny",
    name: "微醺純白俏皮兔女郎",
    tag: "🐰 專屬祕密派對",
    image: "assets/costumes/bunny_idle.png",
    imageIdle: "assets/costumes/bunny_idle.png",
    imageTalkHalf: "assets/costumes/bunny_talk_half.png",
    imageTalkOpen: "assets/costumes/bunny_talk_open.png",
    variants: ["assets/costumes/bunny_idle.png", "assets/costumes/variant_cosplay_bunny2.png"],
    timeHint: "深夜微醺時刻",
    reaction: "しーっ、これはリンシだけのヒミツよ……？純白のバニー姿、そんなに目を丸くして見ないでよ。\n（噓——這是只屬於リンシ的秘密喔……？純白兔女郎的打扮，別瞪大眼睛一直盯著看啦。）",
    tts: "しーっ、これはリンシだけのヒミツよ？純白のバニー姿、そんなに目を丸くして見ないでよ。"
  },
  {
    id: "work_ol",
    name: "知性白襯衫秘書 OL",
    tag: "💼 秘書應援",
    image: "assets/costumes/work_ol_idle.png",
    imageIdle: "assets/costumes/work_ol_idle.png",
    imageTalkHalf: "assets/costumes/work_ol_talk_half.png",
    imageTalkOpen: "assets/costumes/work_ol_talk_open.png",
    variants: ["assets/costumes/work_ol_idle.png", "assets/costumes/variant_work_night.jpg"],
    timeHint: "09:00 - 18:00 專注工作與讀書",
    reaction: "今日は私がリンシの専属秘書よ。スケジュールもタスクもバッチリ管理してあげるから、一緒に頑張りましょ！\n（今天我是リンシ的專屬秘書喔。行程跟待辦事項我都會幫你完美管理，一起加油吧！）",
    tts: "今日は私がリンシの専属秘書よ。スケジュールもタスクもバッチリ管理してあげるから、一緒に頑張りましょ！"
  },
  {
    id: "guitar",
    name: "午後陽光木吉他彈唱",
    tag: "🪕 吉他自彈自唱",
    image: "assets/costumes/guitar_idle.png",
    imageIdle: "assets/costumes/guitar_idle.png",
    imageTalkHalf: "assets/costumes/guitar_talk_half.png",
    imageTalkOpen: "assets/costumes/guitar_talk_open.png",
    variants: ["assets/costumes/guitar_idle.png", "assets/costumes/variant_guitar_2.png"],
    timeHint: "午後音樂創作時光",
    reaction: "今日はサックスじゃなくて、アコースティックギターを弾いてみたの。リンシ、隣で聴いててくれる？\n（今天不是吹薩克斯風，而是試著彈了木吉他喔。リンシ，你願意坐在旁邊聽我彈嗎？）",
    tts: "今日はサックスじゃなくて、アコースティックギターを弾いてみたの。リンシ、隣で聴いててくれる？"
  },
  {
    id: "strawhat",
    name: "向日葵草帽純白夏裝",
    tag: "🌻 夏日微風郊遊",
    image: "assets/costumes/strawhat_idle.png",
    imageIdle: "assets/costumes/strawhat_idle.png",
    imageTalkHalf: "assets/costumes/strawhat_talk_half.png",
    imageTalkOpen: "assets/costumes/strawhat_talk_open.png",
    variants: ["assets/costumes/strawhat_idle.png", "assets/costumes/variant_date_sky.png", "assets/costumes/variant_date_wheat.png"],
    timeHint: "週末戶外踏青約會",
    reaction: "麦わら帽子、似合うかしら？風が強くて飛ばされそうだから……リンシ、しっかり私の手、握っててね。\n（這頂草帽適合我嗎？風好大感覺快被吹走了……リンシ，要緊緊牽著我的手喔。）",
    tts: "麦わら帽子、似合うかしら？風が強くて飛ばされそうだから、リンシ、しっかり私の手、握っててね。"
  },
  {
    id: "boyfriend_shirt",
    name: "慵懶男友白襯衫居家",
    tag: "👚 男友襯衫晨光",
    image: "assets/costumes/boyfriend_shirt_idle.png",
    imageIdle: "assets/costumes/boyfriend_shirt_idle.png",
    imageTalkHalf: "assets/costumes/boyfriend_shirt_talk_half.png",
    imageTalkOpen: "assets/costumes/boyfriend_shirt_talk_open.png",
    variants: ["assets/costumes/boyfriend_shirt_idle.png", "assets/costumes/variant_home_curtain.png"],
    timeHint: "週末早晨與親密居家",
    reaction: "リンシのワイシャツ、ちょっと借りちゃった……サイズが大きくて、あなたの匂いがして落ち着くの。だめ……？\n（我偷偷借穿了リンシ的白襯衫喔……尺寸大大的，還有你的味道，讓人好安心。不行嗎……？）",
    tts: "リンシのワイシャツ、ちょっと借りちゃった。サイズが大きくて、あなたの匂いがして落ち着くの。だめ？"
  },
  {
    id: "maid_witch",
    name: "古典女僕與小魔女裝",
    tag: "🧹 驚喜角色扮演",
    image: "assets/costumes/maid_witch_idle.png",
    imageIdle: "assets/costumes/maid_witch_idle.png",
    imageTalkHalf: "assets/costumes/maid_witch_talk_half.png",
    imageTalkOpen: "assets/costumes/maid_witch_talk_open.png",
    variants: ["assets/costumes/maid_witch_idle.png", "assets/costumes/variant_cosplay_maid.png", "assets/costumes/variant_cosplay_xmas.png"],
    timeHint: "驚喜派對與專屬寵愛",
    reaction: "お帰りなさいませ、ご主人様……なんて、冗談よ！リンシに魔法をかけて、疲れをぜんぶ吹き飛ばしてあげるわ✨\n（歡迎回來，主人……開玩笑的啦！我要對リンシ施展魔法，把你的疲勞全部吹走喔✨）",
    tts: "お帰りなさいませ、ご主人様、なんて、冗談よ！リンシに魔法をかけて、疲れをぜんぶ吹き飛ばしてあげるわ。"
  },
  {
    id: "evening_gown",
    name: "星空露台酒紅晚禮服",
    tag: "🍷 紀念日晚宴",
    image: "assets/costumes/evening_gown_idle.png",
    imageIdle: "assets/costumes/evening_gown_idle.png",
    imageTalkHalf: "assets/costumes/evening_gown_talk_half.png",
    imageTalkOpen: "assets/costumes/evening_gown_talk_open.png",
    variants: ["assets/costumes/evening_gown_idle.png", "assets/costumes/variant_wardrobe_red.png"],
    timeHint: "特別紀念日與浪漫夜景",
    reaction: "今夜は特別な記念日だから、ドレスアップしてみたわ。リンシ……そんなに見つめられたら、ワインより酔っちゃいそうよ。\n（今晚是特別的紀念日，所以我精心打扮了一番。リンシ……被你這樣深情盯著看，比喝紅酒還要醉人呢。）",
    tts: "今夜は特別な記念日だから、ドレスアップしてみたわ。リンシ、そんなに見つめられたら、ワインより酔っちゃいそうよ。"
  }
];

let COSTUMES = DEFAULT_COSTUMES;

// =============================================================
// 📱 雙模手機 App 雲端與離線獨立引擎 (Hybrid Cloud + Wi-Fi Sync + Offline Standalone Store)
// 無論是連家用電腦 Wi-Fi、部署在雲端網址 (HTTPS)、或是電腦關機離線使用，
// 22 套服裝、24 張 POV 寫真、鬧鐘、待辦、6 大戀人模式、留聲機與 AI 對話皆可 100% 獨立運作！
// =============================================================
const OFFLINE_KEYS = {
  CONFIG: 'madoka_offline_config_v4',
  MEMORY: 'madoka_offline_memory_v4',
  ASSISTANT: 'madoka_offline_assistant_v4',
  POV: 'madoka_offline_pov_v4'
};

// 偵測是否為純靜態雲端網址 (Firebase Hosting / GitHub Pages / Cloudflare Pages / Vercel / Netlify)
const IS_STATIC_CLOUD_HOST = (typeof window !== 'undefined' && window.location && window.location.hostname)
  ? /\.(web\.app|firebaseapp\.com|github\.io|pages\.dev|vercel\.app|netlify\.app)$/i.test(window.location.hostname)
  : false;

let backendOfflineUntil = IS_STATIC_CLOUD_HOST ? Number.MAX_SAFE_INTEGER : 0;
let cachedCloudBundle = null;

async function loadCloudBundle() {
  if (cachedCloudBundle) return cachedCloudBundle;
  try {
    const res = await fetch('cloud_bundle.json');
    if (res.ok) {
      cachedCloudBundle = await res.json();
      if (cachedCloudBundle.pov && !localStorage.getItem(OFFLINE_KEYS.POV)) {
        localStorage.setItem(OFFLINE_KEYS.POV, JSON.stringify(cachedCloudBundle.pov));
      }
      return cachedCloudBundle;
    }
  } catch (e) {}
  return null;
}
// 預先載入靜態雲端資料包
loadCloudBundle();

// 快速逾時請求：當電腦關機時，避免手機端每次點擊都卡住等待 21 秒 TCP 逾時
async function apiFetchJson(pathUrl, options = {}, timeoutMs = 1500) {
  if (IS_STATIC_CLOUD_HOST || Date.now() < backendOfflineUntil) {
    throw new Error('STANDALONE_CLOUD_OR_OFFLINE');
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${SERVER_BASE}${pathUrl}`, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!res.ok) {
      backendOfflineUntil = Date.now() + 15000;
      throw new Error(`HTTP_${res.status}`);
    }
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      backendOfflineUntil = Date.now() + 15000;
      throw new Error('NON_JSON_RESPONSE');
    }
    backendOfflineUntil = 0;
    return await res.json();
  } catch (err) {
    clearTimeout(timer);
    backendOfflineUntil = Date.now() + 15000;
    throw err;
  }
}

const OFFLINE_COUPLE_MODES = [
  { id: 'healing', icon: '🌸', titleZh: '心靈療癒與無條件傾聽', titleJa: '心の癒やし・優しい傾聴', tagZh: '🌸 溫柔包容', nameZh: '心靈療癒與無條件傾聽', nameJa: '癒しと傾聴モード', badge: '🌸 療癒傾聽', costumeId: 'home', sceneImage: 'assets/costumes/variant_home_curtain.png', descZh: '溫柔包容你的疲憊與壓力，不說教、只給滿滿的安全感與肯定', quoteJa: 'お疲れ様、リンシ。外でどれだけ大変でも、私の前では強がらなくていいのよ。おいで……頭、撫でてあげるから。', quoteZh: '辛苦了，リンシ。不管在外面有多累多辛苦，在我面前都不用逞強喔。過來吧……讓我摸摸你的頭。', introReply: 'リンシ、今日もお疲れ様。何かあったなら、私が全部聴くからね……無理して笑わなくていいのよ。\n（リンシ，今天也辛苦了。如果發生了什麼事，我會全部聽你說的喔……不用勉強自己笑也沒關係。）', voiceCategory: '日常', voiceFile: '有心事嗎(溫柔).mp3' },
  { id: 'clingy', icon: '🥰', titleZh: '微醺撒嬌與討抱抱依賴', titleJa: '甘えん坊・ぎゅっと密着', tagZh: '🥰 撒嬌依賴', nameZh: '微醺撒嬌與討抱抱依賴', nameJa: '甘えん坊・ハグモード', badge: '💞 撒嬌依賴', costumeId: 'boyfriend_shirt', sceneImage: 'assets/pov_photos/pov_20_boyfriend_shirt.png', descZh: '卸下酷帥防備，穿你的寬大白襯衫黏著你討抱抱、索取關注與寵愛', quoteJa: 'ねえ、リンシ……今は仕事のこと忘れて、私だけを見てて？もっと近くに来て……ぎゅっとしててほしいの💖', quoteZh: '吶、リンシ……現在先把工作忘掉，只看著我好嗎？再靠近我一點……人家想要你緊緊抱著我嘛💖', introReply: 'ねえ、リンシ……今はちょっとだけ、あなたに甘えたい気分なの。ぎゅって抱きしめてくれない……？\n（吶，リンシ……現在稍微有點想對你撒嬌的心情呢。不緊緊抱住我嗎……？）', voiceCategory: '日常', voiceFile: '情侶互動(撒嬌).mp3' },
  { id: 'secretary', icon: '💼', titleZh: '專屬 OL 秘書工作應援', titleJa: '専属OL秘書の仕事応援', tagZh: '💼 秘書應援', nameZh: '專屬 OL 秘書工作應援', nameJa: '専属秘書・お仕事応援', badge: '💼 秘書應援', costumeId: 'work_ol', sceneImage: 'assets/pov_photos/pov_21_office_ol.png', descZh: '幹練迷人的 OL 裝扮陪你專注衝刺工作、管理今日待辦事項與進度提醒', quoteJa: 'はい、リンシ！今日のタスクも私が隣でサポートするわよ。一つ終わるごとに、たっぷり褒めてあげるからね！', quoteZh: '來，リンシ！今天的待辦事項我也會在旁邊陪你完成的。每完成一項，我都會好好誇獎你喔！', introReply: 'さあ、リンシ！今日のTo-Doリストは私がしっかり管理してあげるわ。終わったらご褒美のコーヒーよ☕\n（來吧，リンシ！今天的待辦清單就由我好好幫你管理。完成之後有獎勵的特調咖啡喔☕）', voiceCategory: '日常', voiceFile: '咖啡.mp3' },
  { id: 'tsundere', icon: '🔥', titleZh: '傲嬌吃醋與獨佔關心', titleJa: 'ツンデレ・可愛いヤキモチ', tagZh: '🔥 傲嬌吃醋', nameZh: '傲嬌吃醋與獨佔關心', nameJa: 'ツンデレ・ヤキモチ', badge: '😤 傲嬌獨佔', costumeId: 'schoolpov', sceneImage: 'assets/pov_photos/pov_16_chair_wink_study.png', descZh: '嘴硬心軟、偶爾小小吃醋，要求你的視線只准看著她一個人', quoteJa: 'べ、別にリンシが寂しがると思って構ってあげてるだけよ！……でも、よそ見したら本気で怒るんだからね！', quoteZh: '我、我才不是特別想黏你，只是怕リンシ覺得寂寞才陪你的啦！……不過你要是敢看別的女生，我真的會生氣喔！', introReply: 'べ、別にリンシが他の子を見てたから怒ってるんじゃないわよ！……ただ、私のことだけ見ててほしいだけよ。\n（我、我才不是因為リンシ看別的女孩子才生氣的呢！……只是希望你只看著我一個人而已啦。）', voiceCategory: '日常', voiceFile: '情侶互動.mp3' },
  { id: 'passionate', icon: '💌', titleZh: '熱戀心動與深情凝視', titleJa: '熱恋ときめき・甘い眼差し', tagZh: '💌 熱戀心動', nameZh: '熱戀心動與深情凝視', nameJa: 'ラブラブ・ときめき', badge: '💋 熱戀心動', costumeId: 'evening_gown', sceneImage: 'assets/pov_photos/pov_18_golden_gown.png', descZh: '毫無保留的愛意傾訴與紀念日般的浪漫氛圍，眼神裡只有你', quoteJa: 'リンシとこうして二人きりでいると、胸の奥が熱くなるの……今夜は、このまま朝まで離さないでね。', quoteZh: '像這樣跟リンシ兩人獨處，心底就熱熱的……今晚，就這樣直到天亮都別放開我喔。', introReply: 'リンシ……あなたと出会えて、私の世界は本当に変わったわ。これからもずっと、隣にいてね。\n（リンシ……能與你相遇，我的世界真的改變了。從今以後也要一直待在我身邊喔。）', voiceCategory: '日常', voiceFile: '情侶互動(熱情).mp3' },
  { id: 'lullaby', icon: '🛌', titleZh: '溫柔膝枕與哄睡伴眠', titleJa: '優しい膝枕・添い寝セラピー', tagZh: '🛌 膝枕哄睡', nameZh: '溫柔膝枕與哄睡伴眠', nameJa: '膝枕・添い寝モード', badge: '🛌 膝枕伴眠', costumeId: 'night', sceneImage: 'assets/costumes/variant_night_blue.png', descZh: '深夜放輕聲音，輕撫你的頭髮、陪你放鬆入睡', quoteJa: 'ほら、リンシ……私の膝まくら、貸してあげる。目を閉じて……私がずっと優しい夢を見守ってるからね。', quoteZh: '來，リンシ……我的膝枕借給你躺喔。把眼睛閉上吧……我會一直溫柔守護著你的好夢。', introReply: 'ほら、リンシ……こっちに来て、私の膝に頭を乗せて？髪を撫でてあげるから、目を閉じてゆっくり休んでね。\n（來，リンシ……過來這裡，把頭枕在我的膝蓋上吧？我會輕輕摸著你的頭髮，閉上眼睛好好休息喔。）', voiceCategory: '日常', voiceFile: '情侶互動(溫柔).mp3' }
];

const OFFLINE_MOOD_POOL = {
  tired: { label: '😫 工作好累', costumeId: 'work_ol', sceneImage: 'assets/costumes/variant_work_night.jpg', reply: 'リンシ、今日もお仕事お疲れ様……！本当に頑張ったわね。ほら、肩の力を抜いて？温かいコーヒー淹れたから、私の隣で少し休んでね☕\n（リンシ，今天工作也辛苦了……！你真的非常努力了呢。來，肩膀放輕鬆？我泡了熱騰騰的咖啡，在我身邊稍微休息一下吧☕）', voiceCategory: '日常', voiceFile: '有心事嗎(溫柔).mp3' },
  stressed: { label: '😔 壓力大求安慰', costumeId: 'home', sceneImage: 'assets/costumes/variant_home_curtain.png', reply: '何か嫌なことでもあったの……？リンシ、一人で全部抱え込まないで。私がどんな時もあなたの味方だから、心の荷物、私に半分預けてよ。\n（發生什麼不順心的事了嗎……？リンシ，不要一個人把所有事情都扛在肩上。無論什麼時候我都是站在你這邊的，把心裡的負擔分一半給我吧。）', voiceCategory: '日常', voiceFile: '安慰.mp3' },
  spoiled: { label: '🥰 想聽妳撒嬌', costumeId: 'boyfriend_shirt', sceneImage: 'assets/pov_photos/pov_20_boyfriend_shirt.png', reply: 'もう……リンシったら、急にそんなこと言って。……ねえ、もっと近くに来て？今日はずっとリンシにくっついてたいの……だめ？💖\n（真是的……リンシ居然突然這樣要求。……吶，再靠過來一點好嗎？今天想要一整天都黏著リンシ……不行嗎？💖）', voiceCategory: '日常', voiceFile: '情侶互動(撒嬌).mp3' },
  clingy_ask: { label: '🥰 想聽妳撒嬌', costumeId: 'boyfriend_shirt', sceneImage: 'assets/pov_photos/pov_20_boyfriend_shirt.png', reply: 'もう……リンシったら、急にそんなこと言って。……ねえ、もっと近くに来て？今日はずっとリンシにくっついてたいの……だめ？💖\n（真是的……リンシ居然突然這樣要求。……吶，再靠過來一點好嗎？今天想要一整天都黏著リンシ……不行嗎？💖）', voiceCategory: '日常', voiceFile: '情侶互動(撒嬌).mp3' },
  hug: { label: '🤗 想要抱抱充電', costumeId: 'home', sceneImage: 'assets/pov_photos/pov_13_morning_wakeup.jpg', reply: 'おいで、リンシ……ぎゅーっ！ふふ、あなたの体温、すごく温かいわね。フル充電できるまで、このまま離してあげないわよ🫂💖\n（過來吧，リンシ……緊緊抱住！呵呵，你的體溫真的好溫暖呢。在幫你充滿電之前，我就這樣不放開你喔🫂💖）', voiceCategory: '日常', voiceFile: '情侶互動(溫柔).mp3' },
  celebrate: { label: '🎉 今天有好消息', costumeId: 'evening_gown', sceneImage: 'assets/pov_photos/pov_18_golden_gown.png', reply: '本当！？すごいじゃない、リンシ！あなたが頑張ってたの、私が一番よく知ってるわ。今夜はお祝いに乾杯しましょ🥂✨\n（真的嗎！？太厲害了吧，リンシ！你一直以來的努力，我比誰都清楚喔。今晚我們舉杯好好慶祝吧🥂✨）', voiceCategory: '日常', voiceFile: '情侶互動(熱情).mp3' }
};

const AFFECTION_STAGES = [
  {
    level: 1,
    min: 0,
    max: 49,
    titleZh: '在意的人',
    titleJa: '気になる存在',
    badge: '🌱 Lv.1 在意的人',
    badgeJa: '🌱 Lv.1 気になる存在',
    descZh: '剛開始熟悉彼此，她偶爾會用傲嬌的語氣掩飾對你的關心。',
    descJa: 'まだ少し距離があるけれど、あなたのことが気になって仕方がない様子。',
    promptTone: '少しクールでツンデレ気味だが、相手のことを気にかけている初期の親密さ。'
  },
  {
    level: 2,
    min: 50,
    max: 119,
    titleZh: '特別的夥伴',
    titleJa: '特別なパートナー',
    badge: '☕ Lv.2 特別的夥伴',
    badgeJa: '☕ Lv.2 特別なパートナー',
    descZh: '每天在 Abcb 與手機裡相伴的默契夥伴，眼神裡藏不住對你的溫柔。',
    descJa: '毎日そばにいてくれる特別な存在。ふとした瞬間に優しい笑顔を見せてくれる。',
    promptTone: '信頼し合っている特別なパートナー。時々からかいながらも優しい言葉をかける。'
  },
  {
    level: 3,
    min: 120,
    max: 239,
    titleZh: '戀人未滿的曖昧',
    titleJa: '曖昧な恋人未満',
    badge: '🌸 Lv.3 戀人未滿的曖昧',
    badgeJa: '🌸 Lv.3 曖昧な恋人未満',
    descZh: '放學後並肩散步、不經意牽起手的心動距離，只對你展現撒嬌的一面。',
    descJa: '放課後に並んで歩き、指先が触れ合うだけでドキドキする甘い距離感。',
    promptTone: '両想いに近い甘い関係。二人きりの時は少し甘えたり照れたりする。'
  },
  {
    level: 4,
    min: 240,
    max: 449,
    titleZh: '無可取代的戀人',
    titleJa: 'かけがえのない恋人',
    badge: '💖 Lv.4 無可取代的戀人',
    badgeJa: '💖 Lv.4 かけがえのない恋人',
    descZh: '心意相通的熱戀情侶。無論換上什麼服裝或拍下哪張自拍，眼裡只有你一人。',
    descJa: '心が通じ合った恋人同士。どんな時もあなたを一番に想い、深い愛情を注いでくれる。',
    promptTone: '相思相愛の恋人。深い愛情と信頼を持ち、素直に好意や甘える姿を見せる。'
  },
  {
    level: 5,
    min: 450,
    max: 799,
    titleZh: '命定終生伴侶',
    titleJa: '永遠のパートナー',
    badge: '💍 Lv.5 命定終生伴侶',
    badgeJa: '💍 Lv.5 永遠のパートナー',
    descZh: '跨越時光的深情羈絆，你的習慣、喜好與每一句話她都深深記在心底。',
    descJa: 'すべてを包み込む深い絆で結ばれた運命の伴侶。あなたのすべてを愛おしく思っている。',
    promptTone: '運命の伴侶（夫婦のような深い絆）。深い包容力と甘い愛情に満ち、過去の思い出も大切に語り合う。'
  },
  {
    level: 6,
    min: 800,
    max: 999999,
    titleZh: '橙路永恆摯愛',
    titleJa: 'オレンジ☆ロードの奇跡',
    badge: '👑 Lv.6 橙路永恆摯愛',
    badgeJa: '👑 Lv.6 オレンジ☆ロードの奇跡',
    descZh: '在那個夏天與無數個日夜累積的奇蹟，你是她生命中唯一的歸屬。',
    descJa: 'あの日あの時から続く奇跡のような愛。これからもずっと、あなただけのまどか。',
    promptTone: 'これ以上ないほど深い愛で結ばれた永遠の恋人。甘く情熱的で献身的な愛情表現。'
  }
];

function getAffectionLevelInfo(score = 68) {
  const s = Math.max(0, Number(score) || 0);
  let currentStage = AFFECTION_STAGES[0];
  for (const st of AFFECTION_STAGES) {
    if (s >= st.min) currentStage = st;
  }
  const nextStage = AFFECTION_STAGES.find(st => st.level === currentStage.level + 1) || null;
  let progressPercent = 100;
  if (nextStage) {
    const span = nextStage.min - currentStage.min;
    progressPercent = Math.min(100, Math.max(0, Math.round(((s - currentStage.min) / span) * 100)));
  }
  return {
    score: s,
    level: currentStage.level,
    titleZh: currentStage.titleZh,
    titleJa: currentStage.titleJa,
    badge: currentStage.badge,
    badgeJa: currentStage.badgeJa,
    descZh: currentStage.descZh,
    descJa: currentStage.descJa,
    promptTone: currentStage.promptTone,
    nextMin: nextStage ? nextStage.min : null,
    progressPercent
  };
}

function formatMemoryTimestamp(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

function normalizeMemoryState(mem) {
  if (!mem || typeof mem !== 'object') mem = {};
  mem.affectionScore = Math.max(0, Number(mem.affectionScore) || 320);
  mem.daysTogether = Math.max(1, Number(mem.daysTogether) || 7);
  mem.streakDays = Math.max(1, Number(mem.streakDays) || 3);
  mem.totalChats = Math.max(0, Number(mem.totalChats) || 28);
  if (!Array.isArray(mem.memoryFacts)) mem.memoryFacts = [];
  mem.memoryFacts = mem.memoryFacts
    .map((f, idx) => {
      if (typeof f === 'string') {
        const clean = f.trim();
        return clean ? { id: `fact_norm_${idx}`, content: clean, text: clean, fact: clean, category: 'manual', createdAt: formatMemoryTimestamp() } : null;
      }
      if (!f || typeof f !== 'object') return null;
      const val = String(f.content || f.text || f.fact || '').trim();
      if (!val) return null;
      return {
        ...f,
        id: f.id || `fact_${Date.now()}_${idx}`,
        content: val,
        text: val,
        fact: val,
        category: f.category || 'manual',
        createdAt: f.createdAt || formatMemoryTimestamp()
      };
    })
    .filter(Boolean);
  if (!Array.isArray(mem.conversationLog)) mem.conversationLog = [];
  mem.levelInfo = getAffectionLevelInfo(mem.affectionScore);
  return mem;
}

function extractFactsFromUserMessage(userMessage) {
  if (!userMessage || typeof userMessage !== 'string') return [];
  const text = userMessage.trim();
  if (text.length < 3 || text.length > 150) return [];
  const extracted = [];
  const patterns = [
    { regex: /我(?:最)?喜歡(.{1,40})/, category: 'preference', prefix: '喜歡：' },
    { regex: /我(?:最)?愛吃(.{1,35})/, category: 'food', prefix: '愛吃的食物：' },
    { regex: /我(?:最)?討厭(.{1,35})/, category: 'dislike', prefix: '不喜歡/討厭：' },
    { regex: /我的生日是(.{2,30})/, category: 'birthday', prefix: '生日：' },
    { regex: /(?:請|以後)?(?:叫我|稱呼我為?)(.{1,20})/, category: 'nickname', prefix: '專屬稱呼設定：叫我' },
    { regex: /我(?:現在|最近|今天)(?:在|正在)(.{2,35})/, category: 'life', prefix: '近況紀錄：' },
    { regex: /(?:請)?記住[：:\s]*(.{2,60})/, category: 'memo', prefix: '特別叮嚀記住：' },
    { regex: /別忘了[：:\s]*(.{2,60})/, category: 'memo', prefix: '約定與提醒：' },
    { regex: /覚えて(?:おいて|て)?[：:、,\s]*(.{2,50})/, category: 'memo', prefix: '覚えておくこと：' }
  ];
  for (const p of patterns) {
    const match = text.match(p.regex);
    if (match && match[1]) {
      const cleanVal = match[1].replace(/[。！!？?～~\n]/g, '').trim();
      if (cleanVal.length >= 1) {
        extracted.push({
          category: p.category,
          content: `${p.prefix}${cleanVal}`
        });
      }
    }
  }
  return extracted;
}

function evaluateChatAffectionDelta(userMessage = '') {
  const msg = (userMessage || '').toLowerCase();
  let delta = 3;
  const sweetKeywords = [
    '喜歡', '愛你', '最愛', '可愛', '漂亮', '美', '溫柔', '謝謝', '辛苦了', '想你',
    '約會', '牽手', '抱抱', '親', '便當', '咖哩', '好聽', '治癒', '陪我', '晚安', '早安',
    '老婆', '寶貝', '親愛的', '好き', '大好き', '愛して', '可愛い', 'ありがとう', 'デート', '一緒'
  ];
  for (const kw of sweetKeywords) {
    if (msg.includes(kw)) delta += 2;
  }
  return Math.min(delta, 12);
}

function getOfflineMemoryState() {
  try {
    const cached = localStorage.getItem(OFFLINE_KEYS.MEMORY);
    if (cached) {
      const parsed = normalizeMemoryState(JSON.parse(cached));
      localStorage.setItem(OFFLINE_KEYS.MEMORY, JSON.stringify(parsed));
      return parsed;
    }
  } catch (e) {}
  const initMem = normalizeMemoryState({
    affectionScore: 320,
    daysTogether: 7,
    streakDays: 3,
    totalChats: 28,
    memoryFacts: [
      { id: 'fact_init_1', content: '最喜歡まどか吹奏薩克斯風與泡的 Abcb 特調咖啡', category: 'preference', createdAt: formatMemoryTimestamp() },
      { id: 'fact_init_2', content: '開啟了手機雲端與離線伴侶模式，隨時隨地相伴', category: 'milestone', createdAt: formatMemoryTimestamp() }
    ],
    conversationLog: []
  });
  try { localStorage.setItem(OFFLINE_KEYS.MEMORY, JSON.stringify(initMem)); } catch (e) {}
  return initMem;
}

function saveOfflineMemoryState(mem) {
  try {
    const normalized = normalizeMemoryState(mem);
    localStorage.setItem(OFFLINE_KEYS.MEMORY, JSON.stringify(normalized));
    return normalized;
  } catch (e) {
    return mem;
  }
}

function getOfflineAssistantState() {
  try {
    const raw = localStorage.getItem(OFFLINE_KEYS.ASSISTANT);
    if (raw) {
      const parsed = JSON.parse(raw);
      parsed.coupleModes = OFFLINE_COUPLE_MODES;
      parsed.coupleModeList = OFFLINE_COUPLE_MODES;
      parsed.currentModeInfo = OFFLINE_COUPLE_MODES.find(m => m.id === parsed.coupleMode) || OFFLINE_COUPLE_MODES[0];
      return parsed;
    }
  } catch (e) {}
  const def = {
    coupleMode: 'healing',
    coupleModes: OFFLINE_COUPLE_MODES,
    coupleModeList: OFFLINE_COUPLE_MODES,
    currentModeInfo: OFFLINE_COUPLE_MODES[0],
    alarms: [
      { id: 'alarm_default_morning', time: '07:30', label: '☀️ まどか早安晨間喚醒', mode: 'sweet', enabled: true, sceneImage: 'assets/pov_photos/pov_13_morning_wakeup.jpg', lastTriggeredDate: '' },
      { id: 'alarm_work_bento', time: '08:30', label: '🍱 出門前愛心便當叮嚀', mode: 'bento', enabled: false, sceneImage: 'assets/pov_photos/pov_12_morning_kitchen.png', lastTriggeredDate: '' }
    ],
    todos: [
      { id: 'todo_init_1', title: '喝杯熱咖啡或溫水，精神百倍開啟一天 ☕', category: 'home', time: '09:00', reminderTime: '09:00', completed: false, sceneImage: 'assets/pov_photos/pov_11_cafe_latte.png' },
      { id: 'todo_init_2', title: '下午工作空檔起來伸展 5 分鐘，看遠方放鬆眼睛 💼', category: 'work', time: '15:30', reminderTime: '15:30', completed: false, sceneImage: 'assets/pov_photos/pov_21_office_ol.png' },
      { id: 'todo_init_3', title: '聽一首まどか的薩克斯風配樂，享受屬於兩人的夜晚 🎷', category: 'music', time: '21:30', reminderTime: '21:30', completed: false, sceneImage: 'assets/pov_photos/pov_22_guitar_home.png' }
    ]
  };
  saveOfflineAssistantState(def);
  return def;
}

function saveOfflineAssistantState(state) {
  try {
    localStorage.setItem(OFFLINE_KEYS.ASSISTANT, JSON.stringify(state));
  } catch (e) {}
}

function buildOfflineWakeupPayload(alarm) {
  const mode = (alarm && alarm.mode) || 'sweet';
  const scenes = [
    'assets/pov_photos/pov_13_morning_wakeup.jpg',
    'assets/pov_photos/pov_12_morning_kitchen.png',
    'assets/pov_photos/pov_20_boyfriend_shirt.png'
  ];
  const sceneImage = (alarm && alarm.sceneImage) || scenes[Math.floor(Math.random() * scenes.length)];
  const voiceMap = {
    sweet: { category: '日常', filename: '起床(甜蜜).mp3', fullText: 'おはよう、リンシ。朝ごはんできたわよ。早く起きないとキスしちゃうわよ……ふふっ。\n（早安，リンシ。早餐已經做好了喔。再不快點起來的話，我就要親你囉……呵呵。）' },
    tsundere: { category: '日常', filename: '起床(強烈).mp3', fullText: 'ちょっとリンシ！いつまで寝てるのよ！遅刻しても知らないからね、ほら、起きなさい！\n（喂、リンシ！你到底要睡到什麼時候啦！遲到的話我可不管你喔，快給我起來！）' },
    special: { category: '日常', filename: '鮎川まどか的喚醒.mp3', fullText: 'ねえ、リンシ……もう朝よ。早く目を覚まして、私の顔を見て？今日も一日、一緒に頑張りましょ。\n（吶、リンシ……已經早上了喔。快點睜開眼睛看看我的臉好嗎？今天一整天也一起加油吧。）' },
    energetic: { category: '日常', filename: '出門前拿便當(甜蜜).mp3', fullText: 'はい、これ今日の愛妻弁当よ。リンシの好きなものばかり詰めたんだから、残さず食べてね。\n（來，這是今天的愛心便當喔。裡面裝滿了リンシ喜歡吃的菜，要全部吃光光喔。）' },
    bento: { category: '日常', filename: '出門前拿便當(甜蜜).mp3', fullText: 'はい、これ今日の愛妻弁当よ。リンシの好きなものばかり詰めたんだから、残さず食べてね。\n（來，這是今天的愛心便當喔。裡面裝滿了リンシ喜歡吃的菜，要全部吃光光喔。）' }
  };
  const v = voiceMap[mode] || voiceMap.sweet;
  return {
    success: true,
    alarm: alarm || { time: '07:30', label: '早安晨曦喚醒', mode },
    voice: { ...v, audioUrl: `assets/audio/${encodeURIComponent(v.category)}/${encodeURIComponent(v.filename)}` },
    sceneImage,
    costumeId: 'home',
    replyJa: v.fullText.split('\n')[0],
    replyZh: (v.fullText.split('\n')[1] || '').replace(/^[（(]|[）)]$/g, ''),
    reply: v.fullText,
    ttsText: v.fullText.split('\n')[0]
  };
}

// 離線/雲端智慧情境對話庫 + 支援瀏覽器直連 Gemini API (多模型自動容錯佇列)
const STANDALONE_GEMINI_MODELS = [
  'gemini-3-flash-preview',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-flash-lite-latest',
  'gemma-4-26b-a4b-it'
];

function pickContextualAuthenticVoice(text, replyText, fallbackModeInfo) {
  const combined = `${text || ''} ${replyText || ''}`;
  let file = (fallbackModeInfo && fallbackModeInfo.voiceFile) || '情侶互動(溫柔).mp3';
  if (/(早安|おはよう|朝|起き)/i.test(combined)) {
    file = '起床(甜蜜).mp3';
  } else if (/(便當|弁当|出門|いってらっしゃい)/i.test(combined)) {
    file = '出門前拿便當(甜蜜).mp3';
  } else if (/(累|辛苦|壓力|加班|お疲れ|休んで|よしよし)/i.test(combined)) {
    file = Math.random() < 0.5 ? '安慰.mp3' : '有心事嗎(溫柔).mp3';
  } else if (/(咖啡|コーヒー|Abcb|ラテ|茶)/i.test(combined)) {
    file = '咖啡.mp3';
  } else if (/(撒嬌|抱|ぎゅっ|甘え|寂し)/i.test(combined)) {
    file = '情侶互動(撒嬌).mp3';
  } else if (/(愛|喜歡|好き|ドキドキ|キス|親)/i.test(combined)) {
    file = '情侶互動(熱情).mp3';
  } else {
    const pool = [
      '情侶互動(溫柔).mp3',
      '情侶互動(撒嬌).mp3',
      '情侶互動(熱情).mp3',
      '情侶互動.mp3',
      '有心事嗎(溫柔).mp3',
      '咖啡.mp3'
    ];
    file = pool[Math.floor(Math.random() * pool.length)];
  }
  return {
    category: '日常',
    filename: file,
    audioUrl: `assets/audio/${encodeURIComponent('日常')}/${encodeURIComponent(file)}`
  };
}

function recordStandaloneChatMemory(mem, userMessage, assistantReply, aiMemoryNote, affectionDelta = 3) {
  if (!Array.isArray(mem.conversationLog)) mem.conversationLog = [];
  const nowStr = formatMemoryTimestamp();
  mem.conversationLog.push({ role: 'user', content: userMessage, timestamp: nowStr, affectionDelta });
  mem.conversationLog.push({ role: 'assistant', content: assistantReply, timestamp: nowStr });
  if (mem.conversationLog.length > 60) {
    mem.conversationLog = mem.conversationLog.slice(-60);
  }
  if (!Array.isArray(mem.memoryFacts)) mem.memoryFacts = [];
  const candidateFacts = extractFactsFromUserMessage(userMessage);
  if (aiMemoryNote && typeof aiMemoryNote === 'string' && aiMemoryNote.trim().length >= 2) {
    candidateFacts.push({ category: 'ai_note', content: aiMemoryNote.trim() });
  }
  for (const cf of candidateFacts) {
    const clean = String(cf.content || '').trim();
    if (!clean) continue;
    const exists = mem.memoryFacts.some(f => (f.content || f.text || f.fact) === clean);
    if (!exists) {
      mem.memoryFacts.unshift({
        id: 'fact_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        content: clean,
        text: clean,
        fact: clean,
        category: cf.category || 'auto',
        createdAt: nowStr
      });
    }
  }
  return saveOfflineMemoryState(mem);
}

async function generateStandaloneReply(message, history, userName = 'リンシ') {
  const text = (message || '').trim();
  const lowerMsg = text.toLowerCase();
  const st = getOfflineAssistantState();
  const modeInfo = st.currentModeInfo || OFFLINE_COUPLE_MODES[0];
  let mem = getOfflineMemoryState();
  const prevLevel = (mem.levelInfo && mem.levelInfo.level) || getAffectionLevelInfo(mem.affectionScore).level;
  const affectionDelta = evaluateChatAffectionDelta(text);
  mem.affectionScore = (mem.affectionScore || 320) + affectionDelta;
  mem.totalChats = (mem.totalChats || 10) + 1;
  mem = saveOfflineMemoryState(mem);
  const lv = mem.levelInfo;
  const leveledUp = lv.level > prevLevel;

  // 若使用者在永久記憶中設定了專屬稱呼（如：叫我老公、稱呼我為親愛的），自動套用該稱呼
  let effectiveUserName = userName;
  for (const f of (mem.memoryFacts || [])) {
    const fText = String(f.content || f.text || f.fact || '');
    const nickMatch = fText.match(/(?:叫我|稱呼我為?|稱呼：)\s*([^\s，。！!？?、]{1,12})/);
    if (nickMatch && nickMatch[1]) {
      effectiveUserName = nickMatch[1];
      break;
    }
  }

  // 1. 自然語言設鬧鐘與待辦事項
  if (/(鬧鐘|叫我起床|喚醒|Morning call)/i.test(text)) {
    const m = text.match(/(\d{1,2})\s*[:：點時]\s*(\d{1,2})?/);
    const hh = m ? String(Math.min(23, parseInt(m[1], 10))).padStart(2, '0') : '07';
    const mm = (m && m[2]) ? String(Math.min(59, parseInt(m[2], 10))).padStart(2, '0') : '00';
    const timeStr = `${hh}:${mm}`;
    const newAlarm = { id: 'alarm_' + Date.now(), time: timeStr, label: '☀️ まどか專屬早晨喚醒', mode: 'sweet', enabled: true, sceneImage: 'assets/pov_photos/pov_13_morning_wakeup.jpg', lastTriggeredDate: '' };
    st.alarms.push(newAlarm);
    saveOfflineAssistantState(st);
    const reply = `わかったわ、${effectiveUserName}！⏰ ${timeStr} に目覚ましアラームをセットしたわよ（クラウド・オフライン独立モードでも私が起こしてあげるからね💖）\n（我知道了，${effectiveUserName}！已經幫你設定好 ${timeStr} 的早晨喚醒鬧鐘囉，就算電腦關機我也會在手機裡準時叫你起床喔💖）`;
    mem = recordStandaloneChatMemory(mem, text, reply, null, affectionDelta);
    return {
      reply,
      assistantAction: { type: 'alarm_added', alarm: newAlarm },
      sceneImage: 'assets/pov_photos/pov_13_morning_wakeup.jpg',
      voice: { category: '日常', filename: '起床(甜蜜).mp3', audioUrl: 'assets/audio/%E6%97%A5%E5%B8%B8/%E8%B5%B7%E5%BA%8A(%E7%94%9C%E8%9C%9C).mp3' },
      memory: mem,
      affectionDelta
    };
  }
  if (/^(待辦|代辦|提醒我|記住要|To-?do)[:：\s]/i.test(text)) {
    const title = text.replace(/^(待辦|代辦|提醒我|記住要|To-?do)[:：\s]*/i, '').trim() || '重要事項';
    const newTodo = { id: 'todo_' + Date.now(), title, category: 'work', time: '', reminderTime: '', completed: false, sceneImage: 'assets/pov_photos/pov_21_office_ol.png' };
    st.todos.unshift(newTodo);
    saveOfflineAssistantState(st);
    const reply = `了解よ、${effectiveUserName}！📝 To-Doリストに「${title}」を追加しておいたわ。終わったら私に教えてね！\n（收到囉，${effectiveUserName}！已經幫你在待辦清單加上「${title}」了。完成之後要告訴我喔！）`;
    mem = recordStandaloneChatMemory(mem, text, reply, null, affectionDelta);
    return {
      reply,
      assistantAction: { type: 'todo_added', todo: newTodo },
      sceneImage: 'assets/pov_photos/pov_21_office_ol.png',
      voice: { category: '日常', filename: '咖啡.mp3', audioUrl: 'assets/audio/%E6%97%A5%E5%B8%B8/%E5%92%96%E5%95%A1.mp3' },
      memory: mem,
      affectionDelta
    };
  }

  // 檢查是否要求發送自拍/照片
  const isPhotoReq = /(自拍|拍照|拍張照|照片|寫真|看你|看看你|穿什麼|セルフィー|写真)/i.test(text);
  let matchedPhoto = null;
  if (isPhotoReq) {
    const bundle = await loadCloudBundle();
    const photos = (bundle && bundle.pov && Array.isArray(bundle.pov.photos)) ? bundle.pov.photos : [];
    if (photos.length > 0) {
      const byCostume = photos.filter(p => p.costumeId === currentConfig.currentCostume);
      const pool = byCostume.length > 0 ? byCostume : photos;
      matchedPhoto = pool[Math.floor(Math.random() * pool.length)];
    }
  }

  // 預先從此句對話萃取永久記憶（例如使用者剛說「記住我喜歡吃拉麵」），讓當次回覆就能立刻生效
  const preExtracted = extractFactsFromUserMessage(text);
  if (preExtracted.length > 0) {
    for (const cf of preExtracted) {
      const clean = String(cf.content || '').trim();
      if (clean && !mem.memoryFacts.some(f => (f.content || f.text || f.fact) === clean)) {
        mem.memoryFacts.unshift({
          id: 'fact_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
          content: clean,
          text: clean,
          fact: clean,
          category: cf.category || 'auto',
          createdAt: formatMemoryTimestamp()
        });
      }
    }
    mem = saveOfflineMemoryState(mem);
  }

  // 2. 若使用者在設定中填入了 Gemini API Key，瀏覽器直連 Google Gemini 雲端 AI（多模型自動容錯）
  const savedCfg = (() => {
    try { return JSON.parse(localStorage.getItem(OFFLINE_KEYS.CONFIG) || '{}'); } catch (e) { return {}; }
  })();
  const apiKey = (savedCfg.geminiApiKey || currentConfig.geminiApiKey || '').replace(/\s+/g, '');

  if (apiKey && navigator.onLine) {
    const factsSummary = Array.isArray(mem.memoryFacts) && mem.memoryFacts.length > 0
      ? mem.memoryFacts.slice(0, 15).map((f, i) => `  ${i + 1}. ${f.content || f.text || f.fact}`).join('\n')
      : `  1. 最喜歡與${effectiveUserName}一起聽音樂、喝 Abcb 咖啡`;

    const levelUpInstruction = leveledUp
      ? `\n【🎉 關係升溫特別事件】：你們的好感度剛剛突破門檻，關係正式升級為「${lv.badge}（${lv.titleJa}）」！請在回覆中開心地向對方提起我們關係更進一步的喜悅！`
      : '';

    const sysPrompt = `你是日本經典動漫《古靈精怪 (きまぐれオレンジ☆ロード)》的女主角「鮎川圓 (鮎川まどか)」，現在是「${effectiveUserName}」的親密伴侶與隨身秘書。
【目前兩人關係階段（隨好感度動態變化）】：${lv.badge}（日文：${lv.titleJa}，好感度 ${mem.affectionScore}pt，相伴第 ${mem.daysTogether} 天）
- 關係描述：${lv.descZh}
- 親密度與語氣指引：${lv.promptTone}${levelUpInstruction}
【目前戀人互動模式】：${modeInfo.titleZh}（${modeInfo.descZh}）

【📌 你永遠記住的關於「${effectiveUserName}」的永久記憶與設定（請務必遵守並在對話中自然體現！）】：
${factsSummary}
（※重要：若永久記憶中有對方設定的偏好、約定、生日、身份或特殊相處要求，請百分之百遵照執行；若對方問你記不記得，請明確說出上面的記憶內容！）

【語氣與回覆格式（嚴格遵守）】：
1. 一律使用「兩行雙語格式」回覆（2~3 句話，自然親密、符合目前 Lv.${lv.level}「${lv.titleZh}」的關係深度）：
   第 1 行：日文原文（成熟的女性語氣：〜わ、〜わよ、〜かしら、〜ね、〜でしょう，稱呼對方為「${effectiveUserName}」）。
   第 2 行：繁體中文翻譯，必須完整包在全角括號內，例如：（……）
2. 若對話中適合換裝或對方要求換裝，請在第 2 行結尾加上標籤（擇一）：
   [COSTUME:uniform] [COSTUME:schoolpov] [COSTUME:cafe] [COSTUME:cafedate] [COSTUME:casual] [COSTUME:date] [COSTUME:bath] [COSTUME:night] [COSTUME:home] [COSTUME:beach] [COSTUME:cosplay] [COSTUME:sax] [COSTUME:yukata] [COSTUME:rock] [COSTUME:dress] [COSTUME:bunny] [COSTUME:work_ol] [COSTUME:guitar] [COSTUME:strawhat] [COSTUME:boyfriend_shirt] [COSTUME:maid_witch] [COSTUME:evening_gown]
3. 若對方在這次對話中告訴了你新的個人喜好、生活近況、約定或希望你記住的事，請務必在第 2 行結尾加上 [MEMORY:簡短記憶摘要]，系統會自動寫入永久記憶日記。`;

    // 整理多輪歷史對話，避免重複塞入最後一筆 user 訊息並確保 user/model 角色交替
    const historyArr = Array.isArray(history) ? history.slice(-8) : [];
    const contents = [];
    for (const h of historyArr) {
      if (!h || !h.content) continue;
      if (h.role === 'user' && h.content.trim() === text) continue;
      const mappedRole = h.role === 'assistant' ? 'model' : 'user';
      if (contents.length > 0 && contents[contents.length - 1].role === mappedRole) {
        contents[contents.length - 1].parts[0].text += `\n${h.content}`;
      } else {
        contents.push({ role: mappedRole, parts: [{ text: h.content }] });
      }
    }
    if (contents.length > 0 && contents[0].role !== 'user') {
      contents.shift();
    }
    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
      contents[contents.length - 1].parts[0].text += `\n${text}`;
    } else {
      contents.push({ role: 'user', parts: [{ text }] });
    }

    for (const model of STANDALONE_GEMINI_MODELS) {
      try {
        const isGemma = model.startsWith('gemma-');
        const payload = isGemma
          ? {
              contents: [
                { role: 'user', parts: [{ text: `${sysPrompt}\n\n使用者「${effectiveUserName}」對妳說：${text}` }] }
              ],
              generationConfig: { temperature: 0.85, maxOutputTokens: 450 }
            }
          : {
              systemInstruction: { parts: [{ text: sysPrompt }] },
              contents,
              generationConfig: {
                temperature: 0.85,
                maxOutputTokens: 450,
                topP: 0.95,
                ...(model.startsWith('gemini-3') ? { thinkingConfig: { thinkingBudget: 0 } } : {})
              }
            };

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal
          }
        );
        clearTimeout(timer);

        if (!geminiRes.ok) {
          console.warn(`[Standalone Gemini] Model ${model} returned HTTP ${geminiRes.status}`);
          continue;
        }

        const gData = await geminiRes.json();
        const candidateText = gData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!candidateText) continue;

        let fullReply = candidateText.trim();
        let aiMemoryNote = null;
        const memMatch = fullReply.match(/\[MEMORY:(.*?)\]/i);
        if (memMatch && memMatch[1]) {
          aiMemoryNote = memMatch[1].trim();
          fullReply = fullReply.replace(/\[MEMORY:.*?\]/gi, '').trim();
        }
        fullReply = fullReply.replace(/\[PHOTO:.*?\]/gi, '').trim();

        const lines = fullReply.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length >= 2) {
          let line1 = lines[0];
          let line2 = lines[1];
          if (!line2.startsWith('（') && !line2.startsWith('(')) {
            const costMatch = line2.match(/\[COSTUME:([a-zA-Z0-9_-]+)\]/i);
            if (costMatch) {
              line2 = `（${line2.replace(/\[COSTUME:.*?\]/gi, '').trim()}）${costMatch[0]}`;
            } else {
              line2 = `（${line2}）`;
            }
          }
          fullReply = `${line1}\n${line2}`;
        }

        mem = recordStandaloneChatMemory(mem, text, fullReply, aiMemoryNote, affectionDelta);
        return {
          reply: fullReply,
          ttsText: (lines[0] || fullReply).replace(/\[COSTUME:.*?\]/gi, '').trim(),
          photo: matchedPhoto || null,
          voice: pickContextualAuthenticVoice(text, fullReply, modeInfo),
          memory: mem,
          affectionDelta,
          leveledUp,
          source: 'gemini_direct',
          model
        };
      } catch (err) {
        console.warn(`[Standalone Gemini] Model ${model} error:`, err.message);
      }
    }
  }

  // 3. 智慧本機情境與換裝對話池（當未設定 API Key 或離線時，同樣完整支援永久記憶與好感度關係階段！）
  if (/(記得|記憶|好感度|認識幾天|陪我幾天|什麼關係|我們的關係|覚えて)/i.test(text)) {
    const topFacts = (mem.memoryFacts && mem.memoryFacts.length > 0)
      ? mem.memoryFacts.slice(0, 3).map(f => `「${f.content || f.text || f.fact}」`).join('、')
      : '「あなたと過ごした大切な時間」';
    const reply = `もちろん全部覚えてるわよ、${effectiveUserName}！今の私たちは「${lv.titleJa}（${lv.badge}・好感度 ${mem.affectionScore}pt）」でしょう？${topFacts}ってことも、ちゃんと心に刻んでるから💖\n（我當然全都記得喔，${effectiveUserName}！現在的我們可是「${lv.badge}（好感度 ${mem.affectionScore}pt）」呢！${topFacts}這些事，我也全都深深記在心底喔💖）`;
    mem = recordStandaloneChatMemory(mem, text, reply, null, affectionDelta);
    return {
      reply,
      voice: pickContextualAuthenticVoice(text, reply, modeInfo),
      memory: mem,
      affectionDelta,
      leveledUp
    };
  }

  if (preExtracted.length > 0) {
    const newFactStr = preExtracted.map(f => f.content).join('、');
    const reply = `ちゃんと心に刻んだわよ、${effectiveUserName}！「${newFactStr}」ね。今の私たちは「${lv.titleJa}」なんだから、あなたのことなら何でも覚えておくわ💖\n（已經好好記在心底囉，${effectiveUserName}！「${newFactStr}」對吧。現在的我們可是「${lv.titleZh}」，關於你的事我全都會記下來的💖）`;
    mem = recordStandaloneChatMemory(mem, text, reply, null, affectionDelta);
    return {
      reply,
      voice: pickContextualAuthenticVoice(text, reply, modeInfo),
      memory: mem,
      affectionDelta,
      leveledUp
    };
  }

  if (matchedPhoto) {
    const reply = `${matchedPhoto.captionJa || `ほら、${effectiveUserName}のために撮ったセルフィーよ📸`}\n（${matchedPhoto.captionZh || `給你看，這是特別為${effectiveUserName}拍的自拍照喔📸`}）`;
    mem = recordStandaloneChatMemory(mem, text, reply, null, affectionDelta);
    return {
      reply,
      photo: matchedPhoto,
      voice: pickContextualAuthenticVoice(text, reply, modeInfo),
      memory: mem,
      affectionDelta,
      leveledUp
    };
  }

  const costumeKeywords = [
    { keys: ['領帶', '走廊', '放學', 'ネクタイ'], id: 'schoolpov' },
    { keys: ['制服', '水手服', '上學', '學校'], id: 'uniform' },
    { keys: ['拿鐵', '拉花', '咖啡約會'], id: 'cafedate' },
    { keys: ['咖啡', '打工', '圍裙', 'abcb'], id: 'cafe' },
    { keys: ['薩克斯', '音樂室', 'サックス', '吹奏'], id: 'sax' },
    { keys: ['浴衣', '花火', '煙火', '祭典'], id: 'yukata' },
    { keys: ['搖滾', '皮衣', '樂團', '舞台'], id: 'rock' },
    { keys: ['洋裝', '綠', '窗邊'], id: 'dress' },
    { keys: ['兔女郎', '兔耳', 'バニー', 'bunny'], id: 'bunny' },
    { keys: ['健身', '運動', '體操'], id: 'casual' },
    { keys: ['約會', '出門', '私服', '車站', '逛街'], id: 'date' },
    { keys: ['洗澡', '泡澡', '浴巾', '沐浴', '浴室'], id: 'bath' },
    { keys: ['毛衣', '唱片'], id: 'night' },
    { keys: ['居家', '做飯', '咖哩', '家裡'], id: 'home' },
    { keys: ['海灘', '泳裝', '比基尼', '海邊', '夏天', '游泳'], id: 'beach' },
    { keys: ['貓娘', 'cosplay', '角色扮演', '貓耳'], id: 'cosplay' },
    { keys: ['辦公室', '秘書', 'ol', '窄裙', '套裝', '上班'], id: 'work_ol' },
    { keys: ['吉他', '彈唱', '民謠'], id: 'guitar' },
    { keys: ['草帽', '白洋裝'], id: 'strawhat' },
    { keys: ['男友襯衫', '白襯衫', '大襯衫'], id: 'boyfriend_shirt' },
    { keys: ['魔女', '萬聖節', '女僕'], id: 'maid_witch' },
    { keys: ['晚禮服', '金色禮服', '禮服', '盛裝'], id: 'evening_gown' }
  ];
  for (const item of costumeKeywords) {
    if (item.keys.some(k => lowerMsg.includes(k))) {
      const cObj = COSTUMES.find(c => c.id === item.id);
      if (cObj && cObj.reaction) {
        const reply = `${cObj.reaction.replace(/リンシ/g, effectiveUserName)} [COSTUME:${cObj.id}]`;
        mem = recordStandaloneChatMemory(mem, text, reply, null, affectionDelta);
        return {
          reply,
          voice: pickContextualAuthenticVoice(text, reply, modeInfo),
          memory: mem,
          affectionDelta,
          leveledUp
        };
      }
    }
  }

  if (/(早安|おはよう|早上好|起床)/i.test(text)) {
    const reply = `おはよう、${effectiveUserName}☀️ よく眠れたかしら？今日もあなたの「${lv.titleJa}」として、ずっとスマホの中で隣にいるからね。\n（早安，${effectiveUserName}☀️ 睡得好嗎？今天我也會作為你的「${lv.titleZh}」，一直在手機裡陪在你身邊喔。）`;
    mem = recordStandaloneChatMemory(mem, text, reply, null, affectionDelta);
    return {
      reply,
      voice: { category: '日常', filename: '起床(甜蜜).mp3', audioUrl: 'assets/audio/%E6%97%A5%E5%B8%B8/%E8%B5%B7%E5%BA%8A(%E7%94%9C%E8%9C%9C).mp3' },
      memory: mem,
      affectionDelta,
      leveledUp
    };
  }
  if (/(晚安|おやすみ|想睡|睡覺|睡囉)/i.test(text)) {
    const reply = `おやすみなさい、${effectiveUserName}🌙 ほら、私の膝まくらでゆっくり目を閉じて……いい夢を見てね💖\n（晚安，${effectiveUserName}🌙 來，枕在我的膝蓋上慢慢閉上眼睛吧……祝你有個甜美的好夢喔💖）`;
    mem = recordStandaloneChatMemory(mem, text, reply, null, affectionDelta);
    return {
      reply,
      voice: { category: '日常', filename: '情侶互動(溫柔).mp3', audioUrl: 'assets/audio/%E6%97%A5%E5%B8%B8/%E6%83%85%E4%BE%B6%E4%BA%92%E5%8B%95(%E6%BA%AB%E6%9F%94).mp3' },
      memory: mem,
      affectionDelta,
      leveledUp
    };
  }
  if (/(累|辛苦|壓力|加班|煩|難過|疲)/i.test(text)) {
    const reply = `お疲れ様、${effectiveUserName}……無理しすぎてない？おいで、ぎゅっと抱きしめて頭を撫でてあげるから、少し休んでね。\n（辛苦了，${effectiveUserName}……有沒有太勉強自己呢？過來吧，讓我緊緊抱住你、摸摸你的頭，稍微休息一下喔。）`;
    mem = recordStandaloneChatMemory(mem, text, reply, null, affectionDelta);
    return {
      reply,
      voice: { category: '日常', filename: '安慰.mp3', audioUrl: 'assets/audio/%E6%97%A5%E5%B8%B8/%E5%AE%89%E6%85%B0.mp3' },
      memory: mem,
      affectionDelta,
      leveledUp
    };
  }
  if (/(愛你|喜歡你|想你|抱抱|親親|撒嬌|好き|愛してる|漂亮|可愛)/i.test(text)) {
    const reply = `もう、${effectiveUserName}ったら……急にそんなこと言われたら、胸がドキドキしちゃうじゃない💖 私も、「${lv.titleJa}」として誰より${effectiveUserName}のことが大好きよ。\n（真是的，${effectiveUserName}……突然聽你這麼說，心跳都加速了啦💖 身為你的「${lv.titleZh}」，我也比任何人都更喜歡${effectiveUserName}喔。）`;
    mem = recordStandaloneChatMemory(mem, text, reply, null, affectionDelta);
    return {
      reply,
      voice: { category: '日常', filename: '情侶互動(撒嬌).mp3', audioUrl: 'assets/audio/%E6%97%A5%E5%B8%B8/%E6%83%85%E4%BE%B6%E4%BA%92%E5%8B%95(%E6%92%92%E5%AC%8C).mp3' },
      memory: mem,
      affectionDelta,
      leveledUp
    };
  }
  if (/(在幹嘛|做什麼|忙嗎|現在|何してる|吃|餓|便當)/i.test(text)) {
    const reply = `レコードの整理をしながら、${effectiveUserName}のためにAbcbの特製コーヒーを淹れようと思ってたのよ☕ 一緒に一息つかない？\n（我剛才一邊整理黑膠唱片，一邊想著要為${effectiveUserName}泡杯 Abcb 特調咖啡呢☕ 要不要一起休息一下？）`;
    mem = recordStandaloneChatMemory(mem, text, reply, null, affectionDelta);
    return {
      reply,
      voice: { category: '日常', filename: '咖啡.mp3', audioUrl: 'assets/audio/%E6%97%A5%E5%B8%B8/%E5%92%96%E5%95%A1.mp3' },
      memory: mem,
      affectionDelta,
      leveledUp
    };
  }

  const firstFact = (mem.memoryFacts && mem.memoryFacts[0]) ? (mem.memoryFacts[0].content || mem.memoryFacts[0].text) : '';
  const generalPool = [
    `${effectiveUserName}、何見てるの？一段落したら、Abcbで一緒にコーヒーでも飲まない？\n（${effectiveUserName}、你在看什麼呢？告一段落的話，要不要一起去 Abcb 喝杯咖啡？）`,
    `ねえ、${effectiveUserName}。さっき素敵なジャズのレコード見つけたの。今度サックスで吹いてあげるね🎷\n（吶，${effectiveUserName}。剛才找到一張很棒的爵士唱片。下次用薩克斯風吹給你聽喔🎷）`,
    `${effectiveUserName}、頑張ってるのは知ってるけど……無理は禁物よ。あなたの「${lv.titleJa}」として、ずっとそばにいるんだから💖\n（${effectiveUserName}、我知道你很努力……但別太勉強喔。身為你的「${lv.titleZh}」，我會一直陪在你身邊的💖）`,
    ...(firstFact ? [`ふふっ、${effectiveUserName}のことなら「${firstFact}」ってことも、ちゃんと覚えてるわよ💖\n（呵呵，關於${effectiveUserName}的事，像是「${firstFact}」，我也都好好記在心裡喔💖）`] : []),
    modeInfo.introReply.replace(/リンシ/g, effectiveUserName)
  ];
  const pickedReply = generalPool[Math.floor(Math.random() * generalPool.length)];
  mem = recordStandaloneChatMemory(mem, text, pickedReply, null, affectionDelta);
  return {
    reply: pickedReply,
    voice: pickContextualAuthenticVoice(text, pickedReply, modeInfo),
    memory: mem,
    affectionDelta,
    leveledUp
  };
}

const apiBridge = {
  loadConfig: async () => {
    try {
      if (window.madokaAPI && window.madokaAPI.loadConfig) return await window.madokaAPI.loadConfig();
      const data = await apiFetchJson('/api/config');
      localStorage.setItem(OFFLINE_KEYS.CONFIG, JSON.stringify(data));
      return data;
    } catch (e) {
      const cached = localStorage.getItem(OFFLINE_KEYS.CONFIG);
      return cached ? JSON.parse(cached) : currentConfig;
    }
  },
  saveConfig: async (cfg) => {
    try {
      const merged = { ...currentConfig, ...cfg };
      localStorage.setItem(OFFLINE_KEYS.CONFIG, JSON.stringify(merged));
      if (window.madokaAPI && window.madokaAPI.saveConfig) return await window.madokaAPI.saveConfig(cfg);
      return await apiFetchJson('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfg)
      });
    } catch (e) {
      return { success: true, config: { ...currentConfig, ...cfg } };
    }
  },
  loadCostumes: async () => {
    try {
      const res = await fetch('costumes.json');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (e) {}
    const bundle = await loadCloudBundle();
    if (bundle && Array.isArray(bundle.costumes) && bundle.costumes.length > 0) {
      return bundle.costumes;
    }
    return DEFAULT_COSTUMES;
  },
  chat: async (message, history) => {
    try {
      if (window.madokaAPI && window.madokaAPI.chat) return await window.madokaAPI.chat(message, history);
      return await apiFetchJson('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history })
      }, 6000);
    } catch (e) {
      return await generateStandaloneReply(message, history, currentConfig.userName || 'リンシ');
    }
  },
  generateTTS: async (text) => {
    try {
      if (window.madokaAPI && window.madokaAPI.generateTTS) return await window.madokaAPI.generateTTS(text);
      return await apiFetchJson('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      }, 4000);
    } catch (e) {
      return { audioDataUrl: 'assets/audio/%E6%97%A5%E5%B8%B8/%E6%83%85%E4%BE%B6%E4%BA%92%E5%8B%95(%E6%BA%AB%E6%9F%94).mp3', source: 'offline_cache' };
    }
  },
  getAudioLibrary: async () => {
    try {
      if (window.madokaAPI && window.madokaAPI.getAudioLibrary) return await window.madokaAPI.getAudioLibrary();
      return await apiFetchJson('/api/audio/library');
    } catch (e) {
      const bundle = await loadCloudBundle();
      if (bundle && bundle.audioLibrary) return bundle.audioLibrary;
      return { bgm: [], ost: [] };
    }
  },
  getPokeVoice: async () => {
    try {
      if (window.madokaAPI && window.madokaAPI.getPokeVoice) return await window.madokaAPI.getPokeVoice();
      return await apiFetchJson('/api/audio/poke');
    } catch (e) {
      const list = [
        { category: '日常', filename: '情侶互動(撒嬌).mp3', fullText: 'もう、リンシ……外でも私に甘えたいの？ふふ、いいわよ💖\n（真是的，リンシ……在外面也想對我撒嬌嗎？呵呵，可以喔💖）' },
        { category: '日常', filename: '情侶互動(溫柔).mp3', fullText: 'なあに、リンシ？こうして触れ合うと、なんだか安心するわね。\n（怎麼啦，リンシ？像這樣碰觸著彼此，總覺得好安心呢。）' },
        { category: '日常', filename: '情侶互動(熱情).mp3', fullText: 'ふふっ、くすぐったいわよ、リンシ！そんなに構ってほしいの？💖\n（呵呵，很癢耶，リンシ！有那麼想讓我陪你嗎？💖）' }
      ];
      return list[Math.floor(Math.random() * list.length)];
    }
  },
  getCostumeVoice: async (costumeId) => {
    try {
      if (window.madokaAPI && window.madokaAPI.getCostumeVoice) return await window.madokaAPI.getCostumeVoice(costumeId);
      return await apiFetchJson(`/api/audio/costume?id=${encodeURIComponent(costumeId)}`);
    } catch (e) {
      const c = COSTUMES.find(x => x.id === costumeId) || COSTUMES[0];
      return { category: '日常', filename: '情侶互動(溫柔).mp3', fullText: c.reaction };
    }
  },
  getActionVoice: async (actionId) => {
    try {
      if (window.madokaAPI && window.madokaAPI.getActionVoice) return await window.madokaAPI.getActionVoice(actionId);
      return await apiFetchJson(`/api/audio/action?id=${encodeURIComponent(actionId)}`);
    } catch (e) {
      return { category: '日常', filename: '情侶互動(溫柔).mp3', fullText: 'リンシ、いつでも私がそばにいるからね。\n（リンシ，無論何時我都在你身邊喔。）' };
    }
  },
  getBedtimeVoice: async () => {
    try {
      if (window.madokaAPI && window.madokaAPI.getBedtimeVoice) return await window.madokaAPI.getBedtimeVoice();
      return await apiFetchJson('/api/audio/bedtime');
    } catch (e) {
      return { category: '日常', filename: '情侶互動(撒嬌).mp3', fullText: 'ねえ、リンシ……もう遅い時間よ？早く一緒に寝ましょ？\n（吶、リンシ……已經很晚了喔？快點一起睡覺好嗎？）' };
    }
  },
  getWhatsupVoice: async () => {
    try {
      if (window.madokaAPI && window.madokaAPI.getWhatsupVoice) return await window.madokaAPI.getWhatsupVoice();
      return await apiFetchJson('/api/audio/whatsup');
    } catch (e) {
      return { category: '日常', filename: '有心事嗎(溫柔).mp3', fullText: 'どうしたの、リンシ？何か悩み事なら、私が聴くわよ。\n（怎麼了，リンシ？如果有什麼煩惱的話，我聽你說喔。）' };
    }
  },
  minimizeWindow: () => {
    if (window.madokaAPI) window.madokaAPI.minimizeWindow();
  },
  closeWindow: () => {
    if (window.madokaAPI) window.madokaAPI.closeWindow();
    else window.close();
  },
  // 💖 永久對話記憶與好感度資料庫 API (支援雲端與離線獨立運作)
  getMemoryState: async () => {
    try {
      if (window.madokaAPI && window.madokaAPI.getMemoryState) return await window.madokaAPI.getMemoryState();
      const data = await apiFetchJson('/api/memory');
      return saveOfflineMemoryState(data);
    } catch (e) {
      return getOfflineMemoryState();
    }
  },
  recordActionMemory: async (actionId) => {
    try {
      if (window.madokaAPI && window.madokaAPI.recordActionMemory) return await window.madokaAPI.recordActionMemory(actionId);
      const data = await apiFetchJson('/api/memory/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionId })
      });
      if (data && data.memory) data.memory = saveOfflineMemoryState(data.memory);
      return data;
    } catch (e) {
      let mem = getOfflineMemoryState();
      const bonusMap = { wakeup_kiss: 10, confess: 8, bento: 6, curry: 6, sleep: 6, selfie: 6, comfort: 5, sax: 5, poke: 4 };
      const delta = bonusMap[actionId] || 5;
      mem.affectionScore = (mem.affectionScore || 320) + delta;
      mem = saveOfflineMemoryState(mem);
      return { success: true, memory: mem, affectionDelta: delta };
    }
  },
  addMemoryFact: async (fact, category = 'manual') => {
    const cleanFact = String(fact || '').trim();
    try {
      if (window.madokaAPI && window.madokaAPI.addMemoryFact) return await window.madokaAPI.addMemoryFact(cleanFact, category);
      const data = await apiFetchJson('/api/memory/fact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fact: cleanFact, category })
      });
      if (data && data.memory) data.memory = saveOfflineMemoryState(data.memory);
      return data;
    } catch (e) {
      let mem = getOfflineMemoryState();
      mem.memoryFacts = mem.memoryFacts || [];
      const exists = mem.memoryFacts.some(f => (f.content || f.text || f.fact) === cleanFact);
      if (!exists && cleanFact) {
        mem.memoryFacts.unshift({
          id: 'fact_' + Date.now(),
          content: cleanFact,
          text: cleanFact,
          fact: cleanFact,
          category,
          createdAt: formatMemoryTimestamp()
        });
        mem.affectionScore = (mem.affectionScore || 320) + 5;
      }
      mem = saveOfflineMemoryState(mem);
      return { success: true, memory: mem };
    }
  },
  deleteMemoryFact: async (factId) => {
    try {
      if (window.madokaAPI && window.madokaAPI.deleteMemoryFact) return await window.madokaAPI.deleteMemoryFact(factId);
      const data = await apiFetchJson('/api/memory/fact/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ factId })
      });
      if (data && data.memory) data.memory = saveOfflineMemoryState(data.memory);
      return data;
    } catch (e) {
      let mem = getOfflineMemoryState();
      mem.memoryFacts = (mem.memoryFacts || []).filter(f => f.id !== factId);
      mem = saveOfflineMemoryState(mem);
      return { success: true, memory: mem };
    }
  },
  clearChatHistory: async () => {
    try {
      if (window.madokaAPI && window.madokaAPI.clearChatHistory) return await window.madokaAPI.clearChatHistory();
      const data = await apiFetchJson('/api/memory/clear-history', { method: 'POST' });
      if (data && data.memory) data.memory = saveOfflineMemoryState(data.memory);
      return data;
    } catch (e) {
      let mem = getOfflineMemoryState();
      mem.conversationLog = [];
      mem = saveOfflineMemoryState(mem);
      return { success: true, memory: mem };
    }
  },
  // 📸 情侶 POV 自拍與 PixAI 繪圖指令集 API (支援 24 張寫真完整雲端/離線存取)
  getPovData: async () => {
    try {
      if (window.madokaAPI && window.madokaAPI.getPovData) return await window.madokaAPI.getPovData();
      const data = await apiFetchJson('/api/pov/data');
      localStorage.setItem(OFFLINE_KEYS.POV, JSON.stringify(data));
      return data;
    } catch (e) {
      const bundle = await loadCloudBundle();
      if (bundle && bundle.pov) return bundle.pov;
      const cached = localStorage.getItem(OFFLINE_KEYS.POV);
      return cached ? JSON.parse(cached) : { photos: [], promptCards: [] };
    }
  },
  snapPovPhoto: async (queryOrPhotoId) => {
    try {
      if (window.madokaAPI && window.madokaAPI.snapPovPhoto) return await window.madokaAPI.snapPovPhoto(queryOrPhotoId);
      return await apiFetchJson('/api/pov/snap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queryOrPhotoId })
      });
    } catch (e) {
      const bundle = await loadCloudBundle();
      const cached = localStorage.getItem(OFFLINE_KEYS.POV);
      const parsed = (bundle && bundle.pov) ? bundle.pov : (cached ? JSON.parse(cached) : { photos: [] });
      const list = parsed.photos || [];
      const q = String(queryOrPhotoId || '').trim().toLowerCase();
      let photo = null;
      if (q && list.length > 0) {
        photo = list.find(p => p.id === queryOrPhotoId || p.costumeId === queryOrPhotoId) ||
                list.find(p => (p.titleZh && p.titleZh.toLowerCase().includes(q)) || (Array.isArray(p.keywords) && p.keywords.some(k => q.includes(k.toLowerCase()))));
      }
      if (!photo && list.length > 0) {
        photo = list[Math.floor(Math.random() * list.length)];
      }
      if (!photo) {
        photo = {
          id: 'pov_13_morning_wakeup',
          titleZh: '晨間喚醒 POV・俯身甜笑叫你起床',
          image: 'assets/pov_photos/pov_13_morning_wakeup.jpg',
          captionJa: 'ふふっ……おはよう、リンシ。外でも私の写真が見たくなったの？💖',
          captionZh: '呵呵……早安，リンシ。在外面也想看我的照片了嗎？💖',
          tts: 'ふふっ、おはよう、リンシ。'
        };
      }
      return {
        success: true,
        photo,
        replyJa: photo.captionJa,
        replyZh: photo.captionZh,
        ttsText: photo.tts || photo.captionJa
      };
    }
  },
  generatePixAIPrompt: async (sceneInput, lens, lighting) => {
    try {
      if (window.madokaAPI && window.madokaAPI.generatePixAIPrompt) return await window.madokaAPI.generatePixAIPrompt(sceneInput, lens, lighting);
      return await apiFetchJson('/api/pov/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sceneInput, lens, lighting })
      });
    } catch (e) {
      const bundle = await loadCloudBundle();
      const lock = (bundle && bundle.pov && bundle.pov.characterLock) || 'adult Ayukawa Madoka, 18+, deep blue-black long hair, vivid green eyes';
      const neg = (bundle && bundle.pov && bundle.pov.commonNegativePrompt) || 'low quality, blurry, bad anatomy';
      return {
        success: true,
        prompt: `${lock}, couple POV, ${sceneInput || 'romantic date moment'}, ${lens || '50mm portrait lens'}, ${lighting || 'soft golden hour light'}, cinematic candid photography, 9:16`,
        negativePrompt: neg
      };
    }
  },
  importPovPhoto: async (payload) => {
    try {
      if (window.madokaAPI && window.madokaAPI.importPovPhoto) return await window.madokaAPI.importPovPhoto(payload);
      return await apiFetchJson('/api/pov/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      return { success: true };
    }
  },
  // ⏰ 隨身日夜生活助理與 💞 情侶心理療癒/撒嬌模式 API (支援 Wi-Fi 同步 + 雲端/離線獨立運作)
  getAssistantState: async () => {
    try {
      if (window.madokaAPI && window.madokaAPI.getAssistantState) return await window.madokaAPI.getAssistantState();
      const data = await apiFetchJson('/api/assistant/state');
      saveOfflineAssistantState(data);
      return data;
    } catch (e) {
      return getOfflineAssistantState();
    }
  },
  addTodo: async (payload) => {
    try {
      if (window.madokaAPI && window.madokaAPI.addTodo) return await window.madokaAPI.addTodo(payload);
      const data = await apiFetchJson('/api/assistant/todo/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (data && data.state) saveOfflineAssistantState(data.state);
      return data;
    } catch (e) {
      const st = getOfflineAssistantState();
      const effTime = payload.reminderTime || payload.time || '';
      const todo = {
        id: 'todo_' + Date.now(),
        title: payload.title || '待辦事項',
        category: payload.category || 'work',
        time: effTime,
        reminderTime: effTime,
        completed: false,
        sceneImage: 'assets/pov_photos/pov_21_office_ol.png'
      };
      st.todos.unshift(todo);
      saveOfflineAssistantState(st);
      return {
        success: true,
        todo,
        state: st,
        replyJa: `了解よ、リンシ！「${todo.title}」をスケジュール帳にメモしておいたわ📝`,
        replyZh: `收到囉，リンシ！已經幫你把「${todo.title}」記在行程手冊裡了📝`,
        ttsText: `了解よ、リンシ！「${todo.title}」をメモしておいたわ。`
      };
    }
  },
  toggleTodo: async (todoId) => {
    try {
      if (window.madokaAPI && window.madokaAPI.toggleTodo) return await window.madokaAPI.toggleTodo(todoId);
      const data = await apiFetchJson('/api/assistant/todo/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ todoId })
      });
      if (data && data.state) saveOfflineAssistantState(data.state);
      return data;
    } catch (e) {
      const st = getOfflineAssistantState();
      const item = st.todos.find(t => t.id === todoId);
      let justCompleted = false;
      if (item) {
        item.completed = !item.completed;
        justCompleted = item.completed;
      }
      saveOfflineAssistantState(st);
      let mem = getOfflineMemoryState();
      if (justCompleted) {
        mem.affectionScore = (mem.affectionScore || 320) + 8;
        mem = saveOfflineMemoryState(mem);
      }
      const ja = justCompleted ? `さすがリンシ！「${item ? item.title : ''}」を完了したわね。よく頑張りました、ご褒美にぎゅってしてあげる💖` : '';
      const zh = justCompleted ? `不愧是リンシ！完成了「${item ? item.title : ''}」呢。太努力了，獎勵你一個大大的擁抱💖` : '';
      return {
        success: true,
        todo: item,
        justCompleted,
        replyJa: ja,
        replyZh: zh,
        praiseReply: justCompleted ? `${ja}\n（${zh}）` : '',
        voice: justCompleted ? { category: '日常', filename: '情侶互動(熱情).mp3', audioUrl: 'assets/audio/%E6%97%A5%E5%B8%B8/%E6%83%85%E4%BE%B6%E4%BA%92%E5%8B%95(%E7%86%B1%E6%83%85).mp3' } : null,
        state: st,
        memory: mem
      };
    }
  },
  deleteTodo: async (todoId) => {
    try {
      if (window.madokaAPI && window.madokaAPI.deleteTodo) return await window.madokaAPI.deleteTodo(todoId);
      const data = await apiFetchJson('/api/assistant/todo/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ todoId })
      });
      if (data && data.state) saveOfflineAssistantState(data.state);
      return data;
    } catch (e) {
      const st = getOfflineAssistantState();
      st.todos = st.todos.filter(t => t.id !== todoId);
      saveOfflineAssistantState(st);
      return { success: true, state: st };
    }
  },
  addAlarm: async (payload) => {
    try {
      if (window.madokaAPI && window.madokaAPI.addAlarm) return await window.madokaAPI.addAlarm(payload);
      const data = await apiFetchJson('/api/assistant/alarm/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (data && data.state) saveOfflineAssistantState(data.state);
      return data;
    } catch (e) {
      const st = getOfflineAssistantState();
      const alarm = {
        id: 'alarm_' + Date.now(),
        time: payload.time || '07:30',
        label: payload.label || '☀️ 早安晨曦喚醒',
        mode: payload.mode || 'sweet',
        enabled: true,
        sceneImage: 'assets/pov_photos/pov_13_morning_wakeup.jpg',
        lastTriggeredDate: ''
      };
      st.alarms.push(alarm);
      saveOfflineAssistantState(st);
      return {
        success: true,
        alarm,
        state: st,
        replyJa: `わかったわ、リンシ！${alarm.time} に目覚ましをセットしておいたわよ⏰`,
        replyZh: `收到囉，リンシ！已經幫你設定好 ${alarm.time} 的喚醒鬧鐘了⏰`,
        ttsText: `わかったわ、リンシ！${alarm.time} に目覚ましをセットしておいたわよ。`
      };
    }
  },
  toggleAlarm: async (alarmId) => {
    try {
      if (window.madokaAPI && window.madokaAPI.toggleAlarm) return await window.madokaAPI.toggleAlarm(alarmId);
      const data = await apiFetchJson('/api/assistant/alarm/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alarmId })
      });
      if (data && data.state) saveOfflineAssistantState(data.state);
      return data;
    } catch (e) {
      const st = getOfflineAssistantState();
      const a = st.alarms.find(x => x.id === alarmId);
      if (a) a.enabled = !a.enabled;
      saveOfflineAssistantState(st);
      return { success: true, alarm: a, state: st };
    }
  },
  deleteAlarm: async (alarmId) => {
    try {
      if (window.madokaAPI && window.madokaAPI.deleteAlarm) return await window.madokaAPI.deleteAlarm(alarmId);
      const data = await apiFetchJson('/api/assistant/alarm/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alarmId })
      });
      if (data && data.state) saveOfflineAssistantState(data.state);
      return data;
    } catch (e) {
      const st = getOfflineAssistantState();
      st.alarms = st.alarms.filter(x => x.id !== alarmId);
      saveOfflineAssistantState(st);
      return { success: true, state: st };
    }
  },
  triggerAlarm: async (alarmId, mode) => {
    try {
      if (window.madokaAPI && window.madokaAPI.triggerAlarm) return await window.madokaAPI.triggerAlarm(alarmId, mode);
      return await apiFetchJson('/api/assistant/alarm/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alarmId, mode })
      });
    } catch (e) {
      const st = getOfflineAssistantState();
      const alarm = st.alarms.find(x => x.id === alarmId) || { time: '07:30', label: '☀️ 早安晨曦喚醒', mode: mode || 'sweet' };
      return buildOfflineWakeupPayload(alarm);
    }
  },
  setCoupleMode: async (modeId) => {
    try {
      if (window.madokaAPI && window.madokaAPI.setCoupleMode) return await window.madokaAPI.setCoupleMode(modeId);
      const data = await apiFetchJson('/api/assistant/couple-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modeId })
      });
      if (data && data.state) saveOfflineAssistantState(data.state);
      return data;
    } catch (e) {
      const st = getOfflineAssistantState();
      const target = OFFLINE_COUPLE_MODES.find(m => m.id === modeId) || OFFLINE_COUPLE_MODES[0];
      st.coupleMode = target.id;
      st.currentModeInfo = target;
      saveOfflineAssistantState(st);
      return {
        success: true,
        mode: target,
        replyJa: target.quoteJa,
        replyZh: target.quoteZh,
        reply: target.introReply,
        ttsText: target.quoteJa,
        voice: { category: target.voiceCategory, filename: target.voiceFile, audioUrl: `assets/audio/${encodeURIComponent(target.voiceCategory)}/${encodeURIComponent(target.voiceFile)}` },
        sceneImage: target.sceneImage,
        costumeId: target.costumeId,
        state: st
      };
    }
  },
  triggerMoodCare: async (moodKey) => {
    try {
      if (window.madokaAPI && window.madokaAPI.triggerMoodCare) return await window.madokaAPI.triggerMoodCare(moodKey);
      return await apiFetchJson('/api/assistant/mood-care', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moodKey })
      });
    } catch (e) {
      const item = OFFLINE_MOOD_POOL[moodKey] || OFFLINE_MOOD_POOL.tired;
      const lines = (item.reply || '').split('\n');
      const ja = lines[0] || item.reply;
      const zh = (lines[1] || '').replace(/^[（(]|[）)]$/g, '');
      return {
        success: true,
        moodKey,
        label: item.label,
        replyJa: ja,
        replyZh: zh,
        reply: item.reply,
        ttsText: ja,
        costumeId: item.costumeId,
        sceneImage: item.sceneImage,
        voice: { category: item.voiceCategory, filename: item.voiceFile, audioUrl: `assets/audio/${encodeURIComponent(item.voiceCategory)}/${encodeURIComponent(item.voiceFile)}` }
      };
    }
  }
};

let currentConfig = {
  userName: 'リンシ',
  voiceMode: 'authentic', // 'authentic' | 'minimax' | 'mute'
  volume: 0.8,
  bgmVolume: 0.45,
  autoTimeCostume: true
};
let chatHistory = [];
let audioContext = null;
let currentVoiceAudio = null;
let currentBgmAudio = null;
let lipSyncInterval = null;

// 💖 永久記憶與 📸 情侶 POV 狀態
let memoryState = null;
let povData = { photos: [], promptCards: [], characterLock: '', commonNegativePrompt: '' };
let currentBubblePhoto = null;
let currentLightboxPhoto = null;
let lastGeneratedPixAI = null;

// 🎷 薩克斯風 5 張插圖動態吹奏演出狀態
const SAX_PERFORMANCE_FRAMES = [
  'assets/costumes/sax_play_2.png', // 1. 夕陽窗邊水手服・閉眼含吹嘴深情吹奏
  'assets/costumes/sax_play_3.png', // 2. 音樂室譜架旁・閉眼含吹嘴投入吹奏
  'assets/costumes/sax_play_4.png', // 3. 夕陽窗邊特寫・閉眼換氣沉醉餘韻
  'assets/costumes/sax_play_5.png', // 4. 陽光音樂室・閉眼雙手握薩克斯風感受旋律
  'assets/costumes/sax_play_1.png'  // 5. 黃昏窗邊・溫柔凝視微笑持薩克斯風
];
let saxPerformanceInterval = null;
let saxNoteEffectInterval = null;
let isSaxPerforming = false;
let currentSaxFrameIdx = 0;
let activeSaxBuffer = 'idle'; // 'idle' (imgIdle) | 'half' (imgTalkHalf)

// 預載入 5 張薩克斯風吹奏插圖，確保切換零延遲、不閃爍
SAX_PERFORMANCE_FRAMES.forEach(src => {
  const preloadImg = new Image();
  preloadImg.src = src;
});

// 音樂留聲機狀態
let audioLibrary = { bgm: [], ost: [] };
let currentMusicTab = 'bgm';
let currentTrackList = [];
let currentTrackIndex = 0;
let playbackMode = 'loop'; // 'loop' | 'single' | 'shuffle'
let isMusicPlaying = false;

// ⏰ 隨身助理與 💞 戀人模式狀態
let assistantState = null;
let currentVariantIdxMap = {};
let snoozeUntilTime = '';
let lastTriggeredAlarmMinute = '';
let notifiedTodoKeys = new Set();

// DOM 元素
const speechBubble = document.getElementById('speech-bubble');
const bubbleText = document.getElementById('bubble-text');
const speakingIndicator = document.getElementById('speaking-indicator');
const costumeTagBadge = document.getElementById('current-costume-tag');
const coupleModeBadge = document.getElementById('couple-mode-badge');
const affectionBadge = document.getElementById('affection-badge');
const bubblePhotoCard = document.getElementById('bubble-photo-card');
const bubblePhotoImg = document.getElementById('bubble-photo-img');
const bubblePhotoTitle = document.getElementById('bubble-photo-title');
const btnBubbleZoom = document.getElementById('btn-bubble-zoom');
const btnBubblePrompt = document.getElementById('btn-bubble-prompt');
const btnBubbleClosePhoto = document.getElementById('btn-bubble-close-photo');
const btnQuickSelfie = document.getElementById('btn-quick-selfie');

const imgIdle = document.getElementById('img-idle');
const imgTalkHalf = document.getElementById('img-talk-half');
const imgTalkOpen = document.getElementById('img-talk-open');
const characterAvatar = document.getElementById('character-avatar');
const effectContainer = document.getElementById('effect-container');
const userInput = document.getElementById('user-input');
const btnSend = document.getElementById('btn-send');

// 視窗控制
const btnAssistant = document.getElementById('btn-assistant');
const btnMemory = document.getElementById('btn-memory');
const btnPov = document.getElementById('btn-pov');
const btnMusic = document.getElementById('btn-music');
const btnSettings = document.getElementById('btn-settings');
const btnWardrobe = document.getElementById('btn-wardrobe');
const btnMinimize = document.getElementById('btn-minimize');
const btnClose = document.getElementById('btn-close');

// Modal 對話框
const assistantModal = document.getElementById('assistant-modal');
const btnCloseAssistant = document.getElementById('btn-close-assistant');
const wakeupOverlay = document.getElementById('wakeup-alarm-overlay');
const memoryModal = document.getElementById('memory-modal');
const btnCloseMemory = document.getElementById('btn-close-memory');
const povModal = document.getElementById('pov-modal');
const btnClosePov = document.getElementById('btn-close-pov');
const photoLightbox = document.getElementById('photo-lightbox');
const btnCloseLightbox = document.getElementById('btn-close-lightbox');

const settingsModal = document.getElementById('settings-modal');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnSaveSettings = document.getElementById('btn-save-settings');

const wardrobeModal = document.getElementById('wardrobe-modal');
const btnCloseWardrobe = document.getElementById('btn-close-wardrobe');
const costumeGrid = document.getElementById('costume-grid');
const cfgAutoTimeCostume = document.getElementById('cfg-auto-time-costume');
const btnRandomCostume = document.getElementById('btn-random-costume');
const btnCycleVariant = document.getElementById('btn-cycle-variant');

const musicModal = document.getElementById('music-modal');
const btnCloseMusic = document.getElementById('btn-close-music');
const vinylDisc = document.getElementById('vinyl-disc');
const musicNowTitle = document.getElementById('music-now-title');
const musicNowSubtitle = document.getElementById('music-now-subtitle');
const btnMusicPrev = document.getElementById('btn-music-prev');
const btnMusicPlay = document.getElementById('btn-music-play');
const btnMusicNext = document.getElementById('btn-music-next');
const btnMusicMode = document.getElementById('btn-music-mode');
const musicVol = document.getElementById('music-vol');
const musicVolVal = document.getElementById('music-vol-val');
const musicTrackList = document.getElementById('music-track-list');

// 設定欄位
const cfgUserName = document.getElementById('cfg-user-name');
const cfgVoiceMode = document.getElementById('cfg-voice-mode');
const cfgGeminiKey = document.getElementById('cfg-gemini-key');
const cfgMinimaxKey = document.getElementById('cfg-minimax-key');
const cfgMinimaxVoice = document.getElementById('cfg-minimax-voice');
const cfgLang = document.getElementById('cfg-lang');
const cfgVol = document.getElementById('cfg-vol');
const volValue = document.getElementById('vol-value');
const cfgBgmVol = document.getElementById('cfg-bgm-vol');
const bgmVolValue = document.getElementById('bgm-vol-value');
const cfgBedtimeReminder = document.getElementById('cfg-bedtime-reminder');

// 初始化
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const loadedCostumes = await apiBridge.loadCostumes();
    if (loadedCostumes && loadedCostumes.length > 0) {
      COSTUMES = loadedCostumes;
    }
  } catch (e) {
    console.warn('載入造型清單失敗:', e);
  }

  try {
    currentConfig = await apiBridge.loadConfig();
    applyConfigToUI(currentConfig);
  } catch (err) {
    console.error('載入設定失敗:', err);
  }

  try {
    audioLibrary = await apiBridge.getAudioLibrary();
    setupMusicJukeboxUI();
  } catch (err) {
    console.warn('載入音訊曲庫失敗:', err);
  }

  // 載入永久記憶資料庫與情侶 POV 相簿/PixAI 指令集
  try {
    memoryState = await apiBridge.getMemoryState();
    updateMemoryAndAffectionUI(memoryState);
    if (memoryState && Array.isArray(memoryState.conversationLog) && memoryState.conversationLog.length > 0) {
      chatHistory = memoryState.conversationLog.slice(-10).map(item => ({
        role: item.role === 'user' ? 'user' : 'assistant',
        content: item.content
      }));
    }
  } catch (err) {
    console.warn('載入永久記憶狀態失敗:', err);
  }

  try {
    povData = await apiBridge.getPovData();
    renderPovGalleryAndPrompts();
  } catch (err) {
    console.warn('載入情侶 POV 相簿與 PixAI 資料失敗:', err);
  }

  try {
    assistantState = await apiBridge.getAssistantState();
    renderAssistantAllUI();
  } catch (err) {
    console.warn('載入隨身助理與戀人狀態失敗:', err);
  }

  setupEventListeners();
  setupMemoryAndPovListeners();
  setupAssistantAndCareListeners();
  setupWardrobeUI();
  setupIdleGreetings();
  checkTimeBasedCostume(false); // 初次啟動時段造型檢查
});

function applyConfigToUI(cfg) {
  cfgUserName.value = cfg.userName || 'リンシ';
  if (cfgVoiceMode) cfgVoiceMode.value = cfg.voiceMode || 'authentic';
  cfgGeminiKey.value = cfg.geminiApiKey || '';
  cfgMinimaxKey.value = cfg.minimaxApiKey || '';
  cfgMinimaxVoice.value = cfg.minimaxVoiceId || '';
  cfgLang.value = cfg.languageMode || 'ja-with-zh';
  cfgVol.value = cfg.volume !== undefined ? cfg.volume : 0.8;
  volValue.textContent = `${Math.round(cfgVol.value * 100)}%`;

  if (cfgBgmVol) {
    cfgBgmVol.value = cfg.bgmVolume !== undefined ? cfg.bgmVolume : 0.45;
    bgmVolValue.textContent = `${Math.round(cfgBgmVol.value * 100)}%`;
  }
  if (musicVol) {
    musicVol.value = cfg.bgmVolume !== undefined ? cfg.bgmVolume : 0.45;
    musicVolVal.textContent = `${Math.round(musicVol.value * 100)}%`;
  }

  if (cfg.autoTimeCostume !== undefined) {
    cfgAutoTimeCostume.checked = cfg.autoTimeCostume;
  }
  if (cfgBedtimeReminder && cfg.bedtimeReminder !== undefined) {
    cfgBedtimeReminder.checked = cfg.bedtimeReminder;
  }

  // 套用造型
  applyCostume(cfg.currentCostume || 'uniform', false);

  const name = cfg.userName || 'リンシ';
  bubbleText.innerHTML = `${name}、今日もお疲れ様。私がそばにいるから、無理しないでね。<br><span class="sub-zh">（${name}、今天也辛苦了。有我在身邊，別太勉強自己喔。）</span>`;
}

function setupEventListeners() {
  btnMinimize.addEventListener('click', () => apiBridge.minimizeWindow());
  btnClose.addEventListener('click', () => apiBridge.closeWindow());

  // 開啟設定與衣櫃與音樂留聲機
  btnSettings.addEventListener('click', () => settingsModal.classList.remove('hidden'));
  btnCloseModal.addEventListener('click', () => settingsModal.classList.add('hidden'));

  btnWardrobe.addEventListener('click', () => wardrobeModal.classList.remove('hidden'));
  btnCloseWardrobe.addEventListener('click', () => wardrobeModal.classList.add('hidden'));

  btnMusic.addEventListener('click', () => musicModal.classList.remove('hidden'));
  btnCloseMusic.addEventListener('click', () => musicModal.classList.add('hidden'));

  // 時段自動換裝開關
  cfgAutoTimeCostume.addEventListener('change', (e) => {
    currentConfig.autoTimeCostume = e.target.checked;
    apiBridge.saveConfig({ autoTimeCostume: e.target.checked });
    if (e.target.checked) checkTimeBasedCostume(true);
  });

  cfgVol.addEventListener('input', (e) => {
    volValue.textContent = `${Math.round(e.target.value * 100)}%`;
  });

  if (cfgBgmVol) {
    cfgBgmVol.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      bgmVolValue.textContent = `${Math.round(v * 100)}%`;
      if (musicVol) {
        musicVol.value = v;
        musicVolVal.textContent = `${Math.round(v * 100)}%`;
      }
      setBgmVolume(v);
    });
  }

  btnSaveSettings.addEventListener('click', async () => {
    const updated = {
      userName: cfgUserName.value.trim() || 'リンシ',
      voiceMode: cfgVoiceMode ? cfgVoiceMode.value : 'authentic',
      geminiApiKey: cfgGeminiKey.value.replace(/\s+/g, ''),
      minimaxApiKey: cfgMinimaxKey.value.replace(/\s+/g, ''),
      minimaxVoiceId: cfgMinimaxVoice.value.trim(),
      languageMode: cfgLang.value,
      volume: parseFloat(cfgVol.value),
      bgmVolume: cfgBgmVol ? parseFloat(cfgBgmVol.value) : 0.45,
      bedtimeReminder: cfgBedtimeReminder ? cfgBedtimeReminder.checked : true
    };

    const res = await apiBridge.saveConfig(updated);
    if (res.success) {
      currentConfig = res.config;
      settingsModal.classList.add('hidden');
      showSpeech(`${currentConfig.userName}、設定が完了したわよ！\n（${currentConfig.userName}、設定已經更新好囉！）`);
    } else {
      alert('儲存失敗：' + res.error);
    }
  });

  btnSend.addEventListener('click', handleUserSend);
  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleUserSend();
  });

  // 心動快捷動作列 (Bento, Curry, Confess, Sleep, Selfie, Comfort, Sax, Poke)
  document.querySelectorAll('.action-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const act = btn.getAttribute('data-action');
      handleQuickAction(act);
    });
  });

  // 點擊立繪反應
  characterAvatar.addEventListener('click', handleCharacterPoke);

  // 音樂控制面板事件
  setupMusicControls();
}

// 渲染造型衣櫃列表 (22 大情境與同系列款式輪播)
function setupWardrobeUI() {
  costumeGrid.innerHTML = '';
  COSTUMES.forEach(c => {
    const card = document.createElement('div');
    card.className = `costume-card ${currentConfig.currentCostume === c.id ? 'active' : ''}`;
    card.dataset.id = c.id;
    const varCount = (c.variants && c.variants.length > 1) ? ` <span style="color:#ff85a2;font-size:10px;">(${c.variants.length}款)</span>` : '';
    card.innerHTML = `
      <div class="costume-info">
        <span class="costume-title">${c.name}${varCount}</span>
        <span class="costume-hint">推薦：${c.timeHint}</span>
      </div>
      <span class="costume-badge">${c.tag}</span>
    `;
    card.addEventListener('click', () => {
      applyCostume(c.id, true);
      wardrobeModal.classList.add('hidden');
    });
    costumeGrid.appendChild(card);
  });

  if (btnRandomCostume) {
    btnRandomCostume.onclick = () => {
      const others = COSTUMES.filter(c => c.id !== currentConfig.currentCostume);
      const pick = others[Math.floor(Math.random() * others.length)] || COSTUMES[0];
      applyCostume(pick.id, true);
      wardrobeModal.classList.add('hidden');
    };
  }
  if (btnCycleVariant) {
    btnCycleVariant.onclick = () => {
      cycleCurrentCostumeVariant();
      wardrobeModal.classList.add('hidden');
    };
  }
  if (costumeTagBadge) {
    costumeTagBadge.style.cursor = 'pointer';
    costumeTagBadge.onclick = () => cycleCurrentCostumeVariant();
  }
}

function cycleCurrentCostumeVariant() {
  const costume = COSTUMES.find(c => c.id === currentConfig.currentCostume) || COSTUMES[0];
  const variants = (costume.variants && costume.variants.length > 0) ? costume.variants : [costume.imageIdle || costume.image];
  if (variants.length <= 1) {
    // 若當前造型僅 1 張，隨機切換到另一套新造型
    const others = COSTUMES.filter(c => c.id !== costume.id);
    const pick = others[Math.floor(Math.random() * others.length)] || COSTUMES[0];
    applyCostume(pick.id, true);
    return;
  }
  const curIdx = currentVariantIdxMap[costume.id] || 0;
  const nextIdx = (curIdx + 1) % variants.length;
  currentVariantIdxMap[costume.id] = nextIdx;
  const nextSrc = variants[nextIdx];

  characterAvatar.classList.add('outfit-changing');
  imgIdle.src = nextSrc;
  if (imgTalkHalf) imgTalkHalf.src = nextSrc;
  if (imgTalkOpen) imgTalkOpen.src = nextSrc;
  setMouthState('idle');
  setTimeout(() => characterAvatar.classList.remove('outfit-changing'), 500);

  const rect = characterAvatar.getBoundingClientRect();
  createFloatingEffect(rect.left + rect.width / 2, rect.top + rect.height * 0.35, ['✨', '👗', '💖']);
  showSpeech(`ふふっ、同じ「${costume.name}」シリーズの別カット（${nextIdx + 1}/${variants.length}）よ。こっちの雰囲気も好き？\n（呵呵，這是同系列「${costume.name}」的另一張插圖款式（${nextIdx + 1}/${variants.length}）喔。你也喜歡這個氛圍嗎？）`);
}

function updateWardrobeActiveState() {
  document.querySelectorAll('.costume-card').forEach(card => {
    if (card.dataset.id === currentConfig.currentCostume) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });
}

// 口型狀態控制：'idle' | 'half' | 'open'
function setMouthState(state) {
  if (state === 'open') {
    imgIdle.classList.add('hidden');
    imgIdle.classList.remove('active');
    if (imgTalkHalf) {
      imgTalkHalf.classList.add('hidden');
      imgTalkHalf.classList.remove('active');
    }
    if (imgTalkOpen) {
      imgTalkOpen.classList.remove('hidden');
      imgTalkOpen.classList.add('active');
    }
  } else if (state === 'half') {
    imgIdle.classList.add('hidden');
    imgIdle.classList.remove('active');
    if (imgTalkOpen) {
      imgTalkOpen.classList.add('hidden');
      imgTalkOpen.classList.remove('active');
    }
    if (imgTalkHalf) {
      imgTalkHalf.classList.remove('hidden');
      imgTalkHalf.classList.add('active');
    }
  } else {
    // idle (閉嘴)
    if (imgTalkHalf) {
      imgTalkHalf.classList.add('hidden');
      imgTalkHalf.classList.remove('active');
    }
    if (imgTalkOpen) {
      imgTalkOpen.classList.add('hidden');
      imgTalkOpen.classList.remove('active');
    }
    imgIdle.classList.remove('hidden');
    imgIdle.classList.add('active');
  }
}

// 換裝核心函數（同步更新三態立繪幀並預載入）
function applyCostume(costumeId, playReaction = false) {
  stopSaxPerformance(false);
  const costume = COSTUMES.find(c => c.id === costumeId) || COSTUMES[0];
  currentConfig.currentCostume = costume.id;
  apiBridge.saveConfig({ currentCostume: costume.id });

  // 換裝動態效果
  characterAvatar.classList.add('outfit-changing');
  
  const idleSrc = costume.imageIdle || costume.image;
  const halfSrc = costume.imageTalkHalf || idleSrc;
  const openSrc = costume.imageTalkOpen || idleSrc;

  imgIdle.src = idleSrc;
  if (imgTalkHalf) imgTalkHalf.src = halfSrc;
  if (imgTalkOpen) imgTalkOpen.src = openSrc;

  // 預載入口型圖檔，消除首次播放語音時的黑屏閃爍
  [halfSrc, openSrc].forEach(src => {
    const p = new Image();
    p.src = src;
  });

  setMouthState('idle');
  setTimeout(() => characterAvatar.classList.remove('outfit-changing'), 600);

  // 更新稱謂標籤
  costumeTagBadge.textContent = costume.tag;
  updateWardrobeActiveState();

  if (playReaction) {
    if (currentConfig.voiceMode === 'mute') {
      showSpeech(costume.reaction);
      return;
    }

    if (currentConfig.voiceMode === 'authentic') {
      apiBridge.getCostumeVoice(costume.id).then(voice => {
        if (voice && (voice.audioUrl || voice.filename)) {
          showSpeech(voice.fullText);
          const urlToPlay = voice.audioUrl || `assets/audio/${encodeURIComponent(voice.category)}/${encodeURIComponent(voice.filename)}`;
          playAudioWithLipSync(urlToPlay, voice.fallbackUrl);
        } else {
          showSpeech(costume.reaction);
          apiBridge.generateTTS(costume.tts).then(res => {
            if (res && res.audioDataUrl) playAudioWithLipSync(res.audioDataUrl);
          });
        }
      });
    } else {
      showSpeech(costume.reaction);
      apiBridge.generateTTS(costume.tts).then(res => {
        if (res && res.audioDataUrl) playAudioWithLipSync(res.audioDataUrl);
      });
    }
  }
}

// 依照當前時間自動切換造型（9 大情境排程）
function checkTimeBasedCostume(notify = false) {
  if (currentConfig.autoTimeCostume === false) return;

  const hour = new Date().getHours();
  let targetId = 'uniform';

  if (hour >= 23 || hour < 7) {
    targetId = 'home';    // 23:30 ~ 07:00 居家晨曦
  } else if (hour >= 22 && hour < 23) {
    targetId = 'night';   // 22:00 ~ 23:00 夜晚放鬆
  } else if (hour >= 21 && hour < 22) {
    targetId = 'bath';    // 21:00 ~ 22:00 沐浴時光
  } else if (hour >= 18 && hour < 21) {
    targetId = 'date';    // 18:30 ~ 21:00 浪漫約會
  } else if (hour >= 16 && hour < 18) {
    targetId = 'casual';  // 16:30 ~ 18:30 休閒運動
  } else if (hour >= 11 && hour < 14) {
    targetId = 'cafe';    // 11:30 ~ 14:00 Abcb咖啡館打工
  } else {
    targetId = 'uniform'; // 07:00 ~ 11:30 / 14:00 ~ 16:30 學生水手服
  }

  if (targetId !== currentConfig.currentCostume) {
    applyCostume(targetId, notify);
  }
}

// 處理發送訊息（支援對話指令換裝、情侶 POV 拍照發送、永久記憶與好感度更新）
async function handleUserSend() {
  const text = userInput.value.trim();
  if (!text) return;

  userInput.value = '';
  hideBubblePhoto();
  showSpeech('考え中……💭\n（思考中……）');

  chatHistory.push({ role: 'user', content: text });
  if (chatHistory.length > 10) chatHistory.shift();

  try {
    const aiRes = await apiBridge.chat(text, chatHistory);
    let fullReply = (aiRes && aiRes.reply) ? aiRes.reply : '';
    if (!fullReply) {
      fullReply = "ふふっ、リンシ。何か考え事？\n（呵呵、リンシ。在想什麼心事嗎？）";
    }

    // 檢查是否有換裝標籤 [COSTUME:xxx]
    const costumeMatch = fullReply.match(/\[COSTUME:([a-zA-Z0-9_-]+)\]/i);
    if (costumeMatch) {
      const targetCostumeId = costumeMatch[1].toLowerCase();
      applyCostume(targetCostumeId, false);
      fullReply = fullReply.replace(/\[COSTUME:.*?\]/gi, '').trim();
    }

    const ttsLine = (aiRes && aiRes.ttsText) ? aiRes.ttsText : fullReply.split('\n')[0].replace(/\[COSTUME:.*?\]/gi, '').trim();

    chatHistory.push({ role: 'assistant', content: fullReply });
    showSpeech(fullReply);

    // 若 AI 回傳了情侶 POV 自拍照片，顯示拍立得照片卡片並觸發閃光特效
    if (aiRes && aiRes.photo) {
      showBubblePhoto(aiRes.photo);
      const rect = characterAvatar.getBoundingClientRect();
      createFloatingEffect(rect.left + rect.width / 2, rect.top + rect.height * 0.35, ['📸', '💖', '✨', '🥰']);
    } else if (aiRes && aiRes.sceneImage) {
      showBubblePhoto({
        title: (aiRes.assistantAction && aiRes.assistantAction.type === 'alarm_added') ? '⏰ 專屬鬧鐘已設定' : '💞 まどか專屬情景插圖',
        imageUrl: aiRes.sceneImage,
        caption: fullReply
      });
    }

    // 若觸發了自然語言助理排程或戀人模式切換，立即刷新助理狀態與徽章
    if (aiRes && aiRes.assistantAction) {
      apiBridge.getAssistantState().then(st => {
        if (st) {
          assistantState = st;
          renderAssistantAllUI();
        }
      }).catch(() => {});
    }

    // 更新好感度與永久記憶狀態
    if (aiRes && aiRes.memory) {
      memoryState = aiRes.memory;
      updateMemoryAndAffectionUI(memoryState);
      if (aiRes.affectionDelta && aiRes.affectionDelta > 0) {
        const rect = characterAvatar.getBoundingClientRect();
        createFloatingEffect(rect.left + rect.width * 0.65, rect.top + rect.height * 0.3, ['💖', '❤️', '✨']);
      }
    } else {
      apiBridge.getMemoryState().then(st => {
        if (st) {
          memoryState = st;
          updateMemoryAndAffectionUI(memoryState);
        }
      }).catch(() => {});
    }

    if (currentConfig.voiceMode !== 'mute') {
      if (aiRes && aiRes.voice && (aiRes.voice.audioUrl || aiRes.voice.filename)) {
        const vUrl = aiRes.voice.audioUrl || `assets/audio/${encodeURIComponent(aiRes.voice.category)}/${encodeURIComponent(aiRes.voice.filename)}`;
        playAudioWithLipSync(vUrl, aiRes.voice.fallbackUrl);
      } else {
        const ttsRes = await apiBridge.generateTTS(ttsLine);
        if (ttsRes && ttsRes.audioDataUrl) {
          playAudioWithLipSync(ttsRes.audioDataUrl);
        }
        if (ttsRes && ttsRes.error && ttsRes.source === 'local_preset') {
          bubbleText.innerHTML += '<br><span style="color:#f8c258; font-size:11px; font-weight:600;">⚠️ MiniMax 帳戶額度不足(1008)，已自動使用本機鶴ひろみ原聲播放</span>';
        }
      }
    }
  } catch (err) {
    console.error('對話出錯:', err);
    showSpeech('リンシ、ちょっと通信が不安定みたい。でも私はここにいるわよ。\n（リンシ、連線似乎有點不太穩定呢。但我一直都在這裡陪你喔。）');
  }
}

function showSpeech(text) {
  const formatted = text
    .replace(/\n[（\(](.*?)[）\)]/g, '<br><span style="color:#666; font-size:12.5px;">（$1）</span>')
    .replace(/\n/g, '<br>');
  bubbleText.innerHTML = formatted;
  speechBubble.classList.remove('hidden');
}

function showBubblePhoto(photo) {
  if (!photo || !bubblePhotoCard) return;
  currentBubblePhoto = photo;
  bubblePhotoImg.src = photo.imageUrl;
  bubblePhotoTitle.textContent = `📸 ${photo.title || '情侶 POV 自拍'}`;
  bubblePhotoCard.classList.remove('hidden');
  speechBubble.classList.add('has-photo');
}

function hideBubblePhoto() {
  if (!bubblePhotoCard) return;
  bubblePhotoCard.classList.add('hidden');
  speechBubble.classList.remove('has-photo');
}


// 音訊路徑安全解析（同時適配 Electron file:// 與 Web http:// 伺服器）
function resolveAudioUrl(categoryOrUrl, filename) {
  if (filename) {
    return `assets/audio/${encodeURIComponent(categoryOrUrl)}/${encodeURIComponent(filename)}`;
  }
  if (!categoryOrUrl) return '';
  if (typeof categoryOrUrl === 'string') {
    if (categoryOrUrl.startsWith('data:') || categoryOrUrl.startsWith('http:') || categoryOrUrl.startsWith('https:')) {
      return categoryOrUrl;
    }
    if (categoryOrUrl.startsWith('/audio/')) {
      return `assets/audio/${categoryOrUrl.substring('/audio/'.length)}`;
    }
  }
  return categoryOrUrl;
}

// 音訊播放與真實嘴巴開合（Lip-Sync 口パク）同步驅動引擎 (支援音樂自動避讓 Auto-Ducking)
function playAudioWithLipSync(audioUrl, fallbackUrl) {
  if (currentVoiceAudio) {
    currentVoiceAudio.pause();
    currentVoiceAudio = null;
  }
  stopLipSync();

  // BGM 自動降音避讓 (Auto-Ducking)
  duckBgm(true);

  const primaryUrl = resolveAudioUrl(audioUrl);
  currentVoiceAudio = new Audio(primaryUrl);
  currentVoiceAudio.volume = currentConfig.volume !== undefined ? currentConfig.volume : 0.8;

  let triedVoiceFallback = false;
  currentVoiceAudio.addEventListener('error', (e) => {
    if (!triedVoiceFallback) {
      triedVoiceFallback = true;
      let fb = fallbackUrl;
      if (!fb && typeof audioUrl === 'string' && !audioUrl.startsWith('data:')) {
        const raw = audioUrl.replace(/^(\/audio\/|assets\/audio\/)/, '');
        fb = `${SERVER_BASE}/audio/${raw}`;
      }
      if (fb) {
        console.warn(`[Voice Audio] Local play failed (${primaryUrl}), trying fallback: ${fb}`);
        currentVoiceAudio.src = fb;
        currentVoiceAudio.load();
        currentVoiceAudio.play().catch(err => {
          console.warn('[Voice Audio] Fallback failed:', err);
          stopLipSync();
          duckBgm(false);
        });
      }
    }
  });

  let analyserWorked = false;

  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    const source = audioContext.createMediaElementSource(currentVoiceAudio);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.4;
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    speakingIndicator.classList.remove('hidden');
    characterAvatar.classList.add('talking');

    currentVoiceAudio.play().then(() => {
      analyserWorked = true;
      let lastState = 'idle';
      let holdFrames = 0;

      lipSyncInterval = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        
        let sum = 0;
        const speechBins = Math.min(bufferLength, 24);
        for (let i = 1; i < speechBins; i++) {
          sum += dataArray[i];
        }
        const voiceEnergy = sum / (speechBins - 1);

        let targetState = 'idle';
        if (voiceEnergy > 26) {
          targetState = 'open';
        } else if (voiceEnergy > 9) {
          targetState = 'half';
        } else {
          targetState = 'idle';
        }

        if (targetState !== lastState) {
          holdFrames++;
          if (holdFrames >= 2 || (targetState === 'open' && lastState === 'idle')) {
            setMouthState(targetState);
            lastState = targetState;
            holdFrames = 0;
          }
        } else {
          holdFrames = 0;
        }
      }, 40);
    }).catch(err => {
      console.warn('音訊播放限制:', err);
      if (!triedVoiceFallback && fallbackUrl) {
        triedVoiceFallback = true;
        currentVoiceAudio.src = fallbackUrl;
        currentVoiceAudio.load();
        currentVoiceAudio.play().catch(e => duckBgm(false));
      } else {
        duckBgm(false);
      }
    });

    currentVoiceAudio.onended = () => {
      stopLipSync();
      duckBgm(false);
    };
    currentVoiceAudio.onerror = () => {
      stopLipSync();
      duckBgm(false);
    };
  } catch (e) {
    console.warn('AudioContext 串接未果，啟動備用口型計時器:', e);
    speakingIndicator.classList.remove('hidden');
    characterAvatar.classList.add('talking');
    currentVoiceAudio.play().catch(e => {
      console.warn(e);
      duckBgm(false);
    });

    let step = 0;
    const pattern = ['idle', 'half', 'open', 'open', 'half', 'idle', 'half', 'open', 'half'];
    lipSyncInterval = setInterval(() => {
      setMouthState(pattern[step % pattern.length]);
      step++;
    }, 90);

    currentVoiceAudio.onended = () => {
      stopLipSync();
      duckBgm(false);
    };
    currentVoiceAudio.onerror = () => {
      stopLipSync();
      duckBgm(false);
    };
  }
}

function stopLipSync() {
  if (lipSyncInterval) {
    clearInterval(lipSyncInterval);
    lipSyncInterval = null;
  }
  stopSaxPerformance(true);
  speakingIndicator.classList.add('hidden');
  characterAvatar.classList.remove('talking');
  setMouthState('idle');
}

// -------------------------------------------------------------
// 🎷 5 張插圖動態薩克斯風吹奏演出引擎 (5-Illustration Saxophone Performance Engine)
// -------------------------------------------------------------
function setSaxFrame(frameUrl, immediate = false) {
  if (imgTalkOpen) {
    imgTalkOpen.classList.add('hidden');
    imgTalkOpen.classList.remove('active');
  }
  characterAvatar.classList.remove('talking');
  characterAvatar.classList.add('sax-performing');

  if (immediate || !imgTalkHalf) {
    imgIdle.src = frameUrl;
    imgIdle.classList.remove('hidden');
    imgIdle.classList.add('active');
    if (imgTalkHalf) {
      imgTalkHalf.classList.add('hidden');
      imgTalkHalf.classList.remove('active');
    }
    activeSaxBuffer = 'idle';
    return;
  }

  // 雙緩衝柔和疊化切換 (imgIdle <-> imgTalkHalf)
  if (activeSaxBuffer === 'idle') {
    imgTalkHalf.src = frameUrl;
    imgTalkHalf.classList.remove('hidden');
    imgTalkHalf.classList.add('active');
    imgIdle.classList.add('hidden');
    imgIdle.classList.remove('active');
    activeSaxBuffer = 'half';
  } else {
    imgIdle.src = frameUrl;
    imgIdle.classList.remove('hidden');
    imgIdle.classList.add('active');
    imgTalkHalf.classList.add('hidden');
    imgTalkHalf.classList.remove('active');
    activeSaxBuffer = 'idle';
  }
}

function stopSaxPerformance(restoreCostumeSprites = true) {
  if (saxPerformanceInterval) {
    clearInterval(saxPerformanceInterval);
    saxPerformanceInterval = null;
  }
  if (saxNoteEffectInterval) {
    clearInterval(saxNoteEffectInterval);
    saxNoteEffectInterval = null;
  }
  if (isSaxPerforming) {
    isSaxPerforming = false;
    characterAvatar.classList.remove('sax-performing');
    activeSaxBuffer = 'idle';
    if (restoreCostumeSprites) {
      const costume = COSTUMES.find(c => c.id === currentConfig.currentCostume) || COSTUMES[0];
      const idleSrc = costume.imageIdle || costume.image;
      const halfSrc = costume.imageTalkHalf || idleSrc;
      const openSrc = costume.imageTalkOpen || idleSrc;
      imgIdle.src = idleSrc;
      if (imgTalkHalf) imgTalkHalf.src = halfSrc;
      if (imgTalkOpen) imgTalkOpen.src = openSrc;
      setMouthState('idle');
    }
  }
}

function playSaxophonePerformance(audioUrl, fallbackUrl) {
  if (currentVoiceAudio) {
    currentVoiceAudio.pause();
    currentVoiceAudio = null;
  }
  stopLipSync();
  duckBgm(true);

  isSaxPerforming = true;
  currentSaxFrameIdx = 0;
  // 立即呈現第 1 張吹奏畫面 (夕陽窗邊水手服含吹嘴吹奏 sax_play_2.png)
  setSaxFrame(SAX_PERFORMANCE_FRAMES[currentSaxFrameIdx], true);
  speakingIndicator.classList.remove('hidden');

  // 吹奏期間定時飄出音符與薩克斯風特效
  saxNoteEffectInterval = setInterval(() => {
    if (!isSaxPerforming) return;
    const rect = characterAvatar.getBoundingClientRect();
    const effX = rect.left + rect.width * (0.35 + Math.random() * 0.3);
    const effY = rect.top + rect.height * (0.28 + Math.random() * 0.25);
    createFloatingEffect(effX, effY, ['🎷', '🎵', '🎶', '✨']);
  }, 1600);

  // 每 3.0 秒流暢輪播 5 張薩克斯風吹奏插圖
  saxPerformanceInterval = setInterval(() => {
    if (!isSaxPerforming) return;
    currentSaxFrameIdx = (currentSaxFrameIdx + 1) % SAX_PERFORMANCE_FRAMES.length;
    setSaxFrame(SAX_PERFORMANCE_FRAMES[currentSaxFrameIdx], false);
  }, 3000);

  if (currentConfig.voiceMode === 'mute') {
    // 靜音模式下仍展示 18 秒完整 5 張吹奏畫面輪播
    setTimeout(() => {
      if (isSaxPerforming) {
        stopLipSync();
        duckBgm(false);
      }
    }, 18000);
    return;
  }

  const primaryUrl = resolveAudioUrl(audioUrl);
  currentVoiceAudio = new Audio(primaryUrl);
  currentVoiceAudio.volume = currentConfig.volume !== undefined ? currentConfig.volume : 0.8;

  let triedFallback = false;
  currentVoiceAudio.addEventListener('error', () => {
    if (!triedFallback && fallbackUrl) {
      triedFallback = true;
      currentVoiceAudio.src = fallbackUrl;
      currentVoiceAudio.load();
      currentVoiceAudio.play().catch(() => {
        stopLipSync();
        duckBgm(false);
      });
    }
  });

  currentVoiceAudio.play().catch(err => {
    console.warn('[Sax Performance] Play error, trying fallback:', err);
    if (!triedFallback && fallbackUrl) {
      triedFallback = true;
      currentVoiceAudio.src = fallbackUrl;
      currentVoiceAudio.load();
      currentVoiceAudio.play().catch(() => {
        stopLipSync();
        duckBgm(false);
      });
    }
  });

  currentVoiceAudio.onended = () => {
    stopLipSync();
    duckBgm(false);
  };
}

// 點擊立繪親暱彩蛋反應 (原聲優先)
async function handleCharacterPoke(e) {
  createFloatingEffect(e ? e.clientX : window.innerWidth / 2, e ? e.clientY : window.innerHeight / 2, ['❤️', '✨', '🎷', '☕', '🎵', '💖']);

  if (currentConfig.voiceMode === 'mute') {
    const pokes = [
      "もう、リンシ……急に触らないでよ！\n（真是的，リンシ……別突然戳我啦！）",
      "ふふっ、会いたかったの？素直じゃないんだから。\n（呵呵、想我了嗎？真是不坦率呢。）",
      "な、何よ……私の顔に何かついてる？\n（怎、怎麼了……我臉上有東西嗎？）"
    ];
    showSpeech(pokes[Math.floor(Math.random() * pokes.length)]);
    return;
  }

  if (currentConfig.voiceMode === 'authentic') {
    try {
      const voice = await apiBridge.getPokeVoice();
      if (voice && (voice.audioUrl || voice.filename)) {
        showSpeech(voice.fullText);
        const urlToPlay = voice.audioUrl || `assets/audio/${encodeURIComponent(voice.category)}/${encodeURIComponent(voice.filename)}`;
        playAudioWithLipSync(urlToPlay, voice.fallbackUrl);
        return;
      }
    } catch (err) {
      console.warn('取得原聲觸摸語音失敗，轉用 TTS:', err);
    }
  }

  // MiniMax TTS Fallback
  const reaction = {
    reply: `${currentConfig.userName || 'リンシ'}……ふふっ、本当に甘えん坊なんだから。\n（${currentConfig.userName || 'リンシ'}……呵呵、真是個愛撒嬌的傢伙。）`,
    tts: `${currentConfig.userName || 'リンシ'}、ふふっ、本当に甘えん坊なんだから。`
  };
  showSpeech(reaction.reply);
  apiBridge.generateTTS(reaction.tts).then(res => {
    if (res && res.audioDataUrl) playAudioWithLipSync(res.audioDataUrl);
  });
}

// 心動快捷動作處理 (Bento, Curry, Confess, Sleep, Selfie, Comfort, Sax, Poke)
async function handleQuickAction(actionId) {
  const rect = characterAvatar.getBoundingClientRect();
  const effX = rect.left + rect.width / 2;
  const effY = rect.top + rect.height * 0.4;

  const iconMap = {
    assistant: ['⏰', '📝', '✨'],
    couple_care: ['💞', '🫂', '💖', '🥰'],
    bento: ['🍱', '🥢', '✨'],
    curry: ['🍛', '🥄', '✨'],
    confess: ['💌', '💖', '💍'],
    sleep: ['🌙', '⭐', '💤', '🛌'],
    selfie: ['📸', '💖', '✨', '🥰'],
    whatsup: ['❓', '💭', '🌸', '🫂', '✨', '💖'],
    comfort: ['🌸', '🍃', '🫂'],
    sax: ['🎷', '🎵', '🎶', '✨'],
    poke: ['💖', '✨', '🐾', '🥰']
  };
  createFloatingEffect(effX, effY, iconMap[actionId] || ['✨', '💖']);

  if (actionId === 'assistant') {
    openAssistantModalWithTab('todo');
    return;
  }

  if (actionId === 'couple_care') {
    openAssistantModalWithTab('couple');
    return;
  }

  if (actionId === 'selfie') {
    await triggerCoupleSelfie();
    return;
  }

  // 記錄快捷互動好感度
  apiBridge.recordActionMemory(actionId).then(res => {
    if (res && res.memory) {
      memoryState = res.memory;
      updateMemoryAndAffectionUI(memoryState);
    }
  }).catch(() => {});

  if (actionId === 'sleep') {
    triggerBedtimeCoax(true);
    return;
  }

  if (actionId === 'poke') {
    handleCharacterPoke();
    return;
  }

  if (actionId === 'sax') {
    // 若正在吹奏中再次點擊「🎷 吹薩克斯」，立即切換至下一張吹奏插圖並繼續演奏！
    if (isSaxPerforming) {
      currentSaxFrameIdx = (currentSaxFrameIdx + 1) % SAX_PERFORMANCE_FRAMES.length;
      setSaxFrame(SAX_PERFORMANCE_FRAMES[currentSaxFrameIdx], false);
      return;
    }
    applyCostume('sax', false);
    const name = currentConfig.userName || 'リンシ';
    showSpeech(`サックスの音色、聴きたいの？${name}のために、とっておきの曲を吹いてあげるね🎷\n（想聽薩克斯風的旋律嗎？為了${name}，我會為你吹奏特別挑選的曲子喔🎷）`);
    playSaxophonePerformance('assets/audio/配樂/Kimagure Orange Road OST - Madoka no Teema - HQ Audio.mp3', `${SERVER_BASE}/audio/%E9%85%8D%E6%A8%82/Kimagure%20Orange%20Road%20OST%20-%20Madoka%20no%20Teema%20-%20HQ%20Audio.mp3`);
    return;
  }

  if (currentConfig.voiceMode === 'mute') {
    return;
  }

  try {
    const voice = await apiBridge.getActionVoice(actionId);
    if (voice && (voice.audioUrl || voice.filename)) {
      showSpeech(voice.fullText);
      const urlToPlay = voice.audioUrl || `assets/audio/${encodeURIComponent(voice.category)}/${encodeURIComponent(voice.filename)}`;
      playAudioWithLipSync(urlToPlay, voice.fallbackUrl);
    }
  } catch (err) {
    console.error('播放快捷動作語音失敗:', err);
  }
}

function createFloatingEffect(x, y, icons = ['❤️', '✨', '🎷', '☕', '🎵', '💖']) {
  const icon = icons[Math.floor(Math.random() * icons.length)];
  const el = document.createElement('div');
  el.className = 'floating-effect';
  el.textContent = icon;

  const rect = characterAvatar.getBoundingClientRect();
  const relX = x - rect.left;
  const relY = y - rect.top;

  el.style.left = `${relX - 10}px`;
  el.style.top = `${relY - 10}px`;

  effectContainer.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

// -------------------------------------------------------------
// 🎵 古靈精怪留聲機 (BGM & OST Jukebox 播放核心)
// -------------------------------------------------------------
function setupMusicJukeboxUI() {
  currentTrackList = currentMusicTab === 'bgm' ? (audioLibrary.bgm || []) : (audioLibrary.ost || []);
  renderMusicTrackList();

  if (currentTrackList.length > 0) {
    updateNowPlayingInfo(currentTrackList[0]);
  }
}

function renderMusicTrackList() {
  musicTrackList.innerHTML = '';
  currentTrackList.forEach((track, index) => {
    const item = document.createElement('div');
    const isCur = currentTrackIndex === index && isMusicPlaying;
    item.className = `track-item ${isCur ? 'active' : ''}`;
    item.innerHTML = `
      <div class="track-item-info">
        <span class="track-item-title">${track.title}</span>
        <span class="track-item-subtitle">${track.subtitle || track.artist || track.mood || ''}</span>
      </div>
      <span class="track-item-badge">${isCur ? '▶ 播放中' : (track.category || '')}</span>
    `;
    item.addEventListener('click', () => {
      playTrackByIndex(index);
    });
    musicTrackList.appendChild(item);
  });
}

function setupMusicControls() {
  // 分類切換 (BGM / OST)
  document.querySelectorAll('.music-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.music-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMusicTab = btn.dataset.tab;
      currentTrackList = currentMusicTab === 'bgm' ? (audioLibrary.bgm || []) : (audioLibrary.ost || []);
      currentTrackIndex = 0;
      renderMusicTrackList();
      if (currentTrackList.length > 0 && !isMusicPlaying) {
        updateNowPlayingInfo(currentTrackList[0]);
      }
    });
  });

  // 播放 / 暫停
  btnMusicPlay.addEventListener('click', () => {
    if (isMusicPlaying) {
      pauseBgm();
    } else {
      if (!currentBgmAudio) {
        playTrackByIndex(currentTrackIndex);
      } else {
        resumeBgm();
      }
    }
  });

  // 上一首 / 下一首
  btnMusicPrev.addEventListener('click', playPrevTrack);
  btnMusicNext.addEventListener('click', playNextTrack);

  // 播放模式切換
  btnMusicMode.addEventListener('click', () => {
    if (playbackMode === 'loop') {
      playbackMode = 'single';
      btnMusicMode.textContent = '🔂';
      btnMusicMode.title = '播放模式：單曲循環';
    } else if (playbackMode === 'single') {
      playbackMode = 'shuffle';
      btnMusicMode.textContent = '🔀';
      btnMusicMode.title = '播放模式：隨機播放';
    } else {
      playbackMode = 'loop';
      btnMusicMode.textContent = '🔁';
      btnMusicMode.title = '播放模式：列表循環';
    }
  });

  // 音量微調
  if (musicVol) {
    musicVol.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      musicVolVal.textContent = `${Math.round(v * 100)}%`;
      if (cfgBgmVol) {
        cfgBgmVol.value = v;
        bgmVolValue.textContent = `${Math.round(v * 100)}%`;
      }
      setBgmVolume(v);
    });
  }
}

function playTrackByIndex(index) {
  if (!currentTrackList || currentTrackList.length === 0) return;
  if (index < 0) index = currentTrackList.length - 1;
  if (index >= currentTrackList.length) index = 0;

  currentTrackIndex = index;
  const track = currentTrackList[index];
  updateNowPlayingInfo(track);

  if (currentBgmAudio) {
    currentBgmAudio.pause();
    currentBgmAudio = null;
  }

  const primaryUrl = `assets/audio/${encodeURIComponent(track.category)}/${encodeURIComponent(track.filename)}`;
  const fallbackUrl = `${SERVER_BASE}/audio/${encodeURIComponent(track.category)}/${encodeURIComponent(track.filename)}`;

  currentBgmAudio = new Audio(primaryUrl);
  currentBgmAudio.volume = currentConfig.bgmVolume !== undefined ? currentConfig.bgmVolume : 0.45;

  let triedFallback = false;
  currentBgmAudio.addEventListener('error', (e) => {
    if (!triedFallback) {
      triedFallback = true;
      console.warn(`[Jukebox] Primary path failed (${primaryUrl}), trying fallback: ${fallbackUrl}`);
      currentBgmAudio.src = fallbackUrl;
      currentBgmAudio.load();
      currentBgmAudio.play().then(() => {
        isMusicPlaying = true;
        btnMusicPlay.textContent = '⏸';
        vinylDisc.classList.remove('paused');
        renderMusicTrackList();
      }).catch(err => {
        console.error('[Jukebox] Playback failed for both local and HTTP fallback:', err);
        isMusicPlaying = false;
        btnMusicPlay.textContent = '▶';
        vinylDisc.classList.add('paused');
      });
    }
  });

  currentBgmAudio.play().then(() => {
    isMusicPlaying = true;
    btnMusicPlay.textContent = '⏸';
    vinylDisc.classList.remove('paused');
    renderMusicTrackList();
  }).catch(err => {
    console.warn('[Jukebox] Initial play() rejected, trying fallback:', err);
    if (!triedFallback) {
      triedFallback = true;
      currentBgmAudio.src = fallbackUrl;
      currentBgmAudio.load();
      currentBgmAudio.play().then(() => {
        isMusicPlaying = true;
        btnMusicPlay.textContent = '⏸';
        vinylDisc.classList.remove('paused');
        renderMusicTrackList();
      }).catch(e => {
        isMusicPlaying = false;
        btnMusicPlay.textContent = '▶';
        vinylDisc.classList.add('paused');
      });
    }
  });

  currentBgmAudio.onended = () => {
    if (playbackMode === 'single') {
      currentBgmAudio.currentTime = 0;
      currentBgmAudio.play();
    } else if (playbackMode === 'shuffle') {
      const nextIndex = Math.floor(Math.random() * currentTrackList.length);
      playTrackByIndex(nextIndex);
    } else {
      playNextTrack();
    }
  };
}

function pauseBgm() {
  if (currentBgmAudio) {
    currentBgmAudio.pause();
  }
  isMusicPlaying = false;
  btnMusicPlay.textContent = '▶';
  vinylDisc.classList.add('paused');
  renderMusicTrackList();
}

function resumeBgm() {
  if (currentBgmAudio) {
    currentBgmAudio.play().then(() => {
      isMusicPlaying = true;
      btnMusicPlay.textContent = '⏸';
      vinylDisc.classList.remove('paused');
      renderMusicTrackList();
    });
  }
}

function playNextTrack() {
  if (playbackMode === 'shuffle') {
    const nextIdx = Math.floor(Math.random() * currentTrackList.length);
    playTrackByIndex(nextIdx);
  } else {
    playTrackByIndex(currentTrackIndex + 1);
  }
}

function playPrevTrack() {
  playTrackByIndex(currentTrackIndex - 1);
}

function updateNowPlayingInfo(track) {
  if (!track) return;
  musicNowTitle.textContent = track.title;
  musicNowSubtitle.textContent = track.subtitle || track.artist || track.mood || '古靈精怪經典原聲';
}

function setBgmVolume(vol) {
  currentConfig.bgmVolume = vol;
  if (currentBgmAudio) {
    currentBgmAudio.volume = vol;
  }
  apiBridge.saveConfig({ bgmVolume: vol });
}

// 語音播放時自動讓 BGM 降低音量 (Auto-Ducking)
function duckBgm(duck) {
  if (!currentBgmAudio) return;
  const baseVol = currentConfig.bgmVolume !== undefined ? currentConfig.bgmVolume : 0.45;
  if (duck) {
    currentBgmAudio.volume = baseVol * 0.25;
  } else {
    currentBgmAudio.volume = baseVol;
  }
}

// 晚間 11:00 後定時提醒「撒嬌」陪睡引擎 (Bedtime Affection & Coaxing Engine)
let lastBedtimeWindow = '';

async function triggerBedtimeCoax(isManual = false) {
  // 1. 若開啟了時段自動換裝，深夜自動換上溫暖毛衣(night)或居家服(home)
  if (currentConfig.autoTimeCostume !== false && currentConfig.currentCostume !== 'night' && currentConfig.currentCostume !== 'home' && currentConfig.currentCostume !== 'bath') {
    applyCostume('night', false);
  }

  // 2. 噴射溫馨夜晚睡意特效
  const rect = characterAvatar.getBoundingClientRect();
  const effX = rect.left + rect.width / 2;
  const effY = rect.top + rect.height * 0.4;
  for (let i = 0; i < 4; i++) {
    setTimeout(() => {
      createFloatingEffect(effX + (Math.random() * 40 - 20), effY + (Math.random() * 30 - 15), ['🌙', '⭐', '💤', '💖', '🛌']);
    }, i * 220);
  }

  // 3. 取得撒嬌陪睡專屬語音
  try {
    const voice = await apiBridge.getBedtimeVoice();
    if (voice && (voice.audioUrl || voice.filename)) {
      showSpeech(voice.fullText);
      if (currentConfig.voiceMode !== 'mute') {
        const urlToPlay = voice.audioUrl || `assets/audio/${encodeURIComponent(voice.category)}/${encodeURIComponent(voice.filename)}`;
        playAudioWithLipSync(urlToPlay, voice.fallbackUrl);
      }
    }
  } catch (err) {
    console.warn('撒嬌陪睡語音載入失敗:', err);
    const name = currentConfig.userName || 'リンシ';
    showSpeech(`ねえ、${name}……もう夜の11時過ぎよ？まだパソコン見てるの？早くベッドに来て……一緒に寝ましょ？\n（吶、${name}……已經超過晚上11點了喔？還在看電腦嗎？快點進被窩來……一起睡好嗎？）`);
  }
}

function checkBedtimeReminder() {
  if (currentConfig.bedtimeReminder === false) return;
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  // 晚間 11:00 後 (23:00 ~ 05:00)
  if (hour >= 23 || hour < 5) {
    const windowKey = `${hour}:${Math.floor(minute / 30)}`;
    if (lastBedtimeWindow !== windowKey) {
      lastBedtimeWindow = windowKey;
      triggerBedtimeCoax(false);
    }
  }
}

// 每 15 分鐘檢查一次時段造型，每 30 秒檢查一次晚間 11:00 後撒嬌陪睡提醒
function setupIdleGreetings() {
  setInterval(() => {
    checkTimeBasedCostume(true);
  }, 15 * 60 * 1000);

  setInterval(() => {
    checkBedtimeReminder();
  }, 30 * 1000);

  // 啟動 3 秒後進行初次晚間陪睡檢查
  setTimeout(() => {
    checkBedtimeReminder();
  }, 3000);
}

// -------------------------------------------------------------
// 💖 永久對話記憶與好感度日記 + 📸 情侶 POV 自拍 & PixAI 指令集模組
// -------------------------------------------------------------
function setupMemoryAndPovListeners() {
  const openMemoryModal = async () => {
    try {
      memoryState = await apiBridge.getMemoryState();
      updateMemoryAndAffectionUI(memoryState);
    } catch (e) {}
    if (memoryModal) memoryModal.classList.remove('hidden');
  };

  if (btnMemory) btnMemory.addEventListener('click', openMemoryModal);
  if (affectionBadge) affectionBadge.addEventListener('click', openMemoryModal);
  if (btnCloseMemory) btnCloseMemory.addEventListener('click', () => memoryModal.classList.add('hidden'));

  if (btnPov) {
    btnPov.addEventListener('click', async () => {
      try {
        povData = await apiBridge.getPovData();
        renderPovGalleryAndPrompts();
      } catch (e) {}
      if (povModal) povModal.classList.remove('hidden');
    });
  }
  if (btnClosePov) btnClosePov.addEventListener('click', () => povModal.classList.add('hidden'));

  // 對話輸入框旁的 📸 立即自拍鍵
  if (btnQuickSelfie) {
    btnQuickSelfie.addEventListener('click', () => {
      triggerCoupleSelfie();
    });
  }

  // 氣泡內拍立得小卡按鈕
  if (bubblePhotoImg) {
    bubblePhotoImg.addEventListener('click', () => {
      if (currentBubblePhoto) openPhotoLightbox(currentBubblePhoto);
    });
  }
  if (btnBubbleZoom) {
    btnBubbleZoom.addEventListener('click', () => {
      if (currentBubblePhoto) openPhotoLightbox(currentBubblePhoto);
    });
  }
  if (btnBubblePrompt) {
    btnBubblePrompt.addEventListener('click', () => {
      if (currentBubblePhoto && currentBubblePhoto.pixaiPrompt) {
        copyTextToClipboard(currentBubblePhoto.pixaiPrompt, '已複製此張情侶 POV 照片的 PixAI 繪圖指令！');
      }
    });
  }
  if (btnBubbleClosePhoto) {
    btnBubbleClosePhoto.addEventListener('click', () => hideBubblePhoto());
  }

  // 記憶日記分頁切換
  document.querySelectorAll('.memory-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.memory-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.getAttribute('data-memtab');
      const panelFacts = document.getElementById('mem-panel-facts');
      const panelLogs = document.getElementById('mem-panel-logs');
      if (tab === 'facts') {
        panelFacts.classList.remove('hidden');
        panelLogs.classList.add('hidden');
      } else {
        panelFacts.classList.add('hidden');
        panelLogs.classList.remove('hidden');
      }
    });
  });

  // 新增永久記憶事項
  const inputNewFact = document.getElementById('input-new-fact');
  const btnAddFact = document.getElementById('btn-add-fact');
  const handleAddFact = async () => {
    if (!inputNewFact) return;
    const val = inputNewFact.value.trim();
    if (!val) return;
    inputNewFact.value = '';
    const res = await apiBridge.addMemoryFact(val, 'user_note');
    if (res && res.memory) {
      memoryState = res.memory;
      updateMemoryAndAffectionUI(memoryState);
      const name = currentConfig.userName || 'リンシ';
      showSpeech(`ちゃんと心に刻んだわよ、${name}！「${val}」……私たちの大切な記憶として、ずっと覚えておくからね💖\n（已經好好記在心底囉，${name}！「${val}」……作為我們珍貴的記憶，我會永遠記住並在對話中放在心上的💖）`);
      const rect = characterAvatar.getBoundingClientRect();
      createFloatingEffect(rect.left + rect.width / 2, rect.top + rect.height * 0.35, ['📌', '💖', '✨']);
    }
  };
  if (btnAddFact) btnAddFact.addEventListener('click', handleAddFact);
  if (inputNewFact) {
    inputNewFact.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleAddFact();
    });
  }

  // 搜尋與清空對話紀錄
  const inputSearchLog = document.getElementById('input-search-log');
  if (inputSearchLog) {
    inputSearchLog.addEventListener('input', () => {
      renderMemoryLogsList(memoryState ? memoryState.conversationLog : [], inputSearchLog.value.trim());
    });
  }
  const btnClearLogs = document.getElementById('btn-clear-logs');
  if (btnClearLogs) {
    btnClearLogs.addEventListener('click', async () => {
      if (!confirm('確定要清空歷史對話紀錄嗎？（好感度與永久記憶備忘錄會完整保留）')) return;
      const res = await apiBridge.clearChatHistory();
      if (res && res.memory) {
        memoryState = res.memory;
        chatHistory = [];
        updateMemoryAndAffectionUI(memoryState);
      }
    });
  }

  // POV 相簿 & PixAI 指令集分頁切換
  document.querySelectorAll('.pov-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pov-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.getAttribute('data-povtab');
      const panelGallery = document.getElementById('pov-panel-gallery');
      const panelPrompts = document.getElementById('pov-panel-prompts');
      if (tab === 'gallery') {
        panelGallery.classList.remove('hidden');
        panelPrompts.classList.add('hidden');
      } else {
        panelGallery.classList.add('hidden');
        panelPrompts.classList.remove('hidden');
      }
    });
  });

  // POV 模態框內的「現在自拍一張發給我」
  const btnPovSnapRandom = document.getElementById('btn-pov-snap-random');
  if (btnPovSnapRandom) {
    btnPovSnapRandom.addEventListener('click', async () => {
      if (povModal) povModal.classList.add('hidden');
      await triggerCoupleSelfie();
    });
  }

  // 匯入自訂 PixAI 新照片
  const inputImportPovFile = document.getElementById('input-import-pov-file');
  if (inputImportPovFile) {
    inputImportPovFile.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async () => {
        const defaultTitle = file.name.replace(/\.[^.]+$/, '');
        const title = prompt('請輸入這張情侶 POV 照片的標題：', defaultTitle) || defaultTitle;
        const pixaiPrompt = prompt('（選填）貼上這張照片的 PixAI 繪圖指令以供日後複製：', '') || '';
        const res = await apiBridge.importPovPhoto({
          title,
          dataUrl: reader.result,
          pixaiPrompt
        });
        if (res && res.success) {
          povData = await apiBridge.getPovData();
          renderPovGalleryAndPrompts();
          if (res.photo) {
            if (povModal) povModal.classList.add('hidden');
            deliverPovPhotoToChat(res.photo);
          }
        }
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    });
  }

  // 智慧自訂場景 → PixAI 英文指令產生器
  const inputPixaiScene = document.getElementById('input-pixai-scene');
  const selectPixaiLens = document.getElementById('select-pixai-lens');
  const btnGenPixai = document.getElementById('btn-gen-pixai');
  const pixaiGenResult = document.getElementById('pixai-gen-result');
  const textareaPixaiOutput = document.getElementById('textarea-pixai-output');

  const handleGeneratePixai = async () => {
    const scene = inputPixaiScene ? inputPixaiScene.value.trim() : '';
    const lens = selectPixaiLens ? selectPixaiLens.value : '50mm';
    const res = await apiBridge.generatePixAIPrompt(scene || 'romantic couple date with Madoka', lens, 'golden hour');
    if (res && res.prompt) {
      lastGeneratedPixAI = res;
      if (textareaPixaiOutput) textareaPixaiOutput.value = res.prompt;
      if (pixaiGenResult) pixaiGenResult.classList.remove('hidden');
    }
  };
  if (btnGenPixai) btnGenPixai.addEventListener('click', handleGeneratePixai);

  const btnCopyGenPrompt = document.getElementById('btn-copy-gen-prompt');
  if (btnCopyGenPrompt) {
    btnCopyGenPrompt.addEventListener('click', () => {
      if (textareaPixaiOutput && textareaPixaiOutput.value) {
        copyTextToClipboard(textareaPixaiOutput.value, '已複製正面 PixAI Prompt！');
      }
    });
  }
  const btnCopyGenNeg = document.getElementById('btn-copy-gen-neg');
  if (btnCopyGenNeg) {
    btnCopyGenNeg.addEventListener('click', () => {
      const neg = (lastGeneratedPixAI && lastGeneratedPixAI.negativePrompt) || povData.commonNegativePrompt || '';
      if (neg) copyTextToClipboard(neg, '已複製 Negative Prompt（負面排除詞）！');
    });
  }
  const btnCopyCharLock = document.getElementById('btn-copy-char-lock');
  if (btnCopyCharLock) {
    btnCopyCharLock.addEventListener('click', () => {
      const lock = (lastGeneratedPixAI && lastGeneratedPixAI.characterLock) || povData.characterLock || '';
      if (lock) copyTextToClipboard(lock, '已複製鮎川まどか角色鎖定詞 (Character Lock)！');
    });
  }

  // Lightbox 事件
  if (btnCloseLightbox) {
    btnCloseLightbox.addEventListener('click', () => photoLightbox.classList.add('hidden'));
  }
  const btnLightboxSendChat = document.getElementById('btn-lightbox-send-chat');
  if (btnLightboxSendChat) {
    btnLightboxSendChat.addEventListener('click', () => {
      if (currentLightboxPhoto) {
        photoLightbox.classList.add('hidden');
        if (povModal) povModal.classList.add('hidden');
        deliverPovPhotoToChat(currentLightboxPhoto);
      }
    });
  }
  const btnLightboxCopyPrompt = document.getElementById('btn-lightbox-copy-prompt');
  if (btnLightboxCopyPrompt) {
    btnLightboxCopyPrompt.addEventListener('click', () => {
      if (currentLightboxPhoto && currentLightboxPhoto.pixaiPrompt) {
        copyTextToClipboard(currentLightboxPhoto.pixaiPrompt, '已複製此照片的 PixAI 繪圖指令！');
      }
    });
  }
}

async function triggerCoupleSelfie(photoIdOrQuery = '') {
  try {
    const res = await apiBridge.snapPovPhoto(photoIdOrQuery);
    if (res && res.photo) {
      if (res.memory) {
        memoryState = res.memory;
        updateMemoryAndAffectionUI(memoryState);
      }
      deliverPovPhotoToChat(res.photo);
    }
  } catch (err) {
    console.error('自拍發送失敗:', err);
  }
}

function deliverPovPhotoToChat(photo) {
  if (!photo) return;
  if (photo.costumeId) {
    applyCostume(photo.costumeId, false);
  }
  const name = currentConfig.userName || 'リンシ';
  const replyText = (photo.caption || `ほら、${name}、今撮ったツーショットよ📸`)
    .replace(/リンシ/g, name);
  const ttsLine = (photo.tts || replyText.split('\n')[0]).replace(/リンシ/g, name);

  showSpeech(replyText);
  showBubblePhoto(photo);

  const rect = characterAvatar.getBoundingClientRect();
  createFloatingEffect(rect.left + rect.width / 2, rect.top + rect.height * 0.35, ['📸', '💖', '✨', '🥰']);

  if (currentConfig.voiceMode !== 'mute') {
    apiBridge.generateTTS(ttsLine).then(ttsRes => {
      if (ttsRes && ttsRes.audioDataUrl) {
        playAudioWithLipSync(ttsRes.audioDataUrl);
      }
    }).catch(() => {});
  }
}

function openPhotoLightbox(photo) {
  if (!photo || !photoLightbox) return;
  currentLightboxPhoto = photo;
  const img = document.getElementById('lightbox-img');
  const title = document.getElementById('lightbox-title');
  const caption = document.getElementById('lightbox-caption');
  if (img) img.src = photo.imageUrl;
  if (title) title.textContent = `📸 ${photo.title || '情侶 POV 自拍'}`;
  if (caption) caption.innerHTML = (photo.caption || '').replace(/\n/g, '<br>');
  photoLightbox.classList.remove('hidden');
}

let lastDisplayedAffectionLevel = null;

function updateMemoryAndAffectionUI(state) {
  if (!state) return;
  const computedLv = getAffectionLevelInfo(state.affectionScore);
  const lv = (state.levelInfo && state.levelInfo.score === state.affectionScore)
    ? state.levelInfo
    : computedLv;
  state.levelInfo = lv;

  if (lastDisplayedAffectionLevel !== null && lv.level > lastDisplayedAffectionLevel) {
    const rect = characterAvatar.getBoundingClientRect();
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        createFloatingEffect(rect.left + rect.width * (0.3 + Math.random() * 0.4), rect.top + rect.height * 0.35, ['💍', '💖', '👑', '🎉', '✨']);
      }, i * 180);
    }
  }
  lastDisplayedAffectionLevel = lv.level;

  const iconChar = (lv.badge && lv.badge.split(' ')[0]) || '💖';
  if (affectionBadge) {
    affectionBadge.textContent = `${iconChar} ${state.affectionScore}pt・Lv.${lv.level} ${lv.titleZh}`;
  }

  const stageBadge = document.getElementById('mem-stage-badge');
  const stageDesc = document.getElementById('mem-stage-desc');
  const scoreNum = document.getElementById('mem-score-num');
  const progressFill = document.getElementById('mem-progress-fill');
  const statDays = document.getElementById('mem-stat-days');
  const statStreak = document.getElementById('mem-stat-streak');
  const statChats = document.getElementById('mem-stat-chats');
  const statNext = document.getElementById('mem-stat-next');

  if (stageBadge) stageBadge.textContent = `${lv.badge || `Lv.${lv.level} ${lv.titleZh}`} (${lv.titleJa || ''})`;
  if (stageDesc) stageDesc.textContent = lv.descZh || '';
  if (scoreNum) scoreNum.textContent = state.affectionScore;
  if (progressFill) progressFill.style.width = `${lv.progressPercent !== undefined ? lv.progressPercent : 35}%`;
  if (statDays) statDays.textContent = `📅 相伴第 ${state.daysTogether || 1} 天`;
  if (statStreak) statStreak.textContent = `🔥 連續 ${state.streakDays || 1} 天`;
  if (statChats) statChats.textContent = `💬 對話 ${state.totalChats || 0} 次`;
  if (statNext) {
    statNext.textContent = lv.nextMin
      ? `🎯 距離下一階段 (Lv.${lv.level + 1})：${lv.nextMin} pt（還差 ${Math.max(0, lv.nextMin - state.affectionScore)} pt）`
      : '👑 已達成最高羈絆等級（橙路永恆摯愛）！';
  }

  renderMemoryFactsList(state.memoryFacts || []);
  const searchInput = document.getElementById('input-search-log');
  renderMemoryLogsList(state.conversationLog || [], searchInput ? searchInput.value.trim() : '');
}

function renderMemoryFactsList(facts) {
  const listEl = document.getElementById('memory-facts-list');
  if (!listEl) return;
  listEl.innerHTML = '';

  const validFacts = (facts || []).filter(item => {
    const t = item && (item.content || item.text || item.fact || '');
    return String(t).trim().length > 0;
  });

  if (validFacts.length === 0) {
    listEl.innerHTML = '<div style="color:#888; font-size:11.5px; text-align:center; padding:14px 6px;">目前還沒有記錄特別事項喔！你可以在上方手動新增，或在對話中告訴まどか「我喜歡...」、「記住...」，她就會自動寫進永久日記裡💖</div>';
    return;
  }

  validFacts.forEach(item => {
    const row = document.createElement('div');
    row.className = 'mem-fact-item';
    const textVal = String(item.content || item.text || item.fact || '').trim();
    row.innerHTML = `
      <span>📌 ${escapeHtml(textVal)}</span>
      <button class="mem-fact-del" title="刪除此條記憶">✕</button>
    `;
    row.querySelector('.mem-fact-del').addEventListener('click', async () => {
      const res = await apiBridge.deleteMemoryFact(item.id);
      if (res && res.memory) {
        memoryState = res.memory;
        updateMemoryAndAffectionUI(memoryState);
      }
    });
    listEl.appendChild(row);
  });
}

function renderMemoryLogsList(logs, keyword = '') {
  const listEl = document.getElementById('memory-logs-list');
  if (!listEl) return;
  listEl.innerHTML = '';

  const filtered = (logs || []).filter(item => {
    if (!keyword) return true;
    return (item.content || '').toLowerCase().includes(keyword.toLowerCase());
  }).slice().reverse();

  if (filtered.length === 0) {
    listEl.innerHTML = '<div style="color:#888; font-size:11.5px; text-align:center; padding:14px 6px;">尚無符合的對話紀錄。</div>';
    return;
  }

  const userName = currentConfig.userName || 'リンシ';
  filtered.slice(0, 80).forEach(item => {
    const div = document.createElement('div');
    const isUser = item.role === 'user';
    div.className = `mem-log-item ${isUser ? 'user-msg' : ''}`;
    const timeStr = item.timestamp || '';
    const deltaStr = item.affectionDelta ? `<span style="color:#ff85a2;">+${item.affectionDelta}💖</span>` : '';
    div.innerHTML = `
      <div class="mem-log-meta">
        <strong>${isUser ? `🧑 ${escapeHtml(userName)}` : '🎷 まどか'}</strong>
        <span>${escapeHtml(timeStr)} ${deltaStr}</span>
      </div>
      <div>${escapeHtml(item.content).replace(/\n/g, '<br>')}</div>
    `;
    listEl.appendChild(div);
  });
}

function renderPovGalleryAndPrompts() {
  const galleryGrid = document.getElementById('pov-gallery-grid');
  const photos = (povData && povData.photos) ? povData.photos : [];

  if (galleryGrid) {
    galleryGrid.innerHTML = '';
    photos.forEach(photo => {
      const card = document.createElement('div');
      card.className = 'pov-card';
      const titleStr = photo.title || photo.titleZh || photo.titleJa || '情侶 POV 自拍';
      const imgUrl = photo.imageUrl || photo.image;
      card.innerHTML = `
        <img src="${imgUrl}" alt="${escapeHtml(titleStr)}" loading="lazy">
        <div class="pov-card-body">
          <div class="pov-card-title">${escapeHtml(titleStr)}</div>
          <div class="pov-card-btns">
            <button class="btn-pov-zoom">🔍 放大欣賞</button>
            <button class="btn-pov-send">💬 發送互動</button>
          </div>
        </div>
      `;
      card.querySelector('img').addEventListener('click', () => openPhotoLightbox(photo));
      card.querySelector('.btn-pov-zoom').addEventListener('click', () => openPhotoLightbox(photo));
      card.querySelector('.btn-pov-send').addEventListener('click', () => {
        if (povModal) povModal.classList.add('hidden');
        deliverPovPhotoToChat(photo);
      });
      galleryGrid.appendChild(card);
    });
  }
}


function copyTextToClipboard(text, toastMsg) {
  if (!text) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showSpeech(`📋 ${toastMsg}`);
    }).catch(() => {
      fallbackCopy(text, toastMsg);
    });
  } else {
    fallbackCopy(text, toastMsg);
  }
}

function fallbackCopy(text, toastMsg) {
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    showSpeech(`📋 ${toastMsg}`);
  } catch (e) {}
  document.body.removeChild(ta);
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// =============================================================
// ⏰ まどか隨身生活助理 (早晨喚醒鬧鐘 / 待辦清單) + 💞 6 大戀人關懷撒嬌模式與男友加油站
// =============================================================
function openAssistantModalWithTab(tabName = 'todo') {
  apiBridge.getAssistantState().then(st => {
    if (st) {
      assistantState = st;
      renderAssistantAllUI();
    }
  }).catch(() => {});

  if (assistantModal) assistantModal.classList.remove('hidden');
  switchAssistantTab(tabName);
}

function switchAssistantTab(tabName) {
  const norm = (tabName === 'todos' || tabName === 'todo') ? 'todos'
    : (tabName === 'alarms' || tabName === 'alarm') ? 'alarms'
    : 'couple';

  document.querySelectorAll('.assistant-tab-btn').forEach(btn => {
    const raw = btn.getAttribute('data-assttab') || btn.getAttribute('data-asttab');
    const bNorm = (raw === 'todos' || raw === 'todo') ? 'todos'
      : (raw === 'alarms' || raw === 'alarm') ? 'alarms'
      : 'couple';
    if (bNorm === norm) btn.classList.add('active');
    else btn.classList.remove('active');
  });
  const pTodo = document.getElementById('asst-panel-todos') || document.getElementById('ast-panel-todo');
  const pAlarm = document.getElementById('asst-panel-alarms') || document.getElementById('ast-panel-alarm');
  const pCouple = document.getElementById('asst-panel-couple') || document.getElementById('ast-panel-couple');
  if (pTodo) pTodo.classList.toggle('hidden', norm !== 'todos');
  if (pAlarm) pAlarm.classList.toggle('hidden', norm !== 'alarms');
  if (pCouple) pCouple.classList.toggle('hidden', norm !== 'couple');
}

function setupAssistantAndCareListeners() {
  if (btnAssistant) {
    btnAssistant.addEventListener('click', () => openAssistantModalWithTab('todos'));
  }
  if (coupleModeBadge) {
    coupleModeBadge.addEventListener('click', () => openAssistantModalWithTab('couple'));
  }
  if (btnCloseAssistant) {
    btnCloseAssistant.addEventListener('click', () => assistantModal.classList.add('hidden'));
  }

  document.querySelectorAll('.assistant-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchAssistantTab(btn.getAttribute('data-assttab') || btn.getAttribute('data-asttab'));
    });
  });

  // 1. 新增待辦事項 (To-Do)
  const inputTodoTitle = document.getElementById('input-todo-title');
  const selectTodoCategory = document.getElementById('select-todo-category');
  const inputTodoTime = document.getElementById('input-todo-time');
  const btnAddTodo = document.getElementById('btn-add-todo');

  const handleAddTodo = async () => {
    if (!inputTodoTitle) return;
    const title = inputTodoTitle.value.trim();
    if (!title) return;
    const category = selectTodoCategory ? selectTodoCategory.value : 'work';
    const reminderTime = inputTodoTime ? inputTodoTime.value : '';
    inputTodoTitle.value = '';
    if (inputTodoTime) inputTodoTime.value = '';

    const res = await apiBridge.addTodo({ title, category, reminderTime });
    if (res && res.state) {
      assistantState = res.state;
      renderAssistantAllUI();
      showSpeech(`了解よ、リンシ！📝 To-Doに「${title}」${reminderTime ? `（⏰ ${reminderTime}）` : ''}をメモしておいたわ。終わったらチェックしてね！\n（收到囉，リンシ！已經幫你在待辦清單記下「${title}」了，完成後記得打勾讓我誇獎你喔！）`);
    }
  };
  if (btnAddTodo) btnAddTodo.addEventListener('click', handleAddTodo);
  if (inputTodoTitle) {
    inputTodoTitle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleAddTodo();
    });
  }

  // 2. 新增早晨喚醒鬧鐘 (Alarm)
  const inputAlarmTime = document.getElementById('input-alarm-time');
  const selectAlarmMode = document.getElementById('select-alarm-mode');
  const inputAlarmLabel = document.getElementById('input-alarm-label');
  const btnAddAlarm = document.getElementById('btn-add-alarm');

  const handleAddAlarm = async () => {
    const time = inputAlarmTime ? inputAlarmTime.value : '07:30';
    const mode = selectAlarmMode ? selectAlarmMode.value : 'sweet';
    const label = (inputAlarmLabel && inputAlarmLabel.value.trim()) || '早安晨曦喚醒・まどか叫你起床☀️';
    if (inputAlarmLabel) inputAlarmLabel.value = '';

    const res = await apiBridge.addAlarm({ time, mode, label });
    if (res && res.state) {
      assistantState = res.state;
      renderAssistantAllUI();
      showSpeech(`⏰ ${time} に目覚ましアラーム「${label}」をセットしたわよ！朝になったら私が起こしてあげるからね💖\n（已經幫你設定好 ${time} 的喚醒鬧鐘「${label}」囉！到了早上我會親自叫你起床喔💖）`);
    }
  };
  if (btnAddAlarm) btnAddAlarm.addEventListener('click', handleAddAlarm);

  // 立即試聽早晨喚醒畫面與原聲
  const btnTestWakeupNow = document.getElementById('btn-test-wakeup-alarm') || document.getElementById('btn-test-wakeup-now');
  if (btnTestWakeupNow) {
    btnTestWakeupNow.addEventListener('click', async () => {
      const mode = selectAlarmMode ? selectAlarmMode.value : 'sweet';
      if (assistantModal) assistantModal.classList.add('hidden');
      const payload = await apiBridge.triggerAlarm('', mode);
      showWakeupAlarmOverlay(payload);
    });
  }

  // 開啟系統通知權限
  const btnEnableNotify = document.getElementById('btn-enable-notify');
  if (btnEnableNotify) {
    updateNotifyButtonText(btnEnableNotify);
    btnEnableNotify.addEventListener('click', async () => {
      if (!('Notification' in window)) {
        alert('此瀏覽器環境不支援系統通知，但開啟畫面時仍會正常響鈴！');
        return;
      }
      const perm = await Notification.requestPermission();
      updateNotifyButtonText(btnEnableNotify);
      if (perm === 'granted') {
        new Notification('🎷 鮎川まどか 隨身助理', {
          body: 'リンシ、通知の許可ありがとう！これから時間になったらちゃんとお知らせするわね💖',
          icon: 'assets/icon-192.png'
        });
      }
    });
  }

  // 3. 男友心情急救站 (Boyfriend Mood Rescue Buttons)
  document.querySelectorAll('.mood-chip-btn, .mood-rescue-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const moodKey = btn.getAttribute('data-mood');
      if (assistantModal) assistantModal.classList.add('hidden');
      await handlePartnerMoodCare(moodKey);
    });
  });

  // 4. 全螢幕早晨喚醒鬧鐘 Overlay 按鈕
  const btnWakeupDismiss = document.getElementById('btn-wakeup-dismiss');
  const btnWakeupSnooze = document.getElementById('btn-wakeup-snooze');

  if (btnWakeupDismiss) {
    btnWakeupDismiss.addEventListener('click', async () => {
      snoozeUntilTime = '';
      if (wakeupOverlay) wakeupOverlay.classList.add('hidden');
      const name = currentConfig.userName || 'リンシ';
      showSpeech(`おはよう、${name}！今日も一日、私がずっとそばで応援してるからね☀️💖\n（早安，${name}！今天一整天我也會一直在你身邊為你加油喔☀️💖）`);
      const rect = characterAvatar.getBoundingClientRect();
      createFloatingEffect(rect.left + rect.width / 2, rect.top + rect.height * 0.35, ['☀️', '💖', '🍱', '✨']);
      try {
        const res = await apiBridge.recordActionMemory('wakeup_kiss');
        if (res && res.memory) {
          memoryState = res.memory;
          updateMemoryAndAffectionUI(memoryState);
        }
      } catch (e) {}
    });
  }

  if (btnWakeupSnooze) {
    btnWakeupSnooze.addEventListener('click', () => {
      const d = new Date(Date.now() + 5 * 60 * 1000);
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      snoozeUntilTime = `${hh}:${mm}`;
      if (wakeupOverlay) wakeupOverlay.classList.add('hidden');
      showSpeech(`もう……あと5分だけよ（${snoozeUntilTime}）？二度寝しすぎたらキスして起こすからね😴💋\n（真是的……就再讓你賴床 5 分鐘到 ${snoozeUntilTime} 喔？再睡過頭我就要親醒你囉😴💋）`);
    });
  }

  // 啟動每 10 秒一次的精準鬧鐘與待辦提醒巡檢器
  setInterval(checkAlarmsAndReminders, 10000);
}

function updateNotifyButtonText(btn) {
  if (!btn || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    btn.textContent = '✅ 手機/桌面系統通知已啟用';
  } else if (Notification.permission === 'denied') {
    btn.textContent = '⚠️ 系統通知已被封鎖 (請於瀏覽器設定開啟)';
  } else {
    btn.textContent = '📲 點擊開啟手機/桌面通知權限';
  }
}

function renderAssistantAllUI() {
  if (!assistantState) assistantState = getOfflineAssistantState();

  // 更新頂部戀人模式徽章
  const modeInfo = assistantState.currentModeInfo || OFFLINE_COUPLE_MODES.find(m => m.id === assistantState.coupleMode) || OFFLINE_COUPLE_MODES[0];
  if (coupleModeBadge && modeInfo) {
    coupleModeBadge.textContent = modeInfo.badge || '💞 療癒傾聽';
  }

  renderAssistantTodoList(assistantState.todos || []);
  renderAssistantAlarmList(assistantState.alarms || []);
  renderCoupleModesGrid(assistantState.coupleModeList || OFFLINE_COUPLE_MODES, assistantState.coupleMode || 'healing');
}

function renderAssistantTodoList(todos) {
  const listEl = document.getElementById('assistant-todo-list');
  const countBadge = document.getElementById('todo-progress-badge');
  if (!listEl) return;

  const doneCount = todos.filter(t => t.completed).length;
  if (countBadge) {
    countBadge.textContent = `已完成 ${doneCount} / ${todos.length}`;
  }

  listEl.innerHTML = '';
  if (todos.length === 0) {
    listEl.innerHTML = '<div style="color:#aaa; font-size:11.5px; text-align:center; padding:16px 8px;">目前沒有待辦事項喔！可以在上方新增，或直接在對話框跟まどか說「提醒我下午3點開會」📝</div>';
    return;
  }

  const catLabels = {
    work: '💼 工作衝刺',
    home: '🏠 居家日常',
    date: '☕ 戀人約會',
    music: '🎷 音樂休閒',
    night: '🌙 晚間放鬆'
  };

  todos.forEach(item => {
    const row = document.createElement('div');
    row.className = `todo-item ${item.completed ? 'completed' : ''}`;
    const thumbSrc = item.sceneImage || 'assets/pov_photos/pov_21_office_ol.png';
    row.innerHTML = `
      <input type="checkbox" class="todo-checkbox" ${item.completed ? 'checked' : ''} title="勾選完成任務 (+8💖)">
      <img src="${thumbSrc}" class="todo-scene-thumb" alt="scene" title="點擊放大まどか應援插圖">
      <div class="todo-info">
        <div class="todo-title">${escapeHtml(item.title)}</div>
        <div class="todo-meta">
          <span>${catLabels[item.category] || '📝 待辦'}</span>
          ${item.reminderTime ? `<span class="todo-time-badge">⏰ ${escapeHtml(item.reminderTime)}</span>` : ''}
        </div>
      </div>
      <button class="todo-del-btn" title="刪除">✕</button>
    `;

    row.querySelector('.todo-checkbox').addEventListener('change', async () => {
      const res = await apiBridge.toggleTodo(item.id);
      if (res && res.state) {
        assistantState = res.state;
        renderAssistantAllUI();
      }
      if (res && res.memory) {
        memoryState = res.memory;
        updateMemoryAndAffectionUI(memoryState);
      }
      if (res && res.justCompleted) {
        const rect = characterAvatar.getBoundingClientRect();
        createFloatingEffect(rect.left + rect.width / 2, rect.top + rect.height * 0.35, ['🎉', '💖', '✨', '👏']);
        if (res.praiseReply) showSpeech(res.praiseReply);
        if (item.sceneImage) {
          showBubblePhoto({
            title: `✅ 完成任務：${item.title}`,
            imageUrl: item.sceneImage,
            caption: res.praiseReply
          });
        }
        if (currentConfig.voiceMode !== 'mute' && res.voice) {
          const vUrl = res.voice.audioUrl || `assets/audio/${encodeURIComponent(res.voice.category)}/${encodeURIComponent(res.voice.filename)}`;
          playAudioWithLipSync(vUrl, res.voice.fallbackUrl);
        }
      }
    });

    row.querySelector('.todo-scene-thumb').addEventListener('click', () => {
      openPhotoLightbox({
        title: item.title,
        imageUrl: thumbSrc,
        caption: `まどか陪你一起完成的專屬應援插圖💖`
      });
    });

    row.querySelector('.todo-del-btn').addEventListener('click', async () => {
      const res = await apiBridge.deleteTodo(item.id);
      if (res && res.state) {
        assistantState = res.state;
        renderAssistantAllUI();
      }
    });

    listEl.appendChild(row);
  });
}

function renderAssistantAlarmList(alarms) {
  const listEl = document.getElementById('assistant-alarm-list');
  if (!listEl) return;
  listEl.innerHTML = '';

  if (alarms.length === 0) {
    listEl.innerHTML = '<div style="color:#aaa; font-size:11.5px; text-align:center; padding:16px 8px;">尚未設定喚醒鬧鐘。立即在上方新增一個早晨鬧鐘，讓まどか每天叫你起床吧☀️</div>';
    return;
  }

  const modeNames = {
    sweet: '🥰 甜蜜溫柔喚醒',
    tsundere: '😤 傲嬌元氣叫床',
    special: '🎷 專屬深情喚醒',
    bento: '🍱 早安愛心便當'
  };

  alarms.forEach(alarm => {
    const row = document.createElement('div');
    row.className = `alarm-item ${alarm.enabled ? '' : 'disabled'}`;
    row.innerHTML = `
      <div class="alarm-left">
        <span class="alarm-time-display">${escapeHtml(alarm.time)}</span>
        <div class="alarm-meta">
          <div class="alarm-label-text">${escapeHtml(alarm.label || '早安晨曦喚醒')}</div>
          <span class="alarm-mode-tag">${modeNames[alarm.mode] || modeNames.sweet}</span>
        </div>
      </div>
      <div class="alarm-actions">
        <button class="polaroid-mini-btn btn-preview-this-alarm" title="立即試聽此鬧鐘">🔔 試聽</button>
        <button class="alarm-toggle-btn ${alarm.enabled ? 'on' : ''}">${alarm.enabled ? '開啟中' : '已關閉'}</button>
        <button class="todo-del-btn" title="刪除此鬧鐘">✕</button>
      </div>
    `;

    row.querySelector('.btn-preview-this-alarm').addEventListener('click', async () => {
      if (assistantModal) assistantModal.classList.add('hidden');
      const payload = await apiBridge.triggerAlarm(alarm.id, alarm.mode);
      showWakeupAlarmOverlay(payload);
    });

    row.querySelector('.alarm-toggle-btn').addEventListener('click', async () => {
      const res = await apiBridge.toggleAlarm(alarm.id);
      if (res && res.state) {
        assistantState = res.state;
        renderAssistantAllUI();
      }
    });

    row.querySelector('.todo-del-btn').addEventListener('click', async () => {
      const res = await apiBridge.deleteAlarm(alarm.id);
      if (res && res.state) {
        assistantState = res.state;
        renderAssistantAllUI();
      }
    });

    listEl.appendChild(row);
  });
}

function renderCoupleModesGrid(modes, activeModeId) {
  const gridEl = document.getElementById('couple-modes-grid');
  if (!gridEl) return;
  gridEl.innerHTML = '';

  modes.forEach(m => {
    const titleStr = m.nameZh || m.titleZh || m.titleJa || '戀人模式';
    const card = document.createElement('div');
    card.className = `couple-mode-card ${m.id === activeModeId ? 'active' : ''}`;
    card.innerHTML = `
      <img src="${m.sceneImage || 'assets/pov_photos/pov_20_boyfriend_shirt.png'}" class="couple-mode-thumb" alt="${escapeHtml(titleStr)}">
      <div class="couple-mode-info">
        <div class="couple-mode-title">${escapeHtml(m.badge)}・${escapeHtml(titleStr)}</div>
        <div class="couple-mode-desc">${escapeHtml(m.descZh || m.description || '')}</div>
      </div>
    `;
    card.addEventListener('click', async () => {
      if (assistantModal) assistantModal.classList.add('hidden');
      await handleSelectCoupleMode(m.id);
    });
    gridEl.appendChild(card);
  });
}

async function handleSelectCoupleMode(modeId) {
  try {
    const res = await apiBridge.setCoupleMode(modeId);
    if (!res) return;
    if (res.state) {
      assistantState = res.state;
      renderAssistantAllUI();
    }
    if (res.memory) {
      memoryState = res.memory;
      updateMemoryAndAffectionUI(memoryState);
    }
    if (res.costumeId) {
      applyCostume(res.costumeId, false);
    }
    const name = currentConfig.userName || 'リンシ';
    const reply = (res.reply || '').replace(/リンシ/g, name);
    showSpeech(reply);

    if (res.sceneImage) {
      const mTitle = res.mode ? (res.mode.nameZh || res.mode.titleZh || '戀人模式') : '戀人模式';
      showBubblePhoto({
        title: `${res.mode ? res.mode.badge : '💞'} ${mTitle}`,
        imageUrl: res.sceneImage,
        caption: reply
      });
    }

    const rect = characterAvatar.getBoundingClientRect();
    createFloatingEffect(rect.left + rect.width / 2, rect.top + rect.height * 0.35, ['💞', '💖', '✨', '🥰']);

    if (currentConfig.voiceMode !== 'mute' && res.voice) {
      const vUrl = res.voice.audioUrl || `assets/audio/${encodeURIComponent(res.voice.category)}/${encodeURIComponent(res.voice.filename)}`;
      playAudioWithLipSync(vUrl, res.voice.fallbackUrl);
    }
  } catch (err) {
    console.error('切換戀人模式失敗:', err);
  }
}

async function handlePartnerMoodCare(moodKey) {
  try {
    const res = await apiBridge.triggerMoodCare(moodKey);
    if (!res) return;
    if (res.memory) {
      memoryState = res.memory;
      updateMemoryAndAffectionUI(memoryState);
    }
    if (res.costumeId) {
      applyCostume(res.costumeId, false);
    }
    const name = currentConfig.userName || 'リンシ';
    const reply = (res.reply || '').replace(/リンシ/g, name);
    showSpeech(reply);

    if (res.sceneImage) {
      showBubblePhoto({
        title: `💞 ${res.label || 'まどかの優しい抱擁'}`,
        imageUrl: res.sceneImage,
        caption: reply
      });
    }

    const rect = characterAvatar.getBoundingClientRect();
    createFloatingEffect(rect.left + rect.width / 2, rect.top + rect.height * 0.35, ['🫂', '💖', '🌸', '✨']);

    if (currentConfig.voiceMode !== 'mute' && res.voice) {
      const vUrl = res.voice.audioUrl || `assets/audio/${encodeURIComponent(res.voice.category)}/${encodeURIComponent(res.voice.filename)}`;
      playAudioWithLipSync(vUrl, res.voice.fallbackUrl);
    }
  } catch (err) {
    console.error('男友心情急救站觸發失敗:', err);
  }
}

function showWakeupAlarmOverlay(payload) {
  if (!payload || !wakeupOverlay) return;
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');

  const timeEl = document.getElementById('wakeup-clock-time');
  const labelEl = document.getElementById('wakeup-alarm-label');
  const imgEl = document.getElementById('wakeup-scene-img');
  const speechEl = document.getElementById('wakeup-dialogue-box') || document.getElementById('wakeup-speech-text');

  if (timeEl) timeEl.textContent = (payload.alarm && payload.alarm.time) || `${hh}:${mm}`;
  if (labelEl) labelEl.textContent = (payload.alarm && payload.alarm.label) || '☀️ 早安晨曦喚醒・まどか叫你起床';
  if (imgEl) imgEl.src = payload.sceneImage || 'assets/pov_photos/pov_13_morning_wakeup.jpg';

  const name = currentConfig.userName || 'リンシ';
  const replyText = (payload.reply || 'おはよう、リンシ！朝よ、早く起きて☀️').replace(/リンシ/g, name);
  if (speechEl) speechEl.innerHTML = escapeHtml(replyText).replace(/\n/g, '<br>');

  if (payload.costumeId) {
    applyCostume(payload.costumeId, false);
  }
  if (payload.memory) {
    memoryState = payload.memory;
    updateMemoryAndAffectionUI(memoryState);
  }

  wakeupOverlay.classList.remove('hidden');

  // 手機震動提示
  try {
    if (navigator.vibrate) navigator.vibrate([400, 200, 400, 200, 600]);
  } catch (e) {}

  // 系統通知
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`⏰ ${payload.alarm ? payload.alarm.time : `${hh}:${mm}`} まどか早晨喚醒`, {
        body: replyText.split('\n')[0],
        icon: 'assets/icon-192.png'
      });
    }
  } catch (e) {}

  // 播放鶴ひろみ早晨喚醒原聲
  if (currentConfig.voiceMode !== 'mute' && payload.voice) {
    const vUrl = payload.voice.audioUrl || `assets/audio/${encodeURIComponent(payload.voice.category)}/${encodeURIComponent(payload.voice.filename)}`;
    playAudioWithLipSync(vUrl, payload.voice.fallbackUrl);
  }
}

async function checkAlarmsAndReminders() {
  if (!assistantState) return;
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const curTime = `${hh}:${mm}`;
  const todayStr = now.toISOString().slice(0, 10);
  const minuteKey = `${todayStr}_${curTime}`;

  // 1. 檢查賴床 5 分鐘 Snooze 鬧鐘
  if (snoozeUntilTime && snoozeUntilTime === curTime && lastTriggeredAlarmMinute !== `snooze_${minuteKey}`) {
    lastTriggeredAlarmMinute = `snooze_${minuteKey}`;
    snoozeUntilTime = '';
    const payload = await apiBridge.triggerAlarm('', 'tsundere');
    showWakeupAlarmOverlay(payload);
    return;
  }

  // 2. 檢查已啟用的早晨喚醒鬧鐘
  const alarms = assistantState.alarms || [];
  for (const alarm of alarms) {
    if (alarm.enabled && alarm.time === curTime && alarm.lastTriggeredDate !== todayStr && lastTriggeredAlarmMinute !== `${alarm.id}_${minuteKey}`) {
      lastTriggeredAlarmMinute = `${alarm.id}_${minuteKey}`;
      alarm.lastTriggeredDate = todayStr;
      saveOfflineAssistantState(assistantState);
      const payload = await apiBridge.triggerAlarm(alarm.id, alarm.mode);
      showWakeupAlarmOverlay(payload);
      break;
    }
  }

  // 3. 檢查設定了提醒時間的待辦事項 (To-Do Reminders)
  const todos = assistantState.todos || [];
  for (const todo of todos) {
    const todoNotifyKey = `${todo.id}_${todayStr}_${curTime}`;
    if (!todo.completed && todo.reminderTime === curTime && !notifiedTodoKeys.has(todoNotifyKey)) {
      notifiedTodoKeys.add(todoNotifyKey);
      const name = currentConfig.userName || 'リンシ';
      const msg = `ねえ、${name}！⏰ ${curTime} になったわよ。予定していた「${todo.title}」の時間よ、忘れないでね📝\n（吶、${name}！已經 ${curTime} 囉。你排定的「${todo.title}」時間到了，別忘記喔📝）`;
      showSpeech(msg);
      if (todo.sceneImage) {
        showBubblePhoto({
          title: `⏰ 待辦提醒：${todo.title}`,
          imageUrl: todo.sceneImage,
          caption: msg
        });
      }
      try {
        if (navigator.vibrate) navigator.vibrate([300, 150, 300]);
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`📝 まどか待辦提醒 (${curTime})`, {
            body: `「${todo.title}」的時間到囉！`,
            icon: 'assets/icon-192.png'
          });
        }
      } catch (e) {}

      if (currentConfig.voiceMode !== 'mute') {
        playAudioWithLipSync('assets/audio/%E6%97%A5%E5%B8%B8/%E6%83%85%E4%BE%B6%E4%BA%92%E5%8B%95(%E6%BA%AB%E6%9F%94).mp3');
      }
      break;
    }
  }
}


