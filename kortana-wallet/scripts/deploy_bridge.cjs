const hre = require("hardhat");

async function main() {
    const { ethers, network } = hre;
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying KortanaBridge on ${network.name} with address:`, deployer.address);

    const Bridge = await ethers.getContractFactory("KortanaBridge");
    const bridge = await Bridge.deploy();

    await bridge.waitForDeployment();
    const address = await bridge.getAddress();

    console.log(`KortanaBridge deployed to: ${address} on ${network.name}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
