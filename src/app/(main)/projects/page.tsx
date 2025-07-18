"use client";

import { useEffect, useState } from "react";
import { Search, Filter, Grid, List, Plus, Calendar, Code, User, Clock, SortAsc, SortDesc } from "lucide-react";
import { ProjectCard } from "@/src/components/projectComponent/ProjectCard";

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

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/user-projects');
        const data = await response.json();

        if (!data || response.status == 404) {
          return <>
            No Project Found
          </>
        }

        setProjects(data);
        setFilteredProjects(data);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
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
  }, [projects, searchQuery, selectedLanguage, sortBy, sortOrder]);

  const languages = [...new Set((projects || []).map(p => p.language).filter(Boolean))];

  const handleSortChange = (newSortBy: 'name' | 'created' | 'modified') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  // loading sekeleton 
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
          <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 border border-blue-500/20">
            <Plus className="w-4 h-4" />
            <span className="font-medium">New Project</span>
          </button>
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
                {languages.map(lang => (
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
      <div className="relative z-10">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-600 mb-6">
              <Search className="w-16 h-16 mx-auto opacity-50" />
            </div>
            <h3 className="text-xl font-medium text-gray-300 mb-3">No projects found</h3>
            <p className="text-gray-500 mb-6 font-mono">
              {searchQuery || selectedLanguage
                ? "// Try adjusting your search parameters"
                : "// Initialize your first project"}
            </p>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 border border-blue-500/20">
              Create Project
            </button>
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }>
            {filteredProjects.map((project, idx) => (
              <ProjectCard
                key={idx}
                name={project.projectName}
                username={project.userId}
                language={project.language}
                createdAt={project.createdAt}
                lastModified={project.lastModified}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}