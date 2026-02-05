import { configureStore } from '@reduxjs/toolkit';
import editorReducer from './slices/editorSlice';
import compilerReducer from './slices/compilerSlice';
import deploymentReducer from './slices/deploymentSlice';
import walletReducer from './slices/walletSlice';
import testReducer from './slices/testSlice';

export const store = configureStore({
    reducer: {
        editor: editorReducer,
        compiler: compilerReducer,
        deployment: deploymentReducer,
        wallet: walletReducer,
        test: testReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
