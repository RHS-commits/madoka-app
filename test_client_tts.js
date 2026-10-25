const http = require('http');

const data = JSON.stringify({ text: "恭介、你在看什麼呢？" });

const req = http.request({
  hostname: '127.0.0.1',
  port: 3829,
  path: '/api/tts',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('HTTP 狀態碼:', res.statusCode);
    const parsed = JSON.parse(body);
    console.log('TTS 成功狀態:', parsed.success);
    console.log('TTS 來源:', parsed.source);
    console.log('Audio Data URL 前綴:', parsed.audioDataUrl ? parsed.audioDataUrl.slice(0, 30) : null);
  });
});

req.on('error', console.error);
req.write(data);
req.end();
