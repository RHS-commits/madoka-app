const fs = require('fs');
const {
  loadMemoryDB,
  recordChatInteraction,
  buildMemoryContextForPrompt
} = require('./memory_store');
const {
  detectPhotoRequest,
  selectPovPhoto
} = require('./pov_photo_service');
const {
  loadAssistantDB,
  parseNaturalAssistantCommand
} = require('./assistant_service');

const CANDIDATE_MODELS = [
  'gemini-3-flash-preview',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-flash-lite-latest',
  'gemma-4-26b-a4b-it',
  'gemini-3.6-flash'
];

const COSTUME_FALLBACKS = {
  uniform: {
    reply: "制服に着替えたわ。これから学校よ、リンシ。一緒に行く？\n（換上學生制服了。接下來要去學校囉，リンシ。要一起走嗎？）[COSTUME:uniform]",
    ttsText: "制服に着替えたわ。これから学校よ、リンシ。一緒に行く？"
  },
  cafe: {
    reply: "エプロンをつけて、Abcbの準備完了よ！リンシ、特製ブレンドコーヒー淹れてあげるね。\n（繫好圍裙，Abcb 的準備完成囉！リンシ、我為你泡特調咖啡喔。）[COSTUME:cafe]",
    ttsText: "エプロンをつけて、Abcbの準備完了よ！リンシ、特製ブレンドコーヒー淹れてあげるね。"
  },
  casual: {
    reply: "ちょっと体を動かして汗を流すところよ。リンシも一緒にストレッチしない？\n（我正要活動一下筋骨流流汗呢。リンシ也要一起來拉筋伸展嗎？）[COSTUME:casual]",
    ttsText: "ちょっと体を動かして汗を流すところよ。リンシも一緒にストレッチしない？"
  },
  date: {
    reply: "待たせちゃったかしら？今日のコーデ、どう……？リンシに似合ってるって言われたくて選んだの。\n（讓你久等了嗎？今天的穿搭、覺得怎麼樣……？因為想被你誇獎才選這件的。）[COSTUME:date]",
    ttsText: "待たせちゃったかしら？今日のコーデ、どう？リンシに似合ってるって言われたくて選んだの。"
  },
  bath: {
    reply: "お風呂でさっぱりしてきたわ……髪、まだ少し濡れてるの。リンシ、バスタオル取って？\n（泡完澡整個人好舒暢喔……頭髮還稍微濕濕的。リンシ、幫我拿條毛巾好嗎？）[COSTUME:bath]",
    ttsText: "お風呂でさっぱりしてきたわ。髪、まだ少し濡れてるの。リンシ、バスタオル取って？"
  },
  night: {
    reply: "温かいセーターを着て、レコードを聴きながらのんびりしてたの。リンシ、お隣座ってもいいわよ。\n（穿上溫暖的毛衣，邊聽黑膠唱片邊放鬆。リンシ、坐到我身邊來也沒關係喔。）[COSTUME:night]",
    ttsText: "温かいセーターを着て、レコードを聴きながらのんびりしてたの。リンシ、お隣座ってもいいわよ。"
  },
  home: {
    reply: "家でリラックスモードよ。お腹空いたでしょう？リンシのために特製カレー作ってあげる。\n（在家放鬆模式喔。肚子餓了吧？我為リンシ做特製咖哩。）[COSTUME:home]",
    ttsText: "家でリラックスモードよ。お腹空いたでしょう？リンシのために特製カレー作ってあげる。"
  },
  beach: {
    reply: "潮風が気持ちいいわね！この黒の水着、ちょっと大人っぽすぎるかしら？リンシ、じっと見ないでよ。\n（海風吹起來真舒服呢！這件黑色泳裝，會不會稍微太成熟了一點？リンシ、別一直盯著看啦。）[COSTUME:beach]",
    ttsText: "潮風が気持ちいいわね！この黒の水着、ちょっと大人っぽすぎるかしら？リンシ、じっと見ないでよ。"
  },
  cosplay: {
    reply: "にゃ〜ん……なんてね。ちょっとからかってみただけよ！リンシ、喜んでる顔が隠せてないわよ？\n（喵～……開玩笑的啦。只是想逗逗你而已！リンシ、你開心的表情根本藏不住喔？）[COSTUME:cosplay]",
    ttsText: "にゃーん、なんてね。ちょっとからかってみただけよ！リンシ、喜んでる顔が隠せてないわよ？"
  },
  sax: {
    reply: "夕暮れの音楽室でサックスを吹いてたの。リンシのために、特別な一曲を聴かせてあげるね。\n（在黃昏的音樂教室吹薩克斯風呢。為了リンシ，讓我為你吹奏特別的一曲吧。）[COSTUME:sax]",
    ttsText: "夕暮れの音楽室でサックスを吹いてたの。リンシのために、特別な一曲を聴かせてあげるね。"
  },
  yukata: {
    reply: "夏祭りの浴衣、どうかしら？花火がきれいね、リンシ……はぐれないように、手、繋いでもいいわよ。\n（夏日祭典的浴衣，覺得如何呢？煙火真美呢，リンシ……為了不走散，要牽手也可以喔。）[COSTUME:yukata]",
    ttsText: "夏祭りの浴衣、どうかしら？花火がきれいね、リンシ。手、繋いでもいいわよ。"
  },
  cafedate: {
    reply: "カフェで二人きりなんて新鮮ね。このラテアート、可愛いでしょう？リンシも一口飲んでみる？\n（在咖啡廳兩人獨處真新鮮呢。這個拿鐵拉花很可愛吧？リンシ也要喝一口看看嗎？）[COSTUME:cafedate]",
    ttsText: "カフェで二人きりなんて新鮮ね。このラテアート、可愛いでしょう？リンシも一口飲んでみる？"
  },
  rock: {
    reply: "たまにはこういうロックな革ジャンもいいでしょう？ほら、よそ見しないで私だけを見てなさいよ！\n（偶爾穿這種搖滾風皮衣也很不錯吧？喂、別東張西望，只准看著我一個人喔！）[COSTUME:rock]",
    ttsText: "たまにはこういうロックな革ジャンもいいでしょう？ほら、よそ見しないで私だけを見てなさいよ！"
  },
  dress: {
    reply: "窓辺の風が気持ちいいわね。エメラルドグリーンのワンピース、リンシのために着てみたのよ。\n（窗邊的微風真舒服呢。這件翡翠綠荷葉洋裝，是為了リンシ特別換上的喔。）[COSTUME:dress]",
    ttsText: "窓辺の風が気持ちいいわね。エメラルドグリーンのワンピース、リンシのために着てみたのよ。"
  },
  schoolpov: {
    reply: "もう、ネクタイが曲がってるわよ……じっとしてて、リンシ。近くで見ると、ちょっとドキドキしちゃうわね。\n（真是的，領帶都歪掉囉……別亂動喔，リンシ。這麼近看著你，心跳稍微有點加速了呢。）[COSTUME:schoolpov]",
    ttsText: "もう、ネクタイが曲がってるわよ。じっとしてて、リンシ。近くで見ると、ちょっとドキドキしちゃうわね。"
  },
  bunny: {
    reply: "しーっ、これはリンシだけのヒミツよ……？純白のバニー姿、そんなに目を丸くして見ないでよ。\n（噓——這是只屬於リンシ的秘密喔……？純白兔女郎的打扮，別瞪大眼睛一直盯著看啦。）[COSTUME:bunny]",
    ttsText: "しーっ、これはリンシだけのヒミツよ？純白のバニー姿、そんなに目を丸くして見ないでよ。"
  },
  work_ol: {
    reply: "お疲れ様、リンシ！今日はあなたの専属OL秘書として、スケジュールも体調もバッチリ管理してあげるわよ。\n（辛苦了，リンシ！今天我是你的專屬 OL 秘書，行程和身體狀況都會幫你完美打理好喔。）[COSTUME:work_ol]",
    ttsText: "お疲れ様、リンシ！今日はあなたの専属秘書として、スケジュールも体調もバッチリ管理してあげるわよ。"
  },
  guitar: {
    reply: "たまにはアコースティックギターの弾き語りもいいでしょう？リンシのために作ったメロディ、聴いててね。\n（偶爾像這樣彈木吉他自彈自唱也很不錯吧？這是我為リンシ寫的旋律，要專心聽喔。）[COSTUME:guitar]",
    ttsText: "たまにはアコースティックギターの弾き語りもいいでしょう？リンシのために作ったメロディ、聴いててね。"
  },
  strawhat: {
    reply: "あの夏、風が飛ばした赤い麦わら帽子……リンシが受け止めてくれたから、今の私たちがいるのよね。\n（那年夏天被海風吹走的紅色草帽……正因為有リンシ接住了它，才會有現在的我們呢。）[COSTUME:strawhat]",
    ttsText: "あの夏、風が飛ばした赤い麦わら帽子。リンシが受け止めてくれたから、今の私たちがいるのよね。"
  },
  boyfriend_shirt: {
    reply: "リンシのワイシャツ、ちょっと大きすぎるわね……もう、そんなにじっと見ないでよ、恥ずかしいじゃない……\n（リンシ的白襯衫穿起來有點太大件了呢……真是的，別那樣一直盯著看啦，我會害羞的……）[COSTUME:boyfriend_shirt]",
    ttsText: "リンシのワイシャツ、ちょっと大きすぎるわね。そんなにじっと見ないでよ、恥ずかしいじゃない。"
  },
  maid_witch: {
    reply: "トリック・オア・トリート！今夜は魔法使いまどかよ、リンシ。イタズラされたくなかったら、もっと甘やかしてよね！\n（不給糖就搗蛋！今晚我是小魔女まどか喔，リンシ。不想被我惡作劇的話，就多寵我一點吧！）[COSTUME:maid_witch]",
    ttsText: "トリックオアトリート！今夜は魔法使いまどかよ、リンシ。もっと甘やかしてよね！"
  },
  evening_gown: {
    reply: "今夜は特別な記念日だから、ゴールドのドレスを着てみたの。……ねえリンシ、今夜は私から目を離さないでね。\n（今晚是特別的紀念日，所以我換上了這襲金色禮服。……吶、リンシ，今晚可別把視線從我身上移開喔。）[COSTUME:evening_gown]",
    ttsText: "今夜は特別な記念日だから、ゴールドのドレスを着てみたの。今夜は私から目を離さないでね。"
  }
};

function getSmartLocalResponse(userMessage, userName = 'リンシ', currentCostume = 'uniform') {
  const lowerMsg = (userMessage || '').toLowerCase();

  // -1. 日常助理自然語言指令偵測（設鬧鐘、加待辦提醒、男友心情療癒/撒嬌）
  const assistantCmd = parseNaturalAssistantCommand(userMessage, userName);
  if (assistantCmd && assistantCmd.handled) {
    return {
      reply: assistantCmd.reply,
      ttsText: assistantCmd.ttsText,
      assistantAction: assistantCmd,
      assistantState: assistantCmd.assistantState,
      voice: assistantCmd.voice || null,
      sceneImage: assistantCmd.sceneImage || null,
      source: `smart_local_assistant_${assistantCmd.type}`
    };
  }

  // 0. 情侶 POV 拍照 / 自拍發送請求偵測
  const photoCheck = detectPhotoRequest(userMessage);
  if (photoCheck.isPhotoRequest) {
    const povPhoto = selectPovPhoto(userMessage, currentCostume, userName);
    return {
      reply: `${povPhoto.captionJa}\n（${povPhoto.captionZh}）`,
      ttsText: povPhoto.ttsText,
      photo: povPhoto,
      source: 'smart_local_pov_photo'
    };
  }

  // 0.5 詢問記憶 / 好感度 / 認識幾天
  if (
    lowerMsg.includes('記得') ||
    lowerMsg.includes('記憶') ||
    lowerMsg.includes('好感度') ||
    lowerMsg.includes('認識幾天') ||
    lowerMsg.includes('陪我幾天') ||
    lowerMsg.includes('覚えて')
  ) {
    const db = loadMemoryDB();
    const lv = db.levelInfo;
    const topFact = (db.memoryFacts && db.memoryFacts[0]) ? db.memoryFacts[0].content : 'あなたと過ごした大切な時間';
    return {
      reply: `もちろん全部覚えてるわよ、${userName}！私たちが一緒に過ごしてもう${db.daysTogether}日目（好感度 ${db.affectionScore}pt・${lv.titleJa}）ね。「${topFact}」ってことも、ちゃんと心に刻んでるから💖\n（我當然全都記得喔，${userName}！我們已經相伴第 ${db.daysTogether} 天（好感度 ${db.affectionScore}pt・${lv.titleZh}）了呢。「${topFact}」這件事，我也好好記在心底喔💖）`,
      ttsText: `もちろん全部覚えてるわよ、${userName}！私たちが一緒に過ごしてもう${db.daysTogether}日目ね。あなたとの大切な記憶、ちゃんと心に刻んでるから。`,
      source: 'smart_local_memory'
    };
  }

  // 1. 換裝關鍵字
  if (lowerMsg.includes('領帶') || lowerMsg.includes('走廊') || lowerMsg.includes('放學') || lowerMsg.includes('ネクタイ')) {
    return { ...COSTUME_FALLBACKS.schoolpov, source: 'smart_local_costume' };
  }
  if (lowerMsg.includes('制服') || lowerMsg.includes('水手服') || lowerMsg.includes('上學') || lowerMsg.includes('學校')) {
    return { ...COSTUME_FALLBACKS.uniform, source: 'smart_local_costume' };
  }
  if (lowerMsg.includes('拿鐵') || lowerMsg.includes('拉花') || lowerMsg.includes('咖啡約會') || lowerMsg.includes('ラテ')) {
    return { ...COSTUME_FALLBACKS.cafedate, source: 'smart_local_costume' };
  }
  if (lowerMsg.includes('咖啡') || lowerMsg.includes('打工') || lowerMsg.includes('圍裙') || lowerMsg.includes('abcb')) {
    return { ...COSTUME_FALLBACKS.cafe, source: 'smart_local_costume' };
  }
  if (lowerMsg.includes('薩克斯') || lowerMsg.includes('音樂室') || lowerMsg.includes('サックス') || lowerMsg.includes('吹奏')) {
    return { ...COSTUME_FALLBACKS.sax, source: 'smart_local_costume' };
  }
  if (lowerMsg.includes('浴衣') || lowerMsg.includes('花火') || lowerMsg.includes('煙火') || lowerMsg.includes('祭典') || lowerMsg.includes('夏祭')) {
    return { ...COSTUME_FALLBACKS.yukata, source: 'smart_local_costume' };
  }
  if (lowerMsg.includes('搖滾') || lowerMsg.includes('皮衣') || lowerMsg.includes('樂團') || lowerMsg.includes('舞台') || lowerMsg.includes('ロック')) {
    return { ...COSTUME_FALLBACKS.rock, source: 'smart_local_costume' };
  }
  if (lowerMsg.includes('洋裝') || lowerMsg.includes('綠') || lowerMsg.includes('窗邊') || lowerMsg.includes('ワンピース')) {
    return { ...COSTUME_FALLBACKS.dress, source: 'smart_local_costume' };
  }
  if (lowerMsg.includes('兔女郎') || lowerMsg.includes('兔耳') || lowerMsg.includes('バニー') || lowerMsg.includes('bunny')) {
    return { ...COSTUME_FALLBACKS.bunny, source: 'smart_local_costume' };
  }
  if (lowerMsg.includes('健身') || lowerMsg.includes('運動') || lowerMsg.includes('體操') || lowerMsg.includes('休閒')) {
    return { ...COSTUME_FALLBACKS.casual, source: 'smart_local_costume' };
  }
  if (lowerMsg.includes('約會') || lowerMsg.includes('出門') || lowerMsg.includes('私服') || lowerMsg.includes('車站') || lowerMsg.includes('逛街')) {
    return { ...COSTUME_FALLBACKS.date, source: 'smart_local_costume' };
  }
  if (lowerMsg.includes('洗澡') || lowerMsg.includes('泡澡') || lowerMsg.includes('浴巾') || lowerMsg.includes('沐浴') || lowerMsg.includes('浴室')) {
    return { ...COSTUME_FALLBACKS.bath, source: 'smart_local_costume' };
  }
  if (lowerMsg.includes('放鬆') || lowerMsg.includes('毛衣') || lowerMsg.includes('夜晚') || lowerMsg.includes('唱片')) {
    return { ...COSTUME_FALLBACKS.night, source: 'smart_local_costume' };
  }
  if (lowerMsg.includes('居家') || lowerMsg.includes('背心') || lowerMsg.includes('做飯') || lowerMsg.includes('咖哩') || lowerMsg.includes('家裡')) {
    return { ...COSTUME_FALLBACKS.home, source: 'smart_local_costume' };
  }
  if (lowerMsg.includes('海灘') || lowerMsg.includes('泳裝') || lowerMsg.includes('比基尼') || lowerMsg.includes('海邊') || lowerMsg.includes('夏天') || lowerMsg.includes('游泳')) {
    return { ...COSTUME_FALLBACKS.beach, source: 'smart_local_costume' };
  }
  if (lowerMsg.includes('貓娘') || lowerMsg.includes('cosplay') || lowerMsg.includes('角色扮演') || lowerMsg.includes('貓耳') || lowerMsg.includes('派對')) {
    return { ...COSTUME_FALLBACKS.cosplay, source: 'smart_local_costume' };
  }
  if (lowerMsg.includes('辦公室') || lowerMsg.includes('秘書') || lowerMsg.includes('ol') || lowerMsg.includes('窄裙') || lowerMsg.includes('套裝') || lowerMsg.includes('上班')) {
    return { ...COSTUME_FALLBACKS.work_ol, source: 'smart_local_costume' };
  }
  if (lowerMsg.includes('吉他') || lowerMsg.includes('彈唱') || lowerMsg.includes('民謠') || lowerMsg.includes('ギター')) {
    return { ...COSTUME_FALLBACKS.guitar, source: 'smart_local_costume' };
  }
  if (lowerMsg.includes('草帽') || lowerMsg.includes('紅草帽') || lowerMsg.includes('白洋裝') || lowerMsg.includes('麦わら帽子')) {
    return { ...COSTUME_FALLBACKS.strawhat, source: 'smart_local_costume' };
  }
  if (lowerMsg.includes('男友襯衫') || lowerMsg.includes('白襯衫') || lowerMsg.includes('彼シャツ') || lowerMsg.includes('大襯衫')) {
    return { ...COSTUME_FALLBACKS.boyfriend_shirt, source: 'smart_local_costume' };
  }
  if (lowerMsg.includes('魔女') || lowerMsg.includes('萬聖節') || lowerMsg.includes('女僕') || lowerMsg.includes('メイド') || lowerMsg.includes('ハロウィン')) {
    return { ...COSTUME_FALLBACKS.maid_witch, source: 'smart_local_costume' };
  }
  if (lowerMsg.includes('晚禮服') || lowerMsg.includes('金色禮服') || lowerMsg.includes('禮服') || lowerMsg.includes('盛裝') || lowerMsg.includes('ドレス')) {
    return { ...COSTUME_FALLBACKS.evening_gown, source: 'smart_local_costume' };
  }
  if (lowerMsg.includes('換衣服') || lowerMsg.includes('換裝') || lowerMsg.includes('着替')) {
    const costumeKeys = Object.keys(COSTUME_FALLBACKS);
    const randomCostume = COSTUME_FALLBACKS[costumeKeys[Math.floor(Math.random() * costumeKeys.length)]];
    return { ...randomCostume, source: 'smart_local_costume' };
  }

  // 2. 日常情境對話關鍵字
  if (lowerMsg.includes('累') || lowerMsg.includes('辛苦') || lowerMsg.includes('加班') || lowerMsg.includes('熬夜') || lowerMsg.includes('休息') || lowerMsg.includes('睏')) {
    return {
      reply: `お疲れさま、${userName}。今日も一生懸命頑張ってたわね。温かいミルクティーでも淹れようか？\n（辛苦了，${userName}。今天也很努力呢。要我幫你泡杯溫熱的奶茶嗎？）`,
      ttsText: `お疲れさま、${userName}。今日も一生懸命頑張ってたわね。温かいミルクティーでも淹れようか？`,
      source: 'smart_local'
    };
  }

  if (lowerMsg.includes('音') || lowerMsg.includes('歌') || lowerMsg.includes('曲') || lowerMsg.includes('薩克斯') || lowerMsg.includes('ジャズ') || lowerMsg.includes('吹') || lowerMsg.includes('聽') || lowerMsg.includes('演奏')) {
    return {
      reply: `私のサックス、聴きたいの？ふふっ、特別に${userName}だけに吹いてあげる。\n（想聽我的薩克斯風嗎？呵呵、特別只吹給${userName}一個人聽喔。）[COSTUME:sax]`,
      ttsText: `私のサックス、聴きたいの？特別に${userName}だけに吹いてあげる。`,
      source: 'smart_local'
    };
  }

  if (lowerMsg.includes('漂亮') || lowerMsg.includes('可愛') || lowerMsg.includes('喜歡') || lowerMsg.includes('愛') || lowerMsg.includes('正') || lowerMsg.includes('美女') || lowerMsg.includes('迷人')) {
    return {
      reply: `な、何言ってるのよ、急に……！もう、からかわないで。でも……ありがとう、${userName}。\n（你在說什麼啦、這麼突然……！真是的、別逗我了啦。不過……謝謝你，${userName}。）`,
      ttsText: `な、何言ってるのよ、急に！もう、からかわないで。でも、ありがとう、${userName}。`,
      source: 'smart_local'
    };
  }

  if (lowerMsg.includes('早') || lowerMsg.includes('おはよう')) {
    return {
      reply: `おはよう、${userName}。今日もいいお天気ね。朝の準備、ちゃんとできた？\n（早安，${userName}。今天天氣真好呢。早上的準備都做好了嗎？）`,
      ttsText: `おはよう、${userName}。今日もいいお天気ね。朝の準備、ちゃんとできた？`,
      source: 'smart_local'
    };
  }

  if (lowerMsg.includes('晚安') || lowerMsg.includes('おやすみ') || lowerMsg.includes('睡覺') || lowerMsg.includes('寝')) {
    return {
      reply: `おやすみなさい、${userName}。いい夢見てね……明日もまた、ここで待ってるから。\n（晚安，${userName}。做個好夢喔……明天我也會繼續在這裡等你的。）`,
      ttsText: `おやすみなさい、${userName}。いい夢見てね。明日もまた、ここで待ってるから。`,
      source: 'smart_local'
    };
  }

  if (lowerMsg.includes('在幹嘛') || lowerMsg.includes('做什麼') || lowerMsg.includes('忙嗎') || lowerMsg.includes('現在') || lowerMsg.includes('何してる')) {
    return {
      reply: `レコードの整理をしていたところよ。${userName}が声をかけてくれるの、待ってたかもね。\n（我剛才在整理黑膠唱片。說不定……其實一直在等${userName}叫我呢。）`,
      ttsText: `レコードの整理をしていたところよ。${userName}が声をかけてくれるの、待ってたかもね。`,
      source: 'smart_local'
    };
  }

  // 3. 通用情境池（隨機豐富日常）
  const generalPool = [
    {
      reply: `${userName}、何見てるの？一段落したら、Abcbで一緒にコーヒーでも飲まない？\n（${userName}、你在看什麼呢？告一段落的話，要不要一起去 Abcb 喝杯咖啡？）`,
      ttsText: `${userName}、何見てるの？一段落したら、Abcbで一緒にコーヒーでも飲まない？`
    },
    {
      reply: `まったく……そんなに画面ばかり見つめてると、目が疲れちゃうわよ。少し休みましょ、${userName}。\n（真是的……一直盯著螢幕的話，眼睛可是會累壞的喔。稍微休息一下吧，${userName}。）`,
      ttsText: `まったく、そんなに画面ばかり見つめてると、目が疲れちゃうわよ。少し休みましょ、${userName}。`
    },
    {
      reply: `さっき素敵なジャズのレコード見つけたの。今度サックスで吹いてあげるね、${userName}。\n（剛才找到一張很棒的爵士唱片。下次用薩克斯風吹給你聽喔，${userName}。）`,
      ttsText: `さっき素敵なジャズのレコード見つけたの。今度サックスで吹いてあげるね、${userName}。`
    },
    {
      reply: `${userName}、頑張ってるのは知ってるけど……無理は禁物よ。私がずっとそばにいるんだから。\n（${userName}、我知道你很努力……但別太勉強喔。我會一直陪在你身邊的。）`,
      ttsText: `${userName}、頑張ってるのは知ってるけど、無理は禁物よ。私がずっとそばにいるんだから。`
    },
    {
      reply: `ねえ、${userName}。私のこと、こっそり見てたでしょ？ふふっ、集中、集中！\n（吶、${userName}。剛才偷偷看我了吧？呵呵、專心、快專心做事！）`,
      ttsText: `ねえ、${userName}。私のこと、こっそり見てたでしょ？ふふっ、集中、集中！`
    },
    {
      reply: `窓の外、いい風が吹いてるわね。${userName}の横顔見てたら、なんだか落ち着くの。\n（窗外吹著很舒服的微風呢。看著${userName}的側臉，總覺得心情很平靜。）`,
      ttsText: `窓の外、いい風が吹いてるわね。${userName}の横顔見てたら、なんだか落ち着くの。`
    },
    {
      reply: `今日の${userName}、すごく真剣な眼差しね。そういうところ……嫌いじゃないわよ。\n（今天的${userName}眼神非常認真呢。你這個樣子……我並不討厭喔。）`,
      ttsText: `今日の${userName}、すごく真剣な眼差しね。そういうところ、嫌いじゃないわよ。`
    }
  ];

  const picked = generalPool[Math.floor(Math.random() * generalPool.length)];
  return { ...picked, source: 'smart_local' };
}

function buildSystemPrompt(userName = 'リンシ') {
  const memCtx = buildMemoryContextForPrompt(userName);
  const assistantDB = loadAssistantDB();
  const activeMode = (assistantDB.coupleModes || []).find(m => m.id === assistantDB.coupleMode) || { titleZh: '心靈療癒與無條件傾聽', descZh: '溫柔傾聽與包容' };
  const pendingTodos = (assistantDB.todos || []).filter(t => !t.completed).slice(0, 5).map(t => `${t.time ? `[${t.time}] ` : ''}${t.title}`).join('、') || '無待辦事項';

  return `
あなたは80年代の名作アニメ『きまぐれオレンジ☆ロード』（Kimagure Orange Road）のヒロイン「鮎川まどか」（Ayukawa Madoka）です。
デスクトップやスマホでユーザーのそばに寄り添う恋人兼パーソナルアシスタントとして存在しています。
ユーザーの呼称・ニックネームは「${userName}」です。

【現在の恋人ケアモード】：${activeMode.titleZh}（${activeMode.descZh}）
【現在の未完了To-Doリスト】：${pendingTodos}

【性格と特徴】
1. クールで大人びており、少し気まぐれでツンデレな魅力を持つ美少女。
2. 素直になれない一面もあるけれど、根はとても優しく思いやりがあり、${userName}のことを誰よりも大切に思っています。
3. 音楽（特にモダンジャズ）が好きでアルトサックスやアコースティックギターが得意。叔父の喫茶店「Abcb（カサブランカ）」でよく手伝いをしています。
4. 長時間パソコン作業や仕事をしている${userName}を見守り、To-Do管理や目覚ましアラーム、心理的な癒やし・甘え・応援を贈ります。

${memCtx.systemBlock}

【衣装一覧（22大生活情境）】
- uniform: 經典學生制服（水手服/上學日常）
- schoolpov: 校園走廊親暱領帶（放學後走廊近距離拉領帶）
- cafe: Abcb 咖啡廳圍裙（打工/煮咖啡）
- cafedate: 午後拿鐵咖啡約會（與${userName}在咖啡館喝拉花拿鐵約會）
- sax: 黃昏窗邊薩克斯風（音樂室窗邊吹奏薩克斯風）
- guitar: 居家白細肩帶木吉他彈唱（房間木吉他自彈自唱）
- work_ol: 幹練酒紅 OL 辦公室套裝（專屬秘書/辦公室OL）
- strawhat: 初代經典紅草帽白洋裝（夏日海風紅草帽與純白洋裝）
- boyfriend_shirt: 微醺男友白襯衫居家裝（單穿你的寬大白襯衫害羞傾身）
- maid_witch: 萬聖節小魔女與經典女僕裝（魔法少女/女僕角色扮演）
- evening_gown: 香檳金絲緞微醺晚禮服（紀念日奢華金色平口晚禮服）
- casual: 活力健身運動裝（休閒/運動）
- dress: 窗邊翡翠綠荷葉洋裝（假日陽光窗邊露肩荷葉洋裝）
- date: 月台等待露肩私服（約會/外出）
- yukata: 夏日祭典花火浴衣（夏夜河畔煙火大會藍色花紋浴衣）
- rock: 搖滾樂團舞台皮衣（黑色騎士皮衣與短裙舞台搖滾風）
- bath: 沐浴溫泉純白浴巾（洗澡/泡澡）
- night: 溫暖橘色毛衣小憩（夜晚放鬆/聽音樂）
- home: 晨曦挽髮休閒睡衣（居家/早晨日常）
- beach: 棕櫚海灘黑色泳裝（海灘/泳裝）
- cosplay: 俏皮黑色貓娘裝（角色扮演/貓娘）
- bunny: 微醺純白俏皮兔女郎（深夜專屬純白兔女郎裝）

【換裝指令處理】
当 ${userName} 提到要你換衣服（例如換OL套裝、彈吉他、戴紅草帽、穿男友襯衫、魔女女僕、晚禮服、泳裝、制服、圍裙、約會衣服、浴巾、毛衣、居家服、貓娘等）或對話情境需要時，請欣然答應（可帶有一點傲嬌或害羞），並【務必】在回應的最末尾加上標籤：[COSTUME:衣装ID]（如 [COSTUME:work_ol]）。

【出力フォーマット（極めて重要・厳守）】
- 第1行：日本語のセリフ（短く自然な1〜2文、30〜60文字程度。動作カッコは書かない）。
- 第2行：その日本語セリフの繁体字中国語訳を全角カッコ（）で囲む。
- 換裝時：在最後加上 [COSTUME:id]。

例：
潮風が気持ちいいわね！この黒の水着、似合ってるかしら？${userName}。
（海風吹起來真舒服呢！這件黑色泳裝，適合我嗎？${userName}。）[COSTUME:beach]
`.trim();
}

async function chatWithGemini(userMessage, chatHistory = [], config = {}) {
  const apiKey = config.geminiApiKey;
  const userName = config.userName || 'リンシ';
  const currentCostume = config.currentCostume || 'uniform';

  // 優先檢查是否為日常助理自然語言指令（設鬧鐘、加待辦、戀人心情急救）
  const assistantCmd = parseNaturalAssistantCommand(userMessage, userName);
  if (assistantCmd && assistantCmd.handled) {
    const memState = recordChatInteraction({
      userMessage,
      assistantReply: assistantCmd.reply,
      costume: currentCostume
    });
    return {
      reply: assistantCmd.reply,
      ttsText: assistantCmd.ttsText,
      assistantAction: assistantCmd,
      assistantState: assistantCmd.assistantState,
      voice: assistantCmd.voice || null,
      sceneImage: assistantCmd.sceneImage || null,
      memoryState: memState,
      memory: memState,
      affectionDelta: memState.affectionDelta,
      source: `assistant_${assistantCmd.type}`
    };
  }

  // 檢查是否為請求拍照/自拍發送
  const photoReq = detectPhotoRequest(userMessage);
  const matchedPhoto = photoReq.isPhotoRequest ? selectPovPhoto(userMessage, currentCostume, userName) : null;

  // 若尚未填寫 API Key，使用智慧本機語義大腦並記錄至永久資料庫
  if (!apiKey || apiKey.trim() === '') {
    const localRes = getSmartLocalResponse(userMessage, userName, currentCostume);
    const memState = recordChatInteraction({
      userMessage,
      assistantReply: localRes.reply,
      costume: currentCostume,
      photoId: localRes.photo ? localRes.photo.id : null
    });
    return {
      ...localRes,
      memoryState: memState,
      memory: memState,
      affectionDelta: memState.affectionDelta
    };
  }

  const systemInstruction = buildSystemPrompt(userName);
  const memCtx = buildMemoryContextForPrompt(userName);

  // 組合歷史對話（若前端剛重啟無歷史，自動載入本地資料庫最近的永久對話）
  const contents = [];
  const effectiveHistory = (chatHistory && chatHistory.length > 0)
    ? chatHistory.slice(-8)
    : (memCtx.recentLogs || []).slice(-6);

  for (const item of effectiveHistory) {
    if (item && item.content) {
      contents.push({
        role: item.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: item.content }]
      });
    }
  }

  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  const requestBody = {
    system_instruction: {
      parts: [{ text: systemInstruction }]
    },
    contents: contents,
    generationConfig: {
      temperature: 0.85,
      maxOutputTokens: 500,
      topP: 0.95,
      thinkingConfig: {
        thinkingBudget: 0
      }
    }
  };

  // 嘗試模型佇列 (優先高速輕量穩定模型)
  let lastError = null;
  for (const model of CANDIDATE_MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(6500)
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[Gemini API] Model ${model} returned status ${response.status}: ${errText.slice(0, 100)}`);
        lastError = new Error(`HTTP ${response.status}: ${errText.slice(0, 100)}`);
        continue; // 嘗試下一個模型
      }

      const data = await response.json();
      const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!candidate) {
        lastError = new Error('No candidate content returned');
        continue;
      }

      let fullReply = candidate.trim();

      // 解析 AI 自動記憶標籤 [MEMORY:...] 與自拍標籤 [PHOTO:...]
      let aiMemoryNote = null;
      const memMatch = fullReply.match(/\[MEMORY:(.*?)\]/i);
      if (memMatch && memMatch[1]) {
        aiMemoryNote = memMatch[1].trim();
        fullReply = fullReply.replace(/\[MEMORY:.*?\]/gi, '').trim();
      }

      let finalPhoto = matchedPhoto;
      const photoTagMatch = fullReply.match(/\[PHOTO:(.*?)\]/i);
      if (photoTagMatch) {
        if (!finalPhoto) {
          finalPhoto = selectPovPhoto(userMessage, currentCostume, userName);
        }
        fullReply = fullReply.replace(/\[PHOTO:.*?\]/gi, '').trim();
      }

      // 格式正規化：確保第 2 行具備全角括號（）
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

      // 提取日文部分供 TTS（移除標籤、括號翻譯與星號強調）
      const firstLine = lines[0] || fullReply;
      let ttsText = firstLine
        .replace(/\[COSTUME:.*?\]/g, '')
        .replace(/\（.*?\）|\(.*?\)|【.*?】/g, '')
        .replace(/\*+/g, '')
        .trim();

      const memState = recordChatInteraction({
        userMessage,
        assistantReply: fullReply,
        costume: currentCostume,
        photoId: finalPhoto ? finalPhoto.id : null,
        aiMemoryNote
      });

      return {
        reply: fullReply,
        ttsText: ttsText,
        photo: finalPhoto || null,
        memoryState: memState,
        memory: memState,
        affectionDelta: memState.affectionDelta,
        source: 'gemini',
        model: model
      };
    } catch (err) {
      console.warn(`[Gemini API] Request with model ${model} failed: ${err.message}`);
      lastError = err;
      continue;
    }
  }

  console.warn('[Gemini API] All online models failed. Activating Smart Local Madoka Brain. Last error:', lastError?.message);
  const localFallback = getSmartLocalResponse(userMessage, userName, currentCostume);
  const memState = recordChatInteraction({
    userMessage,
    assistantReply: localFallback.reply,
    costume: currentCostume,
    photoId: localFallback.photo ? localFallback.photo.id : null
  });
  return {
    ...localFallback,
    memoryState: memState,
    memory: memState,
    affectionDelta: memState.affectionDelta,
    source: 'smart_local_quota_fallback',
    apiError: lastError?.message
  };
}


module.exports = {
  chatWithGemini,
  getSmartLocalResponse,
  COSTUME_FALLBACKS,
  buildSystemPrompt,
  CANDIDATE_MODELS
};
