"use client";

import React from "react";
import { DirectoryItem } from "./DirectoryItem";

interface DirectoryNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children: DirectoryNode[];
  fileHandle?: FileSystemFileHandle;
}

interface DirectoryTreeProps {
  nodes: DirectoryNode[];
  selectedFiles: Set<string>;
  onSelectChange: (
    path: string,
    selected: boolean,
    isFolder: boolean,
    childrenPaths?: string[]
  ) => void;
}

export function DirectoryTree({ nodes, selectedFiles, onSelectChange }: DirectoryTreeProps) {
  return (
    <ul className="list-none pl-3 border-l border-gray-700/50 space-y-1">
      {nodes.map((node) => (
        <li key={node.path}>
          <DirectoryItem node={node} selectedFiles={selectedFiles} onSelectChange={onSelectChange} />
        </li>
      ))}
    </ul>
  );
}
