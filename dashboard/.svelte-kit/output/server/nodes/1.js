export const index = 1;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import("../entries/fallbacks/error.svelte.js"))
    .default);
export const imports = [
  "_app/immutable/nodes/1.DQCF3nk0.js",
  "_app/immutable/chunks/CWj6FrbW.js",
  "_app/immutable/chunks/ccz7yLnK.js",
  "_app/immutable/chunks/B_egDBur.js",
  "_app/immutable/chunks/CJZ1Yolx.js",
  "_app/immutable/chunks/DE006Bpo.js",
  "_app/immutable/chunks/BS1TVJ1Q.js",
  "_app/immutable/chunks/DPuvdnSQ.js",
];
export const stylesheets = [];
export const fonts = [];
