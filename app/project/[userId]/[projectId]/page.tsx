"use client";

import { MonacoEditor } from "@/components/Editor";
import { useEffect, useState, use } from "react";
// import { PsudoTerminal } from "@/components/PsudoTerminal";
// import { useParams } from "next/navigation";
// import { useSocket } from "@/hooks/useSocket";
// import { Socket } from "socket.io-client";

export default function EditorPage({ params }: {
  params: Promise<{
    userId: string;
    projectId: string
  }>;
}) {
  const language = "React";
  const { userId, projectId } = use(params);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");

  // const socket: Socket | null = useSocket(userId, projectId);

  // if (!socket) {
  //   return <div>Loading...</div>;
  // }

  const [project, setProject] = useState<{ [key: string]: string }>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await fetch(`/api/project/${userId}/${projectId}`);
        if (!res.ok) throw new Error("Failed to fetch project");
        const data = await res.json();
        setProject(data);
      } catch (err) {
        console.error("Error fetching project files:", err);
        setError("Error loading project files.");
      }
    }

    fetchProject();
  }, [userId, projectId]);

  if (error) return <div>{error}</div>;
  if (!project) return <div>Loading project files...</div>;


  return (
    <div className="flex h-screen">
      {/* Sidebar component for project navigation */}
      <div className="w-[15vw] resize-x overflow-auto border-r rounded-md">
        <ListAllFiles
          project={project}
          onSelectFile={(filePath) => {
            setSelectedFile(filePath);
            setFileContent(project[filePath]); // load content from blob
          }}
        />
      </div>
      {/* Editor component for writing code */}
      <div className="w-[50vw] h-screen resize-x overflow-auto border-x rounded-md">
        <MonacoEditor
          language={language}
          value={fileContent}
          onChange={(newValue: string | undefined) => {
            if (selectedFile && typeof newValue === "string") {
              setProject((prev) => ({
                ...prev!,
                [selectedFile]: newValue,
              }));
              setFileContent(newValue); // Update local state as well
            }
          }}
        />
      </div>
      {/* Terminal component for running commands */}
      {/* <div className="w-[35vw] h-screen resize-x overflow-auto border-l rounded-md">
        <PsudoTerminal socket={socket} />
      </div> */}
    </div>
  );
}

function ListAllFiles({
  project,
  onSelectFile
}: {
  project: { [key: string]: string };
  onSelectFile: (filePath: string) => void;
}) {
  const fileTree = buildFileTree(Object.keys(project));
  return <TreeView tree={fileTree} onSelectFile={onSelectFile} />;
}

function buildFileTree(paths: string[]) {
  const root: { [key: string]: any } = {};

  for (const path of paths) {
    const parts = path.split("/");
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = i === parts.length - 1 ? null : {};
      }
      if (current[part] !== null) {
        current = current[part];
      }
    }
  }

  return root;
}

function TreeView({ 
  tree, 
  path = "", 
  onSelectFile 
}: {
  tree: { [key: string]: any };
  path?: string;
  onSelectFile: (filePath: string) => void;
}) {
  return (
    <ul className="pl-4">
      {Object.entries(tree).map(([name, value]) => {
        const currentPath = path ? `${path}/${name}` : name;

        return value === null ? (
          <li key={name}>
            <span
              onClick={() => onSelectFile(currentPath)}
              className="cursor-pointer text-white hover:underline"
            >
              📄 {name}
            </span>
          </li>
        ) : (
          <li key={name}>
            <details>
              <summary className="cursor-pointer text-blue-300">📂 {name}</summary>
              <TreeView tree={value} path={currentPath} onSelectFile={onSelectFile} />
            </details>
          </li>
        );
      })}
    </ul>
  );
}