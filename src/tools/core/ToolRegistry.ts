import { ToolCommand, ToolDefinition, ToolContext } from "./ToolCommand.js";

export interface ToolCategory {
  name: string;
  description: string;
  tools: ToolCommand[];
}

export class ToolRegistry {
  private tools: Map<string, ToolCommand> = new Map();
  private categories: Map<string, ToolCategory> = new Map();

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

  registerCategory(name: string, description: string, tools: ToolCommand[]): void {
    if (this.categories.has(name)) {
      throw new Error(`Category '${name}' is already registered`);
    }

    const category: ToolCategory = {
      name,
      description,
      tools: [],
    };

    this.categories.set(name, category);

    // Register all tools in the category
    for (const tool of tools) {
      this.register(tool, name);
    }
  }

  private addToCategory(categoryName: string, tool: ToolCommand): void {
    let category = this.categories.get(categoryName);
    
    if (!category) {
      category = {
        name: categoryName,
        description: `${categoryName} tools`,
        tools: [],
      };
      this.categories.set(categoryName, category);
    }

    category.tools.push(tool);
  }

  getTool(name: string): ToolCommand | undefined {
    return this.tools.get(name);
  }

  getAllTools(): ToolCommand[] {
    return Array.from(this.tools.values());
  }

  getToolsByCategory(categoryName: string): ToolCommand[] {
    const category = this.categories.get(categoryName);
    return category ? category.tools : [];
  }

  getCategories(): ToolCategory[] {
    return Array.from(this.categories.values());
  }

  getCategoryNames(): string[] {
    return Array.from(this.categories.keys());
  }

  getToolDefinitions(context: ToolContext): ToolDefinition[] {
    return this.getAllTools().map((tool) => tool.toToolDefinition(context));
  }

  getToolCount(): number {
    return this.tools.size;
  }

  getCategoryCount(): number {
    return this.categories.size;
  }

  hasCategory(categoryName: string): boolean {
    return this.categories.has(categoryName);
  }

  hasTool(toolName: string): boolean {
    return this.tools.has(toolName);
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

  clear(): void {
    this.tools.clear();
    this.categories.clear();
  }

  getStats(): {
    totalTools: number;
    totalCategories: number;
    toolsByCategory: Record<string, number>;
  } {
    const toolsByCategory: Record<string, number> = {};
    
    for (const [categoryName, category] of this.categories) {
      toolsByCategory[categoryName] = category.tools.length;
    }

    return {
      totalTools: this.tools.size,
      totalCategories: this.categories.size,
      toolsByCategory,
    };
  }
}

// Global registry instance
