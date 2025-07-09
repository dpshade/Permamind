import { JWKInterface } from "arweave/node/lib/wallet.js";
import { z } from "zod";

export interface ToolContext {
  hubId: string;
  keyPair: JWKInterface;
  publicKey: string;
}

export interface ToolDefinition {
  annotations?: {
    openWorldHint?: boolean;
    readOnlyHint?: boolean;
    title?: string;
  };
  description: string;
  execute: (args: any) => Promise<any>;
  name: string;
  parameters: z.ZodSchema<any>;
}

export interface ToolExecutionResult {
  data?: any;
  error?: {
    code: string;
    details?: any;
    message: string;
  };
  success: boolean;
}

export interface ToolMetadata {
  description: string;
  name: string;
  openWorldHint?: boolean;
  readOnlyHint?: boolean;
  title?: string;
}

export abstract class ToolCommand<TArgs = any, TResult = any> {
  protected abstract metadata: ToolMetadata;
  protected abstract parametersSchema: z.ZodSchema<TArgs>;

  abstract execute(args: TArgs, context: ToolContext): Promise<TResult>;

  getMetadata(): ToolMetadata {
    return this.metadata;
  }

  getParametersSchema(): z.ZodSchema<TArgs> {
    return this.parametersSchema;
  }

  toToolDefinition(context: ToolContext): ToolDefinition {
    return {
      annotations: {
        openWorldHint: this.metadata.openWorldHint ?? false,
        readOnlyHint: this.metadata.readOnlyHint ?? true,
        title: this.metadata.title ?? this.metadata.name,
      },
      description: this.metadata.description,
      execute: async (args: any) => {
        const result = await this.safeExecute(args, context);
        if (result.success) {
          return result.data;
        } else {
          throw new Error(result.error?.message || "Tool execution failed");
        }
      },
      name: this.metadata.name,
      parameters: this.parametersSchema,
    };
  }

  protected createErrorResult(
    code: string,
    message: string,
    details?: any,
  ): ToolExecutionResult {
    return {
      error: {
        code,
        details,
        message,
      },
      success: false,
    };
  }

  protected createSuccessResult(data: TResult): ToolExecutionResult {
    return {
      data,
      success: true,
    };
  }

  protected async safeExecute(
    args: TArgs,
    context: ToolContext,
  ): Promise<ToolExecutionResult> {
    try {
      const result = await this.execute(args, context);
      return this.createSuccessResult(result);
    } catch (error) {
      return this.createErrorResult(
        "EXECUTION_ERROR",
        error instanceof Error ? error.message : "Unknown error occurred",
        error,
      );
    }
  }
}
