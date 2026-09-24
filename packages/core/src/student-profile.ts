import { StudentMemory, MemoryType } from "@novera/shared";

/**
 * Universal student learning profile
 * Subject-agnostic, builds up over time
 */
export interface StudentProfile {
  userId: number;
  createdAt: number;
  updatedAt: number;
  memories: StudentMemory[];
  currentSubject?: string;
  currentTopic?: string;
}

/**
 * Extract learning preference from memory
 */
export const extractLearningPreference = (memories: StudentMemory[]): string => {
  const preferences = memories.filter(
    (m) => m.type === MemoryType.LEARNING_PREFERENCE
  );

  if (preferences.length === 0) return "default";

  // Combine preferences for context
  return preferences.map((p) => p.content).join(", ");
};

/**
 * Get recent weaknesses
 */
export const getWeaknesses = (memories: StudentMemory[], limit = 3): string[] => {
  return memories
    .filter((m) => m.type === MemoryType.WEAKNESS)
    .slice(-limit)
    .map((m) => m.content);
};

/**
 * Get identified misconceptions
 */
export const getMisconceptions = (memories: StudentMemory[]): string[] => {
  return memories
    .filter((m) => m.type === MemoryType.MISCONCEPTION)
    .map((m) => m.content);
};

/**
 * Get learning goal
 */
export const getLearningGoal = (memories: StudentMemory[]): string | null => {
  const goal = memories.find((m) => m.type === MemoryType.LEARNING_GOAL);
  return goal ? goal.content : null;
};

/**
 * Filter memories relevant to a topic
 */
export const filterRelevantMemories = (
  memories: StudentMemory[],
  subject?: string,
  topic?: string
): StudentMemory[] => {
  if (!subject && !topic) return memories;

  return memories.filter((memory) => {
    // Always include global learning preferences
    if (memory.type === MemoryType.LEARNING_PREFERENCE) return true;

    // Include goal if present
    if (memory.type === MemoryType.LEARNING_GOAL) return true;

    // Subject-specific memory matching
    if (subject && memory.metadata?.subject === subject) return true;

    // Topic-specific memory matching
    if (topic && memory.metadata?.topic === topic) return true;

    // Weak typing: include if no metadata
    if (!memory.metadata) return true;

    return false;
  });
};

/**
 * Deduplicate similar memories
 */
export const deduplicateMemories = (memories: StudentMemory[]): StudentMemory[] => {
  const seen = new Map<string, StudentMemory>();

  for (const memory of memories) {
    // Normalize content for comparison
    const key = `${memory.type}:${memory.content.toLowerCase().trim()}`;

    if (!seen.has(key)) {
      seen.set(key, memory);
    } else {
      // Keep the one with higher confidence
      const existing = seen.get(key)!;
      if (memory.confidence > existing.confidence) {
        seen.set(key, memory);
      }
    }
  }

  return Array.from(seen.values());
};

/**
 * Merge memories from multiple sessions
 * Combines existing memories with new ones, avoiding duplicates
 */
export const mergeMemories = (
  existingMemories: StudentMemory[],
  newMemories: StudentMemory[]
): StudentMemory[] => {
  // Start with existing memories
  const merged = [...existingMemories];

  for (const newMem of newMemories) {
    // Check if this memory already exists
    const isDuplicate = merged.some(
      (existing) =>
        existing.type === newMem.type &&
        existing.content.toLowerCase().trim() === newMem.content.toLowerCase().trim()
    );

    if (!isDuplicate) {
      merged.push(newMem);
    } else {
      // Update existing memory if new one has higher confidence
      const existingIndex = merged.findIndex(
        (existing) =>
          existing.type === newMem.type &&
          existing.content.toLowerCase().trim() === newMem.content.toLowerCase().trim()
      );

      if (existingIndex >= 0 && newMem.confidence > merged[existingIndex].confidence) {
        merged[existingIndex] = newMem;
      }
    }
  }

  return merged;
};

/**
 * Get strength areas from memories
 */
export const getStrengths = (memories: StudentMemory[]): string[] => {
  return memories
    .filter((m) => m.type === MemoryType.STRENGTH)
    .map((m) => m.content);
};

/**
 * Get study habits from memories
 */
export const getStudyHabits = (memories: StudentMemory[]): string[] => {
  return memories
    .filter((m) => m.type === MemoryType.STUDY_HABIT)
    .map((m) => m.content);
};

/**
 * Get recent memories sorted by timestamp
 */
export const getRecentMemories = (
  memories: StudentMemory[],
  limit = 10
): StudentMemory[] => {
  return [...memories]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
};

/**
 * Get all unique subjects from memories
 */
export const getUniqueSubjects = (memories: StudentMemory[]): string[] => {
  const subjects = new Set<string>();
  for (const memory of memories) {
    if (memory.metadata?.subject) {
      subjects.add(memory.metadata.subject as string);
    }
  }
  return Array.from(subjects);
};

/**
 * Get progress summary for a subject
 */
export const getSubjectProgress = (
  memories: StudentMemory[],
  subject: string
): {
  totalMemories: number;
  topics: string[];
  weaknesses: string[];
  strengths: string[];
  misconceptions: string[];
} => {
  const subjectMemories = memories.filter((m) => m.metadata?.subject === subject);

  const topics = new Set<string>();
  const weaknesses: string[] = [];
  const strengths: string[] = [];
  const misconceptions: string[] = [];

  for (const mem of subjectMemories) {
    if (mem.metadata?.topic) topics.add(mem.metadata.topic as string);
    if (mem.type === MemoryType.WEAKNESS) weaknesses.push(mem.content);
    if (mem.type === MemoryType.STRENGTH) strengths.push(mem.content);
    if (mem.type === MemoryType.MISCONCEPTION) misconceptions.push(mem.content);
  }

  return {
    totalMemories: subjectMemories.length,
    topics: Array.from(topics),
    weaknesses,
    strengths,
    misconceptions,
  };
};
