import { describe, it, expect, vi } from "vitest";
import { auditContract } from "./audit.js";

describe("auditContract", () => {
  it("parses valid audit JSON response", async () => {
    const mockResult = {
      summary: "Test contract with one reentrancy issue.",
      severity: {
        critical: [{ title: "Reentrancy", description: "desc", location: "withdraw()", recommendation: "CEI pattern" }],
        high: [], medium: [], low: [], info: [],
      },
      gasOptimizations: ["Use uint256 instead of uint8 for loop counters"],
      overallScore: "D — Critical reentrancy vulnerability",
      recommendation: "Fix reentrancy before deployment.",
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ type: "text", text: JSON.stringify(mockResult) }],
      }),
    } as unknown as Response);

    const result = await auditContract("contract Foo {}", "test-key");
    expect(result.severity.critical).toHaveLength(1);
    expect(result.severity.critical[0].title).toBe("Reentrancy");
    expect(result.overallScore).toContain("D");
  });

  it("throws on API error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "Unauthorized",
    } as unknown as Response);

    await expect(auditContract("contract Foo {}", "bad-key")).rejects.toThrow("401");
  });
});
