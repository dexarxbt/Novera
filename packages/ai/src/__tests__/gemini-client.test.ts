import { describe, it, expect, vi, beforeEach } from "vitest";
import { GeminiClient } from "../gemini-client.js";

const mockGenerateContent = vi.fn();

vi.mock("@google/genai", () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: { generateContent: mockGenerateContent },
  })),
}));

describe("GeminiClient", () => {
  let client: GeminiClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new GeminiClient({ apiKey: "test-key", model: "gemini-3.6-flash" });
  });

  it("returns tutor reply string", async () => {
    mockGenerateContent.mockResolvedValue({
      text: "Differential calculus is the math of instantaneous change.",
    });

    const reply = await client.tutor({
      studentMessage: "What is differential calculus?",
      conversationHistory: [],
      walrusMemories: [],
    });

    expect(typeof reply).toBe("string");
    expect(reply).toContain("calculus");
  });

  it("injects walrus memories into the prompt", async () => {
    mockGenerateContent.mockResolvedValue({ text: "Here is what I know about you..." });

    await client.tutor({
      studentMessage: "Help me",
      conversationHistory: [],
      walrusMemories: ["Student is in 100-level university", "Studying statistics"],
    });

    const call = mockGenerateContent.mock.calls[0][0];
    const contentsString = typeof call.contents === 'string' ? call.contents : JSON.stringify(call.contents);
    expect(contentsString).toContain("100-level university");
    expect(contentsString).toContain("statistics");
  });

  it("injects conversation history into the prompt", async () => {
    mockGenerateContent.mockResolvedValue({ text: "Continuing from before..." });

    await client.tutor({
      studentMessage: "Go on",
      conversationHistory: [
        { role: "user", content: "Teach me calculus" },
        { role: "assistant", content: "Sure, let's start with limits." },
        { role: "user", content: "Go on" }, // current message
      ],
      walrusMemories: [],
    });

    const call = mockGenerateContent.mock.calls[0][0];
    const contentsString = typeof call.contents === 'string' ? call.contents : JSON.stringify(call.contents);
    expect(contentsString).toContain("Teach me calculus");
    expect(contentsString).toContain("limits");
  });

  it("throws on empty response", async () => {
    mockGenerateContent.mockResolvedValue({ text: "" });
    await expect(
      client.tutor({ studentMessage: "test", conversationHistory: [], walrusMemories: [] })
    ).rejects.toThrow("Empty response from Gemini");
  });
});
