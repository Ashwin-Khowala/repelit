"use client";

import { MonacoEditor } from "@/components/Editor";
import { FileExplorer } from "@/components/FileExplorer";
import { useEffect, useState, use } from "react";
import {PsudoTerminal} from "@/components/PsudoTerminal";
// import { useParams } from "next/navigation";
// import { useSocket } from "@/hooks/useSocket";
// import { Socket } from "socket.io-client";
import { io, Socket } from "socket.io-client";


export default function EditorPage({ params }: {
  params: Promise<{
    userId: string;
    projectId: string
  }>;
}) {
  const [ socket, setSocket ] = useState<Socket | null>(null);
  const { userId, projectId } = use(params);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  
  // extablishes a websocket connection using the projId and userId as Identifiers
  useEffect(()=>{
    const newSocket = io(`ws://${projectId}.${userId}.ashwinkhowala.com`);
    setSocket(newSocket);

    return () => {
            newSocket.disconnect();
        };
  },[userId,projectId]);

  if (!socket) {
    return <div>Loading...</div>;
  }

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

  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath);
    setFileContent(project?.[filePath] || ""); // load content from project
  };

  const handleEditorChange = (newValue: string | undefined) => {
    if (selectedFile && typeof newValue === "string") {
      setProject((prev) => ({
        ...prev!,
        [selectedFile]: newValue,
      }));
      setFileContent(newValue); // Update local state as well
    }
  };

  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!project) return <div className="p-4">Loading project files...</div>;

  console.log("path :", selectedFile);

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar component for project navigation */}
      <div className="w-[15vw] resize-x overflow-auto border-r border-gray-700">
        <FileExplorer
          project={project}
          onSelectFile={handleFileSelect}
          selectedFile={selectedFile}
          onFileCreate={(path, content) => {
            // Handle new file creation
            setProject(prev => ({ ...prev, [path]: content || '' }));
          }}
          onFileDelete={(path) => {
            // Handle file deletion
            const newProject = { ...project };
            delete newProject[path];
            setProject(newProject);
          }}
          onFileRename={(oldPath, newPath) => {
            // Handle file renaming
            const newProject = { ...project };
            newProject[newPath] = newProject[oldPath];
            delete newProject[oldPath];
            setProject(newProject);
          }}
          onFolderCreate={(folderPath) => {
            // Handle folder creation (you might want to create a placeholder file)
            setProject(prev => ({ ...prev, [`${folderPath}/.gitkeep`]: '' }));
          }}
        />
      </div>

      {/* Editor component for writing code */}
      <div className="w-[50vw] h-screen resize-x overflow-auto border-x border-gray-700">
        <MonacoEditor
          fileName={selectedFile || "Untitled"}
          language={selectedFile?.split('.').pop() || "text"}
          value={fileContent}
          onChange={handleEditorChange}
        />
      </div>

      {/* Terminal component for running commands */}
      <div className="w-[35vw] h-screen resize-x overflow-auto border-l border-gray-700">
        <PsudoTerminal socket={socket}/>
      </div>
    </div>
  );
}