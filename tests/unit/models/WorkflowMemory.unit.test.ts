import { describe, it, expect } from "vitest";
import type {
  WorkflowMemory,
  Enhancement,
  EnhancementType,
  LearningSource,
  RelationshipType,
  WorkflowPerformance,
  MemoryType,
} from "../../../src/models/WorkflowMemory.js";

describe("WorkflowMemory Model", () => {
  describe("WorkflowMemory interface validation", () => {
    it("should validate complete WorkflowMemory object", () => {
      const completeWorkflow: WorkflowMemory = {
        // Base Memory properties
        id: "workflow-memory-123",
        content: "Advanced workflow for data processing",
        p: "workflow-creator-key",
        role: "system",
        metadata: {
          accessCount: 15,
          lastAccessed: "2024-01-15T10:30:00Z",
          tags: ["workflow", "data-processing", "public"],
        },
        importance: 0.9,
        memoryType: "workflow",

        // Workflow-specific properties
        workflowId: "data-processor-v2",
        workflowVersion: "2.1.0",
        stage: "production",
        capabilities: [
          "data-validation",
          "format-conversion",
          "error-handling",
        ],
        requirements: ["input-schema", "output-format"],
        dependencies: ["schema-validator", "format-library"],
        performance: {
          executionTime: 1500,
          success: true,
          errorRate: 0.02,
          resourceUsage: {
            memoryUsage: 128,
            cpuTime: 800,
            networkRequests: 3,
            storageOperations: 5,
            toolCalls: 2,
          },
          qualityScore: 0.95,
          userSatisfaction: 0.88,
          completionRate: 0.98,
          retryCount: 1,
          lastExecuted: "2024-01-15T09:45:00Z",
        },
        enhancement: {
          id: "enhancement-abc123",
          type: "optimization",
          description: "Improved execution speed by 25%",
          impact: 0.7,
          validation: {
            isValid: true,
            confidence: 0.9,
            riskAssessment: "low",
            testResults: [],
            validatedAt: "2024-01-15T08:30:00Z",
          },
        },
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
        id: "minimal-workflow",
        content: "Basic workflow",
        p: "creator-key",
        role: "user",
        metadata: {
          accessCount: 0,
          lastAccessed: "2024-01-15T10:30:00Z",
          tags: [],
        },
        importance: 0.5,
        memoryType: "workflow",
        workflowId: "basic-workflow",
        stage: "development",
        capabilities: [],
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
          id: `workflow-${type}`,
          content: `Workflow with ${type} memory type`,
          p: "test-key",
          role: "system",
          metadata: {
            accessCount: 1,
            lastAccessed: new Date().toISOString(),
            tags: [type],
          },
          importance: 0.5,
          memoryType: type,
          workflowId: `test-workflow-${type}`,
          stage: "testing",
          capabilities: [],
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
          id: `enhancement-${type}`,
          type: type,
          description: `${type} enhancement`,
          impact: 0.6,
          validation: {
            isValid: true,
            confidence: 0.8,
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
        id: "full-enhancement",
        type: "optimization",
        description: "Complete enhancement with all properties",
        impact: 0.8,
        actualImpact: 0.75,
        code: "function optimizedVersion() { return faster(); }",
        parameters: {
          threshold: 0.5,
          iterations: 100,
          enabled: true,
        },
        validation: {
          isValid: true,
          confidence: 0.95,
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
          id: `enhancement-${risk}`,
          type: "bug_fix",
          description: `Enhancement with ${risk} risk`,
          impact: 0.5,
          validation: {
            isValid: risk !== "critical", // Critical risks might not be valid
            confidence: risk === "low" ? 0.9 : 0.6,
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
        executionTime: 2500,
        success: false,
        errorRate: 0.15,
        resourceUsage: {
          memoryUsage: 256,
          cpuTime: 1200,
          networkRequests: 8,
          storageOperations: 12,
          toolCalls: 6,
        },
        qualityScore: 0.75,
        userSatisfaction: 0.65,
        completionRate: 0.85,
        retryCount: 3,
        lastExecuted: "2024-01-15T14:20:00Z",
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
        executionTime: 500,
        success: true,
        errorRate: 0,
        qualityScore: 1.0,
        completionRate: 1.0,
        retryCount: 0,
        lastExecuted: "2024-01-15T10:30:00Z",
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
        memoryUsage: 512,
        cpuTime: 2000,
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
          id: `workflow-${stage}`,
          content: `Workflow in ${stage} stage`,
          p: "test-key",
          role: "system",
          metadata: {
            accessCount: 1,
            lastAccessed: new Date().toISOString(),
            tags: [stage],
          },
          importance: 0.5,
          memoryType: "workflow",
          workflowId: `test-${stage}`,
          stage: stage,
          capabilities: [],
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
        id: "multi-capability-workflow",
        content: "Workflow with multiple capabilities",
        p: "test-key",
        role: "system",
        metadata: {
          accessCount: 1,
          lastAccessed: new Date().toISOString(),
          tags: ["multi-capability"],
        },
        importance: 0.8,
        memoryType: "workflow",
        workflowId: "multi-cap-workflow",
        stage: "production",
        capabilities: capabilities,
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
        id: "dependent-workflow",
        content: "Workflow with dependencies and requirements",
        p: "test-key",
        role: "system",
        metadata: {
          accessCount: 1,
          lastAccessed: new Date().toISOString(),
          tags: ["dependent"],
        },
        importance: 0.7,
        memoryType: "workflow",
        workflowId: "dependent-workflow",
        stage: "production",
        capabilities: ["data-processing"],
        requirements: requirements,
        dependencies: dependencies,
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
          id: `workflow-${version.replace(/\./g, "-")}`,
          content: `Workflow version ${version}`,
          p: "test-key",
          role: "system",
          metadata: {
            accessCount: 1,
            lastAccessed: new Date().toISOString(),
            tags: [],
          },
          importance: 0.5,
          memoryType: "workflow",
          workflowId: "versioned-workflow",
          workflowVersion: version,
          stage: "production",
          capabilities: [],
        };

        expect(workflow.workflowVersion).toBe(version);
      });
    });

    it("should handle missing version (default behavior)", () => {
      const workflow: WorkflowMemory = {
        id: "unversioned-workflow",
        content: "Workflow without explicit version",
        p: "test-key",
        role: "system",
        metadata: {
          accessCount: 1,
          lastAccessed: new Date().toISOString(),
          tags: [],
        },
        importance: 0.5,
        memoryType: "workflow",
        workflowId: "unversioned",
        stage: "development",
        capabilities: [],
      };

      expect(workflow.workflowVersion).toBeUndefined();
    });
  });
});
