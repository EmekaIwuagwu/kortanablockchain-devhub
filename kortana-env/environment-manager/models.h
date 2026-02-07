#pragma once
#include <string>
#include <vector>
#include <cstdint>

struct VirtualEnvironment {
    std::string env_id;
    uint64_t allocated_rom;      // bytes (max 2TB)
    uint64_t allocated_ram;      // bytes (max 32GB)
    uint64_t used_rom;
    uint64_t used_ram;
    std::string base_path;
    std::string blockchain_path;
    int rpc_port;
    std::string public_url;
    std::string status;
    std::string created_at;
};
