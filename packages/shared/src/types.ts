import { z } from "zod";

/**
 * User identification
 */
export const UserIdSchema = z.object({
  telegramUserId: z.number(),
});

export type UserId = z.infer<typeof UserIdSchema>;

/**
 * Memory types - explicit categorization
 */
export enum MemoryType {
  LEARNING_GOAL = "learning_goal",
  SUBJECT = "subject",
  TOPIC = "topic",
  LEARNING_PREFERENCE = "learning_preference",
  STRENGTH = "strength",
  WEAKNESS = "weakness",
  MISCONCEPTION = "misconception",
  REPEATED_MISTAKE = "repeated_mistake",
  STUDY_HABIT = "study_habit",
  DIFFICULTY_PREFERENCE = "difficulty_preference",
  QUIZ_RESULT = "quiz_result",
  PROGRESS = "progress",
  TOPIC_HISTORY = "topic_history",
}

/**
 * Student learning profile memory
 */
export const StudentMemorySchema = z.object({
  id: z.string().optional(),
  type: z.nativeEnum(MemoryType),
  content: z.string(),
  metadata: z.record(z.unknown()).optional(),
  timestamp: z.number(),
  confidence: z.number().min(0).max(1).default(0.8),
  sourceInteraction: z.string().optional(),
});

export type StudentMemory = z.infer<typeof StudentMemorySchema>;

/**
 * Learning context for a single session
 */
export const LearningContextSchema = z.object({
  userId: z.number(),
  subject: z.string().optional(),
  topic: z.string().optional(),
  goal: z.string().optional(),
  recentMemories: z.array(StudentMemorySchema),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional(),
});

export type LearningContext = z.infer<typeof LearningContextSchema>;

/**
 * Quiz question and grading
 */
export const QuizQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  type: z.enum(["multiple_choice", "short_answer", "essay"]),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string(),
  explanation: z.string(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  targetedWeakness: z.string().optional(),
});

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

export const QuizGradeSchema = z.object({
  questionId: z.string(),
  correct: z.boolean(),
  studentAnswer: z.string(),
  score: z.number().min(0).max(1),
  feedback: z.string(),
});

export type QuizGrade = z.infer<typeof QuizGradeSchema>;

/**
 * Health check response
 */
export const HealthCheckSchema = z.object({
  status: z.enum(["healthy", "degraded", "unhealthy"]),
  timestamp: z.number(),
  services: z.object({
    telegram: z.enum(["ok", "error"]),
    gemini: z.enum(["ok", "error"]),
    memwal: z.enum(["ok", "error"]),
  }),
});

export type HealthCheck = z.infer<typeof HealthCheckSchema>;

/**
 * Tutor response
 */
export const TutorResponseSchema = z.object({
  message: z.string(),
  followUpQuestions: z.array(z.string()).optional(),
  detectedMisconceptions: z.array(z.string()).optional(),
  suggestedExercises: z.array(z.string()).optional(),
});

export type TutorResponse = z.infer<typeof TutorResponseSchema>;

/**
 * Error response
 */
export const ErrorResponseSchema = z.object({
  error: z.string(),
  code: z.string(),
  details: z.record(z.unknown()).optional(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
