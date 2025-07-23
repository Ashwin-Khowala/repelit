import React, {useState} from 'react'
import {Directory, File, sortDir, sortFile} from "../utils/file-manager";
import { getIcon } from "./Icons";
import { ChevronRight, ChevronDown } from "lucide-react";

interface FileTreeProps {
  rootDir: Directory;   
  selectedFile: File | undefined;   
  onSelect: (file: File) => void;  
}

export const FileTree = (props: FileTreeProps) => {
  return (
    <div className="bg-gray-900 text-gray-100 font-mono text-sm leading-relaxed select-none overflow-y-auto h-full">
      <SubTree directory={props.rootDir} {...props}/>
    </div>
  )
}

interface SubTreeProps {
  directory: Directory;   
  selectedFile: File | undefined;   
  onSelect: (file: File) => void;  
}

const SubTree = (props: SubTreeProps) => {
  return (
    <div className="flex flex-col">
      {
        props.directory.dirs
          .sort(sortDir)
          .map(dir => (
            <React.Fragment key={dir.id}>
              <DirDiv
                directory={dir}
                selectedFile={props.selectedFile}
                onSelect={props.onSelect}/>
            </React.Fragment>
          ))
      }
      {
        props.directory.files
          .sort(sortFile)
          .map(file => (
            <React.Fragment key={file.id}>
              <FileDiv
                file={file}
                selectedFile={props.selectedFile}
                onClick={() => props.onSelect(file)}/>
            </React.Fragment>
          ))
      }
    </div>
  )
}

const FileDiv = ({file, icon, selectedFile, onClick, isDirectory = false}: {
  file: File | Directory; 
  icon?: string;          
  selectedFile: File | undefined;     
  onClick: () => void;
  isDirectory?: boolean;
}) => {
  const isSelected = (selectedFile && selectedFile.id === file.id) as boolean;
  const depth = file.depth;
  const paddingLeft = depth * 20 + 8;
  
  return (
    <div
      className={`
        flex items-center min-h-8 rounded-md transition-all duration-150 cursor-pointer relative group
        ${isSelected 
          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
          : 'hover:bg-white/5'
        }
      `}
      style={{paddingLeft}}
      onClick={onClick}>
      
      {/* Hover indicator */}
      <div className={`
        absolute left-0 top-0 bottom-0 w-1 rounded-r-sm transition-all duration-200
        ${isSelected 
          ? 'bg-blue-300' 
          : 'bg-blue-500 opacity-0 group-hover:opacity-100'
        }
      `} />
      
      <div className="flex items-center">
        <div className="flex items-center justify-center w-6 h-6 mr-2">
          <FileIcon
            name={icon}
            extension={file.name.split('.').pop() || ""}/>
        </div>
        <span className={`
          truncate transition-colors duration-150
          ${isSelected ? 'text-white font-medium' : 'text-gray-200'}
          ${isDirectory ? 'font-medium' : ''}
        `}>
          {file.name}
        </span>
      </div>
    </div>
  )
}

const DirDiv = ({directory, selectedFile, onSelect}: {
  directory: Directory;  
  selectedFile: File | undefined;    
  onSelect: (file: File) => void;  
}) => {
  let defaultOpen = false;
  if (selectedFile)
    defaultOpen = isChildSelected(directory, selectedFile)
  const [open, setOpen] = useState(defaultOpen);
  const isSelected = selectedFile?.id === directory.id;
  const paddingLeft = directory.depth * 20 + 8;
  
  return (
    <div>
      <div
        className={`
          flex items-center min-h-8 py-1 px-2 mx-1 rounded-md transition-all duration-150 cursor-pointer relative group
          ${isSelected 
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
            : 'hover:bg-white/5'
          }
        `}
        style={{paddingLeft}}
        onClick={() => {
          if (!open) {
            onSelect(directory)
          }
          setOpen(!open)
        }}>
        
        {/* Hover indicator */}
        <div className={`
          absolute left-0 top-0 bottom-0 w-1 rounded-r-sm transition-all duration-200
          ${isSelected 
            ? 'bg-blue-300' 
            : 'bg-blue-500 opacity-0 group-hover:opacity-100'
          }
        `} />
        
        <div className="flex items-center">
          {/* Chevron toggle */}
          <div className="flex items-center justify-center w-4 h-4 mr-1 transition-transform duration-200">
            {open ? (
              <ChevronDown size={14} className="text-gray-400" />
            ) : (
              <ChevronRight size={14} className="text-gray-400" />
            )}
          </div>
          
          {/* Directory icon */}
          <div className="flex items-center justify-center w-6 h-6 mr-2">
            <FileIcon
              name={open ? "openDirectory" : "closedDirectory"}
              extension=""/>
          </div>
          
          {/* Directory name */}
          <span className={`
            truncate transition-colors duration-150 font-medium
            ${isSelected ? 'text-white' : 'text-gray-200'}
          `}>
            {directory.name}
          </span>
        </div>
      </div>
      
      {/* Directory contents with subtle animation */}
      <div className={`
        overflow-hidden transition-all duration-200 ease-out
        ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
      `}>
        {open && (
          <div className="relative">
            {/* Connecting line for nested items */}
            <div 
              className="absolute bg-gray-700 w-px opacity-30"
              style={{
                left: paddingLeft + 12,
                top: 0,
                bottom: 0
              }} 
            />
            <SubTree
              directory={directory}
              selectedFile={selectedFile}
              onSelect={onSelect}/>
          </div>
        )}
      </div>
    </div>
  )
}

const isChildSelected = (directory: Directory, selectedFile: File) => {
  let res: boolean = false;

  function isChild(dir: Directory, file: File) {
    if (selectedFile.parentId === dir.id) {
      res = true;
      return;
    }
    if (selectedFile.parentId === '0') {
      res = false;
      return;
    }
    dir.dirs.forEach((item) => {
      isChild(item, file);
    })
  }

  isChild(directory, selectedFile);
  return res;
}

const FileIcon = ({extension, name}: { name?: string, extension?: string }) => {
  let icon = getIcon(extension || "", name || "");
  return <>{icon}</>;
}