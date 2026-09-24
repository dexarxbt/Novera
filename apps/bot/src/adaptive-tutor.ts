import { logger } from "@novera/shared";
import { GeminiClient } from "@novera/ai";
import {
  extractLearningPreference,
  getLearningGoal,
  getWeaknesses,
  getMisconceptions,
  filterRelevantMemories,
  getSubjectProgress,
} from "@novera/core";
import type { StudentMemory } from "@novera/shared";
import { MessageIntent } from "./conversation.js";

/**
 * Adaptive tutor that personalizes responses based on student profile
 */
export interface AdaptiveTutorConfig {
  geminiClient: GeminiClient;
  userId: number;
  subject?: string;
  topic?: string;
}

/**
 * Response from adaptive tutor
 */
export interface AdaptiveTutorResponse {
  message: string;
  suggestedFollowUp?: string;
  confidence: number;
}

export class AdaptiveTutor {
  private geminiClient: GeminiClient;
  private userId: number;
  private subject?: string;
  private topic?: string;
  private conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = [];

  constructor(config: AdaptiveTutorConfig) {
    this.geminiClient = config.geminiClient;
    this.userId = config.userId;
    this.subject = config.subject;
    this.topic = config.topic;
    logger.info("Adaptive tutor initialized", {
      userId: config.userId,
      subject: config.subject,
    });
  }

  /**
   * Generate a personalized tutoring response
   */
  async respond(
    studentMessage: string,
    intent: MessageIntent,
    studentMemories: StudentMemory[]
  ): Promise<AdaptiveTutorResponse> {
    try {
      // Build context from student profile
      const context = this.buildContext(
        studentMessage,
        intent,
        studentMemories
      );

      logger.debug("Generating adaptive response", {
        userId: this.userId,
        intent,
        subject: this.subject,
        topic: this.topic,
      });

      // Add to conversation history
      this.conversationHistory.push({
        role: "user",
        content: studentMessage,
      });

      // Generate response using Gemini
      const replyText = await this.geminiClient.tutor({
        studentMessage: context.studentMessage,
        conversationHistory: this.conversationHistory,
        walrusMemories: [],
      });

      // Add assistant response to history
      this.conversationHistory.push({
        role: "assistant",
        content: replyText,
      });

      // Keep history manageable (last 10 exchanges)
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      return {
        message: replyText,
        suggestedFollowUp: "Do you have any other questions?",
        confidence: 0.85,
      };
    } catch (error) {
      logger.error("Failed to generate adaptive response", error as Error, {
        userId: this.userId,
      });

      // Fallback response
      return {
        message:
          "I'm having trouble with that right now. Could you rephrase your question?",
        suggestedFollowUp: "Let's try again.",
        confidence: 0.3,
      };
    }
  }

  /**
   * Respond to a goal-setting statement
   */
  async respondToGoal(
    studentMessage: string,
    studentMemories: StudentMemory[]
  ): Promise<AdaptiveTutorResponse> {
    try {
      // Extract goal from message
      const context = this.buildContext(
        studentMessage,
        MessageIntent.GOAL_SETTING,
        studentMemories
      );

      logger.info("Goal detected", {
        userId: this.userId,
        goalMessage: studentMessage.substring(0, 100),
      });

      const response = await this.geminiClient.tutor({
        studentMessage: context.studentMessage,
        conversationHistory: this.conversationHistory,
        walrusMemories: [],
      });

      return {
        message: response,
        suggestedFollowUp: "What topic would you like to start with?",
        confidence: 0.9,
      };
    } catch (error) {
      logger.error("Failed to respond to goal", error as Error);
      return {
        message: "I've noted your goal. Let's work towards it together!",
        suggestedFollowUp: "What should we start with?",
        confidence: 0.7,
      };
    }
  }

  /**
   * Respond to confusion signals
   */
  async respondToConfusion(
    studentMessage: string,
    studentMemories: StudentMemory[]
  ): Promise<AdaptiveTutorResponse> {
    try {
      const context = this.buildContext(
        studentMessage,
        MessageIntent.CONFUSION,
        studentMemories
      );

      const response = await this.geminiClient.tutor({
        studentMessage: context.studentMessage,
        conversationHistory: this.conversationHistory,
        walrusMemories: [],
      });

      return {
        message: response,
        suggestedFollowUp: "Does that make sense?",
        confidence: 0.8,
      };
    } catch (error) {
      logger.error("Failed to respond to confusion", error as Error);
      return {
        message:
          "Let me break this down step by step. Can you tell me which part is most confusing?",
        suggestedFollowUp: "Which part should we focus on?",
        confidence: 0.6,
      };
    }
  }

  /**
   * Personalize based on student profile
   */
  private buildContext(
    studentMessage: string,
    intent: MessageIntent,
    studentMemories: StudentMemory[]
  ): any {
    // Filter relevant memories
    const relevantMemories = filterRelevantMemories(
      studentMemories,
      this.subject,
      this.topic
    );

    // Extract profile information
    const preference = extractLearningPreference(relevantMemories);
    const goal = getLearningGoal(relevantMemories);
    const weaknesses = getWeaknesses(relevantMemories, 3);
    const misconceptions = getMisconceptions(relevantMemories);

    // Get subject progress
    let subjectProgress = null;
    if (this.subject) {
      subjectProgress = getSubjectProgress(relevantMemories, this.subject);
    }

    logger.debug("Context built", {
      userId: this.userId,
      preference,
      weaknessCount: weaknesses.length,
      misconceptionCount: misconceptions.length,
    });

    return {
      studentMessage,
      subject: this.subject,
      topic: this.topic,
      learningPreference: preference,
      recentWeaknesses: weaknesses,
      misconceptions,
      conversationHistory: this.conversationHistory,
      metadata: {
        goal,
        subjectProgress,
        intent,
      },
    };
  }

  /**
   * Get conversation history
   */
  getConversationHistory(): Array<{
    role: "user" | "assistant";
    content: string;
  }> {
    return [...this.conversationHistory];
  }

  /**
   * Clear conversation history (e.g., on /reset)
   */
  clearConversationHistory(): void {
    this.conversationHistory = [];
    logger.info("Conversation history cleared", { userId: this.userId });
  }

  /**
   * Update subject/topic context
   */
  updateContext(subject?: string, topic?: string): void {
    this.subject = subject;
    this.topic = topic;
    logger.debug("Tutor context updated", {
      userId: this.userId,
      subject,
      topic,
    });
  }
}

/**
 * Factory function to create adaptive tutor instance
 */
export const createAdaptiveTutor = (
  geminiClient: GeminiClient,
  userId: number
): AdaptiveTutor => {
  return new AdaptiveTutor({ geminiClient, userId });
};
