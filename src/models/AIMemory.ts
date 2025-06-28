import { Memory } from "./Memory.js";

export interface AIMemory extends Memory {
  context: MemoryContext;
  importance: number; // 0-1 relevance score
  memoryType: MemoryType;
  metadata: MemoryMetadata;
  reasoning?: ReasoningTrace;
  relationships?: MemoryLink[];
}

export interface MemoryAnalytics {
  accessPatterns: {
    mostAccessed: string[];
    recentlyAccessed: string[];
    unusedMemories: string[];
  };
  importanceDistribution: {
    high: number; // 0.7-1.0
    low: number; // 0.0-0.3
    medium: number; // 0.3-0.7
  };
  memoryTypeDistribution: Record<MemoryType, number>;
  totalMemories: number;
}

export interface MemoryContext {
  domain?: string;
  relatedMemories?: string[];
  sessionId?: string;
  topic?: string;
}

export interface MemoryLink {
  strength: number; // 0-1
  targetId: string;
  type: RelationshipType;
}

export interface MemoryMetadata {
  accessCount: number;
  embedding?: number[];
  lastAccessed: string;
  tags?: string[];
}

export type MemoryType =
  | "conversation"
  | "knowledge"
  | "procedure"
  | "reasoning"
  | "workflow"
  | "enhancement"
  | "performance";

export interface ReasoningStep {
  confidence: number; // 0-1
  content: string;
  stepType: "action" | "conclusion" | "observation" | "thought";
  timestamp: string;
}

export interface ReasoningTrace {
  chainId: string;
  outcome: string;
  steps: ReasoningStep[];
}

export type RelationshipType =
  | "causes"
  | "contradicts"
  | "extends"
  | "references"
  | "supports"
  | "inherits"
  | "composes"
  | "enhances"
  | "triggers"
  | "depends_on"
  | "replaces";

export interface SearchFilters {
  domain?: string;
  importanceThreshold?: number;
  memoryType?: MemoryType;
  relatedTo?: string;
  sessionId?: string;
  timeRange?: {
    end: string;
    start: string;
  };
}
