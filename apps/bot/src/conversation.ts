import { logger } from "@novera/shared";

/**
 * Conversation orchestration layer
 * Handles intent detection and message processing
 */

export enum MessageIntent {
  GREETING = "greeting",
  QUESTION = "question",
  FEEDBACK = "feedback",
  CONFUSION = "confusion",
  GOAL_SETTING = "goal_setting",
  QUIZ_REQUEST = "quiz_request",
  PROGRESS_CHECK = "progress_check",
  HELP = "help",
  OTHER = "other",
}

/**
 * Detect intent from student message
 */
export const detectIntent = (message: string): MessageIntent => {
  const lower = message.toLowerCase().trim();

  // Greetings (must be at start/end and mostly alone)
  if (/^(hi|hello|hey|greetings|salut|hola|bonjour)[\s!]*$/.test(lower)) {
    return MessageIntent.GREETING;
  }

  // Goal setting (check early before question patterns)
  if (
    /\b(preparing for|exam|study for|working toward|goal|aiming for)\b/.test(lower) ||
    (/\b(study|prepare|work toward)\b/.test(lower) && lower.length < 60)
  ) {
    return MessageIntent.GOAL_SETTING;
  }

  // Questions (starts with question word)
  if (/^(what|how|when|where|why|which|who|can you|could you|would you|should)/.test(lower)) {
    return MessageIntent.QUESTION;
  }

  // Confusion signals
  if (
    /\b(don't understand|don't get|confused|stuck|unclear|hard|difficult|not getting|can't figure|confusing)\b/.test(
      lower
    )
  ) {
    return MessageIntent.CONFUSION;
  }

  // Quiz request
  if (/\b(quiz|test|question|practice|exercise)\b/.test(lower)) {
    return MessageIntent.QUIZ_REQUEST;
  }

  // Progress check
  if (/\b(progress|improve|improving|better|worse|how am i|doing)\b/.test(lower)) {
    return MessageIntent.PROGRESS_CHECK;
  }

  // Help request
  if (/\b(help|assist|support|guide)\b/.test(lower)) {
    return MessageIntent.HELP;
  }

  // Feedback (positive or negative about Novera/the tutoring experience)
  if (/\b(this is good|this is great|really good|very good|excellent|bad|terrible|useless|not helpful)\b/.test(lower)) {
    return MessageIntent.FEEDBACK;
  }

  return MessageIntent.OTHER;
};

/**
 * Extract potential topic/subject from message
 */
export const extractSubjectTopic = (message: string): { subject?: string; topic?: string } => {
  const lower = message.toLowerCase();

  // Common subjects
  const subjects: Record<string, string> = {
    math: "Mathematics",
    calculus: "Mathematics",
    algebra: "Mathematics",
    physics: "Physics",
    chemistry: "Chemistry",
    biology: "Biology",
    cs: "Computer Science",
    programming: "Computer Science",
    python: "Computer Science",
    javascript: "Computer Science",
    coding: "Computer Science",
    english: "English",
    history: "History",
    geography: "Geography",
    economics: "Economics",
    business: "Business",
  };

  for (const [key, subject] of Object.entries(subjects)) {
    if (lower.includes(key)) {
      logger.debug("Subject detected", { subject, fromMessage: key });
      return { subject };
    }
  }

  return {};
};

/**
 * Build a response placeholder based on intent
 */
export const buildResponseTemplate = (intent: MessageIntent): string => {
  switch (intent) {
    case MessageIntent.GREETING:
      return "Hey there! 👋 What are you working on today?";

    case MessageIntent.CONFUSION:
      return "Let me help you with that. Can you tell me more about what you're stuck on?";

    case MessageIntent.QUESTION:
      return "Great question! Let me explain...";

    case MessageIntent.GOAL_SETTING:
      return "Got it. I'll remember that. Let's work towards your goal.";

    case MessageIntent.QUIZ_REQUEST:
      return "Ready for a quiz? Let me prepare some questions for you.";

    case MessageIntent.PROGRESS_CHECK:
      return "Let me check your progress on what we've covered.";

    case MessageIntent.FEEDBACK:
      return "Thanks for the feedback! I'll keep improving.";

    case MessageIntent.HELP:
      return "Of course, I'm here to help. What do you need?";

    default:
      return "I'm ready to help with that!";
  }
};
