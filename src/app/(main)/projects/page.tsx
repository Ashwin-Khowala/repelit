"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Filter, Grid, List, Plus, SortAsc, SortDesc, Github, GitBranch, Download } from "lucide-react";
import { ProjectCard } from "@/src/components/projectComponent/ProjectCard";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ProjectCreationModal } from "@/src/components/Githubrepos";
import { GitHubReposComponent } from "@/src/components/github/ListRepos";

type Project = {
  projectName: string;
  userId?: string;
  language?: string;
  createdAt?: string;
  lastModified?: string;
};

export default function Page() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'modified'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [showGitHubOptions, setShowGitHubOptions] = useState(false);
  const [isGitHubConnected, setIsGitHubConnected] = useState(false);
  const { data: session, status } = useSession();
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showGitHubRepos, setShowGitHubRepos] = useState(false);
  const router = useRouter();

  // Check GitHub connection status
  useEffect(() => {
    const checkGitHubConnection = async () => {
      try {
        const response = await fetch('/api/github/status', {
          method: 'POST',
          body: JSON.stringify({ userId: session?.user.id })
        });

        if (response.ok) {
          const data = await response.json();
          setIsGitHubConnected(true);
        }
      } catch (error) {
        console.error('Failed to check GitHub connection:', error);
      }
    };
    checkGitHubConnection();
  }, [session?.user.id]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/user-projects');

        if (!response.ok) {
          console.error('Failed to fetch projects:', response.status);
          setProjects([]);
          return;
        }

        const data = await response.json();
        setProjects(data || []);
        setFilteredProjects(data || []);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        setProjects([]);
        setError('Failed to load projects. Please try again.');
        setFilteredProjects([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (projects && projects.length > 0) {
      let filtered = projects.filter(project => {
        const matchesSearch = project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.userId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.language?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesLanguage = selectedLanguage === "" || project.language === selectedLanguage;

        return matchesSearch && matchesLanguage;
      });

      // Sort projects
      filtered.sort((a, b) => {
        let aValue, bValue;

        switch (sortBy) {
          case 'name':
            aValue = a.projectName.toLowerCase();
            bValue = b.projectName.toLowerCase();
            break;
          case 'created':
            aValue = new Date(a.createdAt || '').getTime();
            bValue = new Date(b.createdAt || '').getTime();
            break;
          case 'modified':
            aValue = new Date(a.lastModified || '').getTime();
            bValue = new Date(b.lastModified || '').getTime();
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

      setFilteredProjects(filtered);
    }
  }, [projects, searchQuery, selectedLanguage, sortBy, sortOrder]);

  const languages = useMemo(() => {
    if (!projects?.length) return [];
    return [...new Set(projects.map(p => p.language).filter(Boolean))];
  }, [projects]);

  const handleSortChange = (newSortBy: 'name' | 'created' | 'modified') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const handleConnectGitHub = async () => {
    try {
      // Redirect to GitHub OAuth
      window.location.href = '/api/auth/github';
    } catch (error) {
      console.error('Failed to connect to GitHub:', error);
    }
  };

  // const handleImportFromGitHub = async () => {
  //   try {
  //     router.push('/github/import');
  //   } catch (error) {
  //     console.error('Failed to import from GitHub:', error);
  //   }
  // };
  const handleImportFromGitHub = async () => {
    setShowGitHubRepos(true);
  };

  const handleCreateProject = () => {
    // setShowGitHubOptions(!showGitHubOptions);s
    setShowProjectModal(true);
  };
  const handleCreateNewProject = () => {
    router.push('/create');
  }

  const handleRepoImport = async (repo: any) => {
    try {
      // Call your API to import the repository
      const response = await fetch('/api/import-github-repo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repoData: repo,
          userId: session?.user.id
        }),
      });

      if (response.ok) {
        // Refresh the projects list
        window.location.reload(); // or call your fetchProjects function
        setShowGitHubRepos(false);
      } else {
        throw new Error('Failed to import repository');
      }
    } catch (error) {
      console.error('Import failed:', error);
      // Show error notification
    }
  };


  if (!session) {
    router.push('/signin');
  }
  // loading skeleton 
  if (isLoading) {
    return (
      <div className="p-8 min-h-screen bg-gray-950 w-[82vw]">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800/50 rounded w-48 mb-6"></div>
          <div className="h-20 bg-gray-800/50 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-800/50 rounded-lg border border-gray-800/50"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 h-screen bg-gray-950 w-[82vw] overflow-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/5 to-green-900/10 pointer-events-none"></div>

      {/* Header */}
      <div className="relative z-10 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
              My Projects
            </h1>
            <p className="text-gray-400 mt-2 font-mono text-sm">
              <span className="text-blue-400">{filteredProjects.length}</span> of <span className="text-purple-400">{projects.length}</span> projects loaded
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* GitHub Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/50 border border-gray-700/50">
              <Github className="w-4 h-4 text-gray-400" />
              <span className={`text-xs font-medium ${isGitHubConnected ? 'text-green-400' : 'text-gray-400'}`}>
                {isGitHubConnected ? 'Connected' : 'Not Connected'}
              </span>
              <div className={`w-2 h-2 rounded-full ${isGitHubConnected ? 'bg-green-400' : 'bg-red-600'}`} />
            </div>

            {/* Create Project Button with Dropdown */}
            <div className="relative">
              {/* <button
                onClick={handleCreateProject}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 border border-blue-500/20 cursor-pointer z-100"
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium ">New Project</span>
              </button> */}
              <button
                onClick={handleCreateProject}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 border border-blue-500/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium">New Project</span>
              </button>

              <div className="relative z-50">
                <ProjectCreationModal
                  isOpen={showProjectModal}
                  onClose={() => setShowProjectModal(false)}
                  isGitHubConnected={isGitHubConnected}
                  onCreateNew={handleCreateNewProject}
                  onConnectGitHub={handleConnectGitHub}
                  onImportFromGitHub={handleImportFromGitHub}
                  onCloneRepository={() => {
                    // Add your clone repository logic here
                    console.log('Clone repository clicked');
                    setShowProjectModal(false);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800/50 p-6 shadow-2xl">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search projects, users, or languages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-100 placeholder-gray-500 transition-all duration-200"
              />
            </div>

            {/* Language Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="pl-10 pr-8 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-100 transition-all duration-200"
              >
                <option value="">All Languages</option>
                {languages?.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-gray-700/50 overflow-hidden bg-gray-800/30">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 transition-all duration-200 ${viewMode === 'grid'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
                  }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 transition-all duration-200 ${viewMode === 'list'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
                  }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-400 py-1 font-mono">sort_by:</span>
            {[
              { key: 'name', label: 'name' },
              { key: 'created', label: 'created' },
              { key: 'modified', label: 'modified' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleSortChange(key as 'name' | 'created' | 'modified')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all duration-200 font-mono ${sortBy === key
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-600/30'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 border border-transparent'
                  }`}
              >
                {label}
                {sortBy === key && (
                  sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Grid/List */}
      <div className="relative z-0">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-600 mb-6">
              <Search className="w-16 h-16 mx-auto opacity-50" />
            </div>
            <h3 className="text-xl font-medium text-gray-300 mb-3 z-20">No projects found</h3>
            <p className="text-gray-500 mb-6 font-mono">
              {searchQuery || selectedLanguage
                ? "// Try adjusting your search parameters"
                : "// Initialize your first project"}
            </p>
            <div className="flex gap-3 justify-center">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 border border-blue-500/20">
                Create Project
              </button>
              {isGitHubConnected && (
                <button
                  onClick={handleImportFromGitHub}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-green-500/25 border border-green-500/20 flex items-center gap-2"
                >
                  <Github className="w-4 h-4" />
                  Import from GitHub
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }>
            {(filteredProjects && filteredProjects.length > 0) ? filteredProjects.map((project, idx) => (
              <ProjectCard
                key={idx}
                name={project.projectName}
                username={project.userId}
                language={project.language}
                createdAt={project.createdAt}
                lastModified={project.lastModified}
                viewMode={viewMode}
              />
            )) :
              <div className="text-center text-gray-50">
                No projects found
              </div>}
          </div>
        )}
      </div>
      <div>
        <GitHubReposComponent
          isOpen={showGitHubRepos}
          onClose={() => setShowGitHubRepos(false)}
          onImport={handleRepoImport}
        />
      </div>
    </div>
  );
}