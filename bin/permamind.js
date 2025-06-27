#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { execSync } from 'child_process';
import { homedir, platform } from 'os';
import { createInterface } from 'readline';
import { ui, format } from '../dist/cli/ui.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version info
const packagePath = join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));

// Enhanced help text using UI components
function showEnhancedHelp() {
  ui.banner(packageJson.version);
  
  ui.header('Usage', 'Command line interface for Permamind MCP Server');
  ui.code('permamind [options]');
  
  ui.subheader('Options');
  const options = [
    { key: '--help, -h', value: 'Show this help message' },
    { key: '--version, -v', value: 'Show version information' },
    { key: '--setup, -s', value: 'Run configuration wizard' },
    { key: '--config <path>', value: 'Use custom configuration file' },
    { key: '--test, -t', value: 'Test server startup and configuration' },
    { key: '--generate-seed', value: 'Generate a new seed phrase' },
    { key: '--export-seed', value: 'Export current server seed phrase' },
    { key: '--import-seed', value: 'Import an existing seed phrase' },
    { key: '--info', value: 'Show server information' }
  ];
  ui.table(options);
  
  ui.subheader('Environment Variables');
  const envVars = [
    { key: 'SEED_PHRASE', value: 'Seed phrase for Arweave wallet' },
    { key: 'HUB_REGISTRY_ID', value: 'Custom hub registry ID (optional)' }
  ];
  ui.table(envVars);
  
  ui.subheader('Examples');
  ui.command('Start the MCP server', 'permamind');
  ui.command('Run configuration wizard', 'permamind --setup');
  ui.command('Test server configuration', 'permamind --test');
  ui.command('Generate new seed phrase', 'permamind --generate-seed');
  ui.command('Export current seed phrase', 'permamind --export-seed');
  ui.command('Import existing seed phrase', 'permamind --import-seed');
  
  ui.info('For more information, visit:', format.url(packageJson.homepage));
}

function showVersion() {
  ui.info('Permamind MCP Server', format.version(`v${packageJson.version}`));
}

function showHelp() {
  showEnhancedHelp();
}

async function generateSeedPhrase() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    ui.header('Generate New Seed Phrase', 'Create a secure seed phrase for your Arweave wallet');
    
    const loader = ui.loading('Generating secure seed phrase');
    
    // Import the mnemonic generation functionality
    const { generateMnemonic } = await import('../dist/mnemonic.js');
    const seedPhrase = generateMnemonic();
    
    loader.stop('Seed phrase generated successfully!');
    
    ui.space();
    ui.success('Generated new seed phrase:');
    ui.code(format.emphasize(seedPhrase));
    ui.space();
    
    ui.warning('CRITICAL: Store this seed phrase securely!', 
      'Without it, you will lose access to your Arweave wallet and stored memories.');
    
    ui.space();
    const save = await new Promise(resolve => {
      rl.question(ui.prompt('Would you like to save this seed phrase?', 'y/n'), resolve);
    });

    if (save.toLowerCase() === 'y') {
      ui.space();
      ui.info('Choose how to save your seed phrase:');
      ui.list([
        '1. Environment variable (recommended)',
        '2. Save to config file', 
        '3. Both'
      ], 'numbered');
      
      const choice = await new Promise(resolve => {
        rl.question(ui.prompt('Enter choice', '1-3'), resolve);
      });

      if (choice === '1' || choice === '3') {
        ui.subheader('Environment Variable Setup');
        ui.info('Add to your shell profile (.bashrc, .zshrc, etc.):');
        ui.code(`export ${format.env('SEED_PHRASE')}="${seedPhrase}"`);
        
        if (platform() === 'win32') {
          ui.space();
          ui.info('For Windows Command Prompt:');
          ui.code(`set ${format.env('SEED_PHRASE')}=${seedPhrase}`);
          ui.info('For Windows PowerShell:');
          ui.code(`$env:${format.env('SEED_PHRASE')}="${seedPhrase}"`);
        }
      }

      if (choice === '2' || choice === '3') {
        const configPath = getSeedConfigPath();
        const configDir = dirname(configPath);
        
        try {
          // Ensure directory exists
          const fs = await import('fs');
          if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
          }

          const config = {
            seedPhrase: seedPhrase,
            createdAt: new Date().toISOString(),
            source: 'generated'
          };

          writeFileSync(configPath, JSON.stringify(config, null, 2));
          ui.success('Seed phrase saved to config file:', format.path(configPath));
          ui.warning('Keep this file secure and backed up!');
        } catch (saveErr) {
          ui.error('Failed to save seed phrase to config file', saveErr.message);
        }
      }
    } else {
      ui.space();
      ui.info('Remember to save this seed phrase manually!');
      ui.info('You can set it later with:', format.command('permamind --import-seed'));
    }

  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      ui.error('Module not found', 'Project is not built properly.', [
        format.command('npm run build'),
        'Check your installation'
      ]);
    } else {
      ui.error('Failed to generate seed phrase', err.message, [
        'Check your Node.js version (requires 20+)',
        'Try rebuilding: npm run build',
        format.url('https://github.com/ALLiDoizCode/Permamind/issues')
      ]);
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

function getSeedConfigPath() {
  const home = homedir();
  const os = platform();
  
  switch (os) {
    case 'darwin':
      return join(home, '.config', 'permamind', 'seed.json');
    case 'win32':
      return join(home, 'AppData', 'Roaming', 'permamind', 'seed.json');
    default:
      return join(home, '.config', 'permamind', 'seed.json');
  }
}

async function exportSeedPhrase() {
  try {
    // Check if there's an environment variable first
    if (process.env.SEED_PHRASE) {
      console.log('🔑 Current seed phrase (from environment):');
      console.log(process.env.SEED_PHRASE);
      console.log('\n💡 This seed phrase is set via environment variable');
      return;
    }

    // Check if there's a saved seed phrase
    const configPath = getSeedConfigPath();
    if (existsSync(configPath)) {
      try {
        const config = JSON.parse(readFileSync(configPath, 'utf8'));
        if (config.seedPhrase) {
          console.log('🔑 Current seed phrase (from saved config):');
          console.log(config.seedPhrase);
          console.log('\n💡 This seed phrase is saved in:', configPath);
          return;
        }
      } catch (err) {
        console.warn('⚠️  Could not read saved seed phrase config');
      }
    }

    // Try to get seed phrase from a temporary server startup
    console.log('🔍 No persistent seed phrase found.');
    console.log('💡 The server generates temporary seed phrases when none is provided.');
    console.log('');
    console.log('To get a persistent seed phrase:');
    console.log('1. Generate one: permamind --generate-seed');
    console.log('2. Import existing: permamind --import-seed');
    console.log('3. Set environment: export SEED_PHRASE="your phrase here"');

  } catch (err) {
    console.error('❌ Error exporting seed phrase:', err.message);
    process.exit(1);
  }
}

async function importSeedPhrase() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    console.log('🔐 Import Existing Seed Phrase');
    console.log('===============================\n');

    const seedPhrase = await new Promise(resolve => {
      rl.question('Enter your 12-word seed phrase: ', resolve);
    });

    if (!seedPhrase || seedPhrase.trim().split(' ').length !== 12) {
      console.error('❌ Invalid seed phrase. Must be exactly 12 words.');
      process.exit(1);
    }

    // Validate the seed phrase by trying to import it
    try {
      const { validateMnemonic } = await import('../dist/mnemonic.js');
      if (!(await validateMnemonic(seedPhrase.trim()))) {
        console.error('❌ Invalid seed phrase. Please check and try again.');
        process.exit(1);
      }
    } catch (err) {
      console.warn('⚠️  Could not validate seed phrase (build required)');
    }

    const choice = await new Promise(resolve => {
      rl.question('\nHow would you like to save this seed phrase?\n1. Environment variable (recommended)\n2. Save to config file\n3. Both\nEnter choice (1-3): ', resolve);
    });

    const trimmedSeed = seedPhrase.trim();

    if (choice === '1' || choice === '3') {
      console.log('\n📝 Add to your shell profile (.bashrc, .zshrc, etc.):');
      console.log(`export SEED_PHRASE="${trimmedSeed}"`);
      
      if (platform() === 'win32') {
        console.log('\n📝 For Windows:');
        console.log(`set SEED_PHRASE=${trimmedSeed}`);
        console.log('Or PowerShell:');
        console.log(`$env:SEED_PHRASE="${trimmedSeed}"`);
      }
    }

    if (choice === '2' || choice === '3') {
      const configPath = getSeedConfigPath();
      const configDir = dirname(configPath);
      
      // Ensure directory exists
      const fs = await import('fs');
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      const config = {
        seedPhrase: trimmedSeed,
        createdAt: new Date().toISOString(),
        source: 'imported'
      };

      writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log(`\n💾 Seed phrase saved to: ${configPath}`);
      console.log('⚠️  Keep this file secure and backed up!');
    }

    console.log('\n✅ Seed phrase imported successfully!');
    console.log('🔄 Restart your MCP clients to use the new seed phrase.');

  } catch (err) {
    console.error('❌ Error importing seed phrase:', err.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

async function testServer() {
  ui.header('Server Configuration Test', 'Validating Permamind server setup');
  
  const tests = [
    { name: 'Distribution files', check: () => checkDistFiles() },
    { name: 'Environment variables', check: () => checkEnvironment() },
    { name: 'Node.js version', check: () => checkNodeVersion() }
  ];
  
  let allPassed = true;
  
  for (const test of tests) {
    const loader = ui.loading(`Testing ${test.name}`);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate test time
      const result = await test.check();
      
      if (result.success) {
        loader.stop(`${test.name}: ${result.message}`);
      } else {
        loader.fail(`${test.name}: ${result.message}`);
        allPassed = false;
        
        if (result.solutions) {
          ui.space();
          ui.info('Solutions:');
          ui.list(result.solutions.map(s => format.command(s)));
        }
      }
    } catch (err) {
      loader.fail(`${test.name}: ${err.message}`);
      allPassed = false;
    }
  }
  
  ui.space();
  if (allPassed) {
    ui.success('All tests passed! Server is ready to start');
    ui.info('Start the server with:', format.command('permamind'));
  } else {
    ui.error('Some tests failed', 'Please fix the issues above before starting the server');
    process.exit(1);
  }
}

async function checkDistFiles() {
  const distPath = join(__dirname, '..', 'dist');
  const fs = await import('fs');
  
  if (!fs.existsSync(distPath)) {
    return {
      success: false,
      message: 'Distribution files not found',
      solutions: ['npm run build', 'Check your installation']
    };
  }
  
  return {
    success: true,
    message: 'Distribution files found'
  };
}

function checkEnvironment() {
  if (!process.env.SEED_PHRASE) {
    return {
      success: false,
      message: 'SEED_PHRASE environment variable not set',
      solutions: [
        'permamind --generate-seed',
        'permamind --import-seed',
        'export SEED_PHRASE="your-seed-phrase"'
      ]
    };
  }
  
  return {
    success: true,
    message: 'Environment variables configured'
  };
}

function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 20) {
    return {
      success: false,
      message: `Node.js ${nodeVersion} is too old (requires 20+)`,
      solutions: ['Download from https://nodejs.org/']
    };
  }
  
  return {
    success: true,
    message: `Node.js ${nodeVersion} is compatible`
  };
}

async function startServer(configPath) {
  try {
    const serverPath = join(__dirname, '..', 'dist', 'server.js');
    
    // Check if server file exists
    const fs = await import('fs');
    if (!fs.existsSync(serverPath)) {
      console.error('❌ Error: Server file not found at:', serverPath);
      console.error('📦 Please build the project first: npm run build');
      console.error('🔧 If you installed globally, the build should be included');
      console.error('🐛 If this persists, file an issue: https://github.com/ALLiDoizCode/Permamind/issues');
      process.exit(1);
    }

    // Validate Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (majorVersion < 20) {
      console.error(`❌ Error: Node.js ${nodeVersion} is not supported`);
      console.error('🟢 Please upgrade to Node.js 20 or higher');
      console.error('📥 Download from: https://nodejs.org/');
      process.exit(1);
    }

    // Set config path if provided
    if (configPath) {
      if (!fs.existsSync(configPath)) {
        console.error('❌ Error: Config file not found:', configPath);
        process.exit(1);
      }
      process.env.CONFIG_PATH = configPath;
      console.log('📝 Using config file:', configPath);
    }

    // Check for seed phrase from various sources
    let seedPhrase = process.env.SEED_PHRASE;
    
    if (!seedPhrase) {
      // Check for saved seed phrase
      const configPath = getSeedConfigPath();
      if (existsSync(configPath)) {
        try {
          const config = JSON.parse(readFileSync(configPath, 'utf8'));
          if (config.seedPhrase) {
            seedPhrase = config.seedPhrase;
            process.env.SEED_PHRASE = seedPhrase;
            console.log('🔑 Using saved seed phrase from:', configPath);
          }
        } catch (err) {
          console.warn('⚠️  Could not read saved seed phrase config');
        }
      }
    }

    if (!seedPhrase) {
      console.warn('⚠️  Warning: No persistent seed phrase found - server will generate temporary wallet');
      console.warn('💡 For persistent identity, run: permamind --generate-seed');
      console.warn('💡 Or import existing: permamind --import-seed');
      console.warn('💡 Or export current: permamind --export-seed');
    } else {
      console.log('✅ Using persistent seed phrase for wallet identity');
    }

    // Start the server by importing and running it
    console.log('🚀 Starting Permamind MCP server...');
    console.log('📡 Server will communicate via stdio (MCP protocol)');
    
    await import(serverPath);
    
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      console.error('❌ Error: Missing dependencies or build files');
      console.error('📦 Try: npm run build');
      console.error('🔧 If globally installed, try: npm update -g permamind');
    } else if (err.code === 'EACCES') {
      console.error('❌ Error: Permission denied');
      console.error('🔐 Check file permissions and try again');
    } else {
      console.error('❌ Error starting server:', err.message);
      console.error('🔍 Stack trace:', err.stack);
    }
    
    console.error('\n🩺 Troubleshooting:');
    console.error('1. Check Node.js version: node --version (need 20+)');
    console.error('2. Rebuild project: npm run build');
    console.error('3. Test configuration: permamind --test');
    console.error('4. File an issue: https://github.com/ALLiDoizCode/Permamind/issues');
    
    process.exit(1);
  }
}

function runSetup() {
  try {
    execSync(`node "${join(__dirname, 'permamind-setup.js')}"`, { stdio: 'inherit' });
  } catch (err) {
    console.error('Error running setup wizard:', err.message);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  // No arguments, start the server
  startServer().catch(err => {
    console.error('Server failed to start:', err.message);
    process.exit(1);
  });
} else {
  const command = args[0];
  
  switch (command) {
    case '--help':
    case '-h':
      showHelp();
      break;
      
    case '--version':
    case '-v':
      showVersion();
      break;
      
    case '--setup':
    case '-s':
      runSetup();
      break;
      
    case '--config':
      if (args[1]) {
        startServer(args[1]).catch(err => {
          console.error('Server failed to start:', err.message);
          process.exit(1);
        });
      } else {
        console.error('Error: --config requires a file path');
        process.exit(1);
      }
      break;
      
    case '--test':
    case '-t':
      testServer().catch(err => {
        console.error('Test failed:', err.message);
        process.exit(1);
      });
      break;
      
    case '--generate-seed':
      generateSeedPhrase().catch(err => {
        console.error('Seed generation failed:', err.message);
        process.exit(1);
      });
      break;
      
    case '--export-seed':
      exportSeedPhrase().catch(err => {
        console.error('Seed export failed:', err.message);
        process.exit(1);
      });
      break;
      
    case '--import-seed':
      importSeedPhrase().catch(err => {
        console.error('Seed import failed:', err.message);
        process.exit(1);
      });
      break;
      
    case '--info':
      console.log(`Permamind MCP Server v${packageJson.version}`);
      console.log(`Description: ${packageJson.description}`);
      console.log(`Repository: ${packageJson.repository.url}`);
      console.log(`Author: ${packageJson.author}`);
      break;
      
    default:
      console.error(`Unknown command: ${command}`);
      console.log('Use --help for available options');
      process.exit(1);
  }
}