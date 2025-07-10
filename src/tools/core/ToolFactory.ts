import { ToolCommand, ToolContext } from "./ToolCommand.js";
import { ToolRegistry } from "./ToolRegistry.js";

export interface ToolFactoryConfig {
  categoryDescription: string;
  categoryName: string;
  context: ToolContext;
}

export abstract class ToolFactory {
  protected config: ToolFactoryConfig;
  protected tools: ToolCommand[] = [];

  constructor(config: ToolFactoryConfig) {
    this.config = config;
  }

  abstract createTools(): ToolCommand[];

  getCategoryDescription(): string {
    return this.config.categoryDescription;
  }

  getCategoryName(): string {
    return this.config.categoryName;
  }

  getContext(): ToolContext {
    return this.config.context;
  }

  getToolByName(name: string): ToolCommand | undefined {
    return this.getTools().find((tool) => tool.getMetadata().name === name);
  }

  getToolCount(): number {
    return this.getTools().length;
  }

  getTools(): ToolCommand[] {
    if (this.tools.length === 0) {
      this.tools = this.createTools();
    }
    return this.tools;
  }

  registerTools(registry: ToolRegistry): void {
    if (this.tools.length === 0) {
      this.tools = this.createTools();
    }

    registry.registerCategory(
      this.config.categoryName,
      this.config.categoryDescription,
      this.tools,
    );
  }
}

export abstract class BaseToolFactory extends ToolFactory {
  createTools(): ToolCommand[] {
    const ToolClasses = this.getToolClasses();
    return ToolClasses.map((ToolClass) => new ToolClass(this.config.context));
  }

  protected abstract getToolClasses(): Array<
    new (context: ToolContext) => ToolCommand
  >;
}
