import {
  DataField,
  DataStructure,
  HandlerAction,
  HandlerExample,
  HandlerInterface,
  IntentType,
  MessageTemplate,
} from "../models/MessageIntent.js";
import { Tag } from "../models/Tag.js";

/**
 * Service for parsing handler documentation and generating message templates
 */
export interface HandlerDocService {
  /**
   * Extract examples from documentation
   */
  extractExamples: (markdown: string) => Promise<HandlerExample[]>;

  /**
   * Generate message templates from handler interface
   */
  generateTemplatesFromInterface: (
    handlerInterface: HandlerInterface,
  ) => Promise<MessageTemplate[]>;

  /**
   * Generate action definitions from markdown sections
   */
  parseActionDefinitions: (markdown: string) => Promise<HandlerAction[]>;

  /**
   * Parse data structure definitions
   */
  parseDataStructures: (markdown: string) => Promise<DataStructure[]>;

  /**
   * Parse markdown documentation to extract handler interface
   */
  parseHandlerDocumentation: (markdown: string) => Promise<HandlerInterface>;

  /**
   * Validate handler documentation format
   */
  validateDocumentation: (markdown: string) => ValidationResult;
}

/**
 * Validation error for documentation
 */
export interface ValidationError {
  code: string;
  column: number;
  line: number;
  message: string;
  severity: "error" | "warning";
}

/**
 * Validation result for handler documentation
 */
export interface ValidationResult {
  errors: ValidationError[];
  isValid: boolean;
  suggestions: string[];
  warnings: ValidationWarning[];
}

/**
 * Validation warning for documentation
 */
export interface ValidationWarning {
  line: number;
  message: string;
  suggestion: string;
}

/**
 * Code block extracted from markdown
 */
interface CodeBlock {
  content: string;
  language: string;
  line: number;
}

/**
 * Parsed markdown section
 */
interface ParsedSection {
  content: string;
  level: number;
  lineEnd: number;
  lineStart: number;
  subsections: ParsedSection[];
  title: string;
}

class HandlerDocServiceImpl implements HandlerDocService {
  async extractExamples(markdown: string): Promise<HandlerExample[]> {
    const examples: HandlerExample[] = [];
    const sections = this.parseMarkdownSections(markdown);

    for (const section of sections) {
      if (
        section.title.toLowerCase().includes("example") ||
        section.title.toLowerCase().includes("usage")
      ) {
        const codeBlocks = this.extractCodeBlocks(section.content);

        for (const block of codeBlocks) {
          const example = this.parseExampleFromCodeBlock(block, section.title);
          if (example) {
            examples.push(example);
          }
        }
      }
    }

    return examples;
  }

  async generateTemplatesFromInterface(
    handlerInterface: HandlerInterface,
  ): Promise<MessageTemplate[]> {
    const templates: MessageTemplate[] = [];

    for (const action of handlerInterface.actions) {
      const template: MessageTemplate = {
        dataTemplate: action.dataFormat,
        description: action.description,
        examples: this.convertToMessageExamples(action.examples, action),
        id: `${handlerInterface.name.toLowerCase()}_${action.name.toLowerCase()}`,
        intentTypes: this.inferIntentTypes(action),
        name: `${handlerInterface.name} ${action.name}`,
        optionalParams: this.extractOptionalParams(action),
        requiredParams: this.extractRequiredParams(action),
        tagTemplate: action.requiredTags.concat(action.optionalTags),
      };

      templates.push(template);
    }

    return templates;
  }

  async parseActionDefinitions(markdown: string): Promise<HandlerAction[]> {
    const actions: HandlerAction[] = [];
    const sections = this.parseMarkdownSections(markdown);

    const actionSection = sections.find(
      (s) =>
        s.title.toLowerCase().includes("action") ||
        s.title.toLowerCase().includes("handler") ||
        s.title.toLowerCase().includes("method"),
    );

    if (!actionSection) return actions;

    // Parse each subsection as an action
    for (const subsection of actionSection.subsections) {
      const action = this.parseActionFromSection(subsection);
      if (action) {
        actions.push(action);
      }
    }

    // Also check for actions defined directly in the main section
    const directActions = this.parseActionsFromContent(actionSection.content);
    actions.push(...directActions);

    return actions;
  }

  async parseDataStructures(markdown: string): Promise<DataStructure[]> {
    const structures: DataStructure[] = [];
    const sections = this.parseMarkdownSections(markdown);

    const dataSection = sections.find(
      (s) =>
        s.title.toLowerCase().includes("data") ||
        s.title.toLowerCase().includes("structure") ||
        s.title.toLowerCase().includes("schema"),
    );

    if (!dataSection) return structures;

    for (const subsection of dataSection.subsections) {
      const structure = this.parseDataStructureFromSection(subsection);
      if (structure) {
        structures.push(structure);
      }
    }

    return structures;
  }

  async parseHandlerDocumentation(markdown: string): Promise<HandlerInterface> {
    const sections = this.parseMarkdownSections(markdown);
    const name = this.extractHandlerName(sections);
    const description = this.extractHandlerDescription(sections);
    const actions = await this.parseActionDefinitions(markdown);
    const dataStructures = await this.parseDataStructures(markdown);
    const examples = await this.extractExamples(markdown);

    return {
      actions,
      dataStructures,
      description,
      examples,
      name,
    };
  }

  validateDocumentation(markdown: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: string[] = [];

    // Check for required sections
    if (!markdown.includes("# Actions") && !markdown.includes("## Actions")) {
      errors.push({
        code: "MISSING_ACTIONS_SECTION",
        column: 1,
        line: 1,
        message: "Missing 'Actions' section",
        severity: "error",
      });
    }

    // Check for proper markdown structure
    const lines = markdown.split("\n");
    let inCodeBlock = false;
    let codeBlockStart = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Track code blocks
      if (line.trim().startsWith("```")) {
        if (inCodeBlock) {
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          codeBlockStart = i + 1;
        }
        continue;
      }

      // Skip validation inside code blocks
      if (inCodeBlock) continue;

      // Check for malformed headers
      if (line.match(/^#{1,6}\s*/)) {
        const headerLevel = line.match(/^(#{1,6})/)?.[1].length || 0;
        if (headerLevel > 6) {
          errors.push({
            code: "INVALID_HEADER_LEVEL",
            column: 1,
            line: i + 1,
            message: "Header level too deep (max 6)",
            severity: "error",
          });
        }
      }

      // Check for proper tag format in examples
      if (line.includes("name:") && line.includes("value:")) {
        if (!line.match(/{\s*name:\s*"[^"]+",\s*value:\s*"[^"]*"\s*}/)) {
          warnings.push({
            line: i + 1,
            message: "Tag format may be incorrect",
            suggestion: 'Use format: { name: "Action", value: "Transfer" }',
          });
        }
      }
    }

    // Check for unclosed code blocks
    if (inCodeBlock) {
      errors.push({
        code: "UNCLOSED_CODE_BLOCK",
        column: 1,
        line: codeBlockStart,
        message: "Unclosed code block",
        severity: "error",
      });
    }

    // Generate suggestions
    if (errors.length === 0 && warnings.length === 0) {
      suggestions.push("Documentation looks good!");
    } else {
      suggestions.push("Consider adding more examples for each action");
      suggestions.push("Include expected response formats for each action");
    }

    return {
      errors,
      isValid: errors.length === 0,
      suggestions,
      warnings,
    };
  }

  // Private helper methods

  private convertToMessageExamples(
    examples: string[],
    action: HandlerAction,
  ): any[] {
    return examples.map((example, index) => ({
      description: example,
      expectedTags: action.requiredTags,
      params: {},
      prompt: `Example ${index + 1} for ${action.name}`,
    }));
  }

  private extractCodeBlocks(content: string): CodeBlock[] {
    const blocks: CodeBlock[] = [];
    const lines = content.split("\n");
    let inBlock = false;
    let currentBlock: {
      content: string;
      language: string;
      line: number;
    } | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.trim().startsWith("```")) {
        if (inBlock && currentBlock) {
          blocks.push({
            content: currentBlock.content,
            language: currentBlock.language,
            line: currentBlock.line,
          });
          currentBlock = null;
          inBlock = false;
        } else {
          const language = line.trim().substring(3).trim() || "text";
          currentBlock = {
            content: "",
            language,
            line: i + 1,
          };
          inBlock = true;
        }
      } else if (inBlock && currentBlock) {
        currentBlock.content += line + "\n";
      }
    }

    return blocks;
  }

  private extractDescriptionFromContent(content: string): string {
    const lines = content.split("\n");
    const descriptionLines = lines
      .filter(
        (line) =>
          line.trim() &&
          !line.trim().startsWith("#") &&
          !line.trim().startsWith("-"),
      )
      .slice(0, 3); // Take first few non-header lines

    return descriptionLines.join(" ").trim() || "No description available";
  }

  private extractHandlerDescription(sections: ParsedSection[]): string {
    const introSection = sections.find(
      (s) =>
        s.title.toLowerCase().includes("description") ||
        s.title.toLowerCase().includes("overview") ||
        s.level === 1,
    );

    return this.extractDescriptionFromContent(introSection?.content || "");
  }

  private extractHandlerName(sections: ParsedSection[]): string {
    const titleSection = sections.find((s) => s.level === 1);
    return titleSection?.title || "Unknown Handler";
  }

  private extractOptionalParams(action: HandlerAction): string[] {
    return action.optionalTags.map((tag) => tag.name);
  }

  private extractRequiredParams(action: HandlerAction): string[] {
    return action.requiredTags.map((tag) => tag.name);
  }

  private inferIntentTypes(action: HandlerAction): IntentType[] {
    const actionName = action.name.toLowerCase();
    const intents: IntentType[] = [];

    if (actionName.includes("transfer") || actionName.includes("send")) {
      intents.push("transfer");
    }
    if (actionName.includes("balance") || actionName.includes("get")) {
      intents.push("balance");
    }
    if (actionName.includes("create") || actionName.includes("deploy")) {
      intents.push("create_process");
    }
    if (actionName.includes("vote") || actionName.includes("proposal")) {
      intents.push("custom_message");
    }
    if (actionName.includes("eval") || actionName.includes("execute")) {
      intents.push("eval_code");
    }
    if (
      actionName.includes("info") ||
      actionName.includes("state") ||
      actionName.includes("query")
    ) {
      intents.push("query_state");
    }

    // Default to custom_message if no specific intent is identified
    if (intents.length === 0) {
      intents.push("custom_message");
    }

    return intents;
  }

  private parseActionFromSection(section: ParsedSection): HandlerAction | null {
    const requiredTags: Tag[] = [];
    const optionalTags: Tag[] = [];
    const examples: string[] = [];

    // Extract action name from title
    const actionName = section.title.replace(/^#+\s*/, "").trim();

    // Parse content for tags and parameters
    const lines = section.content.split("\n");
    let currentList: "optional" | "required" | null = null;

    for (const line of lines) {
      const trimmed = line.trim();

      // Detect required/optional sections
      if (trimmed.toLowerCase().includes("required")) {
        currentList = "required";
        continue;
      }
      if (trimmed.toLowerCase().includes("optional")) {
        currentList = "optional";
        continue;
      }

      // Parse tag definitions
      const tagMatch = trimmed.match(/[-*]\s*(\w+):\s*(.+)/);
      if (tagMatch && currentList) {
        const tag: Tag = {
          name: tagMatch[1],
          value: tagMatch[2].replace(/['"]/g, ""),
        };

        if (currentList === "required") {
          requiredTags.push(tag);
        } else {
          optionalTags.push(tag);
        }
      }

      // Collect examples
      if (trimmed.startsWith("Example:") || trimmed.includes("example")) {
        examples.push(trimmed);
      }
    }

    return {
      description: this.extractDescriptionFromContent(section.content),
      examples,
      name: actionName,
      optionalTags,
      requiredTags,
    };
  }

  private parseActionsFromContent(content: string): HandlerAction[] {
    const actions: HandlerAction[] = [];

    // Look for action definitions in various formats
    const actionPattern = /Action:\s*(\w+)/gi;
    let match;

    while ((match = actionPattern.exec(content)) !== null) {
      const actionName = match[1];

      actions.push({
        description: `${actionName} action`,
        examples: [],
        name: actionName,
        optionalTags: [],
        requiredTags: [{ name: "Action", value: actionName }],
      });
    }

    return actions;
  }

  private parseDataStructureFromSection(
    section: ParsedSection,
  ): DataStructure | null {
    const structureName = section.title.replace(/^#+\s*/, "").trim();
    const fields: DataField[] = [];

    const lines = section.content.split("\n");
    for (const line of lines) {
      const fieldMatch = line.match(/[-*]\s*(\w+)\s*\((\w+)\)\s*-?\s*(.*)/);
      if (fieldMatch) {
        fields.push({
          description: fieldMatch[3] || "",
          name: fieldMatch[1],
          required: !line.includes("optional"),
          type: fieldMatch[2],
        });
      }
    }

    if (fields.length > 0) {
      return {
        description: this.extractDescriptionFromContent(section.content),
        examples: [],
        fields,
        name: structureName,
      };
    }

    return null;
  }

  private parseExampleFromCodeBlock(
    block: CodeBlock,
    sectionTitle: string,
  ): HandlerExample | null {
    try {
      // Try to parse as JSON for structured examples
      if (block.language === "json" || block.content.trim().startsWith("{")) {
        const parsed = JSON.parse(block.content);

        return {
          description: `Example from ${sectionTitle}`,
          input: {
            data: parsed.input?.data,
            tags: parsed.input?.tags || [],
          },
          output: {
            data: parsed.output?.data,
            description: parsed.output?.description || "Example output",
            tags: parsed.output?.tags,
          },
          title: sectionTitle,
        };
      }

      // Parse text-based examples
      const lines = block.content.split("\n");
      const tags: Tag[] = [];
      let data: string | undefined;

      for (const line of lines) {
        const tagMatch = line.match(/(\w+):\s*(.+)/);
        if (tagMatch) {
          tags.push({
            name: tagMatch[1],
            value: tagMatch[2].trim().replace(/['"]/g, ""),
          });
        }

        if (line.toLowerCase().includes("data:")) {
          data = line.split(":")[1]?.trim();
        }
      }

      if (tags.length > 0) {
        return {
          description: `Example from ${sectionTitle}`,
          input: { data, tags },
          output: {
            description: "Expected response",
          },
          title: sectionTitle,
        };
      }
    } catch (error) {
      // Ignore parsing errors for now
    }

    return null;
  }

  private parseMarkdownSections(markdown: string): ParsedSection[] {
    const lines = markdown.split("\n");
    const sections: ParsedSection[] = [];
    let currentSection: null | ParsedSection = null;
    const sectionStack: ParsedSection[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);

      if (headerMatch) {
        const level = headerMatch[1].length;
        const title = headerMatch[2].trim();

        // End previous section
        if (currentSection) {
          currentSection.lineEnd = i - 1;
        }

        // Create new section
        const newSection: ParsedSection = {
          content: "",
          level,
          lineEnd: lines.length - 1,
          lineStart: i,
          subsections: [],
          title,
        };

        // Handle nesting
        while (
          sectionStack.length > 0 &&
          sectionStack[sectionStack.length - 1].level >= level
        ) {
          sectionStack.pop();
        }

        if (sectionStack.length > 0) {
          sectionStack[sectionStack.length - 1].subsections.push(newSection);
        } else {
          sections.push(newSection);
        }

        sectionStack.push(newSection);
        currentSection = newSection;
      } else if (currentSection) {
        currentSection.content += line + "\n";
      }
    }

    return sections;
  }
}

// Export singleton instance
export const handlerDocService: HandlerDocService = new HandlerDocServiceImpl();
