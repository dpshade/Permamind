import {
  h as head,
  m as maybe_selected,
  c as pop,
  p as push,
  f as ensure_array_like,
  e as escape_html,
  i as attr_style,
  j as stringify,
  k as attr_class,
} from "../../../chunks/index.js";
function _page($$payload, $$props) {
  push();
  let analyticsData = null;
  let loading = true;
  let timeRange = "7d";
  let selectedWorkflow = "all";
  async function loadAnalytics() {
    loading = true;
    setTimeout(() => {
      analyticsData = {
        summary: {
          totalExecutions: 1247,
          successRate: 0.93,
          averageExecutionTime: 2340,
          totalEnhancements: 23,
          activeWorkflows: 8,
          topPerformer: "Data Processing Pipeline",
        },
        performanceMetrics: [
          {
            date: "2024-01-01",
            executions: 45,
            successRate: 0.91,
            avgTime: 2100,
          },
          {
            date: "2024-01-02",
            executions: 52,
            successRate: 0.94,
            avgTime: 2050,
          },
          {
            date: "2024-01-03",
            executions: 38,
            successRate: 0.89,
            avgTime: 2300,
          },
          {
            date: "2024-01-04",
            executions: 61,
            successRate: 0.96,
            avgTime: 1980,
          },
          {
            date: "2024-01-05",
            executions: 55,
            successRate: 0.93,
            avgTime: 2150,
          },
          {
            date: "2024-01-06",
            executions: 49,
            successRate: 0.92,
            avgTime: 2200,
          },
          {
            date: "2024-01-07",
            executions: 58,
            successRate: 0.95,
            avgTime: 2e3,
          },
        ],
        workflowMetrics: [
          {
            id: "wf-001",
            name: "Data Processing Pipeline",
            executions: 423,
            successRate: 0.97,
            avgExecutionTime: 1850,
            enhancements: 8,
            trend: "improving",
          },
          {
            id: "wf-002",
            name: "ML Model Training",
            executions: 234,
            successRate: 0.89,
            avgExecutionTime: 4200,
            enhancements: 12,
            trend: "stable",
          },
          {
            id: "wf-003",
            name: "API Integration",
            executions: 156,
            successRate: 0.94,
            avgExecutionTime: 980,
            enhancements: 3,
            trend: "improving",
          },
        ],
        enhancementHistory: [
          {
            date: "2024-01-07",
            workflowId: "wf-001",
            type: "optimization",
            impact: 0.15,
            description: "Optimized data caching strategy",
          },
          {
            date: "2024-01-06",
            workflowId: "wf-002",
            type: "bug_fix",
            impact: 0.08,
            description: "Fixed memory leak in training loop",
          },
          {
            date: "2024-01-05",
            workflowId: "wf-001",
            type: "feature_add",
            impact: 0.12,
            description: "Added parallel processing support",
          },
        ],
        ecosystemHealth: {
          networkConnectivity: 0.94,
          crossHubCollaboration: 0.76,
          enhancementEffectiveness: 0.88,
          workflowDiversity: 0.82,
          overallHealth: 0.85,
        },
      };
      loading = false;
    }, 1e3);
  }
  function formatExecutionTime(ms) {
    if (ms < 1e3) return `${ms}ms`;
    if (ms < 6e4) return `${(ms / 1e3).toFixed(1)}s`;
    return `${(ms / 6e4).toFixed(1)}m`;
  }
  function getTrendIcon(trend) {
    switch (trend) {
      case "improving":
        return "📈";
      case "declining":
        return "📉";
      case "stable":
        return "➡️";
      default:
        return "";
    }
  }
  function getEnhancementTypeColor(type) {
    switch (type) {
      case "optimization":
        return "#10b981";
      case "bug_fix":
        return "#ef4444";
      case "feature_add":
        return "#2563eb";
      case "refactor":
        return "#8b5cf6";
      default:
        return "#6b7280";
    }
  }
  {
    loadAnalytics();
  }
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Analytics - Permamind Dashboard</title>`;
  });
  $$payload.out += `<div class="container"><div class="page-header svelte-ae6z9k"><h1>Workflow Analytics</h1> <p>Performance insights and ecosystem health metrics</p></div> <div class="controls card svelte-ae6z9k"><div class="control-group svelte-ae6z9k"><label class="svelte-ae6z9k">Time Range:</label> <select class="control-select svelte-ae6z9k">`;
  $$payload.select_value = timeRange;
  $$payload.out += `<option value="24h"${maybe_selected($$payload, "24h")}>Last 24 Hours</option><option value="7d"${maybe_selected($$payload, "7d")}>Last 7 Days</option><option value="30d"${maybe_selected($$payload, "30d")}>Last 30 Days</option><option value="90d"${maybe_selected($$payload, "90d")}>Last 90 Days</option>`;
  $$payload.select_value = void 0;
  $$payload.out += `</select></div> <div class="control-group svelte-ae6z9k"><label class="svelte-ae6z9k">Workflow:</label> <select class="control-select svelte-ae6z9k">`;
  $$payload.select_value = selectedWorkflow;
  $$payload.out += `<option value="all"${maybe_selected($$payload, "all")}>All Workflows</option><option value="wf-001"${maybe_selected($$payload, "wf-001")}>Data Processing Pipeline</option><option value="wf-002"${maybe_selected($$payload, "wf-002")}>ML Model Training</option><option value="wf-003"${maybe_selected($$payload, "wf-003")}>API Integration</option>`;
  $$payload.select_value = void 0;
  $$payload.out += `</select></div> <button class="btn">Export Report</button></div> `;
  if (loading) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="card"><p>Loading analytics data...</p></div>`;
  } else if (analyticsData) {
    $$payload.out += "<!--[1-->";
    const each_array = ensure_array_like(analyticsData.performanceMetrics);
    const each_array_1 = ensure_array_like(analyticsData.workflowMetrics);
    const each_array_2 = ensure_array_like(analyticsData.enhancementHistory);
    $$payload.out += `<div class="summary-section card svelte-ae6z9k"><h2>Performance Summary</h2> <div class="summary-grid svelte-ae6z9k"><div class="summary-item svelte-ae6z9k"><div class="summary-value svelte-ae6z9k">${escape_html(analyticsData.summary.totalExecutions.toLocaleString())}</div> <div class="summary-label svelte-ae6z9k">Total Executions</div></div> <div class="summary-item svelte-ae6z9k"><div class="summary-value svelte-ae6z9k">${escape_html(Math.round(analyticsData.summary.successRate * 100))}%</div> <div class="summary-label svelte-ae6z9k">Success Rate</div></div> <div class="summary-item svelte-ae6z9k"><div class="summary-value svelte-ae6z9k">${escape_html(formatExecutionTime(analyticsData.summary.averageExecutionTime))}</div> <div class="summary-label svelte-ae6z9k">Avg Execution Time</div></div> <div class="summary-item svelte-ae6z9k"><div class="summary-value svelte-ae6z9k">${escape_html(analyticsData.summary.totalEnhancements)}</div> <div class="summary-label svelte-ae6z9k">Total Enhancements</div></div> <div class="summary-item svelte-ae6z9k"><div class="summary-value svelte-ae6z9k">${escape_html(analyticsData.summary.activeWorkflows)}</div> <div class="summary-label svelte-ae6z9k">Active Workflows</div></div> <div class="summary-item top-performer svelte-ae6z9k"><div class="summary-value svelte-ae6z9k">🏆</div> <div class="summary-label svelte-ae6z9k">Top Performer</div> <div class="performer-name svelte-ae6z9k">${escape_html(analyticsData.summary.topPerformer)}</div></div></div></div> <div class="chart-section card svelte-ae6z9k"><h2>Performance Trends</h2> <div class="chart-container svelte-ae6z9k"><div class="chart-metrics svelte-ae6z9k"><div class="metric-selector svelte-ae6z9k"><button class="metric-btn active svelte-ae6z9k">Executions</button> <button class="metric-btn svelte-ae6z9k">Success Rate</button> <button class="metric-btn svelte-ae6z9k">Avg Time</button></div></div> <div class="simple-chart svelte-ae6z9k"><div class="chart-bars svelte-ae6z9k"><!--[-->`;
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let metric = each_array[i];
      $$payload.out += `<div class="chart-bar svelte-ae6z9k"><div class="bar svelte-ae6z9k"${attr_style(`height: ${stringify((metric.executions / 70) * 100)}%`)}></div> <div class="bar-label svelte-ae6z9k">${escape_html(new Date(metric.date).getDate())}</div></div>`;
    }
    $$payload.out += `<!--]--></div></div></div></div> <div class="workflow-performance card svelte-ae6z9k"><h2>Workflow Performance</h2> <div class="workflow-table svelte-ae6z9k"><table class="svelte-ae6z9k"><thead><tr><th class="svelte-ae6z9k">Workflow</th><th class="svelte-ae6z9k">Executions</th><th class="svelte-ae6z9k">Success Rate</th><th class="svelte-ae6z9k">Avg Time</th><th class="svelte-ae6z9k">Enhancements</th><th class="svelte-ae6z9k">Trend</th></tr></thead><tbody><!--[-->`;
    for (
      let $$index_1 = 0, $$length = each_array_1.length;
      $$index_1 < $$length;
      $$index_1++
    ) {
      let workflow = each_array_1[$$index_1];
      $$payload.out += `<tr><td class="workflow-name svelte-ae6z9k">${escape_html(workflow.name)}</td><td class="svelte-ae6z9k">${escape_html(workflow.executions.toLocaleString())}</td><td class="svelte-ae6z9k"><span${attr_class(
        "success-rate svelte-ae6z9k",
        void 0,
        {
          high: workflow.successRate >= 0.95,
          medium: workflow.successRate >= 0.9 && workflow.successRate < 0.95,
        },
      )}>${escape_html(Math.round(workflow.successRate * 100))}%</span></td><td class="svelte-ae6z9k">${escape_html(formatExecutionTime(workflow.avgExecutionTime))}</td><td class="svelte-ae6z9k"><span class="enhancement-count svelte-ae6z9k">${escape_html(workflow.enhancements)}</span></td><td class="svelte-ae6z9k"><div class="trend-cell svelte-ae6z9k"><span class="trend-icon">${escape_html(getTrendIcon(workflow.trend))}</span> <span class="trend-text svelte-ae6z9k">${escape_html(workflow.trend)}</span></div></td></tr>`;
    }
    $$payload.out += `<!--]--></tbody></table></div></div> <div class="enhancement-section card svelte-ae6z9k"><h2>Recent Enhancements</h2> <div class="enhancement-timeline svelte-ae6z9k"><!--[-->`;
    for (
      let $$index_2 = 0, $$length = each_array_2.length;
      $$index_2 < $$length;
      $$index_2++
    ) {
      let enhancement = each_array_2[$$index_2];
      $$payload.out += `<div class="enhancement-item svelte-ae6z9k"><div class="enhancement-marker svelte-ae6z9k"${attr_style(`background-color: ${stringify(getEnhancementTypeColor(enhancement.type))}`)}></div> <div class="enhancement-content svelte-ae6z9k"><div class="enhancement-header svelte-ae6z9k"><span class="enhancement-type svelte-ae6z9k"${attr_style(`color: ${stringify(getEnhancementTypeColor(enhancement.type))}`)}>${escape_html(enhancement.type)}</span> <span class="enhancement-impact svelte-ae6z9k">+${escape_html(Math.round(enhancement.impact * 100))}% impact</span> <span class="enhancement-date svelte-ae6z9k">${escape_html(new Date(enhancement.date).toLocaleDateString())}</span></div> <div class="enhancement-description svelte-ae6z9k">${escape_html(enhancement.description)}</div> <div class="enhancement-workflow svelte-ae6z9k">Workflow: ${escape_html(enhancement.workflowId)}</div></div></div>`;
    }
    $$payload.out += `<!--]--></div></div> <div class="ecosystem-health card svelte-ae6z9k"><h2>Ecosystem Health</h2> <div class="health-metrics svelte-ae6z9k"><div class="health-item svelte-ae6z9k"><div class="health-label svelte-ae6z9k">Network Connectivity</div> <div class="health-bar svelte-ae6z9k"><div class="health-fill svelte-ae6z9k"${attr_style(`width: ${stringify(analyticsData.ecosystemHealth.networkConnectivity * 100)}%`)}></div></div> <div class="health-value svelte-ae6z9k">${escape_html(Math.round(analyticsData.ecosystemHealth.networkConnectivity * 100))}%</div></div> <div class="health-item svelte-ae6z9k"><div class="health-label svelte-ae6z9k">Cross-Hub Collaboration</div> <div class="health-bar svelte-ae6z9k"><div class="health-fill svelte-ae6z9k"${attr_style(`width: ${stringify(analyticsData.ecosystemHealth.crossHubCollaboration * 100)}%`)}></div></div> <div class="health-value svelte-ae6z9k">${escape_html(Math.round(analyticsData.ecosystemHealth.crossHubCollaboration * 100))}%</div></div> <div class="health-item svelte-ae6z9k"><div class="health-label svelte-ae6z9k">Enhancement Effectiveness</div> <div class="health-bar svelte-ae6z9k"><div class="health-fill svelte-ae6z9k"${attr_style(`width: ${stringify(analyticsData.ecosystemHealth.enhancementEffectiveness * 100)}%`)}></div></div> <div class="health-value svelte-ae6z9k">${escape_html(Math.round(analyticsData.ecosystemHealth.enhancementEffectiveness * 100))}%</div></div> <div class="health-item svelte-ae6z9k"><div class="health-label svelte-ae6z9k">Workflow Diversity</div> <div class="health-bar svelte-ae6z9k"><div class="health-fill svelte-ae6z9k"${attr_style(`width: ${stringify(analyticsData.ecosystemHealth.workflowDiversity * 100)}%`)}></div></div> <div class="health-value svelte-ae6z9k">${escape_html(Math.round(analyticsData.ecosystemHealth.workflowDiversity * 100))}%</div></div></div> <div class="overall-health svelte-ae6z9k"><div class="overall-score"><div class="score-circle svelte-ae6z9k"${attr_style(`--percentage: ${stringify(analyticsData.ecosystemHealth.overallHealth * 100)}%`)}><span class="score-text svelte-ae6z9k">${escape_html(Math.round(analyticsData.ecosystemHealth.overallHealth * 100))}%</span></div> <div class="score-label svelte-ae6z9k">Overall Health Score</div></div></div></div>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></div>`;
  pop();
}
export { _page as default };
