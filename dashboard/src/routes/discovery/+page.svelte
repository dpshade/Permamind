<script>
	import { onMount } from 'svelte';

	let searchQuery = '';
	let discoveryType = 'search';
	let searchResults = [];
	let loading = false;
	let capabilities = [];
	let networkStats = null;

	onMount(async () => {
		// Load initial data
		loadNetworkStats();
		loadTopCapabilities();
	});

	async function loadNetworkStats() {
		// Simulate API call
		setTimeout(() => {
			networkStats = {
				totalHubs: 47,
				totalWorkflows: 312,
				topCapabilities: ['data-processing', 'machine-learning', 'api-integration', 'text-analysis', 'image-processing'],
				networkHealthScore: 0.91,
				activeConnections: 156
			};
		}, 500);
	}

	async function loadTopCapabilities() {
		capabilities = [
			{ name: 'data-processing', count: 67, trend: 'up' },
			{ name: 'machine-learning', count: 45, trend: 'up' },
			{ name: 'api-integration', count: 38, trend: 'stable' },
			{ name: 'text-analysis', count: 29, trend: 'up' },
			{ name: 'image-processing', count: 24, trend: 'down' },
			{ name: 'real-time', count: 19, trend: 'up' },
			{ name: 'automation', count: 16, trend: 'stable' },
			{ name: 'optimization', count: 14, trend: 'up' }
		];
	}

	async function performDiscovery() {
		if (!searchQuery.trim()) return;
		
		loading = true;
		
		// Simulate API call
		setTimeout(() => {
			searchResults = [
				{
					id: 'ext-wf-001',
					name: 'Advanced ML Pipeline',
					hubId: 'hub-alpha-123',
					capabilities: ['machine-learning', 'optimization', 'real-time'],
					performanceScore: 0.94,
					reputationScore: 0.89,
					description: 'High-performance machine learning pipeline with automatic optimization',
					lastUpdated: new Date(Date.now() - 3600000).toISOString(),
					usage: 234,
					enhancements: 12
				},
				{
					id: 'ext-wf-002', 
					name: 'Data Processing Engine',
					hubId: 'hub-beta-456',
					capabilities: ['data-processing', 'scalable', 'streaming'],
					performanceScore: 0.87,
					reputationScore: 0.92,
					description: 'Scalable data processing engine for real-time streaming applications',
					lastUpdated: new Date(Date.now() - 7200000).toISOString(),
					usage: 156,
					enhancements: 8
				},
				{
					id: 'ext-wf-003',
					name: 'NLP Text Analyzer',
					hubId: 'hub-gamma-789',
					capabilities: ['text-analysis', 'nlp', 'classification'],
					performanceScore: 0.91,
					reputationScore: 0.85,
					description: 'Advanced natural language processing with sentiment analysis',
					lastUpdated: new Date(Date.now() - 1800000).toISOString(),
					usage: 89,
					enhancements: 15
				}
			];
			loading = false;
		}, 1500);
	}

	function formatLastUpdated(dateString) {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now - date;
		const diffHours = Math.floor(diffMs / 3600000);
		
		if (diffHours < 24) return `${diffHours}h ago`;
		return `${Math.floor(diffHours / 24)}d ago`;
	}

	function getTrendIcon(trend) {
		switch(trend) {
			case 'up': return '↗️';
			case 'down': return '↘️';
			case 'stable': return '→';
			default: return '';
		}
	}
</script>

<svelte:head>
	<title>Discovery - Permamind Dashboard</title>
</svelte:head>

<div class="container">
	<div class="page-header">
		<h1>Cross-Hub Discovery</h1>
		<p>Discover workflows and capabilities across the Permamind network</p>
	</div>

	{#if networkStats}
		<div class="network-overview card">
			<h2>Network Overview</h2>
			<div class="stats-row">
				<div class="stat-item">
					<div class="stat-value">{networkStats.totalHubs}</div>
					<div class="stat-label">Connected Hubs</div>
				</div>
				<div class="stat-item">
					<div class="stat-value">{networkStats.totalWorkflows}</div>
					<div class="stat-label">Available Workflows</div>
				</div>
				<div class="stat-item">
					<div class="stat-value">{networkStats.activeConnections}</div>
					<div class="stat-label">Active Connections</div>
				</div>
				<div class="stat-item">
					<div class="stat-value">{Math.round(networkStats.networkHealthScore * 100)}%</div>
					<div class="stat-label">Network Health</div>
				</div>
			</div>
		</div>
	{/if}

	<div class="discovery-section card">
		<h2>Workflow Discovery</h2>
		
		<div class="discovery-controls">
			<div class="discovery-type">
				<label>Discovery Type:</label>
				<select bind:value={discoveryType} class="type-select">
					<option value="search">Global Search</option>
					<option value="capability">By Capability</option>
					<option value="requirements">By Requirements</option>
					<option value="similar">Similar Workflows</option>
				</select>
			</div>
			
			<div class="search-section">
				<input 
					type="text" 
					placeholder={discoveryType === 'capability' ? 'Enter capability (e.g., machine-learning)' : 
								discoveryType === 'requirements' ? 'Enter requirements (comma-separated)' :
								discoveryType === 'similar' ? 'Enter your workflow ID' :
								'Search workflows across the network...'}
					bind:value={searchQuery}
					class="search-input"
				/>
				<button class="btn" on:click={performDiscovery} disabled={loading || !searchQuery.trim()}>
					{loading ? 'Searching...' : 'Discover'}
				</button>
			</div>
		</div>

		{#if loading}
			<div class="loading-state">
				<p>Searching across {networkStats?.totalHubs || 0} hubs...</p>
				<div class="progress-bar">
					<div class="progress-fill"></div>
				</div>
			</div>
		{/if}

		{#if searchResults.length > 0}
			<div class="results-section">
				<div class="results-header">
					<h3>Discovery Results ({searchResults.length})</h3>
					<div class="sort-controls">
						<select class="sort-select">
							<option value="performance">Sort by Performance</option>
							<option value="reputation">Sort by Reputation</option>
							<option value="usage">Sort by Usage</option>
							<option value="recent">Sort by Recent</option>
						</select>
					</div>
				</div>

				<div class="results-grid">
					{#each searchResults as result}
						<div class="result-card">
							<div class="result-header">
								<h4>{result.name}</h4>
								<div class="result-scores">
									<div class="score-item">
										<span class="score-label">Performance</span>
										<span class="score-value performance-score">{Math.round(result.performanceScore * 100)}%</span>
									</div>
									<div class="score-item">
										<span class="score-label">Reputation</span>
										<span class="score-value reputation-score">{Math.round(result.reputationScore * 100)}%</span>
									</div>
								</div>
							</div>

							<div class="result-description">
								{result.description}
							</div>

							<div class="result-capabilities">
								{#each result.capabilities as capability}
									<span class="capability-tag">{capability}</span>
								{/each}
							</div>

							<div class="result-meta">
								<div class="meta-row">
									<span class="meta-label">Hub ID:</span>
									<span class="meta-value">{result.hubId}</span>
								</div>
								<div class="meta-row">
									<span class="meta-label">Usage:</span>
									<span class="meta-value">{result.usage} executions</span>
								</div>
								<div class="meta-row">
									<span class="meta-label">Enhancements:</span>
									<span class="meta-value">{result.enhancements} improvements</span>
								</div>
								<div class="meta-row">
									<span class="meta-label">Updated:</span>
									<span class="meta-value">{formatLastUpdated(result.lastUpdated)}</span>
								</div>
							</div>

							<div class="result-actions">
								<button class="btn-small">View Details</button>
								<button class="btn-small">Request Patterns</button>
								<button class="btn-small">Create Similar</button>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<div class="capabilities-section card">
		<h2>Popular Capabilities</h2>
		<div class="capabilities-grid">
			{#each capabilities as capability}
				<div class="capability-item" on:click={() => { searchQuery = capability.name; discoveryType = 'capability'; }}>
					<div class="capability-header">
						<span class="capability-name">{capability.name}</span>
						<span class="trend-indicator">{getTrendIcon(capability.trend)}</span>
					</div>
					<div class="capability-count">{capability.count} workflows</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.page-header {
		margin-bottom: 24px;
	}

	.network-overview {
		margin-bottom: 24px;
	}

	.stats-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 16px;
		margin-top: 16px;
	}

	.stat-item {
		text-align: center;
		padding: 16px;
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
	}

	.discovery-section {
		margin-bottom: 24px;
	}

	.discovery-controls {
		display: flex;
		flex-direction: column;
		gap: 16px;
		margin-bottom: 20px;
	}

	.discovery-type {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.discovery-type label {
		color: #ccc;
		font-size: 14px;
	}

	.type-select, .sort-select {
		padding: 8px 12px;
		background: #2a2a2a;
		border: 1px solid #444;
		border-radius: 4px;
		color: white;
		font-size: 14px;
	}

	.search-section {
		display: flex;
		gap: 12px;
	}

	.search-input {
		flex: 1;
		padding: 10px 12px;
		background: #2a2a2a;
		border: 1px solid #444;
		border-radius: 6px;
		color: white;
		font-size: 14px;
	}

	.search-input:focus {
		outline: none;
		border-color: #2563eb;
	}

	.loading-state {
		text-align: center;
		padding: 40px;
	}

	.progress-bar {
		width: 200px;
		height: 4px;
		background: #333;
		border-radius: 2px;
		margin: 16px auto;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #2563eb, #8b5cf6);
		animation: progress 2s ease-in-out infinite;
	}

	@keyframes progress {
		0% { transform: translateX(-100%); }
		100% { transform: translateX(100%); }
	}

	.results-section {
		margin-top: 20px;
	}

	.results-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
	}

	.results-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 20px;
	}

	.result-card {
		background: #222;
		border: 1px solid #444;
		border-radius: 8px;
		padding: 20px;
		transition: border-color 0.2s;
	}

	.result-card:hover {
		border-color: #2563eb;
	}

	.result-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 12px;
	}

	.result-header h4 {
		margin: 0;
		color: #fff;
		font-size: 16px;
	}

	.result-scores {
		display: flex;
		gap: 12px;
	}

	.score-item {
		text-align: center;
	}

	.score-label {
		display: block;
		font-size: 10px;
		color: #888;
		text-transform: uppercase;
	}

	.score-value {
		display: block;
		font-size: 14px;
		font-weight: bold;
		margin-top: 2px;
	}

	.performance-score {
		color: #10b981;
	}

	.reputation-score {
		color: #fbbf24;
	}

	.result-description {
		color: #ccc;
		font-size: 14px;
		line-height: 1.4;
		margin-bottom: 12px;
	}

	.result-capabilities {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-bottom: 12px;
	}

	.capability-tag {
		font-size: 11px;
		background: #2563eb;
		color: white;
		padding: 3px 8px;
		border-radius: 4px;
	}

	.result-meta {
		margin-bottom: 16px;
	}

	.meta-row {
		display: flex;
		justify-content: space-between;
		margin: 4px 0;
		font-size: 12px;
	}

	.meta-label {
		color: #888;
	}

	.meta-value {
		color: #ccc;
		font-family: monospace;
	}

	.result-actions {
		display: flex;
		gap: 8px;
	}

	.btn-small {
		background: #333;
		color: white;
		border: 1px solid #555;
		padding: 6px 12px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 12px;
		flex: 1;
	}

	.btn-small:hover {
		background: #2563eb;
		border-color: #2563eb;
	}

	.capabilities-section {
		margin-bottom: 24px;
	}

	.capabilities-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 12px;
		margin-top: 16px;
	}

	.capability-item {
		background: #2a2a2a;
		border: 1px solid #444;
		border-radius: 6px;
		padding: 16px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.capability-item:hover {
		background: #333;
		border-color: #2563eb;
	}

	.capability-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}

	.capability-name {
		font-weight: 500;
		color: #fff;
	}

	.trend-indicator {
		font-size: 16px;
	}

	.capability-count {
		color: #888;
		font-size: 14px;
	}
</style>