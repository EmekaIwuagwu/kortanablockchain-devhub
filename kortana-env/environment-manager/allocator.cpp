#include "allocator.h"
#include <chrono>
#include <iomanip>
#include <sstream>
#include <random>

VirtualEnvironment EnvironmentAllocator::allocate_environment(uint64_t rom_gb, uint64_t ram_gb, const std::string& blockchain_name) {
    std::lock_guard<std::mutex> lock(mutex_);
    
    VirtualEnvironment env;
    env.env_id = generate_id(blockchain_name + "-testnet");
    env.allocated_rom = rom_gb * 1024ULL * 1024ULL * 1024ULL;
    env.allocated_ram = ram_gb * 1024ULL * 1024ULL * 1024ULL;
    env.used_rom = 0;
    env.used_ram = 0;
    env.base_path = "/virtual-envs/" + env.env_id;
    env.blockchain_path = env.base_path + "/blockchain";
    env.status = "allocated";
    
    auto now = std::chrono::system_clock::now();
    auto in_time_t = std::chrono::system_clock::to_time_t(now);
    std::stringstream ss;
    ss << std::put_time(std::gmtime(&in_time_t), "%FT%TZ");
    env.created_at = ss.str();
    
    environments_[env.env_id] = env;
    return env;
}

bool EnvironmentAllocator::deallocate_environment(const std::string& env_id) {
    std::lock_guard<std::mutex> lock(mutex_);
    return environments_.erase(env_id) > 0;
}

VirtualEnvironment EnvironmentAllocator::get_resource_stats(const std::string& env_id) {
    std::lock_guard<std::mutex> lock(mutex_);
    if (environments_.count(env_id)) {
        // Simulate some usage growth for demo purposes
        environments_[env_id].used_rom += 1024 * 1024 * 10; // +10MB
        return environments_[env_id];
    }
    return {};
}

std::vector<VirtualEnvironment> EnvironmentAllocator::list_environments() {
    std::lock_guard<std::mutex> lock(mutex_);
    std::vector<VirtualEnvironment> list;
    for (const auto& [id, env] : environments_) {
        list.push_back(env);
    }
    return list;
}

bool EnvironmentAllocator::validate_quota(const std::string& env_id, uint64_t required_space_bytes) {
    std::lock_guard<std::mutex> lock(mutex_);
    if (environments_.count(env_id)) {
        return (environments_[env_id].used_rom + required_space_bytes) <= environments_[env_id].allocated_rom;
    }
    return false;
}

std::string EnvironmentAllocator::generate_id(const std::string& prefix) {
    static std::random_device rd;
    static std::mt19937 gen(rd());
    static std::uniform_int_distribution<> dis(100, 999);
    return prefix + "-" + std::to_string(dis(gen));
}
