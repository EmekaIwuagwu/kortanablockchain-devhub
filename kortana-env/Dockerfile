# Stage 1: Build C++ Environment Manager
FROM ubuntu:22.04 as cpp-builder

RUN apt-get update && apt-get install -y \
    g++ \
    cmake \
    git \
    curl \
    nlohmann-json3-dev

WORKDIR /build
COPY environment-manager/ .
RUN g++ -O2 -std=c++17 main.cpp allocator.cpp deployer.cpp url_manager.cpp \
    -o environment-manager -lpthread

# Stage 2: Build Rust blockchain
FROM rust:latest as rust-builder

WORKDIR /build
RUN git clone https://github.com/EmekaIwuagwu/kortanablockchain-devhub.git
WORKDIR /build/kortanablockchain-devhub/kortana-blockchain-rust
RUN cargo build --release

# Stage 3: Runtime container
FROM debian:bookworm-slim

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    nginx \
    jq \
    ca-certificates \
    procps \
    g++ \
    build-essential \
    supervisor

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Copy C++ manager binary
WORKDIR /app
COPY --from=cpp-builder /build/environment-manager /app/environment-manager/environment-manager

# Copy scripts
COPY scripts/ /app/scripts/
RUN chmod +x /app/scripts/*.sh

# Copy configurations
COPY nginx/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Create directories
RUN mkdir -p /virtual-envs /data /logs /var/log/supervisor /run/nginx

# Expose ports
EXPOSE 443 80 8545 9000

# Start everything via supervisord
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
