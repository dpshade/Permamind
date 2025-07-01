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
 * Create a VIP-01 compliant filter with validation
 */
export function createVIP01Filter(filter) {
    const vip01Filter = {};
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
export function isVIP01Filter(filter) {
    if (!filter || typeof filter !== "object") {
        return false;
    }
    const f = filter;
    // Check optional array fields
    if (f.ids &&
        (!Array.isArray(f.ids) || !f.ids.every((id) => typeof id === "string"))) {
        return false;
    }
    if (f.authors &&
        (!Array.isArray(f.authors) ||
            !f.authors.every((author) => typeof author === "string"))) {
        return false;
    }
    if (f.kinds &&
        (!Array.isArray(f.kinds) ||
            !f.kinds.every((kind) => typeof kind === "string"))) {
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
    if (f.limit &&
        (typeof f.limit !== "number" || f.limit < 1 || f.limit > 1000)) {
        return false;
    }
    return true;
}
/**
 * Convert legacy filter format to VIP-01 format
 */
export function legacyToVIP01Filter(legacyFilters) {
    const vip01Filter = {};
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
