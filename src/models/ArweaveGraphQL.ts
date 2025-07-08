// Type definitions for Arweave GraphQL queries and responses

export enum SortOrder {
  HEIGHT_ASC = "HEIGHT_ASC",
  HEIGHT_DESC = "HEIGHT_DESC",
  INGESTED_AT_ASC = "INGESTED_AT_ASC",
  INGESTED_AT_DESC = "INGESTED_AT_DESC",
}

export enum TagOperator {
  EQ = "EQ",
  NEQ = "NEQ",
}

export interface Amount {
  ar: string;
  winston: string;
}

// AO-specific query types
export interface AOProcessQuery {
  action?: string;
  after?: string;
  dataProtocol?: string;
  first?: number;
  fromProcessId?: string;
  msgRefs?: string[];
  sort?: SortOrder;
  toProcessId?: string;
}

export interface ArweaveGraphQLEndpoint {
  name: string;
  priority: number;
  url: string;
}

export interface Block {
  height: number;
  id: string;
  previous: string;
  timestamp: number;
  timestampFormatted?: string; // UTC ISO string representation
}

export interface BlockConnection {
  edges: BlockEdge[];
  pageInfo: PageInfo;
}

export interface BlockEdge {
  cursor: string;
  node: Block;
}

export interface BlockFilter {
  max?: number;
  min?: number;
}

export interface BlockQuery {
  after?: string;
  first?: number;
  height?: BlockFilter;
  ids?: string[];
  sort?: SortOrder;
}

export interface BlockQueryResult {
  blocks: Block[];
  pageInfo: PageInfo;
  totalCount?: number;
}

export interface Bundle {
  id: string;
}

export interface GraphQLError {
  extensions?: Record<string, unknown>;
  locations?: Array<{
    column: number;
    line: number;
  }>;
  message: string;
  path?: Array<number | string>;
}

export interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
}

export interface IngestedAtFilter {
  max?: number;
  min?: number;
}

export interface MetaData {
  size: string;
  type?: string;
}

export interface Owner {
  address: string;
  key: string;
}

export interface PageInfo {
  hasNextPage: boolean;
}

export interface Parent {
  id: string;
}

export interface Tag {
  name: string;
  value: string;
}

// Query input types
export interface TagFilter {
  name: string;
  op?: TagOperator;
  values: string[];
}

export interface Transaction {
  anchor: string;
  block?: Block;
  data: MetaData;
  fee: Amount;
  id: string;
  ingested_at?: number;
  ingested_atFormatted?: string; // UTC ISO string representation
  owner: Owner;
  parent?: Parent;
  quantity: Amount;
  recipient: string;
  signature: string;
  tags: Tag[];
}

export interface TransactionConnection {
  edges: TransactionEdge[];
  pageInfo: PageInfo;
}

export interface TransactionEdge {
  cursor: string;
  node: Transaction;
}

export interface TransactionQuery {
  after?: string;
  block?: BlockFilter;
  first?: number;
  ids?: string[];
  ingested_at?: IngestedAtFilter;
  owners?: string[];
  recipients?: string[];
  sort?: SortOrder;
  tags?: TagFilter[];
}

// Service response types
export interface TransactionQueryResult {
  pageInfo: PageInfo;
  totalCount?: number;
  transactions: Transaction[];
}

// Common GraphQL query fragments
export const TRANSACTION_FIELDS_FRAGMENT = `
  fragment TransactionFields on Transaction {
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
`;

export const BLOCK_FIELDS_FRAGMENT = `
  fragment BlockFields on Block {
    id
    timestamp
    height
    previous
  }
`;

// Pre-built GraphQL queries
export const TRANSACTION_QUERY = `
  query GetTransactions(
    $ids: [ID!]
    $owners: [String!]
    $recipients: [String!]
    $tags: [TagFilter!]
    $bundledIn: [ID!]
    $block: BlockFilter
    $ingested_at: IngestedAtFilter
    $first: Int
    $after: String
    $sort: SortOrder
  ) {
    transactions(
      ids: $ids
      owners: $owners
      recipients: $recipients
      tags: $tags
      bundledIn: $bundledIn
      block: $block
      ingested_at: $ingested_at
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
          ...TransactionFields
        }
      }
    }
  }
  ${TRANSACTION_FIELDS_FRAGMENT}
`;

export const SINGLE_TRANSACTION_QUERY = `
  query GetTransaction($id: ID!) {
    transaction(id: $id) {
      ...TransactionFields
    }
  }
  ${TRANSACTION_FIELDS_FRAGMENT}
`;

export const BLOCK_QUERY = `
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
          ...BlockFields
        }
      }
    }
  }
  ${BLOCK_FIELDS_FRAGMENT}
`;

export const SINGLE_BLOCK_QUERY = `
  query GetBlock($id: String!) {
    block(id: $id) {
      ...BlockFields
    }
  }
  ${BLOCK_FIELDS_FRAGMENT}
`;

// AO-specific queries
export const AO_PROCESS_MESSAGES_QUERY = `
  query GetAOProcessMessages(
    $fromProcessId: String!
    $msgRefs: [String!]!
    $limit: Int!
    $sortOrder: SortOrder!
    $cursor: String
    $ingestedAtMin: Int
  ) {
    transactions(
      sort: $sortOrder
      first: $limit
      after: $cursor
      tags: [
        { name: "Reference", values: $msgRefs }
        { name: "From-Process", values: [$fromProcessId] }
        { name: "Data-Protocol", values: ["ao"] }
      ]
      ingested_at: { min: $ingestedAtMin }
    ) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          ...TransactionFields
        }
      }
    }
  }
  ${TRANSACTION_FIELDS_FRAGMENT}
`;

export const AO_PROCESS_QUERY = `
  query GetAOProcess(
    $processId: String!
    $first: Int
    $after: String
    $sort: SortOrder
  ) {
    transactions(
      tags: [
        { name: "Data-Protocol", values: ["ao"] }
        { name: "Type", values: ["Process"] }
        { name: "Process", values: [$processId] }
      ]
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
          ...TransactionFields
        }
      }
    }
  }
  ${TRANSACTION_FIELDS_FRAGMENT}
`;
