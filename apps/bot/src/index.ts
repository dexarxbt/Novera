import { logger } from "@novera/shared";
import { validateConfig } from "./config.js";
import { startBot } from "./bot.js";

const main = async () => {
  logger.info("Starting Novera Bot");

  // Validate required environment variables
  const configErrors = validateConfig();
  if (configErrors.length > 0) {
    logger.error("Configuration errors:", undefined, {
      errors: configErrors,
    });
    process.exit(1);
  }

  logger.info("Configuration validated");

  try {
    await startBot();
    logger.info("Novera Bot started successfully");
  } catch (error) {
    logger.error("Failed to start Novera Bot", error as Error);
    process.exit(1);
  }
};

main();
