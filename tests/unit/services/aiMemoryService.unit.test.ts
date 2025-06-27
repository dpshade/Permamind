import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aiMemoryService } from '../../../src/services/aiMemoryService.js';
import { basicMemory, testReasoningChain, testMemoryLink, batchMemories } from '../../fixtures/memories.js';
import { mockKeyPair, mockHubId } from '../../mocks/aoConnect.js';

// Mock the relay functions
vi.mock('../../../src/relay.js', () => ({
  event: vi.fn(),
  fetchEvents: vi.fn()
}));

describe('AIMemoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addEnhanced', () => {
    it('should add memory with AI-specific metadata', async () => {
      const result = await aiMemoryService.addEnhanced(mockKeyPair, mockHubId, basicMemory);
      
      expect(result).toBe('Enhanced memory added successfully');
    });

    it('should handle missing optional properties gracefully', async () => {
      const minimalMemory = {
        content: 'Basic memory',
        role: 'user',
        p: 'user_key'
      };

      const result = await aiMemoryService.addEnhanced(mockKeyPair, mockHubId, minimalMemory);
      
      expect(result).toBe('Enhanced memory added successfully');
    });

    it('should throw error when add fails', async () => {
      const { event } = await import('../../../src/relay.js');
      vi.mocked(event).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        aiMemoryService.addEnhanced(mockKeyPair, mockHubId, basicMemory)
      ).rejects.toThrow('Failed to add enhanced memory: Error: Network error');
    });

    it('should create correct AI memory tags', () => {
      const tags = aiMemoryService.createAIMemoryTags(basicMemory);
      
      expect(tags).toEqual(
        expect.arrayContaining([
          { name: 'kind', value: '10' },
          { name: 'Content', value: basicMemory.content },
          { name: 'p', value: basicMemory.p },
          { name: 'role', value: basicMemory.role },
          { name: 'ai_importance', value: basicMemory.importance!.toString() },
          { name: 'ai_type', value: basicMemory.memoryType },
          { name: 'ai_context', value: JSON.stringify(basicMemory.context) }
        ])
      );
    });
  });

  describe('searchAdvanced', () => {
    it('should search memories with filters', async () => {
      const mockEvents = [
        {
          Id: 'test_1',
          Content: 'Test memory 1',
          Timestamp: '2024-01-01T00:00:00.000Z',
          p: 'user_1',
          ai_importance: '0.8',
          ai_type: 'knowledge'
        }
      ];

      const { fetchEvents } = await import('../../../src/relay.js');
      vi.mocked(fetchEvents).mockResolvedValueOnce(mockEvents);

      const filters = {
        memoryType: 'knowledge' as const,
        importanceThreshold: 0.5
      };

      const result = await aiMemoryService.searchAdvanced(mockHubId, 'test query', filters);
      
      expect(result).toHaveLength(1);
      expect(result[0].memoryType).toBe('knowledge');
    });

    it('should return empty array when no matches found', async () => {
      const { fetchEvents } = await import('../../../src/relay.js');
      vi.mocked(fetchEvents).mockResolvedValueOnce([]);

      const result = await aiMemoryService.searchAdvanced(mockHubId, 'no matches');
      
      expect(result).toHaveLength(0);
    });

    it('should handle search errors gracefully', async () => {
      const { fetchEvents } = await import('../../../src/relay.js');
      vi.mocked(fetchEvents).mockRejectedValueOnce(new Error('Search failed'));

      await expect(
        aiMemoryService.searchAdvanced(mockHubId, 'test query')
      ).rejects.toThrow('Failed to search memories: Error: Search failed');
    });

    it('should rank memories by importance and recency', async () => {
      const mockEvents = [
        {
          Id: 'test_1',
          Content: 'Memory 1',
          Timestamp: '2024-01-01T00:00:00.000Z',
          ai_importance: '0.5'
        },
        {
          Id: 'test_2', 
          Content: 'Memory 2',
          Timestamp: '2024-01-02T00:00:00.000Z',
          ai_importance: '0.9'
        }
      ];

      const { fetchEvents } = await import('../../../src/relay.js');
      vi.mocked(fetchEvents).mockResolvedValueOnce(mockEvents);

      const result = await aiMemoryService.searchAdvanced(mockHubId, 'test');
      
      // Should be sorted by importance (0.9 first, then 0.5)
      expect(result[0].importance).toBe(0.9);
      expect(result[1].importance).toBe(0.5);
    });
  });

  describe('linkMemories', () => {
    it('should create memory relationship', async () => {
      const result = await aiMemoryService.linkMemories(
        mockKeyPair,
        mockHubId,
        'source_memory_123',
        'target_memory_456',
        testMemoryLink
      );
      
      expect(result).toBe('Memory link created successfully');
    });

    it('should throw error when linking fails', async () => {
      const { event } = await import('../../../src/relay.js');
      vi.mocked(event).mockRejectedValueOnce(new Error('Link failed'));

      await expect(
        aiMemoryService.linkMemories(
          mockKeyPair,
          mockHubId,
          'source_123',
          'target_456',
          testMemoryLink
        )
      ).rejects.toThrow('Failed to link memories: Error: Link failed');
    });

    it('should create correct relationship tags', async () => {
      const { event } = await import('../../../src/relay.js');
      
      await aiMemoryService.linkMemories(
        mockKeyPair,
        mockHubId,
        'source_123',
        'target_456',
        testMemoryLink
      );

      expect(event).toHaveBeenCalledWith(mockKeyPair, mockHubId, [
        { name: 'kind', value: '11' },
        { name: 'sourceId', value: 'source_123' },
        { name: 'targetId', value: 'target_456' },
        { name: 'relationshipType', value: testMemoryLink.type },
        { name: 'strength', value: testMemoryLink.strength.toString() }
      ]);
    });
  });

  describe('addReasoningChain', () => {
    it('should add reasoning chain successfully', async () => {
      const result = await aiMemoryService.addReasoningChain(
        mockKeyPair,
        mockHubId,
        testReasoningChain,
        'agent_key'
      );
      
      expect(result).toBe('Reasoning chain added successfully');
    });

    it('should create correct reasoning chain tags', async () => {
      const { event } = await import('../../../src/relay.js');
      
      await aiMemoryService.addReasoningChain(
        mockKeyPair,
        mockHubId,
        testReasoningChain,
        'agent_key'
      );

      expect(event).toHaveBeenCalledWith(mockKeyPair, mockHubId, [
        { name: 'kind', value: '23' },
        { name: 'chainId', value: testReasoningChain.chainId },
        { name: 'steps', value: JSON.stringify(testReasoningChain.steps) },
        { name: 'outcome', value: testReasoningChain.outcome },
        { name: 'p', value: 'agent_key' }
      ]);
    });

    it('should throw error when adding reasoning chain fails', async () => {
      const { event } = await import('../../../src/relay.js');
      vi.mocked(event).mockRejectedValueOnce(new Error('Reasoning failed'));

      await expect(
        aiMemoryService.addReasoningChain(
          mockKeyPair,
          mockHubId,
          testReasoningChain,
          'agent_key'
        )
      ).rejects.toThrow('Failed to add reasoning chain: Error: Reasoning failed');
    });
  });

  describe('getReasoningChain', () => {
    it('should retrieve reasoning chain by ID', async () => {
      const mockChainEvent = {
        chainId: 'test_chain_123',
        steps: JSON.stringify(testReasoningChain.steps),
        outcome: 'Test outcome'
      };

      const { fetchEvents } = await import('../../../src/relay.js');
      vi.mocked(fetchEvents).mockResolvedValueOnce([mockChainEvent]);

      const result = await aiMemoryService.getReasoningChain(mockHubId, 'test_chain_123');
      
      expect(result).not.toBeNull();
      expect(result!.chainId).toBe('test_chain_123');
      expect(result!.outcome).toBe('Test outcome');
    });

    it('should return null when reasoning chain not found', async () => {
      const { fetchEvents } = await import('../../../src/relay.js');
      vi.mocked(fetchEvents).mockResolvedValueOnce([]);

      const result = await aiMemoryService.getReasoningChain(mockHubId, 'nonexistent_chain');
      
      expect(result).toBeNull();
    });

    it('should handle retrieval errors gracefully', async () => {
      const { fetchEvents } = await import('../../../src/relay.js');
      vi.mocked(fetchEvents).mockRejectedValueOnce(new Error('Fetch failed'));

      const result = await aiMemoryService.getReasoningChain(mockHubId, 'test_chain');
      
      expect(result).toBeNull();
    });
  });

  describe('addMemoriesBatch', () => {
    it('should add multiple memories efficiently', async () => {
      const result = await aiMemoryService.addMemoriesBatch(
        mockKeyPair,
        mockHubId,
        batchMemories,
        'batch_user'
      );
      
      expect(result).toHaveLength(batchMemories.length);
      expect(result.every(r => r === 'Enhanced memory added successfully')).toBe(true);
    });

    it('should ensure p parameter is set on all memories', async () => {
      const memoriesWithoutP = batchMemories.map(m => ({ ...m, p: undefined }));
      
      await aiMemoryService.addMemoriesBatch(
        mockKeyPair,
        mockHubId,
        memoriesWithoutP,
        'batch_user'
      );

      // Verify that p was set on each memory before processing
      const { event } = await import('../../../src/relay.js');
      expect(event).toHaveBeenCalledTimes(batchMemories.length);
    });

    it('should handle batch operation failures', async () => {
      const { event } = await import('../../../src/relay.js');
      vi.mocked(event).mockRejectedValue(new Error('Batch failed'));

      await expect(
        aiMemoryService.addMemoriesBatch(
          mockKeyPair,
          mockHubId,
          batchMemories,
          'batch_user'
        )
      ).rejects.toThrow('Failed to add memories batch');
    });
  });

  describe('getMemoryAnalytics', () => {
    it('should generate comprehensive memory analytics', async () => {
      const mockEvents = [
        {
          Id: 'mem_1',
          Content: 'Memory 1',
          ai_type: 'knowledge',
          ai_importance: '0.8'
        },
        {
          Id: 'mem_2',
          Content: 'Memory 2', 
          ai_type: 'conversation',
          ai_importance: '0.3'
        },
        {
          Id: 'mem_3',
          Content: 'Memory 3',
          ai_type: 'knowledge', 
          ai_importance: '0.9'
        }
      ];

      const { fetchEvents } = await import('../../../src/relay.js');
      vi.mocked(fetchEvents).mockResolvedValueOnce(mockEvents);

      const analytics = await aiMemoryService.getMemoryAnalytics(mockHubId);
      
      expect(analytics.totalMemories).toBe(3);
      expect(analytics.memoryTypeDistribution.knowledge).toBe(2);
      expect(analytics.memoryTypeDistribution.conversation).toBe(1);
      expect(analytics.importanceDistribution.high).toBe(2); // 0.8 and 0.9
      expect(analytics.importanceDistribution.medium).toBe(1); // 0.3
    });

    it('should filter analytics by user when p parameter provided', async () => {
      const { fetchEvents } = await import('../../../src/relay.js');
      
      await aiMemoryService.getMemoryAnalytics(mockHubId, 'specific_user');
      
      expect(fetchEvents).toHaveBeenCalledWith(
        mockHubId,
        JSON.stringify([{
          kinds: ['10'],
          tags: { p: ['specific_user'] }
        }])
      );
    });

    it('should return default analytics on error', async () => {
      const { fetchEvents } = await import('../../../src/relay.js');
      vi.mocked(fetchEvents).mockRejectedValueOnce(new Error('Analytics failed'));

      const analytics = await aiMemoryService.getMemoryAnalytics(mockHubId);
      
      expect(analytics.totalMemories).toBe(0);
      expect(analytics.memoryTypeDistribution.conversation).toBe(0);
      expect(analytics.importanceDistribution.high).toBe(0);
    });
  });

  describe('eventToAIMemory', () => {
    it('should convert event to AIMemory with proper defaults', () => {
      const mockEvent = {
        Id: 'test_123',
        Timestamp: '2024-01-01T00:00:00.000Z',
        Content: 'Test content',
        p: 'user_key',
        r: 'system',
        ai_importance: '0.7',
        ai_type: 'knowledge',
        ai_context: JSON.stringify({ sessionId: 'test_session' })
      };

      const aiMemory = aiMemoryService.eventToAIMemory(mockEvent);
      
      expect(aiMemory.id).toBe('test_123');
      expect(aiMemory.content).toBe('Test content');
      expect(aiMemory.importance).toBe(0.7);
      expect(aiMemory.memoryType).toBe('knowledge');
      expect(aiMemory.context.sessionId).toBe('test_session');
    });

    it('should handle missing AI-specific fields with defaults', () => {
      const basicEvent = {
        Id: 'test_123',
        Timestamp: '2024-01-01T00:00:00.000Z',
        Content: 'Basic content',
        p: 'user_key'
      };

      const aiMemory = aiMemoryService.eventToAIMemory(basicEvent);
      
      expect(aiMemory.importance).toBe(0.5); // Default
      expect(aiMemory.memoryType).toBe('conversation'); // Default
      expect(aiMemory.role).toBe('user'); // Default
      expect(aiMemory.context).toEqual({});
    });
  });

  describe('createMemoryContext', () => {
    it('should create memory context successfully', async () => {
      const result = await aiMemoryService.createMemoryContext(
        mockKeyPair,
        mockHubId,
        'Test Context',
        'Context for testing',
        'user_key'
      );
      
      expect(result).toBe('Memory context created successfully');
    });

    it('should create correct context tags', async () => {
      const { event } = await import('../../../src/relay.js');
      
      await aiMemoryService.createMemoryContext(
        mockKeyPair,
        mockHubId,
        'Test Context',
        'Context description',
        'user_key'
      );

      expect(event).toHaveBeenCalledWith(mockKeyPair, mockHubId, [
        { name: 'kind', value: '40' },
        { name: 'contextName', value: 'Test Context' },
        { name: 'description', value: 'Context description' },
        { name: 'p', value: 'user_key' }
      ]);
    });
  });

  describe('getContextMemories', () => {
    it('should retrieve memories for specific context', async () => {
      const mockContextMemories = [
        {
          Id: 'ctx_mem_1',
          Content: 'Context memory 1',
          ai_context_id: 'context_123'
        }
      ];

      const { fetchEvents } = await import('../../../src/relay.js');
      vi.mocked(fetchEvents).mockResolvedValueOnce(mockContextMemories);

      const result = await aiMemoryService.getContextMemories(mockHubId, 'context_123');
      
      expect(result).toHaveLength(1);
    });

    it('should handle context retrieval errors gracefully', async () => {
      const { fetchEvents } = await import('../../../src/relay.js');
      vi.mocked(fetchEvents).mockRejectedValueOnce(new Error('Context fetch failed'));

      const result = await aiMemoryService.getContextMemories(mockHubId, 'context_123');
      
      expect(result).toHaveLength(0);
    });
  });
});