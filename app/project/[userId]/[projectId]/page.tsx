// 



"use client";

import { MonacoEditor } from "@/components/Editor";
import { useEffect, useState, use, useMemo, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { FileTree } from "@/components/NewFileExplorer";
import { Type, File, RemoteFile, buildFileTree } from "@/utils/file-manager";
import axios from "axios";
import { projectName } from "@/store/atoms/projectName";
import { userSessionAtom } from "@/store/atoms/userId";
import { useAtomValue } from "jotai";
import dynamic from "next/dynamic";
import { X, Plus, Folder, FileText, Trash2 } from "lucide-react";

const TerminalComponent = dynamic(() => import('../../../../components/PsudoTerminal').then(mod => mod.TerminalComponent), {
  ssr: false,
  loading: () => <div>Loading terminal...</div>
});

// Modal Component
const AddFileModal = ({
  isOpen,
  onClose,
  onSubmit,
  type,
  currentPath
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, type: 'file' | 'folder') => void;
  type: 'file' | 'folder';
  currentPath: string;
}) => {
  const [fileName, setFileName] = useState('');

  const handleSubmit = () => {
    if (fileName.trim()) {
      onSubmit(fileName.trim(), type);
      setFileName('');
      onClose();
    }
  };

  const handleClose = () => {
    setFileName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl w-96 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            {type === 'file' ? <FileText className="w-5 h-5" /> : <Folder className="w-5 h-5" />}
            Add {type === 'file' ? 'File' : 'Folder'}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Path
            </label>
            <div className="px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-gray-400 text-sm">
              {currentPath || '/'}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {type === 'file' ? 'File' : 'Folder'} Name
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder={type === 'file' ? 'example.txt' : 'folder-name'}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
                if (e.key === 'Escape') {
                  handleClose();
                }
              }}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function EditorPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const userId = useAtomValue(userSessionAtom);
  const projectId = useAtomValue(projectName);

  const [fileStructure, setFileStructure] = useState<RemoteFile[]>([]);
  const [SelectedFile, SetSelectedFile] = useState<File | undefined>(undefined);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [podCreated, setPodCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'file' | 'folder'>('file');

  useEffect(() => {
    if (projectId && userId) {
      axios.post(`http://localhost:3000/api/start`, { userId, projectId })
        .then(() => setPodCreated(true))
        .catch((err) => console.error(err));
      // Mock API call - replace with your actual API
      setPodCreated(true);
    }
  }, [projectId, userId]);

  // establishes a websocket connection using the projId and userId as Identifiers
  useEffect(() => {
    const replId = sanitizeK8sName(`${userId}-${projectId}`);
    const newSocket = io(`ws://${replId}.code.ashwinkhowala.com`, { transports: ['websocket'] });
    setSocket(newSocket);
    console.log("Connecting to socket server...");
    newSocket.on("connect", () => {
      console.log("Connected to socket server");
    });

    return () => {
      newSocket.disconnect();
    };
  }, [userId, projectId]);

  const rootDir = useMemo(() => {
    return buildFileTree(fileStructure);
  }, [fileStructure]);

  useEffect(() => {
    if (socket) {
      socket.on('loaded', ({ rootContent }: { rootContent: RemoteFile[] }) => {
        setFileStructure(rootContent);
      });
    }
  }, [socket]);

  const onSelect = (file: File) => {
    if (file.type === Type.DIRECTORY) {
      setSelectedFolder(file.path);
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

  const handleAddFile = (name: string, type: 'file' | 'folder') => {
    const currentPath = selectedFolder || '';

    if (type === 'file') {
      const fullPath = currentPath ? `${currentPath}/${name}` : name;
      socket?.emit("updateContent", { path: fullPath, content: "" });
    } else {
      socket?.emit("createFolder", { path: currentPath, name: name }, (response:any) => {
        if (response.error) {
          console.error("Failed to create folder:", response.error);
          return;
        }
        console.log("Folder created successfully");
      });
    }

    // Refresh the file structure
    setTimeout(() => {
      socket?.emit("fetchDir", currentPath, (data: RemoteFile[]) => {
        setFileStructure(prev => {
          const allFiles = [...prev, ...data];
          return allFiles.filter((file, index, self) =>
            index === self.findIndex(f => f.path === file.path)
          );
        });
      });
    }, 100);
  };

  const handleDelete = () => {
    if (SelectedFile) {
      socket?.emit("deleteFile", { path: SelectedFile.path });
      SetSelectedFile(undefined);
      // Refresh file structure
      setTimeout(() => {
        socket?.emit("fetchDir", selectedFolder || '', (data: RemoteFile[]) => {
          setFileStructure(prev => {
            const allFiles = [...prev, ...data];
            return allFiles.filter((file, index, self) =>
              index === self.findIndex(f => f.path === file.path)
            );
          });
        });
      }, 100);
    }
  };

  const openModal = (type: 'file' | 'folder') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  // Debounce function
  const debounce = (func: (value: string) => void, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (value: string) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func(value);
      }, wait);
    };
  };

  // If no pod is created, show loading state
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!podCreated) return <>Booting...</>;
  if (!socket) return <div>Loading...</div>;

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar component for project navigation */}
      <div className="w-[15vw] resize-x overflow-auto border-r border-gray-700 bg-zinc-950 text-white">
        <div>
          <h2 className="text-white text-lg font-semibold p-4">Project Files</h2>
        </div>

        {/* Action buttons */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex flex-col gap-2">
            <button
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md transition-colors text-sm"
              onClick={() => openModal('file')}
            >
              <FileText className="w-4 h-4" />
              Add File
            </button>
            <button
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md transition-colors text-sm"
              onClick={() => openModal('folder')}
            >
              <Folder className="w-4 h-4" />
              Add Folder
            </button>
            <button
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md transition-colors text-sm"
              onClick={handleDelete}
              disabled={!SelectedFile}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        <FileTree
          rootDir={rootDir}
          selectedFile={SelectedFile}
          onSelect={onSelect}
        />
      </div>

      {/* Editor component for writing code */}
      <div className="w-[50vw] h-screen resize-x overflow-auto border-x border-gray-700">
        <MonacoEditor
          fileName={SelectedFile?.name || "Untitled"}
          language={SelectedFile?.name.split('.').pop() || "text"}
          value={SelectedFile?.content || ""}
          //@ts-ignore
          onChange={debounce((value) => {
            socket.emit("updateContent", { path: SelectedFile?.path, content: value });
          }, 500)}
        />
      </div>

      {/* Terminal component for running commands */}
      <div className="w-[35vw] h-screen resize-x overflow-auto border-l border-gray-700">
        <TerminalComponent socket={socket} />
      </div>

      {/* Add File/Folder Modal */}
      <AddFileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddFile}
        type={modalType}
        currentPath={selectedFolder || ''}
      />
    </div>
  );
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