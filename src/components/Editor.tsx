import {
    CompletionRegistration, registerCompletion
} from 'monacopilot';
import dynamic from 'next/dynamic';
import { useState, useRef, useCallback, useEffect } from 'react';

const Editor = dynamic(() => import('@monaco-editor/react'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-[400px] w-[800px] border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900">
            <div className="text-slate-600 dark:text-slate-400">Loading Monaco Editor...</div>
        </div>
    )
});

interface FileTab {
    id: string;
    name: string;
    language: string;
    content: string;
    isDirty: boolean;
    path?: string;
}

export function MonacoEditor({
    fileName,
    language,
    value,
    onChange,
    initialFiles = []
}: {
    fileName?: string;
    language: string;
    value?: string;
    onChange?: (value: string) => void;
    initialFiles?: Omit<FileTab, 'id' | 'isDirty'>[];
}) {
    const [isLoading, setIsLoading] = useState(true);
    const [useAiSuggestion, setUseAiSuggestion] = useState<boolean>(true);
    const [showPeekPanel, setShowPeekPanel] = useState(false);
    const [peekContent, setPeekContent] = useState('');
    const [breadcrumbs, setBreadcrumbs] = useState<string[]>([]);

    const [activeFileId, setActiveFileId] = useState('default');
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);
    const completionRef = useRef<CompletionRegistration | null>(null);

    // Multi-file support
    const [files, setFiles] = useState<FileTab[]>(() => {
        const defaultFile: FileTab = {
            id: 'default',
            name: fileName || '',
            language,
            content: value || '',
            isDirty: false,
            path: fileName
        };

        const additionalFiles = initialFiles.map((file, index) => ({
            ...file,
            id: `file-${index}`,
            isDirty: false
        }));

        return [defaultFile, ...additionalFiles];
    });


    const activeFile = files.find(f => f.id === activeFileId) || files[0];

    const handleEditorDidMount = (editor: any, monaco: any) => {
        try {
            editorRef.current = editor;
            monacoRef.current = monaco;
            setIsLoading(false);

            // Initialize AI completion
            updateAiCompletion(editor, monaco);

            // Configure compiler options
            configureCompilerOptions(monaco);

            // Configure editor options
            configureEditorOptions(editor);

            // Setup custom theme
            setupCustomTheme(monaco);

            // Setup breadcrumbs
            setupBreadcrumbs(editor, monaco);

            // Setup peek functionality
            setupPeekFunctionality(editor, monaco);

            // Force re-tokenization
            const model = editor.getModel();
            if (model) {
                monaco.editor.setModelLanguage(model, getLanguageForMonaco(activeFile.language));
            }
        } catch (error) {
            console.error("Error in handleMount:", error);
        }
    };

    const updateAiCompletion = (editor: any, monaco: any) => {
        // Clean up existing completion
        if (completionRef.current) {
            // completionRef.current.dispose();
            completionRef.current = null;
        }
        console.log("from ai completion");

        if (useAiSuggestion) {
            completionRef.current = registerCompletion(monaco, editor, {
                endpoint: '/api/code-completion',
                language: getLanguageForMonaco(activeFile.language),
                filename: activeFile.name,
                maxContextLines: 50,
                enableCaching: true,
                allowFollowUpCompletions: true,
            });
        }
    };

    const setupBreadcrumbs = (editor: any, monaco: any) => {
        editor.onDidChangeCursorPosition((e: any) => {
            const model = editor.getModel();
            if (!model) return;

            const position = e.position;
            const lineContent = model.getLineContent(position.lineNumber);

            // Simple breadcrumb extraction
            const crumbs = extractBreadcrumbs(lineContent, activeFile.language, position);
            setBreadcrumbs(crumbs);
        });
    };

    const setupPeekFunctionality = (editor: any, monaco: any) => {
        // Add peek definition command
        editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.F12, () => {
            const selection = editor.getSelection();
            const model = editor.getModel();
            if (selection && model) {
                const selectedText = model.getValueInRange(selection);
                if (selectedText) {
                    setPeekContent(`Definition of: ${selectedText}\n\n// Peek content would be loaded here`);
                    setShowPeekPanel(true);
                }
            }
        });
    };

    const extractBreadcrumbs = (lineContent: string, language: string, position: any): string[] => {
        const crumbs = [activeFile.name];

        // Enhanced breadcrumb extraction for multiple languages
        const patterns = getBreadcrumbPatterns(language);

        for (const pattern of patterns) {
            const match = lineContent.match(pattern.regex);
            if (match && match[1]) {
                crumbs.push(`${pattern.type}: ${match[1]}`);
                break; // Only add the first match to avoid duplicates
            }
        }

        crumbs.push(`Line ${position.lineNumber}`);
        return crumbs;
    };

    const getBreadcrumbPatterns = (language: string) => {
        const patterns: { type: string; regex: RegExp }[] = [];

        switch (language) {
            case 'javascript':
            case 'typescript':
                patterns.push(
                    { type: 'Class', regex: /class\s+(\w+)/ },
                    { type: 'Function', regex: /(?:function|const|let|var)\s+(\w+)\s*[=\(]/ },
                    { type: 'Method', regex: /(\w+)\s*\([^)]*\)\s*[{=>]/ },
                    { type: 'Interface', regex: /interface\s+(\w+)/ },
                    { type: 'Type', regex: /type\s+(\w+)/ },
                    { type: 'Enum', regex: /enum\s+(\w+)/ }
                );
                break;

            case 'python':
                patterns.push(
                    { type: 'Class', regex: /class\s+(\w+)/ },
                    { type: 'Function', regex: /def\s+(\w+)/ },
                    { type: 'Method', regex: /\s+def\s+(\w+)/ }
                );
                break;

            case 'java':
                patterns.push(
                    { type: 'Class', regex: /(?:public\s+|private\s+|protected\s+)?class\s+(\w+)/ },
                    { type: 'Interface', regex: /(?:public\s+)?interface\s+(\w+)/ },
                    { type: 'Method', regex: /(?:public\s+|private\s+|protected\s+)?(?:static\s+)?(?:\w+\s+)?(\w+)\s*\([^)]*\)\s*[{]/ },
                    { type: 'Enum', regex: /enum\s+(\w+)/ }
                );
                break;

            case 'cpp':
            case 'c':
                patterns.push(
                    { type: 'Class', regex: /class\s+(\w+)/ },
                    { type: 'Struct', regex: /struct\s+(\w+)/ },
                    { type: 'Function', regex: /(?:\w+\s+)*(\w+)\s*\([^)]*\)\s*[{]/ },
                    { type: 'Namespace', regex: /namespace\s+(\w+)/ }
                );
                break;

            case 'csharp':
                patterns.push(
                    { type: 'Class', regex: /(?:public\s+|private\s+|protected\s+)?class\s+(\w+)/ },
                    { type: 'Interface', regex: /(?:public\s+)?interface\s+(\w+)/ },
                    { type: 'Method', regex: /(?:public\s+|private\s+|protected\s+)?(?:static\s+)?(?:virtual\s+)?(?:override\s+)?(?:\w+\s+)?(\w+)\s*\([^)]*\)\s*[{]/ },
                    { type: 'Namespace', regex: /namespace\s+([\w.]+)/ },
                    { type: 'Enum', regex: /enum\s+(\w+)/ }
                );
                break;

            case 'php':
                patterns.push(
                    { type: 'Class', regex: /class\s+(\w+)/ },
                    { type: 'Function', regex: /function\s+(\w+)/ },
                    { type: 'Method', regex: /(?:public\s+|private\s+|protected\s+)?function\s+(\w+)/ },
                    { type: 'Interface', regex: /interface\s+(\w+)/ },
                    { type: 'Trait', regex: /trait\s+(\w+)/ }
                );
                break;

            case 'ruby':
                patterns.push(
                    { type: 'Class', regex: /class\s+(\w+)/ },
                    { type: 'Module', regex: /module\s+(\w+)/ },
                    { type: 'Method', regex: /def\s+(\w+)/ }
                );
                break;

            case 'go':
                patterns.push(
                    { type: 'Function', regex: /func\s+(\w+)/ },
                    { type: 'Method', regex: /func\s+\([^)]+\)\s+(\w+)/ },
                    { type: 'Type', regex: /type\s+(\w+)\s+struct/ },
                    { type: 'Interface', regex: /type\s+(\w+)\s+interface/ }
                );
                break;

            case 'rust':
                patterns.push(
                    { type: 'Function', regex: /fn\s+(\w+)/ },
                    { type: 'Struct', regex: /struct\s+(\w+)/ },
                    { type: 'Enum', regex: /enum\s+(\w+)/ },
                    { type: 'Trait', regex: /trait\s+(\w+)/ },
                    { type: 'Impl', regex: /impl\s+(?:\w+\s+for\s+)?(\w+)/ }
                );
                break;

            case 'swift':
                patterns.push(
                    { type: 'Class', regex: /class\s+(\w+)/ },
                    { type: 'Struct', regex: /struct\s+(\w+)/ },
                    { type: 'Function', regex: /func\s+(\w+)/ },
                    { type: 'Enum', regex: /enum\s+(\w+)/ },
                    { type: 'Protocol', regex: /protocol\s+(\w+)/ }
                );
                break;

            case 'kotlin':
                patterns.push(
                    { type: 'Class', regex: /class\s+(\w+)/ },
                    { type: 'Function', regex: /fun\s+(\w+)/ },
                    { type: 'Interface', regex: /interface\s+(\w+)/ },
                    { type: 'Object', regex: /object\s+(\w+)/ }
                );
                break;

            case 'html':
                patterns.push(
                    { type: 'Element', regex: /<(\w+)/ },
                    { type: 'ID', regex: /id=["'](\w+)["']/ },
                    { type: 'Class', regex: /class=["']([^"']+)["']/ }
                );
                break;

            case 'css':
            case 'scss':
                patterns.push(
                    { type: 'Selector', regex: /^\.(\w+)/ },
                    { type: 'ID', regex: /^#(\w+)/ },
                    { type: 'Element', regex: /^(\w+)\s*[{]/ },
                    { type: 'Mixin', regex: /@mixin\s+(\w+)/ }
                );
                break;

            case 'json':
                patterns.push(
                    { type: 'Property', regex: /"(\w+)"\s*:/ }
                );
                break;

            case 'yaml':
                patterns.push(
                    { type: 'Key', regex: /^(\w+):/ }
                );
                break;

            case 'sql':
                patterns.push(
                    { type: 'Table', regex: /(?:CREATE\s+TABLE|FROM|UPDATE|INSERT\s+INTO)\s+(\w+)/i },
                    { type: 'Function', regex: /(?:CREATE\s+FUNCTION|CREATE\s+PROCEDURE)\s+(\w+)/i },
                    { type: 'View', regex: /CREATE\s+VIEW\s+(\w+)/i }
                );
                break;

            case 'dockerfile':
                patterns.push(
                    { type: 'Command', regex: /^(FROM|RUN|COPY|ADD|WORKDIR|EXPOSE|CMD|ENTRYPOINT)\s/ }
                );
                break;

            case 'bash':
            case 'shell':
                patterns.push(
                    { type: 'Function', regex: /(\w+)\s*\(\s*\)/ },
                    { type: 'Variable', regex: /(\w+)=/ }
                );
                break;

            default:
                // Generic patterns for unknown languages
                patterns.push(
                    { type: 'Function', regex: /(?:function|def|func)\s+(\w+)/ },
                    { type: 'Class', regex: /class\s+(\w+)/ },
                    { type: 'Method', regex: /(\w+)\s*\([^)]*\)\s*[{=>]/ }
                );
                break;
        }

        return patterns;
    };

    const configureCompilerOptions = (monaco: any) => {
        const compilerOptions = {
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
        };

        monaco.languages.typescript.javascriptDefaults.setCompilerOptions(compilerOptions);
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions(compilerOptions);
    };

    const configureEditorOptions = (editor: any) => {
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
            breadcrumbs: {
                enabled: true,
            },
            minimap: {
                enabled: true,
            },
        });
    };

    const setupCustomTheme = (monaco: any) => {
        monaco.editor.defineTheme('customDark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
                { token: 'comment.line', foreground: '6A9955', fontStyle: 'italic' },
                { token: 'comment.block', foreground: '6A9955', fontStyle: 'italic' },
                { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
                { token: 'keyword.control', foreground: 'C586C0', fontStyle: 'bold' },
                { token: 'keyword.operator', foreground: 'D4D4D4' },
                { token: 'keyword.other', foreground: '569CD6' },
                { token: 'string', foreground: 'CE9178' },
                { token: 'string.quoted', foreground: 'CE9178' },
                { token: 'string.template', foreground: 'CE9178' },
                { token: 'number', foreground: 'B5CEA8' },
                { token: 'constant.numeric', foreground: 'B5CEA8' },
                { token: 'regexp', foreground: 'D16969' },
                { token: 'type', foreground: '4EC9B0' },
                { token: 'type.identifier', foreground: '4EC9B0' },
                { token: 'entity.name.type', foreground: '4EC9B0' },
                { token: 'entity.name.class', foreground: '4EC9B0' },
                { token: 'support.class', foreground: '4EC9B0' },
                { token: 'entity.name.function', foreground: 'DCDCAA' },
                { token: 'support.function', foreground: 'DCDCAA' },
                { token: 'meta.function-call', foreground: 'DCDCAA' },
                { token: 'variable', foreground: '9CDCFE' },
                { token: 'variable.other', foreground: '9CDCFE' },
                { token: 'variable.parameter', foreground: '9CDCFE' },
                { token: 'entity.name.variable', foreground: '9CDCFE' },
                { token: 'constant', foreground: '4FC1FF' },
                { token: 'constant.language', foreground: '569CD6' },
                { token: 'constant.character', foreground: '4FC1FF' },
                { token: 'variable.language', foreground: '569CD6' },
                { token: 'support.type.primitive', foreground: '569CD6' },
                { token: 'storage.type', foreground: '569CD6' },
                { token: 'storage.modifier', foreground: '569CD6' },
                { token: 'punctuation', foreground: 'D4D4D4' },
                { token: 'delimiter', foreground: 'D4D4D4' },
                { token: 'operator', foreground: 'D4D4D4' },
                { token: 'tag', foreground: '569CD6' },
                { token: 'tag.id', foreground: '569CD6' },
                { token: 'tag.class', foreground: '569CD6' },
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
                'breadcrumb.background': '#161B22',
                'breadcrumb.foreground': '#7D8590',
                'breadcrumb.focusForeground': '#E6EDF3',
                'breadcrumb.activeSelectionForeground': '#58A6FF',
            }
        });

        monaco.editor.setTheme('customDark');
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

    const handleFileChange = (fileId: string) => {
        setActiveFileId(fileId);
    };

    const handleFileClose = (fileId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (files.length > 1) {
            const newFiles = files.filter(f => f.id !== fileId);
            setFiles(newFiles);
            if (activeFileId === fileId) {
                setActiveFileId(newFiles[0].id);
            }
        }
    };

    const handleContentChange = useCallback((newValue: string | undefined) => {
        const updatedFiles = files.map(f =>
            f.id === activeFileId
                ? { ...f, content: newValue || '', isDirty: true }
                : f
        );
        setFiles(updatedFiles);

        if (onChange && activeFileId === 'default') {
            onChange(newValue || "");
        }
    }, [files, activeFileId, onChange]);



    const addNewFile = () => {
        // checks if file is already opened or not 
        const existingFile = files.find(f => f.path === fileName || f.name === fileName);
        if (existingFile) {
            // If file exists, just switch to it
            setActiveFileId(existingFile.id);
            return;
        }

        // If file doesn't exist, create a new tab
        const newFile: FileTab = {
            id: `file-${Date.now()}`,
            name: fileName || "",
            language: language,
            content: value || "",
            isDirty: false,
            path: fileName
        };
        setFiles([...files, newFile]);
        setActiveFileId(newFile.id);
    };

    // When fileName changes, open or switch to the file
    useEffect(() => {
        if (fileName) {
            addNewFile();
        }
    }, [fileName]);

    const toggleAiSuggestion = () => {
        setUseAiSuggestion(!useAiSuggestion);
        if (editorRef.current && monacoRef.current) {
            updateAiCompletion(editorRef.current, monacoRef.current);
        }
    };

    return (
        <div className="relative w-full h-screen bg-[#141414] border border-[#30363D] rounded-lg overflow-hidden">
            {/* Header with tabs */}
            <div className="bg-[#161B22] border-b border-[#30363D]">
                {/* File tabs */}
                <div className="flex items-center overflow-x-auto">
                    {files.map((file) => (
                        <div
                            key={file.id}
                            className={`flex items-center px-4 py-2 border-r border-[#30363D] cursor-pointer min-w-0 group ${activeFileId === file.id
                                ? 'bg-[#0D1117] text-[#E6EDF3]'
                                : 'bg-[#161B22] text-[#7D8590] hover:text-[#E6EDF3]'
                                }`}
                            onClick={() => handleFileChange(file.id)}
                        >
                            <span className="text-sm font-medium truncate max-w-32">
                                {file.path}
                                {/* {file.isDirty && <span className="ml-1 text-[#F85149]">•</span>} */}
                            </span>
                            {files.length > 1 && (
                                <button
                                    onClick={(e) => handleFileClose(file.id, e)}
                                    className="ml-2 opacity-0 group-hover:opacity-100 hover:bg-[#30363D] rounded p-1 transition-all"
                                >
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={addNewFile}
                        className="px-3 py-2 text-[#7D8590] hover:text-[#E6EDF3] hover:bg-[#21262D] transition-colors"
                        title="Add new file"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>

                {/* Breadcrumbs */}
                {breadcrumbs.length > 0 && (
                    <div className="px-4 py-1 bg-[#0D1117] border-b border-[#30363D] text-xs text-[#7D8590]">
                        {breadcrumbs.map((crumb, index) => (
                            <span key={index}>
                                {index > 0 && <span className="mx-1">/</span>}
                                <span className={index === breadcrumbs.length - 1 ? 'text-[#E6EDF3]' : ''}>
                                    {crumb}
                                </span>
                            </span>
                        ))}
                    </div>
                )}

                {/* Toolbar */}
                <div className="flex items-center justify-between px-4 py-2">
                    <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                            <div className="w-3 h-3 bg-[#FF5F57] rounded-full"></div>
                            <div className="w-3 h-3 bg-[#FFBD2E] rounded-full"></div>
                            <div className="w-3 h-3 bg-[#28CA42] rounded-full"></div>
                        </div>
                        <span className="text-[#E6EDF3] text-sm font-medium ml-3">
                            {activeFile.name}
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
                        <button
                            onClick={() => setShowPeekPanel(!showPeekPanel)}
                            className="px-3 py-1 text-xs bg-[#21262D] hover:bg-[#30363D] text-[#E6EDF3] rounded border border-[#30363D] transition-colors"
                        >
                            Peek
                        </button>
                    </div>
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

            {/* Main editor area */}
            <div className="flex h-[calc(100%-120px)]">
                {/* Editor */}
                <div className={`${showPeekPanel ? 'w-2/3' : 'w-full'} transition-all duration-300`}>
                    <Editor
                        height="100%"
                        language={getLanguageForMonaco(activeFile.language)}
                        value={activeFile.content}
                        onChange={(value, ev) => {
                            onChange?.(value ?? "");
                            handleContentChange(value);
                        }}
                        onMount={
                            handleEditorDidMount
                        }
                        loading={null}
                        options={{
                            theme: 'customDark',
                            automaticLayout: true,
                        }}
                    />
                </div>

                {/* Peek panel */}
                {showPeekPanel && (
                    <div className="w-1/3 bg-[#161B22] border-l border-[#30363D] flex flex-col">
                        <div className="px-4 py-2 bg-[#0D1117] border-b border-[#30363D] flex items-center justify-between">
                            <span className="text-[#E6EDF3] text-sm font-medium">Peek Definition</span>
                            <button
                                onClick={() => setShowPeekPanel(false)}
                                className="text-[#7D8590] hover:text-[#E6EDF3] transition-colors"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 p-4 text-[#E6EDF3] text-sm overflow-auto">
                            <pre className="whitespace-pre-wrap font-mono">
                                {peekContent || 'Select text and press Alt+F12 to peek definition'}
                            </pre>
                        </div>
                    </div>
                )}
            </div>

            {/* Enhanced status bar */}
            <div className="h-6 bg-[#161B22] border-t border-[#30363D] flex items-center justify-between px-4 text-xs text-[#7D8590]">
                <div className="flex items-center space-x-4">
                    <span>Language: {(activeFile.language)}</span>
                    <span>Encoding: UTF-8</span>
                    <span>File: {activeFile.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                    {/* AI Suggestion Toggle */}
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={useAiSuggestion}
                            onChange={toggleAiSuggestion}
                            className="w-3 h-3 text-[#58A6FF] bg-[#21262D] border-[#30363D] rounded focus:ring-[#58A6FF] focus:ring-1"
                        />
                        <span className="text-xs">AI Suggestions</span>
                    </label>
                    <span>Lines: {activeFile.content.split('\n').length}</span>
                    <span>Characters: {activeFile.content.length}</span>
                    <span>Files: {files.length}</span>
                </div>
            </div>
        </div>
    );
}