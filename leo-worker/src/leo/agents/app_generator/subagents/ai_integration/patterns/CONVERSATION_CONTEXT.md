# AI Integration: Multi-Turn Conversation Context

**Purpose:** Maintain context across multiple turns for natural conversations

---

## The Problem

Single-turn requests lose context, making conversations feel robotic.

```typescript
// ❌ WRONG: No context preservation
async chat(message: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    messages: [{ role: 'user', content: message }],  // No history!
  });
  return response.content[0].text;
}

// User: "Tell me about cats"
// AI: "Cats are domesticated animals..."
// User: "What about their diet?"
// AI: "Whose diet are you asking about?"  ← Lost context!
```

---

## The Solution

**Maintain conversation history per session:**

```typescript
export class AIService {
  private conversations: Map<string, Array<{role: string, content: string}>> = new Map();

  async chat(sessionId: string, message: string): Promise<string> {
    // Get conversation history
    const history = this.conversations.get(sessionId) || [];

    // Add user message
    history.push({ role: 'user', content: message });

    // Send with full context
    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4000,
      messages: history,  // ✅ Full conversation history
      system: 'You are a helpful assistant.',
    });

    const reply = response.content[0].text;

    // Add assistant response
    history.push({ role: 'assistant', content: reply });

    // Keep last 20 messages (prevent token limit)
    this.conversations.set(sessionId, history.slice(-20));

    return reply;
  }

  // Session management
  clearSession(sessionId: string) {
    this.conversations.delete(sessionId);
  }

  exportSession(sessionId: string) {
    return this.conversations.get(sessionId) || [];
  }

  importSession(sessionId: string, history: Array<{role: string, content: string}>) {
    this.conversations.set(sessionId, history);
  }
}
```

---

## Session Storage Options

### In-Memory (Development)
```typescript
private conversations: Map<string, Message[]> = new Map();
```
**Pros:** Fast, simple
**Cons:** Lost on server restart

### Database (Production)
```typescript
async chat(sessionId: string, message: string) {
  // Load history from database
  const history = await db.select().from(conversations)
    .where(eq(conversations.sessionId, sessionId));

  // ... process message ...

  // Save new messages
  await db.insert(conversations).values([
    { sessionId, role: 'user', content: message },
    { sessionId, role: 'assistant', content: reply }
  ]);
}
```
**Pros:** Persistent, scalable
**Cons:** Slower, requires database

---

## History Limits

**Keep last N messages to prevent token limits:**

```typescript
// Keep last 20 messages (10 turns)
history.slice(-20)

// Or token-based limit
function trimHistory(history: Message[], maxTokens: number) {
  let tokens = 0;
  const trimmed = [];

  for (let i = history.length - 1; i >= 0; i--) {
    const msgTokens = estimateTokens(history[i].content);
    if (tokens + msgTokens > maxTokens) break;
    trimmed.unshift(history[i]);
    tokens += msgTokens;
  }

  return trimmed;
}
```

---

## Frontend Integration

```typescript
// client/src/components/ChatInterface.tsx
const [messages, setMessages] = useState<Message[]>([]);

const sendMessage = async (text: string) => {
  // Add user message to UI
  setMessages(prev => [...prev, { role: 'user', content: text }]);

  // Call API with session ID
  const response = await fetch(`/api/ai/chat/${sessionId}`, {
    method: 'POST',
    body: JSON.stringify({ message: text }),
  });

  const { reply } = await response.json();

  // Add AI response to UI
  setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
};
```

---

## Why This Matters

Multi-turn context creates natural conversations. Users can ask follow-up questions without repeating context. Essential for chat interfaces, assistants, and tutoring apps.
