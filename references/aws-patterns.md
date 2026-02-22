# AWS Architecture Patterns

Reference for mapping application types to AWS architecture patterns.

## Pattern: 3-Tier Web Application

**When to use:** Traditional web apps with frontend, API, and database.

**Resources:**
- CloudFront + S3 (static frontend)
- ALB + ECS Fargate (API tier)
- RDS PostgreSQL/MySQL (data tier)
- ElastiCache Redis (session/cache)
- Secrets Manager, CloudWatch

**Cost profile:** Medium ($150-500/month for small-medium apps)

**Example:** React frontend + Express API + PostgreSQL

## Pattern: Serverless API

**When to use:** Event-driven, low-traffic, or bursty workloads. APIs with <15min execution time.

**Resources:**
- API Gateway HTTP API
- Lambda functions
- DynamoDB or RDS Proxy + RDS
- S3 (assets)
- CloudWatch

**Cost profile:** Low for small workloads ($20-100/month), scales with usage

**Example:** REST API with <100 RPS average, webhook handlers

## Pattern: Microservices

**When to use:** Multiple independently deployable services, different tech stacks or scaling needs.

**Resources:**
- ALB with path-based routing
- ECS Fargate (one service per task definition)
- Service discovery (Cloud Map)
- RDS/DynamoDB per service
- SQS/SNS for inter-service messaging
- CloudWatch + X-Ray

**Cost profile:** Higher baseline ($300-1000+/month), but optimizable per service

**Example:** Monorepo with api/, worker/, notification-service/

## Pattern: Static Site + API

**When to use:** JAMstack, static site generators, SPAs with backend API.

**Resources:**
- CloudFront + S3 (site hosting)
- Lambda@Edge or Lambda + API Gateway (API)
- DynamoDB (if NoSQL fits)
- Route 53

**Cost profile:** Very low ($10-50/month for moderate traffic)

**Example:** Next.js static export + serverless API routes

## Pattern: Monolith on Fargate

**When to use:** Single deployable unit, traditional monolith modernization.

**Resources:**
- ALB + ECS Fargate (single service)
- RDS (database)
- ElastiCache (optional cache)
- S3 (file storage)
- CloudWatch

**Cost profile:** Medium ($100-400/month)

**Example:** Django/Rails/Express monolith in a single container

## Selection Guide

| Signal | Pattern |
|--------|---------|
| Single Dockerfile, one entry point | Monolith on Fargate |
| Multiple Dockerfiles or services/ dirs | Microservices |
| No Dockerfile, serverless framework | Serverless API |
| Static build output (dist/, build/) | Static Site + API |
| Frontend + API + Database | 3-Tier Web Application |
| Event-driven, webhooks, cron | Serverless API |
| GPU required | EC2 (not covered here) |
