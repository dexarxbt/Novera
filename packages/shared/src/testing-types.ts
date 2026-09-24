/**
 * Types and schemas for Phase 12 student testing
 */

export interface StudentTester {
  id: string;
  name: string;
  email: string;
  subject: string; // e.g., "Calculus", "Spanish", "Physics"
  timezone: string;
  age?: number;
  consentGiven: boolean;
  consentDate: Date;
  testingStartDate: Date;
  testingEndDate: Date;
  referralSource?: string; // How they heard about testing
}

export interface PreAssessment {
  studentId: string;
  date: Date;
  subject: string;
  questions: AssessmentQuestion[];
  score: number; // 0-100
  timeSpent: number; // seconds
  notes?: string;
}

export interface PostAssessment {
  studentId: string;
  date: Date;
  subject: string;
  questions: AssessmentQuestion[];
  score: number; // 0-100
  timeSpent: number; // seconds
  improvement: number; // calculated percentage
  notes?: string;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  studentAnswer?: string | number;
  isCorrect?: boolean;
}

export interface DailyEngagementLog {
  studentId: string;
  date: Date;
  sessionsCount: number;
  messagesCount: number;
  topicsCovered: string[];
  quizzesCompleted: number;
  averageQuizScore: number; // 0-1
  memoriesStored: number;
  timeDurationMinutes: number;
  botRating: number; // 1-5
  userNotes?: string;
  bugs?: string[];
}

export interface WeeklyFeedback {
  studentId: string;
  week: number; // 1 or 2
  date: Date;
  satisfactionRating: number; // 1-5
  npsScore: number; // 0-10
  mostHelpfulFeature: "quiz" | "memory" | "recommendations" | "conversation" | "other";
  improvements: string;
  bugs: string[];
  wouldRecommend: "definitely" | "probably" | "maybe" | "probably-not" | "definitely-not";
}

export interface FinalTestingFeedback {
  studentId: string;
  date: Date;
  learningSelfAssessment: "definitely-yes" | "probably-yes" | "neutral" | "probably-not" | "definitely-not";
  overallRating: number; // 1-5
  bestFeature: string;
  wouldRecommendLikelihood: "definitely" | "probably" | "maybe" | "probably-not" | "definitely-not";
  improvementIdeas: string;
  testimonial?: string;
  allowPublicUse: boolean;
  contactForFollowUp: boolean;
}

export interface UserSessionLog {
  sessionId: string;
  studentId: string;
  startTime: Date;
  endTime: Date;
  durationSeconds: number;
  messagesExchanged: number;
  topicsCovered: string[];
  quizzesStarted: number;
  quizzesCompleted: number;
  averageQuizScore: number; // 0-1
  memoriesRecalled: number;
  newMemoriesStored: number;
  userFeedback?: number; // 1-5 rating
}

export interface TestingAnalytics {
  totalStudents: number;
  activStudents: number;
  testingPeriodDays: number;

  // Engagement metrics
  totalSessions: number;
  totalMessages: number;
  averageSessionDuration: number; // minutes
  averageDailyEngagementRate: number; // 0-1
  averageStreak: number; // days

  // Learning metrics
  averagePreScore: number; // 0-100
  averagePostScore: number; // 0-100
  averageImprovement: number; // percentage
  improvementDistribution: {
    improved: number;
    stayed_same: number;
    declined: number;
  };

  // Satisfaction metrics
  averageNPS: number; // 0-10
  satisfactionDistribution: {
    very_satisfied: number;
    satisfied: number;
    neutral: number;
    unsatisfied: number;
    very_unsatisfied: number;
  };

  // Feature usage
  featureUsage: {
    quiz: number; // percentage
    memory: number;
    recommendations: number;
    conversation: number;
  };

  // Issues
  bugsFound: number;
  featureRequests: number;
}

export interface CompetitionEvidence {
  studentCount: number;
  testingDuration: number; // days
  analytics: TestingAnalytics;
  prePostScores: Array<{ student: string; pre: number; post: number }>;
  testimonials: string[];
  npsScores: number[];
  videoTestimonials?: string[]; // URLs or file paths
  screenshots?: string[]; // Evidence of bot in action
  bugsFound: string[];
  improvements: string[];
  timestamp: Date;
}

// Schema exports for validation
export const StudentTesterSchema = {
  id: "string",
  name: "string",
  email: "string",
  subject: "string",
  timezone: "string",
  age: "number?",
  consentGiven: "boolean",
  consentDate: "Date",
  testingStartDate: "Date",
  testingEndDate: "Date",
  referralSource: "string?",
};

export const DailyEngagementLogSchema = {
  studentId: "string",
  date: "Date",
  sessionsCount: "number",
  messagesCount: "number",
  topicsCovered: "string[]",
  quizzesCompleted: "number",
  averageQuizScore: "number",
  memoriesStored: "number",
  timeDurationMinutes: "number",
  botRating: "number",
};
