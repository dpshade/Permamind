/**
 * Example Workflow Definitions for Common AO Processes
 *
 * These examples demonstrate how to define workflow definitions for popular
 * AO processes, enabling dynamic interaction through the aoMessage tool.
 */

import { WorkflowDefinition } from "../src/types/WorkflowDefinition.js";

// Velocity Protocol Hub - Social messaging and event handling
export const velocityHubWorkflow: WorkflowDefinition = {
  id: "velocity-hub-v1",
  name: "Velocity Hub",
  description: "Decentralized social messaging hub using Velocity Protocol",
  version: "1.0.0",
  processId: "g_eSbkmD4LzfZtXaCLmeMcLIBQrqxnY-oFQJJNMIn4w", // Example hub
  capabilities: ["social-messaging", "event-streaming", "follow-management"],
  category: "social",
  tags: ["velocity", "social", "messaging", "decentralized"],
  network: "ao",
  handlers: [
    {
      name: "Event",
      description: "Post a social event/message to the hub",
      messageSchema: {
        action: "Event",
        description: "Create a new social event",
        tags: [
          { name: "Action", value: "Event", required: true },
          {
            name: "Kind",
            value: "1",
            required: true,
            description: "Event type (1 for text)",
          },
          {
            name: "Content",
            value: "",
            required: true,
            description: "Message content",
            examples: ["Hello world!", "GM frens!"],
          },
        ],
        examples: [
          {
            description: "Simple text message",
            tags: [
              { name: "Action", value: "Event" },
              { name: "Kind", value: "1" },
              { name: "Content", value: "Hello from AO!" },
            ],
            expectedResponse: "Message posted successfully",
          },
        ],
      },
      responsePatterns: [
        {
          messageType: "success",
          indicators: { tags: [{ name: "Status", values: ["Success"] }] },
          format: { structured: false, dataType: "string" },
        },
      ],
      capabilities: ["social-posting"],
      rateLimit: { requestsPerMinute: 60 },
    },
    {
      name: "FetchEvents",
      description: "Retrieve events from the hub with filtering",
      messageSchema: {
        action: "FetchEvents",
        description: "Fetch filtered events from the hub",
        tags: [
          { name: "Action", value: "FetchEvents", required: true },
          {
            name: "Filters",
            value: "",
            required: true,
            description: "JSON filter string",
            examples: ['[{"kinds":["1"],"limit":10}]'],
          },
        ],
        examples: [
          {
            description: "Get latest 10 text messages",
            tags: [
              { name: "Action", value: "FetchEvents" },
              { name: "Filters", value: '[{"kinds":["1"],"limit":10}]' },
            ],
            expectedResponse: "Array of event objects",
          },
        ],
      },
      responsePatterns: [
        {
          messageType: "data",
          indicators: {},
          format: { structured: true, dataType: "json" },
        },
      ],
      capabilities: ["data-retrieval", "event-filtering"],
      rateLimit: { requestsPerMinute: 120 },
    },
    {
      name: "Follow",
      description: "Follow another user on the social network",
      messageSchema: {
        action: "Follow",
        description: "Add a user to your follow list",
        tags: [
          { name: "Action", value: "Follow", required: true },
          {
            name: "Target",
            value: "",
            required: true,
            description: "Address to follow",
            examples: ["1234...abcd", "user_address_here"],
          },
        ],
        examples: [
          {
            description: "Follow a user",
            tags: [
              { name: "Action", value: "Follow" },
              {
                name: "Target",
                value: "1234567890abcdef1234567890abcdef12345678",
              },
            ],
            expectedResponse: "Follow relationship created",
          },
        ],
      },
      responsePatterns: [
        {
          messageType: "success",
          indicators: {},
          format: { structured: false, dataType: "string" },
        },
      ],
      capabilities: ["social-networking"],
      rateLimit: { requestsPerMinute: 30 },
    },
  ],
  documentation: {
    docs: "https://github.com/SpaceTurtle-Dao/velocity-protocol",
    github: "https://github.com/SpaceTurtle-Dao/velocity-protocol",
  },
  verification: {
    codeVerified: true,
    riskLevel: "low",
    permissions: ["read-events", "post-events", "manage-follows"],
  },
};

// Token Process - Standard AO token functionality
export const tokenWorkflow: WorkflowDefinition = {
  id: "ao-token-v1",
  name: "AO Token",
  description:
    "Standard AO token with transfer, balance, and metadata functionality",
  version: "1.0.0",
  processId: "EXAMPLE_TOKEN_PROCESS_ID", // To be replaced with actual token process
  capabilities: ["token-transfer", "balance-query", "token-metadata"],
  category: "finance",
  tags: ["token", "currency", "finance", "transfer"],
  network: "ao",
  handlers: [
    {
      name: "Transfer",
      description: "Transfer tokens to another address",
      messageSchema: {
        action: "Transfer",
        description: "Send tokens to a recipient",
        tags: [
          { name: "Action", value: "Transfer", required: true },
          {
            name: "Recipient",
            value: "",
            required: true,
            description: "Recipient address",
          },
          {
            name: "Quantity",
            value: "",
            required: true,
            description: "Amount to transfer",
            examples: ["100", "1000000000000"],
          },
        ],
        examples: [
          {
            description: "Transfer 100 tokens",
            tags: [
              { name: "Action", value: "Transfer" },
              { name: "Recipient", value: "abc123...def456" },
              { name: "Quantity", value: "100" },
            ],
            expectedResponse: "Transfer successful",
          },
        ],
      },
      responsePatterns: [
        {
          messageType: "success",
          indicators: { tags: [{ name: "Status", values: ["Success"] }] },
          format: { structured: false, dataType: "string" },
        },
        {
          messageType: "error",
          indicators: {
            errorCodes: ["Insufficient-Balance", "Invalid-Recipient"],
          },
          format: { structured: false, dataType: "string" },
        },
      ],
      capabilities: ["token-transfer"],
      costs: { tokenCost: 1, description: "Network fee" },
      rateLimit: { requestsPerMinute: 100 },
    },
    {
      name: "Balance",
      description: "Check token balance for an address",
      messageSchema: {
        action: "Balance",
        description: "Query token balance",
        tags: [
          { name: "Action", value: "Balance", required: true },
          {
            name: "Target",
            value: "",
            required: false,
            description: "Address to check (defaults to sender)",
          },
        ],
        examples: [
          {
            description: "Check your own balance",
            tags: [{ name: "Action", value: "Balance" }],
            expectedResponse: "Balance: 1000",
          },
          {
            description: "Check another address balance",
            tags: [
              { name: "Action", value: "Balance" },
              { name: "Target", value: "xyz789...uvw123" },
            ],
            expectedResponse: "Balance: 500",
          },
        ],
      },
      responsePatterns: [
        {
          messageType: "data",
          indicators: {},
          format: {
            structured: false,
            dataType: "string",
            parser: "Extract number from 'Balance: X' format",
          },
        },
      ],
      capabilities: ["balance-query"],
      rateLimit: { requestsPerMinute: 200 },
    },
    {
      name: "Info",
      description: "Get token metadata and information",
      messageSchema: {
        action: "Info",
        description: "Retrieve token information",
        tags: [{ name: "Action", value: "Info", required: true }],
        examples: [
          {
            description: "Get token info",
            tags: [{ name: "Action", value: "Info" }],
            expectedResponse: "Token name, symbol, total supply, etc.",
          },
        ],
      },
      responsePatterns: [
        {
          messageType: "data",
          indicators: {},
          format: { structured: true, dataType: "json" },
        },
      ],
      capabilities: ["token-metadata"],
      rateLimit: { requestsPerMinute: 500 },
    },
  ],
  documentation: {
    docs: "https://cookbook_ao.g8way.io/concepts/tokens.html",
  },
  verification: {
    codeVerified: true,
    riskLevel: "low",
    permissions: ["read-balance", "transfer-tokens"],
  },
};

// Chat Room Process - Group messaging
export const chatRoomWorkflow: WorkflowDefinition = {
  id: "ao-chatroom-v1",
  name: "AO Chat Room",
  description: "Multi-user chat room with message history and user management",
  version: "1.0.0",
  processId: "EXAMPLE_CHAT_PROCESS_ID",
  capabilities: ["group-messaging", "user-management", "message-history"],
  category: "social",
  tags: ["chat", "messaging", "group", "communication"],
  network: "ao",
  handlers: [
    {
      name: "Say",
      description: "Send a message to the chat room",
      messageSchema: {
        action: "Say",
        description: "Post a message to the chat",
        tags: [
          { name: "Action", value: "Say", required: true },
          {
            name: "Message",
            value: "",
            required: true,
            description: "Chat message content",
          },
        ],
        examples: [
          {
            description: "Send a chat message",
            tags: [
              { name: "Action", value: "Say" },
              { name: "Message", value: "Hello everyone!" },
            ],
            expectedResponse: "Message sent to chat",
          },
        ],
      },
      responsePatterns: [
        {
          messageType: "success",
          indicators: {},
          format: { structured: false, dataType: "string" },
        },
      ],
      capabilities: ["group-messaging"],
      rateLimit: { requestsPerMinute: 60 },
    },
    {
      name: "GetMessages",
      description: "Retrieve recent chat messages",
      messageSchema: {
        action: "GetMessages",
        description: "Fetch chat history",
        tags: [
          { name: "Action", value: "GetMessages", required: true },
          {
            name: "Count",
            value: "10",
            required: false,
            description: "Number of messages to retrieve",
          },
        ],
        examples: [
          {
            description: "Get last 10 messages",
            tags: [
              { name: "Action", value: "GetMessages" },
              { name: "Count", value: "10" },
            ],
            expectedResponse: "Array of chat messages",
          },
        ],
      },
      responsePatterns: [
        {
          messageType: "data",
          indicators: {},
          format: { structured: true, dataType: "json" },
        },
      ],
      capabilities: ["message-history"],
      rateLimit: { requestsPerMinute: 120 },
    },
    {
      name: "Join",
      description: "Join the chat room",
      messageSchema: {
        action: "Join",
        description: "Add yourself to the chat room",
        tags: [
          { name: "Action", value: "Join", required: true },
          {
            name: "Username",
            value: "",
            required: false,
            description: "Display name for the chat",
          },
        ],
        examples: [
          {
            description: "Join with a username",
            tags: [
              { name: "Action", value: "Join" },
              { name: "Username", value: "ChatUser123" },
            ],
            expectedResponse: "Welcome to the chat room!",
          },
        ],
      },
      responsePatterns: [
        {
          messageType: "success",
          indicators: {},
          format: { structured: false, dataType: "string" },
        },
      ],
      capabilities: ["user-management"],
      rateLimit: { requestsPerMinute: 10 },
    },
  ],
  verification: {
    codeVerified: false,
    riskLevel: "medium",
    permissions: ["post-messages", "read-messages", "join-room"],
  },
};

// Registry/Directory Process - Service discovery
export const registryWorkflow: WorkflowDefinition = {
  id: "ao-registry-v1",
  name: "AO Service Registry",
  description: "Directory service for discovering and registering AO processes",
  version: "1.0.0",
  processId: "EXAMPLE_REGISTRY_PROCESS_ID",
  capabilities: ["service-discovery", "registration", "search"],
  category: "infrastructure",
  tags: ["registry", "directory", "discovery", "infrastructure"],
  network: "ao",
  handlers: [
    {
      name: "Register",
      description: "Register a service in the directory",
      messageSchema: {
        action: "Register",
        description: "Add a service to the registry",
        tags: [
          { name: "Action", value: "Register", required: true },
          {
            name: "Name",
            value: "",
            required: true,
            description: "Service name",
          },
          {
            name: "Description",
            value: "",
            required: true,
            description: "Service description",
          },
          {
            name: "ProcessId",
            value: "",
            required: true,
            description: "AO process ID",
          },
          {
            name: "Category",
            value: "",
            required: false,
            description: "Service category",
          },
        ],
        examples: [
          {
            description: "Register a token service",
            tags: [
              { name: "Action", value: "Register" },
              { name: "Name", value: "MyToken" },
              { name: "Description", value: "A sample token on AO" },
              { name: "ProcessId", value: "abc123...def456" },
              { name: "Category", value: "finance" },
            ],
            expectedResponse: "Service registered successfully",
          },
        ],
      },
      responsePatterns: [
        {
          messageType: "success",
          indicators: {},
          format: { structured: false, dataType: "string" },
        },
      ],
      capabilities: ["registration"],
      rateLimit: { requestsPerMinute: 20 },
    },
    {
      name: "Search",
      description: "Search for services in the registry",
      messageSchema: {
        action: "Search",
        description: "Find services by name or category",
        tags: [
          { name: "Action", value: "Search", required: true },
          {
            name: "Query",
            value: "",
            required: true,
            description: "Search term or category",
          },
          {
            name: "Limit",
            value: "10",
            required: false,
            description: "Max results to return",
          },
        ],
        examples: [
          {
            description: "Search for token services",
            tags: [
              { name: "Action", value: "Search" },
              { name: "Query", value: "token" },
              { name: "Limit", value: "5" },
            ],
            expectedResponse: "List of matching services",
          },
        ],
      },
      responsePatterns: [
        {
          messageType: "data",
          indicators: {},
          format: { structured: true, dataType: "json" },
        },
      ],
      capabilities: ["service-discovery", "search"],
      rateLimit: { requestsPerMinute: 100 },
    },
  ],
  verification: {
    codeVerified: false,
    riskLevel: "low",
    permissions: ["read-registry", "register-service"],
  },
};

// Export all workflow definitions
export const exampleWorkflows: WorkflowDefinition[] = [
  velocityHubWorkflow,
  tokenWorkflow,
  chatRoomWorkflow,
  registryWorkflow,
];

// Utility function to get workflow by ID
export function getWorkflowDefinition(
  id: string,
): WorkflowDefinition | undefined {
  return exampleWorkflows.find((workflow) => workflow.id === id);
}

// Utility function to search workflows by capability
export function findWorkflowsByCapability(
  capability: string,
): WorkflowDefinition[] {
  return exampleWorkflows.filter((workflow) =>
    workflow.capabilities.includes(capability),
  );
}

// Utility function to get workflows by category
export function getWorkflowsByCategory(category: string): WorkflowDefinition[] {
  return exampleWorkflows.filter((workflow) => workflow.category === category);
}
