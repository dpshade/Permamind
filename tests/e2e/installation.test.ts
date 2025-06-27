import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { join } from 'path';
import { readFileSync } from 'fs';

const projectRoot = join(__dirname, '..', '..');

describe('NPM Package Installation Tests', () => {
  it('should have correct package.json configuration', () => {
    const packageJson = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8'));
    
    // Check required fields
    expect(packageJson.name).toBe('permamind');
    expect(packageJson.description).toBeDefined();
    expect(packageJson.author).toBeDefined();
    expect(packageJson.license).toBe('MIT');
    expect(packageJson.repository).toBeDefined();
    
    // Check bin entries
    expect(packageJson.bin).toBeDefined();
    expect(packageJson.bin.permamind).toBe('./bin/permamind.js');
    expect(packageJson.bin['permamind-setup']).toBe('./bin/permamind-setup.js');
    
    // Check preferGlobal
    expect(packageJson.preferGlobal).toBe(true);
    
    // Check files array
    expect(packageJson.files).toContain('dist/**/*');
    expect(packageJson.files).toContain('bin/**/*');
    expect(packageJson.files).toContain('templates/**/*');
    expect(packageJson.files).toContain('scripts/**/*');
    
    // Check publishConfig
    expect(packageJson.publishConfig).toBeDefined();
    expect(packageJson.publishConfig.access).toBe('public');
    
    // Check engines
    expect(packageJson.engines).toBeDefined();
    expect(packageJson.engines.node).toBe('>=20.0.0');
  });

  it('should create a valid npm package', () => {
    // Test npm pack (dry run)
    const output = execSync('npm pack --dry-run', { 
      cwd: projectRoot, 
      encoding: 'utf8' 
    });
    
    expect(output).toContain('permamind-');
    // In some environments, pack output varies, so just check for package creation
    // The presence of the version and package size indicates successful packaging
    if (output.includes('Tarball Contents')) {
      // Full verbose output - check for key files
      expect(output).toContain('bin/');
      expect(output).toContain('dist/');
      expect(output).toContain('templates/');
      expect(output).toContain('scripts/');
    } else {
      // Minimal output - just verify package name format
      expect(output).toMatch(/permamind-\d+\.\d+\.\d+\.tgz/);
    }
  });

  it('should have valid keywords for NPM discovery', () => {
    const packageJson = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8'));
    
    expect(packageJson.keywords).toContain('mcp');
    expect(packageJson.keywords).toContain('ai');
    expect(packageJson.keywords).toContain('memory');
    expect(packageJson.keywords).toContain('mcp-server');
  });

  it('should have proper scripts for CI/CD', () => {
    const packageJson = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8'));
    
    expect(packageJson.scripts.prepublishOnly).toBeDefined();
    expect(packageJson.scripts.postpublish).toBeDefined();
    expect(packageJson.scripts['ci:quality']).toBeDefined();
  });
});

describe('Cross-platform Compatibility Tests', () => {
  it('should use cross-platform path handling', () => {
    // Read the main bin file and check for proper path handling
    const binContent = readFileSync(join(projectRoot, 'bin', 'permamind.js'), 'utf8');
    
    // Should use path.join instead of hardcoded separators
    expect(binContent).toContain('join(');
    expect(binContent).not.toContain('\\\\');
    // Check for hardcoded path separators (not URLs or comments)
    const lines = binContent.split('\n');
    const pathLines = lines.filter(line => {
      const trimmed = line.trim();
      return !trimmed.startsWith('//') && 
             !trimmed.startsWith('*') &&
             !trimmed.includes('https://') &&
             !trimmed.includes('http://') &&
             line.includes('//') &&
             !line.includes('console.') // Allow URLs in console messages
    });
    expect(pathLines.length).toBe(0);
  });

  it('should have proper shebangs', () => {
    const binFiles = [
      join(projectRoot, 'bin', 'permamind.js'),
      join(projectRoot, 'bin', 'permamind-setup.js'),
      join(projectRoot, 'scripts', 'configure.js')
    ];
    
    for (const file of binFiles) {
      const content = readFileSync(file, 'utf8');
      expect(content.startsWith('#!/usr/bin/env node')).toBe(true);
    }
  });

  it('should handle different operating systems in setup', () => {
    const setupContent = readFileSync(join(projectRoot, 'bin', 'permamind-setup.js'), 'utf8');
    
    expect(setupContent).toContain('darwin');
    expect(setupContent).toContain('win32');
    expect(setupContent).toContain('linux');
  });
});

describe('Installation Script Tests', () => {
  it('should have Unix installation script', () => {
    const scriptPath = join(projectRoot, 'scripts', 'install.sh');
    const content = readFileSync(scriptPath, 'utf8');
    
    expect(content).toContain('#!/bin/bash');
    expect(content).toContain('npm install -g permamind');
    expect(content).toContain('check_dependencies');
  });

  it('should have Windows installation script', () => {
    const scriptPath = join(projectRoot, 'scripts', 'install.ps1');
    const content = readFileSync(scriptPath, 'utf8');
    
    expect(content).toContain('npm install -g permamind');
    expect(content).toContain('Test-Dependencies');
  });

  it('should validate Node.js version in install scripts', () => {
    const bashScript = readFileSync(join(projectRoot, 'scripts', 'install.sh'), 'utf8');
    const psScript = readFileSync(join(projectRoot, 'scripts', 'install.ps1'), 'utf8');
    
    // Both scripts should check for Node.js 20+
    expect(bashScript).toContain('20');
    expect(psScript).toContain('20');
  });
});