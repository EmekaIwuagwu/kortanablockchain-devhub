export type Language = 'solidity' | 'quorlin';

export interface ProjectFile {
    id: string;
    name: string;
    path: string;
    content: string;
    language: Language;
    isDirty: boolean;
    isOpen: boolean;
}

export interface CompilationError {
    severity: 'error' | 'warning' | 'info';
    message: string;
    line: number;
    column: number;
    file: string;
}

export interface CompilationResult {
    status: 'success' | 'error';
    timestamp: string;
    contracts: Array<{
        name: string;
        abi: any[];
        bytecode: string;
    }>;
    errors: CompilationError[];
}

export interface DeploymentConfig {
    network: 'testnet' | 'mainnet';
    contractName: string;
    gasPrice: string;
    gasLimit: string;
    constructorParams: any[];
}
