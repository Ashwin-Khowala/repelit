import Editor from '@monaco-editor/react';

export function MonacoEditor({language}:{
    language: string;
}) {
    return <>
        <Editor height="100vh" defaultLanguage={language ? language : 'Text'} defaultValue="// some comment" />;
    </>
}