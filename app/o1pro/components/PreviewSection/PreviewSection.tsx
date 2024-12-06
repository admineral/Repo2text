"use client";

import React from "react";

interface PreviewSectionProps {
  previewContent: string;
  onCopy: () => void;
  onDownload: () => void;
}

export function PreviewSection({ previewContent, onCopy, onDownload }: PreviewSectionProps) {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-2">Preview</h2>
      <textarea
        className="w-full h-64 p-2 text-gray-200 bg-gray-800 border border-gray-700 rounded-md"
        readOnly
        value={previewContent}
      />
      <div className="flex gap-4 mt-4">
        <button
          onClick={onCopy}
          className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-md text-gray-200"
        >
          Copy to Clipboard
        </button>
        <button
          onClick={onDownload}
          className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-md text-white"
        >
          Download TXT
        </button>
      </div>
    </div>
  );
}
