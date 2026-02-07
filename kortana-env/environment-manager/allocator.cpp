#include "allocator.h"
#include <chrono>
#include <iomanip>
#include <sstream>
#include <random>
#include <fstream> // Added for file operations
#include "nlohmann/json.hpp" // Assuming nlohmann/json is used, based on `json j = json::array();`

using json = nlohmann::json; // Assuming this alias is needed

void EnvironmentAllocator::save_to_disk() {
    json j = json::array();
    for (const auto& pair : environments_) {
        const auto& env = pair.second;
        j.push_back({
            {"env_id", env.env_id},
            {"status", env.status},
            {"allocated_rom", env.allocated_rom},
            {"allocated_ram", env.allocated_ram},
            {"used_rom", env.used_rom},
            {"used_ram", env.used_ram},
            {"base_path", env.base_path},
            {"created_at", env.created_at},
            {"public_url", env.public_url},
            {"rpc_port", env.rpc_port},
            {"p2p_port", env.p2p_port}
        });
    }
    std::ofstream file("/data/environments.json");
    if (file.is_open()) { // Added check for file open
        file << j.dump(4);
    }
}

void EnvironmentAllocator::load_from_disk() {
    std::ifstream file("/data/environments.json");
    if (!file.is_open()) return;
    json j;
    try { // Added try-catch for robust JSON parsing
        file >> j;
        if (!j.is_array()) return; // Ensure it's an array
        for (const auto& item : j) {
            VirtualEnvironment env;
            // Use .value() with default for optional fields or .at() for mandatory
            env.env_id = item.at("env_id").get<std::string>();
            env.status = item.at("status").get<std::string>();
            env.allocated_rom = item.at("allocated_rom").get<uint64_t>();
            env.allocated_ram = item.at("allocated_ram").get<uint64_t>();
            env.used_rom = item.at("used_rom").get<uint64_t>();
            env.used_ram = item.at("used_ram").get<uint64_t>();
            env.base_path = item.at("base_path").get<std::string>();
            env.created_at = item.at("created_at").get<std::string>();
            env.public_url = item.value("public_url", ""); // Use value for optional fields
            env.rpc_port = item.value("rpc_port", 0); // Use value for optional fields
            env.p2p_port = item.value("p2p_port", 0);
            environments_[env.env_id] = env;
        }
    } catch (const json::exception& e) {
        // Log error or handle malformed JSON
        std::cerr << "Error parsing environments.json: " << e.what() << std::endl;
    }
}

VirtualEnvironment EnvironmentAllocator::allocate_environment(uint64_t rom_gb, uint64_t ram_gb, const std::string& blockchain_name) {
    std::lock_guard<std::mutex> lock(mutex_);
    
    VirtualEnvironment env;
    env.env_id = blockchain_name.empty() ? generate_id("kortana") : blockchain_name;
    
    // If ID already exists, append a random number
    if (environments_.count(env.env_id)) {
        env.env_id = generate_id(blockchain_name);
    }
    env.allocated_rom = rom_gb * 1024ULL * 1024ULL * 1024ULL;
    env.allocated_ram = ram_gb * 1024ULL * 1024ULL * 1024ULL;
    env.used_rom = 0;
    env.used_ram = 0;
    env.status = "allocated";
    env.base_path = "/virtual-envs/" + env.env_id;
    // The original blockchain_path assignment is removed as per the instruction's implied change
    // The original created_at generation is replaced by a hardcoded value
    env.created_at = "2026-02-07"; // Hardcoded for simplicity
    
    environments_[env.env_id] = env;
    save_to_disk(); // Auto-save after allocation
    return env;
}

bool EnvironmentAllocator::deallocate_environment(const std::string& env_id) {
    std::lock_guard<std::mutex> lock(mutex_);
    bool erased = environments_.erase(env_id) > 0;
    if (erased) {
        save_to_disk(); // Auto-save after deallocation
    }
    return erased;
}

void EnvironmentAllocator::update_environment(const VirtualEnvironment& env) {
    std::lock_guard<std::mutex> lock(mutex_);
    if (environments_.count(env.env_id)) {
        environments_[env.env_id] = env;
        save_to_disk(); // Auto-save after update
    }
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
