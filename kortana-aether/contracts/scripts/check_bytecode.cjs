const hre = require("hardhat");
const fs = require("fs");

async function main() {
    const contracts = ["EscrowManager", "PropertyRegistry", "PropertyToken", "RentalDistribution", "SimpleToken"];
    let log = "";
    for (const name of contracts) {
        const factory = await hre.ethers.getContractFactory(name);
        log += `${name}: ${factory.bytecode.length} bytes\n`;
    }
    fs.writeFileSync("bytecode_lengths.log", log);
}

main().catch(console.error);
