import { ethers } from 'ethers';
import { IDE_CONFIG } from '../config';

const KORTANA_TESTNET = IDE_CONFIG.NETWORKS.POSEIDON;
const CHAIN_ID = parseInt(KORTANA_TESTNET.chainId, 16); // 72511

/**
 * BlockchainService — Kortana Protocol Adapter
 * 
 * CRITICAL ARCHITECTURE NOTE:
 * The Kortana Poseidon RPC node (Kortana/v1.0.0/rust) only accepts
 * Legacy (Type-0) transactions. MetaMask enforces EIP-1559 (Type-2)
 * which causes "Parse error: EOF" on the node side.
 *
 * SOLUTION: For ALL deployments, we bypass MetaMask's signing pipeline
 * and send the transaction directly via eth_sendRawTransaction using a
 * manually signed Type-0 transaction from the ethers.js JsonRpcProvider.
 *
 * MetaMask is still used ONLY for wallet discovery (getting the user's address).
 */
export class BlockchainService {
    private static instance: BlockchainService;
    private browserProvider: ethers.BrowserProvider | null = null;
    private customSigner: ethers.Wallet | null = null;
    private rpcProvider: ethers.JsonRpcProvider;

    private constructor() {
        // Always maintain a direct RPC connection — this is our actual tx broadcaster
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

    /**
     * Connect via MetaMask. We get the user's address but will NOT
     * use MetaMask to sign deployment transactions.
     */
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

            // Try to add/switch to Kortana network in MetaMask (best effort)
            await this.ensureKortanaNetwork();

            this.customSigner = null;
            return accounts[0];
        } catch (error: any) {
            console.error('Wallet connection error:', error);
            throw new Error(error.message || 'Failed to connect wallet');
        }
    }

    /**
     * Connect via private key — full signing capability for Kortana.
     */
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
        } catch (error: any) {
            // Ignore user rejection (code 4001) — we only need the address
            if (error.code !== 4001) {
                console.warn("Could not switch MetaMask to Kortana. Deployment still works via direct RPC.");
            }
        }
    }

    /**
     * Deploy a smart contract to the Kortana network.
     *
     * KEY: This method ALWAYS signs transactions directly via the RPC provider,
     * bypassing MetaMask's EIP-1559 enforcement. This is the ONLY way to
     * successfully deploy to the Kortana Poseidon Rust node.
     */
    public async deploy(
        bytecode: string,
        abi: any[],
        config?: { gasLimit: string; gasPrice: string; args: any[] }
    ): Promise<ethers.ContractTransactionResponse> {

        console.log("🚀 [BlockchainService] Initiating Kortana-optimised deployment...");

        // --- Step 1: Determine the deployer address ---
        // We need the user's address to check balance and get nonce.
        // If MetaMask is connected (no customSigner), we must request a temp signer.
        // If private key connected, use that directly.
        let deployerAddress: string;
        let signingWallet: ethers.Wallet;

        if (this.customSigner) {
            signingWallet = this.customSigner;
            deployerAddress = signingWallet.address;
        } else if (this.browserProvider) {
            // MetaMask is connected but cannot sign Legacy txs.
            // We need the user to provide a private key for deployment.
            throw new Error(
                "METAMASK_LIMITATION: MetaMask cannot sign Legacy transactions for the Kortana network. " +
                "Please use 'Connect with Private Key' to deploy contracts. " +
                "Your MetaMask address is shown for reference only."
            );
        } else {
            throw new Error('No wallet connected. Please connect via MetaMask or Private Key first.');
        }

        // --- Step 2: Check balance ---
        const balance = await this.rpcProvider.getBalance(deployerAddress);
        console.log(`   Deployer: ${deployerAddress}`);
        console.log(`   Balance: ${ethers.formatEther(balance)} DNR`);

        if (balance === 0n) {
            throw new Error("Insufficient balance! Your account has 0 DNR. Please fund it before deploying.");
        }

        // --- Step 3: Parse constructor arguments with correct types ---
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

        // --- Step 4: Build deployment calldata ---
        const factory = new ethers.ContractFactory(abi, bytecode);
        const deployTx = await factory.getDeployTransaction(...formattedArgs);

        // --- Step 5: Get network state ---
        const nonce = await this.rpcProvider.getTransactionCount(deployerAddress, 'pending');
        // Use actual network gas price (confirmed to be 1 wei on Kortana)
        const networkGasPrice = (await this.rpcProvider.getFeeData()).gasPrice ?? 1n;
        console.log(`   Nonce: ${nonce}`);
        console.log(`   Network Gas Price: ${networkGasPrice.toString()} wei`);

        // --- Step 6: Build STRICT Legacy (Type-0) transaction ---
        // This is the ONLY format the Kortana Rust node accepts.
        const txRequest = {
            type: 0,                   // MANDATORY: Legacy transaction
            to: null,                  // null = contract creation
            data: deployTx.data,       // ABI-encoded constructor call + bytecode
            gasLimit: BigInt(config?.gasLimit ?? "3000000"),
            gasPrice: networkGasPrice, // Use actual network price, not user override
            nonce: nonce,
            chainId: CHAIN_ID,
            value: 0n
        };

        console.log(`   Gas Limit: ${txRequest.gasLimit.toString()}`);
        console.log("   Broadcasting via direct RPC (bypassing MetaMask)...");

        // --- Step 7: Sign manually and send via eth_sendRawTransaction ---
        const signedTx = await signingWallet.signTransaction(txRequest);
        console.log(`   Signed TX length: ${signedTx.length} chars`);

        const txHash = await this.rpcProvider.send("eth_sendRawTransaction", [signedTx]);
        console.log(`✅ Broadcasted! Hash: ${txHash}`);

        // Return a compatible object for the deployment slice to poll
        const txResponse = await this.rpcProvider.getTransaction(txHash);
        if (!txResponse) {
            // The Kortana node sometimes doesn't return the tx immediately
            // Construct a minimal response so polling can still work
            return {
                hash: txHash,
                wait: async () => this.rpcProvider.waitForTransaction(txHash)
            } as any;
        }
        return txResponse as ethers.ContractTransactionResponse;
    }

    public getProvider() {
        return this.rpcProvider;
    }
}
