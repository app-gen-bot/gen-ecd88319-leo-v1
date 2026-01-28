const WebSocket = require('ws');

const WS_URL = process.env.WS_URL;
const REQUEST_ID = process.env.REQUEST_ID || 'test-' + Date.now();
const TIMEOUT_MS = parseInt(process.env.TIMEOUT_MS || '30000', 10);

if (!WS_URL) {
  console.error(`[${new Date().toISOString()}] ERROR: WS_URL environment variable required`);
  process.exit(1);
}

console.log(`[${new Date().toISOString()}] dummy-leo starting`);
console.log(`  WS_URL: ${WS_URL}`);
console.log(`  REQUEST_ID: ${REQUEST_ID}`);
console.log(`  TIMEOUT_MS: ${TIMEOUT_MS}`);

const timeout = setTimeout(() => {
  console.error(`[${new Date().toISOString()}] TIMEOUT: No connection after ${TIMEOUT_MS}ms`);
  process.exit(1);
}, TIMEOUT_MS);

console.log(`[${new Date().toISOString()}] Connecting to ${WS_URL}...`);

const ws = new WebSocket(WS_URL);

ws.on('open', () => {
  console.log(`[${new Date().toISOString()}] CONNECTED to ${WS_URL}`);

  const message = JSON.stringify({
    type: 'ready',
    requestId: REQUEST_ID,
    timestamp: new Date().toISOString()
  });

  console.log(`[${new Date().toISOString()}] SENDING: ${message}`);
  ws.send(message);
});

ws.on('message', (data) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] RECEIVED: ${data.toString()}`);

  // If we got an ack, we're done - success!
  try {
    const parsed = JSON.parse(data.toString());
    if (parsed.type === 'ack') {
      console.log(`[${timestamp}] SUCCESS: Message acknowledged`);
      clearTimeout(timeout);
      ws.close();
      process.exit(0);
    }
  } catch (e) {
    // Not JSON, that's fine
  }
});

ws.on('error', (err) => {
  console.error(`[${new Date().toISOString()}] ERROR: ${err.message}`);
  clearTimeout(timeout);
  process.exit(1);
});

ws.on('close', (code, reason) => {
  console.log(`[${new Date().toISOString()}] CLOSED: code=${code}, reason=${reason || 'none'}`);
  clearTimeout(timeout);
  // Exit 0 only if we got ack, otherwise exit 1
  process.exit(code === 1000 ? 0 : 1);
});
