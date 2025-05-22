import Editor from '@monaco-editor/react';

const languagesSupported=[
    'Java',
    'Python',
    'JavaScript',
    'C++',
    'C#',
    'Go',
    'Rust',
    'PHP',
    'Ruby',
    'Swift',
    'Kotlin',
    'TypeScript'
]

export function MonacoEditor({language}:{
    language: 'Java' | 'Python' | 'JavaScript' | 'C++' | 'C#' | 'Go' | 'Rust' | 'PHP' | 'Ruby' | 'Swift' | 'Kotlin' | 'TypeScript'
}) {
    return <>
        <Editor height="100vh" defaultLanguage={language ? language : 'Text'} defaultValue="// some comment" />;
    </>
}