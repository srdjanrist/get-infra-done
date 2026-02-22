/**
 * Core — Shared utilities, constants, and internal helpers for get-infra-done
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ─── Model Profile Table ─────────────────────────────────────────────────────

const MODEL_PROFILES = {
  'infra-scanner':          { quality: 'sonnet', balanced: 'haiku',  budget: 'haiku' },
  'infra-service-detector': { quality: 'sonnet', balanced: 'haiku',  budget: 'haiku' },
  'infra-recommender':      { quality: 'opus',   balanced: 'sonnet', budget: 'haiku' },
  'infra-architect':        { quality: 'opus',   balanced: 'opus',   budget: 'sonnet' },
  'infra-terraform-gen':    { quality: 'opus',   balanced: 'sonnet', budget: 'sonnet' },
  'infra-security-auditor': { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
  'infra-cost-estimator':   { quality: 'sonnet', balanced: 'haiku',  budget: 'haiku' },
  'infra-cicd-gen':         { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
  'infra-validator':        { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
};

// ─── Output helpers ───────────────────────────────────────────────────────────

function output(result, raw, rawValue) {
  if (raw && rawValue !== undefined) {
    process.stdout.write(String(rawValue));
  } else {
    const json = JSON.stringify(result, null, 2);
    if (json.length > 50000) {
      const tmpPath = path.join(require('os').tmpdir(), `infra-${Date.now()}.json`);
      fs.writeFileSync(tmpPath, json, 'utf-8');
      process.stdout.write('@file:' + tmpPath);
    } else {
      process.stdout.write(json);
    }
  }
  process.exit(0);
}

function error(message) {
  process.stderr.write('Error: ' + message + '\n');
  process.exit(1);
}

// ─── File & Config utilities ──────────────────────────────────────────────────

function safeReadFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

function loadConfig(cwd) {
  const configPath = path.join(cwd, '.infra', 'config.json');
  const defaults = {
    aws_region: 'us-east-1',
    environment: 'production',
    model_profile: 'balanced',
    commit_docs: true,
    terraform_output_dir: '.infra/terraform',
    workflow: {
      auto_approve_recommendations: false,
      run_security_audit: true,
      run_cost_estimate: true,
      generate_cicd: true,
    },
  };

  try {
    const raw = fs.readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(raw);

    const get = (key, nested) => {
      if (parsed[key] !== undefined) return parsed[key];
      if (nested && parsed[nested.section] && parsed[nested.section][nested.field] !== undefined) {
        return parsed[nested.section][nested.field];
      }
      return undefined;
    };

    return {
      aws_region: get('aws_region') ?? defaults.aws_region,
      environment: get('environment') ?? defaults.environment,
      model_profile: get('model_profile') ?? defaults.model_profile,
      commit_docs: get('commit_docs') ?? defaults.commit_docs,
      terraform_output_dir: get('terraform_output_dir') ?? defaults.terraform_output_dir,
      workflow: {
        auto_approve_recommendations: get('auto_approve_recommendations', { section: 'workflow', field: 'auto_approve_recommendations' }) ?? defaults.workflow.auto_approve_recommendations,
        run_security_audit: get('run_security_audit', { section: 'workflow', field: 'run_security_audit' }) ?? defaults.workflow.run_security_audit,
        run_cost_estimate: get('run_cost_estimate', { section: 'workflow', field: 'run_cost_estimate' }) ?? defaults.workflow.run_cost_estimate,
        generate_cicd: get('generate_cicd', { section: 'workflow', field: 'generate_cicd' }) ?? defaults.workflow.generate_cicd,
      },
    };
  } catch {
    return defaults;
  }
}

// ─── Git utilities ────────────────────────────────────────────────────────────

function execGit(cwd, args) {
  try {
    const escaped = args.map(a => {
      if (/^[a-zA-Z0-9._\-/=:@]+$/.test(a)) return a;
      return "'" + a.replace(/'/g, "'\\''") + "'";
    });
    const stdout = execSync('git ' + escaped.join(' '), {
      cwd,
      stdio: 'pipe',
      encoding: 'utf-8',
    });
    return { exitCode: 0, stdout: stdout.trim(), stderr: '' };
  } catch (err) {
    return {
      exitCode: err.status ?? 1,
      stdout: (err.stdout ?? '').toString().trim(),
      stderr: (err.stderr ?? '').toString().trim(),
    };
  }
}

function isGitIgnored(cwd, targetPath) {
  try {
    execSync('git check-ignore -q -- ' + targetPath.replace(/[^a-zA-Z0-9._\-/]/g, ''), {
      cwd,
      stdio: 'pipe',
    });
    return true;
  } catch {
    return false;
  }
}

// ─── Model resolution ────────────────────────────────────────────────────────

function resolveModelInternal(cwd, agentType) {
  const config = loadConfig(cwd);

  const profile = config.model_profile || 'balanced';
  const agentModels = MODEL_PROFILES[agentType];
  if (!agentModels) return 'sonnet';
  const resolved = agentModels[profile] || agentModels['balanced'] || 'sonnet';
  return resolved === 'opus' ? 'inherit' : resolved;
}

// ─── Misc utilities ───────────────────────────────────────────────────────────

function pathExistsInternal(cwd, targetPath) {
  const fullPath = path.isAbsolute(targetPath) ? targetPath : path.join(cwd, targetPath);
  try {
    fs.statSync(fullPath);
    return true;
  } catch {
    return false;
  }
}

function generateSlugInternal(text) {
  if (!text) return null;
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

module.exports = {
  MODEL_PROFILES,
  output,
  error,
  safeReadFile,
  loadConfig,
  execGit,
  isGitIgnored,
  resolveModelInternal,
  pathExistsInternal,
  generateSlugInternal,
};
