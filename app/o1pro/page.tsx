"use client";

import React from "react";
import { useDirectory } from "./hooks/useDirectory";
import { useFilePreview } from "./hooks/useFilePreview";
import { useDocumentation } from "./hooks/useDocumentation";

import { ModelSelector } from "./components/ModelSelector/ModelSelector";
import { DirectoryTree } from "./components/DirectoryExplorer/DirectoryTree";
import { ProjectActions } from "./components/ProjectActions/ProjectActions";
import { DocumentationStatusList } from "./components/Documentation/DocumentationStatusList";
import { DocumentationCard } from "./components/Documentation/DocumentationCard";
import { PreviewSection } from "./components/PreviewSection/PreviewSection";

export default function Page() {
  const {
    structure,
    selectedFiles,
    loading,
    error,
    handleFolderSelect,
    handleSelectChange,
    MODEL_PRICES,
    selectedModel,
    setSelectedModel
  } = useDirectory();

  const {
    previewContent,
    downloading,
    handleGenerate,
    handleCopyToClipboard,
    handleDownload
  } = useFilePreview(structure, selectedFiles);

  const {
    documentation,
    docStatus,
    generatingDocs,
    handleGenerateDocumentation,
    expandedDocs,
    setExpandedDocs
  } = useDocumentation(structure, selectedFiles, selectedModel);

  return (
    <main className="container mx-auto p-6 max-w-4xl bg-gray-900 min-h-screen text-gray-100">
      <h1 className="text-3xl font-bold mb-4 text-white">Repository File Selector</h1>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
            <p className="text-sm text-gray-400">Importing repository structure...</p>
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
            Choose a folder to view its structure
          </p>
        </div>
      ) : (
        <>
          <ModelSelector
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            MODEL_PRICES={MODEL_PRICES}
            onChangeFolder={handleFolderSelect}
            error={error}
          />

          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-4">
            <DirectoryTree
              nodes={structure}
              selectedFiles={selectedFiles}
              onSelectChange={handleSelectChange}
            />
          </div>

          <ProjectActions
            selectedFiles={selectedFiles}
            downloading={downloading}
            generatingDocs={generatingDocs}
            handleGenerate={handleGenerate}
            handleGenerateDocumentation={handleGenerateDocumentation}
          />

          {docStatus.length > 0 && (
            <DocumentationStatusList
              status={docStatus}
              documentation={documentation}
              selectedModel={selectedModel}
              modelPrices={MODEL_PRICES}
            />
          )}

          {documentation.length > 0 && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-white">Documentation</h2>
                  <button
                    onClick={() => {
                      if (expandedDocs.size === documentation.length) {
                        setExpandedDocs(new Set());
                      } else {
                        setExpandedDocs(new Set(documentation.map(doc => doc.filePath)));
                      }
                    }}
                    className="text-sm text-gray-400 hover:text-gray-200"
                  >
                    {expandedDocs.size === documentation.length ? 'Collapse All' : 'Expand All'}
                  </button>
                </div>
                <div className="text-sm text-gray-400">
                  Using {MODEL_PRICES[selectedModel].name}
                </div>
              </div>
              <div className="space-y-4">
                {documentation.map((doc) => (
                  <DocumentationCard
                    key={doc.filePath}
                    doc={doc}
                    selectedModel={selectedModel}
                    expanded={expandedDocs.has(doc.filePath)}
                    onToggle={() => {
                      setExpandedDocs(prev => {
                        const newSet = new Set(prev);
                        if (newSet.has(doc.filePath)) {
                          newSet.delete(doc.filePath);
                        } else {
                          newSet.add(doc.filePath);
                        }
                        return newSet;
                      });
                    }}
                    modelPrices={MODEL_PRICES}
                  />
                ))}
              </div>
            </div>
          )}

          {previewContent && (
            <PreviewSection
              previewContent={previewContent}
              onCopy={handleCopyToClipboard}
              onDownload={handleDownload}
            />
          )}
        </>
      )}
    </main>
  );
}
