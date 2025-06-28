import "../chunks/CWj6FrbW.js";
import "../chunks/ccz7yLnK.js";
import { o as Gt } from "../chunks/DPuvdnSQ.js";
import {
  X as Ht,
  Y as Jt,
  Z as Kt,
  _ as d,
  $ as y,
  a0 as a,
  a1 as l,
  j as t,
  a2 as c,
  a3 as Qt,
  a4 as Ut,
  a5 as g,
  y as k,
  a7 as e,
  a6 as gt,
  a8 as tt,
  R as n,
  k as te,
} from "../chunks/B_egDBur.js";
import { h as ee, s as v } from "../chunks/CJZ1Yolx.js";
import { i as kt } from "../chunks/Tibg1Olc.js";
import { e as xt, i as St } from "../chunks/Dj1GOHC4.js";
import { b as ae, r as se } from "../chunks/BK3TWy4X.js";
import { s as yt } from "../chunks/DTq8wH66.js";
import { s as le } from "../chunks/xejgUmmL.js";
import { b as $t } from "../chunks/C4O_mOtK.js";
import { i as ie } from "../chunks/DE006Bpo.js";
var ne = d('<div class="card"><p>Loading workflows...</p></div>'),
  ve = d(
    '<div class="card empty-state svelte-lkt6tt"><p>No workflows found matching your criteria.</p></div>',
  ),
  re = d('<span class="capability-tag svelte-lkt6tt"> </span>'),
  oe = d(
    '<tr class="workflow-row svelte-lkt6tt"><td class="workflow-info svelte-lkt6tt"><div class="workflow-name svelte-lkt6tt"> </div> <div class="workflow-meta svelte-lkt6tt"><span class="workflow-id svelte-lkt6tt"> </span> <span class="workflow-version svelte-lkt6tt"> </span></div> <div class="capabilities svelte-lkt6tt"></div></td><td class="svelte-lkt6tt"><div class="status-cell svelte-lkt6tt"><span></span> <span class="status-text svelte-lkt6tt"> </span></div></td><td class="svelte-lkt6tt"><span> </span></td><td class="svelte-lkt6tt"><div class="performance-cell svelte-lkt6tt"><div class="performance-bar svelte-lkt6tt"><div class="performance-fill svelte-lkt6tt"></div></div> <span class="performance-value svelte-lkt6tt"> </span></div></td><td class="svelte-lkt6tt"><span class="success-rate svelte-lkt6tt"> </span></td><td class="svelte-lkt6tt"><span class="last-executed svelte-lkt6tt"> </span> <div class="execution-time svelte-lkt6tt"> </div></td><td class="svelte-lkt6tt"><div class="workflow-actions svelte-lkt6tt"><button class="btn-small svelte-lkt6tt">View</button> <button class="btn-small svelte-lkt6tt">Edit</button> <button class="btn-small svelte-lkt6tt">Run</button></div></td></tr>',
  ),
  ce = d(
    '<div class="workflows-table card svelte-lkt6tt"><table class="svelte-lkt6tt"><thead><tr><th class="svelte-lkt6tt">Workflow</th><th class="svelte-lkt6tt">Status</th><th class="svelte-lkt6tt">Stage</th><th class="svelte-lkt6tt">Performance</th><th class="svelte-lkt6tt">Success Rate</th><th class="svelte-lkt6tt">Last Executed</th><th class="svelte-lkt6tt">Actions</th></tr></thead><tbody></tbody></table></div>',
  ),
  de = d(
    '<div class="workflows-section"><div class="section-header svelte-lkt6tt"><h2> </h2> <div class="view-controls svelte-lkt6tt"><button class="btn-small svelte-lkt6tt">Table View</button> <button class="btn-small svelte-lkt6tt">Card View</button></div></div> <!></div>',
  ),
  ue = d(
    '<div class="container"><div class="page-header svelte-lkt6tt"><h1>Workflow Management</h1> <p>Monitor and manage your AI workflows and their performance</p></div> <div class="controls card svelte-lkt6tt"><div class="search-section svelte-lkt6tt"><input type="text" placeholder="Search workflows by name, ID, or capability..." class="search-input svelte-lkt6tt"/></div> <div class="filter-section svelte-lkt6tt"><div class="filter-group svelte-lkt6tt"><label class="svelte-lkt6tt">Status:</label> <select class="filter-select svelte-lkt6tt"><option>All Status</option><option>Active</option><option>Enhancing</option><option>Inactive</option></select></div> <div class="filter-group svelte-lkt6tt"><label class="svelte-lkt6tt">Stage:</label> <select class="filter-select svelte-lkt6tt"><option>All Stages</option><option>Planning</option><option>Execution</option><option>Evaluation</option><option>Optimization</option><option>Archived</option></select></div></div> <div class="actions svelte-lkt6tt"><button class="btn">Create Workflow</button> <button class="btn">Import Workflow</button></div></div> <!></div>',
  );
function Me(Mt, Et) {
  Ht(Et, !1);
  const u = k();
  let $ = k([]),
    et = k(!0),
    p = k(""),
    _ = k("all"),
    m = k("all");
  Gt(async () => {
    setTimeout(() => {
      (g($, [
        {
          id: "wf-001",
          name: "Data Processing Pipeline",
          stage: "execution",
          status: "active",
          performance: 0.87,
          lastExecuted: new Date().toISOString(),
          executionTime: 2340,
          successRate: 0.94,
          version: "2.1.0",
          capabilities: ["data-processing", "real-time", "scalable"],
          dependencies: [],
        },
        {
          id: "wf-002",
          name: "ML Model Training",
          stage: "optimization",
          status: "enhancing",
          performance: 0.72,
          lastExecuted: new Date(Date.now() - 72e5).toISOString(),
          executionTime: 45e3,
          successRate: 0.89,
          version: "1.3.2",
          capabilities: ["machine-learning", "training", "optimization"],
          dependencies: ["wf-001"],
        },
        {
          id: "wf-003",
          name: "API Integration",
          stage: "planning",
          status: "inactive",
          performance: 0,
          lastExecuted: null,
          executionTime: 0,
          successRate: 0,
          version: "1.0.0",
          capabilities: ["api-integration", "webhooks"],
          dependencies: [],
        },
      ]),
        g(et, !1));
    }, 1e3);
  });
  function Lt(s) {
    switch (s) {
      case "active":
        return "status-online";
      case "enhancing":
        return "status-connecting";
      case "inactive":
        return "status-offline";
      default:
        return "status-offline";
    }
  }
  function Tt(s) {
    return s === 0
      ? "N/A"
      : s < 1e3
        ? `${s}ms`
        : s < 6e4
          ? `${(s / 1e3).toFixed(1)}s`
          : `${(s / 6e4).toFixed(1)}m`;
  }
  function At(s) {
    if (!s) return "Never";
    const r = new Date(s),
      h = new Date() - r,
      o = Math.floor(h / 6e4);
    return o < 60
      ? `${o}m ago`
      : o < 1440
        ? `${Math.floor(o / 60)}h ago`
        : `${Math.floor(o / 1440)}d ago`;
  }
  (Jt(
    () => (t($), t(p), t(_), t(m)),
    () => {
      g(
        u,
        t($).filter((s) => {
          const r =
              s.name.toLowerCase().includes(t(p).toLowerCase()) ||
              s.id.toLowerCase().includes(t(p).toLowerCase()) ||
              s.capabilities.some((o) => o.includes(t(p).toLowerCase())),
            f = t(_) === "all" || s.status === t(_),
            h = t(m) === "all" || s.stage === t(m);
          return r && f && h;
        }),
      );
    },
  ),
    Kt(),
    ie());
  var M = ue();
  ee((s) => {
    Ut.title = "Workflows - Permamind Dashboard";
  });
  var E = l(a(M), 2),
    L = a(E),
    at = a(L);
  (se(at), e(L));
  var st = l(L, 2),
    T = a(st),
    A = l(a(T), 2);
  y(() => {
    (t(_), gt(() => {}));
  });
  var C = a(A);
  C.value = C.__value = "all";
  var D = l(C);
  D.value = D.__value = "active";
  var I = l(D);
  I.value = I.__value = "enhancing";
  var lt = l(I);
  ((lt.value = lt.__value = "inactive"), e(A), e(T));
  var it = l(T, 2),
    R = l(a(it), 2);
  y(() => {
    (t(m), gt(() => {}));
  });
  var W = a(R);
  W.value = W.__value = "all";
  var P = l(W);
  P.value = P.__value = "planning";
  var z = l(P);
  z.value = z.__value = "execution";
  var N = l(z);
  N.value = N.__value = "evaluation";
  var O = l(N);
  O.value = O.__value = "optimization";
  var nt = l(O);
  ((nt.value = nt.__value = "archived"), e(R), e(it), e(st), tt(2), e(E));
  var Ct = l(E, 2);
  {
    var Dt = (s) => {
        var r = ne();
        c(s, r);
      },
      It = (s) => {
        var r = de(),
          f = a(r),
          h = a(f),
          o = a(h);
        (e(h), tt(2), e(f));
        var Rt = l(f, 2);
        {
          var Wt = (b) => {
              var x = ve();
              c(b, x);
            },
            Pt = (b) => {
              var x = ce(),
                vt = a(x),
                rt = l(a(vt));
              (xt(
                rt,
                5,
                () => t(u),
                St,
                (zt, i) => {
                  var V = oe(),
                    F = a(V),
                    j = a(F),
                    Nt = a(j, !0);
                  e(j);
                  var q = l(j, 2),
                    w = a(q),
                    Ot = a(w, !0);
                  e(w);
                  var ot = l(w, 2),
                    Vt = a(ot);
                  (e(ot), e(q));
                  var ct = l(q, 2);
                  (xt(
                    ct,
                    5,
                    () => (t(i), n(() => t(i).capabilities)),
                    St,
                    (K, Q) => {
                      var S = re(),
                        U = a(S, !0);
                      (e(S), y(() => v(U, t(Q))), c(K, S));
                    },
                  ),
                    e(ct),
                    e(F));
                  var X = l(F),
                    dt = a(X),
                    ut = a(dt),
                    pt = l(ut, 2),
                    Ft = a(pt, !0);
                  (e(pt), e(dt), e(X));
                  var Y = l(X),
                    Z = a(Y),
                    jt = a(Z, !0);
                  (e(Z), e(Y));
                  var B = l(Y),
                    _t = a(B),
                    G = a(_t),
                    qt = a(G);
                  e(G);
                  var mt = l(G, 2),
                    wt = a(mt);
                  (e(mt), e(_t), e(B));
                  var H = l(B),
                    ft = a(H),
                    Xt = a(ft);
                  (e(ft), e(H));
                  var ht = l(H),
                    J = a(ht),
                    Yt = a(J, !0);
                  e(J);
                  var bt = l(J, 2),
                    Zt = a(bt);
                  (e(bt),
                    e(ht),
                    tt(),
                    e(V),
                    y(
                      (K, Q, S, U, Bt) => {
                        (v(Nt, (t(i), n(() => t(i).name))),
                          v(Ot, (t(i), n(() => t(i).id))),
                          v(Vt, `v${(t(i), n(() => t(i).version) ?? "")}`),
                          yt(
                            ut,
                            1,
                            `status-indicator ${K ?? ""}`,
                            "svelte-lkt6tt",
                          ),
                          v(Ft, (t(i), n(() => t(i).status))),
                          yt(
                            Z,
                            1,
                            `stage-badge stage-${(t(i), n(() => t(i).stage) ?? "")}`,
                            "svelte-lkt6tt",
                          ),
                          v(jt, (t(i), n(() => t(i).stage))),
                          le(
                            qt,
                            `width: ${(t(i), n(() => t(i).performance * 100) ?? "")}%`,
                          ),
                          v(wt, `${Q ?? ""}%`),
                          v(Xt, `${S ?? ""}%`),
                          v(Yt, U),
                          v(Zt, `(${Bt ?? ""})`));
                      },
                      [
                        () => (t(i), n(() => Lt(t(i).status))),
                        () => (
                          t(i),
                          n(() => Math.round(t(i).performance * 100))
                        ),
                        () => (
                          t(i),
                          n(() => Math.round(t(i).successRate * 100))
                        ),
                        () => (t(i), n(() => At(t(i).lastExecuted))),
                        () => (t(i), n(() => Tt(t(i).executionTime))),
                      ],
                      te,
                    ),
                    c(zt, V));
                },
              ),
                e(rt),
                e(vt),
                e(x),
                c(b, x));
            };
          kt(Rt, (b) => {
            (t(u), n(() => t(u).length === 0) ? b(Wt) : b(Pt, !1));
          });
        }
        (e(r),
          y(() => v(o, `Workflows (${(t(u), n(() => t(u).length) ?? "")})`)),
          c(s, r));
      };
    kt(Ct, (s) => {
      t(et) ? s(Dt) : s(It, !1);
    });
  }
  (e(M),
    ae(
      at,
      () => t(p),
      (s) => g(p, s),
    ),
    $t(
      A,
      () => t(_),
      (s) => g(_, s),
    ),
    $t(
      R,
      () => t(m),
      (s) => g(m, s),
    ),
    c(Mt, M),
    Qt());
}
export { Me as component };
