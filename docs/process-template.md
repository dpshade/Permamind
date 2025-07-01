# [Your Process Name]

Brief description of what your process does and its main purpose.

## [handler_name]

Description of what this handler does and when to use it

- parameter1: description of parameter with type hints (required)
- parameter2: description of parameter (optional, defaults to X)
- parameter3: another parameter description (required)

Optional: Additional details, examples, or special considerations.

## [another_handler]

Description of another handler

- param1: parameter description (required)
- param2: parameter description (optional)

## [read_handler]

Description of a read-only handler (queries data without changes)

- query: what to search for (optional)
- filter: how to filter results (optional)

---

## Template Instructions

1. **Replace [Your Process Name]** with your actual process name
2. **Replace [handler_name]** with your actual handler/action names
3. **Replace parameter descriptions** with your actual parameters
4. **Mark parameters as (required) or (optional)**
5. **Include type hints** in descriptions: "number of tokens", "wallet address", "boolean flag"
6. **Remove these instructions** when you're done

## Parameter Type Hints

Use these phrases to help the system understand parameter types:

- **Numbers**: "amount", "count", "number of", "quantity", "price"
- **Addresses**: "wallet address", "account", "recipient", "sender"
- **Booleans**: "true/false", "enable/disable", "flag", "boolean"
- **Strings**: "text", "message", "description", "name"

## Action Type Detection

The system automatically detects read vs write operations:

**Write Operations** (require signing):

- send, transfer, create, update, delete, set, add, remove
- mint, burn, stake, withdraw, deposit, register, vote, execute

**Read Operations** (no signing):

- get, fetch, read, check, balance, info, status, list
- query, view, show, find, search

## Example Usage

After creating your documentation, users can interact with your process like:

- "Send 100 tokens to alice with memo 'payment'"
- "Check balance for xyz789"
- "List all items in category 'art'"
- "Vote yes on proposal #5"

The system will automatically:

1. Parse your documentation
2. Match user requests to handlers
3. Extract parameters from natural language
4. Format and send AO messages
5. Return interpreted responses
