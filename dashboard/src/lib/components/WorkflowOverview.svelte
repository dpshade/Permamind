<script>
	export let networkStats;
	
	$: activePercentage = Math.round((networkStats.activeWorkflows / networkStats.totalWorkflows) * 100);
	$: inactiveWorkflows = networkStats.totalWorkflows - networkStats.activeWorkflows;
</script>

<div class="workflow-overview">
	<div class="workflow-chart">
		<div class="chart-container">
			<div class="progress-ring">
				<div class="progress-circle" style="--percentage: {activePercentage}%"></div>
				<div class="progress-center">
					<div class="percentage">{activePercentage}%</div>
					<div class="label">Active</div>
				</div>
			</div>
		</div>
	</div>
	
	<div class="workflow-details">
		<div class="workflow-stat">
			<span class="status-indicator status-online"></span>
			<span class="stat-text">Active: {networkStats.activeWorkflows}</span>
		</div>
		<div class="workflow-stat">
			<span class="status-indicator status-offline"></span>
			<span class="stat-text">Inactive: {inactiveWorkflows}</span>
		</div>
		<div class="workflow-stat">
			<span class="status-indicator" style="background: #f59e0b;"></span>
			<span class="stat-text">Performance: {Math.round(networkStats.averagePerformance * 100)}%</span>
		</div>
	</div>
</div>

<style>
	.workflow-overview {
		display: flex;
		align-items: center;
		gap: 20px;
	}
	
	.workflow-chart {
		flex-shrink: 0;
	}
	
	.chart-container {
		width: 120px;
		height: 120px;
		position: relative;
	}
	
	.progress-ring {
		position: relative;
		width: 100%;
		height: 100%;
	}
	
	.progress-circle {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: conic-gradient(#2563eb 0% var(--percentage), #333 var(--percentage) 100%);
		position: relative;
	}
	
	.progress-circle::before {
		content: '';
		position: absolute;
		top: 10px;
		left: 10px;
		right: 10px;
		bottom: 10px;
		background: #1a1a1a;
		border-radius: 50%;
	}
	
	.progress-center {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
	}
	
	.percentage {
		font-size: 20px;
		font-weight: bold;
		color: #2563eb;
	}
	
	.label {
		font-size: 12px;
		color: #888;
	}
	
	.workflow-details {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	
	.workflow-stat {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	
	.stat-text {
		font-size: 14px;
		color: #ccc;
	}
</style>