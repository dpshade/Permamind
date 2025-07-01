# DAO Governance

Decentralized autonomous organization governance system for proposal creation, voting, and execution.

## create_proposal

Submit a new governance proposal for community voting

- title: concise proposal title (required)
- description: detailed proposal explanation and rationale (required)
- category: proposal type like 'treasury', 'governance', 'development' (required)
- execution_delay: days to wait after passing before execution (optional, defaults to 3)
- funding_amount: tokens requested if treasury proposal (optional)
- funding_recipient: address to receive funds if approved (optional)

Creates a new proposal that enters a review period before voting begins. Requires minimum governance token balance to propose.

## vote

Cast your vote on an active proposal

- proposal_id: unique identifier of the proposal (required)
- vote: your vote choice - 'yes', 'no', or 'abstain' (required)
- reason: optional explanation for your vote (optional)

Vote with your governance token balance. Voting power is determined by your token holdings at the proposal snapshot.

## delegate_vote

Delegate your voting power to another DAO member

- delegate: wallet address to receive your voting power (required)
- duration: delegation period in days (optional, defaults to 30)
- categories: proposal categories to delegate like 'treasury,governance' (optional, delegates all)

Allows another member to vote with your tokens. You can revoke delegation at any time.

## revoke_delegation

Remove your voting power delegation

- delegate: address of current delegate (optional, revokes all delegations)

Immediately returns your voting power. Future votes will use your direct token balance.

## execute_proposal

Execute a proposal that has passed and completed its delay period

- proposal_id: identifier of the proposal to execute (required)

Triggers the execution of approved proposal actions. Anyone can execute a ready proposal.

## queue_proposal

Queue a passed proposal for execution (if using timelock)

- proposal_id: identifier of the proposal to queue (required)

Adds proposal to execution queue. Required for proposals with timelocks before execution.

## cancel_proposal

Cancel your own proposal before it passes (proposer only)

- proposal_id: identifier of your proposal to cancel (required)

Removes an active proposal from voting. Only the original proposer can cancel their proposal.

## get_proposals

View governance proposals by status and filters

- status: filter by 'pending', 'active', 'passed', 'failed', 'executed' (optional)
- category: filter by proposal category (optional)
- proposer: filter by proposer address (optional)
- limit: maximum results to return (optional, defaults to 10)

Returns proposals matching your criteria with voting results and status.

## get_proposal_details

Get detailed information about a specific proposal

- proposal_id: identifier of the proposal (required)

Returns full proposal details including votes, timeline, and execution status.

## get_voting_power

Check voting power for an address at a specific time

- address: wallet address to check (optional, defaults to caller)
- proposal_id: check power at specific proposal snapshot (optional, uses current)

Returns the voting power (token balance) for an address at the specified time.

## get_delegations

View current delegation relationships

- delegator: address that delegated power (optional)
- delegate: address receiving delegated power (optional)
- include_expired: include expired delegations (optional, defaults to false)

Returns active delegation relationships in the DAO.

## get_vote_history

View voting history for an address

- voter: address to check voting history (optional, defaults to caller)
- proposal_id: specific proposal to check (optional, returns all votes)
- limit: maximum results to return (optional, defaults to 20)

Returns past votes cast by an address with reasons and outcomes.

## update_voting_period

Modify the voting period for proposals (admin only)

- new_period: voting duration in days (required)
- proposal_type: apply to specific category only (optional, applies to all)

Changes how long proposals remain open for voting. Requires admin privileges.

## update_quorum

Change the minimum participation required for valid votes (admin only)

- new_quorum: minimum participation percentage (1-100) (required)
- proposal_type: apply to specific category only (optional, applies to all)

Updates the quorum threshold needed for proposals to be valid.

## emergency_pause

Pause all governance activity (emergency admin only)

- reason: explanation for the pause (required)
- duration: pause duration in hours (optional, defaults to 24)

Temporarily halts all proposal creation and voting. Used only for security emergencies.

## get_treasury_balance

Check the current DAO treasury balance

- token: specific token contract to check (optional, returns all tokens)

Returns the DAO's available funds for treasury proposals.
