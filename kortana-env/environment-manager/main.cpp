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
    auto deployer = std::make_shared<BlockchainDeployer>();
    auto url_manager = std::make_shared<URLManager>(domain);

    httplib::Server svr;

    svr.Post("/api/allocate", [&](const httplib::Request& req, httplib::Response& res) {
        auto j = json::parse(req.body);
        uint64_t rom = j.value("rom_gb", 2048);
        uint64_t ram = j.value("ram_gb", 32);
        std::string name = j.value("blockchain_name", "kortana");

        auto env = allocator->allocate_environment(rom, ram, name);
        env.public_url = url_manager->generate_public_url(env.env_id, name);
        env.rpc_port = url_manager->assign_rpc_port(env.env_id);
        allocator->update_environment(env);

        json response = {
            {"env_id", env.env_id},
            {"status", env.status},
            {"resources", {
                {"rom", {{"allocated_gb", rom}, {"used_gb", 0}}},
                {"ram", {{"allocated_gb", ram}, {"used_gb", 0}}}
            }},
            {"path", env.base_path},
            {"created_at", env.created_at}
        };

        res.set_content(response.dump(), "application/json");
    });

    svr.Post("/api/deploy", [&](const httplib::Request& req, httplib::Response& res) {
        auto j = json::parse(req.body);
        std::string env_id = j.at("env_id");
        std::string repo = j.at("repo");

        bool success = deployer->clone_repository(env_id, repo);
        if (success) {
            success = deployer->compile_blockchain(env_id);
        }

        json response = {
            {"env_id", env_id},
            {"status", success ? "deployed" : "failed"},
            {"blockchain_path", "/virtual-envs/" + env_id + "/blockchain"}
        };
        res.set_content(response.dump(), "application/json");
    });

    svr.Post("/api/start", [&](const httplib::Request& req, httplib::Response& res) {
        auto j = json::parse(req.body);
        std::string env_id = j.at("env_id");
        int port = j.value("port", 8545);

        auto env = allocator->get_resource_stats(env_id);
        std::string name = env.env_id; // Using env_id which contains the prefix
        
        bool success = deployer->start_blockchain(env_id, port);
        std::string url = url_manager->generate_public_url(env_id, name);
        url_manager->configure_reverse_proxy(env_id, port, url);

        if (success) {
            auto env = allocator->get_resource_stats(env_id);
            env.status = "running";
            allocator->update_environment(env);
        }

        json response = {
            {"env_id", env_id},
            {"status", success ? "running" : "failed"},
            {"rpc_endpoint", "http://localhost:" + std::to_string(port)},
            {"public_url", url}
        };
        res.set_content(response.dump(), "application/json");
    });

    svr.Get("/api/list", [&](const httplib::Request& req, httplib::Response& res) {
        auto environments = allocator->list_environments();
        json env_list = json::array();
        for (const auto& env : environments) {
            env_list.push_back({
                {"env_id", env.env_id},
                {"status", env.status},
                {"public_url", env.public_url}
            });
        }
        res.set_content(env_list.dump(), "application/json");
    });

    svr.Get("/api/status/health", [&](const httplib::Request& req, httplib::Response& res) {
        res.set_content("{\"status\":\"ok\"}", "application/json");
    });

    svr.Get(R"(/api/status/([^/]+))", [&](const httplib::Request& req, httplib::Response& res) {
        std::string env_id = req.matches[1];
        auto env = allocator->get_resource_stats(env_id);

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
