import { z } from "zod";

import type { PermawebDomain } from "../../../services/PermawebDocsService.js";

import { ToolCommand, ToolContext, ToolMetadata } from "../../core/index.js";

interface ManagePermawebDocsCacheArgs {
  action: "clear" | "preload" | "status";
  domains?: string;
}

export class ManagePermawebDocsCacheCommand extends ToolCommand<
  ManagePermawebDocsCacheArgs,
  string
> {
  protected metadata: ToolMetadata = {
    description: `Manage the Permaweb documentation cache. Check cache status, preload documentation, 
    or clear cached content for specific domains. Useful for ensuring fresh documentation or optimizing performance.`,
    name: "managePermawebDocsCache",
    openWorldHint: false,
    readOnlyHint: false,
    title: "Manage Permaweb Docs Cache",
  };

  protected parametersSchema = z.object({
    action: z
      .enum(["status", "preload", "clear"])
      .describe(
        "Action to perform: status (check cache), preload (load docs), clear (remove cache)",
      ),
    domains: z
      .string()
      .optional()
      .describe(
        "Comma-separated list of domains for preload/clear actions (arweave,ao,ario,hyperbeam,permaweb-glossary)",
      ),
  });

  constructor(private context: ToolContext) {
    super();
  }

  async execute(args: ManagePermawebDocsCacheArgs): Promise<string> {
    try {
      const { permawebDocs } = await import(
        "../../../services/PermawebDocsService.js"
      );

      if (args.action === "status") {
        const status = permawebDocs.getCacheStatus();
        return JSON.stringify({
          action: "status",
          cacheStatus: status,
          success: true,
        });
      }

      if (args.action === "preload") {
        const domains = args.domains
          ? (args.domains
              .split(",")
              .map((d: string) => d.trim()) as PermawebDomain[])
          : undefined;
        await permawebDocs.preload(domains);
        return JSON.stringify({
          action: "preload",
          domains: domains || permawebDocs.getAvailableDomains(),
          message: "Documentation preloaded successfully",
          success: true,
        });
      }

      if (args.action === "clear") {
        if (args.domains) {
          const domains = args.domains
            .split(",")
            .map((d: string) => d.trim()) as PermawebDomain[];
          domains.forEach((domain) => permawebDocs.clearCache(domain));
          return JSON.stringify({
            action: "clear",
            domains: domains,
            message: "Cache cleared for specified domains",
            success: true,
          });
        } else {
          permawebDocs.clearCache();
          return JSON.stringify({
            action: "clear",
            message: "All cache cleared",
            success: true,
          });
        }
      }

      return JSON.stringify({
        error: "Invalid action. Use: status, preload, or clear",
        success: false,
      });
    } catch (error) {
      return JSON.stringify({
        error: `Cache management failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        success: false,
      });
    }
  }
}
