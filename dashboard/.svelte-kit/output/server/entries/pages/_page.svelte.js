import { h as head, c as pop, p as push } from "../../chunks/index.js";
import "../../chunks/HubCard.svelte_svelte_type_style_lang.js";
function _page($$payload, $$props) {
  push();
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Permamind Dashboard</title>`;
  });
  $$payload.out += `<div class="layout"><nav class="sidebar"><h2>Permamind</h2> <a href="/" class="nav-link active">Dashboard</a> <a href="/hubs" class="nav-link">Hubs</a> <a href="/workflows" class="nav-link">Workflows</a> <a href="/discovery" class="nav-link">Discovery</a> <a href="/docs" class="nav-link">Documentation</a> <a href="/analytics" class="nav-link">Analytics</a></nav> <main class="main-content"><div class="container"><h1>Permamind Hub Dashboard</h1> <p>Monitor and manage your decentralized AI memory ecosystem</p> `;
  {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="card"><p>Loading dashboard data...</p></div>`;
  }
  $$payload.out += `<!--]--></div></main></div>`;
  pop();
}
export { _page as default };
