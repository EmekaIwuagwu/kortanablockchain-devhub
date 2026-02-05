export { };

declare global {
    interface Window {
        ethereum?: {
            isMetaMask?: boolean;
            request: (args: { method: string; params?: any[] }) => Promise<any>;
            on: (event: string, callback: (...args: any[]) => void) => void;
            removeListener: (event: string, callback: (...args: any[]) => void) => void;
            send: (method: string, params?: any[]) => Promise<any>;
        };
        ipcRenderer: {
            invoke: (channel: 'fs:readFile' | 'fs:writeFile' | 'fs:getFiles' | 'fs:selectFolder' | 'fs:deleteFile' | 'fs:createFolder' | 'fs:isDirectory', ...args: any[]) => Promise<any>;
            on: (channel: string, func: (...args: any[]) => void) => void;
        };
    }
}
