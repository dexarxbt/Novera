# Novera: Product Requirements Specification

## Product Vision

**Novera** is a production-quality adaptive AI tutor for students that learns and remembers how each student learns.

**Core Product Principle:**
> Novera learns the student, not the subject.

**Tagline:**
> An AI tutor that remembers how you learn.

**Secondary:** Learn. Remember. Improve.

## Key Requirements

### 1. Universal Student Support

- Support essentially any student at any level
- Support any academic subject (math, physics, biology, CS, languages, etc.)
- Do not hardcode around one subject
- Dynamically understand student context

### 2. Persistent Memory (MemWal + Walrus Mainnet)

- Build a meaningful long-term learning profile per student
- Use Walrus Memory (MemWal) for actual persistence
- Write to Walrus Mainnet in production
- Implement memory isolation: Student A cannot access Student B's memory
- Support cross-subject learning preferences

### 3. Memory Policy

Memory must be:
- **Durable**: Useful for months, not temporary context
- **Quality**: Only remember what helps future tutoring
- **Safe**: No unnecessary personal data
- **Isolated**: Each student has their own namespace

Good memories:
- Learning goals
- Learning preferences
- Recurring weaknesses
- Misconceptions
- Demonstrated misconceptions
- Preferred explanation style
- Subject-specific learning difficulties

Bad memories:
- Greetings / casual conversation
- Every question and answer
- Raw transcripts
- Arbitrary facts

### 4. Adaptive Tutoring

Novera must:
- Explain clearly and adapt difficulty
- Use examples (when preferred)
- Ask useful follow-up questions
- Identify confusion and misconceptions
- Correct mistakes constructively
- Remember durable learning context
- Use relevant memories naturally
- Distinguish uncertainty from certainty

### 5. Telegram Interface

Primary deployment platform: **Telegram Bot**

Commands:
- `/start` - Onboarding
- `/help` - Show help
- `/quiz` - Take a quiz (adaptive)
- `/progress` - View progress
- `/memory` - See learned profile
- `/study` - Get personalized recommendation
- `/reset` - Start fresh (with clear terms)

UX:
- Normal conversation is primary interface
- Students should not need commands for tutoring
- Clean formatting and message chunking
- Friendly error states

### 6. Gemini Integration

- Use official Google GenAI JavaScript/TypeScript SDK
- Responsibility:
  - Tutoring and explanations
  - Quiz generation
  - Quiz grading
  - Misconception detection
  - Study planning
  - Progress summaries
  - Adaptive recommendations
- Use structured outputs
- Validate with Zod
- Do not trust raw model JSON

### 7. Quiz Engine

Adaptive quiz system that considers:
- Current subject and topic
- Learning goals
- Known weaknesses
- Misconceptions
- Previous quiz performance
- Desired difficulty

Flow:
```
student → learning context → generate question → student answers 
→ grade → detect misconception/weakness → update memory
```

### 8. Progress Tracking

- `/progress` shows concise progress
- `/study` provides personalized recommendations
- Do not invent numerical scores without defensible basis
- Avoid fake precision

### 9. Website (Premium Marketing)

- Static site deployed separately
- Premium dark startup aesthetic
- Hero, problem, memory, how-it-works, before/after, subjects, Walrus, CTA, footer
- Premium typography and subtle motion
- Mobile responsive (360px–1440px)
- Accessibility compliant
- SEO ready

### 10. Security & Privacy

- Do not collect unnecessary data
- No secrets in logs
- Redact API keys, tokens, private keys
- Memory isolation per student
- Basic privacy explanation on website

### 11. Observability

- Structured logging
- Health endpoint `/health`
- Ready endpoint `/ready` (optional)
- Request IDs where useful
- No sensitive data in logs

### 12. Error Handling

Handle:
- Gemini timeout
- Gemini rate limit
- Telegram failure
- MemWal failure
- Network timeout
- Duplicate updates
- Oversized messages

Use retries with backoff, timeouts, graceful fallback.

### 13. Testing

Mandatory tests:
- Cross-session memory recall
- Misconception detection
- User isolation
- Irrelevant memory filtering
- Memory conflict resolution
- Persistence failure gracefully
- Duplicate update idempotency

Real-world testing:
- 3+ different students
- Several days of use
- At least 10 legitimate memories per user
- Captured evidence (anonymized)

### 14. Real-World Verification

Before submission:
- Real MemWal account
- Real Mainnet writes
- Explorer evidence
- Production relayer used
- Account/object IDs documented

---

## Definition of Success

A real student can:

1. Open Telegram
2. Talk to Novera
3. Get tutored
4. Make a mistake
5. Novera identifies useful learning context
6. MemWal persists it
7. Student returns later
8. Novera recalls it
9. Novera teaches differently
10. Student sees meaningful progress

**AND:**

- Website is premium-looking
- GitHub repo is clean
- Tests pass
- Production deployment works
- Walrus Mainnet evidence exists
- 3+ real users have used it
- Required memories exist legitimately
- Submission article explains the real build
- Demo proves the central experience

---

## Non-Goals

- Do NOT build vector databases unless genuinely needed
- Do NOT add a second AI provider
- Do NOT create unnecessary microservices
- Do NOT hardcode around one subject
- Do NOT fake deployments or credentials
- Do NOT fabricate user evidence
