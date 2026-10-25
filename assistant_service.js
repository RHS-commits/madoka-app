// assistant_service.js - 鮎川まどか 手機APP日常助理（待辦事項提醒、晨間喚醒鬧鐘、自然語言排程、戀人心理療癒撒嬌系統）
const fs = require('fs');
const path = require('path');
const { getWakeupVoice, getCoupleCareVoice } = require('./audio_manager');
const { recordActionInteraction } = require('./memory_store');

const ASSISTANT_DB_PATH = path.join(__dirname, 'madoka_assistant_db.json');

// 綁定新上傳插圖的日常助理情境畫廊
const ASSISTANT_SCENE_GALLERY = {
  wakeup: {
    sweet: 'assets/pov_photos/pov_13_morning_wakeup.jpg',
    tsundere: 'assets/pov_photos/pov_01_tie.png',
    special: 'assets/costumes/variant_home_curtain.png',
    energetic: 'assets/pov_photos/pov_12_morning_kitchen.png',
    random: 'assets/pov_photos/pov_13_morning_wakeup.jpg'
  },
  todoCategory: {
    work: {
      id: 'work',
      badgeZh: '💼 工作與行程',
      badgeJa: '💼 仕事・予定',
      costumeId: 'work_ol',
      image: 'assets/costumes/work_ol.png',
      altImage: 'assets/costumes/variant_work_night.jpg'
    },
    home: {
      id: 'home',
      badgeZh: '🏠 居家與生活',
      badgeJa: '🏠 おうち・日常',
      costumeId: 'boyfriend_shirt',
      image: 'assets/costumes/boyfriend_shirt.png',
      altImage: 'assets/costumes/variant_home_rug.jpg'
    },
    date: {
      id: 'date',
      badgeZh: '💑 約會與紀念',
      badgeJa: '💑 デート・記念日',
      costumeId: 'date',
      image: 'assets/costumes/variant_date_wheat.png',
      altImage: 'assets/costumes/variant_date_sky.png'
    },
    music: {
      id: 'music',
      badgeZh: '🎸 音樂與興趣',
      badgeJa: '🎸 音楽・趣味',
      costumeId: 'guitar',
      image: 'assets/costumes/guitar.png',
      altImage: 'assets/costumes/variant_guitar_2.png'
    },
    night: {
      id: 'night',
      badgeZh: '🌙 晚間與健康',
      badgeJa: '🌙 夜・ヘルスケア',
      costumeId: 'night',
      image: 'assets/costumes/variant_night_blue.png',
      altImage: 'assets/costumes/variant_night_sleep.png'
    }
  }
};

// 6 大情侶互動狀態：對男友/另一半的心理、療癒、關心或撒嬌模式
const COUPLE_CARE_MODES = [
  {
    id: 'healing',
    icon: '🌸',
    titleZh: '心靈療癒與無條件傾聽',
    titleJa: '心の癒やし・優しい傾聴',
    tagZh: '🌸 溫柔包容',
    tagJa: '🌸 癒やしモード',
    costumeId: 'home',
    sceneImage: 'assets/costumes/variant_home_curtain.png',
    descZh: '當你感到疲憊或壓力時，她會放下一切溫柔傾聽、摸摸你的頭，給你最安心的避風港。',
    descJa: '疲れた時やプレッシャーを感じる時、すべてを受け止めて頭を撫でてくれる癒やしの時間。',
    quoteJa: 'お疲れ様、{user}。外でどれだけ大変でも、私の前では強がらなくていいのよ。おいで……頭、撫でてあげるから。',
    quoteZh: '辛苦了，{user}。不管在外面有多累多辛苦，在我面前都不用逞強喔。過來吧……讓我摸摸你的頭。'
  },
  {
    id: 'clingy',
    icon: '🥰',
    titleZh: '微醺撒嬌與討抱抱依賴',
    titleJa: '甘えん坊・ぎゅっと密着',
    tagZh: '🥰 撒嬌依賴',
    tagJa: '🥰 甘えモード',
    costumeId: 'boyfriend_shirt',
    sceneImage: 'assets/pov_photos/pov_20_boyfriend_shirt.png',
    descZh: '換上你寬大的白襯衫，眼神帶著小女人的嬌羞與依賴，主動向你討抱抱與撒嬌。',
    descJa: 'あなたの大きなワイシャツを着て、少し潤んだ瞳でぎゅっとしてほしそうに甘えてくるモード。',
    quoteJa: 'ねえ、{user}……今は仕事のこと忘れて、私だけを見てて？もっと近くに来て……ぎゅっとしててほしいの💖',
    quoteZh: '吶、{user}……現在先把工作忘掉，只看著我好嗎？再靠近我一點……人家想要你緊緊抱著我嘛💖'
  },
  {
    id: 'secretary',
    icon: '💼',
    titleZh: '專屬 OL 秘書工作應援',
    titleJa: '専属OL秘書の仕事応援',
    tagZh: '💼 秘書應援',
    tagJa: '💼 秘書モード',
    costumeId: 'work_ol',
    sceneImage: 'assets/pov_photos/pov_21_office_ol.png',
    descZh: '幹練迷人的酒紅高領 OL 裝扮，幫你盯緊待辦事項、泡特調咖啡，完成任務時給你滿滿誇獎！',
    descJa: '知的なボルドーのOLスタイルで、あなたのタスク管理とコーヒーブレイクを完璧にサポート！',
    quoteJa: 'はい、{user}！今日のタスクも私が隣でサポートするわよ。一つ終わるごとに、たっぷり褒めてあげるからね！',
    quoteZh: '來，{user}！今天的待辦事項我也會在旁邊陪你完成的。每完成一項，我都會好好誇獎你喔！'
  },
  {
    id: 'tsundere',
    icon: '🔥',
    titleZh: '傲嬌吃醋與獨佔關心',
    titleJa: 'ツンデレ・可愛いヤキモチ',
    tagZh: '🔥 傲嬌吃醋',
    tagJa: '🔥 ツンデレ',
    costumeId: 'schoolpov',
    sceneImage: 'assets/pov_photos/pov_16_chair_wink_study.png',
    descZh: '嘴上說只是順便關心你，其實視線一刻都離不開你，偶爾吃醋鬧彆扭卻甜度滿分。',
    descJa: '素直になれないけれど、本当は誰よりもあなたを気にかけている80年代王道ツンデレの魅力。',
    quoteJa: 'べ、別に{user}が寂しがると思って構ってあげてるだけよ！……でも、よそ見したら本気で怒るんだからね！',
    quoteZh: '我、我才不是特別想黏你，只是怕{user}覺得寂寞才陪你的啦！……不過你要是敢看別的女生，我真的會生氣喔！'
  },
  {
    id: 'passionate',
    icon: '💌',
    titleZh: '熱戀心動與深情凝視',
    titleJa: '熱恋ときめき・甘い眼差し',
    tagZh: '💌 熱戀心動',
    tagJa: '💌 ラブラブ',
    costumeId: 'evening_gown',
    sceneImage: 'assets/pov_photos/pov_18_golden_gown.png',
    descZh: '完全敞開心扉的熱戀戀人狀態，毫不掩飾對你的愛意與思念，隨時給予深情告白。',
    descJa: '素直な愛をまっすぐに伝える恋人モード。二人きりの甘い空気であなたを包み込みます。',
    quoteJa: '{user}とこうして二人きりでいると、胸の奥が熱くなるの……今夜は、このまま朝まで離さないでね。',
    quoteZh: '像這樣跟{user}兩人獨處，心底就熱熱的……今晚，就這樣直到天亮都別放開我喔。'
  },
  {
    id: 'lullaby',
    icon: '🛌',
    titleZh: '溫柔膝枕與哄睡伴眠',
    titleJa: '優しい膝枕・添い寝セラピー',
    tagZh: '🛌 膝枕哄睡',
    tagJa: '🛌 添い寝',
    costumeId: 'night',
    sceneImage: 'assets/costumes/variant_night_blue.png',
    descZh: '睡前專屬的溫柔膝枕與輕聲細語，替你卸下一整天的緊繃，陪你進入甜美夢鄉。',
    descJa: '眠りにつく前の膝枕と優しい囁きで、一日の疲れを溶かして心地よい眠りへと導きます。',
    quoteJa: 'ほら、{user}……私の膝まくら、貸してあげる。目を閉じて……私がずっと優しい夢を見守ってるからね。',
    quoteZh: '來，{user}……我的膝枕借給你躺喔。把眼睛閉上吧……我會一直溫柔守護著你的好夢。'
  }
];

// 男友心情急救站 (Boyfriend Mood Check-ins)
const MOOD_CHECKIN_POOL = {
  tired: {
    id: 'tired',
    labelZh: '😫 工作好累',
    labelJa: '😫 仕事で疲れた',
    sceneImage: 'assets/costumes/variant_work_night.jpg',
    costumeId: 'work_ol',
    affectionBonus: 6
  },
  stressed: {
    id: 'stressed',
    labelZh: '😔 壓力大求安慰',
    labelJa: '😔 落ち込んでる・慰めて',
    sceneImage: 'assets/costumes/variant_home_curtain.png',
    costumeId: 'home',
    affectionBonus: 6
  },
  spoiled: {
    id: 'spoiled',
    labelZh: '🥰 想聽妳撒嬌',
    labelJa: '🥰 まどかに甘えたい',
    sceneImage: 'assets/pov_photos/pov_20_boyfriend_shirt.png',
    costumeId: 'boyfriend_shirt',
    affectionBonus: 7
  },
  hug: {
    id: 'hug',
    labelZh: '🤗 想要抱抱充電',
    labelJa: '🤗 ぎゅっとハグして充電',
    sceneImage: 'assets/pov_photos/pov_13_morning_wakeup.jpg',
    costumeId: 'home',
    affectionBonus: 8
  },
  celebrate: {
    id: 'celebrate',
    labelZh: '🎉 今天有好消息',
    labelJa: '🎉 嬉しい報告がある！',
    sceneImage: 'assets/pov_photos/pov_18_golden_gown.png',
    costumeId: 'evening_gown',
    affectionBonus: 10
  }
};

function createDefaultAssistantDB() {
  return {
    coupleMode: 'healing',
    alarms: [
      {
        id: 'alarm_morning_default',
        time: '07:30',
        label: '☀️ まどか早安晨間喚醒',
        mode: 'sweet',
        enabled: true,
        sceneImage: 'assets/pov_photos/pov_13_morning_wakeup.jpg',
        snoozeUntil: null,
        lastTriggeredDate: ''
      },
      {
        id: 'alarm_work_stretch',
        time: '08:30',
        label: '🍱 出門前愛心便當叮嚀',
        mode: 'bento_morning',
        enabled: false,
        sceneImage: 'assets/pov_photos/pov_12_morning_kitchen.png',
        snoozeUntil: null,
        lastTriggeredDate: ''
      }
    ],
    todos: [
      {
        id: 'todo_sample_1',
        title: '喝杯熱咖啡或溫水，精神百倍開啟一天 ☕',
        category: 'home',
        time: '09:00',
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'todo_sample_2',
        title: '下午工作空檔起來伸展 5 分鐘，看遠方放鬆眼睛 💼',
        category: 'work',
        time: '15:30',
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'todo_sample_3',
        title: '聽一首まどか的薩克斯風配樂，享受屬於兩人的夜晚 🎷',
        category: 'music',
        time: '21:30',
        completed: false,
        createdAt: new Date().toISOString()
      }
    ],
    partnerMoodLog: [],
    updatedAt: new Date().toISOString()
  };
}

function loadAssistantDB() {
  try {
    if (fs.existsSync(ASSISTANT_DB_PATH)) {
      const raw = fs.readFileSync(ASSISTANT_DB_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      const def = createDefaultAssistantDB();
      const modeId = parsed.coupleMode || def.coupleMode || 'healing';
      const currentModeInfo = COUPLE_CARE_MODES.find(m => m.id === modeId) || COUPLE_CARE_MODES[0];
      return {
        ...def,
        ...parsed,
        alarms: Array.isArray(parsed.alarms) ? parsed.alarms : def.alarms,
        todos: (Array.isArray(parsed.todos) ? parsed.todos : def.todos).map(t => ({
          ...t,
          reminderTime: t.reminderTime || t.time || ''
        })),
        coupleModes: COUPLE_CARE_MODES,
        coupleModeList: COUPLE_CARE_MODES,
        currentModeInfo,
        moodButtons: Object.values(MOOD_CHECKIN_POOL),
        sceneGallery: ASSISTANT_SCENE_GALLERY
      };
    }
  } catch (err) {
    console.warn('[AssistantService] 讀取助理資料庫失敗，使用預設值:', err.message);
  }
  const initial = createDefaultAssistantDB();
  saveAssistantDB(initial);
  return {
    ...initial,
    todos: initial.todos.map(t => ({ ...t, reminderTime: t.reminderTime || t.time || '' })),
    coupleModes: COUPLE_CARE_MODES,
    coupleModeList: COUPLE_CARE_MODES,
    currentModeInfo: COUPLE_CARE_MODES[0],
    moodButtons: Object.values(MOOD_CHECKIN_POOL),
    sceneGallery: ASSISTANT_SCENE_GALLERY
  };
}

function saveAssistantDB(data) {
  try {
    const toSave = {
      coupleMode: data.coupleMode || 'healing',
      alarms: data.alarms || [],
      todos: data.todos || [],
      partnerMoodLog: (data.partnerMoodLog || []).slice(0, 30),
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(ASSISTANT_DB_PATH, JSON.stringify(toSave, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('[AssistantService] 儲存助理資料庫失敗:', err.message);
    return false;
  }
}

// 自動推斷待辦事項分類
function inferTodoCategory(title = '') {
  const t = title.toLowerCase();
  if (/開會|會議|報告|專案|客戶|上班|工作|簡報|信件|mail|程式碼|打卡|資料|面試|会議|仕事|資料/.test(t)) return 'work';
  if (/約會|餐廳|電影|禮物|紀念日|散步|看海|逛街|旅行|デート|映画|買い物/.test(t)) return 'date';
  if (/吉他|薩克斯|音樂|練琴|聽歌|唱片|サックス|ギター|音楽/.test(t)) return 'music';
  if (/睡覺|吃藥|維他命|運動|跑步|洗澡|休息|晚安|睡眠|薬|運動|寝る/.test(t)) return 'night';
  return 'home';
}

// 新增待辦事項
function addTodoItem({ title, time = '', reminderTime = '', category = '' }, userName = 'リンシ') {
  const db = loadAssistantDB();
  const cleanTitle = String(title || '').trim();
  if (!cleanTitle) return { success: false, error: '待辦事項內容不可為空' };

  const cat = category || inferTodoCategory(cleanTitle);
  const catMeta = ASSISTANT_SCENE_GALLERY.todoCategory[cat] || ASSISTANT_SCENE_GALLERY.todoCategory.home;
  const effTime = reminderTime || time || '';

  const newItem = {
    id: `todo_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: cleanTitle,
    category: cat,
    time: effTime,
    reminderTime: effTime,
    sceneImage: catMeta.image,
    completed: false,
    createdAt: new Date().toISOString()
  };

  db.todos.unshift(newItem);
  saveAssistantDB(db);

  const timeNoteJa = effTime ? `${effTime}になったらちゃんと声をかけるわね！` : '終わったら私に教えてね！';
  const timeNoteZh = effTime ? `到了 ${effTime} 我會準時提醒你的！` : '完成後記得跟我說一聲喔！';

  return {
    success: true,
    todo: newItem,
    state: loadAssistantDB(),
    replyJa: `了解よ、${userName}！「${cleanTitle}」をスケジュール帳にメモしておいたわ📝 ${timeNoteJa}`,
    replyZh: `收到囉，${userName}！我已經幫你把「${cleanTitle}」記在行程手冊裡了📝 ${timeNoteZh}`,
    ttsText: `了解よ、${userName}！「${cleanTitle}」をメモしておいたわ。${timeNoteJa}`
  };
}

// 切換待辦事項完成狀態（完成時給予溫柔誇獎並增加好感度）
function toggleTodoItem(todoId, userName = 'リンシ') {
  const db = loadAssistantDB();
  const item = db.todos.find(t => t.id === todoId);
  if (!item) return { success: false, error: '找不到該待辦事項' };

  item.completed = !item.completed;
  item.completedAt = item.completed ? new Date().toISOString() : null;
  saveAssistantDB(db);

  let memoryState = null;
  let praise = null;
  let praiseReply = '';
  let voice = null;
  if (item.completed) {
    memoryState = recordActionInteraction('todo_complete', { taskTitle: item.title });
    voice = getCoupleCareVoice('celebrate', userName);
    const replyJa = `さすが${userName}！「${item.title}」を完了したわね✨ よく頑張ったご褒美に、後でぎゅっとしてあげるわ💖`;
    const replyZh = `不愧是${userName}！「${item.title}」已經順利完成囉✨ 為了獎勵這麼努力的你，待會給你一個大大的擁抱💖`;
    praiseReply = `${replyJa}\n（${replyZh}）`;
    praise = {
      replyJa,
      replyZh,
      ttsText: `さすが${userName}！よく頑張ったわね。ご褒美にぎゅっとしてあげるわ！`,
      voice,
      sceneImage: (ASSISTANT_SCENE_GALLERY.todoCategory[item.category] || ASSISTANT_SCENE_GALLERY.todoCategory.work).image
    };
  }

  return {
    success: true,
    todo: item,
    completed: item.completed,
    justCompleted: item.completed,
    praise,
    praiseReply,
    voice,
    memoryState,
    memory: memoryState,
    state: loadAssistantDB()
  };
}

function deleteTodoItem(todoId) {
  const db = loadAssistantDB();
  db.todos = db.todos.filter(t => t.id !== todoId);
  saveAssistantDB(db);
  return { success: true, state: loadAssistantDB() };
}

// 新增或更新鬧鐘
function upsertAlarm({ id, time, label, mode = 'sweet', enabled = true }, userName = 'リンシ') {
  const db = loadAssistantDB();
  const cleanTime = String(time || '07:30').trim();
  const cleanMode = mode || 'sweet';
  const sceneImage = ASSISTANT_SCENE_GALLERY.wakeup[cleanMode] || ASSISTANT_SCENE_GALLERY.wakeup.sweet;

  let target = id ? db.alarms.find(a => a.id === id) : db.alarms.find(a => a.time === cleanTime);
  if (target) {
    target.time = cleanTime;
    if (label !== undefined) target.label = label;
    target.mode = cleanMode;
    target.enabled = Boolean(enabled);
    target.sceneImage = sceneImage;
    target.snoozeUntil = null;
  } else {
    target = {
      id: `alarm_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      time: cleanTime,
      label: label || `⏰ まどか晨間喚醒 (${cleanTime})`,
      mode: cleanMode,
      enabled: true,
      sceneImage,
      snoozeUntil: null,
      lastTriggeredDate: ''
    };
    db.alarms.push(target);
    db.alarms.sort((a, b) => a.time.localeCompare(b.time));
  }

  saveAssistantDB(db);
  return {
    success: true,
    alarm: target,
    state: loadAssistantDB(),
    replyJa: `${cleanTime}の目覚ましアラームをセットしたわよ、${userName}⏰ 明日の朝は私が責任もって起こしてあげるから、安心して休んでね💖`,
    replyZh: `已經幫你設好 ${cleanTime} 的喚醒鬧鐘囉，${userName}⏰ 明天早上我會負責叫你起床的，安心休息吧💖`,
    ttsText: `${cleanTime}の目覚ましアラームをセットしたわよ、${userName}。明日の朝は私が起こしてあげるからね。`
  };
}

function toggleAlarm(alarmId, enabled) {
  const db = loadAssistantDB();
  const target = db.alarms.find(a => a.id === alarmId);
  if (!target) return { success: false, error: '找不到鬧鐘' };
  target.enabled = enabled !== undefined ? Boolean(enabled) : !target.enabled;
  if (!target.enabled) target.snoozeUntil = null;
  saveAssistantDB(db);
  return { success: true, alarm: target, state: loadAssistantDB() };
}

function deleteAlarm(alarmId) {
  const db = loadAssistantDB();
  db.alarms = db.alarms.filter(a => a.id !== alarmId);
  saveAssistantDB(db);
  return { success: true, state: loadAssistantDB() };
}

// 觸發鬧鐘喚醒資料包（含鶴ひろみ原聲與新上傳晨間喚醒 POV 插圖）
function buildWakeupTriggerPayload(alarmIdOrMode = 'sweet', userName = 'リンシ') {
  const db = loadAssistantDB();
  const alarm = db.alarms.find(a => a.id === alarmIdOrMode);
  const mode = alarm ? alarm.mode : (alarmIdOrMode || 'sweet');
  const voice = getWakeupVoice(mode, userName);
  const sceneImage = (alarm && alarm.sceneImage) || ASSISTANT_SCENE_GALLERY.wakeup[mode] || ASSISTANT_SCENE_GALLERY.wakeup.sweet;
  const memoryState = recordActionInteraction('wakeup_alarm', { mode });

  return {
    alarmId: alarm ? alarm.id : 'manual_test',
    alarm: alarm || { id: 'manual_test', time: new Date().toTimeString().slice(0, 5), label: '☀️ まどか專屬晨間喚醒', mode },
    time: alarm ? alarm.time : new Date().toTimeString().slice(0, 5),
    label: alarm ? alarm.label : '☀️ まどか專屬晨間喚醒',
    mode,
    costumeId: 'home',
    sceneImage,
    voice,
    reply: voice.fullText,
    replyJa: voice.japanese,
    replyZh: voice.chinese,
    fullText: voice.fullText,
    memoryState,
    memory: memoryState
  };
}

// 切換情侶互動狀態（心理、療癒、關心、撒嬌模式）
function setCoupleCareMode(modeId, userName = 'リンシ') {
  const db = loadAssistantDB();
  const found = COUPLE_CARE_MODES.find(m => m.id === modeId) || COUPLE_CARE_MODES[0];
  db.coupleMode = found.id;
  saveAssistantDB(db);

  const voice = getCoupleCareVoice(found.id, userName);
  const memoryState = recordActionInteraction('couple_care', { mode: found.id });
  const fullText = `${found.quoteJa.replace(/\{user\}/g, userName)}\n（${found.quoteZh.replace(/\{user\}/g, userName)}）`;

  return {
    success: true,
    mode: found,
    voice,
    sceneImage: found.sceneImage,
    costumeId: found.costumeId,
    reply: fullText,
    replyJa: found.quoteJa.replace(/\{user\}/g, userName),
    replyZh: found.quoteZh.replace(/\{user\}/g, userName),
    fullText,
    memoryState,
    memory: memoryState,
    state: loadAssistantDB()
  };
}

// 男友心情急救站觸發（疲倦、壓力、想撒嬌、討抱抱、好消息）
function triggerPartnerMoodCare(moodId, userName = 'リンシ') {
  const db = loadAssistantDB();
  const mappedKey = moodId === 'clingy_ask' ? 'spoiled' : moodId;
  const moodMeta = MOOD_CHECKIN_POOL[mappedKey] || MOOD_CHECKIN_POOL.tired;
  const voice = getCoupleCareVoice(moodMeta.id, userName);

  db.partnerMoodLog = db.partnerMoodLog || [];
  db.partnerMoodLog.unshift({
    moodId: moodMeta.id,
    label: moodMeta.labelZh,
    timestamp: new Date().toISOString()
  });
  saveAssistantDB(db);

  const memoryState = recordActionInteraction('mood_care', { mood: moodMeta.id });

  return {
    success: true,
    mood: moodMeta,
    label: moodMeta.labelZh,
    voice,
    sceneImage: moodMeta.sceneImage,
    costumeId: moodMeta.costumeId,
    reply: voice.fullText,
    replyJa: voice.japanese,
    replyZh: voice.chinese,
    fullText: voice.fullText,
    memoryState,
    memory: memoryState,
    state: loadAssistantDB()
  };
}

// 中文數字轉阿拉伯數字輔助
function parseChineseNumber(str = '') {
  const map = { '零': 0, '〇': 0, '一': 1, '二': 2, '兩': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10, '十一': 11, '十二': 12 };
  if (/^\d+$/.test(str)) return parseInt(str, 10);
  if (map[str] !== undefined) return map[str];
  if (str.startsWith('十') && str.length === 2) return 10 + (map[str[1]] || 0);
  if (str.endsWith('十') && str.length === 2) return (map[str[0]] || 1) * 10;
  if (str.includes('十') && str.length === 3) return (map[str[0]] || 1) * 10 + (map[str[2]] || 0);
  return null;
}

// 從自然語言提取時間 "HH:MM"
function extractTimeFromText(text = '') {
  const s = text.trim();
  const isPM = /下午|晚上|傍晚|午後|夜|pm/i.test(s);
  const isNight12 = /凌晨|半夜/.test(s);

  // 1. 匹配 07:30 或 7:30
  const colonMatch = s.match(/([01]?\d|2[0-3])\s*[:：]\s*([0-5]\d)/);
  if (colonMatch) {
    let h = parseInt(colonMatch[1], 10);
    const m = parseInt(colonMatch[2], 10);
    if (isPM && h < 12) h += 12;
    if (isNight12 && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  // 2. 匹配「7點半」「下午3點15分」「八點」「7時30分」「7時半」
  const zhJaMatch = s.match(/([0-9一二兩三四五六七八九十]{1,3})\s*(?:點|点|時|じ)(?:\s*(半|([0-9一二三四五六七八九十]{1,3})\s*分?))?/);
  if (zhJaMatch) {
    let h = parseChineseNumber(zhJaMatch[1]);
    if (h !== null && h >= 0 && h <= 23) {
      let m = 0;
      if (zhJaMatch[2] === '半') {
        m = 30;
      } else if (zhJaMatch[3]) {
        const parsedM = parseChineseNumber(zhJaMatch[3]);
        if (parsedM !== null && parsedM >= 0 && parsedM < 60) m = parsedM;
      }
      if (isPM && h < 12) h += 12;
      if (isNight12 && h === 12) h = 0;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
  }

  return '';
}

// 自然語言對話解析器：判斷是否為「設鬧鐘」「新增待辦提醒」或「男友心理療癒訴求」
function parseNaturalAssistantCommand(userMessage = '', userName = 'リンシ') {
  const msg = String(userMessage || '').trim();
  if (!msg) return { handled: false };

  const lower = msg.toLowerCase();

  // A. 偵測設定起床鬧鐘意圖（例：「提醒我明天早上7點起床」「設鬧鐘 07:30」「7時半に起こして」）
  const isAlarmIntent = (
    /鬧鐘|目覚まし|アラーム|叫我起床|叫醒我|起こして/.test(msg) ||
    ((/起床|醒來|早起/.test(msg)) && (/提醒|設|定|叫我|[0-9一二兩三四五六七八九十]+\s*(?:點|点|時|:|：)/.test(msg)))
  );

  if (isAlarmIntent) {
    const time = extractTimeFromText(msg) || '07:30';
    let mode = 'sweet';
    if (/強烈|傲嬌|兇|大聲|厳しく|ツンデレ/.test(msg)) mode = 'tsundere';
    else if (/便當|活力|元氣|お弁当/.test(msg)) mode = 'bento_morning';

    const res = upsertAlarm({
      time,
      label: `☀️ まどか喚醒鬧鐘 (${time})`,
      mode,
      enabled: true
    }, userName);

    return {
      handled: true,
      type: 'alarm',
      alarm: res.alarm,
      assistantState: res.state,
      reply: `${res.replyJa}\n（${res.replyZh}）`,
      replyJa: res.replyJa,
      replyZh: res.replyZh,
      ttsText: res.ttsText,
      sceneImage: res.alarm.sceneImage
    };
  }

  // B. 偵測新增待辦事項 / 行程提醒意圖（例：「提醒我下午3點開會」「待辦：買咖啡」「幫我記一下晚上8點運動」）
  const isTodoIntent = /^(?:待辦|代辦|提醒我|請提醒我|幫我記|記一下|備忘|todo|リマインド|メモ)[:：\s]*/i.test(msg) ||
    (/提醒我|幫我記住|加到待辦|加入代辦|予定を入れて/.test(msg));

  if (isTodoIntent) {
    const time = extractTimeFromText(msg);
    let cleanTitle = msg
      .replace(/^(?:まどか[、,，\s]*)?(?:請|幫我)?(?:待辦|代辦|提醒我|記一下|備忘|加到待辦|加入代辦|todo|リマインド|メモ)[:：\s]*/i, '')
      .replace(/(?:明天|今天|今晚|早上|上午|中午|下午|傍晚|晚上|凌晨|あした|今日)?\s*[0-9一二兩三四五六七八九十]{1,3}\s*(?:[:：][0-5]\d|(?:點|点|時)(?:半|[0-9一二三四五六七八九十]{1,3}\s*分?)?)\s*(?:要|去|記得)?/g, '')
      .trim();

    if (!cleanTitle) cleanTitle = msg;

    const res = addTodoItem({ title: cleanTitle, time }, userName);
    if (res.success) {
      return {
        handled: true,
        type: 'todo',
        todo: res.todo,
        assistantState: res.state,
        reply: `${res.replyJa}\n（${res.replyZh}）`,
        replyJa: res.replyJa,
        replyZh: res.replyZh,
        ttsText: res.ttsText,
        sceneImage: res.todo.sceneImage
      };
    }
  }

  // C. 偵測男友心理狀態 / 討拍 / 撒嬌 / 壓力傾訴
  if (/好累|累死|疲憊|加班|筋疲力盡|疲れた|くたくた/.test(lower)) {
    const care = triggerPartnerMoodCare('tired', userName);
    return {
      handled: true,
      type: 'couple_care',
      care,
      assistantState: care.state,
      reply: `${care.replyJa}\n（${care.replyZh}）[COSTUME:${care.costumeId}]`,
      replyJa: care.replyJa,
      replyZh: care.replyZh,
      ttsText: care.replyJa,
      voice: care.voice,
      sceneImage: care.sceneImage
    };
  }

  if (/心情不好|難過|壓力好大|壓力大|沮喪|焦慮|心煩|つらい|落ち込|寂しい/.test(lower)) {
    const care = triggerPartnerMoodCare('stressed', userName);
    return {
      handled: true,
      type: 'couple_care',
      care,
      assistantState: care.state,
      reply: `${care.replyJa}\n（${care.replyZh}）[COSTUME:${care.costumeId}]`,
      replyJa: care.replyJa,
      replyZh: care.replyZh,
      ttsText: care.replyJa,
      voice: care.voice,
      sceneImage: care.sceneImage
    };
  }

  if (/對我撒嬌|聽你撒嬌|聽妳撒嬌|跟我撒嬌|撒嬌一下|甘えて/.test(lower)) {
    const care = setCoupleCareMode('clingy', userName);
    return {
      handled: true,
      type: 'couple_care',
      care,
      assistantState: care.state,
      reply: `${care.replyJa}\n（${care.replyZh}）[COSTUME:${care.costumeId}]`,
      replyJa: care.replyJa,
      replyZh: care.replyZh,
      ttsText: care.replyJa,
      voice: care.voice,
      sceneImage: care.sceneImage
    };
  }

  if (/抱抱我|想要抱抱|討抱抱|抱緊我|ハグして|ぎゅっとして/.test(lower)) {
    const care = triggerPartnerMoodCare('hug', userName);
    return {
      handled: true,
      type: 'couple_care',
      care,
      assistantState: care.state,
      reply: `${care.replyJa}\n（${care.replyZh}）[COSTUME:${care.costumeId}]`,
      replyJa: care.replyJa,
      replyZh: care.replyZh,
      ttsText: care.replyJa,
      voice: care.voice,
      sceneImage: care.sceneImage
    };
  }

  return { handled: false };
}

module.exports = {
  ASSISTANT_SCENE_GALLERY,
  COUPLE_CARE_MODES,
  MOOD_CHECKIN_POOL,
  loadAssistantDB,
  saveAssistantDB,
  addTodoItem,
  toggleTodoItem,
  deleteTodoItem,
  upsertAlarm,
  toggleAlarm,
  deleteAlarm,
  buildWakeupTriggerPayload,
  setCoupleCareMode,
  triggerPartnerMoodCare,
  parseNaturalAssistantCommand
};
