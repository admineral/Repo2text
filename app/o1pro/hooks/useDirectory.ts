"use client";

import { useState } from "react";

interface DirectoryNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children: DirectoryNode[];
  fileHandle?: FileSystemFileHandle;
}

interface ModelPricing {
  name: string;
  inputPrice: number;
  outputPrice: number;
  description: string;
}

const MODEL_PRICES: { [key: string]: ModelPricing } = {
  'gpt-4o-2024-11-20': {
    name: 'GPT-4o (Latest)',
    inputPrice: 2.50,
    outputPrice: 10.00,
    description: 'Most capable model, best for complex tasks'
  },
  'gpt-4o-mini': {
    name: 'GPT-4o Mini',
    inputPrice: 0.150,
    outputPrice: 0.600,
    description: 'Smaller, faster, and more cost-effective'
  }
};

declare global {
  interface Window {
    showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
  }
  
  interface FileSystemDirectoryHandle extends FileSystemHandle {
    values(): AsyncIterableIterator<FileSystemHandle>;
    getDirectoryHandle(name: string): Promise<FileSystemDirectoryHandle>;
    getFileHandle(name: string): Promise<FileSystemFileHandle>;
  }
}

export function useDirectory() {
  const [structure, setStructure] = useState<DirectoryNode[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string|null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4o-mini');

  const handleFolderSelect = async () => {
    try {
      setLoading(true);
      
      if ('showDirectoryPicker' in window) {
        const dirHandle = await window.showDirectoryPicker();
        const struc = await processEntry(dirHandle);
        setStructure(struc);
        setError(null);
      } else {
        const input = document.createElement('input');
        input.type = 'file';
        input.webkitdirectory = true;
        input.multiple = true;
        
        input.onchange = async (e) => {
          const files = Array.from(input.files || []);
          if (files.length > 0) {
            const struc = await processFilesIntoStructure(files);
            setStructure(struc);
            setError(null);
          }
        };
        
        input.click();
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Folder selection cancelled');
      } else {
        console.error('Error selecting folder:', err);
        setError("Failed to load folder structure. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const processFilesIntoStructure = async (files: File[]): Promise<DirectoryNode[]> => {
    const structure: { [key: string]: DirectoryNode } = {};
    
    files.forEach(file => {
      const pathParts = file.webkitRelativePath.split('/');
      let currentPath = '';
      
      pathParts.forEach((part, index) => {
        const isLast = index === pathParts.length - 1;
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        if (!structure[currentPath]) {
          structure[currentPath] = {
            name: part,
            path: currentPath,
            type: isLast ? 'file' : 'directory',
            children: [],
          };
          
          if (isLast) {
            const fileHandle = {
              kind: 'file' as const,
              name: part,
              getFile: async () => file
            };
            structure[currentPath].fileHandle = fileHandle as FileSystemFileHandle;
          }
        }
        
        if (index > 0) {
          const parentPath = pathParts.slice(0, index).join('/');
          if (!structure[parentPath].children.includes(structure[currentPath])) {
            structure[parentPath].children.push(structure[currentPath]);
          }
        }
      });
    });
    
    return Object.values(structure).filter(node => 
      !node.path.includes('/') || node.path.split('/').length === 1
    );
  };

  async function processEntry(
    handle: FileSystemDirectoryHandle,
    path: string = ""
  ): Promise<DirectoryNode[]> {
    const entriesArr: FileSystemHandle[] = [];
    for await (const entry of handle.values()) {
      entriesArr.push(entry);
    }

    entriesArr.sort((a, b) => {
      if (a.kind !== b.kind) {
        return a.kind === "directory" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    const tasks = entriesArr.map(async (entry) => {
      const entryPath = path ? `${path}/${entry.name}` : entry.name;
      if (entry.kind === "directory") {
        const dirHandle = await handle.getDirectoryHandle(entry.name);
        const children = await processEntry(dirHandle, entryPath);
        return {
          name: entry.name,
          path: entryPath,
          type: "directory" as const,
          children,
        };
      } else {
        const fileHandle = await handle.getFileHandle(entry.name);
        return {
          name: entry.name,
          path: entryPath,
          type: "file" as const,
          children: [],
          fileHandle,
        };
      }
    });

    return Promise.all(tasks);
  }

  const handleSelectChange = (
    path: string,
    selected: boolean,
    isFolder: boolean,
    childrenPaths?: string[]
  ) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      if (isFolder && childrenPaths) {
        childrenPaths.forEach((cp) => {
          if (selected) {
            newSet.add(cp);
          } else {
            newSet.delete(cp);
          }
        });
      } else {
        if (selected) {
          newSet.add(path);
        } else {
          newSet.delete(path);
        }
      }
      return newSet;
    });
  };

  return {
    structure,
    selectedFiles,
    loading,
    error,
    handleFolderSelect,
    handleSelectChange,
    MODEL_PRICES,
    selectedModel,
    setSelectedModel
  };
}
