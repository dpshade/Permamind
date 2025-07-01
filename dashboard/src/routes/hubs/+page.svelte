<script>
	import { onMount } from 'svelte';
	import HubCard from '$lib/components/HubCard.svelte';

	let hubs = [];
	let loading = true;
	let searchTerm = '';

	onMount(async () => {
		// Simulate API call to discover hubs
		setTimeout(() => {
			hubs = [
				{
					id: 'hub1',
					name: 'Main Hub',
					status: 'online',
					workflowCount: 15,
					lastActivity: new Date().toISOString(),
					processId: 'main-hub-process-id-123',
					reputationScore: 0.92
				},
				{
					id: 'hub2',
					name: 'Development Hub',
					status: 'connecting',
					workflowCount: 8,
					lastActivity: new Date(Date.now() - 3600000).toISOString(),
					processId: 'dev-hub-process-id-456',
					reputationScore: 0.78
				},
				{
					id: 'hub3',
					name: 'Research Hub',
					status: 'online',
					workflowCount: 23,
					lastActivity: new Date(Date.now() - 1800000).toISOString(),
					processId: 'research-hub-process-id-789',
					reputationScore: 0.88
				}
			];
			loading = false;
		}, 1000);
	});

	$: filteredHubs = hubs.filter(hub => 
		hub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
		hub.processId.toLowerCase().includes(searchTerm.toLowerCase())
	);
</script>

<svelte:head>
	<title>Hubs - Permamind Dashboard</title>
</svelte:head>

<div class="container">
	<div class="page-header">
		<h1>Hub Discovery</h1>
		<p>Discover and connect to Permamind hubs across the network</p>
	</div>

	<div class="search-section card">
		<div class="search-controls">
			<input 
				type="text" 
				placeholder="Search hubs by name or process ID..." 
				bind:value={searchTerm}
				class="search-input"
			/>
			<button class="btn">Refresh Discovery</button>
		</div>
	</div>

	{#if loading}
		<div class="card">
			<p>Discovering hubs across the network...</p>
		</div>
	{:else}
		<div class="card">
			<div class="hubs-header">
				<h2>Available Hubs ({filteredHubs.length})</h2>
				<div class="view-controls">
					<button class="btn-small">Grid View</button>
					<button class="btn-small">List View</button>
				</div>
			</div>
			
			<div class="hubs-grid">
				{#each filteredHubs as hub}
					<div class="hub-item">
						<HubCard {hub} />
						<div class="hub-meta">
							<div class="meta-item">
								<span class="meta-label">Process ID:</span>
								<span class="meta-value">{hub.processId.slice(0, 16)}...</span>
							</div>
							<div class="meta-item">
								<span class="meta-label">Reputation:</span>
								<span class="meta-value">{Math.round(hub.reputationScore * 100)}%</span>
							</div>
						</div>
					</div>
				{/each}
			</div>

			{#if filteredHubs.length === 0}
				<div class="empty-state">
					<p>No hubs found matching your search criteria.</p>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.page-header {
		margin-bottom: 24px;
	}
	
	.search-section {
		margin-bottom: 24px;
	}
	
	.search-controls {
		display: flex;
		gap: 12px;
		align-items: center;
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
	
	.hubs-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
	}
	
	.view-controls {
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
	}
	
	.btn-small:hover {
		background: #2563eb;
		border-color: #2563eb;
	}
	
	.hubs-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 20px;
	}
	
	.hub-item {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	
	.hub-meta {
		font-size: 12px;
		color: #888;
	}
	
	.meta-item {
		display: flex;
		justify-content: space-between;
		margin: 2px 0;
	}
	
	.meta-label {
		color: #666;
	}
	
	.meta-value {
		color: #ccc;
		font-family: monospace;
	}
	
	.empty-state {
		text-align: center;
		padding: 40px;
		color: #888;
	}
</style>