import type { ProcessDefinition } from "../services/ProcessCommunicationService.js";

/**
 * Default AO Token Process Template
 * Based on AO Cookbook token.lua standards
 * Provides natural language integration for standard token operations
 */
export const DEFAULT_TOKEN_PROCESS: ProcessDefinition = {
  name: "AO Token Contract",
  processId: "", // Will be populated dynamically
  handlers: [
    {
      action: "Transfer",
      description: "Transfer tokens from your account to another user",
      parameters: [
        {
          name: "recipient",
          type: "string",
          required: true,
          description: "wallet address to send tokens to (required)",
        },
        {
          name: "quantity",
          type: "number",
          required: true,
          description: "number of tokens to transfer (required)",
        },
        {
          name: "memo",
          type: "string",
          required: false,
          description: "optional message to include with transfer (optional)",
        },
      ],
      isWrite: true,
      examples: [
        "Send 100 tokens to alice with memo 'payment for services'",
        "Transfer 50 tokens to xyz789",
        "Send 25 tokens to bob",
      ],
    },
    {
      action: "Balance",
      description: "Get the current token balance for an account",
      parameters: [
        {
          name: "target",
          type: "string",
          required: false,
          description: "wallet address to check balance (optional, defaults to caller)",
        },
      ],
      isWrite: false,
      examples: [
        "Check balance for xyz789",
        "What's my current balance?",
        "Get balance",
        "Show token balance for alice",
      ],
    },
    {
      action: "Mint",
      description: "Create new tokens (admin only)",
      parameters: [
        {
          name: "recipient",
          type: "string",
          required: true,
          description: "address to receive new tokens (required)",
        },
        {
          name: "quantity",
          type: "number",
          required: true,
          description: "number of tokens to create (required)",
        },
      ],
      isWrite: true,
      examples: [
        "Mint 1000 tokens for alice",
        "Create 500 new tokens for bob",
        "Mint 100 tokens to xyz789",
      ],
    },
    {
      action: "Burn",
      description: "Destroy tokens from your account",
      parameters: [
        {
          name: "quantity",
          type: "number",
          required: true,
          description: "number of tokens to destroy (required)",
        },
      ],
      isWrite: true,
      examples: [
        "Burn 100 tokens",
        "Destroy 50 tokens from my account",
        "Remove 25 tokens",
      ],
    },
    {
      action: "TotalSupply",
      description: "Get the total supply of tokens",
      parameters: [],
      isWrite: false,
      examples: [
        "Get total supply",
        "What's the total token supply?",
        "Show total tokens",
        "Total supply",
      ],
    },
    {
      action: "Name",
      description: "Get the token name",
      parameters: [],
      isWrite: false,
      examples: [
        "What's the token name?",
        "Get token name",
        "Show name",
      ],
    },
    {
      action: "Symbol",
      description: "Get the token symbol/ticker",
      parameters: [],
      isWrite: false,
      examples: [
        "What's the token symbol?",
        "Get token ticker",
        "Show symbol",
      ],
    },
    {
      action: "Decimals",
      description: "Get the number of decimal places",
      parameters: [],
      isWrite: false,
      examples: [
        "How many decimals?",
        "Get decimal places",
        "Show decimals",
      ],
    },
    {
      action: "Owner",
      description: "Get the contract owner/admin address",
      parameters: [],
      isWrite: false,
      examples: [
        "Who is the owner?",
        "Get contract owner",
        "Show admin address",
      ],
    },
    {
      action: "Transfer-Ownership",
      description: "Transfer ownership of the contract to another address (owner only)",
      parameters: [
        {
          name: "newOwner",
          type: "string",
          required: true,
          description: "address of the new owner (required)",
        },
      ],
      isWrite: true,
      examples: [
        "Transfer ownership to alice",
        "Make bob the new owner",
        "Change owner to xyz789",
      ],
    },
    {
      action: "Approve",
      description: "Approve another address to spend tokens on your behalf",
      parameters: [
        {
          name: "spender",
          type: "string",
          required: true,
          description: "address to approve for spending (required)",
        },
        {
          name: "quantity",
          type: "number",
          required: true,
          description: "amount of tokens to approve (required)",
        },
      ],
      isWrite: true,
      examples: [
        "Approve alice to spend 100 tokens",
        "Allow bob to use 50 tokens",
        "Approve xyz789 for 25 tokens",
      ],
    },
    {
      action: "Allowance",
      description: "Check how many tokens an address is approved to spend",
      parameters: [
        {
          name: "owner",
          type: "string",
          required: true,
          description: "address of the token owner (required)",
        },
        {
          name: "spender",
          type: "string",
          required: true,
          description: "address of the approved spender (required)",
        },
      ],
      isWrite: false,
      examples: [
        "Check allowance from alice to bob",
        "How much can xyz789 spend from my account?",
        "Get spending allowance",
      ],
    },
    {
      action: "TransferFrom",
      description: "Transfer tokens from one address to another using allowance",
      parameters: [
        {
          name: "from",
          type: "string",
          required: true,
          description: "address to transfer tokens from (required)",
        },
        {
          name: "to",
          type: "string",
          required: true,
          description: "address to transfer tokens to (required)",
        },
        {
          name: "quantity",
          type: "number",
          required: true,
          description: "number of tokens to transfer (required)",
        },
      ],
      isWrite: true,
      examples: [
        "Transfer 100 tokens from alice to bob",
        "Move 50 tokens from xyz789 to charlie",
        "Transfer from alice to bob amount 25",
      ],
    },
  ],
};

/**
 * Enhanced token process detection patterns
 * Used to identify if a process is likely a token contract
 */
export const TOKEN_DETECTION_PATTERNS = {
  // Common token handler names
  handlers: [
    "transfer",
    "balance",
    "mint",
    "burn",
    "totalSupply",
    "name",
    "symbol",
    "decimals",
    "owner",
    "approve",
    "allowance",
    "transferFrom",
  ],
  
  // Keywords that suggest token functionality
  keywords: [
    "token",
    "balance",
    "transfer",
    "mint",
    "burn",
    "supply",
    "allowance",
    "approve",
    "erc20",
    "fungible",
  ],
  
  // Minimum handlers needed to be considered a token
  minHandlers: 3,
  
  // Core handlers that must be present
  coreHandlers: ["transfer", "balance"],
};

/**
 * Common token operation patterns for natural language processing
 */
export const TOKEN_NLP_PATTERNS = {
  // Transfer patterns
  transfer: [
    /send\s+(\d+(?:\.\d+)?)\s+(?:tokens?\s+)?to\s+(\w+)/i,
    /transfer\s+(\d+(?:\.\d+)?)\s+(?:tokens?\s+)?to\s+(\w+)/i,
    /give\s+(\w+)\s+(\d+(?:\.\d+)?)\s+tokens?/i,
    /pay\s+(\w+)\s+(\d+(?:\.\d+)?)\s+tokens?/i,
  ],
  
  // Balance patterns
  balance: [
    /(?:check|get|show)\s+(?:my\s+)?(?:token\s+)?balance/i,
    /balance\s+(?:for\s+)?(\w+)?/i,
    /how\s+many\s+tokens?\s+(?:do\s+)?(?:i\s+)?(?:have|own)/i,
    /what(?:'s|\s+is)\s+(?:my\s+)?(?:token\s+)?balance/i,
  ],
  
  // Mint patterns
  mint: [
    /mint\s+(\d+(?:\.\d+)?)\s+(?:tokens?\s+)?(?:for|to)\s+(\w+)/i,
    /create\s+(\d+(?:\.\d+)?)\s+(?:new\s+)?tokens?\s+(?:for|to)\s+(\w+)/i,
    /issue\s+(\d+(?:\.\d+)?)\s+tokens?\s+(?:for|to)\s+(\w+)/i,
  ],
  
  // Burn patterns
  burn: [
    /burn\s+(\d+(?:\.\d+)?)\s+tokens?/i,
    /destroy\s+(\d+(?:\.\d+)?)\s+tokens?/i,
    /remove\s+(\d+(?:\.\d+)?)\s+tokens?/i,
  ],
  
  // Info patterns
  info: [
    /(?:get|show|what(?:'s|\s+is))\s+(?:the\s+)?(?:token\s+)?(name|symbol|decimals|total\s+supply)/i,
    /who\s+(?:is\s+)?(?:the\s+)?owner/i,
    /contract\s+(?:owner|admin)/i,
  ],
};

/**
 * Get default token process with specified process ID
 */
export function getDefaultTokenProcess(processId: string): ProcessDefinition {
  return {
    ...DEFAULT_TOKEN_PROCESS,
    processId,
  };
}

/**
 * Check if a process definition matches token patterns
 */
export function isTokenProcess(handlers: string[]): boolean {
  const lowerHandlers = handlers.map(h => h.toLowerCase());
  
  // Check if it has core token handlers
  const hasCoreHandlers = TOKEN_DETECTION_PATTERNS.coreHandlers.every(
    core => lowerHandlers.includes(core)
  );
  
  if (hasCoreHandlers) return true;
  
  // Check if it has enough token-like handlers
  const tokenHandlerCount = TOKEN_DETECTION_PATTERNS.handlers.filter(
    handler => lowerHandlers.includes(handler)
  ).length;
  
  return tokenHandlerCount >= TOKEN_DETECTION_PATTERNS.minHandlers;
}

/**
 * Extract token operation from natural language using enhanced patterns
 */
export function extractTokenOperation(request: string): {
  operation: string;
  parameters: Record<string, unknown>;
  confidence: number;
} | null {
  const requestLower = request.toLowerCase();
  
  // Check transfer patterns
  for (const pattern of TOKEN_NLP_PATTERNS.transfer) {
    const match = request.match(pattern);
    if (match) {
      // Handle different capture group orders for different patterns
      let recipient: string;
      let amount: number;
      
      if (pattern === TOKEN_NLP_PATTERNS.transfer[0] || pattern === TOKEN_NLP_PATTERNS.transfer[1]) {
        // send/transfer patterns: (amount) (recipient)
        amount = parseFloat(match[1]);
        recipient = match[2];
      } else {
        // give/pay patterns: (recipient) (amount)
        recipient = match[1];
        amount = parseFloat(match[2]);
      }
      
      return {
        operation: "transfer",
        parameters: { recipient, amount },
        confidence: 0.9,
      };
    }
  }
  
  // Check balance patterns
  for (const pattern of TOKEN_NLP_PATTERNS.balance) {
    const match = request.match(pattern);
    if (match) {
      return {
        operation: "balance",
        parameters: match[1] ? { account: match[1] } : {},
        confidence: 0.85,
      };
    }
  }
  
  // Check mint patterns
  for (const pattern of TOKEN_NLP_PATTERNS.mint) {
    const match = request.match(pattern);
    if (match) {
      return {
        operation: "mint",
        parameters: {
          recipient: match[2],
          amount: parseFloat(match[1]),
        },
        confidence: 0.9,
      };
    }
  }
  
  // Check burn patterns
  for (const pattern of TOKEN_NLP_PATTERNS.burn) {
    const match = request.match(pattern);
    if (match) {
      return {
        operation: "burn",
        parameters: {
          amount: parseFloat(match[1]),
        },
        confidence: 0.9,
      };
    }
  }
  
  // Check info patterns
  for (const pattern of TOKEN_NLP_PATTERNS.info) {
    const match = request.match(pattern);
    if (match) {
      const infoType = match[1]?.toLowerCase().replace(/\s+/g, '');
      const operationMap: Record<string, string> = {
        name: "name",
        symbol: "symbol", 
        decimals: "decimals",
        totalsupply: "totalSupply",
        owner: "owner",
      };
      
      const operation = operationMap[infoType] || "info";
      return {
        operation,
        parameters: {},
        confidence: 0.8,
      };
    }
  }
  
  return null;
}
