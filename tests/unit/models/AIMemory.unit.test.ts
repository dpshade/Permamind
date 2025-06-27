import { describe, it, expect } from 'vitest';
import { 
  AIMemory, 
  MemoryType, 
  RelationshipType, 
  MemoryAnalytics, 
  SearchFilters,
  ReasoningTrace 
} from '../../../src/models/AIMemory.js';

describe('AIMemory Types', () => {
  describe('MemoryType', () => {
    it('should define all memory types', () => {
      const types: MemoryType[] = ['conversation', 'reasoning', 'knowledge', 'procedure'];
      
      expect(types).toHaveLength(4);
      expect(types).toContain('conversation');
      expect(types).toContain('reasoning');
      expect(types).toContain('knowledge');
      expect(types).toContain('procedure');
    });
  });

  describe('RelationshipType', () => {
    it('should define all relationship types', () => {
      const types: RelationshipType[] = ['causes', 'supports', 'contradicts', 'extends', 'references'];
      
      expect(types).toHaveLength(5);
      expect(types).toContain('causes');
      expect(types).toContain('supports');
      expect(types).toContain('contradicts');
      expect(types).toContain('extends');
      expect(types).toContain('references');
    });
  });

  describe('AIMemory interface', () => {
    it('should extend base Memory with AI-specific properties', () => {
      const aiMemory: AIMemory = {
        // Base Memory properties
        id: 'test_123',
        content: 'Test memory content',
        role: 'system',
        p: 'user_key',
        timestamp: '2024-01-01T00:00:00.000Z',
        
        // AI-specific properties
        importance: 0.8,
        memoryType: 'knowledge',
        context: {
          sessionId: 'test_session',
          topic: 'testing',
          domain: 'development'
        },
        metadata: {
          accessCount: 0,
          lastAccessed: '2024-01-01T00:00:00.000Z',
          tags: ['test', 'memory']
        }
      };

      expect(aiMemory.importance).toBe(0.8);
      expect(aiMemory.memoryType).toBe('knowledge');
      expect(aiMemory.context.sessionId).toBe('test_session');
      expect(aiMemory.metadata.accessCount).toBe(0);
    });

    it('should support optional relationships and reasoning', () => {
      const aiMemory: AIMemory = {
        id: 'test_123',
        content: 'Test memory',
        role: 'system',
        p: 'user_key',
        timestamp: '2024-01-01T00:00:00.000Z',
        importance: 0.7,
        memoryType: 'reasoning',
        context: {},
        metadata: {
          accessCount: 0,
          lastAccessed: '2024-01-01T00:00:00.000Z'
        },
        relationships: [{
          targetId: 'related_memory_456',
          type: 'supports',
          strength: 0.9
        }],
        reasoning: {
          chainId: 'reasoning_chain_789',
          steps: [],
          outcome: 'Test outcome'
        }
      };

      expect(aiMemory.relationships).toHaveLength(1);
      expect(aiMemory.relationships![0].type).toBe('supports');
      expect(aiMemory.reasoning!.chainId).toBe('reasoning_chain_789');
    });
  });

  describe('ReasoningTrace', () => {
    it('should define reasoning step structure correctly', () => {
      const reasoning: ReasoningTrace = {
        chainId: 'test_chain',
        steps: [
          {
            stepType: 'observation',
            content: 'Observed something',
            confidence: 0.9,
            timestamp: '2024-01-01T00:00:00.000Z'
          },
          {
            stepType: 'thought',
            content: 'Thought about it',
            confidence: 0.8,
            timestamp: '2024-01-01T00:01:00.000Z'
          },
          {
            stepType: 'action',
            content: 'Took action',
            confidence: 0.85,
            timestamp: '2024-01-01T00:02:00.000Z'
          },
          {
            stepType: 'conclusion',
            content: 'Reached conclusion',
            confidence: 0.95,
            timestamp: '2024-01-01T00:03:00.000Z'
          }
        ],
        outcome: 'Successfully completed reasoning'
      };

      expect(reasoning.steps).toHaveLength(4);
      expect(reasoning.steps[0].stepType).toBe('observation');
      expect(reasoning.steps[1].stepType).toBe('thought');
      expect(reasoning.steps[2].stepType).toBe('action');
      expect(reasoning.steps[3].stepType).toBe('conclusion');
    });
  });

  describe('SearchFilters', () => {
    it('should define comprehensive search filter options', () => {
      const filters: SearchFilters = {
        memoryType: 'knowledge',
        importanceThreshold: 0.5,
        timeRange: {
          start: '2024-01-01T00:00:00.000Z',
          end: '2024-01-31T23:59:59.999Z'
        },
        relatedTo: 'memory_123',
        sessionId: 'session_456',
        domain: 'development'
      };

      expect(filters.memoryType).toBe('knowledge');
      expect(filters.importanceThreshold).toBe(0.5);
      expect(filters.timeRange!.start).toBe('2024-01-01T00:00:00.000Z');
      expect(filters.relatedTo).toBe('memory_123');
      expect(filters.sessionId).toBe('session_456');
      expect(filters.domain).toBe('development');
    });

    it('should allow all filter properties to be optional', () => {
      const filters: SearchFilters = {};
      
      expect(filters.memoryType).toBeUndefined();
      expect(filters.importanceThreshold).toBeUndefined();
      expect(filters.timeRange).toBeUndefined();
    });
  });

  describe('MemoryAnalytics', () => {
    it('should define comprehensive analytics structure', () => {
      const analytics: MemoryAnalytics = {
        totalMemories: 100,
        memoryTypeDistribution: {
          conversation: 40,
          reasoning: 20,
          knowledge: 30,
          procedure: 10
        },
        importanceDistribution: {
          high: 25,
          medium: 50,
          low: 25
        },
        accessPatterns: {
          mostAccessed: ['mem_1', 'mem_2', 'mem_3'],
          recentlyAccessed: ['mem_4', 'mem_5', 'mem_6'],
          unusedMemories: ['mem_7', 'mem_8']
        }
      };

      expect(analytics.totalMemories).toBe(100);
      expect(analytics.memoryTypeDistribution.conversation).toBe(40);
      expect(analytics.importanceDistribution.high).toBe(25);
      expect(analytics.accessPatterns.mostAccessed).toHaveLength(3);
    });
  });
});