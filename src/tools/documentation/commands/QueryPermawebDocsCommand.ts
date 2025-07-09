import { z } from "zod";
import { ToolCommand, ToolContext, ToolMetadata } from "../../core/index.js";
import type { PermawebDocsResult } from "../../../services/PermawebDocs.js";

export class QueryPermawebDocsCommand extends ToolCommand<any, any> {
  protected metadata: ToolMetadata = {
    name: "queryPermawebDocs",
    description: `Query comprehensive Permaweb ecosystem documentation with intelligent domain detection. 
    Automatically searches through Arweave, AO, AR.IO, HyperBEAM, and Permaweb glossary based on your query. 
    Returns relevant documentation sections with high accuracy scoring. Includes automatic backoff 
    mechanism to reduce results if response size approaches context limits.`,
    openWorldHint: false,
    readOnlyHint: true,
    title: "Query Permaweb Documentation",
  };

  protected parametersSchema = z.object({
    domains: z
      .string()
      .optional()
      .describe(
        "Comma-separated list of domains to search (arweave,ao,ario,hyperbeam,permaweb-glossary). If not provided, domains are auto-detected.",
      ),
    maxResults: z
      .number()
      .min(1)
      .max(20)
      .optional()
      .describe(
        "Maximum number of results to return (default: 10). May be automatically reduced to prevent context limits.",
      ),
    query: z
      .string()
      .describe("Your question or search query about the Permaweb ecosystem"),
  });

  constructor(private context: ToolContext) {
    super();
  }

  async execute(args: any): Promise<any> {
    try {
      const { permawebDocs } = await import("../../../services/PermawebDocs.js");

      // Progressive backoff strategy for context limit management
      const backoffLevels = [
        { label: "standard", maxResults: args.maxResults || 10 },
        { label: "reduced", maxResults: 5 },
        { label: "minimal", maxResults: 3 },
        { label: "single", maxResults: 1 },
      ];

      const maxContextTokens = 8000; // Conservative estimate for context limits
      let backoffLevel = 0;
      let docsResults: PermawebDocsResult[] = [];
      let estimatedTokens = 0;

      // Try each backoff level until we get a manageable response size
      for (const level of backoffLevels) {
        try {
          const domains = args.domains
            ? args.domains.split(",").map((d: string) => d.trim())
            : undefined;
          docsResults = await permawebDocs.query(
            args.query,
            domains,
            level.maxResults,
          );

          if (docsResults.length === 0) {
            break; // No results to process
          }

          // Estimate token count for the response
          estimatedTokens = permawebDocs.estimateResponseTokens(docsResults);

          // Add some overhead for JSON structure and metadata
          const responseOverhead = 1000;
          const totalEstimatedTokens = estimatedTokens + responseOverhead;

          if (
            totalEstimatedTokens <= maxContextTokens ||
            backoffLevel === backoffLevels.length - 1
          ) {
            break; // Response size is acceptable or this is our last attempt
          }

          backoffLevel++;
        } catch (queryError) {
          // If query fails at this level, try the next backoff level
          if (backoffLevel === backoffLevels.length - 1) {
            throw queryError; // This was our last attempt
          }
          backoffLevel++;
        }
      }

      if (docsResults.length > 0) {
        const permawebResults = docsResults.map((result) => ({
          content: result.content,
          domain: result.domain,
          isFullDocument: false, // These are chunked results
          relevanceScore: result.relevanceScore,
          type: "permaweb_docs",
          url: result.url,
        }));

        const response = {
          query: args.query,
          results: permawebResults,
          success: true,
          totalResults: permawebResults.length,
          ...(backoffLevel > 0 && {
            backoff: {
              estimatedTokens: estimatedTokens,
              level: backoffLevel,
              message: `Results limited to ${backoffLevels[backoffLevel].maxResults} to stay within context limits`,
              strategy: backoffLevels[backoffLevel].label,
            },
          }),
        };

        return JSON.stringify(response);
      }

      return JSON.stringify({
        query: args.query,
        results: [],
        success: true,
        totalResults: 0,
      });
    } catch (error) {
      return JSON.stringify({
        error: `Documentation query failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        query: args.query,
        success: false,
      });
    }
  }
}