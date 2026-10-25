const http = require('http');

const data = JSON.stringify({ message: "まどか、你在做什麼呢？", history: [] });

const req = http.request({
  hostname: '127.0.0.1',
  port: 3829,
  path: '/api/chat',
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
    console.log('回應內容:', body);
  });
});

req.on('error', console.error);
req.write(data);
req.end();
