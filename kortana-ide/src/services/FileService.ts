export interface FileSystemEntry {
    name: string;
    path: string;
    isDirectory: boolean;
}

export class FileService {
    private static instance: FileService;
    private isWeb: boolean;
    private mockFiles: Map<string, string> = new Map();
    private mockDirs: Set<string> = new Set();

    private constructor() {
        this.isWeb = typeof window.ipcRenderer === 'undefined';
        // Always provide mock files as a "Sandbox" option, regardless of platform
        this.mockDirs.add('web-project-root');
        this.mockDirs.add('web-project-root/contracts');
        this.mockDirs.add('web-project-root/scripts');
        this.mockFiles.set('web-project-root/contracts/MyToken.sol', '// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\ncontract MyToken {\n    string public name = "Kortana Web Token";\n}');
        // The following line was malformed in the provided edit. Assuming the intent was to keep the original mock file for Deploy.qrl.
        this.mockFiles.set('web-project-root/scripts/Deploy.qrl', 'contract Deploy {\n    function main() public {\n        // Deployment logic\n    }\n}');
    }

    public static getInstance(): FileService {
        if (!FileService.instance) {
            FileService.instance = new FileService();
        }
        return FileService.instance;
    }

    public async selectFolder(): Promise<string | null> {
        if (!this.isWeb) {
            return await window.ipcRenderer.invoke('fs:selectFolder');
        }
        return 'web-project-root';
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
        // Ensure parent dir exists in mock
        const parts = path.split('/');
        parts.pop();
        this.mockDirs.add(parts.join('/'));
        return true;
    }

    public async createFolder(path: string): Promise<boolean> {
        if (!this.isWeb) {
            return await window.ipcRenderer.invoke('fs:createFolder', path);
        }
        this.mockDirs.add(path);
        return true;
    }

    public async listDirectory(path: string): Promise<string[]> {
        if (!this.isWeb) {
            return await window.ipcRenderer.invoke('fs:getFiles', path);
        }
        // Return only direct children for mock simplification
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
        return true;
    }

    public async isDirectory(path: string): Promise<boolean> {
        if (!this.isWeb) {
            return await window.ipcRenderer.invoke('fs:isDirectory', path);
        }
        return this.mockDirs.has(path);
    }
}
