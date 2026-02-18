import React, { useState } from 'react';
import { X, ChevronRight, Info, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { deployContract } from '../store/slices/deploymentSlice';
import { IDE_CONFIG } from '../config';

interface DeploymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    contractName: string;
    bytecode: string;
    abi: any[];
    onInteract?: () => void;
}

const DeploymentModal: React.FC<DeploymentModalProps> = ({ isOpen, onClose, contractName: initialContractName, bytecode, abi, onInteract }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [gasLimit, setGasLimit] = useState('3000000');
    const [gasPrice, setGasPrice] = useState('20');
    const [network, setNetwork] = useState<'testnet' | 'mainnet'>('testnet');
    const [contractName, setContractName] = useState(initialContractName);
    const [copied, setCopied] = useState(false);

    const { isDeploying, status, error, lastDeployment } = useSelector((state: RootState) => state.deployment);

    const handleDeploy = () => {
        dispatch(deployContract({
            config: {
                network,
                contractName,
                gasLimit,
                gasPrice,
                constructorParams: []
            },
            bytecode,
            abi
        }));
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    const explorerUrl = network === 'testnet'
        ? IDE_CONFIG.NETWORKS.POSEIDON.blockExplorerUrls[0]
        : 'https://explorer.kortana.org/';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in px-4">
            <div className="bg-vscode-sidebar w-full max-w-md border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col glass-panel">
                {/* Header */}
                <div className="px-4 py-3 bg-white/5 border-b border-white/5 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <div className="p-1.5 rounded bg-indigo-500/20">
                            <ShieldCheck size={16} className="text-indigo-400" />
                        </div>
                        <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Deploy Smart Contract</h3>
                    </div>
                    <button onClick={onClose} className="text-vscode-muted hover:text-white transition-colors p-1 hover:bg-white/5 rounded">
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                    <div className="space-y-2">
                        <label className="text-[10px] text-vscode-muted uppercase font-black tracking-widest flex justify-between">
                            Contract / Token Name
                            <span className="text-indigo-400/50 normal-case font-medium italic">Required for indexing</span>
                        </label>
                        <input
                            type="text"
                            value={contractName}
                            onChange={(e) => setContractName(e.target.value)}
                            className="w-full bg-black/40 text-white text-[12px] font-mono p-3 rounded-lg border border-white/10 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                            placeholder="Enter Token or Contract Name..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] text-vscode-muted uppercase font-black tracking-widest">Target Environment</label>
                        <div className="flex p-1 bg-black/40 rounded-xl border border-white/5">
                            <button
                                onClick={() => setNetwork('testnet')}
                                className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all ${network === 'testnet' ? 'bg-indigo-600 text-white shadow-lg' : 'text-vscode-muted hover:text-white'}`}
                            >
                                Kortana Testnet
                            </button>
                            <button
                                onClick={() => setNetwork('mainnet')}
                                className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all ${network === 'mainnet' ? 'bg-indigo-600 text-white shadow-lg' : 'text-vscode-muted hover:text-white'}`}
                            >
                                Kortana Mainnet
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] text-vscode-muted uppercase font-black tracking-widest">Gas Limit</label>
                            <input
                                type="text"
                                value={gasLimit}
                                onChange={(e) => setGasLimit(e.target.value)}
                                className="w-full bg-black/40 text-white text-[12px] font-mono p-3 rounded-lg border border-white/10 outline-none focus:border-indigo-500/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-vscode-muted uppercase font-black tracking-widest">Gas Price (Gwei)</label>
                            <input
                                type="text"
                                value={gasPrice}
                                onChange={(e) => setGasPrice(e.target.value)}
                                className="w-full bg-black/40 text-white text-[12px] font-mono p-3 rounded-lg border border-white/10 outline-none focus:border-indigo-500/50"
                            />
                        </div>
                    </div>

                    {/* Status Messages */}
                    {status === 'processing' && (
                        <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl flex items-center space-x-4 text-indigo-400 animate-pulse">
                            <div className="w-5 h-5 border-2 border-t-white border-indigo-500/30 rounded-full animate-spin" />
                            <div className="flex flex-col">
                                <span className="text-[12px] font-bold uppercase tracking-wider">Broadcasting...</span>
                                <span className="text-[10px] opacity-70">Linking bytecode to Kortana nodes</span>
                            </div>
                        </div>
                    )}

                    {status === 'confirmed' && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-xl space-y-4 text-emerald-400 animate-in fade-in zoom-in duration-300 shadow-2xl">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 rounded-lg bg-emerald-500/20">
                                    <ShieldCheck size={28} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[13px] font-black uppercase tracking-[0.1em]">Deployment Atomic Success</span>
                                    <span className="text-[11px] opacity-80">Logic is now immutable on Kortana Protocol</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-emerald-500/10 space-y-4">
                                <div className="flex flex-col space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[9px] uppercase font-black opacity-60 tracking-[0.2em]">Contract Essence Address</label>
                                        <button
                                            onClick={() => handleCopy(lastDeployment?.address || '')}
                                            className={`text-[9px] font-black flex items-center space-x-1 px-2 py-0.5 rounded transition-all ${copied ? 'bg-emerald-500 text-white' : 'hover:bg-white/10 text-emerald-400'}`}
                                        >
                                            <span>{copied ? 'COPIED!' : 'COPY'}</span>
                                        </button>
                                    </div>
                                    <div className="text-[11px] font-mono bg-black/40 p-3 rounded-lg border border-white/5 select-all break-all text-white shadow-inner">
                                        {lastDeployment?.address}
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-1">
                                    <label className="text-[9px] uppercase font-black opacity-60 tracking-[0.2em]">Transaction Trace Hash</label>
                                    <a
                                        href={`${explorerUrl}tx/${lastDeployment?.txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] font-mono opacity-80 truncate hover:text-indigo-400 hover:underline transition-colors flex items-center space-x-1"
                                    >
                                        <span>{lastDeployment?.txHash}</span>
                                        <ChevronRight size={12} />
                                    </a>
                                </div>
                            </div>

                            <button
                                onClick={onInteract}
                                className="w-full mt-4 flex items-center justify-center space-x-2 py-3 bg-emerald-500 text-white rounded-lg text-[11px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg active:scale-95"
                            >
                                <ChevronRight size={16} />
                                <span>Interact with Contract Interface</span>
                            </button>
                        </div>
                    )}

                    {status === 'failed' && (
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center space-x-4 text-red-400 animate-in slide-in-from-top-4">
                            <div className="p-2 rounded-lg bg-red-500/20"><AlertTriangle size={24} /></div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-bold uppercase tracking-wider">Deployment Reverted</span>
                                <span className="text-[10px] opacity-80 line-clamp-2">{error || 'Network error — Check DNR balance'}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-white/2 border-t border-white/5 flex items-center justify-between">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-vscode-muted hover:text-white transition-all text-[11px] font-black uppercase tracking-widest"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDeploy}
                        disabled={isDeploying || status === 'confirmed'}
                        className="relative group overflow-hidden bg-gradient-to-r from-indigo-600 to-indigo-800 disabled:from-white/10 disabled:to-white/10 px-8 py-3 rounded-lg text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-xl disabled:opacity-30 transition-all hover:scale-[1.02] active:scale-95"
                    >
                        <div className="flex items-center space-x-2 relative z-10">
                            {isDeploying ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-t-white border-white/20 rounded-full animate-spin" />
                                    <span>Syncing...</span>
                                </>
                            ) : status === 'confirmed' ? (
                                <>
                                    <ShieldCheck size={16} />
                                    <span>Successfully Deployed</span>
                                </>
                            ) : (
                                <>
                                    <span>Deploy Pulse</span>
                                    <ChevronRight size={16} />
                                </>
                            )}
                        </div>
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </button>
                </div>
            </div>
        </div>
    );
};


export default DeploymentModal;
