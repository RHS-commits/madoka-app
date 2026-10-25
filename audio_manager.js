// audio_manager.js - 鮎川まどか 聲音資料庫管理模組 (原作聲優 鶴ひろみ 語音庫、經典配樂 BGM 與 OST)
const fs = require('fs');
const path = require('path');

// 基礎音訊目錄 (本地優先，Google Drive 為次選)
const LOCAL_AUDIO_DIR = path.join(__dirname, 'assets', 'audio');
const CLOUD_AUDIO_DIR = 'H:\\我的雲端硬碟\\雜\\MADOKA\\聲音檔';

function getEffectiveAudioPath(category, filename) {
  const localPath = path.join(LOCAL_AUDIO_DIR, category, filename);
  if (fs.existsSync(localPath)) return localPath;
  const cloudPath = path.join(CLOUD_AUDIO_DIR, category, filename);
  if (fs.existsSync(cloudPath)) return cloudPath;
  return null;
}

// 1. 經典配樂 BGM 清單 (12 首)
const BGM_LIST = [
  {
    id: "bgm_madoka_theme",
    title: "まどかのテーマ (Madoka's Theme)",
    subtitle: "高音質經典薩克斯風主題曲",
    filename: "Kimagure Orange Road OST - Madoka no Teema - HQ Audio.mp3",
    category: "配樂",
    mood: "浪漫 / 感性"
  },
  {
    id: "bgm_itsumo_abcb",
    title: "いつも ABCBで (Itsumo ABCB de)",
    subtitle: "ABCB 咖啡館經典爵士氛圍",
    filename: "Kimagure Orange Road Soundtrack - Itsumo ABCB de.mp3",
    category: "配樂",
    mood: "悠閒 / 咖啡時光"
  },
  {
    id: "bgm_akai_boushi",
    title: "赤い麦わら帽子 (Akai Mugiwara Boushi)",
    subtitle: "A-22 紅色草帽・夏日純情回憶",
    filename: "Kimagure Orange Road OST - A-22 Akai Mugiwara Boushi.mp3",
    category: "配樂",
    mood: "夏日 / 懷舊"
  },
  {
    id: "bgm_honky_tonk",
    title: "Honky tonk hip hop to us",
    subtitle: "輕快活潑的復古節拍",
    filename: "Kimagure Orange Road Soundtrack - Honky tonk hip hop to us.mp3",
    category: "配樂",
    mood: "活力 / 愉悅"
  },
  {
    id: "bgm_walk_struttin",
    title: "Walk Struttin",
    subtitle: "漫步街頭的摩登律動",
    filename: "Kimagure Orange Road OST  Walk Struttin.mp3",
    category: "配樂",
    mood: "城市漫步 / 潮流"
  },
  {
    id: "bgm_aozora",
    title: "青空をぶっとばせ! (Aozora O Buttobase!)",
    subtitle: "青春放晴的爽朗疾馳感",
    filename: "Kimagure Orange Road OST  Aozora O Buttobase!.mp3",
    category: "配樂",
    mood: "陽光 / 爽快"
  },
  {
    id: "bgm_wangan_dancing",
    title: "湾岸ダンシング・ウェイ (Wangan dancing way)",
    subtitle: "夜間沿海公路的 City Pop 兜風感",
    filename: "Kimagure Orange Road Soundtrack - Wangan dancing way.mp3",
    category: "配樂",
    mood: "深夜 / 兜風"
  },
  {
    id: "bgm_kanashii_kake",
    title: "哀しい賭け (Kanashii Kake)",
    subtitle: "動人微酸的戀愛心緒",
    filename: "Kimagure Orange Road Soundtrack -Kanashii Kake.mp3",
    category: "配樂",
    mood: "深情 / 抒情"
  },
  {
    id: "bgm_gimonfu",
    title: "疑問符はNAISHO (Gimonfu wa NAISHO)",
    subtitle: "少女心中不可言說的秘密",
    filename: "Kimagure Orange Road Soundtrack - Gimonfu wa NAISHO.mp3",
    category: "配樂",
    mood: "俏皮 / 秘密"
  },
  {
    id: "bgm_aerobics",
    title: "エアロビクス・オン・RAP (Aerobics On RAP)",
    subtitle: "活力滿點的 80s 律動健身節奏",
    filename: "Kimagure Orange Road OST  Aerobics On RAP.mp3",
    category: "配樂",
    mood: "運動 / 動感"
  },
  {
    id: "bgm_esp",
    title: "E S P Ni Mo T P O",
    subtitle: "超能力引發的奇妙日常",
    filename: "Kimagure Orange Road OST  E S P Ni Mo T P O.mp3",
    category: "配樂",
    mood: "逗趣 / 奇幻"
  },
  {
    id: "bgm_warudakumi",
    title: "Exclamationの悪だくみ",
    subtitle: "A-27 惡作劇小算盤",
    filename: "Kimagure Orange Road きまぐれオレンジロード BGM A-27 Exclamationの悪だくみ.mp3",
    category: "配樂",
    mood: "小惡魔 / 趣味"
  }
];

// 2. 經典主題曲 & 鶴ひろみ 角色歌 OST 清單 (29 首)
const OST_LIST = [
  {
    id: "ost_natsu_mirage_tsuru",
    title: "夏のミラージュ (Natsu no Mirage) - 鶴ひろみ",
    subtitle: "原作聲優 鶴ひろみ 親唱限定版！",
    filename: "歌う声優夏のミラージュ鶴ひろみ.mp3",
    category: "OST",
    artist: "鶴ひろみ (鮎川まどか)"
  },
  {
    id: "ost_ride_on",
    title: "Ride On - 鶴ひろみ",
    subtitle: "鮎川圓個人代表抒情單曲",
    filename: "Ride On by Hiromi Tsuru (鶴 ひろみ), presented by Madoka from Kimagure Orange Road.mp3",
    category: "OST",
    artist: "鶴ひろみ"
  },
  {
    id: "ost_dance_in_the_memories",
    title: "ダンス・イン・ザ・メモリーズ (Dance in the Memories)",
    subtitle: "神級經典片尾曲 ED",
    filename: "ダンスインザメモリーズ  Dance in the Memories.mp3",
    category: "OST",
    artist: "中原めいこ"
  },
  {
    id: "ost_kagami_no_actress",
    title: "鏡の中のアクトレス (Kagami no Naka no Actress)",
    subtitle: "熱血人氣片頭曲 OP3",
    filename: "鏡の中のアクトレス  Kagami no Naka no Actress.mp3",
    category: "OST",
    artist: "中原めいこ"
  },
  {
    id: "ost_natsu_no_mirage",
    title: "夏のミラージュ (Natsu no Mirage)",
    subtitle: "初代傳奇片頭曲 OP1",
    filename: "夏のミラージュ  Natsu no Mirage.mp3",
    category: "OST",
    artist: "和田加奈子"
  },
  {
    id: "ost_orange_mystery",
    title: "オレンジ・ミステリー (Orange Mystery)",
    subtitle: "迷人都市節奏片頭曲 OP2",
    filename: "オレンジミステリー  Orange Mystery.mp3",
    category: "OST",
    artist: "長島秀幸"
  },
  {
    id: "ost_night_of_summer_side",
    title: "NIGHT OF SUMMER SIDE",
    subtitle: "經典動感初夏夜節拍",
    filename: "Kimagure Orange Road OST NIGHT OF SUMMER SIDE.mp3",
    category: "OST",
    artist: "池田政典"
  },
  {
    id: "ost_choose_me",
    title: "チューズ・ミー (Choose Me)",
    subtitle: "戀愛的心跳選擇",
    filename: "チューズミー  Choose Me.mp3",
    category: "OST",
    artist: "坪倉唯子"
  },
  {
    id: "ost_furimuite_my_darling",
    title: "ふり向いてマイ・ダーリン (Furimuite My Darling)",
    subtitle: "甜美撒嬌片尾曲 ED1",
    filename: "ふり向いてマイダーリン  Furimuite My Darling.mp3",
    category: "OST",
    artist: "藤代美奈子"
  },
  {
    id: "ost_yasashii_jealousy",
    title: "優しいジェラシー (Yasashii Jealousy)",
    subtitle: "溫柔的吃醋與愛意",
    filename: "優しいジェラシー  Yasashii Jealousy.mp3",
    category: "OST",
    artist: "富澤聖子"
  },
  {
    id: "ost_ano_sora_wo_dakishimete",
    title: "あの空を抱きしめて (Ano Sora wo Dakishimete)",
    subtitle: "擁抱那一整片藍天",
    filename: "あの空を抱きしめて  Ano Sora wo Dakishimete.mp3",
    category: "OST",
    artist: "和田加奈子"
  },
  {
    id: "ost_kaze_no_manazashi",
    title: "風のまなざし (Kaze no Manazashi)",
    subtitle: "微風中深情的凝視",
    filename: "風のまなざし  Kaze no Manazashi.mp3",
    category: "OST",
    artist: "和田加奈子"
  },
  {
    id: "ost_whispering_misty_night",
    title: "Whispering Misty Night",
    subtitle: "薄霧夜色裡的呢喃",
    filename: "Whispering Misty Night.mp3",
    category: "OST",
    artist: "Kimagure Orange Road OST"
  },
  {
    id: "ost_bayside_dancer",
    title: "BAYSIDE DANCER",
    subtitle: "海灣邊的節奏舞蹈",
    filename: "BAYSIDE DANCER.mp3",
    category: "OST",
    artist: "Kimagure Orange Road OST"
  },
  {
    id: "ost_night_and_day",
    title: "NIGHT & DAY",
    subtitle: "日夜思念的旋律",
    filename: "NIGHT & DAY.mp3",
    category: "OST",
    artist: "Kimagure Orange Road OST"
  },
  {
    id: "ost_breaking_heart",
    title: "ブレイキング・ハート (Breaking Heart)",
    subtitle: "動人搖滾抒情",
    filename: "ブレイキングハート  Breaking Heart.mp3",
    category: "OST",
    artist: "坪倉唯子"
  },
  {
    id: "ost_kiken_na_triangle",
    title: "危険なトライアングル (Kiken na Triangle)",
    subtitle: "危險又迷人的三角戀曲",
    filename: "危険なトライアングル  Kiken na Triangle.mp3",
    category: "OST",
    artist: "池田政典"
  },
  {
    id: "ost_again",
    title: "Again",
    subtitle: "重溫相遇的最初感動",
    filename: "Again.mp3",
    category: "OST",
    artist: "和田加奈子"
  },
  {
    id: "ost_tokidoki_blue",
    title: "ときどきBlue (Tokidoki Blue)",
    subtitle: "偶爾微藍的少女心思",
    filename: "ときどきBlue  Tokidoki Blue.mp3",
    category: "OST",
    artist: "橘友賀"
  },
  {
    id: "ost_mou_hitotsu_no_yesterday",
    title: "もうひとつのイエスタデイ (Mou Hitotsu no Yesterday)",
    subtitle: "另一個昨日的美好回想",
    filename: "もうひとつのイエスタデイ  Mou Hitotsu no Yesterday.mp3",
    category: "OST",
    artist: "和田加奈子"
  },
  {
    id: "ost_kogane_iro",
    title: "こがね色の坂道 (Kogane-iro no Sakamichi)",
    subtitle: "夕陽斜照的金色坡道",
    filename: "こがね色の坂道  Kogane-iro no Sakamichi.mp3",
    category: "OST",
    artist: "和田加奈子"
  },
  {
    id: "ost_aoi_boyfriend",
    title: "青いボーイフレンド (Aoi Boyfriend)",
    subtitle: "青澀純真的戀人模樣",
    filename: "青いボーイフレンド  Aoi Boyfriend.mp3",
    category: "OST",
    artist: "河内りえ"
  },
  {
    id: "ost_girigiri_love",
    title: "ギリギリLOVE (Girigiri LOVE)",
    subtitle: "瀕臨邊界的熾烈情感",
    filename: "ギリギリLOVE  Girigiri LOVE.mp3",
    category: "OST",
    artist: "Kimagure Orange Road OST"
  },
  {
    id: "ost_kono_mune_ni",
    title: "この胸にONE MORE TIME (Kono Mune ni ONE MORE TIME)",
    subtitle: "再愛一次的溫柔期盼",
    filename: "この胸にONE MORE TIME  Kono Mune ni ONE MORE TIME.mp3",
    category: "OST",
    artist: "Kimagure Orange Road OST"
  },
  {
    id: "ost_heart_wo_nice_catch",
    title: "Heart Wo Nice Catch",
    subtitle: "精準捕獲愛的心跳",
    filename: "Kimagure Orange Road OST  Heart Wo Nice Catch.mp3",
    category: "OST",
    artist: "Kimagure Orange Road OST"
  },
  {
    id: "ost_mogitate_no_koi",
    title: "もぎたての恋",
    subtitle: "鮮摘初戀的清甜滋味",
    filename: "もぎたての恋  河内りえ.mp3",
    category: "OST",
    artist: "河内りえ"
  },
  {
    id: "ost_kimagure_tenshi",
    title: "きまぐれ天使",
    subtitle: "任性又溫柔的降臨",
    filename: "きまぐれ天使  河内りえ.mp3",
    category: "OST",
    artist: "河内りえ"
  },
  {
    id: "ost_sarubia",
    title: "サルビアの花のように (Sarubia no hana no you ni)",
    subtitle: "如一串紅花般熱烈盛開",
    filename: "サルビアの花のように  Sarubia no hana no you ni.mp3",
    category: "OST",
    artist: "和田加奈子"
  }
];

// 3. 原汁原味 鶴ひろみ 語音庫 (Poke/Touch 桌面專屬互動台詞庫 - 優先播放用戶提供的 12 段桌面互動)
const POKE_VOICES = [
  {
    category: "桌面互動",
    filename: "元氣問候07.mp3",
    japanese: "おはよう。もう、まだ眠そうな顔して。遅刻しても知らないわよ、{name}。",
    chinese: "早安。真是的，還一臉想睡的樣子。遲到了我可不管你喔，{name}。"
  },
  {
    category: "桌面互動",
    filename: "吃醋傲嬌.mp3",
    japanese: "さっきの子、随分楽しそうに話してたわね。私？……別に怒ってないけど！",
    chinese: "剛才那個女生，你們聊得挺開心的嘛。我？……我才沒有生氣呢！"
  },
  {
    category: "桌面互動",
    filename: "害羞低語09(傲嬌).mp3",
    japanese: "勘違いしないでよね。{name}が心配だからそばにいるんじゃないんだから。たまたまよ。",
    chinese: "你可別誤會喔。我才不是因為擔心{name}你才待在身邊的。只是碰巧而已啦。"
  },
  {
    category: "桌面互動",
    filename: "害羞低語10(傲嬌).mp3",
    japanese: "バカ。急にそんな真っ直ぐ見つめられたら、調子狂うじゃない……",
    chinese: "笨蛋。突然那樣直勾勾地盯著我看，害我都亂了節奏了不是嗎……"
  },
  {
    category: "桌面互動",
    filename: "害羞低語11.mp3",
    japanese: "手、繋いでもいい？別に深い意味はないわ。ただ、ちょっとね。",
    chinese: "可以牽你的手嗎？也沒有什麼深層的意思啦。只是……稍微想牽一下而已。"
  },
  {
    category: "桌面互動",
    filename: "療育安撫01剪前段.mp3",
    japanese: "お疲れ様。無理しすぎよ、あなた。ほら、少し肩の力抜いて。",
    chinese: "辛苦了。真是的，你太勉強自己了啦。來，稍微把肩膀放鬆一下吧。"
  },
  {
    category: "桌面互動",
    filename: "療育安撫04.mp3",
    japanese: "お疲れ様。ええ、無理しすぎよ、あなた。ほら、少し肩の力抜いて、深呼吸して。",
    chinese: "辛苦了。嗯、你太勉強自己了啦。來，稍微把肩膀放鬆，深呼吸一下。"
  },
  {
    category: "桌面互動",
    filename: "療育安撫05.mp3",
    japanese: "疲れたなら、少し目を閉じてて。サックス、静かな曲を1曲吹いてあげるね、{name}。",
    chinese: "累了的話，稍微把眼睛閉上吧。我用薩克斯風為你吹一首安靜的曲子喔，{name}。"
  },
  {
    category: "桌面互動",
    filename: "療育安撫06.mp3",
    japanese: "大丈夫。私がついてるじゃない。ほら。私って意外と頼りになるでしょ？",
    chinese: "沒事的。不是有我在身邊嗎？看吧，我其實意外地很可靠對吧？"
  },
  {
    category: "桌面互動",
    filename: "調情互動01.mp3",
    japanese: "どこ見てるの？私の顔に何か付いてる？それとも……見惚れてた？",
    chinese: "你在看哪裡呀？我臉上有沾到什麼東西嗎？還是說……你看得入迷了？"
  },
  {
    category: "桌面互動",
    filename: "調情互動02.mp3",
    japanese: "ABCBのブレンド、淹れてきてあげたわよ。お砂糖は入れないでおいたけど、甘いのがよかった？",
    chinese: "我為你泡了 ABCB 的特調咖啡喔。我沒放糖，不過你是喜歡喝甜的嗎？"
  },
  {
    category: "桌面互動",
    filename: "調情互動03.mp3",
    japanese: "ねえ、今夜は少し遠回りして帰らない？まだ{name}と話していたい気分なの。",
    chinese: "吶、今晚要不要稍微繞點遠路再回去呢？我現在……還想再多跟{name}你聊聊天的感覺呢。"
  },
  {
    category: "感情",
    filename: "被盯著看害羞.mp3",
    japanese: "な、何よ……じっと見つめて。顔、赤くなっちゃうでしょ……",
    chinese: "怎、怎麼啦……一直凝視著我。臉都要變紅了啦……"
  },
  {
    category: "感情",
    filename: "傲嬌生氣被偷親.mp3",
    japanese: "ちょっと！急に何するのよ……！もう、次はちゃんと前もって言ってよね！",
    chinese: "等一下！突然做什麼啦……！真是的，下次要先跟我說好啦！"
  },
  {
    category: "感情",
    filename: "靠近你.mp3",
    japanese: "もっと近くにおいでよ……{name}の温もり、感じていたいな。",
    chinese: "再靠近我一點嘛……想要感受{name}的溫暖呢。"
  },
  {
    category: "感情",
    filename: "心動的夜晚，無法控制自己愛的心意.mp3",
    japanese: "今夜は……なんだか胸がドキドキして、{name}のことが頭から離れないの。",
    chinese: "今夜……不知為何心一直撲通跳，腦海裡全都是{name}你的身影。"
  },
  {
    category: "感情",
    filename: "告白.mp3",
    japanese: "{name}……私、本当はずっとあなたのことが……好きだったの。",
    chinese: "{name}……我、其實一直以來……都好喜歡你。"
  }
];

// 4. 情境與造型專屬語音對應表 (9 大情境)
const COSTUME_VOICES = {
  home: {
    category: "日常",
    filename: "起床(甜蜜).mp3",
    japanese: "ふぁあ……おはよう、{name}。髪を結んだら、朝ごはん作ってあげるね。",
    chinese: "哈啊……早安，{name}。等我把頭髮綁好，就為你做早餐喔。"
  },
  uniform: {
    category: "日常",
    filename: "02給便當.mp3",
    japanese: "はい、お弁当！{name}のために作ったんだから、残さず食べてね。",
    chinese: "來、這是給你的便當！專門為{name}做的，要一口不剩吃完喔。"
  },
  cafe: {
    category: "日常",
    filename: "是否好吃的詢問.mp3",
    japanese: "いらっしゃい、{name}！特製コーヒーよ、お味はどう？喜んでくれたら嬉しいな。",
    chinese: "歡迎光臨，{name}！這是特製咖啡喔，味道怎麼樣？你喜歡的話我就很開心了。"
  },
  casual: {
    category: "桌面互動",
    filename: "元氣問候07.mp3",
    japanese: "ストレッチして汗を流すところよ。{name}、今日も一日元気出して行こう！",
    chinese: "我正在拉筋伸展流流汗呢。{name}、今天一天也要打起精神加油喔！"
  },
  date: {
    category: "感情",
    filename: "帶有邀請與期待的對白.mp3",
    japanese: "待たせちゃったかしら？今日のコーデ、どう……？今日は二人きりでずっといようね。",
    chinese: "讓你久等了嗎？今天的穿搭覺得如何……？今天我們要兩人一直待在一起喔。"
  },
  bath: {
    category: "桌面互動",
    filename: "害羞低語09(傲嬌).mp3",
    japanese: "お風呂上がりで髪がまだ濡れてるの……ば、バカ、あんまり見ないでよ！",
    chinese: "剛洗好澡頭髮還濕濕的……笨、笨蛋，別看呆了一直盯著看啦！"
  },
  night: {
    category: "感情",
    filename: "捨不得回家的心情.mp3",
    japanese: "温かいセーター着てレコード聴いてたの。……もう少しだけ、そばにいてほしいな。",
    chinese: "穿著溫暖毛衣聽黑膠唱片。……希望能像這樣，再多陪我一會兒呢。"
  },
  beach: {
    category: "約會",
    filename: "河邊戲水.mp3",
    japanese: "潮風が気持ちいいわね！水が冷たくて最高よ、{name}もこっちにおいでよ！",
    chinese: "海風吹起來真舒服呢！水涼涼的好棒喔，{name}也快點到我身邊來呀！"
  },
  cosplay: {
    category: "約會",
    filename: "角色扮演(醫生).mp3",
    japanese: "にゃ〜ん……ふふっ、今日は私が先生よ。どこが痛いのか診察してあげるわ。",
    chinese: "喵～……呵呵、今天我是專屬醫生喔。哪裡不舒服呢？讓我好好為你診察一下吧。"
  },
  sax: {
    category: "桌面互動",
    filename: "療育安撫04.mp3",
    japanese: "夕暮れの音楽室でサックスを吹いてたの。{name}のために、特別な一曲を聴かせてあげるね。",
    chinese: "在黃昏的音樂教室吹薩克斯風呢。為了{name}，讓我為你吹奏特別的一曲吧。"
  },
  yukata: {
    category: "約會",
    filename: "坐船.mp3",
    japanese: "夏祭りの浴衣、どうかしら？花火がきれいね、{name}……はぐれないように、手、繋いでもいいわよ。",
    chinese: "夏日祭典的浴衣，覺得如何呢？煙火真美呢，{name}……為了不走散，要牽手也可以喔。"
  },
  cafedate: {
    category: "桌面互動",
    filename: "調情互動01.mp3",
    japanese: "カフェで二人きりなんて新鮮ね。このラテアート、可愛いでしょう？{name}も一口飲んでみる？",
    chinese: "在咖啡廳兩人獨處真新鮮呢。這個拿鐵拉花很可愛吧？{name}也要喝一口看看嗎？"
  },
  rock: {
    category: "感情",
    filename: "帶有彆扭與邀請 (看著我).mp3",
    japanese: "たまにはこういうロックな革ジャンもいいでしょう？ほら、よそ見しないで私だけを見てなさいよ！",
    chinese: "偶爾穿這種搖滾風皮衣也很不錯吧？喂、別東張西望，只准看著我一個人喔！"
  },
  dress: {
    category: "桌面互動",
    filename: "害羞低語11.mp3",
    japanese: "窓辺の風が気持ちいいわね。エメラルドグリーンのワンピース、{name}のために着てみたのよ。",
    chinese: "窗邊的微風真舒服呢。這件翡翠綠荷葉洋裝，是為了{name}特別換上的喔。"
  },
  schoolpov: {
    category: "感情",
    filename: "靠近你.mp3",
    japanese: "もう、ネクタイが曲がってるわよ……じっとしてて、{name}。近くで見ると、ちょっとドキドキしちゃうわね。",
    chinese: "真是的，領帶都歪掉囉……別亂動喔，{name}。這麼近看著你，心跳稍微有點加速了呢。"
  },
  bunny: {
    category: "感情",
    filename: "帶有誘惑與挑逗的對白.mp3",
    japanese: "しーっ、これは{name}だけのヒミツよ……？純白のバニー姿、そんなに目を丸くして見ないでよ。",
    chinese: "噓——這是只屬於{name}的秘密喔……？純白兔女郎的打扮，別瞪大眼睛一直盯著看啦。"
  },
  work_ol: {
    category: "桌面互動",
    filename: "療育安撫06.mp3",
    japanese: "お疲れ様、{name}！今日はあなたの専属秘書として、スケジュールも体調もバッチリ管理してあげるわよ。",
    chinese: "辛苦了，{name}！今天我是你的專屬 OL 小秘書，行程和身體狀況都會幫你完美打理好喔。"
  },
  guitar: {
    category: "桌面互動",
    filename: "療育安撫05.mp3",
    japanese: "たまにはアコースティックギターの弾き語りもいいでしょう？{name}のために作ったメロディ、聴いててね。",
    chinese: "偶爾像這樣彈木吉他自彈自唱也很不錯吧？這是我為{name}寫的旋律，要專心聽喔。"
  },
  strawhat: {
    category: "配樂",
    filename: "Kimagure Orange Road OST - A-22 Akai Mugiwara Boushi.mp3",
    japanese: "あの夏、風が飛ばした赤い麦わら帽子……{name}が受け止めてくれたから、今の私たちがいるのよね。",
    chinese: "那年夏天被海風吹走的紅色草帽……正因為有{name}接住了它，才會有現在的我們呢。"
  },
  boyfriend_shirt: {
    category: "感情",
    filename: "被盯著看害羞.mp3",
    japanese: "{name}のワイシャツ、ちょっと大きすぎるわね……もう、そんなにじっと見ないでよ、恥ずかしいじゃない……",
    chinese: "{name}的白襯衫穿起來有點太大件了呢……真是的，別那樣一直盯著看啦，我會害羞的……"
  },
  maid_witch: {
    category: "約會",
    filename: "角色扮演(醫生)02.mp3",
    japanese: "トリック・オア・トリート！今夜は魔法使いまどかよ、{name}。イタズラされたくなかったら、もっと甘やかしてよね！",
    chinese: "不給糖就搗蛋！今晚我是小魔女まどか喔，{name}。不想被我惡作劇的話，就多寵我一點吧！"
  },
  evening_gown: {
    category: "感情",
    filename: "心動的夜晚，無法控制自己愛的心意.mp3",
    japanese: "今夜は特別な記念日だから、ゴールドのドレスを着てみたの。……ねえ{name}、今夜は私から目を離さないでね。",
    chinese: "今晚是特別的紀念日，所以我換上了這襲金色禮服。……吶、{name}，今晚可別把視線從我身上移開喔。"
  }
};

// 5. 快捷動作專屬語音 (Bento, Curry, Confess, Sleep, Comfort)
const QUICK_ACTION_VOICES = {
  bento: {
    category: "日常",
    filename: "01(吃便當).mp3",
    japanese: "{name}、はい、お弁当！ちゃんと全部食べて、午後からも頑張ってね！",
    chinese: "{name}、來，便當給你！要乖乖全部吃光，下午也要繼續加油喔！"
  },
  curry: {
    category: "日常",
    filename: "邀請吃咖哩飯.mp3",
    japanese: "お腹空いたでしょう？今夜は特製カレーよ！おかわりたくさんあるからね！",
    chinese: "肚子餓了吧？今晚是特製咖哩喔！鍋子裡還有很多，儘管續碗喔！"
  },
  confess: {
    category: "感情",
    filename: "告白.mp3",
    japanese: "{name}……私、本当はずっとあなたのことが……好きだったの。誰よりも愛してるわ。",
    chinese: "{name}……我、其實一直以來……都好喜歡你。我比任何人都還要愛你。"
  },
  sleep: {
    category: "日常",
    filename: "想要一起睡覺(害羞版).mp3",
    japanese: "{name}、そろそろおやすみの時間ね。……今夜は、もっとぎゅっとしててほしいな。",
    chinese: "{name}、差不多該休息睡覺了呢。……今晚、希望能被你抱得更緊一點呢。"
  },
  comfort: {
    category: "桌面互動",
    filename: "療育安撫01剪前段.mp3",
    japanese: "大丈夫よ、{name}。私がずっとそばにいるから、安心して。無理しないでね。",
    chinese: "沒事的喔，{name}。我會一直陪在你的身邊，放心吧。別太勉強自己喔。"
  },
  sax: {
    category: "配樂",
    filename: "Kimagure Orange Road OST - Madoka no Teema - HQ Audio.mp3",
    japanese: "サックスの音色、聴きたいの？{name}のために、とっておきの曲を吹いてあげるね🎷",
    chinese: "想聽薩克斯風的旋律嗎？為了{name}，我會為你吹奏特別挑選的曲子喔🎷"
  }
};

// 6. 晚間 11:00 後定時提醒「撒嬌陪睡」語音池 (Bedtime Affection & Coaxing)
const BEDTIME_COAX_VOICES = [
  {
    category: "日常",
    filename: "想要一起睡覺(害羞版).mp3",
    japanese: "{name}……もう夜の11時過ぎよ？まだ起きてるの？そろそろおやすみの時間じゃない？……今夜は、もっとぎゅっとしててほしいな。",
    chinese: "{name}……已經超過晚上11點囉？還醒著嗎？差不多該休息睡覺了吧？……今晚、好希望能被你抱得更緊一點呢。"
  },
  {
    category: "日常",
    filename: "想要一起睡覺(強烈版).mp3",
    japanese: "ねえ、{name}。まだパソコン見てるの？早くベッドに入りましょ……おやすみのキス、してあげるから。",
    chinese: "吶、{name}。還在看電腦嗎？快點進被窩躺好嘛……我會給你一個晚安之吻喔。"
  },
  {
    category: "日常",
    filename: "不要了啦~不過再一下下沒關係.mp3",
    japanese: "もう……夜更かしはダメって言ったのに。でも、{name}と一緒なら……もう少しだけ一緒にいてもいいよ。",
    chinese: "真是的……明明說過不能熬夜的。不過、如果是跟{name}在一起的話……再陪你一下下也沒關係喔。"
  },
  {
    category: "感情",
    filename: "心動的夜晚，無法控制自己愛的心意.mp3",
    japanese: "今夜は……なんだか胸がドキドキして、{name}のことが頭から離れないの。……早くそばに来て？",
    chinese: "今晚……不知為何心一直撲通跳，腦海裡全都是{name}你。……快點到我身邊來好嗎？"
  }
];

// 7. 「怎麼了？」溫柔關心語音池 (What's up / What's wrong Variations - 5種原聲變化)
const WHATSUP_VOICES = [
  {
    category: "日常",
    filename: "怎麼了.mp3",
    japanese: "どうしたの？",
    chinese: "怎麼了？"
  },
  {
    category: "日常",
    filename: "怎麼了(對象).mp3",
    japanese: "どうしたの？{name}。",
    chinese: "怎麼了？{name}。"
  },
  {
    category: "日常",
    filename: "怎麼了+沒事吧(對象).mp3",
    japanese: "どうしたの？{name}、大丈夫？",
    chinese: "怎麼了？{name}，沒事吧？"
  },
  {
    category: "日常",
    filename: "怎麼了+沒事吧+抱抱(對象).mp3",
    japanese: "どうしたの？{name}、大丈夫？抱きしめてあげようか？",
    chinese: "怎麼了？{name}，還好嗎？要我抱抱你嗎？"
  },
  {
    category: "感情",
    filename: "嗯…ジンヒ？怎麼了，那樣的表情。.mp3",
    japanese: "んー、{name}？どうしたの、そんな顔して。",
    chinese: "唔……{name}？怎麼了，露出那種表情。"
  }
];

// 將「怎麼了」語音豐富變化自動融入戳戳立繪隨機互動池
POKE_VOICES.push(...WHATSUP_VOICES);

/**
 * 取得「怎麼了」多重語音變化
 */
function getWhatsupVoice(userName = 'リンシ') {
  const item = WHATSUP_VOICES[Math.floor(Math.random() * WHATSUP_VOICES.length)];
  return {
    category: item.category,
    filename: item.filename,
    audioUrl: `assets/audio/${encodeURIComponent(item.category)}/${encodeURIComponent(item.filename)}`,
    fallbackUrl: `http://127.0.0.1:3829/audio/${encodeURIComponent(item.category)}/${encodeURIComponent(item.filename)}`,
    japanese: item.japanese.replace(/{name}/g, userName),
    chinese: item.chinese.replace(/{name}/g, userName),
    fullText: `${item.japanese.replace(/{name}/g, userName)}\n（${item.chinese.replace(/{name}/g, userName)}）`
  };
}

/**
 * 取得晚間撒嬌陪睡專屬語音
 */
function getBedtimeCoaxVoice(userName = 'リンシ') {
  const item = BEDTIME_COAX_VOICES[Math.floor(Math.random() * BEDTIME_COAX_VOICES.length)];
  return {
    category: item.category,
    filename: item.filename,
    audioUrl: `assets/audio/${encodeURIComponent(item.category)}/${encodeURIComponent(item.filename)}`,
    fallbackUrl: `http://127.0.0.1:3829/audio/${encodeURIComponent(item.category)}/${encodeURIComponent(item.filename)}`,
    japanese: item.japanese.replace(/{name}/g, userName),
    chinese: item.chinese.replace(/{name}/g, userName),
    fullText: `${item.japanese.replace(/{name}/g, userName)}\n（${item.chinese.replace(/{name}/g, userName)}）`
  };
}

/**
 * 取得語音資料庫摘要
 */
function getAudioLibrary() {
  return {
    bgm: BGM_LIST,
    ost: OST_LIST,
    pokeVoicesCount: POKE_VOICES.length
  };
}

/**
 * 取得隨機觸摸語音
 */
function getRandomPokeVoice(userName = 'リンシ') {
  const item = POKE_VOICES[Math.floor(Math.random() * POKE_VOICES.length)];
  return {
    category: item.category,
    filename: item.filename,
    audioUrl: `assets/audio/${encodeURIComponent(item.category)}/${encodeURIComponent(item.filename)}`,
    fallbackUrl: `http://127.0.0.1:3829/audio/${encodeURIComponent(item.category)}/${encodeURIComponent(item.filename)}`,
    japanese: item.japanese.replace(/{name}/g, userName),
    chinese: item.chinese.replace(/{name}/g, userName),
    fullText: `${item.japanese.replace(/{name}/g, userName)}\n（${item.chinese.replace(/{name}/g, userName)}）`
  };
}

/**
 * 取得換裝專屬語音
 */
function getCostumeVoice(costumeId, userName = 'リンシ') {
  const item = COSTUME_VOICES[costumeId] || COSTUME_VOICES.uniform;
  return {
    category: item.category,
    filename: item.filename,
    audioUrl: `assets/audio/${encodeURIComponent(item.category)}/${encodeURIComponent(item.filename)}`,
    fallbackUrl: `http://127.0.0.1:3829/audio/${encodeURIComponent(item.category)}/${encodeURIComponent(item.filename)}`,
    japanese: item.japanese.replace(/{name}/g, userName),
    chinese: item.chinese.replace(/{name}/g, userName),
    fullText: `${item.japanese.replace(/{name}/g, userName)}\n（${item.chinese.replace(/{name}/g, userName)}）`
  };
}

/**
 * 取得快捷情境語音
 */
function getQuickActionVoice(actionId, userName = 'リンシ') {
  if (actionId === 'sleep') {
    return getBedtimeCoaxVoice(userName);
  }
  if (actionId === 'whatsup') {
    return getWhatsupVoice(userName);
  }
  const item = QUICK_ACTION_VOICES[actionId];
  if (!item) return null;
  return {
    category: item.category,
    filename: item.filename,
    audioUrl: `assets/audio/${encodeURIComponent(item.category)}/${encodeURIComponent(item.filename)}`,
    fallbackUrl: `http://127.0.0.1:3829/audio/${encodeURIComponent(item.category)}/${encodeURIComponent(item.filename)}`,
    japanese: item.japanese.replace(/{name}/g, userName),
    chinese: item.chinese.replace(/{name}/g, userName),
    fullText: `${item.japanese.replace(/{name}/g, userName)}\n（${item.chinese.replace(/{name}/g, userName)}）`
  };
}

// 8. 晨間喚醒鬧鐘專屬語音池 (Morning Wake-up Alarm Voices - 鶴ひろみ原聲)
const WAKEUP_VOICES = [
  {
    mode: "sweet",
    category: "日常",
    filename: "起床(甜蜜).mp3",
    japanese: "ふぁあ……おはよう、{name}。ほら、もう朝よ？早く起きないと、おやすみのキスの代わりにいたずらしちゃうわよ💖",
    chinese: "哈啊……早安，{name}。喂、已經天亮囉？再不快點起來，我可要用惡作劇代替早安吻囉💖"
  },
  {
    mode: "tsundere",
    category: "日常",
    filename: "起床(強烈).mp3",
    japanese: "ちょっと、{name}！いつまで寝てるのよ！ほら、起きなさいってば！遅刻しても知らないわよ！",
    chinese: "等一下，{name}！你還要睡到什麼時候啦！喂、快給我起來！遲到了我可不管你喔！"
  },
  {
    mode: "special",
    category: "日常",
    filename: "鮎川まどか的喚醒.mp3",
    japanese: "ねえ、{name}……朝よ、起きて？窓を開けたから、朝の風が気持ちいいわよ。今日も一日、私がそばにいてあげるからね。",
    chinese: "吶、{name}……早上囉，快醒醒？我把窗戶打開了，晨風吹起來很舒服喔。今天一整天我也會陪在你身邊的。"
  },
  {
    mode: "gentle",
    category: "日常",
    filename: "起床.mp3",
    japanese: "おはよう、{name}。よく眠れた？熱いコーヒー淹れておいたから、顔を洗ってらっしゃい。",
    chinese: "早安，{name}。睡得好嗎？我已經泡好熱騰騰的咖啡了，快去洗把臉吧。"
  },
  {
    mode: "energetic",
    category: "日常",
    filename: "起床02.mp3",
    japanese: "ほらほら、{name}！朝ごはん冷めちゃうわよ！早く起きて一緒に食べましょ！",
    chinese: "喂喂、{name}！早餐都要涼掉囉！快點起來一起吃早餐吧！"
  },
  {
    mode: "sweet2",
    category: "日常",
    filename: "起床03.mp3",
    japanese: "んもう、本当に甘えん坊なんだから……ほら、手を引っ張ってあげるから、せーので起きるわよ、{name}！",
    chinese: "真是的，還真是愛撒嬌呢……來，我拉你的手，數到一二三就一起坐起來喔，{name}！"
  },
  {
    mode: "bento_morning",
    category: "日常",
    filename: "出門前拿便當(甜蜜).mp3",
    japanese: "おはよう、{name}！今日のお弁当もバッチリ作ってあるわよ。今日も一日、元気にいってらっしゃい！",
    chinese: "早安，{name}！今天的愛心便當也幫你做好囉。今天也要精神百倍地出門喔！"
  }
];

// 9. 情侶互動狀態：心理、療癒、關心與撒嬌專屬語音池 (Couple Care & Boyfriend Emotional Support)
const COUPLE_CARE_VOICES = {
  clingy: {
    category: "感情",
    filename: "靠近你.mp3",
    japanese: "ねえ、{name}……今は仕事のこと忘れて、私だけを見てて？もっと近くに来て……ぎゅっとしててほしいの。",
    chinese: "吶、{name}……現在先把工作忘掉，只看著我好嗎？再靠近我一點……人家想要你緊緊抱著我嘛。"
  },
  healing: {
    category: "桌面互動",
    filename: "療育安撫04.mp3",
    japanese: "お疲れ様、{name}。外でどれだけ大変でも、私の前では強がらなくていいのよ。おいで……頭、撫でてあげるから。",
    chinese: "辛苦了，{name}。不管在外面有多累多辛苦，在我面前都不用逞強喔。過來吧……讓我摸摸你的頭。"
  },
  secretary: {
    category: "桌面互動",
    filename: "療育安撫06.mp3",
    japanese: "はい、{name}！今日のタスクも私が隣でサポートするわよ。一つ終わるごとに、たっぷり褒めてあげるからね！",
    chinese: "來，{name}！今天的待辦事項我也會在旁邊陪你完成的。每完成一項，我都會好好誇獎你喔！"
  },
  tsundere: {
    category: "桌面互動",
    filename: "吃醋傲嬌.mp3",
    japanese: "べ、別に{name}が寂しがると思って構ってあげてるだけよ！……でも、よそ見したら本気で怒るんだからね！",
    chinese: "我、我才不是特別想黏你，只是怕{name}覺得寂寞才陪你的啦！……不過你要是敢看別的女生，我真的會生氣喔！"
  },
  passionate: {
    category: "感情",
    filename: "心動的夜晚，無法控制自己愛的心意.mp3",
    japanese: "{name}とこうして二人きりでいると、胸の奥が熱くなるの……今夜は、このまま朝まで離さないでね。",
    chinese: "像這樣跟{name}兩人獨處，心底就熱熱的……今晚，就這樣直到天亮都別放開我喔。"
  },
  lullaby: {
    category: "日常",
    filename: "想要一起睡覺(害羞版).mp3",
    japanese: "ほら、{name}……私の膝まくら、貸してあげる。目を閉じて……私がずっと優しい夢を見守ってるからね。",
    chinese: "來，{name}……我的膝枕借給你躺喔。把眼睛閉上吧……我會一直溫柔守護著你的好夢。"
  },
  tired: {
    category: "桌面互動",
    filename: "療育安撫01剪前段.mp3",
    japanese: "そんなに疲れた顔して……今日まで本当によく頑張ったわね、{name}。もう無理しないで、私に全部預けて休んで？",
    chinese: "露出那麼疲憊的表情……直到今天真的非常努力了呢，{name}。別再勉強了，把一切都交給我，好好休息吧？"
  },
  stressed: {
    category: "日常",
    filename: "怎麼了+沒事吧+抱抱(對象).mp3",
    japanese: "どうしたの？{name}、つらいことがあったのね。大丈夫、何があっても私は絶対に{name}の味方よ。ぎゅーって抱きしめてあげる。",
    chinese: "怎麼了？{name}，遇到難受的事了吧。沒事的，無論發生什麼事，我絕對都站在{name}這一邊。讓我緊緊抱住你吧。"
  },
  spoiled: {
    category: "日常",
    filename: "不要了啦~不過再一下下沒關係.mp3",
    japanese: "もう、{name}ったら……でも、私も{name}に甘えたかったところなの。ほら、もっと撫でて？",
    chinese: "真是的，{name}真是愛撒嬌……不過，我也正想對{name}撒嬌呢。來，再多摸摸我嘛？"
  },
  hug: {
    category: "感情",
    filename: "靠近你.mp3",
    japanese: "ん……ぎゅーっ💖 {name}の胸、すごく温かいわね。フル充電できるまで、このまま離れないから。",
    chinese: "唔……緊緊抱住💖 {name}的懷抱真的好溫暖喔。在幫你充滿電之前，我都不會放開你的。"
  },
  celebrate: {
    category: "感情",
    filename: "告白.mp3",
    japanese: "すごいじゃない、{name}！あなたが頑張ってる姿、ずっと見てたから自分のことみたいに嬉しいわ！最高の彼氏よ💖",
    chinese: "太棒了不是嗎，{name}！你一直以來努力的模樣我都看在眼裡，所以比自己的事還要高興呢！你是最棒的男友喔💖"
  }
};

function getWakeupVoice(mode = 'random', userName = 'リンシ') {
  let pool = WAKEUP_VOICES;
  if (mode && mode !== 'random') {
    const filtered = WAKEUP_VOICES.filter(v => v.mode === mode);
    if (filtered.length > 0) pool = filtered;
  }
  const item = pool[Math.floor(Math.random() * pool.length)];
  return {
    mode: item.mode,
    category: item.category,
    filename: item.filename,
    audioUrl: `assets/audio/${encodeURIComponent(item.category)}/${encodeURIComponent(item.filename)}`,
    fallbackUrl: `http://127.0.0.1:3829/audio/${encodeURIComponent(item.category)}/${encodeURIComponent(item.filename)}`,
    japanese: item.japanese.replace(/{name}/g, userName),
    chinese: item.chinese.replace(/{name}/g, userName),
    fullText: `${item.japanese.replace(/{name}/g, userName)}\n（${item.chinese.replace(/{name}/g, userName)}）`
  };
}

function getCoupleCareVoice(modeOrMood = 'healing', userName = 'リンシ') {
  const item = COUPLE_CARE_VOICES[modeOrMood] || COUPLE_CARE_VOICES.healing;
  return {
    mode: modeOrMood,
    category: item.category,
    filename: item.filename,
    audioUrl: `assets/audio/${encodeURIComponent(item.category)}/${encodeURIComponent(item.filename)}`,
    fallbackUrl: `http://127.0.0.1:3829/audio/${encodeURIComponent(item.category)}/${encodeURIComponent(item.filename)}`,
    japanese: item.japanese.replace(/{name}/g, userName),
    chinese: item.chinese.replace(/{name}/g, userName),
    fullText: `${item.japanese.replace(/{name}/g, userName)}\n（${item.chinese.replace(/{name}/g, userName)}）`
  };
}

module.exports = {
  getEffectiveAudioPath,
  getAudioLibrary,
  getRandomPokeVoice,
  getCostumeVoice,
  getQuickActionVoice,
  getBedtimeCoaxVoice,
  getWhatsupVoice,
  getWakeupVoice,
  getCoupleCareVoice,
  BGM_LIST,
  OST_LIST,
  POKE_VOICES,
  COSTUME_VOICES,
  QUICK_ACTION_VOICES,
  BEDTIME_COAX_VOICES,
  WHATSUP_VOICES,
  WAKEUP_VOICES,
  COUPLE_CARE_VOICES,
  LOCAL_AUDIO_DIR,
  CLOUD_AUDIO_DIR
};
