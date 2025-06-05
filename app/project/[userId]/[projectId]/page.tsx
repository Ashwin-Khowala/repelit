"use client";

import { MonacoEditor } from "@/components/Editor";
import { useEffect, useState } from "react";
// import { PsudoTerminal } from "@/components/PsudoTerminal";
// import { useParams } from "next/navigation";
// import { useSocket } from "@/hooks/useSocket";
// import { Socket } from "socket.io-client";

export default function EditorPage({ params }: {
  params: {
    userId: string;
    projectId: string
  };
}) {
  const language = "NodeJs";
  const { userId, projectId } = params;

  // const socket: Socket | null = useSocket(userId, projectId);

  // if (!socket) {
  //   return <div>Loading...</div>;
  // }

  const [ project, setProject ] = useState<{ [key: string]: string }>();
  const [ error, setError ] = useState<string | null>(null);

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
      {/* // This is the sidebar component that will be used to navigate through the project */}
      <div className="w-[15vw] resize-x overflow-auto border-r rounded-md">
        <ListAllFiles project={project} />
      </div>
      {/* // This is the editor component that will be used to write code */}
      <div className="w-[50vw] h-screen resize-x overflow-auto border-x rounded-md">
        <MonacoEditor language={language} />
      </div>
      {/* // This is the terminal component that will be used to run commands */}
      {/* <div className="w-[35vw] h-screen resize-x overflow-auto border-l rounded-md">
        <PsudoTerminal socket={socket} />
      </div> */}
    </div>
  );
}

function ListAllFiles({project}: { [key: string]: string }) {
  return Object.keys(project).map((fileName) => (
    <div key={fileName} className="p-2 hover:bg-gray-300 text-white font-light text-sm">
      {fileName}
    </div>
  ));
}