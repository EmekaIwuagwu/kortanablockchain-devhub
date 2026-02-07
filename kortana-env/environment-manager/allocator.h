#pragma once
#include "models.h"
#include <map>
#include <memory>
#include <mutex>

class EnvironmentAllocator {
public:
    VirtualEnvironment allocate_environment(uint64_t rom_gb, uint64_t ram_gb, const std::string& blockchain_name);
    bool deallocate_environment(const std::string& env_id);
    VirtualEnvironment get_resource_stats(const std::string& env_id);
    std::vector<VirtualEnvironment> list_environments();
    bool validate_quota(const std::string& env_id, uint64_t required_space_bytes);

private:
    std::map<std::string, VirtualEnvironment> environments_;
    std::mutex mutex_;
    std::string generate_id(const std::string& prefix);
};
