"use client";
import ProjectCard from "@/components/projectComponent/ProjectCard";

export default function page() {
  const response = fetch('http://localhost:3000/api/projects', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const projects = response.then(res => res.json());
  console.log(projects);
  return (
    <div>
        <h1 className="text-2xl font-bold mb-4">Projects</h1>
        <ProjectCard name="Project 1" />
        <ProjectCard name="Project 2" />
        <ProjectCard name="Project 3" />
    </div>
  )
}
