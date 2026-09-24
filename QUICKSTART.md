# Novera Quick Start Guide

Get Novera running in minutes. Choose your path below.

## Prerequisites

- **Node.js** 20+ ([download](https://nodejs.org/))
- **pnpm** 9+ (`npm install -g pnpm@9.0.0`)

## Path 1: Local Development (5 min)

Perfect for testing and development.

```bash
# Clone and setup
git clone https://github.com/yourusername/novera.git
cd novera
pnpm install

# Configure
cp .env.example .env
nano .env  # Edit with your Telegram token and API keys

# Run
pnpm -C apps/bot dev
```

Visit [@novera_bot](https://t.me/novera_bot) and start chatting.

**Pros**: Quick, no deployment needed
**Cons**: Bot stops when your machine is offline

---

## Path 2: Automated Deployment (10 min)

Use interactive scripts to deploy to production with webhook.

### On macOS/Linux:

```bash
bash ./deploy.sh
```

### On Windows:

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy.ps1
```

**What it does:**
1. Checks prerequisites (Node, pnpm, Docker)
2. Prompts for your credentials
3. Generates secure webhook secret
4. Configures Telegram webhook
5. Sets up your .env file
6. Ready to deploy!

---

## Path 3: Docker (15 min)

Containerized deployment for cloud platforms.

```bash
# Setup
cp .env.example .env
nano .env  # Edit with credentials

# Build
pnpm run docker:build

# Run locally
pnpm run docker:run

# View logs
pnpm run docker:logs

# Deploy to production
docker push novera-bot:latest
```

Deploy to: Railway, Heroku, AWS ECR, DigitalOcean, etc.

---

## Path 4: GitHub Actions (Automatic)

Set up CI/CD to deploy on every push.

### Prerequisites:
- GitHub repository
- Railway, Heroku, or other host
- Secrets configured in GitHub

### Setup:

1. Copy workflow file:
   ```bash
   mkdir -p .github/workflows
   cp .github/workflows/deploy.yml .github/workflows/
   ```

2. Add GitHub Secrets:
   - Go to Settings → Secrets and variables → Actions
   - Add: `RAILWAY_TOKEN`, `SLACK_WEBHOOK`, etc.

3. Push to main:
   ```bash
   git push origin main
   ```

GitHub Actions will automatically test, build, and deploy.

---

## Getting Credentials

### Telegram Bot Token

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Type `/start` → `/newbot`
3. Follow prompts to create your bot
4. Copy the token (format: `123456789:ABC...`)

### Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API key"
3. Copy your key

### Walrus Credentials

1. Go to [Walrus Testnet](https://walrus.site/)
2. Generate a private key
3. Get your account ID from the dashboard

---

## Verify Deployment

### Check Bot is Running

```bash
# Send a message
curl -X POST https://api.telegram.org/bot${TOKEN}/sendMessage \
  -d "chat_id=your_chat_id&text=Test"

# Check health
curl https://your-domain.com:4000/health
```

Response should look like:
```json
{
  "status": "healthy",
  "timestamp": 1234567890,
  "services": {
    "telegram": "ok",
    "gemini": "ok",
    "memwal": "ok"
  }
}
```

### Test with Real User

1. Find your bot on Telegram ([@novera_bot](https://t.me/novera_bot))
2. Type `/start`
3. Send a learning question
4. Bot should respond

---

## Troubleshooting

### "Bot not responding"

Check webhook is set:
```bash
BOT_TOKEN="your_token"
curl -X GET "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo"
```

Should show your domain in `url` field.

### "Environment variables not loaded"

```bash
# Verify .env exists and has content
cat .env | grep TELEGRAM_BOT_TOKEN

# For Docker, check compose file
docker-compose config | grep TELEGRAM
```

### "Health check failing"

```bash
# Test individual services
curl https://api.telegram.org/bot${TOKEN}/getMe
curl -H "x-goog-api-key: ${GEMINI_KEY}" https://...
```

---

## Next Steps

1. ✅ Deploy bot
2. 📱 Test with real users (Phase 12)
3. 📦 Submit to competition (Phase 13)

For detailed documentation, see:
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Full deployment guide
- [README.md](./README.md) - Project overview
- [Architecture docs](./docs/) - System design

---

## Get Help

- 📖 Read [DEPLOYMENT.md](./DEPLOYMENT.md) for troubleshooting
- 🐛 Check [GitHub Issues](https://github.com/yourusername/novera/issues)
- 💬 Ask in discussions

---

**Ready?** Pick a path above and let's go! 🚀
