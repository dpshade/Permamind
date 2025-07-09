import { z } from "zod";
import { JWKInterface } from "arweave/node/lib/wallet.js";

export interface ToolMetadata {
  name: string;
  description: string;
  openWorldHint?: boolean;
  readOnlyHint?: boolean;
  title?: string;
}

export interface ToolDefinition {
  annotations?: {
    openWorldHint?: boolean;
    readOnlyHint?: boolean;
    title?: string;
  };
  name: string;
  description: string;
  parameters: z.ZodSchema<any>;
  execute: (args: any) => Promise<any>;
}

export interface ToolContext {
  keyPair: JWKInterface;
  publicKey: string;
  hubId: string;
}

export interface ToolExecutionResult {
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export abstract class ToolCommand<TArgs = any, TResult = any> {
  protected abstract metadata: ToolMetadata;
  protected abstract parametersSchema: z.ZodSchema<TArgs>;

  getMetadata(): ToolMetadata {
    return this.metadata;
  }

  getParametersSchema(): z.ZodSchema<TArgs> {
    return this.parametersSchema;
  }

  abstract execute(args: TArgs, context: ToolContext): Promise<TResult>;

  protected createSuccessResult(data: TResult): ToolExecutionResult {
    return {
      success: true,
      data,
    };
  }

  protected createErrorResult(
    code: string,
    message: string,
    details?: any
  ): ToolExecutionResult {
    return {
      success: false,
      error: {
        code,
        message,
        details,
      },
    };
  }

  protected async safeExecute(
    args: TArgs,
    context: ToolContext
  ): Promise<ToolExecutionResult> {
    try {
      const result = await this.execute(args, context);
      return this.createSuccessResult(result);
    } catch (error) {
      return this.createErrorResult(
        "EXECUTION_ERROR",
        error instanceof Error ? error.message : "Unknown error occurred",
        error
      );
    }
  }

  toToolDefinition(context: ToolContext): ToolDefinition {
    return {
      annotations: {
        openWorldHint: this.metadata.openWorldHint ?? false,
        readOnlyHint: this.metadata.readOnlyHint ?? true,
        title: this.metadata.title ?? this.metadata.name,
      },
      name: this.metadata.name,
      description: this.metadata.description,
      parameters: this.parametersSchema,
      execute: async (args: any) => {
        const result = await this.safeExecute(args, context);
        if (result.success) {
          return result.data;
        } else {
          throw new Error(result.error?.message || "Tool execution failed");
        }
      },
    };
  }
