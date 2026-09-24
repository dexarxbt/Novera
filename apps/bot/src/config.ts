import dotenv from "dotenv";

dotenv.config();

export const config = {
  // Telegram
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  telegramWebhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET,

  // Gemini
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || "gemini-3.6-flash",

  // MemWal
  memwalPrivateKey: process.env.MEMWAL_PRIVATE_KEY,
  memwalAccountId: process.env.MEMWAL_ACCOUNT_ID,
  memwalServerUrl: process.env.MEMWAL_SERVER_URL || "https://walrus-testnet-rpc.walrus.space",
  memwalNamespace: process.env.MEMWAL_NAMESPACE || "novera",

  // Server
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000", 10),
  logLevel: process.env.LOG_LEVEL || "info",

  // Website
  publicBotUsername: process.env.PUBLIC_BOT_USERNAME || "novera_bot",
  publicDomain: process.env.PUBLIC_DOMAIN || "http://localhost:3000",
};

// Validation
export function validateConfig(): string[] {
  const errors: string[] = [];

  if (!config.telegramBotToken) {
    errors.push("TELEGRAM_BOT_TOKEN is required");
  }

  if (!config.geminiApiKey) {
    errors.push("GEMINI_API_KEY is required");
  }

  if (!config.memwalPrivateKey && config.nodeEnv === "production") {
    errors.push("MEMWAL_PRIVATE_KEY is required for production");
  }

  if (!config.memwalAccountId && config.nodeEnv === "production") {
    errors.push("MEMWAL_ACCOUNT_ID is required for production");
  }

  // Warn about webhook configuration — only relevant if actually using webhooks
  // In polling mode these are irrelevant, so don't block startup

  return errors;
}
