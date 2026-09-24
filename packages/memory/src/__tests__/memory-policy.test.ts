import { describe, it, expect } from "vitest";
import { evaluateMemory, extractMemoryCandidates } from "../memory-policy";
import { MemoryType } from "@novera/shared";
import type { StudentMemory } from "@novera/shared";

describe("Memory Policy", () => {
  describe("evaluateMemory", () => {
    it("should approve durable memory types", () => {
      const memory: StudentMemory = {
        type: MemoryType.LEARNING_GOAL,
        content: "Student wants to improve calculus skills for the upcoming exam",
        metadata: { subject: "Mathematics" },
        timestamp: Date.now(),
        confidence: 0.85,
        sourceInteraction: "student message",
      };

      const decision = evaluateMemory(memory);

      expect(decision.shouldRemember).toBe(true);
      expect(decision.confidence).toBeGreaterThan(0);
    });

    it("should reject non-durable memory types", () => {
      const memory: StudentMemory = {
        type: MemoryType.SUBJECT,
        content: "This is a transient interaction",
        metadata: {},
        timestamp: Date.now(),
        confidence: 0.6,
        sourceInteraction: "chat",
      };

      const decision = evaluateMemory(memory);

      expect(decision.shouldRemember).toBe(false);
      expect(decision.reason).toContain("not durable");
    });

    it("should reject content that is too short", () => {
      const memory: StudentMemory = {
        type: MemoryType.LEARNING_PREFERENCE,
        content: "short",
        metadata: {},
        timestamp: Date.now(),
        confidence: 0.9,
        sourceInteraction: "test",
      };

      const decision = evaluateMemory(memory);

      expect(decision.shouldRemember).toBe(false);
      expect(decision.reason).toContain("too short");
    });

    it("should reject excluded patterns", () => {
      const patterns = [
        { type: MemoryType.WEAKNESS, content: "hi" },
        { type: MemoryType.WEAKNESS, content: "thanks" },
        { type: MemoryType.WEAKNESS, content: "goodbye" },
        { type: MemoryType.WEAKNESS, content: "lol" },
      ];

      for (const { type, content } of patterns) {
        const memory: StudentMemory = {
          type,
          content,
          metadata: {},
          timestamp: Date.now(),
          confidence: 0.9,
          sourceInteraction: "test",
        };

        const decision = evaluateMemory(memory);
        expect(decision.shouldRemember).toBe(false);
      }
    });

    it("should reject memories without source interaction", () => {
      const memory: StudentMemory = {
        type: MemoryType.MISCONCEPTION,
        content: "This is a valid misconception about gravity",
        metadata: { subject: "Physics" },
        timestamp: Date.now(),
        confidence: 0.8,
        sourceInteraction: undefined as unknown as string,
      };

      const decision = evaluateMemory(memory);

      expect(decision.shouldRemember).toBe(false);
    });

    it("should reject low confidence memories", () => {
      const memory: StudentMemory = {
        type: MemoryType.WEAKNESS,
        content: "This might be a weakness but we are not sure",
        metadata: { subject: "Mathematics" },
        timestamp: Date.now(),
        confidence: 0.3,
        sourceInteraction: "detected pattern",
      };

      const decision = evaluateMemory(memory);

      expect(decision.shouldRemember).toBe(false);
    });

    it("should approve all durable types at confidence threshold", () => {
      const durableTypes = [
        MemoryType.LEARNING_GOAL,
        MemoryType.LEARNING_PREFERENCE,
        MemoryType.MISCONCEPTION,
        MemoryType.WEAKNESS,
        MemoryType.REPEATED_MISTAKE,
      ];

      for (const type of durableTypes) {
        const memory: StudentMemory = {
          type,
          content: "This is a substantial piece of information about the student",
          metadata: { subject: "TestSubject" },
          timestamp: Date.now(),
          confidence: 0.75,
          sourceInteraction: "student interaction",
        };

        const decision = evaluateMemory(memory);
        expect(decision.shouldRemember).toBe(true);
      }
    });
  });

  describe("extractMemoryCandidates", () => {
    it("should extract learning preference signals", () => {
      const studentMsg = "I prefer learning with visual diagrams";
      const candidates = extractMemoryCandidates(studentMsg, "Response");

      expect(candidates.length).toBeGreaterThan(0);
      expect(candidates[0].type).toBe(MemoryType.LEARNING_PREFERENCE);
    });

    it("should extract goal signals", () => {
      const studentMsg = "My goal is to pass the calculus exam";
      const candidates = extractMemoryCandidates(studentMsg, "Response");

      expect(candidates.length).toBeGreaterThan(0);
      expect(candidates[0].type).toBe(MemoryType.LEARNING_GOAL);
    });

    it("should include subject in metadata", () => {
      const studentMsg = "I prefer examples";
      const candidates = extractMemoryCandidates(studentMsg, "Response", "Physics");

      expect(candidates[0].metadata?.subject).toBe("Physics");
    });

    it("should assign confidence to extracted candidates", () => {
      const studentMsg = "I prefer learning with coding exercises";
      const candidates = extractMemoryCandidates(studentMsg, "Response");

      expect(candidates.length).toBeGreaterThan(0);
      expect(candidates[0].confidence).toBeGreaterThan(0);
    });
  });
});