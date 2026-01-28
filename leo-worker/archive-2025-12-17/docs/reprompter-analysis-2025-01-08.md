# Reprompter Agent: Context Management & Strategic Thinking Analysis

**Date**: January 8, 2025
**Status**: Exploration & Recommendations (No Implementation)
**Goal**: Improve context efficiency and strategic decision-making

---

## Executive Summary

The Reprompter Agent effectively generates next-task prompts but suffers from **unbounded context growth** and **tactical thinking** that lacks the strategic oversight of an Architect/CTO. As iterations accumulate, context balloons from changelog files, task history, and plan files—leading to inefficiency and potential context window issues.

### Key Findings

1. **Context grows linearly with iterations** (no summarization or pruning)
2. **Task history stores full prompts** (2000+ chars each) instead of summaries
3. **Strategic context is missing** - focuses on "what's next" not "are we building the right thing"
4. **No architectural memory** - can't track high-level decisions or technical debt
5. **Changelog reading is inefficient** - reads 1000+ lines when 50 might suffice

---

## Current Architecture Analysis

### Context Gathering Flow

```
ContextGatherer.gather_context()
    ↓
├─ Latest Changelog: FULL file (summary-001.md: 1111 lines = ~5.5K tokens)
├─ Older Changelogs: Last 200 lines each × 2 files = ~1K tokens
├─ Plan Files: First 200 lines each × 5 files = ~5K tokens
├─ Error Logs: Last 100 lines = ~500 tokens
├─ Git Status: ~200 tokens
└─ Task History: Last 5 tasks × ~2K chars each = ~10K tokens
    ↓
Total Context: ~22K tokens per iteration (and growing!)
```

### Problem 1: Unbounded Task History

**Current Implementation** (`agent.py:175-209`):

```python
def record_task(self, task: str, success: bool):
    session["reprompter_context"]["task_history"].append({
        "task": task,  # ← Full 2000+ character prompt stored!
        "success": success,
        "timestamp": datetime.now().isoformat()
    })
```

**Real Example** (from `apps/dadcoin/app/.agent_session.json`):

```json
{
  "task": "Looking at the current state, DADCOIN has achieved a remarkable milestone with all five smart contracts successfully deployed to Base Sepolia testnet and comprehensive end-to-end testing showing 35/35 tests passed. The git status shows only minor uncommitted changes to session tracking and the contracts submodule, representing the final touches of the Base Sepolia integration work. This is the perfect moment to commit this milestone and conduct the most critical validation yet—a final comprehensive quality assurance review that proves DADCOIN is genuinely production-ready with flawless Web3 functionality... [2000+ more characters]",
  "success": true
}
```

**Impact**: After 50 iterations, task history alone consumes **~100K tokens** (50 tasks × 2K chars each).

### Problem 2: Changelog Explosion

**Current Strategy** (`context_gatherer.py:39-121`):

- **Latest file**: Read ENTIRE file (no limit)
- **Older files**: Last 200 lines each
- **Fallback**: 1000 lines for verbose changelogs

**Example**:
```
summary-001.md: 1111 lines (full)     = ~5,500 tokens
summary-002.md: last 200 lines        = ~1,000 tokens
summary-003.md: last 200 lines        = ~1,000 tokens
                                Total = ~7,500 tokens
```

**Question**: Do we need 1111 lines from the latest changelog? Probably not!

### Problem 3: No Strategic Memory Layer

**Current Prompt Focus** (`prompts.py:5-152`):

The system prompt focuses on **tactical execution**:
- ✅ What was just done (changelog)
- ✅ What's planned (plan files)
- ✅ What's broken (error logs)
- ❌ **MISSING**: Why are we building this?
- ❌ **MISSING**: What's our technical architecture?
- ❌ **MISSING**: What trade-offs have we made?
- ❌ **MISSING**: What's our strategic roadmap?

**Architect/CTO would ask**:
- "Are we building the right features?"
- "Is this the best technical approach?"
- "Are we accumulating technical debt?"
- "Should we refactor before adding more features?"
- "Does this align with our 3-month roadmap?"

### Problem 4: Lack of Context Summarization

**No progressive summarization**:
- Session 1-10: Keep full context
- Session 11-20: Summarize 1-10, keep 11-20 full
- Session 21-30: Summarize 11-20, keep 21-30 full
- etc.

**Result**: Context grows forever instead of stabilizing.

---

## Recommended Solutions

### Solution 1: Hierarchical Context with Summarization

#### A. Multi-Tier Task History

Replace flat task list with hierarchical summaries:

```python
{
  "reprompter_context": {
    # Current session (keep full detail)
    "current_session": {
      "session_id": "abc123",
      "started_at": "2025-01-08T10:00:00",
      "tasks": [
        {
          "task_summary": "Fixed /api/children endpoint error",
          "full_task": "...",  # Keep for last 5 tasks
          "outcome": "success",
          "key_changes": ["Added error handling", "Fixed SQL query"],
          "timestamp": "..."
        }
      ]
    },

    # Previous sessions (summarized)
    "session_summaries": [
      {
        "session_id": "xyz789",
        "date_range": "2025-01-07",
        "iteration_count": 8,
        "summary": "Implemented blockchain integration with Base Sepolia. Deployed 5 contracts. Added wallet creation flow. 35/35 tests passing.",
        "key_decisions": [
          "Used Coinbase CDP for custodial wallets",
          "Implemented DAD token minting on-chain",
          "Added DEED time-lock mechanism"
        ],
        "technical_debt": [
          "Gas optimization needed for store redemptions",
          "Need mainnet deployment plan"
        ]
      }
    ],

    # Strategic context (architect-level)
    "strategic_context": {
      "app_vision": "Family rewards economy teaching kids financial literacy via blockchain",
      "tech_stack_decisions": {
        "blockchain": "Base (Ethereum L2) - low gas costs",
        "wallet": "Coinbase CDP - custodial for simplicity",
        "tokens": "DAD (ERC-20), DEED (NFT with time-lock)"
      },
      "roadmap_phases": [
        "Phase 1: Testnet MVP (DONE)",
        "Phase 2: Security audit (NEXT)",
        "Phase 3: Mainnet deployment",
        "Phase 4: User onboarding"
      ],
      "architectural_principles": [
        "Parents see blockchain, kids see abstracted UX",
        "All smart contracts on-chain, not centralized",
        "Dark mode first, vibrant brand colors"
      ]
    }
  }
}
```

**Benefits**:
- Recent tasks: Full detail (last 5 tasks)
- Older tasks: Summarized by session (~100 chars vs 2000 chars = 95% reduction)
- Strategic context: Persistent architectural memory
- **Context size**: Stabilizes at ~5K tokens instead of growing to 100K+

#### B. Smart Changelog Reading

Instead of reading 1111 lines, use intelligent extraction:

```python
def _extract_changelog_highlights(self, changelog_content: str) -> str:
    """
    Use LLM to extract key highlights from verbose changelog.

    Input: 1111 lines (~5.5K tokens)
    Output: 50 lines (~250 tokens) = 95% reduction
    """
    extraction_prompt = f"""
Extract the most important highlights from this changelog:

{changelog_content}

Provide a concise summary (max 50 lines) covering:
1. Major features completed
2. Critical bugs fixed
3. Architecture decisions made
4. Explicit next steps mentioned
5. Unresolved blockers

Focus on outcomes and decisions, not implementation details.
"""

    # Use fast model (Haiku) for extraction
    result = haiku_agent.run(extraction_prompt)
    return result.content
```

**Before**: 1111 lines = ~5,500 tokens
**After**: 50 lines = ~250 tokens
**Savings**: 95% (22x reduction)

**Trade-off**: One extra LLM call (Haiku is cheap and fast)

---

### Solution 2: Architect/CTO Strategic Layer

Add a **Strategic Advisor** component that maintains high-level context:

```python
class StrategicAdvisor:
    """
    Maintains architectural memory and strategic oversight.

    Think like a combination of:
    - Architect: Technical decisions, trade-offs, debt
    - CTO: Roadmap alignment, priority setting, resource allocation
    """

    def __init__(self, app_path: str):
        self.app_path = app_path
        self.strategic_context = self._load_strategic_context()

    def _load_strategic_context(self) -> dict:
        """
        Load high-level strategic context from:
        1. plan/plan.md - original vision
        2. specs/architecture.md - tech decisions
        3. .strategic_memory.json - accumulated decisions
        """
        pass

    def evaluate_next_task(
        self,
        proposed_task: str,
        recent_work: str
    ) -> dict:
        """
        Evaluate proposed task against strategic context.

        Returns:
            {
                "alignment_score": 0.0-1.0,
                "recommendation": "proceed|modify|defer",
                "strategic_guidance": "Consider X before Y...",
                "technical_debt_warning": "This increases debt in area Z",
                "alternative_approach": "Instead of A, consider B because..."
            }
        """
        evaluation_prompt = f"""
You are a CTO/Architect evaluating the next development task.

## APP VISION & ROADMAP
{self.strategic_context['vision']}
{self.strategic_context['roadmap']}

## TECHNICAL ARCHITECTURE
{self.strategic_context['architecture']}

## RECENT WORK (Last session)
{recent_work}

## PROPOSED NEXT TASK
{proposed_task}

## YOUR EVALUATION

Evaluate this proposed task:

1. **Strategic Alignment** (0.0-1.0): Does this move us toward our roadmap goals?
2. **Technical Soundness**: Is this the right technical approach?
3. **Timing**: Is this the right time, or should we do something else first?
4. **Technical Debt**: Does this add debt or pay it down?
5. **Alternative Approaches**: Are there better ways to achieve this?

Output your evaluation as:
- ALIGNMENT_SCORE: 0.85
- RECOMMENDATION: proceed|modify|defer
- GUIDANCE: [2-3 sentence strategic guidance]
- DEBT_WARNING: [if applicable]
- ALTERNATIVE: [if applicable]
"""

        result = strategic_agent.run(evaluation_prompt)
        return self._parse_evaluation(result.content)

    def update_strategic_memory(self, completed_task: str, outcomes: dict):
        """
        Update strategic context after task completion.

        Tracks:
        - Architectural decisions made
        - Technical debt incurred/paid
        - Roadmap progress
        - Lessons learned
        """
        pass
```

**Integration with Reprompter**:

```python
async def get_next_prompt(self) -> str:
    # 1. Gather lightweight context (with summarization)
    context = self.context_gatherer.gather_context(self.app_path)

    # 2. Generate tactical prompt (current behavior)
    tactical_prompt = await self._generate_tactical_prompt(context)

    # 3. Get strategic evaluation
    evaluation = self.strategic_advisor.evaluate_next_task(
        proposed_task=tactical_prompt,
        recent_work=context['latest_changelog']
    )

    # 4. Modify prompt based on strategic guidance
    if evaluation['alignment_score'] < 0.7:
        # Strategic misalignment - provide guidance
        strategic_guidance = f"""
STRATEGIC GUIDANCE FROM ARCHITECT/CTO:

{evaluation['strategic_guidance']}

Original tactical suggestion was: {tactical_prompt}

However, consider: {evaluation['alternative_approach']}

{evaluation['debt_warning'] if evaluation['debt_warning'] else ''}

Adjust your approach to better align with our roadmap and architecture.
"""
        return strategic_guidance
    else:
        # Good alignment - proceed with tactical prompt
        return tactical_prompt
```

**Benefits**:
- ✅ **Long-term memory** of architectural decisions
- ✅ **Strategic alignment** checking (not just "what's next")
- ✅ **Technical debt tracking** (architect mindset)
- ✅ **Roadmap awareness** (CTO mindset)
- ✅ **Alternative approaches** (better solutions)

---

### Solution 3: Context Budget & Compression

Implement hard limits with intelligent compression:

```python
CONTEXT_BUDGET = {
    "total_max_tokens": 10_000,  # Hard limit
    "allocation": {
        "strategic_context": 1_000,   # Architect/CTO memory
        "recent_changelog": 2_000,     # Latest work (compressed)
        "older_changelogs": 1_000,     # Summaries only
        "plan_preview": 1_500,         # Key sections
        "error_logs": 500,             # Critical errors only
        "git_status": 200,             # Diff stats
        "task_history": 2_500,         # Last 5 full + older summaries
        "buffer": 1_300,               # Reserve for growth
    }
}

class ContextManager:
    """
    Manages context budget and compression.
    """

    def compress_if_needed(self, context: dict) -> dict:
        """
        If context exceeds budget, compress intelligently:

        Priority order:
        1. Keep strategic context (NEVER compress)
        2. Keep recent changelog highlights
        3. Keep error logs if critical
        4. Compress older changelogs aggressively
        5. Compress plan files to headers only
        """
        total_tokens = self._estimate_tokens(context)

        if total_tokens <= CONTEXT_BUDGET['total_max_tokens']:
            return context  # Under budget, no compression

        # Compress older changelogs first
        context['older_changelogs'] = self._summarize_text(
            context['older_changelogs'],
            max_tokens=500  # Aggressive compression
        )

        # If still over, compress plan files
        if self._estimate_tokens(context) > CONTEXT_BUDGET['total_max_tokens']:
            context['plan_files'] = self._extract_headers_only(
                context['plan_files']
            )

        return context

    def _summarize_text(self, text: str, max_tokens: int) -> str:
        """Use fast LLM (Haiku) to summarize to target token count."""
        pass

    def _extract_headers_only(self, markdown: str) -> str:
        """Extract just H1, H2, H3 headers for quick reference."""
        pass
```

**Benefits**:
- ✅ **Predictable cost** - never exceeds 10K token budget
- ✅ **Graceful degradation** - compresses less important context first
- ✅ **Strategic context protected** - always kept at full fidelity
- ✅ **Scalable** - works for 100+ iterations without context explosion

---

### Solution 4: Concise & Powerful Prompts

Current prompts can be verbose. Apply compression:

#### Before (Verbose):
```
Looking at the current state, DADCOIN has achieved a remarkable milestone with
all five smart contracts successfully deployed to Base Sepolia testnet and
comprehensive end-to-end testing showing 35/35 tests passed. The git status
shows only minor uncommitted changes to session tracking and the contracts
submodule, representing the final touches of the Base Sepolia integration work.
This is the perfect moment to commit this milestone and conduct the most
critical validation yet—a final comprehensive quality assurance review...
[continues for 2000+ characters]
```

#### After (Concise & Powerful):
```
Base Sepolia contracts deployed (5/5). Tests passing (35/35). Commit session
changes, then delegate comprehensive QA to quality_assurer: test parent
onboarding → CDP wallet creation → quest approval → DAD minting → store
redemptions → DEED claiming. Verify zero console errors, smooth blockchain UX,
and production-ready polish. If issues found, delegate to error_fixer. Once
validated, delegate mainnet deployment plan to research (gas costs, audits,
timeline).
```

**Reduction**: 2000 chars → 400 chars (80% reduction) with SAME semantic content.

**Strategy**:
- Remove adjectives ("remarkable milestone", "perfect moment")
- Use shorthand ("5/5" instead of "all five")
- Use arrows for flows (→ instead of "followed by")
- Remove redundancy ("comprehensive" appears 3 times)
- Keep strategic intent and action items

**Prompt Enhancement Formula**:
```
[Current State: 1 sentence]
[Next Action: 2-3 sentences with delegation]
[Success Criteria: 1 sentence]
[Strategic Context: 1 sentence if needed]
```

---

## Implementation Roadmap

### Phase 1: Quick Wins (1-2 days)

1. **Task History Compression**
   - Limit full tasks to last 5 (currently unlimited)
   - Store only summary for older tasks (50 chars vs 2000 chars)
   - Add "key_changes" array instead of full prompt text

2. **Changelog Smart Limits**
   - Change latest file from "unlimited" to 300 lines max
   - Reduce older files from 200 to 100 lines
   - **Expected savings**: 70% reduction in changelog tokens

3. **Prompt Conciseness Instruction**
   - Add to system prompt: "Generate concise prompts (max 500 chars)"
   - Use bullet points → arrow notation for flows
   - Remove unnecessary adjectives

**Impact**: 60-70% context reduction with minimal code changes

---

### Phase 2: Strategic Layer (3-5 days)

1. **Strategic Context Schema**
   - Design `.strategic_memory.json` structure
   - Extract from plan.md on first run
   - Update after major decisions

2. **Strategic Advisor Component**
   - Implement StrategicAdvisor class
   - Add alignment scoring
   - Add architectural decision logging

3. **Integration with Reprompter**
   - Call strategic advisor before generating prompt
   - Inject strategic guidance when alignment is low
   - Track strategic context updates

**Impact**: Shift from tactical to strategic thinking (Architect/CTO mindset)

---

### Phase 3: Advanced Compression (5-7 days)

1. **LLM-Based Summarization**
   - Implement changelog highlight extraction (Haiku)
   - Add progressive session summarization
   - Smart plan file compression

2. **Context Budget Manager**
   - Hard token limits with allocation
   - Graceful degradation when over budget
   - Priority-based compression

3. **Performance Monitoring**
   - Log context sizes per iteration
   - Track summarization effectiveness
   - Alert if budget exceeded

**Impact**: Bounded context growth (10K token ceiling regardless of iterations)

---

## Alternative Approaches Considered

### Option A: RAG-Based Context Retrieval

Instead of reading all changelogs/plans, use semantic search:

```python
# Embed all changelog entries
embeddings = embed_changelog_entries(app_path)

# Query for relevant context
query = "What was done with blockchain integration?"
relevant_entries = vector_db.search(embeddings, query, top_k=5)
```

**Pros**: Only retrieve relevant context
**Cons**: Requires vector DB, more complex, might miss important context
**Verdict**: Overkill for current scale, revisit if apps reach 1000+ iterations

---

### Option B: Separate Strategic Agent

Run strategic advisor as a completely separate agent:

```
Main Agent ← Reprompter ← Strategic Advisor (separate agent)
```

**Pros**: Complete separation of concerns
**Cons**: Extra orchestration, potential consistency issues
**Verdict**: Keep strategic advisor as a component for now, not separate agent

---

### Option C: User-Defined Strategic Context

Let user explicitly define strategic priorities:

```json
{
  "strategic_priorities": {
    "current_phase": "mvp",
    "focus_areas": ["core features", "stability"],
    "avoid": ["premature optimization", "edge cases"],
    "technical_principles": [
      "Ship fast, iterate based on feedback",
      "Mobile-first design"
    ]
  }
}
```

**Pros**: Explicit user control, clear alignment
**Cons**: Requires user input, might diverge from plan.md
**Verdict**: Interesting idea, maybe add as optional `.strategic_priorities.json`

---

## Metrics for Success

After implementing solutions, measure:

1. **Context Size Reduction**
   - Before: ~22K tokens per iteration (growing)
   - Target: ~8K tokens per iteration (stable)
   - **Goal**: 60%+ reduction

2. **Strategic Alignment**
   - Manual review: Do prompts align with roadmap?
   - User survey: "Is reprompter thinking strategically?" (1-10)
   - **Goal**: 8+ rating on strategic thinking

3. **Prompt Quality**
   - Average prompt length: Target 300-500 chars (currently 1500+ chars)
   - Semantic density: Same intent, fewer words
   - **Goal**: 70% reduction in verbosity

4. **Session Longevity**
   - How many iterations before context window issues?
   - Before: ~50 iterations (estimated)
   - Target: 200+ iterations (4x improvement)

---

## Risks & Mitigations

### Risk 1: Summarization Loses Critical Information

**Mitigation**:
- Keep last 5 tasks at full fidelity
- Store "key_changes" array for older tasks
- Strategic context never compressed
- Fallback to Read tool if full context needed

### Risk 2: LLM Summarization Costs

**Mitigation**:
- Use Haiku (cheapest, fastest) for summarization
- Cache summaries aggressively
- Only summarize when needed (>threshold)
- Cost: ~$0.01 per summarization (negligible)

### Risk 3: Strategic Advisor Overhead

**Mitigation**:
- Only evaluate on major decisions (not every iteration)
- Use fast model (Sonnet, not Opus)
- Skip evaluation if alignment score was high last time
- Estimated overhead: +2-3 seconds per iteration

---

## Conclusion

The Reprompter Agent is effective but needs **context management** and **strategic thinking** enhancements:

### Priority Improvements:

1. **Task History Summarization** (High Impact, Low Effort)
   - 95% token reduction for older tasks
   - Implement in 1 day

2. **Changelog Smart Limits** (High Impact, Low Effort)
   - 70% token reduction for changelogs
   - Implement in 1 day

3. **Strategic Advisor Layer** (High Impact, Medium Effort)
   - Architect/CTO mindset for decision-making
   - Implement in 3-5 days

4. **Context Budget Manager** (Medium Impact, Medium Effort)
   - Guaranteed bounded context growth
   - Implement in 5-7 days

### Expected Outcomes:

- ✅ **60-70% context reduction** (22K → 8K tokens)
- ✅ **Strategic alignment** (tactical → architect/CTO thinking)
- ✅ **Concise prompts** (2000 chars → 500 chars)
- ✅ **Scalable** (50 iterations → 200+ iterations)
- ✅ **Maintainable** architectural memory

### Next Steps:

1. **Review this analysis** with team
2. **Prioritize solutions** based on ROI
3. **Implement Phase 1** (quick wins) first
4. **Measure impact** and iterate
5. **Phase 2 & 3** based on results

---

**Document Version**: 1.0
**Last Updated**: January 8, 2025
**Author**: Architecture Review
**Status**: Awaiting Implementation Approval
