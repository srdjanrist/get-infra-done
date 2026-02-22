/**
 * Tests for infra-tools utility commands
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

describe('generate-slug', () => {
  test('generates slug from text', () => {
    const result = runInfraTools('generate-slug "My Service Name"');
    assert.ok(result.success);

    const parsed = JSON.parse(result.output);
    assert.strictEqual(parsed.slug, 'my-service-name');
  });

  test('handles special characters', () => {
    const result = runInfraTools('generate-slug "Hello World! @#$"');
    assert.ok(result.success);

    const parsed = JSON.parse(result.output);
    assert.strictEqual(parsed.slug, 'hello-world');
  });

  test('returns raw slug with --raw', () => {
    const result = runInfraTools('generate-slug "Test Slug" --raw');
    assert.ok(result.success);
    assert.strictEqual(result.output, 'test-slug');
  });

  test('errors on missing text', () => {
    const result = runInfraTools('generate-slug');
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('text required'));
  });
});

describe('current-timestamp', () => {
  test('returns full ISO timestamp', () => {
    const result = runInfraTools('current-timestamp full');
    assert.ok(result.success);

    const parsed = JSON.parse(result.output);
    assert.ok(parsed.timestamp.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/));
  });

  test('returns date only', () => {
    const result = runInfraTools('current-timestamp date');
    assert.ok(result.success);

    const parsed = JSON.parse(result.output);
    assert.ok(parsed.timestamp.match(/^\d{4}-\d{2}-\d{2}$/));
  });

  test('returns filename-safe format', () => {
    const result = runInfraTools('current-timestamp filename');
    assert.ok(result.success);

    const parsed = JSON.parse(result.output);
    assert.ok(!parsed.timestamp.includes(':'), 'Should not contain colons');
  });

  test('defaults to full format', () => {
    const result = runInfraTools('current-timestamp');
    assert.ok(result.success);

    const parsed = JSON.parse(result.output);
    assert.ok(parsed.timestamp.includes('T'));
  });
});

describe('verify-path-exists', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempProject();
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  test('returns true for existing file', () => {
    fs.writeFileSync(path.join(tmpDir, 'test.txt'), 'hello', 'utf-8');

    const result = runInfraTools('verify-path-exists test.txt', tmpDir);
    assert.ok(result.success);

    const parsed = JSON.parse(result.output);
    assert.strictEqual(parsed.exists, true);
    assert.strictEqual(parsed.type, 'file');
  });

  test('returns true for existing directory', () => {
    fs.mkdirSync(path.join(tmpDir, 'subdir'));

    const result = runInfraTools('verify-path-exists subdir', tmpDir);
    assert.ok(result.success);

    const parsed = JSON.parse(result.output);
    assert.strictEqual(parsed.exists, true);
    assert.strictEqual(parsed.type, 'directory');
  });

  test('returns false for nonexistent path', () => {
    const result = runInfraTools('verify-path-exists nonexistent', tmpDir);
    assert.ok(result.success);

    const parsed = JSON.parse(result.output);
    assert.strictEqual(parsed.exists, false);
    assert.strictEqual(parsed.type, null);
  });

  test('returns raw boolean with --raw', () => {
    const result = runInfraTools('verify-path-exists nonexistent --raw', tmpDir);
    assert.ok(result.success);
    assert.strictEqual(result.output, 'false');
  });
});

describe('config-ensure-section', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempProject();
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  test('creates config.json in .infra/', () => {
    const result = runInfraTools('config-ensure-section', tmpDir);
    assert.ok(result.success);

    const parsed = JSON.parse(result.output);
    assert.strictEqual(parsed.created, true);

    const configPath = path.join(tmpDir, '.infra', 'config.json');
    assert.ok(fs.existsSync(configPath), 'config.json should exist');

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    assert.strictEqual(config.aws_region, 'us-east-1');
    assert.strictEqual(config.environment, 'production');
    assert.strictEqual(config.model_profile, 'balanced');
  });

  test('does not overwrite existing config', () => {
    fs.mkdirSync(path.join(tmpDir, '.infra'), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, '.infra', 'config.json'),
      '{"aws_region": "eu-west-1"}',
      'utf-8'
    );

    const result = runInfraTools('config-ensure-section', tmpDir);
    assert.ok(result.success);

    const parsed = JSON.parse(result.output);
    assert.strictEqual(parsed.created, false);
    assert.strictEqual(parsed.reason, 'already_exists');

    // Verify original content preserved
    const config = JSON.parse(fs.readFileSync(path.join(tmpDir, '.infra', 'config.json'), 'utf-8'));
    assert.strictEqual(config.aws_region, 'eu-west-1');
  });
});

describe('config-set and config-get', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempProject();
    fs.mkdirSync(path.join(tmpDir, '.infra'), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, '.infra', 'config.json'),
      '{"aws_region": "us-east-1", "workflow": {"run_security_audit": true}}',
      'utf-8'
    );
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  test('sets a top-level value', () => {
    const result = runInfraTools('config-set aws_region eu-west-1', tmpDir);
    assert.ok(result.success);

    const parsed = JSON.parse(result.output);
    assert.strictEqual(parsed.updated, true);
    assert.strictEqual(parsed.value, 'eu-west-1');
  });

  test('sets a nested value', () => {
    const result = runInfraTools('config-set workflow.run_security_audit false', tmpDir);
    assert.ok(result.success);

    const parsed = JSON.parse(result.output);
    assert.strictEqual(parsed.value, false);

    const config = JSON.parse(fs.readFileSync(path.join(tmpDir, '.infra', 'config.json'), 'utf-8'));
    assert.strictEqual(config.workflow.run_security_audit, false);
  });

  test('gets a value', () => {
    const result = runInfraTools('config-get aws_region', tmpDir);
    assert.ok(result.success);
    assert.strictEqual(result.output, '"us-east-1"');
  });

  test('gets a nested value', () => {
    const result = runInfraTools('config-get workflow.run_security_audit', tmpDir);
    assert.ok(result.success);
    assert.strictEqual(result.output, 'true');
  });
});

describe('terraform commands', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempProject();
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  test('terraform list returns empty for no files', () => {
    const result = runInfraTools('terraform list', tmpDir);
    assert.ok(result.success);

    const parsed = JSON.parse(result.output);
    assert.strictEqual(parsed.count, 0);
    assert.deepStrictEqual(parsed.files, []);
  });

  test('terraform list finds .tf files', () => {
    fs.mkdirSync(path.join(tmpDir, '.infra', 'terraform'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, '.infra', 'terraform', 'main.tf'), 'provider "aws" {}', 'utf-8');
    fs.writeFileSync(path.join(tmpDir, '.infra', 'terraform', 'variables.tf'), 'variable "x" {}', 'utf-8');

    const result = runInfraTools('terraform list', tmpDir);
    assert.ok(result.success);

    const parsed = JSON.parse(result.output);
    assert.strictEqual(parsed.count, 2);
    assert.strictEqual(parsed.files[0].name, 'main.tf');
    assert.strictEqual(parsed.files[1].name, 'variables.tf');
  });

  test('terraform check-binary returns availability', () => {
    const result = runInfraTools('terraform check-binary');
    assert.ok(result.success);

    const parsed = JSON.parse(result.output);
    assert.ok('available' in parsed);
    // Don't assert true/false since terraform may or may not be installed
  });

  test('terraform validate-structure detects missing directory', () => {
    const result = runInfraTools('terraform validate-structure', tmpDir);
    assert.ok(result.success);

    const parsed = JSON.parse(result.output);
    assert.strictEqual(parsed.valid, false);
    assert.strictEqual(parsed.reason, 'terraform directory not found');
  });
});

describe('error handling', () => {
  test('unknown command returns error', () => {
    const result = runInfraTools('nonexistent-command');
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('Unknown command'));
  });

  test('missing subcommand shows usage', () => {
    const result = runInfraTools('');
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('Usage'));
  });
});
