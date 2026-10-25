// minimax_tts.js - MiniMax 語音合成模組（鶴ひろみ聲線）

const fs = require('fs');
const path = require('path');

// 取得備用本機音檔清單（使用者已有的剪輯音檔）
function getLocalFallbackAudio() {
  const localVoiceDir = path.join(__dirname, 'assets', 'fallback_voices');
  try {
    if (fs.existsSync(localVoiceDir)) {
      const files = fs.readdirSync(localVoiceDir).filter(f => f.endsWith('.mp3'));
      if (files.length > 0) {
        const randomFile = files[Math.floor(Math.random() * files.length)];
        const buffer = fs.readFileSync(path.join(localVoiceDir, randomFile));
        return `data:audio/mp3;base64,${buffer.toString('base64')}`;
      }
    }
  } catch (err) {
    console.error('讀取本機備用音檔失敗:', err);
  }
  return null;
}

/**
 * 呼叫 MiniMax T2A API 生成音訊
 * @param {string} text - 朗讀文字
 * @param {object} config - 設定參數 (apiKey, groupId, voiceId 等)
 */
async function generateMiniMaxTTS(text, config = {}) {
  const apiKey = config.minimaxApiKey;
  const groupId = config.minimaxGroupId;
  const voiceId = config.minimaxVoiceId;
  const speed = config.speechSpeed || 1.0;
  const vol = config.volume || 1.0;

  // 若未設定 MiniMax API Key 或 Voice ID，使用本機預存音檔或返回無音訊
  if (!apiKey || !voiceId || apiKey.trim() === '' || voiceId.trim() === '') {
    const fallbackUrl = getLocalFallbackAudio();
    if (fallbackUrl) {
      return {
        success: true,
        audioDataUrl: fallbackUrl,
        source: 'local_preset'
      };
    }
    return {
      success: false,
      error: '尚未設定 MiniMax API Key 或 Voice ID，請點擊齒輪開啟設定。',
      source: 'none'
    };
  }

  // 決定 Endpoint
  let endpoint = 'https://api.minimaxi.chat/v1/t2a_v2';
  if (groupId && groupId.trim() !== '') {
    endpoint = `https://api.minimax.chat/v1/t2a_v2?GroupId=${groupId.trim()}`;
  }
  if (config.useCustomApiUrl && config.customApiUrl) {
    endpoint = config.customApiUrl;
  }

  const payload = {
    model: 'speech-01-turbo',
    text: text,
    stream: false,
    voice_setting: {
      voice_id: voiceId.trim(),
      speed: parseFloat(speed) || 1.0,
      vol: parseFloat(vol) || 1.0,
      pitch: 0
    },
    audio_setting: {
      sample_rate: 32000,
      bitrate: 128000,
      format: 'mp3',
      channel: 1
    }
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`MiniMax API HTTP 錯誤 (${response.status}): ${errText}`);
    }

    const result = await response.json();

    if (result.base_resp && result.base_resp.status_code !== 0) {
      throw new Error(`MiniMax 業務錯誤: [${result.base_resp.status_code}] ${result.base_resp.status_msg}`);
    }

    const rawAudio = result.data?.audio;
    if (!rawAudio) {
      throw new Error('MiniMax 未返回音訊資料');
    }

    let audioBuffer;
    // 檢查是否為 Hex 字串 (MiniMax 常見返回格式)
    if (/^[0-9a-fA-F]+$/.test(rawAudio)) {
      audioBuffer = Buffer.from(rawAudio, 'hex');
    } else {
      audioBuffer = Buffer.from(rawAudio, 'base64');
    }

    const base64Audio = audioBuffer.toString('base64');
    const audioDataUrl = `data:audio/mp3;base64,${base64Audio}`;

    return {
      success: true,
      audioDataUrl: audioDataUrl,
      source: 'minimax'
    };
  } catch (err) {
    console.warn('MiniMax TTS API 調用未果，切換為本機音檔:', err.message);
    const fallbackUrl = getLocalFallbackAudio();
    return {
      success: true, // 標記為成功以觸發播放本機備用音訊
      error: err.message,
      audioDataUrl: fallbackUrl,
      source: 'local_preset'
    };
  }
}

module.exports = {
  generateMiniMaxTTS,
  getLocalFallbackAudio
};
