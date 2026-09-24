import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { validateConfig } from "../config";

describe("Bot Configuration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should fail validation when TELEGRAM_BOT_TOKEN is missing", () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    process.env.GEMINI_API_KEY = "test-key";

    const errors = validateConfig();
    expect(errors).toContain("TELEGRAM_BOT_TOKEN is required");
  });

  it("should fail validation when GEMINI_API_KEY is missing", () => {
    process.env.TELEGRAM_BOT_TOKEN = "test-token";
    delete process.env.GEMINI_API_KEY;

    const errors = validateConfig();
    expect(errors).toContain("GEMINI_API_KEY is required");
  });

  it.skip("should pass validation when required keys are set", () => {
    process.env.TELEGRAM_BOT_TOKEN = "test-token";
    process.env.GEMINI_API_KEY = "test-key";

    const errors = validateConfig();
    expect(errors).toHaveLength(0);
  });
});
