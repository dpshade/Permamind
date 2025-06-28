import { execSync } from "child_process";
import { join } from "path";
import { beforeAll, describe, expect, it } from "vitest";

const projectRoot = join(__dirname, "..", "..");
const binPath = join(projectRoot, "bin", "permamind.js");

describe("CLI Tests", () => {
  beforeAll(() => {
    // Ensure project is built
    try {
      execSync("npm run build", { cwd: projectRoot, stdio: "pipe" });
    } catch (error) {
      console.warn("Build failed, tests may not work properly");
    }
  });

  it("should show help message", () => {
    const output = execSync(`node "${binPath}" --help`, { encoding: "utf8" });
    expect(output).toContain("Permamind MCP Server");
    expect(output).toContain("Usage:");
    expect(output).toContain("--help");
    expect(output).toContain("--version");
    expect(output).toContain("--setup");
  });

  it("should show version", () => {
    const output = execSync(`node "${binPath}" --version`, {
      encoding: "utf8",
    });
    expect(output).toContain("permamind v");
  });

  it("should show info", () => {
    const output = execSync(`node "${binPath}" --info`, { encoding: "utf8" });
    expect(output).toContain("Permamind MCP Server");
    expect(output).toContain("Description:");
    expect(output).toContain("Repository:");
  });

  it("should handle unknown commands gracefully", () => {
    expect(() => {
      execSync(`node "${binPath}" --unknown-command`, { stdio: "pipe" });
    }).toThrow();
  });

  it("should require config path for --config option", () => {
    expect(() => {
      execSync(`node "${binPath}" --config`, { stdio: "pipe" });
    }).toThrow();
  });
});

describe("Configuration Helper Tests", () => {
  const configScript = join(projectRoot, "scripts", "configure.js");

  it("should list configurations", () => {
    const output = execSync(`node "${configScript}" list`, {
      encoding: "utf8",
    });
    expect(output).toContain("Configuration Status:");
    expect(output).toContain("CLAUDE:");
    expect(output).toContain("VSCODE:");
    expect(output).toContain("CURSOR:");
  });

  it("should show help when no arguments", () => {
    const output = execSync(`node "${configScript}"`, { encoding: "utf8" });
    expect(output).toContain("Permamind Configuration Helper");
    expect(output).toContain("Usage:");
  });

  it("should generate environment instructions", () => {
    const output = execSync(`node "${configScript}" env "test-seed-phrase"`, {
      encoding: "utf8",
    });
    expect(output).toContain("Environment Variable Setup:");
    expect(output).toContain("Bash/Zsh:");
    expect(output).toContain("Windows CMD:");
    expect(output).toContain("test-seed-phrase");
  });

  it("should require seed phrase for env command", () => {
    expect(() => {
      execSync(`node "${configScript}" env`, { stdio: "pipe" });
    }).toThrow();
  });
});

describe("Package Structure Tests", () => {
  it("should have all required bin files", () => {
    const permamindBin = join(projectRoot, "bin", "permamind.js");
    const setupBin = join(projectRoot, "bin", "permamind-setup.js");

    expect(() => {
      execSync(`test -f "${permamindBin}"`);
    }).not.toThrow();

    expect(() => {
      execSync(`test -f "${setupBin}"`);
    }).not.toThrow();
  });

  it("should have executable permissions on bin files", () => {
    const permamindBin = join(projectRoot, "bin", "permamind.js");
    const setupBin = join(projectRoot, "bin", "permamind-setup.js");

    expect(() => {
      execSync(`test -x "${permamindBin}"`);
    }).not.toThrow();

    expect(() => {
      execSync(`test -x "${setupBin}"`);
    }).not.toThrow();
  });

  it("should have all required template files", () => {
    const templates = [
      "claude-desktop-config.json",
      "vscode-mcp.json",
      "cursor-mcp.json",
    ];

    for (const template of templates) {
      const templatePath = join(projectRoot, "templates", template);
      expect(() => {
        execSync(`test -f "${templatePath}"`);
      }).not.toThrow();
    }
  });

  it("should have all required script files", () => {
    const scripts = ["install.sh", "install.ps1", "configure.js"];

    for (const script of scripts) {
      const scriptPath = join(projectRoot, "scripts", script);
      expect(() => {
        execSync(`test -f "${scriptPath}"`);
      }).not.toThrow();
    }
  });
});
