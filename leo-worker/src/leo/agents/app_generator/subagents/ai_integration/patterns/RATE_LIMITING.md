# AI Integration: Rate Limiting & Cost Control

**Purpose:** Prevent cost overruns and quota exhaustion

---

## The Problem

Uncontrolled AI usage leads to unexpected costs.

```typescript
// ❌ WRONG: No limits - users can spam requests
// server/routes/ai.routes.ts (ts-rest handler)
chat: {
  handler: async ({ params, body }) => {
    const { message } = body;
    const reply = await aiService.chat(params.sessionId, message);
    return { status: 200 as const, body: { reply } };
  }
}

// User sends 1000 requests → $50 bill
// Malicious user spams API → account suspended
```

---

## The Solution

**Implement multi-layer rate limiting:**

### Pattern 1: Per-User Rate Limit

```typescript
// server/middleware/rate-limit.ts
import rateLimit from 'express-rate-limit';

export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many AI requests. Please try again in a minute.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip, // Rate limit by user ID
});

// Apply to routes (ts-rest handler)
// server/routes/ai.routes.ts
export const aiRouter = s.router(contract.ai, {
  chat: {
    middleware: [authMiddleware(), aiRateLimiter],
    handler: async ({ params, body, req }) => {
      const { message } = body;
      const reply = await aiService.chat(params.sessionId, message);
      return { status: 200 as const, body: { reply } };
    }
  }
});
```

---

## Pattern 2: Token-Based Quota

```typescript
// server/lib/ai-quota.ts
export class AIQuota {
  private userQuotas: Map<string, {used: number, resetAt: Date}> = new Map();
  private dailyLimit = 1000000; // 1M tokens per day

  async checkQuota(userId: string, estimatedTokens: number): Promise<boolean> {
    const quota = this.userQuotas.get(userId);
    const now = new Date();

    // Reset if past midnight
    if (!quota || now > quota.resetAt) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      this.userQuotas.set(userId, {
        used: estimatedTokens,
        resetAt: tomorrow
      });
      return true;
    }

    // Check if under limit
    if (quota.used + estimatedTokens <= this.dailyLimit) {
      quota.used += estimatedTokens;
      return true;
    }

    return false; // Quota exceeded
  }

  getRemainingQuota(userId: string): number {
    const quota = this.userQuotas.get(userId);
    if (!quota) return this.dailyLimit;
    return this.dailyLimit - quota.used;
  }
}

// Usage in route (ts-rest handler)
const quota = new AIQuota();

export const aiRouter = s.router(contract.ai, {
  chat: {
    middleware: [authMiddleware()],
    handler: async ({ params, body, req }) => {
      const estimatedTokens = estimateTokens(body.message);

      if (!await quota.checkQuota(req.user.id, estimatedTokens)) {
        return {
          status: 429 as const,
          body: {
            error: 'Daily AI quota exceeded. Resets at midnight.',
            remaining: quota.getRemainingQuota(req.user.id)
          }
        };
      }

      const reply = await aiService.chat(params.sessionId, body.message);
      return { status: 200 as const, body: { reply } };
    }
  }
});
```

---

## Pattern 3: Cost Tracking

```typescript
// server/lib/ai-service.ts
export class AIService {
  private costPerToken = 0.003 / 1000; // $3 per million tokens (Claude Sonnet)

  async chat(sessionId: string, message: string): Promise<{reply: string, cost: number}> {
    const history = this.conversations.get(sessionId) || [];
    history.push({ role: 'user', content: message });

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4000,
      messages: history,
    });

    const reply = response.content[0].text;

    // Calculate cost
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const cost = (inputTokens + outputTokens) * this.costPerToken;

    // Store for billing
    await db.insert(aiUsage).values({
      userId: sessionId,
      inputTokens,
      outputTokens,
      cost,
      createdAt: new Date()
    });

    history.push({ role: 'assistant', content: reply });
    this.conversations.set(sessionId, history.slice(-20));

    return { reply, cost };
  }

  async getUserCosts(userId: string, startDate: Date, endDate: Date): Promise<number> {
    const usage = await db.select().from(aiUsage)
      .where(
        and(
          eq(aiUsage.userId, userId),
          gte(aiUsage.createdAt, startDate),
          lte(aiUsage.createdAt, endDate)
        )
      );

    return usage.reduce((sum, record) => sum + record.cost, 0);
  }
}
```

---

## Pattern 4: Request Queueing

```typescript
// server/lib/ai-queue.ts
export class AIQueue {
  private queue: Array<{request: any, resolve: any, reject: any}> = [];
  private processing = 0;
  private maxConcurrent = 5; // Process max 5 requests at once

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject });
      this.process();
    });
  }

  private async process() {
    if (this.processing >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.processing++;
    const { request, resolve, reject } = this.queue.shift()!;

    try {
      const result = await request();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.processing--;
      this.process(); // Process next in queue
    }
  }
}

const aiQueue = new AIQueue();

// Usage (ts-rest handler)
export const aiRouter = s.router(contract.ai, {
  chat: {
    middleware: [authMiddleware()],
    handler: async ({ params, body }) => {
      const reply = await aiQueue.add(() =>
        aiService.chat(params.sessionId, body.message)
      );
      return { status: 200 as const, body: { reply } };
    }
  }
});
```

---

## Frontend - Show Quota

```typescript
// client/src/components/QuotaIndicator.tsx
export function QuotaIndicator() {
  const { data: quota } = useQuery({
    queryKey: ['ai-quota'],
    queryFn: () => fetch('/api/ai/quota').then(r => r.json())
  });

  if (!quota) return null;

  const percentage = (quota.used / quota.limit) * 100;

  return (
    <div className="flex items-center gap-2">
      <Progress value={percentage} className="w-32" />
      <span className="text-sm text-muted-foreground">
        {quota.remaining.toLocaleString()} tokens remaining
      </span>
    </div>
  );
}
```

---

## Why This Matters

AI APIs are metered. Uncontrolled usage leads to unexpected costs, quota exhaustion, and potential account suspension. Rate limiting is essential for production.
