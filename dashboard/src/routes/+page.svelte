<script>
	import { onMount } from 'svelte';
	import HubCard from '$lib/components/HubCard.svelte';
	import NetworkStats from '$lib/components/NetworkStats.svelte';
	import WorkflowOverview from '$lib/components/WorkflowOverview.svelte';

	let hubs = [];
	let networkStats = {};
	let loading = true;

	onMount(async () => {
		// Simulate loading data
		setTimeout(() => {
			hubs = [
				{
					id: 'hub1',
					name: 'Main Hub',
					status: 'online',
					workflowCount: 15,
					lastActivity: new Date().toISOString()
				},
				{
					id: 'hub2', 
					name: 'Development Hub',
					status: 'connecting',
					workflowCount: 8,
					lastActivity: new Date(Date.now() - 3600000).toISOString()
				}
			];
			
			networkStats = {
				totalHubs: 2,
				totalWorkflows: 23,
				activeWorkflows: 18,
				averagePerformance: 0.87
			};
			
			loading = false;
		}, 1000);
	});
</script>

<svelte:head>
	<title>Permamind Dashboard</title>
</svelte:head>

<div class="layout">
	<nav class="sidebar">
		<h2>Permamind</h2>
		<a href="/" class="nav-link active">Dashboard</a>
		<a href="/hubs" class="nav-link">Hubs</a>
		<a href="/workflows" class="nav-link">Workflows</a>
		<a href="/discovery" class="nav-link">Discovery</a>
		<a href="/docs" class="nav-link">Documentation</a>
		<a href="/analytics" class="nav-link">Analytics</a>
	</nav>

	<main class="main-content">
		<div class="container">
			<h1>Permamind Hub Dashboard</h1>
			<p>Monitor and manage your decentralized AI memory ecosystem</p>

			{#if loading}
				<div class="card">
					<p>Loading dashboard data...</p>
				</div>
			{:else}
				<div class="grid grid-2">
					<div class="card">
						<h2>Network Overview</h2>
						<NetworkStats stats={networkStats} />
					</div>
					
					<div class="card">
						<h2>Workflow Status</h2>
						<WorkflowOverview {networkStats} />
					</div>
				</div>

				<div class="card">
					<h2>Connected Hubs</h2>
					<div class="grid grid-3">
						{#each hubs as hub}
							<HubCard {hub} />
						{/each}
					</div>
				</div>

				<div class="card">
					<h2>Quick Actions</h2>
					<div class="grid grid-3">
						<button class="btn">Discover Workflows</button>
						<button class="btn">Create Workflow</button>
						<button class="btn">View Analytics</button>
					</div>
				</div>
			{/if}
		</div>
	</main>
</div>