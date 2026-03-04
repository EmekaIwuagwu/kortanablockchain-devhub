import hre from "hardhat";
const { ethers } = hre;


async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying KortanaBridge with address:", deployer.address);

    const Bridge = await ethers.getContractFactory("KortanaBridge");
    const bridge = await Bridge.deploy();

    await bridge.waitForDeployment();
    const address = await bridge.getAddress();

    console.log("KortanaBridge deployed to:", address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
