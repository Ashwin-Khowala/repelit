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
    });

    if (!response.ok) {
        throw new Error('Failed to create project');
    }

    return response.json();
}

export default function Page() {
    const [language, setLanguage] = useState('NodeJs');
    const [projectName, setProjectName] = useState('');
    const { data: session } = useSession();

    if (!session) {
        return <div>Please log in to create a project.</div>;
    }

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(e.target.value);
        console.log('Selected language:', e.target.value);
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Enter your project name"
                className="bg-white"
                onChange={(e) => setProjectName(e.target.value)}
            />
            <label htmlFor="language" className="block mb-2 font-medium text-gray-700">
                Select Language:
            </label>
            <select
                id="language"
                value={language}
                onChange={handleChange}
                className="border border-gray-300 rounded px-3 py-2 bg-white"
            >
                <option value="NodeJs">NodeJs</option>
                <option value="ReactJs">ReactJs</option>
            </select>
            <button
                className="bg-blue-500 text-white px-4 py-2 rounded mt-4 hover:bg-blue-700 cursor-pointer"
                onClick={() => {
                    createProject(projectName, language, session.user.email || "")
                        .then((data) => {
                            console.log('Project created successfully:', data);
                        })
                        .catch((error) => {
                            console.error('Error creating project:', error);
                        });
                    console.log('Project Name:', projectName);
                    console.log('Selected Language:', language);
                }}
            >
                Create Project
            </button>
        </div>
    );
}
