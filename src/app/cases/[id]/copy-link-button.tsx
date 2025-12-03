"use client";

import { useState, useEffect } from "react";

export function CopyLinkButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const [link, setLink] = useState("");

  useEffect(() => {
    // Set link only on client side to avoid hydration mismatch
    setLink(`${window.location.origin}/enter/${token}`);
  }, [token]);

  const handleCopy = () => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!link) {
      return <div className="h-10 bg-gray-100 rounded-md animate-pulse w-full max-w-md"></div>;
  }

  return (
    <div className="flex gap-2 w-full max-w-md">
      <input 
        readOnly 
        value={link} 
        className="flex-1 bg-gray-50 border rounded-md px-3 py-2 text-gray-600 font-mono text-sm truncate"
        onClick={(e) => e.currentTarget.select()}
      />
      <button
        onClick={handleCopy}
        className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 whitespace-nowrap transition-colors"
      >
        {copied ? "복사됨" : "링크 복사"}
      </button>
    </div>
  );
}
