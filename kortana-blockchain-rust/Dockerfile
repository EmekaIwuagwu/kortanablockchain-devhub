# Build Stage
FROM rust:latest as builder
WORKDIR /usr/src/kortana

# Copy source code
COPY . .

# Build release binary
RUN cargo build --release

# Runtime Stage
FROM debian:bookworm-slim
WORKDIR /app

# Install SSL certs for HTTPS/API calls if needed elsewhere
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy binary from builder
COPY --from=builder /usr/src/kortana/target/release/kortana-blockchain-rust /usr/local/bin/kortana

# Expose RPC and P2P ports
EXPOSE 8545 30333

# Create data directory
RUN mkdir -p /app/data

# Run the node
ENTRYPOINT ["kortana"]
