const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("Starting deployment...");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // 1. Deploy EscrowManager
    const EscrowManager = await hre.ethers.getContractFactory("EscrowManager");
    const escrowManager = await EscrowManager.deploy();
    await escrowManager.waitForDeployment();
    const escrowManagerAddress = await escrowManager.getAddress();
    console.log("EscrowManager deployed to:", escrowManagerAddress);

    // 2. Deploy PropertyRegistry
    const PropertyRegistry = await hre.ethers.getContractFactory("PropertyRegistry");
    const propertyRegistry = await PropertyRegistry.deploy();
    await propertyRegistry.waitForDeployment();
    const propertyRegistryAddress = await propertyRegistry.getAddress();
    console.log("PropertyRegistry deployed to:", propertyRegistryAddress);

    // 3. Deploy Sample Property Tokens & Register them
    // We'll deploy tokens for the first 3 properties from our mock data
    const mockProperties = [
        {
            id: 1,
            title: "Modern Villa in Cascais",
            symbol: "MVC",
            location: "Cascais, Portugal",
            country: "Portugal",
            valuationUSD: 1200000,
            totalSupply: 10000,
            metadataURI: "ipfs://QmCascaisVilla"
        },
        {
            id: 2,
            title: "Acropolis View Apartment",
            symbol: "AVA",
            location: "Athens, Greece",
            country: "Greece",
            valuationUSD: 450000,
            totalSupply: 5000,
            metadataURI: "ipfs://QmAthensApt"
        },
        {
            id: 3,
            title: "Adriatic Coastal Suite",
            symbol: "ACS",
            location: "Budva, Montenegro",
            country: "Montenegro",
            valuationUSD: 750000,
            totalSupply: 7500,
            metadataURI: "ipfs://QmBudvaSuite"
        }
    ];

    const deployedProperties = [];

    for (const prop of mockProperties) {
        console.log(`Deploying token for ${prop.title}...`);
        const PropertyToken = await hre.ethers.getContractFactory("PropertyToken");

        // Convert totalSupply to wei-like units (assuming 18 decimals)
        const initialSupply = hre.ethers.parseUnits(prop.totalSupply.toString(), 18);

        const token = await PropertyToken.deploy(
            prop.title,
            prop.symbol,
            initialSupply,
            deployer.address, // owner
            prop.location,
            prop.valuationUSD,
            prop.metadataURI
        );
        await token.waitForDeployment();
        const tokenAddress = await token.getAddress();
        console.log(`PropertyToken (${prop.symbol}) deployed to:`, tokenAddress);

        // Register property in Registry
        console.log(`Registering ${prop.title} in Registry...`);
        const tx = await propertyRegistry.registerProperty(
            prop.title,
            prop.location,
            prop.country,
            prop.valuationUSD,
            tokenAddress,
            prop.metadataURI
        );
        await tx.wait();
        console.log(`Registered property ID: ${prop.id}`);

        deployedProperties.push({
            id: prop.id,
            title: prop.title,
            address: tokenAddress,
            symbol: prop.symbol
        });
    }

    // 4. Save deployment info for Frontend
    const deploymentInfo = {
        network: hre.network.name,
        escrowManager: escrowManagerAddress,
        propertyRegistry: propertyRegistryAddress,
        properties: deployedProperties,
        timestamp: new Date().toISOString()
    };

    const contractsDir = path.join(__dirname, "..", "contracts");
    const frontendDir = path.join(__dirname, "..", "..", "frontend", "src", "config");

    // Ensure frontend config dir exists
    if (!fs.existsSync(frontendDir)) {
        fs.mkdirSync(frontendDir, { recursive: true });
    }

    fs.writeFileSync(
        path.join(contractsDir, "deployed_addresses.json"),
        JSON.stringify(deploymentInfo, null, 2)
    );

    fs.writeFileSync(
        path.join(frontendDir, "contracts.json"),
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("Deployment complete! Config saved to frontend/src/config/contracts.json");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
