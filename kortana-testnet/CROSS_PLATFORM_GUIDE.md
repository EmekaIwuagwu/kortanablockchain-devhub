# Kortana Blockchain Node: Cross-Platform Deployment Guide

As a Senior Blockchain Engineer, I've ensured that the **Kortana Blockchain Node** is fully compatible with both **Windows** and **Linux** environments. This guide outlines the architectural considerations and steps to deploy the node across different operating systems.

## 🛠 Architectural Strategy

The node is built using **Rust**, which provides excellent cross-platform primitives. We've optimized the following areas for total compatibility:

1.  **I/O & Networking**: Utilizing `tokio` and `libp2p`, which handle OS-specific networking stacks (IOCP on Windows, epoll on Linux) transparently.
2.  **Storage**: The `sled` database engine is used for high-performance, platform-agnostic key-value storage.
3.  **Path Handling**: File paths are handled using Rust's `PathBuf` to ensure directory separators and volume prefixes are managed correctly on both systems.
4.  **Logging**: ANSI color codes are utilized for rich logging, supported by modern Windows Terminal and standard Linux TTYs.

---

## 🐧 Linux Deployment (Ubuntu/Debian)

### Prerequisites
- Build Essentials: `sudo apt update && sudo apt install build-essential pkg-config libssl-dev`
- Rust Toolchain: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`

### Automated Setup
We provide a dedicated bash script for Linux environments:
```bash
chmod +x scripts/deploy_ubuntu.sh
./scripts/deploy_ubuntu.sh
```

### Manual Build
```bash
cargo build --release
./target/release/kortana-blockchain-rust
```

---

## 🪟 Windows Deployment

### Prerequisites
- **Visual Studio Build Tools**: Ensure the "Desktop development with C++" workload is installed.
- **Rust Toolchain**: Install via [rustup.rs](https://rustup.rs/).
- **Terminal**: Use **Windows Terminal** or PowerShell for the best experience (ANSI color support).

### Automated Setup
We provide a PowerShell script optimized for the Windows environment:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
.\scripts\deploy_windows.ps1
```

### Manual Build
```powershell
cargo build --release
.\target\release\kortana-blockchain-rust.exe
```

---

## 🐳 Docker (Platform Agnostic)

For environments where you want to abstract the OS entirely:

```bash
docker-compose up --build
```

---

## ⚙️ Configuration
The node uses environment variables or a `.env` file. These work identically across platforms:

- `RPC_ADDR`: Defaults to `0.0.0.0:8545`
- `P2P_ADDR`: Defaults to `/ip4/0.0.0.0/tcp/30333`
- `DB_PATH`: Defaults to `data/kortana.db`

## 👨‍💻 Engineer's Note
When deploying on Windows, ensure your firewall permits traffic on ports `8545` (RPC) and `30333` (P2P). On Linux, check your `ufw` or `iptables` settings. The node has been stress-tested to ensure thread safety and memory efficiency across both `x86_64` and `AArch64` architectures.
