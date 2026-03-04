import { ethers } from 'ethers';
import { IDE_CONFIG } from '../config';

const DEFAULT_NETWORK = IDE_CONFIG.NETWORKS.TESTNET;

/**
 * BlockchainService — Kortana Protocol Adapter
 *
 * Wallet provider selection strategy:
 *   - When multiple extensions are installed (MetaMask + Kortana), the browser
 *     merges them under window.ethereum AND populates window.ethereum.providers[].
 *   - We iterate window.ethereum.providers to find the correct wallet by its
 *     injected flag (isMetaMask vs isKortana).
 *   - Kortana Wallet may also expose itself as window.kortana directly.
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
    // Provider Detection
    // ─────────────────────────────────────────────────────────

    /**
     * Finds the correct EIP-1193 provider from the browser.
     * Supports both single-wallet and multi-wallet (EIP-5749) environments.
     */
    private _findProvider(type: 'metamask' | 'kortana'): any {
        const w = window as any;

        if (type === 'metamask') {
            // 1. Check providers array (multiple wallets installed)
            if (w.ethereum?.providers && Array.isArray(w.ethereum.providers)) {
                const mm = w.ethereum.providers.find((p: any) => p.isMetaMask && !p.isKortana);
                if (mm) return mm;
            }
            // 2. Single wallet — direct window.ethereum that is MetaMask
            if (w.ethereum?.isMetaMask) return w.ethereum;
            return null;
        }

        if (type === 'kortana') {
            // 1. Dedicated namespace (highest priority, most explicit)
            if (w.kortana) return w.kortana;

            // 2. Check providers array for Kortana-flagged provider
            if (w.ethereum?.providers && Array.isArray(w.ethereum.providers)) {
                const kortana = w.ethereum.providers.find(
                    (p: any) => p.isKortana || p.isKortanaWallet || p.kortana
                );
                if (kortana) return kortana;
            }

            // 3. window.ethereum itself has a Kortana flag
            if (w.ethereum?.isKortana || w.ethereum?.isKortanaWallet) return w.ethereum;

            return null;
        }
    }

    // ─────────────────────────────────────────────────────────
    // Wallet Connection
    // ─────────────────────────────────────────────────────────

    public async connectWallet(providerType: 'metamask' | 'kortana' = 'metamask'): Promise<string> {
        const isElectron = typeof window.ipcRenderer !== 'undefined';
        let provider: any;

        if (providerType === 'metamask') {
            provider = this._findProvider('metamask');
            if (!provider) {
                if (isElectron) {
                    window.open('http://localhost:3000', '_blank');
                    throw new Error('REDIRECTING_TO_WEB');
                }
                const msg = 'MetaMask not detected. Please install the MetaMask extension and refresh.';
                throw new Error(msg);
            }
        } else {
            // Kortana Wallet
            provider = this._findProvider('kortana');
            if (!provider) {
                const msg = 'Kortana Wallet not detected. Please install the Kortana browser extension, open it, and try again.';
                throw new Error(msg);
            }
        }

        try {
            // Request accounts — this triggers the wallet's own popup
            this.browserProvider = new ethers.BrowserProvider(provider);
            const accounts = await this.browserProvider.send('eth_requestAccounts', []);

            // Silently try to add/switch to Kortana network in the wallet
            await this._ensureKortanaNetwork(provider);

            this.customSigner = null;
            this.activeProviderType = providerType;
            return accounts[0];
        } catch (error: any) {
            console.error(`[BlockchainService] ${providerType} connection error:`, error);
            if (error.code === 4001) {
                throw new Error('Connection rejected — you declined the wallet request.');
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
            const w = window as any;
            const provider = w.kortana || w.ethereum;
            if (provider) await this._ensureKortanaNetwork(provider);
        }

        console.log(`[BlockchainService] Switched to ${network.chainName}`);
    }

    private async _ensureKortanaNetwork(provider: any) {
        if (!provider) return;
        try {
            await provider.request({
                method: 'wallet_addEthereumChain',
                params: [this.currentNetwork],
            });
            await provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: this.currentNetwork.chainId }],
            });
        } catch (error: any) {
            // 4001 = user rejected, 4902 = chain not added yet. Both are safe to ignore here.
            if (error.code !== 4001) {
                console.warn('[BlockchainService] Network switch warning:', error.message);
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
        const provider = signer.provider ?? this.rpcProvider;

        const balance = await provider.getBalance(deployerAddress);
        console.log(`   Deployer: ${deployerAddress}`);
        console.log(`   Balance: ${ethers.formatEther(balance)} DNR`);

        if (balance === 0n) {
            throw new Error('Insufficient balance! Your account has 0 DNR. Please fund it before deploying.');
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
