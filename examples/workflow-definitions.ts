/**
 * Example Workflow Definitions for Common AO Processes
 *
 * These examples demonstrate how to define workflow definitions for popular
 * AO processes, enabling dynamic interaction through the aoMessage tool.
 */

import { WorkflowDefinition } from "../src/types/WorkflowDefinition.js";

// Velocity Protocol Hub - Social messaging and event handling
export const velocityHubWorkflow: WorkflowDefinition = {
  capabilities: ["social-messaging", "event-streaming", "follow-management"],
  category: "social",
  description: "Decentralized social messaging hub using Velocity Protocol",
  documentation: {
    docs: "https://github.com/SpaceTurtle-Dao/velocity-protocol",
    github: "https://github.com/SpaceTurtle-Dao/velocity-protocol",
  },
  handlers: [
    {
      capabilities: ["social-posting"],
      description: "Post a social event/message to the hub",
      messageSchema: {
        action: "Event",
        description: "Create a new social event",
        examples: [
          {
            description: "Simple text message",
            expectedResponse: "Message posted successfully",
            tags: [
              { name: "Action", value: "Event" },
              { name: "Kind", value: "1" },
              { name: "Content", value: "Hello from AO!" },
            ],
          },
        ],
        tags: [
          { name: "Action", required: true, value: "Event" },
          {
            description: "Event type (1 for text)",
            name: "Kind",
            required: true,
            value: "1",
          },
          {
            description: "Message content",
            examples: ["Hello world!", "GM frens!"],
            name: "Content",
            required: true,
            value: "",
          },
        ],
      },
      name: "Event",
      rateLimit: { requestsPerMinute: 60 },
      responsePatterns: [
        {
          format: { dataType: "string", structured: false },
          indicators: { tags: [{ name: "Status", values: ["Success"] }] },
          messageType: "success",
        },
      ],
    },
    {
      capabilities: ["data-retrieval", "event-filtering"],
      description: "Retrieve events from the hub with filtering",
      messageSchema: {
        action: "FetchEvents",
        description: "Fetch filtered events from the hub",
        examples: [
          {
            description: "Get latest 10 text messages",
            expectedResponse: "Array of event objects",
            tags: [
              { name: "Action", value: "FetchEvents" },
              { name: "Filters", value: '[{"kinds":["1"],"limit":10}]' },
            ],
          },
        ],
        tags: [
          { name: "Action", required: true, value: "FetchEvents" },
          {
            description: "JSON filter string",
            examples: ['[{"kinds":["1"],"limit":10}]'],
            name: "Filters",
            required: true,
            value: "",
          },
        ],
      },
      name: "FetchEvents",
      rateLimit: { requestsPerMinute: 120 },
      responsePatterns: [
        {
          format: { dataType: "json", structured: true },
          indicators: {},
          messageType: "data",
        },
      ],
    },
    {
      capabilities: ["social-networking"],
      description: "Follow another user on the social network",
      messageSchema: {
        action: "Follow",
        description: "Add a user to your follow list",
        examples: [
          {
            description: "Follow a user",
            expectedResponse: "Follow relationship created",
            tags: [
              { name: "Action", value: "Follow" },
              {
                name: "Target",
                value: "1234567890abcdef1234567890abcdef12345678",
              },
            ],
          },
        ],
        tags: [
          { name: "Action", required: true, value: "Follow" },
          {
            description: "Address to follow",
            examples: ["1234...abcd", "user_address_here"],
            name: "Target",
            required: true,
            value: "",
          },
        ],
      },
      name: "Follow",
      rateLimit: { requestsPerMinute: 30 },
      responsePatterns: [
        {
          format: { dataType: "string", structured: false },
          indicators: {},
          messageType: "success",
        },
      ],
    },
  ],
  id: "velocity-hub-v1",
  name: "Velocity Hub",
  network: "ao",
  processId: "g_eSbkmD4LzfZtXaCLmeMcLIBQrqxnY-oFQJJNMIn4w", // Example hub
  tags: ["velocity", "social", "messaging", "decentralized"],
  verification: {
    codeVerified: true,
    permissions: ["read-events", "post-events", "manage-follows"],
    riskLevel: "low",
  },
  version: "1.0.0",
};

// Token Process - Standard AO token functionality
export const tokenWorkflow: WorkflowDefinition = {
  capabilities: ["token-transfer", "balance-query", "token-metadata"],
  category: "finance",
  description:
    "Standard AO token with transfer, balance, and metadata functionality",
  documentation: {
    docs: "https://cookbook_ao.g8way.io/concepts/tokens.html",
  },
  handlers: [
    {
      capabilities: ["token-transfer"],
      costs: { description: "Network fee", tokenCost: 1 },
      description: "Transfer tokens to another address",
      messageSchema: {
        action: "Transfer",
        description: "Send tokens to a recipient",
        examples: [
          {
            description: "Transfer 100 tokens",
            expectedResponse: "Transfer successful",
            tags: [
              { name: "Action", value: "Transfer" },
              { name: "Recipient", value: "abc123...def456" },
              { name: "Quantity", value: "100" },
            ],
          },
        ],
        tags: [
          { name: "Action", required: true, value: "Transfer" },
          {
            description: "Recipient address",
            name: "Recipient",
            required: true,
            value: "",
          },
          {
            description: "Amount to transfer",
            examples: ["100", "1000000000000"],
            name: "Quantity",
            required: true,
            value: "",
          },
        ],
      },
      name: "Transfer",
      rateLimit: { requestsPerMinute: 100 },
      responsePatterns: [
        {
          format: { dataType: "string", structured: false },
          indicators: { tags: [{ name: "Status", values: ["Success"] }] },
          messageType: "success",
        },
        {
          format: { dataType: "string", structured: false },
          indicators: {
            errorCodes: ["Insufficient-Balance", "Invalid-Recipient"],
          },
          messageType: "error",
        },
      ],
    },
    {
      capabilities: ["balance-query"],
      description: "Check token balance for an address",
      messageSchema: {
        action: "Balance",
        description: "Query token balance",
        examples: [
          {
            description: "Check your own balance",
            expectedResponse: "Balance: 1000",
            tags: [{ name: "Action", value: "Balance" }],
          },
          {
            description: "Check another address balance",
            expectedResponse: "Balance: 500",
            tags: [
              { name: "Action", value: "Balance" },
              { name: "Target", value: "xyz789...uvw123" },
            ],
          },
        ],
        tags: [
          { name: "Action", required: true, value: "Balance" },
          {
            description: "Address to check (defaults to sender)",
            name: "Target",
            required: false,
            value: "",
          },
        ],
      },
      name: "Balance",
      rateLimit: { requestsPerMinute: 200 },
      responsePatterns: [
        {
          format: {
            dataType: "string",
            parser: "Extract number from 'Balance: X' format",
            structured: false,
          },
          indicators: {},
          messageType: "data",
        },
      ],
    },
    {
      capabilities: ["token-metadata"],
      description: "Get token metadata and information",
      messageSchema: {
        action: "Info",
        description: "Retrieve token information",
        examples: [
          {
            description: "Get token info",
            expectedResponse: "Token name, symbol, total supply, etc.",
            tags: [{ name: "Action", value: "Info" }],
          },
        ],
        tags: [{ name: "Action", required: true, value: "Info" }],
      },
      name: "Info",
      rateLimit: { requestsPerMinute: 500 },
      responsePatterns: [
        {
          format: { dataType: "json", structured: true },
          indicators: {},
          messageType: "data",
        },
      ],
    },
  ],
  id: "ao-token-v1",
  name: "AO Token",
  network: "ao",
  processId: "EXAMPLE_TOKEN_PROCESS_ID", // To be replaced with actual token process
  tags: ["token", "currency", "finance", "transfer"],
  verification: {
    codeVerified: true,
    permissions: ["read-balance", "transfer-tokens"],
    riskLevel: "low",
  },
  version: "1.0.0",
};

// Chat Room Process - Group messaging
export const chatRoomWorkflow: WorkflowDefinition = {
  capabilities: ["group-messaging", "user-management", "message-history"],
  category: "social",
  description: "Multi-user chat room with message history and user management",
  handlers: [
    {
      capabilities: ["group-messaging"],
      description: "Send a message to the chat room",
      messageSchema: {
        action: "Say",
        description: "Post a message to the chat",
        examples: [
          {
            description: "Send a chat message",
            expectedResponse: "Message sent to chat",
            tags: [
              { name: "Action", value: "Say" },
              { name: "Message", value: "Hello everyone!" },
            ],
          },
        ],
        tags: [
          { name: "Action", required: true, value: "Say" },
          {
            description: "Chat message content",
            name: "Message",
            required: true,
            value: "",
          },
        ],
      },
      name: "Say",
      rateLimit: { requestsPerMinute: 60 },
      responsePatterns: [
        {
          format: { dataType: "string", structured: false },
          indicators: {},
          messageType: "success",
        },
      ],
    },
    {
      capabilities: ["message-history"],
      description: "Retrieve recent chat messages",
      messageSchema: {
        action: "GetMessages",
        description: "Fetch chat history",
        examples: [
          {
            description: "Get last 10 messages",
            expectedResponse: "Array of chat messages",
            tags: [
              { name: "Action", value: "GetMessages" },
              { name: "Count", value: "10" },
            ],
          },
        ],
        tags: [
          { name: "Action", required: true, value: "GetMessages" },
          {
            description: "Number of messages to retrieve",
            name: "Count",
            required: false,
            value: "10",
          },
        ],
      },
      name: "GetMessages",
      rateLimit: { requestsPerMinute: 120 },
      responsePatterns: [
        {
          format: { dataType: "json", structured: true },
          indicators: {},
          messageType: "data",
        },
      ],
    },
    {
      capabilities: ["user-management"],
      description: "Join the chat room",
      messageSchema: {
        action: "Join",
        description: "Add yourself to the chat room",
        examples: [
          {
            description: "Join with a username",
            expectedResponse: "Welcome to the chat room!",
            tags: [
              { name: "Action", value: "Join" },
              { name: "Username", value: "ChatUser123" },
            ],
          },
        ],
        tags: [
          { name: "Action", required: true, value: "Join" },
          {
            description: "Display name for the chat",
            name: "Username",
            required: false,
            value: "",
          },
        ],
      },
      name: "Join",
      rateLimit: { requestsPerMinute: 10 },
      responsePatterns: [
        {
          format: { dataType: "string", structured: false },
          indicators: {},
          messageType: "success",
        },
      ],
    },
  ],
  id: "ao-chatroom-v1",
  name: "AO Chat Room",
  network: "ao",
  processId: "EXAMPLE_CHAT_PROCESS_ID",
  tags: ["chat", "messaging", "group", "communication"],
  verification: {
    codeVerified: false,
    permissions: ["post-messages", "read-messages", "join-room"],
    riskLevel: "medium",
  },
  version: "1.0.0",
};

// Registry/Directory Process - Service discovery
export const registryWorkflow: WorkflowDefinition = {
  capabilities: ["service-discovery", "registration", "search"],
  category: "infrastructure",
  description: "Directory service for discovering and registering AO processes",
  handlers: [
    {
      capabilities: ["registration"],
      description: "Register a service in the directory",
      messageSchema: {
        action: "Register",
        description: "Add a service to the registry",
        examples: [
          {
            description: "Register a token service",
            expectedResponse: "Service registered successfully",
            tags: [
              { name: "Action", value: "Register" },
              { name: "Name", value: "MyToken" },
              { name: "Description", value: "A sample token on AO" },
              { name: "ProcessId", value: "abc123...def456" },
              { name: "Category", value: "finance" },
            ],
          },
        ],
        tags: [
          { name: "Action", required: true, value: "Register" },
          {
            description: "Service name",
            name: "Name",
            required: true,
            value: "",
          },
          {
            description: "Service description",
            name: "Description",
            required: true,
            value: "",
          },
          {
            description: "AO process ID",
            name: "ProcessId",
            required: true,
            value: "",
          },
          {
            description: "Service category",
            name: "Category",
            required: false,
            value: "",
          },
        ],
      },
      name: "Register",
      rateLimit: { requestsPerMinute: 20 },
      responsePatterns: [
        {
          format: { dataType: "string", structured: false },
          indicators: {},
          messageType: "success",
        },
      ],
    },
    {
      capabilities: ["service-discovery", "search"],
      description: "Search for services in the registry",
      messageSchema: {
        action: "Search",
        description: "Find services by name or category",
        examples: [
          {
            description: "Search for token services",
            expectedResponse: "List of matching services",
            tags: [
              { name: "Action", value: "Search" },
              { name: "Query", value: "token" },
              { name: "Limit", value: "5" },
            ],
          },
        ],
        tags: [
          { name: "Action", required: true, value: "Search" },
          {
            description: "Search term or category",
            name: "Query",
            required: true,
            value: "",
          },
          {
            description: "Max results to return",
            name: "Limit",
            required: false,
            value: "10",
          },
        ],
      },
      name: "Search",
      rateLimit: { requestsPerMinute: 100 },
      responsePatterns: [
        {
          format: { dataType: "json", structured: true },
          indicators: {},
          messageType: "data",
        },
      ],
    },
  ],
  id: "ao-registry-v1",
  name: "AO Service Registry",
  network: "ao",
  processId: "EXAMPLE_REGISTRY_PROCESS_ID",
  tags: ["registry", "directory", "discovery", "infrastructure"],
  verification: {
    codeVerified: false,
    permissions: ["read-registry", "register-service"],
    riskLevel: "low",
  },
  version: "1.0.0",
};

// Export all workflow definitions
export const exampleWorkflows: WorkflowDefinition[] = [
  velocityHubWorkflow,
  tokenWorkflow,
  chatRoomWorkflow,
  registryWorkflow,
];

// Utility function to search workflows by capability
export function findWorkflowsByCapability(
  capability: string,
): WorkflowDefinition[] {
  return exampleWorkflows.filter((workflow) =>
    workflow.capabilities.includes(capability),
  );
}

// Utility function to get workflow by ID
export function getWorkflowDefinition(
  id: string,
): undefined | WorkflowDefinition {
  return exampleWorkflows.find((workflow) => workflow.id === id);
}

// Utility function to get workflows by category
export function getWorkflowsByCategory(category: string): WorkflowDefinition[] {
  return exampleWorkflows.filter((workflow) => workflow.category === category);
}
