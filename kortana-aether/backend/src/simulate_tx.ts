import { ethers } from 'ethers';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const abis = JSON.parse(fs.readFileSync('../frontend/src/config/abis.json', 'utf8'));
const contracts = JSON.parse(fs.readFileSync('../frontend/src/config/contracts.json', 'utf8'));

async function simulate() {
    const provider = new ethers.JsonRpcProvider('https://poseidon-rpc.kortana.worchsester.xyz/');
    const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY as string, provider);

    const escrow = new ethers.Contract(contracts.escrowManager, abis.EscrowManager, wallet);

    // Modern Villa params
    const propertyToken = "0x1692Ec0372a1c95798411b7B6D6B62eEf8230592";
    const amount = 5550;

    // Matches InvestmentModal calculation
    const tokenPrice = 120; // Example
    const tokenAmount = amount / tokenPrice;
    const tokenAmountWei = ethers.parseEther(tokenAmount.toFixed(18).toString());

    const feeMultiplier = 1.01;
    const totalDinarToPay = amount * feeMultiplier;
    const totalDinarWei = ethers.parseEther(totalDinarToPay.toFixed(18).toString());

    console.log(`Simulating tx from ${wallet.address}`);
    console.log(`Seller: ${wallet.address} (Same as sender)`);
    console.log(`Token: ${propertyToken}`);
    console.log(`Token Amount Wei: ${tokenAmountWei.toString()}`);
    console.log(`Dinar Amount Wei: ${totalDinarWei.toString()}`);
    console.log(`Value: ${totalDinarWei.toString()}`);

    try {
        console.log("Attempting static call (simulation)...");
        await escrow.initiateEscrow.staticCall(
            wallet.address,
            propertyToken,
            tokenAmountWei,
            totalDinarWei,
            { value: totalDinarWei }
        );
        console.log("SUCCESS: Simulation succeeded on-chain!");
    } catch (e: any) {
        console.error("FAILURE: Simulation failed.");
        if (e.data) {
            console.error(`Error Data: ${e.data}`);
            try {
                const decoded = escrow.interface.parseError(e.data);
                console.error(`Decoded Error: ${decoded?.name} ${decoded?.args}`);
            } catch (err) {
                console.error("Could not decode error data.");
            }
        } else {
            console.error(e.message);
        }
    }
}

simulate();
