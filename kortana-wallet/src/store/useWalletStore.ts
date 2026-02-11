import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WalletState {
    address: string | null;
    balance: string;
    isLocked: boolean;
    mnemonic: string | null;
    passwordHash: string | null;
    accounts: string[];
    network: 'mainnet' | 'testnet';
    setAddress: (address: string | null) => void;
    setBalance: (balance: string) => void;
    setLocked: (isLocked: boolean) => void;
    setMnemonic: (mnemonic: string | null) => void;
    setPasswordHash: (passwordHash: string | null) => void;
    setNetwork: (network: 'mainnet' | 'testnet') => void;
    reset: () => void;
}

export const useWalletStore = create<WalletState>()(
    persist(
        (set) => ({
            address: null,
            balance: '0.00',
            isLocked: true,
            mnemonic: null,
            passwordHash: null,
            accounts: [],
            network: 'mainnet',
            setAddress: (address) => set({ address }),
            setBalance: (balance) => set({ balance }),
            setLocked: (isLocked) => set({ isLocked }),
            setMnemonic: (mnemonic) => set({ mnemonic }),
            setPasswordHash: (passwordHash) => set({ passwordHash }),
            setNetwork: (network) => set({ network }),
            reset: () => set({ address: null, balance: '0.00', isLocked: true, mnemonic: null, passwordHash: null, accounts: [], network: 'mainnet' }),
        }),
        {
            name: 'kortana-wallet-storage',
        }
    )
);
