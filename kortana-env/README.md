# Kortana Virtual Environment Infrastructure

This project provides a system for allocating and managing isolated virtual environments for running Kortana blockchain instances.

## Architecture
- **C++ Environment Manager**: Manages resource allocation (2TB ROM, 32GB RAM simulation) and lifecycle.
- **Blockchain Deployer**: Clones and compiles the Kortana blockchain.
- **URL Manager**: Handles unique URL generation and reverse proxy configuration.
- **Dockerized**: Entire system runs in a Docker container for consistency and 24/7 uptime on Render.
- **State Persistence**: Environment data is persisted to disk, ensuring state is maintained across restarts.
- **Auto-Recovery**: Environments that were running before a restart are automatically relaunched upon system startup.

## Components
- `environment-manager/`: C++ source code for the manager.
- `scripts/`: Initialization and configuration scripts.
- `nginx/`: Nginx configuration files.
- `Dockerfile`: Multi-stage build for the infrastructure.
- `render.yaml`: Deployment configuration for Render.com.

## API Endpoints (Port 9000)
- `POST /api/allocate`: Allocate a new environment.
- `POST /api/deploy`: Clone and compile the blockchain.
- `POST /api/start`: Start the blockchain and configure routing.
- `GET /api/status/:id`: Get environment and resource stats.

## Deployment Guide
1. Push this repository to GitHub.
2. Connect the repository to Render.com.
3. Render will automatically detect the `render.yaml` and deploy the service.
4. Ensure your domain `worchsester.xyz` has a wildcard DNS record (`*.worchsester.xyz`) pointing to Render's IP.

## Local Testing
```bash
docker-compose up --build
```

## Testing RPC
Once running, you can test the RPC via curl:
```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```
