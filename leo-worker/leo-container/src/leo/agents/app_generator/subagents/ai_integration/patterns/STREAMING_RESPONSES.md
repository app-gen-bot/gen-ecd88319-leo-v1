# AI Integration: Streaming Responses

**Purpose:** Real-time token-by-token responses for improved perceived performance

---

## The Problem

Waiting for complete response creates poor UX for long outputs.

```typescript
// ❌ WRONG: User waits 30 seconds for full response
async chat(message: string) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    messages: [{ role: 'user', content: message }],
  });
  // User sees nothing for 30 seconds, then full response appears
  return response.content[0].text;
}
```

---

## The Solution

**Stream tokens as they're generated:**

### Backend - Streaming Service

```typescript
// server/lib/ai-service.ts
async *chatStream(sessionId: string, message: string) {
  const history = this.conversations.get(sessionId) || [];

  const stream = await this.anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4000,
    messages: [...history, { role: 'user', content: message }],
    stream: true,  // ✅ Enable streaming
  });

  let fullResponse = '';
  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta') {
      const text = chunk.delta.text;
      fullResponse += text;
      yield text;  // ✅ Yield token-by-token
    }
  }

  // Update conversation history
  history.push({ role: 'user', content: message });
  history.push({ role: 'assistant', content: fullResponse });
  this.conversations.set(sessionId, history.slice(-20));
}
```

### Backend - SSE Route

**Note**: Streaming responses use raw Express routes (not ts-rest) because SSE requires low-level response control.

```typescript
// server/routes/ai-stream.ts (Raw Express for streaming)
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { aiService } from '../lib/ai-service.js';

const router = Router();

router.get('/api/ai/chat/:sessionId/stream', authMiddleware(), async (req, res) => {
  const { sessionId } = req.params;
  const { message } = req.query;

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  for await (const chunk of aiService.chatStream(sessionId, message as string)) {
    res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
  }

  res.write(`data: [DONE]\n\n`);
  res.end();
});

export default router;

// server/index.ts - Mount alongside ts-rest routes
import aiStreamRouter from './routes/ai-stream.js';
app.use(aiStreamRouter);  // Raw Express for streaming
```

---

## Frontend - SSE Consumer

```typescript
// client/src/components/ChatInterface.tsx
const sendStreamingMessage = async (text: string) => {
  setIsStreaming(true);

  // Add user message
  setMessages(prev => [...prev, { role: 'user', content: text }]);

  // Add empty assistant message
  const assistantMsgIndex = messages.length + 1;
  setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

  // Connect to SSE stream
  const eventSource = new EventSource(
    `/api/ai/chat/${sessionId}/stream?message=${encodeURIComponent(text)}`
  );

  let fullResponse = '';

  eventSource.onmessage = (event) => {
    if (event.data === '[DONE]') {
      eventSource.close();
      setIsStreaming(false);
      return;
    }

    const { chunk } = JSON.parse(event.data);
    fullResponse += chunk;

    // Update assistant message with accumulated text
    setMessages(prev => {
      const updated = [...prev];
      updated[assistantMsgIndex] = {
        role: 'assistant',
        content: fullResponse
      };
      return updated;
    });
  };

  eventSource.onerror = () => {
    eventSource.close();
    setIsStreaming(false);
  };
};
```

---

## Alternative: WebSocket Streaming

```typescript
// server/index.ts
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    const { sessionId, text } = JSON.parse(message);

    for await (const chunk of aiService.chatStream(sessionId, text)) {
      ws.send(JSON.stringify({ type: 'chunk', chunk }));
    }

    ws.send(JSON.stringify({ type: 'done' }));
  });
});

// client/src/hooks/useAIChat.ts
const ws = new WebSocket('ws://localhost:8080');

ws.onmessage = (event) => {
  const { type, chunk } = JSON.parse(event.data);

  if (type === 'chunk') {
    setCurrentResponse(prev => prev + chunk);
  } else if (type === 'done') {
    finalizeMessage();
  }
};

ws.send(JSON.stringify({ sessionId, text: input }));
```

---

## UX Enhancements

```typescript
// Show typing indicator
<div className="flex items-center gap-2">
  <Loader2 className="h-4 w-4 animate-spin" />
  <span className="text-sm text-muted-foreground">Claude is typing...</span>
</div>

// Smooth scroll as tokens arrive
useEffect(() => {
  scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [currentResponse]);

// Cancel streaming
const cancelStream = () => {
  eventSource.close();
  setIsStreaming(false);
};
```

---

## Why This Matters

Streaming improves perceived performance. Users see progress immediately instead of waiting. Essential for long-form content generation and natural chat UX.
