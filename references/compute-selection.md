# Compute Selection Decision Tree

Use this decision tree to select the right AWS compute service for each application service.

## Primary Decision Tree

```
Is it event-driven? (webhooks, cron, queue processing)
  ├── YES: How long does it run?
  │     ├── < 15 minutes → Lambda
  │     └── > 15 minutes → ECS Fargate (worker)
  │
  └── NO: Is it a long-running HTTP service?
        ├── YES: Does it need GPU?
        │     ├── YES → EC2 (GPU instance)
        │     └── NO: What's the traffic pattern?
        │           ├── Steady/predictable → ECS Fargate
        │           ├── Highly variable → ECS Fargate with auto-scaling
        │           └── Very bursty, low average → Lambda + API Gateway
        │
        └── NO: Is it a static frontend?
              ├── YES: Is it SSR (server-side rendered)?
              │     ├── YES → ECS Fargate (or Lambda@Edge)
              │     └── NO → S3 + CloudFront
              │
              └── NO: Is it a background worker?
                    ├── YES → ECS Fargate (worker task)
                    └── NO → ECS Fargate (default)
```

## Quick Reference

| Application Type | Compute | Why |
|-----------------|---------|-----|
| REST/GraphQL API (Node.js, Python, Go) | ECS Fargate | Long-running, predictable |
| REST API (low traffic) | Lambda + API Gateway | Cost-effective at low scale |
| Next.js SSR | ECS Fargate | Persistent server process |
| React/Vue/Angular SPA | S3 + CloudFront | Static files |
| Django/Rails monolith | ECS Fargate | Single container |
| Background worker | ECS Fargate | Long-running tasks |
| Cron job (< 15 min) | Lambda + EventBridge | Scheduled, short |
| Cron job (> 15 min) | ECS Fargate Scheduled Task | Long scheduled |
| Webhook handler | Lambda + API Gateway | Event-driven, bursty |
| WebSocket server | ECS Fargate | Persistent connections |
| Queue processor | Lambda + SQS | Event-driven |
| Queue processor (long) | ECS Fargate + SQS | > 15 min tasks |
| ML inference (GPU) | EC2 p-type | GPU required |

## Fargate Sizing Guide

| Workload | vCPU | Memory | Typical Use |
|----------|------|--------|-------------|
| Micro | 0.25 | 0.5GB | Internal tools, low-traffic APIs |
| Small | 0.5 | 1GB | Standard APIs, small workers |
| Medium | 1 | 2GB | Busy APIs, Node.js/Python services |
| Large | 2 | 4GB | CPU-intensive APIs, Java services |
| XLarge | 4 | 8GB | Heavy processing, high-throughput |

## Lambda Sizing Guide

| Runtime | Memory | Typical Use |
|---------|--------|-------------|
| Node.js | 128-256MB | Simple handlers, webhooks |
| Node.js | 512MB-1GB | API routes, file processing |
| Python | 128-256MB | Simple handlers, cron |
| Python | 512MB-1GB | Data processing, ML inference |
| Go | 128MB | Most Go workloads |
| Java | 512MB-2GB | Spring Boot (cold start concern) |
