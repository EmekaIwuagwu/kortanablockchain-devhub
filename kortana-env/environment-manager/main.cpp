#include <iostream>
#include <string>
#include <vector>
#include <memory>
#include "allocator.h"
#include "deployer.h"
#include "url_manager.h"
#include <nlohmann/json.hpp>
#include "httplib.h"

using json = nlohmann::json;

int main() {
    char* domain_env = std::getenv("DOMAIN");
    std::string domain = domain_env ? domain_env : "worchsester.xyz";
    
    std::cout << "[SYSTEM] Starting Kortana Environment Manager..." << std::endl;

    auto allocator = std::make_shared<EnvironmentAllocator>();
    allocator->load_from_disk();
    auto deployer = std::make_shared<BlockchainDeployer>();
    auto url_manager = std::make_shared<URLManager>(domain);

    // Initialize next_port based on existing environments
    int max_rpc = 8545;
    int max_p2p = 30333;
    for (const auto& env : allocator->list_environments()) {
        if (env.rpc_port >= max_rpc) max_rpc = env.rpc_port + 1;
        if (env.p2p_port >= max_p2p) max_p2p = env.p2p_port + 1;
    }
    url_manager->set_base_port(max_rpc);
    url_manager->set_base_p2p_port(max_p2p);
    
    // Recovery: Restart running environments
    for (auto& env : allocator->list_environments()) {
        if (env.status == "running") {
            std::cout << "[SYSTEM] Recovering environment: " << env.env_id << " (RPC: " << env.rpc_port << ", P2P: " << env.p2p_port << ")" << std::endl;
            if (deployer->start_blockchain(env.env_id, env.rpc_port, env.p2p_port)) {
                url_manager->configure_reverse_proxy(env.env_id, env.rpc_port, env.public_url);
            } else {
                std::cerr << "[ERROR] Failed to recover environment " << env.env_id << ": " << deployer->get_last_error() << std::endl;
                env.status = "stopped";
                allocator->update_environment(env);
            }
        }
    }

    httplib::Server svr;

    svr.Post("/api/allocate", [&](const httplib::Request& req, httplib::Response& res) {
        try {
            auto j = json::parse(req.body);
            uint64_t rom = j.value("rom_gb", 2048);
            uint64_t ram = j.value("ram_gb", 32);
            std::string name = j.value("blockchain_name", "kortana");

            std::cout << "[API] Allocating environment: " << name << " (ROM: " << rom << "GB, RAM: " << ram << "GB)" << std::endl;

            auto env = allocator->allocate_environment(rom, ram, name);
            env.public_url = url_manager->generate_public_url(env.env_id, name);
            env.rpc_port = url_manager->assign_rpc_port(env.env_id);
            env.p2p_port = url_manager->assign_p2p_port(env.env_id);
            allocator->update_environment(env);

            json response = {
                {"env_id", env.env_id},
                {"status", env.status},
                {"resources", {
                    {"rom", {{"allocated_gb", rom}, {"used_gb", 0}}},
                    {"ram", {{"allocated_gb", ram}, {"used_gb", 0}}}
                }},
                {"path", env.base_path},
                {"public_url", env.public_url},
                {"created_at", env.created_at}
            };

            res.set_content(response.dump(), "application/json");
        } catch (const std::exception& e) {
            std::cerr << "[ERROR] Error in /api/allocate: " << e.what() << std::endl;
            res.status = 500;
            res.set_content("{\"error\":\"Internal server error during allocation\"}", "application/json");
        }
    });

    svr.Post("/api/deploy", [&](const httplib::Request& req, httplib::Response& res) {
        try {
            auto j = json::parse(req.body);
            std::string env_id = j.at("env_id");
            std::string repo = j.at("repo");

            std::cout << "[API] Deploying environment: " << env_id << " from " << repo << std::endl;

            bool success = deployer->clone_repository(env_id, repo);
            if (success) {
                success = deployer->compile_blockchain(env_id);
            }

            if (success) {
                auto env = allocator->get_resource_stats(env_id);
                env.status = "deployed";
                allocator->update_environment(env);
            }

            json response = {
                {"env_id", env_id},
                {"status", success ? "deployed" : "failed"},
                {"blockchain_path", "/virtual-envs/" + env_id + "/blockchain"}
            };

            if (!success) {
                response["error"] = deployer->get_last_error();
                std::cerr << "[ERROR] Deployment failed for " << env_id << ": " << deployer->get_last_error() << std::endl;
            }

            res.set_content(response.dump(), "application/json");
        } catch (const std::exception& e) {
            std::cerr << "[ERROR] JSON parse error in /api/deploy: " << e.what() << std::endl;
            res.status = 400;
            res.set_content("{\"error\":\"Invalid JSON or missing fields\"}", "application/json");
        }
    });

    svr.Post("/api/start", [&](const httplib::Request& req, httplib::Response& res) {
        try {
            auto j = json::parse(req.body);
            std::string env_id = j.at("env_id");
            int port = j.value("port", 8545);

            std::cout << "[API] Starting blockchain for environment: " << env_id << " on port " << port << std::endl;

            auto env = allocator->get_resource_stats(env_id);
            if (env.env_id.empty()) {
                res.status = 404;
                res.set_content("{\"error\":\"Environment not found\"}", "application/json");
                return;
            }

            std::string name = env.env_id; 
            
            bool success = deployer->start_blockchain(env_id, env.rpc_port, env.p2p_port);
            std::string url = url_manager->generate_public_url(env_id, name);
            url_manager->configure_reverse_proxy(env_id, env.rpc_port, url);

            if (success) {
                env.status = "running";
                env.public_url = url;
                allocator->update_environment(env);
            }

            json response = {
                {"env_id", env_id},
                {"status", success ? "running" : "failed"},
                {"rpc_endpoint", "http://localhost:" + std::to_string(port)},
                {"public_url", url}
            };

            if (!success) {
                response["error"] = deployer->get_last_error();
                std::cerr << "[ERROR] Start failed for " << env_id << ": " << deployer->get_last_error() << std::endl;
            }

            res.set_content(response.dump(), "application/json");
        } catch (const std::exception& e) {
            std::cerr << "[ERROR] JSON parse error in /api/start: " << e.what() << std::endl;
            res.status = 400;
            res.set_content("{\"error\":\"Invalid JSON or missing fields\"}", "application/json");
        }
    });

    svr.Get("/api/list", [&](const httplib::Request& req, httplib::Response& res) {
        auto environments = allocator->list_environments();
        json env_list = json::array();
        for (auto env : environments) {
            // Sync status with process manager
            std::string actual_status = deployer->get_blockchain_status(env.env_id);
            if (env.status == "running" && actual_status == "stopped") {
                env.status = "stopped";
                allocator->update_environment(env);
            }

            env_list.push_back({
                {"env_id", env.env_id},
                {"status", env.status},
                {"public_url", env.public_url},
                {"resources", {
                    {"rom", {
                        {"allocated_gb", env.allocated_rom / (1024*1024*1024)}, 
                        {"used_gb", env.used_rom / (1024*1024*1024)},
                        {"free_gb", (env.allocated_rom - env.used_rom) / (1024*1024*1024)}
                    }},
                    {"ram", {
                        {"allocated_gb", env.allocated_ram / (1024*1024*1024)}, 
                        {"used_gb", env.used_ram / (1024*1024*1024)},
                        {"free_gb", (env.allocated_ram - env.used_ram) / (1024*1024*1024)}
                    }}
                }}
            });
        }
        res.set_content(env_list.dump(), "application/json");
    });

    svr.Get(R"(/api/logs/([^/]+))", [&](const httplib::Request& req, httplib::Response& res) {
        std::string env_id = req.matches[1];
        int lines = 100;
        if (req.has_param("lines")) {
            lines = std::stoi(req.get_param_value("lines"));
        }
        
        std::string logs = deployer->get_blockchain_logs(env_id, lines);
        json response = {
            {"env_id", env_id},
            {"logs", logs}
        };
        res.set_content(response.dump(), "application/json");
    });

    svr.Get("/api/status/health", [&](const httplib::Request& req, httplib::Response& res) {
        res.set_content("{\"status\":\"ok\"}", "application/json");
    });

    svr.Get(R"(/api/status/([^/]+))", [&](const httplib::Request& req, httplib::Response& res) {
        std::string env_id = req.matches[1];
        auto env = allocator->get_resource_stats(env_id);
        
        // Sync status with process manager
        std::string actual_status = deployer->get_blockchain_status(env_id);
        if (env.status == "running" && actual_status == "stopped") {
            env.status = "stopped";
            allocator->update_environment(env);
        }

        json response = {
            {"env_id", env_id},
            {"status", env.status},
            {"resources", {
                {"rom", {{"allocated_gb", env.allocated_rom / (1024*1024*1024)}, {"used_gb", env.used_rom / (1024*1024*1024)}}},
                {"ram", {{"allocated_gb", env.allocated_ram / (1024*1024*1024)}, {"used_gb", env.used_ram / (1024*1024*1024)}}}
            }}
        };
        res.set_content(response.dump(), "application/json");
    });

    std::cout << "[SYSTEM] API Server listening on port 9000..." << std::endl;
    svr.listen("0.0.0.0", 9000);

    return 0;
}
