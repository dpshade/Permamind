import { MemoryLink, RelationshipType } from "../models/AIMemory.js";
import {
  Enhancement,
  ExecutionStrategy,
  WorkflowComposition,
  WorkflowMemory,
  WorkflowStep,
} from "../models/WorkflowMemory.js";

/**
 * Manages relationships between workflows and enables composition, inheritance, and collaboration
 * Core component for building self-enhancing workflow ecosystems
 */
export class WorkflowRelationshipManager {
  private compositions: Map<string, WorkflowComposition> = new Map();
  private dependencyGraph: Map<string, Set<string>> = new Map();
  private inheritanceChains: Map<string, string[]> = new Map();
  private relationships: Map<string, MemoryLink[]> = new Map();

  /**
   * Calculate workflow network metrics
   */
  calculateNetworkMetrics(workflowId: string): {
    collaborationPotential: number; // 0-1 potential for collaboration
    connectivityScore: number; // 0-1 how well connected
    dependencyScore: number; // 0-1 how dependent on others
    influenceScore: number; // 0-1 how influential
  } {
    const outgoingLinks = this.relationships.get(workflowId) || [];
    const incomingLinks = this.getDependentWorkflows(workflowId).length;
    const totalWorkflows = this.relationships.size;

    const connectivityScore =
      totalWorkflows > 0
        ? (outgoingLinks.length + incomingLinks) / (totalWorkflows * 2)
        : 0;

    const influenceScore =
      totalWorkflows > 0 ? incomingLinks / totalWorkflows : 0;

    const dependencyScore =
      outgoingLinks.length > 0
        ? outgoingLinks.filter((l) =>
            ["depends_on", "inherits"].includes(l.type),
          ).length / outgoingLinks.length
        : 0;

    const collaborationPotential =
      this.calculateCollaborationPotential(workflowId);

    return {
      collaborationPotential,
      connectivityScore: Math.min(1, connectivityScore),
      dependencyScore: Math.min(1, dependencyScore),
      influenceScore: Math.min(1, influenceScore),
    };
  }

  /**
   * Create a workflow composition
   */
  createComposition(
    compositionId: string,
    name: string,
    description: string,
    workflowSteps: WorkflowStep[],
    executionStrategy: ExecutionStrategy = "sequential",
  ): void {
    const composition: WorkflowComposition = {
      description,
      errorHandling: {
        maxRetries: 3,
        onFailure: "abort",
        retryDelay: 1000,
      },
      executionStrategy,
      id: compositionId,
      name,
      resourceAllocation: {
        maxConcurrentWorkflows:
          executionStrategy === "parallel" ? workflowSteps.length : 1,
        memoryLimit: 1024, // MB
        priority: "medium",
        timeLimit: 300000, // 5 minutes
      },
      workflows: workflowSteps,
    };

    this.compositions.set(compositionId, composition);

    // Create composition relationships
    for (const step of workflowSteps) {
      this.createRelationship(compositionId, step.workflowId, "composes", 1.0);
    }
  }

  /**
   * Create a relationship between two workflows
   */
  createRelationship(
    sourceWorkflowId: string,
    targetWorkflowId: string,
    relationshipType: RelationshipType,
    strength: number = 1.0,
    metadata: Record<string, any> = {},
  ): void {
    const link: MemoryLink = {
      strength: Math.max(0, Math.min(1, strength)),
      targetId: targetWorkflowId,
      type: relationshipType,
    };

    const existingLinks = this.relationships.get(sourceWorkflowId) || [];

    // Remove existing link of same type to same target
    const filteredLinks = existingLinks.filter(
      (l) => !(l.targetId === targetWorkflowId && l.type === relationshipType),
    );

    filteredLinks.push(link);
    this.relationships.set(sourceWorkflowId, filteredLinks);

    // Update dependency graph for certain relationship types
    if (["composes", "depends_on", "inherits"].includes(relationshipType)) {
      this.updateDependencyGraph(
        sourceWorkflowId,
        targetWorkflowId,
        relationshipType,
      );
    }

    // Update inheritance chains
    if (relationshipType === "inherits") {
      this.updateInheritanceChain(sourceWorkflowId, targetWorkflowId);
    }
  }

  /**
   * Find collaboration opportunities between workflows
   */
  findCollaborationOpportunities(workflowId: string): {
    complementarySkills: string[];
    compositionOpportunities: string[];
    potentialPartners: string[];
    sharedCapabilities: string[];
  } {
    const potentialPartners: string[] = [];
    const sharedCapabilities: string[] = [];
    const complementarySkills: string[] = [];
    const compositionOpportunities: string[] = [];

    // Analyze all relationships to find collaboration patterns
    for (const [otherId, links] of this.relationships.entries()) {
      if (otherId === workflowId) continue;

      // Check for workflows that might benefit from collaboration
      const hasSharedTargets = this.hasSharedRelationshipTargets(
        workflowId,
        otherId,
      );
      const hasComplementaryCapabilities = this.hasComplementaryCapabilities(
        workflowId,
        otherId,
      );

      if (hasSharedTargets || hasComplementaryCapabilities) {
        potentialPartners.push(otherId);
      }

      // Identify composition opportunities
      if (this.canBeComposed(workflowId, otherId)) {
        compositionOpportunities.push(otherId);
      }
    }

    return {
      complementarySkills,
      compositionOpportunities,
      potentialPartners,
      sharedCapabilities,
    };
  }

  /**
   * Get workflow composition
   */
  getComposition(compositionId: string): null | WorkflowComposition {
    return this.compositions.get(compositionId) || null;
  }

  /**
   * Find workflows that depend on the given workflow
   */
  getDependentWorkflows(workflowId: string): string[] {
    const dependents: string[] = [];

    for (const [sourceId, links] of this.relationships.entries()) {
      const hasDependency = links.some(
        (link) =>
          link.targetId === workflowId &&
          ["composes", "depends_on", "inherits"].includes(link.type),
      );

      if (hasDependency) {
        dependents.push(sourceId);
      }
    }

    return dependents;
  }

  /**
   * Get workflow ecosystem overview
   */
  getEcosystemOverview(): {
    averageConnectivity: number;
    circularDependencies: string[];
    compositionCount: number;
    hubWorkflows: string[]; // Highly connected workflows
    isolatedWorkflows: string[];
    totalRelationships: number;
    totalWorkflows: number;
  } {
    const totalWorkflows = this.relationships.size;
    const totalRelationships = Array.from(this.relationships.values()).reduce(
      (sum, links) => sum + links.length,
      0,
    );

    const averageConnectivity =
      totalWorkflows > 0 ? totalRelationships / totalWorkflows : 0;
    const compositionCount = this.compositions.size;
    const circularDependencies = this.findAllCircularDependencies();
    const isolatedWorkflows = this.findIsolatedWorkflows();
    const hubWorkflows = this.findHubWorkflows();

    return {
      averageConnectivity,
      circularDependencies,
      compositionCount,
      hubWorkflows,
      isolatedWorkflows,
      totalRelationships,
      totalWorkflows,
    };
  }

  /**
   * Get inheritance chain for a workflow
   */
  getInheritanceChain(workflowId: string): string[] {
    return this.inheritanceChains.get(workflowId) || [workflowId];
  }

  /**
   * Get workflows by relationship type
   */
  getRelatedWorkflows(
    workflowId: string,
    relationshipType: RelationshipType,
  ): string[] {
    const links = this.relationships.get(workflowId) || [];
    return links
      .filter((link) => link.type === relationshipType)
      .map((link) => link.targetId);
  }

  /**
   * Get all relationships for a workflow
   */
  getRelationships(workflowId: string): MemoryLink[] {
    return this.relationships.get(workflowId) || [];
  }

  /**
   * Check for circular dependencies
   */
  hasCircularDependency(workflowId: string): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    return this.detectCycle(workflowId, visited, recursionStack);
  }

  /**
   * Optimize workflow relationships based on performance data
   */
  optimizeRelationships(
    workflowId: string,
    performanceData: Map<string, number>,
  ): {
    newRelationships: string[];
    removedRelationships: string[];
    strengthenedRelationships: string[];
    weakenedRelationships: string[];
  } {
    const strengthened: string[] = [];
    const weakened: string[] = [];
    const newRels: string[] = [];
    const removed: string[] = [];

    const currentLinks = this.relationships.get(workflowId) || [];

    // Adjust relationship strengths based on performance
    for (const link of currentLinks) {
      const targetPerformance = performanceData.get(link.targetId) || 0.5;
      const currentStrength = link.strength;

      // Strengthen relationships with high-performing workflows
      if (targetPerformance > 0.8 && currentStrength < 0.9) {
        link.strength = Math.min(1.0, currentStrength + 0.1);
        strengthened.push(link.targetId);
      }

      // Weaken relationships with poor-performing workflows
      if (targetPerformance < 0.3 && currentStrength > 0.1) {
        link.strength = Math.max(0.1, currentStrength - 0.2);
        weakened.push(link.targetId);
      }

      // Remove very weak relationships
      if (link.strength < 0.05) {
        removed.push(link.targetId);
      }
    }

    // Remove relationships marked for removal
    if (removed.length > 0) {
      const filteredLinks = currentLinks.filter(
        (link) => !removed.includes(link.targetId),
      );
      this.relationships.set(workflowId, filteredLinks);
    }

    // Suggest new relationships based on performance correlation
    const highPerformers = Array.from(performanceData.entries())
      .filter(([id, score]) => id !== workflowId && score > 0.8)
      .map(([id]) => id);

    for (const performerId of highPerformers) {
      if (!this.hasDirectRelationship(workflowId, performerId)) {
        newRels.push(performerId);
      }
    }

    return {
      newRelationships: newRels,
      removedRelationships: removed,
      strengthenedRelationships: strengthened,
      weakenedRelationships: weakened,
    };
  }

  /**
   * Propagate enhancements through inheritance chains
   */
  propagateEnhancement(
    sourceWorkflowId: string,
    enhancement: Enhancement,
    propagationStrategy: "gradual" | "immediate" | "manual" = "gradual",
  ): string[] {
    const affectedWorkflows: string[] = [];

    // Get workflows that inherit from the source
    const inheritors = this.getWorkflowsInheritingFrom(sourceWorkflowId);

    for (const inheritorId of inheritors) {
      if (
        this.shouldPropagateEnhancement(
          sourceWorkflowId,
          inheritorId,
          enhancement,
        )
      ) {
        affectedWorkflows.push(inheritorId);

        if (propagationStrategy === "immediate") {
          // Apply enhancement immediately
          this.applyInheritedEnhancement(
            inheritorId,
            enhancement,
            sourceWorkflowId,
          );
        }
      }
    }

    return affectedWorkflows;
  }

  // Private helper methods

  private applyInheritedEnhancement(
    workflowId: string,
    enhancement: Enhancement,
    sourceId: string,
  ): void {
    // This would integrate with the workflow execution system
    // For now, we'll just track the inheritance
    console.log(
      `Applying inherited enhancement from ${sourceId} to ${workflowId}:`,
      enhancement.description,
    );
  }

  private calculateCollaborationPotential(workflowId: string): number {
    const opportunities = this.findCollaborationOpportunities(workflowId);
    const totalOpportunities =
      opportunities.potentialPartners.length +
      opportunities.compositionOpportunities.length;

    const maxPossibleOpportunities = this.relationships.size - 1; // All other workflows

    return maxPossibleOpportunities > 0
      ? Math.min(1, totalOpportunities / maxPossibleOpportunities)
      : 0;
  }

  private canBeComposed(workflowId1: string, workflowId2: string): boolean {
    // Check if workflows can be logically composed
    // Avoid circular compositions
    return (
      !this.hasCircularDependency(workflowId1) &&
      !this.hasCircularDependency(workflowId2) &&
      !this.hasDirectRelationship(workflowId1, workflowId2)
    );
  }

  private detectCycle(
    workflowId: string,
    visited: Set<string>,
    recursionStack: Set<string>,
  ): boolean {
    visited.add(workflowId);
    recursionStack.add(workflowId);

    const dependencies = this.dependencyGraph.get(workflowId) || new Set();
    for (const depId of dependencies) {
      if (!visited.has(depId)) {
        if (this.detectCycle(depId, visited, recursionStack)) {
          return true;
        }
      } else if (recursionStack.has(depId)) {
        return true;
      }
    }

    recursionStack.delete(workflowId);
    return false;
  }

  private findAllCircularDependencies(): string[] {
    const circular: string[] = [];
    const visited = new Set<string>();

    for (const workflowId of this.relationships.keys()) {
      if (!visited.has(workflowId) && this.hasCircularDependency(workflowId)) {
        circular.push(workflowId);
      }
      visited.add(workflowId);
    }

    return circular;
  }

  private findHubWorkflows(): string[] {
    const hubs: string[] = [];

    for (const workflowId of this.relationships.keys()) {
      const metrics = this.calculateNetworkMetrics(workflowId);

      // Consider a workflow a hub if it has high connectivity and influence
      if (metrics.connectivityScore > 0.7 && metrics.influenceScore > 0.5) {
        hubs.push(workflowId);
      }
    }

    return hubs;
  }

  private findIsolatedWorkflows(): string[] {
    const isolated: string[] = [];

    for (const [workflowId, links] of this.relationships.entries()) {
      const hasOutgoing = links.length > 0;
      const hasIncoming = this.getDependentWorkflows(workflowId).length > 0;

      if (!hasOutgoing && !hasIncoming) {
        isolated.push(workflowId);
      }
    }

    return isolated;
  }

  private getWorkflowsInheritingFrom(workflowId: string): string[] {
    const inheritors: string[] = [];

    for (const [childId, chain] of this.inheritanceChains.entries()) {
      if (chain.includes(workflowId) && childId !== workflowId) {
        inheritors.push(childId);
      }
    }

    return inheritors;
  }

  private hasComplementaryCapabilities(
    workflowId1: string,
    workflowId2: string,
  ): boolean {
    // This would analyze workflow capabilities - placeholder implementation
    return Math.random() > 0.7; // 30% chance of complementary capabilities
  }

  private hasDirectRelationship(
    workflowId1: string,
    workflowId2: string,
  ): boolean {
    const links = this.relationships.get(workflowId1) || [];
    return links.some((link) => link.targetId === workflowId2);
  }

  private hasSharedRelationshipTargets(
    workflowId1: string,
    workflowId2: string,
  ): boolean {
    const links1 = this.relationships.get(workflowId1) || [];
    const links2 = this.relationships.get(workflowId2) || [];

    const targets1 = new Set(links1.map((l) => l.targetId));
    const targets2 = new Set(links2.map((l) => l.targetId));

    for (const target of targets1) {
      if (targets2.has(target)) return true;
    }

    return false;
  }

  private shouldPropagateEnhancement(
    sourceId: string,
    targetId: string,
    enhancement: Enhancement,
  ): boolean {
    // Don't propagate high-risk enhancements automatically
    if (enhancement.validation.riskAssessment === "high") return false;

    // Don't propagate if the enhancement is too specific
    if (enhancement.type === "bug_fix" && enhancement.impact < 0.2)
      return false;

    // Check if the enhancement is relevant to the target workflow
    return enhancement.impact > 0.1;
  }

  private updateDependencyGraph(
    sourceId: string,
    targetId: string,
    type: RelationshipType,
  ): void {
    if (!this.dependencyGraph.has(sourceId)) {
      this.dependencyGraph.set(sourceId, new Set());
    }
    this.dependencyGraph.get(sourceId)!.add(targetId);
  }

  private updateInheritanceChain(childId: string, parentId: string): void {
    const parentChain = this.inheritanceChains.get(parentId) || [parentId];
    const childChain = [childId, ...parentChain];
    this.inheritanceChains.set(childId, childChain);
  }
}
