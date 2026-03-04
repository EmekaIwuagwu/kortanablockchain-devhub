import { ethers } from 'ethers';
import { IDE_CONFIG } from '../config';

const DEFAULT_NETWORK = IDE_CONFIG.NETWORKS.TESTNET;

/**
 * BlockchainService — Kortana Protocol Adapter
 *
 * Finalized provider detection for MetaMask vs Kortana Wallet.
 */
export class BlockchainService {
    private static instance: BlockchainService;
    private browserProvider: ethers.BrowserProvider | null = null;
    private customSigner: ethers.Wallet | null = null;
    private rpcProvider: ethers.JsonRpcProvider;
    private currentNetwork = DEFAULT_NETWORK;
    private activeProviderType: 'metamask' | 'kortana' | 'privateKey' | null = null;

    private constructor() {
        this.rpcProvider = new ethers.JsonRpcProvider(this.currentNetwork.rpcUrls[0], {
            chainId: parseInt(this.currentNetwork.chainId, 16),
            name: this.currentNetwork.chainName
        });
    }

    public static getInstance(): BlockchainService {
        if (!BlockchainService.instance) {
            BlockchainService.instance = new BlockchainService();
        }
        return BlockchainService.instance;
    }

    // ─────────────────────────────────────────────────────────
    // Provider Detection (EIP-5749 & Multi-injection fallback)
    // ─────────────────────────────────────────────────────────

    private _findProvider(type: 'metamask' | 'kortana'): any {
        const w = window as any;
        const providers = w.ethereum?.providers || [];

        if (type === 'kortana') {
            // Priority 1: Direct window.kortana
            if (w.kortana) return w.kortana;

            // Priority 2: In the providers array
            const kortana = providers.find((p: any) => p.isKortana || p.isKortanaWallet || p.kortana);
            if (kortana) return kortana;

            // Priority 3: window.ethereum with Kortana flags
            if (w.ethereum?.isKortana || w.ethereum?.isKortanaWallet) return w.ethereum;

            return null;
        }

        if (type === 'metamask') {
            // Priority 1: In the providers array (specifically NOT Kortana)
            const mm = providers.find((p: any) => p.isMetaMask && !p.isKortana && !p.isKortanaWallet);
            if (mm) return mm;

            // Priority 2: Direct window.ethereum (if it's MetaMask and hasn't been hijacked)
            if (w.ethereum?.isMetaMask && !w.ethereum?.isKortana) return w.ethereum;

            return null;
        }
    }

    // ─────────────────────────────────────────────────────────
    // Wallet Connection
    // ─────────────────────────────────────────────────────────

    public async connectWallet(providerType: 'metamask' | 'kortana' = 'metamask'): Promise<string> {
        const isElectron = typeof window.ipcRenderer !== 'undefined';
        const provider = this._findProvider(providerType);

        if (!provider) {
            const name = providerType === 'metamask' ? 'MetaMask' : 'Kortana Wallet';
            if (isElectron && providerType === 'metamask') {
                window.open('http://localhost:3000', '_blank');
                throw new Error('REDIRECTING_TO_WEB');
            }
            throw new Error(`${name} not detected. Please install the extension and refresh.`);
        }

        try {
            // Clear previous state to prevent "false positive" from stale providers
            this.browserProvider = null;
            this.activeProviderType = null;

            const browserProvider = new ethers.BrowserProvider(provider);

            // Explicitly request accounts — this MUST trigger a popup if not already connected
            // We use eth_requestAccounts to FORCE a permission check if needed.
            const accounts = await browserProvider.send('eth_requestAccounts', []);

            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts returned from wallet.');
            }

            // Await network synchronization — this is crucial for the 0 DNR issue
            await this._ensureKortanaNetwork(provider);

            this.browserProvider = browserProvider;
            this.customSigner = null;
            this.activeProviderType = providerType;

            return accounts[0];
        } catch (error: any) {
            console.error(`[BlockchainService] ${providerType} connection error:`, error);

            // Handle User Rejection (Code 4001 is EIP-1193 standard)
            if (error.code === 4001 || error.message?.includes('user rejected') || error.message?.includes('User denied')) {
                throw new Error('CONNECTION_CANCELLED');
            }

            throw new Error(error.message || `Failed to connect ${providerType} wallet`);
        }
    }

    public async connectWithPrivateKey(privateKey: string): Promise<string> {
        try {
            this.customSigner = new ethers.Wallet(privateKey, this.rpcProvider);
            this.browserProvider = null;
            this.activeProviderType = 'privateKey';
            return this.customSigner.address;
        } catch (error: any) {
            console.error('Private Key connection error:', error);
            throw new Error('Invalid Private Key or RPC unreachable.');
        }
    }

    public async setNetwork(networkKey: 'TESTNET' | 'MAINNET') {
        const network = IDE_CONFIG.NETWORKS[networkKey];
        this.currentNetwork = network;
        this.rpcProvider = new ethers.JsonRpcProvider(this.currentNetwork.rpcUrls[0], {
            chainId: parseInt(this.currentNetwork.chainId, 16),
            name: this.currentNetwork.chainName
        });

        if (this.browserProvider) {
            const provider = (this.browserProvider as any).provider;
            if (provider) await this._ensureKortanaNetwork(provider);
        }

        console.log(`[BlockchainService] Switched to ${network.chainName}`);
    }

    private async _ensureKortanaNetwork(provider: any) {
        if (!provider || !provider.request) return;

        try {
            // First try switching
            await provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: this.currentNetwork.chainId }],
            });
        } catch (switchError: any) {
            // 4902 error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902 || switchError.message?.includes('Unrecognized chain ID')) {
                try {
                    await provider.request({
                        method: 'wallet_addEthereumChain',
                        params: [this.currentNetwork],
                    });
                } catch (addError) {
                    console.error('[BlockchainService] Failed to add network:', addError);
                }
            } else if (switchError.code !== 4001) {
                console.warn('[BlockchainService] Network switch warning:', switchError.message);
            }
        }
    }

    // ─────────────────────────────────────────────────────────
    // Deployment
    // ─────────────────────────────────────────────────────────

    public async deploy(
        bytecode: string,
        abi: any[],
        config?: { gasLimit: string; gasPrice: string; args: any[] }
    ): Promise<ethers.ContractTransactionResponse> {

        console.log('🚀 [BlockchainService] Starting Kortana deployment...');

        const signer = this.customSigner ||
            (this.browserProvider ? await this.browserProvider.getSigner() : null);

        if (!signer) {
            throw new Error('No wallet connected. Please connect a wallet first.');
        }

        const deployerAddress = await signer.getAddress();

        // Use the wallet's internal provider for balance checks to avoid discrepancy
        const provider = signer.provider || this.rpcProvider;

        const balance = await provider.getBalance(deployerAddress);
        console.log(`   Deployer: ${deployerAddress}`);
        console.log(`   Balance: ${ethers.formatEther(balance)} DNR`);

        if (balance === 0n) {
            throw new Error('Insufficient balance! Your account has 0 DNR on the selected network. Please fund it.');
        }

        const constructorAbi = abi.find((item: any) => item.type === 'constructor');
        const formattedArgs = (constructorAbi?.inputs || []).map((input: any, index: number) => {
            const rawValue = (config?.args || [])[index] ?? '';
            if (input.type.startsWith('uint') || input.type.startsWith('int')) {
                const cleanVal = rawValue.toString().replace(/[^0-9]/g, '');
                return cleanVal ? BigInt(cleanVal) : 0n;
            }
            return rawValue;
        });

        const factory = new ethers.ContractFactory(abi, bytecode, signer);
        const contract = await factory.deploy(...formattedArgs, {
            gasLimit: BigInt(config?.gasLimit ?? '3000000'),
        });

        const txResponse = contract.deploymentTransaction();
        if (!txResponse) {
            throw new Error('Protocol failed to return a transaction hash.');
        }

        console.log(`✅ [BlockchainService] Tx broadcast! Hash: ${txResponse.hash}`);
        return txResponse as ethers.ContractTransactionResponse;
    }

    public getProvider() { return this.rpcProvider; }

    public async getSignerForInteraction(): Promise<ethers.Signer | null> {
        if (this.customSigner) return this.customSigner;
        if (this.browserProvider) return await this.browserProvider.getSigner();
        return null;
    }
}
