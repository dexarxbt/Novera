<div align="center">
  <br />
  <img src="./apps/web/public/novera-logo.png" alt="Novera" width="220">
  <br /><br />

  <p><strong>An AI tutor that never forgets.</strong></p>
  <p>Persistent memory on Walrus. Every session builds on the last.</p>

  <br />

  [![Website](https://img.shields.io/badge/Web-noveraa.vercel.app-000000?style=flat-square&logo=vercel&logoColor=white)](https://noveraa.vercel.app)
  [![Telegram](https://img.shields.io/badge/Telegram-@noveraa__bot-2CA5E0?style=flat-square&logo=telegram&logoColor=white)](https://t.me/noveraa_bot)
  [![Built on Sui](https://img.shields.io/badge/Built%20on-Sui-4DA2FF?style=flat-square)](https://sui.io)
  [![Walrus Memory](https://img.shields.io/badge/Storage-Walrus%20Memory-6B46C1?style=flat-square)](https://walrus.site)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

  <br /><br />
</div>

---

## What is Novera?

Most AI tutors are amnesiac. Every session starts from zero — no memory of who you are, what you've struggled with, or how far you've come.

Novera is different. It remembers.

Built on [Walrus Memory](https://walrus.site) — a decentralized storage layer on the Sui blockchain — your learning profile is extracted from every conversation, encrypted, and stored permanently on-chain. Not on a company server. Not in a database someone can delete. On the blockchain, where it belongs to you.

The next time you open a session, Novera already knows you.

---

## Start Learning

No installs. No accounts. Just open Telegram:

**→ [@noveraa_bot](https://t.me/noveraa_bot)**

Send `/start` and go.

---

## How It Works

```
You send a message
        ↓
Novera recalls your memory from Walrus
        ↓
Gemini builds a response tailored to you
        ↓
Response is sent
        ↓
New facts extracted → encrypted → stored on Walrus (async)
```

Each exchange makes the next one smarter. Your weaknesses, your learning style, your goals — all persist across every session, every device, forever.

---

## Features

**Persistent Memory**
Your profile is stored on Walrus Memory (Sui mainnet). End-to-end encrypted. Immutable. Owned by you — not locked in a server that could go down tomorrow.

**Adaptive Tutoring**
Novera adapts to you in real time. It knows what you've mastered, what trips you up, and adjusts its explanations accordingly.

**Any Subject**
Math, history, code, languages, sciences — Novera teaches whatever you're trying to learn.

**Bot Commands**

| Command | Description |
|---------|-------------|
| `/start` | Begin a learning session |
| `/quiz` | Adaptive quiz based on your history |
| `/progress` | Your learning metrics |
| `/memory` | See what Novera knows about you |
| `/study` | Personalized study plan |
| `/help` | All commands |

---

## Architecture

### Stack

| Layer | Technology |
|-------|------------|
| Bot | grammY (Telegram API) |
| AI | Google Gemini 3.6 Flash |
| Memory | Walrus Memory — Sui blockchain |
| Web | React + Vite + Tailwind CSS |
| Language | TypeScript (strict) |
| Monorepo | pnpm workspaces |
| Tests | Vitest — 116+ passing |

### Project Structure

```
Novera/
├── apps/
│   ├── bot/          # Telegram bot
│   └── web/          # Landing page
└── packages/
    ├── ai/           # Gemini client
    ├── core/         # Student profile types
    ├── memory/       # Walrus Memory client
    └── shared/       # Shared utilities
```

---

## Self-Hosting

### Prerequisites

- Node.js 18+, pnpm
- Telegram bot token — [@BotFather](https://t.me/botfather)
- Gemini API key — [Google AI Studio](https://aistudio.google.com/app/apikey)
- Walrus mainnet credentials — [Walrus Portal](https://portal.walrus.xyz)

### Setup

```bash
git clone https://github.com/dexarxbt/Novera.git
cd Novera
pnpm install
cp .env.example .env
```

Configure `.env`:

```env
TELEGRAM_BOT_TOKEN=your_token

GEMINI_API_KEY=your_key
GEMINI_MODEL=gemini-3.6-flash

MEMWAL_PRIVATE_KEY=your_hex_private_key
MEMWAL_ACCOUNT_ID=your_account_id
MEMWAL_SERVER_URL=https://relayer.memory.walrus.xyz

PUBLIC_BOT_USERNAME=noveraa_bot
NODE_ENV=production
```

### Run

```bash
# Build everything
pnpm -r run build

# Start bot
node apps/bot/dist/index.js

# Start web (http://localhost:4173)
pnpm -C apps/web preview
```

### Docker

```bash
docker-compose up -d
```

---

## Development

```bash
pnpm -r run build        # Build all packages
pnpm -r run test         # Run all tests
pnpm -r run type-check   # TypeScript checks
```

**Test coverage**

```
packages/ai      4 / 4   passing
packages/core   25 / 25  passing
packages/memory 20 / 20  passing
apps/bot        91 / 97  passing
──────────────────────────────
Total          116+       passing
```

---

## Privacy Model

Your data is protected by design, not by policy:

- Your private key encrypts everything before it leaves your device
- No plaintext ever hits Novera's infrastructure
- Data lives on Walrus (Sui blockchain) — immutable and permanent
- You own your key. You own your data.

---

## Roadmap

- [x] Telegram bot with Walrus Memory
- [x] Gemini-powered adaptive tutoring
- [x] Mainnet Walrus integration
- [x] Landing page
- [ ] Web dashboard
- [ ] Native quiz engine
- [ ] Multi-language support
- [ ] Mobile app

---

## License

MIT — see [LICENSE](./LICENSE)

---

<div align="center">
  <sub>Built by <a href="https://github.com/dexarxbt">Dexar</a> · <a href="https://noveraa.vercel.app">noveraa.vercel.app</a> · Powered by <a href="https://walrus.site">Walrus</a> · Running on <a href="https://sui.io">Sui</a></sub>
</div>
