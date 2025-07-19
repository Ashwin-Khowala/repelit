"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

async function createProject(projectName: string, language: string, userId: string) {
    if (!projectName || !language) {
        throw new Error('Project name and language are required');
    }

    if (!userId) {
        throw new Error('User email is required');
    }

    console.log('User Email:', userId);

    const response = await fetch('/api/create-projects', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, projectName, language }),
    })
    if (!response.ok) {
        throw new Error('Failed to create project');
    }

    // window.location.href = `https://localhost:3000/${userId}/${projectName}`;

    return response.json();
}

export default function Page() {
    const [language, setLanguage] = useState('NodeJs');
    const [projectName, setProjectName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { data: session } = useSession();

    if (!session) {
        return (
            <div className="h-screen bg-black flex items-center justify-center overflow-hidden relative">
                {/* Animated background */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
                </div>

                <div className="relative z-10 text-center">
                    <div className="mb-8 animate-bounce">
                        <div className="w-24 h-24 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent mb-4">
                        ACCESS DENIED
                    </h1>
                    <p className="text-2xl text-gray-300 font-bold">Please log in to create a project</p>
                </div>
            </div>
        );
    }

    // console.log(session.user.id);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(e.target.value);
        console.log('Selected language:', e.target.value);
    };

    const handleCreateProject = async () => {
        if (!projectName.trim()) {
            alert('Please enter a project name');
            return;
        }

        setIsLoading(true);
        try {
            const data = await createProject(projectName, language, session.user.id || "");
            console.log('Project created successfully:', data);
        } catch (error) {
            console.error('Error creating project:', error);
            alert('Failed to create project. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="">
            <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden relative">
                {/* Animated background orbs */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
                    <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-3000"></div>
                </div>

                {/* Grid pattern overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

                <div className="relative z-10 w-full max-w-lg mx-auto p-6">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-block animate-float">
                            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-2xl transform rotate-12 hover:rotate-0 transition-transform duration-500">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
                                </svg>
                            </div>
                        </div>
                        <h1 className="text-5xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent mb-4">
                            CREATE PROJECT
                        </h1>
                        <p className="text-xl text-gray-300 font-bold">Build something extraordinary</p>
                    </div>

                    {/* Form */}
                    <div className="bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-red-900/20 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20 shadow-2xl">
                        <div className="space-y-8">
                            {/* Project Name */}
                            <div className="space-y-3">
                                <label className="block text-white text-lg font-bold">
                                    PROJECT NAME
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter your project name"
                                    className="w-full px-6 py-4 bg-black/50 border-2 border-purple-500/30 rounded-2xl text-white text-lg placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/25 transition-all duration-300 hover:border-purple-500/50"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                />
                            </div>

                            {/* Language Selection */}
                            <div className="space-y-3">
                                <label htmlFor="language" className="block text-white text-lg font-bold">
                                    TECHNOLOGY STACK
                                </label>
                                <select
                                    id="language"
                                    value={language}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-black/50 border-2 border-purple-500/30 rounded-2xl text-white text-lg focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/25 transition-all duration-300 hover:border-purple-500/50 appearance-none cursor-pointer"
                                >
                                    <option value="NodeJs" className="bg-black text-white rounded-md">Node.js</option>
                                    <option value="NextJs" className="bg-black text-white">Next.js</option>
                                    <option value="C" className="bg-black text-white">C</option>
                                    <option value="Java" className="bg-black text-white">Java</option>
                                </select>
                            </div>

                            {/* Create Button */}
                            <button
                                onClick={handleCreateProject}
                                disabled={isLoading || !projectName.trim()}
                                className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white font-black text-xl py-4 px-8 rounded-2xl hover:from-purple-600 hover:via-pink-600 hover:to-red-600 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-2xl group overflow-hidden relative"
                            >
                                {/* Button background animation */}
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                <div className="relative z-10">
                                    {isLoading ? (
                                        <div className="flex items-center justify-center space-x-3">
                                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>CREATING PROJECT...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center space-x-3">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            <span>CREATE PROJECT</span>
                                        </div>
                                    )}
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-400 text-lg">
                            Welcome back, <span className="text-white font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{session.user.name || session.user.email}</span>
                        </p>
                    </div>
                </div>

                <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(12deg); }
                    50% { transform: translateY(-20px) rotate(12deg); }
                    }
                    .animate-float {
                        animation: float 3s ease-in-out infinite;
                }
                `}</style>
            </div>
        </div>
    );
}