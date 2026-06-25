import { useState } from 'react';

export default function VSCodeWindow({ userId, iframeUrl = "https://vscode-lomq.onrender.com" }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="w-full h-full bg-[#1e1e1e] relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1e1e1e]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <div className="text-sm text-gray-400">Loading VS Code...</div>
          </div>
        </div>
      )}
      <iframe
        src={iframeUrl}
        className="w-full h-full border-0"
        title="Visual Studio Code"
        allow="clipboard-read; clipboard-write"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}