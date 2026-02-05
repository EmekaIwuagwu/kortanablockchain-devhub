import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TestService, TestSuiteResult } from '../../services/TestService';

interface TestState {
    status: 'idle' | 'running' | 'completed' | 'error';
    lastResult: TestSuiteResult | null;
    history: TestSuiteResult[];
    error: string | null;
}

const initialState: TestState = {
    status: 'idle',
    lastResult: null,
    history: [],
    error: null,
};

export const runProjectTests = createAsyncThunk(
    'test/runProjectTests',
    async ({ sourceCode, fileName }: { sourceCode: string, fileName: string }, { rejectWithValue }) => {
        try {
            const service = TestService.getInstance();
            return await service.runTests(sourceCode, fileName);
        } catch (err: any) {
            return rejectWithValue(err.message || 'Failed to run tests');
        }
    }
);

const testSlice = createSlice({
    name: 'test',
    initialState,
    reducers: {
        clearTestResults(state) {
            state.lastResult = null;
            state.status = 'idle';
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(runProjectTests.pending, (state) => {
                state.status = 'running';
                state.error = null;
            })
            .addCase(runProjectTests.fulfilled, (state, action) => {
                state.status = 'completed';
                state.lastResult = action.payload;
                state.history.unshift(action.payload);
            })
            .addCase(runProjectTests.rejected, (state, action) => {
                state.status = 'error';
                state.error = action.payload as string;
            });
    }
});

export const { clearTestResults } = testSlice.actions;
export default testSlice.reducer;
