import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { BlockchainService } from '../../services/BlockchainService';

interface WalletState {
    address: string | null;
    isConnected: boolean;
    isConnecting: boolean;
    error: string | null;
    chainId: number | null;
}

const initialState: WalletState = {
    address: null,
    isConnected: false,
    isConnecting: false,
    error: null,
    chainId: null,
};

export const connectWallet = createAsyncThunk(
    'wallet/connect',
    async (_, { rejectWithValue }) => {
        try {
            const service = BlockchainService.getInstance();
            const address = await service.connectWallet();
            return address;
        } catch (err: any) {
            return rejectWithValue(err.message || 'Failed to connect wallet');
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
            state.address = null;
            state.isConnected = false;
            state.error = null;
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
                state.address = action.payload;
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
            })
            .addCase(connectWithPrivateKey.rejected, (state, action) => {
                state.isConnecting = false;
                state.isConnected = false;
                state.error = action.payload as string;
            });
    },
});

export const { disconnect } = walletSlice.actions;
export default walletSlice.reducer;
