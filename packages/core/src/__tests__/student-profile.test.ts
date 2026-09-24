import { describe, it, expect } from "vitest";
import {
  filterRelevantMemories,
  getWeaknesses,
  getMisconceptions,
  extractLearningPreference,
  getLearningGoal,
  deduplicateMemories,
  mergeMemories,
  getStrengths,
  getStudyHabits,
  getRecentMemories,
  getUniqueSubjects,
  getSubjectProgress,
} from "../student-profile";
import { MemoryType } from "@novera/shared";
import type { StudentMemory } from "@novera/shared";

describe("Student Profile", () => {
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

  describe("filterRelevantMemories", () => {
    it("should filter memories by subject", () => {
      const memories = [
        createMemory(MemoryType.WEAKNESS, "Weak in calculus", "Mathematics", "Calculus"),
        createMemory(MemoryType.WEAKNESS, "Weak in chemistry", "Chemistry", "Reactions"),
        createMemory(MemoryType.WEAKNESS, "Weak in algebra", "Mathematics", "Algebra"),
      ];

      const mathMemories = filterRelevantMemories(memories, "Mathematics");

      expect(mathMemories.length).toBeGreaterThan(0);
      expect(mathMemories.some((m) => m.metadata?.subject === "Mathematics")).toBe(true);
    });

    it("should include learning preferences regardless of subject", () => {
      const memories = [
        createMemory(MemoryType.LEARNING_PREFERENCE, "Prefers visual"),
        createMemory(MemoryType.WEAKNESS, "Weak in chemistry", "Chemistry"),
      ];

      const result = filterRelevantMemories(memories, "Mathematics");

      expect(result.some((m) => m.type === MemoryType.LEARNING_PREFERENCE)).toBe(true);
    });

    it("should filter memories by topic", () => {
      const memories = [
        createMemory(MemoryType.WEAKNESS, "Derivatives", "Calculus", "Differentiation"),
        createMemory(MemoryType.WEAKNESS, "Integrals", "Calculus", "Integration"),
      ];

      const diffMemories = filterRelevantMemories(memories, undefined, "Differentiation");

      expect(diffMemories.length).toBeGreaterThan(0);
    });

    it("should return all when no filters", () => {
      const memories = [
        createMemory(MemoryType.WEAKNESS, "Weak 1"),
        createMemory(MemoryType.WEAKNESS, "Weak 2"),
      ];

      const result = filterRelevantMemories(memories);

      expect(result).toHaveLength(2);
    });
  });

  describe("getWeaknesses", () => {
    it("should extract weakness content", () => {
      const memories = [
        createMemory(MemoryType.WEAKNESS, "Struggles with fractions"),
        createMemory(MemoryType.STRENGTH, "Good at geometry"),
        createMemory(MemoryType.WEAKNESS, "Difficulty with word problems"),
      ];

      const weaknesses = getWeaknesses(memories);

      expect(weaknesses.length).toBeGreaterThan(0);
      expect(weaknesses.some((w) => w.includes("fractions"))).toBe(true);
    });

    it("should respect limit parameter", () => {
      const memories = Array.from({ length: 5 }, (_, i) =>
        createMemory(MemoryType.WEAKNESS, `Weakness ${i}`)
      );

      const weaknesses = getWeaknesses(memories, 2);

      expect(weaknesses).toHaveLength(2);
    });
  });

  describe("getMisconceptions", () => {
    it("should extract misconception content", () => {
      const memories = [
        createMemory(MemoryType.MISCONCEPTION, "Thinks velocity equals speed"),
        createMemory(MemoryType.MISCONCEPTION, "Believes acceleration is always positive"),
        createMemory(MemoryType.WEAKNESS, "Weak in kinematics"),
      ];

      const misconceptions = getMisconceptions(memories);

      expect(misconceptions).toHaveLength(2);
      expect(misconceptions).toContain("Thinks velocity equals speed");
    });
  });

  describe("extractLearningPreference", () => {
    it("should extract learning preference content", () => {
      const memories = [
        createMemory(MemoryType.LEARNING_PREFERENCE, "Prefers visual examples"),
        createMemory(MemoryType.LEARNING_GOAL, "Wants to pass exam"),
      ];

      const preference = extractLearningPreference(memories);

      expect(preference).toContain("visual");
    });

    it("should return default when no preferences", () => {
      const memories = [
        createMemory(MemoryType.WEAKNESS, "Weak in math"),
      ];

      const preference = extractLearningPreference(memories);

      expect(preference).toBe("default");
    });

    it("should combine multiple preferences", () => {
      const memories = [
        createMemory(MemoryType.LEARNING_PREFERENCE, "Prefers visual"),
        createMemory(MemoryType.LEARNING_PREFERENCE, "Likes examples"),
      ];

      const preference = extractLearningPreference(memories);

      expect(preference).toContain("visual");
      expect(preference).toContain("examples");
    });
  });

  describe("getLearningGoal", () => {
    it("should extract learning goal", () => {
      const memories = [
        createMemory(MemoryType.LEARNING_GOAL, "Master algebra before next semester"),
        createMemory(MemoryType.WEAKNESS, "Weak in functions"),
      ];

      const goal = getLearningGoal(memories);

      expect(goal).toBe("Master algebra before next semester");
    });

    it("should return null when no goal", () => {
      const memories = [
        createMemory(MemoryType.WEAKNESS, "Weak in math"),
      ];

      const goal = getLearningGoal(memories);

      expect(goal).toBeNull();
    });
  });

  describe("deduplicateMemories", () => {
    it("should remove exact duplicates", () => {
      const memories = [
        createMemory(MemoryType.WEAKNESS, "Weak in calculus"),
        createMemory(MemoryType.WEAKNESS, "Weak in calculus"),
        createMemory(MemoryType.WEAKNESS, "Weak in algebra"),
      ];

      const deduplicated = deduplicateMemories(memories);

      expect(deduplicated).toHaveLength(2);
    });

    it("should handle case-insensitive duplicates", () => {
      const memories = [
        createMemory(MemoryType.WEAKNESS, "WEAK IN CALCULUS"),
        createMemory(MemoryType.WEAKNESS, "weak in calculus"),
      ];

      const deduplicated = deduplicateMemories(memories);

      expect(deduplicated).toHaveLength(1);
    });

    it("should keep higher confidence when duplicates exist", () => {
      const mem1: StudentMemory = createMemory(MemoryType.WEAKNESS, "Test weakness");
      const mem2: StudentMemory = createMemory(MemoryType.WEAKNESS, "Test weakness");
      mem2.confidence = 0.95;

      const deduplicated = deduplicateMemories([mem1, mem2]);

      expect(deduplicated).toHaveLength(1);
      expect(deduplicated[0].confidence).toBe(0.95);
    });
  });

  describe("mergeMemories", () => {
    it("should merge without duplicates", () => {
      const existing = [
        createMemory(MemoryType.WEAKNESS, "Weak in fractions"),
        createMemory(MemoryType.WEAKNESS, "Weak in decimals"),
      ];

      const newMemories = [
        createMemory(MemoryType.WEAKNESS, "Weak in percentages"),
        createMemory(MemoryType.STRENGTH, "Good at geometry"),
      ];

      const merged = mergeMemories(existing, newMemories);

      expect(merged).toHaveLength(4);
    });

    it("should handle duplicate detection during merge", () => {
      const existing = [
        createMemory(MemoryType.WEAKNESS, "Weak in calculus"),
      ];

      const newMemories = [
        createMemory(MemoryType.WEAKNESS, "Weak in calculus"),
        createMemory(MemoryType.WEAKNESS, "Weak in algebra"),
      ];

      const merged = mergeMemories(existing, newMemories);

      expect(merged).toHaveLength(2);
    });

    it("should update confidence when duplicate found", () => {
      const existing: StudentMemory[] = [
        {
          ...createMemory(MemoryType.WEAKNESS, "Weak in calculus"),
          confidence: 0.6,
        },
      ];

      const newMemories: StudentMemory[] = [
        {
          ...createMemory(MemoryType.WEAKNESS, "Weak in calculus"),
          confidence: 0.95,
        },
      ];

      const merged = mergeMemories(existing, newMemories);

      expect(merged).toHaveLength(1);
      expect(merged[0].confidence).toBe(0.95);
    });
  });

  describe("getStrengths", () => {
    it("should extract strength content", () => {
      const memories = [
        createMemory(MemoryType.STRENGTH, "Excellent at geometry"),
        createMemory(MemoryType.STRENGTH, "Quick with mental math"),
        createMemory(MemoryType.WEAKNESS, "Weak in algebra"),
      ];

      const strengths = getStrengths(memories);

      expect(strengths).toHaveLength(2);
      expect(strengths).toContain("Excellent at geometry");
    });
  });

  describe("getStudyHabits", () => {
    it("should extract study habit content", () => {
      const memories = [
        createMemory(MemoryType.STUDY_HABIT, "Studies in the morning"),
        createMemory(MemoryType.STUDY_HABIT, "Likes group study sessions"),
        createMemory(MemoryType.WEAKNESS, "Weak in calculus"),
      ];

      const habits = getStudyHabits(memories);

      expect(habits).toHaveLength(2);
      expect(habits).toContain("Studies in the morning");
    });
  });

  describe("getRecentMemories", () => {
    it("should sort by timestamp descending", () => {
      const now = Date.now();
      const memories: StudentMemory[] = [
        { ...createMemory(MemoryType.WEAKNESS, "Old"), timestamp: now - 10000 },
        { ...createMemory(MemoryType.WEAKNESS, "Recent"), timestamp: now },
        { ...createMemory(MemoryType.WEAKNESS, "Middle"), timestamp: now - 5000 },
      ];

      const recent = getRecentMemories(memories, 2);

      expect(recent).toHaveLength(2);
      expect(recent[0].content).toBe("Recent");
      expect(recent[1].content).toBe("Middle");
    });

    it("should respect limit parameter", () => {
      const memories = Array.from({ length: 10 }, (_, i) =>
        createMemory(MemoryType.WEAKNESS, `Weakness ${i}`)
      );

      const recent = getRecentMemories(memories, 5);

      expect(recent).toHaveLength(5);
    });
  });

  describe("getUniqueSubjects", () => {
    it("should extract unique subjects", () => {
      const memories = [
        createMemory(MemoryType.WEAKNESS, "Test", "Mathematics"),
        createMemory(MemoryType.WEAKNESS, "Test", "Physics"),
        createMemory(MemoryType.WEAKNESS, "Test", "Mathematics"),
        createMemory(MemoryType.WEAKNESS, "Test", "Chemistry"),
      ];

      const subjects = getUniqueSubjects(memories);

      expect(subjects).toHaveLength(3);
      expect(subjects).toContain("Mathematics");
    });
  });

  describe("getSubjectProgress", () => {
    it("should build complete subject progress", () => {
      const memories = [
        createMemory(MemoryType.WEAKNESS, "Weak in derivatives", "Calculus", "Differentiation"),
        createMemory(MemoryType.WEAKNESS, "Weak in integrals", "Calculus", "Integration"),
        createMemory(MemoryType.STRENGTH, "Good with limits", "Calculus", "Limits"),
        createMemory(MemoryType.MISCONCEPTION, "Thinks derivative = slope", "Calculus", "Differentiation"),
      ];

      const progress = getSubjectProgress(memories, "Calculus");

      expect(progress.totalMemories).toBe(4);
      expect(progress.topics.length).toBeGreaterThan(0);
      expect(progress.weaknesses.length).toBeGreaterThan(0);
    });

    it("should return empty arrays for subjects with no memories", () => {
      const memories = [
        createMemory(MemoryType.WEAKNESS, "Test", "Physics"),
      ];

      const progress = getSubjectProgress(memories, "Chemistry");

      expect(progress.totalMemories).toBe(0);
      expect(progress.topics).toHaveLength(0);
    });
  });
});
