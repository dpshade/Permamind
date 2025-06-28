import {
  ao as u,
  ap as i,
  h as t,
  aq as h,
  ar as m,
  as as g,
  at as y,
  R as A,
  au as S,
} from "./B_egDBur.js";
import { a as E, l as M } from "./CJZ1Yolx.js";
const N = Symbol("is custom element"),
  k = Symbol("is html");
function w(e) {
  if (t) {
    var r = !1,
      a = () => {
        if (!r) {
          if (((r = !0), e.hasAttribute("value"))) {
            var _ = e.value;
            (c(e, "value", null), (e.value = _));
          }
          if (e.hasAttribute("checked")) {
            var s = e.checked;
            (c(e, "checked", null), (e.checked = s));
          }
        }
      };
    ((e.__on_r = a), m(a), E());
  }
}
function c(e, r, a, _) {
  var s = L(e);
  (t &&
    ((s[r] = e.getAttribute(r)),
    r === "src" ||
      r === "srcset" ||
      (r === "href" && e.nodeName === "LINK"))) ||
    (s[r] !== (s[r] = a) &&
      (r === "loading" && (e[g] = a),
      a == null
        ? e.removeAttribute(r)
        : typeof a != "string" && T(e).includes(r)
          ? (e[r] = a)
          : e.setAttribute(r, a)));
}
function L(e) {
  return (
    e.__attributes ??
    (e.__attributes = {
      [N]: e.nodeName.includes("-"),
      [k]: e.namespaceURI === u,
    })
  );
}
var n = new Map();
function T(e) {
  var r = n.get(e.nodeName);
  if (r) return r;
  n.set(e.nodeName, (r = []));
  for (var a, _ = e, s = Element.prototype; s !== _; ) {
    a = h(_);
    for (var o in a) a[o].set && r.push(o);
    _ = i(_);
  }
  return r;
}
function O(e, r, a = r) {
  var _ = y();
  (M(e, "input", (s) => {
    var o = s ? e.defaultValue : e.value;
    if (((o = f(e) ? l(o) : o), a(o), _ && o !== (o = r()))) {
      var d = e.selectionStart,
        v = e.selectionEnd;
      ((e.value = o ?? ""),
        v !== null &&
          ((e.selectionStart = d),
          (e.selectionEnd = Math.min(v, e.value.length))));
    }
  }),
    ((t && e.defaultValue !== e.value) || (A(r) == null && e.value)) &&
      a(f(e) ? l(e.value) : e.value),
    S(() => {
      var s = r();
      (f(e) && s === l(e.value)) ||
        (e.type === "date" && !s && !e.value) ||
        (s !== e.value && (e.value = s ?? ""));
    }));
}
function f(e) {
  var r = e.type;
  return r === "number" || r === "range";
}
function l(e) {
  return e === "" ? null : +e;
}
export { O as b, w as r, c as s };
