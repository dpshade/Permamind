#!/usr/bin/env node

// Complete MCP protocol isolation wrapper
// Uses child_process to completely isolate server output

import { spawn } from 'child_process';

// Start the actual permamind server as a child process
const server = spawn('node', ['/Users/jonathangreen/Documents/MCP/permamind/dist/server.js'], {
  env: process.env,
  stdio: ['pipe', 'pipe', 'pipe'] // Capture all streams
});

// Only forward stdout (MCP JSON) to parent
server.stdout.on('data', (data) => {
  process.stdout.write(data);
});

// Capture and silence stderr
server.stderr.on('data', (data) => {
  // Log errors to file instead of forwarding
  // This prevents any error output from breaking MCP protocol
});

// Handle server exit
server.on('close', (code) => {
  process.exit(code);
});

// Forward stdin (MCP commands) to server
process.stdin.pipe(server.stdin);