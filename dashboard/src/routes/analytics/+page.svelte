<script>
	import { onMount } from 'svelte';

	let analyticsData = null;
	let loading = true;
	let timeRange = '7d';
	let selectedWorkflow = 'all';

	onMount(async () => {
		loadAnalytics();
	});

	async function loadAnalytics() {
		loading = true;
		
		// Simulate API call
		setTimeout(() => {
			analyticsData = {
				summary: {
					totalExecutions: 1247,
					successRate: 0.93,
					averageExecutionTime: 2340,
					totalEnhancements: 23,
					activeWorkflows: 8,
					topPerformer: 'Data Processing Pipeline'
				},
				performanceMetrics: [
					{ date: '2024-01-01', executions: 45, successRate: 0.91, avgTime: 2100 },
					{ date: '2024-01-02', executions: 52, successRate: 0.94, avgTime: 2050 },
					{ date: '2024-01-03', executions: 38, successRate: 0.89, avgTime: 2300 },
					{ date: '2024-01-04', executions: 61, successRate: 0.96, avgTime: 1980 },
					{ date: '2024-01-05', executions: 55, successRate: 0.93, avgTime: 2150 },
					{ date: '2024-01-06', executions: 49, successRate: 0.92, avgTime: 2200 },
					{ date: '2024-01-07', executions: 58, successRate: 0.95, avgTime: 2000 }
				],
				workflowMetrics: [
					{
						id: 'wf-001',
						name: 'Data Processing Pipeline',
						executions: 423,
						successRate: 0.97,
						avgExecutionTime: 1850,
						enhancements: 8,
						trend: 'improving'
					},
					{
						id: 'wf-002',
						name: 'ML Model Training',
						executions: 234,
						successRate: 0.89,
						avgExecutionTime: 4200,
						enhancements: 12,
						trend: 'stable'
					},
					{
						id: 'wf-003',
						name: 'API Integration',
						executions: 156,
						successRate: 0.94,
						avgExecutionTime: 980,
						enhancements: 3,
						trend: 'improving'
					}
				],
				enhancementHistory: [
					{
						date: '2024-01-07',
						workflowId: 'wf-001',
						type: 'optimization',
						impact: 0.15,
						description: 'Optimized data caching strategy'
					},
					{
						date: '2024-01-06',
						workflowId: 'wf-002',
						type: 'bug_fix',
						impact: 0.08,
						description: 'Fixed memory leak in training loop'
					},
					{
						date: '2024-01-05',
						workflowId: 'wf-001',
						type: 'feature_add',
						impact: 0.12,
						description: 'Added parallel processing support'
					}
				],
				ecosystemHealth: {
					networkConnectivity: 0.94,
					crossHubCollaboration: 0.76,
					enhancementEffectiveness: 0.88,
					workflowDiversity: 0.82,
					overallHealth: 0.85
				}
			};
			loading = false;
		}, 1000);
	}

	function formatExecutionTime(ms) {
		if (ms < 1000) return `${ms}ms`;
		if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
		return `${(ms / 60000).toFixed(1)}m`;
	}

	function getTrendIcon(trend) {
		switch(trend) {
			case 'improving': return '📈';
			case 'declining': return '📉';
			case 'stable': return '➡️';
			default: return '';
		}
	}

	function getEnhancementTypeColor(type) {
		switch(type) {
			case 'optimization': return '#10b981';
			case 'bug_fix': return '#ef4444';
			case 'feature_add': return '#2563eb';
			case 'refactor': return '#8b5cf6';
			default: return '#6b7280';
		}
	}

	$: if (timeRange) {
		loadAnalytics();
	}
</script>

<svelte:head>
	<title>Analytics - Permamind Dashboard</title>
</svelte:head>

<div class="container">
	<div class="page-header">
		<h1>Workflow Analytics</h1>
		<p>Performance insights and ecosystem health metrics</p>
	</div>

	<div class="controls card">
		<div class="control-group">
			<label>Time Range:</label>
			<select bind:value={timeRange} class="control-select">
				<option value="24h">Last 24 Hours</option>
				<option value="7d">Last 7 Days</option>
				<option value="30d">Last 30 Days</option>
				<option value="90d">Last 90 Days</option>
			</select>
		</div>
		
		<div class="control-group">
			<label>Workflow:</label>
			<select bind:value={selectedWorkflow} class="control-select">
				<option value="all">All Workflows</option>
				<option value="wf-001">Data Processing Pipeline</option>
				<option value="wf-002">ML Model Training</option>
				<option value="wf-003">API Integration</option>
			</select>
		</div>
		
		<button class="btn">Export Report</button>
	</div>

	{#if loading}
		<div class="card">
			<p>Loading analytics data...</p>
		</div>
	{:else if analyticsData}
		<!-- Summary Section -->
		<div class="summary-section card">
			<h2>Performance Summary</h2>
			<div class="summary-grid">
				<div class="summary-item">
					<div class="summary-value">{analyticsData.summary.totalExecutions.toLocaleString()}</div>
					<div class="summary-label">Total Executions</div>
				</div>
				<div class="summary-item">
					<div class="summary-value">{Math.round(analyticsData.summary.successRate * 100)}%</div>
					<div class="summary-label">Success Rate</div>
				</div>
				<div class="summary-item">
					<div class="summary-value">{formatExecutionTime(analyticsData.summary.averageExecutionTime)}</div>
					<div class="summary-label">Avg Execution Time</div>
				</div>
				<div class="summary-item">
					<div class="summary-value">{analyticsData.summary.totalEnhancements}</div>
					<div class="summary-label">Total Enhancements</div>
				</div>
				<div class="summary-item">
					<div class="summary-value">{analyticsData.summary.activeWorkflows}</div>
					<div class="summary-label">Active Workflows</div>
				</div>
				<div class="summary-item top-performer">
					<div class="summary-value">🏆</div>
					<div class="summary-label">Top Performer</div>
					<div class="performer-name">{analyticsData.summary.topPerformer}</div>
				</div>
			</div>
		</div>

		<!-- Performance Chart Section -->
		<div class="chart-section card">
			<h2>Performance Trends</h2>
			<div class="chart-container">
				<div class="chart-metrics">
					<div class="metric-selector">
						<button class="metric-btn active">Executions</button>
						<button class="metric-btn">Success Rate</button>
						<button class="metric-btn">Avg Time</button>
					</div>
				</div>
				<div class="simple-chart">
					<div class="chart-bars">
						{#each analyticsData.performanceMetrics as metric, i}
							<div class="chart-bar">
								<div class="bar" style="height: {(metric.executions / 70) * 100}%"></div>
								<div class="bar-label">{new Date(metric.date).getDate()}</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<!-- Workflow Performance Section -->
		<div class="workflow-performance card">
			<h2>Workflow Performance</h2>
			<div class="workflow-table">
				<table>
					<thead>
						<tr>
							<th>Workflow</th>
							<th>Executions</th>
							<th>Success Rate</th>
							<th>Avg Time</th>
							<th>Enhancements</th>
							<th>Trend</th>
						</tr>
					</thead>
					<tbody>
						{#each analyticsData.workflowMetrics as workflow}
							<tr>
								<td class="workflow-name">{workflow.name}</td>
								<td>{workflow.executions.toLocaleString()}</td>
								<td>
									<span class="success-rate" class:high={workflow.successRate >= 0.95} class:medium={workflow.successRate >= 0.90 && workflow.successRate < 0.95}>
										{Math.round(workflow.successRate * 100)}%
									</span>
								</td>
								<td>{formatExecutionTime(workflow.avgExecutionTime)}</td>
								<td>
									<span class="enhancement-count">{workflow.enhancements}</span>
								</td>
								<td>
									<div class="trend-cell">
										<span class="trend-icon">{getTrendIcon(workflow.trend)}</span>
										<span class="trend-text">{workflow.trend}</span>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Enhancement History Section -->
		<div class="enhancement-section card">
			<h2>Recent Enhancements</h2>
			<div class="enhancement-timeline">
				{#each analyticsData.enhancementHistory as enhancement}
					<div class="enhancement-item">
						<div class="enhancement-marker" style="background-color: {getEnhancementTypeColor(enhancement.type)}"></div>
						<div class="enhancement-content">
							<div class="enhancement-header">
								<span class="enhancement-type" style="color: {getEnhancementTypeColor(enhancement.type)}">{enhancement.type}</span>
								<span class="enhancement-impact">+{Math.round(enhancement.impact * 100)}% impact</span>
								<span class="enhancement-date">{new Date(enhancement.date).toLocaleDateString()}</span>
							</div>
							<div class="enhancement-description">{enhancement.description}</div>
							<div class="enhancement-workflow">Workflow: {enhancement.workflowId}</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Ecosystem Health Section -->
		<div class="ecosystem-health card">
			<h2>Ecosystem Health</h2>
			<div class="health-metrics">
				<div class="health-item">
					<div class="health-label">Network Connectivity</div>
					<div class="health-bar">
						<div class="health-fill" style="width: {analyticsData.ecosystemHealth.networkConnectivity * 100}%"></div>
					</div>
					<div class="health-value">{Math.round(analyticsData.ecosystemHealth.networkConnectivity * 100)}%</div>
				</div>
				<div class="health-item">
					<div class="health-label">Cross-Hub Collaboration</div>
					<div class="health-bar">
						<div class="health-fill" style="width: {analyticsData.ecosystemHealth.crossHubCollaboration * 100}%"></div>
					</div>
					<div class="health-value">{Math.round(analyticsData.ecosystemHealth.crossHubCollaboration * 100)}%</div>
				</div>
				<div class="health-item">
					<div class="health-label">Enhancement Effectiveness</div>
					<div class="health-bar">
						<div class="health-fill" style="width: {analyticsData.ecosystemHealth.enhancementEffectiveness * 100}%"></div>
					</div>
					<div class="health-value">{Math.round(analyticsData.ecosystemHealth.enhancementEffectiveness * 100)}%</div>
				</div>
				<div class="health-item">
					<div class="health-label">Workflow Diversity</div>
					<div class="health-bar">
						<div class="health-fill" style="width: {analyticsData.ecosystemHealth.workflowDiversity * 100}%"></div>
					</div>
					<div class="health-value">{Math.round(analyticsData.ecosystemHealth.workflowDiversity * 100)}%</div>
				</div>
			</div>
			<div class="overall-health">
				<div class="overall-score">
					<div class="score-circle" style="--percentage: {analyticsData.ecosystemHealth.overallHealth * 100}%">
						<span class="score-text">{Math.round(analyticsData.ecosystemHealth.overallHealth * 100)}%</span>
					</div>
					<div class="score-label">Overall Health Score</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.page-header {
		margin-bottom: 24px;
	}

	.controls {
		display: flex;
		align-items: center;
		gap: 20px;
		margin-bottom: 24px;
	}

	.control-group {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.control-group label {
		color: #ccc;
		font-size: 14px;
		white-space: nowrap;
	}

	.control-select {
		padding: 8px 12px;
		background: #2a2a2a;
		border: 1px solid #444;
		border-radius: 4px;
		color: white;
		font-size: 14px;
	}

	.summary-section {
		margin-bottom: 24px;
	}

	.summary-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 16px;
		margin-top: 16px;
	}

	.summary-item {
		text-align: center;
		padding: 20px;
		background: #2a2a2a;
		border-radius: 8px;
	}

	.summary-value {
		font-size: 28px;
		font-weight: bold;
		color: #2563eb;
		margin-bottom: 8px;
	}

	.summary-label {
		font-size: 12px;
		color: #888;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.top-performer .summary-value {
		font-size: 24px;
	}

	.performer-name {
		font-size: 11px;
		color: #fbbf24;
		margin-top: 4px;
		font-weight: 500;
	}

	.chart-section {
		margin-bottom: 24px;
	}

	.chart-container {
		margin-top: 16px;
	}

	.chart-metrics {
		margin-bottom: 20px;
	}

	.metric-selector {
		display: flex;
		gap: 8px;
	}

	.metric-btn {
		padding: 6px 12px;
		background: #333;
		border: 1px solid #555;
		border-radius: 4px;
		color: white;
		cursor: pointer;
		font-size: 12px;
	}

	.metric-btn.active {
		background: #2563eb;
		border-color: #2563eb;
	}

	.simple-chart {
		height: 200px;
		padding: 20px 0;
	}

	.chart-bars {
		display: flex;
		align-items: flex-end;
		height: 100%;
		gap: 8px;
		justify-content: space-between;
	}

	.chart-bar {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 100%;
	}

	.bar {
		width: 100%;
		background: linear-gradient(to top, #2563eb, #8b5cf6);
		border-radius: 4px 4px 0 0;
		min-height: 4px;
		transition: height 0.3s ease;
	}

	.bar-label {
		margin-top: 8px;
		font-size: 12px;
		color: #888;
	}

	.workflow-performance {
		margin-bottom: 24px;
	}

	.workflow-table {
		margin-top: 16px;
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th, td {
		text-align: left;
		padding: 12px;
		border-bottom: 1px solid #333;
	}

	th {
		background: #2a2a2a;
		color: #ccc;
		font-weight: 500;
		font-size: 14px;
	}

	.workflow-name {
		color: #fff;
		font-weight: 500;
	}

	.success-rate {
		color: #ef4444;
		font-weight: 500;
	}

	.success-rate.medium {
		color: #fbbf24;
	}

	.success-rate.high {
		color: #10b981;
	}

	.enhancement-count {
		background: #2563eb;
		color: white;
		padding: 2px 8px;
		border-radius: 12px;
		font-size: 12px;
	}

	.trend-cell {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.trend-text {
		font-size: 14px;
		text-transform: capitalize;
	}

	.enhancement-section {
		margin-bottom: 24px;
	}

	.enhancement-timeline {
		margin-top: 16px;
	}

	.enhancement-item {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		margin-bottom: 16px;
		padding: 16px;
		background: #2a2a2a;
		border-radius: 6px;
	}

	.enhancement-marker {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		margin-top: 6px;
		flex-shrink: 0;
	}

	.enhancement-content {
		flex: 1;
	}

	.enhancement-header {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 6px;
	}

	.enhancement-type {
		font-weight: 500;
		text-transform: capitalize;
		font-size: 14px;
	}

	.enhancement-impact {
		background: rgba(16, 185, 129, 0.2);
		color: #10b981;
		padding: 2px 6px;
		border-radius: 3px;
		font-size: 12px;
	}

	.enhancement-date {
		color: #888;
		font-size: 12px;
		margin-left: auto;
	}

	.enhancement-description {
		color: #ccc;
		font-size: 14px;
		margin-bottom: 4px;
	}

	.enhancement-workflow {
		color: #888;
		font-size: 12px;
		font-family: monospace;
	}

	.ecosystem-health {
		margin-bottom: 24px;
	}

	.health-metrics {
		margin: 16px 0;
	}

	.health-item {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 12px;
	}

	.health-label {
		min-width: 180px;
		color: #ccc;
		font-size: 14px;
	}

	.health-bar {
		flex: 1;
		height: 8px;
		background: #333;
		border-radius: 4px;
		overflow: hidden;
	}

	.health-fill {
		height: 100%;
		background: linear-gradient(90deg, #ef4444, #fbbf24, #10b981);
		transition: width 0.3s ease;
	}

	.health-value {
		min-width: 40px;
		text-align: right;
		color: #fff;
		font-weight: 500;
	}

	.overall-health {
		margin-top: 24px;
		text-align: center;
	}

	.score-circle {
		width: 120px;
		height: 120px;
		border-radius: 50%;
		background: conic-gradient(#2563eb 0% var(--percentage), #333 var(--percentage) 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 12px;
		position: relative;
	}

	.score-circle::before {
		content: '';
		position: absolute;
		width: 90px;
		height: 90px;
		background: #1a1a1a;
		border-radius: 50%;
	}

	.score-text {
		position: relative;
		font-size: 24px;
		font-weight: bold;
		color: #2563eb;
	}

	.score-label {
		color: #888;
		font-size: 14px;
	}
</style>