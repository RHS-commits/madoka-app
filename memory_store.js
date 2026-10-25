// memory_store.js - 鮎川まどか 永久對話記憶與好感度本地資料庫引擎
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'madoka_memory_db.json');

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
    descZh: '每天在 Abcb 與桌面相伴的默契夥伴，眼神裡藏不住對你的溫柔。',
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
    descZh: '心意相通的戀人。無論換上什麼服裝或拍下哪張自拍，眼裡只有你一人。',
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
    promptTone: '運命の伴侶。深い包容力と甘い愛情に満ち、過去の思い出も大切に語り合う。'
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

function getTodayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getNowTimestampStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

const DEFAULT_MEMORY_DB = {
  affectionScore: 68, // 初始好感度 (Lv.2 特別的夥伴)
  totalChats: 0,
  totalInteractions: 0,
  firstMetDate: '2026-09-22',
  lastActiveDate: getTodayStr(),
  streakDays: 1,
  costumeUsage: { uniform: 1 },
  unlockedPhotoIds: [
    'pov_01_tie',
    'pov_02_bookstore',
    'pov_03_popsicle_1',
    'pov_04_popsicle_2',
    'pov_05_popsicle_3',
    'pov_06_hold_hands',
    'pov_07_turn_back_1',
    'pov_08_turn_back_2',
    'pov_09_turn_back_3',
    'pov_10_fireworks_yukata',
    'pov_11_cafe_latte',
    'pov_12_morning_kitchen'
  ],
  customPhotos: [],
  memoryFacts: [
    {
      id: 'mem_default_1',
      category: 'bond',
      content: '在桌面上與まどか朝夕相伴，喜歡聽她吹奏薩克斯風與更換不同日常穿搭',
      createdAt: '2026-09-22 20:00'
    }
  ],
  conversationLog: []
};

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

function loadMemoryDB() {
  try {
    let db = { ...DEFAULT_MEMORY_DB };
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      db = {
        ...DEFAULT_MEMORY_DB,
        ...parsed,
        unlockedPhotoIds: Array.from(new Set([...DEFAULT_MEMORY_DB.unlockedPhotoIds, ...(parsed.unlockedPhotoIds || [])])),
        memoryFacts: Array.isArray(parsed.memoryFacts) ? parsed.memoryFacts : DEFAULT_MEMORY_DB.memoryFacts,
        conversationLog: Array.isArray(parsed.conversationLog) ? parsed.conversationLog : [],
        customPhotos: Array.isArray(parsed.customPhotos) ? parsed.customPhotos : []
      };
    }

    // 更新連續陪伴天數與相伴總天數
    const today = getTodayStr();
    if (db.lastActiveDate !== today) {
      const lastDate = new Date(db.lastActiveDate);
      const curDate = new Date(today);
      const diffDays = Math.round((curDate - lastDate) / 86400000);
      if (diffDays === 1) {
        db.streakDays = (db.streakDays || 1) + 1;
        db.affectionScore = (db.affectionScore || 68) + 3; // 每日登入陪伴獎勵
      } else if (diffDays > 1) {
        db.streakDays = 1;
      }
      db.lastActiveDate = today;
      saveMemoryDB(db);
    }

    const firstMet = new Date(db.firstMetDate || today);
    const daysTogether = Math.max(1, Math.ceil((new Date(today) - firstMet) / 86400000) + 1);
    const levelInfo = getAffectionLevelInfo(db.affectionScore);

    return {
      ...db,
      daysTogether,
      levelInfo
    };
  } catch (err) {
    console.error('[MemoryStore] 讀取記憶資料庫失敗:', err);
    return {
      ...DEFAULT_MEMORY_DB,
      daysTogether: 1,
      levelInfo: getAffectionLevelInfo(DEFAULT_MEMORY_DB.affectionScore)
    };
  }
}

function saveMemoryDB(dbData) {
  try {
    const toSave = { ...dbData };
    delete toSave.daysTogether;
    delete toSave.levelInfo;
    fs.writeFileSync(DB_PATH, JSON.stringify(toSave, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('[MemoryStore] 儲存記憶資料庫失敗:', err);
    return false;
  }
}

// 從使用者的自然語言對話中自動萃取值得永久記住的個人事實/偏好
function extractFactsFromUserMessage(userMessage) {
  if (!userMessage || typeof userMessage !== 'string') return [];
  const text = userMessage.trim();
  if (text.length < 3 || text.length > 150) return [];

  const extracted = [];
  const patterns = [
    { regex: /我(?:最)?喜歡(.{2,35})/, category: 'preference', prefix: '喜歡：' },
    { regex: /我(?:最)?愛吃(.{2,30})/, category: 'food', prefix: '愛吃的食物：' },
    { regex: /我(?:最)?討厭(.{2,30})/, category: 'dislike', prefix: '不喜歡/討厭：' },
    { regex: /我的生日是(.{2,25})/, category: 'birthday', prefix: '生日：' },
    { regex: /我(?:現在|最近|今天)(?:在|正在)(.{2,35})/, category: 'life', prefix: '近況紀錄：' },
    { regex: /記住(.{3,45})/, category: 'memo', prefix: '特別叮嚀まどか記住：' },
    { regex: /別忘了(.{3,45})/, category: 'memo', prefix: '約定與提醒：' },
    { regex: /私の好きな(.{2,30})/, category: 'preference', prefix: '好きなもの：' },
    { regex: /覚えて(?:おいて|て)?[：:、,\s]*(.{3,45})/, category: 'memo', prefix: '覚えておくこと：' }
  ];

  for (const p of patterns) {
    const match = text.match(p.regex);
    if (match && match[1]) {
      const cleanVal = match[1].replace(/[。！!？?～~\n]/g, '').trim();
      if (cleanVal.length >= 2) {
        extracted.push({
          category: p.category,
          content: `${p.prefix}${cleanVal}`
        });
      }
    }
  }
  return extracted;
}

// 計算單次對話的好感度增減
function evaluateChatAffectionDelta(userMessage = '') {
  const msg = userMessage.toLowerCase();
  let delta = 2; // 基礎對話陪伴 +2

  const sweetKeywords = [
    '喜歡', '愛你', '最愛', '可愛', '漂亮', '美', '溫柔', '謝謝', '辛苦了', '想你',
    '約會', '牽手', '抱抱', '親', '便當', '咖哩', '好聽', '治癒', '陪我', '晚安', '早安',
    '好き', '大好き', '愛して', '可愛い', 'かわいい', '綺麗', 'きれい', 'ありがとう',
    '優しい', 'デート', '一緒', 'おやすみ', 'おはよう', '素敵'
  ];

  for (const kw of sweetKeywords) {
    if (msg.includes(kw)) {
      delta += 2;
    }
  }
  return Math.min(delta, 10); // 單次對話最多 +10
}

function recordChatInteraction({ userMessage, assistantReply, costume = 'uniform', photoId = null, aiMemoryNote = null }) {
  const db = loadMemoryDB();
  const nowStr = getNowTimestampStr();

  const affectionDelta = evaluateChatAffectionDelta(userMessage);
  db.affectionScore = Math.max(0, (db.affectionScore || 68) + affectionDelta);
  db.totalChats = (db.totalChats || 0) + 1;
  db.totalInteractions = (db.totalInteractions || 0) + 1;

  if (costume) {
    db.costumeUsage = db.costumeUsage || {};
    db.costumeUsage[costume] = (db.costumeUsage[costume] || 0) + 1;
  }

  if (photoId && !db.unlockedPhotoIds.includes(photoId)) {
    db.unlockedPhotoIds.push(photoId);
  }

  // 自動萃取記憶或 AI 標記記憶
  const candidateFacts = extractFactsFromUserMessage(userMessage);
  if (aiMemoryNote && typeof aiMemoryNote === 'string' && aiMemoryNote.trim().length > 2) {
    candidateFacts.push({ category: 'ai_note', content: aiMemoryNote.trim() });
  }

  const newFactsAdded = [];
  for (const cf of candidateFacts) {
    const exists = db.memoryFacts.some(f => f.content === cf.content || f.content.includes(cf.content));
    if (!exists) {
      const factObj = {
        id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        category: cf.category || 'memo',
        content: cf.content,
        createdAt: nowStr
      };
      db.memoryFacts.unshift(factObj);
      newFactsAdded.push(factObj);
    }
  }
  if (db.memoryFacts.length > 60) {
    db.memoryFacts = db.memoryFacts.slice(0, 60);
  }

  // 寫入永久對話日誌
  db.conversationLog.push({
    id: `msg_${Date.now()}_u`,
    role: 'user',
    content: userMessage,
    costume,
    timestamp: nowStr
  });
  db.conversationLog.push({
    id: `msg_${Date.now()}_a`,
    role: 'assistant',
    content: assistantReply,
    costume,
    photoId: photoId || null,
    affectionDelta,
    timestamp: nowStr
  });

  // 保留最近 500 筆對話紀錄於本地資料庫
  if (db.conversationLog.length > 500) {
    db.conversationLog = db.conversationLog.slice(-500);
  }

  saveMemoryDB(db);
  const fullState = loadMemoryDB();

  return {
    ...fullState,
    affectionDelta,
    newFactsAdded,
    memory: fullState
  };
}

function recordActionInteraction(actionId, extra = {}) {
  const db = loadMemoryDB();
  const actionWeights = {
    bento: 4,
    curry: 4,
    confess: 6,
    sleep: 5,
    whatsup: 3,
    comfort: 4,
    sax: 4,
    poke: 2,
    selfie: 5,
    costume: 2,
    todo_complete: 8,
    wakeup_alarm: 10,
    couple_care: 5,
    mood_care: 7
  };
  const affectionDelta = actionWeights[actionId] || 2;
  db.affectionScore = Math.max(0, (db.affectionScore || 68) + affectionDelta);
  db.totalInteractions = (db.totalInteractions || 0) + 1;

  if (extra.costume) {
    db.costumeUsage = db.costumeUsage || {};
    db.costumeUsage[extra.costume] = (db.costumeUsage[extra.costume] || 0) + 1;
  }
  if (extra.photoId && !db.unlockedPhotoIds.includes(extra.photoId)) {
    db.unlockedPhotoIds.push(extra.photoId);
  }

  saveMemoryDB(db);
  const fullState = loadMemoryDB();
  return {
    ...fullState,
    affectionDelta,
    memory: fullState
  };
}

function addMemoryFact(content, category = 'custom') {
  if (!content || !content.trim()) return { success: false, error: 'Empty content' };
  const db = loadMemoryDB();
  const factObj = {
    id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    category,
    content: content.trim(),
    createdAt: getNowTimestampStr()
  };
  db.memoryFacts.unshift(factObj);
  saveMemoryDB(db);
  const fullState = loadMemoryDB();
  return { success: true, fact: factObj, memoryFacts: db.memoryFacts, memory: fullState };
}

function deleteMemoryFact(factId) {
  const db = loadMemoryDB();
  db.memoryFacts = db.memoryFacts.filter(f => f.id !== factId);
  saveMemoryDB(db);
  const fullState = loadMemoryDB();
  return { success: true, memoryFacts: db.memoryFacts, memory: fullState };
}

function clearConversationHistory() {
  const db = loadMemoryDB();
  db.conversationLog = [];
  saveMemoryDB(db);
  const fullState = loadMemoryDB();
  return { success: true, memory: fullState };
}

function buildMemoryContextForPrompt(userName = 'リンシ') {
  const db = loadMemoryDB();
  const lv = db.levelInfo;
  const factsText = (db.memoryFacts || [])
    .slice(0, 12)
    .map((f, i) => `${i + 1}. ${f.content} (${f.createdAt})`)
    .join('\n');

  const recentLogs = (db.conversationLog || []).slice(-8);

  return {
    db,
    recentLogs,
    systemBlock: `
【二人の関係性・好感度ステータス（永続記憶データベース）】
- 現在の好感度スコア：${db.affectionScore} pt（ステージ：Lv.${lv.level}「${lv.titleJa} / ${lv.titleZh}」）
- 一緒に過ごした日数：${db.daysTogether}日目（連続ログイン：${db.streakDays}日、累計会話数：${db.totalChats}回）
- 態度・距離感の指針：${lv.promptTone}

【あなたが永久に記憶している「${userName}」に関する大切な記憶・好み・約束】
${factsText || '（まだ特別なメモはありませんが、これからの会話で少しずつ覚えていきます）'}

※重要な指示：
1. 会話の中で${userName}が自分の好み、誕生日、仕事や日常の出来事、約束などを話した時は、それを踏まえて親身に返答し、さらに記憶すべき新しい事実があれば応答の末尾に [MEMORY:記憶したい内容] タグを付けてください（例：[MEMORY:${userName}はブラックコーヒーよりカフェラテ派]）。
2. ${userName}が「写真を撮って」「自撮り見せて」「今の姿を見せて」等と頼んだ場合は、応答の末尾に [PHOTO:auto] タグを付けてください。
`.trim()
  };
}

module.exports = {
  AFFECTION_STAGES,
  getAffectionLevelInfo,
  loadMemoryDB,
  getMemoryState: loadMemoryDB,
  saveMemoryDB,
  recordChatInteraction,
  recordActionInteraction,
  addMemoryFact,
  deleteMemoryFact,
  clearConversationHistory,
  buildMemoryContextForPrompt
};

