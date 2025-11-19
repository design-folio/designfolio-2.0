import React, { useState, useEffect } from 'react';
import { NodeViewWrapper } from '@tiptap/react';

const YoutubeNodeView = ({ node, updateAttributes, deleteNode, editor }) => {
  const [isEditing, setIsEditing] = useState(!node.attrs.src);
  const [url, setUrl] = useState(node.attrs.src || '');

  useEffect(() => {
    if (!node.attrs.src) {
      setIsEditing(true);
    }
  }, [node.attrs.src]);

  const handleSave = () => {
    if (url.trim()) {
      // Replace this node with actual YouTube embed
      editor
        .chain()
        .focus()
        .deleteNode('youtubeNode')
        .setYoutubeVideo({ src: url.trim() })
        .run();
    }
  };

  const handleCancel = () => {
    deleteNode();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <NodeViewWrapper>
      <div className="rounded-lg p-4 my-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 select-none" onMouseDown={(e) => e.stopPropagation()}>
        <div className="mb-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter YouTube URL"
            autoFocus
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 select-text"
            onMouseDown={(e) => e.stopPropagation()}
          />
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-2" onMouseDown={(e) => e.stopPropagation()}>
            <strong>Supported formats:</strong>
            <ul className="mt-1 pl-5 list-disc">
              <li>https://www.youtube.com/watch?v=VIDEO_ID</li>
              <li>https://youtu.be/VIDEO_ID</li>
              <li>https://www.youtube.com/embed/VIDEO_ID</li>
            </ul>
            Press Enter to save, Esc to cancel
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!url.trim()}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              url.trim()
                ? 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white cursor-pointer'
                : 'bg-slate-400 dark:bg-slate-700 text-white cursor-not-allowed'
            }`}
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-sm font-medium cursor-pointer transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export default YoutubeNodeView;
