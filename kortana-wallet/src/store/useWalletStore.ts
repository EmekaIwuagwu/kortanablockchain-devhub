import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { NetworkType } from '../lib/constants';
import { chromeStorage } from './chromeStorage';

interface WalletState {
    // Persistent State (Encrypted/Public)
    address: string | null;
    encryptedMnemonic: string | null;
    passwordHash: string | null; // SHA256 of password to verify on unlock
    accounts: string[];
    network: NetworkType;
    tokens: any[]; // Custom registered tokens

    // Memory-only State (Cleared on lock)
    mnemonic: string | null;
    privateKey: string | null;
    isLocked: boolean;
    balance: string;
    lastInteraction: number;


    // Actions
    setAddress: (address: string | null) => void;
    setEncryptedMnemonic: (encrypted: string | null) => void;
    setPasswordHash: (hash: string | null) => void;
    setNetwork: (network: NetworkType) => void;
    setLocked: (isLocked: boolean) => void;
    setBalance: (balance: string) => void;
    setTokens: (tokens: any[]) => void;
    setMnemonic: (mnemonic: string | null) => void;
    setPrivateKey: (key: string | null) => void;
    updateLastInteraction: () => void;



    addAccount: (address: string) => void;
    reset: () => void;
}

export const useWalletStore = create<WalletState>()(
    persist(
        (set) => ({
            // Default Values
            address: null,
            encryptedMnemonic: null,
            passwordHash: null,
            accounts: [],
            network: 'mainnet',
            tokens: [],

            mnemonic: null,
            privateKey: null,
            isLocked: true,
            balance: '0.00',
            lastInteraction: Date.now(),


            // Setters
            setAddress: (address) => set({ address }),
            setEncryptedMnemonic: (encryptedMnemonic) => set({ encryptedMnemonic }),
            setPasswordHash: (passwordHash) => set({ passwordHash }),
            setNetwork: (network) => set({ network }),
            setLocked: (isLocked) => {
                if (isLocked) {
                    set({ isLocked, mnemonic: null, privateKey: null }); // Clear sensitive data on lock
                } else {
                    set({ isLocked });
                }
            },
            setBalance: (balance) => set({ balance }),
            setTokens: (tokens) => set({ tokens }),
            setMnemonic: (mnemonic) => set({ mnemonic }),
            setPrivateKey: (privateKey) => set({ privateKey }),
            updateLastInteraction: () => set({ lastInteraction: Date.now() }),


            addAccount: (address) => set((state) => ({
                accounts: state.accounts.includes(address) ? state.accounts : [...state.accounts, address]
            })),


            reset: () => set({
                address: null,
                encryptedMnemonic: null,
                passwordHash: null,
                accounts: [],
                network: 'mainnet',
                tokens: [],
                mnemonic: null,
                privateKey: null,
                isLocked: true,
                balance: '0.00'
            }),
        }),
        {
            name: 'kortana-wallet-secure-storage',
            storage: createJSONStorage(() => chromeStorage),
            partialize: (state) => ({ // Only persist these fields
                address: state.address,
                encryptedMnemonic: state.encryptedMnemonic,
                passwordHash: state.passwordHash,
                accounts: state.accounts,
                network: state.network,
                tokens: state.tokens,
                isLocked: state.isLocked, // ← CRITICAL: background.js reads this to authorize accounts
            }),
        }
    )
);
