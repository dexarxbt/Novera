import { describe, it, expect, beforeEach, vi } from "vitest";
import { QuizEngine, QuizDifficulty, createQuizEngine } from "../quiz-engine";
import { MemoryType } from "@novera/shared";
import type { StudentMemory } from "@novera/shared";

// Mock Gemini client
const mockGeminiClient = {
  tutor: vi.fn(),
  generateQuestion: vi.fn(),
  gradeAnswer: vi.fn(),
};

describe("Quiz Engine", () => {
  let engine: QuizEngine;

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
    engine = new QuizEngine(mockGeminiClient as any);

    // Mock question generation
    mockGeminiClient.generateQuestion.mockResolvedValue({
      question: "What is 2+2?",
      correctAnswer: "4",
      explanation: "Simple addition",
      options: ["2", "3", "4", "5"],
    });

    // Mock answer grading
    mockGeminiClient.gradeAnswer.mockResolvedValue({
      correct: true,
      score: 1.0,
      feedback: "Correct!",
    });
  });

  describe("factory", () => {
    it("should create quiz engine", () => {
      const created = createQuizEngine(mockGeminiClient as any);
      expect(created).toBeDefined();
    });
  });

  describe("startQuiz", () => {
    it("should start quiz session", async () => {
      const result = await engine.startQuiz(1, "Mathematics");

      expect(result).toBeDefined();
      expect(result.userId).toBe(1);
      expect(result.subject).toBe("Mathematics");
      expect(result.difficulty).toBe(QuizDifficulty.BEGINNER);
      expect(result.questions).toHaveLength(5);
      expect(result.completed).toBe(false);
    });

    it("should generate questions", async () => {
      await engine.startQuiz(2, "Physics", "Kinematics");

      const question = engine.getCurrentQuestion(2);
      expect(question).toBeDefined();
      expect(question?.question).toBeDefined();
      expect(question?.correctAnswer).toBeDefined();
    });

    it("should adapt difficulty based on student history", async () => {
      const memories = [
        createMemory(MemoryType.WEAKNESS, "Weak1", "Mathematics"),
        createMemory(MemoryType.WEAKNESS, "Weak2", "Mathematics"),
        createMemory(MemoryType.WEAKNESS, "Weak3", "Mathematics"),
        createMemory(MemoryType.WEAKNESS, "Weak4", "Mathematics"),
        createMemory(MemoryType.WEAKNESS, "Weak5", "Mathematics"),
        createMemory(MemoryType.WEAKNESS, "Weak6", "Mathematics"),
        createMemory(MemoryType.STRENGTH, "Good at geometry", "Mathematics"),
        createMemory(MemoryType.STRENGTH, "Good at algebra", "Mathematics"),
      ];

      const result = await engine.startQuiz(
        3,
        "Mathematics",
        undefined,
        memories
      );

      expect(result.difficulty).toBe(QuizDifficulty.INTERMEDIATE);
    });

    it("should use ADVANCED difficulty for experienced students", async () => {
      const memories = Array.from({ length: 11 }, (_, i) =>
        createMemory(
          MemoryType.WEAKNESS,
          `Weakness ${i}`,
          "Mathematics"
        )
      ).concat([
        createMemory(MemoryType.STRENGTH, "Strength1", "Mathematics"),
        createMemory(MemoryType.STRENGTH, "Strength2", "Mathematics"),
        createMemory(MemoryType.STRENGTH, "Strength3", "Mathematics"),
      ]);

      const session = await engine.startQuiz(
        4,
        "Mathematics",
        undefined,
        memories
      );

      expect(session.difficulty).toBe(QuizDifficulty.ADVANCED);
    });
  });

  describe("getCurrentQuestion", () => {
    it("should return current question", async () => {
      await engine.startQuiz(5, "Mathematics");
      const question = engine.getCurrentQuestion(5);

      expect(question).toBeDefined();
      expect(question?.question).toBe("What is 2+2?");
    });

    it("should return null if no active quiz", () => {
      const question = engine.getCurrentQuestion(999);
      expect(question).toBeNull();
    });

    it("should return null if quiz completed", async () => {
      const session = await engine.startQuiz(6, "Mathematics");
      const userId = 6;

      // Submit answers for all questions
      for (let i = 0; i < session.questions.length; i++) {
        await engine.submitAnswer(userId, "4");
      }

      const question = engine.getCurrentQuestion(userId);
      expect(question).toBeNull();
    });
  });

  describe("submitAnswer", () => {
    it("should submit correct answer", async () => {
      await engine.startQuiz(7, "Mathematics");

      const result = await engine.submitAnswer(7, "4");

      expect(result.correct).toBe(true);
      expect(result.score).toBe(1.0);
      expect(result.feedback).toBeDefined();
    });

    it("should move to next question", async () => {
      await engine.startQuiz(8, "Mathematics");

      const firstQuestion = engine.getCurrentQuestion(8);
      await engine.submitAnswer(8, "4");
      const secondQuestion = engine.getCurrentQuestion(8);

      expect(firstQuestion?.id).not.toBe(secondQuestion?.id);
    });

    it("should complete quiz after last answer", async () => {
      const quizSession = await engine.startQuiz(9, "Mathematics");
      const userId = 9;

      // Submit all answers
      for (let i = 0; i < quizSession.questions.length - 1; i++) {
        await engine.submitAnswer(userId, "4");
      }

      const result = await engine.submitAnswer(userId, "4");

      expect(result.quizComplete).toBe(true);
      expect(result.nextQuestion).toBeUndefined();
    });

    it("should throw error if no active quiz", async () => {
      await expect(engine.submitAnswer(999, "4")).rejects.toThrow();
    });

    it("should store all answers", async () => {
      await engine.startQuiz(10, "Mathematics");
      const userId = 10;
      const answers = ["4", "5", "6", "7", "8"];

      for (let i = 0; i < answers.length - 1; i++) {
        await engine.submitAnswer(userId, answers[i]);
      }
      await engine.submitAnswer(userId, answers[answers.length - 1]);

      const results = engine.getResults(userId);
      expect(results?.explanations).toHaveLength(5);
    });
  });

  describe("getResults", () => {
    it("should calculate correct results", async () => {
      mockGeminiClient.gradeAnswer.mockResolvedValueOnce({
        correct: true,
        score: 1.0,
        feedback: "Correct!",
      });
      mockGeminiClient.gradeAnswer.mockResolvedValueOnce({
        correct: false,
        score: 0.5,
        feedback: "Partial",
      });
      mockGeminiClient.gradeAnswer.mockResolvedValueOnce({
        correct: false,
        score: 0.0,
        feedback: "Wrong",
      });
      mockGeminiClient.gradeAnswer.mockResolvedValueOnce({
        correct: true,
        score: 1.0,
        feedback: "Correct!",
      });
      mockGeminiClient.gradeAnswer.mockResolvedValueOnce({
        correct: true,
        score: 0.8,
        feedback: "Nearly correct",
      });

      const session = await engine.startQuiz(11, "Mathematics");
      const userId = 11;

      for (let i = 0; i < session.questions.length; i++) {
        await engine.submitAnswer(userId, `answer${i}`);
      }

      const results = engine.getResults(userId);

      expect(results).toBeDefined();
      expect(results?.totalQuestions).toBe(5);
      expect(results?.correctAnswers).toBeGreaterThan(0);
      expect(results?.score).toBeGreaterThan(0);
      expect(results?.score).toBeLessThanOrEqual(100);
    });

    it("should return null if quiz not completed", async () => {
      await engine.startQuiz(12, "Mathematics");

      const results = engine.getResults(12);

      expect(results).toBeNull();
    });
  });

  describe("endQuiz", () => {
    it("should end quiz early", async () => {
      await engine.startQuiz(13, "Mathematics");

      const results = engine.endQuiz(13);

      expect(results).toBeDefined();
      expect(results?.totalQuestions).toBeGreaterThan(0);
    });

    it("should return null if no active quiz", () => {
      const results = engine.endQuiz(999);

      expect(results).toBeNull();
    });
  });

  describe("getQuizStats", () => {
    it("should return stats after quiz completion", async () => {
      const session = await engine.startQuiz(14, "Mathematics");
      const userId = 14;

      // Complete quiz
      for (let i = 0; i < session.questions.length; i++) {
        await engine.submitAnswer(userId, "4");
      }

      const stats = engine.getQuizStats(userId);

      expect(stats).toBeDefined();
      expect(stats?.totalQuizzes).toBeGreaterThan(0);
      expect(stats?.averageScore).toBeGreaterThan(0);
    });

    it("should return null if quiz not completed", async () => {
      await engine.startQuiz(15, "Mathematics");

      const stats = engine.getQuizStats(15);

      expect(stats).toBeNull();
    });
  });

  describe("clearSession", () => {
    it("should clear session", async () => {
      await engine.startQuiz(16, "Mathematics");

      engine.clearSession(16);

      const question = engine.getCurrentQuestion(16);
      expect(question).toBeNull();
    });

    it("should be idempotent", () => {
      engine.clearSession(999);
      engine.clearSession(999);
      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe("multiple users", () => {
    it("should isolate sessions between users", async () => {
      await engine.startQuiz(17, "Mathematics");
      await engine.startQuiz(18, "Physics");

      const q1 = engine.getCurrentQuestion(17);
      const q2 = engine.getCurrentQuestion(18);

      expect(q1?.subject).toBe("Mathematics");
      expect(q2?.subject).toBe("Physics");
    });
  });

  describe("error handling", () => {
    it("should handle Gemini errors gracefully", async () => {
      mockGeminiClient.generateQuestion.mockRejectedValueOnce(
        new Error("API error")
      );

      const session = await engine.startQuiz(19, "Mathematics");

      // Should still return a session even if some questions failed
      expect(session).toBeDefined();
    });

    it("should fail if grading fails", async () => {
      mockGeminiClient.gradeAnswer.mockRejectedValueOnce(
        new Error("Grading error")
      );

      await engine.startQuiz(20, "Mathematics");

      await expect(engine.submitAnswer(20, "4")).rejects.toThrow();
    });
  });
});
