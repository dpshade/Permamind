import "./CWj6FrbW.js";
import "./ccz7yLnK.js";
import {
  X as H,
  _ as L,
  a0 as a,
  a7 as t,
  a1 as e,
  a8 as q,
  $ as R,
  k as S,
  R as l,
  T as r,
  a2 as T,
  a3 as V,
} from "./B_egDBur.js";
import { s as v } from "./CJZ1Yolx.js";
import { s as W } from "./DTq8wH66.js";
import { i as X } from "./DE006Bpo.js";
import { p as j } from "./D_fcaHYD.js";
var z = L(
  '<div class="hub-card svelte-1aews4h"><div class="hub-header svelte-1aews4h"><h3 class="svelte-1aews4h"> </h3> <div class="hub-status svelte-1aews4h"><span></span> </div></div> <div class="hub-details svelte-1aews4h"><div class="detail-item svelte-1aews4h"><span class="label svelte-1aews4h">Workflows:</span> <span class="value svelte-1aews4h"> </span></div> <div class="detail-item svelte-1aews4h"><span class="label svelte-1aews4h">Last Activity:</span> <span class="value svelte-1aews4h"> </span></div></div> <div class="hub-actions svelte-1aews4h"><button class="btn-small svelte-1aews4h">View Details</button> <button class="btn-small svelte-1aews4h">Connect</button></div></div>',
);
function O(x, f) {
  H(f, !1);
  let s = j(f, "hub", 8);
  function M(i) {
    switch (i) {
      case "online":
        return "status-online";
      case "offline":
        return "status-offline";
      case "connecting":
        return "status-connecting";
      default:
        return "status-offline";
    }
  }
  function k(i) {
    const h = new Date(i),
      D = new Date() - h,
      n = Math.floor(D / 6e4);
    return n < 60
      ? `${n}m ago`
      : n < 1440
        ? `${Math.floor(n / 60)}h ago`
        : `${Math.floor(n / 1440)}d ago`;
  }
  X();
  var o = z(),
    u = a(o),
    c = a(u),
    C = a(c, !0);
  t(c);
  var p = e(c, 2),
    w = a(p),
    $ = e(w);
  (t(p), t(u));
  var m = e(u, 2),
    d = a(m),
    _ = e(a(d), 2),
    y = a(_, !0);
  (t(_), t(d));
  var b = e(d, 2),
    g = e(a(b), 2),
    A = a(g, !0);
  (t(g),
    t(b),
    t(m),
    q(2),
    t(o),
    R(
      (i, h) => {
        (v(C, (r(s()), l(() => s().name))),
          W(w, 1, `status-indicator ${i ?? ""}`, "svelte-1aews4h"),
          v($, ` ${(r(s()), l(() => s().status) ?? "")}`),
          v(y, (r(s()), l(() => s().workflowCount))),
          v(A, h));
      },
      [
        () => (r(s()), l(() => M(s().status))),
        () => (r(s()), l(() => k(s().lastActivity))),
      ],
      S,
    ),
    T(x, o),
    V());
}
export { O as H };
