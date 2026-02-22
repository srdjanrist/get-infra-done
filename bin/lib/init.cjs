/**
 * Init — Compound init commands for infrastructure workflow bootstrapping
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { loadConfig, resolveModelInternal, pathExistsInternal, output, error } = require('./core.cjs');

function cmdInitNewProject(cwd, raw) {
  const config = loadConfig(cwd);

  // Detect Dockerfile
  let hasDockerfile = false;
  let hasDockerCompose = false;
  try {
    hasDockerfile = pathExistsInternal(cwd, 'Dockerfile') ||
                    pathExistsInternal(cwd, 'dockerfile');

    hasDockerCompose = pathExistsInternal(cwd, 'docker-compose.yml') ||
                       pathExistsInternal(cwd, 'docker-compose.yaml') ||
                       pathExistsInternal(cwd, 'compose.yml') ||
                       pathExistsInternal(cwd, 'compose.yaml');
  } catch {}

  // Detect languages
  const languages = [];
  const langDetectors = [
    { name: 'javascript', files: ['package.json'] },
    { name: 'typescript', files: ['tsconfig.json'] },
    { name: 'python', files: ['requirements.txt', 'pyproject.toml', 'setup.py', 'Pipfile'] },
    { name: 'go', files: ['go.mod'] },
    { name: 'rust', files: ['Cargo.toml'] },
    { name: 'java', files: ['pom.xml', 'build.gradle'] },
    { name: 'ruby', files: ['Gemfile'] },
    { name: 'csharp', files: ['*.csproj'] },
  ];

  for (const detector of langDetectors) {
    for (const file of detector.files) {
      if (file.includes('*')) {
        try {
          const found = execSync(`find . -maxdepth 3 -name "${file}" 2>/dev/null | head -1`, {
            cwd, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'],
          }).trim();
          if (found) languages.push(detector.name);
        } catch {}
      } else if (pathExistsInternal(cwd, file)) {
        languages.push(detector.name);
      }
    }
  }

  const result = {
    // Models
    scanner_model: resolveModelInternal(cwd, 'infra-scanner'),
    detector_model: resolveModelInternal(cwd, 'infra-service-detector'),
    recommender_model: resolveModelInternal(cwd, 'infra-recommender'),
    architect_model: resolveModelInternal(cwd, 'infra-architect'),
    terraform_gen_model: resolveModelInternal(cwd, 'infra-terraform-gen'),

    // Config
    aws_region: config.aws_region,
    environment: config.environment,
    commit_docs: config.commit_docs,
    terraform_output_dir: config.terraform_output_dir,

    // Workflow flags
    auto_approve_recommendations: config.workflow.auto_approve_recommendations,
    run_security_audit: config.workflow.run_security_audit,
    run_cost_estimate: config.workflow.run_cost_estimate,
    generate_cicd: config.workflow.generate_cicd,

    // Detection
    has_dockerfile: hasDockerfile,
    has_docker_compose: hasDockerCompose,
    detected_languages: [...new Set(languages)],

    // Existing state
    infra_exists: pathExistsInternal(cwd, '.infra'),
    config_exists: pathExistsInternal(cwd, '.infra/config.json'),
    analysis_exists: pathExistsInternal(cwd, '.infra/ANALYSIS.md'),
    services_exists: pathExistsInternal(cwd, '.infra/SERVICES.md'),
    recommendations_exists: pathExistsInternal(cwd, '.infra/RECOMMENDATIONS.md'),
    decisions_exists: pathExistsInternal(cwd, '.infra/DECISIONS.md'),
    architecture_exists: pathExistsInternal(cwd, '.infra/ARCHITECTURE.md'),
    terraform_exists: pathExistsInternal(cwd, '.infra/terraform'),
    state_exists: pathExistsInternal(cwd, '.infra/STATE.md'),

    // Git state
    has_git: pathExistsInternal(cwd, '.git'),

    // File paths
    config_path: '.infra/config.json',
    state_path: '.infra/STATE.md',
    analysis_path: '.infra/ANALYSIS.md',
    services_path: '.infra/SERVICES.md',
  };

  output(result, raw);
}

function cmdInitAnalyze(cwd, raw) {
  const config = loadConfig(cwd);

  // Check if analysis already exists
  const analysisExists = pathExistsInternal(cwd, '.infra/ANALYSIS.md');
  let previousAnalysisDate = null;

  if (analysisExists) {
    try {
      const content = fs.readFileSync(path.join(cwd, '.infra', 'ANALYSIS.md'), 'utf-8');
      const dateMatch = content.match(/\*\*Date:\*\*\s*(.+)/i);
      if (dateMatch) previousAnalysisDate = dateMatch[1].trim();
    } catch {}
  }

  // Check for recent changes
  let recentChanges = false;
  try {
    const diffOutput = execSync('git diff --name-only HEAD~5 2>/dev/null || echo ""', {
      cwd, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    const changedFiles = diffOutput.split('\n').filter(f => f.length > 0);
    const infraRelevantPatterns = [
      'Dockerfile', 'docker-compose', 'package.json', 'requirements.txt',
      'go.mod', 'Cargo.toml', '.env', 'Makefile',
    ];
    recentChanges = changedFiles.some(f =>
      infraRelevantPatterns.some(p => f.includes(p))
    );
  } catch {}

  const result = {
    // Models
    scanner_model: resolveModelInternal(cwd, 'infra-scanner'),
    detector_model: resolveModelInternal(cwd, 'infra-service-detector'),

    // Config
    commit_docs: config.commit_docs,

    // Analysis state
    analysis_exists: analysisExists,
    previous_analysis_date: previousAnalysisDate,
    has_recent_changes: recentChanges,
    services_exists: pathExistsInternal(cwd, '.infra/SERVICES.md'),

    // File paths
    analysis_path: '.infra/ANALYSIS.md',
    services_path: '.infra/SERVICES.md',
    state_path: '.infra/STATE.md',
  };

  output(result, raw);
}

function cmdInitGenerate(cwd, raw) {
  const config = loadConfig(cwd);

  // Check prerequisites
  const analysisExists = pathExistsInternal(cwd, '.infra/ANALYSIS.md');
  const decisionsExists = pathExistsInternal(cwd, '.infra/DECISIONS.md');
  const architectureExists = pathExistsInternal(cwd, '.infra/ARCHITECTURE.md');
  const servicesExists = pathExistsInternal(cwd, '.infra/SERVICES.md');

  const result = {
    // Models
    architect_model: resolveModelInternal(cwd, 'infra-architect'),
    terraform_gen_model: resolveModelInternal(cwd, 'infra-terraform-gen'),
    cicd_gen_model: resolveModelInternal(cwd, 'infra-cicd-gen'),
    validator_model: resolveModelInternal(cwd, 'infra-validator'),
    security_auditor_model: resolveModelInternal(cwd, 'infra-security-auditor'),
    cost_estimator_model: resolveModelInternal(cwd, 'infra-cost-estimator'),

    // Config
    aws_region: config.aws_region,
    environment: config.environment,
    commit_docs: config.commit_docs,
    terraform_output_dir: config.terraform_output_dir,
    run_security_audit: config.workflow.run_security_audit,
    run_cost_estimate: config.workflow.run_cost_estimate,
    generate_cicd: config.workflow.generate_cicd,

    // Prerequisites
    analysis_exists: analysisExists,
    decisions_exists: decisionsExists,
    architecture_exists: architectureExists,
    services_exists: servicesExists,
    prerequisites_met: analysisExists && decisionsExists,

    // Existing terraform
    terraform_exists: pathExistsInternal(cwd, '.infra/terraform'),

    // File paths
    analysis_path: '.infra/ANALYSIS.md',
    decisions_path: '.infra/DECISIONS.md',
    architecture_path: '.infra/ARCHITECTURE.md',
    services_path: '.infra/SERVICES.md',
    terraform_dir: config.terraform_output_dir,
    state_path: '.infra/STATE.md',
  };

  output(result, raw);
}

function cmdInitProgress(cwd, raw) {
  const config = loadConfig(cwd);

  // Determine pipeline stage from STATE.md
  let currentStage = 'not_started';
  let servicesDetected = 0;
  let decisionsLocked = false;
  let terraformFileCount = 0;

  try {
    const state = fs.readFileSync(path.join(cwd, '.infra', 'STATE.md'), 'utf-8');
    const stageMatch = state.match(/\*\*Current Stage:\*\*\s*(.+)/i);
    if (stageMatch) currentStage = stageMatch[1].trim();

    const servicesMatch = state.match(/\*\*Services Detected:\*\*\s*(\d+)/i);
    if (servicesMatch) servicesDetected = parseInt(servicesMatch[1], 10);

    const decisionsMatch = state.match(/\*\*Decisions Locked:\*\*\s*(yes|true)/i);
    if (decisionsMatch) decisionsLocked = true;

    const tfMatch = state.match(/\*\*Terraform Files:\*\*\s*(\d+)/i);
    if (tfMatch) terraformFileCount = parseInt(tfMatch[1], 10);
  } catch {}

  // Count actual terraform files
  try {
    const tfDir = path.join(cwd, '.infra', 'terraform');
    if (fs.existsSync(tfDir)) {
      terraformFileCount = fs.readdirSync(tfDir).filter(f => f.endsWith('.tf')).length;
    }
  } catch {}

  const result = {
    // Pipeline state
    current_stage: currentStage,
    services_detected: servicesDetected,
    decisions_locked: decisionsLocked,
    terraform_file_count: terraformFileCount,

    // Artifact existence
    config_exists: pathExistsInternal(cwd, '.infra/config.json'),
    state_exists: pathExistsInternal(cwd, '.infra/STATE.md'),
    analysis_exists: pathExistsInternal(cwd, '.infra/ANALYSIS.md'),
    services_exists: pathExistsInternal(cwd, '.infra/SERVICES.md'),
    recommendations_exists: pathExistsInternal(cwd, '.infra/RECOMMENDATIONS.md'),
    decisions_exists: pathExistsInternal(cwd, '.infra/DECISIONS.md'),
    architecture_exists: pathExistsInternal(cwd, '.infra/ARCHITECTURE.md'),
    terraform_exists: pathExistsInternal(cwd, '.infra/terraform'),
    security_audit_exists: pathExistsInternal(cwd, '.infra/SECURITY-AUDIT.md'),
    cost_estimate_exists: pathExistsInternal(cwd, '.infra/COST-ESTIMATE.md'),
    audit_scan_exists: pathExistsInternal(cwd, '.infra/AUDIT-SCAN.md'),
    audit_report_exists: pathExistsInternal(cwd, '.infra/AUDIT-REPORT.md'),

    // Config
    aws_region: config.aws_region,
    environment: config.environment,

    // File paths
    state_path: '.infra/STATE.md',
  };

  output(result, raw);
}

function cmdInitAudit(cwd, raw) {
  const config = loadConfig(cwd);

  // Detect IaC type
  const iacDetection = {
    terraform: false,
    cloudformation: false,
    cdk: false,
    pulumi: false,
    kubernetes: false,
    helm: false,
    ansible: false,
  };

  try {
    // Terraform
    const tfFiles = execSync('find . -maxdepth 3 -name "*.tf" -not -path "./.terraform/*" 2>/dev/null | head -1', {
      cwd, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    if (tfFiles) iacDetection.terraform = true;

    // Pulumi
    if (pathExistsInternal(cwd, 'Pulumi.yaml')) iacDetection.pulumi = true;

    // CDK
    if (pathExistsInternal(cwd, 'cdk.json')) iacDetection.cdk = true;

    // CloudFormation
    if (pathExistsInternal(cwd, 'template.yaml') || pathExistsInternal(cwd, 'template.json')) {
      iacDetection.cloudformation = true;
    }

    // Helm
    if (pathExistsInternal(cwd, 'Chart.yaml')) iacDetection.helm = true;

    // Kubernetes
    const k8sFiles = execSync('find . -maxdepth 3 -name "*.yaml" -path "*/k8s/*" -o -name "*.yaml" -path "*/kubernetes/*" -o -name "*.yaml" -path "*/manifests/*" 2>/dev/null | head -1', {
      cwd, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    if (k8sFiles) iacDetection.kubernetes = true;

    // Ansible
    if (pathExistsInternal(cwd, 'ansible.cfg') || pathExistsInternal(cwd, 'playbook.yml') || pathExistsInternal(cwd, 'site.yml')) {
      iacDetection.ansible = true;
    }
  } catch {}

  const detectedTypes = Object.entries(iacDetection).filter(([, v]) => v).map(([k]) => k);

  // Check previous audit state
  let previousAuditDate = null;
  const auditScanExists = pathExistsInternal(cwd, '.infra/AUDIT-SCAN.md');

  if (auditScanExists) {
    try {
      const content = fs.readFileSync(path.join(cwd, '.infra', 'AUDIT-SCAN.md'), 'utf-8');
      const dateMatch = content.match(/\*\*Date:\*\*\s*(.+)/i);
      if (dateMatch) previousAuditDate = dateMatch[1].trim();
    } catch {}
  }

  const result = {
    // Models
    scanner_model: resolveModelInternal(cwd, 'infra-audit-scanner'),
    reporter_model: resolveModelInternal(cwd, 'infra-audit-reporter'),

    // Config
    aws_region: config.aws_region,
    environment: config.environment,
    commit_docs: config.commit_docs,

    // IaC detection
    iac_detection: iacDetection,
    detected_iac_types: detectedTypes,
    primary_iac: detectedTypes[0] || 'unknown',

    // Previous audit state
    audit_scan_exists: auditScanExists,
    audit_report_exists: pathExistsInternal(cwd, '.infra/AUDIT-REPORT.md'),
    previous_audit_date: previousAuditDate,

    // Standard infra state
    infra_exists: pathExistsInternal(cwd, '.infra'),
    config_exists: pathExistsInternal(cwd, '.infra/config.json'),
    state_exists: pathExistsInternal(cwd, '.infra/STATE.md'),
    has_git: pathExistsInternal(cwd, '.git'),
  };

  output(result, raw);
}

module.exports = {
  cmdInitNewProject,
  cmdInitAnalyze,
  cmdInitGenerate,
  cmdInitProgress,
  cmdInitAudit,
};
