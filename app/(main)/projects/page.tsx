import ProjectCard from "@/components/projectComponent/ProjectCard";

export default function page() {
  return (
    <div>
        <h1 className="text-2xl font-bold mb-4">Projects</h1>
        <ProjectCard name="Project 1" />
        <ProjectCard name="Project 2" />
        <ProjectCard name="Project 3" />
    </div>
  )
}
