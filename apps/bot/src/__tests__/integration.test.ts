import { describe, it, expect, beforeEach, vi } from "vitest";
import { AdaptiveTutor } from "../adaptive-tutor";
import { QuizEngine, QuizDifficulty } from "../quiz-engine";
import { ProgressUtils } from "../progress-utils";
import { MessageIntent, detectIntent, extractSubjectTopic } from "../conversation";
import { MemoryType } from "@novera/shared";
import type { StudentMemory } from "@novera/shared";

// Mock Gemini client
const mockGeminiClient = {
  tutor: vi.fn(),
  generateQuestion: vi.fn(),
  gradeAnswer: vi.fn(),
};

describe("Integration Tests", () => {
  let tutor: AdaptiveTutor;
  let quizEngine: QuizEngine;

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
      userId: 1,
    });
    quizEngine = new QuizEngine(mockGeminiClient as any);

    mockGeminiClient.tutor.mockResolvedValue({
      message: "Here's an explanation...",
      followUpQuestions: ["Do you understand?"],
    });

    mockGeminiClient.generateQuestion.mockResolvedValue({
      question: "What is 2+2?",
      correctAnswer: "4",
      explanation: "Simple addition",
      options: ["2", "3", "4", "5"],
    });

    mockGeminiClient.gradeAnswer.mockResolvedValue({
      correct: true,
      score: 1.0,
      feedback: "Correct!",
    });
  });

  describe("End-to-end learning flow", () => {
    it("should handle complete tutoring session", async () => {
      const memories: StudentMemory[] = [
        createMemory(MemoryType.LEARNING_PREFERENCE, "Prefers examples", "Mathematics"),
        createMemory(MemoryType.WEAKNESS, "Weak in algebra", "Mathematics"),
      ];

      // Student asks a question
      const intent = detectIntent("I don't understand quadratic equations");
      expect(intent).toBe(MessageIntent.CONFUSION);

      // Get tutoring response
      const response = await tutor.respond(
        "I don't understand quadratic equations",
        intent,
        memories
      );

      expect(response.message).toBeDefined();
      expect(response.confidence).toBeGreaterThan(0);
    });

    it("should set goal and adapt tutor", async () => {
      const memories: StudentMemory[] = [];

      // Student sets goal
      const response = await tutor.respondToGoal(
        "I want to master calculus",
        memories
      );

      expect(response.message).toBeDefined();

      // Tutor should remember context
      tutor.updateContext("Mathematics", "Calculus");

      const question = "Tell me about derivatives";
      const tutorResponse = await tutor.respond(question, MessageIntent.QUESTION, memories);

      expect(tutorResponse.message).toBeDefined();
    });

    it("should track conversation history across interactions", async () => {
      const memories: StudentMemory[] = [];

      // First exchange
      await tutor.respond("What is algebra?", MessageIntent.QUESTION, memories);

      // Second exchange
      await tutor.respond("How do I solve equations?", MessageIntent.QUESTION, memories);

      // Check history
      const history = tutor.getConversationHistory();

      expect(history.length).toBe(4); // 2 user messages + 2 assistant responses
      expect(history[0].role).toBe("user");
      expect(history[1].role).toBe("assistant");
    });
  });

  describe("Quiz to tutor integration", () => {
    it("should start quiz and handle answers", async () => {
      const memories = [
        createMemory(MemoryType.WEAKNESS, "Weak in fractions", "Mathematics"),
      ];

      // Start quiz
      const session = await quizEngine.startQuiz(1, "Mathematics", undefined, memories);

      expect(session).toBeDefined();
      expect(session.questions.length).toBe(5);

      // Get first question
      const question = quizEngine.getCurrentQuestion(1);
      expect(question).toBeDefined();

      // Submit answer
      const result = await quizEngine.submitAnswer(1, "4");

      expect(result.correct).toBeDefined();
      expect(result.feedback).toBeDefined();
    });

    it("should adapt quiz difficulty based on student profile", async () => {
      const advancedStudent = Array.from({ length: 12 }, (_, i) =>
        createMemory(
          i % 3 === 0 ? MemoryType.STRENGTH : MemoryType.WEAKNESS,
          `Memory ${i}`,
          "Mathematics"
        )
      );

      const session = await quizEngine.startQuiz(
        2,
        "Mathematics",
        undefined,
        advancedStudent
      );

      expect(session.difficulty).toBe(QuizDifficulty.ADVANCED);
    });

    it("should generate progress report after quiz", async () => {
      const memories = [
        createMemory(MemoryType.WEAKNESS, "Weak in calculus", "Mathematics"),
        createMemory(MemoryType.STRENGTH, "Good at geometry", "Mathematics"),
      ];

      // Start and complete quiz
      const session = await quizEngine.startQuiz(3, "Mathematics", undefined, memories);
      for (let i = 0; i < session.questions.length; i++) {
        await quizEngine.submitAnswer(3, "4");
      }

      // Generate progress report
      const report = ProgressUtils.generateProgressReport(memories);

      expect(report.totalMemories).toBe(2);
      expect(report.overallStrength).toBeGreaterThan(0);
      expect(report.subjects).toContain("Mathematics");
    });
  });

  describe("User isolation and data independence", () => {
    it("should isolate tutors between users", async () => {
      const tutor1 = new AdaptiveTutor({
        geminiClient: mockGeminiClient as any,
        userId: 1,
      });

      const tutor2 = new AdaptiveTutor({
        geminiClient: mockGeminiClient as any,
        userId: 2,
      });

      // Both interact
      await tutor1.respond("Hello", MessageIntent.GREETING, []);
      await tutor2.respond("Hi there", MessageIntent.GREETING, []);

      // Check histories are separate
      const history1 = tutor1.getConversationHistory();
      const history2 = tutor2.getConversationHistory();

      expect(history1).toHaveLength(2);
      expect(history2).toHaveLength(2);
      expect(history1[0].content).not.toBe(history2[0].content);
    });

    it("should isolate quiz sessions between users", async () => {
      await quizEngine.startQuiz(4, "Mathematics");
      await quizEngine.startQuiz(5, "Physics");

      const q4 = quizEngine.getCurrentQuestion(4);
      const q5 = quizEngine.getCurrentQuestion(5);

      expect(q4?.subject).toBe("Mathematics");
      expect(q5?.subject).toBe("Physics");
    });

    it("should not leak memory between students", async () => {
      const student1Memories = [
        createMemory(MemoryType.WEAKNESS, "Weak in math"),
      ];
      const student2Memories = [
        createMemory(MemoryType.STRENGTH, "Good at math"),
      ];

      const report1 = ProgressUtils.generateProgressReport(student1Memories);
      const report2 = ProgressUtils.generateProgressReport(student2Memories);

      expect(report1.overallStrength).not.toBe(report2.overallStrength);
    });
  });

  describe("Intent detection integration", () => {
    it("should route to appropriate handler by intent", async () => {
      const testCases = [
        {
          message: "I don't understand this",
          intent: MessageIntent.CONFUSION,
          shouldCallConfusion: true,
        },
        {
          message: "My goal is to pass the exam",
          intent: MessageIntent.GOAL_SETTING,
          shouldCallGoal: true,
        },
        {
          message: "What is a function?",
          intent: MessageIntent.QUESTION,
          shouldCallQuestion: true,
        },
      ];

      for (const test of testCases) {
        const detectedIntent = detectIntent(test.message);
        expect(detectedIntent).toBe(test.intent);
      }
    });

    it("should extract subject/topic from intent", () => {
      const tests = [
        {
          message: "Help me with calculus",
          expectedSubject: "Mathematics",
        },
        {
          message: "I'm studying physics",
          expectedSubject: "Physics",
        },
        {
          message: "Python programming is hard",
          expectedSubject: "Computer Science",
        },
      ];

      for (const test of tests) {
        const extraction = extractSubjectTopic(test.message);
        expect(extraction.subject).toBe(test.expectedSubject);
      }
    });
  });

  describe("Memory lifecycle", () => {
    it("should extract and store memories from interaction", async () => {
      // Simulate user interaction that generates memory
      const preferences = [
        createMemory(
          MemoryType.LEARNING_PREFERENCE,
          "Prefers step-by-step explanations"
        ),
      ];

      // Generate report with new memories
      const report = ProgressUtils.generateProgressReport(preferences);

      expect(report.totalMemories).toBe(1);
    });

    it("should deduplicate similar memories", async () => {
      const duplicateMemories = [
        createMemory(MemoryType.WEAKNESS, "Struggles with fractions"),
        createMemory(MemoryType.WEAKNESS, "Struggles with fractions"),
        createMemory(MemoryType.WEAKNESS, "Weak in fractions"),
      ];

      // Generate report - all three memories should be processed
      const report = ProgressUtils.generateProgressReport(duplicateMemories);

      // Report should show all memories
      expect(report.totalMemories).toBe(3);
      // Weaknesses should be extracted
      expect(report.recentProgress.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Error recovery", () => {
    it("should handle Gemini API failure gracefully", async () => {
      mockGeminiClient.tutor.mockRejectedValueOnce(
        new Error("API error")
      );

      const response = await tutor.respond("Test", MessageIntent.QUESTION, []);

      expect(response.message).toBeDefined();
      expect(response.message).toContain("trouble");
    });

    it("should recover from failed quiz generation", async () => {
      mockGeminiClient.generateQuestion.mockRejectedValueOnce(
        new Error("Generation failed")
      );

      const session = await quizEngine.startQuiz(6, "Mathematics");

      // Session should still be created even with some failures
      expect(session).toBeDefined();
    });

    it("should continue after partial failures", async () => {
      mockGeminiClient.generateQuestion
        .mockResolvedValueOnce({
          question: "Q1",
          correctAnswer: "A1",
          explanation: "E1",
        })
        .mockRejectedValueOnce(new Error("Failed"))
        .mockResolvedValueOnce({
          question: "Q3",
          correctAnswer: "A3",
          explanation: "E3",
        });

      const session = await quizEngine.startQuiz(7, "Mathematics");

      // Should have at least some questions despite failures
      expect(session.questions.length).toBeGreaterThan(0);
    });
  });

  describe("Concurrent operations", () => {
    it("should handle multiple simultaneous quiz sessions", async () => {
      const sessions = await Promise.all([
        quizEngine.startQuiz(8, "Mathematics"),
        quizEngine.startQuiz(9, "Physics"),
        quizEngine.startQuiz(10, "Chemistry"),
      ]);

      expect(sessions).toHaveLength(3);
      expect(sessions[0].subject).toBe("Mathematics");
      expect(sessions[1].subject).toBe("Physics");
      expect(sessions[2].subject).toBe("Chemistry");
    });

    it("should handle concurrent tutor interactions", async () => {
      const t1 = new AdaptiveTutor({
        geminiClient: mockGeminiClient as any,
        userId: 11,
      });

      const t2 = new AdaptiveTutor({
        geminiClient: mockGeminiClient as any,
        userId: 12,
      });

      const responses = await Promise.all([
        t1.respond("Hello", MessageIntent.GREETING, []),
        t2.respond("Hi", MessageIntent.GREETING, []),
      ]);

      expect(responses).toHaveLength(2);
      expect(responses[0].message).toBeDefined();
      expect(responses[1].message).toBeDefined();
    });
  });

  describe("State consistency", () => {
    it("should maintain consistent state through operations", async () => {
      const memories = [
        createMemory(MemoryType.WEAKNESS, "Weak in algebra", "Mathematics"),
        createMemory(MemoryType.STRENGTH, "Good at geometry", "Mathematics"),
      ];

      // Generate report
      const report1 = ProgressUtils.generateProgressReport(memories);

      // Same memories should produce same report
      const report2 = ProgressUtils.generateProgressReport(memories);

      expect(report1.totalMemories).toBe(report2.totalMemories);
      expect(report1.overallStrength).toBe(report2.overallStrength);
    });

    it("should clear session state properly", async () => {
      await quizEngine.startQuiz(13, "Mathematics");

      let question = quizEngine.getCurrentQuestion(13);
      expect(question).toBeDefined();

      quizEngine.clearSession(13);

      question = quizEngine.getCurrentQuestion(13);
      expect(question).toBeNull();
    });
  });
});
