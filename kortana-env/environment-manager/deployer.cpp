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
    std::string target_dir = "/virtual-envs/" + env_id + "/blockchain";
    
    // Check if already exists
    if (std::system(("[ -d " + target_dir + " ]").c_str()) == 0) {
        std::cout << "[INFO] Blockchain already exists for " << env_id << ". Skipping copy." << std::endl;
        return true;
    }

    if (std::system("[ -d /app/blockchain-template ]") != 0) {
        last_error_ = "Template directory /app/blockchain-template not found.";
        return false;
    }

    std::cout << "[INFO] Copying template to " << target_dir << "..." << std::endl;
    // Use . to copy contents and avoid nested directory
    std::string cmd = "mkdir -p " + target_dir + " && cp -r /app/blockchain-template/. " + target_dir + "/ 2>&1";
    int res = execute_command(cmd);
    if (res != 0) {
        last_error_ = "Failed to copy template. Exit code: " + std::to_string(res);
        return false;
    }
    return true;
}

bool BlockchainDeployer::compile_blockchain(const std::string& env_id) {
    std::string binary_path = "/virtual-envs/" + env_id + "/blockchain/kortana-blockchain-rust/target/release/kortana-blockchain-rust";
    
    // Ensure the binary is executable
    std::cout << "[INFO] Setting execution permissions for " << binary_path << std::endl;
    execute_command("chmod +x " + binary_path);

    // Pre-flight check: Verify all Linux libraries are linked
    std::cout << "[INFO] Verifying library links for " << binary_path << " (ldd check)..." << std::endl;
    std::string check_cmd = "ldd " + binary_path + " 2>&1";
    int check_res = execute_command(check_cmd);
    if (check_res != 0) {
        last_error_ = "Missing Linux libraries or dynamic linker error. Check system dependencies.";
        return false;
    }

    std::string cmd = "[ -f " + binary_path + " ]";
    if (execute_command(cmd) != 0) {
        last_error_ = "Blockchain binary not found at " + binary_path;
        return false;
    }
    return true;
}

bool BlockchainDeployer::start_blockchain(const std::string& env_id, int port) {
    if (get_blockchain_status(env_id) == "running") {
        std::cout << "[INFO] Blockchain already running for " << env_id << std::endl;
        return true;
    }

    std::string log_file = "/logs/" + env_id + ".log";
    std::string binary_path = "/virtual-envs/" + env_id + "/blockchain/kortana-blockchain-rust/target/release/kortana-blockchain-rust";
    std::string data_dir = "/virtual-envs/" + env_id + "/data";
    
    execute_command("mkdir -p " + data_dir);

    std::cout << "[INFO] Forking process for " << env_id << " on port " << port << "..." << std::endl;
    pid_t pid = fork();
    if (pid == 0) {
        std::string work_dir = "/virtual-envs/" + env_id + "/blockchain/kortana-blockchain-rust";
        // Correcting arguments: 
        // 1. --testnet -> not supported (node IS testnet by default). 
        // 2. --port -> should be --rpc-addr. 
        // 3. --data-dir -> hardcoded in node to ./data/.
        // 4. --log-level -> not supported.
        std::string cmd = "cd " + work_dir + " && mkdir -p data && " + binary_path + " --rpc-addr 0.0.0.0:" + std::to_string(port) + " > " + log_file + " 2>&1";
        execl("/bin/sh", "sh", "-c", cmd.c_str(), (char *)NULL);
        exit(1);
    } else if (pid > 0) {
        process_map[env_id] = pid;
        return true;
    }
    last_error_ = "Fork failed";
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
