# AI Integration: Fallback Strategies

**Purpose:** Ensure reliability when AI API is unavailable or rate-limited

---

## The Problem

API failures break user experience.

```typescript
// ❌ WRONG: No fallback - app crashes
async chat(message: string) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    messages: [{ role: 'user', content: message }],
  });
  return response.content[0].text;
  // API down → throws error → app crashes
}
```

---

## The Solution

**Implement intelligent fallbacks:**

### Pattern 1: Template-Based Fallback

```typescript
async chat(sessionId: string, message: string): Promise<string> {
  try {
    const history = this.conversations.get(sessionId) || [];
    history.push({ role: 'user', content: message });

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4000,
      messages: history,
    });

    const reply = response.content[0].text;
    history.push({ role: 'assistant', content: reply });
    this.conversations.set(sessionId, history.slice(-20));

    return reply;

  } catch (error) {
    console.error('AI Chat Error:', error);
    return this.getFallbackResponse(message);  // ✅ Fallback
  }
}

private getFallbackResponse(message: string): string {
  const lowercaseMsg = message.toLowerCase();

  // Keyword-based responses
  if (lowercaseMsg.includes('help')) {
    return 'I can help you with various tasks. What would you like to know?';
  }
  if (lowercaseMsg.includes('how')) {
    return 'Let me explain the process step by step...';
  }
  if (lowercaseMsg.includes('what')) {
    return 'That\'s a great question. Let me provide some information...';
  }

  // Generic fallback
  return 'I understand your request. The AI service is temporarily limited, but I can provide basic assistance. Please try again in a moment.';
}
```

---

## Pattern 2: Rate Limiting with Queue

```typescript
export class AIService {
  private requestQueue: Array<{message: string, resolve: (value: string) => void}> = [];
  private isProcessing = false;
  private lastRequestTime = 0;
  private minRequestInterval = 1000; // 1 second between requests

  async chat(sessionId: string, message: string): Promise<string> {
    // Check rate limit
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minRequestInterval) {
      // Add to queue
      return new Promise((resolve) => {
        this.requestQueue.push({ message, resolve });
        this.processQueue();
      });
    }

    this.lastRequestTime = now;
    return this.executeChat(sessionId, message);
  }

  private async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) return;

    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      const { message, resolve } = this.requestQueue.shift()!;

      await this.sleep(this.minRequestInterval);

      const reply = await this.executeChat('queue', message);
      resolve(reply);
    }

    this.isProcessing = false;
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

---

## Pattern 3: Retry with Exponential Backoff

```typescript
async chatWithRetry(sessionId: string, message: string, maxRetries = 3): Promise<string> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await this.chat(sessionId, message);
    } catch (error: any) {
      // Don't retry on auth errors
      if (error.status === 401 || error.status === 403) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s
      const backoffMs = Math.pow(2, attempt) * 1000;

      if (attempt < maxRetries - 1) {
        console.log(`Retry ${attempt + 1}/${maxRetries} after ${backoffMs}ms`);
        await this.sleep(backoffMs);
      } else {
        // Final retry failed - use fallback
        return this.getFallbackResponse(message);
      }
    }
  }

  return this.getFallbackResponse(message);
}
```

---

## Pattern 4: Cache Common Responses

```typescript
export class AIService {
  private responseCache: Map<string, {response: string, timestamp: number}> = new Map();
  private cacheMaxAge = 60 * 60 * 1000; // 1 hour

  async chat(sessionId: string, message: string): Promise<string> {
    // Check cache for common questions
    const cached = this.responseCache.get(message.toLowerCase());
    if (cached && Date.now() - cached.timestamp < this.cacheMaxAge) {
      return cached.response;
    }

    try {
      const reply = await this.executeChat(sessionId, message);

      // Cache response for common questions
      if (message.length < 100) {
        this.responseCache.set(message.toLowerCase(), {
          response: reply,
          timestamp: Date.now()
        });
      }

      return reply;

    } catch (error) {
      return this.getFallbackResponse(message);
    }
  }
}
```

---

## Frontend Error Handling

```typescript
// client/src/components/ChatInterface.tsx
const sendMessage = async () => {
  try {
    const response = await fetch(`/api/ai/chat/${sessionId}`, {
      method: 'POST',
      body: JSON.stringify({ message: input }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const { reply } = await response.json();
    setMessages(prev => [...prev, { role: 'assistant', content: reply }]);

  } catch (error) {
    // Show fallback message
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: 'I\'m experiencing temporary connectivity issues. Please try again in a moment.',
      isError: true
    }]);

    toast({
      title: 'Connection Error',
      description: 'Unable to reach AI service. Using fallback response.',
      variant: 'destructive'
    });
  }
};
```

---

## Why This Matters

API outages happen. Rate limits exist. Fallbacks ensure users can still interact with your app even when AI is unavailable. Critical for production reliability.
