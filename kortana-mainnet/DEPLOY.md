
# 🚀 Kortana Node - Azure Production Deployment Guide

This guide details how to deploy your Kortana Blockchain Node to an Azure Cloud VM running Ubuntu Linux.

## 1. Azure VM Setup
1.  **Create Resource**: Go to Azure Portal > Virtual Machines > Create.
2.  **OS**: Select **Ubuntu Server 24.04 LTS** (or 22.04).
3.  **Size**: Recommended `Standard_D2s_v3` (2 vCPUs, 8GB RAM) or higher for production.
4.  **Networking (NSG)**:
    *   Allow **SSH (22)** from your IP only (for security).
    *   Allow **P2P (30333)** from `Any` (0.0.0.0/0).
    *   Allow **RPC (8545)** from `Any` (0.0.0.0/0) **ONLY IF** you need external API access. Ideally, restrict this to your specific Client IP or backend server IP.

## 2. Deployment Steps

### Method A: Using the Automated Script (Recommended)

1.  **SSH into your VM**:
    ```bash
    ssh azureuser@<YOUR_VM_IP>
    ```

2.  **Upload the Code**:
    *   You can use `scp` or `git`. If using git:
        ```bash
        git clone https://github.com/your-repo/kortana-blockchain-rust.git
        cd kortana-blockchain-rust
        ```

3.  **Run the Deployment Script**:
    ```bash
    chmod +x scripts/deploy_ubuntu.sh
    ./scripts/deploy_ubuntu.sh
    ```

    **What this script does:**
    *   Updates Ubuntu & Installs dependencies (Rust, GCC, SSL).
    *   Builds the node in `release` mode (max speed).
    *   Creates a `systemd` service (`kortanad`) so the node runs in the background and restarts if it crashes.
    *   Opens ports 30333 and 8545 in the local firewall (UFW).

## 3. Operations & Monitoring

*   **Check Status**:
    ```bash
    sudo systemctl status kortanad
    ```

*   **View Live Logs**:
    ```bash
    journalctl -u kortanad -f
    ```

*   **Stop/Start/Restart**:
    ```bash
    sudo systemctl stop kortanad
    sudo systemctl start kortanad
    sudo systemctl restart kortanad
    ```

## 4. Verification

From your local machine, test the connection to your Azure node:

```bash
# Get Balance (should be 0 for random address)
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["kn:0x1234...","latest"],"id":1}' \
  http://<YOUR_AZURE_IP>:8545
```
