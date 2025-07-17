"use client";

import { MonacoEditor } from "@/components/Editor";
import { FileExplorer } from "@/components/FileExplorer";
import { useEffect, useState, use, useMemo, useCallback } from "react";
// import { TerminalComponent } from "@/components/PsudoTerminal";
import { io, Socket } from "socket.io-client";
import { FileTree } from "@/components/NewFileExplorer";
import { Type, File, RemoteFile, buildFileTree } from "@/utils/file-manager";
import axios from "axios";
import { projectName } from "@/store/atoms/projectName";
import { userSessionAtom } from "@/store/atoms/userId";
import { useAtomValue } from "jotai";
import dynamic from "next/dynamic";
// import { TerminalComponent } from "../../../../components/PsudoTerminal";

const TerminalComponent = dynamic(() => import('../../../../components/PsudoTerminal').then(mod => mod.TerminalComponent), {
    ssr: false,
    loading: () => <div>Loading terminal...</div>
});

export default function EditorPage({ params }: {
  params: Promise<{
    userId: string;
    projectId: string
  }>;
}) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const userId = useAtomValue(userSessionAtom);
  const projectId = useAtomValue(projectName);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");

  const [fileStructure, setFileStructure] = useState<RemoteFile[]>([]);
  const [SelectedFile, SetSelectedFile] = useState<File | undefined>(undefined);

  const [podCreated, setPodCreated] = useState(false);

  const [project, setProject] = useState<{ [key: string]: string }>();
  const [error, setError] = useState<string | null>(null);

  // Create debounced function using useCallback to prevent recreation
  const debouncedUpdate = useCallback(
    debounce((value: string, path: string | undefined, socket: Socket | null) => {
      if (socket && path) {
        socket.emit("updateContent", { path, content: value });
      }
    }, 500),
    []
  );

  useEffect(() => {
    if (projectId && userId) {
      axios.post(`http://localhost:3000/api/start`, { userId, projectId })
        .then(() => setPodCreated(true))
        .catch((err) => console.error(err));
    }
  }, [projectId, userId]); 

  // establishes a websocket connection using the projId and userId as Identifiers
  useEffect(() => {
    const replId = sanitizeK8sName(`${userId}-${projectId}`);
    const newSocket = io(`ws://${replId}.code.ashwinkhowala.com`,{transports: ['websocket']});
    setSocket(newSocket);
    console.log("Connecting to socket server...");
    newSocket.on("connect", () => {
      console.log("Connected to socket server");
      // newSocket.emit("join", { userId, projectId });
    });

    return () => {
      newSocket.disconnect();
    };
  // }, [userId, projectId]);
  }, []);

  

  // useEffect(() => {
  //   async function fetchProject() {
  //     try {
  //       const res = await fetch(`/api/project/${userId}/${projectId}`);
  //       if (!res.ok) throw new Error("Failed to fetch project");
  //       const data = await res.json();
  //       setProject(data);
  //     } catch (err) {
  //       console.error("Error fetching project files:", err);
  //       setError("Error loading project files.");
  //     }
  //   }

  //   fetchProject();
  // }, [userId, projectId]);

  const rootDir = useMemo(() => {
    return buildFileTree(fileStructure);
  }, [fileStructure]);

  // FIXED: Move this useEffect before any early returns and add proper conditions
  useEffect(() => {
    // Only run when we have rootDir with files and no selectedFile
    if (!selectedFile && rootDir.files && rootDir.files.length > 0) {
      onSelect(rootDir.files[0]);
    }
  }, [selectedFile, rootDir.files]); // Added proper dependencies

  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath);
    setFileContent(project?.[filePath] || ""); // load content from project
  };

  const onSelect = (file: File) => {
    if (file.type === Type.DIRECTORY) {
      socket?.emit("fetchDir", file.path, (data: RemoteFile[]) => {
        setFileStructure(prev => {
          const allFiles = [...prev, ...data];
          return allFiles.filter((file, index, self) =>
            index === self.findIndex(f => f.path === file.path)
          );
        });
      });
    } else {
      socket?.emit("fetchContent", { path: file.path }, (data: string) => {
        file.content = data;
        SetSelectedFile(file);
      });
    }
  };

  const handleEditorChange = (newValue: string | undefined) => {
    if (selectedFile && typeof newValue === "string") {
      setProject((prev) => ({
        ...prev!,
        [selectedFile]: newValue,
      }));
      setFileContent(newValue);

      // Use the debounced function
      debouncedUpdate(newValue, SelectedFile?.path, socket);
    }
  };

  // Early returns AFTER all hooks
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  // if (!project) return <div className="p-4">Loading project files...</div>;
  if (!podCreated) return <>Booting...</>;
  if (!socket) return <div>Loading...</div>;

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar component for project navigation */}
      <div className="w-[15vw] resize-x overflow-auto border-r border-gray-700">
        <FileTree
          rootDir={rootDir}
          selectedFile={SelectedFile}
          onSelect={onSelect}
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
        <TerminalComponent socket={socket} />
      </div>
    </div>
  );
}

function debounce(func: (value: string, path: string | undefined, socket: Socket | null) => void, wait: number) {
  let timeout: NodeJS.Timeout;
  return (value: string, path: string | undefined, socket: Socket | null) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(value, path, socket);
    }, wait);
  };
}

// used to remove special characters from the project name and user id
function sanitizeK8sName(input: string): string {
    return input
      .toLowerCase()
      .replace(/@/g, '-at-')
      .replace(/\./g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/^-+|-+$/g, '');
  }