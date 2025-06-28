<script>
	import { onMount } from 'svelte';

	let workflows = [];
	let loading = true;
	let searchTerm = '';
	let filterStatus = 'all';
	let filterStage = 'all';

	onMount(async () => {
		// Simulate API call to fetch workflows
		setTimeout(() => {
			workflows = [
				{
					id: 'wf-001',
					name: 'Data Processing Pipeline',
					stage: 'execution',
					status: 'active',
					performance: 0.87,
					lastExecuted: new Date().toISOString(),
					executionTime: 2340,
					successRate: 0.94,
					version: '2.1.0',
					capabilities: ['data-processing', 'real-time', 'scalable'],
					dependencies: []
				},
				{
					id: 'wf-002', 
					name: 'ML Model Training',
					stage: 'optimization',
					status: 'enhancing',
					performance: 0.72,
					lastExecuted: new Date(Date.now() - 7200000).toISOString(),
					executionTime: 45000,
					successRate: 0.89,
					version: '1.3.2',
					capabilities: ['machine-learning', 'training', 'optimization'],
					dependencies: ['wf-001']
				},
				{
					id: 'wf-003',
					name: 'API Integration',
					stage: 'planning',
					status: 'inactive',
					performance: 0.0,
					lastExecuted: null,
					executionTime: 0,
					successRate: 0.0,
					version: '1.0.0',
					capabilities: ['api-integration', 'webhooks'],
					dependencies: []
				}
			];
			loading = false;
		}, 1000);
	});

	$: filteredWorkflows = workflows.filter(workflow => {
		const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
							workflow.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
							workflow.capabilities.some(cap => cap.includes(searchTerm.toLowerCase()));
		
		const matchesStatus = filterStatus === 'all' || workflow.status === filterStatus;
		const matchesStage = filterStage === 'all' || workflow.stage === filterStage;
		
		return matchesSearch && matchesStatus && matchesStage;
	});

	function getStatusClass(status) {
		switch(status) {
			case 'active': return 'status-online';
			case 'enhancing': return 'status-connecting';
			case 'inactive': return 'status-offline';
			default: return 'status-offline';
		}
	}

	function formatExecutionTime(ms) {
		if (ms === 0) return 'N/A';
		if (ms < 1000) return `${ms}ms`;
		if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
		return `${(ms / 60000).toFixed(1)}m`;
	}

	function formatLastExecuted(dateString) {
		if (!dateString) return 'Never';
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now - date;
		const diffMins = Math.floor(diffMs / 60000);
		
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
		return `${Math.floor(diffMins / 1440)}d ago`;
	}
</script>

<svelte:head>
	<title>Workflows - Permamind Dashboard</title>
</svelte:head>

<div class="container">
	<div class="page-header">
		<h1>Workflow Management</h1>
		<p>Monitor and manage your AI workflows and their performance</p>
	</div>

	<div class="controls card">
		<div class="search-section">
			<input 
				type="text" 
				placeholder="Search workflows by name, ID, or capability..." 
				bind:value={searchTerm}
				class="search-input"
			/>
		</div>
		
		<div class="filter-section">
			<div class="filter-group">
				<label>Status:</label>
				<select bind:value={filterStatus} class="filter-select">
					<option value="all">All Status</option>
					<option value="active">Active</option>
					<option value="enhancing">Enhancing</option>
					<option value="inactive">Inactive</option>
				</select>
			</div>
			
			<div class="filter-group">
				<label>Stage:</label>
				<select bind:value={filterStage} class="filter-select">
					<option value="all">All Stages</option>
					<option value="planning">Planning</option>
					<option value="execution">Execution</option>
					<option value="evaluation">Evaluation</option>
					<option value="optimization">Optimization</option>
					<option value="archived">Archived</option>
				</select>
			</div>
		</div>
		
		<div class="actions">
			<button class="btn">Create Workflow</button>
			<button class="btn">Import Workflow</button>
		</div>
	</div>

	{#if loading}
		<div class="card">
			<p>Loading workflows...</p>
		</div>
	{:else}
		<div class="workflows-section">
			<div class="section-header">
				<h2>Workflows ({filteredWorkflows.length})</h2>
				<div class="view-controls">
					<button class="btn-small">Table View</button>
					<button class="btn-small">Card View</button>
				</div>
			</div>

			{#if filteredWorkflows.length === 0}
				<div class="card empty-state">
					<p>No workflows found matching your criteria.</p>
				</div>
			{:else}
				<div class="workflows-table card">
					<table>
						<thead>
							<tr>
								<th>Workflow</th>
								<th>Status</th>
								<th>Stage</th>
								<th>Performance</th>
								<th>Success Rate</th>
								<th>Last Executed</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each filteredWorkflows as workflow}
								<tr class="workflow-row">
									<td class="workflow-info">
										<div class="workflow-name">{workflow.name}</div>
										<div class="workflow-meta">
											<span class="workflow-id">{workflow.id}</span>
											<span class="workflow-version">v{workflow.version}</span>
										</div>
										<div class="capabilities">
											{#each workflow.capabilities as capability}
												<span class="capability-tag">{capability}</span>
											{/each}
										</div>
									</td>
									<td>
										<div class="status-cell">
											<span class="status-indicator {getStatusClass(workflow.status)}"></span>
											<span class="status-text">{workflow.status}</span>
										</div>
									</td>
									<td>
										<span class="stage-badge stage-{workflow.stage}">{workflow.stage}</span>
									</td>
									<td>
										<div class="performance-cell">
											<div class="performance-bar">
												<div class="performance-fill" style="width: {workflow.performance * 100}%"></div>
											</div>
											<span class="performance-value">{Math.round(workflow.performance * 100)}%</span>
										</div>
									</td>
									<td>
										<span class="success-rate">{Math.round(workflow.successRate * 100)}%</span>
									</td>
									<td>
										<span class="last-executed">{formatLastExecuted(workflow.lastExecuted)}</span>
										<div class="execution-time">({formatExecutionTime(workflow.executionTime)})</div>
									</td>
									<td>
										<div class="workflow-actions">
											<button class="btn-small">View</button>
											<button class="btn-small">Edit</button>
											<button class="btn-small">Run</button>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.page-header {
		margin-bottom: 24px;
	}

	.controls {
		display: flex;
		flex-direction: column;
		gap: 16px;
		margin-bottom: 24px;
	}

	.search-section {
		flex: 1;
	}

	.search-input {
		width: 100%;
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

	.filter-section {
		display: flex;
		gap: 16px;
		align-items: center;
	}

	.filter-group {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.filter-group label {
		font-size: 14px;
		color: #ccc;
		white-space: nowrap;
	}

	.filter-select {
		padding: 6px 10px;
		background: #2a2a2a;
		border: 1px solid #444;
		border-radius: 4px;
		color: white;
		font-size: 14px;
	}

	.actions {
		display: flex;
		gap: 12px;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
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

	.workflows-table {
		overflow-x: auto;
		padding: 0;
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

	.workflow-row:hover {
		background: #222;
	}

	.workflow-info {
		min-width: 250px;
	}

	.workflow-name {
		font-weight: 500;
		color: #fff;
		margin-bottom: 4px;
	}

	.workflow-meta {
		display: flex;
		gap: 8px;
		margin-bottom: 6px;
	}

	.workflow-id {
		font-family: monospace;
		font-size: 12px;
		color: #888;
	}

	.workflow-version {
		font-size: 12px;
		color: #10b981;
		background: rgba(16, 185, 129, 0.1);
		padding: 2px 6px;
		border-radius: 3px;
	}

	.capabilities {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}

	.capability-tag {
		font-size: 11px;
		background: #2563eb;
		color: white;
		padding: 2px 6px;
		border-radius: 3px;
	}

	.status-cell {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.status-text {
		text-transform: capitalize;
		font-size: 14px;
	}

	.stage-badge {
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 12px;
		text-transform: capitalize;
		font-weight: 500;
	}

	.stage-planning { background: #fbbf24; color: #000; }
	.stage-execution { background: #10b981; color: #000; }
	.stage-evaluation { background: #8b5cf6; color: #fff; }
	.stage-optimization { background: #2563eb; color: #fff; }
	.stage-archived { background: #6b7280; color: #fff; }

	.performance-cell {
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 120px;
	}

	.performance-bar {
		flex: 1;
		height: 6px;
		background: #333;
		border-radius: 3px;
		overflow: hidden;
	}

	.performance-fill {
		height: 100%;
		background: linear-gradient(90deg, #ef4444, #fbbf24, #10b981);
		transition: width 0.3s ease;
	}

	.performance-value {
		font-size: 12px;
		color: #ccc;
		min-width: 35px;
	}

	.success-rate {
		color: #10b981;
		font-weight: 500;
	}

	.last-executed {
		color: #ccc;
		font-size: 14px;
	}

	.execution-time {
		color: #888;
		font-size: 12px;
		margin-top: 2px;
	}

	.workflow-actions {
		display: flex;
		gap: 4px;
	}

	.empty-state {
		text-align: center;
		padding: 40px;
		color: #888;
	}
</style>