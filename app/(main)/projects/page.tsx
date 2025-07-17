// "use client";
// import ProjectCard from "@/components/projectComponent/ProjectCard";

// export default function page() {
//   const response = fetch('http://localhost:3000/api/projects', {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   });
//   const projects = response.then(res => res.json());
//   console.log(projects);
//   return (
//     <div>
//         <h1 className="text-2xl font-bold mb-4">Projects</h1>
//         <ProjectCard name="Project 1" />
//         <ProjectCard name="Project 2" />
//         <ProjectCard name="Project 3" />
//     </div>
//   )
// }


"use client";

import { useEffect, useState } from "react";
import ProjectCard from "@/components/projectComponent/ProjectCard";

type Project = {
  projectName: string;
  username?: string;
  language?: string;
  createdAt?: string;
  lastModified?: string;
};

export default function Page() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/create-projects");
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="p-8  min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">My Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, idx) => (
          <ProjectCard
            key={idx}
            name={project.projectName}
            username={project.username}
            language={project.language}
            createdAt={project.createdAt}
            lastModified={project.lastModified}
          />
        ))}
      </div>
    </div>
  );
}
