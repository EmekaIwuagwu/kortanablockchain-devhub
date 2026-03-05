const hre = require("hardhat");

async function main() {
    const { ethers, network } = hre;
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying Wrapped Asset on ${network.name} with address:`, deployer.address);

    const name = "Wrapped Kortana DNR";
    const symbol = "wDNR";

    const Asset = await ethers.getContractFactory("KortanaWrappedAsset");
    const asset = await Asset.deploy(name, symbol);

    await asset.waitForDeployment();
    const address = await asset.getAddress();

    console.log(`KortanaWrappedAsset (wDNR) deployed to: ${address} on ${network.name}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
