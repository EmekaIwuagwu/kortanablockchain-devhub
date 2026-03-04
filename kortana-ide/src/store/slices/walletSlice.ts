import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { BlockchainService } from '../../services/BlockchainService';
import { FileService } from '../../services/FileService';

interface WalletState {
    address: string | null;
    isConnected: boolean;
    isConnecting: boolean;
    error: string | null;
    currentNetwork: 'TESTNET' | 'MAINNET';
    walletType: 'metamask' | 'kortana' | 'privateKey' | null;
}

const initialState: WalletState = {
    address: null,
    isConnected: false,
    isConnecting: false,
    error: null,
    currentNetwork: 'TESTNET',
    walletType: null,
};

export const switchNetwork = createAsyncThunk(
    'wallet/switchNetwork',
    async (networkKey: 'TESTNET' | 'MAINNET', { rejectWithValue }) => {
        try {
            const service = BlockchainService.getInstance();
            await service.setNetwork(networkKey);
            return networkKey;
        } catch (err: any) {
            return rejectWithValue(err.message || 'Failed to switch network');
        }
    }
);

export const connectWallet = createAsyncThunk(
    'wallet/connect',
    async (type: 'metamask' | 'kortana', { rejectWithValue }) => {
        try {
            const service = BlockchainService.getInstance();
            const address = await service.connectWallet(type);
            return { address, type };
        } catch (err: any) {
            if (err.message === 'CONNECTION_CANCELLED') {
                return rejectWithValue('CANCELLED');
            }
            return rejectWithValue(err.message || `Failed to connect ${type} wallet`);
        }
    }
);

export const connectWithPrivateKey = createAsyncThunk(
    'wallet/connectWithPrivateKey',
    async (privateKey: string, { rejectWithValue }) => {
        try {
            const service = BlockchainService.getInstance();
            const address = await service.connectWithPrivateKey(privateKey);
            return address;
        } catch (err: any) {
            return rejectWithValue(err.message || 'Failed to connect with Private Key');
        }
    }
);

const walletSlice = createSlice({
    name: 'wallet',
    initialState,
    reducers: {
        disconnect(state) {
            FileService.getInstance().clearAddress();
            state.address = null;
            state.isConnected = false;
            state.error = null;
            state.walletType = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(connectWallet.pending, (state) => {
                state.isConnecting = true;
                state.error = null;
            })
            .addCase(connectWallet.fulfilled, (state, action) => {
                state.isConnecting = false;
                state.isConnected = true;
                state.address = action.payload.address;
                state.walletType = action.payload.type;
            })
            .addCase(connectWallet.rejected, (state, action) => {
                state.isConnecting = false;
                state.isConnected = false;
                state.error = action.payload as string;
            })
            .addCase(connectWithPrivateKey.pending, (state) => {
                state.isConnecting = true;
                state.error = null;
            })
            .addCase(connectWithPrivateKey.fulfilled, (state, action) => {
                state.isConnecting = false;
                state.isConnected = true;
                state.address = action.payload;
                state.walletType = 'privateKey';
            })
            .addCase(connectWithPrivateKey.rejected, (state, action) => {
                state.isConnecting = false;
                state.isConnected = false;
                state.error = action.payload as string;
            })
            .addCase(switchNetwork.fulfilled, (state, action) => {
                state.currentNetwork = action.payload;
            });
    },
});

export const { disconnect } = walletSlice.actions;
export default walletSlice.reducer;
