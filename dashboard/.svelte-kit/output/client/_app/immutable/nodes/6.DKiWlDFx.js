import "../chunks/CWj6FrbW.js";
import "../chunks/ccz7yLnK.js";
import { o as E } from "../chunks/DPuvdnSQ.js";
import {
  X as F,
  Y as J,
  Z as K,
  _ as d,
  j as e,
  a2 as c,
  a3 as Q,
  a4 as U,
  a1 as r,
  a0 as t,
  a5 as p,
  y as u,
  a8 as A,
  a7 as a,
  $ as R,
  k as W,
  R as m,
} from "../chunks/B_egDBur.js";
import { h as ee, s as y } from "../chunks/CJZ1Yolx.js";
import { i as M } from "../chunks/Tibg1Olc.js";
import { e as ae, i as se } from "../chunks/Dj1GOHC4.js";
import { b as te, r as re } from "../chunks/BK3TWy4X.js";
import { i as ie } from "../chunks/DE006Bpo.js";
import { H as oe } from "../chunks/DrTcWPCV.js";
var ve = d(
    '<div class="card"><p>Discovering hubs across the network...</p></div>',
  ),
  ne = d(
    '<div class="hub-item svelte-923z82"><!> <div class="hub-meta svelte-923z82"><div class="meta-item svelte-923z82"><span class="meta-label svelte-923z82">Process ID:</span> <span class="meta-value svelte-923z82"> </span></div> <div class="meta-item svelte-923z82"><span class="meta-label svelte-923z82">Reputation:</span> <span class="meta-value svelte-923z82"> </span></div></div></div>',
  ),
  le = d(
    '<div class="empty-state svelte-923z82"><p>No hubs found matching your search criteria.</p></div>',
  ),
  ce = d(
    '<div class="card"><div class="hubs-header svelte-923z82"><h2> </h2> <div class="view-controls svelte-923z82"><button class="btn-small svelte-923z82">Grid View</button> <button class="btn-small svelte-923z82">List View</button></div></div> <div class="hubs-grid svelte-923z82"></div> <!></div>',
  ),
  de = d(
    '<div class="container"><div class="page-header svelte-923z82"><h1>Hub Discovery</h1> <p>Discover and connect to Permamind hubs across the network</p></div> <div class="search-section card svelte-923z82"><div class="search-controls svelte-923z82"><input type="text" placeholder="Search hubs by name or process ID..." class="search-input svelte-923z82"/> <button class="btn">Refresh Discovery</button></div></div> <!></div>',
  );
function ye(O, P) {
  F(P, !1);
  const o = u();
  let h = u([]),
    D = u(!0),
    v = u("");
  (E(async () => {
    setTimeout(() => {
      (p(h, [
        {
          id: "hub1",
          name: "Main Hub",
          status: "online",
          workflowCount: 15,
          lastActivity: new Date().toISOString(),
          processId: "main-hub-process-id-123",
          reputationScore: 0.92,
        },
        {
          id: "hub2",
          name: "Development Hub",
          status: "connecting",
          workflowCount: 8,
          lastActivity: new Date(Date.now() - 36e5).toISOString(),
          processId: "dev-hub-process-id-456",
          reputationScore: 0.78,
        },
        {
          id: "hub3",
          name: "Research Hub",
          status: "online",
          workflowCount: 23,
          lastActivity: new Date(Date.now() - 18e5).toISOString(),
          processId: "research-hub-process-id-789",
          reputationScore: 0.88,
        },
      ]),
        p(D, !1));
    }, 1e3);
  }),
    J(
      () => (e(h), e(v)),
      () => {
        p(
          o,
          e(h).filter(
            (s) =>
              s.name.toLowerCase().includes(e(v).toLowerCase()) ||
              s.processId.toLowerCase().includes(e(v).toLowerCase()),
          ),
        );
      },
    ),
    K(),
    ie());
  var b = de();
  ee((s) => {
    U.title = "Hubs - Permamind Dashboard";
  });
  var _ = r(t(b), 2),
    S = t(_),
    I = t(S);
  (re(I), A(2), a(S), a(_));
  var T = r(_, 2);
  {
    var V = (s) => {
        var n = ve();
        c(s, n);
      },
      j = (s) => {
        var n = ce(),
          f = t(n),
          H = t(f),
          q = t(H);
        (a(H), A(2), a(f));
        var w = r(f, 2);
        (ae(
          w,
          5,
          () => e(o),
          se,
          (l, i) => {
            var z = ne(),
              k = t(z);
            oe(k, {
              get hub() {
                return e(i);
              },
            });
            var x = r(k, 2),
              g = t(x),
              C = r(t(g), 2),
              X = t(C);
            (a(C), a(g));
            var L = r(g, 2),
              $ = r(t(L), 2),
              Y = t($);
            (a($),
              a(L),
              a(x),
              a(z),
              R(
                (Z, B) => {
                  (y(X, `${Z ?? ""}...`), y(Y, `${B ?? ""}%`));
                },
                [
                  () => (e(i), m(() => e(i).processId.slice(0, 16))),
                  () => (e(i), m(() => Math.round(e(i).reputationScore * 100))),
                ],
                W,
              ),
              c(l, z));
          },
        ),
          a(w));
        var G = r(w, 2);
        {
          var N = (l) => {
            var i = le();
            c(l, i);
          };
          M(G, (l) => {
            (e(o), m(() => e(o).length === 0) && l(N));
          });
        }
        (a(n),
          R(() =>
            y(q, `Available Hubs (${(e(o), m(() => e(o).length) ?? "")})`),
          ),
          c(s, n));
      };
    M(T, (s) => {
      e(D) ? s(V) : s(j, !1);
    });
  }
  (a(b),
    te(
      I,
      () => e(v),
      (s) => p(v, s),
    ),
    c(O, b),
    Q());
}
export { ye as component };
