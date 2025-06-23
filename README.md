# Permamind

A MCP server that provides a memory layer for AI agents and clients.

This MCP server uses AO and Arweave also known as the permaweb as the datastore for the memory layer providing a immortal mind for AI agents and clients

## Development

To get started, clone the repository and install the dependencies.

```bash
git clone https://github.com/punkpeye/fastmcp-boilerplate.git
npm install
npm run dev
```

### Start the server

If you simply want to start the server, you can use the `start` script.

If you did not provide .env with a SEED_PHRASE the server will create one but it will not presist through restarts

```bash
npm run start
```

However, you can also interact with the server using the `dev` script.

```bash
npm run dev
```
Depending on what AO env you are using you will beed to provide your server with AO tokens.
To do this simply ask the server for its public key and transfer it some tokens.

The default permaweb env is using the Marshal testnet https://x.com/Marshal_AO so there is currently **NO** cost for storing memories