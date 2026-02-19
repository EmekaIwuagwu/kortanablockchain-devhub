import { ethers } from 'ethers';
import { IDE_CONFIG } from '../config';

const KORTANA_TESTNET = IDE_CONFIG.NETWORKS.POSEIDON;
const CHAIN_ID = parseInt(KORTANA_TESTNET.chainId, 16); // 72511

/**
 * BlockchainService — Kortana Protocol Adapter
 *
 * After the long-term blockchain fix (adding baseFeePerGas to block responses),
 * MetaMask now correctly identifies Kortana as an EIP-1559 chain and sends
 * proper Type-2 transactions which the node's existing decoder handles.
 *
 * The deploy() method now works seamlessly with MetaMask OR a private key.
 */
export class BlockchainService {
    private static instance: BlockchainService;
    private browserProvider: ethers.BrowserProvider | null = null;
    private customSigner: ethers.Wallet | null = null;
    private rpcProvider: ethers.JsonRpcProvider;

    private constructor() {
        // Always maintain a direct RPC connection
        this.rpcProvider = new ethers.JsonRpcProvider(KORTANA_TESTNET.rpcUrls[0], {
            chainId: CHAIN_ID,
            name: 'Kortana Testnet'
        });
    }

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
                window.open('http://localhost:3000', '_blank');
                throw new Error('REDIRECTING_TO_WEB');
            }
            const msg = 'MetaMask not detected. Please install the extension.';
            alert(msg);
            throw new Error(msg);
        }

        try {
            this.browserProvider = new ethers.BrowserProvider(window.ethereum);
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
            console.log("Network synchronized with Kortana Testnet");
        } catch (error: any) {
            if (error.code !== 4001) {
                console.warn("Network switch warning:", error.message);
            }
        }
    }

    /**
     * Deploy a smart contract.
     * Works with both MetaMask (EIP-1559) and Private Key (Legacy) connections.
     * The Kortana node now handles both transaction types after the blockchain fix.
     */
    public async deploy(
        bytecode: string,
        abi: any[],
        config?: { gasLimit: string; gasPrice: string; args: any[] }
    ): Promise<ethers.ContractTransactionResponse> {

        console.log("🚀 [BlockchainService] Starting Kortana deployment...");

        // Determine signer: prefer customSigner (private key), fall back to MetaMask
        const signer = this.customSigner ||
            (this.browserProvider ? await this.browserProvider.getSigner() : null);

        if (!signer) {
            throw new Error('No wallet connected. Please connect via MetaMask or Private Key first.');
        }

        const deployerAddress = await signer.getAddress();
        const provider = signer.provider ?? this.rpcProvider;

        // 1. Balance check
        const balance = await provider.getBalance(deployerAddress);
        console.log(`   Deployer: ${deployerAddress}`);
        console.log(`   Balance: ${ethers.formatEther(balance)} DNR`);

        if (balance === 0n) {
            throw new Error("Insufficient balance! Your account has 0 DNR. Please fund it before deploying.");
        }

        // 2. Parse constructor arguments with correct types
        const constructorAbi = abi.find((item: any) => item.type === 'constructor');
        const formattedArgs = (constructorAbi?.inputs || []).map((input: any, index: number) => {
            const rawValue = (config?.args || [])[index] ?? "";
            if (input.type.startsWith('uint') || input.type.startsWith('int')) {
                const cleanVal = rawValue.toString().replace(/[^0-9]/g, '');
                return cleanVal ? BigInt(cleanVal) : 0n;
            }
            return rawValue;
        });
        console.log("   Constructor Args:", formattedArgs);

        // 3. Deploy using ContractFactory — works for both MetaMask and Private Key
        const factory = new ethers.ContractFactory(abi, bytecode, signer);
        const contract = await factory.deploy(...formattedArgs, {
            gasLimit: BigInt(config?.gasLimit ?? "3000000"),
        });

        const txResponse = contract.deploymentTransaction();
        if (!txResponse) {
            throw new Error("Protocol failed to return a transaction hash.");
        }

        console.log(`✅ [BlockchainService] Transaction broadcast! Hash: ${txResponse.hash}`);
        return txResponse as ethers.ContractTransactionResponse;
    }

    public getProvider() {
        return this.rpcProvider;
    }
}
