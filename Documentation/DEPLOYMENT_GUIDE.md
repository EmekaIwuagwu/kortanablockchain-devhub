# Kortana Blockchain Deployment Guide

This guide provides step-by-step instructions for deploying the Kortana Blockchain Node and Explorer on a fresh Linux server (Ubuntu 22.04 LTS recommended).

## 1. Prerequisites

### 1.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install build-essential curl git pkg-config libssl-dev -y
```

### 1.2 Install Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### 1.3 Install Node.js (for Explorer)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 1.4 Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

---

## 2. Clone Repository

```bash
git clone https://github.com/EmekaIwuagwu/kortanablockchain-devhub.git
cd kortanablockchain-devhub
```

---

## 3. Backend Deployment (Kortana Node)

### 3.1 Build the Node
```bash
cd kortana-blockchain-rust
cargo build --release
```

### 3.2 Configuration
Copy the environment example and set your validator key:
```bash
cp .env.example .env
nano .env
```
Ensure `VALIDATOR_PRIVATE_KEY` is set to your secret hex key.

### 3.3 Launch Node with PM2
```bash
pm2 start target/release/kortana-blockchain-rust --name "kortana-node"
```

---

## 4. Frontend Deployment (Kortana Explorer)

### 4.1 Install Dependencies
```bash
cd ../kortana-explorer
npm install
```

### 4.2 Configuration
The explorer currently has the RPC URL hardcoded in `lib/rpc.js`. For a local server, you should update it to point to your node's IP or localhost.

```bash
nano lib/rpc.js
```
Change line 3 to your server's RPC address:
`const RPC_URL = 'http://127.0.0.1:8545';`

### 4.3 Build & Start
```bash
npm run build
pm2 start npm --name "kortana-explorer" -- start
```

---

## 5. Security & Networking

### 5.1 Firewall (UFW)
Open necessary ports:
```bash
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS
sudo ufw allow 8545    # RPC (Optional: Be careful opening this to public)
sudo ufw allow 30333   # P2P
sudo ufw enable
```

### 5.2 Reverse Proxy (Nginx) - Recommended
To serve the explorer on Port 80/443:
```bash
sudo apt install nginx -y
```
Create a config file `/etc/nginx/sites-available/kortana`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Optional: Proxy RPC for public access
    location /rpc {
        proxy_pass http://localhost:8545;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/kortana /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 6. Maintenance Commands

- **Check logs:** `pm2 logs`
- **Restart services:** `pm2 restart all`
- **Node status:** `curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://localhost:8545`

---

## 7. Migration Checklist
- [ ] Export your current `data/kortana.db` if you want to keep history.
- [ ] Backup your `VALIDATOR_PRIVATE_KEY`.
- [ ] Ensure all firewall rules are applied before going live.
