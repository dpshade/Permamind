import { JWKInterface } from "arweave/node/lib/wallet.js";

import {
  AIMemory,
  ContextChunk,
  ContextStatus,
  MemoryType,
} from "../models/AIMemory.js";
import { aiMemoryService } from "./aiMemoryService.js";

// Configuration for context sources
const CONTEXT_SOURCES = [
  {
    description: "HyperBEAM decentralized computing implementation",
    priority: 0.8,
    sourceType: "hyperbeam" as const,
    url: "https://fuel_permawebllms.permagate.io/hyperbeam-llms.txt",
  },
  {
    description: "Arweave ecosystem development guides (65 docs, 21k words)",
    priority: 0.9,
    sourceType: "arweave" as const,
    url: "https://fuel_permawebllms.permagate.io/arweave-llms.txt",
  },
  {
    description: "AO computer system documentation (90 docs, 37k words)",
    priority: 1.0,
    sourceType: "ao" as const,
    url: "https://fuel_permawebllms.permagate.io/ao-llms.txt",
  },
  {
    description: "AR.IO ecosystem infrastructure (125 docs, 78k words)",
    priority: 0.85,
    sourceType: "ario" as const,
    url: "https://fuel_permawebllms.permagate.io/ario-llms.txt",
  },
  {
    description: "Comprehensive Permaweb glossary (9.7k words)",
    priority: 0.7,
    sourceType: "permaweb-glossary" as const,
    url: "https://fuel_permawebllms.permagate.io/permaweb-glossary-llms.txt",
  },
] as const;

// Chunking configuration
const CHUNK_CONFIG = {
  maxChunkSize: 2000, // characters
  minChunkSize: 500,
  overlapSize: 200,
  sectionMarkers: ["#", "##", "###", "####", "Document", "Guide", "Chapter"],
};

// Cache configuration
const CACHE_CONFIG = {
  maxRetries: 3,
  retryDelayMs: 2000,
  ttlHours: 24, // Time to live for cached content
};

export interface ContextInitializationService {
  getContextStatus: (hubId: string) => Promise<ContextStatus>;
  initializeContext: (
    signer: JWKInterface,
    hubId: string,
    publicKey: string,
    progressCallback?: (message: string) => void,
  ) => Promise<ContextStatus>;
  initializeContextWithGreeting: (
    signer: JWKInterface,
    hubId: string,
    publicKey: string,
  ) => Promise<string[]>;
  refreshContext: (
    signer: JWKInterface,
    hubId: string,
    publicKey: string,
    sourceTypes?: string[],
  ) => Promise<ContextStatus>;
  searchContextContent: (
    hubId: string,
    query: string,
    sourceTypes?: string[],
  ) => Promise<AIMemory[]>;
}

interface CachedContent {
  content: string;
  fetchedAt: string;
  sourceType: string;
  url: string;
}

interface ChunkingResult {
  chunks: ContextChunk[];
  totalWords: number;
}

class ContextService implements ContextInitializationService {
  private cache = new Map<string, CachedContent>();
  private initializationPromise: null | Promise<ContextStatus> = null;
  private sessionInitialized = new Set<string>(); // Track which sessions have loaded context

  async getContextStatus(hubId: string): Promise<ContextStatus> {
    try {
      // Query for context memories to get current status
      const contextMemories = await aiMemoryService.searchAdvanced(hubId, "", {
        memoryType: "context" as MemoryType,
      });

      const sourceGroups = new Map<string, AIMemory[]>();
      contextMemories.forEach((memory) => {
        const sourceType = memory.context.sourceType || "unknown";
        if (!sourceGroups.has(sourceType)) {
          sourceGroups.set(sourceType, []);
        }
        sourceGroups.get(sourceType)!.push(memory);
      });

      const sources = Array.from(sourceGroups.entries()).map(
        ([sourceType, memories]) => {
          const latestMemory = memories.reduce((latest, current) =>
            new Date(current.timestamp) > new Date(latest.timestamp)
              ? current
              : latest,
          );

          return {
            chunkCount: memories.length,
            lastFetched: latestMemory.timestamp,
            sourceType,
            status: "loaded" as const,
            url: latestMemory.context.sourceUrl || "",
          };
        },
      );

      const totalWords = contextMemories.reduce(
        (sum, memory) => sum + (memory.content?.length || 0),
        0,
      );

      return {
        lastUpdated:
          contextMemories.length > 0 ? contextMemories[0].timestamp : undefined,
        loaded: contextMemories.length > 0,
        sources,
        totalChunks: contextMemories.length,
        totalWords: Math.floor(totalWords / 5), // Rough word count estimate
      };
    } catch {
      return {
        loaded: false,
        sources: [],
        totalChunks: 0,
        totalWords: 0,
      };
    }
  }

  async initializeContext(
    signer: JWKInterface,
    hubId: string,
    publicKey: string,
    progressCallback?: (message: string) => void,
  ): Promise<ContextStatus> {
    // Prevent multiple simultaneous initializations
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization(
      signer,
      hubId,
      publicKey,
      progressCallback,
    );

    try {
      const result = await this.initializationPromise;
      return result;
    } finally {
      this.initializationPromise = null;
    }
  }

  async initializeContextWithGreeting(
    signer: JWKInterface,
    hubId: string,
    publicKey: string,
  ): Promise<string[]> {
    const sessionKey = `${hubId}_${publicKey}`;
    const messages: string[] = [];

    // Check if already initialized for this session
    if (this.sessionInitialized.has(sessionKey)) {
      const status = await this.getContextStatus(hubId);
      if (status.loaded && status.totalChunks > 0) {
        messages.push(
          "👋 Hello! I already have comprehensive knowledge of the Permaweb ecosystem loaded and ready.",
        );
        messages.push(
          `📚 Currently loaded: ${status.totalChunks} knowledge chunks covering Arweave, AO, AR.IO, HyperBEAM, and Permaweb.`,
        );
        messages.push("🚀 What would you like to know about the Permaweb?");
        return messages;
      }
    }

    // Start friendly loading process
    messages.push("👋 Hello! Great to meet you!");
    messages.push(
      "🧠 Let me load up my comprehensive knowledge of the Permaweb ecosystem...",
    );

    const progressMessages: string[] = [];
    const progressCallback = (message: string) => {
      progressMessages.push(message);
    };

    try {
      const status = await this.initializeContext(
        signer,
        hubId,
        publicKey,
        progressCallback,
      );

      // Add all progress messages
      messages.push(...progressMessages);

      if (status.loaded) {
        this.sessionInitialized.add(sessionKey);
        messages.push(
          "✅ Perfect! I'm now equipped with comprehensive knowledge including:",
        );
        messages.push(
          `📖 Arweave Ecosystem (21k+ words of development guides)`,
        );
        messages.push(`⚡ AO Computer System (37k+ words of documentation)`);
        messages.push(
          `🌐 AR.IO Infrastructure (78k+ words of ecosystem guides)`,
        );
        messages.push(`💫 HyperBEAM Computing and Permaweb Glossary`);
        messages.push("");
        messages.push(
          "🚀 I'm ready to help with anything Permaweb-related! What would you like to explore?",
        );
      } else {
        messages.push(
          "⚠️ I encountered some issues loading the full knowledge base, but I'm still here to help!",
        );
        messages.push(
          "🔄 You can try asking me to refresh my context later if needed.",
        );
      }
    } catch {
      messages.push(
        "❌ Oops! I had trouble loading my knowledge base right now.",
      );
      messages.push(
        "🤔 I can still help with general questions, though my Permaweb knowledge might be limited.",
      );
      messages.push(
        "💡 You can ask me to refresh my context when you're ready to try again.",
      );
    }

    return messages;
  }

  async refreshContext(
    signer: JWKInterface,
    hubId: string,
    publicKey: string,
    sourceTypes?: string[],
  ): Promise<ContextStatus> {
    const sourcesToRefresh = sourceTypes
      ? CONTEXT_SOURCES.filter((s) => sourceTypes.includes(s.sourceType))
      : CONTEXT_SOURCES;

    const status: ContextStatus = {
      lastUpdated: new Date().toISOString(),
      loaded: false,
      sources: [],
      totalChunks: 0,
      totalWords: 0,
    };

    for (const source of sourcesToRefresh) {
      const sourceStatus = {
        chunkCount: undefined as number | undefined,
        error: undefined as string | undefined,
        lastFetched: undefined as string | undefined,
        sourceType: source.sourceType,
        status: "loading" as "error" | "loaded" | "loading",
        url: source.url,
      };
      status.sources.push(sourceStatus);

      try {
        // Force fetch (bypass cache)
        const content = await this.fetchContentWithRetry(source.url);

        // Remove existing context memories for this source
        await this.removeContextMemories();

        // Chunk and store new content
        const chunkingResult = this.chunkContent(
          content,
          source.url,
          source.sourceType,
          source.priority,
        );

        await this.storeContextChunks(
          signer,
          hubId,
          publicKey,
          chunkingResult.chunks,
        );

        sourceStatus.status = "loaded";
        sourceStatus.chunkCount = chunkingResult.chunks.length;
        sourceStatus.lastFetched = new Date().toISOString();

        status.totalChunks += chunkingResult.chunks.length;
        status.totalWords += chunkingResult.totalWords;

        // Update cache
        this.cache.set(source.url, {
          content,
          fetchedAt: new Date().toISOString(),
          sourceType: source.sourceType,
          url: source.url,
        });
      } catch (err) {
        sourceStatus.status = "error";
        sourceStatus.error =
          err instanceof Error ? err.message : "Unknown error";
      }
    }

    status.loaded = true;
    return status;
  }

  async searchContextContent(
    hubId: string,
    query: string,
    sourceTypes?: string[],
  ): Promise<AIMemory[]> {
    try {
      // Search for context memories
      const memories = await aiMemoryService.searchAdvanced(hubId, query, {
        memoryType: "context" as MemoryType,
      });

      // Filter by source types if specified
      if (sourceTypes) {
        return memories.filter((memory) =>
          sourceTypes.includes(memory.context.sourceType || ""),
        );
      }

      return memories;
    } catch {
      return [];
    }
  }

  private chunkContent(
    content: string,
    sourceUrl: string,
    sourceType: "ao" | "ario" | "arweave" | "hyperbeam" | "permaweb-glossary",
    basePriority: number,
  ): ChunkingResult {
    const chunks: ContextChunk[] = [];
    const lines = content.split("\n");
    let currentChunk = "";
    let currentSection = "";
    let chunkIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detect section headers
      if (
        CHUNK_CONFIG.sectionMarkers.some((marker) => line.startsWith(marker))
      ) {
        // Save current chunk if it has content
        if (currentChunk.trim().length > CHUNK_CONFIG.minChunkSize) {
          chunks.push(
            this.createContextChunk(
              currentChunk.trim(),
              sourceUrl,
              sourceType,
              currentSection,
              chunkIndex,
              basePriority,
            ),
          );
          chunkIndex++;
          currentChunk = "";
        }
        currentSection = line;
      }

      currentChunk += line + "\n";

      // Check if chunk is getting too large
      if (currentChunk.length > CHUNK_CONFIG.maxChunkSize) {
        // Try to find a good break point
        const breakPoint = this.findBreakPoint(currentChunk);
        if (breakPoint > CHUNK_CONFIG.minChunkSize) {
          const chunkContent = currentChunk.substring(0, breakPoint);
          chunks.push(
            this.createContextChunk(
              chunkContent.trim(),
              sourceUrl,
              sourceType,
              currentSection,
              chunkIndex,
              basePriority,
            ),
          );
          chunkIndex++;

          // Keep overlap for context continuity
          currentChunk = currentChunk.substring(
            Math.max(0, breakPoint - CHUNK_CONFIG.overlapSize),
          );
        }
      }
    }

    // Add final chunk if it has content
    if (currentChunk.trim().length > CHUNK_CONFIG.minChunkSize) {
      chunks.push(
        this.createContextChunk(
          currentChunk.trim(),
          sourceUrl,
          sourceType,
          currentSection,
          chunkIndex,
          basePriority,
        ),
      );
    }

    // Update total chunks for all chunks
    chunks.forEach((chunk) => {
      chunk.totalChunks = chunks.length;
    });

    const totalWords = chunks.reduce(
      (sum, chunk) => sum + chunk.content.split(/\s+/).length,
      0,
    );

    return { chunks, totalWords };
  }

  private createContextChunk(
    content: string,
    sourceUrl: string,
    sourceType: "ao" | "ario" | "arweave" | "hyperbeam" | "permaweb-glossary",
    section: string,
    chunkIndex: number,
    basePriority: number,
  ): ContextChunk {
    // Calculate importance based on content characteristics
    let importance = basePriority;

    // Boost importance for certain keywords
    const importantKeywords = [
      "api",
      "example",
      "guide",
      "tutorial",
      "implementation",
      "configuration",
      "installation",
      "getting started",
    ];

    const contentLower = content.toLowerCase();
    const keywordMatches = importantKeywords.filter((keyword) =>
      contentLower.includes(keyword),
    ).length;

    importance = Math.min(1.0, importance + keywordMatches * 0.05);

    // Generate tags based on content
    const tags = this.generateTags(content, sourceType, section);

    return {
      chunkIndex,
      content,
      importance,
      section: section || "General",
      sourceType,
      sourceUrl,
      tags,
      totalChunks: 0, // Will be updated after all chunks are created
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async fetchContentWithRetry(url: string): Promise<string> {
    // Check cache first
    const cached = this.cache.get(url);
    if (cached && this.isCacheValid(cached)) {
      return cached.content;
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= CACHE_CONFIG.maxRetries; attempt++) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const content = await response.text();
        if (!content || content.trim().length === 0) {
          throw new Error("Empty content received");
        }

        return content;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < CACHE_CONFIG.maxRetries) {
          await this.delay(CACHE_CONFIG.retryDelayMs * attempt);
        }
      }
    }

    throw new Error(
      `Failed to fetch ${url} after ${CACHE_CONFIG.maxRetries} attempts: ${lastError?.message}`,
    );
  }

  private findBreakPoint(text: string): number {
    // Try to break at paragraph boundaries
    const paragraphBreak = text.lastIndexOf("\n\n", CHUNK_CONFIG.maxChunkSize);
    if (paragraphBreak > CHUNK_CONFIG.minChunkSize) {
      return paragraphBreak;
    }

    // Try to break at sentence boundaries
    const sentenceBreak = text.lastIndexOf(". ", CHUNK_CONFIG.maxChunkSize);
    if (sentenceBreak > CHUNK_CONFIG.minChunkSize) {
      return sentenceBreak + 2;
    }

    // Fall back to word boundaries
    const wordBreak = text.lastIndexOf(" ", CHUNK_CONFIG.maxChunkSize);
    return wordBreak > CHUNK_CONFIG.minChunkSize
      ? wordBreak
      : CHUNK_CONFIG.maxChunkSize;
  }

  private generateTags(
    content: string,
    sourceType: string,
    section: string,
  ): string[] {
    const tags = [sourceType, "context", "documentation"];

    // Add section-based tags
    if (section) {
      const sectionWords = section
        .toLowerCase()
        .replace(/[#\-_]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 2);
      tags.push(...sectionWords);
    }

    // Add content-based tags
    const contentKeywords = [
      "api",
      "cli",
      "guide",
      "tutorial",
      "example",
      "configuration",
      "installation",
      "deployment",
      "token",
      "process",
      "message",
      "contract",
      "blockchain",
      "decentralized",
    ];

    const contentLower = content.toLowerCase();
    contentKeywords.forEach((keyword) => {
      if (contentLower.includes(keyword)) {
        tags.push(keyword);
      }
    });

    return Array.from(new Set(tags)); // Remove duplicates
  }

  private isCacheValid(cached: CachedContent): boolean {
    const cacheAge = Date.now() - new Date(cached.fetchedAt).getTime();
    const maxAge = CACHE_CONFIG.ttlHours * 60 * 60 * 1000;
    return cacheAge < maxAge;
  }

  private async performInitialization(
    signer: JWKInterface,
    hubId: string,
    publicKey: string,
    progressCallback?: (message: string) => void,
  ): Promise<ContextStatus> {
    const status: ContextStatus = {
      lastUpdated: new Date().toISOString(),
      loaded: false,
      sources: [],
      totalChunks: 0,
      totalWords: 0,
    };

    // Process each source
    for (const source of CONTEXT_SOURCES) {
      const sourceStatus = {
        chunkCount: undefined as number | undefined,
        error: undefined as string | undefined,
        lastFetched: undefined as string | undefined,
        sourceType: source.sourceType,
        status: "loading" as "error" | "loaded" | "loading",
        url: source.url,
      };
      status.sources.push(sourceStatus);

      try {
        if (progressCallback) {
          progressCallback(`🔄 Loading ${source.description}...`);
        }

        // Fetch content with retry logic
        const content = await this.fetchContentWithRetry(source.url);

        if (progressCallback) {
          progressCallback(
            `📥 Processing ${source.sourceType} documentation...`,
          );
        }

        // Chunk the content
        const chunkingResult = this.chunkContent(
          content,
          source.url,
          source.sourceType,
          source.priority,
        );

        if (progressCallback) {
          progressCallback(
            `💾 Storing ${chunkingResult.chunks.length} knowledge chunks for ${source.sourceType}...`,
          );
        }

        // Store chunks as memories
        await this.storeContextChunks(
          signer,
          hubId,
          publicKey,
          chunkingResult.chunks,
        );

        // Update source status
        sourceStatus.status = "loaded";
        sourceStatus.chunkCount = chunkingResult.chunks.length;
        sourceStatus.lastFetched = new Date().toISOString();

        status.totalChunks += chunkingResult.chunks.length;
        status.totalWords += chunkingResult.totalWords;

        if (progressCallback) {
          progressCallback(
            `✅ ${source.sourceType} loaded successfully! (${chunkingResult.chunks.length} chunks, ${Math.floor(chunkingResult.totalWords / 1000)}k words)`,
          );
        }

        // Cache the content
        this.cache.set(source.url, {
          content,
          fetchedAt: new Date().toISOString(),
          sourceType: source.sourceType,
          url: source.url,
        });
      } catch (err) {
        sourceStatus.status = "error";
        sourceStatus.error =
          err instanceof Error ? err.message : "Unknown error";

        if (progressCallback) {
          progressCallback(
            `❌ Failed to load ${source.sourceType}: ${sourceStatus.error}`,
          );
        }
      }
    }

    status.loaded = true;
    return status;
  }

  private async removeContextMemories(): Promise<void> {
    try {
      // This would require implementing a deletion method in aiMemoryService
      // For now, we'll rely on the fact that new chunks will be more recent
      // and will appear first in search results
    } catch {
      // Failed to remove old context memories - continuing without logging
    }
  }

  private async storeContextChunks(
    signer: JWKInterface,
    hubId: string,
    publicKey: string,
    chunks: ContextChunk[],
  ): Promise<void> {
    for (const chunk of chunks) {
      const aiMemory: Partial<AIMemory> = {
        content: chunk.content,
        context: {
          chunkIndex: chunk.chunkIndex,
          domain: "permaweb-documentation",
          section: chunk.section,
          sourceType: chunk.sourceType,
          sourceUrl: chunk.sourceUrl,
          totalChunks: chunk.totalChunks,
        },
        importance: chunk.importance,
        memoryType: "context" as MemoryType,
        metadata: {
          accessCount: 0,
          lastAccessed: new Date().toISOString(),
          tags: chunk.tags,
        },
        p: publicKey,
        role: "system",
      };

      try {
        await aiMemoryService.addEnhanced(signer, hubId, aiMemory);
      } catch {
        // Failed to store context chunk - continuing with other chunks
      }
    }
  }
}

export const contextInitializationService = new ContextService();
