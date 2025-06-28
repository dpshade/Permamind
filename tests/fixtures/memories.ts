import {
  AIMemory,
  MemoryLink,
  ReasoningTrace,
} from "../../src/models/AIMemory.js";

// Test data fixtures for AI memories
export const basicMemory: Partial<AIMemory> = {
  content: "User prefers TypeScript over JavaScript",
  context: {
    domain: "programming",
    sessionId: "test_session_1",
    topic: "language_preferences",
  },
  importance: 0.7,
  memoryType: "knowledge",
  metadata: {
    accessCount: 0,
    lastAccessed: "2024-01-01T00:00:00.000Z",
    tags: ["typescript", "javascript", "preferences"],
  },
  p: "test_user_key",
  role: "system",
};

export const conversationMemory: Partial<AIMemory> = {
  content: "Discussed project architecture with client",
  context: {
    domain: "project_management",
    sessionId: "client_meeting_1",
    topic: "architecture",
  },
  importance: 0.9,
  memoryType: "conversation",
  metadata: {
    accessCount: 3,
    lastAccessed: "2024-01-02T10:30:00.000Z",
    tags: ["architecture", "client", "meeting"],
  },
  p: "client_key",
  role: "user",
};

export const reasoningMemory: Partial<AIMemory> = {
  content: "Decision to use Redis for session storage",
  context: {
    domain: "system_design",
    sessionId: "architecture_decisions",
    topic: "session_storage",
  },
  importance: 0.85,
  memoryType: "reasoning",
  metadata: {
    accessCount: 1,
    lastAccessed: "2024-01-02T14:15:00.000Z",
    tags: ["redis", "session", "storage", "decision"],
  },
  p: "ai_agent_key",
  role: "system",
};

export const proceduralMemory: Partial<AIMemory> = {
  content:
    "Steps to deploy application: 1) Build 2) Test 3) Deploy to staging 4) Run smoke tests 5) Deploy to production",
  context: {
    domain: "devops",
    sessionId: "deployment_process",
    topic: "deployment",
  },
  importance: 0.95,
  memoryType: "procedure",
  metadata: {
    accessCount: 5,
    lastAccessed: "2024-01-03T09:00:00.000Z",
    tags: ["deployment", "process", "steps", "production"],
  },
  p: "deployment_agent_key",
  role: "system",
};

export const testReasoningChain: ReasoningTrace = {
  chainId: "test_reasoning_001",
  outcome: "Implemented Redis session storage with 99.9% uptime",
  steps: [
    {
      confidence: 0.95,
      content: "Application needs session management",
      stepType: "observation",
      timestamp: "2024-01-01T10:00:00.000Z",
    },
    {
      confidence: 0.85,
      content: "Redis provides fast in-memory storage for sessions",
      stepType: "thought",
      timestamp: "2024-01-01T10:01:00.000Z",
    },
    {
      confidence: 0.9,
      content: "Implement Redis-based session store",
      stepType: "action",
      timestamp: "2024-01-01T10:02:00.000Z",
    },
    {
      confidence: 0.92,
      content: "Redis session store successfully implemented",
      stepType: "conclusion",
      timestamp: "2024-01-01T10:30:00.000Z",
    },
  ],
};

export const testMemoryLink: MemoryLink = {
  strength: 0.8,
  targetId: "memory_target_123",
  type: "supports",
};

export const memoryRelationships = {
  causes: { strength: 0.9, type: "causes" as const },
  contradicts: { strength: 0.7, type: "contradicts" as const },
  extends: { strength: 0.85, type: "extends" as const },
  references: { strength: 0.6, type: "references" as const },
  supports: { strength: 0.8, type: "supports" as const },
};

export const batchMemories: Partial<AIMemory>[] = [
  {
    content: "Batch memory 1",
    importance: 0.5,
    memoryType: "knowledge",
    p: "batch_user_1",
    role: "system",
  },
  {
    content: "Batch memory 2",
    importance: 0.6,
    memoryType: "conversation",
    p: "batch_user_1",
    role: "system",
  },
  {
    content: "Batch memory 3",
    importance: 0.7,
    memoryType: "procedure",
    p: "batch_user_1",
    role: "system",
  },
];

// Mock event data for testing
export const mockEvent = {
  ai_context: JSON.stringify({
    sessionId: "test_session",
    topic: "testing",
  }),
  ai_domain: "development",
  ai_importance: "0.8",
  ai_session: "test_session",
  ai_topic: "testing",
  ai_type: "knowledge",
  Content: "Test memory content",
  Id: "test_event_123",
  p: "test_user_key",
  r: "system",
  Timestamp: "2024-01-01T00:00:00.000Z",
};
