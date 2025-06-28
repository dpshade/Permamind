export const index = 0;
let component_cache;
export const component = async () =>
  (component_cache ??= (await import("../entries/pages/_layout.svelte.js"))
    .default);
export const imports = [
  "_app/immutable/nodes/0.EIOMYEFJ.js",
  "_app/immutable/chunks/CWj6FrbW.js",
  "_app/immutable/chunks/ccz7yLnK.js",
  "_app/immutable/chunks/B_egDBur.js",
];
export const stylesheets = ["_app/immutable/assets/0.CmA-Aoey.css"];
export const fonts = [];
