import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Play, ArrowRight, Loader2, Key, Hash, ShieldCheck } from 'lucide-react';
import { ethers } from 'ethers';
import { BlockchainService } from '../services/BlockchainService';

const InteractionPanel: React.FC = () => {
    const { isConnected, address } = useSelector((state: RootState) => state.wallet);
    const lastDeployment = useSelector((state: RootState) => state.deployment.lastDeployment);

    const [inputs, setInputs] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [results, setResults] = useState<Record<string, string>>({});

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-6 animate-fade-in h-64">
                <div className="p-5 rounded-3xl bg-indigo-500/10 text-indigo-400 shadow-2xl ring-1 ring-indigo-500/20">
                    <Key size={40} />
                </div>
                <div className="space-y-2">
                    <h3 className="text-[12px] font-black text-white uppercase tracking-[0.3em]">Vault Locked</h3>
                    <p className="text-[10px] text-vscode-muted max-w-[200px] leading-relaxed">Connect your Kortana Identity via MetaMask to interact with live logic.</p>
                </div>
            </div>
        );
    }

    if (!lastDeployment) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-6 animate-fade-in h-64">
                <div className="p-5 rounded-3xl bg-white/5 text-vscode-muted shadow-2xl ring-1 ring-white/10">
                    <Hash size={40} />
                </div>
                <div className="space-y-2">
                    <h3 className="text-[12px] font-black text-vscode-muted uppercase tracking-[0.3em]">No Active Essence</h3>
                    <p className="text-[10px] text-vscode-muted/50 max-w-[200px] leading-relaxed">Deploy a smart contract to generate an interaction interface.</p>
                </div>
            </div>
        );
    }

    // Defensive ABI Parsing: C# backend might return ABI as a JSON string
    let abi = lastDeployment.abi;
    if (typeof abi === 'string') {
        try {
            abi = JSON.parse(abi);
        } catch (e) {
            console.error("Failed to parse ABI string", e);
            abi = [];
        }
    }

    const { address: contractAddress, contractName } = lastDeployment;
    const functions = Array.isArray(abi) ? abi.filter((item: any) => item.type === 'function') : [];

    const handleCall = async (fn: any) => {
        const fnId = `${fn.name}-${fn.inputs.length}`;
        setLoading(prev => ({ ...prev, [fnId]: true }));

        try {
            const service = BlockchainService.getInstance();
            const provider = service.getProvider();

            // Parse constructor arguments with type coercion
            const args = fn.inputs.map((input: any) => {
                const val = inputs[`${fnId}-${input.name}`]?.trim() || '';
                if (val === '') throw new Error(`Input required: ${input.name} (${input.type})`);
                if (input.type.includes('int') && !isNaN(Number(val)) && val !== '') return BigInt(val);
                if (input.type === 'bool') return val.toLowerCase() === 'true';
                return val;
            });

            let result;
            if (fn.stateMutability === 'view' || fn.stateMutability === 'pure') {
                // READ: use rpcProvider directly — plain eth_call, no wallet needed
                const readContract = new ethers.Contract(contractAddress, abi, provider);
                result = await readContract[fn.name](...args);
            } else {
                // WRITE: need MetaMask or private key signer
                const signer = await service.getSignerForInteraction();
                if (!signer) throw new Error('No wallet connected. Please connect MetaMask or a Private Key first.');
                const writeContract = new ethers.Contract(contractAddress, abi, signer);
                const tx = await writeContract[fn.name](...args, { gasLimit: BigInt(500000) });
                result = `Transaction Broadcasted: ${tx.hash}`;
                await tx.wait();
                result = `Success! TX Hash: ${tx.hash}`;
            }

            setResults(prev => ({ ...prev, [fnId]: typeof result === 'bigint' ? result.toString() : result?.toString() || 'Success (No Return)' }));
        } catch (error: any) {
            console.error('Interaction Error:', error);
            let msg = error.message?.split(' (')[0] || 'Unknown error';
            if (msg.includes('could not decode') || msg.includes('bad response') || msg.includes('coalesce')) {
                msg = 'Node returned unexpected data — retry in 5 seconds.';
            } else if (msg.includes('reverted')) {
                msg = 'Execution Reverted: The contract logic rejected this call.';
            } else if (msg.includes('Input required')) {
                msg = error.message;
            }
            setResults(prev => ({ ...prev, [fnId]: `Error: ${msg}` }));
        } finally {
            setLoading(prev => ({ ...prev, [fnId]: false }));
        }
    };

    return (
        <div className="p-1 space-y-6 animate-fade-in custom-scrollbar overflow-y-auto max-h-full">
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-4 px-4 pt-2">
                    <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                            <ShieldCheck size={14} className="text-indigo-400" />
                            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">{contractName} Interface</h3>
                        </div>
                        <span className="text-[9px] text-vscode-muted font-mono mt-1 opacity-60">{contractAddress}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        {/* <span className="cursor-pointer px-2 py-1 rounded hover:bg-white/10">Go</span> */}
                        {typeof window.ipcRenderer !== 'undefined' && (
                            <button
                                onClick={() => window.open('http://localhost:3000', '_blank')}
                                className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all text-[10px] font-bold border border-indigo-500/20"
                            >
                                Open in Browser
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 px-4 pb-8">
                    {functions.map((fn: any) => {
                        const fnId = `${fn.name}-${fn.inputs.length}`;
                        const isView = fn.stateMutability === 'view' || fn.stateMutability === 'pure';

                        return (
                            <div key={fnId} className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl space-y-4 hover:bg-white/[0.05] transition-all shadow-xl group ring-1 ring-transparent hover:ring-white/10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] ${isView ? 'bg-indigo-400 shadow-indigo-500/50' : 'bg-amber-400 shadow-amber-500/50'}`} />
                                        <span className={`text-[12px] font-black uppercase tracking-wider ${isView ? 'text-indigo-400' : 'text-amber-400'}`}>
                                            {fn.name}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleCall(fn)}
                                        disabled={loading[fnId]}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-2 shadow-lg active:scale-95 disabled:opacity-50 ${isView ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-amber-600 hover:bg-amber-500 text-white'}`}
                                    >
                                        {loading[fnId] ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                                        <span>{isView ? 'Call' : 'Execute'}</span>
                                    </button>
                                </div>

                                {fn.inputs.length > 0 && (
                                    <div className="space-y-3">
                                        {fn.inputs.map((input: any) => (
                                            <div key={input.name} className="relative">
                                                <input
                                                    placeholder={`${input.name} (${input.type})`}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-[11px] text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-white/20"
                                                    value={inputs[`${fnId}-${input.name}`] || ''}
                                                    onChange={(e) => setInputs(prev => ({ ...prev, [`${fnId}-${input.name}`]: e.target.value }))}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {results[fnId] && (
                                    <div className="mt-3 p-4 bg-black/40 rounded-xl border border-white/5 text-[10px] font-mono text-white/90 break-all animate-in fade-in slide-in-from-top-2 shadow-inner">
                                        <div className="text-vscode-muted mb-2 text-[8px] uppercase font-black tracking-widest opacity-50">Output Trace</div>
                                        <div className="flex items-start space-x-3">
                                            <ArrowRight size={14} className="mt-0.5 text-indigo-400 shrink-0" />
                                            <span className="leading-relaxed">
                                                {results[fnId].startsWith('0x0000000000000000000000000000000000000000000000000000000000000000')
                                                    ? '0 (Sandbox Default)'
                                                    : results[fnId] === '0x'
                                                        ? 'Empty Response (Success)'
                                                        : results[fnId]}
                                            </span>
                                        </div>
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
