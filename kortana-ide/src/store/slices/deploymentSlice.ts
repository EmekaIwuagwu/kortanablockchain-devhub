import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { DeploymentConfig } from '../../types';
import { ethers } from 'ethers';
import { BlockchainService } from '../../services/BlockchainService';

interface DeploymentState {
    isDeploying: boolean;
    lastDeployment: {
        address: string;
        txHash: string;
        contractName: string;
        network: string;
        abi: any[];
    } | null;
    history: Array<{
        address: string;
        txHash: string;
        contractName: string;
        timestamp: string;
    }>;
    status: 'idle' | 'waiting-wallet' | 'processing' | 'confirmed' | 'failed';
    error: string | null;
}

const initialState: DeploymentState = {
    isDeploying: false,
    lastDeployment: null,
    history: [],
    status: 'idle',
    error: null,
};

export const deployContract = createAsyncThunk(
    'deployment/deployContract',
    async ({ config, bytecode, abi }: { config: DeploymentConfig, bytecode: string, abi: any[] }, { rejectWithValue }) => {
        try {
            const service = BlockchainService.getInstance();

            // 1. Trigger Deployment via MetaMask
            const tx = await service.deploy(bytecode, abi, {
                args: config.constructorParams,
                gasLimit: config.gasLimit,
                gasPrice: config.gasPrice
            });

            // 2. Wait for confirmation via Manual Polling (Kortana Protocol)
            // We use the RPC-provided hash for the query, ensuring we bypass hash-mismatch issues.
            const rpcHash = tx.hash;
            console.log("Waiting for confirmation from RPC Hash:", rpcHash);

            let receipt: any = null;
            let pollingAttempts = 0;
            const maxAttempts = 60; // 2 minutes with 2s intervals

            const provider = service.getProvider();
            if (!provider) throw new Error("Provider lost during deployment");

            while (!receipt && pollingAttempts < maxAttempts) {
                // Query receipt directly from provider using the Node's Hash
                receipt = await provider.getTransactionReceipt(rpcHash);

                if (!receipt) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    pollingAttempts++;
                }
            }

            if (!receipt) {
                throw new Error(`Transaction Timeout. ID: ${rpcHash}. Please check your address on the explorer.`);
            }

            console.log("Receipt received via Kortana Polling:", receipt);

            if (receipt.status === 0) {
                throw new Error(`Transaction Reverted by Node. Hash: ${rpcHash}`);
            }

            if (!receipt.contractAddress) {
                throw new Error("Transaction confirmed but no contract address generated.");
            }

            return {
                address: receipt.contractAddress,
                txHash: tx.hash,
                contractName: config.contractName,
                network: config.network,
                abi: abi,
                timestamp: new Date().toISOString()
            };
        } catch (err: any) {
            console.error('Deployment Failed:', err);
            return rejectWithValue(err.message || 'Deployment failed');
        }
    }
);

const deploymentSlice = createSlice({
    name: 'deployment',
    initialState,
    reducers: {
        resetStatus(state) {
            state.status = 'idle';
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(deployContract.pending, (state) => {
                state.isDeploying = true;
                state.status = 'processing';
            })
            .addCase(deployContract.fulfilled, (state, action) => {
                state.isDeploying = false;
                state.status = 'confirmed';
                state.lastDeployment = action.payload;
                state.history.push({
                    address: action.payload.address,
                    txHash: action.payload.txHash,
                    contractName: action.payload.contractName,
                    timestamp: action.payload.timestamp
                });
            })
            .addCase(deployContract.rejected, (state, action) => {
                state.isDeploying = false;
                state.status = 'failed';
                state.error = action.payload as string;
            });
    },
});

export const { resetStatus } = deploymentSlice.actions;
export default deploymentSlice.reducer;
