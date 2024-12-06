"use client";

import { useState, useRef } from "react";

interface DirectoryNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children: DirectoryNode[];
  fileHandle?: FileSystemFileHandle;
}

interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

interface DocumentationResult {
  filePath: string;
  content: string;
  usage?: TokenUsage;
}

interface DocumentationStatus {
  filePath: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
  error?: string;
}

type DocGenerationMode = 'single' | 'single-with-context' | 'combined-readme';

export function useDocumentation(structure: DirectoryNode[], selectedFiles: Set<string>, selectedModel: string) {
  const [documentation, setDocumentation] = useState<DocumentationResult[]>([]);
  const [docStatus, setDocStatus] = useState<DocumentationStatus[]>([]);
  const [generatingDocs, setGeneratingDocs] = useState<boolean>(false);
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set());
  const debouncedUpdateRef = useRef<NodeJS.Timeout | null>(null);

  const handleGenerateDocumentation = async (mode: DocGenerationMode) => {
    if (selectedFiles.size === 0) {
      alert("Please select at least one file!");
      return;
    }

    setGeneratingDocs(true);
    
    if (mode === 'combined-readme') {
      setDocumentation([{
        filePath: 'README.md',
        content: 'Generating documentation...',
        usage: undefined
      }]);
    } else {
      const initialDocs = Array.from(selectedFiles).map(filePath => ({
        filePath,
        content: 'Generating documentation...',
        usage: undefined
      }));
      setDocumentation(initialDocs);
    }

    const allFiles = Array.from(selectedFiles);
    const initialStatus: DocumentationStatus[] = mode === 'combined-readme' 
      ? [{ filePath: 'README.md', status: 'pending' }]
      : allFiles.map((file, index) => ({
          filePath: file,
          status: index === 0 ? 'generating' : 'pending'
        }));
    setDocStatus(initialStatus);

    try {
      const allFilesContent = await getAllSelectedFilesContent(structure, selectedFiles);

      if (mode === 'combined-readme') {
        setDocStatus(prev => prev.map(s => 
          s.filePath === 'README.md' ? { ...s, status: 'generating' } : s
        ));

        const response = await fetch('/api/openai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            files: allFilesContent,
            mode: 'combined-readme',
            model: selectedModel
          }),
        });

        if (!response.ok) {
          setDocStatus(prev => prev.map(s => 
            s.filePath === 'README.md' ? { ...s, status: 'error', error: 'Failed to generate' } : s
          ));
          throw new Error('Failed to generate README');
        }

        await processStreamingResponse(response, 'README.md', setDocumentation, debouncedUpdateRef);
        setDocStatus(prev => prev.map(s => 
          s.filePath === 'README.md' ? { ...s, status: 'completed' } : s
        ));
      } else {
        for (let i = 0; i < allFiles.length; i++) {
          const filePath = allFiles[i];
          const nextFilePath = allFiles[i + 1];

          try {
            const node = findNodeByPath(structure, filePath);
            if (node && node.type === "file" && node.fileHandle) {
              const file = await node.fileHandle.getFile();
              const text = await file.text();

              setDocStatus(prev => prev.map(s => 
                s.filePath === filePath ? { ...s, status: 'generating' } : s
              ));

              const response = await fetch('/api/openai', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  files: mode === 'single-with-context' ? allFilesContent : text,
                  targetFile: mode === 'single-with-context' ? filePath : undefined,
                  mode,
                  model: selectedModel,
                  fileStructure: Array.from(selectedFiles).join('\n')
                }),
              });

              if (!response.ok) {
                setDocStatus(prev => prev.map(s => 
                  s.filePath === filePath ? { ...s, status: 'error', error: 'Failed to generate' } : s
                ));
                throw new Error(`Failed to generate documentation for ${filePath}`);
              }

              await processStreamingResponse(response, filePath, setDocumentation, debouncedUpdateRef);

              setDocStatus(prev => prev.map(s => {
                if (s.filePath === filePath) {
                  return { ...s, status: 'completed' };
                }
                if (nextFilePath && s.filePath === nextFilePath) {
                  return { ...s, status: 'generating' };
                }
                return s;
              }));
            }
          } catch (err) {
            setDocStatus(prev => prev.map(s => 
              s.filePath === filePath ? { ...s, status: 'error', error: err instanceof Error ? err.message : 'Failed' } : s
            ));
          }
        }
      }
    } catch (err) {
      console.error('Error generating documentation:', err);
    } finally {
      setGeneratingDocs(false);
    }
  };

  return {
    documentation,
    docStatus,
    generatingDocs,
    handleGenerateDocumentation,
    expandedDocs,
    setExpandedDocs
  };
}

// Helper functions for useDocumentation

async function getAllSelectedFilesContent(structure: DirectoryNode[], selectedFiles: Set<string>) {
  const contents: string[] = [];
  for (const filePath of selectedFiles) {
    const node = findNodeByPath(structure, filePath);
    if (node && node.type === "file" && node.fileHandle) {
      const file = await node.fileHandle.getFile();
      const text = await file.text();
      contents.push(`
=== FILE: ${filePath} ===
${text}
=== END FILE ===
`);
    }
  }
  return contents.join('\n\n');
}

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

async function processStreamingResponse(
  response: Response,
  filePath: string,
  setDocumentation: React.Dispatch<React.SetStateAction<DocumentationResult[]>>,
  debouncedUpdateRef: React.MutableRefObject<NodeJS.Timeout | null>
) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('No reader available');

  const decoder = new TextDecoder();
  let documentationContent = '';

  const updateDocumentation = (content: string, usage?: TokenUsage) => {
    setDocumentation(prev => {
      const updatedDocs = [...prev];
      const existingIndex = updatedDocs.findIndex(d => d.filePath === filePath);
      if (existingIndex >= 0) {
        updatedDocs[existingIndex] = {
          ...updatedDocs[existingIndex],
          content,
          usage: usage || updatedDocs[existingIndex].usage
        };
      } else {
        updatedDocs.push({ 
          filePath, 
          content,
          usage 
        });
      }
      return updatedDocs;
    });
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(5).trim();
        if (!data || data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'content') {
            documentationContent += parsed.content;
            if (debouncedUpdateRef.current) {
              clearTimeout(debouncedUpdateRef.current);
            }
            debouncedUpdateRef.current = setTimeout(() => {
              updateDocumentation(documentationContent);
            }, 100);
          } else if (parsed.type === 'usage') {
            updateDocumentation(documentationContent, parsed.usage);
          }
        } catch (e) {
          console.error('Error parsing chunk:', e);
        }
      }
    }
  }

  if (debouncedUpdateRef.current) {
    clearTimeout(debouncedUpdateRef.current);
  }
}
