class HandlerDocServiceImpl {
    async extractExamples(markdown) {
        const examples = [];
        const sections = this.parseMarkdownSections(markdown);
        for (const section of sections) {
            if (section.title.toLowerCase().includes("example") ||
                section.title.toLowerCase().includes("usage")) {
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
    async generateTemplatesFromInterface(handlerInterface) {
        const templates = [];
        for (const action of handlerInterface.actions) {
            const template = {
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
    async parseActionDefinitions(markdown) {
        const actions = [];
        const sections = this.parseMarkdownSections(markdown);
        const actionSection = sections.find((s) => s.title.toLowerCase().includes("action") ||
            s.title.toLowerCase().includes("handler") ||
            s.title.toLowerCase().includes("method"));
        if (!actionSection)
            return actions;
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
    async parseDataStructures(markdown) {
        const structures = [];
        const sections = this.parseMarkdownSections(markdown);
        const dataSection = sections.find((s) => s.title.toLowerCase().includes("data") ||
            s.title.toLowerCase().includes("structure") ||
            s.title.toLowerCase().includes("schema"));
        if (!dataSection)
            return structures;
        for (const subsection of dataSection.subsections) {
            const structure = this.parseDataStructureFromSection(subsection);
            if (structure) {
                structures.push(structure);
            }
        }
        return structures;
    }
    async parseHandlerDocumentation(markdown) {
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
    validateDocumentation(markdown) {
        const errors = [];
        const warnings = [];
        const suggestions = [];
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
                }
                else {
                    inCodeBlock = true;
                    codeBlockStart = i + 1;
                }
                continue;
            }
            // Skip validation inside code blocks
            if (inCodeBlock)
                continue;
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
        }
        else {
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
    convertToMessageExamples(examples, action) {
        return examples.map((example, index) => ({
            description: example,
            expectedTags: action.requiredTags,
            params: {},
            prompt: `Example ${index + 1} for ${action.name}`,
        }));
    }
    extractCodeBlocks(content) {
        const blocks = [];
        const lines = content.split("\n");
        let inBlock = false;
        let currentBlock = null;
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
                }
                else {
                    const language = line.trim().substring(3).trim() || "text";
                    currentBlock = {
                        content: "",
                        language,
                        line: i + 1,
                    };
                    inBlock = true;
                }
            }
            else if (inBlock && currentBlock) {
                currentBlock.content += line + "\n";
            }
        }
        return blocks;
    }
    extractDescriptionFromContent(content) {
        const lines = content.split("\n");
        const descriptionLines = lines
            .filter((line) => line.trim() &&
            !line.trim().startsWith("#") &&
            !line.trim().startsWith("-"))
            .slice(0, 3); // Take first few non-header lines
        return descriptionLines.join(" ").trim() || "No description available";
    }
    extractHandlerDescription(sections) {
        const introSection = sections.find((s) => s.title.toLowerCase().includes("description") ||
            s.title.toLowerCase().includes("overview") ||
            s.level === 1);
        return this.extractDescriptionFromContent(introSection?.content || "");
    }
    extractHandlerName(sections) {
        const titleSection = sections.find((s) => s.level === 1);
        return titleSection?.title || "Unknown Handler";
    }
    extractOptionalParams(action) {
        return action.optionalTags.map((tag) => tag.name);
    }
    extractRequiredParams(action) {
        return action.requiredTags.map((tag) => tag.name);
    }
    inferIntentTypes(action) {
        const actionName = action.name.toLowerCase();
        const intents = [];
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
        if (actionName.includes("info") ||
            actionName.includes("state") ||
            actionName.includes("query")) {
            intents.push("query_state");
        }
        // Default to custom_message if no specific intent is identified
        if (intents.length === 0) {
            intents.push("custom_message");
        }
        return intents;
    }
    parseActionFromSection(section) {
        const requiredTags = [];
        const optionalTags = [];
        const examples = [];
        // Extract action name from title
        const actionName = section.title.replace(/^#+\s*/, "").trim();
        // Parse content for tags and parameters
        const lines = section.content.split("\n");
        let currentList = null;
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
                const tag = {
                    name: tagMatch[1],
                    value: tagMatch[2].replace(/['"]/g, ""),
                };
                if (currentList === "required") {
                    requiredTags.push(tag);
                }
                else {
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
    parseActionsFromContent(content) {
        const actions = [];
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
    parseDataStructureFromSection(section) {
        const structureName = section.title.replace(/^#+\s*/, "").trim();
        const fields = [];
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
    parseExampleFromCodeBlock(block, sectionTitle) {
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
            const tags = [];
            let data;
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
        }
        catch (error) {
            // Ignore parsing errors for now
        }
        return null;
    }
    parseMarkdownSections(markdown) {
        const lines = markdown.split("\n");
        const sections = [];
        let currentSection = null;
        const sectionStack = [];
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
                const newSection = {
                    content: "",
                    level,
                    lineEnd: lines.length - 1,
                    lineStart: i,
                    subsections: [],
                    title,
                };
                // Handle nesting
                while (sectionStack.length > 0 &&
                    sectionStack[sectionStack.length - 1].level >= level) {
                    sectionStack.pop();
                }
                if (sectionStack.length > 0) {
                    sectionStack[sectionStack.length - 1].subsections.push(newSection);
                }
                else {
                    sections.push(newSection);
                }
                sectionStack.push(newSection);
                currentSection = newSection;
            }
            else if (currentSection) {
                currentSection.content += line + "\n";
            }
        }
        return sections;
    }
}
// Export singleton instance
export const handlerDocService = new HandlerDocServiceImpl();
