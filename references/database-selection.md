# Database Selection Decision Tree

Use this decision tree to select the right AWS database service for each data store requirement.

## Primary Decision Tree

```
What type of data?
  │
  ├── Relational (SQL, joins, transactions)
  │     ├── Size < 1TB and standard workload
  │     │     └── RDS (PostgreSQL or MySQL)
  │     ├── Size > 1TB or high-availability required
  │     │     └── Aurora (PostgreSQL or MySQL)
  │     └── Serverless/variable workload
  │           └── Aurora Serverless v2
  │
  ├── Key-value / Document
  │     ├── Simple key-value, high throughput
  │     │     └── DynamoDB
  │     ├── Document store with rich queries
  │     │     └── DocumentDB (MongoDB-compatible)
  │     └── Full-text search
  │           └── OpenSearch
  │
  ├── Cache / Session store
  │     ├── Redis features needed (sorted sets, pub/sub)
  │     │     └── ElastiCache Redis
  │     ├── Simple key-value cache
  │     │     └── ElastiCache Redis or Memcached
  │     └── DynamoDB-specific caching
  │           └── DAX
  │
  └── Time-series / Analytics
        ├── Time-series metrics
        │     └── Timestream
        └── Analytics / Data warehouse
              └── Redshift
```

## Quick Reference

| Use Case | Service | Engine | Why |
|----------|---------|--------|-----|
| Primary web app DB | RDS | PostgreSQL 16 | Most versatile, JSONB support |
| Primary web app DB (MySQL) | RDS | MySQL 8.0 | MySQL ecosystem |
| High-traffic relational | Aurora | PostgreSQL | Auto-scaling, multi-AZ |
| Variable-traffic relational | Aurora Serverless v2 | PostgreSQL | Scales to zero |
| User sessions | ElastiCache | Redis | Fast, TTL support |
| API response cache | ElastiCache | Redis | Low latency |
| Queue/pub-sub | ElastiCache | Redis | Built-in pub/sub |
| High-throughput key-value | DynamoDB | - | Infinite scale, single-digit ms |
| Search | OpenSearch | - | Full-text, aggregations |
| File/blob storage | S3 | - | Object storage |

## RDS Instance Sizing

| Workload | Instance | vCPU | RAM | Use Case |
|----------|----------|------|-----|----------|
| Dev/Test | db.t3.micro | 2 | 1GB | Development, testing |
| Small | db.t3.small | 2 | 2GB | Low-traffic production |
| Medium | db.t3.medium | 2 | 4GB | Standard production |
| Large | db.t3.large | 2 | 8GB | Busy production |
| XLarge | db.r6g.large | 2 | 16GB | High-memory workloads |

## ElastiCache Sizing

| Workload | Instance | Memory | Use Case |
|----------|----------|--------|----------|
| Small | cache.t3.micro | 0.5GB | Dev, small cache |
| Medium | cache.t3.small | 1.4GB | Session store, small cache |
| Large | cache.t3.medium | 3.1GB | Application cache |
| XLarge | cache.r6g.large | 13.1GB | Large cache, real-time |

## PostgreSQL vs MySQL Selection

| Factor | PostgreSQL | MySQL |
|--------|-----------|-------|
| JSON support | JSONB (excellent) | JSON (good) |
| Full-text search | Built-in (good) | Built-in (basic) |
| Geospatial | PostGIS (excellent) | Spatial (good) |
| Replication | Logical + Physical | Binary log |
| Default choice | Yes (more features) | If team knows MySQL |

**Default recommendation:** PostgreSQL unless MySQL is explicitly required or the team has strong MySQL expertise.

## Detection Heuristics

To determine database requirements from code analysis:

| Code Pattern | Database Type |
|-------------|--------------|
| `pg`, `postgres`, `psycopg`, `sequelize dialect: 'postgres'` | PostgreSQL |
| `mysql`, `mysql2`, `pymysql` | MySQL |
| `mongoose`, `mongodb`, `pymongo` | MongoDB → DocumentDB |
| `redis`, `ioredis`, `bull`, `bullmq` | Redis → ElastiCache |
| `dynamodb`, `@aws-sdk/client-dynamodb` | DynamoDB |
| `elasticsearch`, `opensearch` | OpenSearch |
| `prisma` → check `schema.prisma` provider | Varies |
| `typeorm` → check `ormconfig` | Varies |
| `sqlalchemy` → check connection string | Varies |
