import { app, BrowserWindow, shell, ipcMain, dialog, Menu } from 'electron';
import { release } from 'node:os';
import { join } from 'node:path';
import fs from 'node:fs/promises';

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
    app.quit();
    process.exit(0);
}

let win: BrowserWindow | null = null;
const preload = join(__dirname, '../preload/index.js');
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(__dirname, '../../dist/index.html');

async function createWindow() {
    win = new BrowserWindow({
        title: 'Kortana Studio',
        icon: join(__dirname, '../../public/favicon.ico'),
        width: 1440,
        height: 900,
        minWidth: 1024,
        minHeight: 768,
        frame: true, // Keep frame but hide native menu
        backgroundColor: '#0f1115',
        webPreferences: {
            preload,
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // Remove native menu for a custom look
    Menu.setApplicationMenu(null);

    if (url) {
        win.loadURL(url);
    } else {
        win.loadFile(indexHtml);
    }

    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('https:')) shell.openExternal(url);
        return { action: 'deny' };
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    win = null;
    if (process.platform !== 'darwin') app.quit();
});

// IPC handlers for File System
ipcMain.handle('fs:readFile', async (_, filePath: string) => {
    try {
        return await fs.readFile(filePath, 'utf-8');
    } catch (error: any) {
        throw new Error(`Failed to read file: ${error.message}`);
    }
});

ipcMain.handle('fs:writeFile', async (_, { filePath, content }: { filePath: string, content: string }) => {
    try {
        await fs.writeFile(filePath, content, 'utf-8');
        return true;
    } catch (error: any) {
        throw new Error(`Failed to write file: ${error.message}`);
    }
});

ipcMain.handle('fs:getFiles', async (_, dirPath: string) => {
    try {
        return await fs.readdir(dirPath);
    } catch (error: any) {
        throw new Error(`Failed to list directory: ${error.message}`);
    }
});

ipcMain.handle('fs:selectFolder', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
    });
    if (result.canceled) return null;
    return result.filePaths[0];
});

ipcMain.handle('fs:createFolder', async (_, dirPath: string) => {
    try {
        await fs.mkdir(dirPath, { recursive: true });
        return true;
    } catch (error: any) {
        throw new Error(`Failed to create folder: ${error.message}`);
    }
});

ipcMain.handle('fs:deleteFile', async (_, filePath: string) => {
    try {
        await fs.unlink(filePath);
        return true;
    } catch (error: any) {
        throw new Error(`Failed to delete file: ${error.message}`);
    }
});

ipcMain.handle('fs:isDirectory', async (_, path: string) => {
    try {
        const stats = await fs.stat(path);
        return stats.isDirectory();
    } catch {
        return false;
    }
});

ipcMain.handle('compiler:compile', async (_, payload: any) => {
    return {
        status: 'success',
        timestamp: new Date().toISOString(),
        contracts: [{
            name: payload.name || 'Contract',
            abi: [],
            bytecode: '0x123'
        }],
        errors: []
    };
});
