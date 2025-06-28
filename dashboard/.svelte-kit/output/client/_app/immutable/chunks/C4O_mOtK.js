import { e as _, t as d, i as o, s, a as c } from "./B_egDBur.js";
import { l as b } from "./CJZ1Yolx.js";
function v(e, r, t) {
  if (e.multiple) {
    if (r == null) return;
    if (!o(r)) return s();
    for (var u of e.options) u.selected = r.includes(n(u));
    return;
  }
  for (u of e.options) {
    var i = n(u);
    if (c(i, r)) {
      u.selected = !0;
      return;
    }
  }
  (!t || r !== void 0) && (e.selectedIndex = -1);
}
function m(e) {
  var r = new MutationObserver(() => {
    v(e, e.__value);
  });
  (r.observe(e, {
    childList: !0,
    subtree: !0,
    attributes: !0,
    attributeFilter: ["value"],
  }),
    d(() => {
      r.disconnect();
    }));
}
function h(e, r, t = r) {
  var u = !0;
  (b(e, "change", (i) => {
    var a = i ? "[selected]" : ":checked",
      l;
    if (e.multiple) l = [].map.call(e.querySelectorAll(a), n);
    else {
      var f = e.querySelector(a) ?? e.querySelector("option:not([disabled])");
      l = f && n(f);
    }
    t(l);
  }),
    _(() => {
      var i = r();
      if ((v(e, i, u), u && i === void 0)) {
        var a = e.querySelector(":checked");
        a !== null && ((i = n(a)), t(i));
      }
      ((e.__value = i), (u = !1));
    }),
    m(e));
}
function n(e) {
  return "__value" in e ? e.__value : e.value;
}
export { h as b };
