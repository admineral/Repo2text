"use client";

import { useState } from "react";

interface DirectoryNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children: DirectoryNode[];
  fileHandle?: FileSystemFileHandle;
}

export function useFilePreview(structure: DirectoryNode[], selectedFiles: Set<string>) {
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (selectedFiles.size === 0) {
      alert("Please select at least one file!");
      return;
    }
    setDownloading(true);
    setError(null);
    setPreviewContent(null);

    try {
      const fileContents: string[] = [];

      for (const filePath of selectedFiles) {
        const node = findNodeByPath(structure, filePath);
        if (node && node.type === "file" && node.fileHandle) {
          const file = await node.fileHandle.getFile();
          const text = await file.text();
          fileContents.push(`FILE: ${filePath}\n${text}\n`);
        } else {
          fileContents.push(`FILE: ${filePath}\n(No content found)\n`);
        }
      }

      const filteredStructure = filterStructureForSelected(structure, selectedFiles);
      const structureString = printStructure(filteredStructure);

      const finalContent =
        "---- PROJECT FILE STRUCTURE (SELECTED ONLY) ----\n" +
        structureString +
        "\n\n---- SELECTED FILES ----\n" +
        Array.from(selectedFiles).map((p) => p).join("\n") +
        "\n\n---- BEGIN FILE CONTENTS ----\n\n" +
        fileContents.join("\n----\n\n");

      setPreviewContent(finalContent);

    } catch (err) {
      setError("Failed to generate file. Please try again.");
      console.error("Error generating file:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (previewContent) {
      await navigator.clipboard.writeText(previewContent);
      alert("Copied to clipboard!");
    }
  };

  const handleDownload = () => {
    if (!previewContent) return;
    const blob = new Blob([previewContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "selected_files.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    previewContent,
    downloading,
    error,
    handleGenerate,
    handleCopyToClipboard,
    handleDownload
  };
}

// Helper functions
function findNodeByPath(nodes: DirectoryNode[], targetPath: string): DirectoryNode | null {
  for (const node of nodes) {
    if (node.path === targetPath) {
      return node;
    }
    if (node.type === "directory") {
      const found = findNodeByPath(node.children, targetPath);
      if (found) return found;
    }
  }
  return null;
}

function filterStructureForSelected(
  nodes: DirectoryNode[],
  selected: Set<string>
): DirectoryNode[] {
  const filtered: DirectoryNode[] = [];
  for (const node of nodes) {
    if (node.type === "file") {
      if (selected.has(node.path)) {
        filtered.push({ ...node, children: [] });
      }
    } else {
      const filteredChildren = filterStructureForSelected(node.children, selected);
      if (filteredChildren.length > 0) {
        filtered.push({
          ...node,
          children: filteredChildren
        });
      }
    }
  }
  return filtered;
}

function printStructure(nodes: DirectoryNode[], indent: string = ""): string {
  const lines: string[] = [];
  for (const node of nodes) {
    lines.push(`${indent}${node.type === "directory" ? "[D]" : "[F]"} ${node.path}`);
    if (node.type === "directory") {
      lines.push(printStructure(node.children, indent + "  "));
    }
  }
  return lines.join("\n");
}
