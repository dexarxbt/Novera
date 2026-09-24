import { MemWal } from "@mysten-incubation/memwal";
import { logger } from "@novera/shared";

/**
 * Walrus Memory client — real mainnet integration.
 * Uses @mysten-incubation/memwal SDK.
 * Each user gets an isolated namespace: novera:user:{userId}
 */

export interface MemWalConfig {
  delegateKey: string;
  accountId: string;
  serverUrl: string;
  namespace: string;
}

export interface RecalledMemory {
  text: string;
  distance: number;
}

export class MemWalClient {
  private client: MemWal;
  private baseNamespace: string;

  constructor(config: MemWalConfig) {
    this.client = MemWal.create({
      key: config.delegateKey,
      accountId: config.accountId,
      serverUrl: config.serverUrl,
      namespace: config.namespace,
    });
    this.baseNamespace = config.namespace;
    logger.info("MemWal client initialized", {
      serverUrl: config.serverUrl,
      namespace: config.namespace,
    });
  }

  /**
   * User-scoped namespace — full isolation between students.
   */
  private ns(userId: number): string {
    return `${this.baseNamespace}:user:${userId}`;
  }

  /**
   * Analyze a conversation exchange and extract + store facts on Walrus.
   * Uses the SDK's built-in fact extraction — fires and doesn't block the reply.
   */
  async analyzeAndStore(
    userId: number,
    userMessage: string,
    botReply: string
  ): Promise<void> {
    const ns = this.ns(userId);
    const text = `Student: ${userMessage}\nTutor: ${botReply}`;
    try {
      // analyze() extracts facts and queues background jobs — returns fast
      const result = await this.client.analyze(text, ns);
      logger.info("Memory analysis queued", {
        userId,
        namespace: ns,
        factsExtracted: result.facts?.length ?? 0,
        jobIds: result.job_ids?.length ?? 0,
      });
    } catch (error) {
      // Never block the conversation for a memory write failure
      logger.warn("Memory analysis failed (non-fatal)", {
        userId,
        error: (error as Error).message,
      });
    }
  }

  /**
   * Store a single explicit fact about the student.
   * Returns the job id (fire-and-forget — we don't wait for it).
   */
  async remember(userId: number, fact: string): Promise<string | null> {
    const ns = this.ns(userId);
    try {
      const accepted = await this.client.remember(fact, ns);
      logger.info("Memory stored", { userId, namespace: ns, jobId: accepted.job_id });
      return accepted.job_id;
    } catch (error) {
      logger.warn("Memory store failed (non-fatal)", {
        userId,
        error: (error as Error).message,
      });
      return null;
    }
  }

  /**
   * Recall memories relevant to a query.
   * Returns plaintext strings the tutor can inject into its context.
   */
  async recall(userId: number, query: string, limit = 8): Promise<RecalledMemory[]> {
    const ns = this.ns(userId);
    try {
      const result = await this.client.recall({
        query,
        limit,
        namespace: ns,
      });
      const memories = result.results.map((r) => ({
        text: r.text,
        distance: r.distance,
      }));
      logger.info("Memories recalled", {
        userId,
        namespace: ns,
        count: memories.length,
      });
      return memories;
    } catch (error) {
      logger.warn("Memory recall failed (non-fatal)", {
        userId,
        error: (error as Error).message,
      });
      return [];
    }
  }

  /**
   * Check health of the Walrus Memory relayer.
   */
  async health(): Promise<boolean> {
    try {
      const result = await this.client.health();
      return result.status === "ok";
    } catch {
      return false;
    }
  }

  /**
   * Restore index for a user's namespace (call on first session or after gaps).
   */
  async restore(userId: number): Promise<void> {
    const ns = this.ns(userId);
    try {
      const result = await this.client.restore(ns);
      logger.info("Namespace restored", {
        userId,
        namespace: ns,
        restored: result.restored,
        skipped: result.skipped,
      });
    } catch (error) {
      logger.warn("Namespace restore failed (non-fatal)", {
        userId,
        error: (error as Error).message,
      });
    }
  }
}
