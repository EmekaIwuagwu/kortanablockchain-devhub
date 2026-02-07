#pragma once
#include "models.h"
#include <string>

class BlockchainDeployer {
public:
    bool clone_repository(const std::string& env_id, const std::string& repo_url);
    bool compile_blockchain(const std::string& env_id);
    bool start_blockchain(const std::string& env_id, int port);
    bool stop_blockchain(const std::string& env_id);
    std::string get_blockchain_status(const std::string& env_id);
    std::string get_blockchain_logs(const std::string& env_id, int lines);

private:
    int execute_command(const std::string& cmd);
};
