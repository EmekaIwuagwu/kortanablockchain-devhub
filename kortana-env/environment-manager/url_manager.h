#pragma once
#include <string>

class URLManager {
public:
    URLManager(const std::string& domain) : domain_(domain) {}
    std::string generate_public_url(const std::string& env_id, const std::string& blockchain_name);
    int assign_rpc_port(const std::string& env_id);
    bool configure_reverse_proxy(const std::string& env_id, int port, const std::string& url);

    void set_base_port(int port) { next_port_ = port; }
    int get_next_port() const { return next_port_; }

private:
    std::string domain_;
    int next_port_ = 8545;
};
