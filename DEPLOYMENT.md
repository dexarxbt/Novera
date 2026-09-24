# Novera Deployment Guide

This guide covers deploying Novera Bot to production with webhook support, health checks, and environment configuration.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Production Setup](#production-setup)
4. [Telegram Webhook Configuration](#telegram-webhook-configuration)
5. [Environment Configuration](#environment-configuration)
6. [Docker Deployment](#docker-deployment)
7. [Health Monitoring](#health-monitoring)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Credentials

Before deployment, gather these credentials:

1. **Telegram Bot Token**
   - Create a bot via [@BotFather](https://t.me/botfather)
   - Get your bot token (format: `123456789:ABCdefGHIjklmnoPQRstuvWXYzabcDEFghi`)

2. **Gemini API Key**
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key for Gemini 2.0 Flash

3. **Walrus / MemWal Credentials**
   - Walrus testnet RPC: `https://walrus-testnet-rpc.walrus.space`
   - Generate a private key for memory storage
   - Get your account ID from Walrus

4. **Public Domain**
   - A domain or subdomain where your bot will receive webhooks
   - Must be HTTPS (Telegram requirement)
   - Can use: AWS, Heroku, DigitalOcean, Railway, etc.

### System Requirements

- **Node.js**: v20 or higher
- **pnpm**: v9.0 or higher
- **Docker**: (optional) latest stable version
- **Port Access**: 3000 (bot webhook), 4000 (health check)

---

## Local Development

### Setup

```bash
# Clone repository
git clone https://github.com/yourusername/novera.git
cd novera

# Install dependencies
pnpm install

# Create .env from example
cp .env.example .env

# Edit .env with your credentials
nano .env  # or use your preferred editor
```

### .env File

```env
# Telegram
TELEGRAM_BOT_TOKEN=your_token_from_botfather
TELEGRAM_WEBHOOK_SECRET=generate-random-string-here

# Gemini
GEMINI_API_KEY=your_api_key_from_google_ai_studio
GEMINI_MODEL=gemini-2.0-flash

# Walrus / MemWal
MEMWAL_PRIVATE_KEY=your_private_key_hex
MEMWAL_ACCOUNT_ID=your_account_id
MEMWAL_SERVER_URL=https://walrus-testnet-rpc.walrus.space
MEMWAL_NAMESPACE=novera

# Server
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# Website
PUBLIC_BOT_USERNAME=novera_bot
PUBLIC_DOMAIN=http://localhost:3000
```

### Run Locally

```bash
# Development mode (with polling)
pnpm -C apps/bot dev

# Watch mode for TypeScript
pnpm -r run watch

# Run tests
pnpm -r run test

# Build all packages
pnpm -r run build
```

---

## Production Setup

### 1. Choose Hosting Provider

Options:
- **Railway** (recommended): Easy GitHub integration, automatic deploys
- **AWS EC2/ECS**: More control, higher cost
- **DigitalOcean**: Affordable VPS or App Platform
- **Heroku**: Simple but no free tier
- **Fly.io**: Good for containerized apps

### 2. Domain & HTTPS Setup

Telegram requires HTTPS for webhooks. Options:

**Option A: Use Provider's Domain**
- Railway, Heroku, Fly.io provide automatic HTTPS
- Webhook URL: `https://app-name.railway.app/secret`

**Option B: Custom Domain**
```bash
# Use Let's Encrypt for free SSL
# Example with Nginx
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d your-domain.com
```

**Option C: Cloudflare + Tunnel**
```bash
# Free SSL + DDoS protection
# Set up at https://dash.cloudflare.com/
```

---

## Telegram Webhook Configuration

### Set Webhook via Telegram Bot API

```bash
# Replace with your actual values
BOT_TOKEN="your_token_here"
WEBHOOK_URL="https://your-domain.com/secret"
WEBHOOK_SECRET="your_secret_here"

# Set webhook
curl -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"${WEBHOOK_URL}\",
    \"secret_token\": \"${WEBHOOK_SECRET}\",
    \"allowed_updates\": [\"message\", \"callback_query\"]
  }"

# Verify webhook
curl -X GET "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo"
```

### Bot Listening Ports

- **3000**: Webhook endpoint (receives messages from Telegram)
- **4000**: Health check endpoint

Telegram sends updates to: `https://your-domain.com:3000/secret`

---

## Environment Configuration

### Production Checklist

```bash
# 1. Generate secure webhook secret (32+ chars)
WEBHOOK_SECRET=$(openssl rand -base64 32)
echo "TELEGRAM_WEBHOOK_SECRET=${WEBHOOK_SECRET}"

# 2. Verify all credentials are set
env | grep -E "TELEGRAM|GEMINI|MEMWAL|PUBLIC"

# 3. Set NODE_ENV to production
export NODE_ENV=production
export LOG_LEVEL=info

# 4. Set correct public domain
export PUBLIC_DOMAIN=https://your-production-domain.com
```

### Environment Variable Reference

| Variable | Required | Default | Notes |
|----------|----------|---------|-------|
| `TELEGRAM_BOT_TOKEN` | Yes | - | From @BotFather |
| `TELEGRAM_WEBHOOK_SECRET` | No* | - | *Required for webhook mode |
| `GEMINI_API_KEY` | Yes | - | From Google AI Studio |
| `GEMINI_MODEL` | No | `gemini-2.0-flash` | Model version |
| `MEMWAL_PRIVATE_KEY` | Yes | - | Hex string for Walrus |
| `MEMWAL_ACCOUNT_ID` | Yes | - | Walrus account ID |
| `MEMWAL_SERVER_URL` | No | testnet RPC | Override for mainnet |
| `MEMWAL_NAMESPACE` | No | `novera` | Memory namespace |
| `NODE_ENV` | No | `development` | Set to `production` |
| `PORT` | No | `3000` | Webhook port |
| `LOG_LEVEL` | No | `info` | `debug\|info\|warn\|error` |
| `PUBLIC_DOMAIN` | Yes | `http://localhost:3000` | HTTPS for production |
| `PUBLIC_BOT_USERNAME` | No | `novera_bot` | Bot username |

---

## Docker Deployment

### Build Docker Image

```bash
docker build -t novera-bot:latest .
```

### Run with Docker

```bash
docker run -d \
  --name novera-bot \
  -p 3000:3000 \
  -p 4000:4000 \
  -e TELEGRAM_BOT_TOKEN=your_token \
  -e GEMINI_API_KEY=your_key \
  -e MEMWAL_PRIVATE_KEY=your_key \
  -e MEMWAL_ACCOUNT_ID=your_account \
  -e PUBLIC_DOMAIN=https://your-domain.com \
  --health-interval=30s \
  --health-timeout=10s \
  --health-retries=3 \
  novera-bot:latest
```

### Docker Compose

```bash
# Copy .env file
cp .env.example .env
# Edit with production values
nano .env

# Deploy
docker-compose up -d

# View logs
docker-compose logs -f bot

# Stop
docker-compose down
```

### Multi-Stage Build Benefits

The Dockerfile uses multi-stage builds:
1. **Builder stage**: Builds all packages (includes dev dependencies)
2. **Production stage**: Only includes necessary runtime files

Result: ~400MB built image reduces to ~150MB in production.

---

## Health Monitoring

### Health Endpoints

The bot provides two health endpoints on port 4000 (default: 4001):

#### `/health` - Detailed Health Status

```bash
curl http://localhost:4000/health
```

Response:
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

Status values:
- `healthy`: All services OK
- `degraded`: One service down
- `unhealthy`: 2+ services down

#### `/ready` - Readiness Probe

```bash
curl http://localhost:4000/ready
```

Response:
```json
{
  "ready": true
}
```

### Kubernetes Health Checks

If deploying to Kubernetes:

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 4000
  initialDelaySeconds: 10
  periodSeconds: 30
  timeoutSeconds: 5
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /ready
    port: 4000
  initialDelaySeconds: 5
  periodSeconds: 10
  timeoutSeconds: 3
```

### Monitoring Setup

#### With Prometheus

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'novera-bot'
    static_configs:
      - targets: ['localhost:4000']
    metrics_path: '/metrics'
```

#### With Datadog

```bash
# Configure agent to scrape health endpoint
datadog_agent check --host localhost:4000 --check_name http_check
```

---

## Troubleshooting

### Issue: Webhook Not Receiving Messages

**Check 1: Verify webhook is set**
```bash
BOT_TOKEN="your_token"
curl -X GET "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo"
```

**Check 2: Verify domain is HTTPS**
```bash
curl -v https://your-domain.com/secret
```

**Check 3: Check logs**
```bash
# If using Docker
docker-compose logs bot

# If using systemd
journalctl -u novera-bot -f
```

### Issue: Health Check Failing

**Check service connectivity:**
```bash
# Test Telegram
curl -X GET "https://api.telegram.org/bot${BOT_TOKEN}/getMe"

# Test Gemini
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}"

# Test Walrus
curl -X GET "https://walrus-testnet-rpc.walrus.space/health"
```

### Issue: Environment Variables Not Loading

**Check .env file exists:**
```bash
ls -la .env
```

**Check permissions:**
```bash
cat .env | grep TELEGRAM_BOT_TOKEN  # Should not be empty
```

**For Docker, verify environment passing:**
```bash
docker-compose config | grep TELEGRAM_BOT_TOKEN
```

### Issue: Memory Usage Growing

**Check for memory leaks:**
```bash
# Monitor memory
docker stats novera-bot

# Check conversation history size (in bot logs)
```

**Solution**: Implement conversation history limits and periodic cleanup.

---

## Security Best Practices

1. **Credentials**
   - Never commit `.env` file to git
   - Use `.gitignore` to exclude sensitive files
   - Rotate API keys regularly

2. **HTTPS**
   - Always use HTTPS for webhook
   - Renew SSL certificates before expiry

3. **Webhook Secret**
   - Generate cryptographically secure secret
   - Verify secret token on all incoming requests

4. **Rate Limiting**
   - Telegram enforces rate limits
   - Implement exponential backoff for retries

5. **Logging**
   - Never log sensitive data (tokens, keys)
   - Log to centralized service in production

6. **Secrets Management**
   - Use provider's secrets vault (Railway, Heroku, etc.)
   - Never store credentials in code
   - Use environment variables exclusively

---

## Monitoring & Alerting

### Set Up Alerts for:

- Health endpoint returns "unhealthy"
- Webhook endpoint latency > 5s
- Error rate > 1%
- Memory usage > 80% of limit
- Unhandled exceptions

### Metrics to Track:

- Messages processed per hour
- Average response time
- Error rate by service
- Memory/CPU usage
- Uptime %

---

## Next Steps

1. ✅ Environment configuration (this guide)
2. ⬜ Deploy to production
3. ⬜ Real student testing (Phase 12)
4. ⬜ Competition submission (Phase 13)

For questions or issues, check the main [README.md](./README.md).
