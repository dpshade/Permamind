#!/usr/bin/env node

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version info
const packagePath = join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));

const HELP_TEXT = `
Permamind MCP Server v${packageJson.version}
${packageJson.description}

Usage:
  permamind [options]

Options:
  --help, -h          Show this help message
  --version, -v       Show version information
  --setup, -s         Run configuration wizard
  --config <path>     Use custom configuration file
  --test, -t          Test server startup and configuration
  --generate-seed     Generate a new seed phrase
  --info              Show server information

Environment Variables:
  SEED_PHRASE         Seed phrase for Arweave wallet
  HUB_REGISTRY_ID     Custom hub registry ID (optional)

Examples:
  permamind                    # Start the MCP server
  permamind --setup            # Run configuration wizard
  permamind --test             # Test server configuration
  permamind --generate-seed    # Generate new seed phrase

For more information, visit: ${packageJson.homepage}
`;

function showVersion() {
  console.log(`permamind v${packageJson.version}`);
}

function showHelp() {
  console.log(HELP_TEXT);
}

function generateSeedPhrase() {
  try {
    // Import the mnemonic generation functionality
    import('../dist/mnemonic.js').then(({ generateMnemonic }) => {
      try {
        const seedPhrase = generateMnemonic();
        console.log('Generated seed phrase:');
        console.log(seedPhrase);
        console.log('\n⚠️  IMPORTANT: Store this seed phrase securely!');
        console.log('Set it as environment variable: export SEED_PHRASE="' + seedPhrase + '"');
        console.log('\n💡 Pro tip: Add it to your shell profile (.bashrc, .zshrc, etc.) for persistence');
      } catch (genErr) {
        console.error('Error during seed generation:', genErr.message);
        console.error('This might be due to insufficient entropy or system issues.');
        process.exit(1);
      }
    }).catch(err => {
      console.error('Error importing mnemonic module:', err.message);
      console.error('This typically means the project is not built properly.');
      console.error('Please run: npm run build');
      process.exit(1);
    });
  } catch (err) {
    console.error('Error: Could not generate seed phrase. Make sure permamind is built.');
    console.error('Run: npm run build');
    console.error('If the problem persists, please file an issue: https://github.com/ALLiDoizCode/Permamind/issues');
    process.exit(1);
  }
}

async function testServer() {
  console.log('Testing Permamind server configuration...');
  
  // Check if dist directory exists
  const distPath = join(__dirname, '..', 'dist');
  try {
    const fs = await import('fs');
    if (!fs.existsSync(distPath)) {
      console.error('Error: Distribution files not found. Run: npm run build');
      process.exit(1);
    }
  } catch (err) {
    console.error('Error checking distribution files:', err.message);
    process.exit(1);
  }

  // Check environment variables
  if (!process.env.SEED_PHRASE) {
    console.warn('Warning: SEED_PHRASE environment variable not set');
    console.log('Generate one with: permamind --generate-seed');
  }

  console.log('✓ Configuration looks good');
  console.log('Start the server with: permamind');
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

    // Check for common environment issues
    if (!process.env.SEED_PHRASE) {
      console.warn('⚠️  Warning: SEED_PHRASE not set - server will generate temporary wallet');
      console.warn('💡 Generate persistent seed: permamind --generate-seed');
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
      generateSeedPhrase();
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