#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

// Colors
const cyan = '\x1b[36m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const dim = '\x1b[2m';
const reset = '\x1b[0m';

// Get version from package.json
const pkg = require('../package.json');

// Parse args
const args = process.argv.slice(2);
const hasGlobal = args.includes('--global') || args.includes('-g');
const hasLocal = args.includes('--local') || args.includes('-l');
const hasOpencode = args.includes('--opencode');
const hasClaude = args.includes('--claude');
const hasGemini = args.includes('--gemini');
const hasAll = args.includes('--all');
const hasUninstall = args.includes('--uninstall') || args.includes('-u');

// Runtime selection - can be set by flags or interactive prompt
let selectedRuntimes = [];
if (hasAll) {
  selectedRuntimes = ['claude', 'opencode', 'gemini'];
} else {
  if (hasOpencode) selectedRuntimes.push('opencode');
  if (hasClaude) selectedRuntimes.push('claude');
  if (hasGemini) selectedRuntimes.push('gemini');
}

// Helper to get directory name for a runtime (used for local/project installs)
function getDirName(runtime) {
  if (runtime === 'opencode') return '.opencode';
  if (runtime === 'gemini') return '.gemini';
  return '.claude';
}

/**
 * Expand ~ to home directory
 */
function expandTilde(filePath) {
  if (filePath && filePath.startsWith('~/')) {
    return path.join(os.homedir(), filePath.slice(2));
  }
  return filePath;
}

/**
 * Get the global config directory for OpenCode
 * OpenCode follows XDG Base Directory spec and uses ~/.config/opencode/
 */
function getOpencodeGlobalDir() {
  if (process.env.OPENCODE_CONFIG_DIR) {
    return expandTilde(process.env.OPENCODE_CONFIG_DIR);
  }
  if (process.env.OPENCODE_CONFIG) {
    return path.dirname(expandTilde(process.env.OPENCODE_CONFIG));
  }
  if (process.env.XDG_CONFIG_HOME) {
    return path.join(expandTilde(process.env.XDG_CONFIG_HOME), 'opencode');
  }
  return path.join(os.homedir(), '.config', 'opencode');
}

/**
 * Get the global config directory for a runtime
 */
function getGlobalDir(runtime, explicitDir = null) {
  if (runtime === 'opencode') {
    if (explicitDir) return expandTilde(explicitDir);
    return getOpencodeGlobalDir();
  }
  if (runtime === 'gemini') {
    if (explicitDir) return expandTilde(explicitDir);
    if (process.env.GEMINI_CONFIG_DIR) return expandTilde(process.env.GEMINI_CONFIG_DIR);
    return path.join(os.homedir(), '.gemini');
  }
  // Claude Code
  if (explicitDir) return expandTilde(explicitDir);
  if (process.env.CLAUDE_CONFIG_DIR) return expandTilde(process.env.CLAUDE_CONFIG_DIR);
  return path.join(os.homedir(), '.claude');
}

const banner = '\n' +
  cyan + '  ██╗███╗   ██╗███████╗██████╗  █████╗\n' +
  '  ██║████╗  ██║██╔════╝██╔══██╗██╔══██╗\n' +
  '  ██║██╔██╗ ██║█████╗  ██████╔╝███████║\n' +
  '  ██║██║╚██╗██║██╔══╝  ██╔══██╗██╔══██║\n' +
  '  ██║██║ ╚████║██║     ██║  ██║██║  ██║\n' +
  '  ╚═╝╚═╝  ╚═══╝╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝' + reset + '\n' +
  '\n' +
  '  Get Infra Done ' + dim + 'v' + pkg.version + reset + '\n' +
  '  AI-powered infrastructure generation — from repo scan\n' +
  '  to production Terraform for Claude Code, OpenCode, and Gemini.\n';

// Parse --config-dir argument
function parseConfigDirArg() {
  const configDirIndex = args.findIndex(arg => arg === '--config-dir' || arg === '-c');
  if (configDirIndex !== -1) {
    const nextArg = args[configDirIndex + 1];
    if (!nextArg || nextArg.startsWith('-')) {
      console.error(`  ${yellow}--config-dir requires a path argument${reset}`);
      process.exit(1);
    }
    return nextArg;
  }
  const configDirArg = args.find(arg => arg.startsWith('--config-dir=') || arg.startsWith('-c='));
  if (configDirArg) {
    const value = configDirArg.split('=')[1];
    if (!value) {
      console.error(`  ${yellow}--config-dir requires a non-empty path${reset}`);
      process.exit(1);
    }
    return value;
  }
  return null;
}
const explicitConfigDir = parseConfigDirArg();
const hasHelp = args.includes('--help') || args.includes('-h');

console.log(banner);

// Show help if requested
if (hasHelp) {
  console.log(`  ${yellow}Usage:${reset} npx get-infra-done-cc [options]\n\n  ${yellow}Options:${reset}\n    ${cyan}-g, --global${reset}              Install globally (to config directory)\n    ${cyan}-l, --local${reset}               Install locally (to current directory)\n    ${cyan}--claude${reset}                  Install for Claude Code only\n    ${cyan}--opencode${reset}                Install for OpenCode only\n    ${cyan}--gemini${reset}                  Install for Gemini only\n    ${cyan}--all${reset}                     Install for all runtimes\n    ${cyan}-u, --uninstall${reset}           Uninstall (remove all infra files)\n    ${cyan}-c, --config-dir <path>${reset}   Specify custom config directory\n    ${cyan}-h, --help${reset}                Show this help message\n\n  ${yellow}Examples:${reset}\n    ${dim}# Interactive install (prompts for runtime and location)${reset}\n    npx get-infra-done-cc\n\n    ${dim}# Install for Claude Code globally${reset}\n    npx get-infra-done-cc --claude --global\n\n    ${dim}# Install for all runtimes globally${reset}\n    npx get-infra-done-cc --all --global\n\n    ${dim}# Install to custom config directory${reset}\n    npx get-infra-done-cc --claude --global --config-dir ~/.claude-bc\n\n    ${dim}# Install to current project only${reset}\n    npx get-infra-done-cc --claude --local\n\n    ${dim}# Uninstall from Claude Code globally${reset}\n    npx get-infra-done-cc --claude --global --uninstall\n`);
  process.exit(0);
}

/**
 * Read and parse settings.json, returning empty object if it doesn't exist
 */
function readSettings(settingsPath) {
  if (fs.existsSync(settingsPath)) {
    try {
      return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    } catch (e) {
      return {};
    }
  }
  return {};
}

/**
 * Write settings.json with proper formatting
 */
function writeSettings(settingsPath, settings) {
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
}

// ──────────────────────────────────────────────────────
// Tool name mapping and format conversion
// ──────────────────────────────────────────────────────

// Color name to hex mapping for opencode compatibility
const colorNameToHex = {
  cyan: '#00FFFF',
  red: '#FF0000',
  green: '#00FF00',
  blue: '#0000FF',
  yellow: '#FFFF00',
  magenta: '#FF00FF',
  orange: '#FFA500',
  purple: '#800080',
  pink: '#FFC0CB',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#808080',
  grey: '#808080',
};

// Tool name mapping from Claude Code to OpenCode
const claudeToOpencodeTools = {
  AskUserQuestion: 'question',
  SlashCommand: 'skill',
  TodoWrite: 'todowrite',
  WebFetch: 'webfetch',
  WebSearch: 'websearch',
};

// Tool name mapping from Claude Code to Gemini CLI
const claudeToGeminiTools = {
  Read: 'read_file',
  Write: 'write_file',
  Edit: 'replace',
  Bash: 'run_shell_command',
  Glob: 'glob',
  Grep: 'search_file_content',
  WebSearch: 'google_web_search',
  WebFetch: 'web_fetch',
  TodoWrite: 'write_todos',
  AskUserQuestion: 'ask_user',
};

/**
 * Convert a Claude Code tool name to OpenCode format
 */
function convertToolName(claudeTool) {
  if (claudeToOpencodeTools[claudeTool]) {
    return claudeToOpencodeTools[claudeTool];
  }
  if (claudeTool.startsWith('mcp__')) {
    return claudeTool;
  }
  return claudeTool.toLowerCase();
}

/**
 * Convert a Claude Code tool name to Gemini CLI format
 * @returns {string|null} Gemini tool name, or null if tool should be excluded
 */
function convertGeminiToolName(claudeTool) {
  if (claudeTool.startsWith('mcp__')) return null;
  if (claudeTool === 'Task') return null;
  if (claudeToGeminiTools[claudeTool]) return claudeToGeminiTools[claudeTool];
  return claudeTool.toLowerCase();
}

/**
 * Strip HTML <sub> tags for Gemini CLI output
 */
function stripSubTags(content) {
  return content.replace(/<sub>(.*?)<\/sub>/g, '*($1)*');
}

/**
 * Convert Claude Code agent frontmatter to Gemini CLI format
 */
function convertClaudeToGeminiAgent(content) {
  if (!content.startsWith('---')) return content;

  const endIndex = content.indexOf('---', 3);
  if (endIndex === -1) return content;

  const frontmatter = content.substring(3, endIndex).trim();
  const body = content.substring(endIndex + 3);

  const lines = frontmatter.split('\n');
  const newLines = [];
  let inAllowedTools = false;
  const tools = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('allowed-tools:')) {
      inAllowedTools = true;
      continue;
    }

    if (trimmed.startsWith('tools:')) {
      const toolsValue = trimmed.substring(6).trim();
      if (toolsValue) {
        const parsed = toolsValue.split(',').map(t => t.trim()).filter(t => t);
        for (const t of parsed) {
          const mapped = convertGeminiToolName(t);
          if (mapped) tools.push(mapped);
        }
      } else {
        inAllowedTools = true;
      }
      continue;
    }

    if (trimmed.startsWith('color:')) continue;

    if (inAllowedTools) {
      if (trimmed.startsWith('- ')) {
        const mapped = convertGeminiToolName(trimmed.substring(2).trim());
        if (mapped) tools.push(mapped);
        continue;
      } else if (trimmed && !trimmed.startsWith('-')) {
        inAllowedTools = false;
      }
    }

    if (!inAllowedTools) {
      newLines.push(line);
    }
  }

  if (tools.length > 0) {
    newLines.push('tools:');
    for (const tool of tools) {
      newLines.push(`  - ${tool}`);
    }
  }

  const newFrontmatter = newLines.join('\n').trim();
  const escapedBody = body.replace(/\$\{(\w+)\}/g, '$$$1');

  return `---\n${newFrontmatter}\n---${stripSubTags(escapedBody)}`;
}

/**
 * Convert Claude Code frontmatter to opencode format
 */
function convertClaudeToOpencodeFrontmatter(content) {
  let convertedContent = content;
  convertedContent = convertedContent.replace(/\bAskUserQuestion\b/g, 'question');
  convertedContent = convertedContent.replace(/\bSlashCommand\b/g, 'skill');
  convertedContent = convertedContent.replace(/\bTodoWrite\b/g, 'todowrite');
  // Replace /infra:command with /infra-command for opencode (flat command structure)
  convertedContent = convertedContent.replace(/\/infra:/g, '/infra-');
  // Replace ~/.claude with ~/.config/opencode
  convertedContent = convertedContent.replace(/~\/\.claude\b/g, '~/.config/opencode');
  // Replace general-purpose subagent type with OpenCode's equivalent
  convertedContent = convertedContent.replace(/subagent_type="general-purpose"/g, 'subagent_type="general"');

  if (!convertedContent.startsWith('---')) {
    return convertedContent;
  }

  const endIndex = convertedContent.indexOf('---', 3);
  if (endIndex === -1) {
    return convertedContent;
  }

  const frontmatter = convertedContent.substring(3, endIndex).trim();
  const body = convertedContent.substring(endIndex + 3);

  const lines = frontmatter.split('\n');
  const newLines = [];
  let inAllowedTools = false;
  const allowedTools = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('allowed-tools:')) {
      inAllowedTools = true;
      continue;
    }

    if (trimmed.startsWith('tools:')) {
      const toolsValue = trimmed.substring(6).trim();
      if (toolsValue) {
        const tools = toolsValue.split(',').map(t => t.trim()).filter(t => t);
        allowedTools.push(...tools);
      }
      continue;
    }

    if (trimmed.startsWith('name:')) {
      continue;
    }

    if (trimmed.startsWith('color:')) {
      const colorValue = trimmed.substring(6).trim().toLowerCase();
      const hexColor = colorNameToHex[colorValue];
      if (hexColor) {
        newLines.push(`color: "${hexColor}"`);
      } else if (colorValue.startsWith('#')) {
        if (/^#[0-9a-f]{3}$|^#[0-9a-f]{6}$/i.test(colorValue)) {
          newLines.push(line);
        }
      }
      continue;
    }

    if (inAllowedTools) {
      if (trimmed.startsWith('- ')) {
        allowedTools.push(trimmed.substring(2).trim());
        continue;
      } else if (trimmed && !trimmed.startsWith('-')) {
        inAllowedTools = false;
      }
    }

    if (!inAllowedTools) {
      newLines.push(line);
    }
  }

  if (allowedTools.length > 0) {
    newLines.push('tools:');
    for (const tool of allowedTools) {
      newLines.push(`  ${convertToolName(tool)}: true`);
    }
  }

  const newFrontmatter = newLines.join('\n').trim();
  return `---\n${newFrontmatter}\n---${body}`;
}

/**
 * Convert Claude Code markdown command to Gemini TOML format
 */
function convertClaudeToGeminiToml(content) {
  if (!content.startsWith('---')) {
    return `prompt = ${JSON.stringify(content)}\n`;
  }

  const endIndex = content.indexOf('---', 3);
  if (endIndex === -1) {
    return `prompt = ${JSON.stringify(content)}\n`;
  }

  const frontmatter = content.substring(3, endIndex).trim();
  const body = content.substring(endIndex + 3).trim();

  let description = '';
  const lines = frontmatter.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('description:')) {
      description = trimmed.substring(12).trim();
      break;
    }
  }

  let toml = '';
  if (description) {
    toml += `description = ${JSON.stringify(description)}\n`;
  }
  toml += `prompt = ${JSON.stringify(body)}\n`;
  return toml;
}

// ──────────────────────────────────────────────────────
// File copy helpers
// ──────────────────────────────────────────────────────

/**
 * Copy commands to a flat structure for OpenCode
 * OpenCode expects: command/infra-help.md (invoked as /infra-help)
 * Source structure: commands/infra/help.md
 */
function copyFlattenedCommands(srcDir, destDir, prefix, pathPrefix, runtime) {
  if (!fs.existsSync(srcDir)) return;

  // Remove old infra-*.md files before copying new ones
  if (fs.existsSync(destDir)) {
    for (const file of fs.readdirSync(destDir)) {
      if (file.startsWith(`${prefix}-`) && file.endsWith('.md')) {
        fs.unlinkSync(path.join(destDir, file));
      }
    }
  } else {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);

    if (entry.isDirectory()) {
      copyFlattenedCommands(srcPath, destDir, `${prefix}-${entry.name}`, pathPrefix, runtime);
    } else if (entry.name.endsWith('.md')) {
      const baseName = entry.name.replace('.md', '');
      const destName = `${prefix}-${baseName}.md`;
      const destPath = path.join(destDir, destName);

      let content = fs.readFileSync(srcPath, 'utf8');
      const globalClaudeRegex = /~\/\.claude\//g;
      const localClaudeRegex = /\.\/\.claude\//g;
      const opencodeDirRegex = /~\/\.opencode\//g;
      content = content.replace(globalClaudeRegex, pathPrefix);
      content = content.replace(localClaudeRegex, `./${getDirName(runtime)}/`);
      content = content.replace(opencodeDirRegex, pathPrefix);
      content = convertClaudeToOpencodeFrontmatter(content);

      fs.writeFileSync(destPath, content);
    }
  }
}

/**
 * Recursively copy directory, replacing paths in .md files
 * Deletes existing destDir first to remove orphaned files from previous versions
 */
function copyWithPathReplacement(srcDir, destDir, pathPrefix, runtime, isCommand = false) {
  const isOpencode = runtime === 'opencode';
  const dirName = getDirName(runtime);

  // Clean install: remove existing destination to prevent orphaned files
  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true });
  }
  fs.mkdirSync(destDir, { recursive: true });

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyWithPathReplacement(srcPath, destPath, pathPrefix, runtime, isCommand);
    } else if (entry.name.endsWith('.md')) {
      let content = fs.readFileSync(srcPath, 'utf8');
      const globalClaudeRegex = /~\/\.claude\//g;
      const localClaudeRegex = /\.\/\.claude\//g;
      content = content.replace(globalClaudeRegex, pathPrefix);
      content = content.replace(localClaudeRegex, `./${dirName}/`);

      if (isOpencode) {
        content = convertClaudeToOpencodeFrontmatter(content);
        fs.writeFileSync(destPath, content);
      } else if (runtime === 'gemini') {
        if (isCommand) {
          content = stripSubTags(content);
          const tomlContent = convertClaudeToGeminiToml(content);
          const tomlPath = destPath.replace(/\.md$/, '.toml');
          fs.writeFileSync(tomlPath, tomlContent);
        } else {
          fs.writeFileSync(destPath, content);
        }
      } else {
        fs.writeFileSync(destPath, content);
      }
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// ──────────────────────────────────────────────────────
// Verification
// ──────────────────────────────────────────────────────

/**
 * Verify a directory exists and contains files
 */
function verifyInstalled(dirPath, description) {
  if (!fs.existsSync(dirPath)) {
    console.error(`  ${yellow}✗${reset} Failed to install ${description}: directory not created`);
    return false;
  }
  try {
    const entries = fs.readdirSync(dirPath);
    if (entries.length === 0) {
      console.error(`  ${yellow}✗${reset} Failed to install ${description}: directory is empty`);
      return false;
    }
  } catch (e) {
    console.error(`  ${yellow}✗${reset} Failed to install ${description}: ${e.message}`);
    return false;
  }
  return true;
}

/**
 * Verify a file exists
 */
function verifyFileInstalled(filePath, description) {
  if (!fs.existsSync(filePath)) {
    console.error(`  ${yellow}✗${reset} Failed to install ${description}: file not created`);
    return false;
  }
  return true;
}

// ──────────────────────────────────────────────────────
// Uninstall
// ──────────────────────────────────────────────────────

/**
 * Uninstall infra files from the specified directory for a specific runtime
 * Removes only infra-specific files/directories, preserves everything else
 */
function uninstall(isGlobal, runtime = 'claude') {
  const isOpencode = runtime === 'opencode';
  const dirName = getDirName(runtime);

  const targetDir = isGlobal
    ? getGlobalDir(runtime, explicitConfigDir)
    : path.join(process.cwd(), dirName);

  const locationLabel = isGlobal
    ? targetDir.replace(os.homedir(), '~')
    : targetDir.replace(process.cwd(), '.');

  let runtimeLabel = 'Claude Code';
  if (runtime === 'opencode') runtimeLabel = 'OpenCode';
  if (runtime === 'gemini') runtimeLabel = 'Gemini';

  console.log(`  Uninstalling Infra from ${cyan}${runtimeLabel}${reset} at ${cyan}${locationLabel}${reset}\n`);

  if (!fs.existsSync(targetDir)) {
    console.log(`  ${yellow}⚠${reset} Directory does not exist: ${locationLabel}`);
    console.log(`  Nothing to uninstall.\n`);
    return;
  }

  let removedCount = 0;

  // 1. Remove infra commands
  if (isOpencode) {
    // OpenCode: remove command/infra-*.md files
    const commandDir = path.join(targetDir, 'command');
    if (fs.existsSync(commandDir)) {
      const files = fs.readdirSync(commandDir);
      for (const file of files) {
        if (file.startsWith('infra-') && file.endsWith('.md')) {
          fs.unlinkSync(path.join(commandDir, file));
          removedCount++;
        }
      }
      if (removedCount > 0) {
        console.log(`  ${green}✓${reset} Removed infra commands from command/`);
      }
    }
  } else {
    // Claude Code & Gemini: remove commands/infra/ directory
    const infraCommandsDir = path.join(targetDir, 'commands', 'infra');
    if (fs.existsSync(infraCommandsDir)) {
      fs.rmSync(infraCommandsDir, { recursive: true });
      removedCount++;
      console.log(`  ${green}✓${reset} Removed commands/infra/`);
    }
  }

  // 2. Remove get-infra-done directory
  const infraDir = path.join(targetDir, 'get-infra-done');
  if (fs.existsSync(infraDir)) {
    fs.rmSync(infraDir, { recursive: true });
    removedCount++;
    console.log(`  ${green}✓${reset} Removed get-infra-done/`);
  }

  // 3. Remove infra agents (infra-*.md files only)
  const agentsDir = path.join(targetDir, 'agents');
  if (fs.existsSync(agentsDir)) {
    const files = fs.readdirSync(agentsDir);
    let agentCount = 0;
    for (const file of files) {
      if (file.startsWith('infra-') && file.endsWith('.md')) {
        fs.unlinkSync(path.join(agentsDir, file));
        agentCount++;
      }
    }
    if (agentCount > 0) {
      removedCount++;
      console.log(`  ${green}✓${reset} Removed ${agentCount} infra agents`);
    }
  }

  // 4. Remove package.json only if GSD is NOT installed
  const gsdInstalled = fs.existsSync(path.join(targetDir, 'get-shit-done'));
  if (!gsdInstalled) {
    const pkgJsonPath = path.join(targetDir, 'package.json');
    if (fs.existsSync(pkgJsonPath)) {
      try {
        const content = fs.readFileSync(pkgJsonPath, 'utf8').trim();
        if (content === '{"type":"commonjs"}') {
          fs.unlinkSync(pkgJsonPath);
          removedCount++;
          console.log(`  ${green}✓${reset} Removed package.json`);
        }
      } catch (e) {
        // Ignore read errors
      }
    }
  }

  if (removedCount === 0) {
    console.log(`  ${yellow}⚠${reset} No infra files found to remove.`);
  }

  console.log(`
  ${green}Done!${reset} Infra has been uninstalled from ${runtimeLabel}.
  Your other files and settings have been preserved.
`);
}

// ──────────────────────────────────────────────────────
// Install
// ──────────────────────────────────────────────────────

/**
 * Install to the specified directory for a specific runtime
 */
function install(isGlobal, runtime = 'claude') {
  const isOpencode = runtime === 'opencode';
  const isGemini = runtime === 'gemini';
  const dirName = getDirName(runtime);
  const src = path.join(__dirname, '..');

  const targetDir = isGlobal
    ? getGlobalDir(runtime, explicitConfigDir)
    : path.join(process.cwd(), dirName);

  const locationLabel = isGlobal
    ? targetDir.replace(os.homedir(), '~')
    : targetDir.replace(process.cwd(), '.');

  // Path prefix for file references in markdown content
  const pathPrefix = isGlobal
    ? `${targetDir.replace(/\\/g, '/')}/`
    : `./${dirName}/`;

  let runtimeLabel = 'Claude Code';
  if (isOpencode) runtimeLabel = 'OpenCode';
  if (isGemini) runtimeLabel = 'Gemini';

  console.log(`  Installing for ${cyan}${runtimeLabel}${reset} to ${cyan}${locationLabel}${reset}\n`);

  // Track installation failures
  const failures = [];

  // ── Commands ──
  if (isOpencode) {
    // OpenCode: flat structure in command/ directory
    const commandDir = path.join(targetDir, 'command');
    fs.mkdirSync(commandDir, { recursive: true });

    const infraSrc = path.join(src, 'commands', 'infra');
    copyFlattenedCommands(infraSrc, commandDir, 'infra', pathPrefix, runtime);
    if (verifyInstalled(commandDir, 'command/infra-*')) {
      const count = fs.readdirSync(commandDir).filter(f => f.startsWith('infra-')).length;
      console.log(`  ${green}✓${reset} Installed ${count} commands to command/`);
    } else {
      failures.push('command/infra-*');
    }
  } else {
    // Claude Code & Gemini: nested structure in commands/ directory
    const commandsDir = path.join(targetDir, 'commands');
    fs.mkdirSync(commandsDir, { recursive: true });

    const infraSrc = path.join(src, 'commands', 'infra');
    const infraDest = path.join(commandsDir, 'infra');
    copyWithPathReplacement(infraSrc, infraDest, pathPrefix, runtime, true);
    if (verifyInstalled(infraDest, 'commands/infra')) {
      console.log(`  ${green}✓${reset} Installed commands/infra`);
    } else {
      failures.push('commands/infra');
    }
  }

  // ── get-infra-done skill directory (bin, templates, references, workflows) ──
  const dirsToInstall = ['bin', 'templates', 'references', 'workflows'];
  const infraDest = path.join(targetDir, 'get-infra-done');
  fs.mkdirSync(infraDest, { recursive: true });

  for (const dir of dirsToInstall) {
    const dirSrc = path.join(src, dir);
    if (fs.existsSync(dirSrc)) {
      const dirDest = path.join(infraDest, dir);
      copyWithPathReplacement(dirSrc, dirDest, pathPrefix, runtime);
      if (verifyInstalled(dirDest, `get-infra-done/${dir}`)) {
        console.log(`  ${green}✓${reset} Installed get-infra-done/${dir}`);
      } else {
        failures.push(`get-infra-done/${dir}`);
      }
    }
  }

  // ── Agents ──
  const agentsSrc = path.join(src, 'agents');
  if (fs.existsSync(agentsSrc)) {
    const agentsDest = path.join(targetDir, 'agents');
    fs.mkdirSync(agentsDest, { recursive: true });

    // Remove old infra agents (infra-*.md) before copying new ones
    if (fs.existsSync(agentsDest)) {
      for (const file of fs.readdirSync(agentsDest)) {
        if (file.startsWith('infra-') && file.endsWith('.md')) {
          fs.unlinkSync(path.join(agentsDest, file));
        }
      }
    }

    // Copy new agents
    const agentEntries = fs.readdirSync(agentsSrc, { withFileTypes: true });
    for (const entry of agentEntries) {
      if (entry.isFile() && entry.name.endsWith('.md')) {
        let content = fs.readFileSync(path.join(agentsSrc, entry.name), 'utf8');
        const dirRegex = /~\/\.claude\//g;
        content = content.replace(dirRegex, pathPrefix);
        if (isOpencode) {
          content = convertClaudeToOpencodeFrontmatter(content);
        } else if (isGemini) {
          content = convertClaudeToGeminiAgent(content);
        }
        fs.writeFileSync(path.join(agentsDest, entry.name), content);
      }
    }
    if (verifyInstalled(agentsDest, 'agents')) {
      const count = fs.readdirSync(agentsDest).filter(f => f.startsWith('infra-')).length;
      console.log(`  ${green}✓${reset} Installed ${count} agents`);
    } else {
      failures.push('agents');
    }
  }

  // ── Write VERSION file ──
  const versionDest = path.join(infraDest, 'VERSION');
  fs.writeFileSync(versionDest, pkg.version);
  if (verifyFileInstalled(versionDest, 'VERSION')) {
    console.log(`  ${green}✓${reset} Wrote VERSION (${pkg.version})`);
  } else {
    failures.push('VERSION');
  }

  // ── Write package.json (CommonJS mode) ──
  // Don't overwrite if GSD already installed one
  const pkgJsonDest = path.join(targetDir, 'package.json');
  if (!fs.existsSync(pkgJsonDest)) {
    fs.writeFileSync(pkgJsonDest, '{"type":"commonjs"}\n');
    console.log(`  ${green}✓${reset} Wrote package.json (CommonJS mode)`);
  } else {
    console.log(`  ${dim}  Skipped package.json (already exists)${reset}`);
  }

  // ── Gemini: enable experimental agents ──
  const settingsPath = path.join(targetDir, 'settings.json');
  if (isGemini) {
    const settings = readSettings(settingsPath);
    if (!settings.experimental) {
      settings.experimental = {};
    }
    if (!settings.experimental.enableAgents) {
      settings.experimental.enableAgents = true;
      writeSettings(settingsPath, settings);
      console.log(`  ${green}✓${reset} Enabled experimental agents`);
    }
  }

  if (failures.length > 0) {
    console.error(`\n  ${yellow}Installation incomplete!${reset} Failed: ${failures.join(', ')}`);
    process.exit(1);
  }

  let program = 'Claude Code';
  if (runtime === 'opencode') program = 'OpenCode';
  if (runtime === 'gemini') program = 'Gemini';

  const command = isOpencode ? '/infra-help' : '/infra:help';
  console.log(`
  ${green}Done!${reset} Launch ${program} and run ${cyan}${command}${reset}.
`);
}

// ──────────────────────────────────────────────────────
// Interactive prompts
// ──────────────────────────────────────────────────────

/**
 * Prompt for runtime selection
 */
function promptRuntime(callback) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  let answered = false;

  rl.on('close', () => {
    if (!answered) {
      answered = true;
      console.log(`\n  ${yellow}Installation cancelled${reset}\n`);
      process.exit(0);
    }
  });

  console.log(`  ${yellow}Which runtime(s) would you like to install for?${reset}\n\n  ${cyan}1${reset}) Claude Code ${dim}(~/.claude)${reset}
  ${cyan}2${reset}) OpenCode    ${dim}(~/.config/opencode)${reset} - open source, free models
  ${cyan}3${reset}) Gemini      ${dim}(~/.gemini)${reset}
  ${cyan}4${reset}) All
`);

  rl.question(`  Choice ${dim}[1]${reset}: `, (answer) => {
    answered = true;
    rl.close();
    const choice = answer.trim() || '1';
    if (choice === '4') {
      callback(['claude', 'opencode', 'gemini']);
    } else if (choice === '3') {
      callback(['gemini']);
    } else if (choice === '2') {
      callback(['opencode']);
    } else {
      callback(['claude']);
    }
  });
}

/**
 * Prompt for install location
 */
function promptLocation(runtimes) {
  if (!process.stdin.isTTY) {
    console.log(`  ${yellow}Non-interactive terminal detected, defaulting to global install${reset}\n`);
    installAllRuntimes(runtimes, true);
    return;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  let answered = false;

  rl.on('close', () => {
    if (!answered) {
      answered = true;
      console.log(`\n  ${yellow}Installation cancelled${reset}\n`);
      process.exit(0);
    }
  });

  const pathExamples = runtimes.map(r => {
    const globalPath = getGlobalDir(r, explicitConfigDir);
    return globalPath.replace(os.homedir(), '~');
  }).join(', ');

  const localExamples = runtimes.map(r => `./${getDirName(r)}`).join(', ');

  console.log(`  ${yellow}Where would you like to install?${reset}\n\n  ${cyan}1${reset}) Global ${dim}(${pathExamples})${reset} - available in all projects
  ${cyan}2${reset}) Local  ${dim}(${localExamples})${reset} - this project only
`);

  rl.question(`  Choice ${dim}[1]${reset}: `, (answer) => {
    answered = true;
    rl.close();
    const choice = answer.trim() || '1';
    const isGlobal = choice !== '2';
    installAllRuntimes(runtimes, isGlobal);
  });
}

/**
 * Install for all selected runtimes
 */
function installAllRuntimes(runtimes, isGlobal) {
  for (const runtime of runtimes) {
    install(isGlobal, runtime);
  }
}

// ──────────────────────────────────────────────────────
// Main logic
// ──────────────────────────────────────────────────────

if (hasGlobal && hasLocal) {
  console.error(`  ${yellow}Cannot specify both --global and --local${reset}`);
  process.exit(1);
} else if (explicitConfigDir && hasLocal) {
  console.error(`  ${yellow}Cannot use --config-dir with --local${reset}`);
  process.exit(1);
} else if (hasUninstall) {
  if (!hasGlobal && !hasLocal) {
    console.error(`  ${yellow}--uninstall requires --global or --local${reset}`);
    process.exit(1);
  }
  const runtimes = selectedRuntimes.length > 0 ? selectedRuntimes : ['claude'];
  for (const runtime of runtimes) {
    uninstall(hasGlobal, runtime);
  }
} else if (selectedRuntimes.length > 0) {
  if (!hasGlobal && !hasLocal) {
    promptLocation(selectedRuntimes);
  } else {
    installAllRuntimes(selectedRuntimes, hasGlobal);
  }
} else if (hasGlobal || hasLocal) {
  // Default to Claude if no runtime specified but location is
  installAllRuntimes(['claude'], hasGlobal);
} else {
  // Interactive
  if (!process.stdin.isTTY) {
    console.log(`  ${yellow}Non-interactive terminal detected, defaulting to Claude Code global install${reset}\n`);
    installAllRuntimes(['claude'], true);
  } else {
    promptRuntime((runtimes) => {
      promptLocation(runtimes);
    });
  }
}
