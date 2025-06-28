import { t as y } from "./DTq8wH66.js";
import { h as r } from "./B_egDBur.js";
function n(t, e, f, i) {
  var l = t.__style;
  if (r || l !== e) {
    var s = y(e);
    ((!r || s !== t.getAttribute("style")) &&
      (s == null ? t.removeAttribute("style") : (t.style.cssText = s)),
      (t.__style = e));
  }
  return i;
}
export { n as s };
