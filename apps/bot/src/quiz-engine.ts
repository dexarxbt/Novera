import { logger } from "@novera/shared";
import { GeminiClient } from "@novera/ai";
import {
  getWeaknesses,
  getSubjectProgress,
} from "@novera/core";
import type { StudentMemory } from "@novera/shared";

/**
 * Quiz difficulty levels
 */
export enum QuizDifficulty {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
}

/**
 * Quiz question
 */
export interface QuizQuestion {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: QuizDifficulty;
  topic?: string;
  subject?: string;
}

/**
 * Quiz session state
 */
export interface QuizSession {
  sessionId: string;
  userId: number;
  subject: string;
  topic?: string;
  difficulty: QuizDifficulty;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  answers: string[];
  scores: number[];
  startTime: number;
  endTime?: number;
  completed: boolean;
}

/**
 * Quiz result
 */
export interface QuizResult {
  sessionId: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  difficulty: QuizDifficulty;
  timeSpent: number;
  explanations: { question: string; feedback: string }[];
}

/**
 * Quiz engine for adaptive quiz generation and grading
 */
export class QuizEngine {
  private geminiClient: GeminiClient;
  private sessions = new Map<string, QuizSession>();
  private quizzes = new Map<number, QuizSession>();

  constructor(geminiClient: GeminiClient) {
    this.geminiClient = geminiClient;
    logger.info("Quiz engine initialized");
  }

  /**
   * Start a new quiz session with adaptive difficulty
   */
  async startQuiz(
    userId: number,
    subject: string,
    topic?: string,
    studentMemories?: StudentMemory[]
  ): Promise<QuizSession> {
    try {
      // Determine adaptive difficulty based on student performance
      let difficulty = QuizDifficulty.BEGINNER;

      if (studentMemories) {
        const progress = getSubjectProgress(studentMemories, subject);
        // If student has many memories and strengths, increase difficulty
        if (progress.totalMemories > 5 && progress.strengths.length > 0) {
          difficulty = QuizDifficulty.INTERMEDIATE;
        }
        if (progress.totalMemories > 10 && progress.strengths.length > 2) {
          difficulty = QuizDifficulty.ADVANCED;
        }
      }

      logger.info("Starting quiz session", {
        userId,
        subject,
        topic,
        difficulty,
      });

      // Generate 5 questions
      const questions = await this.generateQuestions(
        subject,
        topic,
        difficulty,
        5,
        studentMemories
      );

      const sessionId = `quiz_${userId}_${Date.now()}`;
      const session: QuizSession = {
        sessionId,
        userId,
        subject,
        topic,
        difficulty,
        questions,
        currentQuestionIndex: 0,
        answers: [],
        scores: [],
        startTime: Date.now(),
        completed: false,
      };

      this.sessions.set(sessionId, session);
      this.quizzes.set(userId, session);

      return session;
    } catch (error) {
      logger.error("Failed to start quiz", error as Error, { userId });
      throw error;
    }
  }

  /**
   * Get current question in active quiz
   */
  getCurrentQuestion(userId: number): QuizQuestion | null {
    const session = this.quizzes.get(userId);
    if (!session || session.completed) return null;

    return session.questions[session.currentQuestionIndex] || null;
  }

  /**
   * Submit an answer to current question
   */
  async submitAnswer(userId: number, answer: string): Promise<{
    correct: boolean;
    score: number;
    feedback: string;
    nextQuestion?: QuizQuestion;
    quizComplete: boolean;
  }> {
    try {
      const session = this.quizzes.get(userId);
      if (!session) {
        throw new Error("No active quiz for user");
      }

      if (session.completed) {
        throw new Error("Quiz already completed");
      }

      const currentQuestion =
        session.questions[session.currentQuestionIndex];
      if (!currentQuestion) {
        throw new Error("No current question");
      }

      // Grade the answer
      const gradeResult = await this.geminiClient.gradeAnswer(
        currentQuestion.question,
        answer,
        currentQuestion.correctAnswer
      );

      // Store answer and score
      session.answers.push(answer);
      session.scores.push(gradeResult.score);

      logger.debug("Answer submitted", {
        userId,
        sessionId: session.sessionId,
        correct: gradeResult.correct,
        score: gradeResult.score,
      });

      // Check if quiz complete
      const isComplete =
        session.currentQuestionIndex >= session.questions.length - 1;

      if (isComplete) {
        session.completed = true;
        session.endTime = Date.now();
      } else {
        session.currentQuestionIndex++;
      }

      return {
        correct: gradeResult.correct,
        score: gradeResult.score,
        feedback: gradeResult.feedback,
        nextQuestion: isComplete ? undefined : this.getCurrentQuestion(userId) || undefined,
        quizComplete: isComplete,
      };
    } catch (error) {
      logger.error("Failed to submit answer", error as Error, { userId });
      throw error;
    }
  }

  /**
   * Get quiz results
   */
  getResults(userId: number): QuizResult | null {
    const session = this.quizzes.get(userId);
    if (!session || !session.completed) return null;

    const totalQuestions = session.questions.length;
    const correctAnswers = session.scores.filter((s) => s >= 0.75).length;
    const averageScore =
      session.scores.reduce((a, b) => a + b, 0) / session.scores.length;
    const timeSpent = (session.endTime || Date.now()) - session.startTime;

    const explanations = session.questions.map((q, index) => ({
      question: q.question,
      feedback: `Your answer: "${session.answers[index]}" | Expected: "${q.correctAnswer}"`,
    }));

    return {
      sessionId: session.sessionId,
      totalQuestions,
      correctAnswers,
      score: Math.round(averageScore * 100),
      difficulty: session.difficulty,
      timeSpent,
      explanations,
    };
  }

  /**
   * Generate questions targeting weaknesses
   */
  private async generateQuestions(
    subject: string,
    topic: string | undefined,
    difficulty: QuizDifficulty,
    count: number,
    studentMemories?: StudentMemory[]
  ): Promise<QuizQuestion[]> {
    const questions: QuizQuestion[] = [];

    let targetedWeakness: string | undefined;
    if (studentMemories) {
      const weaknesses = getWeaknesses(studentMemories, 1);
      targetedWeakness = weaknesses[0];
    }

    // Map our difficulty to Gemini difficulty string
    const geminiDifficulty = difficulty as "beginner" | "intermediate" | "advanced";

    for (let i = 0; i < count; i++) {
      try {
        const question = await this.geminiClient.generateQuestion(
          subject,
          topic || "General",
          geminiDifficulty,
          i === 0 ? targetedWeakness : undefined // Target weakness on first question
        );

        questions.push({
          id: `q_${Date.now()}_${i}`,
          question: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          difficulty,
          topic,
          subject,
        });
      } catch (error) {
        logger.warn("Failed to generate question", {
          error: error instanceof Error ? error.message : String(error),
          subject,
          difficulty,
          index: i,
        });
        // Continue with other questions
      }
    }

    return questions;
  }

  /**
   * End quiz session early
   */
  endQuiz(userId: number): QuizResult | null {
    const session = this.quizzes.get(userId);
    if (!session) return null;

    if (!session.completed) {
      session.completed = true;
      session.endTime = Date.now();
    }

    return this.getResults(userId);
  }

  /**
   * Get quiz statistics for user
   */
  getQuizStats(userId: number): {
    totalQuizzes: number;
    averageScore: number;
    improvementTrend: number;
  } | null {
    const session = this.quizzes.get(userId);
    if (!session || !session.completed) return null;

    // In a real app, this would fetch from database/memory
    // For now, return basic stats
    return {
      totalQuizzes: 1,
      averageScore: Math.round(
        (session.scores.reduce((a, b) => a + b, 0) / session.scores.length) *
          100
      ),
      improvementTrend: 0,
    };
  }

  /**
   * Clear session (e.g., on /reset)
   */
  clearSession(userId: number): void {
    const session = this.quizzes.get(userId);
    if (session) {
      this.sessions.delete(session.sessionId);
      this.quizzes.delete(userId);
      logger.info("Quiz session cleared", { userId });
    }
  }
}

/**
 * Factory function
 */
export const createQuizEngine = (geminiClient: GeminiClient): QuizEngine => {
  return new QuizEngine(geminiClient);
};
