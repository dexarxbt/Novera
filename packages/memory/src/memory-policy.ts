import { StudentMemory, MemoryType } from "@novera/shared";
import { logger } from "@novera/shared";

/**
 * Memory quality decision layer
 * Determines if a candidate memory is worth persisting
 */

export interface MemoryPolicyDecision {
  shouldRemember: boolean;
  reason: string;
  confidence: number;
}

/**
 * Categories that are always durable and useful
 */
const DURABLE_TYPES = [
  MemoryType.LEARNING_GOAL,
  MemoryType.LEARNING_PREFERENCE,
  MemoryType.MISCONCEPTION,
  MemoryType.WEAKNESS,
  MemoryType.REPEATED_MISTAKE,
];

/**
 * Content patterns that should NOT be remembered
 */
const EXCLUDED_PATTERNS = [
  /^(hi|hello|thanks|thank you|okay|ok|cool|nice|good|great|bye|goodbye)$/i,
  /^[.,!?]*$/,
  /^(lol|haha|😂|🙂|👍)/i,
];

/**
 * Evaluate if a candidate memory should be persisted
 */
export const evaluateMemory = (candidate: StudentMemory): MemoryPolicyDecision => {
  // Check 1: Is the type durable?
  if (!DURABLE_TYPES.includes(candidate.type)) {
    return {
      shouldRemember: false,
      reason: `Memory type ${candidate.type} is not durable`,
      confidence: 0,
    };
  }

  // Check 2: Is the content too short or trivial?
  if (candidate.content.trim().length < 10) {
    return {
      shouldRemember: false,
      reason: "Content is too short or trivial",
      confidence: 0,
    };
  }

  // Check 3: Is it excluded?
  for (const pattern of EXCLUDED_PATTERNS) {
    if (pattern.test(candidate.content)) {
      return {
        shouldRemember: false,
        reason: "Content matches excluded pattern",
        confidence: 0,
      };
    }
  }

  // Check 4: Is it supported by interaction?
  if (!candidate.sourceInteraction) {
    return {
      shouldRemember: false,
      reason: "No source interaction recorded",
      confidence: 0,
    };
  }

  // Check 5: Confidence threshold
  if (candidate.confidence < 0.5) {
    return {
      shouldRemember: false,
      reason: "Confidence below threshold",
      confidence: candidate.confidence,
    };
  }

  // Passed all checks
  logger.debug("Memory policy approved", {
    type: candidate.type,
    content: candidate.content.substring(0, 50),
    confidence: candidate.confidence,
  });

  return {
    shouldRemember: true,
    reason: "Passed all policy checks",
    confidence: candidate.confidence,
  };
};

/**
 * Extract candidate memories from conversation
 * This is called after each Gemini response
 */
export const extractMemoryCandidates = (
  studentMessage: string,
  tutorResponse: string,
  subject?: string,
  topic?: string
): StudentMemory[] => {
  const candidates: StudentMemory[] = [];

  // This is a simplified version
  // In production, Gemini would suggest memories

  // Pattern 1: Learning preference signals
  if (
    studentMessage.toLowerCase().includes("prefer") ||
    studentMessage.toLowerCase().includes("better with")
  ) {
    candidates.push({
      type: MemoryType.LEARNING_PREFERENCE,
      content: `Prefers: ${studentMessage.substring(0, 100)}`,
      metadata: { subject, topic },
      timestamp: Date.now(),
      confidence: 0.6,
      sourceInteraction: studentMessage,
    });
  }

  // Pattern 2: Goal signals
  if (
    studentMessage.toLowerCase().includes("goal") ||
    studentMessage.toLowerCase().includes("preparing for") ||
    studentMessage.toLowerCase().includes("exam")
  ) {
    candidates.push({
      type: MemoryType.LEARNING_GOAL,
      content: `Goal: ${studentMessage.substring(0, 100)}`,
      metadata: { subject, topic },
      timestamp: Date.now(),
      confidence: 0.8,
      sourceInteraction: studentMessage,
    });
  }

  // Note: tutorResponse can be used in future analysis
  void tutorResponse;

  return candidates;
};
