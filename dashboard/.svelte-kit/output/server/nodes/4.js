export const index = 4;
let component_cache;
export const component = async () =>
  (component_cache ??= (
    await import("../entries/pages/discovery/_page.svelte.js")
  ).default);
export const imports = [
  "_app/immutable/nodes/4.DTnaifgy.js",
  "_app/immutable/chunks/CWj6FrbW.js",
  "_app/immutable/chunks/ccz7yLnK.js",
  "_app/immutable/chunks/B_egDBur.js",
  "_app/immutable/chunks/DPuvdnSQ.js",
  "_app/immutable/chunks/CJZ1Yolx.js",
  "_app/immutable/chunks/Tibg1Olc.js",
  "_app/immutable/chunks/Dj1GOHC4.js",
  "_app/immutable/chunks/BK3TWy4X.js",
  "_app/immutable/chunks/C4O_mOtK.js",
  "_app/immutable/chunks/DE006Bpo.js",
];
export const stylesheets = ["_app/immutable/assets/4.hqj4H_6S.css"];
export const fonts = [];
