import React, { useState } from 'react';
import { X, ShieldCheck, Cpu, ChevronRight } from 'lucide-react';
import { Language } from '../types';

interface NewProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (projectName: string, language: Language) => void;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose, onCreate }) => {
    const [projectName, setProjectName] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState<Language>('solidity');

    if (!isOpen) return null;

    const handleCreate = () => {
        if (projectName.trim()) {
            onCreate(projectName.trim(), selectedLanguage);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in px-4">
            <div className="bg-vscode-sidebar w-full max-w-md border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col glass-panel">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">New Project Scaffolding</h3>
                    <button onClick={onClose} className="text-vscode-muted hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] text-vscode-muted uppercase font-black tracking-widest">Project Name</label>
                        <input
                            type="text"
                            autoFocus
                            placeholder="e.g. MySmartContract"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all font-mono"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] text-vscode-muted uppercase font-black tracking-widest">Select Engine / Language</label>
                        <div className="grid grid-cols-1 gap-3">
                            <div
                                onClick={() => setSelectedLanguage('solidity')}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center space-x-4 ${selectedLanguage === 'solidity' ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 bg-white/2 hover:bg-white/5'}`}
                            >
                                <div className={`p-2 rounded-lg ${selectedLanguage === 'solidity' ? 'bg-indigo-500 text-white' : 'bg-white/5 text-vscode-muted'}`}>
                                    <ShieldCheck size={24} />
                                </div>
                                <div className="flex-grow">
                                    <div className="text-sm font-bold text-white">Solidity Smart Contract</div>
                                    <div className="text-[10px] text-vscode-muted uppercase tracking-tight">EVM Compatible • Enterprise Standard</div>
                                </div>
                                {selectedLanguage === 'solidity' && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                            </div>

                            <div
                                onClick={() => setSelectedLanguage('quorlin')}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center space-x-4 ${selectedLanguage === 'quorlin' ? 'border-amber-500 bg-amber-500/10' : 'border-white/5 bg-white/2 hover:bg-white/5'}`}
                            >
                                <div className={`p-2 rounded-lg ${selectedLanguage === 'quorlin' ? 'bg-amber-500 text-white' : 'bg-white/5 text-vscode-muted'}`}>
                                    <Cpu size={24} />
                                </div>
                                <div className="flex-grow">
                                    <div className="text-sm font-bold text-white">Quorlin Script</div>
                                    <div className="text-[10px] text-vscode-muted uppercase tracking-tight">High Performance • Next-Gen Logic</div>
                                </div>
                                {selectedLanguage === 'quorlin' && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-white/2 border-t border-white/5 flex justify-end">
                    <button
                        onClick={handleCreate}
                        disabled={!projectName.trim()}
                        className="btn-primary flex items-center space-x-2 px-8 py-2.5 disabled:opacity-20 shadow-xl"
                    >
                        <span className="font-bold uppercase tracking-widest text-[11px]">Initialize Engine</span>
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewProjectModal;
