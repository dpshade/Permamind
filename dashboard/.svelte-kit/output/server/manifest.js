export const manifest = (() => {
  function __memo(fn) {
    let value;
    return () => (value ??= value = fn());
  }

  return {
    appDir: "_app",
    appPath: "_app",
    assets: new Set(["favicon.png"]),
    mimeTypes: { ".png": "image/png" },
    _: {
      client: {
        start: "_app/immutable/entry/start.BHYHRDBA.js",
        app: "_app/immutable/entry/app.Cvzm18k5.js",
        imports: [
          "_app/immutable/entry/start.BHYHRDBA.js",
          "_app/immutable/chunks/BS1TVJ1Q.js",
          "_app/immutable/chunks/DPuvdnSQ.js",
          "_app/immutable/chunks/B_egDBur.js",
          "_app/immutable/chunks/CJZ1Yolx.js",
          "_app/immutable/entry/app.Cvzm18k5.js",
          "_app/immutable/chunks/B_egDBur.js",
          "_app/immutable/chunks/CJZ1Yolx.js",
          "_app/immutable/chunks/CWj6FrbW.js",
          "_app/immutable/chunks/DPuvdnSQ.js",
          "_app/immutable/chunks/Tibg1Olc.js",
          "_app/immutable/chunks/D_fcaHYD.js",
        ],
        stylesheets: [],
        fonts: [],
        uses_env_dynamic_public: false,
      },
      nodes: [
        __memo(() => import("./nodes/0.js")),
        __memo(() => import("./nodes/1.js")),
        __memo(() => import("./nodes/2.js")),
        __memo(() => import("./nodes/3.js")),
        __memo(() => import("./nodes/4.js")),
        __memo(() => import("./nodes/5.js")),
        __memo(() => import("./nodes/6.js")),
        __memo(() => import("./nodes/7.js")),
      ],
      routes: [
        {
          id: "/",
          pattern: /^\/$/,
          params: [],
          page: { layouts: [0], errors: [1], leaf: 2 },
          endpoint: null,
        },
        {
          id: "/analytics",
          pattern: /^\/analytics\/?$/,
          params: [],
          page: { layouts: [0], errors: [1], leaf: 3 },
          endpoint: null,
        },
        {
          id: "/discovery",
          pattern: /^\/discovery\/?$/,
          params: [],
          page: { layouts: [0], errors: [1], leaf: 4 },
          endpoint: null,
        },
        {
          id: "/docs",
          pattern: /^\/docs\/?$/,
          params: [],
          page: { layouts: [0], errors: [1], leaf: 5 },
          endpoint: null,
        },
        {
          id: "/hubs",
          pattern: /^\/hubs\/?$/,
          params: [],
          page: { layouts: [0], errors: [1], leaf: 6 },
          endpoint: null,
        },
        {
          id: "/workflows",
          pattern: /^\/workflows\/?$/,
          params: [],
          page: { layouts: [0], errors: [1], leaf: 7 },
          endpoint: null,
        },
      ],
      prerendered_routes: new Set([]),
      matchers: async () => {
        return {};
      },
      server_assets: {},
    },
  };
})();
