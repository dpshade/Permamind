#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { homedir, platform } from 'os';
import { createInterface } from 'readline';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function detectOS() {
  const os = platform();
  switch (os) {
    case 'darwin': return 'macOS';
    case 'win32': return 'Windows';
    case 'linux': return 'Linux';
    default: return os;
  }
}

function getClaudeDesktopConfigPath() {
  const os = platform();
  const home = homedir();
  
  switch (os) {
    case 'darwin':
      return join(home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
    case 'win32':
      return join(home, 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json');
    case 'linux':
      return join(home, '.config', 'Claude', 'claude_desktop_config.json');
    default:
      return null;
  }
}

function getVSCodeConfigPath() {
  const home = homedir();
  const os = platform();
  
  switch (os) {
    case 'darwin':
      return join(home, 'Library', 'Application Support', 'Code', 'User');
    case 'win32':
      return join(home, 'AppData', 'Roaming', 'Code', 'User');
    case 'linux':
      return join(home, '.config', 'Code', 'User');
    default:
      return null;
  }
}

async function generateSeedPhrase() {
  try {
    // Import the mnemonic generation functionality
    const { generateMnemonic } = await import('../dist/mnemonic.js');
    return generateMnemonic();
  } catch (err) {
    console.error('Error: Could not generate seed phrase. Make sure permamind is built.');
    console.error('Run: npm run build');
    process.exit(1);
  }
}

function loadTemplate(templateName) {
  const templatePath = join(__dirname, '..', 'templates', templateName);
  if (existsSync(templatePath)) {
    return readFileSync(templatePath, 'utf8');
  }
  return null;
}

function updateClaudeDesktopConfig(configPath, seedPhrase) {
  let config = { mcpServers: {} };
  
  // Load existing config if it exists
  if (existsSync(configPath)) {
    try {
      const existingConfig = readFileSync(configPath, 'utf8');
      config = JSON.parse(existingConfig);
      if (!config.mcpServers) {
        config.mcpServers = {};
      }
    } catch (err) {
      console.warn('Warning: Could not parse existing Claude Desktop config, creating new one');
    }
  }

  // Add or update Permamind server configuration
  config.mcpServers.permamind = {
    command: "permamind",
    env: {
      SEED_PHRASE: seedPhrase
    }
  };

  // Ensure directory exists
  const configDir = dirname(configPath);
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }

  // Write the updated config
  writeFileSync(configPath, JSON.stringify(config, null, 2));
  return true;
}

function createVSCodeConfig(configDir, seedPhrase) {
  const mcpConfigPath = join(configDir, 'mcp.json');
  const config = {
    mcpServers: {
      permamind: {
        command: "permamind",
        env: {
          SEED_PHRASE: seedPhrase
        }
      }
    }
  };
  
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }
  
  writeFileSync(mcpConfigPath, JSON.stringify(config, null, 2));
  return mcpConfigPath;
}

async function testServerConnection(seedPhrase) {
  console.log('\\nTesting server connection...');
  
  try {
    // Set environment variable temporarily
    process.env.SEED_PHRASE = seedPhrase;
    
    // Try to start the server in test mode
    execSync('node "' + join(__dirname, 'permamind.js') + '" --test', { 
      stdio: 'inherit',
      env: { ...process.env, SEED_PHRASE: seedPhrase }
    });
    
    console.log('✓ Server test passed!');
    return true;
  } catch (err) {
    console.error('✗ Server test failed:', err.message);
    return false;
  }
}

async function main() {
  console.log('🧠 Permamind Setup Wizard');
  console.log('=========================\\n');
  
  const os = detectOS();
  console.log(`Detected OS: ${os}`);
  
  // Check if permamind is built
  const distPath = join(__dirname, '..', 'dist');
  if (!existsSync(distPath)) {
    console.error('Error: Permamind is not built. Please run: npm run build');
    process.exit(1);
  }
  
  console.log('\\n1. Seed Phrase Configuration');
  console.log('============================');
  
  let seedPhrase = process.env.SEED_PHRASE;
  
  if (seedPhrase) {
    console.log('Found existing SEED_PHRASE environment variable.');
    const useExisting = await question('Use existing seed phrase? (y/n): ');
    if (useExisting.toLowerCase() !== 'y') {
      seedPhrase = null;
    }
  }
  
  if (!seedPhrase) {
    const choice = await question('\\nChoose an option:\\n1. Generate new seed phrase\\n2. Import existing seed phrase\\nEnter choice (1 or 2): ');
    
    if (choice === '1') {
      console.log('\\nGenerating new seed phrase...');
      seedPhrase = await generateSeedPhrase();
      console.log('Generated seed phrase:', seedPhrase);
      console.log('\\n⚠️  IMPORTANT: Store this seed phrase securely!');
    } else if (choice === '2') {
      seedPhrase = await question('\\nEnter your seed phrase: ');
    } else {
      console.log('Invalid choice. Exiting.');
      process.exit(1);
    }
  }
  
  console.log('\\n2. Client Configuration');
  console.log('=======================');
  
  // Claude Desktop Configuration
  const claudeConfigPath = getClaudeDesktopConfigPath();
  if (claudeConfigPath) {
    const configureClaudeDesktop = await question(`\\nConfigure Claude Desktop? (y/n): `);
    if (configureClaudeDesktop.toLowerCase() === 'y') {
      try {
        updateClaudeDesktopConfig(claudeConfigPath, seedPhrase);
        console.log(`✓ Claude Desktop configured at: ${claudeConfigPath}`);
      } catch (err) {
        console.error('✗ Failed to configure Claude Desktop:', err.message);
      }
    }
  } else {
    console.log('Could not detect Claude Desktop configuration path for this OS');
  }
  
  // VS Code Configuration
  const vscodeConfigDir = getVSCodeConfigPath();
  if (vscodeConfigDir) {
    const configureVSCode = await question('\\nConfigure VS Code? (y/n): ');
    if (configureVSCode.toLowerCase() === 'y') {
      try {
        const mcpConfigPath = createVSCodeConfig(vscodeConfigDir, seedPhrase);
        console.log(`✓ VS Code MCP config created at: ${mcpConfigPath}`);
      } catch (err) {
        console.error('✗ Failed to configure VS Code:', err.message);
      }
    }
  }
  
  console.log('\\n3. Testing Configuration');
  console.log('========================');
  
  const testConnection = await question('\\nTest server connection? (y/n): ');
  if (testConnection.toLowerCase() === 'y') {
    await testServerConnection(seedPhrase);
  }
  
  console.log('\\n4. Environment Setup');
  console.log('====================');
  
  const setupEnv = await question('\\nAdd SEED_PHRASE to environment? (y/n): ');
  if (setupEnv.toLowerCase() === 'y') {
    console.log('\\nAdd this to your shell profile (.bashrc, .zshrc, etc.):');
    console.log(`export SEED_PHRASE="${seedPhrase}"`);
    
    if (os === 'Windows') {
      console.log('\\nFor Windows Command Prompt:');
      console.log(`set SEED_PHRASE=${seedPhrase}`);
      console.log('\\nFor Windows PowerShell:');
      console.log(`$env:SEED_PHRASE="${seedPhrase}"`);
    }
  }
  
  console.log('\\n🎉 Setup Complete!');
  console.log('==================');
  console.log('\\nNext steps:');
  console.log('1. Restart your MCP clients (Claude Desktop, VS Code, etc.)');
  console.log('2. Start using Permamind with: permamind');
  console.log('3. Test with: permamind --test');
  console.log('\\nFor help: permamind --help');
  
  rl.close();
}

main().catch(err => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});