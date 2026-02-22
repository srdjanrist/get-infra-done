/**
 * Tests for infra-tools init commands
 */

const { describe, test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TOOLS_PATH = path.join(__dirname, '..', 'bin', 'infra-tools.cjs');

function runInfraTools(args, cwd = process.cwd()) {
  try {
    const result = execSync(`node "${TOOLS_PATH}" ${args}`, {
      cwd,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { success: true, output: result.trim() };
  } catch (err) {
    return {
      success: false,
      output: err.stdout?.toString().trim() || '',
      error: err.stderr?.toString().trim() || err.message,
    };
  }
}

function createTempProject() {
  const tmpDir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'infra-test-'));
  return tmpDir;
}

function cleanup(tmpDir) {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

describe('init new-project', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempProject();
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  test('returns valid JSON structure', () => {
    const result = runInfraTools('init new-project', tmpDir);
    assert.ok(result.success, `Command failed: ${result.error}`);

    const parsed = JSON.parse(result.output);
    assert.ok('scanner_model' in parsed, 'should have scanner_model');
    assert.ok('detector_model' in parsed, 'should have detector_model');
    assert.ok('aws_region' in parsed, 'should have aws_region');
    assert.ok('environment' in parsed, 'should have environment');
    assert.ok('has_dockerfile' in parsed, 'should have has_dockerfile');
    assert.ok('detected_languages' in parsed, 'should have detected_languages');
    assert.ok('infra_exists' in parsed, 'should have infra_exists');
  });

  test('detects no infra directory by default', () => {
    const result = runInfraTools('init new-project', tmpDir);
    const parsed = JSON.parse(result.output);
    assert.strictEqual(parsed.infra_exists, false);
    assert.strictEqual(parsed.config_exists, false);
    assert.strictEqual(parsed.analysis_exists, false);
  });

  test('detects existing infra directory', () => {
    fs.mkdirSync(path.join(tmpDir, '.infra'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, '.infra', 'config.json'), '{}', 'utf-8');

    const result = runInfraTools('init new-project', tmpDir);
    const parsed = JSON.parse(result.output);
    assert.strictEqual(parsed.infra_exists, true);
    assert.strictEqual(parsed.config_exists, true);
  });

  test('detects Dockerfile', () => {
    fs.writeFileSync(path.join(tmpDir, 'Dockerfile'), 'FROM node:20\n', 'utf-8');

    const result = runInfraTools('init new-project', tmpDir);
    const parsed = JSON.parse(result.output);
    assert.strictEqual(parsed.has_dockerfile, true);
  });

  test('detects languages from package.json', () => {
    fs.writeFileSync(path.join(tmpDir, 'package.json'), '{"name": "test"}', 'utf-8');

    const result = runInfraTools('init new-project', tmpDir);
    const parsed = JSON.parse(result.output);
    assert.ok(parsed.detected_languages.includes('javascript'), 'should detect javascript');
  });

  test('returns default config values', () => {
    const result = runInfraTools('init new-project', tmpDir);
    const parsed = JSON.parse(result.output);
    assert.strictEqual(parsed.aws_region, 'us-east-1');
    assert.strictEqual(parsed.environment, 'production');
    assert.strictEqual(parsed.commit_docs, true);
  });
});

describe('init analyze', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempProject();
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  test('returns valid JSON structure', () => {
    const result = runInfraTools('init analyze', tmpDir);
    assert.ok(result.success, `Command failed: ${result.error}`);

    const parsed = JSON.parse(result.output);
    assert.ok('scanner_model' in parsed, 'should have scanner_model');
    assert.ok('analysis_exists' in parsed, 'should have analysis_exists');
    assert.ok('services_exists' in parsed, 'should have services_exists');
  });

  test('detects existing analysis', () => {
    fs.mkdirSync(path.join(tmpDir, '.infra'), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, '.infra', 'ANALYSIS.md'),
      '# Analysis\n\n**Date:** 2024-01-01\n',
      'utf-8'
    );

    const result = runInfraTools('init analyze', tmpDir);
    const parsed = JSON.parse(result.output);
    assert.strictEqual(parsed.analysis_exists, true);
    assert.strictEqual(parsed.previous_analysis_date, '2024-01-01');
  });
});

describe('init generate', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempProject();
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  test('returns valid JSON structure', () => {
    const result = runInfraTools('init generate', tmpDir);
    assert.ok(result.success, `Command failed: ${result.error}`);

    const parsed = JSON.parse(result.output);
    assert.ok('prerequisites_met' in parsed, 'should have prerequisites_met');
    assert.ok('architect_model' in parsed, 'should have architect_model');
    assert.ok('terraform_gen_model' in parsed, 'should have terraform_gen_model');
  });

  test('prerequisites not met without analysis and decisions', () => {
    const result = runInfraTools('init generate', tmpDir);
    const parsed = JSON.parse(result.output);
    assert.strictEqual(parsed.prerequisites_met, false);
    assert.strictEqual(parsed.analysis_exists, false);
    assert.strictEqual(parsed.decisions_exists, false);
  });

  test('prerequisites met with analysis and decisions', () => {
    fs.mkdirSync(path.join(tmpDir, '.infra'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, '.infra', 'ANALYSIS.md'), '# Analysis\n', 'utf-8');
    fs.writeFileSync(path.join(tmpDir, '.infra', 'DECISIONS.md'), '# Decisions\n', 'utf-8');

    const result = runInfraTools('init generate', tmpDir);
    const parsed = JSON.parse(result.output);
    assert.strictEqual(parsed.prerequisites_met, true);
  });
});

describe('init progress', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempProject();
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  test('returns valid JSON with default stage', () => {
    const result = runInfraTools('init progress', tmpDir);
    assert.ok(result.success, `Command failed: ${result.error}`);

    const parsed = JSON.parse(result.output);
    assert.strictEqual(parsed.current_stage, 'not_started');
    assert.strictEqual(parsed.services_detected, 0);
    assert.strictEqual(parsed.decisions_locked, false);
  });

  test('reads stage from STATE.md', () => {
    fs.mkdirSync(path.join(tmpDir, '.infra'), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, '.infra', 'STATE.md'),
      '# State\n\n**Current Stage:** recommend\n**Services Detected:** 3\n**Decisions Locked:** yes\n**Terraform Files:** 5\n',
      'utf-8'
    );

    const result = runInfraTools('init progress', tmpDir);
    const parsed = JSON.parse(result.output);
    assert.strictEqual(parsed.current_stage, 'recommend');
    assert.strictEqual(parsed.services_detected, 3);
    assert.strictEqual(parsed.decisions_locked, true);
  });
});
