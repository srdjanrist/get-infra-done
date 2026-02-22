/**
 * Tests for infra-tools service commands
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

function cleanup(tmpDir) {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

describe('service list', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempProject();
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  test('returns empty list when no SERVICES.md', () => {
    const result = runInfraTools('service list', tmpDir);
    assert.ok(result.success);

    const parsed = JSON.parse(result.output);
    assert.strictEqual(parsed.count, 0);
    assert.deepStrictEqual(parsed.services, []);
  });

  test('parses services from markdown table', () => {
    const servicesContent = `# Services

| Name | Type | Language | Framework | Port | Path |
|------|------|----------|-----------|------|------|
| api | web_api | Node.js | Express | 3000 | ./api |
| worker | worker | Python | Celery | - | ./worker |
`;
    fs.writeFileSync(path.join(tmpDir, '.infra', 'SERVICES.md'), servicesContent, 'utf-8');

    const result = runInfraTools('service list', tmpDir);
    assert.ok(result.success);

    const parsed = JSON.parse(result.output);
    assert.strictEqual(parsed.count, 2);
    assert.strictEqual(parsed.services[0].name, 'api');
    assert.strictEqual(parsed.services[0].type, 'web_api');
    assert.strictEqual(parsed.services[0].language, 'Node.js');
    assert.strictEqual(parsed.services[1].name, 'worker');
    assert.strictEqual(parsed.services[1].framework, 'Celery');
  });
});

describe('service add', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempProject();
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  test('creates SERVICES.md if not exists', () => {
    const result = runInfraTools('service add api --type web_api --language Node.js --framework Express --port 3000 --path ./api', tmpDir);
    assert.ok(result.success);

    const parsed = JSON.parse(result.output);
    assert.strictEqual(parsed.added, true);
    assert.strictEqual(parsed.created_file, true);

    const content = fs.readFileSync(path.join(tmpDir, '.infra', 'SERVICES.md'), 'utf-8');
    assert.ok(content.includes('| api | web_api | Node.js | Express | 3000 | ./api |'));
  });

  test('appends to existing SERVICES.md', () => {
    const initial = `# Services

| Name | Type | Language | Framework | Port | Path |
|------|------|----------|-----------|------|------|
| api | web_api | Node.js | Express | 3000 | ./api |
`;
    fs.writeFileSync(path.join(tmpDir, '.infra', 'SERVICES.md'), initial, 'utf-8');

    const result = runInfraTools('service add worker --type worker --language Python', tmpDir);
    assert.ok(result.success);

    const parsed = JSON.parse(result.output);
    assert.strictEqual(parsed.added, true);
    assert.strictEqual(parsed.created_file, false);

    const content = fs.readFileSync(path.join(tmpDir, '.infra', 'SERVICES.md'), 'utf-8');
    assert.ok(content.includes('worker'));
  });

  test('uses defaults for missing options', () => {
    const result = runInfraTools('service add myservice', tmpDir);
    assert.ok(result.success);

    const content = fs.readFileSync(path.join(tmpDir, '.infra', 'SERVICES.md'), 'utf-8');
    assert.ok(content.includes('| myservice | unknown | unknown | none | - | . |'));
  });
});

describe('service remove', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempProject();
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  test('removes a service by name', () => {
    const initial = `# Services

| Name | Type | Language | Framework | Port | Path |
|------|------|----------|-----------|------|------|
| api | web_api | Node.js | Express | 3000 | ./api |
| worker | worker | Python | Celery | - | ./worker |
`;
    fs.writeFileSync(path.join(tmpDir, '.infra', 'SERVICES.md'), initial, 'utf-8');

    const result = runInfraTools('service remove api', tmpDir);
    assert.ok(result.success);

    const parsed = JSON.parse(result.output);
    assert.strictEqual(parsed.removed, true);

    const content = fs.readFileSync(path.join(tmpDir, '.infra', 'SERVICES.md'), 'utf-8');
    assert.ok(!content.includes('| api |'));
    assert.ok(content.includes('| worker |'));
  });

  test('reports not found for missing service', () => {
    const initial = `# Services

| Name | Type | Language | Framework | Port | Path |
|------|------|----------|-----------|------|------|
| api | web_api | Node.js | Express | 3000 | ./api |
`;
    fs.writeFileSync(path.join(tmpDir, '.infra', 'SERVICES.md'), initial, 'utf-8');

    const result = runInfraTools('service remove nonexistent', tmpDir);
    assert.ok(result.success);

    const parsed = JSON.parse(result.output);
    assert.strictEqual(parsed.removed, false);
  });

  test('handles case-insensitive removal', () => {
    const initial = `# Services

| Name | Type | Language | Framework | Port | Path |
|------|------|----------|-----------|------|------|
| API | web_api | Node.js | Express | 3000 | ./api |
`;
    fs.writeFileSync(path.join(tmpDir, '.infra', 'SERVICES.md'), initial, 'utf-8');

    const result = runInfraTools('service remove api', tmpDir);
    assert.ok(result.success);

    const parsed = JSON.parse(result.output);
    assert.strictEqual(parsed.removed, true);
  });
});
