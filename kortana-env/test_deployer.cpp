#include <iostream>
#include <string>
#include <cstdlib>
#include <unistd.h>
#include <sys/wait.h>
#include <map>

std::map<std::string, pid_t> process_map;

int execute_command(const std::string& cmd) {
    std::cout << "Executing: " << cmd << std::endl;
    return std::system(cmd.c_str());
}

bool clone_repository(const std::string& env_id, const std::string& repo_url) {
    std::string target_dir = "test-virtual-envs/" + env_id + "/blockchain";
    
    if (std::system(("[ -d " + target_dir + " ]").c_str()) == 0) {
        std::cout << "[INFO] Blockchain already exists for " << env_id << ". Skipping copy." << std::endl;
        return true;
    }

    if (std::system("[ -d test-template ]") != 0) {
        std::cout << "Template directory test-template not found." << std::endl;
        return false;
    }

    std::cout << "[INFO] Copying template to " << target_dir << "..." << std::endl;
    std::string cmd = "mkdir -p " + target_dir + " && cp -r test-template/. " + target_dir + "/ 2>&1";
    int res = execute_command(cmd);
    if (res != 0) {
        std::cout << "Failed to copy template. Exit code: " << res << std::endl;
        return false;
    }
    return true;
}

int main() {
    execute_command("mkdir -p test-template/repo-content");
    execute_command("echo 'mock binary' > test-template/binary");
    
    std::cout << "--- Test 1: First Deploy ---" << std::endl;
    clone_repository("env1", "url1");
    execute_command("ls -R test-virtual-envs/env1");

    std::cout << "\n--- Test 2: Second Deploy (Idempotency) ---" << std::endl;
    clone_repository("env1", "url1");
    execute_command("ls -R test-virtual-envs/env1");

    execute_command("rm -rf test-template test-virtual-envs");
    return 0;
}
