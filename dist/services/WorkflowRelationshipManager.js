/**
 * Manages relationships between workflows and enables composition, inheritance, and collaboration
 * Core component for building self-enhancing workflow ecosystems
 */
export class WorkflowRelationshipManager {
    compositions = new Map();
    dependencyGraph = new Map();
    inheritanceChains = new Map();
    relationships = new Map();
    /**
     * Calculate workflow network metrics
     */
    calculateNetworkMetrics(workflowId) {
        const outgoingLinks = this.relationships.get(workflowId) || [];
        const incomingLinks = this.getDependentWorkflows(workflowId).length;
        const totalWorkflows = this.relationships.size;
        const connectivityScore = totalWorkflows > 0
            ? (outgoingLinks.length + incomingLinks) / (totalWorkflows * 2)
            : 0;
        const influenceScore = totalWorkflows > 0 ? incomingLinks / totalWorkflows : 0;
        const dependencyScore = outgoingLinks.length > 0
            ? outgoingLinks.filter((l) => ["depends_on", "inherits"].includes(l.type)).length / outgoingLinks.length
            : 0;
        const collaborationPotential = this.calculateCollaborationPotential(workflowId);
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
    createComposition(compositionId, name, description, workflowSteps, executionStrategy = "sequential") {
        const composition = {
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
                maxConcurrentWorkflows: executionStrategy === "parallel" ? workflowSteps.length : 1,
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
    createRelationship(sourceWorkflowId, targetWorkflowId, relationshipType, strength = 1.0, metadata = {}) {
        const link = {
            strength: Math.max(0, Math.min(1, strength)),
            targetId: targetWorkflowId,
            type: relationshipType,
        };
        const existingLinks = this.relationships.get(sourceWorkflowId) || [];
        // Remove existing link of same type to same target
        const filteredLinks = existingLinks.filter((l) => !(l.targetId === targetWorkflowId && l.type === relationshipType));
        filteredLinks.push(link);
        this.relationships.set(sourceWorkflowId, filteredLinks);
        // Update dependency graph for certain relationship types
        if (["composes", "depends_on", "inherits"].includes(relationshipType)) {
            this.updateDependencyGraph(sourceWorkflowId, targetWorkflowId, relationshipType);
        }
        // Update inheritance chains
        if (relationshipType === "inherits") {
            this.updateInheritanceChain(sourceWorkflowId, targetWorkflowId);
        }
    }
    /**
     * Find collaboration opportunities between workflows
     */
    findCollaborationOpportunities(workflowId) {
        const potentialPartners = [];
        const sharedCapabilities = [];
        const complementarySkills = [];
        const compositionOpportunities = [];
        // Analyze all relationships to find collaboration patterns
        for (const [otherId, links] of this.relationships.entries()) {
            if (otherId === workflowId)
                continue;
            // Check for workflows that might benefit from collaboration
            const hasSharedTargets = this.hasSharedRelationshipTargets(workflowId, otherId);
            const hasComplementaryCapabilities = this.hasComplementaryCapabilities(workflowId, otherId);
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
    getComposition(compositionId) {
        return this.compositions.get(compositionId) || null;
    }
    /**
     * Find workflows that depend on the given workflow
     */
    getDependentWorkflows(workflowId) {
        const dependents = [];
        for (const [sourceId, links] of this.relationships.entries()) {
            const hasDependency = links.some((link) => link.targetId === workflowId &&
                ["composes", "depends_on", "inherits"].includes(link.type));
            if (hasDependency) {
                dependents.push(sourceId);
            }
        }
        return dependents;
    }
    /**
     * Get workflow ecosystem overview
     */
    getEcosystemOverview() {
        const totalWorkflows = this.relationships.size;
        const totalRelationships = Array.from(this.relationships.values()).reduce((sum, links) => sum + links.length, 0);
        const averageConnectivity = totalWorkflows > 0 ? totalRelationships / totalWorkflows : 0;
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
    getInheritanceChain(workflowId) {
        return this.inheritanceChains.get(workflowId) || [workflowId];
    }
    /**
     * Get workflows by relationship type
     */
    getRelatedWorkflows(workflowId, relationshipType) {
        const links = this.relationships.get(workflowId) || [];
        return links
            .filter((link) => link.type === relationshipType)
            .map((link) => link.targetId);
    }
    /**
     * Get all relationships for a workflow
     */
    getRelationships(workflowId) {
        return this.relationships.get(workflowId) || [];
    }
    /**
     * Check for circular dependencies
     */
    hasCircularDependency(workflowId) {
        const visited = new Set();
        const recursionStack = new Set();
        return this.detectCycle(workflowId, visited, recursionStack);
    }
    /**
     * Optimize workflow relationships based on performance data
     */
    optimizeRelationships(workflowId, performanceData) {
        const strengthened = [];
        const weakened = [];
        const newRels = [];
        const removed = [];
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
            const filteredLinks = currentLinks.filter((link) => !removed.includes(link.targetId));
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
    propagateEnhancement(sourceWorkflowId, enhancement, propagationStrategy = "gradual") {
        const affectedWorkflows = [];
        // Get workflows that inherit from the source
        const inheritors = this.getWorkflowsInheritingFrom(sourceWorkflowId);
        for (const inheritorId of inheritors) {
            if (this.shouldPropagateEnhancement(sourceWorkflowId, inheritorId, enhancement)) {
                affectedWorkflows.push(inheritorId);
                if (propagationStrategy === "immediate") {
                    // Apply enhancement immediately
                    this.applyInheritedEnhancement(inheritorId, enhancement, sourceWorkflowId);
                }
            }
        }
        return affectedWorkflows;
    }
    // Private helper methods
    applyInheritedEnhancement(workflowId, enhancement, sourceId) {
        // This would integrate with the workflow execution system
        // For now, we'll just track the inheritance
        console.log(`Applying inherited enhancement from ${sourceId} to ${workflowId}:`, enhancement.description);
    }
    calculateCollaborationPotential(workflowId) {
        const opportunities = this.findCollaborationOpportunities(workflowId);
        const totalOpportunities = opportunities.potentialPartners.length +
            opportunities.compositionOpportunities.length;
        const maxPossibleOpportunities = this.relationships.size - 1; // All other workflows
        return maxPossibleOpportunities > 0
            ? Math.min(1, totalOpportunities / maxPossibleOpportunities)
            : 0;
    }
    canBeComposed(workflowId1, workflowId2) {
        // Check if workflows can be logically composed
        // Avoid circular compositions
        return (!this.hasCircularDependency(workflowId1) &&
            !this.hasCircularDependency(workflowId2) &&
            !this.hasDirectRelationship(workflowId1, workflowId2));
    }
    detectCycle(workflowId, visited, recursionStack) {
        visited.add(workflowId);
        recursionStack.add(workflowId);
        const dependencies = this.dependencyGraph.get(workflowId) || new Set();
        for (const depId of dependencies) {
            if (!visited.has(depId)) {
                if (this.detectCycle(depId, visited, recursionStack)) {
                    return true;
                }
            }
            else if (recursionStack.has(depId)) {
                return true;
            }
        }
        recursionStack.delete(workflowId);
        return false;
    }
    findAllCircularDependencies() {
        const circular = [];
        const visited = new Set();
        for (const workflowId of this.relationships.keys()) {
            if (!visited.has(workflowId) && this.hasCircularDependency(workflowId)) {
                circular.push(workflowId);
            }
            visited.add(workflowId);
        }
        return circular;
    }
    findHubWorkflows() {
        const hubs = [];
        for (const workflowId of this.relationships.keys()) {
            const metrics = this.calculateNetworkMetrics(workflowId);
            // Consider a workflow a hub if it has high connectivity and influence
            if (metrics.connectivityScore > 0.7 && metrics.influenceScore > 0.5) {
                hubs.push(workflowId);
            }
        }
        return hubs;
    }
    findIsolatedWorkflows() {
        const isolated = [];
        for (const [workflowId, links] of this.relationships.entries()) {
            const hasOutgoing = links.length > 0;
            const hasIncoming = this.getDependentWorkflows(workflowId).length > 0;
            if (!hasOutgoing && !hasIncoming) {
                isolated.push(workflowId);
            }
        }
        return isolated;
    }
    getWorkflowsInheritingFrom(workflowId) {
        const inheritors = [];
        for (const [childId, chain] of this.inheritanceChains.entries()) {
            if (chain.includes(workflowId) && childId !== workflowId) {
                inheritors.push(childId);
            }
        }
        return inheritors;
    }
    hasComplementaryCapabilities(workflowId1, workflowId2) {
        // Check if workflows have complementary relationship types in their links
        const links1 = this.relationships.get(workflowId1) || [];
        const links2 = this.relationships.get(workflowId2) || [];
        // Look for complementary relationship patterns
        const hasProducerConsumer = this.hasProducerConsumerPattern(links1, links2);
        const hasRequirementCapabilityMatch = this.hasRequirementCapabilityMatch(links1, links2);
        const hasComplementaryTypes = this.hasComplementaryRelationshipTypes(links1, links2);
        return hasProducerConsumer || hasRequirementCapabilityMatch || hasComplementaryTypes;
    }
    hasProducerConsumerPattern(links1, links2) {
        // Check if one workflow produces what the other consumes
        // Since MemoryLink.type is RelationshipType, we check for semantic relationships
        const outputs1 = links1.filter(l => ["enhances", "supports", "triggers"].includes(l.type));
        const inputs2 = links2.filter(l => ["depends_on", "references"].includes(l.type));
        return outputs1.some(output => inputs2.some(input => input.targetId === output.targetId));
    }
    hasRequirementCapabilityMatch(links1, links2) {
        // Check if one workflow's requirements match the other's capabilities
        const requirements1 = links1.filter(l => l.type === "depends_on");
        const capabilities2 = links2.filter(l => ["enhances", "supports"].includes(l.type));
        return requirements1.some(req => capabilities2.some(cap => cap.targetId === req.targetId));
    }
    hasComplementaryRelationshipTypes(links1, links2) {
        // Check for complementary relationship patterns using actual RelationshipType values
        const types1 = new Set(links1.map(l => l.type));
        const types2 = new Set(links2.map(l => l.type));
        const complementaryPairs = [
            ["enhances", "depends_on"],
            ["supports", "references"],
            ["triggers", "causes"],
            ["extends", "inherits"],
            ["composes", "inherits"]
        ];
        return complementaryPairs.some(([type1, type2]) => (types1.has(type1) && types2.has(type2)) ||
            (types1.has(type2) && types2.has(type1)));
    }
    hasDirectRelationship(workflowId1, workflowId2) {
        const links = this.relationships.get(workflowId1) || [];
        return links.some((link) => link.targetId === workflowId2);
    }
    hasSharedRelationshipTargets(workflowId1, workflowId2) {
        const links1 = this.relationships.get(workflowId1) || [];
        const links2 = this.relationships.get(workflowId2) || [];
        const targets1 = new Set(links1.map((l) => l.targetId));
        const targets2 = new Set(links2.map((l) => l.targetId));
        for (const target of targets1) {
            if (targets2.has(target))
                return true;
        }
        return false;
    }
    shouldPropagateEnhancement(sourceId, targetId, enhancement) {
        // Don't propagate high-risk enhancements automatically
        if (enhancement.validation.riskAssessment === "high")
            return false;
        // Don't propagate if the enhancement is too specific
        if (enhancement.type === "bug_fix" && enhancement.impact < 0.2)
            return false;
        // Check if the enhancement is relevant to the target workflow
        return enhancement.impact > 0.1;
    }
    updateDependencyGraph(sourceId, targetId, type) {
        if (!this.dependencyGraph.has(sourceId)) {
            this.dependencyGraph.set(sourceId, new Set());
        }
        this.dependencyGraph.get(sourceId).add(targetId);
    }
    updateInheritanceChain(childId, parentId) {
        const parentChain = this.inheritanceChains.get(parentId) || [parentId];
        const childChain = [childId, ...parentChain];
        this.inheritanceChains.set(childId, childChain);
    }
}
