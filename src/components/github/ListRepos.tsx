"use client";

import { useEffect, useState } from "react";
import {
    Search,
    Filter,
    Grid,
    List,
    Github,
    Lock,
    Unlock,
    Star,
    GitFork,
    Calendar,
    Code,
    Download,
    AlertCircle,
    RefreshCw,
    Eye,
    GitBranch,
    ExternalLink
} from "lucide-react";
import { useSession } from "next-auth/react";

type GitHubRepo = {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    private: boolean;
    html_url: string;
    clone_url: string;
    ssh_url: string;
    language: string | null;
    stargazers_count: number;
    forks_count: number;
    watchers_count: number;
    size: number;
    default_branch: string;
    created_at: string;
    updated_at: string;
    pushed_at: string;
    archived: boolean;
    disabled: boolean;
    fork: boolean;
    topics: string[];
};

interface GitHubReposProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (repo: GitHubRepo) => void;
}

export function GitHubReposComponent({ isOpen, onClose, onImport }: GitHubReposProps) {
    const [repos, setRepos] = useState<GitHubRepo[]>([]);
    const [filteredRepos, setFilteredRepos] = useState<GitHubRepo[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLanguage, setSelectedLanguage] = useState("");
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<'name' | 'updated' | 'created' | 'stars'>('updated');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [filterType, setFilterType] = useState<'all' | 'public' | 'private' | 'forks' | 'archived'>('all');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [importingIds, setImportingIds] = useState<Set<number>>(new Set());
    const session = useSession();

    // Fetch repositories from GitHub API
    const fetchRepos = async () => {
        //@ts-ignore
        if (!session.data?.user.accessToken) {
            setError("GitHub access token not found");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/github/repos', {
                headers: {
                    //@ts-ignore
                    'accessToken': session.data.user.accessToken,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch repositories: ${response.status}`);
            }

            const data = await response.json();
            setRepos(data.repositories || []);
            setFilteredRepos(data.repositories || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch repositories');
            console.error('Error fetching repos:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchRepos();
        }
        //@ts-ignore
    }, [isOpen, session?.data?.user.accessToken]);

    // Filter and sort repositories
    useEffect(() => {
        let filtered = repos.filter(repo => {
            const matchesSearch =
                repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                repo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                repo.language?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesLanguage = selectedLanguage === "" || repo.language === selectedLanguage;

            const matchesType =
                filterType === 'all' ||
                (filterType === 'public' && !repo.private) ||
                (filterType === 'private' && repo.private) ||
                (filterType === 'forks' && repo.fork) ||
                (filterType === 'archived' && repo.archived);

            return matchesSearch && matchesLanguage && matchesType;
        });

        // Sort repositories
        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'updated':
                    aValue = new Date(a.updated_at).getTime();
                    bValue = new Date(b.updated_at).getTime();
                    break;
                case 'created':
                    aValue = new Date(a.created_at).getTime();
                    bValue = new Date(b.created_at).getTime();
                    break;
                case 'stars':
                    aValue = a.stargazers_count;
                    bValue = b.stargazers_count;
                    break;
                default:
                    return 0;
            }

            if (sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });

        setFilteredRepos(filtered);
    }, [repos, searchQuery, selectedLanguage, sortBy, sortOrder, filterType]);

    // Get unique languages
    const languages = [...new Set(repos.map(r => r.language).filter(Boolean))];

    const handleImport = async (repo: GitHubRepo) => {
        setImportingIds(prev => new Set(prev).add(repo.id));
        try {
            await onImport(repo);
        } catch (error) {
            console.error('Import failed:', error);
        } finally {
            setImportingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(repo.id);
                return newSet;
            });
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatSize = (bytes: number) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col">

                {/* Header */}
                <div className="p-6 border-b border-gray-700/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                                <Github className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-100">Import from GitHub</h2>
                                <p className="text-gray-400 text-sm">Select repositories to import into your workspace</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={fetchRepos}
                                disabled={isLoading}
                                className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-800/50 rounded-lg transition-all duration-200"
                            >
                                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-800/50 rounded-lg transition-all duration-200"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="space-y-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search repositories..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-100 placeholder-gray-500 text-sm"
                                />
                            </div>

                            {/* Language Filter */}
                            <select
                                value={selectedLanguage}
                                onChange={(e) => setSelectedLanguage(e.target.value)}
                                className="px-3 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:ring-2 focus:ring-blue-500/50 text-gray-100 text-sm"
                            >
                                <option value="">All Languages</option>
                                {languages.map(lang => (
                                    <option key={lang} value={lang ?? ""}>{lang}</option>
                                ))}
                            </select>

                            {/* Type Filter */}
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value as any)}
                                className="px-3 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:ring-2 focus:ring-blue-500/50 text-gray-100 text-sm"
                            >
                                <option value="all">All Types</option>
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                                <option value="forks">Forks</option>
                                <option value="archived">Archived</option>
                            </select>

                            {/* View Mode */}
                            <div className="flex rounded-lg border border-gray-700/50 overflow-hidden bg-gray-800/30">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2.5 transition-all duration-200 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-300'}`}
                                >
                                    <Grid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2.5 transition-all duration-200 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-300'}`}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Sort Options */}
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-sm text-gray-400 font-mono">sort_by:</span>
                            {[
                                { key: 'updated', label: 'updated' },
                                { key: 'name', label: 'name' },
                                { key: 'created', label: 'created' },
                                { key: 'stars', label: 'stars' }
                            ].map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => {
                                        if (sortBy === key) {
                                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                        } else {
                                            setSortBy(key as any);
                                            setSortOrder('desc');
                                        }
                                    }}
                                    className={`px-3 py-1 rounded-md text-sm transition-all duration-200 font-mono ${sortBy === key
                                        ? 'bg-blue-600/20 text-blue-300 border border-blue-600/30'
                                        : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 border border-transparent'
                                        }`}
                                >
                                    {label} {sortBy === key && (sortOrder === 'asc' ? '↑' : '↓')}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                                <p className="text-gray-400">Loading repositories...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
                                <p className="text-red-400 mb-2">Error loading repositories</p>
                                <p className="text-gray-500 text-sm">{error}</p>
                                <button
                                    onClick={fetchRepos}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    ) : filteredRepos.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <Github className="w-8 h-8 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400">No repositories found</p>
                                <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full overflow-auto p-6">
                            <div className={
                                viewMode === 'grid'
                                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                                    : "space-y-3"
                            }>
                                {filteredRepos.map((repo) => (
                                    <div
                                        key={repo.id}
                                        className={`bg-gray-800/30 border border-gray-700/50 rounded-lg p-4 hover:border-gray-600/50 transition-all duration-200 ${viewMode === 'list' ? 'flex items-center justify-between' : ''
                                            }`}
                                    >
                                        <div className={viewMode === 'list' ? 'flex-1' : ''}>
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold text-gray-100 truncate">{repo.name}</h3>
                                                        <div className="flex items-center gap-1">
                                                            {repo.private ? (
                                                                <Lock className="w-3 h-3 text-yellow-500" />
                                                            ) : (
                                                                <Unlock className="w-3 h-3 text-green-500" />
                                                            )}
                                                            {repo.fork && <GitFork className="w-3 h-3 text-gray-500" />}
                                                            {repo.archived && <div className="px-1.5 py-0.5 bg-orange-600/20 text-orange-400 text-xs rounded">Archived</div>}
                                                        </div>
                                                    </div>
                                                    {repo.description && (
                                                        <p className="text-gray-400 text-sm line-clamp-2 mb-2">{repo.description}</p>
                                                    )}
                                                </div>
                                                <a
                                                    href={repo.html_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1 text-gray-500 hover:text-gray-300 transition-colors ml-2"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>

                                            {/* Stats */}
                                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                                {repo.language && (
                                                    <div className="flex items-center gap-1">
                                                        <Code className="w-3 h-3" />
                                                        <span>{repo.language}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-3 h-3" />
                                                    <span>{repo.stargazers_count}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <GitFork className="w-3 h-3" />
                                                    <span>{repo.forks_count}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>Updated {formatDate(repo.updated_at)}</span>
                                                </div>
                                            </div>

                                            {/* Topics */}
                                            {repo.topics.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-3">
                                                    {repo.topics.slice(0, 3).map((topic) => (
                                                        <span
                                                            key={topic}
                                                            className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full"
                                                        >
                                                            {topic}
                                                        </span>
                                                    ))}
                                                    {repo.topics.length > 3 && (
                                                        <span className="px-2 py-1 bg-gray-600/20 text-gray-400 text-xs rounded-full">
                                                            +{repo.topics.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Import Button */}
                                        <div className={viewMode === 'list' ? 'ml-4' : ''}>
                                            <button
                                                onClick={() => handleImport(repo)}
                                                disabled={importingIds.has(repo.id) || repo.archived}
                                                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${repo.archived
                                                    ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                                                    : importingIds.has(repo.id)
                                                        ? 'bg-blue-600/50 text-blue-300 cursor-not-allowed'
                                                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-blue-500/25'
                                                    }`}
                                            >
                                                {importingIds.has(repo.id) ? (
                                                    <>
                                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                                        Importing...
                                                    </>
                                                ) : repo.archived ? (
                                                    'Archived'
                                                ) : (
                                                    <>
                                                        <Download className="w-4 h-4" />
                                                        Import
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-700/50 text-center">
                    <p className="text-gray-500 text-sm">
                        Showing {filteredRepos.length} of {repos.length} repositories
                    </p>
                </div>
            </div>
        </div>
    );
}