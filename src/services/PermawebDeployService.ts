import { exec } from "child_process";
import { constants } from "fs";
import { access, readFile } from "fs/promises";
import { promisify } from "util";

import { getKeyFromMnemonic } from "../mnemonic.js";

const execAsync = promisify(exec);

export interface PermawebDeployParams {
  arnsName: string;
  directoryPath: string;
  network?: "mainnet" | "testnet";
  undername?: string;
  useCurrentWallet?: boolean;
  walletPath?: string;
}

export interface PermawebDeployResult {
  arnsUrl?: string;
  error?: {
    code: string;
    details?: unknown;
    message: string;
    solutions?: string[];
  };
  success: boolean;
  transactionId?: string;
}

export interface PrerequisiteCheck {
  message: string;
  name: string;
  solutions?: string[];
  status: "fail" | "pass" | "warning";
}

export interface PrerequisitesResult {
  allPassed: boolean;
  checks: PrerequisiteCheck[];
  error?: {
    code: string;
    message: string;
    solutions: string[];
  };
}

export class PermawebDeployService {
  constructor() {}

  async checkPrerequisites(
    params: PermawebDeployParams,
  ): Promise<PrerequisitesResult> {
    const checks: PrerequisiteCheck[] = [];

    // Check CLI installation
    const cliCheck = await this.checkCliInstallation();
    checks.push(cliCheck);

    // Check directory
    const dirCheck = await this.checkDirectory(params.directoryPath);
    checks.push(dirCheck);

    // Check wallet setup
    const walletCheck = await this.checkWalletSetup(params);
    checks.push(walletCheck);

    const allPassed = checks.every((check) => check.status === "pass");

    if (!allPassed) {
      const failedChecks = checks.filter((check) => check.status === "fail");
      const primaryFailure = failedChecks[0];

      return {
        allPassed: false,
        checks,
        error: {
          code: `PREREQUISITE_${primaryFailure.name.toUpperCase().replace(/\s+/g, "_")}_FAILED`,
          message: `Prerequisites not met: ${primaryFailure.message}`,
          solutions: primaryFailure.solutions || [],
        },
      };
    }

    return {
      allPassed: true,
      checks,
    };
  }

  async deployDirectory(
    params: PermawebDeployParams,
  ): Promise<PermawebDeployResult> {
    try {
      // Check prerequisites first
      const prereqResult = await this.checkPrerequisites(params);
      if (!prereqResult.allPassed) {
        return {
          error: prereqResult.error,
          success: false,
        };
      }

      // Setup wallet
      const walletData = await this.setupWallet(params);

      // Set DEPLOY_KEY environment variable
      process.env.DEPLOY_KEY = walletData;

      // Execute permaweb-deploy CLI
      const result = await this.executeDeployment(params);

      return {
        arnsUrl: this.constructArnsUrl(params.arnsName, params.undername),
        success: true,
        transactionId: result.transactionId,
      };
    } catch (error) {
      return {
        error: {
          code: "DEPLOYMENT_FAILED",
          details: error,
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
        },
        success: false,
      };
    }
  }

  private async checkCliInstallation(): Promise<PrerequisiteCheck> {
    try {
      await execAsync("permaweb-deploy --version");
      return {
        message: "permaweb-deploy CLI is installed and accessible",
        name: "CLI Installation",
        status: "pass",
      };
    } catch {
      return {
        message: "permaweb-deploy CLI is not installed or not in PATH",
        name: "CLI Installation",
        solutions: [
          "Install permaweb-deploy globally: npm install -g permaweb-deploy",
          "Or install locally in your project: npm install permaweb-deploy",
          "Verify installation: permaweb-deploy --version",
          "Make sure npm global bin directory is in your PATH",
          "Restart your terminal after installation",
        ],
        status: "fail",
      };
    }
  }

  private async checkDirectory(
    directoryPath: string,
  ): Promise<PrerequisiteCheck> {
    try {
      await access(directoryPath, constants.F_OK);
      await access(directoryPath, constants.R_OK);

      // Check if directory contains files
      const { stdout } = await execAsync(
        `find "${directoryPath}" -type f | head -1`,
      );
      if (!stdout.trim()) {
        return {
          message: "Directory exists but appears to be empty",
          name: "Directory Content",
          solutions: [
            "Ensure your build process has completed successfully",
            "Check that files are in the correct directory",
            "Common build directories: ./dist, ./build, ./public, ./out",
          ],
          status: "warning",
        };
      }

      return {
        message: `Directory ${directoryPath} exists and contains files`,
        name: "Directory",
        status: "pass",
      };
    } catch {
      return {
        message: `Directory ${directoryPath} not found or not readable`,
        name: "Directory",
        solutions: [
          `Create the directory: mkdir -p "${directoryPath}"`,
          "Run your build process to generate the deployment files",
          "Ensure the correct path is specified",
          "Common build directories: ./dist, ./build, ./public, ./out",
          "Check directory permissions",
        ],
        status: "fail",
      };
    }
  }

  private async checkWalletSetup(
    params: PermawebDeployParams,
  ): Promise<PrerequisiteCheck> {
    try {
      if (params.walletPath) {
        // Check custom wallet file
        await access(params.walletPath, constants.F_OK);
        const walletJson = await readFile(params.walletPath, "utf8");
        const walletData = JSON.parse(walletJson);

        if (!walletData.kty || !walletData.n || !walletData.d) {
          return {
            message: "Wallet file exists but is not a valid Arweave wallet",
            name: "Wallet File",
            solutions: [
              "Ensure the wallet file is a valid Arweave JWK (JSON Web Key)",
              "The wallet should contain required fields: kty, n, d, e, p, q, dp, dq, qi",
              "Export your wallet from ArConnect, Arweave.app, or generate a new one",
              "Check the file is not corrupted",
            ],
            status: "fail",
          };
        }

        return {
          message: `Custom wallet file ${params.walletPath} is valid`,
          name: "Wallet File",
          status: "pass",
        };
      } else {
        // Check SEED_PHRASE
        const seedPhrase = process.env.SEED_PHRASE;
        if (!seedPhrase) {
          return {
            message: "SEED_PHRASE environment variable not found",
            name: "Wallet Setup",
            solutions: [
              "Set SEED_PHRASE environment variable with your 12-word mnemonic",
              "Example: export SEED_PHRASE='word1 word2 word3 ... word12'",
              "Or create a .env file with SEED_PHRASE=your_mnemonic_here",
              "Alternatively, use --wallet-path flag to specify a wallet file",
              "Generate a new mnemonic if you don't have one",
            ],
            status: "fail",
          };
        }

        // Validate mnemonic format
        const words = seedPhrase.trim().split(/\s+/);
        if (words.length !== 12) {
          return {
            message: "SEED_PHRASE must be exactly 12 words",
            name: "Wallet Setup",
            solutions: [
              "Ensure your seed phrase contains exactly 12 words",
              "Check for extra spaces or missing words",
              "Verify the seed phrase is valid BIP39 mnemonic",
              "Example format: 'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12'",
            ],
            status: "fail",
          };
        }

        return {
          message: "SEED_PHRASE is configured and appears valid",
          name: "Wallet Setup",
          status: "pass",
        };
      }
    } catch {
      if (params.walletPath) {
        return {
          message: `Cannot access wallet file: ${params.walletPath}`,
          name: "Wallet File",
          solutions: [
            `Ensure the file exists: ${params.walletPath}`,
            "Check file permissions (should be readable)",
            "Verify the file path is correct",
            "Use absolute path if relative path is not working",
          ],
          status: "fail",
        };
      } else {
        return {
          message: "Failed to validate wallet configuration",
          name: "Wallet Setup",
          solutions: [
            "Check SEED_PHRASE environment variable is set correctly",
            "Ensure the seed phrase is a valid 12-word mnemonic",
            "Try using a custom wallet file instead",
            "Restart your terminal/application to reload environment variables",
          ],
          status: "fail",
        };
      }
    }
  }

  private constructArnsUrl(arnsName: string, undername?: string): string {
    const baseUrl = undername ? `${undername}_${arnsName}` : arnsName;
    return `https://${baseUrl}.arweave.net`;
  }

  private async executeDeployment(
    params: PermawebDeployParams,
  ): Promise<{ transactionId: string }> {
    const { arnsName, directoryPath, network = "mainnet", undername } = params;

    // Build permaweb-deploy command
    let command = `permaweb-deploy --deploy-folder "${directoryPath}" --arns-name "${arnsName}"`;

    if (undername) {
      command += ` --undername "${undername}"`;
    }

    if (network === "testnet") {
      command += ` --ario-process testnet`;
    }

    try {
      const { stderr, stdout } = await execAsync(command);

      if (stderr) {
        console.warn("Deployment warnings:", stderr);
      }

      // Parse output to extract transaction ID
      const transactionId = this.parseTransactionId(stdout);

      return { transactionId };
    } catch (error) {
      throw new Error(`Deployment failed: ${error}`);
    }
  }

  private async generateWalletFromSeed(): Promise<string> {
    const seedPhrase = process.env.SEED_PHRASE;
    if (!seedPhrase) {
      throw new Error("SEED_PHRASE environment variable not found");
    }

    try {
      // Generate deterministic wallet from seed phrase using existing utility
      const wallet = await getKeyFromMnemonic(seedPhrase);

      // Convert wallet to JSON string
      const walletJson = JSON.stringify(wallet);

      // Base64 encode the raw JSON
      return Buffer.from(walletJson).toString("base64");
    } catch (error) {
      throw new Error(`Failed to generate wallet from seed: ${error}`);
    }
  }

  private async loadWalletFromFile(walletPath: string): Promise<string> {
    try {
      const walletJson = await readFile(walletPath, "utf8");

      // Validate JSON format
      const walletData = JSON.parse(walletJson);

      // Validate it's a proper Arweave wallet
      if (!walletData.kty || !walletData.n || !walletData.d) {
        throw new Error("Invalid Arweave wallet format");
      }

      // Base64 encode the raw JSON
      return Buffer.from(walletJson).toString("base64");
    } catch (error) {
      throw new Error(`Failed to load wallet from ${walletPath}: ${error}`);
    }
  }

  private parseTransactionId(output: string): string {
    // Common patterns for transaction IDs in permaweb-deploy output
    const txIdMatch = output.match(
      /(?:Transaction ID|txId|tx):\s*([a-zA-Z0-9_-]{43})/i,
    );
    if (txIdMatch) {
      return txIdMatch[1];
    }

    // Alternative pattern
    const altMatch = output.match(/([a-zA-Z0-9_-]{43})/);
    if (altMatch) {
      return altMatch[1];
    }

    throw new Error("Could not parse transaction ID from deployment output");
  }

  private async setupWallet(params: PermawebDeployParams): Promise<string> {
    if (params.walletPath) {
      // Use custom wallet from file
      return await this.loadWalletFromFile(params.walletPath);
    } else {
      // Generate wallet from SEED_PHRASE
      return await this.generateWalletFromSeed();
    }
  }

  private async validateDirectory(directoryPath: string): Promise<void> {
    try {
      await access(directoryPath, constants.F_OK);
      await access(directoryPath, constants.R_OK);
    } catch {
      throw new Error(`Directory not found or not readable: ${directoryPath}`);
    }
  }
}
