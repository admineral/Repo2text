"use client";

import React, { useState, useRef } from 'react';
import { useDirectory } from '../o1pro/hooks/useDirectory';
import { DirectoryTree } from '../o1pro/components/DirectoryExplorer/DirectoryTree';
import JSZip from 'jszip';

const DEFAULT_PROMPT = `Generate comprehensive MDX documentation for this codebase. Include:
1. Project Overview
2. Architecture Overview
3. Component Documentation
4. API Documentation (if any)
5. Setup Instructions
6. Usage Examples
7. Code Examples with explanations
Format the output in clean, well-structured MDX with proper headings, code blocks, and markdown features.`;

export default function MDXGeneratorPage() {
  const {
    structure,
    selectedFiles,
    loading,
    handleFolderSelect,
    handleSelectChange,
    MODEL_PRICES,
    selectedModel,
    setSelectedModel
  } = useDirectory();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [mdxPreview, setMdxPreview] = useState<string>('');
  const [selectedFilesContent, setSelectedFilesContent] = useState<{ [key: string]: string }>({});

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setProgress('Reading files...');
    const fileContents: { [key: string]: string } = {};

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const content = await file.text();
        fileContents[file.name] = content;
      } catch (error) {
        console.error(`Error reading file ${file.name}:`, error);
      }
    }

    setSelectedFilesContent(fileContents);
    setProgress('');
  };

  const handleGenerateMDX = async () => {
    if (Object.keys(selectedFilesContent).length === 0) {
      alert("Please select at least one file!");
      return;
    }

    setGenerating(true);
    setProgress('Preparing files...');
    setMdxPreview('');

    try {
      // Format the files content
      const contents = Object.entries(selectedFilesContent).map(([filename, content]) => `
=== FILE: ${filename} ===
${content}
=== END FILE ===
`);

      const allFilesContent = contents.join('\n\n');
      setProgress('Generating MDX documentation...');

      // Send to OpenAI API for MDX generation
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: allFilesContent,
          mode: 'mdx-generation',
          model: selectedModel,
          fileStructure: Object.keys(selectedFilesContent).join('\n'),
          prompt: prompt
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate MDX documentation');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let mdxContent = '';

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
                mdxContent += parsed.content;
                setMdxPreview(mdxContent);
                setProgress('Receiving documentation...');
              }
            } catch (e) {
              console.error('Error parsing chunk:', e);
            }
          }
        }
      }

      setProgress('Documentation generated! You can now download it.');

      // Create download button
      const handleDownload = () => {
        const zip = new JSZip();
        zip.file('documentation.mdx', mdxContent);
        
        zip.generateAsync({ type: 'blob' }).then((zipBlob) => {
          const zipUrl = URL.createObjectURL(zipBlob);
          const a = document.createElement('a');
          a.href = zipUrl;
          a.download = 'project-documentation.zip';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(zipUrl);
        });
      };

      return handleDownload;
    } catch (error) {
      console.error('Error generating MDX:', error);
      setProgress('Error: Failed to generate documentation');
      alert('Failed to generate MDX documentation. Please try again.');
      return null;
    } finally {
      setGenerating(false);
    }
  };

  return (
    <main className="container mx-auto p-6 max-w-4xl bg-gray-900 min-h-screen text-gray-100">
      <h1 className="text-3xl font-bold mb-4 text-white">MDX Documentation Generator</h1>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
            <p className="text-sm text-gray-400">Loading project structure...</p>
          </div>
        </div>
      ) : structure.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700">
          <button
            onClick={handleFolderSelect}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Select Project Folder
          </button>
          <p className="mt-4 text-sm text-gray-400">
            Choose a folder to generate MDX documentation
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Model Selection
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white"
                >
                  {Object.entries(MODEL_PRICES).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.name} - Input: ${value.inputPrice}/1K tokens, Output: ${value.outputPrice}/1K tokens
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  onClick={() => setShowPrompt(!showPrompt)}
                  className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  <svg
                    className={`w-4 h-4 transform transition-transform ${showPrompt ? 'rotate-90' : ''}`}
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
                  Customize Generation Prompt
                </button>
                
                {showPrompt && (
                  <div className="mt-2 p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="w-full h-48 px-3 py-2 bg-gray-900 text-white rounded-md border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter your custom prompt here..."
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        onClick={() => setPrompt(DEFAULT_PROMPT)}
                        className="px-3 py-1 text-sm text-gray-300 hover:text-white transition-colors"
                      >
                        Reset to Default
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-4">
                <h2 className="text-xl font-semibold mb-4">Select Files to Document</h2>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                  className="hidden"
                  accept=".js,.jsx,.ts,.tsx,.md,.mdx,.css,.scss,.json,.html"
                />
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Select Files
                  </button>
                  {Object.keys(selectedFilesContent).length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Selected Files:</h3>
                      <ul className="space-y-1 text-sm text-gray-300">
                        {Object.keys(selectedFilesContent).map((filename) => (
                          <li key={filename} className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {filename}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={handleGenerateMDX}
                  disabled={generating || Object.keys(selectedFilesContent).length === 0}
                  className={`px-6 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2
                    ${generating || Object.keys(selectedFilesContent).length === 0
                      ? 'bg-gray-700 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                >
                  {generating ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generating...
                    </>
                  ) : (
                    'Generate MDX Documentation'
                  )}
                </button>

                {progress && (
                  <div className={`p-4 rounded-lg ${
                    progress.startsWith('Error')
                      ? 'bg-red-900/50 text-red-200'
                      : progress.includes('downloaded')
                        ? 'bg-green-900/50 text-green-200'
                        : 'bg-blue-900/50 text-blue-200'
                  }`}>
                    {progress}
                  </div>
                )}

                <div className="text-sm text-gray-400">
                  Selected: {Object.keys(selectedFilesContent).length} file(s)
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="sticky top-6">
                <h2 className="text-xl font-semibold mb-4">MDX Preview</h2>
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                  <div className="prose prose-invert max-w-none">
                    {mdxPreview ? (
                      <pre className="text-sm overflow-auto max-h-[600px] whitespace-pre-wrap">
                        {mdxPreview}
                      </pre>
                    ) : (
                      <div className="text-gray-400 text-center py-8">
                        Generated MDX content will appear here
                      </div>
                    )}
                  </div>
                </div>
                {mdxPreview && !generating && (
                  <button
                    onClick={() => {
                      const zip = new JSZip();
                      zip.file('documentation.mdx', mdxPreview);
                      
                      zip.generateAsync({ type: 'blob' }).then((zipBlob) => {
                        const zipUrl = URL.createObjectURL(zipBlob);
                        const a = document.createElement('a');
                        a.href = zipUrl;
                        a.download = 'project-documentation.zip';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(zipUrl);
                      });
                    }}
                    className="mt-4 w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download MDX
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

// Helper function to find a node by path
function findNodeByPath(nodes: any[], targetPath: string): any {
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