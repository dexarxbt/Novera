import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemWalClient } from "../memwal-client.js";

// Mock the real SDK so tests don't hit the network
vi.mock("@mysten-incubation/memwal", () => ({
  MemWal: {
    create: vi.fn().mockReturnValue({
      remember: vi.fn().mockResolvedValue({ job_id: "job_test_123" }),
      recall: vi.fn().mockResolvedValue({
        results: [
          { text: "Student prefers visual examples", distance: 0.1 },
          { text: "Studying calculus at university level", distance: 0.2 },
        ],
      }),
      analyze: vi.fn().mockResolvedValue({ facts: ["fact1"], job_ids: ["job_1"] }),
      restore: vi.fn().mockResolvedValue({ restored: 2, skipped: 0, failed: 0, total: 2 }),
      health: vi.fn().mockResolvedValue({ status: "ok" }),
    }),
  },
}));

describe("MemWalClient", () => {
  let client: MemWalClient;

  const testConfig = {
    delegateKey: "0xdeadbeef",
    accountId: "0xaccountid",
    serverUrl: "https://relayer.memory.walrus.xyz",
    namespace: "novera",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    client = new MemWalClient(testConfig);
  });

  it("initializes without throwing", () => {
    expect(client).toBeDefined();
  });

  it("remember stores a fact and returns job id", async () => {
    const jobId = await client.remember(42, "Student is studying calculus");
    expect(jobId).toBe("job_test_123");
  });

  it("recall returns memories for a query", async () => {
    const results = await client.recall(42, "calculus", 5);
    expect(results).toHaveLength(2);
    expect(results[0].text).toContain("visual examples");
    expect(results[0].distance).toBe(0.1);
  });

  it("analyzeAndStore calls analyze without throwing", async () => {
    await expect(
      client.analyzeAndStore(42, "I am struggling with derivatives", "Let me explain derivatives...")
    ).resolves.not.toThrow();
  });

  it("health returns true when relayer is ok", async () => {
    const ok = await client.health();
    expect(ok).toBe(true);
  });

  it("restore runs for a given user", async () => {
    await expect(client.restore(42)).resolves.not.toThrow();
  });

  it("uses isolated namespaces per user", async () => {
    const { MemWal } = await import("@mysten-incubation/memwal");
    const mockInstance = MemWal.create({ key: "x", accountId: "x", serverUrl: "x", namespace: "x" });
    const mockRecall = (mockInstance as any).recall;

    await client.recall(1, "test");
    await client.recall(2, "test");

    expect(mockRecall).toHaveBeenCalledTimes(2);
    expect(mockRecall.mock.calls[0][0]).toMatchObject({ namespace: "novera:user:1" });
    expect(mockRecall.mock.calls[1][0]).toMatchObject({ namespace: "novera:user:2" });
  });

  it("recall returns empty array on SDK error (non-fatal)", async () => {
    const { MemWal } = await import("@mysten-incubation/memwal");
    const mockInstance = MemWal.create({ key: "x", accountId: "x", serverUrl: "x", namespace: "x" });
    (mockInstance as any).recall.mockRejectedValueOnce(new Error("Network error"));

    const results = await client.recall(99, "anything");
    expect(results).toEqual([]);
  });

  it("remember returns null on SDK error (non-fatal)", async () => {
    const { MemWal } = await import("@mysten-incubation/memwal");
    const mockInstance = MemWal.create({ key: "x", accountId: "x", serverUrl: "x", namespace: "x" });
    (mockInstance as any).remember.mockRejectedValueOnce(new Error("Auth error"));

    const jobId = await client.remember(99, "some fact");
    expect(jobId).toBeNull();
  });
});
