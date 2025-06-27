import chalk from 'chalk';

/**
 * CLI UI Utility System
 * Provides consistent, accessible, and visually appealing CLI interface components
 */

// Color scheme with accessibility considerations
const colors = {
  // Status colors with symbol fallbacks for color-blind users
  success: chalk.green,
  error: chalk.red,
  warning: chalk.yellow,
  info: chalk.blue,
  progress: chalk.magenta,
  
  // Text styling
  bold: chalk.bold,
  dim: chalk.dim,
  italic: chalk.italic,
  underline: chalk.underline,
  
  // Semantic colors
  primary: chalk.cyan,
  secondary: chalk.gray,
  accent: chalk.magenta,
  muted: chalk.gray,
  
  // Background colors for emphasis
  bgSuccess: chalk.bgGreen.black,
  bgError: chalk.bgRed.white,
  bgWarning: chalk.bgYellow.black,
  bgInfo: chalk.bgBlue.white,
} as const;

// Symbols for consistent iconography (with Unicode fallbacks)
const symbols = {
  success: '✅',
  error: '❌', 
  warning: '⚠️',
  info: 'ℹ️',
  progress: '🔄',
  arrow: '➜',
  bullet: '•',
  check: '✓',
  cross: '✗',
  star: '⭐',
  rocket: '🚀',
  gear: '⚙️',
  key: '🔑',
  lock: '🔒',
  folder: '📁',
  file: '📄',
  link: '🔗',
  search: '🔍',
  lightbulb: '💡',
  exclamation: '❗',
  question: '❓',
  thumbsUp: '👍',
  thumbsDown: '👎',
  fire: '🔥',
  heart: '❤️',
  brain: '🧠',
  shield: '🛡️',
  wrench: '🔧',
  package: '📦',
  globe: '🌐',
} as const;

// Spinner frames for progress indication
const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

/**
 * Status message formatters
 */
export const ui = {
  // Status messages with consistent formatting
  success: (message: string, details?: string) => {
    console.log(colors.success(`${symbols.success} ${message}`));
    if (details) {
      console.log(colors.dim(`  ${details}`));
    }
  },

  error: (message: string, details?: string, solutions?: string[]) => {
    console.log(colors.error(`${symbols.error} ${message}`));
    if (details) {
      console.log(colors.dim(`  ${details}`));
    }
    if (solutions && solutions.length > 0) {
      console.log('');
      console.log(colors.info(`${symbols.lightbulb} Solutions:`));
      solutions.forEach((solution, index) => {
        console.log(colors.dim(`  ${index + 1}️⃣  ${solution}`));
      });
    }
  },

  warning: (message: string, details?: string) => {
    console.log(colors.warning(`${symbols.warning} ${message}`));
    if (details) {
      console.log(colors.dim(`  ${details}`));
    }
  },

  info: (message: string, details?: string) => {
    console.log(colors.info(`${symbols.info} ${message}`));
    if (details) {
      console.log(colors.dim(`  ${details}`));
    }
  },

  // Section headers and dividers
  header: (title: string, subtitle?: string) => {
    console.log('');
    console.log(chalk.bold.cyan(title));
    console.log(colors.primary('='.repeat(title.length)));
    if (subtitle) {
      console.log(colors.dim(subtitle));
    }
    console.log('');
  },

  subheader: (title: string) => {
    console.log('');
    console.log(colors.bold(title));
    console.log(colors.dim('-'.repeat(title.length)));
  },

  // Interactive prompts
  prompt: (message: string, defaultValue?: string) => {
    const prompt = defaultValue 
      ? `${colors.primary('?')} ${message} ${colors.dim(`(${defaultValue})`)}: `
      : `${colors.primary('?')} ${message}: `;
    return prompt;
  },

  // Lists and bullets
  list: (items: string[], type: 'bullet' | 'numbered' = 'bullet') => {
    items.forEach((item, index) => {
      const marker = type === 'numbered' 
        ? colors.dim(`${index + 1}.`) 
        : colors.dim(symbols.bullet);
      console.log(`  ${marker} ${item}`);
    });
  },

  // Code blocks and paths
  code: (code: string) => {
    console.log(colors.dim('  ' + code));
  },

  path: (path: string) => {
    return colors.underline.cyan(path);
  },

  // Progress indication
  progress: (message: string) => {
    process.stdout.write(colors.progress(`${symbols.progress} ${message}...`));
  },

  // Completion of progress
  progressComplete: () => {
    process.stdout.write('\r' + ' '.repeat(process.stdout.columns || 80) + '\r');
  },

  // Dividers and spacing
  divider: () => {
    console.log(colors.dim('─'.repeat(60)));
  },

  space: () => {
    console.log('');
  },

  // Special status indicators
  loading: (message: string) => {
    let frame = 0;
    const interval = setInterval(() => {
      const spinner = spinnerFrames[frame % spinnerFrames.length];
      process.stdout.write(`\r${colors.progress(spinner)} ${message}...`);
      frame++;
    }, 100);
    
    return {
      stop: (finalMessage?: string) => {
        clearInterval(interval);
        if (finalMessage) {
          process.stdout.write(`\r${colors.success(symbols.success)} ${finalMessage}\n`);
        } else {
          process.stdout.write('\r' + ' '.repeat(process.stdout.columns || 80) + '\r');
        }
      },
      fail: (errorMessage: string) => {
        clearInterval(interval);
        process.stdout.write(`\r${colors.error(symbols.error)} ${errorMessage}\n`);
      }
    };
  },

  // Branded elements
  banner: (version: string) => {
    console.log('');
    console.log(chalk.bold.cyan(`${symbols.brain} Permamind MCP Server ${colors.dim(`v${version}`)}`));
    console.log(colors.dim('An immortal memory layer for AI agents and clients'));
    console.log('');
  },

  // Tables for structured data
  table: (data: Array<{ key: string; value: string }>) => {
    const maxKeyLength = Math.max(...data.map(item => item.key.length));
    data.forEach(({ key, value }) => {
      const paddedKey = key.padEnd(maxKeyLength);
      console.log(`  ${colors.dim(paddedKey)} ${colors.primary(symbols.arrow)} ${value}`);
    });
  },

  // Command examples
  command: (description: string, command: string) => {
    console.log(`  ${colors.dim(description)}`);
    console.log(`  ${chalk.bold.cyan('$')} ${chalk.cyan(command)}`);
    console.log('');
  },
};

/**
 * Utility functions for consistent formatting
 */
export const format = {
  // Highlight important text
  highlight: (text: string) => chalk.bold.cyan(text),
  
  // Emphasize text
  emphasize: (text: string) => colors.bold(text),
  
  // Mute less important text
  mute: (text: string) => colors.dim(text),
  
  // Format file paths
  path: (path: string) => chalk.underline.cyan(path),
  
  // Format URLs
  url: (url: string) => chalk.underline.blue(url),
  
  // Format commands
  command: (cmd: string) => chalk.bold.cyan(cmd),
  
  // Format environment variables
  env: (envVar: string) => chalk.bold.yellow(envVar),
  
  // Format JSON/code
  json: (text: string) => colors.dim(text),
  
  // Format versions
  version: (version: string) => chalk.bold.green(version),
};

/**
 * Layout utilities for consistent spacing and structure
 */
export const layout = {
  // Create consistent sections
  section: (title: string, content: () => void) => {
    ui.subheader(title);
    content();
    ui.space();
  },
  
  // Indent content
  indent: (content: string, level: number = 1) => {
    const spaces = '  '.repeat(level);
    return content.split('\n').map(line => spaces + line).join('\n');
  },
  
  // Create boxed content
  box: (content: string[], title?: string) => {
    const maxWidth = Math.max(...content.map(line => line.length), title?.length || 0);
    const border = '─'.repeat(maxWidth + 4);
    
    console.log(colors.dim('┌' + border + '┐'));
    if (title) {
      console.log(colors.dim('│ ') + colors.bold(title.padEnd(maxWidth)) + colors.dim(' │'));
      console.log(colors.dim('├' + border + '┤'));
    }
    content.forEach(line => {
      console.log(colors.dim('│ ') + line.padEnd(maxWidth) + colors.dim(' │'));
    });
    console.log(colors.dim('└' + border + '┘'));
  },
};