/**
 * Tests for infra-tools state commands
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
  fs.mkdirSync(path.join(tmpDir, '.infra'), { recursive: true });
  return tmpDir;
}

function writeState(tmpDir, content) {
  fs.writeFileSync(path.join(tmpDir, '.infra', 'STATE.md'), content, 'utf-8');
}

function readState(tmpDir) {
  return fs.readFileSync(path.join(tmpDir, '.infra', 'STATE.md'), 'utf-8');
}

function cleanup(tmpDir) {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

const SAMPLE_STATE = `# Infrastructure Pipeline State

**Current Stage:** scan
**Last Updated:** 2024-01-01
**AWS Region:** us-east-1
**Environment:** production

## Detection

**Services Detected:** 2
**Languages:** javascript, python
**Frameworks:** express, fastapi

## Decisions

**Decisions Locked:** no
**Approved By:** pending

## Generation

**Terraform Files:** 0
**Architecture Defined:** no
`;

describe('state load', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempProject();
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  test('returns valid JSON with state info', () => {
    writeState(tmpDir, SAMPLE_STATE);
    fs.writeFileSync(path.join(tmpDir, '.infra', 'config.json'), '{"aws_region":"us-east-1"}', 'utf-8');

    const result = runInfraTools('state', tmpDir);
    assert.ok(result.success, `Command failed: ${result.error}`);

    const parsed = JSON.parse(result.output);
    assert.strictEqual(parsed.state_exists, true);
    assert.strictEqual(parsed.config_exists, true);
    assert.ok(parsed.state_raw.includes('Current Stage'));
  });

  test('handles missing state', () => {
    const result = runInfraTools('state', tmpDir);
    assert.ok(result.success);

    const parsed = JSON.parse(result.output);
    assert.strictEqual(parsed.state_exists, false);
  });
});

describe('state get', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempProject();
    writeState(tmpDir, SAMPLE_STATE);
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  test('gets full state content', () => {
    const result = runInfraTools('state get', tmpDir);
    assert.ok(result.success);

    const parsed = JSON.parse(result.output);
    assert.ok(parsed.content.includes('Current Stage'));
  });

  test('gets specific field', () => {
    const result = runInfraTools('state get "Current Stage"', tmpDir);
    assert.ok(result.success);

    const parsed = JSON.parse(result.output);
    assert.strictEqual(parsed['Current Stage'], 'scan');
  });

  test('gets specific field with --raw', () => {
    const result = runInfraTools('state get "Services Detected" --raw', tmpDir);
    assert.ok(result.success);
    assert.strictEqual(result.output, '2');
  });
});

describe('state update', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempProject();
    writeState(tmpDir, SAMPLE_STATE);
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  test('updates a field', () => {
    const result = runInfraTools('state update "Current Stage" recommend', tmpDir);
    assert.ok(result.success);

    const content = readState(tmpDir);
    assert.ok(content.includes('**Current Stage:** recommend'));
  });

  test('reports failure for nonexistent field', () => {
    const result = runInfraTools('state update "Nonexistent Field" value', tmpDir);
    assert.ok(result.success);

    const parsed = JSON.parse(result.output);
    assert.strictEqual(parsed.updated, false);
  });
});

describe('state update-stage', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempProject();
    writeState(tmpDir, SAMPLE_STATE);
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  test('updates to valid stage', () => {
    const result = runInfraTools('state update-stage recommend', tmpDir);
    assert.ok(result.success);

    const parsed = JSON.parse(result.output);
    assert.strictEqual(parsed.updated, true);
    assert.strictEqual(parsed.stage, 'recommend');

    const content = readState(tmpDir);
    assert.ok(content.includes('**Current Stage:** recommend'));
  });

  test('rejects invalid stage', () => {
    const result = runInfraTools('state update-stage invalid_stage', tmpDir);
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('Invalid stage'));
  });

  test('accepts all valid stages', () => {
    const stages = ['scan', 'recommend', 'discuss', 'generate', 'validate', 'complete'];
    for (const stage of stages) {
      writeState(tmpDir, SAMPLE_STATE);
      const result = runInfraTools(`state update-stage ${stage}`, tmpDir);
      assert.ok(result.success, `Failed for stage: ${stage}`);
    }
  });
});

describe('state record-service', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempProject();
    writeState(tmpDir, SAMPLE_STATE);
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  test('increments service count', () => {
    const result = runInfraTools('state record-service api web_api', tmpDir);
    assert.ok(result.success);

    const parsed = JSON.parse(result.output);
    assert.strictEqual(parsed.recorded, true);
    assert.strictEqual(parsed.count, 3); // was 2, now 3

    const content = readState(tmpDir);
    assert.ok(content.includes('**Services Detected:** 3'));
  });
});

describe('state patch', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempProject();
    writeState(tmpDir, SAMPLE_STATE);
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  test('patches multiple fields', () => {
    const result = runInfraTools('state patch --"Current Stage" generate --"Decisions Locked" yes', tmpDir);
    assert.ok(result.success);

    const parsed = JSON.parse(result.output);
    assert.ok(parsed.updated.includes('Current Stage'));
    assert.ok(parsed.updated.includes('Decisions Locked'));

    const content = readState(tmpDir);
    assert.ok(content.includes('**Current Stage:** generate'));
    assert.ok(content.includes('**Decisions Locked:** yes'));
  });
});
