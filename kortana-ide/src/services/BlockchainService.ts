import { ethers } from 'ethers';
import { IDE_CONFIG } from '../config';

const KORTANA_TESTNET = IDE_CONFIG.NETWORKS.POSEIDON;

export class BlockchainService {
    private static instance: BlockchainService;
    private browserProvider: ethers.BrowserProvider | null = null;
    private customSigner: ethers.Wallet | null = null;
    private rpcProvider: ethers.JsonRpcProvider | null = null;

    private constructor() { }

    public static getInstance(): BlockchainService {
        if (!BlockchainService.instance) {
            BlockchainService.instance = new BlockchainService();
        }
        return BlockchainService.instance;
    }

    public async connectWallet(): Promise<string> {
        if (typeof window.ethereum === 'undefined' || !window.ethereum) {
            throw new Error('MetaMask is not available. Please use Private Key connection for Desktop App.');
        }

        try {
            this.browserProvider = new ethers.BrowserProvider(window.ethereum, {
                chainId: parseInt(KORTANA_TESTNET.chainId, 16),
                name: 'Kortana Testnet'
            });

            this.browserProvider.pollingInterval = 15000;

            const accounts = await this.browserProvider.send("eth_requestAccounts", []);
            await this.ensureKortanaNetwork();

            this.customSigner = null;
            return accounts[0];
        } catch (error: any) {
            console.error('Wallet connection error:', error);
            throw new Error(error.message || 'Failed to connect wallet');
        }
    }

    public async connectWithPrivateKey(privateKey: string): Promise<string> {
        try {
            this.rpcProvider = new ethers.JsonRpcProvider(KORTANA_TESTNET.rpcUrls[0], {
                chainId: parseInt(KORTANA_TESTNET.chainId, 16),
                name: 'Kortana Testnet'
            });

            this.customSigner = new ethers.Wallet(privateKey, this.rpcProvider);
            this.browserProvider = null;

            return this.customSigner.address;
        } catch (error: any) {
            console.error('Private Key connection error:', error);
            throw new Error('Invalid Private Key or RPC unreachable.');
        }
    }

    private async ensureKortanaNetwork() {
        if (!window.ethereum) return;

        try {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [KORTANA_TESTNET],
            });

            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: KORTANA_TESTNET.chainId }],
            });
            console.log("Network synchronized with:", KORTANA_TESTNET.rpcUrls[0]);
        } catch (error: any) {
            console.error("Network Sync Error:", error);
            if (error.code !== 4001) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: KORTANA_TESTNET.chainId }],
                    });
                } catch (e) {
                    throw new Error('Could not enforce Kortana Network settings.');
                }
            }
        }
    }

    public async deploy(bytecode: string, abi: any[], config?: { gasLimit: string, gasPrice: string, args: any[] }): Promise<ethers.ContractTransactionResponse> {
        const signer = this.customSigner || (this.browserProvider ? await this.browserProvider.getSigner() : null);

        if (!signer) {
            throw new Error('No wallet connected. Please connect via Private Key or MetaMask.');
        }

        console.log("🚀 [BlockchainService] Starting deployment...");
        console.log("   Target RPC:", KORTANA_TESTNET.rpcUrls[0]);

        try {
            // 1. Check balance first
            const address = await signer.getAddress();
            const provider = signer.provider;
            if (!provider) throw new Error("No provider available");

            const balance = await provider.getBalance(address);
            console.log(`   Deployer: ${address}`);
            console.log(`   Balance: ${ethers.formatEther(balance)} DNR`);

            if (balance === 0n) {
                throw new Error("Insufficient balance! Please fund your account with DNR.");
            }

            // 2. Prepare constructor arguments and deployment data
            const args = config?.args || [];
            const factory = new ethers.ContractFactory(abi, bytecode);
            const deployTx = await factory.getDeployTransaction(...args);

            // 3. Get current network state
            const nonce = await provider.getTransactionCount(address);
            console.log(`   Nonce: ${nonce}`);

            // 4. Build Legacy (Type 0) transaction with safe defaults
            const gasLimit = config?.gasLimit || "500000"; // Conservative default
            const gasPrice = config?.gasPrice || "1"; // 1 Gwei for testnet

            const txRequest: any = {
                type: 0, // CRITICAL: Legacy transaction
                data: deployTx.data,
                gasLimit: parseInt(gasLimit),
                gasPrice: ethers.parseUnits(gasPrice, "gwei"),
                nonce: nonce,
                chainId: parseInt(KORTANA_TESTNET.chainId, 16)
            };

            console.log(`   Gas Limit: ${gasLimit}`);
            console.log(`   Gas Price: ${gasPrice} Gwei`);
            console.log("   Broadcasting...");

            // 5. Sign and broadcast
            const txResponse = await signer.sendTransaction(txRequest);

            console.log("✅ [BlockchainService] Transaction broadcasted!");
            console.log(`   RPC Hash: ${txResponse.hash}`);

            return txResponse as ethers.ContractTransactionResponse;

        } catch (error: any) {
            console.error('❌ [BlockchainService] Deployment error:', error);

            if (error.message.includes('insufficient funds')) {
                throw new Error('Insufficient DNR balance. Please fund your account.');
            }
            if (error.message.includes('reverted')) {
                throw new Error('Contract constructor reverted. Check your logic.');
            }

            throw new Error(error.message || 'Deployment failed.');
        }
    }

    public getProvider() {
        return this.rpcProvider || this.browserProvider;
    }
}
