import { z } from "zod";

export class ToolValidationError extends Error {
  constructor(
    public field: string,
    public value: any,
    public expectedType: string,
    message?: string
  ) {
    super(message || `Invalid ${field}: expected ${expectedType}, got ${typeof value}`);
    this.name = "ToolValidationError";
  }
}

export class ToolValidator {
  static validateRequired<T>(value: T | undefined | null, fieldName: string): T {
    if (value === undefined || value === null) {
      throw new ToolValidationError(fieldName, value, "required value");
    }
    return value;
  }

  static validateString(value: any, fieldName: string, options?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  }): string {
    if (typeof value !== "string") {
      throw new ToolValidationError(fieldName, value, "string");
    }

    if (options?.minLength && value.length < options.minLength) {
      throw new ToolValidationError(
        fieldName,
        value,
        `string with min length ${options.minLength}`,
        `${fieldName} must be at least ${options.minLength} characters`
      );
    }

    if (options?.maxLength && value.length > options.maxLength) {
      throw new ToolValidationError(
        fieldName,
        value,
        `string with max length ${options.maxLength}`,
        `${fieldName} must be at most ${options.maxLength} characters`
      );
    }

    if (options?.pattern && !options.pattern.test(value)) {
      throw new ToolValidationError(
        fieldName,
        value,
        `string matching pattern ${options.pattern}`,
        `${fieldName} must match the required pattern`
      );
    }

    return value;
  }

  static validateNumber(value: any, fieldName: string, options?: {
    min?: number;
    max?: number;
    integer?: boolean;
  }): number {
    if (typeof value !== "number" || isNaN(value)) {
      throw new ToolValidationError(fieldName, value, "number");
    }

    if (options?.integer && !Number.isInteger(value)) {
      throw new ToolValidationError(fieldName, value, "integer");
    }

    if (options?.min !== undefined && value < options.min) {
      throw new ToolValidationError(
        fieldName,
        value,
        `number >= ${options.min}`,
        `${fieldName} must be at least ${options.min}`
      );
    }

    if (options?.max !== undefined && value > options.max) {
      throw new ToolValidationError(
        fieldName,
        value,
        `number <= ${options.max}`,
        `${fieldName} must be at most ${options.max}`
      );
    }

    return value;
  }

  static validateBoolean(value: any, fieldName: string): boolean {
    if (typeof value !== "boolean") {
      throw new ToolValidationError(fieldName, value, "boolean");
    }
    return value;
  }

  static validateEnum<T extends string>(
    value: any,
    fieldName: string,
    allowedValues: readonly T[]
  ): T {
    if (!allowedValues.includes(value as T)) {
      throw new ToolValidationError(
        fieldName,
        value,
        `one of: ${allowedValues.join(", ")}`,
        `${fieldName} must be one of: ${allowedValues.join(", ")}`
      );
    }
    return value as T;
  }

  static validateArray<T>(
    value: any,
    fieldName: string,
    itemValidator?: (item: any, index: number) => T
  ): T[] {
    if (!Array.isArray(value)) {
      throw new ToolValidationError(fieldName, value, "array");
    }

    if (itemValidator) {
      return value.map((item, index) => {
        try {
          return itemValidator(item, index);
        } catch (error) {
          if (error instanceof ToolValidationError) {
            throw new ToolValidationError(
              `${fieldName}[${index}].${error.field}`,
              error.value,
              error.expectedType,
              error.message
            );
          }
          throw error;
        }
      });
    }

    return value;
  }

  static validateObject<T>(
    value: any,
    fieldName: string,
    schema: z.ZodSchema<T>
  ): T {
    if (typeof value !== "object" || value === null) {
      throw new ToolValidationError(fieldName, value, "object");
    }

    try {
      return schema.parse(value);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        throw new ToolValidationError(
          `${fieldName}.${firstError.path.join(".")}`,
          "received" in firstError ? firstError.received : undefined,
          "expected" in firstError ? String(firstError.expected) : "valid value",
          firstError.message
        );
      }
      throw error;
    }
  }

  static validateOptional<T>(
    value: any,
    fieldName: string,
    validator: (value: any, fieldName: string) => T
  ): T | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }
    return validator(value, fieldName);
  }
}

// Common validation schemas
export const CommonSchemas = {
  processId: z.string().regex(/^[a-zA-Z0-9_-]{43}$/, "Invalid process ID format"),
  
  address: z.string().regex(/^[a-zA-Z0-9_-]{43}$/, "Invalid Arweave address format"),
  
  memoryType: z.enum([
    "conversation",
    "context", 
    "knowledge",
    "procedure",
    "reasoning",
    "enhancement",
    "performance",
    "workflow"
  ]),
  
  importance: z.number().min(0).max(1),
  
  tagArray: z.array(z.object({
    name: z.string(),
    value: z.string()
  })),
  
  positiveInteger: z.number().int().positive(),
  
  nonNegativeInteger: z.number().int().min(0),
  
  quantity: z.string().regex(/^\d+$/, "Quantity must be a numeric string"),
  
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  
  limit: z.number().int().min(1).max(1000).optional().default(100),
  
  offset: z.number().int().min(0).optional().default(0),
