"use client";

import React from "react";

interface ProjectActionsProps {
  selectedFiles: Set<string>;
  downloading: boolean;
  generatingDocs: boolean;
  handleGenerate: () => void;
  handleGenerateDocumentation: (mode: 'single' | 'single-with-context' | 'combined-readme') => void;
}

export function ProjectActions({ 
  selectedFiles, 
  downloading, 
  generatingDocs, 
  handleGenerate, 
  handleGenerateDocumentation 
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
    </div>
  );
}
