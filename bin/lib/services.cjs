/**
 * Services — Service management for .infra/SERVICES.md
 */

const fs = require('fs');
const path = require('path');
const { output, error } = require('./core.cjs');

function cmdListServices(cwd, raw) {
  const servicesPath = path.join(cwd, '.infra', 'SERVICES.md');

  if (!fs.existsSync(servicesPath)) {
    output({ count: 0, services: [] }, raw, '0');
    return;
  }

  try {
    const content = fs.readFileSync(servicesPath, 'utf-8');
    const services = [];

    // Parse markdown table rows: | name | type | language | framework | port | path |
    const tablePattern = /\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|/g;
    let match;
    let isHeader = true;

    while ((match = tablePattern.exec(content)) !== null) {
      const cells = match.slice(1).map(c => c.trim());

      // Skip header row and separator row
      if (isHeader) {
        isHeader = false;
        continue;
      }
      if (cells[0].startsWith('---') || cells[0].startsWith(':--')) continue;

      services.push({
        name: cells[0],
        type: cells[1],
        language: cells[2],
        framework: cells[3],
        port: cells[4],
        path: cells[5],
      });
    }

    output({ count: services.length, services }, raw, String(services.length));
  } catch (err) {
    error('Failed to read SERVICES.md: ' + err.message);
  }
}

function cmdAddService(cwd, name, options, raw) {
  if (!name) {
    error('service name required');
  }

  const servicesPath = path.join(cwd, '.infra', 'SERVICES.md');
  const infraDir = path.join(cwd, '.infra');

  // Ensure .infra directory exists
  if (!fs.existsSync(infraDir)) {
    fs.mkdirSync(infraDir, { recursive: true });
  }

  const type = options.type || 'unknown';
  const language = options.language || 'unknown';
  const framework = options.framework || 'none';
  const port = options.port || '-';
  const svcPath = options.path || '.';

  const newRow = `| ${name} | ${type} | ${language} | ${framework} | ${port} | ${svcPath} |`;

  if (!fs.existsSync(servicesPath)) {
    // Create new SERVICES.md with header
    const content = `# Services

| Name | Type | Language | Framework | Port | Path |
|------|------|----------|-----------|------|------|
${newRow}
`;
    fs.writeFileSync(servicesPath, content, 'utf-8');
    output({ added: true, service: name, created_file: true }, raw, 'added');
    return;
  }

  // Append to existing file
  let content = fs.readFileSync(servicesPath, 'utf-8');
  content = content.trimEnd() + '\n' + newRow + '\n';
  fs.writeFileSync(servicesPath, content, 'utf-8');
  output({ added: true, service: name, created_file: false }, raw, 'added');
}

function cmdRemoveService(cwd, name, raw) {
  if (!name) {
    error('service name required');
  }

  const servicesPath = path.join(cwd, '.infra', 'SERVICES.md');

  if (!fs.existsSync(servicesPath)) {
    output({ removed: false, reason: 'SERVICES.md not found' }, raw, 'false');
    return;
  }

  let content = fs.readFileSync(servicesPath, 'utf-8');
  const lines = content.split('\n');
  const filtered = lines.filter(line => {
    if (!line.startsWith('|')) return true;
    const cells = line.split('|').map(c => c.trim()).filter(Boolean);
    return cells[0]?.toLowerCase() !== name.toLowerCase();
  });

  if (filtered.length === lines.length) {
    output({ removed: false, reason: `Service "${name}" not found` }, raw, 'false');
    return;
  }

  fs.writeFileSync(servicesPath, filtered.join('\n'), 'utf-8');
  output({ removed: true, service: name }, raw, 'true');
}

module.exports = {
  cmdListServices,
  cmdAddService,
  cmdRemoveService,
};
