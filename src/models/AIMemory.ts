import { Memory } from "./Memory.js";

export interface AIMemory extends Memory {
  context: MemoryContext;
  importance: number; // 0-1 relevance score
  memoryType: MemoryType;
  metadata: MemoryMetadata;
  reasoning?: ReasoningTrace;
  relationships?: MemoryLink[];
}

// Context-specific interfaces
export interface ContextChunk {
  chunkIndex: number;
  content: string;
  importance: number;
  section?: string;
  sourceType: ContextSourceType;
  sourceUrl: string;
  tags: string[];
  totalChunks: number;
}

export type ContextSourceType =
  | "ao"
  | "ario"
  | "arweave"
  | "hyperbeam"
  | "permaweb-glossary";

export interface ContextStatus {
  lastUpdated?: string;
  loaded: boolean;
  sources: {
    chunkCount?: number;
    error?: string;
    lastFetched?: string;
    sourceType: string;
    status: "error" | "loaded" | "loading";
    url: string;
  }[];
  totalChunks: number;
  totalWords: number;
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
  chunkIndex?: number;
  domain?: string;
  relatedMemories?: string[];
  section?: string;
  sessionId?: string;
  sourceType?: ContextSourceType;
  // Context-specific properties
  sourceUrl?: string;
  topic?: string;
  totalChunks?: number;
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
  | "context"
  | "conversation"
  | "enhancement"
  | "knowledge"
  | "performance"
  | "procedure"
  | "reasoning"
  | "workflow";

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
  | "composes"
  | "contradicts"
  | "depends_on"
  | "enhances"
  | "extends"
  | "inherits"
  | "references"
  | "replaces"
  | "supports"
  | "triggers";

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
