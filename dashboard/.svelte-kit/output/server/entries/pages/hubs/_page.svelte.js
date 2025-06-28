import {
  h as head,
  l as attr,
  c as pop,
  p as push,
} from "../../../chunks/index.js";
import "../../../chunks/HubCard.svelte_svelte_type_style_lang.js";
function _page($$payload, $$props) {
  push();
  let hubs = [];
  let searchTerm = "";
  hubs.filter(
    (hub) =>
      hub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hub.processId.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Hubs - Permamind Dashboard</title>`;
  });
  $$payload.out += `<div class="container"><div class="page-header svelte-923z82"><h1>Hub Discovery</h1> <p>Discover and connect to Permamind hubs across the network</p></div> <div class="search-section card svelte-923z82"><div class="search-controls svelte-923z82"><input type="text" placeholder="Search hubs by name or process ID..."${attr("value", searchTerm)} class="search-input svelte-923z82"/> <button class="btn">Refresh Discovery</button></div></div> `;
  {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="card"><p>Discovering hubs across the network...</p></div>`;
  }
  $$payload.out += `<!--]--></div>`;
  pop();
}
export { _page as default };
