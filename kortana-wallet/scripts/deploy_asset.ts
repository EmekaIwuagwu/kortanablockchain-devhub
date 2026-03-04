import hre from "hardhat";
const { ethers, network } = hre;


async function main() {
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
