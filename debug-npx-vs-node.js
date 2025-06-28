#!/usr/bin/env node

// Compare npx vs direct node execution
import { spawn } from 'child_process';
import { createWriteStream } from 'fs';

const npxLog = createWriteStream('/tmp/npx-output.log');
const nodeLog = createWriteStream('/tmp/node-output.log');

function testCommand(command, args, env, logStream, label) {
  return new Promise((resolve) => {
    console.log(`Testing ${label}...`);
    
    const proc = spawn(command, args, {
      env: { ...process.env, ...env },
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let hasOutput = false;
    
    proc.stdout.on('data', (data) => {
      hasOutput = true;
      logStream.write(`[STDOUT] ${data}`);
    });
    
    proc.stderr.on('data', (data) => {
      hasOutput = true;
      logStream.write(`[STDERR] ${data}`);
    });
    
    // Kill after 3 seconds
    setTimeout(() => {
      proc.kill();
      logStream.write(`\n=== ${label} had output: ${hasOutput} ===\n`);
      logStream.end();
      resolve(hasOutput);
    }, 3000);
  });
}

async function runTests() {
  const env = { SEED_PHRASE: "test phrase" };
  
  // Test npx permamind
  const npxHasOutput = await testCommand('npx', ['permamind'], env, npxLog, 'npx permamind');
  
  // Test direct node
  const nodeHasOutput = await testCommand('node', ['/Users/jonathangreen/Documents/MCP/permamind/dist/server.js'], env, nodeLog, 'direct node');
  
  console.log(`\nResults:`);
  console.log(`npx permamind has output: ${npxHasOutput}`);
  console.log(`direct node has output: ${nodeHasOutput}`);
  console.log(`Check logs: /tmp/npx-output.log and /tmp/node-output.log`);
}

runTests().catch(console.error);