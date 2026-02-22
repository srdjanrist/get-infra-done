#!/usr/bin/env node

/**
 * Infra Tools — CLI utility for infrastructure generation workflow operations
 *
 * Usage: node infra-tools.cjs <command> [args] [--raw]
 *
 * State Management:
 *   state load                         Load infra config + state
 *   state update <field> <value>       Update a STATE.md field
 *   state get [section]                Get STATE.md content or section
 *   state patch --field val ...        Batch update STATE.md fields
 *   state update-stage <stage>         Advance pipeline stage
 *   state record-service <name> [type] Record detected service
 *
 * Config:
 *   config-ensure-section              Initialize .infra/config.json
 *   config-set <key.path> <value>      Update config value
 *   config-get <key.path>              Read config value
 *
 * Services:
 *   service list                       List detected services
 *   service add <name> [--type T]      Add a service
 *     [--language L] [--framework F]
 *     [--port P] [--path /path]
 *   service remove <name>              Remove a service
 *
 * Terraform:
 *   terraform list                     List .tf files
 *   terraform check-binary             Check if terraform CLI is available
 *   terraform validate-structure       Validate terraform file structure
 *
 * Utilities:
 *   generate-slug <text>               Convert text to URL-safe slug
 *   current-timestamp [format]         Get timestamp (full|date|filename)
 *   verify-path-exists <path>          Check file/directory existence
 *   commit <message> [--files f1 f2]   Commit infra docs
 *
 * Compound Commands (workflow-specific initialization):
 *   init new-project                   All context for new-project workflow
 *   init analyze                       All context for analyze workflow
 *   init generate                      All context for generate workflow
 *   init progress                      Pipeline stage status
 *   init audit                         All context for audit workflow
 */

const { error } = require('./lib/core.cjs');
const state = require('./lib/state.cjs');
const config = require('./lib/config.cjs');
const services = require('./lib/services.cjs');
const terraform = require('./lib/terraform.cjs');
const commands = require('./lib/commands.cjs');
const init = require('./lib/init.cjs');

// ─── CLI Router ───────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const rawIndex = args.indexOf('--raw');
  const raw = rawIndex !== -1;
  if (rawIndex !== -1) args.splice(rawIndex, 1);

  const command = args[0];
  const cwd = process.cwd();

  if (!command) {
    error('Usage: infra-tools <command> [args] [--raw]\nCommands: state, config-ensure-section, config-set, config-get, service, terraform, generate-slug, current-timestamp, verify-path-exists, commit, init');
  }

  switch (command) {
    case 'state': {
      const subcommand = args[1];
      if (subcommand === 'update') {
        state.cmdStateUpdate(cwd, args[2], args[3]);
      } else if (subcommand === 'get') {
        state.cmdStateGet(cwd, args[2], raw);
      } else if (subcommand === 'patch') {
        const patches = {};
        for (let i = 2; i < args.length; i += 2) {
          const key = args[i].replace(/^--/, '');
          const value = args[i + 1];
          if (key && value !== undefined) {
            patches[key] = value;
          }
        }
        state.cmdStatePatch(cwd, patches, raw);
      } else if (subcommand === 'update-stage') {
        state.cmdStateUpdateStage(cwd, args[2], raw);
      } else if (subcommand === 'record-service') {
        state.cmdStateRecordService(cwd, args[2], args[3], raw);
      } else {
        state.cmdStateLoad(cwd, raw);
      }
      break;
    }

    case 'config-ensure-section': {
      config.cmdConfigEnsureSection(cwd, raw);
      break;
    }

    case 'config-set': {
      config.cmdConfigSet(cwd, args[1], args[2], raw);
      break;
    }

    case 'config-get': {
      config.cmdConfigGet(cwd, args[1], raw);
      break;
    }

    case 'service': {
      const subcommand = args[1];
      if (subcommand === 'list') {
        services.cmdListServices(cwd, raw);
      } else if (subcommand === 'add') {
        const name = args[2];
        const typeIdx = args.indexOf('--type');
        const langIdx = args.indexOf('--language');
        const fwIdx = args.indexOf('--framework');
        const portIdx = args.indexOf('--port');
        const pathIdx = args.indexOf('--path');
        services.cmdAddService(cwd, name, {
          type: typeIdx !== -1 ? args[typeIdx + 1] : undefined,
          language: langIdx !== -1 ? args[langIdx + 1] : undefined,
          framework: fwIdx !== -1 ? args[fwIdx + 1] : undefined,
          port: portIdx !== -1 ? args[portIdx + 1] : undefined,
          path: pathIdx !== -1 ? args[pathIdx + 1] : undefined,
        }, raw);
      } else if (subcommand === 'remove') {
        services.cmdRemoveService(cwd, args[2], raw);
      } else {
        error('Unknown service subcommand. Available: list, add, remove');
      }
      break;
    }

    case 'terraform': {
      const subcommand = args[1];
      if (subcommand === 'list') {
        terraform.cmdListTfFiles(cwd, raw);
      } else if (subcommand === 'check-binary') {
        terraform.cmdCheckTerraformBinary(raw);
      } else if (subcommand === 'validate-structure') {
        terraform.cmdValidateStructure(cwd, raw);
      } else {
        error('Unknown terraform subcommand. Available: list, check-binary, validate-structure');
      }
      break;
    }

    case 'generate-slug': {
      commands.cmdGenerateSlug(args[1], raw);
      break;
    }

    case 'current-timestamp': {
      commands.cmdCurrentTimestamp(args[1] || 'full', raw);
      break;
    }

    case 'verify-path-exists': {
      commands.cmdVerifyPathExists(cwd, args[1], raw);
      break;
    }

    case 'commit': {
      const message = args[1];
      const filesIndex = args.indexOf('--files');
      const files = filesIndex !== -1 ? args.slice(filesIndex + 1).filter(a => !a.startsWith('--')) : [];
      commands.cmdCommit(cwd, message, files, raw);
      break;
    }

    case 'init': {
      const workflow = args[1];
      switch (workflow) {
        case 'new-project':
          init.cmdInitNewProject(cwd, raw);
          break;
        case 'analyze':
          init.cmdInitAnalyze(cwd, raw);
          break;
        case 'generate':
          init.cmdInitGenerate(cwd, raw);
          break;
        case 'progress':
          init.cmdInitProgress(cwd, raw);
          break;
        case 'audit':
          init.cmdInitAudit(cwd, raw);
          break;
        default:
          error(`Unknown init workflow: ${workflow}\nAvailable: new-project, analyze, generate, progress, audit`);
      }
      break;
    }

    default:
      error(`Unknown command: ${command}`);
  }
}

main();
