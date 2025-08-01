import React, { useState } from 'react';
import { X, GitBranch, Github, Link, AlertCircle, CheckCircle, RefreshCw, Code, FolderOpen } from 'lucide-react';

interface CloneRepositoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onClone: (repoUrl: string, projectName: string) => Promise<void>;
}

export const CloneRepositoryModal: React.FC<CloneRepositoryModalProps> = ({
    isOpen,
    onClose,
    onClone
}) => {
    const [repoUrl, setRepoUrl] = useState('');
    const [projectName, setProjectName] = useState('');
    const [isCloning, setIsCloning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [urlValidation, setUrlValidation] = useState<{
        isValid: boolean;
        message: string;
    } | null>(null);

    // Validate GitHub URL
    const validateGitHubUrl = (url: string) => {
        if (!url) {
            setUrlValidation(null);
            return;
        }

        const githubRegex = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/;
        const isValid = githubRegex.test(url.trim());

        if (isValid) {
            setUrlValidation({
                isValid: true,
                message: 'Valid GitHub repository URL'
            });

            // Auto-generate project name from URL
            if (!projectName) {
                const match = url.match(/github\.com\/[\w.-]+\/([\w.-]+)/);
                if (match) {
                    setProjectName(match[1].replace(/\.git$/, ''));
                }
            }
        } else {
            setUrlValidation({
                isValid: false,
                message: 'Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)'
            });
        }
    };

    const handleUrlChange = (value: string) => {
        setRepoUrl(value);
        setError(null);
        validateGitHubUrl(value);
    };

    const handleClone = async () => {
        if (!repoUrl.trim() || !projectName.trim()) {
            setError('Please fill in all required fields');
            return;
        }

        if (!urlValidation?.isValid) {
            setError('Please enter a valid GitHub repository URL');
            return;
        }

        try {
            setIsCloning(true);
            setError(null);

            await onClone(repoUrl.trim(), projectName.trim());

            setSuccess(true);

            // Reset form and close modal after success
            setTimeout(() => {
                setRepoUrl('');
                setProjectName('');
                setSuccess(false);
                setUrlValidation(null);
                onClose();
            }, 2000);

        } catch (error) {
            console.error('Clone error:', error);
            setError(error instanceof Error ? error.message : 'Failed to clone repository');
        } finally {
            setIsCloning(false);
        }
    };

    const handleClose = () => {
        if (!isCloning) {
            setRepoUrl('');
            setProjectName('');
            setError(null);
            setSuccess(false);
            setUrlValidation(null);
            onClose();
        }
    };

    const popularRepos = [
        { name: 'facebook/react', url: 'https://github.com/facebook/react' },
        { name: 'microsoft/vscode', url: 'https://github.com/microsoft/vscode' },
        { name: 'nodejs/node', url: 'https://github.com/nodejs/node' },
        { name: 'vercel/next.js', url: 'https://github.com/vercel/next.js' },
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl mx-4 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-900/10 via-red-900/5 to-pink-900/10" />

                {/* Header */}
                <div className="relative border-b border-gray-700/50 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                                <GitBranch className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Clone Repository</h2>
                                <p className="text-gray-400 text-sm">Clone any public GitHub repository</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={isCloning}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-200 disabled:opacity-50"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="relative p-6">
                    {success ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Repository Cloned Successfully!</h3>
                            <p className="text-gray-400">Your project has been created and is ready to use.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Repository URL Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Repository URL <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={repoUrl}
                                        onChange={(e) => handleUrlChange(e.target.value)}
                                        placeholder="https://github.com/owner/repository"
                                        className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 border rounded-lg focus:ring-2 focus:ring-orange-500/50 text-gray-100 placeholder-gray-500 transition-all duration-200 ${urlValidation?.isValid === false
                                                ? 'border-red-500/50 focus:border-red-500/50'
                                                : urlValidation?.isValid === true
                                                    ? 'border-green-500/50 focus:border-green-500/50'
                                                    : 'border-gray-700/50 focus:border-orange-500/50'
                                            }`}
                                        disabled={isCloning}
                                    />
                                    {urlValidation && (
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                            {urlValidation.isValid ? (
                                                <CheckCircle className="w-5 h-5 text-green-400" />
                                            ) : (
                                                <AlertCircle className="w-5 h-5 text-red-400" />
                                            )}
                                        </div>
                                    )}
                                </div>
                                {urlValidation && (
                                    <p className={`text-sm mt-2 ${urlValidation.isValid ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                        {urlValidation.message}
                                    </p>
                                )}
                            </div>

                            {/* Project Name Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Project Name <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <FolderOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={projectName}
                                        onChange={(e) => setProjectName(e.target.value)}
                                        placeholder="my-awesome-project"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 text-gray-100 placeholder-gray-500 transition-all duration-200"
                                        disabled={isCloning}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    This will be the name of your project in the workspace
                                </p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                    <p className="text-red-300 text-sm">{error}</p>
                                </div>
                            )}

                            {/* Popular Repositories */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-300 mb-3">Popular Repositories</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {popularRepos.map((repo) => (
                                        <button
                                            key={repo.name}
                                            onClick={() => handleUrlChange(repo.url)}
                                            disabled={isCloning}
                                            className="flex items-center gap-2 p-3 bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700/30 rounded-lg transition-all duration-200 text-left disabled:opacity-50"
                                        >
                                            <Code className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                            <span className="text-sm text-gray-300 truncate">{repo.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleClose}
                                    disabled={isCloning}
                                    className="flex-1 px-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 text-gray-300 rounded-lg transition-all duration-200 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleClone}
                                    disabled={isCloning || !urlValidation?.isValid || !projectName.trim()}
                                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isCloning ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Cloning...
                                        </>
                                    ) : (
                                        <>
                                            <GitBranch className="w-4 h-4" />
                                            Clone Repository
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!success && (
                    <div className="relative border-t border-gray-700/50 px-6 py-4 bg-gray-800/20">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-orange-400 rounded-full" />
                                <span>Only public repositories can be cloned</span>
                            </div>
                            <span>Make sure you have the necessary permissions</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};