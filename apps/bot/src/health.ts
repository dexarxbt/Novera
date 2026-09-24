import { HealthCheck, HealthCheckSchema } from "@novera/shared";
import { logger } from "@novera/shared";

/**
 * Health check status for external services
 */
let telegramHealth: "ok" | "error" = "ok";
let geminiHealth: "ok" | "error" = "ok";
let memwalHealth: "ok" | "error" = "ok";

export const setTelegramHealth = (status: "ok" | "error") => {
  telegramHealth = status;
};

export const setGeminiHealth = (status: "ok" | "error") => {
  geminiHealth = status;
};

export const setMemwalHealth = (status: "ok" | "error") => {
  memwalHealth = status;
};

export const getHealthCheck = (): HealthCheck => {
  const health: HealthCheck = {
    status: "healthy",
    timestamp: Date.now(),
    services: {
      telegram: telegramHealth,
      gemini: geminiHealth,
      memwal: memwalHealth,
    },
  };

  // Determine overall status
  const errorCount = Object.values(health.services).filter((s) => s === "error").length;

  if (errorCount >= 2) {
    health.status = "unhealthy";
  } else if (errorCount === 1) {
    health.status = "degraded";
  }

  return health;
};

/**
 * Validate health response against schema
 */
export const validateHealth = (data: unknown): HealthCheck => {
  try {
    return HealthCheckSchema.parse(data);
  } catch (error) {
    logger.error("Health check validation failed", error);
    throw new Error("Invalid health check response");
  }
};
