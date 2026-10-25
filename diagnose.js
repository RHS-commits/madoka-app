const { chatWithGemini } = require('./ai_service');
const { generateMiniMaxTTS } = require('./minimax_tts');
const { loadConfig } = require('./config_manager');

async function diagnose() {
  const cfg = loadConfig();
  console.log('當前配置:');
  console.log('Gemini Key 前綴:', cfg.geminiApiKey.slice(0, 10));
  console.log('MiniMax Key 前綴:', cfg.minimaxApiKey.slice(0, 15));
  console.log('MiniMax Voice ID:', cfg.minimaxVoiceId);

  console.log('\n--- 1. 測試 Gemini API ---');
  try {
    const res = await chatWithGemini('你好', [], cfg);
    console.log('Gemini 回應:', res);
  } catch (e) {
    console.error('Gemini 拋出異常:', e);
  }

  console.log('\n--- 2. 測試 MiniMax TTS ---');
  try {
    const res = await generateMiniMaxTTS('こんにちは、リンシ。', cfg);
    console.log('MiniMax 成功狀態:', res.success);
    console.log('MiniMax 來源:', res.source);
    if (res.error) console.log('MiniMax 錯誤訊息:', res.error);
    if (res.audioDataUrl) console.log('音訊前綴:', res.audioDataUrl.slice(0, 40));
  } catch (e) {
    console.error('MiniMax 拋出異常:', e);
  }
}

diagnose();
