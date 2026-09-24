import { describe, it, expect } from "vitest";
import { detectIntent, extractSubjectTopic, MessageIntent } from "../conversation";

describe("Conversation Intent Detection", () => {
  describe("detectIntent", () => {
    it("should detect greeting", () => {
      expect(detectIntent("Hi")).toBe(MessageIntent.GREETING);
      expect(detectIntent("hello")).toBe(MessageIntent.GREETING);
      expect(detectIntent("Hey!")).toBe(MessageIntent.GREETING);
    });

    it("should detect confusion", () => {
      expect(detectIntent("I don't understand")).toBe(MessageIntent.CONFUSION);
      expect(detectIntent("I'm stuck on this")).toBe(MessageIntent.CONFUSION);
      expect(detectIntent("This is confusing")).toBe(MessageIntent.CONFUSION);
    });

    it("should detect questions", () => {
      expect(detectIntent("What is calculus?")).toBe(MessageIntent.QUESTION);
      expect(detectIntent("How do I solve this?")).toBe(MessageIntent.QUESTION);
      expect(detectIntent("Can you explain?")).toBe(MessageIntent.QUESTION);
    });

    it("should detect goal setting", () => {
      expect(detectIntent("I'm preparing for an exam")).toBe(MessageIntent.GOAL_SETTING);
      expect(detectIntent("My goal is to understand physics")).toBe(MessageIntent.GOAL_SETTING);
      expect(detectIntent("I want to study")).toBe(MessageIntent.GOAL_SETTING);
    });

    it("should detect quiz request", () => {
      expect(detectIntent("Quiz me")).toBe(MessageIntent.QUIZ_REQUEST);
      expect(detectIntent("Can I do some practice questions?")).toBe(MessageIntent.QUIZ_REQUEST);
      expect(detectIntent("Give me a test")).toBe(MessageIntent.QUIZ_REQUEST);
    });

    it("should default to OTHER for unknown intents", () => {
      expect(detectIntent("The weather is nice")).toBe(MessageIntent.OTHER);
    });
  });

  describe("extractSubjectTopic", () => {
    it("should extract mathematics", () => {
      const result = extractSubjectTopic("I need help with calculus");
      expect(result.subject).toBe("Mathematics");
    });

    it("should extract physics", () => {
      const result = extractSubjectTopic("Teach me physics");
      expect(result.subject).toBe("Physics");
    });

    it("should extract computer science", () => {
      const result = extractSubjectTopic("I'm learning Python");
      expect(result.subject).toBe("Computer Science");
    });

    it("should return empty object if no subject found", () => {
      const result = extractSubjectTopic("Tell me something");
      expect(result.subject).toBeUndefined();
    });
  });
});
