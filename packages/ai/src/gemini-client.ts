import { GoogleGenAI } from "@google/genai";
import { logger } from "@novera/shared";

export interface GeminiConfig {
  apiKey: string;
  model: string;
}

export interface TutorContext {
  studentMessage: string;
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
  walrusMemories: string[];
}

const SYSTEM_PROMPT = `You are Novera — a direct, sharp personal AI tutor. You teach like a brilliant friend who happens to know everything: clear, honest, no fluff.

CORE BEHAVIOR:
- Get to the point. Don't open with "Great question!" or "Sure!" or any filler.
- Teach the actual thing they asked about immediately.
- Use concrete examples, analogies, and step-by-step breakdowns when explaining concepts.
- If they say "I don't understand" or show confusion, simplify — don't repeat the same explanation louder.
- If they give you wrong information, correct it kindly but clearly.
- Ask a single focused follow-up question when it would genuinely help you teach them better. Never ask multiple questions at once.
- Keep responses focused. Don't pad. Don't summarize what you just said.

MEMORY:
- You have access to facts recalled from Walrus Memory about this student's history.
- Use these facts to personalize your response — reference their level, their goals, their known gaps.
- If you learn something new and significant about the student (their level, subject, goal, struggle), note it naturally in your response without announcing it.

FORMAT:
- Use plain text for conversational replies.
- Use *bold* for key terms only when it genuinely helps.
- Use numbered steps when explaining a process.
- Keep responses under 300 words unless a concept genuinely requires more depth.
- Never use bullet points for a list of 1-2 items. Just write a sentence.

TONE:
- Warm but direct. Like a senior student tutoring a junior — not a professor lecturing.
- Don't be overly enthusiastic. Don't say "absolutely", "certainly", "of course".
- If a student is clearly struggling, be patient and encouraging — but still direct.`;

export class GeminiClient {
  private ai: GoogleGenAI;
  private model: string;

  constructor(config: GeminiConfig) {
    this.ai = new GoogleGenAI({ apiKey: config.apiKey });
    this.model = config.model;
    logger.info("Gemini client initialized", { model: config.model });
  }

  /**
   * Generate a tutoring reply. Returns a plain string.
   */
  async tutor(context: TutorContext): Promise<string> {
    let prompt = SYSTEM_PROMPT + "\n\n";

    if (context.walrusMemories.length > 0) {
      prompt += "STUDENT MEMORY (from Walrus):\n";
      context.walrusMemories.forEach((m) => { prompt += `- ${m}\n`; });
      prompt += "\n";
    }

    // Inject prior history (exclude the current user message which is in studentMessage)
    const history = context.conversationHistory.slice(0, -1);
    if (history.length > 0) {
      prompt += "CONVERSATION SO FAR:\n";
      history.forEach((msg) => {
        const role = msg.role === "user" ? "Student" : "Novera";
        prompt += `${role}: ${msg.content}\n`;
      });
      prompt += "\n";
    }

    prompt += `Student: ${context.studentMessage}\nNovera:`;

    logger.debug("Calling Gemini", {
      model: this.model,
      memoryCount: context.walrusMemories.length,
      historyLength: history.length,
      promptLength: prompt.length,
    });

    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: prompt,
    });

    const text = response.text?.trim();
    if (!text) throw new Error("Empty response from Gemini");

    logger.debug("Gemini response received", { length: text.length });
    return text;
  }

  /** Generate a quiz question (used by quiz-engine) */
  async generateQuestion(
    subject: string,
    topic: string,
    difficulty: "beginner" | "intermediate" | "advanced",
    targetedWeakness?: string
  ): Promise<{ question: string; options?: string[]; correctAnswer: string; explanation: string }> {
    const extra = targetedWeakness ? `, focusing on: ${targetedWeakness}` : "";
    const prompt = `Generate a ${difficulty} ${subject} question about ${topic}${extra}. Reply with JSON only: { "question": "...", "correctAnswer": "...", "explanation": "..." }`;
    const response = await this.ai.models.generateContent({ model: this.model, contents: prompt });
    const text = response.text ?? "";
    try {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
    } catch { /* fall through */ }
    return { question: "What is an important concept here?", correctAnswer: "See explanation.", explanation: text };
  }

  /** Grade a student answer (used by quiz-engine) */
  async gradeAnswer(
    question: string,
    studentAnswer: string,
    correctAnswer: string
  ): Promise<{ correct: boolean; score: number; feedback: string; misconception?: string }> {
    const prompt = `Question: ${question}\nStudent answer: ${studentAnswer}\nCorrect answer: ${correctAnswer}\nReply with JSON only: { "correct": true/false, "score": 0-1, "feedback": "...", "misconception": "optional" }`;
    const response = await this.ai.models.generateContent({ model: this.model, contents: prompt });
    const text = response.text ?? "";
    try {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
    } catch { /* fall through */ }
    return { correct: false, score: 0.5, feedback: text || "Good effort." };
  }
}
