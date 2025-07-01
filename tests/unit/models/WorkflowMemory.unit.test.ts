import { describe, expect, it } from "vitest";

import type {
  Enhancement,
  EnhancementType,
  LearningSource,
  MemoryType,
  RelationshipType,
  WorkflowMemory,
  WorkflowPerformance,
} from "../../../src/models/WorkflowMemory.js";

describe("WorkflowMemory Model", () => {
  describe("WorkflowMemory interface validation", () => {
    it("should validate complete WorkflowMemory object", () => {
      const completeWorkflow: WorkflowMemory = {
        capabilities: [
          "data-validation",
          "format-conversion",
          "error-handling",
        ],
        content: "Advanced workflow for data processing",
        dependencies: ["schema-validator", "format-library"],
        enhancement: {
          description: "Improved execution speed by 25%",
          id: "enhancement-abc123",
          impact: 0.7,
          type: "optimization",
          validation: {
            confidence: 0.9,
            isValid: true,
            riskAssessment: "low",
            testResults: [],
            validatedAt: "2024-01-15T08:30:00Z",
          },
        },
        // Base Memory properties
        id: "workflow-memory-123",
        importance: 0.9,
        memoryType: "workflow",

        metadata: {
          accessCount: 15,
          lastAccessed: "2024-01-15T10:30:00Z",
          tags: ["workflow", "data-processing", "public"],
        },
        p: "workflow-creator-key",
        performance: {
          completionRate: 0.98,
          errorRate: 0.02,
          executionTime: 1500,
          lastExecuted: "2024-01-15T09:45:00Z",
          qualityScore: 0.95,
          resourceUsage: {
            cpuTime: 800,
            memoryUsage: 128,
            networkRequests: 3,
            storageOperations: 5,
            toolCalls: 2,
          },
          retryCount: 1,
          success: true,
          userSatisfaction: 0.88,
        },
        requirements: ["input-schema", "output-format"],
        role: "system",
        stage: "production",
        // Workflow-specific properties
        workflowId: "data-processor-v2",
        workflowVersion: "2.1.0",
      };

      // Validate base Memory properties
      expect(completeWorkflow.id).toBe("workflow-memory-123");
      expect(completeWorkflow.content).toBe(
        "Advanced workflow for data processing",
      );
      expect(completeWorkflow.p).toBe("workflow-creator-key");
      expect(completeWorkflow.role).toBe("system");
      expect(completeWorkflow.importance).toBe(0.9);
      expect(completeWorkflow.memoryType).toBe("workflow");

      // Validate workflow-specific properties
      expect(completeWorkflow.workflowId).toBe("data-processor-v2");
      expect(completeWorkflow.workflowVersion).toBe("2.1.0");
      expect(completeWorkflow.stage).toBe("production");
      expect(completeWorkflow.capabilities).toHaveLength(3);
      expect(completeWorkflow.requirements).toHaveLength(2);
      expect(completeWorkflow.dependencies).toHaveLength(2);

      // Validate performance metrics
      expect(completeWorkflow.performance?.executionTime).toBe(1500);
      expect(completeWorkflow.performance?.success).toBe(true);
      expect(completeWorkflow.performance?.qualityScore).toBe(0.95);

      // Validate enhancement
      expect(completeWorkflow.enhancement?.type).toBe("optimization");
      expect(completeWorkflow.enhancement?.impact).toBe(0.7);
    });

    it("should validate minimal WorkflowMemory object", () => {
      const minimalWorkflow: WorkflowMemory = {
        capabilities: [],
        content: "Basic workflow",
        id: "minimal-workflow",
        importance: 0.5,
        memoryType: "workflow",
        metadata: {
          accessCount: 0,
          lastAccessed: "2024-01-15T10:30:00Z",
          tags: [],
        },
        p: "creator-key",
        role: "user",
        stage: "development",
        workflowId: "basic-workflow",
      };

      expect(minimalWorkflow.workflowId).toBe("basic-workflow");
      expect(minimalWorkflow.stage).toBe("development");
      expect(minimalWorkflow.capabilities).toHaveLength(0);
      expect(minimalWorkflow.requirements).toBeUndefined();
      expect(minimalWorkflow.dependencies).toBeUndefined();
      expect(minimalWorkflow.performance).toBeUndefined();
      expect(minimalWorkflow.enhancement).toBeUndefined();
    });
  });

  describe("MemoryType validation", () => {
    it("should validate all memory types", () => {
      const memoryTypes: MemoryType[] = [
        "conversation",
        "knowledge",
        "procedure",
        "workflow",
        "enhancement",
        "performance",
      ];

      memoryTypes.forEach((type) => {
        const workflow: WorkflowMemory = {
          capabilities: [],
          content: `Workflow with ${type} memory type`,
          id: `workflow-${type}`,
          importance: 0.5,
          memoryType: type,
          metadata: {
            accessCount: 1,
            lastAccessed: new Date().toISOString(),
            tags: [type],
          },
          p: "test-key",
          role: "system",
          stage: "testing",
          workflowId: `test-workflow-${type}`,
        };

        expect(workflow.memoryType).toBe(type);
      });
    });
  });

  describe("Enhancement interface validation", () => {
    it("should validate all enhancement types", () => {
      const enhancementTypes: EnhancementType[] = [
        "optimization",
        "bug_fix",
        "feature_add",
        "refactor",
        "parameter_tune",
        "logic_improve",
        "error_handling",
        "user_experience",
      ];

      enhancementTypes.forEach((type) => {
        const enhancement: Enhancement = {
          description: `${type} enhancement`,
          id: `enhancement-${type}`,
          impact: 0.6,
          type: type,
          validation: {
            confidence: 0.8,
            isValid: true,
            riskAssessment: "low",
            testResults: [],
            validatedAt: new Date().toISOString(),
          },
        };

        expect(enhancement.type).toBe(type);
        expect(enhancement.validation.isValid).toBe(true);
      });
    });

    it("should validate enhancement with optional properties", () => {
      const enhancement: Enhancement = {
        actualImpact: 0.75,
        code: "function optimizedVersion() { return faster(); }",
        description: "Complete enhancement with all properties",
        id: "full-enhancement",
        impact: 0.8,
        parameters: {
          enabled: true,
          iterations: 100,
          threshold: 0.5,
        },
        type: "optimization",
        validation: {
          confidence: 0.95,
          isValid: true,
          riskAssessment: "medium",
          testResults: [
            { name: "performance_test", passed: true, score: 0.9 },
            { name: "safety_test", passed: true, score: 0.85 },
          ],
          validatedAt: "2024-01-15T10:30:00Z",
        },
      };

      expect(enhancement.actualImpact).toBe(0.75);
      expect(enhancement.code).toContain("optimizedVersion");
      expect(enhancement.parameters?.threshold).toBe(0.5);
      expect(enhancement.validation.testResults).toHaveLength(2);
    });

    it("should validate risk assessment levels", () => {
      const riskLevels = ["low", "medium", "high", "critical"] as const;

      riskLevels.forEach((risk) => {
        const enhancement: Enhancement = {
          description: `Enhancement with ${risk} risk`,
          id: `enhancement-${risk}`,
          impact: 0.5,
          type: "bug_fix",
          validation: {
            confidence: risk === "low" ? 0.9 : 0.6,
            isValid: risk !== "critical", // Critical risks might not be valid
            riskAssessment: risk,
            testResults: [],
            validatedAt: new Date().toISOString(),
          },
        };

        expect(enhancement.validation.riskAssessment).toBe(risk);
      });
    });
  });

  describe("WorkflowPerformance interface validation", () => {
    it("should validate complete performance metrics", () => {
      const performance: WorkflowPerformance = {
        completionRate: 0.85,
        errorRate: 0.15,
        executionTime: 2500,
        lastExecuted: "2024-01-15T14:20:00Z",
        qualityScore: 0.75,
        resourceUsage: {
          cpuTime: 1200,
          memoryUsage: 256,
          networkRequests: 8,
          storageOperations: 12,
          toolCalls: 6,
        },
        retryCount: 3,
        success: false,
        userSatisfaction: 0.65,
      };

      expect(performance.executionTime).toBe(2500);
      expect(performance.success).toBe(false);
      expect(performance.errorRate).toBe(0.15);
      expect(performance.resourceUsage.memoryUsage).toBe(256);
      expect(performance.resourceUsage.networkRequests).toBe(8);
      expect(performance.qualityScore).toBe(0.75);
      expect(performance.retryCount).toBe(3);
    });

    it("should validate minimal performance metrics", () => {
      const performance: WorkflowPerformance = {
        completionRate: 1.0,
        errorRate: 0,
        executionTime: 500,
        lastExecuted: "2024-01-15T10:30:00Z",
        qualityScore: 1.0,
        retryCount: 0,
        success: true,
      };

      expect(performance.success).toBe(true);
      expect(performance.errorRate).toBe(0);
      expect(performance.qualityScore).toBe(1.0);
      expect(performance.retryCount).toBe(0);
      expect(performance.userSatisfaction).toBeUndefined();
      expect(performance.resourceUsage).toBeUndefined();
    });

    it("should validate resource usage metrics", () => {
      const resourceUsage = {
        cpuTime: 2000,
        memoryUsage: 512,
        networkRequests: 15,
        storageOperations: 20,
        toolCalls: 10,
      };

      expect(resourceUsage.memoryUsage).toBe(512);
      expect(resourceUsage.cpuTime).toBe(2000);
      expect(resourceUsage.networkRequests).toBe(15);
      expect(resourceUsage.storageOperations).toBe(20);
      expect(resourceUsage.toolCalls).toBe(10);

      // All values should be non-negative numbers
      Object.values(resourceUsage).forEach((value) => {
        expect(typeof value).toBe("number");
        expect(value).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe("RelationshipType validation", () => {
    it("should validate all relationship types", () => {
      const relationshipTypes: RelationshipType[] = [
        "inherits",
        "composes",
        "enhances",
        "triggers",
        "depends_on",
        "replaces",
        "causes",
        "supports",
        "contradicts",
        "extends",
        "references",
      ];

      relationshipTypes.forEach((type) => {
        expect(typeof type).toBe("string");
        expect(type.length).toBeGreaterThan(0);
      });

      // Check specific relationship semantics
      expect(relationshipTypes).toContain("inherits");
      expect(relationshipTypes).toContain("composes");
      expect(relationshipTypes).toContain("depends_on");
    });
  });

  describe("LearningSource validation", () => {
    it("should validate all learning sources", () => {
      const learningSources: LearningSource[] = [
        "self",
        "peer",
        "user",
        "analytics",
        "error",
        "emergent",
      ];

      learningSources.forEach((source) => {
        expect(typeof source).toBe("string");
        expect(source.length).toBeGreaterThan(0);
      });

      // Check specific learning source semantics
      expect(learningSources).toContain("self");
      expect(learningSources).toContain("peer");
      expect(learningSources).toContain("user");
      expect(learningSources).toContain("error");
    });
  });

  describe("Workflow stages validation", () => {
    it("should handle various workflow stages", () => {
      const stages = [
        "development",
        "testing",
        "staging",
        "production",
        "deprecated",
        "experimental",
        "maintenance",
      ];

      stages.forEach((stage) => {
        const workflow: WorkflowMemory = {
          capabilities: [],
          content: `Workflow in ${stage} stage`,
          id: `workflow-${stage}`,
          importance: 0.5,
          memoryType: "workflow",
          metadata: {
            accessCount: 1,
            lastAccessed: new Date().toISOString(),
            tags: [stage],
          },
          p: "test-key",
          role: "system",
          stage: stage,
          workflowId: `test-${stage}`,
        };

        expect(workflow.stage).toBe(stage);
      });
    });
  });

  describe("Capabilities and dependencies validation", () => {
    it("should handle various capability types", () => {
      const capabilities = [
        "data-processing",
        "file-conversion",
        "api-integration",
        "error-handling",
        "validation",
        "transformation",
        "analysis",
        "reporting",
        "automation",
        "monitoring",
      ];

      const workflow: WorkflowMemory = {
        capabilities: capabilities,
        content: "Workflow with multiple capabilities",
        id: "multi-capability-workflow",
        importance: 0.8,
        memoryType: "workflow",
        metadata: {
          accessCount: 1,
          lastAccessed: new Date().toISOString(),
          tags: ["multi-capability"],
        },
        p: "test-key",
        role: "system",
        stage: "production",
        workflowId: "multi-cap-workflow",
      };

      expect(workflow.capabilities).toHaveLength(capabilities.length);
      capabilities.forEach((cap) => {
        expect(workflow.capabilities).toContain(cap);
      });
    });

    it("should handle dependency relationships", () => {
      const dependencies = [
        "external-api-client",
        "validation-library",
        "logging-service",
        "configuration-manager",
        "error-reporter",
      ];

      const requirements = [
        "input-schema",
        "output-format",
        "api-credentials",
        "rate-limits",
      ];

      const workflow: WorkflowMemory = {
        capabilities: ["data-processing"],
        content: "Workflow with dependencies and requirements",
        dependencies: dependencies,
        id: "dependent-workflow",
        importance: 0.7,
        memoryType: "workflow",
        metadata: {
          accessCount: 1,
          lastAccessed: new Date().toISOString(),
          tags: ["dependent"],
        },
        p: "test-key",
        requirements: requirements,
        role: "system",
        stage: "production",
        workflowId: "dependent-workflow",
      };

      expect(workflow.requirements).toHaveLength(requirements.length);
      expect(workflow.dependencies).toHaveLength(dependencies.length);

      requirements.forEach((req) => {
        expect(workflow.requirements).toContain(req);
      });

      dependencies.forEach((dep) => {
        expect(workflow.dependencies).toContain(dep);
      });
    });
  });

  describe("Version handling", () => {
    it("should handle semantic versioning", () => {
      const versions = [
        "1.0.0",
        "2.1.3",
        "0.1.0-alpha",
        "1.0.0-beta.1",
        "3.2.1-rc.2",
        "10.15.7",
      ];

      versions.forEach((version) => {
        const workflow: WorkflowMemory = {
          capabilities: [],
          content: `Workflow version ${version}`,
          id: `workflow-${version.replace(/\./g, "-")}`,
          importance: 0.5,
          memoryType: "workflow",
          metadata: {
            accessCount: 1,
            lastAccessed: new Date().toISOString(),
            tags: [],
          },
          p: "test-key",
          role: "system",
          stage: "production",
          workflowId: "versioned-workflow",
          workflowVersion: version,
        };

        expect(workflow.workflowVersion).toBe(version);
      });
    });

    it("should handle missing version (default behavior)", () => {
      const workflow: WorkflowMemory = {
        capabilities: [],
        content: "Workflow without explicit version",
        id: "unversioned-workflow",
        importance: 0.5,
        memoryType: "workflow",
        metadata: {
          accessCount: 1,
          lastAccessed: new Date().toISOString(),
          tags: [],
        },
        p: "test-key",
        role: "system",
        stage: "development",
        workflowId: "unversioned",
      };

      expect(workflow.workflowVersion).toBeUndefined();
    });
  });
});
