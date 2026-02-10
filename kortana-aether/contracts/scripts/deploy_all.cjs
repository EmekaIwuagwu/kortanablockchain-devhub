const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    try {
        console.log("Starting deployment...");
        const [deployer] = await hre.ethers.getSigners();
        console.log("Deploying contracts with the account:", deployer.address);

        const feeData = await hre.ethers.provider.getFeeData();
        const gasPrice = feeData.gasPrice || 2000000000n; // Use 2 Gwei fallback
        console.log("Using Gas Price:", gasPrice.toString());

        const txConfig = {
            gasLimit: 12000000,
            gasPrice: 5000000000n // 5 Gwei
        };

        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        // 1. Deploy EscrowManager
        console.log("Deploying EscrowManager...");
        const EscrowManager = await hre.ethers.getContractFactory("EscrowManager");
        console.log("EscrowManager Bytecode Length:", EscrowManager.bytecode.length);
        const escrowManager = await EscrowManager.deploy(txConfig);
        await escrowManager.waitForDeployment();
        const escrowManagerAddress = await escrowManager.getAddress();
        console.log("EscrowManager deployed to:", escrowManagerAddress);
        await sleep(5000);

        // 2. Deploy PropertyRegistry
        console.log("Deploying PropertyRegistry...");
        const PropertyRegistry = await hre.ethers.getContractFactory("PropertyRegistry");
        console.log("PropertyRegistry Bytecode Length:", PropertyRegistry.bytecode.length);
        const propertyRegistry = await PropertyRegistry.deploy(txConfig);
        await propertyRegistry.waitForDeployment();
        const propertyRegistryAddress = await propertyRegistry.getAddress();
        console.log("PropertyRegistry deployed to:", propertyRegistryAddress);
        await sleep(5000);

        // 3. Deploy Sample Property Tokens & Register them
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
            console.log("PropertyToken Bytecode Length:", PropertyToken.bytecode.length);

            const initialSupply = hre.ethers.parseUnits(prop.totalSupply.toString(), 18);

            const token = await PropertyToken.deploy(
                prop.title,
                prop.symbol,
                initialSupply,
                deployer.address,
                prop.location,
                prop.valuationUSD,
                prop.metadataURI,
                txConfig
            );
            await token.waitForDeployment();
            const tokenAddress = await token.getAddress();
            console.log(`PropertyToken (${prop.symbol}) deployed to:`, tokenAddress);
            await sleep(2000);

            console.log(`Registering ${prop.title} in Registry...`);
            const tx = await propertyRegistry.registerProperty(
                prop.title,
                prop.location,
                prop.country,
                prop.valuationUSD,
                tokenAddress,
                prop.metadataURI,
                txConfig
            );
            await tx.wait();
            console.log(`Registered property ID: ${prop.id}`);
            await sleep(2000);

            deployedProperties.push({
                id: prop.id,
                title: prop.title,
                address: tokenAddress,
                symbol: prop.symbol
            });

            console.log(`Approving EscrowManager to spend tokens for ${prop.title}...`);
            // Approve maximum amount to avoid running out of allowance
            const maxApproval = hre.ethers.MaxUint256;
            const approveTx = await token.approve(escrowManagerAddress, maxApproval, txConfig);
            await approveTx.wait();
            console.log(`✓ EscrowManager approved for unlimited token transfers`);
            await sleep(2000);
        }

        // 4. Save deployment info for Frontend
        const deploymentInfo = {
            network: hre.network.name,
            platformAddress: deployer.address,
            escrowManager: escrowManagerAddress,
            propertyRegistry: propertyRegistryAddress,
            properties: deployedProperties,
            timestamp: new Date().toISOString()
        };

        const contractsDir = path.join(__dirname, "..", "contracts");
        const frontendDir = path.join(__dirname, "..", "..", "frontend", "src", "config");

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

        // 5. Save ABIs
        const EscrowArtifact = await hre.artifacts.readArtifact("EscrowManager");
        const PropertyTokenArtifact = await hre.artifacts.readArtifact("PropertyToken");
        const RegistryArtifact = await hre.artifacts.readArtifact("PropertyRegistry");
        const IERC20Artifact = await hre.artifacts.readArtifact("IERC20");

        const abis = {
            EscrowManager: EscrowArtifact.abi,
            PropertyToken: PropertyTokenArtifact.abi,
            PropertyRegistry: RegistryArtifact.abi,
            IERC20: IERC20Artifact.abi
        };

        fs.writeFileSync(
            path.join(frontendDir, "abis.json"),
            JSON.stringify(abis, null, 2)
        );

        console.log("Deployment complete! Config (contracts.json, abis.json) saved to frontend/src/config/");

    } catch (error) {
        console.error("DEPLOYMENT FAILED:", error);
        fs.writeFileSync("deployment_error.log", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        process.exitCode = 1;
    }
}

main();
