import React from 'react'

export default function loading() {
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
    )
}
