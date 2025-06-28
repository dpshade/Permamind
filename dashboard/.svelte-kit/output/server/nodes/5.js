export const index = 5;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import("../entries/pages/docs/_page.svelte.js"))
    .default);
export const imports = [
  "_app/immutable/nodes/5.DiZwk8qx.js",
  "_app/immutable/chunks/CWj6FrbW.js",
  "_app/immutable/chunks/ccz7yLnK.js",
  "_app/immutable/chunks/B_egDBur.js",
  "_app/immutable/chunks/CJZ1Yolx.js",
  "_app/immutable/chunks/Tibg1Olc.js",
  "_app/immutable/chunks/Dj1GOHC4.js",
  "_app/immutable/chunks/DTq8wH66.js",
  "_app/immutable/chunks/DE006Bpo.js",
];
export const stylesheets = ["_app/immutable/assets/5.dZxRaO3N.css"];
export const fonts = [];
