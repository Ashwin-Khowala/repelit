import Editor from '@monaco-editor/react';
import { useState, useRef } from 'react';

export function MonacoEditor({
    fileName,
    language,
    value,
    onChange
}: {
    fileName?: string;
    language: string;
    value?: string;
    onChange?: (value: string | undefined) => void;
}) {
    const [isLoading, setIsLoading] = useState(true);
    const editorRef = useRef<any>(null);

    const handleEditorDidMount = (editor: any, monaco: any) => {
        editorRef.current = editor;
        setIsLoading(false);

        // Configure compiler options to be more lenient
        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.Latest,
            allowNonTsExtensions: true,
            moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
            module: monaco.languages.typescript.ModuleKind.CommonJS,
            noEmit: true,
            esModuleInterop: true,
            jsx: monaco.languages.typescript.JsxEmit.React,
            reactNamespace: 'React',
            allowJs: true,
            typeRoots: ['node_modules/@types']
        });

        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.Latest,
            allowNonTsExtensions: true,
            moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
            module: monaco.languages.typescript.ModuleKind.CommonJS,
            noEmit: true,
            esModuleInterop: true,
            jsx: monaco.languages.typescript.JsxEmit.React,
            reactNamespace: 'React',
            allowJs: true,
            typeRoots: ['node_modules/@types']
        });

        // Configure Monaco editor options
        editor.updateOptions({
            fontSize: 16,
            lineHeight: 20,
            fontFamily: 'JetBrains Mono, Fira Code, Consolas, Monaco, monospace',
            fontLigatures: true,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            wrappingIndent: 'indent',
            automaticLayout: true,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            renderLineHighlight: 'all',
            bracketPairColorization: { enabled: true },
            guides: {
                bracketPairs: true,
                indentation: true,
            },
            suggest: {
                preview: true,
                showKeywords: true,
                showSnippets: true,
            },
        });

        // Custom dark theme with proper token scopes
        monaco.editor.defineTheme('customDark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                // Comments
                { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
                { token: 'comment.line', foreground: '6A9955', fontStyle: 'italic' },
                { token: 'comment.block', foreground: '6A9955', fontStyle: 'italic' },
                
                // Keywords
                { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
                { token: 'keyword.control', foreground: 'C586C0', fontStyle: 'bold' },
                { token: 'keyword.operator', foreground: 'D4D4D4' },
                { token: 'keyword.other', foreground: '569CD6' },
                
                // Strings
                { token: 'string', foreground: 'CE9178' },
                { token: 'string.quoted', foreground: 'CE9178' },
                { token: 'string.template', foreground: 'CE9178' },
                
                // Numbers
                { token: 'number', foreground: 'B5CEA8' },
                { token: 'constant.numeric', foreground: 'B5CEA8' },
                
                // Regular expressions
                { token: 'regexp', foreground: 'D16969' },
                
                // Types and classes
                { token: 'type', foreground: '4EC9B0' },
                { token: 'type.identifier', foreground: '4EC9B0' },
                { token: 'entity.name.type', foreground: '4EC9B0' },
                { token: 'entity.name.class', foreground: '4EC9B0' },
                { token: 'support.class', foreground: '4EC9B0' },
                
                // Functions
                { token: 'entity.name.function', foreground: 'DCDCAA' },
                { token: 'support.function', foreground: 'DCDCAA' },
                { token: 'meta.function-call', foreground: 'DCDCAA' },
                
                // Variables and identifiers
                { token: 'variable', foreground: '9CDCFE' },
                { token: 'variable.other', foreground: '9CDCFE' },
                { token: 'variable.parameter', foreground: '9CDCFE' },
                { token: 'entity.name.variable', foreground: '9CDCFE' },
                
                // Constants
                { token: 'constant', foreground: '4FC1FF' },
                { token: 'constant.language', foreground: '569CD6' },
                { token: 'constant.character', foreground: '4FC1FF' },
                { token: 'variable.language', foreground: '569CD6' },
                
                // JavaScript/TypeScript specific
                { token: 'support.type.primitive', foreground: '569CD6' },
                { token: 'storage.type', foreground: '569CD6' },
                { token: 'storage.modifier', foreground: '569CD6' },
                
                // Punctuation
                { token: 'punctuation', foreground: 'D4D4D4' },
                { token: 'delimiter', foreground: 'D4D4D4' },
                
                // Operators
                { token: 'operator', foreground: 'D4D4D4' },
                
                // Tags (for HTML/XML)
                { token: 'tag', foreground: '569CD6' },
                { token: 'tag.id', foreground: '569CD6' },
                { token: 'tag.class', foreground: '569CD6' },
                
                // Attributes
                { token: 'attribute.name', foreground: '92C5F8' },
                { token: 'attribute.value', foreground: 'CE9178' },
            ],
            colors: {
                'editor.background': '#0D1117',
                'editor.foreground': '#E6EDF3',
                'editor.lineHighlightBackground': '#161B22',
                'editor.selectionBackground': '#264F78',
                'editor.inactiveSelectionBackground': '#264F7840',
                'editor.selectionHighlightBackground': '#ADD6FF26',
                'editorLineNumber.foreground': '#6E7681',
                'editorLineNumber.activeForeground': '#F0F6FC',
                'editorIndentGuide.background': '#21262D',
                'editorIndentGuide.activeBackground': '#30363D',
                'editorBracketMatch.background': '#17E5E650',
                'editorBracketMatch.border': '#17E5E6',
                'editorCursor.foreground': '#F0F6FC',
                'editor.findMatchBackground': '#F2CC6050',
                'editor.findMatchHighlightBackground': '#F2CC6025',
                'editorWidget.background': '#161B22',
                'editorWidget.border': '#30363D',
                'editorSuggestWidget.background': '#161B22',
                'editorSuggestWidget.border': '#30363D',
                'editorSuggestWidget.selectedBackground': '#264F78',
                'scrollbar.shadow': '#00000000',
                'scrollbarSlider.background': '#6E768180',
                'scrollbarSlider.hoverBackground': '#6E7681',
                'scrollbarSlider.activeBackground': '#6E7681',
            }
        });

        // Set the theme
        monaco.editor.setTheme('customDark');
        
        // Force re-tokenization to ensure syntax highlighting is applied
        const model = editor.getModel();
        if (model) {
            monaco.editor.setModelLanguage(model, getLanguageForMonaco(language));
        }
    };

    const getLanguageForMonaco = (lang: string): string => {
        const languageMap: { [key: string]: string } = {
            'js': 'javascript',
            "jsx": 'javascript',
            'ts': 'typescript',
            'tsx': 'typescript',
            'py': 'python',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'C#': 'csharp',
            'PHP': 'php',
            'Ruby': 'ruby',
            'go': 'go',
            'Rust': 'rust',
            'Swift': 'swift',
            'Kotlin': 'kotlin',
            'html': 'html',
            'css': 'css',
            'SCSS': 'scss',
            'json': 'json',
            'xml': 'xml',
            'SQL': 'sql',
            'Shell': 'shell',
            'Bash': 'bash',
            'PowerShell': 'powershell',
            'Dockerfile': 'dockerfile',
            'yaml': 'yaml',
            'Markdown': 'markdown',
            'gitignore': 'gitignore',
        };
        return languageMap[lang] || 'plaintext';
    };

    return (
        <div className="relative w-full h-full bg-[#141414] border border-[#30363D] rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#161B22] border-b border-[#30363D]">
                <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                        <div className="w-3 h-3 bg-[#FF5F57] rounded-full"></div>
                        <div className="w-3 h-3 bg-[#FFBD2E] rounded-full"></div>
                        <div className="w-3 h-3 bg-[#28CA42] rounded-full"></div>
                    </div>
                    <span className="text-[#E6EDF3] text-sm font-medium ml-3">
                        {fileName}
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => {
                            if (editorRef.current) {
                                editorRef.current.getAction('editor.action.formatDocument').run();
                            }
                        }}
                        className="px-3 py-1 text-xs bg-[#21262D] hover:bg-[#30363D] text-[#E6EDF3] rounded border border-[#30363D] transition-colors"
                    >
                        Format
                    </button>
                    <button
                        onClick={() => {
                            if (editorRef.current) {
                                editorRef.current.trigger('keyboard', 'editor.action.toggleMinimap');
                            }
                        }}
                        className="px-3 py-1 text-xs bg-[#21262D] hover:bg-[#30363D] text-[#E6EDF3] rounded border border-[#30363D] transition-colors"
                    >
                        Minimap
                    </button>
                </div>
            </div>

            {/* Loading overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-[#0D1117] flex items-center justify-center z-10">
                    <div className="flex items-center space-x-2 text-[#E6EDF3]">
                        <div className="animate-spin w-5 h-5 border-2 border-[#30363D] border-t-[#58A6FF] rounded-full"></div>
                        <span className="text-sm">Loading editor...</span>
                    </div>
                </div>
            )}

            {/* Editor */}
            <div className="h-[calc(100%-48px)]">
                <Editor
                    height="100%"
                    language={getLanguageForMonaco(language)}
                    value={value || ""}
                    onChange={onChange}
                    onMount={handleEditorDidMount}
                    loading={null}
                    options={{
                        theme: 'customDark',
                        automaticLayout: true,
                    }}
                />
            </div>

            {/* Status bar */}
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-[#161B22] border-t border-[#30363D] flex items-center justify-between px-4 text-xs text-[#7D8590]">
                <div className="flex items-center space-x-4">
                    <span>Language: {language}</span>
                    <span>Encoding: UTF-8</span>
                </div>
                <div className="flex items-center space-x-4">
                    <span>Lines: {value?.split('\n').length || 0}</span>
                    <span>Characters: {value?.length || 0}</span>
                </div>
            </div>
        </div>
    );
}