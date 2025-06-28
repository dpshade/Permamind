import {
  f as ensure_array_like,
  h as head,
  m as maybe_selected,
  l as attr,
  e as escape_html,
  c as pop,
  p as push,
} from "../../../chunks/index.js";
function _page($$payload, $$props) {
  push();
  let searchQuery = "";
  let discoveryType = "search";
  let searchResults = [];
  let capabilities = [];
  function formatLastUpdated(dateString) {
    const date = new Date(dateString);
    const now = /* @__PURE__ */ new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / 36e5);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  }
  function getTrendIcon(trend) {
    switch (trend) {
      case "up":
        return "↗️";
      case "down":
        return "↘️";
      case "stable":
        return "→";
      default:
        return "";
    }
  }
  const each_array_2 = ensure_array_like(capabilities);
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Discovery - Permamind Dashboard</title>`;
  });
  $$payload.out += `<div class="container svelte-ir4kok"><div class="page-header svelte-ir4kok"><h1 class="svelte-ir4kok">Cross-Hub Discovery</h1> <p class="svelte-ir4kok">Discover workflows and capabilities across the Permamind network</p></div> `;
  {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> <div class="discovery-section card svelte-ir4kok"><h2 class="svelte-ir4kok">Workflow Discovery</h2> <div class="discovery-controls svelte-ir4kok"><div class="discovery-type svelte-ir4kok"><label class="svelte-ir4kok">Discovery Type:</label> <select class="type-select svelte-ir4kok">`;
  $$payload.select_value = discoveryType;
  $$payload.out += `<option value="search"${maybe_selected($$payload, "search")} class="svelte-ir4kok">Global Search</option><option value="capability"${maybe_selected($$payload, "capability")} class="svelte-ir4kok">By Capability</option><option value="requirements"${maybe_selected($$payload, "requirements")} class="svelte-ir4kok">By Requirements</option><option value="similar"${maybe_selected($$payload, "similar")} class="svelte-ir4kok">Similar Workflows</option>`;
  $$payload.select_value = void 0;
  $$payload.out += `</select></div> <div class="search-section svelte-ir4kok"><input type="text"${attr("placeholder", "Search workflows across the network...")}${attr("value", searchQuery)} class="search-input svelte-ir4kok"/> <button class="btn svelte-ir4kok"${attr("disabled", !searchQuery.trim(), true)}>${escape_html("Discover")}</button></div></div> `;
  {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> `;
  if (searchResults.length > 0) {
    $$payload.out += "<!--[-->";
    const each_array = ensure_array_like(searchResults);
    $$payload.out += `<div class="results-section svelte-ir4kok"><div class="results-header svelte-ir4kok"><h3 class="svelte-ir4kok">Discovery Results (${escape_html(searchResults.length)})</h3> <div class="sort-controls svelte-ir4kok"><select class="sort-select svelte-ir4kok"><option value="performance"${maybe_selected($$payload, "performance")} class="svelte-ir4kok">Sort by Performance</option><option value="reputation"${maybe_selected($$payload, "reputation")} class="svelte-ir4kok">Sort by Reputation</option><option value="usage"${maybe_selected($$payload, "usage")} class="svelte-ir4kok">Sort by Usage</option><option value="recent"${maybe_selected($$payload, "recent")} class="svelte-ir4kok">Sort by Recent</option></select></div></div> <div class="results-grid svelte-ir4kok"><!--[-->`;
    for (
      let $$index_1 = 0, $$length = each_array.length;
      $$index_1 < $$length;
      $$index_1++
    ) {
      let result = each_array[$$index_1];
      const each_array_1 = ensure_array_like(result.capabilities);
      $$payload.out += `<div class="result-card svelte-ir4kok"><div class="result-header svelte-ir4kok"><h4 class="svelte-ir4kok">${escape_html(result.name)}</h4> <div class="result-scores svelte-ir4kok"><div class="score-item svelte-ir4kok"><span class="score-label svelte-ir4kok">Performance</span> <span class="score-value performance-score svelte-ir4kok">${escape_html(Math.round(result.performanceScore * 100))}%</span></div> <div class="score-item svelte-ir4kok"><span class="score-label svelte-ir4kok">Reputation</span> <span class="score-value reputation-score svelte-ir4kok">${escape_html(Math.round(result.reputationScore * 100))}%</span></div></div></div> <div class="result-description svelte-ir4kok">${escape_html(result.description)}</div> <div class="result-capabilities svelte-ir4kok"><!--[-->`;
      for (
        let $$index = 0, $$length2 = each_array_1.length;
        $$index < $$length2;
        $$index++
      ) {
        let capability = each_array_1[$$index];
        $$payload.out += `<span class="capability-tag svelte-ir4kok">${escape_html(capability)}</span>`;
      }
      $$payload.out += `<!--]--></div> <div class="result-meta svelte-ir4kok"><div class="meta-row svelte-ir4kok"><span class="meta-label svelte-ir4kok">Hub ID:</span> <span class="meta-value svelte-ir4kok">${escape_html(result.hubId)}</span></div> <div class="meta-row svelte-ir4kok"><span class="meta-label svelte-ir4kok">Usage:</span> <span class="meta-value svelte-ir4kok">${escape_html(result.usage)} executions</span></div> <div class="meta-row svelte-ir4kok"><span class="meta-label svelte-ir4kok">Enhancements:</span> <span class="meta-value svelte-ir4kok">${escape_html(result.enhancements)} improvements</span></div> <div class="meta-row svelte-ir4kok"><span class="meta-label svelte-ir4kok">Updated:</span> <span class="meta-value svelte-ir4kok">${escape_html(formatLastUpdated(result.lastUpdated))}</span></div></div> <div class="result-actions svelte-ir4kok"><button class="btn-small svelte-ir4kok">View Details</button> <button class="btn-small svelte-ir4kok">Request Patterns</button> <button class="btn-small svelte-ir4kok">Create Similar</button></div></div>`;
    }
    $$payload.out += `<!--]--></div></div>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></div> <div class="capabilities-section card svelte-ir4kok"><h2 class="svelte-ir4kok">Popular Capabilities</h2> <div class="capabilities-grid svelte-ir4kok"><!--[-->`;
  for (
    let $$index_2 = 0, $$length = each_array_2.length;
    $$index_2 < $$length;
    $$index_2++
  ) {
    let capability = each_array_2[$$index_2];
    $$payload.out += `<div class="capability-item svelte-ir4kok"><div class="capability-header svelte-ir4kok"><span class="capability-name svelte-ir4kok">${escape_html(capability.name)}</span> <span class="trend-indicator svelte-ir4kok">${escape_html(getTrendIcon(capability.trend))}</span></div> <div class="capability-count svelte-ir4kok">${escape_html(capability.count)} workflows</div></div>`;
  }
  $$payload.out += `<!--]--></div></div></div>`;
  pop();
}
export { _page as default };
