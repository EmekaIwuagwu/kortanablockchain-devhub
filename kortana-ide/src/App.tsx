import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Files,
    Play,
    Settings,
    ChevronDown,
    ChevronRight,
    ShieldCheck,
    Cpu,
    Globe,
    Loader2,
    Beaker,
    AlertCircle,
    FilePlus,
    FolderPlus,
    X,
    Trash2,
    RotateCcw,
    Edit3,
    Plus,
    Rocket,
    Zap,
    Search,
} from 'lucide-react';
import { RootState, AppDispatch } from './store';
import {
    setSidebarTab,
    setActiveFile,
    openProject,
    saveActiveFile,
    createNewFile,
    closeFile,
    createNewProject,
    deleteFile,
    renameFile,
    loadLastProject,
    loadWorkspace,
    clearWorkspace,
    undoLastChange,
} from './store/slices/editorSlice';
import { compileCode, setLanguage } from './store/slices/compilerSlice';
import { resetStatus } from './store/slices/deploymentSlice';
import { connectWallet, connectWithPrivateKey, switchNetwork } from './store/slices/walletSlice';
import CodeEditor from './components/CodeEditor';
import DeploymentModal from './components/DeploymentModal';
import InteractionPanel from './components/InteractionPanel';
import TestPanel from './components/TestPanel';
import SplashScreen from './components/SplashScreen';
import NewProjectModal from './components/NewProjectModal';

// ─────────────────────────────────────────────
// Context Menu Types
// ─────────────────────────────────────────────
type ContextTarget = 'folder' | 'file';
interface ContextMenuState {
    x: number;
    y: number;
    target: ContextTarget;
    fileId?: string;
}

// ─────────────────────────────────────────────
// Boilerplate Snippets
// ─────────────────────────────────────────────
const SOLIDITY_BOILERPLATE = (contractName: string) => `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ${contractName}
 * @dev Kortana Smart Contract — Ready for deployment on Kortana Network
 */
contract ${contractName} {
    address public owner;
    string public name = "${contractName}";
    uint256 public value;

    event ValueSet(address indexed setter, uint256 newValue);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function setValue(uint256 _value) public onlyOwner {
        value = _value;
        emit ValueSet(msg.sender, _value);
    }

    function getValue() public view returns (uint256) {
        return value;
    }
}`;

const QUORLIN_BOILERPLATE = (contractName: string) => `// Quorlin Script — Kortana Network
// ${contractName}.ql

contract ${contractName} {
    // State variables
    address public owner;
    uint256 public state;

    // Initialize contract
    function init() public {
        owner = msg.sender;
        state = 0;
    }

    // Main execution entry point
    function run() public {
        // Your logic here
    }

    // Read current state
    function getState() public view returns (uint256) {
        return state;
    }
}`;

// ─────────────────────────────────────────────
// Main App Component
// ─────────────────────────────────────────────
const App: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();

    const { files, activeFileId, sidebarActiveTab, projectPath, projectLanguage } = useSelector((state: RootState) => state.editor);
    const { status: compilerStatus, lastResult } = useSelector((state: RootState) => state.compiler);
    const { lastDeployment } = useSelector((state: RootState) => state.deployment);
    const { isConnected, address: walletAddress, isConnecting, error: walletError, currentNetwork, walletType } = useSelector((state: RootState) => state.wallet);

    const [isLoading, setIsLoading] = useState(true);
    const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(false);
    const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
    const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
    const [consoleTab, setConsoleTab] = useState<'output' | 'console' | 'problems' | 'interact'>('output');
    const [menuOpen, setMenuOpen] = useState<string | null>(null);
    const [deployTab, setDeployTab] = useState<'compile' | 'interact'>('compile');
    const [privateKeyInput, setPrivateKeyInput] = useState('');
    const [showPKInput, setShowPKInput] = useState(false);
    const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
    const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const [consoleLogs, setConsoleLogs] = useState<{ type: 'info' | 'success' | 'error' | 'warn'; msg: string }[]>([
        { type: 'info', msg: '[SYSTEM] Kortana Studio v1.0.4 — Engine Initialized' },
        { type: 'info', msg: '[IDE] Connect your wallet to access your workspace.' },
    ]);

    const activeFile = files.find(f => f.id === activeFileId);
    const openFiles = files.filter(f => f.isOpen);

    // Splash screen only
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 2500);
        return () => clearTimeout(timer);
    }, [dispatch]);

    // ─── Wallet-as-Identity: load workspace when address is set ────────────────
    useEffect(() => {
        if (walletAddress) {
            setIsWorkspaceLoading(true);
            addLog('info', `[AUTH] Wallet connected: ${walletAddress}`);
            addLog('info', '[WORKSPACE] Restoring your workspace...');
            dispatch(loadWorkspace(walletAddress)).then(() => {
                setIsWorkspaceLoading(false);
                addLog('success', '[WORKSPACE] Workspace loaded successfully.');
            });
        } else {
            // Wallet disconnected — clear in-memory state
            dispatch(clearWorkspace());
            setConsoleLogs([
                { type: 'info', msg: '[SYSTEM] Kortana Studio v1.0.4 — Engine Initialized' },
                { type: 'info', msg: '[IDE] Connect your wallet to access your workspace.' },
            ]);
        }
    }, [walletAddress, dispatch]);

    useEffect(() => {
        if (lastDeployment) {
            setDeployTab('interact');
            setConsoleTab('interact');
            addLog('success', `✅ Contract deployed at: ${lastDeployment.address}`);
        }
    }, [lastDeployment]);

    useEffect(() => {
        if (compilerStatus === 'success') addLog('success', '✅ Compilation Successful — 0 Errors, 0 Warnings');
        if (compilerStatus === 'error') addLog('error', '❌ Compilation Failed — Check Problems tab');
    }, [compilerStatus]);

    // ─── Global mouse/key handlers ────────────────────────────
    useEffect(() => {
        const handleClick = () => { setMenuOpen(null); setContextMenu(null); };
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 's') { e.preventDefault(); dispatch(saveActiveFile()); }
            if (e.ctrlKey && e.key === 'z') { e.preventDefault(); dispatch(undoLastChange()); }
        };
        window.addEventListener('click', handleClick);
        window.addEventListener('keydown', handleKeyDown);
        return () => { window.removeEventListener('click', handleClick); window.removeEventListener('keydown', handleKeyDown); };
    }, [dispatch]);

    // ─── Helpers ──────────────────────────────
    const addLog = (type: 'info' | 'success' | 'error' | 'warn', msg: string) => {
        setConsoleLogs(prev => [...prev.slice(-99), { type, msg }]);
    };

    const handleCompile = async () => {
        if (!activeFile) return;
        const lang = projectLanguage || (activeFile.name.endsWith('.sol') ? 'solidity' : 'quorlin');
        addLog('info', `[COMPILE] Dispatching ${activeFile.name} to Kortana compiler...`);
        await dispatch(compileCode({ language: lang as any, sourceCode: activeFile.content, fileName: activeFile.name }));
    };

    const handleNewProject = () => { setIsNewProjectModalOpen(true); setMenuOpen(null); };

    const handleCreateProject = (name: string, language: 'solidity' | 'quorlin') => {
        dispatch(createNewProject({ projectName: name, language }));
        dispatch(setLanguage(language));
        dispatch(setSidebarTab('files'));
        setIsNewProjectModalOpen(false);
        addLog('success', `[PROJECT] "${name}" initialized as ${language.toUpperCase()} project.`);
    };

    // ─── Context Menu ─────────────────────────
    const handleFolderContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, target: 'folder' });
    };

    const handleFileContextMenu = (e: React.MouseEvent, fileId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, target: 'file', fileId });
    };

    const handleCreateNewFileFromContext = () => {
        if (!projectPath) return;
        const ext = projectLanguage === 'solidity' ? '.sol' : '.ql';
        const raw = prompt(`New ${projectLanguage === 'solidity' ? 'Solidity Contract' : 'Quorlin Script'} name:`);
        if (!raw) { setContextMenu(null); return; }
        const fileName = raw.endsWith(ext) ? raw : `${raw}${ext}`;
        const contractName = raw.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_]/g, '') || 'MyContract';
        const content = projectLanguage === 'solidity'
            ? SOLIDITY_BOILERPLATE(contractName)
            : QUORLIN_BOILERPLATE(contractName);
        dispatch(createNewFile({ name: fileName, content }));
        addLog('success', `[FILE] Created ${fileName}`);
        dispatch(setSidebarTab('files'));
        setContextMenu(null);
    };

    const handleDeleteFromContext = () => {
        if (!contextMenu?.fileId) return;
        const file = files.find(f => f.id === contextMenu.fileId);
        if (!file) return;
        if (confirm(`Delete "${file.name}"? This cannot be undone.`)) {
            dispatch(deleteFile(contextMenu.fileId));
            addLog('warn', `[FILE] Deleted ${file.name}`);
        }
        setContextMenu(null);
    };

    const handleStartRename = () => {
        if (!contextMenu?.fileId) return;
        const file = files.find(f => f.id === contextMenu.fileId);
        if (!file) return;
        setRenamingFileId(contextMenu.fileId);
        setRenameValue(file.name);
        setContextMenu(null);
    };

    const handleRenameSubmit = (fileId: string) => {
        if (renameValue.trim()) {
            const ext = projectLanguage === 'solidity' ? '.sol' : '.ql';
            const newName = renameValue.endsWith(ext) ? renameValue : `${renameValue}${ext}`;
            dispatch(renameFile({ fileId, newName }));
            addLog('info', `[FILE] Renamed to ${newName}`);
        }
        setRenamingFileId(null);
    };

    const handleDeleteFile = (e: React.MouseEvent, fileId: string) => {
        e.stopPropagation();
        const file = files.find(f => f.id === fileId);
        if (!file) return;
        if (confirm(`Delete "${file.name}"?`)) {
            dispatch(deleteFile(fileId));
            addLog('warn', `[FILE] Deleted ${file.name}`);
        }
    };

    if (isLoading) return <SplashScreen />;

    // ─────────────────────────────────────────────────────────────────────────
    // WALLET LANDING PAGE — shown when no wallet is connected
    // This is the "front door" of the IDE. The user MUST connect to access it.
    // ─────────────────────────────────────────────────────────────────────────
    if (isLoading) return <SplashScreen />;

    // ─────────────────────────────────────────────────────────────────────────
    // WALLET LANDING PAGE — Beautiful premium entry point
    // ─────────────────────────────────────────────────────────────────────────
    if (!isConnected) {
        return (
            <div className="h-screen w-screen bg-[#020408] flex flex-col items-center justify-center overflow-hidden relative font-sans">
                {/* Visual Elements: Animated backgrounds and gradients */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px]" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] contrast-150" />
                </div>

                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center max-w-lg w-full px-10">
                    {/* Main Branding */}
                    <div className="flex flex-col items-center mb-10 animate-in fade-in zoom-in duration-1000">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 animate-pulse" />
                            <img
                                src="/logo.png"
                                alt="Kortana Logo"
                                className="w-20 h-20 md:w-28 md:h-28 relative z-10 drop-shadow-[0_0_25px_rgba(79,70,229,0.4)]"
                            />
                        </div>
                        <div className="text-center">
                            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
                                Kortana Studio
                            </h1>
                            <div className="flex items-center justify-center space-x-2">
                                <span className="h-px w-6 md:w-8 bg-indigo-500/50" />
                                <p className="text-[10px] md:text-[12px] text-indigo-400 uppercase tracking-[0.4em] font-bold">The Next Generation IDE</p>
                                <span className="h-px w-6 md:w-8 bg-indigo-500/50" />
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-[32px] p-8 shadow-2xl space-y-8 animate-in slide-in-from-bottom-8 duration-700 delay-200">
                        <div className="text-center space-y-2">
                            <h2 className="text-xl font-semibold text-white/90">Welcome back</h2>
                            <p className="text-sm text-white/50 leading-relaxed px-4">
                                Connect your wallet to access your private workspace and resume your blockchain projects.
                            </p>
                        </div>

                        <div className="grid gap-4">
                            {/* Kortana Wallet - Primary Action */}
                            <button
                                onClick={() => dispatch(connectWallet('kortana'))}
                                disabled={isConnecting}
                                className="group relative w-full h-[64px] rounded-2xl overflow-hidden transition-all active:scale-[0.98] disabled:opacity-70"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-700 group-hover:from-indigo-500 group-hover:to-indigo-600 transition-all" />
                                <div className="relative flex items-center justify-center space-x-4 text-white">
                                    {isConnecting ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                                            <Zap size={18} fill="currentColor" />
                                        </div>
                                    )}
                                    <span className="text-[15px] font-bold tracking-wide">Connect Kortana Wallet</span>
                                </div>
                            </button>

                            {/* MetaMask - Secondary Action */}
                            <button
                                onClick={() => dispatch(connectWallet('metamask'))}
                                disabled={isConnecting}
                                className="w-full h-[64px] rounded-2xl bg-white/[0.05] border border-white/[0.1] hover:bg-white/[0.1] transition-all flex items-center justify-center space-x-4 text-white/80 active:scale-[0.98] disabled:opacity-70 group"
                            >
                                {isConnecting ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <svg width="24" height="24" viewBox="0 0 256 240" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
                                        <path d="M239.066 14.505l-95.213 77.305 28.016-52.007L128 0l-43.869 39.803 28.016 52.007-95.213-77.305 13.568 113.111 25.132 23.447L29.351 161.4l51.914 36.335L128 240l46.735-42.265 51.914-36.335-26.283-10.342 25.132-23.447 13.568-113.111z" fill="#E2761B" />
                                        <path d="M37.6 151.72l43.665 30.56L128 221.789l46.735-39.509 43.665-30.56L128 174.19l-90.4 22.47z" fill="#E4761B" />
                                        <path d="M128 119.55l-2.022-26.68L128 94.137l2.022-1.267z" fill="#D7C1B3" />
                                        <path d="M85.748 119.55l-3.37-44.468L128 94.137l45.622-19.055-3.371 44.468L128 136.56l-42.252-17.01z" fill="#233447" />
                                        <path d="M27.329 127.616l25.132 23.447L29.351 161.4l-2.022-33.784zm174.209 0l-2.022 33.784-23.115-10.337 25.137-23.447z" fill="#CD7E2E" />
                                        <path d="M37.6 151.72L128 174.19l-33.784-36.43zm180.8 0l-90.4 22.47 33.784-36.43z" fill="#763D16" />
                                        <path d="M128 174.19l90.4-22.47L128 240l-90.4-88.28z" fill="#333" />
                                    </svg>
                                )}
                                <span className="text-[15px] font-bold tracking-wide">Continue with MetaMask</span>
                            </button>
                        </div>

                        {/* Private Key Divider */}
                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/[0.06]"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 bg-transparent px-4">
                                or use specialized access
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={() => setShowPKInput(!showPKInput)}
                                className="w-full py-2 text-[11px] font-bold text-white/30 hover:text-white/60 transition-all flex items-center justify-center space-x-2"
                            >
                                <Settings size={12} />
                                <span>{showPKInput ? 'CANCEL ACCESS' : 'CONNECT WITH PRIVATE KEY'}</span>
                            </button>

                            {showPKInput && (
                                <div className="space-y-3 animate-in slide-in-from-top-4 duration-300">
                                    <input
                                        type="password"
                                        placeholder="Enter your private key (0x...)"
                                        value={privateKeyInput}
                                        onChange={e => setPrivateKeyInput(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-indigo-500/50 placeholder:text-white/20 transition-all font-mono"
                                    />
                                    <button
                                        onClick={() => { if (privateKeyInput) dispatch(connectWithPrivateKey(privateKeyInput)); }}
                                        className="w-full py-3 bg-white text-black rounded-xl text-[13px] font-black hover:bg-white/90 transition-all"
                                    >
                                        VERIFY & ACCESS
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {walletError && (
                        <div className="mt-6 w-full p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start space-x-3 text-[12px] text-red-400 animate-in shake duration-500">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <p className="font-medium">{walletError}</p>
                        </div>
                    )}

                    {/* Bottom Status */}
                    <div className="mt-12 flex flex-col items-center space-y-4">
                        <div className="px-4 py-1.5 rounded-full border border-white/5 bg-white/[0.02] flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                            <span className="text-[10px] text-white/40 uppercase tracking-widest font-black">Mainnet & Testnet Active</span>
                        </div>
                        <p className="text-[10px] text-white/20 tracking-widest">© 2026 KORTANA PROTOCOL FOUNDATION</p>
                    </div>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // WORKSPACE LOADING OVERLAY — loading the address's project data
    // ─────────────────────────────────────────────────────────────────────────
    if (isWorkspaceLoading) {
        return (
            <div className="h-screen w-screen bg-[#060709] flex flex-col items-center justify-center font-sans space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <Loader2 size={28} className="text-indigo-400 animate-spin" />
                </div>
                <div className="text-center space-y-1">
                    <p className="text-[14px] font-bold text-white">Restoring Your Workspace</p>
                    <p className="text-[11px] text-white/40 font-mono">{walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}</p>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────
    // MAIN IDE RENDER
    // ─────────────────────────────────────────────
    return (
        <div className="flex flex-col h-screen w-screen bg-vscode-bg font-sans overflow-hidden animate-fade-in text-vscode-text" onContextMenu={e => e.preventDefault()}>

            {/* ══════════ TITLE BAR ══════════ */}
            <div className="h-8 bg-vscode-sidebar/95 border-b border-white/5 flex items-center px-4 text-[12px] select-none z-[100] justify-between">
                <div className="flex items-center space-x-1 mr-4">
                    <div className="w-4 h-4 rounded-sm bg-indigo-600 flex items-center justify-center mr-2">
                        <Zap size={10} className="text-white" />
                    </div>
                    {/* Menu System */}
                    <div className="flex items-center space-x-1">
                        {/* File Menu */}
                        <div className="relative">
                            <span
                                className={`cursor-pointer px-2 py-1 rounded hover:bg-white/10 ${menuOpen === 'file' ? 'bg-white/10' : ''}`}
                                onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === 'file' ? null : 'file'); }}
                            >File</span>
                            {menuOpen === 'file' && (
                                <div className="absolute top-full left-0 mt-1 w-52 bg-vscode-sidebar border border-white/10 shadow-2xl rounded-md py-1 z-[200] glass-panel">
                                    <div className="px-3 py-1.5 hover:bg-vscode-accent text-white cursor-pointer flex justify-between items-center" onClick={handleNewProject}>
                                        <span>New Project...</span>
                                        <span className="opacity-50 text-[10px]">Ctrl+Shift+N</span>
                                    </div>
                                    <div className="h-[1px] bg-white/5 my-1" />
                                    <div className="px-3 py-1.5 hover:bg-vscode-accent text-white cursor-pointer flex justify-between items-center" onClick={() => { dispatch(saveActiveFile()); setMenuOpen(null); }}>
                                        <span>Save</span>
                                        <span className="opacity-50 text-[10px]">Ctrl+S</span>
                                    </div>
                                    <div className="h-[1px] bg-white/5 my-1" />
                                    <div className="px-3 py-1.5 hover:bg-red-500/20 text-red-400 cursor-pointer" onClick={() => {
                                        if (confirm('Clear workspace? This will remove ALL local data.')) {
                                            dispatch(clearWorkspace());
                                            localStorage.clear();
                                            addLog('warn', '[WORKSPACE] Cleared. All local data removed.');
                                        }
                                        setMenuOpen(null);
                                    }}>
                                        Clear Workspace
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Edit Menu */}
                        <div className="relative">
                            <span
                                className={`cursor-pointer px-2 py-1 rounded hover:bg-white/10 ${menuOpen === 'edit' ? 'bg-white/10' : ''}`}
                                onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === 'edit' ? null : 'edit'); }}
                            >Edit</span>
                            {menuOpen === 'edit' && (
                                <div className="absolute top-full left-0 mt-1 w-52 bg-vscode-sidebar border border-white/10 shadow-2xl rounded-md py-1 z-[200] glass-panel">
                                    <div className="px-3 py-1.5 hover:bg-vscode-accent text-white cursor-pointer flex justify-between items-center" onClick={() => { dispatch(undoLastChange()); setMenuOpen(null); }}>
                                        <span>Undo</span>
                                        <span className="opacity-50 text-[10px]">Ctrl+Z</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        {typeof window.ipcRenderer !== 'undefined' && (
                            <button
                                onClick={() => window.open('http://localhost:3000', '_blank')}
                                className="ml-4 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all text-[11px] font-bold border border-indigo-500/20 shadow-lg animate-pulse hover:animate-none"
                            >
                                Open Web IDE
                            </button>
                        )}
                    </div>
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 text-vscode-muted font-bold tracking-widest pointer-events-none uppercase text-[9px] flex items-center space-x-2">
                    <span className="text-indigo-400 opacity-50">Kortana Studio</span>
                    <span className="w-1 h-1 bg-white/20 rounded-full" />
                    <span>{projectPath ? projectPath.split(/[/\\]/).pop() : 'No Project'}</span>
                </div>

                <div className="flex items-center space-x-4">
                    <div
                        className={`flex items-center space-x-2 px-3 py-0.5 rounded-full text-[10px] font-bold cursor-help group relative ${isConnected ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-vscode-error/10 text-vscode-error border border-vscode-error/20'}`}
                        title={walletError || ''}
                    >
                        <div className={`w-1 h-1 rounded-full ${isConnected ? 'bg-indigo-400' : 'bg-vscode-error animate-pulse'}`} />
                        <span>{isConnected ? `${walletType === 'metamask' ? '🦊 MetaMask' : walletType === 'kortana' ? '⚡ Kortana Wallet' : '🔑 Private Key'} • ${walletAddress?.slice(0, 6)}...${walletAddress?.slice(-4)}` : isConnecting ? 'Connecting...' : 'No Wallet'}</span>
                        {walletError && (
                            <div className="absolute top-full right-0 mt-2 w-64 bg-vscode-sidebar/95 backdrop-blur-xl border border-vscode-error/30 p-3 rounded-lg text-[10px] text-vscode-error shadow-2xl z-[200] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <div className="font-bold flex items-center mb-1"><AlertCircle size={10} className="mr-1" /> Connection Error</div>
                                {walletError}
                            </div>
                        )}
                    </div>
                    <div className="flex space-x-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                    </div>
                </div>
            </div>

            {/* ══════════ MAIN WORKSPACE LAYOUT ══════════ */}
            <div className="flex flex-grow overflow-hidden relative">

                {/* Left Sidebar — Activity Bar */}
                <div className="w-12 md:w-14 bg-vscode-sidebar border-r border-white/5 flex flex-col items-center py-4 space-y-4 shrink-0">
                    <SidebarIcon icon={<Files size={20} />} active={sidebarActiveTab === 'files'} onClick={() => dispatch(setSidebarTab('files'))} />
                    <SidebarIcon icon={<Rocket size={20} />} active={sidebarActiveTab === 'deploy'} onClick={() => dispatch(setSidebarTab('deploy'))} />
                    <SidebarIcon icon={<ShieldCheck size={20} />} active={sidebarActiveTab === 'tests'} onClick={() => dispatch(setSidebarTab('tests'))} />
                    <div className="flex-grow" />
                    <div className="activity-item text-vscode-muted hover:text-white group" title="Settings">
                        <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                    </div>
                </div>

                {/* ── Left Sidebar ── */}
                <div className="w-64 bg-vscode-sidebar/80 backdrop-blur-lg border-r border-white/5 flex flex-col overflow-hidden shrink-0">

                    {/* ── FILES Tab ── */}
                    {sidebarActiveTab === 'files' && (
                        <div className="flex flex-col h-full">
                            <div className="h-9 flex items-center justify-between px-4 text-[10px] font-bold text-vscode-muted uppercase tracking-[0.2em] border-b border-white/5 bg-white/2 shrink-0">
                                <span>Explorer</span>
                                <div className="flex items-center space-x-2">
                                    {projectPath && (
                                        <span title="New File">
                                            <FilePlus
                                                size={14}
                                                className="cursor-pointer hover:text-white"
                                                onClick={e => { e.stopPropagation(); handleCreateNewFileFromContext(); }}
                                            />
                                        </span>
                                    )}
                                    <span title="New Project">
                                        <FolderPlus
                                            size={14}
                                            className="cursor-pointer hover:text-white"
                                            onClick={handleNewProject}
                                        />
                                    </span>
                                </div>
                            </div>
                            <div className="flex-grow overflow-y-auto custom-scrollbar">
                                {projectPath ? (
                                    <div className="animate-fade-in py-1">
                                        {/* Project Folder Header — right-click for folder context menu */}
                                        <div
                                            className="sidebar-item active group cursor-pointer select-none"
                                            onContextMenu={handleFolderContextMenu}
                                        >
                                            <ChevronDown size={14} className="mr-2 text-vscode-accent shrink-0" />
                                            <span className="text-white text-[11px] font-bold uppercase truncate flex-grow">
                                                {projectPath.split(/[/\\]/).pop()}
                                            </span>
                                            <span className="text-[8px] px-1 py-0.5 rounded bg-indigo-500/20 text-indigo-400 uppercase shrink-0">
                                                {projectLanguage === 'solidity' ? 'SOL' : 'QRL'}
                                            </span>
                                        </div>

                                        {/* contracts/ sub-folder label */}
                                        {(files.length > 0 || true) && (
                                            <div
                                                className="flex items-center pl-6 pr-2 py-1 text-[10px] text-vscode-muted/60 space-x-1 cursor-pointer hover:text-vscode-muted"
                                                onContextMenu={handleFolderContextMenu}
                                            >
                                                <ChevronDown size={10} className="mr-1" />
                                                <span className="uppercase tracking-widest font-bold">contracts</span>
                                            </div>
                                        )}

                                        {/* File list */}
                                        {files.length === 0 ? (
                                            <div className="px-4 py-6 text-center">
                                                <div className="text-[10px] text-vscode-muted/50 mb-3 leading-relaxed">
                                                    Right-click the folder to create your first {projectLanguage === 'solidity' ? 'contract' : 'script'}
                                                </div>
                                                <button
                                                    onClick={e => { e.stopPropagation(); handleCreateNewFileFromContext(); }}
                                                    className="text-[10px] px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/40 transition-all flex items-center space-x-1 mx-auto border border-indigo-500/30"
                                                >
                                                    <FilePlus size={10} />
                                                    <span>New {projectLanguage === 'solidity' ? 'Contract' : 'Script'}</span>
                                                </button>
                                            </div>
                                        ) : (
                                            files.map(file => (
                                                <div
                                                    key={file.id}
                                                    className={`flex items-center pl-10 pr-2 py-1 text-[12px] group cursor-pointer transition-colors ${activeFileId === file.id ? 'bg-vscode-accent/20 text-white' : 'text-vscode-muted hover:bg-white/5 hover:text-white'}`}
                                                    onClick={() => dispatch(setActiveFile(file.id))}
                                                    onContextMenu={e => handleFileContextMenu(e, file.id)}
                                                >
                                                    {file.language === 'solidity'
                                                        ? <ShieldCheck size={12} className="mr-2 text-emerald-400 shrink-0" />
                                                        : <Cpu size={12} className="mr-2 text-amber-400 shrink-0" />
                                                    }
                                                    {renamingFileId === file.id ? (
                                                        <input
                                                            autoFocus
                                                            value={renameValue}
                                                            className="flex-grow bg-black/60 border border-indigo-500/50 rounded px-1 text-[11px] text-white outline-none"
                                                            onChange={e => setRenameValue(e.target.value)}
                                                            onBlur={() => handleRenameSubmit(file.id)}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Enter') handleRenameSubmit(file.id);
                                                                if (e.key === 'Escape') setRenamingFileId(null);
                                                            }}
                                                            onClick={e => e.stopPropagation()}
                                                        />
                                                    ) : (
                                                        <span className="truncate flex-grow">{file.name}</span>
                                                    )}
                                                    {file.isDirty && <div className="w-1 h-1 rounded-full bg-amber-400 shrink-0 ml-1" />}
                                                    <Trash2
                                                        size={11}
                                                        className="opacity-0 group-hover:opacity-40 hover:!opacity-100 hover:text-red-400 transition-all shrink-0 ml-1"
                                                        onClick={e => handleDeleteFile(e, file.id)}
                                                    />
                                                </div>
                                            ))
                                        )}
                                    </div>
                                ) : (
                                    /* Welcome Screen — no project loaded */
                                    <div className="p-6 flex flex-col items-center justify-center h-full space-y-4">
                                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                            <Rocket size={32} className="text-indigo-400" />
                                        </div>
                                        <div className="text-center space-y-1">
                                            <p className="text-[12px] font-bold text-white">No Project Open</p>
                                            <p className="text-[10px] text-vscode-muted leading-relaxed">Start by creating a new Solidity or Quorlin project</p>
                                        </div>
                                        <button
                                            onClick={handleNewProject}
                                            className="btn-primary w-full flex items-center justify-center space-x-2 py-2.5"
                                        >
                                            <Plus size={14} />
                                            <span className="text-[11px] font-black uppercase tracking-widest">New Project</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── DEPLOY Tab ── */}
                    {sidebarActiveTab === 'deploy' && (
                        <div className="flex flex-col h-full">
                            <div className="h-9 flex items-center px-4 text-[10px] font-bold text-vscode-muted uppercase tracking-[0.2em] border-b border-white/5 shrink-0">
                                Compiler & Deploy
                            </div>
                            <div className="flex px-4 pt-3 space-x-4 border-b border-white/5 shrink-0">
                                {(['compile', 'interact'] as const).map(tab => (
                                    <button
                                        key={tab}
                                        className={`pb-2 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all ${deployTab === tab ? 'text-white border-vscode-accent' : 'text-vscode-muted border-transparent'}`}
                                        onClick={() => setDeployTab(tab)}
                                    >{tab}</button>
                                ))}
                            </div>
                            {deployTab === 'compile' ? (
                                <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar">
                                    <div className="p-3 rounded-lg border border-indigo-500/30 bg-indigo-500/5 flex items-center space-x-3">
                                        <div className="p-2 rounded bg-indigo-500/20 text-indigo-400">
                                            {projectLanguage === 'solidity' ? <ShieldCheck size={18} /> : <Cpu size={18} />}
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-bold text-white uppercase tracking-wider">
                                                {projectLanguage === 'solidity' ? 'Solidity v0.8.19' : 'Quorlin Engine v1.0'}
                                            </div>
                                            <div className="text-[9px] text-vscode-muted font-mono uppercase">Optimized for Kortana</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCompile}
                                        disabled={compilerStatus === 'compiling' || !activeFile}
                                        className="w-full btn-primary flex justify-center items-center space-x-2 py-2.5 text-[11px] font-black uppercase tracking-widest"
                                    >
                                        {compilerStatus === 'compiling'
                                            ? <><Loader2 size={14} className="animate-spin" /><span>Compiling...</span></>
                                            : <><Zap size={14} /><span>Run & Compile</span></>}
                                    </button>
                                    {compilerStatus === 'success' && (
                                        <div className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 flex items-center space-x-2">
                                            <ShieldCheck size={12} />
                                            <span>Compiled successfully — Ready to deploy</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <InteractionPanel />
                            )}
                        </div>
                    )}

                    {/* ── TESTS Tab ── */}
                    {sidebarActiveTab === 'tests' && (
                        <div className="flex flex-col h-full">
                            <div className="h-9 flex items-center px-4 text-[10px] font-bold text-vscode-muted uppercase tracking-[0.2em] border-b border-white/5 shrink-0">
                                Test Runner
                            </div>
                            <div className="flex-grow overflow-y-auto">
                                <TestPanel />
                            </div>
                        </div>
                    )}

                    {/* ── SEARCH Tab ── */}
                    {sidebarActiveTab === 'search' && (
                        <div className="flex flex-col h-full">
                            <div className="h-9 flex items-center px-4 text-[10px] font-bold text-vscode-muted uppercase tracking-[0.2em] border-b border-white/5 shrink-0">
                                Search
                            </div>
                            <div className="p-4">
                                <input
                                    type="text"
                                    placeholder="Search in files..."
                                    className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-[11px] text-white focus:outline-none focus:border-indigo-500/50"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Main Editor Area ── */}
                <div className="flex-grow flex flex-col overflow-hidden bg-[#0a0b0d]">
                    {/* Editor Tab Bar */}
                    <div className="h-9 bg-vscode-sidebar/50 flex overflow-x-auto shrink-0 border-b border-white/5">
                        {openFiles.map(file => (
                            <div
                                key={file.id}
                                className={`flex items-center px-4 py-1.5 text-[11px] border-r border-white/5 cursor-pointer relative group transition-all h-full whitespace-nowrap ${activeFileId === file.id ? 'bg-vscode-bg text-white border-t-2 border-t-indigo-500' : 'bg-transparent text-vscode-muted hover:bg-white/5'}`}
                                onClick={() => dispatch(setActiveFile(file.id))}
                            >
                                <span className={`mr-2 ${file.language === 'solidity' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {file.language === 'solidity' ? <ShieldCheck size={12} /> : <Cpu size={12} />}
                                </span>
                                <span>{file.name}</span>
                                {file.isDirty && <span className="ml-1 text-amber-400 text-[8px]">●</span>}
                                <div
                                    onClick={e => { e.stopPropagation(); dispatch(closeFile(file.id)); }}
                                    className="ml-2 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded p-0.5"
                                >
                                    <X size={10} />
                                </div>
                            </div>
                        ))}
                        {openFiles.length === 0 && (
                            <div className="flex items-center px-4 text-[11px] text-vscode-muted/30 italic">
                                No file open — select a file from the Explorer
                            </div>
                        )}
                    </div>

                    {/* Code Editor */}
                    <div className="flex-grow relative overflow-hidden">
                        {activeFile ? (
                            <CodeEditor />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full space-y-6 text-center select-none">
                                <div className="w-24 h-24 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center">
                                    <Zap size={48} className="text-indigo-500/30" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-[18px] font-bold text-white/20">Kortana Studio</h2>
                                    {projectPath ? (
                                        <p className="text-[12px] text-vscode-muted/40">Right-click the project folder to create your first contract</p>
                                    ) : (
                                        <p className="text-[12px] text-vscode-muted/40">Create a new project to get started</p>
                                    )}
                                </div>
                                {!projectPath && (
                                    <button onClick={handleNewProject} className="btn-primary flex items-center space-x-2 px-6 py-2.5">
                                        <Plus size={16} />
                                        <span className="font-black uppercase tracking-widest text-[11px]">New Project</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Terminal/Console */}
                    <div className="h-44 bg-vscode-sidebar/90 border-t border-white/5 flex flex-col z-10 shadow-2xl shrink-0">
                        <div className="h-8 flex items-center px-4 text-[9px] font-bold text-vscode-muted uppercase tracking-[0.3em] bg-black/40 border-b border-white/5 shrink-0">
                            {(['output', 'interact', 'console', 'problems'] as const).map(tab => (
                                <div
                                    key={tab}
                                    className={`px-4 h-full flex items-center cursor-pointer border-b-2 transition-all ${consoleTab === tab ? 'text-white border-vscode-accent' : 'border-transparent hover:text-white'}`}
                                    onClick={() => setConsoleTab(tab)}
                                >{tab}</div>
                            ))}
                        </div>
                        <div className="flex-grow p-3 font-mono text-[11px] overflow-y-auto custom-scrollbar select-text bg-[#030303]/50">
                            {consoleTab === 'output' && (
                                <div className="space-y-0.5">
                                    {consoleLogs.map((log, i) => (
                                        <div key={i} className={
                                            log.type === 'success' ? 'text-emerald-400' :
                                                log.type === 'error' ? 'text-red-400' :
                                                    log.type === 'warn' ? 'text-amber-400' :
                                                        'text-vscode-muted/70'
                                        }>{log.msg}</div>
                                    ))}
                                </div>
                            )}
                            {consoleTab === 'interact' && <div className="h-full"><InteractionPanel /></div>}
                            {consoleTab === 'console' && <div className="text-vscode-muted/50 italic">Kortana Interactive Terminal (KIT) — Type help for commands...</div>}
                            {consoleTab === 'problems' && (
                                <div className="flex flex-col items-center justify-center h-full text-vscode-muted opacity-30">
                                    <ShieldCheck size={28} className="mb-2" />
                                    <span>No problems detected in workspace</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ══════════ RIGHT PANEL — Blockchain Manager ══════════ */}
                <div className="hidden lg:flex w-72 bg-vscode-sidebar/95 border-l border-white/5 flex-col overflow-hidden shrink-0">
                    <div className="p-4 border-b border-white/5 font-bold text-[10px] text-vscode-muted uppercase tracking-widest bg-black/20 flex items-center space-x-2">
                        <Globe size={12} />
                        <span>Blockchain Manager</span>
                    </div>
                    <div className="p-4 space-y-5 overflow-y-auto custom-scrollbar flex-grow">

                        {/* ── Provider Status ── */}
                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-4">
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-vscode-muted font-bold uppercase tracking-widest">Wallet Provider</span>
                                <div className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-vscode-muted'}`}>
                                    {isConnected ? 'LIVE' : 'IDLE'}
                                </div>
                            </div>

                            <div className="space-y-2">
                                {/* MetaMask Button */}
                                <button
                                    onClick={() => !isConnected ? dispatch(connectWallet('metamask')) : undefined}
                                    className={`w-full py-2.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center space-x-2 border ${isConnected && walletType === 'metamask'
                                        ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                                        : isConnected
                                            ? 'opacity-30 bg-white/5 text-vscode-muted border-white/5 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-500 hover:-translate-y-0.5 shadow-lg'
                                        }`}
                                >
                                    <svg width="14" height="14" viewBox="0 0 256 240" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
                                        <path d="M239.066 14.505l-95.213 77.305 28.016-52.007L128 0l-43.869 39.803 28.016 52.007-95.213-77.305 13.568 113.111 25.132 23.447L29.351 161.4l51.914 36.335L128 240l46.735-42.265 51.914-36.335-26.283-10.342 25.132-23.447 13.568-113.111z" fill="#E2761B" />
                                        <path d="M37.6 151.72l43.665 30.56L128 221.789l46.735-39.509 43.665-30.56L128 174.19l-90.4 22.47z" fill="#E4761B" />
                                        <path d="M128 119.55l-2.022-26.68L128 94.137l2.022-1.267z" fill="#D7C1B3" />
                                        <path d="M85.748 119.55l-3.37-44.468L128 94.137l45.622-19.055-3.371 44.468L128 136.56l-42.252-17.01z" fill="#233447" />
                                        <path d="M27.329 127.616l25.132 23.447L29.351 161.4l-2.022-33.784zm174.209 0l-2.022 33.784-23.115-10.337 25.137-23.447z" fill="#CD7E2E" />
                                        <path d="M37.6 151.72L128 174.19l-33.784-36.43zm180.8 0l-90.4 22.47 33.784-36.43z" fill="#763D16" />
                                        <path d="M128 174.19l90.4-22.47L128 240l-90.4-88.28z" fill="#333" />
                                    </svg>
                                    <span>{isConnected && walletType === 'metamask' ? `MetaMask • ${walletAddress?.slice(0, 6)}...${walletAddress?.slice(-4)}` : 'Connect MetaMask'}</span>
                                </button>

                                {/* Kortana Wallet Button */}
                                <button
                                    onClick={() => !isConnected ? dispatch(connectWallet('kortana')) : undefined}
                                    className={`w-full py-2.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center space-x-2 border ${isConnected && walletType === 'kortana'
                                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                                        : isConnected
                                            ? 'opacity-30 bg-white/5 text-vscode-muted border-white/5 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-indigo-500 hover:-translate-y-0.5 shadow-lg'
                                        }`}
                                >
                                    <Zap size={14} fill="currentColor" />
                                    <span>{isConnected && walletType === 'kortana' ? `Kortana Wallet • ${walletAddress?.slice(0, 6)}...${walletAddress?.slice(-4)}` : 'Connect Kortana Wallet'}</span>
                                </button>

                                {/* Disconnect */}
                                {isConnected && (
                                    <button
                                        onClick={() => { dispatch({ type: 'wallet/disconnect' }); }}
                                        className="w-full py-1.5 rounded text-[10px] text-vscode-muted hover:text-red-400 transition-colors text-center"
                                    >
                                        Disconnect
                                    </button>
                                )}
                            </div>

                            {/* Private Key fallback */}
                            {!isConnected && (
                                <div className="pt-3 border-t border-white/5 space-y-2">
                                    <button
                                        onClick={() => setShowPKInput(!showPKInput)}
                                        className="text-[10px] text-vscode-muted hover:text-white transition-colors w-full text-center"
                                    >
                                        {showPKInput ? '– Hide' : '🔑 Use Private Key'}
                                    </button>
                                    {showPKInput && (
                                        <div className="space-y-2">
                                            <input
                                                type="password"
                                                placeholder="Private Key (0x...)"
                                                value={privateKeyInput}
                                                onChange={e => setPrivateKeyInput(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-indigo-500/50"
                                            />
                                            <button
                                                onClick={() => { if (privateKeyInput) dispatch(connectWithPrivateKey(privateKeyInput)); }}
                                                className="w-full py-1.5 bg-white/10 hover:bg-white/20 rounded text-[10px] font-bold text-white transition-all"
                                            >
                                                Connect Key
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ── Network & Deployment ── */}
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-bold text-vscode-muted uppercase tracking-widest">Deployment Pipeline</h3>

                            {/* Network Switcher */}
                            <button
                                onClick={() => dispatch(switchNetwork(currentNetwork === 'TESTNET' ? 'MAINNET' : 'TESTNET'))}
                                className="w-full p-3 bg-white/2 border border-white/5 rounded-lg flex items-center justify-between group hover:bg-white/5 transition-all"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="p-1.5 rounded bg-indigo-500/10"><Globe size={14} className="text-indigo-400" /></div>
                                    <div className="text-left">
                                        <div className="text-[11px] font-bold text-white">
                                            {currentNetwork === 'TESTNET' ? 'Kortana Testnet' : 'Kortana Mainnet'}
                                        </div>
                                        <div className="text-[8px] text-vscode-muted uppercase">
                                            Chain ID: {currentNetwork === 'TESTNET' ? '72511' : '9002'} • Click to switch
                                        </div>
                                    </div>
                                </div>
                                <div className="text-[8px] font-bold text-indigo-400 bg-indigo-400/10 px-1.5 py-0.5 rounded border border-indigo-400/20 group-hover:bg-indigo-400 group-hover:text-white transition-colors uppercase">
                                    Switch
                                </div>
                            </button>

                            {/* Deploy Button */}
                            <button
                                onClick={() => setIsDeployModalOpen(true)}
                                disabled={compilerStatus !== 'success' || !isConnected}
                                className="w-full py-3 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg text-[12px] font-black uppercase tracking-widest text-white shadow-2xl disabled:opacity-20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center space-x-2"
                            >
                                <Rocket size={16} />
                                <span>Deploy Contract</span>
                            </button>

                            {!isConnected && (
                                <p className="text-[9px] text-vscode-muted/60 text-center">Connect a wallet to enable deployment</p>
                            )}
                            {compilerStatus !== 'success' && isConnected && (
                                <p className="text-[9px] text-vscode-muted/60 text-center">Compile your contract first</p>
                            )}
                        </div>

                        {/* ── Last Deployment Summary ── */}
                        {lastDeployment && (
                            <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-2">
                                <div className="flex items-center space-x-2 text-emerald-400">
                                    <ShieldCheck size={12} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Deployed</span>
                                </div>
                                <div className="text-[9px] text-vscode-muted font-mono break-all">{lastDeployment.address}</div>
                                <a
                                    href={`${currentNetwork === 'TESTNET' ? 'https://explorer.testnet.kortana.xyz' : 'https://explorer.mainnet.kortana.xyz'}/address/${lastDeployment.address}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[9px] text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                                >
                                    <span>View on Explorer</span>
                                    <ChevronRight size={10} />
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ══════════ STATUS BAR ══════════ */}
            <div className="h-6 bg-indigo-600 text-white flex items-center px-3 justify-between text-[10px] select-none shrink-0 font-medium z-50">
                <div className="flex items-center space-x-4 h-full">
                    <div
                        className="flex items-center bg-white/10 px-3 cursor-pointer h-full hover:bg-white/20"
                        onClick={() => dispatch(switchNetwork(currentNetwork === 'TESTNET' ? 'MAINNET' : 'TESTNET'))}
                    >
                        <Globe size={11} className="mr-1.5" />
                        <span>Kortana {currentNetwork === 'TESTNET' ? 'Testnet' : 'Mainnet'}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-300 animate-pulse' : 'bg-white/30'}`} />
                        <span>{isConnected ? `${walletType === 'metamask' ? 'MetaMask' : walletType === 'kortana' ? 'Kortana' : 'Key'}` : 'No Wallet'}</span>
                    </div>
                </div>
                <div className="flex items-center space-x-4 h-full">
                    <span>Ln {activeFile?.content?.split('\n').length ?? 0}, Col 1</span>
                    <span>UTF-8</span>
                    <div className="flex items-center space-x-1 font-bold">
                        <span className={`w-1.5 h-1.5 rounded-full ${projectLanguage === 'solidity' ? 'bg-emerald-400' : projectLanguage === 'quorlin' ? 'bg-amber-400' : 'bg-white/20'}`} />
                        <span>{activeFile?.language?.toUpperCase() ?? 'IDLE'}</span>
                    </div>
                </div>
            </div>

            {/* ══════════ MODALS ══════════ */}
            {
                (() => {
                    const mainContract = lastResult?.contracts?.find((c: any) => c.bytecode && c.bytecode.length > 50) || lastResult?.contracts?.[0];
                    return (
                        <DeploymentModal
                            isOpen={isDeployModalOpen}
                            onClose={() => setIsDeployModalOpen(false)}
                            onInteract={() => { setConsoleTab('interact'); setIsDeployModalOpen(false); }}
                            contractName={mainContract?.name || activeFile?.name.replace(/\.(sol|ql)$/, '') || 'Contract'}
                            bytecode={mainContract?.bytecode || ''}
                            abi={mainContract?.abi || []}
                        />
                    );
                })()
            }

            <NewProjectModal
                isOpen={isNewProjectModalOpen}
                onClose={() => setIsNewProjectModalOpen(false)}
                onCreate={handleCreateProject}
            />

            {/* ══════════ RICH CONTEXT MENU ══════════ */}
            {
                contextMenu && (
                    <div
                        className="fixed z-[500] min-w-[200px] bg-[#1a1b20] border border-white/10 shadow-2xl rounded-lg py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                        style={{ left: Math.min(contextMenu.x, window.innerWidth - 210), top: Math.min(contextMenu.y, window.innerHeight - 200) }}
                        onClick={e => e.stopPropagation()}
                    >
                        {contextMenu.target === 'folder' ? (
                            /* Folder context menu */
                            <>
                                <div className="px-2 py-1.5 text-[9px] text-vscode-muted/50 uppercase tracking-widest font-bold border-b border-white/5 mb-1">
                                    {projectPath?.split(/[/\\]/).pop()} / contracts
                                </div>
                                <ContextMenuItem
                                    icon={<FilePlus size={12} />}
                                    label={`New ${projectLanguage === 'solidity' ? 'Solidity Contract' : 'Quorlin Script'}`}
                                    shortcut={projectLanguage === 'solidity' ? '.sol' : '.ql'}
                                    onClick={handleCreateNewFileFromContext}
                                    color="text-indigo-400"
                                />
                                <div className="h-[1px] bg-white/5 my-1" />
                                <ContextMenuItem icon={<FolderPlus size={12} />} label="New Sub-Folder" onClick={() => setContextMenu(null)} color="text-vscode-muted" />
                            </>
                        ) : (
                            /* File context menu */
                            <>
                                <div className="px-2 py-1.5 text-[9px] text-vscode-muted/50 uppercase tracking-widest font-bold border-b border-white/5 mb-1 truncate">
                                    {files.find(f => f.id === contextMenu.fileId)?.name}
                                </div>
                                <ContextMenuItem icon={<Play size={12} />} label="Open" onClick={() => { if (contextMenu.fileId) { dispatch(setActiveFile(contextMenu.fileId)); setContextMenu(null); } }} color="text-white" />
                                <ContextMenuItem icon={<Edit3 size={12} />} label="Rename" onClick={handleStartRename} color="text-vscode-muted" />
                                <ContextMenuItem icon={<RotateCcw size={12} />} label="Undo Last Change" onClick={() => { dispatch(undoLastChange()); setContextMenu(null); }} color="text-amber-400" />
                                <div className="h-[1px] bg-white/5 my-1" />
                                <ContextMenuItem icon={<Trash2 size={12} />} label="Delete" onClick={handleDeleteFromContext} color="text-red-400" />
                            </>
                        )}
                    </div>
                )
            }
        </div >
    );
};

// ─────────────────────────────────────────────
// Context Menu Item Helper
// ─────────────────────────────────────────────
const ContextMenuItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    shortcut?: string;
    onClick: () => void;
    color?: string;
}> = ({ icon, label, shortcut, onClick, color = 'text-white' }) => (
    <div
        className={`px-3 py-1.5 hover:bg-white/10 cursor-pointer flex items-center justify-between text-[11px] ${color} transition-colors`}
        onClick={onClick}
    >
        <div className="flex items-center space-x-2">
            {icon}
            <span>{label}</span>
        </div>
        {shortcut && <span className="text-[9px] opacity-40 ml-4">{shortcut}</span>}
    </div>
);

const SidebarIcon: React.FC<{
    icon: React.ReactNode;
    active: boolean;
    onClick: () => void;
    title?: string;
}> = ({ icon, active, onClick, title }) => (
    <div
        title={title}
        className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center cursor-pointer transition-all relative group ${active ? 'text-white' : 'text-vscode-muted hover:text-white'}`}
        onClick={onClick}
    >
        {active && <div className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r shadow-[0_0_10px_rgba(99,102,241,0.5)]" />}
        {icon}
        {!active && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-[#1a1b20] text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[1000] border border-white/10 pointer-events-none shadow-2xl">
                {title}
            </div>
        )}
    </div>
);

export default App;
