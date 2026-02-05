import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Play, ArrowRight, Loader2, Key, Hash } from 'lucide-react';
import { ethers } from 'ethers';
import { BlockchainService } from '../services/BlockchainService';

const InteractionPanel: React.FC = () => {
    const { isConnected, address } = useSelector((state: RootState) => state.wallet);
    const { lastDeployment } = useSelector((state: RootState) => state.deployment);

    const [inputs, setInputs] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [results, setResults] = useState<Record<string, string>>({});

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="p-4 rounded-full bg-indigo-500/10 text-indigo-400">
                    <Key size={32} />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Connect Wallet</h3>
                <p className="text-[11px] text-vscode-muted">Please link your MetaMask wallet to interact with deployed contracts.</p>
            </div>
        );
    }

    if (!lastDeployment) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                <Hash size={32} className="text-vscode-muted/20" />
                <p className="text-[11px] text-vscode-muted uppercase tracking-widest">No Active Contract</p>
                <p className="text-[10px] text-vscode-muted/50">Deploy a contract to see interaction options here.</p>
            </div>
        );
    }

    const { abi, address: contractAddress, contractName } = lastDeployment;
    const functions = abi.filter((item: any) => item.type === 'function');

    const handleCall = async (fn: any) => {
        const fnId = `${fn.name}-${fn.inputs.length}`;
        setLoading(prev => ({ ...prev, [fnId]: true }));

        try {
            const service = BlockchainService.getInstance();
            const provider = service.getProvider();
            if (!provider) throw new Error("No provider");

            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, abi, signer);

            const args = fn.inputs.map((input: any) => inputs[`${fnId}-${input.name}`] || '');

            let result;
            if (fn.stateMutability === 'view' || fn.stateMutability === 'pure') {
                result = await contract[fn.name](...args);
            } else {
                const tx = await contract[fn.name](...args, { type: 0 });
                result = `TX: ${tx.hash.slice(0, 10)}...`;
                await tx.wait();
            }

            setResults(prev => ({ ...prev, [fnId]: result.toString() }));
        } catch (error: any) {
            console.error(error);
            setResults(prev => ({ ...prev, [fnId]: `Error: ${error.message.slice(0, 30)}...` }));
        } finally {
            setLoading(prev => ({ ...prev, [fnId]: false }));
        }
    };

    return (
        <div className="p-4 space-y-6 animate-fade-in">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">{contractName} Engine</h3>
                    <span className="text-[9px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded">
                        {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
                    </span>
                </div>

                <div className="space-y-3">
                    {functions.map((fn: any) => {
                        const fnId = `${fn.name}-${fn.inputs.length}`;
                        const isView = fn.stateMutability === 'view' || fn.stateMutability === 'pure';

                        return (
                            <div key={fnId} className="p-3 bg-white/2 border border-white/5 rounded-lg space-y-3 hover:bg-white/5 transition-all">
                                <div className="flex items-center justify-between">
                                    <span className={`text-[11px] font-bold ${isView ? 'text-indigo-400' : 'text-amber-400'}`}>
                                        {fn.name}
                                    </span>
                                    <button
                                        onClick={() => handleCall(fn)}
                                        disabled={loading[fnId]}
                                        className={`p-1.5 rounded transition-all ${isView ? 'hover:bg-indigo-500/20 text-indigo-400' : 'hover:bg-amber-500/20 text-amber-400'}`}
                                    >
                                        {loading[fnId] ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                                    </button>
                                </div>

                                {fn.inputs.length > 0 && (
                                    <div className="space-y-2">
                                        {fn.inputs.map((input: any) => (
                                            <input
                                                key={input.name}
                                                placeholder={`${input.name} (${input.type})`}
                                                className="w-full bg-black/40 border border-white/5 rounded px-2 py-1 text-[10px] focus:outline-none focus:border-indigo-500/50"
                                                value={inputs[`${fnId}-${input.name}`] || ''}
                                                onChange={(e) => setInputs(prev => ({ ...prev, [`${fnId}-${input.name}`]: e.target.value }))}
                                            />
                                        ))}
                                    </div>
                                )}

                                {results[fnId] && (
                                    <div className="pt-2 border-t border-white/5 text-[9px] font-mono text-vscode-muted break-all">
                                        <ArrowRight size={10} className="inline mr-1" />
                                        {results[fnId]}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default InteractionPanel;
