"use client";

import { MonacoEditor } from "@/src/components/Editor";
import { useEffect, useState, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import { FileTree } from "@/src/components/NewFileExplorer";
import { Type, File, RemoteFile, buildFileTree } from "@/src/utils/file-manager";
import axios from "axios";
import { userSessionAtom } from "@/src/store/atoms/userId";
import { useAtomValue } from "jotai";
import dynamic from "next/dynamic";
import { X, Folder, FileText, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

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
  const params = useParams<{ userId: string; projectId: string }>();

  const [fileStructure, setFileStructure] = useState<RemoteFile[]>([]);
  const [SelectedFile, SetSelectedFile] = useState<File | undefined>(undefined);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [podCreated, setPodCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userSession = useSession();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'file' | 'folder'>('file');

  const userId = params.userId;
  const projectId = params.projectId;

  const userSessionId = useAtomValue(userSessionAtom);

  console.log(userId);
  console.log(useAtomValue(userSessionAtom));

  useEffect(() => {
    if (projectId && userId) {
      axios.post(`/api/start`, { userId, projectId })
        .then(() => setPodCreated(true))
        .catch((err) => console.error(err));
      setPodCreated(true);
    }
  }, [projectId, userId]);

  // establishes a websocket connection using the projId and userId as Identifiers
  useEffect(() => {
    const replId = sanitizeK8sName(`${userId}-${projectId}`);
    const wsProtocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const newSocket = io(`${wsProtocol}//${replId}.ws.10xdevs.fun`, { transports: ['websocket'] });
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
      socket?.emit("createFolder", { path: currentPath, name: name }, (response: any) => {
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
  if (!projectId || !userId) return <div className="text-white">{projectId} or {userId} missing</div>
  if (!podCreated) return <>Booting...</>;
  if (!socket) return <div>Loading...</div>;

  return (
    <div className="h-screen bg-gray-900">
      <PanelGroup direction="horizontal" autoSaveId="editor-layout">
        {/* File Explorer Panel */}
        <Panel defaultSize={20} minSize={15} maxSize={40}>
          <div className="h-full border-r border-gray-700 bg-zinc-950 text-white flex flex-col">
            {/* Header */}
            <div className="relative bg-slate-900/80 backdrop-blur-sm border-b border-slate-800/30">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
              <h2 className="relative text-slate-100 text-base font-semibold p-4 tracking-wide">
                Project Explorer
              </h2>
            </div>

            {/* Action buttons */}
            <div className="p-4 border-b border-slate-800/30 bg-slate-900/20">
              <div className="flex flex-col gap-2">
                <button
                  className="group flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => openModal('file')}
                >
                  <FileText className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>New File</span>
                </button>

                <button
                  className="group flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => openModal('folder')}
                >
                  <Folder className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>New Folder</span>
                </button>

                <button
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium shadow-lg ${!SelectedFile
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white hover:shadow-red-500/25 hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  onClick={handleDelete}
                  disabled={!SelectedFile}
                >
                  <Trash2 className={`w-4 h-4 transition-transform ${!SelectedFile ? '' : 'group-hover:scale-110'}`} />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            {/* File Tree */}
            <div className="flex-1 overflow-auto">
              <FileTree
                rootDir={rootDir}
                selectedFile={SelectedFile}
                onSelect={onSelect}
              />
            </div>
          </div>
        </Panel>

        <PanelResizeHandle className=" bg-gray-700 hover:bg-gray-600 transition-colors" />

        {/* Editor Panel */}
        <Panel defaultSize={50} minSize={30}>
          <div className="h-full border-r border-gray-700">
            <MonacoEditor
              fileName={SelectedFile?.name || "Untitled"}
              language={SelectedFile?.name.split('.').pop() || "text"}
              value={SelectedFile?.content || ""}
              onChange={
                debounce((value) => {
                  socket.emit("updateContent", { path: SelectedFile?.path, content: value });
                }, 500)
              }
            />
          </div>
        </Panel>

        <PanelResizeHandle className=" bg-gray-700 hover:bg-gray-600 transition-colors" />

        {/* Terminal Panel */}
        <Panel defaultSize={30} minSize={20}>
          <div className="h-[100vh] overflow-hidden">
            <TerminalComponent socket={socket} />
          </div>
        </Panel>
      </PanelGroup>

      {/* Add File/Folder Modal */}
      {/* <AddFileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddFile}
        type={modalType}
        currentPath={selectedFolder || ''}
      /> */}
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