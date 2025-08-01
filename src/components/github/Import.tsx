"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Github, Search, Filter, Check, Download, Star, GitBranch, Calendar, User, RefreshCw, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

type GitHubRepo = {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    language: string | null;
    stargazers_count: number;
    forks_count: number;
    updated_at: string;
    private: boolean;
    html_url: string;
    clone_url: string;
    default_branch: string;
};

export default function GitHubImportPage() {
    const [repositories, setRepositories] = useState<GitHubRepo[]>([]);
    const [filteredRepos, setFilteredRepos] = useState<GitHubRepo[]>([]);
    const [selectedRepos, setSelectedRepos] = useState<Set<number>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [languageFilter, setLanguageFilter] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isImporting, setIsImporting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [importStatus, setImportStatus] = useState<Record<number, 'pending' | 'success' | 'error'>>({});

    const router = useRouter();

    // Fetch user repositories
    useEffect(() => {
        const fetchRepositories = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/github/repositories');

                if (!response.ok) {
                    throw new Error('Failed to fetch repositories');
                }

                const data = await response.json();
                setRepositories(data);
                setFilteredRepos(data);
            } catch (error) {
                console.error('Error fetching repositories:', error);
                setError('Failed to load repositories. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchRepositories();
    }, []);

    // Filter repositories
    useEffect(() => {
        let filtered = repositories.filter(repo => {
            const matchesSearch = repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                repo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                repo.full_name.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesLanguage = !languageFilter || repo.language === languageFilter;

            return matchesSearch && matchesLanguage;
        });

        setFilteredRepos(filtered);
    }, [repositories, searchQuery, languageFilter]);

    const languages = React.useMemo(() => {
        return [...new Set(repositories.map(repo => repo.language).filter(Boolean))];
    }, [repositories]);

    const handleSelectRepo = (repoId: number) => {
        const newSelected = new Set(selectedRepos);
        if (newSelected.has(repoId)) {
            newSelected.delete(repoId);
        } else {
            newSelected.add(repoId);
        }
        setSelectedRepos(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedRepos.size === filteredRepos.length) {
            setSelectedRepos(new Set());
        } else {
            setSelectedRepos(new Set(filteredRepos.map(repo => repo.id)));
        }
    };

    const handleImportSelected = async () => {
        if (selectedRepos.size === 0) return;

        setIsImporting(true);
        const newImportStatus: Record<number, 'pending' | 'success' | 'error'> = {};

        // Initialize all as pending
        selectedRepos.forEach(repoId => {
            newImportStatus[repoId] = 'pending';
        });
        setImportStatus(newImportStatus);

        // Import repositories one by one
        for (const repoId of selectedRepos) {
            try {
                const repo = repositories.find(r => r.id === repoId);
                if (!repo) continue;

                const response = await fetch('/api/github/import', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        repositoryId: repo.id,
                        name: repo.name,
                        fullName: repo.full_name,
                        description: repo.description,
                        language: repo.language,
                        cloneUrl: repo.clone_url,
                        htmlUrl: repo.html_url,
                        defaultBranch: repo.default_branch,
                        isPrivate: repo.private
                    }),
                });

                if (response.ok) {
                    newImportStatus[repoId] = 'success';
                } else {
                    newImportStatus[repoId] = 'error';
                }
            } catch (error) {
                newImportStatus[repoId] = 'error';
            }

            setImportStatus({ ...newImportStatus });
        }

        setIsImporting(false);

        // Redirect after successful import
        setTimeout(() => {
            router.push('/projects');
        }, 2000);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-950 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-800 rounded w-64 mb-8"></div>
                        <div className="h-16 bg-gray-800 rounded mb-6"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-48 bg-gray-800 rounded-lg"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-400" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                                Import from GitHub
                            </h1>
                            <p className="text-gray-400 mt-1">Select repositories to import into your workspace</p>
                        </div>
                    </div>

                    {selectedRepos.size > 0 && (
                        <button
                            onClick={handleImportSelected}
                            disabled={isImporting}
                            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isImporting ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4" />
                            )}
                            Import {selectedRepos.size} Selected
                        </button>
                    )}
                </div>

                {error && (
                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <p className="text-red-300">{error}</p>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800/50 p-6 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4 mb-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search repositories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-100 placeholder-gray-500"
                            />
                        </div>

                        {/* Language Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                            <select
                                value={languageFilter}
                                onChange={(e) => setLanguageFilter(e.target.value)}
                                className="pl-10 pr-8 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:ring-2 focus:ring-blue-500/50 text-gray-100"
                            >
                                <option value="">All Languages</option>
                                {languages.map(lang => (
                                    <option key={lang} value={lang ?? ""}>{lang}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Select All */}
                    {filteredRepos.length > 0 && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleSelectAll}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors text-sm text-gray-300"
                            >
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${selectedRepos.size === filteredRepos.length
                                        ? 'bg-blue-600 border-blue-600'
                                        : 'border-gray-500'
                                    }`}>
                                    {selectedRepos.size === filteredRepos.length && (
                                        <Check className="w-3 h-3 text-white" />
                                    )}
                                </div>
                                {selectedRepos.size === filteredRepos.length ? 'Deselect All' : 'Select All'}
                            </button>
                            <span className="text-sm text-gray-400">
                                {selectedRepos.size} of {filteredRepos.length} repositories selected
                            </span>
                        </div>
                    )}
                </div>

                {/* Repository Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRepos.map((repo) => {
                        const isSelected = selectedRepos.has(repo.id);
                        const status = importStatus[repo.id];

                        return (
                            <div
                                key={repo.id}
                                className={`relative bg-gray-900/50 backdrop-blur-sm border rounded-xl p-6 transition-all duration-200 cursor-pointer hover:bg-gray-800/50 ${isSelected
                                        ? 'border-blue-500/50 bg-blue-900/10'
                                        : 'border-gray-700/50'
                                    } ${status === 'success' ? 'border-green-500/50 bg-green-900/10' :
                                        status === 'error' ? 'border-red-500/50 bg-red-900/10' : ''
                                    }`}
                                onClick={() => !isImporting && handleSelectRepo(repo.id)}
                            >
                                {/* Selection Checkbox */}
                                <div className="absolute top-4 right-4">
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected
                                            ? 'bg-blue-600 border-blue-600'
                                            : 'border-gray-500'
                                        }`}>
                                        {isSelected && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                </div>

                                {/* Status Indicator */}
                                {status && (
                                    <div className="absolute top-4 left-4">
                                        {status === 'pending' && (
                                            <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                                        )}
                                        {status === 'success' && (
                                            <Check className="w-4 h-4 text-green-400" />
                                        )}
                                        {status === 'error' && (
                                            <AlertCircle className="w-4 h-4 text-red-400" />
                                        )}
                                    </div>
                                )}

                                {/* Repository Info */}
                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Github className="w-4 h-4 text-gray-400" />
                                        <h3 className="font-semibold text-white truncate">{repo.name}</h3>
                                        {repo.private && (
                                            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded border border-yellow-500/30">
                                                Private
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                                        {repo.description || 'No description available'}
                                    </p>
                                </div>

                                {/* Repository Stats */}
                                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                    <div className="flex items-center gap-4">
                                        {repo.language && (
                                            <div className="flex items-center gap-1">
                                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                                <span>{repo.language}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3 h-3" />
                                            <span>{repo.stargazers_count}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <GitBranch className="w-3 h-3" />
                                            <span>{repo.forks_count}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Last Updated */}
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Calendar className="w-3 h-3" />
                                    <span>Updated {formatDate(repo.updated_at)}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredRepos.length === 0 && !isLoading && (
                    <div className="text-center py-16">
                        <Github className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-300 mb-2">No repositories found</h3>
                        <p className="text-gray-500">
                            {searchQuery || languageFilter
                                ? "Try adjusting your search filters"
                                : "No repositories available to import"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}