const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  let filePath = req.url === '/' ? '/simple-working-frontend.html' : req.url;
  filePath = path.join(__dirname, filePath);

  if (req.url === '/' || req.url === '/simple-working-frontend.html') {
    fs.readFile('simple-working-frontend.html', 'utf8', (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('File not found');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'OK', message: 'Frontend server working' }));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

const PORT = 8000;
server.listen(PORT, () => {
  console.log('✅ Frontend server running on http://localhost:' + PORT);
  console.log('🌐 Open: http://localhost:' + PORT);
});
