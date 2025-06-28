# Prime - Load All Documentation Context

Load the following documentation into context for development:

## Fetch and load these resources:

### AO Ecosystem
1. **AO Cookbook** - https://github.com/permaweb/ao-cookbook
   - Read the entire README and main documentation
   - Load Getting Started, Core Concepts, Guides, and References sections
   - Include all code snippets and examples

2. **AOS Documentation** - https://github.com/permaweb/aos  
   - Load complete README and documentation
   - Include installation instructions, CLI commands, and usage patterns
   - Load process creation and management documentation

3. **Velocity Protocol** - https://github.com/SpaceTurtle-Dao/velocity-protocol
   - Load complete README and protocol overview
   - Load all VIPs (Velocity Improvement Proposals):
     - VIP-01: Basic protocol flow, message validation, hub communication
     - VIP-02: Follow lists and social graph management  
     - VIP-03: Text messages, replies, and threading
     - VIP-04: Reactions and social interactions
     - VIP-05: Media attachments and content handling
     - VIP-06: Process requirements and implementation
     - VIP-07: Security guidelines and best practices
   - Include hub implementation patterns and ANS-104 message signing
   - Load Zones Registry integration documentation

4. **Permamind** - https://github.com/ALLiDoizCode/Permamind
   - Load complete repository documentation and README
   - Include implementation patterns and architecture overview
   - Load integration examples and usage patterns

### MCP (Model Context Protocol) Framework
5. **FastMCP** - https://github.com/punkpeye/fastmcp
   - Load complete TypeScript MCP server framework documentation
   - Include tool, resource, and prompt definitions
   - Load SSE support, authentication, sessions, and logging patterns
   - Include examples for image/audio content, error handling, and progress notifications
   - Load Standard Schema support (Zod, ArkType, Valibot) examples

6. **MCP-Use TypeScript** - https://github.com/mcp-use/mcp-use-ts
   - Load LangChain.js MCP client library documentation
   - Include multi-server support and dynamic server selection patterns
   - Load HTTP/SSE connection examples and tool restrictions
   - Include custom agent building patterns

7. **Model Context Protocol** - https://github.com/modelcontextprotocol
   - Load main MCP protocol documentation and specification
   - Include TypeScript, Python, Java, Kotlin, and C# SDK references
   - Load server creation and client integration patterns

### Claude Development & Agent Building
8. **Claude Code Overview** - https://docs.anthropic.com/en/docs/claude-code/overview
   - Load complete Claude Code documentation
   - Include features, capabilities, and usage instructions

9. **Claude Code Best Practices** - https://www.anthropic.com/engineering/claude-code-best-practices
   - Load all best practices and workflow recommendations
   - Include MCP integration patterns and slash command creation guides
   - Load thinking budget keywords and structured workflow patterns

10. **Building Effective Agents** - https://www.anthropic.com/engineering/building-effective-agents
    - Load complete agent building methodology from Anthropic
    - Include workflow vs agent distinctions and patterns
    - Load tool development best practices and prompt engineering guides
    - Include evaluation methods and multi-agent coordination patterns

### UI Framework & Components
11. **Svelte** - https://github.com/sveltejs/svelte
    - Load complete Svelte framework documentation and README
    - Include core concepts, syntax, and reactive patterns
    - Load component architecture and lifecycle documentation
    - Include build tools, SvelteKit integration patterns
    - Load performance optimization and best practices

12. **shadcn-svelte** - https://github.com/huntabyte/shadcn-svelte
    - Load complete Svelte component library documentation
    - Include installation and setup instructions
    - Load component examples and usage patterns
    - Include customization and theming documentation
    - Load CLI commands and component generation patterns

13. **Tailwind CSS** - https://github.com/tailwindlabs/tailwindcss
    - Load complete Tailwind CSS framework documentation
    - Include utility-first CSS concepts and configuration
    - Load responsive design patterns and customization
    - Include component styling and design system patterns
    - Load build optimization and production setup

## After loading all documentation:

Confirm context is loaded and ready by saying:
```
✅ PRIME CONTEXT LOADED

Documentation now available:

🔧 AO Ecosystem:
- AO Cookbook (development patterns & code snippets)  
- AOS (operating system & CLI commands)
- Velocity Protocol (decentralized social/operational network for AO)
  - All VIPs 01-07 (protocol specs, social features, security)

🌐 MCP Framework:
- FastMCP (TypeScript MCP server framework)
- MCP-Use (LangChain.js MCP client library)  
- Model Context Protocol (official specs & SDKs)

🤖 Agent Development:
- Claude Code (features & capabilities)
- Claude Code Best Practices (workflows & optimization)
- Building Effective Agents (Anthropic's methodology)

🎨 UI Framework:
- Svelte (reactive framework & core concepts)
- shadcn-svelte (Svelte component library & CLI)
- Tailwind CSS (utility-first CSS framework)

Ready for comprehensive development with AO, MCP, agent building, and UI context.
```

$ARGUMENTS