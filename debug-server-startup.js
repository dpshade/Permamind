#!/usr/bin/env node

// Debug the actual server startup sequence
import { createWriteStream } from 'fs';

const debugLog = createWriteStream('/tmp/server-startup-debug.log', { flags: 'w' });
const originalStdout = process.stdout.write;
const originalStderr = process.stderr.write;

let outputCount = 0;

// Capture everything with timestamps
function logOutput(source, data) {
  outputCount++;
  const timestamp = new Date().toISOString();
  const message = `[${timestamp}] [${source}] ${data.toString()}`;
  debugLog.write(message + '\n');
  console.error(message); // This will still show in terminal
}

// Override outputs
process.stdout.write = function(chunk, encoding, cb) {
  logOutput('STDOUT', chunk);
  if (typeof encoding === 'function') cb = encoding;
  if (cb) cb();
  return true;
};

process.stderr.write = function(chunk, encoding, cb) {
  logOutput('STDERR', chunk);
  if (typeof encoding === 'function') cb = encoding;
  if (cb) cb();
  return true;
};

// Import the actual server with debugging
try {
  debugLog.write('=== Starting server import ===\n');
  await import('./dist/server.js');
  debugLog.write('=== Server import complete ===\n');
} catch (err) {
  debugLog.write(`=== Server import failed: ${err.message} ===\n`);
}

setTimeout(() => {
  debugLog.write(`=== Total output events: ${outputCount} ===\n`);
  debugLog.end();
  process.exit(0);
}, 2000);