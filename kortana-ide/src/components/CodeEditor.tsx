import React, { useEffect } from 'react';
import { Editor, OnMount, BeforeMount, loader } from '@monaco-editor/react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { updateFileContent, openProject } from '../store/slices/editorSlice';
import { registerQuorlinLanguage } from '../utils/quorlin';
import { Cpu } from 'lucide-react';

const CodeEditor: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { files, activeFileId } = useSelector((state: RootState) => state.editor);
    const activeFile = files.find(f => f.id === activeFileId);

    const handleEditorChange = (value: string | undefined) => {
        if (activeFileId && value !== undefined) {
            dispatch(updateFileContent({ id: activeFileId, content: value }));
        }
    };

    const handleEditorWillMount: BeforeMount = (monaco) => {
        // Register Custom Languages
        registerQuorlinLanguage(monaco);

        // Register Solidity specifically if needed (though Monaco often has community support)
        monaco.languages.register({ id: 'solidity' });
        monaco.languages.setMonarchTokensProvider('solidity', {
            defaultToken: '',
            tokenPostfix: '.sol',
            keywords: [
                'pragma', 'solidity', 'contract', 'library', 'interface', 'function', 'constructor',
                'modifier', 'event', 'struct', 'enum', 'mapping', 'address', 'uint', 'uint256',
                'int', 'int256', 'bool', 'string', 'bytes', 'bytes32', 'memory', 'storage',
                'calldata', 'public', 'private', 'internal', 'external', 'view', 'pure',
                'payable', 'returns', 'return', 'if', 'else', 'for', 'while', 'do', 'break',
                'continue', 'throw', 'revert', 'require', 'assert', 'emit', 'is', 'using'
            ],
            operators: [
                '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=', '&&', '||',
                '++', '--', '+', '-', '*', '/', '&', '|', '^', '%', '<<', '>>'
            ],
            symbols: /[=><!~?:&|+\-*\/\^%]+/,
            tokenizer: {
                root: [
                    [/[a-z_$][\w$]*/, {
                        cases: {
                            '@keywords': 'keyword',
                            '@default': 'identifier'
                        }
                    }],
                    [/[A-Z][\w]*/, 'type.identifier'],
                    { include: '@whitespace' },
                    [/[{}()\[\]]/, '@brackets'],
                    [/@symbols/, {
                        cases: {
                            '@operators': 'operator',
                            '@default': ''
                        }
                    }],
                    [/\d+/, 'number'],
                    [/[;,.]/, 'delimiter'],
                    [/"([^"\\]|\\.)*$/, 'string.invalid'],
                    [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
                ],
                string: [
                    [/[^\\"]+/, 'string'],
                    [/\\./, 'string.escape'],
                    [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
                ],
                whitespace: [
                    [/[ \t\r\n]+/, 'white'],
                    [/\/\*/, 'comment', '@comment'],
                    [/\/\/.*$/, 'comment'],
                ],
                comment: [
                    [/[^\/*]+/, 'comment'],
                    [/\/\*/, 'comment', '@push'],
                    ["\\*/", 'comment', '@pop'],
                    [/[\/*]/, 'comment']
                ],
            }
        });

        // Define VS Code Premium Dark Theme
        monaco.editor.defineTheme('kortana-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'keyword', foreground: 'c586c0', fontStyle: 'bold' },
                { token: 'type.identifier', foreground: '4ec9b0' },
                { token: 'identifier', foreground: '9cdcfe' },
                { token: 'string', foreground: 'ce9178' },
                { token: 'number', foreground: 'b5cea8' },
                { token: 'comment', foreground: '6a9955', fontStyle: 'italic' },
                { token: 'operator', foreground: 'd4d4d4' },
            ],
            colors: {
                'editor.background': '#0f1115',
                'editor.foreground': '#d4d4d4',
                'editorCursor.foreground': '#6366f1',
                'editor.lineHighlightBackground': '#1e2025',
                'editorLineNumber.foreground': '#454545',
                'editorLineNumber.activeForeground': '#858585',
                'editorIndentGuide.background': '#2d2d2d',
                'editorSuggestWidget.background': '#161a22',
            }
        });
    };

    return (
        <div className="relative h-full w-full">
            {activeFile ? (
                <Editor
                    height="100%"
                    language={activeFile.language}
                    value={activeFile.content}
                    theme="kortana-dark"
                    beforeMount={handleEditorWillMount}
                    onChange={handleEditorChange}
                    options={{
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', monospace",
                        minimap: { enabled: true, side: 'right', renderCharacters: false, maxColumn: 80 },
                        lineNumbers: 'on',
                        roundedSelection: true,
                        scrollBeyondLastLine: false,
                        readOnly: false,
                        automaticLayout: true,
                        cursorSmoothCaretAnimation: 'on',
                        cursorBlinking: 'smooth',
                        smoothScrolling: true,
                        padding: { top: 20, bottom: 20 },
                        scrollbar: {
                            verticalScrollbarSize: 8,
                            horizontalScrollbarSize: 8,
                        },
                        overviewRulerLanes: 0,
                        hideCursorInOverviewRuler: true,
                        renderLineHighlight: 'all',
                        bracketPairColorization: { enabled: true },
                        guides: { indentation: true },
                    }}
                />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f1115] text-vscode-muted space-y-6">
                    <div className="relative">
                        <div className="absolute -inset-4 bg-indigo-500/10 rounded-full blur-2xl"></div>
                        <Cpu size={64} className="text-white/10" />
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-white/50 tracking-tighter uppercase font-sans">Initialize Workspace</h2>
                        <p className="text-[11px] uppercase tracking-[0.3em] font-medium text-vscode-muted">Kernel ready for project mount</p>
                    </div>
                    <div className="flex space-x-4 mt-8">
                        <button
                            onClick={() => dispatch(openProject())}
                            className="btn-primary"
                        >
                            Open Local Folder
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CodeEditor;
