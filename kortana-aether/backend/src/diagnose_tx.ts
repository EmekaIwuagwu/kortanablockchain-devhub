import { ethers } from 'ethers';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const abis = JSON.parse(fs.readFileSync('../frontend/src/config/abis.json', 'utf8'));
const contracts = JSON.parse(fs.readFileSync('../frontend/src/config/contracts.json', 'utf8'));

async function diagnose() {
    const rpcUrl = process.env.KORTANA_RPC_URL || 'https://poseidon-rpc.kortana.worchsester.xyz/';
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // Using admin key to test
    const privateKey = process.env.ADMIN_PRIVATE_KEY as string;
    const wallet = new ethers.Wallet(privateKey, provider);

    const escrowAddress = contracts.escrowManager;
    const escrowContract = new ethers.Contract(escrowAddress, abis.EscrowManager, wallet);

    console.log(`Diagnosing from wallet: ${wallet.address}`);
    console.log(`Escrow Manager: ${escrowAddress}`);

    const balance = await provider.getBalance(wallet.address);
    console.log(`Wallet Balance: ${ethers.formatEther(balance)} DNR`);

    // Test Parameters (MVC Villa)
    const propertyToken = "0x1692Ec0372a1c95798411b7B6D6B62eEf8230592";
    const seller = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Test fallback used in modal
    const amountDNR = 5000;
    const amountWei = ethers.parseEther(amountDNR.toString());

    // Token amount (MVC is 1200000 USD, 10000 tokens) -> 120 USD/token
    // If MVC token price in DNR is say 100 DNR
    const tokenAmount = 50;
    const tokenAmountWei = ethers.parseUnits(tokenAmount.toString(), 18);

    console.log("--- SIMULATING TRANSACTION ---");
    try {
        // Try static call first to see why it fails
        const result = await escrowContract.initiateEscrow.staticCall(
            seller,
            propertyToken,
            tokenAmountWei,
            amountWei,
            { value: amountWei }
        );
        console.log("Static call SUCCEEDED. Escrow ID result:", result.toString());
    } catch (error: any) {
        console.error("Static call FAILED.");
        if (error.code === 'CALL_EXCEPTION') {
            console.error("Revert Reason:", error.reason);
            console.error("Error signature:", error.signature);
            console.error("Error data:", error.data);

            if (error.data && error.data !== '0x') {
                try {
                    const decoded = escrowContract.interface.parseError(error.data);
                    console.error("Decoded error:", decoded?.name, decoded?.args);
                } catch (e) {
                    console.error("Could not decode error data with ABI.");
                }
            }
        } else {
            console.error(error.message || error);
        }
    }
}

diagnose();
