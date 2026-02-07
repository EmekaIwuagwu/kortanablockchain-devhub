#include "url_manager.h"
#include <iostream>
#include <cstdlib>

std::string URLManager::generate_public_url(const std::string& env_id, const std::string& blockchain_name) {
    // Format: https://name-rpc.kortana.worchsester.xyz/
    return "https://" + blockchain_name + "-rpc.kortana." + domain_;
}

int URLManager::assign_rpc_port(const std::string& env_id) {
    // Basic port assignment logic
    return next_port_++;
}

bool URLManager::configure_reverse_proxy(const std::string& env_id, int port, const std::string& url) {
    std::string cmd = "/app/scripts/configure-nginx.sh " + url + " " + std::to_string(port);
    return std::system(cmd.c_str()) == 0;
}
