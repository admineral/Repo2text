"use client";

import React from "react";

interface ProjectActionsProps {
  selectedFiles: Set<string>;
  downloading: boolean;
  generatingDocs: boolean;
  handleGenerate: () => void;
  handleGenerateDocumentation: (mode: 'single' | 'single-with-context' | 'combined-readme') => void;
  generateMDXDownload: () => void;
}

export function ProjectActions({ 
  selectedFiles, 
  downloading, 
  generatingDocs, 
  handleGenerate, 
  handleGenerateDocumentation, 
  generateMDXDownload 
}: ProjectActionsProps) {
  return (
    <div className="mt-6 flex items-center gap-4">
      <button
        onClick={handleGenerate}
        disabled={downloading || selectedFiles.size === 0}
        className={`px-6 py-2 rounded-md text-white font-medium
          ${downloading || selectedFiles.size === 0
            ? 'bg-gray-700 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
          }`}
      >
        {downloading ? "Generating..." : "Generate Text File"}
      </button>

      <div className="flex gap-2">
        <button
          onClick={() => handleGenerateDocumentation('single')}
          disabled={generatingDocs || selectedFiles.size === 0}
          className={`px-6 py-2 rounded-md text-white font-medium
            ${generatingDocs || selectedFiles.size === 0
              ? 'bg-gray-700 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
            }`}
        >
          {generatingDocs ? "Generating..." : "Generate Docs (Single)"}
        </button>

        <button
          onClick={() => handleGenerateDocumentation('single-with-context')}
          disabled={generatingDocs || selectedFiles.size === 0}
          className={`px-6 py-2 rounded-md text-white font-medium
            ${generatingDocs || selectedFiles.size === 0
              ? 'bg-gray-700 cursor-not-allowed'
              : 'bg-yellow-600 hover:bg-yellow-700'
            }`}
        >
          {generatingDocs ? "Generating..." : "Generate Docs (With Context)"}
        </button>

        <button
          onClick={() => handleGenerateDocumentation('combined-readme')}
          disabled={generatingDocs || selectedFiles.size === 0}
          className={`px-6 py-2 rounded-md text-white font-medium
            ${generatingDocs || selectedFiles.size === 0
              ? 'bg-gray-700 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
        >
          {generatingDocs ? "Generating..." : "Generate README"}
        </button>
      </div>

      <span className="text-sm text-gray-400">
        {selectedFiles.size} file(s) selected
      </span>

      {selectedFiles.size > 0 && (
        <button
          onClick={generateMDXDownload}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center gap-2"
          disabled={!selectedFiles.size}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Download MDX
        </button>
      )}
    </div>
  );
}
