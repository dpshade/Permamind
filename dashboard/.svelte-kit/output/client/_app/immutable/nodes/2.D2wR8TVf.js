import "../chunks/CWj6FrbW.js";
import "../chunks/ccz7yLnK.js";
import { o as V } from "../chunks/DPuvdnSQ.js";
import {
  X as C,
  _ as S,
  a0 as s,
  a7 as a,
  a8 as x,
  a1 as e,
  $ as N,
  k as q,
  R as y,
  T as m,
  a2 as A,
  a3 as I,
  Y as T,
  a5 as D,
  y as H,
  Z as X,
  j as u,
  a4 as Y,
  a9 as Z,
} from "../chunks/B_egDBur.js";
import { s as _, h as B } from "../chunks/CJZ1Yolx.js";
import { i as E } from "../chunks/Tibg1Olc.js";
import { e as F, i as G } from "../chunks/Dj1GOHC4.js";
import { i as O } from "../chunks/DE006Bpo.js";
import { H as J } from "../chunks/DrTcWPCV.js";
import { p as L } from "../chunks/D_fcaHYD.js";
import { s as K } from "../chunks/xejgUmmL.js";
var U = S(
  '<div class="stats-grid svelte-ei7vwc"><div class="stat-item svelte-ei7vwc"><div class="stat-value svelte-ei7vwc"> </div> <div class="stat-label svelte-ei7vwc">Total Hubs</div></div> <div class="stat-item svelte-ei7vwc"><div class="stat-value svelte-ei7vwc"> </div> <div class="stat-label svelte-ei7vwc">Total Workflows</div></div> <div class="stat-item svelte-ei7vwc"><div class="stat-value svelte-ei7vwc"> </div> <div class="stat-label svelte-ei7vwc">Active Workflows</div></div> <div class="stat-item svelte-ei7vwc"><div class="stat-value svelte-ei7vwc"> </div> <div class="stat-label svelte-ei7vwc">Avg Performance</div></div></div>',
);
function aa(W, p) {
  C(p, !1);
  let v = L(p, "stats", 8);
  O();
  var r = U(),
    t = s(r),
    l = s(t),
    n = s(l, !0);
  (a(l), x(2), a(t));
  var d = e(t, 2),
    k = s(d),
    h = s(k, !0);
  (a(k), x(2), a(d));
  var f = e(d, 2),
    i = s(f),
    w = s(i, !0);
  (a(i), x(2), a(f));
  var c = e(f, 2),
    o = s(c),
    b = s(o);
  (a(o),
    x(2),
    a(c),
    a(r),
    N(
      (g) => {
        (_(n, (m(v()), y(() => v().totalHubs))),
          _(h, (m(v()), y(() => v().totalWorkflows))),
          _(w, (m(v()), y(() => v().activeWorkflows))),
          _(b, `${g ?? ""}%`));
      },
      [() => (m(v()), y(() => Math.round(v().averagePerformance * 100)))],
      q,
    ),
    A(W, r),
    I());
}
var sa = S(
  '<div class="workflow-overview svelte-exjaz1"><div class="workflow-chart svelte-exjaz1"><div class="chart-container svelte-exjaz1"><div class="progress-ring svelte-exjaz1"><div class="progress-circle svelte-exjaz1"></div> <div class="progress-center svelte-exjaz1"><div class="percentage svelte-exjaz1"> </div> <div class="label svelte-exjaz1">Active</div></div></div></div></div> <div class="workflow-details svelte-exjaz1"><div class="workflow-stat svelte-exjaz1"><span class="status-indicator status-online"></span> <span class="stat-text svelte-exjaz1"> </span></div> <div class="workflow-stat svelte-exjaz1"><span class="status-indicator status-offline"></span> <span class="stat-text svelte-exjaz1"> </span></div> <div class="workflow-stat svelte-exjaz1"><span class="status-indicator" style="background: #f59e0b;"></span> <span class="stat-text svelte-exjaz1"> </span></div></div></div>',
);
function ta(W, p) {
  C(p, !1);
  const v = H(),
    r = H();
  let t = L(p, "networkStats", 8);
  (T(
    () => m(t()),
    () => {
      D(v, Math.round((t().activeWorkflows / t().totalWorkflows) * 100));
    },
  ),
    T(
      () => m(t()),
      () => {
        D(r, t().totalWorkflows - t().activeWorkflows);
      },
    ),
    X(),
    O());
  var l = sa(),
    n = s(l),
    d = s(n),
    k = s(d),
    h = s(k),
    f = e(h, 2),
    i = s(f),
    w = s(i);
  (a(i), x(2), a(f), a(k), a(d), a(n));
  var c = e(n, 2),
    o = s(c),
    b = e(s(o), 2),
    g = s(b);
  (a(b), a(o));
  var j = e(o, 2),
    z = e(s(j), 2),
    P = s(z);
  (a(z), a(j));
  var M = e(j, 2),
    $ = e(s(M), 2),
    Q = s($);
  (a($),
    a(M),
    a(c),
    a(l),
    N(
      (R) => {
        (K(h, `--percentage: ${u(v) ?? ""}%`),
          _(w, `${u(v) ?? ""}%`),
          _(g, `Active: ${(m(t()), y(() => t().activeWorkflows) ?? "")}`),
          _(P, `Inactive: ${u(r) ?? ""}`),
          _(Q, `Performance: ${R ?? ""}%`));
      },
      [() => (m(t()), y(() => Math.round(t().averagePerformance * 100)))],
      q,
    ),
    A(W, l),
    I());
}
var ea = S('<div class="card"><p>Loading dashboard data...</p></div>'),
  va = S(
    '<div class="grid grid-2"><div class="card"><h2>Network Overview</h2> <!></div> <div class="card"><h2>Workflow Status</h2> <!></div></div> <div class="card"><h2>Connected Hubs</h2> <div class="grid grid-3"></div></div> <div class="card"><h2>Quick Actions</h2> <div class="grid grid-3"><button class="btn">Discover Workflows</button> <button class="btn">Create Workflow</button> <button class="btn">View Analytics</button></div></div>',
    1,
  ),
  ia = S(
    '<div class="layout"><nav class="sidebar"><h2>Permamind</h2> <a href="/" class="nav-link active">Dashboard</a> <a href="/hubs" class="nav-link">Hubs</a> <a href="/workflows" class="nav-link">Workflows</a> <a href="/discovery" class="nav-link">Discovery</a> <a href="/docs" class="nav-link">Documentation</a> <a href="/analytics" class="nav-link">Analytics</a></nav> <main class="main-content"><div class="container"><h1>Permamind Hub Dashboard</h1> <p>Monitor and manage your decentralized AI memory ecosystem</p> <!></div></main></div>',
  );
function pa(W, p) {
  C(p, !1);
  let v = H([]),
    r = H({}),
    t = H(!0);
  (V(async () => {
    setTimeout(() => {
      (D(v, [
        {
          id: "hub1",
          name: "Main Hub",
          status: "online",
          workflowCount: 15,
          lastActivity: new Date().toISOString(),
        },
        {
          id: "hub2",
          name: "Development Hub",
          status: "connecting",
          workflowCount: 8,
          lastActivity: new Date(Date.now() - 36e5).toISOString(),
        },
      ]),
        D(r, {
          totalHubs: 2,
          totalWorkflows: 23,
          activeWorkflows: 18,
          averagePerformance: 0.87,
        }),
        D(t, !1));
    }, 1e3);
  }),
    O());
  var l = ia();
  B((i) => {
    Y.title = "Permamind Dashboard";
  });
  var n = e(s(l), 2),
    d = s(n),
    k = e(s(d), 4);
  {
    var h = (i) => {
        var w = ea();
        A(i, w);
      },
      f = (i) => {
        var w = va(),
          c = Z(w),
          o = s(c),
          b = e(s(o), 2);
        (aa(b, {
          get stats() {
            return u(r);
          },
        }),
          a(o));
        var g = e(o, 2),
          j = e(s(g), 2);
        (ta(j, {
          get networkStats() {
            return u(r);
          },
        }),
          a(g),
          a(c));
        var z = e(c, 2),
          P = e(s(z), 2);
        (F(
          P,
          5,
          () => u(v),
          G,
          (M, $) => {
            J(M, {
              get hub() {
                return u($);
              },
            });
          },
        ),
          a(P),
          a(z),
          x(2),
          A(i, w));
      };
    E(k, (i) => {
      u(t) ? i(h) : i(f, !1);
    });
  }
  (a(d), a(n), a(l), A(W, l), I());
}
export { pa as component };
