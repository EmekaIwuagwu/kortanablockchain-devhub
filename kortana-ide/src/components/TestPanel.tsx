import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { runProjectTests } from '../store/slices/testSlice';
import { Beaker, Play, CheckCircle, XCircle, Clock, RotateCcw } from 'lucide-react';

const TestPanel: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { status, lastResult, error } = useSelector((state: RootState) => state.test);
    const { files, activeFileId } = useSelector((state: RootState) => state.editor);

    const activeFile = files.find(f => f.id === activeFileId);

    const handleRunTests = () => {
        if (activeFile) {
            dispatch(runProjectTests({
                sourceCode: activeFile.content,
                fileName: activeFile.name
            }));
        }
    };

    return (
        <div className="flex flex-col h-full bg-vscode-sidebar text-[13px] overflow-hidden">
            <div className="p-4 border-b border-vscode-border flex justify-between items-center bg-vscode-bg/50">
                <div className="flex items-center space-x-2">
                    <Beaker size={18} className="text-vscode-accent" />
                    <span className="font-bold uppercase tracking-wider text-[11px]">Test Lab</span>
                </div>
                <button
                    onClick={handleRunTests}
                    disabled={status === 'running' || !activeFile}
                    className="flex items-center space-x-1 bg-vscode-success/10 text-vscode-success px-3 py-1 rounded border border-vscode-success/30 hover:bg-vscode-success/20 transition-all disabled:opacity-30"
                >
                    <Play size={14} />
                    <span className="font-bold">Run Tests</span>
                </button>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {status === 'idle' && !lastResult && (
                    <div className="flex flex-col items-center justify-center h-48 text-vscode-muted opacity-50">
                        <Beaker size={48} className="mb-2" />
                        <p>Select a test file and click "Run Tests"</p>
                    </div>
                )}

                {status === 'running' && (
                    <div className="flex flex-col items-center justify-center h-48">
                        <RotateCcw size={32} className="animate-spin text-vscode-accent mb-4" />
                        <p className="animate-pulse">Executing unit tests...</p>
                    </div>
                )}

                {lastResult && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="bg-vscode-bg p-3 rounded-lg border border-vscode-border">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-vscode-muted">Summary</span>
                                <span className="text-[10px] text-vscode-muted">{new Date(lastResult.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <div className="flex space-x-4">
                                <div className="text-center flex-grow py-2 bg-vscode-success/5 rounded border border-vscode-success/10">
                                    <div className="text-xl font-bold text-vscode-success">{lastResult.passed}</div>
                                    <div className="text-[10px] uppercase text-vscode-muted">Passed</div>
                                </div>
                                <div className="text-center flex-grow py-2 bg-vscode-error/5 rounded border border-vscode-error/10">
                                    <div className="text-xl font-bold text-vscode-error">{lastResult.failed}</div>
                                    <div className="text-[10px] uppercase text-vscode-muted">Failed</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-[11px] font-bold text-vscode-muted uppercase px-1">Detailed Results</h4>
                            {lastResult.results.map((test, idx) => (
                                <div key={idx} className="bg-vscode-bg/40 border border-vscode-border/50 p-2 rounded flex flex-col space-y-2 group hover:bg-vscode-hover transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-2">
                                            {test.status === 'passed' ? (
                                                <CheckCircle size={16} className="text-vscode-success mt-0.5" />
                                            ) : (
                                                <XCircle size={16} className="text-vscode-error mt-0.5" />
                                            )}
                                            <div className="flex flex-col">
                                                <span className={`${test.status === 'failed' ? 'text-vscode-error' : 'text-white'} font-medium`}>
                                                    {test.name}
                                                </span>
                                                <div className="flex items-center text-[10px] text-vscode-muted mt-1">
                                                    <Clock size={10} className="mr-1" />
                                                    {test.duration}ms
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {test.error && (
                                        <div className="pl-6 pt-1">
                                            <div className="bg-vscode-error/10 text-vscode-error text-[11px] p-2 rounded border border-vscode-error/20 font-mono">
                                                {test.error}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestPanel;
