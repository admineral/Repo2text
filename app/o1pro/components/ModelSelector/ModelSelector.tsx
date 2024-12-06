"use client";

import React from "react";

interface ModelPricing {
  name: string;
  inputPrice: number;
  outputPrice: number;
  description: string;
}

interface ModelSelectorProps {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  MODEL_PRICES: { [key: string]: ModelPricing };
  onChangeFolder: () => void;
  error: string|null;
}

export function ModelSelector({ selectedModel, setSelectedModel, MODEL_PRICES, onChangeFolder, error }: ModelSelectorProps) {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-4 w-full">
          <div className="flex justify-between items-center">
            <p className="text-gray-300">
              Select files or folders to include in the generated text file.
            </p>
            <button
              onClick={onChangeFolder}
              className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-md text-gray-200"
            >
              Change Folder
            </button>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-300">Model:</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-44 px-2 py-0.5 bg-gray-800 border border-gray-700 rounded-md 
                text-xs text-gray-200 cursor-pointer hover:border-gray-600 
                focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                appearance-none pr-6"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4-7 7'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.25rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1em 1em'
              }}
            >
              {Object.entries(MODEL_PRICES).map(([id, model]) => (
                <option 
                  key={id} 
                  value={id}
                  className="bg-gray-800 text-gray-200 text-xs"
                >
                  {model.name}
                </option>
              ))}
            </select>
            <span className="text-xs text-gray-400">
              ${MODEL_PRICES[selectedModel].inputPrice}/1M in, ${MODEL_PRICES[selectedModel].outputPrice}/1M out
            </span>
            <span className="text-xs text-gray-400 italic">
              {MODEL_PRICES[selectedModel].description}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
    </>
  );
}
