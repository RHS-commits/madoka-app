const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'user_config.json');

const DEFAULT_CONFIG = {
  userName: 'リンシ',
  geminiApiKey: '',
  minimaxApiKey: '',
  minimaxGroupId: '',
  minimaxVoiceId: '',
  useCustomApiUrl: false,
  customApiUrl: 'https://api.minimaxi.chat/v1/t2a_v2',
  volume: 0.8,
  speechSpeed: 1.0,
  languageMode: 'ja-with-zh', // 'ja-with-zh' | 'zh-TW' | 'ja-JP'
  autoIdleGreet: true,
  idleIntervalMinutes: 20,
  currentCostume: 'uniform',
  autoTimeCostume: true,
  bedtimeReminder: true,
  voiceMode: 'authentic', // 'authentic' (原汁原味聲優原聲) | 'minimax' (AI TTS) | 'mute'
  bgmVolume: 0.45
};

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
      return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error('讀取設定檔失敗，使用預設值:', err);
  }
  return { ...DEFAULT_CONFIG };
}

function saveConfig(newConfig) {
  try {
    const current = loadConfig();
    const merged = { ...current, ...newConfig };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2), 'utf-8');
    return { success: true, config: merged };
  } catch (err) {
    console.error('儲存設定檔失敗:', err);
    return { success: false, error: err.message };
  }
}

module.exports = {
  loadConfig,
  saveConfig,
  DEFAULT_CONFIG
};
