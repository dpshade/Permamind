# Permamind CLI Style Guide

## Overview

This guide documents the enhanced CLI UI/UX system implemented for Permamind. The new system provides a consistent, accessible, and visually appealing command-line experience.

## Design Principles

### 1. **Accessibility First**
- Color-blind friendly design using symbols + colors
- Text-only fallbacks for all visual elements  
- High contrast color schemes
- Screen reader compatible output

### 2. **Visual Hierarchy**
- Clear section headers and dividers
- Consistent spacing and indentation
- Progressive information disclosure
- Scannable content structure

### 3. **User Feedback**
- Immediate visual confirmation of actions
- Progress indicators for long operations
- Clear error states with actionable solutions
- Success/warning/info status differentiation

### 4. **Consistency**
- Unified color scheme across all interfaces
- Standardized symbols and formatting
- Predictable interaction patterns
- Coherent brand voice

## Color Scheme & Symbols

### Status Colors
- 🟢 **Success**: Green + ✅ checkmark
- 🔴 **Error**: Red + ❌ X mark
- 🟡 **Warning**: Yellow + ⚠️ warning symbol  
- 🔵 **Info**: Blue + ℹ️ info symbol
- 🟣 **Progress**: Magenta + spinner/progress bars

### Color Library Choice
**Chalk** was selected over alternatives (colors.js, picocolors, kleur) because:
- Rich feature set for comprehensive styling
- Excellent terminal compatibility across platforms
- Active maintenance and community support
- Built-in accessibility considerations
- Battle-tested in major CLI tools

## UI Components

### Headers and Sections
```typescript
// Main headers with branding
ui.banner(version)       // Branded header with emoji and version
ui.header(title, subtitle) // Section header with description
ui.subheader(title)      // Subsection header
```

### Status Messages
```typescript
ui.success(message, details)           // Green checkmark + message
ui.error(message, details, solutions)  // Red X + message + solutions
ui.warning(message, details)           // Yellow warning + message  
ui.info(message, details)              // Blue info + message
```

### Progress Indicators
```typescript
const loader = ui.loading(message)     // Animated spinner
loader.stop(successMessage)            // Stop with success
loader.fail(errorMessage)              // Stop with error
```

### Interactive Elements
```typescript
ui.prompt(message, defaultValue)       // Consistent prompts
ui.list(items, type)                   // Bulleted or numbered lists
ui.table(data)                         // Key-value tables
```

### Formatting
```typescript
format.highlight(text)     // Emphasize important text
format.command(cmd)        // Format CLI commands
format.path(filePath)      // Format file paths
format.url(url)           // Format URLs
format.env(variable)      // Format environment variables
format.version(version)   // Format version numbers
```

## Before/After Examples

### Help Command
**Before:**
```
Permamind MCP Server v1.0.0
An MCP server that provides an immortal memory layer for AI agents

Usage:
  permamind [options]

Options:
  --help, -h          Show this help message
  --version, -v       Show version information
```

**After:**
```
🧠 Permamind MCP Server v1.0.0
An immortal memory layer for AI agents and clients

Usage
=====
Command line interface for Permamind MCP Server

  permamind [options]

Options
-------
  --help, -h      ➜ Show this help message
  --version, -v   ➜ Show version information
  --setup, -s     ➜ Run configuration wizard
```

### Error Handling
**Before:**
```
Error: Server file not found at: /path/to/server.js
Please build the project first: npm run build
```

**After:**
```
❌ Server file not found
  📍 Expected location: /path/to/server.js

💡 Solutions:
  1️⃣  Build the project: npm run build
  2️⃣  Check installation: npm update -g permamind
  3️⃣  File an issue: github.com/ALLiDoizCode/Permamind/issues
```

### Progress Indication
**Before:**
```
Testing server connection...
✓ Server test passed!
```

**After:**
```
⠋ Testing server connection...
✅ Connection verified - server is ready
```

## Implementation Guidelines

### Using the UI System
```typescript
// Import the UI utilities
import { ui, format } from '../dist/cli/ui.js';

// Create sections with clear headers
ui.header('Configuration Setup', 'Configure your Permamind server');

// Provide visual feedback for operations
const loader = ui.loading('Processing request');
try {
  await performOperation();
  loader.stop('Operation completed successfully!');
} catch (err) {
  loader.fail('Operation failed');
  ui.error('Error details', err.message, ['Solution 1', 'Solution 2']);
}

// Format output consistently
ui.info('Configuration saved to:', format.path(configPath));
ui.success('Ready to start:', format.command('permamind'));
```

### Error Handling Pattern
```typescript
try {
  await riskyOperation();
  ui.success('Operation completed');
} catch (err) {
  ui.error('Operation failed', err.message, [
    'Check your configuration',
    'Verify permissions',
    format.url('https://github.com/ALLiDoizCode/Permamind/issues')
  ]);
  process.exit(1);
}
```

### Interactive Prompts
```typescript
const response = await question(ui.prompt('Continue with setup?', 'y/n'));
if (response.toLowerCase() === 'y') {
  ui.success('Proceeding with setup');
} else {
  ui.info('Setup cancelled by user');
}
```

## Terminal Compatibility

### Tested Environments
- ✅ macOS Terminal.app
- ✅ macOS iTerm2
- ✅ Windows PowerShell
- ✅ Windows Command Prompt
- ✅ Linux GNOME Terminal
- ✅ VS Code Integrated Terminal

### Fallback Support
- ASCII-only mode for terminals without Unicode support
- Graceful degradation when colors are not supported
- Proper handling of narrow terminal windows

## Accessibility Features

### Color-Blind Support
- All status indicators use symbols + colors
- High contrast color combinations
- No reliance on color alone for information

### Screen Reader Support
- Semantic text structure
- Clear labeling of interactive elements
- Logical reading order

### Low Vision Support
- High contrast color scheme
- Consistent spacing for easier scanning
- Large, clear symbols and indicators

## Best Practices

### Do's
- ✅ Use consistent UI components across all interfaces
- ✅ Provide immediate feedback for user actions
- ✅ Include helpful solutions with error messages
- ✅ Use progress indicators for operations > 500ms
- ✅ Format paths, commands, and URLs consistently
- ✅ Group related information with clear headers

### Don'ts
- ❌ Mix different progress indication styles
- ❌ Use colors without accompanying symbols
- ❌ Create walls of text without structure
- ❌ Forget error handling and user feedback
- ❌ Use inconsistent formatting for similar elements
- ❌ Skip accessibility considerations

## Performance Considerations

### Optimization Tips
- UI operations are lightweight and fast
- Chalk provides efficient color rendering
- Minimal impact on startup time
- Progressive enhancement for better terminals

### Memory Usage
- UI utilities are stateless
- No persistent state or memory leaks
- Efficient string processing
- Minimal dependency footprint

## Future Enhancements

### Planned Features
- [ ] Configuration-based color themes
- [ ] Terminal width-aware formatting
- [ ] Interactive selection menus
- [ ] Progress bars for file operations
- [ ] Tabular data visualization
- [ ] Copy-to-clipboard functionality

### Extensibility
The UI system is designed for easy extension:
```typescript
// Adding new status types
ui.custom = (symbol, color, message) => {
  console.log(color(`${symbol} ${message}`));
};

// Creating new formatting helpers
format.customType = (text) => chalk.custom(text);
```

## Troubleshooting

### Common Issues

**Colors not displaying:**
- Check if terminal supports colors
- Verify NO_COLOR environment variable is not set
- Test with a different terminal emulator

**Symbols not rendering:**
- Ensure terminal supports Unicode
- Check font includes required Unicode symbols
- Use ASCII fallback mode if needed

**Layout issues:**
- Verify terminal width is adequate (min 80 chars)
- Check for conflicting terminal themes
- Test with default terminal settings

### Debug Mode
Enable debug output for troubleshooting:
```bash
DEBUG=permamind:ui permamind --help
```

---

This style guide ensures consistent, accessible, and professional CLI experiences across all Permamind interfaces.