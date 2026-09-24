import { logger } from "@novera/shared";
import {
  getSubjectProgress,
  getUniqueSubjects,
  getWeaknesses,
  getStrengths,
  getRecentMemories,
} from "@novera/core";
import type { StudentMemory } from "@novera/shared";

/**
 * Progress report for a student
 */
export interface ProgressReport {
  totalMemories: number;
  subjects: string[];
  recentProgress: {
    subject: string;
    totalMemories: number;
    weaknesses: string[];
    strengths: string[];
    topics: string[];
  }[];
  overallStrength: number;
  recommendedFocus: string;
}

/**
 * Study recommendation
 */
export interface StudyRecommendation {
  subject: string;
  topic: string;
  reason: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: number;
}

/**
 * Memory summary
 */
export interface MemorySummary {
  totalMemories: number;
  byType: Record<string, number>;
  recentMemories: StudentMemory[];
  strengths: string[];
  weaknesses: string[];
}

/**
 * Progress & utilities manager
 */
export class ProgressUtils {
  /**
   * Generate progress report
   */
  static generateProgressReport(
    studentMemories: StudentMemory[]
  ): ProgressReport {
    try {
      const subjects = getUniqueSubjects(studentMemories);
      const totalMemories = studentMemories.length;
      const weaknesses = getWeaknesses(studentMemories, 3);
      const strengths = getStrengths(studentMemories);

      // Calculate overall strength (0-100)
      const overallStrength = this.calculateOverallStrength(
        strengths.length,
        weaknesses.length,
        totalMemories
      );

      // Generate per-subject progress
      const recentProgress = subjects.map((subject) => {
        const progress = getSubjectProgress(studentMemories, subject);
        return {
          subject,
          totalMemories: progress.totalMemories,
          weaknesses: progress.weaknesses.slice(0, 2),
          strengths: progress.strengths.slice(0, 2),
          topics: progress.topics.slice(0, 3),
        };
      });

      // Determine recommended focus
      const recommendedFocus =
        weaknesses.length > 0
          ? `Focus on: ${weaknesses[0]}`
          : `Keep building! You're doing great in ${subjects[0] || "your studies"}`;

      logger.debug("Progress report generated", {
        totalMemories,
        subjectCount: subjects.length,
        overallStrength,
      });

      return {
        totalMemories,
        subjects,
        recentProgress,
        overallStrength,
        recommendedFocus,
      };
    } catch (error) {
      logger.error("Failed to generate progress report", error as Error);
      return {
        totalMemories: 0,
        subjects: [],
        recentProgress: [],
        overallStrength: 0,
        recommendedFocus: "Start learning to track progress!",
      };
    }
  }

  /**
   * Generate study recommendation
   */
  static generateStudyRecommendation(
    studentMemories: StudentMemory[]
  ): StudyRecommendation | null {
    try {
      const subjects = getUniqueSubjects(studentMemories);
      if (subjects.length === 0) {
        return null;
      }

      // Find subject with most weaknesses
      let targetSubject = subjects[0];
      let maxWeaknesses = 0;

      for (const subject of subjects) {
        const progress = getSubjectProgress(studentMemories, subject);
        if (progress.weaknesses.length > maxWeaknesses) {
          maxWeaknesses = progress.weaknesses.length;
          targetSubject = subject;
        }
      }

      const subjectProgress = getSubjectProgress(
        studentMemories,
        targetSubject
      );
      const targetTopic =
        subjectProgress.topics[0] || "Core Concepts";
      const targetWeakness =
        subjectProgress.weaknesses[0] || targetTopic;

      // Determine difficulty based on progress
      let difficulty: "beginner" | "intermediate" | "advanced" = "beginner";
      if (subjectProgress.totalMemories > 5) {
        difficulty = "intermediate";
      }
      if (subjectProgress.totalMemories > 10) {
        difficulty = "advanced";
      }

      logger.info("Study recommendation generated", {
        subject: targetSubject,
        topic: targetTopic,
        difficulty,
      });

      return {
        subject: targetSubject,
        topic: targetTopic,
        reason: `Let's work on ${targetWeakness} to strengthen your foundation`,
        difficulty,
        estimatedTime: 15,
      };
    } catch (error) {
      logger.error("Failed to generate study recommendation", error as Error);
      return null;
    }
  }

  /**
   * Get memory summary
   */
  static getMemorySummary(studentMemories: StudentMemory[]): MemorySummary {
    try {
      const byType: Record<string, number> = {};
      for (const memory of studentMemories) {
        byType[memory.type] = (byType[memory.type] || 0) + 1;
      }

      const recentMemories = getRecentMemories(studentMemories, 5);
      const weaknesses = getWeaknesses(studentMemories, 5);
      const strengths = getStrengths(studentMemories);

      logger.debug("Memory summary generated", {
        totalMemories: studentMemories.length,
        typeCount: Object.keys(byType).length,
      });

      return {
        totalMemories: studentMemories.length,
        byType,
        recentMemories,
        strengths: strengths.slice(0, 3),
        weaknesses,
      };
    } catch (error) {
      logger.error("Failed to get memory summary", error as Error);
      return {
        totalMemories: 0,
        byType: {},
        recentMemories: [],
        strengths: [],
        weaknesses: [],
      };
    }
  }

  /**
   * Format progress report for display
   */
  static formatProgressReport(report: ProgressReport): string {
    const header = `📊 **Your Progress Report**\n\n`;
    const stats = `**Stats:**\n` +
      `• Total Memories: ${report.totalMemories}\n` +
      `• Subjects: ${report.subjects.length > 0 ? report.subjects.join(", ") : "None yet"}\n` +
      `• Overall Strength: ${report.overallStrength}%\n\n`;

    const focus = `**${report.recommendedFocus}**\n\n`;

    const subjectDetails = report.recentProgress
      .slice(0, 3)
      .map(
        (s) =>
          `📚 **${s.subject}** (${s.totalMemories} memories)\n` +
          (s.weaknesses.length > 0 ? `  Weaknesses: ${s.weaknesses.join(", ")}\n` : "") +
          (s.strengths.length > 0 ? `  Strengths: ${s.strengths.join(", ")}\n` : "") +
          (s.topics.length > 0 ? `  Topics: ${s.topics.join(", ")}\n` : "")
      )
      .join("\n");

    return header + stats + focus + subjectDetails;
  }

  /**
   * Format study recommendation for display
   */
  static formatStudyRecommendation(rec: StudyRecommendation): string {
    return (
      `📖 **Study Recommendation**\n\n` +
      `**${rec.subject} > ${rec.topic}**\n` +
      `${rec.reason}\n\n` +
      `📈 Difficulty: ${rec.difficulty.charAt(0).toUpperCase() + rec.difficulty.slice(1)}\n` +
      `⏱️ Estimated time: ${rec.estimatedTime} minutes`
    );
  }

  /**
   * Format memory summary for display
   */
  static formatMemorySummary(summary: MemorySummary): string {
    const header = `🧠 **What I Remember About You**\n\n`;
    const totalMemories = `**Total Memories:** ${summary.totalMemories}\n\n`;

    const memoryTypes = Object.entries(summary.byType)
      .map(
        ([type, count]) =>
          `• ${type.replace(/_/g, " ")}: ${count}`
      )
      .join("\n");

    const strengths =
      summary.strengths.length > 0
        ? `\n\n**Your Strengths:** 💪\n${summary.strengths.slice(0, 3).map((s) => `• ${s}`).join("\n")}`
        : "";

    const weaknesses =
      summary.weaknesses.length > 0
        ? `\n\n**Areas to Work On:** 🎯\n${summary.weaknesses.slice(0, 3).map((w) => `• ${w}`).join("\n")}`
        : "";

    const recent =
      summary.recentMemories.length > 0
        ? `\n\n**Recent Memories:** 📝\n${summary.recentMemories
            .slice(0, 2)
            .map((m) => `• ${m.content.substring(0, 50)}...`)
            .join("\n")}`
        : "";

    return (
      header +
      totalMemories +
      memoryTypes +
      strengths +
      weaknesses +
      recent
    );
  }

  /**
   * Calculate overall strength score
   */
  private static calculateOverallStrength(
    strengthCount: number,
    weaknessCount: number,
    totalMemories: number
  ): number {
    if (totalMemories === 0) return 0;

    // Base score from strengths vs weaknesses ratio
    const ratio = strengthCount / (weaknessCount + 1);
    const baseScore = Math.min(ratio * 20, 50);

    // Bonus for having more memories (learning engagement)
    const memoryBonus = Math.min((totalMemories / 50) * 30, 30);

    // Strength bonus
    const strengthBonus = Math.min(strengthCount * 5, 20);

    const total = baseScore + memoryBonus + strengthBonus;
    return Math.min(Math.round(total), 100);
  }
}

/**
 * Format time duration
 */
export const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
};

/**
 * Format memory for display
 */
export const formatMemory = (memory: StudentMemory): string => {
  const age = formatDuration(Date.now() - memory.timestamp);
  const type = memory.type.replace(/_/g, " ").toLowerCase();
  return `[${type}] ${memory.content} (${age})`;
};
