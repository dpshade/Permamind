#!/usr/bin/env node

// Systematically test each dependency to identify output source
import { createWriteStream } from 'fs';

// Capture all output
const outputLog = createWriteStream('/tmp/dependency-output.log');
const originalStdout = process.stdout.write;
const originalStderr = process.stderr.write;
const originalConsole = { ...console };

let outputDetected = false;

// Override all output methods to detect and log
function captureOutput(source, data) {
  outputDetected = true;
  outputLog.write(`[${source}] ${data}\n`);
}

process.stdout.write = function(data) {
  captureOutput('STDOUT', data);
  return true;
};

process.stderr.write = function(data) {
  captureOutput('STDERR', data);
  return true;
};

console.log = (...args) => captureOutput('CONSOLE.LOG', args.join(' '));
console.warn = (...args) => captureOutput('CONSOLE.WARN', args.join(' '));
console.error = (...args) => captureOutput('CONSOLE.ERROR', args.join(' '));
console.info = (...args) => captureOutput('CONSOLE.INFO', args.join(' '));

// Test dependencies one by one
console.log('Testing dependency imports...');

try {
  console.log('Testing: dotenv');
  await import('dotenv');
  
  console.log('Testing: arweave');
  await import('arweave');
  
  console.log('Testing: fastmcp');
  await import('fastmcp');
  
  console.log('Testing: zod');
  await import('zod');
  
  console.log('Testing: human-crypto-keys');
  await import('human-crypto-keys');
  
  console.log('Testing: bip39-web-crypto');
  await import('bip39-web-crypto');
  
} catch (err) {
  captureOutput('ERROR', `Import failed: ${err.message}`);
}

// Close log and report
outputLog.end();

setTimeout(() => {
  if (outputDetected) {
    originalConsole.log('⚠️ Output detected! Check /tmp/dependency-output.log');
  } else {
    originalConsole.log('✅ No output detected from dependencies');
  }
}, 100);