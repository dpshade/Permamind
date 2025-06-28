import {
  b as R,
  h as u,
  f as h,
  L as g,
  r as S,
  M as D,
  H,
  l as L,
  d as k,
  m as I,
  p as b,
  q as _,
  u as m,
  U as q,
  n as F,
} from "./B_egDBur.js";
function U(v, A, [t, s] = [0, 0]) {
  u && t === 0 && h();
  var a = v,
    f = null,
    e = null,
    i = q,
    p = t > 0 ? g : 0,
    n = !1;
  const E = (r, l = !0) => {
      ((n = !0), o(l, r));
    },
    o = (r, l) => {
      if (i === (i = r)) return;
      let T = !1;
      if (u && s !== -1) {
        if (t === 0) {
          const c = S(a);
          c === D
            ? (s = 0)
            : c === H
              ? (s = 1 / 0)
              : ((s = parseInt(c.substring(1))),
                s !== s && (s = i ? 1 / 0 : -1));
        }
        const N = s > t;
        !!i === N && ((a = L()), k(a), I(!1), (T = !0), (s = -1));
      }
      (i
        ? (f ? b(f) : l && (f = _(() => l(a))),
          e &&
            m(e, () => {
              e = null;
            }))
        : (e ? b(e) : l && (e = _(() => l(a, [t + 1, s]))),
          f &&
            m(f, () => {
              f = null;
            })),
        T && I(!0));
    };
  (R(() => {
    ((n = !1), A(E), n || o(null, null));
  }, p),
    u && (a = F));
}
export { U as i };
