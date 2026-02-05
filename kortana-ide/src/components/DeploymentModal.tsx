import React, { useState } from 'react';
import { X, ChevronRight, Info, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { deployContract } from '../store/slices/deploymentSlice';

interface DeploymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    contractName: string;
    bytecode: string;
    abi: any[];
}

const DeploymentModal: React.FC<DeploymentModalProps> = ({ isOpen, onClose, contractName, bytecode, abi }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [gasLimit, setGasLimit] = useState('3000000');
    const [gasPrice, setGasPrice] = useState('20');
    const [network, setNetwork] = useState<'testnet' | 'mainnet'>('testnet');

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in px-4">
            <div className="bg-vscode-sidebar w-full max-w-md border border-vscode-border rounded-lg shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-4 py-3 bg-vscode-activity border-b border-vscode-border flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <ShieldCheck size={18} className="text-vscode-accent" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Deploy Smart Contract</h3>
                    </div>
                    <button onClick={onClose} className="text-vscode-muted hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
                    <div className="space-y-1">
                        <label className="text-[11px] text-vscode-muted uppercase font-bold">Contract Name</label>
                        <div className="text-sm text-white font-mono bg-vscode-bg p-2 rounded border border-vscode-border">
                            {contractName}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[11px] text-vscode-muted uppercase font-bold">Target Network</label>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setNetwork('testnet')}
                                className={`flex-1 py-2 text-[13px] rounded border transition-all ${network === 'testnet' ? 'bg-vscode-accent text-white border-vscode-accent' : 'bg-vscode-bg text-vscode-muted border-vscode-border hover:border-vscode-muted'}`}
                            >
                                Testnet
                            </button>
                            <button
                                onClick={() => setNetwork('mainnet')}
                                className={`flex-1 py-2 text-[13px] rounded border transition-all ${network === 'mainnet' ? 'bg-vscode-accent text-white border-vscode-accent' : 'bg-vscode-bg text-vscode-muted border-vscode-border hover:border-vscode-muted'}`}
                            >
                                Mainnet
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[11px] text-vscode-muted uppercase font-bold">Gas Limit</label>
                            <input
                                type="text"
                                value={gasLimit}
                                onChange={(e) => setGasLimit(e.target.value)}
                                className="w-full bg-vscode-bg text-white text-sm p-2 rounded border border-vscode-border outline-none focus:border-vscode-accent"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[11px] text-vscode-muted uppercase font-bold">Gas Price (Gwei)</label>
                            <input
                                type="text"
                                value={gasPrice}
                                onChange={(e) => setGasPrice(e.target.value)}
                                className="w-full bg-vscode-bg text-white text-sm p-2 rounded border border-vscode-border outline-none focus:border-vscode-accent"
                            />
                        </div>
                    </div>

                    {/* Status Messages */}
                    {status === 'processing' && (
                        <div className="bg-vscode-accent/10 border border-vscode-accent/30 p-3 rounded flex items-center space-x-3 text-vscode-accent">
                            <div className="w-5 h-5 border-2 border-t-white border-vscode-accent/30 rounded-full animate-spin" />
                            <span className="text-[13px] font-medium">Broadcasting to Kortana Network...</span>
                        </div>
                    )}

                    {status === 'confirmed' && (
                        <div className="bg-vscode-success/10 border border-vscode-success/30 p-4 rounded-xl space-y-3 text-vscode-success animate-fade-in shadow-lg">
                            <div className="flex items-center space-x-3">
                                <ShieldCheck size={24} />
                                <div className="flex flex-col">
                                    <span className="text-[13px] font-bold uppercase tracking-widest">Deployment Successful</span>
                                    <span className="text-[11px] opacity-80">Contract is now live on Kortana Poseidon</span>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-vscode-success/20 space-y-2">
                                <div className="flex flex-col">
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-[9px] uppercase font-bold opacity-60">Contract Address</label>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(lastDeployment?.address || '')}
                                            className="text-[9px] hover:text-white transition-colors flex items-center space-x-1"
                                        >
                                            <span className="font-bold">COPY</span>
                                        </button>
                                    </div>
                                    <div className="text-[11px] font-mono bg-black/30 p-2 rounded border border-vscode-success/20 select-all break-all text-white">
                                        {lastDeployment?.address}
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-[9px] uppercase font-bold opacity-60">Transaction Hash</label>
                                    <div className="text-[11px] font-mono opacity-80 truncate">
                                        {lastDeployment?.txHash}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {status === 'failed' && (
                        <div className="bg-vscode-error/10 border border-vscode-error/30 p-3 rounded flex items-center space-x-3 text-vscode-error">
                            <AlertTriangle size={20} />
                            <span className="text-[13px]">{error || 'Unknown Error'}</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-vscode-activity border-t border-vscode-border flex justify-end space-x-3 capitalize">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-vscode-muted hover:text-white transition-all text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDeploy}
                        disabled={isDeploying || status === 'confirmed'}
                        className="btn-primary flex items-center space-x-2 px-6 disabled:opacity-50"
                    >
                        {isDeploying ? 'Deploying...' : status === 'confirmed' ? 'Successfully Deployed' : 'Deploy Now'}
                        {!isDeploying && status !== 'confirmed' && <ChevronRight size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeploymentModal;
