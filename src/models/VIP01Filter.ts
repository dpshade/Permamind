/**
 * VIP-01 Velocity Protocol Event Filter Specification
 *
 * This interface defines the standard filter format for event querying
 * according to the Velocity Protocol VIP-01 specification.
 *
 * The specification supports optimized filtering with index-based lookups
 * for improved performance on large datasets.
 */

/**
 * Legacy filter support for backward compatibility
 */
export interface LegacyFilter {
  ids?: string[];
  kinds?: string[];
  search?: string;
  tags?: Record<string, string[]>;
}

/**
 * VIP-01 compliant filter for event querying
 */
export interface VIP01Filter {
  /**
   * Event authors/creators to filter by
   * Single author queries enable index optimization
   */
  authors?: string[];

  /**
   * Specific event IDs to retrieve
   * When provided, enables index-based lookup optimization
   */
  ids?: string[];

  /**
   * Event kinds/types to filter by
   * Single kind queries enable index optimization
   */
  kinds?: string[];

  /**
   * Maximum number of results to return
   * Default: 100, Maximum: 1000
   */
  limit?: number;

  /**
   * Text search within event content
   * Case-insensitive substring matching
   */
  search?: string;

  /**
   * Timestamp filter - events created after this time
   * Unix timestamp in seconds or milliseconds
   */
  since?: number;

  /**
   * Tag-based filtering
   * Key-value pairs where each key maps to an array of acceptable values
   * Example: { "p": ["user1", "user2"], "ai_type": ["knowledge"] }
   */
  tags?: Record<string, string[]>;

  /**
   * Timestamp filter - events created before this time
   * Unix timestamp in seconds or milliseconds
   */
  until?: number;
}

/**
 * Options for VIP-01 filter processing
 */
export interface VIP01FilterOptions {
  /** Enable client-side limit enforcement as fallback */
  enableClientLimiting?: boolean;

  /** Enable client-side sorting by timestamp (newest first) */
  enableSorting?: boolean;

  /** Enable result metadata collection */
  includeMetadata?: boolean;

  /** Timeout for the filter operation in milliseconds */
  timeout?: number;
}

/**
 * Result structure for VIP-01 filtered events
 */
export interface VIP01FilterResult {
  /** The filtered events */
  events: unknown[];

  /** Whether more results are available */
  hasMore?: boolean;

  /** Timestamp of the newest event in results */
  newestTimestamp?: number;

  /** Timestamp of the oldest event in results */
  oldestTimestamp?: number;

  /** Total number of events that matched the filter (before limit) */
  totalCount?: number;
}

/**
 * Create a VIP-01 compliant filter with validation
 */
export function createVIP01Filter(filter: Partial<VIP01Filter>): VIP01Filter {
  const vip01Filter: VIP01Filter = {};

  if (filter.ids) {
    vip01Filter.ids = filter.ids;
  }

  if (filter.authors) {
    vip01Filter.authors = filter.authors;
  }

  if (filter.kinds) {
    vip01Filter.kinds = filter.kinds;
  }

  if (filter.since) {
    vip01Filter.since = filter.since;
  }

  if (filter.until) {
    vip01Filter.until = filter.until;
  }

  if (filter.tags) {
    vip01Filter.tags = filter.tags;
  }

  if (filter.search) {
    vip01Filter.search = filter.search;
  }

  if (filter.limit) {
    vip01Filter.limit = Math.min(Math.max(1, filter.limit), 1000);
  }

  if (!isVIP01Filter(vip01Filter)) {
    throw new Error("Invalid VIP-01 filter parameters");
  }

  return vip01Filter;
}

/**
 * Type guard to check if a filter is VIP-01 compliant
 */
export function isVIP01Filter(filter: unknown): filter is VIP01Filter {
  if (!filter || typeof filter !== "object") {
    return false;
  }

  const f = filter as Record<string, unknown>;

  // Check optional array fields
  if (
    f.ids &&
    (!Array.isArray(f.ids) || !f.ids.every((id) => typeof id === "string"))
  ) {
    return false;
  }

  if (
    f.authors &&
    (!Array.isArray(f.authors) ||
      !f.authors.every((author) => typeof author === "string"))
  ) {
    return false;
  }

  if (
    f.kinds &&
    (!Array.isArray(f.kinds) ||
      !f.kinds.every((kind) => typeof kind === "string"))
  ) {
    return false;
  }

  // Check timestamp fields
  if (f.since && typeof f.since !== "number") {
    return false;
  }

  if (f.until && typeof f.until !== "number") {
    return false;
  }

  // Check tags object
  if (f.tags && (typeof f.tags !== "object" || Array.isArray(f.tags))) {
    return false;
  }

  // Check search string
  if (f.search && typeof f.search !== "string") {
    return false;
  }

  // Check limit
  if (
    f.limit &&
    (typeof f.limit !== "number" || f.limit < 1 || f.limit > 1000)
  ) {
    return false;
  }

  return true;
}

/**
 * Convert legacy filter format to VIP-01 format
 */
export function legacyToVIP01Filter(
  legacyFilters: LegacyFilter[],
): VIP01Filter {
  const vip01Filter: VIP01Filter = {};

  for (const filter of legacyFilters) {
    if (filter.kinds) {
      vip01Filter.kinds = [...(vip01Filter.kinds || []), ...filter.kinds];
    }

    if (filter.search) {
      vip01Filter.search = filter.search;
    }

    if (filter.ids) {
      vip01Filter.ids = [...(vip01Filter.ids || []), ...filter.ids];
    }

    if (filter.tags) {
      vip01Filter.tags = { ...vip01Filter.tags, ...filter.tags };
    }
  }

  return vip01Filter;
}
