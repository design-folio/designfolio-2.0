import React, { useState, useEffect } from 'react';
import { NodeViewWrapper } from '@tiptap/react';

const LinkNodeView = ({ node, updateAttributes, deleteNode, editor }) => {
  const [isEditing, setIsEditing] = useState(!node.attrs.href);
  const [href, setHref] = useState(node.attrs.href || '');
  const [text, setText] = useState(node.attrs.text || '');

  useEffect(() => {
    if (!node.attrs.href) {
      setIsEditing(true);
    }
  }, [node.attrs.href]);

  const handleSave = () => {
    if (href.trim()) {
      updateAttributes({
        href: href.trim(),
        text: text.trim() || href.trim(),
      });
      
      // Replace this node with actual link
      const linkText = text.trim() || href.trim();
      editor
        .chain()
        .focus()
        .deleteNode('linkNode')
        .insertContent({
          type: 'text',
          text: linkText,
          marks: [{ type: 'link', attrs: { href: href.trim() } }],
        })
        .run();
    }
  };

  const handleCancel = () => {
    deleteNode();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  if (!isEditing && node.attrs.href) {
    return (
      <NodeViewWrapper>
        <div className="relative inline-block my-3">
          <a 
            href={node.attrs.href} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 dark:text-blue-400 underline cursor-pointer hover:text-blue-600 dark:hover:text-blue-300"
          >
            {node.attrs.text || node.attrs.href}
          </a>
          <button
            onClick={() => setIsEditing(true)}
            className="absolute -top-1 -right-6 bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white rounded px-2 py-0.5 text-xs cursor-pointer transition-colors"
          >
            Edit
          </button>
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper>
      <div className="border-2 border-blue-500 dark:border-blue-600 rounded-lg p-4 my-3 bg-slate-50 dark:bg-slate-900">
        <div className="mb-3">
          <input
            type="url"
            value={href}
            onChange={(e) => setHref(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter URL (e.g., https://example.com)"
            autoFocus
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 mb-2"
          />
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Link text (optional)"
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
          />
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Press Ctrl+Enter to save, Esc to cancel
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!href.trim()}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              href.trim()
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

export default LinkNodeView;
