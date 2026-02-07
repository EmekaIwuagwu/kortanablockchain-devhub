#include "deployer.h"
#include <iostream>
#include <cstdlib>
#include <fstream>
#include <sstream>
#include <unistd.h>
#include <signal.h>
#include <sys/wait.h>
#include <map>

std::map<std::string, pid_t> process_map;

int BlockchainDeployer::execute_command(const std::string& cmd) {
    return std::system(cmd.c_str());
}

bool BlockchainDeployer::clone_repository(const std::string& env_id, const std::string& repo_url) {
    if (std::system("[ -d /app/blockchain-template ]") != 0) {
        last_error_ = "Template directory /app/blockchain-template not found.";
        return false;
    }

    std::string cmd = "mkdir -p /virtual-envs/" + env_id + " && cp -r /app/blockchain-template /virtual-envs/" + env_id + "/blockchain 2>&1";
    int res = execute_command(cmd);
    if (res != 0) {
        last_error_ = "Failed to copy template to /virtual-envs/" + env_id + "/blockchain. Exit code: " + std::to_string(res);
        return false;
    }
    return true;
}

bool BlockchainDeployer::compile_blockchain(const std::string& env_id) {
    std::string binary_path = "/virtual-envs/" + env_id + "/blockchain/kortana-blockchain-rust/target/release/kortana-blockchain";
    std::string cmd = "[ -f " + binary_path + " ]";
    if (execute_command(cmd) != 0) {
        last_error_ = "Blockchain binary not found at " + binary_path;
        return false;
    }
    return true;
}

bool BlockchainDeployer::start_blockchain(const std::string& env_id, int port) {
    std::string log_file = "/logs/" + env_id + ".log";
    std::string binary_path = "/virtual-envs/" + env_id + "/blockchain/kortana-blockchain-rust/target/release/kortana-blockchain";
    std::string data_dir = "/virtual-envs/" + env_id + "/data";
    
    execute_command("mkdir -p " + data_dir);

    pid_t pid = fork();
    if (pid == 0) {
        std::string cmd = binary_path + " --testnet --port " + std::to_string(port) + " --data-dir " + data_dir + " --log-level debug > " + log_file + " 2>&1";
        execl("/bin/sh", "sh", "-c", cmd.c_str(), (char *)NULL);
        exit(1);
    } else if (pid > 0) {
        process_map[env_id] = pid;
        return true;
    }
    return false;
}

bool BlockchainDeployer::stop_blockchain(const std::string& env_id) {
    if (process_map.count(env_id)) {
        kill(process_map[env_id], SIGTERM);
        process_map.erase(env_id);
        return true;
    }
    return false;
}

std::string BlockchainDeployer::get_blockchain_status(const std::string& env_id) {
    if (process_map.count(env_id)) {
        int status;
        pid_t result = waitpid(process_map[env_id], &status, WNOHANG);
        if (result == 0) return "running";
        process_map.erase(env_id);
    }
    return "stopped"; 
}

std::string BlockchainDeployer::get_blockchain_logs(const std::string& env_id, int lines) {
    std::string log_file = "/logs/" + env_id + ".log";
    std::string cmd = "tail -n " + std::to_string(lines) + " " + log_file + " > /tmp/last_logs.txt";
    execute_command(cmd);
    
    std::ifstream ifs("/tmp/last_logs.txt");
    std::stringstream ss;
    ss << ifs.rdbuf();
    return ss.str();
}
