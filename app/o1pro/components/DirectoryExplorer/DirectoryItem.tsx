"use client";

import React, { useState } from "react";

interface DirectoryNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children: DirectoryNode[];
  fileHandle?: FileSystemFileHandle;
}

interface DirectoryItemProps {
  node: DirectoryNode;
  selectedFiles: Set<string>;
  onSelectChange: (
    path: string,
    selected: boolean,
    isFolder: boolean,
    childrenPaths?: string[]
  ) => void;
}

export function DirectoryItem({ node, selectedFiles, onSelectChange }: DirectoryItemProps) {
  const [expanded, setExpanded] = useState<boolean>(false);

  const { checked, indeterminate } = getNodeSelectionState(node, selectedFiles);

  const handleCheck = (newChecked: boolean) => {
    if (node.type === "directory") {
      const allChildren = getAllFilesUnder(node);
      const allPaths = allChildren.map((c) => c.path);
      onSelectChange(node.path, newChecked, true, allPaths);
    } else {
      onSelectChange(node.path, newChecked, false);
    }
  };

  return (
    <>
      <div 
        className="flex items-center gap-2 py-1 px-1 hover:bg-gray-700/30 rounded transition-colors group"
      >
        <div className="flex items-center gap-2 flex-1">
          {node.type === "directory" && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors"
            >
              <svg
                className={`w-3 h-3 transition-transform duration-200 ${expanded ? "transform rotate-90" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
          <input
            type="checkbox"
            checked={checked}
            ref={(el) => {
              if (el) {
                el.indeterminate = indeterminate;
              }
            }}
            onChange={(e) => handleCheck(e.target.checked)}
            className="form-checkbox h-4 w-4 text-blue-500 rounded border-gray-600 bg-gray-700 transition-colors"
          />
          <span className="text-sm text-gray-200 select-none">
            {node.type === "directory" ? (
              <span className="text-blue-300">📁 </span>
            ) : (
              <span className="text-gray-400">📄 </span>
            )}
            {node.name}
          </span>
        </div>
      </div>
      {node.type === "directory" && expanded && node.children.length > 0 && (
        <ul className="list-none pl-3 border-l border-gray-700/50 space-y-1">
          {node.children.map((child) => (
            <li key={child.path}>
              <DirectoryItem node={child} selectedFiles={selectedFiles} onSelectChange={onSelectChange} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function getAllFilesUnder(node: DirectoryNode): DirectoryNode[] {
  let files: DirectoryNode[] = [];
  for (const child of node.children) {
    if (child.type === "file") {
      files.push(child);
    } else {
      files = files.concat(getAllFilesUnder(child));
    }
  }
  return files;
}

function getNodeSelectionState(node: DirectoryNode, selectedFiles: Set<string>): {checked: boolean, indeterminate: boolean} {
  if (node.type === "file") {
    const checked = selectedFiles.has(node.path);
    return { checked, indeterminate: false };
  } else {
    const allFiles = getAllFilesUnder(node);
    const totalFiles = allFiles.length;
    const selectedCount = allFiles.filter(f => selectedFiles.has(f.path)).length;

    if (selectedCount === 0) {
      return { checked: false, indeterminate: false };
    } else if (selectedCount === totalFiles) {
      return { checked: true, indeterminate: false };
    } else {
      return { checked: false, indeterminate: true };
    }
  }
}
