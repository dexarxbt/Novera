import { describe, it, expect } from "vitest";
import {
  ProgressUtils,
  formatDuration,
  formatMemory,
} from "../progress-utils";
import { MemoryType } from "@novera/shared";
import type { StudentMemory } from "@novera/shared";

describe("Progress Utils", () => {
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

  describe("generateProgressReport", () => {
    it("should generate report with no memories", () => {
      const report = ProgressUtils.generateProgressReport([]);

      expect(report).toBeDefined();
      expect(report.totalMemories).toBe(0);
      expect(report.overallStrength).toBe(0);
    });

    it("should generate report with memories", () => {
      const memories = [
        createMemory(MemoryType.WEAKNESS, "Weak in calculus", "Mathematics"),
        createMemory(MemoryType.STRENGTH, "Good at algebra", "Mathematics"),
        createMemory(MemoryType.WEAKNESS, "Weak in chemistry", "Chemistry"),
      ];

      const report = ProgressUtils.generateProgressReport(memories);

      expect(report.totalMemories).toBe(3);
      expect(report.subjects.length).toBeGreaterThan(0);
      expect(report.overallStrength).toBeGreaterThan(0);
    });

    it("should calculate overall strength", () => {
      const strongStudent = Array.from({ length: 15 }, (_, i) =>
        createMemory(
          i % 3 === 0 ? MemoryType.STRENGTH : MemoryType.WEAKNESS,
          `Memory ${i}`,
          "Math"
        )
      );

      const report = ProgressUtils.generateProgressReport(strongStudent);

      expect(report.overallStrength).toBeGreaterThan(30);
      expect(report.overallStrength).toBeLessThanOrEqual(100);
    });

    it("should organize progress by subject", () => {
      const memories = [
        createMemory(MemoryType.WEAKNESS, "Weak1", "Mathematics"),
        createMemory(MemoryType.WEAKNESS, "Weak2", "Mathematics"),
        createMemory(MemoryType.WEAKNESS, "Weak3", "Physics"),
      ];

      const report = ProgressUtils.generateProgressReport(memories);

      expect(report.recentProgress.length).toBeGreaterThan(0);
      expect(report.subjects.length).toBe(2);
    });
  });

  describe("generateStudyRecommendation", () => {
    it("should return null with no memories", () => {
      const rec = ProgressUtils.generateStudyRecommendation([]);

      expect(rec).toBeNull();
    });

    it("should recommend weakest subject", () => {
      const memories = [
        createMemory(MemoryType.WEAKNESS, "Weak in calculus", "Mathematics"),
        createMemory(MemoryType.WEAKNESS, "Weak in derivatives", "Mathematics"),
        createMemory(MemoryType.WEAKNESS, "Weak in physics", "Physics"),
      ];

      const rec = ProgressUtils.generateStudyRecommendation(memories);

      expect(rec).toBeDefined();
      expect(rec?.subject).toBeDefined();
      expect(rec?.topic).toBeDefined();
    });

    it("should adapt difficulty based on progress", () => {
      const advancedStudent = Array.from({ length: 15 }, (_, i) =>
        createMemory(
          i % 2 === 0 ? MemoryType.STRENGTH : MemoryType.WEAKNESS,
          `Memory ${i}`,
          "Math"
        )
      );

      const rec = ProgressUtils.generateStudyRecommendation(advancedStudent);

      expect(rec?.difficulty).toBe("advanced");
    });
  });

  describe("getMemorySummary", () => {
    it("should summarize memories", () => {
      const memories = [
        createMemory(MemoryType.WEAKNESS, "Weak in fractions"),
        createMemory(MemoryType.STRENGTH, "Good at algebra"),
        createMemory(MemoryType.LEARNING_PREFERENCE, "Prefers examples"),
      ];

      const summary = ProgressUtils.getMemorySummary(memories);

      expect(summary.totalMemories).toBe(3);
      expect(Object.keys(summary.byType).length).toBe(3);
      expect(summary.weaknesses.length).toBeGreaterThan(0);
      expect(summary.strengths.length).toBeGreaterThan(0);
    });

    it("should get recent memories", () => {
      const memories = Array.from({ length: 10 }, (_, i) =>
        createMemory(MemoryType.WEAKNESS, `Memory ${i}`)
      );

      const summary = ProgressUtils.getMemorySummary(memories);

      expect(summary.recentMemories.length).toBeLessThanOrEqual(5);
    });
  });

  describe("formatProgressReport", () => {
    it("should format progress report", () => {
      const memories = [
        createMemory(MemoryType.WEAKNESS, "Weak in math", "Mathematics"),
        createMemory(MemoryType.STRENGTH, "Good at reading", "English"),
      ];

      const report = ProgressUtils.generateProgressReport(memories);
      const formatted = ProgressUtils.formatProgressReport(report);

      expect(formatted).toContain("Progress Report");
      expect(formatted).toContain("Stats");
      expect(formatted).toContain("%");
    });

    it("should handle empty report", () => {
      const report = ProgressUtils.generateProgressReport([]);
      const formatted = ProgressUtils.formatProgressReport(report);

      expect(formatted).toContain("Progress Report");
      expect(formatted).toContain("0");
    });
  });

  describe("formatStudyRecommendation", () => {
    it("should format study recommendation", () => {
      const rec = {
        subject: "Mathematics",
        topic: "Calculus",
        reason: "Let's improve your calculus skills",
        difficulty: "intermediate" as const,
        estimatedTime: 20,
      };

      const formatted = ProgressUtils.formatStudyRecommendation(rec);

      expect(formatted).toContain("Study Recommendation");
      expect(formatted).toContain("Mathematics");
      expect(formatted).toContain("Calculus");
      expect(formatted).toContain("20 minutes");
    });
  });

  describe("formatMemorySummary", () => {
    it("should format memory summary", () => {
      const memories = [
        createMemory(MemoryType.WEAKNESS, "Weak in math"),
        createMemory(MemoryType.STRENGTH, "Good at reading"),
      ];

      const summary = ProgressUtils.getMemorySummary(memories);
      const formatted = ProgressUtils.formatMemorySummary(summary);

      expect(formatted).toContain("Remember");
      expect(formatted).toContain("Total Memories");
      expect(formatted).toContain("weakness");
    });
  });

  describe("formatDuration", () => {
    it("should format seconds", () => {
      const ms = 30 * 1000; // 30 seconds
      const formatted = formatDuration(ms);

      expect(formatted).toContain("s ago");
    });

    it("should format minutes", () => {
      const ms = 5 * 60 * 1000; // 5 minutes
      const formatted = formatDuration(ms);

      expect(formatted).toContain("m ago");
    });

    it("should format hours", () => {
      const ms = 2 * 60 * 60 * 1000; // 2 hours
      const formatted = formatDuration(ms);

      expect(formatted).toContain("h ago");
    });

    it("should format days", () => {
      const ms = 3 * 24 * 60 * 60 * 1000; // 3 days
      const formatted = formatDuration(ms);

      expect(formatted).toContain("d ago");
    });
  });

  describe("formatMemory", () => {
    it("should format memory", () => {
      const memory = createMemory(MemoryType.WEAKNESS, "Weak in algebra");
      const formatted = formatMemory(memory);

      expect(formatted).toContain("weakness");
      expect(formatted).toContain("Weak in algebra");
      expect(formatted).toContain("ago");
    });

    it("should truncate very old memories", () => {
      const oldMemory: StudentMemory = {
        type: MemoryType.STRENGTH,
        content: "Good at geometry",
        metadata: {},
        timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
        confidence: 0.9,
        sourceInteraction: "test",
      };

      const formatted = formatMemory(oldMemory);

      expect(formatted).toContain("strength");
      expect(formatted).toContain("d ago");
    });
  });

  describe("edge cases", () => {
    it("should handle memories without subject", () => {
      const memories = [
        createMemory(MemoryType.LEARNING_PREFERENCE, "Prefers examples"),
      ];

      const report = ProgressUtils.generateProgressReport(memories);

      expect(report).toBeDefined();
      expect(report.totalMemories).toBe(1);
    });

    it("should handle all memory types", () => {
      const types = [
        MemoryType.LEARNING_GOAL,
        MemoryType.LEARNING_PREFERENCE,
        MemoryType.WEAKNESS,
        MemoryType.MISCONCEPTION,
        MemoryType.REPEATED_MISTAKE,
        MemoryType.STRENGTH,
        MemoryType.STUDY_HABIT,
      ];

      const memories = types.map((type) =>
        createMemory(type, `Test ${type}`)
      );

      const summary = ProgressUtils.getMemorySummary(memories);

      expect(summary.totalMemories).toBe(types.length);
      expect(Object.keys(summary.byType).length).toBeGreaterThan(0);
    });
  });
});
