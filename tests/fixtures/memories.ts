import {
  AIMemory,
  MemoryType,
  ReasoningTrace,
  MemoryLink,
} from "../../src/models/AIMemory.js";

// Test data fixtures for AI memories
export const basicMemory: Partial<AIMemory> = {
  content: "User prefers TypeScript over JavaScript",
  role: "system",
  p: "test_user_key",
  importance: 0.7,
  memoryType: "knowledge",
  context: {
    sessionId: "test_session_1",
    topic: "language_preferences",
    domain: "programming",
  },
  metadata: {
    accessCount: 0,
    lastAccessed: "2024-01-01T00:00:00.000Z",
    tags: ["typescript", "javascript", "preferences"],
  },
};

export const conversationMemory: Partial<AIMemory> = {
  content: "Discussed project architecture with client",
  role: "user",
  p: "client_key",
  importance: 0.9,
  memoryType: "conversation",
  context: {
    sessionId: "client_meeting_1",
    topic: "architecture",
    domain: "project_management",
  },
  metadata: {
    accessCount: 3,
    lastAccessed: "2024-01-02T10:30:00.000Z",
    tags: ["architecture", "client", "meeting"],
  },
};

export const reasoningMemory: Partial<AIMemory> = {
  content: "Decision to use Redis for session storage",
  role: "system",
  p: "ai_agent_key",
  importance: 0.85,
  memoryType: "reasoning",
  context: {
    sessionId: "architecture_decisions",
    topic: "session_storage",
    domain: "system_design",
  },
  metadata: {
    accessCount: 1,
    lastAccessed: "2024-01-02T14:15:00.000Z",
    tags: ["redis", "session", "storage", "decision"],
  },
};

export const proceduralMemory: Partial<AIMemory> = {
  content:
    "Steps to deploy application: 1) Build 2) Test 3) Deploy to staging 4) Run smoke tests 5) Deploy to production",
  role: "system",
  p: "deployment_agent_key",
  importance: 0.95,
  memoryType: "procedure",
  context: {
    sessionId: "deployment_process",
    topic: "deployment",
    domain: "devops",
  },
  metadata: {
    accessCount: 5,
    lastAccessed: "2024-01-03T09:00:00.000Z",
    tags: ["deployment", "process", "steps", "production"],
  },
};

export const testReasoningChain: ReasoningTrace = {
  chainId: "test_reasoning_001",
  steps: [
    {
      stepType: "observation",
      content: "Application needs session management",
      confidence: 0.95,
      timestamp: "2024-01-01T10:00:00.000Z",
    },
    {
      stepType: "thought",
      content: "Redis provides fast in-memory storage for sessions",
      confidence: 0.85,
      timestamp: "2024-01-01T10:01:00.000Z",
    },
    {
      stepType: "action",
      content: "Implement Redis-based session store",
      confidence: 0.9,
      timestamp: "2024-01-01T10:02:00.000Z",
    },
    {
      stepType: "conclusion",
      content: "Redis session store successfully implemented",
      confidence: 0.92,
      timestamp: "2024-01-01T10:30:00.000Z",
    },
  ],
  outcome: "Implemented Redis session storage with 99.9% uptime",
};

export const testMemoryLink: MemoryLink = {
  targetId: "memory_target_123",
  type: "supports",
  strength: 0.8,
};

export const memoryRelationships = {
  causes: { type: "causes" as const, strength: 0.9 },
  supports: { type: "supports" as const, strength: 0.8 },
  contradicts: { type: "contradicts" as const, strength: 0.7 },
  extends: { type: "extends" as const, strength: 0.85 },
  references: { type: "references" as const, strength: 0.6 },
};

export const batchMemories: Partial<AIMemory>[] = [
  {
    content: "Batch memory 1",
    role: "system",
    p: "batch_user_1",
    importance: 0.5,
    memoryType: "knowledge",
  },
  {
    content: "Batch memory 2",
    role: "system",
    p: "batch_user_1",
    importance: 0.6,
    memoryType: "conversation",
  },
  {
    content: "Batch memory 3",
    role: "system",
    p: "batch_user_1",
    importance: 0.7,
    memoryType: "procedure",
  },
];

// Mock event data for testing
export const mockEvent = {
  Id: "test_event_123",
  Timestamp: "2024-01-01T00:00:00.000Z",
  Content: "Test memory content",
  p: "test_user_key",
  r: "system",
  ai_importance: "0.8",
  ai_type: "knowledge",
  ai_context: JSON.stringify({
    sessionId: "test_session",
    topic: "testing",
  }),
  ai_session: "test_session",
  ai_topic: "testing",
  ai_domain: "development",
};
