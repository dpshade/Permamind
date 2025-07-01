# Token Process

A simple fungible token contract supporting transfers, minting, and balance queries with admin controls.

## transfer

Transfer tokens from your account to another user

- recipient: wallet address to receive tokens (required)
- amount: number of tokens to transfer (required)
- memo: optional message to include with transfer (optional)

Send tokens to any valid wallet address. Transfers require sufficient balance and will fail if you don't have enough tokens.

## balance

Get the current token balance for any account

- account: wallet address to check balance for (optional, defaults to caller)

Returns the token balance as a number. If no account is specified, returns your own balance.

## mint

Create new tokens and assign them to an account (admin only)

- recipient: wallet address to receive new tokens (required)
- amount: number of tokens to create (required)

Only the process owner can mint new tokens. This increases the total supply.

## burn

Destroy tokens from your account, reducing total supply

- amount: number of tokens to destroy (required)

Permanently removes tokens from circulation. You can only burn tokens you own.

## total_supply

Get the total number of tokens in circulation

- No parameters required

Returns the current total supply of tokens.

## owner

Get the current owner/admin of the token contract

- No parameters required

Returns the wallet address of the process owner who can mint tokens.

## transfer_ownership

Transfer ownership of the token contract to another address (admin only)

- new_owner: wallet address of the new owner (required)

Only the current owner can transfer ownership. The new owner will be able to mint tokens.

## approve

Approve another account to spend tokens on your behalf

- spender: wallet address allowed to spend your tokens (required)
- amount: maximum number of tokens they can spend (required)

Creates an allowance for the spender to transfer tokens from your account.

## allowance

Check how many tokens one account is allowed to spend for another

- owner: account that granted the allowance (required)
- spender: account that received the allowance (required)

Returns the remaining allowance amount.

## transfer_from

Transfer tokens on behalf of another account (requires allowance)

- from: account to transfer tokens from (required)
- to: account to receive tokens (required)
- amount: number of tokens to transfer (required)

Transfers tokens using a previously granted allowance. Reduces the allowance by the transfer amount.
