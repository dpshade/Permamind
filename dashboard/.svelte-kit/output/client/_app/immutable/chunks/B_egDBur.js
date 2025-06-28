var Ee = Array.isArray,
  me = Array.prototype.indexOf,
  on = Array.from,
  _n = Object.defineProperty,
  J = Object.getOwnPropertyDescriptor,
  ge = Object.getOwnPropertyDescriptors,
  Te = Object.prototype,
  xe = Array.prototype,
  Bt = Object.getPrototypeOf,
  Mt = Object.isExtensible;
const cn = () => {};
function vn(t) {
  return t();
}
function Ut(t) {
  for (var e = 0; e < t.length; e++) t[e]();
}
const x = 2,
  Vt = 4,
  _t = 8,
  xt = 16,
  k = 32,
  $ = 64,
  At = 128,
  T = 256,
  ft = 512,
  A = 1024,
  P = 2048,
  F = 4096,
  V = 8192,
  bt = 16384,
  Gt = 32768,
  Kt = 65536,
  Ae = 1 << 17,
  qt = 1 << 18,
  be = 1 << 19,
  Wt = 1 << 20,
  Et = 1 << 21,
  L = Symbol("$state"),
  dn = Symbol("legacy props"),
  pn = Symbol(""),
  Dt = 3,
  $t = 8;
function Xt(t) {
  return t === this.v;
}
function De(t, e) {
  return t != t
    ? e == e
    : t !== e || (t !== null && typeof t == "object") || typeof t == "function";
}
function Zt(t) {
  return !De(t, this.v);
}
function Oe(t) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function Re() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Ie(t) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function Ne() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function hn() {
  throw new Error("https://svelte.dev/e/hydration_failed");
}
function yn(t) {
  throw new Error("https://svelte.dev/e/lifecycle_legacy_only");
}
function wn(t) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function ke() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Ce() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Se() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
let ct = !1;
function En() {
  ct = !0;
}
const mn = 1,
  gn = 2,
  Tn = 16,
  xn = 1,
  An = 2,
  bn = 4,
  Dn = 8,
  On = 16,
  Pe = 1,
  Fe = 2,
  Me = "[",
  qe = "[!",
  Le = "]",
  Ot = {},
  m = Symbol(),
  Rn = "http://www.w3.org/1999/xhtml";
function je(t) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
let p = null;
function Lt(t) {
  p = t;
}
function In(t) {
  return dt().get(t);
}
function Nn(t, e) {
  return (dt().set(t, e), e);
}
function kn(t) {
  return dt().has(t);
}
function Cn() {
  return dt();
}
function Sn(t, e = !1, n) {
  var r = (p = { p, c: null, d: !1, e: null, m: !1, s: t, x: null, l: null });
  (ct && !e && (p.l = { s: null, u: null, r1: [], r2: It(!1) }),
    Ge(() => {
      r.d = !0;
    }));
}
function Pn(t) {
  const e = p;
  if (e !== null) {
    const o = e.e;
    if (o !== null) {
      var n = d,
        r = c;
      e.e = null;
      try {
        for (var a = 0; a < o.length; a++) {
          var l = o[a];
          (ut(l.effect), W(l.reaction), le(l.fn));
        }
      } finally {
        (ut(n), W(r));
      }
    }
    ((p = e.p), (e.m = !0));
  }
  return {};
}
function vt() {
  return !ct || (p !== null && p.l === null);
}
function dt(t) {
  return (p === null && je(), p.c ?? (p.c = new Map(Ye(p) || void 0)));
}
function Ye(t) {
  let e = t.p;
  for (; e !== null; ) {
    const n = e.c;
    if (n !== null) return n;
    e = e.p;
  }
  return null;
}
function z(t) {
  if (typeof t != "object" || t === null || L in t) return t;
  const e = Bt(t);
  if (e !== Te && e !== xe) return t;
  var n = new Map(),
    r = Ee(t),
    a = C(0),
    l = c,
    o = (u) => {
      var s = c;
      W(l);
      var f = u();
      return (W(s), f);
    };
  return (
    r && n.set("length", C(t.length)),
    new Proxy(t, {
      defineProperty(u, s, f) {
        (!("value" in f) ||
          f.configurable === !1 ||
          f.enumerable === !1 ||
          f.writable === !1) &&
          ke();
        var v = n.get(s);
        return (
          v === void 0
            ? (v = o(() => {
                var i = C(f.value);
                return (n.set(s, i), i);
              }))
            : N(v, f.value, !0),
          !0
        );
      },
      deleteProperty(u, s) {
        var f = n.get(s);
        if (f === void 0) {
          if (s in u) {
            const _ = o(() => C(m));
            (n.set(s, _), wt(a));
          }
        } else {
          if (r && typeof s == "string") {
            var v = n.get("length"),
              i = Number(s);
            Number.isInteger(i) && i < v.v && N(v, i);
          }
          (N(f, m), wt(a));
        }
        return !0;
      },
      get(u, s, f) {
        var E;
        if (s === L) return t;
        var v = n.get(s),
          i = s in u;
        if (
          (v === void 0 &&
            (!i || ((E = J(u, s)) != null && E.writable)) &&
            ((v = o(() => {
              var R = z(i ? u[s] : m),
                ht = C(R);
              return ht;
            })),
            n.set(s, v)),
          v !== void 0)
        ) {
          var _ = U(v);
          return _ === m ? void 0 : _;
        }
        return Reflect.get(u, s, f);
      },
      getOwnPropertyDescriptor(u, s) {
        var f = Reflect.getOwnPropertyDescriptor(u, s);
        if (f && "value" in f) {
          var v = n.get(s);
          v && (f.value = U(v));
        } else if (f === void 0) {
          var i = n.get(s),
            _ = i == null ? void 0 : i.v;
          if (i !== void 0 && _ !== m)
            return { enumerable: !0, configurable: !0, value: _, writable: !0 };
        }
        return f;
      },
      has(u, s) {
        var _;
        if (s === L) return !0;
        var f = n.get(s),
          v = (f !== void 0 && f.v !== m) || Reflect.has(u, s);
        if (
          f !== void 0 ||
          (d !== null && (!v || ((_ = J(u, s)) != null && _.writable)))
        ) {
          f === void 0 &&
            ((f = o(() => {
              var E = v ? z(u[s]) : m,
                R = C(E);
              return R;
            })),
            n.set(s, f));
          var i = U(f);
          if (i === m) return !1;
        }
        return v;
      },
      set(u, s, f, v) {
        var Ft;
        var i = n.get(s),
          _ = s in u;
        if (r && s === "length")
          for (var E = f; E < i.v; E += 1) {
            var R = n.get(E + "");
            R !== void 0
              ? N(R, m)
              : E in u && ((R = o(() => C(m))), n.set(E + "", R));
          }
        if (i === void 0)
          (!_ || ((Ft = J(u, s)) != null && Ft.writable)) &&
            ((i = o(() => C(void 0))), N(i, z(f)), n.set(s, i));
        else {
          _ = i.v !== m;
          var ht = o(() => z(f));
          N(i, ht);
        }
        var st = Reflect.getOwnPropertyDescriptor(u, s);
        if ((st != null && st.set && st.set.call(v, f), !_)) {
          if (r && typeof s == "string") {
            var Pt = n.get("length"),
              yt = Number(s);
            Number.isInteger(yt) && yt >= Pt.v && N(Pt, yt + 1);
          }
          wt(a);
        }
        return !0;
      },
      ownKeys(u) {
        U(a);
        var s = Reflect.ownKeys(u).filter((i) => {
          var _ = n.get(i);
          return _ === void 0 || _.v !== m;
        });
        for (var [f, v] of n) v.v !== m && !(f in u) && s.push(f);
        return s;
      },
      setPrototypeOf() {
        Ce();
      },
    })
  );
}
function wt(t, e = 1) {
  N(t, t.v + e);
}
function jt(t) {
  try {
    if (t !== null && typeof t == "object" && L in t) return t[L];
  } catch {}
  return t;
}
function Fn(t, e) {
  return Object.is(jt(t), jt(e));
}
function Rt(t) {
  var e = x | P,
    n = c !== null && (c.f & x) !== 0 ? c : null;
  return (
    d === null || (n !== null && (n.f & T) !== 0) ? (e |= T) : (d.f |= Wt),
    {
      ctx: p,
      deps: null,
      effects: null,
      equals: Xt,
      f: e,
      fn: t,
      reactions: null,
      rv: 0,
      v: null,
      wv: 0,
      parent: n ?? d,
    }
  );
}
function Mn(t) {
  const e = Rt(t);
  return (de(e), e);
}
function qn(t) {
  const e = Rt(t);
  return ((e.equals = Zt), e);
}
function zt(t) {
  var e = t.effects;
  if (e !== null) {
    t.effects = null;
    for (var n = 0; n < e.length; n += 1) H(e[n]);
  }
}
function He(t) {
  for (var e = t.parent; e !== null; ) {
    if ((e.f & x) === 0) return e;
    e = e.parent;
  }
  return null;
}
function Jt(t) {
  var e,
    n = d;
  ut(He(t));
  try {
    (zt(t), (e = we(t)));
  } finally {
    ut(n);
  }
  return e;
}
function Qt(t) {
  var e = Jt(t);
  if ((t.equals(e) || ((t.v = e), (t.wv = he())), !Z)) {
    var n = (S || (t.f & T) !== 0) && t.deps !== null ? F : A;
    O(t, n);
  }
}
const tt = new Map();
function It(t, e) {
  var n = { f: 0, v: t, reactions: null, equals: Xt, rv: 0, wv: 0 };
  return n;
}
function C(t, e) {
  const n = It(t);
  return (de(n), n);
}
function Ln(t, e = !1, n = !0) {
  var a;
  const r = It(t);
  return (
    e || (r.equals = Zt),
    ct &&
      n &&
      p !== null &&
      p.l !== null &&
      ((a = p.l).s ?? (a.s = [])).push(r),
    r
  );
}
function N(t, e, n = !1) {
  c !== null &&
    (!I || (c.f & qt) !== 0) &&
    vt() &&
    (c.f & (x | xt | qt)) !== 0 &&
    !(h != null && h[1].includes(t) && h[0] === c) &&
    Se();
  let r = n ? z(e) : e;
  return mt(t, r);
}
function mt(t, e) {
  if (!t.equals(e)) {
    var n = t.v;
    (Z ? tt.set(t, e) : tt.set(t, n),
      (t.v = e),
      (t.f & x) !== 0 &&
        ((t.f & P) !== 0 && Jt(t), O(t, (t.f & T) === 0 ? A : F)),
      (t.wv = he()),
      te(t, P),
      vt() &&
        d !== null &&
        (d.f & A) !== 0 &&
        (d.f & (k | $)) === 0 &&
        (b === null ? tn([t]) : b.push(t)));
  }
  return e;
}
function te(t, e) {
  var n = t.reactions;
  if (n !== null)
    for (var r = vt(), a = n.length, l = 0; l < a; l++) {
      var o = n[l],
        u = o.f;
      (u & P) === 0 &&
        ((!r && o === d) ||
          (O(o, e), (u & (A | T)) !== 0 && ((u & x) !== 0 ? te(o, F) : Ct(o))));
    }
}
function Nt(t) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
function jn() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
let D = !1;
function Yn(t) {
  D = t;
}
let y;
function G(t) {
  if (t === null) throw (Nt(), Ot);
  return (y = t);
}
function Be() {
  return G(B(y));
}
function Hn(t) {
  if (D) {
    if (B(y) !== null) throw (Nt(), Ot);
    y = t;
  }
}
function Bn(t = 1) {
  if (D) {
    for (var e = t, n = y; e--; ) n = B(n);
    y = n;
  }
}
function Un() {
  for (var t = 0, e = y; ; ) {
    if (e.nodeType === $t) {
      var n = e.data;
      if (n === Le) {
        if (t === 0) return e;
        t -= 1;
      } else (n === Me || n === qe) && (t += 1);
    }
    var r = B(e);
    (e.remove(), (e = r));
  }
}
function Vn(t) {
  if (!t || t.nodeType !== $t) throw (Nt(), Ot);
  return t.data;
}
var Yt, Ue, ee, ne, re;
function Gn() {
  if (Yt === void 0) {
    ((Yt = window),
      (Ue = document),
      (ee = /Firefox/.test(navigator.userAgent)));
    var t = Element.prototype,
      e = Node.prototype,
      n = Text.prototype;
    ((ne = J(e, "firstChild").get),
      (re = J(e, "nextSibling").get),
      Mt(t) &&
        ((t.__click = void 0),
        (t.__className = void 0),
        (t.__attributes = null),
        (t.__style = void 0),
        (t.__e = void 0)),
      Mt(n) && (n.__t = void 0));
  }
}
function K(t = "") {
  return document.createTextNode(t);
}
function et(t) {
  return ne.call(t);
}
function B(t) {
  return re.call(t);
}
function Kn(t, e) {
  if (!D) return et(t);
  var n = et(y);
  if (n === null) n = y.appendChild(K());
  else if (e && n.nodeType !== Dt) {
    var r = K();
    return (n == null || n.before(r), G(r), r);
  }
  return (G(n), n);
}
function Wn(t, e) {
  if (!D) {
    var n = et(t);
    return n instanceof Comment && n.data === "" ? B(n) : n;
  }
  return y;
}
function $n(t, e = 1, n = !1) {
  let r = D ? y : t;
  for (var a; e--; ) ((a = r), (r = B(r)));
  if (!D) return r;
  if (n && (r == null ? void 0 : r.nodeType) !== Dt) {
    var l = K();
    return (r === null ? a == null || a.after(l) : r.before(l), G(l), l);
  }
  return (G(r), r);
}
function Xn(t) {
  t.textContent = "";
}
function ae(t) {
  (d === null && c === null && Ie(),
    c !== null && (c.f & T) !== 0 && d === null && Re(),
    Z && Oe());
}
function Ve(t, e) {
  var n = e.last;
  n === null
    ? (e.last = e.first = t)
    : ((n.next = t), (t.prev = n), (e.last = t));
}
function X(t, e, n, r = !0) {
  var a = d,
    l = {
      ctx: p,
      deps: null,
      nodes_start: null,
      nodes_end: null,
      f: t | P,
      first: null,
      fn: e,
      last: null,
      next: null,
      parent: a,
      prev: null,
      teardown: null,
      transitions: null,
      wv: 0,
    };
  if (n)
    try {
      (pt(l), (l.f |= Gt));
    } catch (s) {
      throw (H(l), s);
    }
  else e !== null && Ct(l);
  var o =
    n &&
    l.deps === null &&
    l.first === null &&
    l.nodes_start === null &&
    l.teardown === null &&
    (l.f & (Wt | At)) === 0;
  if (!o && r && (a !== null && Ve(l, a), c !== null && (c.f & x) !== 0)) {
    var u = c;
    (u.effects ?? (u.effects = [])).push(l);
  }
  return l;
}
function Ge(t) {
  const e = X(_t, null, !1);
  return (O(e, A), (e.teardown = t), e);
}
function Zn(t) {
  ae();
  var e = d !== null && (d.f & k) !== 0 && p !== null && !p.m;
  if (e) {
    var n = p;
    (n.e ?? (n.e = [])).push({ fn: t, effect: d, reaction: c });
  } else {
    var r = le(t);
    return r;
  }
}
function zn(t) {
  return (ae(), kt(t));
}
function Jn(t) {
  const e = X($, t, !0);
  return (n = {}) =>
    new Promise((r) => {
      n.outro
        ? Xe(e, () => {
            (H(e), r(void 0));
          })
        : (H(e), r(void 0));
    });
}
function le(t) {
  return X(Vt, t, !1);
}
function Qn(t, e) {
  var n = p,
    r = { effect: null, ran: !1 };
  (n.l.r1.push(r),
    (r.effect = kt(() => {
      (t(), !r.ran && ((r.ran = !0), N(n.l.r2, !0), St(e)));
    })));
}
function tr() {
  var t = p;
  kt(() => {
    if (U(t.l.r2)) {
      for (var e of t.l.r1) {
        var n = e.effect;
        ((n.f & A) !== 0 && O(n, F), lt(n) && pt(n), (e.ran = !1));
      }
      t.l.r2.v = !1;
    }
  });
}
function kt(t) {
  return X(_t, t, !0);
}
function er(t, e = [], n = Rt) {
  const r = e.map(n);
  return Ke(() => t(...r.map(U)));
}
function Ke(t, e = 0) {
  return X(_t | xt | e, t, !0);
}
function nr(t, e = !0) {
  return X(_t | k, t, !0, e);
}
function se(t) {
  var e = t.teardown;
  if (e !== null) {
    const n = Z,
      r = c;
    (Ht(!0), W(null));
    try {
      e.call(null);
    } finally {
      (Ht(n), W(r));
    }
  }
}
function fe(t, e = !1) {
  var n = t.first;
  for (t.first = t.last = null; n !== null; ) {
    var r = n.next;
    ((n.f & $) !== 0 ? (n.parent = null) : H(n, e), (n = r));
  }
}
function We(t) {
  for (var e = t.first; e !== null; ) {
    var n = e.next;
    ((e.f & k) === 0 && H(e), (e = n));
  }
}
function H(t, e = !0) {
  var n = !1;
  ((e || (t.f & be) !== 0) &&
    t.nodes_start !== null &&
    t.nodes_end !== null &&
    ($e(t.nodes_start, t.nodes_end), (n = !0)),
    fe(t, e && !n),
    ot(t, 0),
    O(t, bt));
  var r = t.transitions;
  if (r !== null) for (const l of r) l.stop();
  se(t);
  var a = t.parent;
  (a !== null && a.first !== null && ue(t),
    (t.next =
      t.prev =
      t.teardown =
      t.ctx =
      t.deps =
      t.fn =
      t.nodes_start =
      t.nodes_end =
        null));
}
function $e(t, e) {
  for (; t !== null; ) {
    var n = t === e ? null : B(t);
    (t.remove(), (t = n));
  }
}
function ue(t) {
  var e = t.parent,
    n = t.prev,
    r = t.next;
  (n !== null && (n.next = r),
    r !== null && (r.prev = n),
    e !== null &&
      (e.first === t && (e.first = r), e.last === t && (e.last = n)));
}
function Xe(t, e) {
  var n = [];
  (ie(t, n, !0),
    Ze(n, () => {
      (H(t), e && e());
    }));
}
function Ze(t, e) {
  var n = t.length;
  if (n > 0) {
    var r = () => --n || e();
    for (var a of t) a.out(r);
  } else e();
}
function ie(t, e, n) {
  if ((t.f & V) === 0) {
    if (((t.f ^= V), t.transitions !== null))
      for (const o of t.transitions) (o.is_global || n) && e.push(o);
    for (var r = t.first; r !== null; ) {
      var a = r.next,
        l = (r.f & Kt) !== 0 || (r.f & k) !== 0;
      (ie(r, e, l ? n : !1), (r = a));
    }
  }
}
function rr(t) {
  oe(t, !0);
}
function oe(t, e) {
  if ((t.f & V) !== 0) {
    t.f ^= V;
    for (var n = t.first; n !== null; ) {
      var r = n.next,
        a = (n.f & Kt) !== 0 || (n.f & k) !== 0;
      (oe(n, a ? e : !1), (n = r));
    }
    if (t.transitions !== null)
      for (const l of t.transitions) (l.is_global || e) && l.in();
  }
}
const ze =
  typeof requestIdleCallback > "u"
    ? (t) => setTimeout(t, 1)
    : requestIdleCallback;
let nt = [],
  rt = [];
function _e() {
  var t = nt;
  ((nt = []), Ut(t));
}
function ce() {
  var t = rt;
  ((rt = []), Ut(t));
}
function ar(t) {
  (nt.length === 0 && queueMicrotask(_e), nt.push(t));
}
function lr(t) {
  (rt.length === 0 && ze(ce), rt.push(t));
}
function Je() {
  (nt.length > 0 && _e(), rt.length > 0 && ce());
}
function Qe(t) {
  var e = d;
  if ((e.f & Gt) === 0) {
    if ((e.f & At) === 0) throw t;
    e.fn(t);
  } else ve(t, e);
}
function ve(t, e) {
  for (; e !== null; ) {
    if ((e.f & At) !== 0)
      try {
        e.fn(t);
        return;
      } catch {}
    e = e.parent;
  }
  throw t;
}
let q = !1,
  at = null,
  j = !1,
  Z = !1;
function Ht(t) {
  Z = t;
}
let Q = [];
let c = null,
  I = !1;
function W(t) {
  c = t;
}
let d = null;
function ut(t) {
  d = t;
}
let h = null;
function de(t) {
  c !== null && c.f & Et && (h === null ? (h = [c, [t]]) : h[1].push(t));
}
let w = null,
  g = 0,
  b = null;
function tn(t) {
  b = t;
}
let pe = 1,
  it = 0,
  S = !1,
  M = null;
function he() {
  return ++pe;
}
function lt(t) {
  var i;
  var e = t.f;
  if ((e & P) !== 0) return !0;
  if ((e & F) !== 0) {
    var n = t.deps,
      r = (e & T) !== 0;
    if (n !== null) {
      var a,
        l,
        o = (e & ft) !== 0,
        u = r && d !== null && !S,
        s = n.length;
      if (o || u) {
        var f = t,
          v = f.parent;
        for (a = 0; a < s; a++)
          ((l = n[a]),
            (o ||
              !(
                (i = l == null ? void 0 : l.reactions) != null && i.includes(f)
              )) &&
              (l.reactions ?? (l.reactions = [])).push(f));
        (o && (f.f ^= ft), u && v !== null && (v.f & T) === 0 && (f.f ^= T));
      }
      for (a = 0; a < s; a++)
        if (((l = n[a]), lt(l) && Qt(l), l.wv > t.wv)) return !0;
    }
    (!r || (d !== null && !S)) && O(t, A);
  }
  return !1;
}
function ye(t, e, n = !0) {
  var r = t.reactions;
  if (r !== null)
    for (var a = 0; a < r.length; a++) {
      var l = r[a];
      (h != null && h[1].includes(t) && h[0] === c) ||
        ((l.f & x) !== 0
          ? ye(l, e, !1)
          : e === l && (n ? O(l, P) : (l.f & A) !== 0 && O(l, F), Ct(l)));
    }
}
function we(t) {
  var E;
  var e = w,
    n = g,
    r = b,
    a = c,
    l = S,
    o = h,
    u = p,
    s = I,
    f = t.f;
  ((w = null),
    (g = 0),
    (b = null),
    (S = (f & T) !== 0 && (I || !j || c === null)),
    (c = (f & (k | $)) === 0 ? t : null),
    (h = null),
    Lt(t.ctx),
    (I = !1),
    it++,
    (t.f |= Et));
  try {
    var v = (0, t.fn)(),
      i = t.deps;
    if (w !== null) {
      var _;
      if ((ot(t, g), i !== null && g > 0))
        for (i.length = g + w.length, _ = 0; _ < w.length; _++) i[g + _] = w[_];
      else t.deps = i = w;
      if (!S || ((f & x) !== 0 && t.reactions !== null))
        for (_ = g; _ < i.length; _++)
          ((E = i[_]).reactions ?? (E.reactions = [])).push(t);
    } else i !== null && g < i.length && (ot(t, g), (i.length = g));
    if (vt() && b !== null && !I && i !== null && (t.f & (x | F | P)) === 0)
      for (_ = 0; _ < b.length; _++) ye(b[_], t);
    return (
      a !== null &&
        a !== t &&
        (it++, b !== null && (r === null ? (r = b) : r.push(...b))),
      v
    );
  } catch (R) {
    Qe(R);
  } finally {
    ((w = e),
      (g = n),
      (b = r),
      (c = a),
      (S = l),
      (h = o),
      Lt(u),
      (I = s),
      (t.f ^= Et));
  }
}
function en(t, e) {
  let n = e.reactions;
  if (n !== null) {
    var r = me.call(n, t);
    if (r !== -1) {
      var a = n.length - 1;
      a === 0 ? (n = e.reactions = null) : ((n[r] = n[a]), n.pop());
    }
  }
  n === null &&
    (e.f & x) !== 0 &&
    (w === null || !w.includes(e)) &&
    (O(e, F), (e.f & (T | ft)) === 0 && (e.f ^= ft), zt(e), ot(e, 0));
}
function ot(t, e) {
  var n = t.deps;
  if (n !== null) for (var r = e; r < n.length; r++) en(t, n[r]);
}
function pt(t) {
  var e = t.f;
  if ((e & bt) === 0) {
    O(t, A);
    var n = d,
      r = j;
    ((d = t), (j = !0));
    try {
      ((e & xt) !== 0 ? We(t) : fe(t), se(t));
      var a = we(t);
      ((t.teardown = typeof a == "function" ? a : null), (t.wv = pe));
      var l;
    } finally {
      ((j = r), (d = n));
    }
  }
}
function nn() {
  try {
    Ne();
  } catch (t) {
    if (at !== null) ve(t, at);
    else throw t;
  }
}
function gt() {
  var t = j;
  try {
    var e = 0;
    for (j = !0; Q.length > 0; ) {
      e++ > 1e3 && nn();
      var n = Q,
        r = n.length;
      Q = [];
      for (var a = 0; a < r; a++) {
        var l = an(n[a]);
        rn(l);
      }
      tt.clear();
    }
  } finally {
    ((q = !1), (j = t), (at = null));
  }
}
function rn(t) {
  var e = t.length;
  if (e !== 0)
    for (var n = 0; n < e; n++) {
      var r = t[n];
      (r.f & (bt | V)) === 0 &&
        lt(r) &&
        (pt(r),
        r.deps === null &&
          r.first === null &&
          r.nodes_start === null &&
          (r.teardown === null ? ue(r) : (r.fn = null)));
    }
}
function Ct(t) {
  q || ((q = !0), queueMicrotask(gt));
  for (var e = (at = t); e.parent !== null; ) {
    e = e.parent;
    var n = e.f;
    if ((n & ($ | k)) !== 0) {
      if ((n & A) === 0) return;
      e.f ^= A;
    }
  }
  Q.push(e);
}
function an(t) {
  for (var e = [], n = t; n !== null; ) {
    var r = n.f,
      a = (r & (k | $)) !== 0,
      l = a && (r & A) !== 0;
    if (!l && (r & V) === 0) {
      (r & Vt) !== 0 ? e.push(n) : a ? (n.f ^= A) : lt(n) && pt(n);
      var o = n.first;
      if (o !== null) {
        n = o;
        continue;
      }
    }
    var u = n.parent;
    for (n = n.next; n === null && u !== null; ) ((n = u.next), (u = u.parent));
  }
  return e;
}
function ln(t) {
  var e;
  for (t && ((q = !0), gt(), (q = !0), (e = t())); ; ) {
    if ((Je(), Q.length === 0)) return ((q = !1), (at = null), e);
    ((q = !0), gt());
  }
}
async function sr() {
  (await Promise.resolve(), ln());
}
function U(t) {
  var e = t.f,
    n = (e & x) !== 0;
  if ((M !== null && M.add(t), c !== null && !I)) {
    if (!(h != null && h[1].includes(t)) || h[0] !== c) {
      var r = c.deps;
      t.rv < it &&
        ((t.rv = it),
        w === null && r !== null && r[g] === t
          ? g++
          : w === null
            ? (w = [t])
            : (!S || !w.includes(t)) && w.push(t));
    }
  } else if (n && t.deps === null && t.effects === null) {
    var a = t,
      l = a.parent;
    l !== null && (l.f & T) === 0 && (a.f ^= T);
  }
  return (n && ((a = t), lt(a) && Qt(a)), Z && tt.has(t) ? tt.get(t) : t.v);
}
function sn(t) {
  var e = M;
  M = new Set();
  var n = M,
    r;
  try {
    if ((St(t), e !== null)) for (r of M) e.add(r);
  } finally {
    M = e;
  }
  return n;
}
function fr(t) {
  var e = sn(() => St(t));
  for (var n of e)
    if ((n.f & Ae) !== 0)
      for (const r of n.deps || []) (r.f & x) === 0 && mt(r, r.v);
    else mt(n, n.v);
}
function St(t) {
  var e = I;
  try {
    return ((I = !0), t());
  } finally {
    I = e;
  }
}
const fn = -7169;
function O(t, e) {
  t.f = (t.f & fn) | e;
}
function ur(t) {
  if (!(typeof t != "object" || !t || t instanceof EventTarget)) {
    if (L in t) Tt(t);
    else if (!Array.isArray(t))
      for (let e in t) {
        const n = t[e];
        typeof n == "object" && n && L in n && Tt(n);
      }
  }
}
function Tt(t, e = new Set()) {
  if (
    typeof t == "object" &&
    t !== null &&
    !(t instanceof EventTarget) &&
    !e.has(t)
  ) {
    (e.add(t), t instanceof Date && t.getTime());
    for (let r in t)
      try {
        Tt(t[r], e);
      } catch {}
    const n = Bt(t);
    if (
      n !== Object.prototype &&
      n !== Array.prototype &&
      n !== Map.prototype &&
      n !== Set.prototype &&
      n !== Date.prototype
    ) {
      const r = ge(n);
      for (let a in r) {
        const l = r[a].get;
        if (l)
          try {
            l.call(t);
          } catch {}
      }
    }
  }
}
function un(t) {
  var e = document.createElement("template");
  return ((e.innerHTML = t.replaceAll("<!>", "<!---->")), e.content);
}
function Y(t, e) {
  var n = d;
  n.nodes_start === null && ((n.nodes_start = t), (n.nodes_end = e));
}
function ir(t, e) {
  var n = (e & Pe) !== 0,
    r = (e & Fe) !== 0,
    a,
    l = !t.startsWith("<!>");
  return () => {
    if (D) return (Y(y, null), y);
    a === void 0 && ((a = un(l ? t : "<!>" + t)), n || (a = et(a)));
    var o = r || ee ? document.importNode(a, !0) : a.cloneNode(!0);
    if (n) {
      var u = et(o),
        s = o.lastChild;
      Y(u, s);
    } else Y(o, o);
    return o;
  };
}
function or(t = "") {
  if (!D) {
    var e = K(t + "");
    return (Y(e, e), e);
  }
  var n = y;
  return (n.nodeType !== Dt && (n.before((n = K())), G(n)), Y(n, n), n);
}
function _r() {
  if (D) return (Y(y, null), y);
  var t = document.createDocumentFragment(),
    e = document.createComment(""),
    n = K();
  return (t.append(e, n), Y(e, n), t);
}
function cr(t, e) {
  if (D) {
    ((d.nodes_end = y), Be());
    return;
  }
  t !== null && t.before(e);
}
export {
  er as $,
  ie as A,
  Xn as B,
  $t as C,
  Ze as D,
  gn as E,
  H as F,
  mn as G,
  qe as H,
  V as I,
  Tn as J,
  B as K,
  Kt as L,
  Me as M,
  p as N,
  zn as O,
  Zn as P,
  Ut as Q,
  St as R,
  vn as S,
  ur as T,
  m as U,
  Rt as V,
  En as W,
  Sn as X,
  Qn as Y,
  tr as Z,
  ir as _,
  Fn as a,
  Kn as a0,
  $n as a1,
  cr as a2,
  Pn as a3,
  Ue as a4,
  N as a5,
  fr as a6,
  Hn as a7,
  Bn as a8,
  Wn as a9,
  Cn as aA,
  In as aB,
  kn as aC,
  Nn as aD,
  sr as aE,
  $e as aF,
  Nt as aG,
  Ot as aH,
  _r as aI,
  W as aJ,
  ut as aK,
  c as aL,
  ar as aM,
  _n as aN,
  be as aO,
  Gn as aP,
  hn as aQ,
  Jn as aR,
  C as aS,
  Mn as aT,
  or as aU,
  cn as aV,
  De as aW,
  J as aa,
  wn as ab,
  Ae as ac,
  bn as ad,
  Zt as ae,
  z as af,
  Dn as ag,
  L as ah,
  dn as ai,
  ct as aj,
  An as ak,
  xn as al,
  On as am,
  M as an,
  Rn as ao,
  Bt as ap,
  ge as aq,
  lr as ar,
  pn as as,
  vt as at,
  kt as au,
  un as av,
  Y as aw,
  je as ax,
  yn as ay,
  ln as az,
  Ke as b,
  K as c,
  G as d,
  le as e,
  Be as f,
  et as g,
  D as h,
  Ee as i,
  U as j,
  qn as k,
  Un as l,
  Yn as m,
  y as n,
  Le as o,
  rr as p,
  nr as q,
  Vn as r,
  jn as s,
  Ge as t,
  Xe as u,
  on as v,
  d as w,
  mt as x,
  Ln as y,
  It as z,
};
