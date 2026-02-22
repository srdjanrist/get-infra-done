/**
 * State — STATE.md operations with pipeline stages for infrastructure generation
 *
 * Pipeline stages: scan → recommend → discuss → generate → validate → complete
 */

const fs = require('fs');
const path = require('path');
const { loadConfig, output, error } = require('./core.cjs');

const PIPELINE_STAGES = ['scan', 'recommend', 'discuss', 'generate', 'validate', 'complete'];

function stateExtractField(content, fieldName) {
  const pattern = new RegExp(`\\*\\*${fieldName}:\\*\\*\\s*(.+)`, 'i');
  const match = content.match(pattern);
  return match ? match[1].trim() : null;
}

function stateReplaceField(content, fieldName, newValue) {
  const escaped = fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(\\*\\*${escaped}:\\*\\*\\s*)(.*)`, 'i');
  if (pattern.test(content)) {
    return content.replace(pattern, `$1${newValue}`);
  }
  return null;
}

function cmdStateGet(cwd, section, raw) {
  const statePath = path.join(cwd, '.infra', 'STATE.md');
  try {
    const content = fs.readFileSync(statePath, 'utf-8');

    if (!section) {
      output({ content }, raw, content);
      return;
    }

    const fieldEscaped = section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const fieldPattern = new RegExp(`\\*\\*${fieldEscaped}:\\*\\*\\s*(.*)`, 'i');
    const fieldMatch = content.match(fieldPattern);
    if (fieldMatch) {
      output({ [section]: fieldMatch[1].trim() }, raw, fieldMatch[1].trim());
      return;
    }

    const sectionPattern = new RegExp(`##\\s*${fieldEscaped}\\s*\n([\\s\\S]*?)(?=\\n##|$)`, 'i');
    const sectionMatch = content.match(sectionPattern);
    if (sectionMatch) {
      output({ [section]: sectionMatch[1].trim() }, raw, sectionMatch[1].trim());
      return;
    }

    output({ error: `Section or field "${section}" not found` }, raw, '');
  } catch {
    error('STATE.md not found');
  }
}

function cmdStateUpdate(cwd, field, value) {
  if (!field || value === undefined) {
    error('field and value required for state update');
  }

  const statePath = path.join(cwd, '.infra', 'STATE.md');
  try {
    let content = fs.readFileSync(statePath, 'utf-8');
    const fieldEscaped = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(\\*\\*${fieldEscaped}:\\*\\*\\s*)(.*)`, 'i');
    if (pattern.test(content)) {
      content = content.replace(pattern, `$1${value}`);
      fs.writeFileSync(statePath, content, 'utf-8');
      output({ updated: true });
    } else {
      output({ updated: false, reason: `Field "${field}" not found in STATE.md` });
    }
  } catch {
    output({ updated: false, reason: 'STATE.md not found' });
  }
}

function cmdStateUpdateStage(cwd, stage, raw) {
  if (!stage) {
    error('stage required for state update-stage');
  }

  if (!PIPELINE_STAGES.includes(stage)) {
    error(`Invalid stage: ${stage}. Valid stages: ${PIPELINE_STAGES.join(', ')}`);
  }

  const statePath = path.join(cwd, '.infra', 'STATE.md');
  try {
    let content = fs.readFileSync(statePath, 'utf-8');
    const today = new Date().toISOString().split('T')[0];

    const result = stateReplaceField(content, 'Current Stage', stage);
    if (result) {
      content = result;
      const result2 = stateReplaceField(content, 'Last Updated', today);
      if (result2) content = result2;
      fs.writeFileSync(statePath, content, 'utf-8');
      output({ updated: true, stage, date: today }, raw, stage);
    } else {
      output({ updated: false, reason: 'Current Stage field not found in STATE.md' }, raw, 'false');
    }
  } catch {
    error('STATE.md not found');
  }
}

function cmdStateRecordService(cwd, serviceName, serviceType, raw) {
  if (!serviceName) {
    error('service name required for record-service');
  }

  const statePath = path.join(cwd, '.infra', 'STATE.md');
  try {
    let content = fs.readFileSync(statePath, 'utf-8');

    // Update services detected count
    const countField = stateExtractField(content, 'Services Detected');
    const currentCount = countField ? parseInt(countField, 10) : 0;
    const newCount = currentCount + 1;

    const result = stateReplaceField(content, 'Services Detected', String(newCount));
    if (result) {
      content = result;
      fs.writeFileSync(statePath, content, 'utf-8');
      output({ recorded: true, service: serviceName, type: serviceType || 'unknown', count: newCount }, raw, 'true');
    } else {
      output({ recorded: false, reason: 'Services Detected field not found in STATE.md' }, raw, 'false');
    }
  } catch {
    error('STATE.md not found');
  }
}

function cmdStatePatch(cwd, patches, raw) {
  const statePath = path.join(cwd, '.infra', 'STATE.md');
  try {
    let content = fs.readFileSync(statePath, 'utf-8');
    const results = { updated: [], failed: [] };

    for (const [field, value] of Object.entries(patches)) {
      const fieldEscaped = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(`(\\*\\*${fieldEscaped}:\\*\\*\\s*)(.*)`, 'i');

      if (pattern.test(content)) {
        content = content.replace(pattern, `$1${value}`);
        results.updated.push(field);
      } else {
        results.failed.push(field);
      }
    }

    if (results.updated.length > 0) {
      fs.writeFileSync(statePath, content, 'utf-8');
    }

    output(results, raw, results.updated.length > 0 ? 'true' : 'false');
  } catch {
    error('STATE.md not found');
  }
}

function cmdStateLoad(cwd, raw) {
  const config = loadConfig(cwd);
  const infraDir = path.join(cwd, '.infra');

  let stateRaw = '';
  try {
    stateRaw = fs.readFileSync(path.join(infraDir, 'STATE.md'), 'utf-8');
  } catch {}

  const configExists = fs.existsSync(path.join(infraDir, 'config.json'));
  const stateExists = stateRaw.length > 0;
  const analysisExists = fs.existsSync(path.join(infraDir, 'ANALYSIS.md'));
  const servicesExists = fs.existsSync(path.join(infraDir, 'SERVICES.md'));
  const recommendationsExists = fs.existsSync(path.join(infraDir, 'RECOMMENDATIONS.md'));
  const decisionsExists = fs.existsSync(path.join(infraDir, 'DECISIONS.md'));
  const architectureExists = fs.existsSync(path.join(infraDir, 'ARCHITECTURE.md'));
  const terraformDirExists = fs.existsSync(path.join(infraDir, 'terraform'));

  const result = {
    config,
    state_raw: stateRaw,
    state_exists: stateExists,
    config_exists: configExists,
    analysis_exists: analysisExists,
    services_exists: servicesExists,
    recommendations_exists: recommendationsExists,
    decisions_exists: decisionsExists,
    architecture_exists: architectureExists,
    terraform_exists: terraformDirExists,
  };

  output(result, raw);
}

module.exports = {
  PIPELINE_STAGES,
  stateExtractField,
  stateReplaceField,
  cmdStateGet,
  cmdStateUpdate,
  cmdStateUpdateStage,
  cmdStateRecordService,
  cmdStatePatch,
  cmdStateLoad,
};
