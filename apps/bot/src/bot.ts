import { Bot, webhookCallback } from "grammy";
import { logger } from "@novera/shared";
import { config } from "./config.js";
import { getHealthCheck } from "./health.js";
import { GeminiClient } from "@novera/ai";
import { MemWalClient } from "@novera/memory";
import * as http from "http";

let bot: Bot | null = null;
let geminiClient: GeminiClient | null = null;
let memwalClient: MemWalClient | null = null;

// ─── Per-user conversation history (in-memory, resets on restart) ─────────────
// For permanent memory we rely on Walrus. This is just the current session window.
interface Message {
  role: "user" | "assistant";
  content: string;
}

const sessions = new Map<number, Message[]>();

const getSession = (userId: number): Message[] => {
  if (!sessions.has(userId)) sessions.set(userId, []);
  return sessions.get(userId)!;
};

const addToSession = (userId: number, role: "user" | "assistant", content: string) => {
  const history = getSession(userId);
  history.push({ role, content });
  // Keep last 20 messages in session (10 exchanges)
  if (history.length > 20) history.splice(0, history.length - 20);
};

// ─── Command handlers ─────────────────────────────────────────────────────────

const handleStart = async (ctx: any) => {
  const userId: number = ctx.from?.id;
  logger.info("User started bot", { userId });

  // Seed memory with a welcome fact so we know this user exists on Walrus
  if (memwalClient && userId) {
    memwalClient.remember(userId, `Student started using Novera on ${new Date().toISOString().split("T")[0]}`);
  }

  await ctx.reply(
    `Hey, I'm *Novera* — your personal AI tutor.\n\nJust tell me what you're studying, what you're stuck on, or what you want to get better at. I'll remember everything across sessions.\n\nWhat are you working on?`,
    { parse_mode: "Markdown" }
  );
};

const handleHelp = async (ctx: any) => {
  await ctx.reply(
    `*Commands*\n\n/start — Introduction\n/help — This message\n/memory — See what I remember about you\n/reset — Clear this session\n\nOr just talk to me — a question, a topic, something you don't understand.`,
    { parse_mode: "Markdown" }
  );
};

const handleMemory = async (ctx: any) => {
  const userId: number = ctx.from?.id;
  if (!memwalClient) {
    await ctx.reply("Memory system not available right now.");
    return;
  }

  try {
    const memories = await memwalClient.recall(userId, "student profile learning goals subjects", 10);
    if (memories.length === 0) {
      await ctx.reply("I haven't stored anything about you yet. Send me a few messages and I'll start building your profile.");
      return;
    }
    const lines = memories.map((m) => `• ${m.text}`).join("\n");
    await ctx.reply(`*What I remember about you:*\n\n${lines}`, { parse_mode: "Markdown" });
  } catch {
    await ctx.reply("Couldn't fetch your memories right now. Try again in a moment.");
  }
};

const handleReset = async (ctx: any) => {
  const userId: number = ctx.from?.id;
  sessions.delete(userId);
  await ctx.reply("Session cleared. Your long-term memory on Walrus is still intact — I just forgot this conversation window.");
};

// ─── Main message handler ─────────────────────────────────────────────────────

const handleMessage = async (ctx: any) => {
  const userId: number = ctx.from?.id;
  const messageText: string = ctx.message?.text?.trim() ?? "";

  logger.info("Message received", {
    userId,
    username: ctx.from?.username,
    text: messageText.substring(0, 60),
  });

  if (!messageText) return;

  try {
    // 1. Recall relevant memories from Walrus (non-blocking on failure)
    let walrusMemories: string[] = [];
    if (memwalClient) {
      const recalled = await memwalClient.recall(userId, messageText, 6);
      walrusMemories = recalled.map((m) => m.text);
      logger.debug("Walrus memories recalled", { userId, count: walrusMemories.length });
    }

    // 2. Get in-session conversation history
    const history = getSession(userId);

    // 3. Add user message to session
    addToSession(userId, "user", messageText);

    // 4. Generate response with full context
    const reply = await geminiClient!.tutor({
      studentMessage: messageText,
      conversationHistory: history,
      walrusMemories,
    });

    // 5. Add assistant reply to session
    addToSession(userId, "assistant", reply);

    // 6. Send reply (try Markdown, fall back to plain)
    try {
      await ctx.reply(reply, {
        reply_to_message_id: ctx.message?.message_id,
        parse_mode: "Markdown",
      });
    } catch {
      await ctx.reply(reply, {
        reply_to_message_id: ctx.message?.message_id,
      });
    }

    // 7. Fire-and-forget: extract facts from this exchange and store on Walrus
    if (memwalClient) {
      memwalClient.analyzeAndStore(userId, messageText, reply);
    }

    logger.info("Reply sent", { userId, length: reply.length });
  } catch (error: any) {
    logger.error("handleMessage error", error as Error, { userId, messageText });
    const is503 = error?.message?.includes("503") || error?.message?.includes("UNAVAILABLE") || error?.message?.includes("high demand");
    if (is503) {
      await ctx.reply("Gemini is under high demand right now. Wait a few seconds and try again.");
    } else {
      await ctx.reply("Something went wrong on my end. Try again in a second.");
    }
  }
};

// ─── Bot init ─────────────────────────────────────────────────────────────────

const initializeBot = (botInstance: Bot) => {
  botInstance.command("start", handleStart);
  botInstance.command("help", handleHelp);
  botInstance.command("memory", handleMemory);
  botInstance.command("reset", handleReset);
  botInstance.on("message:text", handleMessage);
  logger.info("Bot handlers registered");
};

// ─── Start ────────────────────────────────────────────────────────────────────

export const startBot = async () => {
  if (!config.telegramBotToken) throw new Error("TELEGRAM_BOT_TOKEN not configured");
  if (!config.geminiApiKey) throw new Error("GEMINI_API_KEY not configured");

  // Init Gemini
  geminiClient = new GeminiClient({
    apiKey: config.geminiApiKey,
    model: config.geminiModel,
  });
  logger.info("Gemini client ready", { model: config.geminiModel });

  // Init Walrus Memory
  if (config.memwalPrivateKey && config.memwalAccountId && config.memwalServerUrl) {
    memwalClient = new MemWalClient({
      delegateKey: config.memwalPrivateKey,
      accountId: config.memwalAccountId,
      serverUrl: config.memwalServerUrl,
      namespace: config.memwalNamespace,
    });
    // Health check
    const healthy = await memwalClient.health();
    logger.info("Walrus Memory health", { healthy });
  } else {
    logger.warn("Walrus Memory not configured — running without persistent memory");
  }

  bot = new Bot(config.telegramBotToken);
  initializeBot(bot);

  if (
    config.telegramWebhookSecret &&
    config.publicDomain &&
    !config.publicDomain.includes("localhost")
  ) {
    logger.info("Starting in webhook mode", { domain: config.publicDomain });
    const server = http.createServer(
      webhookCallback(bot, "http", "return", 30000, config.telegramWebhookSecret)
    );
    server.listen(config.port, () => {
      logger.info("Webhook server listening", { port: config.port });
    });
  } else {
    logger.info("Starting in polling mode");
    await bot.start({
      onStart: (info) => {
        logger.info("Bot polling started", { id: info.id, username: info.username });
      },
    });
  }

  startHealthEndpoint();
};

// ─── Health ───────────────────────────────────────────────────────────────────

const startHealthEndpoint = () => {
  const healthPort = config.port + 1000;
  const server = http.createServer((req, res) => {
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(getHealthCheck()));
    } else if (req.url === "/ready") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ready: true }));
    } else {
      res.writeHead(404);
      res.end("Not found");
    }
  });
  server.listen(healthPort, () => {
    logger.info("Health endpoint listening", { port: healthPort });
  });
};

export const getBot = (): Bot | null => bot;
