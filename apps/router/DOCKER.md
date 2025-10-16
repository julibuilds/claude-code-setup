# Docker Deployment Guide

This guide covers deploying the Claude Code Router using Docker and Docker Compose.

## Prerequisites

- Docker 20.10 or later
- Docker Compose 2.0 or later (included with Docker Desktop)
- A configuration file (`config.json`)

## Quick Start

### 1. Create Configuration File

Copy the example configuration and customize it:

```bash
cp config.example.json config.json
```

Edit `config.json` with your provider API keys and routing rules.

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
OPENROUTER_API_KEY=your-key-here
DEEPSEEK_API_KEY=your-key-here
GEMINI_API_KEY=your-key-here
```

### 3. Start the Service

Using Docker Compose (recommended):

```bash
docker-compose up -d
```

Or build and run manually:

```bash
# Build the image
docker build -t claude-code-router -f apps/router/Dockerfile .

# Run the container
docker run -d \
  --name claude-code-router \
  -p 3456:3456 \
  -v $(pwd)/config.json:/app/apps/router/config.json:ro \
  -v $(pwd)/logs:/app/apps/router/logs \
  --env-file .env \
  claude-code-router
```

### 4. Verify the Service

Check if the service is running:

```bash
curl http://localhost:3456/
```

You should see a JSON response with status information.

## Docker Compose Configuration

The `docker-compose.yml` file includes:

- **Port mapping**: Exposes port 3456 (configurable via `PORT` env var)
- **Volume mounts**:
  - `config.json`: Router configuration (read-only)
  - `logs/`: Log files directory
  - `transformers/`: Custom transformer plugins (optional)
- **Environment variables**: Loaded from `.env` file
- **Health checks**: Automatic health monitoring
- **Resource limits**: CPU and memory constraints
- **Restart policy**: Automatically restarts on failure

## Common Commands

### View Logs

```bash
# Follow logs in real-time
docker-compose logs -f router

# View last 100 lines
docker-compose logs --tail=100 router
```

### Restart Service

```bash
docker-compose restart router
```

### Stop Service

```bash
docker-compose down
```

### Update Configuration

After modifying `config.json`:

```bash
docker-compose restart router
```

### Rebuild Image

After code changes:

```bash
docker-compose up -d --build
```

## Production Deployment

### Security Considerations

1. **Set an API Key**: Always set `APIKEY` in production
2. **Use HTTPS**: Deploy behind a reverse proxy (nginx, Caddy, Traefik)
3. **Restrict Access**: Use firewall rules or network policies
4. **Secure Secrets**: Use Docker secrets or external secret management

### Example with Reverse Proxy

Add to your `docker-compose.yml`:

```yaml
services:
  router:
    # ... existing configuration ...
    networks:
      - internal
    expose:
      - "3456"

  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    networks:
      - internal
    depends_on:
      - router

networks:
  internal:
    driver: bridge
```

### Resource Limits

Adjust resource limits based on your workload:

```yaml
deploy:
  resources:
    limits:
      cpus: "4"
      memory: 2G
    reservations:
      cpus: "1"
      memory: 512M
```

## Troubleshooting

### Container Won't Start

Check logs:

```bash
docker-compose logs router
```

Common issues:

- Missing or invalid `config.json`
- Invalid environment variables
- Port 3456 already in use

### Health Check Failing

Check if the service is responding:

```bash
docker exec claude-code-router bun run -e "fetch('http://localhost:3456/').then(r => console.log(r.status))"
```

### Permission Issues

Ensure log directory is writable:

```bash
mkdir -p logs
chmod 755 logs
```

## Advanced Configuration

### Custom Transformers

Mount a directory with custom transformer modules:

```yaml
volumes:
  - ./transformers:/app/transformers:ro
```

Reference in `config.json`:

```json
{
  "transformers": [
    {
      "path": "/app/transformers/my-transformer.js",
      "options": {}
    }
  ]
}
```

### Multiple Instances

Run multiple instances with different configurations:

```bash
# Instance 1
docker-compose -f docker-compose.yml -p router1 up -d

# Instance 2 (different port)
PORT=3457 docker-compose -f docker-compose.yml -p router2 up -d
```

## Monitoring

### Health Checks

Docker automatically monitors health:

```bash
docker inspect --format='{{.State.Health.Status}}' claude-code-router
```

### Metrics

View container stats:

```bash
docker stats claude-code-router
```

### Log Rotation

Logs are automatically rotated (max 10MB per file, 3 files retained).

## Backup and Restore

### Backup Configuration

```bash
docker cp claude-code-router:/app/apps/router/config.json ./backup-config.json
```

### Restore Configuration

```bash
docker cp ./backup-config.json claude-code-router:/app/apps/router/config.json
docker-compose restart router
```

## Uninstall

Remove container and volumes:

```bash
docker-compose down -v
```

Remove image:

```bash
docker rmi claude-code-router
```
