<script>
	export let stats;
</script>

<div class="stats-grid">
	<div class="stat-item">
		<div class="stat-value">{stats.totalHubs}</div>
		<div class="stat-label">Total Hubs</div>
	</div>
	
	<div class="stat-item">
		<div class="stat-value">{stats.totalWorkflows}</div>
		<div class="stat-label">Total Workflows</div>
	</div>
	
	<div class="stat-item">
		<div class="stat-value">{stats.activeWorkflows}</div>
		<div class="stat-label">Active Workflows</div>
	</div>
	
	<div class="stat-item">
		<div class="stat-value">{Math.round(stats.averagePerformance * 100)}%</div>
		<div class="stat-label">Avg Performance</div>
	</div>
</div>

<style>
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 16px;
	}
	
	.stat-item {
		text-align: center;
		padding: 12px;
		background: #2a2a2a;
		border-radius: 6px;
	}
	
	.stat-value {
		font-size: 24px;
		font-weight: bold;
		color: #2563eb;
		margin-bottom: 4px;
	}
	
	.stat-label {
		font-size: 12px;
		color: #888;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
</style>