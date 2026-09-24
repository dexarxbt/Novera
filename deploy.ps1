# Novera Deployment Script (PowerShell)
# This script helps configure and deploy Novera Bot to production

$ErrorActionPreference = "Stop"

# Functions
function Write-Header {
  param([string]$Message)
  Write-Host ""
  Write-Host "=== $Message ===" -ForegroundColor Cyan
}

function Write-Success {
  param([string]$Message)
  Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error-Custom {
  param([string]$Message)
  Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Warning-Custom {
  param([string]$Message)
  Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Info {
  param([string]$Message)
  Write-Host "ℹ $Message" -ForegroundColor Cyan
}

function Generate-Secret {
  $bytes = New-Object byte[] 32
  $rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::new()
  $rng.GetBytes($bytes)
  return [Convert]::ToBase64String($bytes)
}

# Main script
function Main {
  Clear-Host
  Write-Host ""
  Write-Host "   ███╗   ██╗ ██████╗ ██╗   ██╗███████╗██████╗  █████╗ " -ForegroundColor Cyan
  Write-Host "   ████╗  ██║██╔═══██╗██║   ██║██╔════╝██╔══██╗██╔══██╗" -ForegroundColor Cyan
  Write-Host "   ██╔██╗ ██║██║   ██║██║   ██║█████╗  ██████╔╝███████║" -ForegroundColor Cyan
  Write-Host "   ██║╚██╗██║██║   ██║╚██╗ ██╔╝██╔══╝  ██╔══██╗██╔══██║" -ForegroundColor Cyan
  Write-Host "   ██║ ╚████║╚██████╔╝ ╚████╔╝ ███████╗██║  ██║██║  ██║" -ForegroundColor Cyan
  Write-Host "   ╚═╝  ╚═══╝ ╚═════╝   ╚═══╝  ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝" -ForegroundColor Cyan
  Write-Host ""

  Write-Header "Novera Bot Deployment Script"
  Write-Host ""

  # Check prerequisites
  Write-Header "Checking Prerequisites"
  Write-Host ""

  # Check Node.js
  if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node -v
    Write-Success "Node.js installed: $nodeVersion"
  }
  else {
    Write-Error-Custom "Node.js not found. Please install Node.js 20+"
    exit 1
  }

  # Check pnpm
  if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    $pnpmVersion = pnpm -v
    Write-Success "pnpm installed: $pnpmVersion"
  }
  else {
    Write-Warning-Custom "pnpm not found. Installing globally..."
    npm install -g pnpm@9.0.0
  }

  # Check Docker (optional)
  if (Get-Command docker -ErrorAction SilentlyContinue) {
    $dockerVersion = docker --version
    Write-Success "Docker installed: $dockerVersion"
    $hasDocker = $true
  }
  else {
    Write-Warning-Custom "Docker not found (optional, required for containerized deployment)"
    $hasDocker = $false
  }

  Write-Host ""

  # Deployment mode selection
  Write-Header "Select Deployment Mode"
  Write-Host ""
  Write-Host "1) Local Development (polling mode)" -ForegroundColor Gray
  Write-Host "2) Production with Webhook" -ForegroundColor Gray
  Write-Host "3) Docker Deployment" -ForegroundColor Gray
  Write-Host ""
  
  $deployMode = Read-Host "Select option (1-3)"

  Write-Host ""

  switch ($deployMode) {
    "1" { Deploy-LocalDev }
    "2" { Deploy-Webhook }
    "3" {
      if (-not $hasDocker) {
        Write-Error-Custom "Docker is required for this option"
        exit 1
      }
      Deploy-Docker
    }
    default {
      Write-Error-Custom "Invalid option"
      exit 1
    }
  }
}

function Deploy-LocalDev {
  Write-Header "Local Development Setup"
  Write-Host ""

  # Check if .env exists
  if (-not (Test-Path ".env")) {
    Write-Info "Creating .env from .env.example..."
    Copy-Item ".env.example" ".env"
    Write-Success ".env created. Please edit with your credentials."
    Write-Warning-Custom "Edit .env with your Telegram bot token and API keys"
    Write-Host ""
    Read-Host "Press Enter once you've edited .env"
  }

  Write-Info "Installing dependencies..."
  pnpm install

  Write-Info "Building packages..."
  pnpm -r run build

  Write-Success "Setup complete!"
  Write-Host ""
  Write-Host "To start the bot:" -ForegroundColor Cyan
  Write-Host "  pnpm -C apps/bot dev"
  Write-Host ""
  Write-Info "Bot will start in polling mode (no webhook needed)"
}

function Deploy-Webhook {
  Write-Header "Production Webhook Setup"
  Write-Host ""

  # Get credentials
  $publicDomain = Read-Host "Enter your public domain (e.g., https://bot.example.com)"
  $telegramBotToken = Read-Host "Enter your Telegram bot token"
  $geminiApiKey = Read-Host "Enter your Gemini API key"
  $memwalPrivateKey = Read-Host "Enter your Walrus private key (hex)"
  $memwalAccountId = Read-Host "Enter your Walrus account ID"

  # Generate webhook secret
  $webhookSecret = Generate-Secret

  Write-Success "Generated webhook secret: $webhookSecret"
  Write-Host ""

  # Create .env
  $envContent = @"
# Telegram
TELEGRAM_BOT_TOKEN=$telegramBotToken
TELEGRAM_WEBHOOK_SECRET=$webhookSecret

# Gemini
GEMINI_API_KEY=$geminiApiKey
GEMINI_MODEL=gemini-2.0-flash

# Walrus / MemWal
MEMWAL_PRIVATE_KEY=$memwalPrivateKey
MEMWAL_ACCOUNT_ID=$memwalAccountId
MEMWAL_SERVER_URL=https://walrus-testnet-rpc.walrus.space
MEMWAL_NAMESPACE=novera

# Server
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Website
PUBLIC_BOT_USERNAME=novera_bot
PUBLIC_DOMAIN=$publicDomain
"@

  Set-Content -Path ".env" -Value $envContent

  Write-Success ".env file created with your configuration"
  Write-Host ""

  # Build
  Write-Info "Installing dependencies..."
  pnpm install

  Write-Info "Building packages..."
  pnpm -r run build

  # Set webhook
  Write-Info "Setting Telegram webhook..."
  $webhookUrl = "$publicDomain/secret"

  $body = @{
    url = $webhookUrl
    secret_token = $webhookSecret
    allowed_updates = @("message", "callback_query")
  } | ConvertTo-Json

  Invoke-WebRequest -Uri "https://api.telegram.org/bot$telegramBotToken/setWebhook" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

  Write-Host ""
  Write-Success "Webhook configured!"
  Write-Host ""
  Write-Host "To start the bot:" -ForegroundColor Cyan
  Write-Host "  pnpm -C apps/bot build"
  Write-Host "  NODE_ENV=production PORT=3000 node apps/bot/dist/index.js"
  Write-Host ""
  Write-Warning-Custom "Make sure your domain is reachable and has valid HTTPS!"
}

function Deploy-Docker {
  Write-Header "Docker Deployment Setup"
  Write-Host ""

  # Get credentials
  $publicDomain = Read-Host "Enter your public domain (e.g., https://bot.example.com)"
  $telegramBotToken = Read-Host "Enter your Telegram bot token"
  $geminiApiKey = Read-Host "Enter your Gemini API key"
  $memwalPrivateKey = Read-Host "Enter your Walrus private key (hex)"
  $memwalAccountId = Read-Host "Enter your Walrus account ID"

  # Generate webhook secret
  $webhookSecret = Generate-Secret

  # Create .env
  $envContent = @"
# Telegram
TELEGRAM_BOT_TOKEN=$telegramBotToken
TELEGRAM_WEBHOOK_SECRET=$webhookSecret

# Gemini
GEMINI_API_KEY=$geminiApiKey
GEMINI_MODEL=gemini-2.0-flash

# Walrus / MemWal
MEMWAL_PRIVATE_KEY=$memwalPrivateKey
MEMWAL_ACCOUNT_ID=$memwalAccountId
MEMWAL_SERVER_URL=https://walrus-testnet-rpc.walrus.space
MEMWAL_NAMESPACE=novera

# Server
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Website
PUBLIC_BOT_USERNAME=novera_bot
PUBLIC_DOMAIN=$publicDomain
"@

  Set-Content -Path ".env" -Value $envContent

  Write-Success ".env file created"
  Write-Host ""

  # Build Docker image
  Write-Info "Building Docker image..."
  docker build -t novera-bot:latest .

  Write-Success "Docker image built!"
  Write-Host ""

  # Run Docker container
  $startDocker = Read-Host "Start Docker container now? (y/n)"

  if ($startDocker -eq "y") {
    docker-compose up -d
    Write-Host ""
    Write-Success "Container started!"
    Write-Host ""
    Write-Host "View logs:" -ForegroundColor Cyan
    Write-Host "  docker-compose logs -f bot"
    Write-Host ""
    Write-Host "Stop container:" -ForegroundColor Cyan
    Write-Host "  docker-compose down"
  }
}

# Run main script
Main
