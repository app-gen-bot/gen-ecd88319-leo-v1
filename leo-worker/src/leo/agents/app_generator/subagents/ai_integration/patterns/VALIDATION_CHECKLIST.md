# AI Integration: Pre-Completion Validation Checklist

**STOP: Before marking ANY AI integration task complete**

Run through this checklist for ALL AI features.

---

## Multi-Turn Conversation Context

**Manual check:**
- [ ] Conversation history stored per session
- [ ] History passed to API with each request
- [ ] History limited (last 20 messages or token limit)
- [ ] Session management endpoints (clear, export, import)
- [ ] Context preserved across page refreshes (if needed)

---

## Streaming Responses

**Manual check:**
- [ ] Streaming endpoint using SSE or WebSocket
- [ ] Frontend consumes stream token-by-token
- [ ] UI updates in real-time as tokens arrive
- [ ] Full response saved to history after stream completes
- [ ] Streaming can be cancelled by user

---

## Fallback Strategies

**Manual check:**
- [ ] Try-catch wraps all AI API calls
- [ ] Fallback response function for common questions
- [ ] Retry logic with exponential backoff
- [ ] Error messages shown to user
- [ ] App continues working when AI unavailable

---

## Rate Limiting & Cost Control

```bash
# Check for rate limiting middleware
grep -r "rateLimit\|aiRateLimiter" server/routes/
# Expected: Rate limiter applied to AI routes

# Check for quota tracking
grep -r "quota\|checkQuota" server/lib/
# Expected: Quota system implemented
```

**Manual check:**
- [ ] Per-user rate limiting (requests/minute)
- [ ] Token-based quota system (daily/monthly limits)
- [ ] Cost tracking in database
- [ ] Quota indicator shown in UI
- [ ] Request queueing for concurrent requests
- [ ] 429 status code returned when limit exceeded

---

## Chat UI Patterns

**Manual check:**
- [ ] Messages displayed with user/assistant roles
- [ ] Auto-scroll to bottom on new messages
- [ ] Loading state (typing indicator or spinner)
- [ ] Error state with helpful message
- [ ] Empty state with call-to-action
- [ ] Clear chat button
- [ ] Timestamps on messages
- [ ] Enter key sends message
- [ ] Disabled input while loading

---

## API Security

```bash
# Check auth middleware on AI routes
grep -r "authMiddleware()" server/routes/ai.ts
# Expected: All AI routes protected

# Check for API key security
grep -r "ANTHROPIC_API_KEY" server/
# Expected: Only in .env and ai-service.ts
```

**Manual check:**
- [ ] AI routes protected with authMiddleware()
- [ ] API keys in environment variables (not committed)
- [ ] User ID from req.user (not client-provided)
- [ ] Session IDs validated
- [ ] Input sanitized and validated

---

## Error Handling

```bash
# Check for try-catch blocks
grep -c "try {" server/lib/ai-service.ts
# Expected: At least 3 (chat, stream, generate methods)

# Check error responses
grep -r "catch (error)" server/lib/ai-service.ts
# Expected: Error handling in all methods
```

**Manual check:**
- [ ] Try-catch in all AI service methods
- [ ] Errors logged with console.error
- [ ] Errors don't expose sensitive info to client
- [ ] Frontend shows user-friendly error messages
- [ ] API errors return proper status codes

---

## Cost Optimization

**Manual check:**
- [ ] Conversation history limited (prevents token bloat)
- [ ] Rate limiting prevents abuse
- [ ] Caching for common questions
- [ ] Streaming stops on user cancel
- [ ] Usage tracking for billing

---

## Completeness

**Re-read all AI integration files from top to bottom.**

Ask yourself:
1. Can users have multi-turn conversations?
2. Are responses streamed for better UX?
3. Does the app work when AI is unavailable?
4. Are costs controlled with rate limits and quotas?
5. Is the chat UI polished and professional?

If ANY checkbox is unchecked, FIX IT NOW before marking complete.

---

## If ANY Check Fails

**DO NOT proceed with task completion.**

1. STOP immediately
2. Fix the failing check
3. Re-run validation
4. Only mark complete when ALL checks pass

---

## These Patterns Prevent

- ✅ Lost context between messages
- ✅ Poor UX from waiting for long responses
- ✅ App crashes when AI API is down
- ✅ Unexpected $1000 bills from abuse
- ✅ Unprofessional chat interfaces

---

**Remember**: AI features are expensive and require careful implementation. Production reliability depends on fallbacks, rate limits, and proper error handling.
