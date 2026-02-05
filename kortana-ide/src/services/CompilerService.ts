import { CompilationResult, Language } from '../types';
import { IDE_CONFIG } from '../config';

const BACKEND_URL = IDE_CONFIG.COMPILER.BACKEND_URL;

export class CompilerService {
    private static instance: CompilerService;

    private constructor() { }

    public static getInstance(): CompilerService {
        if (!CompilerService.instance) {
            CompilerService.instance = new CompilerService();
        }
        return CompilerService.instance;
    }

    /**
     * Compiles source code using the C# backend (via HTTP or IPC)
     */
    public async compile(
        language: Language,
        sourceCode: string,
        fileName: string = 'Contract',
        version: string = IDE_CONFIG.COMPILER.DEFAULT_VERSION
    ): Promise<CompilationResult> {

        // If in Electron, we could use IPC to talk to the backend process directly
        // or just use fetch since the backend is an ASP.NET Core API

        try {
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    language,
                    sourceCode,
                    version
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP Error ${response.status}`);
            }

            return await response.json();
        } catch (error: any) {
            console.error('Compilation Service Error:', error);

            // Fallback for development if backend isn't running
            if ((import.meta as any).env.DEV) {
                console.warn('Compiler backend unreachable. Using valid mock bytecode for development testing.');
                return this.getMockResult(fileName);
            }

            return {
                status: 'error',
                timestamp: new Date().toISOString(),
                contracts: [],
                errors: [{
                    severity: 'error',
                    message: `Compiler Connection Refused: ${error.message || 'Check if C# Backend is running at ' + BACKEND_URL}`,
                    line: 0,
                    column: 0,
                    file: 'root'
                }]
            };
        }
    }

    private getMockResult(fileName: string): Promise<CompilationResult> {
        // Extract a clean name from the file path
        const cleanName = fileName.split('/').pop()?.replace(/\.(sol|qrl)$/, '') || 'Contract';
        const contractName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    status: 'success',
                    timestamp: new Date().toISOString(),
                    contracts: [
                        {
                            name: contractName,
                            abi: [
                                { "inputs": [], "name": "count", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
                                { "inputs": [], "name": "increment", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
                            ],
                            bytecode: '0x608060405234801561001057600080fd5b50610150806100206000396000f3fe'
                        }
                    ],
                    errors: []
                });
            }, 800);
        });
    }
}
