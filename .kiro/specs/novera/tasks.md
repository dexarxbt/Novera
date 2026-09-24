# Novera: Implementation Tasks

## Phase 1: Foundation

- [ ] Initialize pnpm monorepo
- [ ] Set up root `tsconfig.json` with path mapping
- [ ] Configure shared TypeScript configuration
- [ ] Build @novera/shared package
  - [ ] Define all Zod schemas
  - [ ] Build logger (secret-redacting)
  - [ ] Export types
  - [ ] Test compilation
- [ ] Verify workspace setup
  - [ ] pnpm install works
  - [ ] All packages resolve
  - [ ] TypeScript compiles

**Completion Criteria:**
- All packages compile without errors
- Shared types are available to all packages
- Logger is working

---

## Phase 2: Telegram Bot Setup

- [ ] Create @novera/bot application
- [ ] Implement config loading (.env)
- [ ] Create grammY bot instance
- [ ] Implement command routing:
  - [ ] `/start` command
  - [ ] `/help` command
  - [ ] `/quiz` placeholder
  - [ ] `/progress` placeholder
  - [ ] `/memory` placeholder
  - [ ] `/study` placeholder
  - [ ] `/reset` placeholder
- [ ] Implement message handling (generic responses)
- [ ] Set up health endpoint (`/health`)
- [ ] Test locally with polling
- [ ] Create startup logic

**Completion Criteria:**
- Bot starts without error
- Responds to `/start` with onboarding message
- Responds to `/help` with command list
- Health endpoint returns healthy status
- All commands can be called without crashing

---

## Phase 3: Gemini Integration

- [ ] Install official `google-generative-ai` SDK
- [ ] Create @novera/ai package with GeminiClient
- [ ] Implement `tutor()` method stub
  - [ ] Accepts TutorContext
  - [ ] Calls Gemini API
  - [ ] Validates with TutorResponseSchema
  - [ ] Returns TutorResponse
- [ ] Implement `generateQuestion()` stub
- [ ] Implement `gradeAnswer()` stub
- [ ] Add error handling and retries
- [ ] Test with mock API key
- [ ] Verify structured output validation

**Completion Criteria:**
- GeminiClient creates without error
- Tutor method calls API and returns valid response
- Responses validate against schema
- Errors are handled gracefully

---

## Phase 4: MemWal Integration

- [ ] Create @novera/memory package
- [ ] Research current MemWal TypeScript SDK
- [ ] Implement MemWalClient stub
  - [ ] Constructor with config
  - [ ] `health()` method
  - [ ] `remember()` method (write)
  - [ ] `recall()` method (read)
  - [ ] `deduplicateCandidate()` method
  - [ ] Namespace generation per user
- [ ] Implement memory policy evaluation
  - [ ] `evaluateMemory()` checks
  - [ ] Durable type filtering
  - [ ] Pattern exclusion
  - [ ] Confidence threshold
- [ ] Implement memory candidate extraction
- [ ] Test isolation per student

**Completion Criteria:**
- MemWalClient initializes
- User isolation verified (student A ≠ student B)
- Memory policy correctly filters
- Deduplication logic works

---

## Phase 5: Learning Memory System

- [ ] Build @novera/core StudentProfile
- [ ] Implement preference extraction
- [ ] Implement weakness retrieval
- [ ] Implement misconception tracking
- [ ] Implement memory filtering by subject/topic
- [ ] Implement memory deduplication
- [ ] Add memory merge logic for cross-session

**Completion Criteria:**
- Profile builds correctly
- Memory filtering works
- Deduplication removes duplicates
- Cross-session recall works

---

## Phase 6: Adaptive Tutor

- [ ] Integrate Gemini into message handler
- [ ] Build message → intent → context flow
- [ ] Implement subject/topic detection
- [ ] Implement memory recall
- [ ] Implement context injection to Gemini
- [ ] Handle learning preference adaptation
- [ ] Handle weakness adaptation
- [ ] Test end-to-end message → response

**Completion Criteria:**
- Bot responds to student messages
- Learning context is used
- Memories are recalled correctly
- Responses are personalized

---

## Phase 7: Quiz Engine

- [ ] Implement `/quiz` command
- [ ] Build adaptive quiz generation
- [ ] Implement question variety (MC, short answer, essay)
- [ ] Implement quiz grading
- [ ] Implement misconception detection from answers
- [ ] Implement difficulty adaptation
- [ ] Test quiz flow end-to-end

**Completion Criteria:**
- Quiz command works
- Questions adapt to weakness
- Grading is accurate
- Misconceptions are detected

---

## Phase 8: Progress & Utilities

- [ ] Implement `/progress` view
- [ ] Implement `/memory` view
- [ ] Implement `/study` recommendations
- [ ] Implement `/reset` with safe messaging
- [ ] Test all command flows

**Completion Criteria:**
- Progress shows actual data
- Memory view is readable
- Study recommendations make sense
- Reset is clear about implications

---

## Phase 9: Testing & Reliability

- [ ] Write unit tests for memory policy
- [ ] Write unit tests for deduplication
- [ ] Write integration test: message → tutor → memory
- [ ] Write isolation test: student A vs B
- [ ] Write failure tests: Gemini down, MemWal down
- [ ] Write duplicate update handling test
- [ ] Run all tests
- [ ] Fix failures

**Completion Criteria:**
- All critical tests pass
- Cross-session memory works
- User isolation verified
- Failures handled gracefully

---

## Phase 10: Premium Website

- [ ] Set up React + Vite + Tailwind
- [ ] Build Navigation component
- [ ] Build Hero section
- [ ] Build Problem section
- [ ] Build Memory section
- [ ] Build HowItWorks section
- [ ] Build BeforeAfter section
- [ ] Build AnySubject section
- [ ] Build Walrus section
- [ ] Build Final CTA
- [ ] Build Footer
- [ ] Add Framer Motion animations
- [ ] Test responsiveness (360px–1440px)
- [ ] Add SEO metadata
- [ ] Verify accessibility

**Completion Criteria:**
- Website builds without error
- All sections render
- Responsive on all breakpoints
- Premium feel matches spec
- Logo displays correctly

---

## Phase 11: Deployment Setup

- [ ] Configure production environment
- [ ] Set up Telegram webhook (HTTPS + secret)
- [ ] Test webhook locally
- [ ] Configure MemWal production account
- [ ] Configure Gemini production API
- [ ] Set up health/ready checks
- [ ] Configure logging to production
- [ ] Create deployment guide

**Completion Criteria:**
- Bot can be deployed to production
- Webhook works
- MemWal writes verified
- Health checks pass

---

## Phase 12: Real-World Testing

- [ ] Recruit 3+ real students (different subjects)
- [ ] Prepare testing environment
- [ ] Run for 3–5 days
- [ ] Collect evidence:
  - [ ] User A interactions
  - [ ] User B interactions
  - [ ] User C interactions
- [ ] Verify 10+ memories per user
- [ ] Fix bugs discovered
- [ ] Collect Mainnet evidence (object IDs, explorer links)

**Completion Criteria:**
- 3+ real users tested
- 10+ memories per user
- No critical bugs remaining
- Mainnet evidence collected

---

## Phase 13: Competition Package

- [ ] Write comprehensive README
- [ ] Document architecture
- [ ] Document memory design
- [ ] Verify all tests passing
- [ ] Create evidence directory structure
- [ ] Add Mainnet verification info
- [ ] Create article explaining the build
- [ ] Prepare GitHub repository
- [ ] Create demo flow document
- [ ] Verify website quality
- [ ] Final audit against spec

**Completion Criteria:**
- README complete
- All tests pass
- Evidence present
- Website deployed
- GitHub ready
- Article written
- Demo verified

---

## Acceptance Criteria (All Phases)

- [ ] No hardcoded secrets
- [ ] All TypeScript strict mode
- [ ] No console.log (use logger)
- [ ] Structured logging throughout
- [ ] Error handling complete
- [ ] Tests passing
- [ ] Code is clean and readable
- [ ] Commits are logical
- [ ] No unused dependencies
- [ ] Linting passes
