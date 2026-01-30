$ErrorActionPreference = "Stop"

Write-Host "=== Kortana Blockchain Node Deployment Script (Windows) ===" -ForegroundColor Green

# 1. Check for Rust
Write-Host "[1/4] Checking Rust installation..." -ForegroundColor Green
if (Get-Command cargo -ErrorAction SilentlyContinue) {
    Write-Host "Rust is already installed."
} else {
    Write-Host "Rust not found. Please install Rust from https://rustup.rs/ and restart this script." -ForegroundColor Red
    exit 1
}

# 2. Check Source Code
Write-Host "[2/4] Checking Source Code..." -ForegroundColor Green
if (-not (Test-Path "Cargo.toml")) {
    Write-Host "Error: Cargo.toml not found. Please run this script from the root of the kortana-blockchain-rust repository." -ForegroundColor Red
    exit 1
}

# 3. Build Release Binary
Write-Host "[3/4] Building Release Binary..." -ForegroundColor Green
cargo build --release
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed." -ForegroundColor Red
    exit 1
}

# 4. Run Node
Write-Host "[4/4] Starting Node..." -ForegroundColor Green
$exePath = ".\target\release\kortana-blockchain-rust.exe"

if (Test-Path $exePath) {
    Write-Host "Node binaries located at: $exePath"
    Write-Host "Starting Kortana Node..."
    Start-Process -FilePath $exePath
    Write-Host "Node is running in a separate window."
} else {
    Write-Host "Error: Binary not found at $exePath" -ForegroundColor Red
    exit 1
}

Write-Host "=== Deployment Complete! ===" -ForegroundColor Green
Write-Host "RPC Endpoint: http://127.0.0.1:8545"
