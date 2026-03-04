export interface FileSystemEntry {
    name: string;
    path: string;
    isDirectory: boolean;
}

/**
 * FileService — Address-Namespaced Virtual File System
 *
 * In web mode, all file storage is keyed by the connected wallet address.
 * This means every developer's workspace is fully isolated and persistent
 * across sessions, tied to their on-chain identity.
 *
 *   Key pattern: kortana_{address}_files | kortana_{address}_dirs | kortana_{address}_last_project
 *
 * In Electron mode, the native file system is used directly.
 */
export class FileService {
    private static instance: FileService;
    private isWeb: boolean;
    private mockFiles: Map<string, string> = new Map();
    private mockDirs: Set<string> = new Set();
    private currentAddress: string | null = null;

    private constructor() {
        this.isWeb = typeof window.ipcRenderer === 'undefined';
        // Do NOT load anything on construction — wait for address to be set
    }

    // ─────────────────────────────────────────────
    // Storage key helpers — always address-scoped
    // ─────────────────────────────────────────────
    private key(name: string): string {
        const addr = this.currentAddress ?? 'anonymous';
        return `kortana_${addr}_${name}`;
    }

    private loadFromStorage() {
        this.mockFiles.clear();
        this.mockDirs.clear();
        try {
            const files = localStorage.getItem(this.key('files'));
            const dirs = localStorage.getItem(this.key('dirs'));
            if (files) {
                this.mockFiles = new Map(Object.entries(JSON.parse(files)));
            }
            if (dirs) {
                this.mockDirs = new Set(JSON.parse(dirs));
            }
        } catch (e) {
            console.error('[FileService] Failed to load from storage', e);
        }
    }

    private persist() {
        if (!this.isWeb) return;
        localStorage.setItem(this.key('files'), JSON.stringify(Object.fromEntries(this.mockFiles)));
        localStorage.setItem(this.key('dirs'), JSON.stringify(Array.from(this.mockDirs)));
    }

    // ─────────────────────────────────────────────
    // Public API
    // ─────────────────────────────────────────────
    public static getInstance(): FileService {
        if (!FileService.instance) {
            FileService.instance = new FileService();
        }
        return FileService.instance;
    }

    /**
     * Set the active wallet address. Called immediately after wallet connection.
     * Loads the workspace for that address from localStorage.
     * Returns the last project path for that address, or null.
     */
    public setAddress(address: string): string | null {
        this.currentAddress = address.toLowerCase();
        if (this.isWeb) {
            // Always purge old non-address-scoped keys — no migration, clean slate only
            this._purgeLegacyKeys();
            this.loadFromStorage();
        }
        return localStorage.getItem(this.key('last_project'));
    }

    /**
     * Clear the active address (on disconnect). In-memory state is cleared,
     * but localStorage data is preserved for next login.
     */
    public clearAddress() {
        this.currentAddress = null;
        this.mockFiles.clear();
        this.mockDirs.clear();
    }

    /**
     * Returns the last project path for the current address, or null.
     */
    public getLastProject(): string | null {
        if (!this.currentAddress) return null;
        return localStorage.getItem(this.key('last_project'));
    }

    public setLastProject(path: string) {
        if (!this.isWeb) return;
        localStorage.setItem(this.key('last_project'), path);
    }

    public clearLastProject() {
        localStorage.removeItem(this.key('last_project'));
    }

    public hasAddress(): boolean {
        return this.currentAddress !== null;
    }

    public async selectFolder(): Promise<string | null> {
        if (!this.isWeb) {
            return await window.ipcRenderer.invoke('fs:selectFolder');
        }
        // In web mode, virtual workspace root is address-scoped
        return `ws_${this.currentAddress ?? 'anon'}`;
    }

    public async readFile(path: string): Promise<string> {
        if (!this.isWeb) {
            return await window.ipcRenderer.invoke('fs:readFile', path);
        }
        return this.mockFiles.get(path) || '';
    }

    public async writeFile(path: string, content: string): Promise<boolean> {
        if (!this.isWeb) {
            return await window.ipcRenderer.invoke('fs:writeFile', { filePath: path, content });
        }
        this.mockFiles.set(path, content);
        // Ensure all parent dirs exist
        const parts = path.split('/');
        let current = '';
        for (let i = 0; i < parts.length - 1; i++) {
            current = current ? `${current}/${parts[i]}` : parts[i];
            this.mockDirs.add(current);
        }
        this.persist();
        return true;
    }

    public async createFolder(path: string): Promise<boolean> {
        if (!this.isWeb) {
            return await window.ipcRenderer.invoke('fs:createFolder', path);
        }
        const parts = path.split('/');
        let current = '';
        for (const part of parts) {
            current = current ? `${current}/${part}` : part;
            this.mockDirs.add(current);
        }
        this.persist();
        return true;
    }

    public async listDirectory(path: string): Promise<string[]> {
        if (!this.isWeb) {
            return await window.ipcRenderer.invoke('fs:getFiles', path);
        }
        const children: string[] = [];
        this.mockFiles.forEach((_, filePath) => {
            if (filePath.startsWith(path + '/') && filePath.split('/').length === path.split('/').length + 1) {
                children.push(filePath.split('/').pop()!);
            }
        });
        this.mockDirs.forEach(dirPath => {
            if (dirPath.startsWith(path + '/') && dirPath.split('/').length === path.split('/').length + 1) {
                children.push(dirPath.split('/').pop()!);
            }
        });
        return [...new Set(children)];
    }

    public async deleteFile(path: string): Promise<boolean> {
        if (!this.isWeb) {
            return await window.ipcRenderer.invoke('fs:deleteFile', path);
        }
        this.mockFiles.delete(path);
        this.persist();
        return true;
    }

    public async isDirectory(path: string): Promise<boolean> {
        if (!this.isWeb) {
            return await window.ipcRenderer.invoke('fs:isDirectory', path);
        }
        return this.mockDirs.has(path);
    }

    public async renameFile(oldPath: string, newPath: string): Promise<boolean> {
        if (!this.isWeb) return false;
        const content = this.mockFiles.get(oldPath) || '';
        this.mockFiles.delete(oldPath);
        this.mockFiles.set(newPath, content);
        this.persist();
        return true;
    }

    /** Wipe all data for the current address */
    public clearCurrentWorkspace() {
        this.mockFiles.clear();
        this.mockDirs.clear();
        if (this.currentAddress) {
            localStorage.removeItem(this.key('files'));
            localStorage.removeItem(this.key('dirs'));
            localStorage.removeItem(this.key('last_project'));
        }
    }

    /**
     * @internal — Purge all legacy non-address-scoped localStorage keys.
     * NO migration — old data is deleted cleanly. Every user starts fresh
     * with their wallet address as their identity.
     */
    private _purgeLegacyKeys() {
        const LEGACY_KEYS = [
            'kortana_ide_files',
            'kortana_ide_dirs',
            'kortana_ide_last_project',
            // Also remove address-anonymous workspace root that was created before
            'kortana-workspace',
        ];
        LEGACY_KEYS.forEach(k => localStorage.removeItem(k));

        // Also scan and remove any keys that reference the old 'web-project-root' workspace
        const lastProject = localStorage.getItem(this.key('last_project'));
        if (lastProject && (
            lastProject.startsWith('web-project-root') ||
            lastProject.startsWith('kortana-workspace')
        )) {
            localStorage.removeItem(this.key('last_project'));
            localStorage.removeItem(this.key('files'));
            localStorage.removeItem(this.key('dirs'));
        }
    }
}
