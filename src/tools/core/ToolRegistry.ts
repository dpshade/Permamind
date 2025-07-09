import { ToolCommand, ToolContext, ToolDefinition } from "./ToolCommand.js";

export interface ToolCategory {
  description: string;
  name: string;
  tools: ToolCommand[];
}

export class ToolRegistry {
  private categories: Map<string, ToolCategory> = new Map();
  private tools: Map<string, ToolCommand> = new Map();

  clear(): void {
    this.tools.clear();
    this.categories.clear();
  }

  getAllTools(): ToolCommand[] {
    return Array.from(this.tools.values());
  }

  getCategories(): ToolCategory[] {
    return Array.from(this.categories.values());
  }

  getCategoryCount(): number {
    return this.categories.size;
  }

  getCategoryNames(): string[] {
    return Array.from(this.categories.keys());
  }

  getStats(): {
    toolsByCategory: Record<string, number>;
    totalCategories: number;
    totalTools: number;
  } {
    const toolsByCategory: Record<string, number> = {};

    for (const [categoryName, category] of this.categories) {
      toolsByCategory[categoryName] = category.tools.length;
    }

    return {
      toolsByCategory,
      totalCategories: this.categories.size,
      totalTools: this.tools.size,
    };
  }

  getTool(name: string): ToolCommand | undefined {
    return this.tools.get(name);
  }

  getToolCount(): number {
    return this.tools.size;
  }

  getToolDefinitions(context: ToolContext): ToolDefinition[] {
    return this.getAllTools().map((tool) => tool.toToolDefinition(context));
  }

  getToolsByCategory(categoryName: string): ToolCommand[] {
    const category = this.categories.get(categoryName);
    return category ? category.tools : [];
  }

  hasCategory(categoryName: string): boolean {
    return this.categories.has(categoryName);
  }

  hasTool(toolName: string): boolean {
    return this.tools.has(toolName);
  }

  register(tool: ToolCommand, categoryName?: string): void {
    const metadata = tool.getMetadata();

    if (this.tools.has(metadata.name)) {
      throw new Error(`Tool '${metadata.name}' is already registered`);
    }

    this.tools.set(metadata.name, tool);

    if (categoryName) {
      this.addToCategory(categoryName, tool);
    }
  }

  registerCategory(
    name: string,
    description: string,
    tools: ToolCommand[],
  ): void {
    if (this.categories.has(name)) {
      throw new Error(`Category '${name}' is already registered`);
    }

    const category: ToolCategory = {
      description,
      name,
      tools: [],
    };

    this.categories.set(name, category);

    // Register all tools in the category
    for (const tool of tools) {
      this.register(tool, name);
    }
  }

  unregister(toolName: string): boolean {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return false;
    }

    this.tools.delete(toolName);

    // Remove from categories
    for (const category of this.categories.values()) {
      const index = category.tools.indexOf(tool);
      if (index > -1) {
        category.tools.splice(index, 1);
      }
    }

    return true;
  }

  private addToCategory(categoryName: string, tool: ToolCommand): void {
    let category = this.categories.get(categoryName);

    if (!category) {
      category = {
        description: `${categoryName} tools`,
        name: categoryName,
        tools: [],
      };
      this.categories.set(categoryName, category);
    }

    category.tools.push(tool);
  }
}

// Global registry instance
export const toolRegistry = new ToolRegistry();
