import {
  h as p,
  f as v,
  av as y,
  aw as h,
  t as g,
  n as b,
  g as x,
  ax as l,
  P as C,
  N as a,
  i as k,
  ay as m,
  aj as w,
  R as i,
  az as S,
  aA as j,
  aB as D,
  aC as E,
  aD as P,
  aE as z,
} from "./B_egDBur.js";
import { b as A, m as M, u as O } from "./CJZ1Yolx.js";
function R(e) {
  return (t, ...o) => {
    var u;
    var s = e(...o),
      n;
    if (p) ((n = b), v());
    else {
      var c = s.render().trim(),
        f = y(c);
      ((n = x(f)), t.before(n));
    }
    const r = (u = s.setup) == null ? void 0 : u.call(s, n);
    (h(n, n), typeof r == "function" && g(r));
  };
}
function d(e) {
  (a === null && l(),
    w && a.l !== null
      ? _(a).m.push(e)
      : C(() => {
          const t = i(e);
          if (typeof t == "function") return t;
        }));
}
function U(e) {
  (a === null && l(), d(() => () => i(e)));
}
function $(e, t, { bubbles: o = !1, cancelable: s = !1 } = {}) {
  return new CustomEvent(e, { detail: t, bubbles: o, cancelable: s });
}
function B() {
  const e = a;
  return (
    e === null && l(),
    (t, o, s) => {
      var c;
      const n = (c = e.s.$$events) == null ? void 0 : c[t];
      if (n) {
        const f = k(n) ? n.slice() : [n],
          r = $(t, o, s);
        for (const u of f) u.call(e.x, r);
        return !r.defaultPrevented;
      }
      return !0;
    }
  );
}
function N(e) {
  (a === null && l(), a.l === null && m(), _(a).b.push(e));
}
function T(e) {
  (a === null && l(), a.l === null && m(), _(a).a.push(e));
}
function _(e) {
  var t = e.l;
  return t.u ?? (t.u = { a: [], b: [], m: [] });
}
const G = Object.freeze(
  Object.defineProperty(
    {
      __proto__: null,
      afterUpdate: T,
      beforeUpdate: N,
      createEventDispatcher: B,
      createRawSnippet: R,
      flushSync: S,
      getAllContexts: j,
      getContext: D,
      hasContext: E,
      hydrate: A,
      mount: M,
      onDestroy: U,
      onMount: d,
      setContext: P,
      tick: z,
      unmount: O,
      untrack: i,
    },
    Symbol.toStringTag,
    { value: "Module" },
  ),
);
export { d as o, G as s };
