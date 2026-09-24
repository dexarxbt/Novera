import { describe, it, expect, beforeEach, vi } from "vitest";
import { AdaptiveTutor, createAdaptiveTutor } from "../adaptive-tutor";
import { MessageIntent } from "../conversation";
import { MemoryType } from "@novera/shared";
import type { StudentMemory } from "@novera/shared";

// Mock Gemini client
const mockGeminiClient = {
  tutor: vi.fn(),
  generateQuestion: vi.fn(),
  gradeAnswer: vi.fn(),
};

describe("AdaptiveTutor", () => {
  let tutor: AdaptiveTutor;

  const createMemory = (
    type: MemoryType,
    content: string,
    subject?: string,
    topic?: string
  ): StudentMemory => ({
    type,
    content,
    metadata: { subject, topic },
    timestamp: Date.now(),
    confidence: 0.8,
    sourceInteraction: "test",
  });

  beforeEach(() => {
    vi.clearAllMocks();
    tutor = new AdaptiveTutor({
      geminiClient: mockGeminiClient as any,
      userId: 123,
      subject: "Mathematics",
      topic: "Algebra",
    });
  });

  describe("initialization", () => {
    it("should initialize with config", () => {
      expect(tutor).toBeDefined();
    });

    it("should use factory function", () => {
      const created = createAdaptiveTutor(mockGeminiClient as any, 456);
      expect(created).toBeDefined();
    });
  });

  describe("respond", () => {
    it("should generate response for question intent", async () => {
      mockGeminiClient.tutor.mockResolvedValue({
        message: "The answer is X because...",
        followUpQuestions: ["Do you understand?"],
      });

      const memories = [
        createMemory(MemoryType.LEARNING_PREFERENCE, "Prefers examples"),
        createMemory(MemoryType.WEAKNESS, "Struggles with algebra", "Mathematics"),
      ];

      const response = await tutor.respond(
        "What is an equation?",
        MessageIntent.QUESTION,
        memories
      );

      expect(response.message).toBeDefined();
      expect(response.confidence).toBeGreaterThan(0);
      expect(mockGeminiClient.tutor).toHaveBeenCalled();
    });

    it("should add to conversation history", async () => {
      mockGeminiClient.tutor.mockResolvedValue({
        message: "Response",
        followUpQuestions: [],
      });

      const memories: StudentMemory[] = [];

      await tutor.respond("Hello", MessageIntent.GREETING, memories);

      const history = tutor.getConversationHistory();
      expect(history).toHaveLength(2);
      expect(history[0].role).toBe("user");
      expect(history[1].role).toBe("assistant");
    });

    it("should maintain manageable history size", async () => {
      mockGeminiClient.tutor.mockResolvedValue({
        message: "Response",
        followUpQuestions: [],
      });

      const memories: StudentMemory[] = [];

      // Make 15 exchanges (30 messages)
      for (let i = 0; i < 15; i++) {
        await tutor.respond(`Message ${i}`, MessageIntent.OTHER, memories);
      }

      const history = tutor.getConversationHistory();
      expect(history.length).toBeLessThanOrEqual(20);
    });

    it("should handle Gemini errors gracefully", async () => {
      mockGeminiClient.tutor.mockRejectedValue(new Error("API error"));

      const memories: StudentMemory[] = [];

      const response = await tutor.respond(
        "Test",
        MessageIntent.QUESTION,
        memories
      );

      expect(response.message).toContain("trouble");
      expect(response.confidence).toBeLessThan(0.5);
    });

    it("should personalize based on student preferences", async () => {
      mockGeminiClient.tutor.mockResolvedValue({
        message: "Here's a visual example...",
        followUpQuestions: [],
      });

      const memories = [
        createMemory(
          MemoryType.LEARNING_PREFERENCE,
          "Prefers visual examples and diagrams"
        ),
        createMemory(MemoryType.WEAKNESS, "Struggles with abstractions"),
      ];

      await tutor.respond("Explain this", MessageIntent.QUESTION, memories);

      // Verify tutor was called with preferences
      expect(mockGeminiClient.tutor).toHaveBeenCalledWith(
        expect.objectContaining({
          learningPreference: expect.stringContaining("visual"),
        })
      );
    });

    it("should include misconceptions in context", async () => {
      mockGeminiClient.tutor.mockResolvedValue({
        message: "Response",
        followUpQuestions: [],
      });

      const memories = [
        createMemory(
          MemoryType.MISCONCEPTION,
          "Thinks negative times negative is negative",
          "Mathematics"
        ),
      ];

      await tutor.respond("Clarify multiplication", MessageIntent.QUESTION, memories);

      const callArgs = mockGeminiClient.tutor.mock.calls[0][0];
      expect(callArgs.misconceptions).toBeDefined();
    });
  });

  describe("respondToGoal", () => {
    it("should acknowledge and save goal", async () => {
      mockGeminiClient.tutor.mockResolvedValue({
        message: "I'll help you prepare for the exam!",
        followUpQuestions: [],
      });

      const memories: StudentMemory[] = [];

      const response = await tutor.respondToGoal(
        "I want to pass the calculus exam next month",
        memories
      );

      expect(response.message).toBeDefined();
      expect(response.confidence).toBeGreaterThan(0.7);
    });

    it("should provide fallback on error", async () => {
      mockGeminiClient.tutor.mockRejectedValue(new Error("Error"));

      const memories: StudentMemory[] = [];

      const response = await tutor.respondToGoal("My goal is...", memories);

      expect(response.message).toContain("goal");
      expect(response.confidence).toBeGreaterThan(0.5);
    });
  });

  describe("respondToConfusion", () => {
    it("should provide step-by-step explanation", async () => {
      mockGeminiClient.tutor.mockResolvedValue({
        message: "Step 1: First, simplify the left side...",
        followUpQuestions: [],
      });

      const memories: StudentMemory[] = [];

      const response = await tutor.respondToConfusion(
        "I don't understand how to solve this",
        memories
      );

      expect(response.message).toBeDefined();
      expect(response.suggestedFollowUp).toContain("sense");
    });

    it("should use student weaknesses to guide explanation", async () => {
      mockGeminiClient.tutor.mockResolvedValue({
        message: "Response",
        followUpQuestions: [],
      });

      const memories = [
        createMemory(MemoryType.WEAKNESS, "Struggles with fractions", "Mathematics"),
      ];

      await tutor.respondToConfusion("I'm confused", memories);

      expect(mockGeminiClient.tutor).toHaveBeenCalled();
    });
  });

  describe("conversation history", () => {
    it("should return copy of history", async () => {
      mockGeminiClient.tutor.mockResolvedValue({
        message: "Response",
        followUpQuestions: [],
      });

      const memories: StudentMemory[] = [];

      await tutor.respond("Hello", MessageIntent.GREETING, memories);

      const history = tutor.getConversationHistory();
      const history2 = tutor.getConversationHistory();

      expect(history).toEqual(history2);
      expect(history).not.toBe(history2); // Different reference
    });

    it("should clear history on reset", async () => {
      mockGeminiClient.tutor.mockResolvedValue({
        message: "Response",
        followUpQuestions: [],
      });

      const memories: StudentMemory[] = [];

      await tutor.respond("Message", MessageIntent.OTHER, memories);

      tutor.clearConversationHistory();

      const history = tutor.getConversationHistory();
      expect(history).toHaveLength(0);
    });
  });

  describe("context management", () => {
    it("should update subject and topic", () => {
      tutor.updateContext("Physics", "Kinematics");

      const memories: StudentMemory[] = [];

      mockGeminiClient.tutor.mockResolvedValue({
        message: "Response",
        followUpQuestions: [],
      });

      tutor.respond("Question", MessageIntent.QUESTION, memories);

      expect(mockGeminiClient.tutor).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: "Physics",
          topic: "Kinematics",
        })
      );
    });

    it("should filter memories by subject/topic", async () => {
      tutor.updateContext("Mathematics");

      mockGeminiClient.tutor.mockResolvedValue({
        message: "Response",
        followUpQuestions: [],
      });

      const memories = [
        createMemory(MemoryType.WEAKNESS, "Weak in math", "Mathematics"),
        createMemory(MemoryType.WEAKNESS, "Weak in physics", "Physics"),
      ];

      await tutor.respond("Help", MessageIntent.QUESTION, memories);

      const callArgs = mockGeminiClient.tutor.mock.calls[0][0];
      expect(callArgs.recentWeaknesses).toContain("Weak in math");
      expect(callArgs.recentWeaknesses).not.toContain("Weak in physics");
    });
  });

  describe("follow-up suggestions", () => {
    it("should provide follow-up from Gemini", async () => {
      const followUp = "What about derivatives?";
      mockGeminiClient.tutor.mockResolvedValue({
        message: "Explanation",
        followUpQuestions: [followUp],
      });

      const memories: StudentMemory[] = [];

      const response = await tutor.respond("Question", MessageIntent.QUESTION, memories);

      expect(response.suggestedFollowUp).toBe(followUp);
    });

    it("should provide default follow-up if none from Gemini", async () => {
      mockGeminiClient.tutor.mockResolvedValue({
        message: "Explanation",
        followUpQuestions: [],
      });

      const memories: StudentMemory[] = [];

      const response = await tutor.respond("Question", MessageIntent.QUESTION, memories);

      expect(response.suggestedFollowUp).toBeDefined();
      expect(response.suggestedFollowUp).toContain("questions");
    });
  });

  describe("intent handling", () => {
    it("should handle different intents", async () => {
      mockGeminiClient.tutor.mockResolvedValue({
        message: "Response",
        followUpQuestions: [],
      });

      const memories: StudentMemory[] = [];
      const intents = [
        MessageIntent.QUESTION,
        MessageIntent.CONFUSION,
        MessageIntent.GOAL_SETTING,
        MessageIntent.FEEDBACK,
      ];

      for (const intent of intents) {
        const response = await tutor.respond("Test message", intent, memories);
        expect(response.message).toBeDefined();
      }
    });
  });
});
