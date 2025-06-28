#!/usr/bin/env node

// Simulate Claude Desktop's MCP connection to identify the exact issue
import { spawn } from 'child_process';

async function testMCPConnection() {
  console.log('Testing MCP handshake with permamind server...');
  
  const server = spawn('npx', ['permamind'], {
    env: { 
      ...process.env, 
      SEED_PHRASE: "remind danger agree reflect castle genre luxury degree plastic envelope shove air"
    },
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  let rawOutput = '';
  let firstOutput = true;
  
  server.stdout.on('data', (data) => {
    const chunk = data.toString();
    rawOutput += chunk;
    
    if (firstOutput) {
      console.log('=== FIRST OUTPUT FROM SERVER ===');
      console.log('Raw bytes:', [...Buffer.from(chunk)]);
      console.log('String representation:', JSON.stringify(chunk));
      console.log('Visible characters:', chunk.replace(/[\x00-\x1F\x7F]/g, '<CTRL>'));
      firstOutput = false;
    }
    
    // Try to parse as JSON
    try {
      const lines = chunk.split('\n').filter(line => line.trim());
      for (const line of lines) {
        JSON.parse(line);
        console.log('✅ Valid JSON:', line.substring(0, 100) + (line.length > 100 ? '...' : ''));
      }
    } catch (err) {
      console.log('❌ Invalid JSON detected:', JSON.stringify(chunk));
      console.log('Parse error:', err.message);
    }
  });
  
  server.stderr.on('data', (data) => {
    console.log('STDERR:', data.toString());
  });
  
  // Send MCP initialize request
  setTimeout(() => {
    console.log('\nSending MCP initialize request...');
    const initRequest = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: {
          name: "test-client",
          version: "1.0.0"
        }
      }
    }) + '\n';
    
    server.stdin.write(initRequest);
  }, 1000);
  
  // Clean up after 5 seconds
  setTimeout(() => {
    server.kill();
    console.log('\n=== COMPLETE RAW OUTPUT ===');
    console.log(JSON.stringify(rawOutput));
  }, 5000);
}

testMCPConnection().catch(console.error);