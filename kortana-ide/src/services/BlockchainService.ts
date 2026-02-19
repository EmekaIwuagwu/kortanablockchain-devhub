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
        const isElectron = typeof window.ipcRenderer !== 'undefined';

        if (typeof window.ethereum === 'undefined' || !window.ethereum) {
            if (isElectron) {
                // Proactive Redirect: Open Web IDE where MetaMask lives
                window.open('http://localhost:3000', '_blank');
                throw new Error('REDIRECTING_TO_WEB');
            }
            const msg = 'MetaMask not detected. Please install the extension.';
            alert(msg);
            throw new Error(msg);
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
            console.log(`🚀 [BlockchainService] Launching High-Compatibility Deployment...`);
            console.log(`   Account: ${address} | Balance: ${ethers.formatEther(balance)} DNR`);

            if (balance === 0n) {
                throw new Error("Insufficient balance! Please fund your account with DNR.");
            }

            // 2. Build Factory on top of the Signer
            const factory = new ethers.ContractFactory(abi, bytecode, signer);

            // 3. Smart Parameter Formatting: Kortana nodes require strict uint types
            const constructorAbi = abi.find(item => item.type === 'constructor');
            const formattedArgs = (constructorAbi?.inputs || []).map((input: any, index: number) => {
                const rawValue = (config?.args || [])[index] || "";

                // If the ABI expects a number (uint/int), enforce BigInt
                if (input.type.includes('uint') || input.type.includes('int')) {
                    const cleanVal = rawValue.toString().replace(/[^0-9]/g, '');
                    return cleanVal ? BigInt(cleanVal) : 0n;
                }
                return rawValue; // Addresses and strings remain as-is
            });

            console.log("   Final Payload Args:", formattedArgs);

            // 4. Integrated Deployment (Library-managed Transaction Handling)
            // This is the safest way to avoid 'EOF' and serialization errors.
            const contract = await factory.deploy(...formattedArgs, {
                gasLimit: BigInt(config?.gasLimit || "3000000"),
                gasPrice: ethers.parseUnits(config?.gasPrice || "20", "gwei"),
                type: 0 // COMPATIBILITY: Force Legacy (Type 0) for Kortana Node stability
            });

            console.log("   Broadcasting to Protocol...");
            const txResponse = contract.deploymentTransaction();
            if (!txResponse) throw new Error("Protocol failed to return a transaction hash.");

            console.log("✅ [BlockchainService] Atomic Success!");
            console.log(`   Pulse Hash: ${txResponse.hash}`);

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
