import "../chunks/CWj6FrbW.js";
import "../chunks/ccz7yLnK.js";
import { o as Oe } from "../chunks/DPuvdnSQ.js";
import {
  X as Le,
  _ as w,
  $ as _,
  a0 as a,
  a1 as t,
  j as s,
  a2 as g,
  a3 as Be,
  a4 as je,
  k as q,
  y as x,
  a5 as p,
  a6 as Ge,
  a7 as e,
  a8 as S,
} from "../chunks/B_egDBur.js";
import { h as Qe, e as fe, s as r } from "../chunks/CJZ1Yolx.js";
import { i as Z } from "../chunks/Tibg1Olc.js";
import { e as ee, i as ae } from "../chunks/Dj1GOHC4.js";
import { b as Ve, s as Xe, r as Fe } from "../chunks/BK3TWy4X.js";
import { b as Je } from "../chunks/C4O_mOtK.js";
import { i as Ke } from "../chunks/DE006Bpo.js";
var Ye = w(
    '<div class="network-overview card svelte-ir4kok"><h2 class="svelte-ir4kok">Network Overview</h2> <div class="stats-row svelte-ir4kok"><div class="stat-item svelte-ir4kok"><div class="stat-value svelte-ir4kok"> </div> <div class="stat-label svelte-ir4kok">Connected Hubs</div></div> <div class="stat-item svelte-ir4kok"><div class="stat-value svelte-ir4kok"> </div> <div class="stat-label svelte-ir4kok">Available Workflows</div></div> <div class="stat-item svelte-ir4kok"><div class="stat-value svelte-ir4kok"> </div> <div class="stat-label svelte-ir4kok">Active Connections</div></div> <div class="stat-item svelte-ir4kok"><div class="stat-value svelte-ir4kok"> </div> <div class="stat-label svelte-ir4kok">Network Health</div></div></div></div>',
  ),
  Ze = w(
    '<div class="loading-state svelte-ir4kok"><p class="svelte-ir4kok"> </p> <div class="progress-bar svelte-ir4kok"><div class="progress-fill svelte-ir4kok"></div></div></div>',
  ),
  ea = w('<span class="capability-tag svelte-ir4kok"> </span>'),
  aa = w(
    '<div class="result-card svelte-ir4kok"><div class="result-header svelte-ir4kok"><h4 class="svelte-ir4kok"> </h4> <div class="result-scores svelte-ir4kok"><div class="score-item svelte-ir4kok"><span class="score-label svelte-ir4kok">Performance</span> <span class="score-value performance-score svelte-ir4kok"> </span></div> <div class="score-item svelte-ir4kok"><span class="score-label svelte-ir4kok">Reputation</span> <span class="score-value reputation-score svelte-ir4kok"> </span></div></div></div> <div class="result-description svelte-ir4kok"> </div> <div class="result-capabilities svelte-ir4kok"></div> <div class="result-meta svelte-ir4kok"><div class="meta-row svelte-ir4kok"><span class="meta-label svelte-ir4kok">Hub ID:</span> <span class="meta-value svelte-ir4kok"> </span></div> <div class="meta-row svelte-ir4kok"><span class="meta-label svelte-ir4kok">Usage:</span> <span class="meta-value svelte-ir4kok"> </span></div> <div class="meta-row svelte-ir4kok"><span class="meta-label svelte-ir4kok">Enhancements:</span> <span class="meta-value svelte-ir4kok"> </span></div> <div class="meta-row svelte-ir4kok"><span class="meta-label svelte-ir4kok">Updated:</span> <span class="meta-value svelte-ir4kok"> </span></div></div> <div class="result-actions svelte-ir4kok"><button class="btn-small svelte-ir4kok">View Details</button> <button class="btn-small svelte-ir4kok">Request Patterns</button> <button class="btn-small svelte-ir4kok">Create Similar</button></div></div>',
  ),
  ta = w(
    '<div class="results-section svelte-ir4kok"><div class="results-header svelte-ir4kok"><h3 class="svelte-ir4kok"> </h3> <div class="sort-controls svelte-ir4kok"><select class="sort-select svelte-ir4kok"><option class="svelte-ir4kok">Sort by Performance</option><option class="svelte-ir4kok">Sort by Reputation</option><option class="svelte-ir4kok">Sort by Usage</option><option class="svelte-ir4kok">Sort by Recent</option></select></div></div> <div class="results-grid svelte-ir4kok"></div></div>',
  ),
  sa = w(
    '<div class="capability-item svelte-ir4kok"><div class="capability-header svelte-ir4kok"><span class="capability-name svelte-ir4kok"> </span> <span class="trend-indicator svelte-ir4kok"> </span></div> <div class="capability-count svelte-ir4kok"> </div></div>',
  ),
  ia = w(
    '<div class="container svelte-ir4kok"><div class="page-header svelte-ir4kok"><h1 class="svelte-ir4kok">Cross-Hub Discovery</h1> <p class="svelte-ir4kok">Discover workflows and capabilities across the Permamind network</p></div> <!> <div class="discovery-section card svelte-ir4kok"><h2 class="svelte-ir4kok">Workflow Discovery</h2> <div class="discovery-controls svelte-ir4kok"><div class="discovery-type svelte-ir4kok"><label class="svelte-ir4kok">Discovery Type:</label> <select class="type-select svelte-ir4kok"><option class="svelte-ir4kok">Global Search</option><option class="svelte-ir4kok">By Capability</option><option class="svelte-ir4kok">By Requirements</option><option class="svelte-ir4kok">Similar Workflows</option></select></div> <div class="search-section svelte-ir4kok"><input type="text" class="search-input svelte-ir4kok"/> <button class="btn svelte-ir4kok"> </button></div></div> <!> <!></div> <div class="capabilities-section card svelte-ir4kok"><h2 class="svelte-ir4kok">Popular Capabilities</h2> <div class="capabilities-grid svelte-ir4kok"></div></div></div>',
  );
function ma(ge, we) {
  Le(we, !1);
  let D = x(""),
    b = x("search"),
    P = x([]),
    $ = x(!1),
    te = x([]),
    h = x(null);
  Oe(async () => {
    (ye(), xe());
  });
  async function ye() {
    setTimeout(() => {
      p(h, {
        totalHubs: 47,
        totalWorkflows: 312,
        topCapabilities: [
          "data-processing",
          "machine-learning",
          "api-integration",
          "text-analysis",
          "image-processing",
        ],
        networkHealthScore: 0.91,
        activeConnections: 156,
      });
    }, 500);
  }
  async function xe() {
    p(te, [
      { name: "data-processing", count: 67, trend: "up" },
      { name: "machine-learning", count: 45, trend: "up" },
      { name: "api-integration", count: 38, trend: "stable" },
      { name: "text-analysis", count: 29, trend: "up" },
      { name: "image-processing", count: 24, trend: "down" },
      { name: "real-time", count: 19, trend: "up" },
      { name: "automation", count: 16, trend: "stable" },
      { name: "optimization", count: 14, trend: "up" },
    ]);
  }
  async function Se() {
    s(D).trim() &&
      (p($, !0),
      setTimeout(() => {
        (p(P, [
          {
            id: "ext-wf-001",
            name: "Advanced ML Pipeline",
            hubId: "hub-alpha-123",
            capabilities: ["machine-learning", "optimization", "real-time"],
            performanceScore: 0.94,
            reputationScore: 0.89,
            description:
              "High-performance machine learning pipeline with automatic optimization",
            lastUpdated: new Date(Date.now() - 36e5).toISOString(),
            usage: 234,
            enhancements: 12,
          },
          {
            id: "ext-wf-002",
            name: "Data Processing Engine",
            hubId: "hub-beta-456",
            capabilities: ["data-processing", "scalable", "streaming"],
            performanceScore: 0.87,
            reputationScore: 0.92,
            description:
              "Scalable data processing engine for real-time streaming applications",
            lastUpdated: new Date(Date.now() - 72e5).toISOString(),
            usage: 156,
            enhancements: 8,
          },
          {
            id: "ext-wf-003",
            name: "NLP Text Analyzer",
            hubId: "hub-gamma-789",
            capabilities: ["text-analysis", "nlp", "classification"],
            performanceScore: 0.91,
            reputationScore: 0.85,
            description:
              "Advanced natural language processing with sentiment analysis",
            lastUpdated: new Date(Date.now() - 18e5).toISOString(),
            usage: 89,
            enhancements: 15,
          },
        ]),
          p($, !1));
      }, 1500));
  }
  function De(i) {
    const o = new Date(i),
      l = new Date() - o,
      n = Math.floor(l / 36e5);
    return n < 24 ? `${n}h ago` : `${Math.floor(n / 24)}d ago`;
  }
  function $e(i) {
    switch (i) {
      case "up":
        return "↗️";
      case "down":
        return "↘️";
      case "stable":
        return "→";
      default:
        return "";
    }
  }
  Ke();
  var A = ia();
  Qe((i) => {
    je.title = "Discovery - Permamind Dashboard";
  });
  var se = t(a(A), 2);
  {
    var He = (i) => {
      var o = Ye(),
        v = t(a(o), 2),
        l = a(v),
        n = a(l),
        y = a(n, !0);
      (e(n), S(2), e(l));
      var d = t(l, 2),
        u = a(d),
        m = a(u, !0);
      (e(u), S(2), e(d));
      var k = t(d, 2),
        f = a(k),
        R = a(f, !0);
      (e(f), S(2), e(k));
      var T = t(k, 2),
        c = a(T),
        H = a(c);
      (e(c),
        S(2),
        e(T),
        e(v),
        e(o),
        _(
          (C) => {
            (r(y, s(h).totalHubs),
              r(m, s(h).totalWorkflows),
              r(R, s(h).activeConnections),
              r(H, `${C ?? ""}%`));
          },
          [() => Math.round(s(h).networkHealthScore * 100)],
          q,
        ),
        g(i, o));
    };
    Z(se, (i) => {
      s(h) && i(He);
    });
  }
  var E = t(se, 2),
    W = t(a(E), 2),
    z = a(W),
    N = t(a(z), 2);
  _(() => {
    (s(b), Ge(() => {}));
  });
  var O = a(N);
  O.value = O.__value = "search";
  var L = t(O);
  L.value = L.__value = "capability";
  var B = t(L);
  B.value = B.__value = "requirements";
  var ie = t(B);
  ((ie.value = ie.__value = "similar"), e(N), e(z));
  var re = t(z, 2),
    M = a(re);
  Fe(M);
  var U = t(M, 2),
    Ce = a(U, !0);
  (e(U), e(re), e(W));
  var oe = t(W, 2);
  {
    var Ie = (i) => {
      var o = Ze(),
        v = a(o),
        l = a(v);
      (e(v),
        S(2),
        e(o),
        _(() => {
          var n;
          return r(
            l,
            `Searching across ${(((n = s(h)) == null ? void 0 : n.totalHubs) || 0) ?? ""} hubs...`,
          );
        }),
        g(i, o));
    };
    Z(oe, (i) => {
      s($) && i(Ie);
    });
  }
  var Pe = t(oe, 2);
  {
    var Me = (i) => {
      var o = ta(),
        v = a(o),
        l = a(v),
        n = a(l);
      e(l);
      var y = t(l, 2),
        d = a(y),
        u = a(d);
      u.value = u.__value = "performance";
      var m = t(u);
      m.value = m.__value = "reputation";
      var k = t(m);
      k.value = k.__value = "usage";
      var f = t(k);
      ((f.value = f.__value = "recent"), e(d), e(y), e(v));
      var R = t(v, 2);
      (ee(
        R,
        5,
        () => s(P),
        ae,
        (T, c) => {
          var H = aa(),
            C = a(H),
            j = a(C),
            Ue = a(j, !0);
          e(j);
          var ne = t(j, 2),
            G = a(ne),
            ce = t(a(G), 2),
            Re = a(ce);
          (e(ce), e(G));
          var de = t(G, 2),
            ke = t(a(de), 2),
            Te = a(ke);
          (e(ke), e(de), e(ne), e(C));
          var Q = t(C, 2),
            qe = a(Q, !0);
          e(Q);
          var V = t(Q, 2);
          (ee(
            V,
            5,
            () => s(c).capabilities,
            ae,
            (K, Y) => {
              var I = ea(),
                Ne = a(I, !0);
              (e(I), _(() => r(Ne, s(Y))), g(K, I));
            },
          ),
            e(V));
          var pe = t(V, 2),
            X = a(pe),
            ue = t(a(X), 2),
            Ae = a(ue, !0);
          (e(ue), e(X));
          var F = t(X, 2),
            me = t(a(F), 2),
            Ee = a(me);
          (e(me), e(F));
          var J = t(F, 2),
            _e = t(a(J), 2),
            We = a(_e);
          (e(_e), e(J));
          var be = t(J, 2),
            he = t(a(be), 2),
            ze = a(he, !0);
          (e(he),
            e(be),
            e(pe),
            S(2),
            e(H),
            _(
              (K, Y, I) => {
                (r(Ue, s(c).name),
                  r(Re, `${K ?? ""}%`),
                  r(Te, `${Y ?? ""}%`),
                  r(qe, s(c).description),
                  r(Ae, s(c).hubId),
                  r(Ee, `${s(c).usage ?? ""} executions`),
                  r(We, `${s(c).enhancements ?? ""} improvements`),
                  r(ze, I));
              },
              [
                () => Math.round(s(c).performanceScore * 100),
                () => Math.round(s(c).reputationScore * 100),
                () => De(s(c).lastUpdated),
              ],
              q,
            ),
            g(T, H));
        },
      ),
        e(R),
        e(o),
        _(() => r(n, `Discovery Results (${s(P).length ?? ""})`)),
        g(i, o));
    };
    Z(Pe, (i) => {
      s(P).length > 0 && i(Me);
    });
  }
  e(E);
  var ve = t(E, 2),
    le = t(a(ve), 2);
  (ee(
    le,
    5,
    () => s(te),
    ae,
    (i, o) => {
      var v = sa(),
        l = a(v),
        n = a(l),
        y = a(n, !0);
      e(n);
      var d = t(n, 2),
        u = a(d, !0);
      (e(d), e(l));
      var m = t(l, 2),
        k = a(m);
      (e(m),
        e(v),
        _(
          (f) => {
            (r(y, s(o).name), r(u, f), r(k, `${s(o).count ?? ""} workflows`));
          },
          [() => $e(s(o).trend)],
          q,
        ),
        fe("click", v, () => {
          (p(D, s(o).name), p(b, "capability"));
        }),
        g(i, v));
    },
  ),
    e(le),
    e(ve),
    e(A),
    _(
      (i) => {
        (Xe(
          M,
          "placeholder",
          s(b) === "capability"
            ? "Enter capability (e.g., machine-learning)"
            : s(b) === "requirements"
              ? "Enter requirements (comma-separated)"
              : s(b) === "similar"
                ? "Enter your workflow ID"
                : "Search workflows across the network...",
        ),
          (U.disabled = i),
          r(Ce, s($) ? "Searching..." : "Discover"));
      },
      [() => s($) || !s(D).trim()],
      q,
    ),
    Je(
      N,
      () => s(b),
      (i) => p(b, i),
    ),
    Ve(
      M,
      () => s(D),
      (i) => p(D, i),
    ),
    fe("click", U, Se),
    g(ge, A),
    Be());
}
export { ma as component };
