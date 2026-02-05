import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { CompilationResult, Language } from '../../types';
import { CompilerService } from '../../services/CompilerService';

interface CompilerState {
    status: 'idle' | 'compiling' | 'success' | 'error';
    lastResult: CompilationResult | null;
    selectedLanguage: Language;
}

const initialState: CompilerState = {
    status: 'idle',
    lastResult: null,
    selectedLanguage: 'solidity',
};

export const compileCode = createAsyncThunk(
    'compiler/compileCode',
    async ({ language, sourceCode, fileName }: { language: Language, sourceCode: string, fileName: string }) => {
        const service = CompilerService.getInstance();
        return await service.compile(language, sourceCode, fileName);
    }
);

const compilerSlice = createSlice({
    name: 'compiler',
    initialState,
    reducers: {
        setLanguage(state, action: PayloadAction<Language>) {
            state.selectedLanguage = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(compileCode.pending, (state) => {
                state.status = 'compiling';
            })
            .addCase(compileCode.fulfilled, (state, action) => {
                state.status = action.payload.status === 'success' ? 'success' : 'error';
                state.lastResult = action.payload;
            })
            .addCase(compileCode.rejected, (state) => {
                state.status = 'error';
            });
    },
});

export const { setLanguage } = compilerSlice.actions;
export default compilerSlice.reducer;
