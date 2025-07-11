import { z } from "zod";
import { readFile } from "fs/promises";
import { join } from "path";
import { ToolCommand, ToolContext } from "../core/index.js";

const HTTPCommandSchema = z.object({
  query: z.string().describe("The HTTP request to make or natural language query"),
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"]).optional().describe("HTTP method (optional, auto-detected from query)"),
  url: z.string().optional().describe("URL to request (optional, auto-detected from query)"),
  headers: z.record(z.string()).optional().describe("HTTP headers as key-value pairs"),
  body: z.string().optional().describe("Request body for POST/PUT/PATCH requests"),
  params: z.record(z.string()).optional().describe("Query parameters as key-value pairs"),
  timeout: z.number().optional().describe("Request timeout in milliseconds (default: 30000)"),
});

type HTTPCommandParams = z.infer<typeof HTTPCommandSchema>;

interface NLSSpec {
  endpoints: Array<{
    name: string;
    url: string;
    description: string;
  }>;
  queryTypes: Array<{
    type: string;
    patterns: string[];
    strategy: string;
  }>;
}

interface QueryClassification {
  type: 'definition' | 'howto' | 'troubleshooting' | 'general';
  confidence: number;
  prioritizeGlossary?: boolean;
  prioritizeTutorials?: boolean;
  prioritizeErrorContent?: boolean;
}

/**
 * HTTP Command with built-in Natural Language Service (NLS) capability
 * Handles both raw HTTP requests and NLS-enhanced queries
 */
export class HTTPCommand extends ToolCommand<HTTPCommandParams, any> {
  protected metadata = {
    name: "http_request",
    description: "Make HTTP requests with optional natural language processing. Supports both direct HTTP requests and intelligent queries for Permaweb documentation.",
    title: "HTTP Request",
  };

  protected parametersSchema = HTTPCommandSchema;
  private nlsSpecs: Map<string, NLSSpec> = new Map();

  constructor(context: ToolContext) {
    super();
    this.loadNLSSpecs();
  }

  /**
   * Execute HTTP command with NLS processing
   */
  async execute(params: HTTPCommandParams, context: ToolContext): Promise<string> {
    const result = await this.executeHttp(params);
    return this.formatResponse(result);
  }

  /**
   * Load NLS specifications from markdown files
   */
  private async loadNLSSpecs(): Promise<void> {
    try {
      const permawebDocsSpec = await this.parseNLSMarkdown("permaweb-docs");
      this.nlsSpecs.set("permaweb-docs", permawebDocsSpec);
    } catch (error) {
      console.warn("Failed to load NLS specs:", error);
    }
  }

  /**
   * Parse NLS markdown file into structured specification
   */
  private async parseNLSMarkdown(specName: string): Promise<NLSSpec> {
    const filePath = join(process.cwd(), "src", "nls", "http", `${specName}.md`);
    const content = await readFile(filePath, "utf-8");

    const spec: NLSSpec = {
      endpoints: [],
      queryTypes: [],
    };

    // Parse URL endpoints (new format without keywords)
    const urlRegex = /### (.+?)\n- \*\*URL\*\*: `(.+?)`\n- \*\*Content\*\*: (.+?)(?=\n###|\n##|\n$)/gs;
    let urlMatch;
    while ((urlMatch = urlRegex.exec(content)) !== null) {
      const [, name, url, description] = urlMatch;
      
      spec.endpoints.push({
        name: name.trim(),
        url: url.trim(),
        description: description.trim(),
      });
    }

    // Parse query type patterns
    const queryTypeRegex = /#### (.+?)\n- \*\*Patterns\*\*:\s*\n((?:\s*- ".*?"\n)+).*?- \*\*Strategy\*\*: (.+?)(?=\n####|\n##|\n$)/gs;
    let queryMatch;
    while ((queryMatch = queryTypeRegex.exec(content)) !== null) {
      const [, type, patternsStr, strategy] = queryMatch;
      const patterns = [...patternsStr.matchAll(/- "(.+?)"/g)].map(m => m[1]);
      
      spec.queryTypes.push({
        type: type.toLowerCase().replace(/\s+/g, ''),
        patterns,
        strategy: strategy.trim(),
      });
    }

    return spec;
  }

  /**
   * Internal HTTP execution method
   */
  private async executeHttp(params: HTTPCommandParams): Promise<{
    success: boolean;
    data?: any;
    error?: { code: string; message: string; details?: any };
    metadata: {
      nlsDetected: boolean;
      detectedSpec?: string;
      matchedEndpoints?: string[];
      originalQuery: string;
      processedParams: any;
    };
  }> {
    const metadata: {
      nlsDetected: boolean;
      detectedSpec?: string;
      matchedEndpoints?: string[];
      originalQuery: string;
      processedParams: any;
    } = {
      nlsDetected: false,
      originalQuery: params.query,
      processedParams: { ...params },
      matchedEndpoints: [],
    };

    try {
      // Try NLS processing first
      const nlsResult = await this.processNLSQuery(params.query);
      if (nlsResult.matched) {
        metadata.nlsDetected = true;
        metadata.detectedSpec = nlsResult.specName;
        metadata.matchedEndpoints = nlsResult.endpoints.map(e => e.name);

        // Execute HTTP requests for all matched endpoints
        const results = await Promise.all(
          nlsResult.endpoints.map(endpoint => this.makeHttpRequest({
            method: "GET",
            url: endpoint.url,
            headers: {
              "Content-Type": "text/plain",
              "User-Agent": "Permamind-NLS/1.0",
            },
            timeout: params.timeout || 30000,
          }))
        );

        return {
          success: true,
          data: {
            nlsQuery: params.query,
            queryClassification: nlsResult.queryClassification,
            endpoints: nlsResult.endpoints.map((endpoint, index) => ({
              name: endpoint.name,
              url: endpoint.url,
              response: results[index],
            })),
            searchResults: this.searchInContent(results, params.query, nlsResult.queryClassification),
          },
          metadata,
        };
      }

      // Fall back to direct HTTP request
      const httpParams = this.parseDirectHttpQuery(params);
      metadata.processedParams = { ...params, ...httpParams };

      const result = await this.makeHttpRequest(httpParams);

      return {
        success: true,
        data: result,
        metadata,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "HTTP_REQUEST_FAILED",
          message: error instanceof Error ? error.message : "Unknown error",
          details: error,
        },
        metadata,
      };
    }
  }

  /**
   * Process natural language query using generalized NLS detection
   */
  private async processNLSQuery(query: string): Promise<{
    matched: boolean;
    specName?: string;
    endpoints: Array<{ name: string; url: string; description: string }>;
    queryClassification: QueryClassification;
  }> {
    if (this.nlsSpecs.size === 0) {
      await this.loadNLSSpecs();
    }

    // Classify the query type generically
    const classification = this.classifyQuery(query);

    // Check all loaded NLS specs to see if any match
    for (const [specName, spec] of this.nlsSpecs.entries()) {
      if (this.matchesNLSSpec(query, spec)) {
        // For any matched NLS spec, fetch all endpoints for comprehensive coverage
        return {
          matched: true,
          specName,
          endpoints: spec.endpoints, // All endpoints from the matching spec
          queryClassification: classification,
        };
      }
    }

    return { 
      matched: false, 
      endpoints: [],
      queryClassification: classification,
    };
  }

  /**
   * Generic query classification based on common patterns
   */
  private classifyQuery(query: string): QueryClassification {
    const lowerQuery = query.toLowerCase();

    // Definition queries
    if (lowerQuery.match(/what is|define|meaning|explain|definition/)) {
      return { type: 'definition', confidence: 0.9 };
    }

    // How-to queries
    if (lowerQuery.match(/how to|how do|steps|guide|tutorial/)) {
      return { type: 'howto', confidence: 0.9 };
    }

    // Troubleshooting queries
    if (lowerQuery.match(/why|error|problem|fix|issue/)) {
      return { type: 'troubleshooting', confidence: 0.8 };
    }

    // General information queries
    return { type: 'general', confidence: 0.7 };
  }

  /**
   * Generic method to check if query matches any NLS spec
   * Uses broad heuristics to determine if this could be related to the spec's domain
   */
  private matchesNLSSpec(query: string, spec: NLSSpec): boolean {
    const lowerQuery = query.toLowerCase();
    
    // For documentation/knowledge queries, be very inclusive
    // Better to fetch docs and find nothing than to miss relevant content
    
    // Check if this looks like a documentation/knowledge query
    const isDocsQuery = lowerQuery.match(/what is|define|explain|tell me about|how|why|meaning|definition/);
    
    // Check if query mentions any technology terms that could be in the docs
    const hasTechTerms = lowerQuery.match(/[a-z]{3,}/g); // Any word 3+ chars could be a tech term
    
    // For documentation specs, be very inclusive for knowledge queries
    if (spec.endpoints.some(e => e.description.toLowerCase().includes('documentation') || 
                                   e.description.toLowerCase().includes('glossary'))) {
      // This is a documentation spec - match on most knowledge-seeking queries
      return isDocsQuery !== null && hasTechTerms !== null && hasTechTerms.length > 0;
    }
    
    // For other specs, check if query relates to endpoint descriptions
    return spec.endpoints.some(endpoint => {
      const description = endpoint.description.toLowerCase();
      
      // Split description into meaningful terms
      const descriptionTerms = description
        .split(/[,\s]+/)
        .filter(term => term.length > 3) // Filter out short words
        .map(term => term.replace(/[^\w]/g, '')); // Clean punctuation
      
      // Check if query contains any significant terms from descriptions
      return descriptionTerms.some(term => lowerQuery.includes(term));
    });
  }

  /**
   * Parse direct HTTP query parameters
   */
  private parseDirectHttpQuery(params: HTTPCommandParams): {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: string;
    timeout: number;
  } {
    const query = params.query;
    let method = params.method || "GET";
    let url = params.url || "";
    const headers = params.headers ? { ...params.headers } : {};

    // Extract URL from query if not provided
    if (!url) {
      const urlMatch = query.match(/https?:\/\/[^\s]+/i);
      if (urlMatch) {
        url = urlMatch[0];
      } else {
        throw new Error("No URL found in query. Please provide a URL.");
      }
    }

    // Extract HTTP method from query if not provided
    if (!params.method) {
      const lowerQuery = query.toLowerCase();
      if (lowerQuery.includes("post") || lowerQuery.includes("create") || lowerQuery.includes("submit")) {
        method = "POST";
      } else if (lowerQuery.includes("put") || lowerQuery.includes("update")) {
        method = "PUT";
      } else if (lowerQuery.includes("delete") || lowerQuery.includes("remove")) {
        method = "DELETE";
      } else if (lowerQuery.includes("patch") || lowerQuery.includes("modify")) {
        method = "PATCH";
      }
    }

    // Extract headers from query
    const authMatch = query.match(/(?:authorization|auth|bearer)[:\s]+([^\s]+)/i);
    if (authMatch) {
      headers["Authorization"] = authMatch[1].startsWith("Bearer") ? authMatch[1] : `Bearer ${authMatch[1]}`;
    }

    const apiKeyMatch = query.match(/(?:api[- ]?key|x-api-key)[:\s]+([^\s]+)/i);
    if (apiKeyMatch) {
      headers["X-API-Key"] = apiKeyMatch[1];
    }

    const contentTypeMatch = query.match(/content-type[:\s]+([^\s]+)/i);
    if (contentTypeMatch) {
      headers["Content-Type"] = contentTypeMatch[1];
    }

    return {
      method,
      url,
      headers,
      body: params.body,
      timeout: params.timeout || 30000,
    };
  }

  /**
   * Make HTTP request
   */
  private async makeHttpRequest(params: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: string;
    timeout: number;
  }): Promise<any> {
    const { method, url, headers, body, timeout } = params;

    const requestOptions: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(timeout),
    };

    if (body && ["POST", "PUT", "PATCH"].includes(method)) {
      requestOptions.body = body;
    }

    try {
      const response = await fetch(url, requestOptions);
      
      const result = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url,
        ok: response.ok,
        data: null as any,
      };

      // Parse response body
      const contentType = response.headers.get("content-type") || "";
      
      if (contentType.includes("application/json")) {
        result.data = await response.json();
      } else {
        result.data = await response.text();
      }

      return result;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      throw error;
    }
  }

  /**
   * Search for relevant content in HTTP responses with intelligent scoring
   */
  private searchInContent(responses: any[], query: string, classification: QueryClassification): any[] {
    const searchTerms = this.extractSearchTerms(query);
    const results = [];

    for (const response of responses) {
      if (response.ok && typeof response.data === "string") {
        const matches = this.analyzeContent(response.data, searchTerms, classification);
        
        if (matches.length > 0) {
          const score = this.calculateContentScore(matches, searchTerms, classification);
          results.push({
            url: response.url,
            sourceName: this.getSourceNameFromUrl(response.url),
            matches: matches.slice(0, 5), // Top 5 matches
            score,
            totalMatches: matches.length,
          });
        }
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Extract meaningful search terms from query
   */
  private extractSearchTerms(query: string): string[] {
    const lowerQuery = query.toLowerCase();
    
    // Remove question words and focus on content terms
    const stopWords = ['what', 'is', 'how', 'do', 'does', 'can', 'will', 'the', 'a', 'an', 'to', 'for', 'of', 'in', 'on', 'at'];
    
    return lowerQuery
      .split(/\s+/)
      .filter(term => term.length > 2 && !stopWords.includes(term))
      .map(term => term.replace(/[^\w]/g, '')); // Clean punctuation
  }

  /**
   * Analyze content for relevant sections based on search terms and query type
   */
  private analyzeContent(content: string, searchTerms: string[], classification: QueryClassification): any[] {
    const lines = content.split("\n");
    const matches = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();
      
      // Check if line contains search terms
      const termMatches = searchTerms.filter(term => lowerLine.includes(term));
      
      if (termMatches.length > 0) {
        // Get context around the match
        const contextStart = Math.max(0, i - 2);
        const contextEnd = Math.min(lines.length - 1, i + 3);
        const context = lines.slice(contextStart, contextEnd + 1).join("\n");
        
        // Score based on content type and query classification
        const contentScore = this.scoreContent(line, context, classification, termMatches.length);
        
        matches.push({
          line: line.trim(),
          context: context.trim(),
          matchedTerms: termMatches,
          contentScore,
          lineIndex: i,
        });
      }
    }

    return matches.sort((a, b) => b.contentScore - a.contentScore);
  }

  /**
   * Score content relevance based on query type and content characteristics
   */
  private scoreContent(line: string, context: string, classification: QueryClassification, termCount: number): number {
    let score = termCount * 10; // Base score from term matches
    
    const lowerLine = line.toLowerCase();
    const lowerContext = context.toLowerCase();
    
    // Boost for definition-style content
    if (classification.type === 'definition') {
      if (lowerLine.match(/^[a-z]+ is|^[a-z]+ are|definition|means/)) score += 20;
      if (lowerContext.includes('definition') || lowerContext.includes('glossary')) score += 15;
    }
    
    // Boost for how-to content
    if (classification.type === 'howto') {
      if (lowerLine.match(/step|guide|tutorial|example|how to/)) score += 20;
      if (lowerContext.match(/1\.|2\.|3\.|step|```|example/)) score += 15;
    }
    
    // Boost for troubleshooting content
    if (classification.type === 'troubleshooting') {
      if (lowerLine.match(/error|problem|issue|fix|solution/)) score += 20;
      if (lowerContext.includes('troubleshoot') || lowerContext.includes('common issue')) score += 15;
    }
    
    // Boost for structured content
    if (lowerLine.match(/^#+|^\*|^-|^\d+\./)) score += 10; // Headers, bullets, numbered lists
    
    // Boost for code examples
    if (lowerContext.includes('```') || lowerContext.includes('`')) score += 8;
    
    return score;
  }

  /**
   * Calculate overall content score for a source
   */
  private calculateContentScore(matches: any[], searchTerms: string[], classification: QueryClassification): number {
    if (matches.length === 0) return 0;
    
    // Sum of individual match scores
    const totalMatchScore = matches.reduce((sum, match) => sum + match.contentScore, 0);
    
    // Bonus for comprehensive coverage (multiple different matches)
    const diversityBonus = Math.min(matches.length * 5, 25);
    
    // Bonus for covering multiple search terms
    const uniqueTermsCovered = new Set(matches.flatMap(m => m.matchedTerms)).size;
    const coverageBonus = (uniqueTermsCovered / searchTerms.length) * 20;
    
    return totalMatchScore + diversityBonus + coverageBonus;
  }

  /**
   * Get human-readable source name from URL
   */
  private getSourceNameFromUrl(url: string): string {
    if (url.includes('arweave-llms')) return 'Arweave Documentation';
    if (url.includes('ao-llms')) return 'AO Documentation';
    if (url.includes('ario-llms')) return 'AR.IO Documentation';
    if (url.includes('hyperbeam-llms')) return 'HyperBEAM Documentation';
    if (url.includes('permaweb-glossary-llms')) return 'Permaweb Glossary';
    return 'Documentation';
  }

  /**
   * Format response for display
   */
  private formatResponse(result: any): string {
    if (!result.success) {
      return `HTTP Request Failed: ${result.error?.message || "Unknown error"}`;
    }

    if (result.metadata.nlsDetected) {
      let formatted = `Documentation Search Results\n`;
      formatted += `Query: ${result.metadata.originalQuery}\n`;
      formatted += `Type: ${result.data.queryClassification?.type || 'general'} query\n`;
      formatted += `Sources: ${result.metadata.matchedEndpoints?.join(", ") || 'Multiple'}\n\n`;

      if (result.data.searchResults && result.data.searchResults.length > 0) {
        formatted += "Relevant Information:\n\n";
        
        result.data.searchResults.slice(0, 3).forEach((searchResult: any, index: number) => {
          formatted += `**${index + 1}. ${searchResult.sourceName}** (Score: ${Math.round(searchResult.score)})\n`;
          
          if (searchResult.matches && searchResult.matches.length > 0) {
            // Show the best match from this source
            const bestMatch = searchResult.matches[0];
            let content = bestMatch.context || bestMatch.line;
            
            // Truncate long content but try to keep complete sentences
            if (content.length > 300) {
              const truncated = content.substring(0, 300);
              const lastSentence = truncated.lastIndexOf('.');
              content = lastSentence > 200 ? truncated.substring(0, lastSentence + 1) : truncated + "...";
            }
            
            formatted += `${content}\n\n`;
          }
        });
        
        // Add summary if multiple sources found useful content
        if (result.data.searchResults.length > 1) {
          const totalSources = result.data.searchResults.length;
          const additionalSources = totalSources - 3;
          if (additionalSources > 0) {
            formatted += `*Found relevant information in ${additionalSources} additional source${additionalSources > 1 ? 's' : ''}.*\n`;
          }
        }
      } else {
        formatted += "No specific information found for this query in the available documentation sources.\n";
        formatted += "You might try rephrasing your question or checking if the term exists in the ecosystem.\n";
      }

      return formatted;
    } else {
      // Format direct HTTP response
      const response = result.data;
      let formatted = `HTTP ${response.status} ${response.statusText}\n`;
      formatted += `URL: ${response.url}\n`;
      formatted += `Success: ${response.ok ? "✓" : "✗"}\n\n`;

      if (response.data) {
        if (typeof response.data === "object") {
          formatted += JSON.stringify(response.data, null, 2);
        } else {
          formatted += String(response.data).substring(0, 1000);
          if (String(response.data).length > 1000) {
            formatted += "... (truncated)";
          }
        }
      }

      return formatted;
    }
  }
}