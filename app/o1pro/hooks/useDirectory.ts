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
      const dirHandle = await window.showDirectoryPicker();
      const struc = await processEntry(dirHandle);
      setStructure(struc);
      setError(null);
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
