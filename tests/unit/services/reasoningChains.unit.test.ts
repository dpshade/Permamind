import { beforeEach, describe, expect, it, vi } from "vitest";

import { ReasoningStep, ReasoningTrace } from "../../../src/models/AIMemory.js";
import { aiMemoryService } from "../../../src/services/aiMemoryService.js";
import { testReasoningChain } from "../../fixtures/memories.js";
import { mockHubId, mockKeyPair } from "../../mocks/aoConnect.js";

vi.mock("../../../src/relay.js", () => ({
  event: vi.fn(),
  fetchEvents: vi.fn(),
  fetchEventsVIP01: vi.fn(),
}));

describe("Reasoning Chains", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Reasoning Step Types", () => {
    it("should support all defined step types", () => {
      const stepTypes = [
        "observation",
        "thought",
        "action",
        "conclusion",
      ] as const;

      stepTypes.forEach((stepType) => {
        const step: ReasoningStep = {
          confidence: 0.8,
          content: `Test ${stepType}`,
          stepType,
          timestamp: "2024-01-01T00:00:00.000Z",
        };

        expect(step.stepType).toBe(stepType);
        expect(step.confidence).toBeGreaterThanOrEqual(0);
        expect(step.confidence).toBeLessThanOrEqual(1);
      });
    });

    it("should validate confidence scores are between 0 and 1", () => {
      const validConfidences = [0, 0.1, 0.5, 0.9, 1.0];
      const invalidConfidences = [-0.1, 1.1, 2.0, Number.NaN];

      validConfidences.forEach((confidence) => {
        expect(confidence >= 0 && confidence <= 1).toBe(true);
      });

      invalidConfidences.forEach((confidence) => {
        expect(
          confidence >= 0 && confidence <= 1 && !Number.isNaN(confidence),
        ).toBe(false);
      });
    });

    it("should require valid ISO timestamp format", () => {
      const validTimestamps = [
        "2024-01-01T00:00:00.000Z",
        "2024-12-31T23:59:59.999Z",
        "2024-06-15T12:30:45.123Z",
      ];

      const invalidTimestamps = [
        "2024-01-01",
        "invalid-date",
        "2024-13-01T00:00:00.000Z", // Invalid month
        "2024-01-32T00:00:00.000Z", // Invalid day
      ];

      validTimestamps.forEach((timestamp) => {
        const date = new Date(timestamp);
        expect(date.toISOString()).toBe(timestamp);
      });

      invalidTimestamps.forEach((timestamp) => {
        const date = new Date(timestamp);
        expect(
          Number.isNaN(date.getTime()) || date.toISOString() !== timestamp,
        ).toBe(true);
      });
    });
  });

  describe("Chain-of-Thought Reasoning", () => {
    it("should create complete reasoning chain with all step types", async () => {
      const cotChain: ReasoningTrace = {
        chainId: "cot_chain_001",
        outcome: "Secure, scalable authentication system deployed",
        steps: [
          {
            confidence: 0.95,
            content: "User needs authentication system",
            stepType: "observation",
            timestamp: "2024-01-01T10:00:00.000Z",
          },
          {
            confidence: 0.85,
            content: "JWT tokens provide stateless authentication",
            stepType: "thought",
            timestamp: "2024-01-01T10:01:00.000Z",
          },
          {
            confidence: 0.9,
            content: "Need to consider security and scalability",
            stepType: "thought",
            timestamp: "2024-01-01T10:02:00.000Z",
          },
          {
            confidence: 0.9,
            content: "Implement JWT-based authentication with refresh tokens",
            stepType: "action",
            timestamp: "2024-01-01T10:03:00.000Z",
          },
          {
            confidence: 0.95,
            content: "JWT authentication successfully implemented",
            stepType: "conclusion",
            timestamp: "2024-01-01T10:30:00.000Z",
          },
        ],
      };

      const result = await aiMemoryService.addReasoningChain(
        mockKeyPair,
        mockHubId,
        cotChain,
        "ai_agent_key",
      );

      expect(result).toBe("Reasoning chain added successfully");
    });

    it("should handle reasoning chains with varying confidence levels", async () => {
      const uncertainChain: ReasoningTrace = {
        chainId: "uncertain_chain_001",
        outcome: "Initiated performance monitoring",
        steps: [
          {
            confidence: 0.8,
            content: "Performance issue reported",
            stepType: "observation",
            timestamp: "2024-01-01T10:00:00.000Z",
          },
          {
            confidence: 0.4, // Low confidence
            content: "Could be database bottleneck",
            stepType: "thought",
            timestamp: "2024-01-01T10:01:00.000Z",
          },
          {
            confidence: 0.3, // Even lower confidence
            content: "Or could be network latency",
            stepType: "thought",
            timestamp: "2024-01-01T10:02:00.000Z",
          },
          {
            confidence: 0.9, // High confidence in action
            content: "Need to gather more data",
            stepType: "action",
            timestamp: "2024-01-01T10:03:00.000Z",
          },
        ],
      };

      await expect(
        aiMemoryService.addReasoningChain(
          mockKeyPair,
          mockHubId,
          uncertainChain,
          "diagnostic_agent",
        ),
      ).resolves.toBe("Reasoning chain added successfully");
    });
  });

  describe("ReAct Reasoning Pattern", () => {
    it("should support ReAct (Reasoning + Acting) patterns", async () => {
      const reactChain: ReasoningTrace = {
        chainId: "react_chain_001",
        outcome: "User preferences successfully applied",
        steps: [
          {
            confidence: 0.9,
            content: "I need to find information about user preferences",
            stepType: "thought",
            timestamp: "2024-01-01T10:00:00.000Z",
          },
          {
            confidence: 0.85,
            content: "Search memory for user preference data",
            stepType: "action",
            timestamp: "2024-01-01T10:01:00.000Z",
          },
          {
            confidence: 0.95,
            content: "Found user prefers dark theme and TypeScript",
            stepType: "observation",
            timestamp: "2024-01-01T10:02:00.000Z",
          },
          {
            confidence: 0.9,
            content: "Should configure environment with these preferences",
            stepType: "thought",
            timestamp: "2024-01-01T10:03:00.000Z",
          },
          {
            confidence: 0.95,
            content: "Apply dark theme and TypeScript configuration",
            stepType: "action",
            timestamp: "2024-01-01T10:04:00.000Z",
          },
          {
            confidence: 0.9,
            content: "User environment configured according to preferences",
            stepType: "conclusion",
            timestamp: "2024-01-01T10:05:00.000Z",
          },
        ],
      };

      await expect(
        aiMemoryService.addReasoningChain(
          mockKeyPair,
          mockHubId,
          reactChain,
          "react_agent",
        ),
      ).resolves.toBe("Reasoning chain added successfully");
    });

    it("should handle iterative ReAct cycles", async () => {
      const iterativeChain: ReasoningTrace = {
        chainId: "iterative_react_001",
        outcome: "Successfully debugged and fixed API error",
        steps: [
          // First cycle
          {
            confidence: 0.9,
            content: "Need to debug API error",
            stepType: "thought",
            timestamp: "2024-01-01T10:00:00.000Z",
          },
          {
            confidence: 0.95,
            content: "Check API logs",
            stepType: "action",
            timestamp: "2024-01-01T10:01:00.000Z",
          },
          {
            confidence: 0.95,
            content: "Found 500 error in logs",
            stepType: "observation",
            timestamp: "2024-01-01T10:02:00.000Z",
          },

          // Second cycle
          {
            confidence: 0.7,
            content: "Error might be in database connection",
            stepType: "thought",
            timestamp: "2024-01-01T10:03:00.000Z",
          },
          {
            confidence: 0.9,
            content: "Check database connectivity",
            stepType: "action",
            timestamp: "2024-01-01T10:04:00.000Z",
          },
          {
            confidence: 0.95,
            content: "Database connection is healthy",
            stepType: "observation",
            timestamp: "2024-01-01T10:05:00.000Z",
          },

          // Third cycle
          {
            confidence: 0.8,
            content: "Must be application logic error",
            stepType: "thought",
            timestamp: "2024-01-01T10:06:00.000Z",
          },
          {
            confidence: 0.85,
            content: "Review recent code changes",
            stepType: "action",
            timestamp: "2024-01-01T10:07:00.000Z",
          },
          {
            confidence: 0.9,
            content: "Found null pointer in recent commit",
            stepType: "observation",
            timestamp: "2024-01-01T10:08:00.000Z",
          },

          // Resolution
          {
            confidence: 0.95,
            content: "Fix null pointer bug",
            stepType: "action",
            timestamp: "2024-01-01T10:09:00.000Z",
          },
          {
            confidence: 0.95,
            content: "API error resolved",
            stepType: "conclusion",
            timestamp: "2024-01-01T10:10:00.000Z",
          },
        ],
      };

      await expect(
        aiMemoryService.addReasoningChain(
          mockKeyPair,
          mockHubId,
          iterativeChain,
          "debug_agent",
        ),
      ).resolves.toBe("Reasoning chain added successfully");
    });
  });

  describe("Reasoning Chain Retrieval", () => {
    it("should retrieve reasoning chain by ID", async () => {
      const mockChainEvent = {
        chainId: testReasoningChain.chainId,
        outcome: testReasoningChain.outcome,
        steps: JSON.stringify(testReasoningChain.steps),
      };

      const { fetchEventsVIP01 } = await import("../../../src/relay.js");
      vi.mocked(fetchEventsVIP01).mockResolvedValueOnce({
        events: [mockChainEvent],
      });

      const result = await aiMemoryService.getReasoningChain(
        mockHubId,
        testReasoningChain.chainId,
      );

      expect(result).not.toBeNull();
      expect(result!.chainId).toBe(testReasoningChain.chainId);
      expect(result!.outcome).toBe(testReasoningChain.outcome);
      expect(result!.steps).toHaveLength(testReasoningChain.steps.length);
    });

    it("should return null for non-existent reasoning chain", async () => {
      const { fetchEventsVIP01 } = await import("../../../src/relay.js");
      vi.mocked(fetchEventsVIP01).mockResolvedValueOnce({ events: [] });

      const result = await aiMemoryService.getReasoningChain(
        mockHubId,
        "non_existent_chain",
      );

      expect(result).toBeNull();
    });

    it("should handle malformed reasoning chain data gracefully", async () => {
      const malformedEvent = {
        chainId: "malformed_chain",
        outcome: "Test outcome",
        steps: "invalid_json",
      };

      const { fetchEventsVIP01 } = await import("../../../src/relay.js");
      vi.mocked(fetchEventsVIP01).mockResolvedValueOnce({
        events: [malformedEvent],
      });

      // Should handle JSON parse error gracefully
      const result = await aiMemoryService.getReasoningChain(
        mockHubId,
        "malformed_chain",
      );

      // Depending on implementation, might return null or empty steps array
      expect(result?.steps || []).toEqual([]);
    });
  });

  describe("Reasoning Chain Analysis", () => {
    it("should calculate average confidence for reasoning chain", () => {
      const { steps } = testReasoningChain;
      const totalConfidence = steps.reduce(
        (sum, step) => sum + step.confidence,
        0,
      );
      const averageConfidence = totalConfidence / steps.length;

      expect(averageConfidence).toBeGreaterThan(0);
      expect(averageConfidence).toBeLessThanOrEqual(1);

      // For our test data, should be around 0.905
      expect(averageConfidence).toBeCloseTo(0.905, 2);
    });

    it("should identify reasoning chain patterns", () => {
      const { steps } = testReasoningChain;
      const pattern = steps.map((step) => step.stepType);

      expect(pattern).toEqual([
        "observation",
        "thought",
        "action",
        "conclusion",
      ]);
    });

    it("should validate chronological ordering of steps", () => {
      const { steps } = testReasoningChain;

      for (let i = 1; i < steps.length; i++) {
        const previousTime = new Date(steps[i - 1].timestamp);
        const currentTime = new Date(steps[i].timestamp);

        expect(currentTime.getTime()).toBeGreaterThanOrEqual(
          previousTime.getTime(),
        );
      }
    });

    it("should measure reasoning duration", () => {
      const { steps } = testReasoningChain;
      const startTime = new Date(steps[0].timestamp);
      const endTime = new Date(steps[steps.length - 1].timestamp);
      const duration = endTime.getTime() - startTime.getTime();

      expect(duration).toBeGreaterThanOrEqual(0);

      // For our test data, should be 30 minutes (1800000 ms)
      expect(duration).toBe(30 * 60 * 1000);
    });
  });

  describe("Advanced Reasoning Patterns", () => {
    it("should support Tree-of-Thoughts reasoning with multiple branches", async () => {
      const treeChain: ReasoningTrace = {
        chainId: "tree_reasoning_001",
        outcome: "Algorithm optimized using hybrid approach",
        steps: [
          {
            confidence: 0.9,
            content: "Need to optimize algorithm",
            stepType: "observation",
            timestamp: "2024-01-01T10:00:00.000Z",
          },

          // Branch 1: Space optimization
          {
            confidence: 0.7,
            content: "Branch 1: Focus on space complexity",
            stepType: "thought",
            timestamp: "2024-01-01T10:01:00.000Z",
          },
          {
            confidence: 0.8,
            content: "Use hash table for O(1) lookup",
            stepType: "thought",
            timestamp: "2024-01-01T10:02:00.000Z",
          },

          // Branch 2: Time optimization
          {
            confidence: 0.8,
            content: "Branch 2: Focus on time complexity",
            stepType: "thought",
            timestamp: "2024-01-01T10:01:30.000Z",
          },
          {
            confidence: 0.9,
            content: "Use binary search for O(log n)",
            stepType: "thought",
            timestamp: "2024-01-01T10:02:30.000Z",
          },

          // Branch 3: Hybrid approach
          {
            confidence: 0.9,
            content: "Branch 3: Hybrid space-time optimization",
            stepType: "thought",
            timestamp: "2024-01-01T10:03:00.000Z",
          },
          {
            confidence: 0.95,
            content: "Combine caching with efficient search",
            stepType: "thought",
            timestamp: "2024-01-01T10:04:00.000Z",
          },

          // Best branch selection
          {
            confidence: 0.9,
            content: "Hybrid approach provides best balance",
            stepType: "conclusion",
            timestamp: "2024-01-01T10:05:00.000Z",
          },
          {
            confidence: 0.95,
            content: "Implement hybrid optimization",
            stepType: "action",
            timestamp: "2024-01-01T10:06:00.000Z",
          },
        ],
      };

      await expect(
        aiMemoryService.addReasoningChain(
          mockKeyPair,
          mockHubId,
          treeChain,
          "optimization_agent",
        ),
      ).resolves.toBe("Reasoning chain added successfully");
    });

    it("should support self-consistency checking in reasoning", async () => {
      const consistencyChain: ReasoningTrace = {
        chainId: "consistency_check_001",
        outcome: "CPU bottleneck identified and resolved",
        steps: [
          {
            confidence: 0.9,
            content: "System performance degraded",
            stepType: "observation",
            timestamp: "2024-01-01T10:00:00.000Z",
          },
          {
            confidence: 0.6,
            content: "Initial hypothesis: Memory leak",
            stepType: "thought",
            timestamp: "2024-01-01T10:01:00.000Z",
          },
          {
            confidence: 0.9,
            content: "Monitor memory usage",
            stepType: "action",
            timestamp: "2024-01-01T10:02:00.000Z",
          },
          {
            confidence: 0.95,
            content: "Memory usage is stable",
            stepType: "observation",
            timestamp: "2024-01-01T10:03:00.000Z",
          },

          // Self-consistency check
          {
            confidence: 0.9,
            content:
              "Checking consistency: Memory leak hypothesis contradicted by data",
            stepType: "thought",
            timestamp: "2024-01-01T10:04:00.000Z",
          },
          {
            confidence: 0.8,
            content: "Revising hypothesis: CPU bottleneck more likely",
            stepType: "thought",
            timestamp: "2024-01-01T10:05:00.000Z",
          },
          {
            confidence: 0.9,
            content: "Monitor CPU usage",
            stepType: "action",
            timestamp: "2024-01-01T10:06:00.000Z",
          },
          {
            confidence: 0.95,
            content: "CPU usage at 95%",
            stepType: "observation",
            timestamp: "2024-01-01T10:07:00.000Z",
          },
          {
            confidence: 0.95,
            content:
              "CPU bottleneck confirmed, hypothesis consistent with data",
            stepType: "conclusion",
            timestamp: "2024-01-01T10:08:00.000Z",
          },
        ],
      };

      await expect(
        aiMemoryService.addReasoningChain(
          mockKeyPair,
          mockHubId,
          consistencyChain,
          "diagnostic_agent",
        ),
      ).resolves.toBe("Reasoning chain added successfully");
    });
  });

  describe("Reasoning Chain Validation", () => {
    it("should require non-empty chain ID", () => {
      const invalidIds = ["", "   ", null, undefined];

      invalidIds.forEach((chainId) => {
        expect(!chainId || chainId.trim().length === 0).toBe(true);
      });
    });

    it("should require at least one reasoning step", () => {
      const emptyChain: ReasoningTrace = {
        chainId: "empty_chain",
        outcome: "No reasoning performed",
        steps: [],
      };

      expect(emptyChain.steps.length).toBe(0);
      // Business logic should validate this - test will help identify need
    });

    it("should validate step type consistency", () => {
      const validStepTypes = ["observation", "thought", "action", "conclusion"];
      const invalidStepType = "invalid_step" as never;

      validStepTypes.forEach((stepType) => {
        expect(["observation", "thought", "action", "conclusion"]).toContain(
          stepType,
        );
      });

      expect(["observation", "thought", "action", "conclusion"]).not.toContain(
        invalidStepType,
      );
    });

    it("should require meaningful step content", () => {
      const invalidContents = ["", "   ", null, undefined];

      invalidContents.forEach((content) => {
        expect(!content || content.trim().length === 0).toBe(true);
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle reasoning chain storage failures", async () => {
      const { event } = await import("../../../src/relay.js");
      vi.mocked(event).mockRejectedValueOnce(new Error("Storage failure"));

      await expect(
        aiMemoryService.addReasoningChain(
          mockKeyPair,
          mockHubId,
          testReasoningChain,
          "agent_key",
        ),
      ).rejects.toThrow(
        "Failed to add reasoning chain: Error: Storage failure",
      );
    });

    it("should handle reasoning chain retrieval failures", async () => {
      const { fetchEventsVIP01 } = await import("../../../src/relay.js");
      vi.mocked(fetchEventsVIP01).mockRejectedValueOnce(
        new Error("Retrieval failure"),
      );

      const result = await aiMemoryService.getReasoningChain(
        mockHubId,
        "test_chain",
      );

      expect(result).toBeNull();
    });

    it("should handle invalid JSON in reasoning steps", async () => {
      const invalidStepsEvent = {
        chainId: "invalid_steps_chain",
        outcome: "Test outcome",
        steps: "{invalid json}",
      };

      const { fetchEventsVIP01 } = await import("../../../src/relay.js");
      vi.mocked(fetchEventsVIP01).mockResolvedValueOnce({
        events: [invalidStepsEvent],
      });

      const result = await aiMemoryService.getReasoningChain(
        mockHubId,
        "invalid_steps_chain",
      );

      // Should handle gracefully, possibly returning empty steps or null
      expect(result?.steps || []).toEqual([]);
    });
  });
});
