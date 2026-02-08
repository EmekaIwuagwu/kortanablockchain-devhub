const hre = require("hardhat");

async function main() {
    const provider = hre.ethers.provider;

    const network = await provider.getNetwork();
    console.log("Network Name:", network.name);
    console.log("Chain ID:", network.chainId.toString());

    const feeData = await provider.getFeeData();
    console.log("Gas Price:", feeData.gasPrice ? hre.ethers.formatUnits(feeData.gasPrice, "gwei") + " gwei" : "N/A");
    console.log("Max Fee Per Gas:", feeData.maxFeePerGas ? hre.ethers.formatUnits(feeData.maxFeePerGas, "gwei") + " gwei" : "N/A");
    console.log("Max Priority Fee Per Gas:", feeData.maxPriorityFeePerGas ? hre.ethers.formatUnits(feeData.maxPriorityFeePerGas, "gwei") + " gwei" : "N/A");

    const [deployer] = await hre.ethers.getSigners();
    const balance = await provider.getBalance(deployer.address);
    console.log("Deployer Address:", deployer.address);
    console.log("Deployer Balance:", hre.ethers.formatEther(balance), "DNR");

    // Check block gas limit
    const latestBlock = await provider.getBlock("latest");
    console.log("Latest Block Gas Limit:", latestBlock.gasLimit.toString());

    const results = `
Network Name: ${network.name}
Chain ID: ${network.chainId.toString()}
Gas Price: ${feeData.gasPrice ? hre.ethers.formatUnits(feeData.gasPrice, "gwei") + " gwei" : "N/A"}
Max Fee Per Gas: ${feeData.maxFeePerGas ? hre.ethers.formatUnits(feeData.maxFeePerGas, "gwei") + " gwei" : "N/A"}
Max Priority Fee Per Gas: ${feeData.maxPriorityFeePerGas ? hre.ethers.formatUnits(feeData.maxPriorityFeePerGas, "gwei") + " gwei" : "N/A"}
Deployer Address: ${deployer.address}
Deployer Balance: ${hre.ethers.formatEther(balance)} DNR
Latest Block Gas Limit: ${latestBlock.gasLimit.toString()}
  `;
    console.log(results);
    const fs = require("fs");
    fs.writeFileSync("network_check.log", results);
}

main().catch((error) => {
    console.error("Verification failed:", error);
    process.exitCode = 1;
});
