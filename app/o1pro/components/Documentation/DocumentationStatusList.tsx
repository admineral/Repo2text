"use client";

import React, { useEffect, useState } from "react";
import { calculateCost } from "./utils";

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

interface ModelPricing {
  name: string;
  inputPrice: number;
  outputPrice: number;
  description: string;
}

interface DocumentationStatusListProps {
  status: DocumentationStatus[];
  documentation: DocumentationResult[];
  selectedModel: string;
  modelPrices: { [key: string]: ModelPricing };
}

interface DocumentationSummary {
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  totalCost: number;
}

export function DocumentationStatusList({ status, documentation, selectedModel, modelPrices }: DocumentationStatusListProps) {
  const [summary, setSummary] = useState<DocumentationSummary>({
    totalPromptTokens: 0,
    totalCompletionTokens: 0,
    totalTokens: 0,
    totalCost: 0
  });

  useEffect(() => {
    const newSummary = documentation.reduce((acc, doc) => {
      if (doc.usage) {
        acc.totalPromptTokens += doc.usage.promptTokens;
        acc.totalCompletionTokens += doc.usage.completionTokens;
        acc.totalTokens += doc.usage.totalTokens;
        const cost = calculateCost(doc.usage, selectedModel, modelPrices);
        acc.totalCost += cost;
      }
      return acc;
    }, {
      totalPromptTokens: 0,
      totalCompletionTokens: 0,
      totalTokens: 0,
      totalCost: 0
    } as DocumentationSummary);

    setSummary(newSummary);
  }, [documentation, selectedModel, modelPrices]);

  const renderStatusTree = (items: DocumentationStatus[]) => {
    return items.map((item) => (
      <div 
        key={item.filePath}
        className="flex items-center gap-2 py-1 font-mono"
      >
        {item.status === 'pending' && (<span className="w-4 h-4 text-gray-400">○</span>)}
        {item.status === 'generating' && (
          <span className="w-4 h-4">
            <svg className="animate-spin text-yellow-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
                   5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 
                   7.938l3-2.647z" />
            </svg>
          </span>
        )}
        {item.status === 'completed' && (
          <span className="w-4 h-4 text-green-500">✓</span>
        )}
        {item.status === 'error' && (
          <span className="w-4 h-4 text-red-500">×</span>
        )}
        <span className={`${
          item.status === 'pending' ? 'text-gray-400' :
          item.status === 'generating' ? 'text-yellow-200' :
          item.status === 'completed' ? 'text-green-200' :
          'text-red-200'
        }`}>
          {item.filePath}
        </span>
        {item.error && (
          <span className="text-xs text-red-400 ml-2">
            ({item.error})
          </span>
        )}
      </div>
    ));
  };

  return (
    <div className="mt-4 bg-gray-800 border border-gray-700 rounded-md overflow-hidden">
      <div className="px-4 py-2 bg-gray-700">
        <h3 className="text-sm font-medium text-gray-200">Generation Progress</h3>
      </div>
      <div className="p-4 font-mono">
        {renderStatusTree(status)}
      </div>
      {summary.totalTokens > 0 && (
        <div className="mt-2 px-4 py-3 bg-gray-700/50 border-t border-gray-700">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Generation Summary</h4>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Input Tokens:</span>
              <span className="text-gray-200">{summary.totalPromptTokens.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Output Tokens:</span>
              <span className="text-gray-200">{summary.totalCompletionTokens.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Tokens:</span>
              <span className="text-gray-200">{summary.totalTokens.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Cost:</span>
              <span className="text-green-400">${summary.totalCost.toFixed(6)}</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Using {modelPrices[selectedModel].name} (${modelPrices[selectedModel].inputPrice}/1M input, ${modelPrices[selectedModel].outputPrice}/1M output)
          </div>
        </div>
      )}
    </div>
  );
}
