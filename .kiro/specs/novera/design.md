# Novera: Technical Design

## Architecture

```
                         NOVERA
                            │
                 ┌──────────┴──────────┐
                 │                     │
              WEBSITE              TELEGRAM
                 │                     │
                 │                     ▼
                 │              NOVERA BACKEND
                 │                     │
                 │          ┌──────────┼──────────┐
                 │          │          │          │
                 │       GEMINI     MEMWAL     PROFILE
                 │          │          │          │
                 │          │          ▼          │
                 │          │    WALRUS MAINNET  │
                 │          │                     │
                 └──────────┴─────────────────────┘
```

## Monorepo Structure

```
novera/
├── apps/
│   ├── bot/              # Telegram bot (Node.js + TypeScript)
│   └── web/              # Marketing website (React + Vite)
│
├── packages/
│   ├── core/             # Student profile logic
│   ├── memory/           # MemWal client + memory policy
│   ├── ai/               # Gemini integration
│   └── shared/           # Types, logger, validation
│
├── docs/                 # Documentation
├── evidence/             # Real-world testing results
├── tests/                # Integration tests
├── .kiro/                # Kiro specs and hooks
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
└── .gitignore
```

## Core Packages

### @novera/shared
- Runtime types (Zod schemas)
- Logger (structured, secret-redacting)
- Error types
- Utilities

### @novera/core
- StudentProfile interface
- Memory filtering and deduplication
- Learning preference extraction
- Weakness and misconception tracking

### @novera/memory
- MemWalClient (Walrus Memory persistence)
- Memory policy evaluation
- Memory candidate extraction
- Deduplication logic

### @novera/ai
- GeminiClient (official Google GenAI SDK)
- Tutor engine
- Quiz generation
- Quiz grading
- Structured output validation

## Backend Architecture (apps/bot)

```
Telegram Update
      ↓
Normalize message
      ↓
Identify student
      ↓
Determine intent
      ↓
Determine subject/topic
      ↓
Recall relevant memory
      ↓
Build learning context
      ↓
Gemini
      ↓
Validate response
      ↓
Send response
      ↓
Analyze interaction
      ↓
Memory candidate extraction
      ↓
Memory policy
      ↓
Deduplicate
      ↓
MemWal
```

## Memory System

### Namespace Strategy

```
novera:user:<telegram-user-id>:<memory-type>
```

Ensures:
- Student A cannot access Student B's memory
- Subject-specific memory when needed
- Global learning preferences available across subjects

### Memory Deduplication

Before writing:
```
candidate
   ↓
normalize
   ↓
search existing
   ↓
duplicate?
├── yes → skip/update
└── no  → remember
```

### Memory Recall

For each user message:
```
message
   ↓
understand intent
   ↓
identify subject/topic
   ↓
recall relevant memories
   ↓
filter/rank
   ↓
inject only useful context
   ↓
Gemini
```

## Student Profile

Subject-agnostic learning profile with typed memories:

```ts
type MemoryType =
  | "learning_goal"
  | "subject"
  | "topic"
  | "learning_preference"
  | "strength"
  | "weakness"
  | "misconception"
  | "repeated_mistake"
  | "study_habit"
  | "difficulty_preference"
  | "quiz_result"
  | "progress"
  | "topic_history"
```

Each memory contains:
- Type (enum)
- Content (string)
- Metadata (subject, topic, etc.)
- Timestamp
- Confidence (0–1)
- Source interaction

## Telegram Bot

**Framework:** grammY (modern TypeScript Telegram framework)

**Webhook or Polling:**
- Production: Webhook (HTTPS + secret token)
- Development: Polling

**Commands:**
- `/start` - Onboarding
- `/help` - Help
- `/quiz` - Adaptive quiz
- `/progress` - Progress view
- `/memory` - Memory view
- `/study` - Recommendations
- `/reset` - Start fresh

**Message Handling:**
- Natural conversation processing
- Intent detection
- Subject/topic extraction
- Memory-aware responses

## Gemini Integration

**SDK:** Official `google-generative-ai`

**Model:** `gemini-2.0-flash` (configurable)

**Responsibilities:**
1. Tutoring (explain, examples, follow-ups)
2. Quiz generation (subject, topic, difficulty, weakness-targeted)
3. Quiz grading (correctness, feedback, misconception detection)
4. Misconception detection (pattern analysis)
5. Study planning (recommendations)
6. Progress analysis

**Structured Outputs:**
- Use Gemini's structured output support
- Validate with Zod before use
- Never trust raw JSON

## MemWal / Walrus

**Integration:**
- MemWal TypeScript SDK (official)
- Walrus Mainnet for production
- Testnet for development

**Operations:**
1. **Remember (write)**
   - Serialize memory
   - Deduplicate
   - Write to Walrus
   - Return object ID

2. **Recall (read)**
   - Query by namespace
   - Return deserialized memories
   - Filter by relevance

3. **Health**
   - Verify connection
   - Test read/write capability

**Async Handling:**
- Memory persistence is async
- Do not claim success until verified
- Retry with backoff
- Handle timeouts gracefully

## Website (React + Vite)

**Tech Stack:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion

**Sections:**
1. Navigation (logo, links, CTA)
2. Hero (headline, subheading, CTA)
3. Problem (why memory matters)
4. Memory (what we remember)
5. How it works (5-step flow)
6. Before/after (comparison)
7. Any subject (subject examples)
8. Walrus (technology)
9. Final CTA
10. Footer

**Brand:**
- Dark premium aesthetic (#07070A)
- Electric blue accents (#18A8FF)
- Violet/purple highlights (#6C4DFF)
- Premium typography (Inter or similar)
- Subtle motion (Framer Motion)
- No horizontal overflow
- Mobile-first responsive

## Configuration

All secrets via environment variables:

```
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash
MEMWAL_PRIVATE_KEY=
MEMWAL_ACCOUNT_ID=
MEMWAL_SERVER_URL=
MEMWAL_NAMESPACE=novera
NODE_ENV=development
PORT=3000
LOG_LEVEL=info
PUBLIC_BOT_USERNAME=novera_bot
PUBLIC_DOMAIN=
```

Never hardcode credentials.

## Testing Strategy

### Unit Tests
- Memory policy evaluation
- Memory deduplication
- Namespace generation
- Prompt construction
- Quiz generation schema

### Integration Tests
- Message → tutor → memory flow
- Recall accuracy
- Isolation verification
- Duplicate handling

### Real-world Testing
- 3+ students, multiple subjects
- Several days of use
- 10+ legitimate memories per user
- Evidence collection

---

## Production Checklist

- [ ] TypeScript strict mode
- [ ] All tests passing
- [ ] Secrets via env vars
- [ ] Linting passes
- [ ] No console.log (use logger)
- [ ] Structured logging
- [ ] Error handling complete
- [ ] Health endpoint works
- [ ] Telegram webhook verified
- [ ] MemWal production account
- [ ] Gemini API working
- [ ] Website deployed
- [ ] README updated
- [ ] Evidence collected
