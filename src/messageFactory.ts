export const Relay_Lua_Module = () => {
  const _tags = [{ name: "Action", value: "Relay-Module" }];
  return _tags;
};

export const Eval = () => {
  const _tags = [{ name: "Action", value: "Eval" }];
  return _tags;
};

export const Transfer = (
  Recipient: string,
  Quantity: string,
  payload: string,
) => {
  const _tags = [
    { name: "Action", value: "Transfer" },
    { name: "Recipient", value: Recipient },
    { name: "Quantity", value: Quantity },
    { name: "X-Payload", value: payload },
  ];
  return _tags;
};

export const Subscribe = (relay: string) => {
  const _tags = [
    { name: "Action", value: "Subscribe" },
    { name: "Relay", value: relay },
  ];
  return _tags;
};

export const UnSubscribe = (relay: string) => {
  const _tags = [
    { name: "Action", value: "UnSubscribe" },
    { name: "Relay", value: relay },
  ];
  return _tags;
};

export const SetOwner = (owner: string) => {
  const _tags = [
    { name: "Action", value: "SetOwner" },
    { name: "_Owner", value: owner },
  ];
  return _tags;
};

export const SetRelay = (relay: string) => {
  const _tags = [
    { name: "Action", value: "SetRelay" },
    { name: "Relay", value: relay },
  ];
  return _tags;
};

export const GetOwner = () => {
  const _tags = [{ name: "Action", value: "GetOwner" }];
  return _tags;
};

export const Info = () => {
  const _tags = [{ name: "Action", value: "Info" }];
  return _tags;
};

export const QueryFee = (kind: string) => {
  const _tags = [
    { name: "Action", value: "QueryFee" },
    { name: "Kind", value: kind },
  ];
  return _tags;
};

export const Subs = (page: string, size: string) => {
  const _tags = [
    { name: "Action", value: "Subs" },
    { name: "Page", value: page },
    { name: "Size", value: size },
  ];
  return _tags;
};

export const Subscriptions = (page: string, size: string) => {
  const _tags = [
    { name: "Action", value: "Subscriptions" },
    { name: "Page", value: page },
    { name: "Size", value: size },
  ];
  return _tags;
};

export const IsSubscribed = (relay: string) => {
  const _tags = [
    { name: "Action", value: "IsSubscribed" },
    { name: "Relay", value: relay },
  ];
  return _tags;
};

export const FetchFeed = (filters: string) => {
  return [
    { name: "Action", value: "FetchFeed" },
    { name: "Filters", value: filters },
  ];
};

export const FetchEvents = (filters: string) => {
  return [
    { name: "Action", value: "FetchEvents" },
    { name: "Filters", value: filters },
  ];
};

export const UpdateProfile = () => {
  return [{ name: "Action", value: "Update-Profile" }];
};

//REGISTRY METHODS

export const Register = () => {
  return [{ name: "Action", value: "Register" }];
};

export const GetZones = (filters: string, page: string, limit: string) => {
  return [
    { name: "Action", value: "GetZones" },
    { name: "Filters", value: filters },
    { name: "Page", value: page },
    { name: "Limit", value: limit },
  ];
};

export const GetZoneById = (zoneId: string) => {
  return [
    { name: "Action", value: "GetZoneById" },
    { name: "ZoneId", value: zoneId },
  ];
};

export const RelayMessage = (owner: string) => {
  const _tags = [
    { name: "Action", value: "Relay" },
    { name: "_Owner", value: owner },
  ];
  return _tags;
};

export const Relays = (page: string, size: string) => {
  const _tags = [
    { name: "Action", value: "Relays" },
    { name: "Page", value: page },
    { name: "Size", value: size },
  ];
  return _tags;
};

// Natural Language Message Templates for aoMessage tool

/**
 * Token Balance Query Template
 * For queries like "get my token balance", "check AO balance"
 */
export const BalanceQuery = (token?: string) => {
  const tags = [{ name: "Action", value: "Balance" }];
  if (token) {
    tags.push({ name: "Token", value: token });
  }
  return tags;
};

/**
 * Token Info Query Template
 * For queries like "get token info", "show token details"
 */
export const TokenInfo = () => {
  return [
    { name: "Action", value: "Info" },
    { name: "Type", value: "Token" },
  ];
};

/**
 * Process State Query Template
 * For queries like "what is the current state", "check status"
 */
export const StateQuery = (queryType?: string) => {
  const tags = [{ name: "Action", value: "State" }];
  if (queryType) {
    tags.push({ name: "Query-Type", value: queryType });
  }
  return tags;
};

/**
 * Generic Process Info Template
 * For queries like "info about process", "get process details"
 */
export const ProcessInfo = () => {
  return [{ name: "Action", value: "Info" }];
};

/**
 * Vote Action Template
 * For governance actions like "vote yes on proposal 1"
 */
export const Vote = (proposalId: string, choice: string) => {
  return [
    { name: "Action", value: "Vote" },
    { name: "Proposal-Id", value: proposalId },
    { name: "Choice", value: choice },
  ];
};

/**
 * Create Proposal Template
 * For governance actions like "create proposal for funding"
 */
export const CreateProposal = (title: string, description: string) => {
  return [
    { name: "Action", value: "Create-Proposal" },
    { name: "Title", value: title },
    { name: "Description", value: description },
  ];
};

/**
 * Registry Add Template
 * For registry operations like "register new entry"
 */
export const RegistryAdd = (key: string, value: string, category?: string) => {
  const tags = [
    { name: "Action", value: "Add" },
    { name: "Key", value: key },
    { name: "Value", value: value },
  ];
  if (category) {
    tags.push({ name: "Category", value: category });
  }
  return tags;
};

/**
 * Registry Query Template
 * For registry operations like "find entries for category X"
 */
export const RegistryQuery = (key?: string, category?: string) => {
  const tags = [{ name: "Action", value: "Query" }];
  if (key) {
    tags.push({ name: "Key", value: key });
  }
  if (category) {
    tags.push({ name: "Category", value: category });
  }
  return tags;
};

/**
 * Marketplace Buy Template
 * For marketplace operations like "buy item for 10 AO"
 */
export const MarketplaceBuy = (
  itemId: string,
  price: string,
  currency?: string,
) => {
  const tags = [
    { name: "Action", value: "Buy" },
    { name: "Item-Id", value: itemId },
    { name: "Price", value: price },
  ];
  if (currency) {
    tags.push({ name: "Currency", value: currency });
  }
  return tags;
};

/**
 * Marketplace Sell Template
 * For marketplace operations like "sell item for 5 AO"
 */
export const MarketplaceSell = (
  itemId: string,
  price: string,
  currency?: string,
) => {
  const tags = [
    { name: "Action", value: "Sell" },
    { name: "Item-Id", value: itemId },
    { name: "Price", value: price },
  ];
  if (currency) {
    tags.push({ name: "Currency", value: currency });
  }
  return tags;
};

/**
 * Custom Action Template
 * For custom messages with arbitrary actions and parameters
 */
export const CustomAction = (
  action: string,
  customTags?: Record<string, string>,
) => {
  const tags = [{ name: "Action", value: action }];
  if (customTags) {
    for (const [key, value] of Object.entries(customTags)) {
      tags.push({ name: key, value });
    }
  }
  return tags;
};

/**
 * Mint Token Template
 * For token operations like "mint 1000 tokens"
 */
export const Mint = (quantity: string, recipient?: string) => {
  const tags = [
    { name: "Action", value: "Mint" },
    { name: "Quantity", value: quantity },
  ];
  if (recipient) {
    tags.push({ name: "Recipient", value: recipient });
  }
  return tags;
};

/**
 * Burn Token Template
 * For token operations like "burn 100 tokens"
 */
export const Burn = (quantity: string) => {
  return [
    { name: "Action", value: "Burn" },
    { name: "Quantity", value: quantity },
  ];
};

/**
 * Allow/Approve Token Template
 * For token operations like "approve alice to spend 50 tokens"
 */
export const Allow = (spender: string, quantity: string) => {
  return [
    { name: "Action", value: "Allow" },
    { name: "Spender", value: spender },
    { name: "Quantity", value: quantity },
  ];
};

/**
 * Transfer From Template
 * For delegated transfers like "transfer 10 tokens from bob to alice"
 */
export const TransferFrom = (from: string, to: string, quantity: string) => {
  return [
    { name: "Action", value: "Transfer-From" },
    { name: "From", value: from },
    { name: "To", value: to },
    { name: "Quantity", value: quantity },
  ];
};

/**
 * Get Allowance Template
 * For checking allowances like "check allowance for alice"
 */
export const GetAllowance = (owner: string, spender: string) => {
  return [
    { name: "Action", value: "Allowance" },
    { name: "Owner", value: owner },
    { name: "Spender", value: spender },
  ];
};

/**
 * Get Balance Of Template
 * For checking specific user balance like "get balance of alice"
 */
export const GetBalanceOf = (target: string) => {
  return [
    { name: "Action", value: "Balance" },
    { name: "Target", value: target },
  ];
};

/**
 * Get Total Supply Template
 * For token supply queries like "what is the total supply"
 */
export const GetTotalSupply = () => {
  return [{ name: "Action", value: "Total-Supply" }];
};

/**
 * Get Token Name Template
 * For token metadata queries like "what is the token name"
 */
export const GetTokenName = () => {
  return [{ name: "Action", value: "Name" }];
};

/**
 * Get Token Symbol Template
 * For token metadata queries like "what is the token symbol"
 */
export const GetTokenSymbol = () => {
  return [{ name: "Action", value: "Ticker" }];
};

/**
 * Get Token Denomination Template
 * For token metadata queries like "what are the decimals"
 */
export const GetTokenDenomination = () => {
  return [{ name: "Action", value: "Denomination" }];
};

/**
 * Generic Read Template
 * For read-only operations that don't modify state
 */
export const Read = (action: string, parameters?: Record<string, string>) => {
  const tags = [
    { name: "Action", value: action },
    { name: "Read-Only", value: "true" },
  ];
  if (parameters) {
    for (const [key, value] of Object.entries(parameters)) {
      tags.push({ name: key, value });
    }
  }
  return tags;
};

/**
 * Generic Write Template
 * For state-modifying operations
 */
export const Write = (action: string, parameters?: Record<string, string>) => {
  const tags = [{ name: "Action", value: action }];
  if (parameters) {
    for (const [key, value] of Object.entries(parameters)) {
      tags.push({ name: key, value });
    }
  }
  return tags;
};
