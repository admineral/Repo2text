"use client";

import React from "react";
import { getContentPreview, calculateCost } from "./utils";

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

interface ModelPricing {
  name: string;
  inputPrice: number;
  outputPrice: number;
  description: string;
}

interface DocumentationCardProps {
  doc: DocumentationResult;
  selectedModel: string;
  expanded: boolean;
  onToggle: () => void;
  modelPrices: { [key: string]: ModelPricing };
}

export function DocumentationCard({ doc, selectedModel, expanded, onToggle, modelPrices }: DocumentationCardProps) {
  const isGenerating = doc.content === 'Generating documentation...';

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-md overflow-hidden">
      <div className="bg-gray-700 px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <svg
              className={`w-4 h-4 transform transition-transform ${expanded ? 'rotate-90' : ''}`}
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
          <h3 className="text-sm font-medium text-gray-200">{doc.filePath}</h3>
        </div>
        <div className="flex items-center gap-4">
          {doc.usage && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>Tokens: {doc.usage.totalTokens}</span>
              <span>&bull;</span>
              <span>Cost: ${calculateCost(doc.usage, selectedModel, modelPrices).toFixed(6)}</span>
            </div>
          )}
          {!isGenerating && (
            <button
              onClick={() => navigator.clipboard.writeText(doc.content)}
              className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded text-gray-200"
            >
              Copy
            </button>
          )}
        </div>
      </div>
      <div className={`transition-all duration-200 ${expanded ? 'p-4' : 'p-2'}`}>
        {isGenerating ? (
          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Generating documentation...</span>
          </div>
        ) : (
          <pre className={`whitespace-pre-wrap text-gray-200 font-mono text-sm ${
            expanded ? '' : 'line-clamp-2'
          }`}>
            {expanded ? doc.content : getContentPreview(doc.content)}
          </pre>
        )}
        {!isGenerating && !expanded && doc.content.length > 150 && (
          <button
            onClick={onToggle}
            className="mt-1 text-xs text-blue-400 hover:text-blue-300"
          >
            Show more...
          </button>
        )}
      </div>
    </div>
  );
}
