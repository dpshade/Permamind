#!/usr/bin/env node

/**
 * Cross-platform configuration helper for Permamind
 * This script provides configuration utilities that work across different operating systems
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { homedir, platform } from "os";
import { join, dirname } from "path";

const CONFIG_PATHS = {
  claude: {
    darwin: join(
      homedir(),
      "Library",
      "Application Support",
      "Claude",
      "claude_desktop_config.json",
    ),
    win32: join(
      homedir(),
      "AppData",
      "Roaming",
      "Claude",
      "claude_desktop_config.json",
    ),
    linux: join(homedir(), ".config", "Claude", "claude_desktop_config.json"),
  },
  vscode: {
    darwin: join(homedir(), "Library", "Application Support", "Code", "User"),
    win32: join(homedir(), "AppData", "Roaming", "Code", "User"),
    linux: join(homedir(), ".config", "Code", "User"),
  },
  cursor: {
    darwin: join(homedir(), "Library", "Application Support", "Cursor", "User"),
    win32: join(homedir(), "AppData", "Roaming", "Cursor", "User"),
    linux: join(homedir(), ".config", "Cursor", "User"),
  },
};

class PermamindConfigurator {
  constructor() {
    this.os = platform();
  }

  getConfigPath(client) {
    const paths = CONFIG_PATHS[client];
    if (!paths) {
      throw new Error(`Unsupported client: ${client}`);
    }

    const path = paths[this.os];
    if (!path) {
      throw new Error(`Unsupported OS for ${client}: ${this.os}`);
    }

    return path;
  }

  ensureDirectoryExists(filePath) {
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  configureClaudeDesktop(seedPhrase) {
    const configPath = this.getConfigPath("claude");
    this.ensureDirectoryExists(configPath);

    let config = { mcpServers: {} };

    // Load existing config if it exists
    if (existsSync(configPath)) {
      try {
        const existingConfig = readFileSync(configPath, "utf8");
        config = JSON.parse(existingConfig);
        if (!config.mcpServers) {
          config.mcpServers = {};
        }
      } catch (err) {
        console.warn(
          "Warning: Could not parse existing Claude Desktop config, creating new one",
        );
      }
    }

    // Add or update Permamind server configuration
    config.mcpServers.permamind = {
      command: "permamind",
      env: {
        SEED_PHRASE: seedPhrase,
      },
    };

    writeFileSync(configPath, JSON.stringify(config, null, 2));
    return configPath;
  }

  configureVSCode(seedPhrase) {
    const configDir = this.getConfigPath("vscode");
    const mcpConfigPath = join(configDir, "mcp.json");

    this.ensureDirectoryExists(mcpConfigPath);

    const config = {
      mcpServers: {
        permamind: {
          command: "permamind",
          env: {
            SEED_PHRASE: seedPhrase,
          },
        },
      },
    };

    writeFileSync(mcpConfigPath, JSON.stringify(config, null, 2));
    return mcpConfigPath;
  }

  configureCursor(seedPhrase) {
    const configDir = this.getConfigPath("cursor");
    const mcpConfigPath = join(configDir, "mcp.json");

    this.ensureDirectoryExists(mcpConfigPath);

    const config = {
      mcpServers: {
        permamind: {
          command: "permamind",
          env: {
            SEED_PHRASE: seedPhrase,
          },
        },
      },
    };

    writeFileSync(mcpConfigPath, JSON.stringify(config, null, 2));
    return mcpConfigPath;
  }

  validateConfig(client, configPath) {
    if (!existsSync(configPath)) {
      return { valid: false, error: "Configuration file does not exist" };
    }

    try {
      const config = JSON.parse(readFileSync(configPath, "utf8"));

      if (!config.mcpServers || !config.mcpServers.permamind) {
        return {
          valid: false,
          error: "Permamind server configuration not found",
        };
      }

      const permamindConfig = config.mcpServers.permamind;
      if (!permamindConfig.command || permamindConfig.command !== "permamind") {
        return { valid: false, error: "Invalid command configuration" };
      }

      if (!permamindConfig.env || !permamindConfig.env.SEED_PHRASE) {
        return { valid: false, error: "SEED_PHRASE not configured" };
      }

      return { valid: true };
    } catch (err) {
      return { valid: false, error: `Invalid JSON: ${err.message}` };
    }
  }

  listConfigurations() {
    const results = {};

    for (const [client, paths] of Object.entries(CONFIG_PATHS)) {
      try {
        const configPath = this.getConfigPath(client);
        const exists = existsSync(configPath);

        if (exists) {
          const validation = this.validateConfig(client, configPath);
          results[client] = {
            path: configPath,
            exists: true,
            valid: validation.valid,
            error: validation.error,
          };
        } else {
          results[client] = {
            path: configPath,
            exists: false,
            valid: false,
            error: "Configuration file does not exist",
          };
        }
      } catch (err) {
        results[client] = {
          path: "unknown",
          exists: false,
          valid: false,
          error: err.message,
        };
      }
    }

    return results;
  }

  generateEnvInstructions(seedPhrase) {
    const instructions = {
      bash: `export SEED_PHRASE="${seedPhrase}"`,
      zsh: `export SEED_PHRASE="${seedPhrase}"`,
      fish: `set -x SEED_PHRASE "${seedPhrase}"`,
      cmd: `set SEED_PHRASE=${seedPhrase}`,
      powershell: `$env:SEED_PHRASE="${seedPhrase}"`,
    };

    return instructions;
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const configurator = new PermamindConfigurator();
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Permamind Configuration Helper");
    console.log("");
    console.log("Usage:");
    console.log(
      "  node configure.js list                    # List all configurations",
    );
    console.log(
      "  node configure.js claude <seed-phrase>   # Configure Claude Desktop",
    );
    console.log(
      "  node configure.js vscode <seed-phrase>   # Configure VS Code",
    );
    console.log(
      "  node configure.js cursor <seed-phrase>   # Configure Cursor",
    );
    console.log(
      "  node configure.js validate <client>      # Validate configuration",
    );
    console.log(
      "  node configure.js env <seed-phrase>      # Show environment setup",
    );
    process.exit(0);
  }

  const command = args[0];

  try {
    switch (command) {
      case "list":
        const configs = configurator.listConfigurations();
        console.log("Configuration Status:");
        console.log("====================");
        for (const [client, config] of Object.entries(configs)) {
          console.log(`${client.toUpperCase()}:`);
          console.log(`  Path: ${config.path}`);
          console.log(`  Exists: ${config.exists ? "✓" : "✗"}`);
          console.log(`  Valid: ${config.valid ? "✓" : "✗"}`);
          if (config.error) {
            console.log(`  Error: ${config.error}`);
          }
          console.log("");
        }
        break;

      case "claude":
      case "vscode":
      case "cursor":
        if (!args[1]) {
          console.error("Error: Seed phrase is required");
          process.exit(1);
        }

        const seedPhrase = args[1];
        let configPath;

        if (command === "claude") {
          configPath = configurator.configureClaudeDesktop(seedPhrase);
        } else if (command === "vscode") {
          configPath = configurator.configureVSCode(seedPhrase);
        } else if (command === "cursor") {
          configPath = configurator.configureCursor(seedPhrase);
        }

        console.log(`✓ ${command.toUpperCase()} configured successfully`);
        console.log(`Configuration saved to: ${configPath}`);
        break;

      case "validate":
        if (!args[1]) {
          console.error(
            "Error: Client name is required (claude, vscode, cursor)",
          );
          process.exit(1);
        }

        const client = args[1];
        const clientConfigPath = configurator.getConfigPath(client);
        const validation = configurator.validateConfig(
          client,
          clientConfigPath,
        );

        if (validation.valid) {
          console.log(`✓ ${client.toUpperCase()} configuration is valid`);
        } else {
          console.log(
            `✗ ${client.toUpperCase()} configuration is invalid: ${validation.error}`,
          );
          process.exit(1);
        }
        break;

      case "env":
        if (!args[1]) {
          console.error("Error: Seed phrase is required");
          process.exit(1);
        }

        const envSeedPhrase = args[1];
        const instructions =
          configurator.generateEnvInstructions(envSeedPhrase);

        console.log("Environment Variable Setup:");
        console.log("===========================");
        console.log("");
        console.log("Bash/Zsh:");
        console.log(`  ${instructions.bash}`);
        console.log("");
        console.log("Fish:");
        console.log(`  ${instructions.fish}`);
        console.log("");
        console.log("Windows CMD:");
        console.log(`  ${instructions.cmd}`);
        console.log("");
        console.log("Windows PowerShell:");
        console.log(`  ${instructions.powershell}`);
        break;

      default:
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

export { PermamindConfigurator };
