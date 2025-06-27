#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { homedir, platform } from 'os';
import { createInterface } from 'readline';
import { execSync } from 'child_process';
import { ui, format } from '../dist/cli/ui.js';

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
  ui.space();
  const loader = ui.loading('Testing server connection');
  
  try {
    // Set environment variable temporarily
    process.env.SEED_PHRASE = seedPhrase;
    
    // Try to start the server in test mode
    execSync('node "' + join(__dirname, 'permamind.js') + '" --test', { 
      stdio: 'pipe',
      env: { ...process.env, SEED_PHRASE: seedPhrase }
    });
    
    loader.stop('Server test passed successfully!');
    ui.success('Connection verified - server is ready');
    return true;
  } catch (err) {
    loader.fail('Server test failed');
    ui.error('Connection test failed', err.message, [
      'Check your Node.js version (requires 20+)',
      'Ensure project is built: npm run build',
      'Verify seed phrase is valid'
    ]);
    return false;
  }
}

async function main() {
  // Read package.json for version
  const packagePath = join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
  
  ui.banner(packageJson.version);
  ui.header('Setup Wizard', 'Configure Permamind for optimal performance');
  
  const os = detectOS();
  ui.info('Detected operating system:', format.emphasize(os));
  
  // Check if permamind is built
  const distPath = join(__dirname, '..', 'dist');
  if (!existsSync(distPath)) {
    ui.error('Project not built', 'Distribution files are missing.', [
      format.command('npm run build'),
      'Ensure project is properly installed'
    ]);
    process.exit(1);
  }
  
  ui.success('Project build verified');
  
  ui.header('1. Seed Phrase Configuration', 'Set up your Arweave wallet identity');
  
  let seedPhrase = process.env.SEED_PHRASE;
  
  if (seedPhrase) {
    ui.info('Found existing SEED_PHRASE environment variable');
    const useExisting = await question(ui.prompt('Use existing seed phrase?', 'y/n'));
    if (useExisting.toLowerCase() !== 'y') {
      seedPhrase = null;
    } else {
      ui.success('Using existing seed phrase');
    }
  }
  
  if (!seedPhrase) {
    ui.space();
    ui.info('Choose seed phrase configuration:');
    ui.list([
      '1. Generate new seed phrase',
      '2. Import existing seed phrase', 
      '3. Use system-generated temporary phrase (not recommended)'
    ], 'numbered');
    
    const choice = await question(ui.prompt('Enter choice', '1-3'));
    
    if (choice === '1') {
      ui.space();
      const loader = ui.loading('Generating secure seed phrase');
      seedPhrase = await generateSeedPhrase();
      loader.stop('Seed phrase generated successfully!');
      
      ui.space();
      ui.success('Generated seed phrase:');
      ui.code(format.emphasize(seedPhrase));
      ui.space();
      ui.warning('CRITICAL: Store this seed phrase securely!', 
        'Without it, you will lose access to your wallet and memories.');
      ui.info('Export later with:', format.command('permamind --export-seed'));
      
    } else if (choice === '2') {
      ui.space();
      seedPhrase = await question(ui.prompt('Enter your 12-word seed phrase'));
      
      // Validate the seed phrase
      const words = seedPhrase.trim().split(/\\s+/);
      if (words.length !== 12) {
        ui.error('Invalid seed phrase', 'Must be exactly 12 words');
        process.exit(1);
      }
      ui.success('Seed phrase accepted and validated');
      
    } else if (choice === '3') {
      ui.space();
      ui.warning('Using temporary seed phrase', 
        'Wallet identity will not persist between sessions');
      ui.info('Generate persistent one later with:', 
        format.command('permamind --generate-seed'));
      seedPhrase = null; // Will use system-generated temporary
      
    } else {
      ui.error('Invalid choice', 'Please select 1, 2, or 3');
      process.exit(1);
    }
  }
  
  ui.header('2. Client Configuration', 'Set up MCP integrations');
  
  // Claude Desktop Configuration
  const claudeConfigPath = getClaudeDesktopConfigPath();
  if (claudeConfigPath) {
    ui.space();
    const configureClaudeDesktop = await question(ui.prompt('Configure Claude Desktop?', 'y/n'));
    if (configureClaudeDesktop.toLowerCase() === 'y') {
      const loader = ui.loading('Configuring Claude Desktop');
      try {
        updateClaudeDesktopConfig(claudeConfigPath, seedPhrase);
        loader.stop('Claude Desktop configured successfully!');
        ui.info('Configuration saved to:', format.path(claudeConfigPath));
      } catch (err) {
        loader.fail('Failed to configure Claude Desktop');
        ui.error('Configuration error', err.message);
      }
    } else {
      ui.info('Skipping Claude Desktop configuration');
    }
  } else {
    ui.warning('Claude Desktop not detected', 
      'Could not find configuration path for this OS');
  }
  
  // VS Code Configuration
  const vscodeConfigDir = getVSCodeConfigPath();
  if (vscodeConfigDir) {
    ui.space();
    const configureVSCode = await question(ui.prompt('Configure VS Code?', 'y/n'));
    if (configureVSCode.toLowerCase() === 'y') {
      const loader = ui.loading('Configuring VS Code MCP integration');
      try {
        const mcpConfigPath = createVSCodeConfig(vscodeConfigDir, seedPhrase);
        loader.stop('VS Code configured successfully!');
        ui.info('MCP config created at:', format.path(mcpConfigPath));
      } catch (err) {
        loader.fail('Failed to configure VS Code');
        ui.error('Configuration error', err.message);
      }
    } else {
      ui.info('Skipping VS Code configuration');
    }
  } else {
    ui.warning('VS Code not detected', 'Could not find VS Code configuration directory');
  }
  
  ui.header('3. Testing Configuration', 'Verify server connectivity');
  
  const testConnection = await question(ui.prompt('Test server connection?', 'y/n'));
  if (testConnection.toLowerCase() === 'y') {
    await testServerConnection(seedPhrase);
  } else {
    ui.info('Skipping connection test');
  }
  
  ui.header('4. Environment Setup', 'Configure shell environment');
  
  const setupEnv = await question(ui.prompt('Add SEED_PHRASE to environment?', 'y/n'));
  if (setupEnv.toLowerCase() === 'y') {
    ui.space();
    ui.info('Add to your shell profile (.bashrc, .zshrc, etc.):');
    ui.code(`export ${format.env('SEED_PHRASE')}="${seedPhrase}"`);
    
    if (os === 'Windows') {
      ui.space();
      ui.info('For Windows Command Prompt:');
      ui.code(`set ${format.env('SEED_PHRASE')}=${seedPhrase}`);
      ui.info('For Windows PowerShell:');
      ui.code(`$env:${format.env('SEED_PHRASE')}="${seedPhrase}"`);
    }
  } else {
    ui.info('Skipping environment setup');
  }
  
  ui.space();
  ui.success('🎉 Setup Complete!');
  ui.divider();
  
  ui.subheader('Next Steps');
  ui.list([
    'Restart your MCP clients (Claude Desktop, VS Code, etc.)',
    format.command('permamind') + ' - Start using Permamind',
    format.command('permamind --test') + ' - Test configuration'
  ], 'numbered');
  
  ui.space();
  ui.info('For help:', format.command('permamind --help'));
  
  rl.close();
}

main().catch(err => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});