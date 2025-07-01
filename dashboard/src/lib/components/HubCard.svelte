<script>
	export let hub;
	
	function getStatusClass(status) {
		switch(status) {
			case 'online': return 'status-online';
			case 'offline': return 'status-offline';
			case 'connecting': return 'status-connecting';
			default: return 'status-offline';
		}
	}
	
	function formatLastActivity(dateString) {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now - date;
		const diffMins = Math.floor(diffMs / 60000);
		
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
		return `${Math.floor(diffMins / 1440)}d ago`;
	}
</script>

<div class="hub-card">
	<div class="hub-header">
		<h3>{hub.name}</h3>
		<div class="hub-status">
			<span class="status-indicator {getStatusClass(hub.status)}"></span>
			{hub.status}
		</div>
	</div>
	
	<div class="hub-details">
		<div class="detail-item">
			<span class="label">Workflows:</span>
			<span class="value">{hub.workflowCount}</span>
		</div>
		<div class="detail-item">
			<span class="label">Last Activity:</span>
			<span class="value">{formatLastActivity(hub.lastActivity)}</span>
		</div>
	</div>
	
	<div class="hub-actions">
		<button class="btn-small">View Details</button>
		<button class="btn-small">Connect</button>
	</div>
</div>

<style>
	.hub-card {
		background: #222;
		border: 1px solid #444;
		border-radius: 6px;
		padding: 16px;
		transition: border-color 0.2s;
	}
	
	.hub-card:hover {
		border-color: #2563eb;
	}
	
	.hub-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}
	
	.hub-header h3 {
		margin: 0;
		font-size: 16px;
	}
	
	.hub-status {
		display: flex;
		align-items: center;
		font-size: 12px;
		color: #ccc;
		text-transform: capitalize;
	}
	
	.hub-details {
		margin: 12px 0;
	}
	
	.detail-item {
		display: flex;
		justify-content: space-between;
		margin: 4px 0;
		font-size: 14px;
	}
	
	.label {
		color: #888;
	}
	
	.value {
		color: #fff;
		font-weight: 500;
	}
	
	.hub-actions {
		display: flex;
		gap: 8px;
		margin-top: 12px;
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
		transition: background 0.2s;
	}
	
	.btn-small:hover {
		background: #2563eb;
		border-color: #2563eb;
	}
</style>