#!/bin/bash

# Novera Deployment Script
# This script helps configure and deploy Novera Bot to production

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
  echo -e "${BLUE}=== $1 ===${NC}"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ $1${NC}"
}

generate_secret() {
  openssl rand -base64 32 | tr -d '\n'
}

# Main script
main() {
  clear
  echo ""
  echo -e "${BLUE}"
  echo "   ███╗   ██╗ ██████╗ ██╗   ██╗███████╗██████╗  █████╗ "
  echo "   ████╗  ██║██╔═══██╗██║   ██║██╔════╝██╔══██╗██╔══██╗"
  echo "   ██╔██╗ ██║██║   ██║██║   ██║█████╗  ██████╔╝███████║"
  echo "   ██║╚██╗██║██║   ██║╚██╗ ██╔╝██╔══╝  ██╔══██╗██╔══██║"
  echo "   ██║ ╚████║╚██████╔╝ ╚████╔╝ ███████╗██║  ██║██║  ██║"
  echo "   ╚═╝  ╚═══╝ ╚═════╝   ╚═══╝  ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝"
  echo -e "${NC}"
  echo ""

  print_header "Novera Bot Deployment Script"
  echo ""

  # Check prerequisites
  print_header "Checking Prerequisites"
  echo ""

  # Check Node.js
  if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_success "Node.js installed: $NODE_VERSION"
  else
    print_error "Node.js not found. Please install Node.js 20+"
    exit 1
  fi

  # Check pnpm
  if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm -v)
    print_success "pnpm installed: $PNPM_VERSION"
  else
    print_warning "pnpm not found. Installing globally..."
    npm install -g pnpm@9.0.0
  fi

  # Check Docker (optional)
  if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    print_success "Docker installed: $DOCKER_VERSION"
    HAS_DOCKER=true
  else
    print_warning "Docker not found (optional, required for containerized deployment)"
    HAS_DOCKER=false
  fi

  echo ""

  # Deployment mode selection
  print_header "Select Deployment Mode"
  echo ""
  echo "1) Local Development (polling mode)"
  echo "2) Production with Webhook"
  echo "3) Docker Deployment"
  echo ""
  read -p "Select option (1-3): " DEPLOY_MODE

  echo ""

  case $DEPLOY_MODE in
    1)
      deploy_local_dev
      ;;
    2)
      deploy_webhook
      ;;
    3)
      if [ "$HAS_DOCKER" = false ]; then
        print_error "Docker is required for this option"
        exit 1
      fi
      deploy_docker
      ;;
    *)
      print_error "Invalid option"
      exit 1
      ;;
  esac
}

deploy_local_dev() {
  print_header "Local Development Setup"
  echo ""

  # Check if .env exists
  if [ ! -f ".env" ]; then
    print_info "Creating .env from .env.example..."
    cp .env.example .env
    print_success ".env created. Please edit with your credentials."
    print_warning "Edit .env with your Telegram bot token and API keys"
    echo ""
    read -p "Press Enter once you've edited .env..."
  fi

  print_info "Installing dependencies..."
  pnpm install

  print_info "Building packages..."
  pnpm -r run build

  print_success "Setup complete!"
  echo ""
  echo "To start the bot:"
  echo "  pnpm -C apps/bot dev"
  echo ""
  print_info "Bot will start in polling mode (no webhook needed)"
}

deploy_webhook() {
  print_header "Production Webhook Setup"
  echo ""

  # Get credentials
  read -p "Enter your public domain (e.g., https://bot.example.com): " PUBLIC_DOMAIN
  read -p "Enter your Telegram bot token: " TELEGRAM_BOT_TOKEN
  read -p "Enter your Gemini API key: " GEMINI_API_KEY
  read -p "Enter your Walrus private key (hex): " MEMWAL_PRIVATE_KEY
  read -p "Enter your Walrus account ID: " MEMWAL_ACCOUNT_ID

  # Generate webhook secret
  WEBHOOK_SECRET=$(generate_secret)

  print_success "Generated webhook secret: $WEBHOOK_SECRET"
  echo ""

  # Create .env
  cat > .env << EOF
# Telegram
TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN
TELEGRAM_WEBHOOK_SECRET=$WEBHOOK_SECRET

# Gemini
GEMINI_API_KEY=$GEMINI_API_KEY
GEMINI_MODEL=gemini-2.0-flash

# Walrus / MemWal
MEMWAL_PRIVATE_KEY=$MEMWAL_PRIVATE_KEY
MEMWAL_ACCOUNT_ID=$MEMWAL_ACCOUNT_ID
MEMWAL_SERVER_URL=https://walrus-testnet-rpc.walrus.space
MEMWAL_NAMESPACE=novera

# Server
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Website
PUBLIC_BOT_USERNAME=novera_bot
PUBLIC_DOMAIN=$PUBLIC_DOMAIN
EOF

  print_success ".env file created with your configuration"
  echo ""

  # Build
  print_info "Installing dependencies..."
  pnpm install

  print_info "Building packages..."
  pnpm -r run build

  # Set webhook
  print_info "Setting Telegram webhook..."
  WEBHOOK_URL="$PUBLIC_DOMAIN/secret"
  
  curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
    -H "Content-Type: application/json" \
    -d "{
      \"url\": \"${WEBHOOK_URL}\",
      \"secret_token\": \"${WEBHOOK_SECRET}\",
      \"allowed_updates\": [\"message\", \"callback_query\"]
    }"

  echo ""
  print_success "Webhook configured!"
  echo ""
  echo "To start the bot:"
  echo "  pnpm -C apps/bot build"
  echo "  NODE_ENV=production PORT=3000 node apps/bot/dist/index.js"
  echo ""
  print_warning "Make sure your domain is reachable and has valid HTTPS!"
}

deploy_docker() {
  print_header "Docker Deployment Setup"
  echo ""

  # Get credentials
  read -p "Enter your public domain (e.g., https://bot.example.com): " PUBLIC_DOMAIN
  read -p "Enter your Telegram bot token: " TELEGRAM_BOT_TOKEN
  read -p "Enter your Gemini API key: " GEMINI_API_KEY
  read -p "Enter your Walrus private key (hex): " MEMWAL_PRIVATE_KEY
  read -p "Enter your Walrus account ID: " MEMWAL_ACCOUNT_ID

  # Generate webhook secret
  WEBHOOK_SECRET=$(generate_secret)

  # Create .env
  cat > .env << EOF
# Telegram
TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN
TELEGRAM_WEBHOOK_SECRET=$WEBHOOK_SECRET

# Gemini
GEMINI_API_KEY=$GEMINI_API_KEY
GEMINI_MODEL=gemini-2.0-flash

# Walrus / MemWal
MEMWAL_PRIVATE_KEY=$MEMWAL_PRIVATE_KEY
MEMWAL_ACCOUNT_ID=$MEMWAL_ACCOUNT_ID
MEMWAL_SERVER_URL=https://walrus-testnet-rpc.walrus.space
MEMWAL_NAMESPACE=novera

# Server
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Website
PUBLIC_BOT_USERNAME=novera_bot
PUBLIC_DOMAIN=$PUBLIC_DOMAIN
EOF

  print_success ".env file created"
  echo ""

  # Build Docker image
  print_info "Building Docker image..."
  docker build -t novera-bot:latest .

  print_success "Docker image built!"
  echo ""

  # Run Docker container
  read -p "Start Docker container now? (y/n): " START_DOCKER

  if [ "$START_DOCKER" = "y" ]; then
    docker-compose up -d
    echo ""
    print_success "Container started!"
    echo ""
    echo "View logs:"
    echo "  docker-compose logs -f bot"
    echo ""
    echo "Stop container:"
    echo "  docker-compose down"
  fi
}

# Run main script
main
