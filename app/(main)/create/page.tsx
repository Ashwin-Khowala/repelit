"use client";
import { useState } from "react";

export default function page() {
    const [language, setLanguage] = useState('Node');
    const [projectName, setProjectName] = useState('');

    const handleChange = (e: any) => {
        const selectedLang = e.target.value;
        setLanguage(selectedLang);
        console.log('Selected language:', selectedLang);
    };

    return (
        <div>
            <div>
                <input type = "text" placeholder = " enter your project name "    className = "bg-white" onChange = { (e) => {
                    setProjectName(e.target.value);
                } } />
                <label htmlFor="language" className="block mb-2 font-medium text-gray-700">
                    Select Language:
                </label>
                <select
                    id="language"
                    value={language}
                    onChange={handleChange}
                    className="border border-gray-300 rounded px-3 py-2 bg-white">
                    <option value="javascript">JavaScript</option>
                    <option value="java">Java</option>
                </select>
            </div>
        </div>
    )
}
