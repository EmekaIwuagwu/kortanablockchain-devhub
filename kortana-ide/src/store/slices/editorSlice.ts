import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { ProjectFile } from '../../types';
import { FileService } from '../../services/FileService';

interface EditorState {
    files: ProjectFile[];
    activeFileId: string | null;
    sidebarActiveTab: string;
    projectPath: string | null;
    projectLanguage: 'solidity' | 'quorlin' | null;
    isProjectLoading: boolean;
}

const initialState: EditorState = {
    files: [],
    activeFileId: null,
    sidebarActiveTab: 'files',
    projectPath: null,
    projectLanguage: null,
    isProjectLoading: false,
};

// Helper for recursive file scanning
async function scanDirectory(path: string, service: FileService): Promise<ProjectFile[]> {
    const fileNames = await service.listDirectory(path);
    let results: ProjectFile[] = [];

    for (const name of fileNames) {
        const fullPath = `${path}/${name}`;
        const isDir = await service.isDirectory(fullPath);

        if (isDir) {
            const children = await scanDirectory(fullPath, service);
            results = [...results, ...children];
        } else if (name.endsWith('.sol') || name.endsWith('.qrl')) {
            const content = await service.readFile(fullPath);
            results.push({
                id: fullPath,
                name: name,
                content: content,
                language: (name.endsWith('.sol') ? 'solidity' : 'quorlin') as any,
                isOpen: false,
                isDirty: false,
                path: fullPath
            });
        }
    }
    return results;
}

export const openProject = createAsyncThunk(
    'editor/openProject',
    async (_, { rejectWithValue }) => {
        try {
            const service = FileService.getInstance();
            const path = await service.selectFolder();
            if (!path) return null;

            const files = await scanDirectory(path, service);
            return { path, files };
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const createNewProject = createAsyncThunk(
    'editor/createNewProject',
    async ({ projectName, language }: { projectName: string, language: any }, { rejectWithValue }) => {
        try {
            const service = FileService.getInstance();
            const rootPath = await service.selectFolder();
            if (!rootPath) return null;

            const projectPath = `${rootPath}/${projectName}`;
            await service.createFolder(projectPath);
            await service.createFolder(`${projectPath}/contracts`);
            await service.createFolder(`${projectPath}/scripts`);

            const ext = language === 'solidity' ? 'sol' : 'qrl';
            const initialFile = `${projectPath}/contracts/Counter.${ext}`;
            const initialContent = language === 'solidity'
                ? '// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\ncontract Counter {\n    uint256 public count;\n    function increment() public { count += 1; }\n}'
                : '// Quorlin Script\ncontract Counter {\n    // Quorlin logic here\n}';

            await service.writeFile(initialFile, initialContent);

            const files = await scanDirectory(projectPath, service);
            return { path: projectPath, files };
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const saveActiveFile = createAsyncThunk(
    'editor/saveFile',
    async (_, { getState, rejectWithValue }) => {
        const state = (getState() as any).editor as EditorState;
        const activeFile = state.files.find(f => f.id === state.activeFileId);

        if (!activeFile || !activeFile.path) {
            return rejectWithValue('No file to save');
        }

        try {
            const service = FileService.getInstance();
            await service.writeFile(activeFile.path, activeFile.content);
            return activeFile.id;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const createNewFile = createAsyncThunk(
    'editor/createNewFile',
    async ({ name, content }: { name: string, content: string }, { getState, rejectWithValue }) => {
        const state = (getState() as any).editor as EditorState;
        if (!state.projectPath) return rejectWithValue('No project open');

        // Default to contracts folder if it exists
        const filePath = name.includes('/') ? `${state.projectPath}/${name}` : `${state.projectPath}/contracts/${name}`;
        try {
            const service = FileService.getInstance();
            await service.writeFile(filePath, content);
            return {
                id: filePath,
                name: name.split('/').pop()!,
                content,
                language: (name.endsWith('.sol') ? 'solidity' : 'quorlin') as any,
                isOpen: true,
                isDirty: false,
                path: filePath
            };
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const deleteFile = createAsyncThunk(
    'editor/deleteFile',
    async (fileId: string, { rejectWithValue }) => {
        try {
            const service = FileService.getInstance();
            await service.deleteFile(fileId);
            return fileId;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const loadLastProject = createAsyncThunk(
    'editor/loadLastProject',
    async (_, { dispatch }) => {
        const lastPath = localStorage.getItem('kortana_ide_last_project');
        if (lastPath) {
            const service = FileService.getInstance();
            // Check if path still exists in mock or real FS
            const exists = await service.isDirectory(lastPath);
            if (exists) {
                const files = await scanDirectory(lastPath, service);
                return { path: lastPath, files };
            }
        }
        return null;
    }
);

const editorSlice = createSlice({
    name: 'editor',
    initialState,
    reducers: {
        setActiveFile(state, action: PayloadAction<string | null>) {
            state.activeFileId = action.payload;
            if (action.payload) {
                const file = state.files.find(f => f.id === action.payload);
                if (file) {
                    file.isOpen = true;
                }
            }
        },
        updateFileContent(state, action: PayloadAction<{ id: string, content: string }>) {
            const file = state.files.find(f => f.id === action.payload.id);
            if (file) {
                file.content = action.payload.content;
                file.isDirty = true;
            }
        },
        setSidebarTab(state, action: PayloadAction<string>) {
            state.sidebarActiveTab = action.payload;
        },
        closeFile(state, action: PayloadAction<string>) {
            const file = state.files.find(f => f.id === action.payload);
            if (file) {
                file.isOpen = false;
                if (state.activeFileId === action.payload) {
                    const remainingOpen = state.files.filter(f => f.isOpen);
                    state.activeFileId = remainingOpen.length > 0 ? remainingOpen[0].id : null;
                }
            }
        }
    },
    extraReducers: (builder) => {
        builder.addCase(openProject.pending, (state) => {
            state.isProjectLoading = true;
        });
        builder.addCase(openProject.fulfilled, (state, action) => {
            state.isProjectLoading = false;
            if (action.payload) {
                state.projectPath = action.payload.path;
                state.files = action.payload.files;
                state.activeFileId = null;
                localStorage.setItem('kortana_ide_last_project', action.payload.path);
                // Auto-detect project language based on file extensions
                const hasSol = action.payload.files.some(f => f.name.endsWith('.sol'));
                const hasQrl = action.payload.files.some(f => f.name.endsWith('.qrl'));
                state.projectLanguage = hasSol ? 'solidity' : (hasQrl ? 'quorlin' : null);
            }
        });
        builder.addCase(createNewProject.fulfilled, (state, action) => {
            if (action.payload) {
                state.projectPath = action.payload.path;
                state.files = action.payload.files;
                state.projectLanguage = (action.meta.arg as any).language;
                localStorage.setItem('kortana_ide_last_project', action.payload.path);
                // Find the Counter file and set it active
                const counterFile = action.payload.files.find(f => f.name.toLowerCase().includes('counter'));
                if (counterFile) {
                    state.activeFileId = counterFile.id;
                    counterFile.isOpen = true;
                } else {
                    state.activeFileId = null;
                }
            }
        });
        builder.addCase(createNewFile.fulfilled, (state, action) => {
            state.files.push(action.payload as any);
            state.activeFileId = action.payload!.id;
        });
        builder.addCase(saveActiveFile.fulfilled, (state, action) => {
            const file = state.files.find(f => f.id === action.payload);
            if (file) {
                file.isDirty = false;
            }
        });
        builder.addCase(deleteFile.fulfilled, (state, action) => {
            state.files = state.files.filter(f => f.id !== action.payload);
            if (state.activeFileId === action.payload) {
                const remainingOpen = state.files.filter(f => f.isOpen);
                state.activeFileId = remainingOpen.length > 0 ? remainingOpen[0].id : null;
            }
        });
        builder.addCase(loadLastProject.fulfilled, (state, action) => {
            if (action.payload) {
                state.projectPath = action.payload.path;
                state.files = action.payload.files;
                const hasSol = action.payload.files.some(f => f.name.endsWith('.sol'));
                const hasQrl = action.payload.files.some(f => f.name.endsWith('.qrl'));
                state.projectLanguage = hasSol ? 'solidity' : (hasQrl ? 'quorlin' : null);
            }
        });
    }
});

export const { setActiveFile, updateFileContent, setSidebarTab, closeFile } = editorSlice.actions;
export default editorSlice.reducer;
