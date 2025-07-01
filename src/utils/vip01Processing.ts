/**
 * VIP-01 Result Processing Utilities
 *
 * Client-side processing functions to ensure VIP-01 compliance
 * including sorting, limiting, and metadata generation.
 */

// VIP01Filter types replaced with manual interfaces
interface Filter {
  authors?: string[];
  ids?: string[];
  kinds?: string[];
  limit?: number;
  search?: string;
  since?: number;
  tags?: Record<string, string[]>;
  until?: number;
}

interface FilterOptions {
  enableClientLimiting?: boolean;
  enableSorting?: boolean;
  includeMetadata?: boolean;
}

interface FilterResult {
  events: unknown[];
  hasMore?: boolean;
  newestTimestamp?: number;
  oldestTimestamp?: number;
  totalCount?: number;
}

/**
 * Interface for events with timestamp (for sorting)
 */
interface TimestampedEvent {
  [key: string]: unknown;
  Timestamp?: number | string;
}

/**
 * Apply additional client-side filtering for complex queries
 * This is a fallback when server-side filtering is insufficient
 */
export function applyClientSideFiltering(
  events: unknown[],
  filter: Filter,
): unknown[] {
  let filtered = [...events];

  // Apply since filter (client-side fallback)
  if (filter.since) {
    filtered = filtered.filter((event) => {
      const timestamp = extractTimestamp(event);
      return timestamp > filter.since!;
    });
  }

  // Apply until filter (client-side fallback)
  if (filter.until) {
    filtered = filtered.filter((event) => {
      const timestamp = extractTimestamp(event);
      return timestamp < filter.until!;
    });
  }

  // Apply text search (client-side fallback)
  if (filter.search) {
    const searchText = filter.search.toLowerCase();
    filtered = filtered.filter((event) => {
      if (event && typeof event === "object") {
        const eventObj = event as Record<string, unknown>;
        const content = eventObj.Content || eventObj.content;
        if (typeof content === "string") {
          return content.toLowerCase().includes(searchText);
        }
      }
      return false;
    });
  }

  return filtered;
}

/**
 * Extract timestamp from an event object
 */
export function extractTimestamp(event: unknown): number {
  if (!event || typeof event !== "object") {
    return 0;
  }

  const timestampedEvent = event as TimestampedEvent;

  if (!timestampedEvent.Timestamp) {
    return 0;
  }

  const timestamp = timestampedEvent.Timestamp;

  if (typeof timestamp === "number") {
    return timestamp;
  }

  if (typeof timestamp === "string") {
    const parsed = parseInt(timestamp, 10);
    return isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

/**
 * Extract all timestamps from events array
 */
export function extractTimestamps(events: unknown[]): number[] {
  return events.map(extractTimestamp).filter((timestamp) => timestamp > 0);
}

/**
 * Generate VIP-01 filter statistics for debugging/monitoring
 */
export function generateFilterStats(
  filter: Filter,
  originalCount: number,
  finalCount: number,
): {
  efficiency: number;
  filterType: string;
  optimizationHint: string;
  parameters: string[];
} {
  const parameters: string[] = [];
  let filterType = "complex";
  let optimizationHint = "full_scan";

  // Analyze filter parameters
  if (filter.ids) {
    parameters.push("ids");
    filterType = "direct_lookup";
    optimizationHint = "index_by_id";
  }

  if (filter.authors && filter.authors.length === 1) {
    parameters.push("single_author");
    filterType = "author_lookup";
    optimizationHint = "index_by_author";
  } else if (filter.authors && filter.authors.length > 1) {
    parameters.push("multi_author");
  }

  if (filter.kinds && filter.kinds.length === 1) {
    parameters.push("single_kind");
    if (filterType === "complex") {
      filterType = "kind_lookup";
      optimizationHint = "index_by_kind";
    }
  } else if (filter.kinds && filter.kinds.length > 1) {
    parameters.push("multi_kind");
  }

  if (filter.tags) {
    parameters.push("tags");
  }

  if (filter.search) {
    parameters.push("search");
    filterType = "text_search";
  }

  if (filter.since || filter.until) {
    parameters.push("time_range");
  }

  const efficiency =
    originalCount > 0 ? (originalCount - finalCount) / originalCount : 0;

  return {
    efficiency: Math.round(efficiency * 100) / 100,
    filterType,
    optimizationHint,
    parameters,
  };
}

/**
 * Validate if events are properly sorted (newest first)
 */
export function isProperlysorted(events: unknown[]): boolean {
  const timestamps = extractTimestamps(events);

  for (let i = 1; i < timestamps.length; i++) {
    if (timestamps[i - 1] < timestamps[i]) {
      return false; // Found an older event before a newer one
    }
  }

  return true;
}

/**
 * Process raw events according to VIP-01 specification
 */
export function processVIP01Results(
  events: unknown[],
  filter: Filter,
  options: FilterOptions = {},
): FilterResult {
  const {
    enableClientLimiting = true,
    enableSorting = true,
    includeMetadata = false,
  } = options;

  let processedEvents = [...events];
  const originalCount = events.length;

  // Sort by timestamp (newest first) as per VIP-01 specification
  if (enableSorting) {
    processedEvents = sortByTimestamp(processedEvents);
  }

  // Apply client-side limiting as fallback
  let hasMore = false;
  if (
    enableClientLimiting &&
    filter.limit &&
    processedEvents.length > filter.limit
  ) {
    processedEvents = processedEvents.slice(0, filter.limit);
    hasMore = true;
  }

  const result: FilterResult = {
    events: processedEvents,
  };

  // Add metadata if requested
  if (includeMetadata) {
    result.totalCount = originalCount;
    result.hasMore = hasMore;

    const timestamps = extractTimestamps(processedEvents);
    if (timestamps.length > 0) {
      result.newestTimestamp = Math.max(...timestamps);
      result.oldestTimestamp = Math.min(...timestamps);
    }
  }

  return result;
}

/**
 * Sort events by timestamp (newest first)
 */
export function sortByTimestamp(events: unknown[]): unknown[] {
  return events.sort((a, b) => {
    const timestampA = extractTimestamp(a);
    const timestampB = extractTimestamp(b);

    // Sort newest first (descending order)
    return timestampB - timestampA;
  });
}
