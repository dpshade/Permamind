export const index = 2;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import("../entries/pages/_page.svelte.js"))
    .default);
export const imports = [
  "_app/immutable/nodes/2.D2wR8TVf.js",
  "_app/immutable/chunks/CWj6FrbW.js",
  "_app/immutable/chunks/ccz7yLnK.js",
  "_app/immutable/chunks/B_egDBur.js",
  "_app/immutable/chunks/DPuvdnSQ.js",
  "_app/immutable/chunks/CJZ1Yolx.js",
  "_app/immutable/chunks/Tibg1Olc.js",
  "_app/immutable/chunks/Dj1GOHC4.js",
  "_app/immutable/chunks/DE006Bpo.js",
  "_app/immutable/chunks/DrTcWPCV.js",
  "_app/immutable/chunks/DTq8wH66.js",
  "_app/immutable/chunks/D_fcaHYD.js",
  "_app/immutable/chunks/xejgUmmL.js",
];
export const stylesheets = [];
export const fonts = [];
