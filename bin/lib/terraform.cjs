/**
 * Terraform — Terraform file helpers and validation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { output, error } = require('./core.cjs');

function cmdListTfFiles(cwd, raw) {
  const tfDir = path.join(cwd, '.infra', 'terraform');

  if (!fs.existsSync(tfDir)) {
    output({ count: 0, files: [] }, raw, '0');
    return;
  }

  try {
    const files = fs.readdirSync(tfDir)
      .filter(f => f.endsWith('.tf'))
      .sort();

    const fileDetails = files.map(f => {
      const stats = fs.statSync(path.join(tfDir, f));
      return {
        name: f,
        path: path.join('.infra', 'terraform', f),
        size: stats.size,
      };
    });

    output({ count: files.length, files: fileDetails }, raw, String(files.length));
  } catch (err) {
    error('Failed to list terraform files: ' + err.message);
  }
}

function cmdCheckTerraformBinary(raw) {
  try {
    const version = execSync('terraform version -json', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 5000,
    });

    const parsed = JSON.parse(version);
    output({
      available: true,
      version: parsed.terraform_version || 'unknown',
    }, raw, 'true');
  } catch {
    // Try without -json flag
    try {
      const version = execSync('terraform version', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 5000,
      });

      const versionMatch = version.match(/Terraform v([\d.]+)/);
      output({
        available: true,
        version: versionMatch ? versionMatch[1] : 'unknown',
      }, raw, 'true');
    } catch {
      output({
        available: false,
        version: null,
      }, raw, 'false');
    }
  }
}

function cmdValidateStructure(cwd, raw) {
  const tfDir = path.join(cwd, '.infra', 'terraform');

  if (!fs.existsSync(tfDir)) {
    output({ valid: false, reason: 'terraform directory not found', issues: [] }, raw, 'false');
    return;
  }

  const issues = [];
  const files = fs.readdirSync(tfDir).filter(f => f.endsWith('.tf'));

  if (files.length === 0) {
    output({ valid: false, reason: 'no .tf files found', issues: [] }, raw, 'false');
    return;
  }

  // Check for required files
  const requiredFiles = ['main.tf', 'variables.tf'];
  for (const required of requiredFiles) {
    if (!files.includes(required)) {
      issues.push({ severity: 'warning', file: required, message: `Missing recommended file: ${required}` });
    }
  }

  // Check for provider block in main.tf or provider.tf
  const hasProvider = files.some(f => {
    const content = fs.readFileSync(path.join(tfDir, f), 'utf-8');
    return content.includes('provider "aws"') || content.includes('required_providers');
  });
  if (!hasProvider) {
    issues.push({ severity: 'error', file: null, message: 'No AWS provider configuration found' });
  }

  // Check for backend configuration
  const hasBackend = files.some(f => {
    const content = fs.readFileSync(path.join(tfDir, f), 'utf-8');
    return content.includes('backend "s3"') || content.includes('backend "');
  });
  if (!hasBackend) {
    issues.push({ severity: 'warning', file: null, message: 'No backend configuration found (state will be local)' });
  }

  // Check naming conventions
  for (const file of files) {
    const content = fs.readFileSync(path.join(tfDir, file), 'utf-8');
    const resourcePattern = /resource\s+"(\w+)"\s+"(\w+)"/g;
    let match;
    while ((match = resourcePattern.exec(content)) !== null) {
      const resourceName = match[2];
      if (resourceName.includes(' ') || /[A-Z]/.test(resourceName)) {
        issues.push({ severity: 'warning', file, message: `Resource name "${resourceName}" should use snake_case` });
      }
    }
  }

  const hasErrors = issues.some(i => i.severity === 'error');
  output({
    valid: !hasErrors,
    file_count: files.length,
    files,
    issues,
  }, raw, hasErrors ? 'false' : 'true');
}

module.exports = {
  cmdListTfFiles,
  cmdCheckTerraformBinary,
  cmdValidateStructure,
};
