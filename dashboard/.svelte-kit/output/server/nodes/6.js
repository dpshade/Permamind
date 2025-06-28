export const index = 6;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import("../entries/pages/hubs/_page.svelte.js"))
    .default);
export const imports = [
  "_app/immutable/nodes/6.DKiWlDFx.js",
  "_app/immutable/chunks/CWj6FrbW.js",
  "_app/immutable/chunks/ccz7yLnK.js",
  "_app/immutable/chunks/B_egDBur.js",
  "_app/immutable/chunks/DPuvdnSQ.js",
  "_app/immutable/chunks/CJZ1Yolx.js",
  "_app/immutable/chunks/Tibg1Olc.js",
  "_app/immutable/chunks/Dj1GOHC4.js",
  "_app/immutable/chunks/BK3TWy4X.js",
  "_app/immutable/chunks/DE006Bpo.js",
  "_app/immutable/chunks/DrTcWPCV.js",
  "_app/immutable/chunks/DTq8wH66.js",
  "_app/immutable/chunks/D_fcaHYD.js",
];
export const stylesheets = [
  "_app/immutable/assets/HubCard.BdOv32Eu.css",
  "_app/immutable/assets/6.CB1el8eA.css",
];
export const fonts = [];
