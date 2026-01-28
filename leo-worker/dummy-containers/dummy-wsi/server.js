const http = require('http');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 8080;

// HTTP server for health checks
const httpServer = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }
  res.writeHead(404);
  res.end('Not found');
});

// WebSocket server
const wss = new WebSocketServer({ server: httpServer });

wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] CONNECTION from ${clientIp}`);

  ws.on('message', (data) => {
    const timestamp = new Date().toISOString();
    const message = data.toString();
    console.log(`[${timestamp}] MESSAGE from ${clientIp}: ${message}`);

    // Echo back with acknowledgment
    ws.send(JSON.stringify({
      type: 'ack',
      received: message,
      timestamp
    }));
  });

  ws.on('close', (code, reason) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] CLOSE from ${clientIp} - code: ${code}, reason: ${reason || 'none'}`);
  });

  ws.on('error', (err) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR from ${clientIp}: ${err.message}`);
  });

  // Send welcome message
  ws.send(JSON.stringify({ type: 'welcome', message: 'Connected to dummy-wsi' }));
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`[${new Date().toISOString()}] dummy-wsi started on port ${PORT}`);
  console.log(`  Health: http://0.0.0.0:${PORT}/health`);
  console.log(`  WebSocket: ws://0.0.0.0:${PORT}`);
});
