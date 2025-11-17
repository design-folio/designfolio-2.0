import { NodeViewWrapper } from '@tiptap/react';
import { useState, useEffect } from 'react';

export default function FigmaNodeView({ node, updateAttributes, deleteNode, editor }) {
  const [isEditing, setIsEditing] = useState(!node.attrs.embedCode);
  const [embedCode, setEmbedCode] = useState(node.attrs.embedCode || '');

  const extractSrc = (code) => {
    const srcRegex = /src="([^"]*)"/;
    const match = srcRegex.exec(code);
    return match ? match[1] : code;
  };

  const handleSave = () => {
    if (embedCode.trim()) {
      updateAttributes({ embedCode: embedCode.trim() });
      setIsEditing(false);
    } else {
      deleteNode();
    }
  };

  useEffect(() => {
    if (!node.attrs.embedCode) {
      setIsEditing(true);
    }
  }, [node.attrs.embedCode]);

  if (isEditing) {
    return (
      <NodeViewWrapper className="figma-tool">
        <div className="border-2 border-blue-500 dark:border-blue-600 rounded-lg p-4 my-4 bg-slate-50 dark:bg-slate-900">
          <textarea
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md text-sm font-mono resize-y bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 mb-3"
            placeholder="Paste your Figma embed code here.  Click share on Figma > Click Get embed code > Copy and paste."
            value={embedCode}
            onChange={(e) => setEmbedCode(e.target.value)}
            rows={6}
          />
          <div className="flex gap-2">
            <button 
              onClick={handleSave} 
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md text-sm font-medium cursor-pointer transition-colors"
            >
              Save
            </button>
            <button 
              onClick={deleteNode} 
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-sm font-medium cursor-pointer transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

  const src = extractSrc(node.attrs.embedCode);

  return (
    <NodeViewWrapper className="figma-tool">
      <div className="relative my-4">
        {src ? (
          <iframe
            className="w-full max-w-[800px] h-[450px] border border-gray-200 dark:border-gray-700 rounded-lg"
            src={src}
            allowFullScreen
            title="Figma Embed"
          />
        ) : (
          <div className="w-full h-[450px] bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400">
            No Figma URL provided.
          </div>
        )}
        {editor.isEditable && (
          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-2 right-2 px-3 py-1.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium cursor-pointer shadow-sm transition-colors"
          >
            Edit
          </button>
        )}
      </div>
    </NodeViewWrapper>
  );
}
