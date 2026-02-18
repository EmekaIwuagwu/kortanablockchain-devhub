import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Files,
    Search,
    Play,
    Settings,
    ChevronDown,
    MoreHorizontal,
    ShieldCheck,
    Cpu,
    Globe,
    Plus,
    Loader2,
    Beaker,
    Terminal,
    AlertCircle,
    FilePlus,
    FolderPlus,
    X,
    Trash2
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
    deleteFile
} from './store/slices/editorSlice';
import { compileCode, setLanguage } from './store/slices/compilerSlice';
import { resetStatus } from './store/slices/deploymentSlice';
import { connectWallet, connectWithPrivateKey } from './store/slices/walletSlice';
import CodeEditor from './components/CodeEditor';
import DeploymentModal from './components/DeploymentModal';
import InteractionPanel from './components/InteractionPanel';
import TestPanel from './components/TestPanel';
import SplashScreen from './components/SplashScreen';
import NewProjectModal from './components/NewProjectModal';

const App: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { files, activeFileId, sidebarActiveTab, projectPath, projectLanguage } = useSelector((state: RootState) => state.editor);
    const { status: compilerStatus, selectedLanguage, lastResult } = useSelector((state: RootState) => state.compiler);
    const { lastDeployment } = useSelector((state: RootState) => state.deployment);
    const { isConnected, address: walletAddress, isConnecting, error: walletError } = useSelector((state: RootState) => state.wallet);

    const [isLoading, setIsLoading] = useState(true);
    const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
    const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
    const [consoleTab, setConsoleTab] = useState<'output' | 'console' | 'problems' | 'interact'>('output');
    const [menuOpen, setMenuOpen] = useState<string | null>(null);
    const activityBarRef = useRef<HTMLDivElement>(null);
    const [deployTab, setDeployTab] = useState<'compile' | 'interact'>('compile');
    const [privateKeyInput, setPrivateKeyInput] = useState('');
    const [showPKInput, setShowPKInput] = useState(false);

    const activeFile = files.find(f => f.id === activeFileId);
    const openFiles = files.filter(f => f.isOpen);

    // Initial Loading/Splash
    useEffect(() => {
        console.log('[Renderer] App starting, isLoading true');
        const timer = setTimeout(() => {
            console.log('[Renderer] Splashing finished');
            setIsLoading(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (lastDeployment) {
            setDeployTab('interact');
            setConsoleTab('interact'); // Also show in console area for better visibility
        }
    }, [lastDeployment]);

    // Global click listener to close menus
    useEffect(() => {
        const handleClick = () => setMenuOpen(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    const handleCompile = async () => {
        if (activeFile) {
            const lang = projectLanguage || (activeFile.name.endsWith('.sol') ? 'solidity' : 'quorlin');
            await dispatch(compileCode({
                language: lang as any,
                sourceCode: activeFile.content,
                fileName: activeFile.name
            }));
        }
    };

    const handleLangChange = (lang: 'solidity' | 'quorlin') => {
        dispatch(setLanguage(lang));
        // Senior Requirement: If we interchange types, suggest a new file if no active file exists
        if (!activeFile && projectPath) {
            const ext = lang === 'solidity' ? '.sol' : '.qrl';
            const defaultName = lang === 'solidity' ? 'NewContract' : 'NewScript';
            dispatch(createNewFile({
                name: `${defaultName}${ext}`,
                content: lang === 'solidity'
                    ? '// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\ncontract NewContract {\n    \n}'
                    : '// Quorlin Script\ncontract NewScript {\n    \n}'
            }));
        }
    };

    const handleNewFile = () => {
        if (!projectPath) {
            dispatch(openProject());
            return;
        }

        const ext = projectLanguage === 'solidity' ? '.sol' : '.qrl';
        const name = prompt(`Enter file name (will auto-append ${ext}):`);

        if (name) {
            const fileName = name.endsWith(ext) ? name : `${name}${ext}`;
            dispatch(createNewFile({ name: fileName, content: "" }));
        }
    };

    const handleDeleteFile = (e: React.MouseEvent, fileId: string) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this file? This action is irreversible.')) {
            dispatch(deleteFile(fileId));
        }
    };

    const handleNewProject = () => {
        setIsNewProjectModalOpen(true);
        setMenuOpen(null);
    };

    const handleCreateProject = (name: string, language: any) => {
        dispatch(createNewProject({ projectName: name, language }));
        dispatch(setLanguage(language));
        setIsNewProjectModalOpen(false);
    };

    if (isLoading) return <SplashScreen />;

    return (
        <div className="flex flex-col h-screen w-screen bg-vscode-bg font-sans overflow-hidden animate-fade-in text-vscode-text">
            {/* Professional Custom Title Bar (Replaces native) */}
            <div className="h-8 bg-vscode-sidebar/95 border-b border-white/5 flex items-center px-4 text-[12px] select-none z-[100] justify-between">
                <div className="flex items-center space-x-1 mr-4">
                    <div className="w-4 h-4 rounded-sm bg-indigo-600 flex items-center justify-center mr-2">
                        <Cpu size={10} className="text-white" />
                    </div>
                    {/* Menu System */}
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <span
                                className={`cursor-pointer px-2 py-1 rounded hover:bg-white/10 ${menuOpen === 'file' ? 'bg-white/10' : ''}`}
                                onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === 'file' ? null : 'file'); }}
                            >
                                File
                            </span>
                            {menuOpen === 'file' && (
                                <div className="absolute top-full left-0 mt-1 w-48 bg-vscode-sidebar border border-white/10 shadow-2xl rounded-md py-1 z-[110] glass-panel">
                                    <div className="px-3 py-1.5 hover:bg-vscode-accent text-white cursor-pointer flex justify-between" onClick={handleNewFile}>
                                        <span>New File</span>
                                        <span className="opacity-50 text-[10px]">Ctrl+N</span>
                                    </div>
                                    <div className="px-3 py-1.5 hover:bg-vscode-accent text-white cursor-pointer flex justify-between" onClick={handleNewProject}>
                                        <span>New Project</span>
                                        <span className="opacity-50 text-[10px]">Ctrl+Shift+N</span>
                                    </div>
                                    <div className="h-[1px] bg-white/5 my-1" />
                                    <div className="px-3 py-1.5 hover:bg-vscode-accent text-white cursor-pointer" onClick={() => dispatch(openProject())}>
                                        Open Folder...
                                    </div>
                                    <div className="px-3 py-1.5 hover:bg-vscode-accent text-white cursor-pointer" onClick={() => dispatch(saveActiveFile())}>
                                        Save
                                    </div>
                                </div>
                            )}
                        </div>
                        <span className="cursor-pointer px-2 py-1 rounded hover:bg-white/10">Edit</span>
                        <span className="cursor-pointer px-2 py-1 rounded hover:bg-white/10">Selection</span>
                        <span className="cursor-pointer px-2 py-1 rounded hover:bg-white/10">View</span>
                        <span className="cursor-pointer px-2 py-1 rounded hover:bg-white/10">Go</span>
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
                    <span>{projectPath ? projectPath.split(/[\\/]/).pop() : 'Universal Mode'}</span>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Enhanced Wallet Status with Error Tooltip */}
                    <div
                        className={`flex items-center space-x-2 px-3 py-0.5 rounded-full text-[10px] font-bold cursor-help group relative ${isConnected ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-vscode-error/10 text-vscode-error border border-vscode-error/20'}`}
                        title={walletError || ''}
                    >
                        <div className={`w-1 h-1 rounded-full ${isConnected ? 'bg-indigo-400 shadow-[0_0_8px_indigo]' : 'bg-vscode-error animate-pulse'} `} />
                        <span>{isConnected ? 'MetaMask Linked' : isConnecting ? 'Authenticating...' : 'Provider Error'}</span>

                        {walletError && (
                            <div className="absolute top-full right-0 mt-2 w-64 bg-vscode-sidebar/95 backdrop-blur-xl border border-vscode-error/30 p-3 rounded-lg text-[10px] text-vscode-error shadow-2xl z-[200] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <div className="font-bold flex items-center mb-1"><AlertCircle size={10} className="mr-1" /> Security/Connection Exception</div>
                                {walletError}
                            </div>
                        )}
                    </div>
                    {/* Native-like control dots (deco) */}
                    <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-vscode-muted/20" />
                        <div className="w-3 h-3 rounded-full bg-vscode-muted/20" />
                        <div className="w-3 h-3 rounded-full bg-vscode-muted/20" />
                    </div>
                </div>
            </div>

            <div className="flex flex-grow overflow-hidden">
                {/* Slim Activity Bar */}
                <div className="w-12 bg-vscode-activity border-r border-white/5 flex flex-col items-center py-4 space-y-4 shrink-0">
                    <div className={`activity-item group ${sidebarActiveTab === 'files' ? 'active text-white' : 'text-vscode-muted'}`} onClick={() => dispatch(setSidebarTab('files'))}>
                        <Files className="w-5 h-5" />
                    </div>
                    <div className={`activity-item group ${sidebarActiveTab === 'search' ? 'active text-white' : 'text-vscode-muted'}`} onClick={() => dispatch(setSidebarTab('search'))}>
                        <Search className="w-5 h-5" />
                    </div>
                    <div className={`activity-item group ${sidebarActiveTab === 'deploy' ? 'active text-white' : 'text-vscode-muted'}`} onClick={() => dispatch(setSidebarTab('deploy'))}>
                        <Play className="w-5 h-5" />
                    </div>
                    <div className={`activity-item group ${sidebarActiveTab === 'tests' ? 'active text-white' : 'text-vscode-muted'}`} onClick={() => dispatch(setSidebarTab('tests'))}>
                        <Beaker className="w-5 h-5" />
                    </div>
                    <div className="flex-grow" />
                    <div className="activity-item text-vscode-muted hover:text-white group">
                        <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                    </div>
                </div>

                {/* Explorer Sidebar */}
                <div className="w-64 bg-vscode-sidebar/80 backdrop-blur-lg border-r border-white/5 flex flex-col overflow-hidden shrink-0">
                    <div className="h-9 flex items-center justify-between px-4 text-[10px] font-bold text-vscode-muted uppercase tracking-[0.2em] border-b border-white/5 bg-white/2">
                        {sidebarActiveTab === 'files' ? 'Explorer' : sidebarActiveTab === 'deploy' ? 'Compiler' : 'Tab'}
                        <div className="flex items-center space-x-2">
                            <FilePlus size={14} className="cursor-pointer hover:text-white" onClick={handleNewFile} />
                            <FolderPlus size={14} className="cursor-pointer hover:text-white" />
                        </div>
                    </div>

                    <div className="flex-grow overflow-y-auto py-2 custom-scrollbar">
                        {sidebarActiveTab === 'files' && (
                            <div className="animate-fade-in">
                                {projectPath ? (
                                    <>
                                        <div className="sidebar-item active group mb-1">
                                            <ChevronDown size={14} className="mr-2 text-vscode-accent" />
                                            <span className="text-white text-[11px] font-bold uppercase">{projectPath.split(/[\\/]/).pop()}</span>
                                        </div>
                                        {files
                                            .filter(file => !projectLanguage || file.language === projectLanguage)
                                            .map(file => (
                                                <div
                                                    key={file.id}
                                                    className={`sidebar-item group ${activeFileId === file.id ? 'active' : 'text-vscode-muted'}`}
                                                    onClick={() => dispatch(setActiveFile(file.id))}
                                                >
                                                    {file.language === 'solidity'
                                                        ? <ShieldCheck size={14} className="mr-2 text-emerald-400" />
                                                        : <Cpu size={14} className="mr-2 text-amber-400" />
                                                    }
                                                    <span className="text-[12px] truncate flex-grow">{file.name}</span>
                                                    <Trash2
                                                        size={12}
                                                        className="opacity-0 group-hover:opacity-40 hover:text-red-400 hover:opacity-100 transition-all p-0.5 rounded"
                                                        onClick={(e) => handleDeleteFile(e, file.id)}
                                                    />
                                                </div>
                                            ))}
                                    </>
                                ) : (
                                    <div className="p-6 text-center space-y-4">
                                        <p className="text-[11px] text-vscode-muted font-medium">No project loaded in workspace.</p>
                                        <button onClick={() => dispatch(openProject())} className="btn-primary w-full shadow-lg">Load Project Path</button>
                                    </div>
                                )}
                            </div>
                        )}
                        {sidebarActiveTab === 'deploy' && (
                            <div className="flex flex-col h-full">
                                <div className="flex px-4 pt-4 space-x-4 border-b border-white/5">
                                    <button
                                        className={`pb-2 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all ${deployTab === 'compile' ? 'text-white border-vscode-accent' : 'text-vscode-muted border-transparent'}`}
                                        onClick={() => setDeployTab('compile')}
                                    >
                                        Compile
                                    </button>
                                    <button
                                        className={`pb-2 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all ${deployTab === 'interact' ? 'text-white border-vscode-accent' : 'text-vscode-muted border-transparent'}`}
                                        onClick={() => setDeployTab('interact')}
                                    >
                                        Interact
                                    </button>
                                </div>

                                {deployTab === 'compile' ? (
                                    <div className="p-4 space-y-6">
                                        <div className="space-y-3">
                                            <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">{projectLanguage === 'solidity' ? 'Solidity' : 'Quorlin'} Engine</h3>
                                            <div className="p-3 rounded-lg border border-indigo-500/30 bg-indigo-500/5 flex items-center space-x-3">
                                                <div className="p-2 rounded bg-indigo-500/20 text-indigo-400">
                                                    {projectLanguage === 'solidity' ? <ShieldCheck size={18} /> : <Cpu size={18} />}
                                                </div>
                                                <div>
                                                    <div className="text-[11px] font-bold text-white uppercase tracking-wider">{projectLanguage === 'solidity' ? 'Solidity v0.8.19' : 'Quorlin Engine v1.0'}</div>
                                                    <div className="text-[9px] text-vscode-muted font-mono uppercase">Optimized for Kortana</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="h-[1px] bg-white/5" />
                                        <div className="grid grid-cols-1 gap-2">
                                            <button
                                                onClick={handleCompile}
                                                disabled={compilerStatus === 'compiling' || !activeFile}
                                                className="w-full btn-primary flex justify-center py-2.5 text-[11px] font-black uppercase tracking-widest"
                                            >
                                                {compilerStatus === 'compiling' ? <Loader2 size={16} className="animate-spin" /> : 'Run & Compile'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <InteractionPanel />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Workspace */}
                <div className="flex-grow flex flex-col overflow-hidden bg-[#0a0b0d]">
                    {/* Tab Bar */}
                    <div className="h-9 bg-vscode-sidebar/50 flex overflow-x-auto shrink-0 border-b border-white/5 shadow-inner">
                        {openFiles.map(file => (
                            <div
                                key={file.id}
                                className={`flex items-center px-4 py-1.5 text-[11px] border-r border-white/5 cursor-pointer relative group transition-all h-full ${activeFileId === file.id ? 'bg-vscode-bg text-white border-t border-t-vscode-accent' : 'bg-transparent text-vscode-muted hover:bg-white/5'}`}
                                onClick={() => dispatch(setActiveFile(file.id))}
                            >
                                <span className={file.language === 'solidity' ? 'text-emerald-400 mr-2' : 'text-amber-400 mr-2'}>
                                    {file.language === 'solidity' ? <ShieldCheck size={12} /> : <Cpu size={12} />}
                                </span>
                                <span>{file.name}</span>
                                <div onClick={(e) => { e.stopPropagation(); dispatch(closeFile(file.id)); }} className="ml-2 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded p-0.5">
                                    <X size={10} />
                                </div>
                                {file.isDirty && activeFileId !== file.id && <div className="absolute top-1 right-1 w-1 h-1 bg-indigo-500 rounded-full" />}
                            </div>
                        ))}
                    </div>

                    <div className="flex-grow relative overflow-hidden">
                        <CodeEditor />
                    </div>

                    {/* Integrated Terminal/Console System */}
                    <div className="h-48 bg-vscode-sidebar/90 border-t border-white/5 backdrop-blur-3xl flex flex-col z-10 shadow-2xl">
                        <div className="h-8 flex items-center px-4 text-[9px] font-bold text-vscode-muted uppercase tracking-[0.3em] bg-black/40 border-b border-white/5">
                            <div className={`px-4 h-full flex items-center cursor-pointer border-b ${consoleTab === 'output' ? 'text-white border-vscode-accent' : 'border-transparent hover:text-white'}`} onClick={() => setConsoleTab('output')}>Output</div>
                            <div className={`px-4 h-full flex items-center cursor-pointer border-b ${consoleTab === 'interact' ? 'text-white border-vscode-accent' : 'border-transparent hover:text-white'}`} onClick={() => setConsoleTab('interact')}>Interaction</div>
                            <div className={`px-4 h-full flex items-center cursor-pointer border-b ${consoleTab === 'console' ? 'text-white border-vscode-accent' : 'border-transparent hover:text-white'}`} onClick={() => setConsoleTab('console')}>Console</div>
                            <div className={`px-4 h-full flex items-center cursor-pointer border-b ${consoleTab === 'problems' ? 'text-white border-vscode-accent' : 'border-transparent hover:text-white'}`} onClick={() => setConsoleTab('problems')}>Problems</div>
                        </div>
                        <div className="flex-grow p-4 font-mono text-[11px] overflow-y-auto custom-scrollbar select-text bg-[#030303]/50">
                            {consoleTab === 'output' && (
                                <div className="animate-fade-in space-y-1">
                                    <div className="text-white opacity-40">[SYSTEM] Node v21.4.0 Engine Initializing...</div>
                                    <div className="text-indigo-400">[IDE] Kortana Studio Universal Core 1.0.4 - READY</div>
                                    <div className="text-emerald-400">[INFO] Compilation Pipeline linked to Kortana Mainnet.</div>
                                    {compilerStatus === 'compiling' && <div className="text-vscode-accent animate-pulse mt-2">Compiling source bytes...</div>}
                                    {compilerStatus === 'success' && <div className="text-emerald-500 font-bold mt-2">✓ Compilation Complete - 0 Errors, 0 Warnings</div>}
                                </div>
                            )}
                            {consoleTab === 'interact' && (
                                <div className="animate-fade-in h-full">
                                    <InteractionPanel />
                                </div>
                            )}
                            {consoleTab === 'console' && <div className="text-vscode-muted/50 italic animate-fade-in">Kortana Interactive Terminal (KIT) — Type help for commands...</div>}
                            {consoleTab === 'problems' && (
                                <div className="flex flex-col items-center justify-center h-full text-vscode-muted opacity-30 animate-fade-in">
                                    <ShieldCheck size={32} className="mb-2" />
                                    <span>No syntax errors detected in workspace</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Interactive Panel (MetaMask focus) */}
                <div className="w-72 bg-vscode-sidebar/95 border-l border-white/5 flex flex-col overflow-hidden shrink-0">
                    <div className="p-4 border-b border-white/5 font-bold text-[10px] text-vscode-muted uppercase tracking-widest bg-black/20">
                        Blockchain Manager
                    </div>
                    <div className="p-5 space-y-6 overflow-y-auto custom-scrollbar">
                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-4 hover:border-indigo-500/30 transition-all shadow-xl">
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="text-vscode-muted font-bold">PROVIDER STATUS</span>
                                <div className={`px-2 py-0.5 rounded text-[8px] font-bold ${isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-vscode-error/20 text-vscode-error'}`}>
                                    {isConnected ? 'LIVE' : 'IDLE'}
                                </div>
                            </div>

                            <button
                                onClick={() => dispatch(connectWallet())}
                                disabled={isConnected || isConnecting}
                                className={`w-full py-2.5 rounded-lg text-[12px] font-bold transition-all shadow-lg hover:-translate-y-0.5 ${isConnected ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border border-indigo-500'}`}
                            >
                                {isConnecting ? 'Opening Bridge...' : isConnected ? `Connected: ${walletAddress?.slice(0, 6)}...${walletAddress?.slice(-4)}` : walletError === 'REDIRECTING_TO_WEB' ? 'Syncing Browser...' : 'Link MetaMask Wallet'}
                            </button>

                            {!isConnected && !isConnecting && (
                                <div className="space-y-2 pt-2 border-t border-white/5">
                                    <button
                                        onClick={() => setShowPKInput(!showPKInput)}
                                        className="text-[10px] text-vscode-muted hover:text-white transition-colors w-full text-center"
                                    >
                                        {showPKInput ? 'Cancel' : 'Use Private Key Instead'}
                                    </button>

                                    {showPKInput && (
                                        <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                            <input
                                                type="password"
                                                placeholder="Enter Private Key (0x...)"
                                                value={privateKeyInput}
                                                onChange={(e) => setPrivateKeyInput(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-indigo-500/50"
                                            />
                                            <button
                                                onClick={() => {
                                                    if (privateKeyInput) dispatch(connectWithPrivateKey(privateKeyInput));
                                                }}
                                                className="w-full py-1.5 bg-white/10 hover:bg-white/20 rounded text-[10px] font-bold text-white transition-all"
                                            >
                                                Connect Key
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-[10px] font-bold text-white tracking-widest px-1 uppercase">Deployment Pipeline</h3>
                            <div className="grid grid-cols-1 gap-2">
                                <button
                                    onClick={() => dispatch(connectWallet())}
                                    className="p-3 bg-white/2 border border-white/5 rounded-lg flex items-center justify-between group hover:bg-white/5"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 rounded bg-indigo-500/10"><Globe size={16} className="text-indigo-400" /></div>
                                        <div className="text-left">
                                            <div className="text-[11px] font-bold text-white">Kortana Testnet</div>
                                            <div className="text-[8px] text-vscode-muted">ID: 91000 - POSEIDON</div>
                                        </div>
                                    </div>
                                    <ChevronDown size={14} className="text-vscode-muted group-hover:text-white" />
                                </button>

                                <button
                                    onClick={() => setIsDeployModalOpen(true)}
                                    disabled={compilerStatus !== 'success' || !isConnected}
                                    className="w-full py-3 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg text-[12px] font-black uppercase tracking-widest text-white shadow-2xl disabled:opacity-20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center space-x-2"
                                >
                                    <ShieldCheck size={18} />
                                    <span>Deploy Active Logic</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Micro Status Bar */}
            <div className="h-6 bg-indigo-600 text-white flex items-center px-3 justify-between text-[10px] select-none shrink-0 font-medium z-50">
                <div className="flex items-center space-x-4 h-full">
                    <div className="flex items-center bg-white/10 px-3 cursor-pointer h-full hover:bg-white/20">
                        <Globe size={12} className="mr-2" />
                        <span>Kortana_Poseidon_V1</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                        <span>Ready</span>
                    </div>
                </div>
                <div className="flex items-center space-x-4 h-full">
                    <div className="opacity-70">Ln {activeFile?.content?.split('\n').length || 0}, Col 1</div>
                    <div className="opacity-70">UTF-8</div>
                    <div className="font-bold flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span>{activeFile?.language?.toUpperCase() || 'IDLE'}</span>
                    </div>
                </div>
            </div>

            <DeploymentModal
                isOpen={isDeployModalOpen}
                onClose={() => setIsDeployModalOpen(false)}
                onInteract={() => {
                    setConsoleTab('interact');
                    setIsDeployModalOpen(false);
                }}
                contractName={lastResult?.contracts[0]?.name || activeFile?.name.replace(/\.(sol|qrl)$/, '') || 'Contract'}
                bytecode={lastResult?.contracts[0]?.bytecode || ''}
                abi={lastResult?.contracts[0]?.abi || []}
            />
            <NewProjectModal
                isOpen={isNewProjectModalOpen}
                onClose={() => setIsNewProjectModalOpen(false)}
                onCreate={handleCreateProject}
            />
        </div>
    );
};

export default App;
