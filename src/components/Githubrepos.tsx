import React, { useState } from 'react';
import { X, Plus, Github, Download, GitBranch, Sparkles, Code, FolderPlus, Link, ChevronRight } from 'lucide-react';
import { redirect } from 'next/dist/server/api-utils';

interface ProjectCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isGitHubConnected: boolean;
  onCreateNew: () => void;
  onConnectGitHub: () => void;
  onImportFromGitHub: () => void;
  onCloneRepository?: () => void;
}

export const ProjectCreationModal: React.FC<ProjectCreationModalProps> = ({
  isOpen,
  onClose,
  isGitHubConnected,
  onCreateNew,
  onConnectGitHub,
  onImportFromGitHub,
  onCloneRepository
}) => {
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  if (!isOpen) return null;

  const options = [
    {
      id: 'create-new',
      title: 'Create New Project',
      description: 'Start fresh with a blank canvas',
      icon: Plus,
      gradient: 'from-blue-500 to-cyan-500',
      action: onCreateNew,
      enabled: true,
      badge: null,
    },
    {
      id: 'import-github',
      title: 'Import from GitHub',
      description: 'Import your existing repositories',
      icon: Download,
      gradient: 'from-green-500 to-emerald-500',
      action: onImportFromGitHub,
      enabled: isGitHubConnected,
      badge: isGitHubConnected ? null : 'Connect Required',
    },
    {
      id: 'clone-repo',
      title: 'Clone Repository',
      description: 'Clone any public repository',
      icon: GitBranch,
      gradient: 'from-orange-500 to-red-500',
      action: onCloneRepository,
      enabled: isGitHubConnected,
      badge: isGitHubConnected ? null : 'Connect Required'
    }
  ];

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/5 to-green-900/10" />
        
        {/* Header */}
        <div className="relative border-b border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Create New Project</h2>
                <p className="text-gray-400 text-sm">Choose how you'd like to start</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* GitHub Connection Status */}
        {!isGitHubConnected && (
          <div className="relative border-b border-gray-700/50 p-4">
            <div className="flex items-center justify-between bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                  <Github className="w-4 h-4 text-gray-300" />
                </div>
                <div>
                  <p className="text-white font-medium">Connect your GitHub account</p>
                  <p className="text-gray-400 text-sm">Unlock importing and cloning features</p>
                </div>
              </div>
              <button
                onClick={onConnectGitHub}
                className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 border border-gray-600/50 flex items-center gap-2 text-sm font-medium"
              >
                <Github className="w-4 h-4" />
                Connect
              </button>
            </div>
          </div>
        )}

        {/* Options */}
        <div className="relative p-6">
          <div className="space-y-3">
            {options.map((option) => {
              const Icon = option.icon;
              const isHovered = hoveredOption === option.id;
              
              return (
                <button
                  key={option.id}
                  onClick={option.enabled ? option.action : undefined}
                  onMouseEnter={() => setHoveredOption(option.id)}
                  onMouseLeave={() => setHoveredOption(null)}
                  disabled={!option.enabled}
                  className={`w-full group relative overflow-hidden rounded-xl border transition-all duration-300 ${
                    option.enabled
                      ? 'border-gray-700/50 hover:border-gray-600/50 bg-gray-800/30 hover:bg-gray-800/50 cursor-pointer'
                      : 'border-gray-800/50 bg-gray-900/30 cursor-not-allowed opacity-60'
                  }`}
                >
                  {/* Hover gradient effect */}
                  {option.enabled && isHovered && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${option.gradient} opacity-5`} />
                  )}
                  
                  <div className="relative p-5 flex items-center gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                      option.enabled && isHovered
                        ? `bg-gradient-to-br ${option.gradient} border-transparent shadow-lg`
                        : option.enabled
                        ? `bg-gradient-to-br ${option.gradient} opacity-80 border-gray-700/50`
                        : 'bg-gray-800 border-gray-700/50'
                    }`}>
                      <Icon className={`w-5 h-5 transition-all duration-300 ${
                        option.enabled && isHovered ? 'text-white scale-110' : 'text-white'
                      }`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold transition-colors duration-200 ${
                          option.enabled ? 'text-white' : 'text-gray-500'
                        }`}>
                          {option.title}
                        </h3>
                        {option.badge && (
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                            {option.badge}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm transition-colors duration-200 ${
                        option.enabled ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {option.description}
                      </p>
                    </div>

                    {/* Arrow */}
                    {option.enabled && (
                      <ChevronRight className={`w-5 h-5 text-gray-400 transition-all duration-300 ${
                        isHovered ? 'translate-x-1 text-gray-300' : ''
                      }`} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-700/50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Tip: You can always import projects later</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};