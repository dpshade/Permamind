# Basic Memory Operations Tutorial

Learn how to store, retrieve, and manage AI memories using Permamind's core memory operations.

## Prerequisites

- Permamind server running and configured
- MCP client (Claude Desktop, VS Code, etc.) connected
- Basic understanding of AI memory concepts

## Tutorial Overview

This tutorial covers:

1. Storing your first memory
2. Retrieving stored memories
3. Searching memories by content
4. Understanding memory metadata
5. Best practices for basic memory management

## Step 1: Store Your First Memory

Let's start by storing a simple conversation memory.

### Using `addMemory`

**Prompt**: "Use the addMemory tool to store a memory that I prefer TypeScript over JavaScript for all new projects"

**Expected Tool Call**:

```json
{
  "content": "User prefers TypeScript over JavaScript for all new projects",
  "role": "system",
  "p": "your_wallet_address"
}
```

**What This Does**:

- Stores the preference as a basic memory
- Automatically timestamps the memory
- Associates it with your wallet address
- Makes it retrievable in future sessions

### Understanding the Response

You should see a response like:

```json
{
  "success": true,
  "message": "Memory added successfully",
  "memoryId": "mem_abc123"
}
```

The `memoryId` is a unique identifier you can use to reference this specific memory.

## Step 2: Store Multiple Memories

Let's add a few more memories to work with:

**Prompt**: "Add these memories using the addMemory tool:

1. I work primarily with Node.js and Express for backend development
2. I prefer VS Code as my primary editor
3. I'm currently learning about AI memory systems"

Each memory should be stored separately for better organization.

## Step 3: Retrieve All Your Memories

Now let's see all the memories we've stored.

**Prompt**: "Use the getAllMemories tool to show me all my stored memories"

**What You'll See**:

- All memories you've created
- Timestamps showing when each was created
- Memory IDs for future reference
- Content exactly as stored

## Step 4: Search for Specific Memories

Let's try searching for memories by content.

### Basic Search

**Prompt**: "Use the searchMemories tool to find memories about TypeScript"

**Expected Results**:

- Should return the TypeScript preference memory
- May include other TypeScript-related memories if you have them
- Results ranked by relevance

### Search with Different Keywords

Try these searches to see how search works:

**Prompt**: "Search for memories containing 'development'"

**Prompt**: "Search for memories about 'editor' or 'IDE'"

## Step 5: Understanding Memory Structure

When you retrieve memories, you'll see they have this basic structure:

```json
{
  "id": "mem_abc123",
  "content": "User prefers TypeScript over JavaScript for all new projects",
  "role": "system",
  "timestamp": "2024-01-15T10:30:00Z",
  "p": "your_wallet_address"
}
```

**Field Explanations**:

- `id`: Unique identifier for the memory
- `content`: The actual memory content
- `role`: Who created the memory ("user", "assistant", "system")
- `timestamp`: When the memory was created (ISO 8601 format)
- `p`: Public key of the memory owner

## Step 6: Organize Memories by Conversation

You can group memories by conversation for better organization.

**Prompt**: "Use addMemory to store 'Working on authentication feature for e-commerce project' with conversationId 'ecommerce_auth_2024'"

**Tool Parameters**:

```json
{
  "content": "Working on authentication feature for e-commerce project",
  "role": "user",
  "p": "your_wallet_address",
  "conversationId": "ecommerce_auth_2024"
}
```

### Retrieve Conversation-Specific Memories

**Prompt**: "Use getAllMemoriesForConversation to get all memories for conversation 'ecommerce_auth_2024'"

This shows how you can organize memories by project, session, or topic.

## Step 7: Search Within Conversations

You can limit searches to specific conversations:

**Prompt**: "Search for memories about 'authentication' within conversation 'ecommerce_auth_2024'"

**Tool Parameters**:

```json
{
  "query": "authentication",
  "conversationId": "ecommerce_auth_2024"
}
```

## Common Patterns and Best Practices

### 1. Descriptive Content

✅ **Good**: "User prefers TypeScript over JavaScript for new projects due to better type safety and IDE support"

❌ **Avoid**: "Likes TS"

### 2. Consistent Role Assignment

- Use `"user"` for user messages and preferences
- Use `"assistant"` for AI responses and insights
- Use `"system"` for important facts and configurations

### 3. Conversation Organization

Group related memories:

- Project-based: `"project_auth_feature"`
- Session-based: `"learning_session_2024_01_15"`
- Topic-based: `"typescript_preferences"`

### 4. Memory Granularity

Store focused, atomic information:

✅ **Good**: Separate memories for:

- "Prefers TypeScript for type safety"
- "Uses VS Code as primary editor"
- "Works with Node.js and Express"

❌ **Avoid**: "Prefers TypeScript and uses VS Code and works with Node.js and..."

## Practical Exercise

Try this complete workflow:

### Exercise: Personal Development Preferences

1. **Store your tech stack preferences**:

   ```
   Add memories for:
   - Your preferred programming language
   - Your preferred framework/library
   - Your preferred development tools
   - Your current learning goals
   ```

2. **Organize with conversation ID**:

   ```
   Use conversationId: "dev_preferences_2024"
   ```

3. **Search and verify**:

   ```
   - Search for "preferred" across all memories
   - Get all memories for "dev_preferences_2024"
   - Search for specific technologies
   ```

4. **Add project context**:
   ```
   Add memories about a current project:
   - Project name and description
   - Technologies being used
   - Current challenges
   - Goals and milestones
   ```

## Common Issues and Solutions

### Issue: "Memory not found in search"

**Solution**:

- Check spelling in your search query
- Try broader keywords
- Verify the memory was actually stored (check with getAllMemories)

### Issue: "Too many irrelevant results"

**Solution**:

- Use more specific keywords
- Organize memories with conversation IDs
- Consider using enhanced memory operations for better filtering

### Issue: "Can't remember conversation ID"

**Solution**:

- Use getAllMemories to see all memories and their conversation IDs
- Use consistent naming patterns like "project_feature_date"

## Next Steps

Now that you understand basic memory operations, you're ready for:

1. **Enhanced Memory Operations**: Learn about importance scoring, memory types, and rich metadata
2. **Advanced Search**: Use filters, ranking, and faceted search
3. **Knowledge Graphs**: Connect related memories with relationships
4. **Memory Analytics**: Understand your memory usage patterns

### Recommended Next Tutorial

Try the [Advanced Search Patterns](./advanced-search.md) tutorial to learn sophisticated memory retrieval techniques.

## Summary

You've learned to:

- ✅ Store basic memories with `addMemory`
- ✅ Retrieve all memories with `getAllMemories`
- ✅ Search memories by content with `searchMemories`
- ✅ Organize memories with conversation IDs
- ✅ Follow best practices for memory content and organization

These basic operations form the foundation for all advanced Permamind features. As you continue using the system, your memories will accumulate into a valuable knowledge base that persists across all your AI interactions.
