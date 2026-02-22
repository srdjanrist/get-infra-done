# Detected Services

**Total Services:** {count}
**Detection Date:** {date}

## Service Inventory

| Name | Type | Language | Framework | Port | Path |
|------|------|----------|-----------|------|------|
| {name} | {type} | {language} | {framework} | {port} | {path} |

## Service Details

### {service_name}

**Type:** {web_api|worker|cron|static|lambda}
**Language:** {language}
**Framework:** {framework}
**Port:** {port}
**Path:** {relative_path}
**Entry Point:** {entry_point}
**Dockerfile:** {dockerfile_path}

**Dependencies:**
- {dependency_name}: {version}

**Environment Variables:**
- `{VAR_NAME}`: {description}

**Inter-service Dependencies:**
- Depends on: {other_service_name} (via {mechanism})
