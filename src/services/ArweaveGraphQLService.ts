import type {
  AOProcessQuery,
  ArweaveGraphQLEndpoint,
  Block,
  BlockQuery,
  BlockQueryResult,
  GraphQLResponse,
  Transaction,
  TransactionQuery,
  TransactionQueryResult,
} from "../models/ArweaveGraphQL.js";

export interface ArweaveGraphQLServiceInterface {
  executeCustomQuery<T>(
    query: string,
    variables?: Record<string, unknown>,
  ): Promise<GraphQLResponse<T>>;
  getBlockData(blockId: string): Promise<Block | null>;
  getTransactionData(txId: string): Promise<null | Transaction>;
  queryAOProcessMessages(
    processQuery: AOProcessQuery,
  ): Promise<TransactionQueryResult>;
  queryBlocks(blockQuery: BlockQuery): Promise<BlockQueryResult>;
  queryTransactions(
    transactionQuery: TransactionQuery,
  ): Promise<TransactionQueryResult>;
}

export class ArweaveGraphQLService implements ArweaveGraphQLServiceInterface {
  private readonly debugMode = process.env.DEBUG === "true";

  private readonly endpoints: ArweaveGraphQLEndpoint[] = [
    {
      name: "Goldsky",
      priority: 1,
      url: "https://arweave-search.goldsky.com/graphql",
    },
    {
      name: "Arweave.net",
      priority: 2,
      url: "https://arweave.net/graphql",
    },
  ];
  private readonly fetchTimeoutMs = 30000; // 30 seconds
  private readonly maxRetries = 2;

  /**
   * Execute a custom GraphQL query with automatic endpoint fallback
   */
  async executeCustomQuery<T>(
    query: string,
    variables?: Record<string, unknown>,
  ): Promise<GraphQLResponse<T>> {
    return this.executeGraphQLRequest<T>(query, variables);
  }

  /**
   * Get detailed information for a specific block
   */
  async getBlockData(blockId: string): Promise<Block | null> {
    try {
      const response = await this.executeGraphQLRequest<{ block: Block }>(
        `
        query GetBlock($id: String!) {
          block(id: $id) {
            id
            timestamp
            height
            previous
          }
        }
        `,
        { id: blockId },
      );

      if (response.errors) {
        throw new Error(
          `GraphQL errors: ${response.errors.map((e) => e.message).join(", ")}`,
        );
      }

      const block = response.data?.block;
      return block ? this.formatBlock(block) : null;
    } catch (error) {
      throw new Error(
        `Failed to get block data for ${blockId}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get detailed information for a specific transaction
   */
  async getTransactionData(txId: string): Promise<null | Transaction> {
    try {
      const response = await this.executeGraphQLRequest<{
        transaction: Transaction;
      }>(
        `
        query GetTransaction($id: ID!) {
          transaction(id: $id) {
            id
            anchor
            signature
            recipient
            owner {
              address
              key
            }
            fee {
              winston
              ar
            }
            quantity {
              winston
              ar
            }
            data {
              size
              type
            }
            tags {
              name
              value
            }
            block {
              id
              timestamp
              height
              previous
            }
            bundledIn {
              id
            }
            ingested_at
          }
        }
        `,
        { id: txId },
      );

      if (response.errors) {
        throw new Error(
          `GraphQL errors: ${response.errors.map((e) => e.message).join(", ")}`,
        );
      }

      const transaction = response.data?.transaction;
      return transaction ? this.formatTransaction(transaction) : null;
    } catch (error) {
      throw new Error(
        `Failed to get transaction data for ${txId}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Query AO process messages using process-specific filters
   */
  async queryAOProcessMessages(
    processQuery: AOProcessQuery,
  ): Promise<TransactionQueryResult> {
    try {
      const variables: Record<string, unknown> = {
        first: processQuery.first || 10,
        sort: processQuery.sort || "INGESTED_AT_DESC",
      };

      if (processQuery.after) {
        variables.after = processQuery.after;
      }

      // Build tags array for AO process message filtering
      const tags: Array<{ name: string; values: string[] }> = [
        { name: "Data-Protocol", values: ["ao"] },
      ];

      if (processQuery.fromProcessId) {
        tags.push({
          name: "From-Process",
          values: [processQuery.fromProcessId],
        });
      }

      if (processQuery.toProcessId) {
        tags.push({ name: "To-Process", values: [processQuery.toProcessId] });
      }

      if (processQuery.msgRefs && processQuery.msgRefs.length > 0) {
        tags.push({ name: "Reference", values: processQuery.msgRefs });
      }

      if (processQuery.action) {
        tags.push({ name: "Action", values: [processQuery.action] });
      }

      variables.tags = tags;

      const query = `
        query GetAOMessages(
          $tags: [TagFilter!]
          $first: Int
          $after: String
          $sort: SortOrder
        ) {
          transactions(
            tags: $tags
            first: $first
            after: $after
            sort: $sort
          ) {
            pageInfo {
              hasNextPage
            }
            edges {
              cursor
              node {
                id
                anchor
                signature
                recipient
                owner {
                  address
                  key
                }
                fee {
                  winston
                  ar
                }
                quantity {
                  winston
                  ar
                }
                data {
                  size
                  type
                }
                tags {
                  name
                  value
                }
                block {
                  id
                  timestamp
                  height
                  previous
                }
                bundledIn {
                  id
                }
                ingested_at
              }
            }
          }
        }
      `;

      const response = await this.executeGraphQLRequest<{
        transactions: {
          edges: Array<{ cursor: string; node: Transaction }>;
          pageInfo: { hasNextPage: boolean };
        };
      }>(query, variables);

      if (response.errors) {
        throw new Error(
          `GraphQL errors: ${response.errors.map((e) => e.message).join(", ")}`,
        );
      }

      const transactionData = response.data?.transactions;
      if (!transactionData) {
        return { pageInfo: { hasNextPage: false }, transactions: [] };
      }

      return {
        pageInfo: transactionData.pageInfo,
        transactions: transactionData.edges.map((edge) =>
          this.formatTransaction(edge.node),
        ),
      };
    } catch (error) {
      throw new Error(
        `Failed to query AO process messages: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Query blocks with filtering and pagination
   */
  async queryBlocks(blockQuery: BlockQuery): Promise<BlockQueryResult> {
    try {
      const variables: Record<string, unknown> = {
        first: blockQuery.first || 10,
        sort: blockQuery.sort || "HEIGHT_DESC",
      };

      if (blockQuery.ids) {
        variables.ids = blockQuery.ids;
      }

      if (blockQuery.height) {
        variables.height = blockQuery.height;
      }

      if (blockQuery.after) {
        variables.after = blockQuery.after;
      }

      const query = `
        query GetBlocks(
          $ids: [ID!]
          $height: BlockFilter
          $first: Int
          $after: String
          $sort: SortOrder
        ) {
          blocks(
            ids: $ids
            height: $height
            first: $first
            after: $after
            sort: $sort
          ) {
            pageInfo {
              hasNextPage
            }
            edges {
              cursor
              node {
                id
                timestamp
                height
                previous
              }
            }
          }
        }
      `;

      const response = await this.executeGraphQLRequest<{
        blocks: {
          edges: Array<{ cursor: string; node: Block }>;
          pageInfo: { hasNextPage: boolean };
        };
      }>(query, variables);

      if (response.errors) {
        throw new Error(
          `GraphQL errors: ${response.errors.map((e) => e.message).join(", ")}`,
        );
      }

      const blockData = response.data?.blocks;
      if (!blockData) {
        return { blocks: [], pageInfo: { hasNextPage: false } };
      }

      return {
        blocks: blockData.edges.map((edge) => this.formatBlock(edge.node)),
        pageInfo: blockData.pageInfo,
      };
    } catch (error) {
      throw new Error(
        `Failed to query blocks: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Query transactions with comprehensive filtering and pagination
   */
  async queryTransactions(
    transactionQuery: TransactionQuery,
  ): Promise<TransactionQueryResult> {
    try {
      // Build the query dynamically based on provided parameters
      const queryParts: string[] = [];
      const variables: Record<string, unknown> = {};

      // Add pagination
      if (transactionQuery.first) {
        queryParts.push("first: $first");
        variables.first = transactionQuery.first;
      } else {
        queryParts.push("first: 10"); // Default to 10
      }

      // Add cursor for pagination
      if (transactionQuery.after) {
        queryParts.push("after: $after");
        variables.after = transactionQuery.after;
      }

      // Add sort order
      if (transactionQuery.sort) {
        queryParts.push("sort: $sort");
        variables.sort = transactionQuery.sort;
      }

      // Add filters
      if (transactionQuery.ids) {
        queryParts.push("ids: $ids");
        variables.ids = transactionQuery.ids;
      }

      if (transactionQuery.owners) {
        queryParts.push("owners: $owners");
        variables.owners = transactionQuery.owners;
      }

      if (transactionQuery.recipients) {
        queryParts.push("recipients: $recipients");
        variables.recipients = transactionQuery.recipients;
      }

      if (transactionQuery.tags) {
        queryParts.push("tags: $tags");
        variables.tags = transactionQuery.tags;
      }

      if (transactionQuery.block) {
        queryParts.push("block: $block");
        variables.block = transactionQuery.block;
      }

      if (transactionQuery.ingested_at) {
        queryParts.push("ingested_at: $ingested_at");
        variables.ingested_at = transactionQuery.ingested_at;
      }

      // Build the complete query using the exact structure from documentation
      const query = `
        query GetTransactions${
          Object.keys(variables).length > 0
            ? `(${Object.keys(variables)
                .map((key) => {
                  switch (key) {
                    case "after":
                      return "$after: String";
                    case "block":
                      return "$block: BlockFilter";
                    case "first":
                      return "$first: Int";
                    case "ids":
                      return "$ids: [ID!]";
                    case "ingested_at":
                      return "$ingested_at: IngestedAtFilter";
                    case "owners":
                      return "$owners: [String!]";
                    case "recipients":
                      return "$recipients: [String!]";
                    case "sort":
                      return "$sort: SortOrder";
                    case "tags":
                      return "$tags: [TagFilter!]";
                    default:
                      return `$${key}: String`;
                  }
                })
                .join(", ")})`
            : ""
        } {
          transactions${queryParts.length > 0 ? `(${queryParts.join(", ")})` : ""} {
            pageInfo {
              hasNextPage
            }
            edges {
              cursor
              node {
                id
                anchor
                signature
                recipient
                owner {
                  address
                  key
                }
                fee {
                  winston
                  ar
                }
                quantity {
                  winston
                  ar
                }
                data {
                  size
                  type
                }
                tags {
                  name
                  value
                }
                block {
                  id
                  timestamp
                  height
                  previous
                }
                parent {
                  id
                }
              }
            }
          }
        }
      `;

      const response = await this.executeGraphQLRequest<{
        transactions: {
          edges: Array<{ cursor: string; node: Transaction }>;
          pageInfo: { hasNextPage: boolean };
        };
      }>(query, variables);

      if (response.errors) {
        throw new Error(
          `GraphQL errors: ${response.errors.map((e) => e.message).join(", ")}`,
        );
      }

      const transactionData = response.data?.transactions;
      if (!transactionData) {
        return { pageInfo: { hasNextPage: false }, transactions: [] };
      }

      return {
        pageInfo: transactionData.pageInfo,
        transactions: transactionData.edges.map((edge) =>
          this.formatTransaction(edge.node),
        ),
      };
    } catch (error) {
      throw new Error(
        `Failed to query transactions: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Execute GraphQL request with automatic endpoint fallback and retry logic
   */
  private async executeGraphQLRequest<T>(
    query: string,
    variables?: Record<string, unknown>,
  ): Promise<GraphQLResponse<T>> {
    let lastError: Error = new Error("No endpoints available");

    // Try each endpoint with retry logic
    for (const endpoint of this.endpoints.sort(
      (a, b) => a.priority - b.priority,
    )) {
      for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
        try {
          const response = await this.executeRequest<T>(
            endpoint.url,
            query,
            variables,
          );

          return response;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));

          // Don't retry on timeout errors or GraphQL errors - they're likely to fail again
          const isTimeout =
            lastError.message.includes("timed out") ||
            lastError.message.includes("aborted");
          const isGraphQLError = lastError.message.includes("GraphQL errors");

          if (isTimeout || isGraphQLError) {
            break; // Try next endpoint
          }

          if (attempt < this.maxRetries) {
            const delayMs = Math.pow(2, attempt) * 1000;
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          }
        }
      }
    }

    throw new Error(
      `All GraphQL endpoints failed. Last error: ${lastError.message}`,
    );
  }

  /**
   * Execute a single GraphQL request to a specific endpoint
   */
  private async executeRequest<T>(
    url: string,
    query: string,
    variables?: Record<string, unknown>,
  ): Promise<GraphQLResponse<T>> {
    // Create AbortController for timeout
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, this.fetchTimeoutMs);

    try {
      const requestBody = {
        query,
        ...(variables && { variables }),
      };

      const response = await fetch(url, {
        body: JSON.stringify(requestBody),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "POST",
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = (await response.json()) as GraphQLResponse<T>;

      // Check for GraphQL errors but don't throw immediately - let caller handle
      // GraphQL errors are handled by the caller

      return result;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`Request timed out after ${this.fetchTimeoutMs}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Format block data with human-readable timestamps
   */
  private formatBlock(block: Block): Block {
    return {
      ...block,
      timestampFormatted: this.formatTimestamp(block.timestamp),
    };
  }

  /**
   * Format Unix timestamp to UTC string
   */
  private formatTimestamp(timestamp: number): string {
    return new Date(timestamp * 1000).toISOString();
  }

  /**
   * Format transaction data with human-readable timestamps
   */
  private formatTransaction(transaction: Transaction): Transaction {
    const formatted = { ...transaction };

    // Format block timestamp if present
    if (formatted.block?.timestamp) {
      formatted.block = {
        ...formatted.block,
        timestampFormatted: this.formatTimestamp(formatted.block.timestamp),
      };
    }

    // Format ingested_at timestamp if present
    if (formatted.ingested_at) {
      formatted.ingested_atFormatted = this.formatTimestamp(
        formatted.ingested_at,
      );
    }

    return formatted;
  }
}

// Export singleton instance
export const arweaveGraphQLService = new ArweaveGraphQLService();
