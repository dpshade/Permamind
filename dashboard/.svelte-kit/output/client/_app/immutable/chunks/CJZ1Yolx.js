import {
  aJ as T,
  aK as m,
  aL as k,
  w as A,
  t as K,
  aM as $,
  aN as j,
  i as G,
  c as I,
  b as J,
  aO as Q,
  h as w,
  C as O,
  M as V,
  K as R,
  m as g,
  d as L,
  n as h,
  g as q,
  aP as S,
  aH as M,
  f as X,
  o as z,
  aG as U,
  aQ as Z,
  B as x,
  v as ee,
  aR as te,
  q as re,
  X as ae,
  N as ne,
  aw as ie,
  a3 as se,
} from "./B_egDBur.js";
const oe = ["touchstart", "touchmove"];
function ue(e) {
  return oe.includes(e);
}
let H = !1;
function fe() {
  H ||
    ((H = !0),
    document.addEventListener(
      "reset",
      (e) => {
        Promise.resolve().then(() => {
          var t;
          if (!e.defaultPrevented)
            for (const a of e.target.elements)
              (t = a.__on_r) == null || t.call(a);
        });
      },
      { capture: !0 },
    ));
}
function B(e) {
  var t = k,
    a = A;
  (T(null), m(null));
  try {
    return e();
  } finally {
    (T(t), m(a));
  }
}
function ve(e, t, a, n = a) {
  e.addEventListener(t, () => B(a));
  const i = e.__on_r;
  (i
    ? (e.__on_r = () => {
        (i(), n(!0));
      })
    : (e.__on_r = () => n(!0)),
    fe());
}
const le = new Set(),
  P = new Set();
function de(e, t, a, n = {}) {
  function i(r) {
    if ((n.capture || E.call(t, r), !r.cancelBubble))
      return B(() => (a == null ? void 0 : a.call(this, r)));
  }
  return (
    e.startsWith("pointer") || e.startsWith("touch") || e === "wheel"
      ? $(() => {
          t.addEventListener(e, i, n);
        })
      : t.addEventListener(e, i, n),
    i
  );
}
function pe(e, t, a, n, i) {
  var r = { capture: n, passive: i },
    f = de(e, t, a, r);
  (t === document.body ||
    t === window ||
    t === document ||
    t instanceof HTMLMediaElement) &&
    K(() => {
      t.removeEventListener(e, f, r);
    });
}
function E(e) {
  var C;
  var t = this,
    a = t.ownerDocument,
    n = e.type,
    i = ((C = e.composedPath) == null ? void 0 : C.call(e)) || [],
    r = i[0] || e.target,
    f = 0,
    v = e.__root;
  if (v) {
    var c = i.indexOf(v);
    if (c !== -1 && (t === document || t === window)) {
      e.__root = t;
      return;
    }
    var p = i.indexOf(t);
    if (p === -1) return;
    c <= p && (f = c);
  }
  if (((r = i[f] || e.target), r !== t)) {
    j(e, "currentTarget", {
      configurable: !0,
      get() {
        return r || a;
      },
    });
    var N = k,
      l = A;
    (T(null), m(null));
    try {
      for (var s, o = []; r !== null; ) {
        var d = r.assignedSlot || r.parentNode || r.host || null;
        try {
          var _ = r["__" + n];
          if (_ != null && (!r.disabled || e.target === r))
            if (G(_)) {
              var [Y, ...F] = _;
              Y.apply(r, [e, ...F]);
            } else _.call(r, e);
        } catch (b) {
          s ? o.push(b) : (s = b);
        }
        if (e.cancelBubble || d === t || d === null) break;
        r = d;
      }
      if (s) {
        for (let b of o)
          queueMicrotask(() => {
            throw b;
          });
        throw s;
      }
    } finally {
      ((e.__root = t), delete e.currentTarget, T(N), m(l));
    }
  }
}
let u;
function ce() {
  u = void 0;
}
function ye(e) {
  let t = null,
    a = w;
  var n;
  if (w) {
    for (
      t = h, u === void 0 && (u = q(document.head));
      u !== null && (u.nodeType !== O || u.data !== V);

    )
      u = R(u);
    u === null ? g(!1) : (u = L(R(u)));
  }
  w || (n = document.head.appendChild(I()));
  try {
    J(() => e(n), Q);
  } finally {
    a && (g(!0), (u = h), L(t));
  }
}
function ge(e, t) {
  var a = t == null ? "" : typeof t == "object" ? t + "" : t;
  a !== (e.__t ?? (e.__t = e.nodeValue)) &&
    ((e.__t = a), (e.nodeValue = a + ""));
}
function _e(e, t) {
  return W(e, t);
}
function we(e, t) {
  (S(), (t.intro = t.intro ?? !1));
  const a = t.target,
    n = w,
    i = h;
  try {
    for (var r = q(a); r && (r.nodeType !== O || r.data !== V); ) r = R(r);
    if (!r) throw M;
    (g(!0), L(r), X());
    const f = W(e, { ...t, anchor: r });
    if (h === null || h.nodeType !== O || h.data !== z) throw (U(), M);
    return (g(!1), f);
  } catch (f) {
    if (f === M) return (t.recover === !1 && Z(), S(), x(a), g(!1), _e(e, t));
    throw f;
  } finally {
    (g(n), L(i), ce());
  }
}
const y = new Map();
function W(
  e,
  { target: t, anchor: a, props: n = {}, events: i, context: r, intro: f = !0 },
) {
  S();
  var v = new Set(),
    c = (l) => {
      for (var s = 0; s < l.length; s++) {
        var o = l[s];
        if (!v.has(o)) {
          v.add(o);
          var d = ue(o);
          t.addEventListener(o, E, { passive: d });
          var _ = y.get(o);
          _ === void 0
            ? (document.addEventListener(o, E, { passive: d }), y.set(o, 1))
            : y.set(o, _ + 1);
        }
      }
    };
  (c(ee(le)), P.add(c));
  var p = void 0,
    N = te(() => {
      var l = a ?? t.appendChild(I());
      return (
        re(() => {
          if (r) {
            ae({});
            var s = ne;
            s.c = r;
          }
          (i && (n.$$events = i),
            w && ie(l, null),
            (p = e(l, n) || {}),
            w && (A.nodes_end = h),
            r && se());
        }),
        () => {
          var d;
          for (var s of v) {
            t.removeEventListener(s, E);
            var o = y.get(s);
            --o === 0
              ? (document.removeEventListener(s, E), y.delete(s))
              : y.set(s, o);
          }
          (P.delete(c),
            l !== a && ((d = l.parentNode) == null || d.removeChild(l)));
        }
      );
    });
  return (D.set(p, N), p);
}
let D = new WeakMap();
function Ee(e, t) {
  const a = D.get(e);
  return a ? (D.delete(e), a(t)) : Promise.resolve();
}
export {
  fe as a,
  we as b,
  pe as e,
  ye as h,
  ve as l,
  _e as m,
  ge as s,
  Ee as u,
};
