# Ehub PMS Scaling Guide

Comprehensive guide for scaling the Ehub Project Management System to handle increased load and traffic.

## Table of Contents

- [Understanding Your Current Setup](#understanding-your-current-setup)
- [Scaling Strategies](#scaling-strategies)
- [Horizontal Scaling](#horizontal-scaling)
- [Vertical Scaling](#vertical-scaling)
- [Database Scaling](#database-scaling)
- [Caching Strategy](#caching-strategy)
- [Load Balancing](#load-balancing)
- [Monitoring & Metrics](#monitoring--metrics)
- [Cost Optimization](#cost-optimization)

---

## Understanding Your Current Setup

### Current Architecture

```
┌─────────────┐
│   Nginx     │ (Reverse Proxy & Load Balancer)
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
┌──────▼──────┐    ┌─────▼─────┐
│  Frontend   │    │  Backend  │ (Node.js/Express)
│  (React)    │    │  API      │
└─────────────┘    └─────┬─────┘
                         │
                    ┌────▼────┐
                    │  MySQL  │
                    │ Database│
                    └─────────┘
```

### Current Capacity (Per Instance)

- **Frontend**: Handles ~1000 concurrent connections
- **Backend**: ~500 concurrent API requests per instance
- **Database**: ~200 max connections (configurable)
- **Memory**: Backend ~256MB-512MB per instance

---

## Scaling Strategies

### When to Scale

**Horizontal Scaling (Add more instances)** - When:
- CPU usage consistently > 70%
- Response times increasing
- High concurrent user count
- Need high availability

**Vertical Scaling (Increase resources)** - When:
- Single queries are slow
- Memory constraints
- Database size growing
- Single instance bottleneck

---

## Horizontal Scaling

### Scaling Backend Services

#### Docker Compose Scaling

```bash
# Scale backend to 3 instances
docker-compose up -d --scale backend=3

# With production configuration
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale backend=3
```

Nginx automatically load balances using round-robin algorithm.

#### Manual Scaling Configuration

Update `docker-compose.prod.yml`:

```yaml
services:
  backend:
    deploy:
      replicas: 3  # Number of instances
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

#### Load Balancing Algorithms

Current: Round-robin (default)
Alternative options in `nginx/nginx.conf`:

```nginx
# Least connections (better for long-running requests)
upstream backend {
    least_conn;
    server backend:3002;
    server backend:3002;
}

# IP hash (session sticky)
upstream backend {
    ip_hash;
    server backend:3002;
    server backend:3002;
}
```

### Scaling Frontend Services

```bash
# Scale frontend to 2 instances
docker-compose up -d --scale frontend=2
```

Frontend is stateless, so scaling is straightforward.

### Kubernetes Deployment (Advanced)

For large-scale deployments, consider Kubernetes:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ehub-pms-backend
spec:
  replicas: 5
  selector:
    matchLabels:
      app: ehub-pms-backend
  template:
    metadata:
      labels:
        app: ehub-pms-backend
    spec:
      containers:
      - name: backend
        image: ehub-pms-backend:latest
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

---

## Vertical Scaling

### Increasing Backend Resources

Edit `docker-compose.prod.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'        # Increase from 1
          memory: 1G        # Increase from 512M
        reservations:
          cpus: '1'
          memory: 512M
```

### Database Scaling

#### Increase MySQL Resources

```yaml
services:
  mysql:
    deploy:
      resources:
        limits:
          cpus: '4'        # Increase CPU
          memory: 4G       # Increase memory
```

#### MySQL Configuration Tuning

Update MySQL configuration in `docker-compose.yml`:

```yaml
mysql:
  command: >
    --default-authentication-plugin=mysql_native_password
    --max_connections=500
    --innodb_buffer_pool_size=2G
    --innodb_log_file_size=512M
    --innodb_flush_log_at_trx_commit=2
    --query_cache_type=1
    --query_cache_size=128M
```

---

## Database Scaling

### Read Replicas

For read-heavy workloads, set up MySQL read replicas:

```yaml
services:
  mysql-replica:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    command: --server-id=2 --log-bin=mysql-bin --relay-log=mysql-relay-bin
    depends_on:
      - mysql
```

Update backend to use read replicas for SELECT queries.

### Connection Pooling

Already configured in `backend/server.js`:
- Max connections: 200 (per instance)
- Connection limit: 10
- Queue limit: 0

For multiple backend instances:
- Total capacity: 200 × number of instances
- Adjust MySQL `max_connections` accordingly

### Database Optimization

1. **Indexes**: Ensure all foreign keys and frequently queried columns are indexed
2. **Query Optimization**: Use EXPLAIN to analyze slow queries
3. **Partitioning**: For large tables (>10M rows)
4. **Archiving**: Move old data to archive tables

---

## Caching Strategy

### Redis Caching

Enable Redis for session storage and caching:

```bash
# Start with Redis
docker-compose --profile caching up -d
```

### Implementation Strategy

1. **Session Storage**: Store JWT tokens and user sessions
2. **Query Caching**: Cache frequently accessed data
3. **API Response Caching**: Cache GET requests for 5-15 minutes

Example implementation:

```javascript
// Backend caching example
const redis = require('redis');
const client = redis.createClient({
  host: 'redis',
  password: process.env.REDIS_PASSWORD
});

// Cache user data
async function getCachedUser(userId) {
  const cacheKey = `user:${userId}`;
  const cached = await client.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  const user = await db.getUser(userId);
  await client.setEx(cacheKey, 300, JSON.stringify(user)); // 5 min TTL
  return user;
}
```

### Cache Invalidation

- Time-based: TTL for temporary data
- Event-based: Invalidate on updates
- Manual: Clear cache on admin actions

---

## Load Balancing

### Nginx Configuration

Current configuration uses round-robin. For advanced scenarios:

#### Health Checks

```nginx
upstream backend {
    least_conn;
    server backend:3002 max_fails=3 fail_timeout=30s;
    server backend:3002 max_fails=3 fail_timeout=30s backup;
}
```

#### Sticky Sessions

```nginx
upstream backend {
    ip_hash;  # Sessions stick to same backend
    server backend:3002;
    server backend:3002;
}
```

### Application Load Balancer (AWS)

For cloud deployments:
- Use AWS ALB for HTTP/HTTPS load balancing
- Configure health checks: `/api/health`
- Enable session stickiness if needed
- Configure SSL termination

---

## Monitoring & Metrics

### Key Metrics to Monitor

1. **Response Times**
   - API: < 200ms (p95)
   - Database queries: < 100ms (p95)
   - Page load: < 2s

2. **Throughput**
   - Requests per second
   - Database queries per second
   - Concurrent users

3. **Resource Usage**
   - CPU usage per instance
   - Memory usage
   - Database connections

4. **Error Rates**
   - API error rate: < 1%
   - Database errors: < 0.1%
   - 5xx errors: < 0.5%

### Monitoring Tools

#### Docker Stats

```bash
# Real-time resource usage
docker stats

# Continuous monitoring
watch -n 1 docker stats
```

#### Prometheus + Grafana

```yaml
# Add to docker-compose.yml
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
  
  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
```

#### Application Logs

```bash
# Monitor logs
docker-compose logs -f backend

# Filter errors
docker-compose logs backend | grep ERROR

# Export logs
docker-compose logs > logs_$(date +%Y%m%d).txt
```

---

## Cost Optimization

### Resource Right-Sizing

1. **Monitor Usage**: Track actual resource usage
2. **Right-Size**: Adjust to match actual needs
3. **Auto-Scale**: Implement auto-scaling rules

### Auto-Scaling Rules

Example for cloud platforms:

```yaml
# Scale up when CPU > 70% for 5 minutes
# Scale down when CPU < 30% for 10 minutes
# Min instances: 2
# Max instances: 10
```

### Cost-Saving Tips

1. **Reserved Instances**: For predictable workloads
2. **Spot Instances**: For non-critical environments
3. **CDN**: Reduce origin server load
4. **Database Optimization**: Reduce query costs
5. **Caching**: Reduce database load

---

## Scaling Scenarios

### Scenario 1: 100 Concurrent Users

**Current Setup**: Single instance handles this

**No changes needed**

### Scenario 2: 500 Concurrent Users

**Recommendations**:
- Scale backend to 2-3 instances
- Increase database connections to 300
- Enable Redis caching

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale backend=3
```

### Scenario 3: 2000+ Concurrent Users

**Recommendations**:
- Scale backend to 5-10 instances
- Use read replicas for database
- Enable full Redis caching
- Consider Kubernetes
- Use CDN for static assets
- Implement database connection pooling across instances

### Scenario 4: High Availability

**Recommendations**:
- Minimum 3 backend instances across zones
- Database replication (master-slave)
- Load balancer with health checks
- Automated failover
- Regular backups

---

## Performance Testing

### Load Testing

Use tools like:
- **Apache JMeter**: For API load testing
- **k6**: Modern load testing tool
- **Artillery**: Node.js load testing

Example k6 script:

```javascript
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 },  // Stay at 100
    { duration: '2m', target: 200 },  // Ramp up to 200
    { duration: '5m', target: 200 },  // Stay at 200
    { duration: '2m', target: 0 },    // Ramp down
  ],
};

export default function () {
  const res = http.get('http://localhost:3002/api/health');
  check(res, { 'status was 200': (r) => r.status == 200 });
}
```

### Benchmarking

Before scaling, benchmark:
- Baseline performance
- Identify bottlenecks
- Test scaling impact
- Measure improvement

---

## Best Practices

1. **Start Small**: Begin with single instance, scale as needed
2. **Monitor First**: Understand your metrics before scaling
3. **Scale Gradually**: Add instances incrementally
4. **Test Scaling**: Verify performance after scaling
5. **Optimize First**: Optimize code before scaling
6. **Right-Size**: Don't over-provision resources
7. **Automate**: Use auto-scaling where possible
8. **Plan for Growth**: Design with scaling in mind

---

## Quick Reference

```bash
# Scale backend
docker-compose up -d --scale backend=3

# Check resource usage
docker stats

# View logs
docker-compose logs -f backend

# Health check
curl http://localhost:3002/api/health

# Restart services
docker-compose restart

# Update and redeploy
git pull
docker-compose build
docker-compose up -d
```

---

For deployment-specific scaling, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

