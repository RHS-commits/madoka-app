const { chatWithGemini } = require('./ai_service');
const { generateMiniMaxTTS } = require('./minimax_tts');
const { loadConfig } = require('./config_manager');

async function test() {
  const cfg = loadConfig();
  console.log('當前設定:', cfg);

  console.log('\n=== 測試 AI 回覆 (預設離線台詞庫) ===');
  const chatRes = await chatWithGemini('まどか、你在做什麼呢？', [], cfg);
  console.log('AI 回覆:', chatRes);

  console.log('\n=== 測試 聲音合成 (預設本機音檔降級) ===');
  const ttsRes = await generateMiniMaxTTS(chatRes.reply, cfg);
  console.log('TTS 結果:', {
    success: ttsRes.success,
    source: ttsRes.source,
    audioDataUrlPrefix: ttsRes.audioDataUrl ? ttsRes.audioDataUrl.slice(0, 40) + '...' : null
  });
}

test().catch(console.error);
