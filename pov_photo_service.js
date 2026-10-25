// pov_photo_service.js - 情侶 POV 自拍相簿與 PixAI 繪圖指令集整合模組
const fs = require('fs');
const path = require('path');
const { loadMemoryDB, saveMemoryDB } = require('./memory_store');

// 共通人物鎖定 Prompt（出自《鮎川まどか_日常情侶POV_PixAI指令集.docx》）
const CHARACTER_LOCK_PROMPT = 'adult Ayukawa Madoka, 18+, faithful character identity, deep blue-black long hair, soft layered hair, natural bangs, face-framing strands, vivid green eyes, gentle refined facial features, natural adult proportions, consistent face and hairstyle, realistic character rendering';

// 共通 Negative Prompt（出自《鮎川まどか_日常情侶POV_PixAI指令集.docx》）
const COMMON_NEGATIVE_PROMPT = 'low quality, worst quality, blurry, bad anatomy, malformed hands, extra fingers, missing fingers, extra arms, extra legs, duplicated person, distorted face, asymmetrical eyes, inconsistent hairstyle, wrong hair color, wrong eye color, childlike body, oversexualized pose, explicit content, nudity, lingerie, plastic skin, doll face, AI beauty filter, CGI, 3D render, oversharpening, HDR artifacts, fisheye distortion, text, watermark, logo, signature';

// 12 張情侶 POV 實拍寫真庫（對應 assets/pov_photos/ 內的高畫質 PixAI 情侶視角照片）
const POV_PHOTOS = [
  {
    id: 'pov_01_tie',
    sceneCode: 'POV-02',
    titleZh: '走廊近距離・替你整理領帶',
    titleJa: '放課後の廊下・ネクタイ直し',
    image: 'assets/pov_photos/pov_01_tie.png',
    costumeId: 'schoolpov',
    outfitZh: '白襯衫、學生領帶、放學後夕陽走廊',
    outfitJa: '白シャツ、ネクタイ、夕暮れの校舎廊下',
    keywords: ['領帶', '走廊', '學校', '放學', '襯衫', '近距離', 'ネクタイ', '廊下', '学校', '制服'],
    captionJa: 'もう、ネクタイが曲がってるわよ……じっとしてて、{user}。そんなに見つめられると、ちょっと照れちゃうじゃない。',
    captionZh: '真是的，領帶又歪掉囉……別亂動喔，{user}。被你這麼近盯著看，我也會稍微害羞的啦。',
    tts: 'もう、ネクタイが曲がってるわよ。じっとしてて、{user}。そんなに見つめられると、ちょっと照れちゃうじゃない。',
    pixaiPrompt: `${CHARACTER_LOCK_PROMPT}, intimate couple POV, close everyday interaction, she gently straightens the viewer's tie, looking up with a mildly teasing caring expression, subtle blush, relaxed smile, close personal distance, Japanese school corridor, soft afternoon window light, 50mm portrait lens, shallow depth of field, focus on eyes and hands, realistic skin texture, cinematic candid photograph, 9:16`
  },
  {
    id: 'pov_02_bookstore',
    sceneCode: 'POV-05',
    titleZh: '靜謐午後・書店並肩看書',
    titleJa: '静かな午後・本屋で並んで読書',
    image: 'assets/pov_photos/pov_02_bookstore.png',
    costumeId: 'date',
    outfitZh: '米白針織上衣、木質書架與溫暖窗光',
    outfitJa: 'アイボリーのニット、木の書棚と柔らかな窓光',
    keywords: ['書', '書店', '看書', '閱讀', '並肩', '文青', '本', '本屋', '読書'],
    captionJa: 'ねえ{user}、このページ見て！すごく面白いことが書いてあるの。こうして肩を並べて本を読むの、なんだか恋人らしくて好きよ。',
    captionZh: '吶{user}，你看這一頁！上面寫著很有趣的內容喔。像這樣並肩一起看書，總覺得很有戀人的氣氛，我很喜歡呢。',
    tts: 'ねえ{user}、このページ見て！こうして肩を並べて本を読むの、なんだか恋人らしくて好きよ。',
    pixaiPrompt: `${CHARACTER_LOCK_PROMPT}, quiet bookstore date, couple POV, standing shoulder-to-shoulder with the viewer, sharing one open book, shoulder gently touching the viewer, curious gentle smile, warm wooden bookshelves, soft window light, quiet intimate atmosphere, dust particles, 50mm lens, shallow depth of field, realistic paper and fabric texture, candid editorial photography, 9:16`
  },
  {
    id: 'pov_03_popsicle_1',
    sceneCode: 'POV-04A',
    titleZh: '便利店外・夏日蘇打冰棒 (I)',
    titleJa: 'コンビニ前・夏のソーダアイス (I)',
    image: 'assets/pov_photos/pov_03_popsicle_1.png',
    costumeId: 'casual',
    outfitZh: '白短袖上衣、淺藍百褶裙、橘色斜背包、白色高筒帆布鞋',
    outfitJa: '白Tシャツ、水色のスカート、オレンジのショルダーバッグ、白スニーカー',
    keywords: ['冰', '吃冰', '冰棒', '便利店', '超商', '夏天', '蘇打', 'アイス', 'コンビニ', '夏'],
    captionJa: 'ん〜っ、冷たくて美味しい！{user}も一口食べる？……ふふっ、冗談よ、ほら、あーんして？',
    captionZh: '嗯～冰冰涼涼的好好吃！{user}也要咬一口嗎？……呵呵，不逗你了，來，張嘴「啊～」？',
    tts: 'んーっ、冷たくて美味しい！{user}も一口食べる？ふふっ、ほら、あーんして？',
    pixaiPrompt: `${CHARACTER_LOCK_PROMPT}, summer date POV outside a Japanese convenience store, sitting beside the viewer, eating a popsicle, playful nose scrunch, bright natural smile, legs casually swinging, white short-sleeve top, light blue skirt, canvas sneakers, small shoulder bag, warm evening light, convenience store glow, candid snapshot, 35mm film photography, soft bokeh, relaxed romantic atmosphere, 9:16`
  },
  {
    id: 'pov_04_popsicle_2',
    sceneCode: 'POV-04B',
    titleZh: '便利店座席・俏皮咬冰棒 (II)',
    titleJa: 'コンビニのベンチ・悪戯っぽい視線 (II)',
    image: 'assets/pov_photos/pov_04_popsicle_2.png',
    costumeId: 'casual',
    outfitZh: '白色印花T恤、淺藍百褶裙、黑色斜背包',
    outfitJa: 'プリント白Tシャツ、水色のプリーツスカート、黒バッグ',
    keywords: ['座位', '長椅', '便利店', '吃冰', '點心', '休息'],
    captionJa: 'ちょっと歩き疲れちゃったわね。{user}、ここで少し涼んでいきましょ？急にカメラ向けるなんて、もう……ちゃんと可愛く撮れた？',
    captionZh: '稍微走累了呢。{user}，我們在這裡吹個冷氣休息一下吧？突然把鏡頭對準我，真是的……有拍得可愛嗎？',
    tts: 'ちょっと歩き疲れちゃったわね。急にカメラ向けるなんて、もう、ちゃんと可愛く撮れた？',
    pixaiPrompt: `${CHARACTER_LOCK_PROMPT}, summer date POV at a Japanese convenience store bench, sitting beside the viewer, biting a blue soda popsicle, playful bright smile, white graphic tee, light blue pleated skirt, canvas sneakers, candid snapshot, 35mm film photography, 9:16`
  },
  {
    id: 'pov_05_popsicle_3',
    sceneCode: 'POV-04C',
    titleZh: '夕陽超商階梯・雙手捧冰棒 (III)',
    titleJa: '夕暮れのコンビニ階段・甘いひととき (III)',
    image: 'assets/pov_photos/pov_05_popsicle_3.png',
    costumeId: 'casual',
    outfitZh: '白T恤、淺藍短裙、夕陽逆光街景',
    outfitJa: '白Tシャツ、水色のミニスカート、夕暮れの逆光',
    keywords: ['階梯', '黃昏', '傍晚', '冰棒', '超商'],
    captionJa: '夕方の風、気持ちいいわね。{user}と一緒に食べるアイスが、一番美味しい気がするわ。',
    captionZh: '傍晚的微風吹起來真舒服呢。總覺得跟{user}一起吃的冰棒，是全世界最好吃的喔。',
    tts: '夕方の風、気持ちいいわね。{user}と一緒に食べるアイスが、一番美味しい気がするわ。',
    pixaiPrompt: `${CHARACTER_LOCK_PROMPT}, golden hour summer date POV outside a Japanese convenience store steps, holding a blue popsicle with both hands, warm affectionate gaze, sunset rim light, 35mm lens, shallow depth of field, 9:16`
  },
  {
    id: 'pov_06_hold_hands',
    sceneCode: 'POV-08',
    titleZh: '晴空街道・緊緊牽住你的手',
    titleJa: '晴れた帰り道・ぎゅっと繋いだ手',
    image: 'assets/pov_photos/pov_06_hold_hands.png',
    costumeId: 'dress',
    outfitZh: '淺藍V領荷葉袖連身洋裝、晴空街道第一人稱牽手視角',
    outfitJa: '水色のサマードレス、青空の街角で手を繋ぐ一人称視点',
    keywords: ['牽手', '手', '散步', '約會', '逛街', '放學路', '手繋ぎ', '手を繋ぐ', 'デート', '散歩'],
    captionJa: 'ほら、{user}……はぐれないように、ちゃんと手、握っててね。ふふっ、こうして手を繋いで歩くの、すごく幸せよ。',
    captionZh: '來，{user}……為了不走散，要把我的手握緊喔。呵呵，像這樣牽著手並肩走著，真的好幸福呢。',
    tts: 'ほら、{user}、はぐれないように、ちゃんと手、握っててね。こうして手を繋いで歩くの、すごく幸せよ。',
    pixaiPrompt: `${CHARACTER_LOCK_PROMPT}, couple POV walking home, subtle hand-holding moment, her fingers quietly reach toward the viewer's hand and gently intertwine, shy affectionate gesture, walking side by side, focus on hands with partial view of both figures, late afternoon sunlight, quiet Japanese residential street, soft breeze moving her long blue-black hair, candid snapshot, 50mm lens, shallow depth of field, warm film tones, 9:16`
  },
  {
    id: 'pov_07_turn_back_1',
    sceneCode: 'POV-09A',
    titleZh: '海風坡道・回頭伸手叫你快點 (I)',
    titleJa: '海風の坂道・振り返って手を伸ばす (I)',
    image: 'assets/pov_photos/pov_07_turn_back_1.png',
    costumeId: 'date',
    outfitZh: '深黑白色領口短袖連身洋裝、遠方蔚藍海景街道',
    outfitJa: '黒のサマードレス、遠くに海が見える坂道',
    keywords: ['回頭', '海邊', '街道', '快點', '散步', '背影', '振り返る', '海'],
    captionJa: 'もう、{user}ったら歩くの遅いんだから！ほら、早く来て？海がすごく綺麗に見える場所、見つけたのよ！',
    captionZh: '真是的，{user}走得太慢了啦！來，快點跟上？我找到一個看海超美的地方喔！',
    tts: 'もう、{user}ったら歩くの遅いんだから！ほら、早く来て？海がすごく綺麗に見える場所、見つけたのよ！',
    pixaiPrompt: `${CHARACTER_LOCK_PROMPT}, dynamic couple POV, walking ahead on a sunny Japanese coastal street, she turns back toward the viewer, extends one hand inviting the viewer to catch up, bright playful smile, expressive green eyes, long blue-black hair moving in the breeze, dress hem moving naturally, candid motion, 35mm lens, natural daylight, cinematic street photography, 9:16`
  },
  {
    id: 'pov_08_turn_back_2',
    sceneCode: 'POV-09B',
    titleZh: '午後老街・微風拂髮回眸微笑 (II)',
    titleJa: '午後の街並み・風に揺れる髪と笑顔 (II)',
    image: 'assets/pov_photos/pov_08_turn_back_2.png',
    costumeId: 'date',
    outfitZh: '白色長袖襯衫搭配黑色背心連身裙、復古日本街道',
    outfitJa: '白ブラウスと黒のジャンパースカート、ノスタルジックな街並み',
    keywords: ['老街', '回眸', '回頭', '微風', '長髮', '洋裝'],
    captionJa: 'ふふっ、{user}が後ろから写真を撮ってる気配、ちゃんと分かってたわよ。今の笑顔、何点だったかしら？',
    captionZh: '呵呵，{user}在後面偷偷拍我的動靜，我全都察覺到了喔。剛才回頭的笑容，你給幾分呢？',
    tts: 'ふふっ、{user}が後ろから写真を撮ってる気配、ちゃんと分かってたわよ。今の笑顔、何点だったかしら？',
    pixaiPrompt: `${CHARACTER_LOCK_PROMPT}, dynamic couple POV, walking ahead on a nostalgic Japanese street, turning back toward the viewer with a bright playful smile, white blouse under black pinafore dress, long blue-black hair flowing in the breeze, 35mm lens, 9:16`
  },
  {
    id: 'pov_09_turn_back_3',
    sceneCode: 'POV-09C',
    titleZh: '晴空散步・裙襬飛揚的邀約 (III)',
    titleJa: '青空の散歩道・揺れるスカートと誘い (III)',
    image: 'assets/pov_photos/pov_09_turn_back_3.png',
    costumeId: 'date',
    outfitZh: '白色七分袖上衣、深色高腰圓裙、晴空老街',
    outfitJa: '白トップス、黒のフレアスカート、青空の街並み',
    keywords: ['晴空', '裙襬', '約會', '伸手', '散步'],
    captionJa: 'いいお天気ね、{user}！今日はどこまで歩いていこうか？あなたと一緒なら、どこへ行っても楽しいわ。',
    captionZh: '天氣真好呢，{user}！今天我們要散步到哪裡去呢？只要是跟你在一起，去哪裡都很開心喔。',
    tts: 'いいお天気ね、{user}！あなたと一緒なら、どこへ行っても楽しいわ。',
    pixaiPrompt: `${CHARACTER_LOCK_PROMPT}, dynamic couple POV, walking ahead on a sunny Japanese street, she turns back toward the viewer, extends one hand inviting the viewer to catch up, white blouse and dark flared skirt, long hair moving in breeze, 35mm lens, 9:16`
  },
  {
    id: 'pov_10_fireworks_yukata',
    sceneCode: 'POV-10',
    titleZh: '夏夜河堤・花火下的浴衣回眸',
    titleJa: '夏の川辺・花火と浴衣の横顔',
    image: 'assets/pov_photos/pov_10_fireworks_yukata.png',
    costumeId: 'yukata',
    outfitZh: '水藍白花紋夏日浴衣、金黃腰帶、白色花朵髮飾、夜空絢爛煙火',
    outfitJa: '水色の花柄浴衣、黄色の帯、白い髪飾り、夜空の打ち上げ花火',
    keywords: ['煙火', '花火', '浴衣', '祭典', '河堤', '夏夜', '夜景', '夏祭り'],
    captionJa: '花火、すごく綺麗ね……でも、隣にいる{user}の横顔を見てる方が、もっと胸がドキドキしちゃうかも。来年もまた、二人で見に来ようね。',
    captionZh: '煙火真的好美喔……可是，看著身旁{user}的側臉，好像更讓人心跳加速呢。明年我們也要兩個人一起來看喔。',
    tts: '花火、すごく綺麗ね。でも、隣にいる{user}を見てる方が、もっとドキドキしちゃうかも。来年もまた、二人で見に来ようね。',
    pixaiPrompt: `${CHARACTER_LOCK_PROMPT}, summer fireworks date, couple POV beside a riverside, wearing elegant traditional yukata, she first looks toward the fireworks then slowly turns toward the viewer, gentle quiet smile, green eyes reflecting fireworks, riverside night, distant festival lights, subtle crowd bokeh, cool night air with warm fireworks glow, 50mm lens, shallow depth of field, cinematic Japanese photography, realistic fabric texture, soft film grain, nostalgic romantic memory, 9:16 vertical`
  },
  {
    id: 'pov_11_cafe_latte',
    sceneCode: 'POV-CAFE',
    titleZh: '午後咖啡館・雙人拿鐵約會視角',
    titleJa: '午後のカフェ・ラテアートと甘い視線',
    image: 'assets/pov_photos/pov_11_cafe_latte.png',
    costumeId: 'cafedate',
    outfitZh: '灰色細肩帶針織上衣、米白短裙、木桌上的心型拉花拿鐵',
    outfitJa: 'キャミソールニット、ベージュのミニスカート、ハートのラテアート',
    keywords: ['咖啡', '拿鐵', '拉花', '下午茶', '咖啡廳', 'カフェ', 'ラテ', 'コーヒー'],
    captionJa: 'カフェの窓際の席、落ち着くわね。ほら{user}、ラテアートがハートの形してるわよ。記念に一枚、撮っておきましょ？☕',
    captionZh: '咖啡館窗邊的位子真讓人放鬆呢。你看{user}，拿鐵拉花是愛心的形狀喔。拍一張留作紀念吧？☕',
    tts: 'カフェの窓際の席、落ち着くわね。ほら{user}、ラテアートがハートの形してるわよ。記念に一枚、撮っておきましょ？',
    pixaiPrompt: `${CHARACTER_LOCK_PROMPT}, afternoon cafe date POV, sitting across from the viewer at a wooden table by a sunlit window, holding a book and resting chin on hand, heart latte art cup on table, warm affectionate smile, 50mm portrait lens, 9:16`
  },
  {
    id: 'pov_12_morning_kitchen',
    sceneCode: 'POV-HOME',
    titleZh: '晨光廚房・居家背心早安自拍',
    titleJa: '朝のキッチン・部屋着でおはようショット',
    image: 'assets/pov_photos/pov_12_morning_kitchen.png',
    costumeId: 'home',
    outfitZh: '白色細肩帶居家背心、休閒運動短褲、灑滿晨光的廚房窗邊',
    outfitJa: '白のキャミソールとショートパンツ、朝日が差し込むキッチン',
    keywords: ['早安', '早晨', '廚房', '居家', '睡衣', '早餐', '家裡', '朝', 'おはよう', '部屋着', 'キッチン'],
    captionJa: 'おはよう、{user}。今、朝ごはんのコーヒーを淹れてたところよ。寝起きで撮るなんてずるいけど……{user}だけに見せてあげるわね。',
    captionZh: '早安，{user}。我正準備泡早餐的咖啡喔。剛睡醒就拍人家真是太犯規了……不過只給{user}一個人看喔。',
    tts: 'おはよう、{user}。今、朝ごはんのコーヒーを淹れてたところよ。{user}だけに見せてあげるわね。',
    pixaiPrompt: `${CHARACTER_LOCK_PROMPT}, morning kitchen couple POV, wearing a white camisole top and casual shorts, standing by a sunny kitchen window, turning back with a soft sleepy affectionate expression, morning sunlight, 50mm lens, 9:16`
  },
  {
    id: 'pov_13_morning_wakeup',
    sceneCode: 'POV-WAKEUP',
    titleZh: '晨間喚醒 POV・俯身甜笑叫你起床',
    titleJa: '朝の目覚ましPOV・上から覗き込む笑顔',
    image: 'assets/pov_photos/pov_13_morning_wakeup.jpg',
    costumeId: 'home',
    outfitZh: '白色削肩羅紋居家背心、純白過膝長襪、晨光臥室第一人稱仰角',
    outfitJa: '白のリブノースリーブ、白ニーソックス、朝の寝室での見下ろしPOV',
    keywords: ['起床', '鬧鐘', '叫我', '醒', '早安', '賴床', '起きる', '起こして', '目覚まし'],
    captionJa: 'ふふっ、やっと目が覚めたわね、{user}！もう、いつまでも起きないから上から起こしに来ちゃったじゃない。おはようのキス、してあげる💖',
    captionZh: '呵呵，終於睜開眼睛了呢，{user}！真是的，誰叫你一直賴床不起，我只好親自俯身來叫你囉。給你一個早安吻💖',
    tts: 'ふふっ、やっと目が覚めたわね、{user}！いつまでも起きないから起こしに来ちゃったじゃない。おはよう！',
    pixaiPrompt: `${CHARACTER_LOCK_PROMPT}, morning wake-up couple POV from lying down perspective, she leans over the viewer with a warm teasing smile, white sleeveless ribbed top and white thigh-high stockings, soft morning bedroom sunlight, 35mm close portrait, 9:16`
  },
  {
    id: 'pov_14_red_strawhat_beach',
    sceneCode: 'POV-STRAWHAT',
    titleZh: '夏日海灘・經典紅草帽與純白洋裝',
    titleJa: '夏のビーチ・赤い麦わら帽子と白いサマードレス',
    image: 'assets/pov_photos/pov_14_red_strawhat_beach.png',
    costumeId: 'strawhat',
    outfitZh: '初代傳奇紅色草帽、純白無袖夏日連身洋裝、晴空椰影海灘',
    outfitJa: '伝説の赤い麦わら帽子、純白のサマードレス、青い海とヤシの木',
    keywords: ['草帽', '紅草帽', '海灘', '海邊', '白洋裝', '初戀', '麦わら帽子', '赤い帽子'],
    captionJa: 'この赤い麦わら帽子を見ると、あなたと初めて出会ったあの夏の日を思い出すわね、{user}。これからもずっと、風が吹いたら受け止めてね。',
    captionZh: '只要看到這頂紅色草帽，就會想起與你初次相遇的那個夏日呢，{user}。今後不管吹起什麼風，你也要一直像那時一樣接住我喔。',
    tts: 'この赤い麦わら帽子を見ると、あなたと出会ったあの夏の日を思い出すわね、{user}。',
    pixaiPrompt: `${CHARACTER_LOCK_PROMPT}, iconic red straw hat and white sleeveless sundress on a sunny tropical beach with palm tree and turquoise ocean, holding her hat in the sea breeze, nostalgic 80s romance atmosphere, 50mm lens, 9:16`
  },
  {
    id: 'pov_15_red_strawhat_close',
    sceneCode: 'POV-HAT-CLOSE',
    titleZh: '碧海藍天・紅草帽近距離深情凝視',
    titleJa: '青い海と空・赤い麦わら帽子の至近距離ショット',
    image: 'assets/pov_photos/pov_15_red_strawhat_close.jpg',
    costumeId: 'strawhat',
    outfitZh: '紅色寬簷草帽、陽光灑落的翡翠綠雙眸特寫',
    outfitJa: '赤い麦わら帽子、太陽に輝くエメラルドグリーンの瞳のクローズアップ',
    keywords: ['特寫', '眼神', '眼睛', '草帽特寫', '凝視', '瞳', 'アップ'],
    captionJa: 'そんなに近くで撮るの……？{user}の瞳の中に私が映ってるのが見えるわ。なんだか照れくさいけど、幸せよ。',
    captionZh: '要靠這麼近拍嗎……？在{user}的眼眸裡，可以清楚看見我的倒影呢。雖然有點害羞，但真的好幸福喔。',
    tts: 'そんなに近くで撮るの？{user}の瞳の中に私が映ってるのが見えるわ。',
    pixaiPrompt: `${CHARACTER_LOCK_PROMPT}, extreme close-up portrait wearing her iconic red straw hat against a bright blue sky and summer sea, vivid emerald green eyes gazing affectionately into the camera, soft sunlight dappled through straw hat brim, 85mm portrait lens, 9:16`
  },
  {
    id: 'pov_16_chair_wink_study',
    sceneCode: 'POV-STUDY',
    titleZh: '書桌前的惡作劇・反坐木椅俏皮眨眼',
    titleJa: 'デスク前の悪戯・椅子に逆さ座りでウインク',
    image: 'assets/pov_photos/pov_16_chair_wink_study.png',
    costumeId: 'home',
    outfitZh: '水藍碎花細肩帶居家套裝、反坐書桌木椅、筆電與相框背景',
    outfitJa: '水色の花柄キャミソールセットアップ、木の椅子に逆さ座り、ウインク',
    keywords: ['書桌', '椅子', '眨眼', '讀書', '筆電', '陪讀', 'ウインク', '勉強', 'デスク'],
    captionJa: 'ねえ{user}、パソコンばっかり見てないで、少しは私と遊びましょ？ほら、休憩時間よ！ウインクしてあげる😉',
    captionZh: '吶{user}，別光顧著看電腦嘛，稍微陪我玩一下好不好？來，現在是休息時間囉！送你一個眨眼😉',
    tts: 'ねえ{user}、パソコンばっかり見てないで、少しは私と遊びましょ？ほら、休憩時間よ！',
    pixaiPrompt: `${CHARACTER_LOCK_PROMPT}, sitting backwards on a wooden desk chair in a light blue floral camisole set, resting arms on chair back, winking playfully at the viewer, laptop and framed photos on desk behind her, cozy sunlit room, 50mm lens, 9:16`
  },
  {
    id: 'pov_17_fireworks_handhold',
    sceneCode: 'POV-FIREWORKS-2',
    titleZh: '夏夜花火大會・水色浴衣牽緊你的手',
    titleJa: '夏夜の花火大会・水色の浴衣で手を繋ぐPOV',
    image: 'assets/pov_photos/pov_17_fireworks_handhold.png',
    costumeId: 'yukata',
    outfitZh: '水藍白花夏日浴衣、深藍腰帶、煙火綻放的湖畔第一人稱牽手',
    outfitJa: '水色の花柄浴衣、夜空の大輪の花火、手を繋ぐ一人称視点',
    keywords: ['花火牽手', '煙火牽手', '祭典約會', '夏日煙火', '花火大会'],
    captionJa: '見て、{user}！すっごく大きな花火！……人混みではぐれないように、この手、絶対に離さないでね💖',
    captionZh: '你看，{user}！是超大朵的煙火耶！……為了不在人群裡走散，這隻手，你絕對不能放開喔💖',
    tts: '見て、{user}！すっごく大きな花火！この手、絶対に離さないでね。',
    pixaiPrompt: `${CHARACTER_LOCK_PROMPT}, summer night fireworks festival by the water, wearing a light blue floral yukata, holding the viewer's hand in first-person POV, looking back with a radiant smile as colorful fireworks burst in the night sky, 35mm lens, 9:16`
  },
  {
    id: 'pov_18_golden_gown',
    sceneCode: 'POV-GALA',
    titleZh: '紀念日盛裝・香檳金絲緞平口晚禮服',
    titleJa: '記念日のドレスアップ・シャンパンゴールドのイブニングドレス',
    image: 'assets/pov_photos/pov_18_golden_gown.png',
    costumeId: 'evening_gown',
    outfitZh: '奢華香檳金絲緞平口晚禮服、夕陽落地窗景',
    outfitJa: 'シャンパンゴールドのサテンドレス、夕陽が差し込む窓辺',
    keywords: ['禮服', '晚禮服', '金色', '紀念日', '宴會', '派對', 'ドレス', '記念日'],
    captionJa: '今夜は私たちの特別な記念日だから、思い切ってドレスアップしてみたの。どうかしら、{user}……惚れ直した？✨',
    captionZh: '因為今晚是我們特別的紀念日，我鼓起勇氣盛裝打扮了一下。覺得如何呢，{user}……有沒有重新愛上我呀？✨',
    tts: '今夜は私たちの特別な記念日だから、ドレスアップしてみたの。どうかしら、{user}、惚れ直した？',
    pixaiPrompt: `${CHARACTER_LOCK_PROMPT}, wearing a glamorous strapless champagne gold satin evening gown by a sunlit window, elegant posture, soft romantic blush, looking at the viewer with deep affection, 50mm lens, 9:16`
  },
  {
    id: 'pov_19_kimono_calligraphy',
    sceneCode: 'POV-KIMONO',
    titleZh: '和室雅韻・薰衣草花紋和服與書道體驗',
    titleJa: '和室の雅・ラベンダー色の着物と書道',
    image: 'assets/pov_photos/pov_19_kimono_calligraphy.png',
    costumeId: 'yukata',
    outfitZh: '薰衣草紫花紋傳統和服、白花髮飾、和室木桌毛筆書道',
    outfitJa: 'ラベンダー色の花柄着物、白い花飾り、和室で書道',
    keywords: ['和服', '書法', '書道', '毛筆', '和室', '着物', '習字'],
    captionJa: '背筋が伸びるわね、{user}。毛筆で何を書いたかって？……ふふっ、私と{user}の未来の願い事よ。ヒ・ミ・ツ💖',
    captionZh: '心情都變得端莊起來了呢，{user}。你問我用毛筆寫了什麼嗎？……呵呵，是關於我跟{user}未來的願望喔。秘・密💖',
    tts: '毛筆で何を書いたかって？ふふっ、私と{user}の未来の願い事よ。ヒミツ！',
    pixaiPrompt: `${CHARACTER_LOCK_PROMPT}, wearing a lavender floral kimono with a white flower hair ornament, practicing calligraphy with a brush at a wooden table in a sunlit traditional Japanese tatami room, gentle poised smile, 50mm lens, 9:16`
  },
  {
    id: 'pov_20_boyfriend_shirt',
    sceneCode: 'POV-SHIRT',
    titleZh: '居家私密時刻・只穿你的大白襯衫害羞傾身',
    titleJa: 'おうち時間の秘密・彼シャツ姿で照れ笑い',
    image: 'assets/pov_photos/pov_20_boyfriend_shirt.png',
    costumeId: 'boyfriend_shirt',
    outfitZh: '微敞開的寬大白色男友襯衫、害羞泛紅雙頰近距離傾身',
    outfitJa: 'ゆったりした白の彼シャツ、頬を染めて前かがみになる至近距離',
    keywords: ['男友襯衫', '白襯衫', '害羞', '微醺', '性感', '私密', '彼シャツ', 'ワイシャツ'],
    captionJa: '{user}のシャツ、あなたの匂いがしてすごく安心するの……もう、そんな熱い目で見つめられたら、動けなくなっちゃうわ……💖',
    captionZh: '{user}的襯衫上都是你的氣息，穿起來好安心喔……真是的，被你用那麼熾熱的眼神盯著看，人家都動不了了啦……💖',
    tts: '{user}のシャツ、あなたの匂いがしてすごく安心するの。そんなに見つめられたら、照れちゃうわ。',
    pixaiPrompt: `${CHARACTER_LOCK_PROMPT}, intimate home couple POV, wearing an oversized unbuttoned white boyfriend shirt, blushing softly and leaning forward toward the viewer with a shy affectionate smile, warm indoor lighting, 50mm lens, 9:16`
  },
  {
    id: 'pov_21_office_ol',
    sceneCode: 'POV-OFFICE',
    titleZh: '辦公室秘密戀情・酒紅高領毛衣與窄裙 OL',
    titleJa: 'オフィスの秘密・ボルドーのニットとタイトスカートOL',
    image: 'assets/pov_photos/pov_21_office_ol.png',
    costumeId: 'work_ol',
    outfitZh: '酒紅色無袖高領針織衫、黑色高腰窄裙、識別證掛繩、陽光辦公室',
    outfitJa: 'ボルドーのノースリーブタートルニット、黒のタイトスカート、社員証ストラップ',
    keywords: ['工作', '辦公室', '秘書', '上班', '窄裙', 'ol', 'オフィス', '仕事', '秘書'],
    captionJa: 'お疲れ様、{user}！会社ではクールな先輩社員だけど……給湯室で二人きりになったら、あなたの恋人に戻ってもいいかしら？💼💖',
    captionZh: '工作辛苦了，{user}！雖然在公司裡我是冷靜幹練的前輩……但只要在茶水間兩人獨處時，可以變回你的戀人嗎？💼💖',
    tts: 'お疲れ様、{user}！二人きりになったら、あなたの恋人に戻ってもいいかしら？',
    pixaiPrompt: `${CHARACTER_LOCK_PROMPT}, office lady outfit, wearing a burgundy sleeveless turtleneck knit top, black pencil skirt, and ID badge lanyard in a modern sunlit office, gentle confident smile at the viewer, 50mm lens, 9:16`
  },
  {
    id: 'pov_22_guitar_home',
    sceneCode: 'POV-GUITAR',
    titleZh: '午後木吉他彈唱・專屬於你的不插電情歌',
    titleJa: '午後のアコースティックギター・あなたへの弾き語り',
    image: 'assets/pov_photos/pov_22_guitar_home.png',
    costumeId: 'guitar',
    outfitZh: '純白細肩帶居家背心、懷抱原木民謠吉他、溫暖房間光影',
    outfitJa: '白のキャミソール、アコースティックギターを抱えて微笑む部屋',
    keywords: ['吉他', '木吉他', '彈唱', '民謠', '情歌', 'ギター', '弾き語り'],
    captionJa: 'サックスもいいけど、こうして部屋でギターを爪弾くのも好きなの。{user}、隣に座って？一番最初にあなたに聴いてほしい曲があるの🎸',
    captionZh: '雖然薩克斯風也很棒，但我也喜歡像這樣在房間裡輕撥木吉他呢。{user}，坐到我旁邊來吧？有一首曲子，我想第一個彈給你聽🎸',
    tts: 'サックスもいいけど、部屋でギターを弾くのも好きなの。{user}、隣に座って聴いててね。',
    pixaiPrompt: `${CHARACTER_LOCK_PROMPT}, playing an acoustic guitar at home in a white camisole top, warm afternoon sunlight streaming into the room, looking at the viewer with a tender musical smile, 50mm lens, 9:16`
  },
  {
    id: 'pov_23_moon_bunny_heart',
    sceneCode: 'POV-MOON-BUNNY',
    titleZh: '滿月落地窗前・黑絲絨兔女郎雙手比愛心',
    titleJa: '満月の窓辺・黒バニーガールのハートポーズ',
    image: 'assets/pov_photos/pov_23_moon_bunny_heart.png',
    costumeId: 'bunny',
    outfitZh: '經典黑色兔女郎連身裝、白領結與袖口、滿月都市夜景窗前雙手比愛心',
    outfitJa: '黒のバニーガール衣装、満月と夜景の窓辺で両手ハートポーズ',
    keywords: ['兔女郎', '黑兔', '比愛心', '滿月', '夜景', 'バニー', 'ハート'],
    captionJa: 'ぴょんっ🐰 満月の夜だから、{user}のために特別なバニー姿でハートを届けてあげる！……もう、ドキドキしすぎて倒れないでよね💖',
    captionZh: '蹦🐰 因為今晚是滿月之夜，特別換上兔女郎裝為{user}送上雙手愛心喔！……真是的，可別因為心跳太快而昏倒囉💖',
    tts: '満月の夜だから、{user}のために特別なバニー姿でハートを届けてあげるわ！',
    pixaiPrompt: `${CHARACTER_LOCK_PROMPT}, black bunny girl cosplay by a floor-to-ceiling window with a full moon and city night view, making a cute heart gesture with both hands over her chest, blushing playful smile, 50mm lens, 9:16`
  },
  {
    id: 'pov_24_wheat_field_date',
    sceneCode: 'POV-FIELD',
    titleZh: '金色麥田微風・水藍綁帶洋裝回眸一笑',
    titleJa: '黄金色の草原・水色のサマードレスで微笑む',
    image: 'assets/pov_photos/pov_24_wheat_field_date.png',
    costumeId: 'dress',
    outfitZh: '淺藍胸前綁帶無袖夏日洋裝、金色芒草麥田與晴朗藍天',
    outfitJa: '水色のフロントリボンサマードレス、黄金色の草原と青空',
    keywords: ['麥田', '草原', '草地', '郊遊', '旅行', '踏青', '藍洋裝', '草原', '旅行'],
    captionJa: '風がすごく気持ちいいわね、{user}！都会の喧騒を離れて、こうして二人きりで自然の中を歩くの、ずっと夢だったのよ🌾✨',
    captionZh: '微風吹起來好舒服喔，{user}！遠離城市的喧囂，像這樣兩個人在金色草原中漫步，一直都是我的夢想呢🌾✨',
    tts: '風がすごく気持ちいいわね、{user}！こうして二人きりで自然の中を歩くの、大好きよ。',
    pixaiPrompt: `${CHARACTER_LOCK_PROMPT}, standing in a golden grass wheat field under a clear blue sky, wearing a light blue tie-front sundress, gentle breeze blowing her long dark hair, warm romantic smile at the viewer, 50mm lens, 9:16`
  }
];

// 完整 18 組 PixAI 繪圖指令集（整合《鮎川まどか_日常情侶POV_PixAI指令集.docx》、《Madoka_Daily_Creation_Cards.pdf》與《Madoka Prompt Guide.docx》）
const PIXAI_PROMPT_COLLECTION = [
  {
    id: 'pixai_pov_01',
    category: 'couple_pov',
    badge: '01｜情侶 POV',
    titleZh: '放學校門等你・主動牽手',
    titleJa: '01｜放課後の校門・手繋ぎ',
    sceneDesc: '校門放學時，她看到你後主動伸手牽住你，另一手提書包，帶一點得意又溫柔的笑。夕陽拉長兩人的影子。',
    outfit: '深藍外套、白襯衫、紅蝴蝶結、格紋百褶裙、深色長襪、棕色樂福鞋',
    linkedPhotoId: 'pov_06_hold_hands',
    prompt: `${CHARACTER_LOCK_PROMPT}, couple POV, first-person perspective, Japanese school gate after class, she notices the viewer and gently reaches out to hold the viewer's hand, small confident smile, slight head tilt, school bag in other hand, warm sunset, long shadows, nostalgic atmosphere, candid photography, 50mm lens, shallow depth of field, natural skin texture, subtle film grain, 9:16 vertical`,
    negativePrompt: COMMON_NEGATIVE_PROMPT
  },
  {
    id: 'pixai_pov_02',
    category: 'couple_pov',
    badge: '02｜情侶 POV',
    titleZh: '近距離替你整理領帶',
    titleJa: '02｜至近距離でネクタイ直し',
    sceneDesc: '她站得很近，替你整理歪掉的領帶，整理完抬眼看你，表情像「真拿你沒辦法」，耳尖微紅。',
    outfit: '深藍外套、白襯衫、紅蝴蝶結、單肩書包',
    linkedPhotoId: 'pov_01_tie',
    prompt: `${CHARACTER_LOCK_PROMPT}, intimate couple POV, close everyday interaction, she gently straightens the viewer's tie, looking up with a mildly teasing caring expression, subtle blush, relaxed smile, close personal distance, Japanese school corridor, soft afternoon window light, 50mm portrait lens, shallow depth of field, focus on eyes and hands, realistic skin texture, cinematic candid photograph, 9:16`,
    negativePrompt: COMMON_NEGATIVE_PROMPT
  },
  {
    id: 'pixai_pov_03',
    category: 'couple_pov',
    badge: '03｜情侶 POV',
    titleZh: '雨天放學・透明傘下共傘',
    titleJa: '03｜雨の放課後・相合い傘',
    sceneDesc: '雨天放學共撐透明傘，她輕拉你的袖口把你帶進傘下，肩膀自然靠近，雨滴在傘面形成前景散景。',
    outfit: '深色校服外套、白襯衫、百褶裙、深色長襪、帆布書包',
    linkedPhotoId: 'pov_01_tie',
    prompt: `${CHARACTER_LOCK_PROMPT}, couple POV under one transparent umbrella, rainy Japanese street after school, she gently holds the viewer's sleeve and moves closer, soft affectionate smile, shoulders naturally close, raindrops on umbrella in foreground, wet pavement reflections, cool blue-gray atmosphere, warm skin tones, candid street photography, 35mm lens, soft bokeh, realistic water droplets, subtle film grain, 9:16`,
    negativePrompt: COMMON_NEGATIVE_PROMPT
  },
  {
    id: 'pixai_pov_04',
    category: 'couple_pov',
    badge: '04｜情侶 POV',
    titleZh: '便利店外・並肩吃蘇打冰棒',
    titleJa: '04｜コンビニ前・アイス半分こ',
    sceneDesc: '夏日傍晚坐在便利店外吃冰。她咬一口冰棒後俏皮皺鼻，再笑著看你，腳輕輕晃動。',
    outfit: '白短袖、淺藍裙、帆布鞋、小肩包、簡單髮帶',
    linkedPhotoId: 'pov_03_popsicle_1',
    prompt: `${CHARACTER_LOCK_PROMPT}, summer date POV outside a Japanese convenience store, sitting beside the viewer, eating a popsicle, playful nose scrunch, bright natural smile, legs casually swinging, white short-sleeve top, light blue skirt, canvas sneakers, small shoulder bag, warm evening light, convenience store glow, candid snapshot, 35mm film photography, soft bokeh, relaxed romantic atmosphere, 9:16`,
    negativePrompt: COMMON_NEGATIVE_PROMPT
  },
  {
    id: 'pixai_pov_05',
    category: 'couple_pov',
    badge: '05｜情侶 POV',
    titleZh: '安靜書店・並肩共讀一本書',
    titleJa: '05｜静かな本屋・一冊の本をシェア',
    sceneDesc: '安靜書店裡兩人共看一本書，她肩膀輕碰你，看到有趣內容後轉頭露出好奇溫柔的笑。',
    outfit: '米白針織上衣、長裙、低跟鞋或平底鞋、棕色皮革小包',
    linkedPhotoId: 'pov_02_bookstore',
    prompt: `${CHARACTER_LOCK_PROMPT}, quiet bookstore date, couple POV, standing shoulder-to-shoulder with the viewer, sharing one open book, shoulder gently touching the viewer, curious gentle smile, warm wooden bookshelves, soft window light, quiet intimate atmosphere, dust particles, 50mm lens, shallow depth of field, realistic paper and fabric texture, candid editorial photography, 9:16`,
    negativePrompt: COMMON_NEGATIVE_PROMPT
  },
  {
    id: 'pixai_pov_06',
    category: 'couple_pov',
    badge: '06｜情侶 POV',
    titleZh: '夏日街頭・伸手替你扶正帽子',
    titleJa: '06｜夏の街角・帽子を直す指先',
    sceneDesc: '夏日街頭她伸手替你把帽子扶正，完成後笑著確認自己的成果，帶一點調皮感。',
    outfit: '淺色夏季洋裝、草帽、簡單涼鞋、小肩包',
    linkedPhotoId: 'pov_06_hold_hands',
    prompt: `${CHARACTER_LOCK_PROMPT}, summer couple POV, quiet Japanese street, she reaches toward the viewer and gently straightens the viewer's hat, playful affectionate smile, brief eye contact, leafy shadows, soft summer breeze, natural candid photography, 50mm lens, shallow depth of field, subtle film grain, clean Japanese summer color palette, 9:16`,
    negativePrompt: COMMON_NEGATIVE_PROMPT
  },
  {
    id: 'pixai_pov_07',
    category: 'couple_pov',
    badge: '07｜情侶 POV',
    titleZh: '傍晚電車・輕靠你肩膀睡著',
    titleJa: '07｜夕暮れの電車・肩にもたれてうたた寝',
    sceneDesc: '傍晚電車裡她不知不覺睡著，頭輕輕靠在你的肩膀，手自然放在膝上，窗外城市燈光掠過。',
    outfit: '日常針織上衣、長裙或直筒褲、薄外套，低調通勤風',
    linkedPhotoId: 'pov_11_cafe_latte',
    prompt: `${CHARACTER_LOCK_PROMPT}, quiet train ride POV, seated beside the viewer, gently asleep with her head resting on the viewer's shoulder, peaceful relaxed expression, hands naturally on lap, evening city lights outside train window, soft reflections, wholesome couple moment, low ambient light, 50mm lens, cinematic film grain, natural hair detail, shallow depth of field, documentary photography, 9:16`,
    negativePrompt: COMMON_NEGATIVE_PROMPT
  },
  {
    id: 'pixai_pov_08',
    category: 'couple_pov',
    badge: '08｜情侶 POV',
    titleZh: '放學返家・手指悄悄勾住牽手',
    titleJa: '08｜帰り道・そっと絡める指先',
    sceneDesc: '回家路上她趁你沒注意，手指悄悄靠近並與你勾住。鏡頭重點放在交握的手與並肩步伐。',
    outfit: '白短袖、淺藍裙、帆布鞋、小肩包',
    linkedPhotoId: 'pov_06_hold_hands',
    prompt: `${CHARACTER_LOCK_PROMPT}, couple POV walking home, subtle hand-holding moment, her fingers quietly reach toward the viewer's hand and gently intertwine, shy affectionate gesture, walking side by side, focus on hands with partial view of both figures, late afternoon sunlight, quiet Japanese residential street, soft breeze moving her long blue-black hair, candid snapshot, 50mm lens, shallow depth of field, warm film tones, 9:16`,
    negativePrompt: COMMON_NEGATIVE_PROMPT
  },
  {
    id: 'pixai_pov_09',
    category: 'couple_pov',
    badge: '09｜情侶 POV',
    titleZh: '微風街道・回頭伸手叫你快點',
    titleJa: '09｜風の街角・振り返って「早く！」',
    sceneDesc: '她走在前面幾步，發現你落後後回頭，笑著伸手叫你快點。長髮與裙襬被風吹起，畫面有自然動態。',
    outfit: '輕盈夏季洋裝、帆布鞋或簡潔涼鞋、小肩包',
    linkedPhotoId: 'pov_07_turn_back_1',
    prompt: `${CHARACTER_LOCK_PROMPT}, dynamic couple POV, walking ahead on a sunny Japanese street, she turns back toward the viewer, extends one hand inviting the viewer to catch up, bright playful smile, expressive green eyes, long blue-black hair moving in the breeze, dress hem moving naturally, candid motion, 35mm lens, natural daylight, cinematic street photography, realistic fabric movement, subtle film grain, 9:16`,
    negativePrompt: COMMON_NEGATIVE_PROMPT
  },
  {
    id: 'pixai_pov_10',
    category: 'couple_pov',
    badge: '10｜情侶 POV',
    titleZh: '河堤煙火・浴衣側看轉頭微笑',
    titleJa: '10｜川辺の花火大会・浴衣で振り返る瞳',
    sceneDesc: '夏夜河堤煙火大會，她穿浴衣坐在你身旁，先看煙火，再慢慢轉頭看你。煙火映在眼睛裡，露出很淡的溫柔笑容。',
    outfit: '靛藍、白、淡紅配色的夏日浴衣、簡單腰帶、低調髮飾、木屐',
    linkedPhotoId: 'pov_10_fireworks_yukata',
    prompt: `${CHARACTER_LOCK_PROMPT}, summer fireworks date, couple POV beside a riverside, wearing elegant traditional yukata, she first looks toward the fireworks then slowly turns toward the viewer, gentle quiet smile, green eyes reflecting fireworks, riverside night, distant festival lights, subtle crowd bokeh, cool night air with warm fireworks glow, 50mm lens, shallow depth of field, cinematic Japanese photography, realistic fabric texture, soft film grain, nostalgic romantic memory, 9:16 vertical`,
    negativePrompt: COMMON_NEGATIVE_PROMPT
  },
  // 出自《Madoka_Daily_Creation_Cards.pdf》與《Madoka Prompt Guide.docx》
  {
    id: 'pixai_daily_01',
    category: 'daily_card',
    badge: '日常創作卡 01',
    titleZh: '百葉窗晨光・寬鬆毛衣伸懶腰',
    titleJa: '日常カード01｜朝のブラインドと背伸び',
    sceneDesc: '穿著柔軟寬鬆針織毛衣與短褲，在早晨百葉窗灑落的光影條紋中睡眼惺忪地伸懶腰（Medium Shot）。',
    outfit: '寬鬆針織毛衣、居家短褲',
    linkedPhotoId: 'pov_12_morning_kitchen',
    prompt: 'Ayukawa Madoka, wearing a soft oversized knit sweater and shorts, stretching by the window, soft morning light casting stripes from venetian blinds, slightly messy hair, sleepy expression, medium shot, warm soft color tone, realistic anime style',
    negativePrompt: COMMON_NEGATIVE_PROMPT
  },
  {
    id: 'pixai_daily_02',
    category: 'daily_card',
    badge: '日常創作卡 02',
    titleZh: '秋日落葉公園・長椅熱咖啡',
    titleJa: '日常カード02｜紅葉の公園ベンチとコーヒー',
    sceneDesc: '穿著柔軟針織上衣與短裙，坐在飄落秋葉的公園長椅上手捧熱咖啡，溫柔望向遠方（Cowboy Shot）。',
    outfit: '柔軟針織衫、短裙',
    linkedPhotoId: 'pov_11_cafe_latte',
    prompt: 'Ayukawa Madoka, wearing a soft knit top and a short skirt, sitting on a park bench under falling autumn leaves, holding a cup of coffee, gazing into the distance with a gentle expression, soft natural light from top left, cowboy shot, realistic style, ambient warm tones, cinematic lighting',
    negativePrompt: COMMON_NEGATIVE_PROMPT
  },
  {
    id: 'pixai_daily_03',
    category: 'daily_card',
    badge: '日常創作卡 03',
    titleZh: '深夜超商冰櫃・挑選飲料側顏',
    titleJa: '日常カード03｜夜のコンビニ冷蔵庫と横顔',
    sceneDesc: '穿著休閒襯衫外套與牛仔褲，站在便利商店飲料冰櫃前挑選飲品，冷白微光照亮精緻側臉（Close-up）。',
    outfit: '休閒襯衫外套、牛仔褲',
    linkedPhotoId: 'pov_04_popsicle_2',
    prompt: 'Ayukawa Madoka, wearing a casual shirt jacket and jeans, standing in front of a convenience store fridge, choosing a drink, cold blue and white light illuminating her side face, close-up shot, realistic daily life tone, calm and reflective expression',
    negativePrompt: COMMON_NEGATIVE_PROMPT
  },
  {
    id: 'pixai_daily_04',
    category: 'daily_card',
    badge: '日常創作卡 04',
    titleZh: '月光城市陽台・黑禮服吹薩克斯風',
    titleJa: '日常カード04｜月夜のバルコニーでサックス独奏',
    sceneDesc: '身穿修身黑色洋裝站在夜景陽台吹奏薩克斯風，閉眼沉浸於爵士樂音中，晚風輕拂長髮。',
    outfit: '修身黑色洋裝、薩克斯風',
    linkedPhotoId: 'pov_10_fireworks_yukata',
    prompt: 'Ayukawa Madoka, in a tight black dress, standing on a balcony playing the saxophone, soft balcony light and cool moonlight, city lights in the background, side-back angle, closed eyes in musical immersion, hair flowing in the night wind, realistic anime style',
    negativePrompt: COMMON_NEGATIVE_PROMPT
  },
  {
    id: 'pixai_daily_05',
    category: 'daily_card',
    badge: '日常創作卡 05',
    titleZh: '晴空陽台・微風中摺疊衣物',
    titleJa: '日常カード05｜陽だまりのバルコニーで洗濯物たたみ',
    sceneDesc: '穿著寬鬆棉質襯衫與短褲在陽光灑落的陽台摺衣服，背景床單隨風輕晃，神情溫柔恬靜。',
    outfit: '寬鬆棉質襯衫、居家短褲',
    linkedPhotoId: 'pov_12_morning_kitchen',
    prompt: 'Ayukawa Madoka, wearing a loose cotton shirt and shorts, folding clothes on the sunny balcony, fabric blowing gently in the background, natural sunlight from above casting soft shadows, warm gentle expression, soft pastel tones, realistic anime illustration',
    negativePrompt: COMMON_NEGATIVE_PROMPT
  },
  {
    id: 'pixai_daily_06',
    category: 'daily_card',
    badge: '日常創作卡 06',
    titleZh: '紅帽T夜晚超商階梯・城市車燈微光',
    titleJa: '日常カード06｜赤パーカーと夜のコンビニ階段',
    sceneDesc: '穿著紅色連帽衫與短裙坐在夜晚便利店階梯上，身旁放著打開的飲料，遠處城市車燈閃爍。',
    outfit: '紅色連帽衫 (Red Hoodie)、短裙',
    linkedPhotoId: 'pov_05_popsicle_3',
    prompt: 'Ayukawa Madoka, in a red hoodie and short skirt, sitting on the steps outside a convenience store at night, opened drink beside her, city lights and car headlights in the distance, soft cold lighting from the store above, front low angle, pensive expression, realistic anime style',
    negativePrompt: COMMON_NEGATIVE_PROMPT
  },
  {
    id: 'pixai_guide_a',
    category: 'retro_guide',
    badge: 'Prompt A｜黑白漫畫風',
    titleZh: '80年代復古漫畫・紅色法拉利 Testarossa',
    titleJa: 'Prompt A｜80年代モノクロ漫画＆フェラーリ',
    sceneDesc: '80年代經典黑白漫畫粗線條風格，身穿皮夾克、緊身短裙與長靴，帥氣斜靠在復古 Ferrari Testarossa 上（Cowboy Shot）。',
    outfit: '騎士皮夾克、緊身短裙、高跟長靴',
    linkedPhotoId: 'pov_07_turn_back_1',
    prompt: 'Ayukawa Madoka, retro anime girl from the 1980s, long black hair with layered bangs, wearing a leather bomber jacket, tight skirt and long heeled boots, sitting casually on a vintage Ferrari Testarossa, leaning on one hand, confident and slightly mischievous expression, gaze directed slightly downward toward the viewer, side view, cowboy shot, slightly low angle, time setting: late afternoon, strong directional shadows, dramatic monochrome contrast, black and white manga style, bold inking, retro comic panel aesthetic',
    negativePrompt: COMMON_NEGATIVE_PROMPT
  },
  {
    id: 'pixai_guide_b',
    category: 'retro_guide',
    badge: 'Prompt B｜寫實寫真風',
    titleJa: 'Prompt B｜夕暮れシネマティック写実スタイル',
    titleZh: '傍晚柔光寫真・法拉利自信微笑',
    sceneDesc: '20-22歲寫實動漫寫真感，傍晚 Golden Hour 柔光與長影，坐在紅色復古法拉利上帶著神秘溫柔微笑注視觀者。',
    outfit: '深色飛行皮夾克、短裙、長靴',
    linkedPhotoId: 'pov_08_turn_back_2',
    prompt: 'A beautiful woman inspired by Ayukawa Madoka, 20-22 years old, long black hair with center-parted bangs, wearing a dark bomber jacket, tight skirt, and heeled boots, sitting on a red vintage Ferrari Testarossa, confident expression with a gentle smile, eyes looking directly at the viewer with calm allure, cowboy shot, soft golden hour lighting, long afternoon shadows, cinematic tone, shallow depth of field, high-resolution photorealistic anime style, centered composition, background with subtle sunlit pavement or blurred roadside, masterpiece',
    negativePrompt: COMMON_NEGATIVE_PROMPT
  }
];

function normalizePhotoItem(p, userName = 'リンシ') {
  const captionJa = (p.captionJa || '').replace(/\{user\}/g, userName);
  const captionZh = (p.captionZh || '').replace(/\{user\}/g, userName);
  const tts = (p.tts || captionJa).replace(/\{user\}/g, userName);
  return {
    ...p,
    imageUrl: p.imageUrl || p.image,
    title: p.title || p.titleZh || p.titleJa || '情侶 POV 自拍',
    caption: p.caption || `${captionJa}\n（${captionZh}）`,
    captionJa,
    captionZh,
    fullReplyBilingual: `${captionJa}\n（${captionZh}）`,
    ttsText: tts,
    tts
  };
}

function getAllPovPhotos(userName = 'リンシ') {
  const db = loadMemoryDB();
  const custom = Array.isArray(db.customPhotos) ? db.customPhotos : [];
  return [...custom, ...POV_PHOTOS].map(p => normalizePhotoItem(p, userName));
}

// 判斷使用者對話是否包含「請まどか拍照/自拍發送」的意圖
function detectPhotoRequest(userMessage = '') {
  if (!userMessage || typeof userMessage !== 'string') return { isPhotoRequest: false };
  const msg = userMessage.toLowerCase();

  const photoTriggerWords = [
    '拍照', '自拍', '拍一張', '拍張', '照片', '發張照', '傳張照', '給我看你', '看看你現在', '拍給我看',
    '写真', '自撮り', '撮って', '見せて', 'ツーショット', 'ショット', 'カメラ', 'selfie', 'photo', 'pov'
  ];

  const isExplicitPhoto = photoTriggerWords.some(w => msg.includes(w));
  if (!isExplicitPhoto) return { isPhotoRequest: false };

  return {
    isPhotoRequest: true,
    query: userMessage
  };
}

// 依據情境關鍵字、目前服裝或隨機挑選最合適的情侶 POV 照片
function selectPovPhoto(queryOrPhotoId = '', currentCostume = 'uniform', userName = 'リンシ') {
  const allPhotos = getAllPovPhotos(userName);
  const q = (queryOrPhotoId || '').toLowerCase();

  // 1. 若直接指定了 photoId 或 sceneCode
  let picked = allPhotos.find(p => p.id.toLowerCase() === q || (p.sceneCode && p.sceneCode.toLowerCase() === q));

  // 2. 若包含場景關鍵字（如「領帶」「看書」「吃冰」「牽手」「回頭」「煙火」「咖啡」「早晨」）
  if (!picked && q.length > 0) {
    const matches = allPhotos.filter(p => (p.keywords || []).some(k => q.includes(k.toLowerCase())));
    if (matches.length > 0) {
      picked = matches[Math.floor(Math.random() * matches.length)];
    }
  }

  // 3. 若未指定特定關鍵字，優先從符合當前服裝或隨機挑選
  if (!picked) {
    const costumeMatches = allPhotos.filter(p => p.costumeId === currentCostume);
    if (costumeMatches.length > 0 && Math.random() < 0.65) {
      picked = costumeMatches[Math.floor(Math.random() * costumeMatches.length)];
    } else {
      picked = allPhotos[Math.floor(Math.random() * allPhotos.length)];
    }
  }

  return normalizePhotoItem(picked, userName);
}

// 智慧轉換使用者自訂中文/日文場景為 PixAI 專屬英文 Prompt
function generateCustomPixAIPrompt(sceneInput = '', lens = '50mm', lighting = 'soft golden hour lighting') {
  const raw = (sceneInput || '').trim();
  const sceneTags = [];

  // 常用情境自動對應英文 Tag 詞庫
  const tagDict = [
    { keys: ['海', '海邊', '沙灘', '海灘', 'ビーチ'], en: 'sunny sandy beach, sparkling ocean waves in background, gentle sea breeze' },
    { keys: ['咖啡', '下午茶', '拿鐵', 'カフェ'], en: 'cozy retro Japanese cafe Abcb, warm wooden interior, holding a cup of latte art coffee' },
    { keys: ['雨', '雨傘', '下雨', '傘'], en: 'rainy Japanese street, sharing one transparent umbrella, raindrops bokeh, wet pavement reflections' },
    { keys: ['煙火', '花火', '祭典', '浴衣'], en: 'wearing traditional floral summer yukata, riverside fireworks festival at night, fireworks reflecting in green eyes' },
    { keys: ['學校', '教室', '走廊', '制服', '放學'], en: 'wearing classic Japanese sailor school uniform, sunlit school classroom by the window, nostalgic after-school atmosphere' },
    { keys: ['薩克斯', '音樂', '吹奏', 'サックス'], en: 'holding a golden alto saxophone, music room by sunset window, emotional artistic atmosphere' },
    { keys: ['牽手', '手'], en: 'first-person couple POV, gently holding the viewer\'s hand, intertwining fingers, shy affectionate smile' },
    { keys: ['睡', '床', '晚安', '房間', '居家'], en: 'cozy bedroom at night, wearing soft oversized knit sweater, warm bedside lamp glow, intimate relaxed gaze' },
    { keys: ['冰', '可麗餅', '甜點', '蛋糕', '吃'], en: 'sharing a sweet dessert together, playful feeding gesture toward the viewer, happy bright smile' },
    { keys: ['電車', '火車', '車站', '月台'], en: 'quiet Japanese train station platform at dusk, standing close beside the viewer, cinematic evening glow' }
  ];

  for (const item of tagDict) {
    if (item.keys.some(k => raw.includes(k))) {
      sceneTags.push(item.en);
    }
  }

  if (sceneTags.length === 0) {
    sceneTags.push('intimate couple POV, first-person perspective, looking warmly at the viewer with a gentle affectionate smile, candid everyday moment');
  }

  const lensTag = lens === '35mm'
    ? '35mm lens, dynamic street photography, natural environmental depth'
    : '50mm portrait lens, shallow depth of field, intimate close-up focus on eyes and expression';

  const finalPrompt = `${CHARACTER_LOCK_PROMPT}, couple POV, ${sceneTags.join(', ')}, ${lighting}, ${lensTag}, realistic fabric and skin texture, subtle film grain, cinematic Japanese photography, 9:16 vertical`;

  return {
    sceneInput: raw || '預設情侶日常自拍視角',
    prompt: finalPrompt,
    negativePrompt: COMMON_NEGATIVE_PROMPT,
    characterLock: CHARACTER_LOCK_PROMPT
  };
}

// 支援使用者匯入自己在 PixAI 生成的新照片至情侶相簿
function importCustomPovPhoto({ dataUrl, title, captionJa, captionZh, pixaiPrompt }) {
  try {
    if (!dataUrl || !dataUrl.startsWith('data:image/')) {
      return { success: false, error: '無效的圖片格式' };
    }
    const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches) return { success: false, error: 'Base64 解析失敗' };

    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const filename = `pov_custom_${Date.now()}.${ext}`;
    const relPath = `assets/pov_photos/${filename}`;
    const absDir = path.join(__dirname, 'assets', 'pov_photos');
    if (!fs.existsSync(absDir)) {
      fs.mkdirSync(absDir, { recursive: true });
    }
    fs.writeFileSync(path.join(absDir, filename), buffer);

    const newPhoto = {
      id: `custom_${Date.now()}`,
      sceneCode: 'CUSTOM-POV',
      titleZh: title || '專屬 PixAI 情侶自拍',
      titleJa: title || '特別な PixAI カップルショット',
      image: relPath,
      costumeId: 'date',
      outfitZh: '使用者自訂 PixAI 創作寫真',
      outfitJa: 'カスタム PixAI ポートレート',
      keywords: ['自訂', '新照片', title || ''],
      captionJa: captionJa || 'ねえ{user}、新しく撮ったこの一枚、どうかしら？あなたとの思い出がまた一つ増えたわね💖',
      captionZh: captionZh || '吶{user}，新拍的這張照片，覺得怎麼樣呢？我們之間的回憶又多了一張囉💖',
      tts: captionJa || 'ねえ{user}、新しく撮ったこの一枚、どうかしら？あなたとの思い出がまた一つ増えたわね。',
      pixaiPrompt: pixaiPrompt || CHARACTER_LOCK_PROMPT
    };

    const db = loadMemoryDB();
    db.customPhotos = db.customPhotos || [];
    db.customPhotos.unshift(newPhoto);
    if (!db.unlockedPhotoIds.includes(newPhoto.id)) {
      db.unlockedPhotoIds.push(newPhoto.id);
    }
    saveMemoryDB(db);

    return { success: true, photo: normalizePhotoItem(newPhoto) };
  } catch (err) {
    console.error('[PovPhotoService] 匯入自訂照片失敗:', err);
    return { success: false, error: err.message };
  }
}


module.exports = {
  CHARACTER_LOCK_PROMPT,
  COMMON_NEGATIVE_PROMPT,
  POV_PHOTOS,
  PIXAI_PROMPT_COLLECTION,
  getAllPovPhotos,
  detectPhotoRequest,
  selectPovPhoto,
  generateCustomPixAIPrompt,
  importCustomPovPhoto
};
