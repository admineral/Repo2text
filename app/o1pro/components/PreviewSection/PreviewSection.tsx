"use client";

import React, { useEffect, useState } from "react";
import { countTokens } from "../../utils/tokenizer";

interface PreviewSectionProps {
  previewContent: string;
  onCopy: () => void;
  onDownload: () => void;
}

export function PreviewSection({ 
  previewContent, 
  onCopy, 
  onDownload
}: PreviewSectionProps) {
  const [tokenCount, setTokenCount] = useState<number>(0);
  const wordCount = previewContent ? previewContent.trim().split(/\s+/).length : 0;

  useEffect(() => {
    if (previewContent) {
      const count = countTokens(previewContent);
      setTokenCount(count);
    } else {
      setTokenCount(0);
    }
  }, [previewContent]);

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">Preview</h2>
        <div className="flex gap-4 text-sm text-gray-400">
          <span>{wordCount.toLocaleString()} words</span>
          <span>{tokenCount.toLocaleString()} tokens</span>
        </div>
      </div>
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
