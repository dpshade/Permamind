import {
  h as head,
  l as attr,
  m as maybe_selected,
  c as pop,
  p as push,
} from "../../../chunks/index.js";
function _page($$payload, $$props) {
  push();
  let workflows = [];
  let searchTerm = "";
  let filterStatus = "all";
  let filterStage = "all";
  workflows.filter((workflow) => {
    const matchesSearch =
      workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.capabilities.some((cap) =>
        cap.includes(searchTerm.toLowerCase()),
      );
    const matchesStatus = filterStatus === "all";
    const matchesStage = filterStage === "all";
    return matchesSearch && matchesStatus && matchesStage;
  });
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Workflows - Permamind Dashboard</title>`;
  });
  $$payload.out += `<div class="container"><div class="page-header svelte-lkt6tt"><h1>Workflow Management</h1> <p>Monitor and manage your AI workflows and their performance</p></div> <div class="controls card svelte-lkt6tt"><div class="search-section svelte-lkt6tt"><input type="text" placeholder="Search workflows by name, ID, or capability..."${attr("value", searchTerm)} class="search-input svelte-lkt6tt"/></div> <div class="filter-section svelte-lkt6tt"><div class="filter-group svelte-lkt6tt"><label class="svelte-lkt6tt">Status:</label> <select class="filter-select svelte-lkt6tt">`;
  $$payload.select_value = filterStatus;
  $$payload.out += `<option value="all"${maybe_selected($$payload, "all")}>All Status</option><option value="active"${maybe_selected($$payload, "active")}>Active</option><option value="enhancing"${maybe_selected($$payload, "enhancing")}>Enhancing</option><option value="inactive"${maybe_selected($$payload, "inactive")}>Inactive</option>`;
  $$payload.select_value = void 0;
  $$payload.out += `</select></div> <div class="filter-group svelte-lkt6tt"><label class="svelte-lkt6tt">Stage:</label> <select class="filter-select svelte-lkt6tt">`;
  $$payload.select_value = filterStage;
  $$payload.out += `<option value="all"${maybe_selected($$payload, "all")}>All Stages</option><option value="planning"${maybe_selected($$payload, "planning")}>Planning</option><option value="execution"${maybe_selected($$payload, "execution")}>Execution</option><option value="evaluation"${maybe_selected($$payload, "evaluation")}>Evaluation</option><option value="optimization"${maybe_selected($$payload, "optimization")}>Optimization</option><option value="archived"${maybe_selected($$payload, "archived")}>Archived</option>`;
  $$payload.select_value = void 0;
  $$payload.out += `</select></div></div> <div class="actions svelte-lkt6tt"><button class="btn">Create Workflow</button> <button class="btn">Import Workflow</button></div></div> `;
  {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="card"><p>Loading workflows...</p></div>`;
  }
  $$payload.out += `<!--]--></div>`;
  pop();
}
export { _page as default };
