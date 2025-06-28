import {
  aa as B,
  ab as Y,
  ac as M,
  V as L,
  k as N,
  ad as U,
  j as u,
  ae as j,
  af as w,
  a5 as C,
  y as G,
  R as D,
  ag as V,
  ah as $,
  ai as z,
  aj as Z,
  ak as p,
  al as F,
  am as H,
  an as J,
} from "./B_egDBur.js";
let S = !1;
function K(a) {
  var r = S;
  try {
    return ((S = !1), [a(), S]);
  } finally {
    S = r;
  }
}
function T(a) {
  var r;
  return ((r = a.ctx) == null ? void 0 : r.d) ?? !1;
}
function W(a, r, _, v) {
  var h;
  var R = (_ & F) !== 0,
    l = !Z || (_ & p) !== 0,
    c = (_ & V) !== 0,
    q = (_ & H) !== 0,
    E = !1,
    s;
  c ? ([s, E] = K(() => a[r])) : (s = a[r]);
  var x = $ in a || z in a,
    d =
      (c &&
        (((h = B(a, r)) == null ? void 0 : h.set) ??
          (x && r in a && ((e) => (a[r] = e))))) ||
      void 0,
    i = v,
    g = !0,
    m = !1,
    A = () => ((m = !0), g && ((g = !1), q ? (i = D(v)) : (i = v)), i);
  s === void 0 && v !== void 0 && (d && l && Y(), (s = A()), d && d(s));
  var t;
  if (l)
    t = () => {
      var e = a[r];
      return e === void 0 ? A() : ((g = !0), (m = !1), e);
    };
  else {
    var O = (R ? L : N)(() => a[r]);
    ((O.f |= M),
      (t = () => {
        var e = u(O);
        return (e !== void 0 && (i = void 0), e === void 0 ? i : e);
      }));
  }
  if ((_ & U) === 0 && l) return t;
  if (d) {
    var y = a.$$legacy;
    return function (e, f) {
      return arguments.length > 0
        ? ((!l || !f || y || E) && d(f ? t() : e), e)
        : t();
    };
  }
  var o = !1,
    I = !1,
    P = G(s),
    n = L(() => {
      var e = t(),
        f = u(P);
      return o ? ((o = !1), (I = !0), f) : ((I = !1), (P.v = e));
    });
  return (
    c && u(n),
    R || (n.equals = j),
    function (e, f) {
      if ((J !== null && ((o = I), t(), u(P)), arguments.length > 0)) {
        const b = f ? u(n) : l && c ? w(e) : e;
        if (!n.equals(b)) {
          if (((o = !0), C(P, b), m && i !== void 0 && (i = b), T(n))) return e;
          D(() => u(n));
        }
        return e;
      }
      return T(n) ? n.v : u(n);
    }
  );
}
export { W as p };
