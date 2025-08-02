"use client";

import Link from "next/link";
import { useState } from "react";
import { Home, Info, FolderOpen, Plus, Code, Settings, User, ChevronLeft, ChevronRight, Terminal, Zap, Cloud, LogOut } from "lucide-react";
import { isSideBarCollapsedAtom } from "@/src/store/atoms/sideBarCollapsed";
import { useAtom } from "jotai";
import { signOut } from "next-auth/react";

export default function AppBar() {
  // const [isSideBarCollapsedd, setisSideBarCollapsedd] = useState(false);
  const [activeItem, setActiveItem] = useState("/home");
  const [isSideBarCollapsed, setIsSideBarCollapsed] = useAtom(isSideBarCollapsedAtom);

  const navItems = [
    { href: "/home", label: "Home", icon: Home },
    { href: "/projects", label: "Projects", icon: FolderOpen },
    { href: "/deployment", label: "Deployment", icon: Cloud },
    { href: "/about", label: "About", icon: Info },
    { href: "/profile", label: "Profile", icon: User },
  ];

  const handleLogout = async () => {
    // Add your logout logic here
    // For example: clearing tokens, redirecting to login, etc.
    console.log("Logging out...");
    await signOut();
    
    // Example logout implementation:
    // localStorage.removeItem('authToken');
    // router.push('/login');
    // Or call your logout API
  };

  return (
    <div className="flex ">
      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/5 to-green-900/10 pointer-events-none"></div>
      
      <div className={`flex flex-col ${isSideBarCollapsed ? 'w-20' : 'w-[18vw]'} h-screen bg-gray-950/95 backdrop-blur-xl border-r border-gray-800/50 transition-all duration-300 relative z-10`}>
        
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800/50 bg-gray-900/50">
          {!isSideBarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <Terminal className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-white text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                KodeIt
              </h1>
            </div>
          )}
          
          {isSideBarCollapsed && (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg mx-auto">
              <Terminal className="w-5 h-5 text-white" />
            </div>
          )}
          
          <button
            onClick={() => {
              // setisSideBarCollapsedd(!isSideBarCollapsedd);
              setIsSideBarCollapsed(!isSideBarCollapsed);
            }}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-md transition-all duration-200"
          >
            {isSideBarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Create Project Button */}
        <Link href="/create" className="m-4">
          <div className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/25 border border-blue-500/20">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className={`flex items-center ${isSideBarCollapsed ? 'justify-center p-3' : 'justify-center p-4'} relative z-10`}>
              <Plus className="w-5 h-5 text-white" />
              {!isSideBarCollapsed && (
                <span className="ml-2 text-white font-semibold">Create Project</span>
              )}
            </div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col p-4 space-y-2 flex-1">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeItem === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setActiveItem(item.href)}
                className={`group relative flex items-center ${isSideBarCollapsed ? 'justify-center p-3' : 'p-3'} rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-600/30 shadow-lg' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 border border-transparent'
                }`}
              >
                <IconComponent className="w-5 h-5 flex-shrink-0" />
                {!isSideBarCollapsed && (
                  <span className="ml-3 font-medium">{item.label}</span>
                )}
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-400 rounded-r-full"></div>
                )}
                
                {/* Tooltip for collapsed state */}
                {isSideBarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-gray-200 text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className={`group relative flex items-center w-full ${isSideBarCollapsed ? 'justify-center p-3' : 'p-3'} rounded-lg transition-all duration-200 text-gray-400 hover:text-red-300 hover:bg-red-900/20 border border-transparent hover:border-red-500/30`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isSideBarCollapsed && (
              <span className="ml-3 font-medium">Logout</span>
            )}
            
            {/* Tooltip for collapsed state */}
            {isSideBarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-gray-200 text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                Logout
              </div>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800/50 bg-gray-900/30">
          {!isSideBarCollapsed ? (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-gray-400 font-mono">v1.0.0</span>
              </div>
              <p className="text-xs text-gray-500">
                Built with ❤️ by Ashwin Khowala
              </p>
            </div>
          ) : (
            <div className="flex justify-center">
              <Zap className="w-5 h-5 text-yellow-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}