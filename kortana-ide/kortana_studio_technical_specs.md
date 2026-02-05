# Kortana Studio - Technical Specifications & API Contracts

## API Endpoints (Backend - C#)

### Compilation Endpoints

#### POST `/api/v1/compile`
Compiles Solidity or Quorlin code.

**Request:**
```json
{
  "language": "solidity" | "quorlin",
  "sourceCode": "string",
  "version": "0.8.0",
  "optimization": {
    "enabled": boolean,
    "runs": number
  }
}
```

**Response (Success - 200):**
```json
{
  "status": "success",
  "timestamp": "2025-02-03T10:30:00Z",
  "compilationTime": 245,
  "contracts": [
    {
      "name": "MyContract",
      "abi": [],
      "bytecode": "0x608060...",
      "deployedBytecode": "0x608060...",
      "sourceMap": "0:100:0:-:0;...",
      "metadata": {
        "compiler": {
          "version": "0.8.19+commit.7dd6d404"
        }
      }
    }
  ],
  "errors": [],
  "warnings": [
    {
      "severity": "warning",
      "message": "State variable shadows parent contract variable",
      "line": 45,
      "column": 3,
      "file": "MyContract.sol"
    }
  ]
}
```

**Response (Error - 400):**
```json
{
  "status": "error",
  "timestamp": "2025-02-03T10:30:00Z",
  "errors": [
    {
      "severity": "error",
      "message": "Undeclared identifier",
      "line": 10,
      "column": 5,
      "file": "MyContract.sol"
    }
  ],
  "warnings": []
}
```

---

#### POST `/api/v1/compile/validate`
Lightweight syntax validation without full compilation.

**Request:**
```json
{
  "language": "solidity" | "quorlin",
  "sourceCode": "string"
}
```

**Response (200):**
```json
{
  "isValid": boolean,
  "issues": [
    {
      "type": "error" | "warning" | "info",
      "message": "string",
      "line": number,
      "column": number
    }
  ]
}
```

---

### Deployment Endpoints

#### POST `/api/v1/deploy`
Deploys compiled smart contract to blockchain.

**Request:**
```json
{
  "network": "testnet" | "mainnet",
  "contractBytecode": "0x...",
  "contractABI": [],
  "constructorParams": [
    {
      "type": "uint256",
      "value": "1000"
    }
  ],
  "gasPrice": "20",
  "gasLimit": "300000",
  "deploymentSignature": "0x...",
  "walletAddress": "0x..."
}
```

**Response (202 - Accepted):**
```json
{
  "status": "pending",
  "transactionHash": "0xabc123...",
  "estimatedGas": 250000,
  "estimatedGasPrice": "20",
  "estimatedCost": "5.0",
  "pollUrl": "/api/v1/deployment/0xabc123.../status"
}
```

---

#### GET `/api/v1/deployment/{transactionHash}/status`
Polls deployment status.

**Response (200):**
```json
{
  "transactionHash": "0xabc123...",
  "status": "pending" | "confirmed" | "failed",
  "blockNumber": 12345,
  "contractAddress": "0xdef456...",
  "gasUsed": 248500,
  "confirmations": 5,
  "timestamp": "2025-02-03T10:35:00Z"
}
```

---

### Gas Estimation

#### POST `/api/v1/gas/estimate`
Estimates gas for deployment or function call.

**Request:**
```json
{
  "network": "testnet" | "mainnet",
  "type": "deployment" | "call",
  "contractAddress": "0x...",
  "functionSignature": "transfer(address,uint256)",
  "parameters": []
}
```

**Response (200):**
```json
{
  "estimatedGas": 65000,
  "currentGasPrice": "20",
  "estimatedCostETH": "0.0013",
  "estimatedCostUSD": "2.50"
}
```

---

### Network & RPC Endpoints

#### GET `/api/v1/network/status`
Returns current network and RPC status.

**Response (200):**
```json
{
  "testnet": {
    "name": "Kortana Testnet",
    "rpcUrl": "https://poseidon-rpc.kortana.worcester.xyz/",
    "chainId": 50,
    "isHealthy": true,
    "latency": 245,
    "blockHeight": 1234567
  },
  "mainnet": {
    "name": "Kortana Mainnet",
    "rpcUrl": "https://kortana-rpc.example.com/",
    "chainId": 49,
    "isHealthy": false,
    "latency": null,
    "blockHeight": null,
    "reason": "Not yet deployed"
  }
}
```

---

#### POST `/api/v1/rpc/call`
Direct RPC proxy for Web3 calls.

**Request:**
```json
{
  "network": "testnet",
  "method": "eth_call",
  "params": ["0xContractAddress", "0xEncodedFunctionCall"]
}
```

**Response (200):**
```json
{
  "result": "0x...",
  "blockNumber": 1234567
}
```

---

### Project Management

#### GET `/api/v1/projects`
Lists all user projects.

**Response (200):**
```json
{
  "projects": [
    {
      "id": "proj_123abc",
      "name": "MyToken",
      "language": "solidity",
      "createdAt": "2025-02-01T...",
      "lastModified": "2025-02-03T...",
      "deployments": [
        {
          "network": "testnet",
          "address": "0x...",
          "blockNumber": 12345,
          "timestamp": "2025-02-03T10:35:00Z"
        }
      ]
    }
  ]
}
```

---

#### POST `/api/v1/projects`
Creates new project.

**Request:**
```json
{
  "name": "MyToken",
  "language": "solidity",
  "template": "blank" | "hello-world" | "erc20"
}
```

**Response (201):**
```json
{
  "id": "proj_123abc",
  "name": "MyToken",
  "language": "solidity",
  "template": "blank",
  "createdAt": "2025-02-03T10:30:00Z"
}
```

---

#### GET `/api/v1/projects/{projectId}`
Retrieves project details and files.

**Response (200):**
```json
{
  "id": "proj_123abc",
  "name": "MyToken",
  "language": "solidity",
  "files": [
    {
      "path": "src/MyToken.sol",
      "content": "pragma solidity ^0.8.0;\n...",
      "lastModified": "2025-02-03T10:30:00Z"
    }
  ],
  "config": {
    "compilerVersion": "0.8.19",
    "optimization": {
      "enabled": true,
      "runs": 200
    }
  }
}
```

---

#### PUT `/api/v1/projects/{projectId}/files/{filePath}`
Saves/updates file content.

**Request:**
```json
{
  "content": "pragma solidity ^0.8.0;\n..."
}
```

**Response (200):**
```json
{
  "path": "src/MyToken.sol",
  "lastModified": "2025-02-03T10:35:00Z",
  "size": 2048
}
```

---

## Frontend Component API & Props

### EditorComponent
```typescript
interface EditorProps {
  language: 'solidity' | 'quorlin';
  value: string;
  onChange: (code: string) => void;
  onCompile?: () => void;
  onDeploy?: () => void;
  readOnly?: boolean;
  theme?: 'dark' | 'light';
}
```

---

### CompilerPanel
```typescript
interface CompilerPanelProps {
  status: 'idle' | 'compiling' | 'success' | 'error';
  errors: CompilationError[];
  warnings: CompilationWarning[];
  compilationTime?: number;
  onErrorClick?: (error: CompilationError) => void;
}

interface CompilationError {
  severity: 'error' | 'warning';
  message: string;
  line: number;
  column: number;
  file: string;
}
```

---

### DeploymentModal
```typescript
interface DeploymentModalProps {
  isOpen: boolean;
  network: 'testnet' | 'mainnet';
  contractName: string;
  estimatedGas: number;
  constructorParams?: ConstructorParam[];
  onConfirm: (deployment: DeploymentConfig) => void;
  onCancel: () => void;
}

interface DeploymentConfig {
  network: 'testnet' | 'mainnet';
  gasPrice: string;
  gasLimit: string;
  constructorParams: any[];
}
```

---

### ContractInteractionPanel
```typescript
interface ContractInteractionPanelProps {
  contractAddress: string;
  contractABI: any[];
  network: 'testnet' | 'mainnet';
  onFunctionCall: (result: FunctionResult) => void;
  loading?: boolean;
}

interface FunctionResult {
  functionName: string;
  parameters: any[];
  result: any;
  gasUsed?: number;
  transactionHash?: string;
  timestamp: Date;
}
```

---

### EventLog
```typescript
interface EventLogProps {
  events: ContractEvent[];
  filters?: EventFilter[];
  onFilterChange?: (filters: EventFilter[]) => void;
  autoScroll?: boolean;
}

interface ContractEvent {
  eventName: string;
  parameters: Record<string, any>;
  transactionHash: string;
  blockNumber: number;
  logIndex: number;
  timestamp: Date;
}
```

---

## Data Models (TypeScript Interfaces)

### Project
```typescript
interface Project {
  id: string;
  name: string;
  language: 'solidity' | 'quorlin';
  description?: string;
  createdAt: Date;
  lastModified: Date;
  files: ProjectFile[];
  deployments: Deployment[];
  config: ProjectConfig;
}

interface ProjectFile {
  id: string;
  path: string;
  name: string;
  extension: 'sol' | 'qrl';
  content: string;
  lastModified: Date;
  isDirty: boolean;
}

interface ProjectConfig {
  compilerVersion: string;
  optimization: {
    enabled: boolean;
    runs: number;
  };
  network: 'testnet' | 'mainnet';
}
```

---

### Compilation
```typescript
interface CompilationRequest {
  language: 'solidity' | 'quorlin';
  sourceCode: string;
  version: string;
  optimization: {
    enabled: boolean;
    runs: number;
  };
}

interface CompilationResult {
  status: 'success' | 'error';
  timestamp: Date;
  compilationTime: number;
  contracts: CompiledContract[];
  errors: CompilationIssue[];
  warnings: CompilationIssue[];
}

interface CompiledContract {
  name: string;
  abi: any[];
  bytecode: string;
  deployedBytecode: string;
  sourceMap: string;
  metadata: any;
}

interface CompilationIssue {
  severity: 'error' | 'warning' | 'info';
  message: string;
  line: number;
  column: number;
  file: string;
}
```

---

### Deployment
```typescript
interface Deployment {
  id: string;
  projectId: string;
  network: 'testnet' | 'mainnet';
  contractName: string;
  contractAddress: string;
  transactionHash: string;
  blockNumber: number;
  gasUsed: number;
  timestamp: Date;
  constructorParams: any[];
  abi: any[];
  status: 'pending' | 'confirmed' | 'failed';
}

interface DeploymentRequest {
  network: 'testnet' | 'mainnet';
  contractBytecode: string;
  contractABI: any[];
  constructorParams: any[];
  gasPrice: string;
  gasLimit: string;
}

interface DeploymentResult {
  status: 'pending' | 'confirmed' | 'failed';
  transactionHash: string;
  contractAddress?: string;
  blockNumber?: number;
  gasUsed?: number;
  confirmations: number;
}
```

---

### Network Configuration
```typescript
interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  isTestnet: boolean;
  blockExplorerUrl?: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

const NETWORKS: Record<'testnet' | 'mainnet', NetworkConfig> = {
  testnet: {
    name: 'Kortana Testnet',
    chainId: 50,
    rpcUrl: 'https://poseidon-rpc.kortana.worcester.xyz/',
    isTestnet: true,
    blockExplorerUrl: 'https://explorer-testnet.kortana.xyz/',
    nativeCurrency: {
      name: 'Kortana',
      symbol: 'KOR',
      decimals: 18
    }
  },
  mainnet: {
    name: 'Kortana Mainnet',
    chainId: 49,
    rpcUrl: 'https://kortana-rpc.xyz/', // To be updated
    isTestnet: false,
    nativeCurrency: {
      name: 'Kortana',
      symbol: 'KOR',
      decimals: 18
    }
  }
};
```

---

## State Management (Redux Store Structure)

```typescript
interface RootState {
  editor: EditorState;
  compiler: CompilerState;
  deployment: DeploymentState;
  project: ProjectState;
  network: NetworkState;
  ui: UIState;
}

interface EditorState {
  currentFileId: string;
  content: string;
  isDirty: boolean;
  language: 'solidity' | 'quorlin';
  selectedText: string;
  cursorPosition: { line: number; column: number };
}

interface CompilerState {
  status: 'idle' | 'compiling' | 'success' | 'error';
  result?: CompilationResult;
  isOptimizing: boolean;
  compilationTime?: number;
}

interface DeploymentState {
  status: 'idle' | 'waiting-for-wallet' | 'deploying' | 'success' | 'error';
  currentDeployment?: Deployment;
  transactionHash?: string;
  contractAddress?: string;
  error?: string;
  history: Deployment[];
}

interface ProjectState {
  currentProject?: Project;
  projects: Project[];
  isLoading: boolean;
  error?: string;
}

interface NetworkState {
  selected: 'testnet' | 'mainnet';
  config: NetworkConfig;
  isHealthy: boolean;
  latency: number;
  blockHeight: number;
}

interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  rightPanelOpen: boolean;
  activeTab: 'compiler' | 'testing' | 'logs';
  notifications: Notification[];
  isModalOpen: boolean;
}
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+B` (Windows/Linux) or `Cmd+Shift+B` (Mac) | Compile Project |
| `Ctrl+Shift+D` (Windows/Linux) or `Cmd+Shift+D` (Mac) | Open Deploy Modal |
| `Ctrl+K Ctrl+0` | Collapse All Folders |
| `Ctrl+K Ctrl+J` | Expand All Folders |
| `Ctrl+/` | Toggle Comment |
| `Alt+Shift+F` | Format Document |
| `Ctrl+S` | Save File |
| `Ctrl+Shift+S` | Save All |
| `Ctrl+P` | Go to File |
| `Ctrl+Shift+P` | Command Palette |
| `F1` | Show Help |

---

## Error Codes & Messages

| Code | Message | Solution |
|------|---------|----------|
| `COMPILE_001` | Syntax Error in {file}:{line} | Check syntax at specified location |
| `COMPILE_002` | Undeclared identifier '{name}' | Ensure all variables are declared |
| `COMPILE_003` | Version mismatch | Update compiler version |
| `DEPLOY_001` | Wallet not connected | Connect wallet via MetaMask |
| `DEPLOY_002` | Insufficient gas | Increase gas limit or check balance |
| `DEPLOY_003` | RPC connection failed | Check network and retry |
| `DEPLOY_004` | Transaction rejected | User rejected in wallet |
| `RPC_001` | Network timeout | Check connection and retry |
| `RPC_002` | Invalid RPC response | RPC endpoint may be down |

---

## Testing Scenarios

### Unit Test Examples

#### Compiler Tests
```typescript
describe('SolidityCompiler', () => {
  test('should compile valid Solidity code', async () => {
    const code = 'pragma solidity ^0.8.0; contract Test {}';
    const result = await compiler.compile(code);
    expect(result.status).toBe('success');
  });

  test('should catch syntax errors', async () => {
    const code = 'pragma solidity ^0.8.0; contract Test {';
    const result = await compiler.compile(code);
    expect(result.status).toBe('error');
    expect(result.errors).toHaveLength(1);
  });
});
```

#### Deployment Tests
```typescript
describe('DeploymentService', () => {
  test('should deploy contract to testnet', async () => {
    const deployment = await deploymentService.deploy({
      network: 'testnet',
      contractBytecode: '0x...',
      contractABI: []
    });
    expect(deployment.status).toBe('pending');
    expect(deployment.transactionHash).toBeDefined();
  });

  test('should handle RPC failures gracefully', async () => {
    // Mock RPC failure
    const deployment = deploymentService.deploy({...});
    expect(deployment).rejects.toThrow('RPC connection failed');
  });
});
```

---

## Security Considerations

1. **Key Management**: Never store private keys in frontend. All signing happens in wallet.
2. **Input Validation**: Validate all code and parameter inputs before sending to backend.
3. **HTTPS Only**: All RPC and API communication over HTTPS.
4. **Rate Limiting**: Implement rate limits on compilation and deployment endpoints.
5. **Code Isolation**: Use Web Workers for heavy compilation tasks to prevent UI freezing.
6. **Secret Management**: Store RPC URLs and API keys in secure environment variables.

---

## Monitoring & Logging

### Log Levels
- **ERROR**: Critical failures requiring user attention
- **WARN**: Non-critical issues (e.g., deprecated function)
- **INFO**: Significant events (compilation started, deployment confirmed)
- **DEBUG**: Detailed information for troubleshooting

### Key Metrics to Track
- Compilation success rate
- Average compilation time
- Deployment success rate
- RPC endpoint availability
- Average transaction confirmation time
- User session duration
- Feature usage frequency

