'use client';
import { useState, useRef, useEffect, JSX } from "react";
import { Search, Plus, X, FolderPlus, FileText, Folder, FolderOpen, MoreVertical, Edit2, Trash2, Copy, Download } from "lucide-react";
import { FaReact, FaCss3Alt, FaHtml5, FaJs, FaFileAlt } from "react-icons/fa";
import { FaC, FaJava, FaPython, FaT } from "react-icons/fa6";
import { usePathname } from 'next/navigation';
import { useSession } from "next-auth/react";

interface FileExplorerProps {
    project: { [key: string]: string };
    onSelectFile: (filePath: string) => void;
    selectedFile?: string | null;
    onFileCreate?: (filePath: string, content?: string) => void;
    onFileDelete?: (filePath: string) => void;
    onFileRename?: (oldPath: string, newPath: string) => void;
    onFolderCreate?: (folderPath: string) => void;
}

interface FileTreeNode {
    [key: string]: FileTreeNode | null;
}

interface ContextMenuProps {
    x: number;
    y: number;
    target: string;
    isFile: boolean;
    onClose: () => void;
    onAction: (action: string, target: string) => void;
}

function ContextMenu({ x, y, target, isFile, onClose, onAction }: ContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const menuItems = isFile
        ? [
            { id: 'rename', label: 'Rename', icon: Edit2 },
            { id: 'copy', label: 'Copy Path', icon: Copy },
            { id: 'delete', label: 'Delete', icon: Trash2, danger: true }
        ]
        : [
            { id: 'newFile', label: 'New File', icon: FileText },
            { id: 'newFolder', label: 'New Folder', icon: FolderPlus },
            { id: 'rename', label: 'Rename', icon: Edit2 },
            { id: 'delete', label: 'Delete', icon: Trash2, danger: true }
        ];

    return (
        <div
            ref={menuRef}
            className="fixed bg-gray-800 border border-gray-600 rounded-md shadow-lg py-1 z-50 min-w-48"
            style={{ left: x, top: y }}
        >
            {menuItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => {
                        onAction(item.id, target);
                        onClose();
                    }}
                    className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-700 transition-colors ${item.danger ? 'text-red-400 hover:text-red-300' : 'text-gray-300 hover:text-white'
                        }`}
                >
                    <item.icon size={16} />
                    {item.label}
                </button>
            ))}
        </div>
    );
}


export function FileExplorer({
    project,
    onSelectFile,
    selectedFile,
    onFileCreate,
    onFileDelete,
    onFileRename,
    onFolderCreate
}: FileExplorerProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, target: string, isFile: boolean } | null>(null);
    const [editingItem, setEditingItem] = useState<string | null>(null);
    const [newItemName, setNewItemName] = useState("");
    const [showCreateFile, setShowCreateFile] = useState(false);
    const [showCreateFolder, setShowCreateFolder] = useState(false);
    const [createPath, setCreatePath] = useState("");

    const { data: session, status } = useSession();

    if (status === "loading") return <p>Loading...</p>;
    if (!session) return <p>You are not logged in</p>;

    const userId = session.user?.email || ""; 

    const pathname = usePathname();
    const projectName = pathname.split('/').pop();

    const fileTree = buildFileTree(Object.keys(project));
    const filteredPaths = searchTerm
        ? Object.keys(project).filter(path =>
            path.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : null;

    const handleContextMenu = (e: React.MouseEvent, path: string, isFile: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            target: path,
            isFile
        });
    };

    const handleContextAction = (action: string, target: string) => {
        switch (action) {
            case 'rename':
                setEditingItem(target);
                setNewItemName(target.split('/').pop() || '');
                break;
            case 'copy':
                navigator.clipboard.writeText(target);
                break;
            case 'delete':
                if (confirm(`Are you sure you want to delete "${target}"?`)) {
                    onFileDelete?.(target);
                }
                break;
            case 'newFile':
                setShowCreateFile(true);
                setCreatePath(target);
                break;
            case 'newFolder':
                setShowCreateFolder(true);
                setCreatePath(target);
                break;
        }
    };

    const handleRename = (oldPath: string) => {
        if (newItemName.trim() && newItemName !== oldPath.split('/').pop()) {
            const pathParts = oldPath.split('/');
            pathParts[pathParts.length - 1] = newItemName.trim();
            const newPath = pathParts.join('/');
            onFileRename?.(oldPath, newPath);
        }
        setEditingItem(null);
        setNewItemName("");
    };

    const handleCreateFile = () => {
        if (newItemName.trim()) {
            const fullPath = createPath ? `${createPath}/${newItemName.trim()}` : newItemName.trim();
            onFileCreate?.(fullPath, '');
            setShowCreateFile(false);
            setNewItemName("");
            setCreatePath("");
        }
    };

    const handleCreateFolder = () => {
        if (newItemName.trim()) {
            const fullPath = createPath ? `${createPath}/${newItemName.trim()}` : newItemName.trim();
            createFolder(fullPath, newItemName.trim())
                .then(() => {
                    console.log("Folder created successfully");
                    onFolderCreate?.(fullPath);
                    setShowCreateFolder(false);
                    setNewItemName("");
                    setCreatePath("");
                })
                .catch((error) => {
                    console.error(" Error creating folder:", error);
                    alert(`Failed to create folder: ${error.message}`);
                });
        }
    };

    async function createFolder(folderPath: string, folderName: string) {
        if (!folderPath || !folderName) {
            throw new Error("Folder path and name are required");
        }
        const res = await fetch(`/api/project/${userId}/${projectName}/create-folder`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                path: folderPath,
                folderName: folderName
            })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Unknown error");
        console.log(" Folder created:", data.message);
    }


    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'js':
                return <FaJs />;
            case 'tsx':
            case 'jsx':
                return <FaReact />;
            case 'ts':
                return <FaT />
            case 'css':
                return <FaCss3Alt />;
            case 'html':
                return <FaHtml5 />;
            case 'json':
                return <FaFileAlt />;
            case 'md':
                return <FaFileAlt />;
            case 'py':
                return <FaPython />;
            case 'java':
                return <FaJava />;
            case 'cpp':
            case 'c':
                return <FaC />;
            default:
                return <FaFileAlt />;
        }
    };

    console.log(createPath);

    return (
        <div className="w-full h-full bg-[#141414] text-white flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-200">Project Files</h3>
                    {/* <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setShowCreateFile(true);
                                setCreatePath("");
                            }}
                            className="p-1.5 hover:bg-gray-800 rounded transition-colors"
                            title="New File"
                        >
                            <Plus size={16} />
                        </button>
                        <button
                            onClick={() => {
                                setShowCreateFolder(true);
                                setCreatePath("");
                            }}
                            className="p-1.5 hover:bg-gray-800 rounded transition-colors"
                            title="New Folder"
                        >
                            <FolderPlus size={16} />
                        </button>
                        <button
                            onClick={() => {
                                if (selectedFile) {
                                    if (confirm(`Are you sure you want to delete "${selectedFile}"?`)) {
                                        onFileDelete?.(selectedFile);
                                        onSelectFile("");
                                    }
                                }
                            }}
                            className="p-1.5 hover:bg-gray-800 rounded transition-colors"
                            title="Delete File"
                        >
                            <Trash2 size={16} />
                        </button> */}
                    {/* </div> */}
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search files..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* File Tree */}
            <div className="flex-1 overflow-auto p-4">
                {searchTerm && filteredPaths ? (
                    <SearchResults
                        paths={filteredPaths}
                        searchTerm={searchTerm}
                        onSelectFile={onSelectFile}
                        selectedFile={selectedFile}
                        getFileIcon={getFileIcon}
                    />
                ) : (
                    <TreeView
                        tree={fileTree}
                        onSelectFile={onSelectFile}
                        selectedFile={selectedFile}
                        onContextMenu={handleContextMenu}
                        editingItem={editingItem}
                        newItemName={newItemName}
                        setNewItemName={setNewItemName}
                        onRename={handleRename}
                        onCancelEdit={() => {
                            setEditingItem(null);
                            setNewItemName("");
                        }}
                        getFileIcon={getFileIcon}
                    />
                )}
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    target={contextMenu.target}
                    isFile={contextMenu.isFile}
                    onClose={() => setContextMenu(null)}
                    onAction={handleContextAction}
                />
            )}

            {/* Create File Modal */}
            {showCreateFile && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg w-96">
                        <h3 className="text-lg font-semibold mb-4">Create New File</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">File Name</label>
                            <input
                                type="text"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                placeholder="Enter file name..."
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCreateFile();
                                    if (e.key === 'Escape') {
                                        setShowCreateFile(false);
                                        setNewItemName("");
                                    }
                                }}
                            />
                            {createPath && (
                                <p className="text-sm text-gray-400 mt-2">
                                    Location: {createPath}/
                                </p>
                            )}
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowCreateFile(false);
                                    setNewItemName("");
                                    setCreatePath("");
                                }}
                                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateFile}
                                disabled={!newItemName.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Folder Modal */}
            {showCreateFolder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg w-96">
                        <h3 className="text-lg font-semibold mb-4">Create New Folder</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Folder Name</label>
                            <input
                                type="text"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                placeholder="Enter folder name..."
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCreateFolder();
                                    if (e.key === 'Escape') {
                                        setShowCreateFolder(false);
                                        setNewItemName("");
                                    }
                                }}
                            />
                            {createPath && (
                                <p className="text-sm text-gray-400 mt-2">
                                    Location: {createPath}/
                                </p>
                            )}
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowCreateFolder(false);
                                    setNewItemName("");
                                    setCreatePath("");
                                }}
                                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={
                                    handleCreateFolder
                                }
                                disabled={!newItemName.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SearchResults({
    paths,
    searchTerm,
    onSelectFile,
    selectedFile,
    getFileIcon
}: {
    paths: string[];
    searchTerm: string;
    onSelectFile: (path: string) => void;
    selectedFile?: string | null;
    getFileIcon: (fileName: string) => JSX.Element;
}) {
    const highlightMatch = (text: string, term: string) => {
        if (!term) return text;
        const regex = new RegExp(`(${term})`, 'gi');
        const parts = text.split(regex);

        return parts.map((part, index) =>
            regex.test(part) ? (
                <span key={index} className="bg-yellow-600 text-black px-1 rounded">
                    {part}
                </span>
            ) : part
        );
    };

    return (
        <div className="space-y-1">
            <div className="text-sm text-gray-400 mb-3">
                {paths.length} result{paths.length !== 1 ? 's' : ''} found
            </div>
            {paths.map(path => (
                <div
                    key={path}
                    onClick={() => onSelectFile(path)}
                    className={`cursor-pointer px-2 py-1 rounded text-sm flex items-center gap-2 hover:bg-gray-800 transition-colors ${selectedFile === path ? 'bg-blue-600 text-white' : 'text-gray-300'
                        }`}
                >
                    <span>{getFileIcon(path)}</span>
                    <span className="truncate">
                        {highlightMatch(path, searchTerm)}
                    </span>
                </div>
            ))}
        </div>
    );
}

function buildFileTree(paths: string[]): FileTreeNode {
    const root: FileTreeNode = {};

    for (const path of paths) {
        const parts = path.split("/");
        let current = root;

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (!current[part]) {
                current[part] = i === parts.length - 1 ? null : {};
            }
            if (current[part] !== null) {
                current = current[part] as FileTreeNode;
            }
        }
    }

    return root;
}

interface TreeViewProps {
    tree: FileTreeNode;
    path?: string;
    onSelectFile: (filePath: string) => void;
    selectedFile?: string | null;
    onContextMenu: (e: React.MouseEvent, path: string, isFile: boolean) => void;
    editingItem: string | null;
    newItemName: string;
    setNewItemName: (name: string) => void;
    onRename: (oldPath: string) => void;
    onCancelEdit: () => void;
    getFileIcon: (fileName: string) => JSX.Element;
}

function TreeView({
    tree,
    path = "",
    onSelectFile,
    selectedFile,
    onContextMenu,
    editingItem,
    newItemName,
    setNewItemName,
    onRename,
    onCancelEdit,
    getFileIcon
}: TreeViewProps) {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

    const toggleFolder = (folderPath: string) => {
        setExpandedFolders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(folderPath)) {
                newSet.delete(folderPath);
            } else {
                newSet.add(folderPath);
            }
            return newSet;
        });
    };

    return (
        <ul className="space-y-1">
            {Object.entries(tree).map(([name, value]) => {
                const currentPath = path ? `${path}/${name}` : name;
                const isFile = value === null;
                const isSelected = selectedFile === currentPath;
                const isExpanded = expandedFolders.has(currentPath);
                const isEditing = editingItem === currentPath;

                return (
                    <li key={name} className="select-none">
                        {isFile ? (
                            <div
                                onClick={() => !isEditing && onSelectFile(currentPath)}
                                onContextMenu={(e) => onContextMenu(e, currentPath, true)}
                                className={`cursor-pointer px-2 py-1 rounded text-sm flex items-center gap-2 hover:bg-gray-800 transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'text-gray-300'
                                    }`}
                            >
                                <span>{getFileIcon(name)}</span>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={newItemName}
                                        onChange={(e) => setNewItemName(e.target.value)}
                                        onBlur={() => onRename(currentPath)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') onRename(currentPath);
                                            if (e.key === 'Escape') onCancelEdit();
                                        }}
                                        className="flex-1 bg-gray-700 px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        autoFocus
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                ) : (
                                    <span className="truncate">{name}</span>
                                )}
                            </div>
                        ) : (
                            <div>
                                <div
                                    onClick={() => toggleFolder(currentPath)}
                                    onContextMenu={(e) => onContextMenu(e, currentPath, false)}
                                    className="cursor-pointer px-2 py-1 rounded text-sm flex items-center gap-2 hover:bg-gray-800 transition-colors text-gray-300"
                                >
                                    {isExpanded ? (
                                        <FolderOpen size={16} className="text-blue-400" />
                                    ) : (
                                        <Folder size={16} className="text-blue-400" />
                                    )}
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={newItemName}
                                            onChange={(e) => setNewItemName(e.target.value)}
                                            onBlur={() => onRename(currentPath)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') onRename(currentPath);
                                                if (e.key === 'Escape') onCancelEdit();
                                            }}
                                            className="flex-1 bg-gray-700 px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            autoFocus
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    ) : (
                                        <span className="truncate">{name}</span>
                                    )}
                                </div>
                                {isExpanded && (
                                    <div className="ml-4 border-l border-gray-700 pl-2 mt-1">
                                        <TreeView
                                            tree={value}
                                            path={currentPath}
                                            onSelectFile={onSelectFile}
                                            selectedFile={selectedFile}
                                            onContextMenu={onContextMenu}
                                            editingItem={editingItem}
                                            newItemName={newItemName}
                                            setNewItemName={setNewItemName}
                                            onRename={onRename}
                                            onCancelEdit={onCancelEdit}
                                            getFileIcon={getFileIcon}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}