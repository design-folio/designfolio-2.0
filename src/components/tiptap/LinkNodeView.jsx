import React, { useState, useEffect, startTransition } from "react";
import { NodeViewWrapper } from "@tiptap/react";

const LinkNodeView = ({ node, updateAttributes, deleteNode, editor }) => {
  const isEditable = editor?.isEditable ?? false;
  const [isEditing, setIsEditing] = useState(isEditable && !node.attrs.href);
  const [href, setHref] = useState(node.attrs.href || "");
  const [text, setText] = useState(node.attrs.text || "");

  useEffect(() => {
    if (isEditable && !node.attrs.href) {
      startTransition(() => setIsEditing(true));
    }
  }, [isEditable, node.attrs.href]);

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
        .deleteNode("linkNode")
        .insertContent({
          type: "text",
          text: linkText,
          marks: [{ type: "link", attrs: { href: href.trim() } }],
        })
        .run();
    }
  };

  const handleCancel = () => {
    deleteNode();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  if (!isEditing && node.attrs.href) {
    return (
      <NodeViewWrapper>
        <div className="relative my-3 inline-block">
          <a
            href={node.attrs.href}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer text-blue-500 underline hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {node.attrs.text || node.attrs.href}
          </a>
          {isEditable && (
            <button
              onClick={() => setIsEditing(true)}
              className="absolute -top-1 -right-6 cursor-pointer rounded bg-blue-500 px-2 py-0.5 text-xs text-white transition-colors hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Edit
            </button>
          )}
        </div>
      </NodeViewWrapper>
    );
  }

  if (!isEditable) {
    return (
      <NodeViewWrapper>
        <a
          href={node.attrs.href}
          target="_blank"
          rel="noopener noreferrer"
          className="my-3 inline-block cursor-pointer text-blue-500 underline hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {node.attrs.text || node.attrs.href}
        </a>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper>
      <div
        className="my-3 rounded-lg border border-slate-200 bg-slate-50 p-4 select-none dark:border-slate-700 dark:bg-slate-900"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-3">
          <input
            type="url"
            value={href}
            onChange={(e) => setHref(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter URL (e.g., https://example.com)"
            autoFocus
            className="mb-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 select-text focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-slate-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-blue-600"
            onMouseDown={(e) => e.stopPropagation()}
          />
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Link text (optional)"
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 select-text focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-slate-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-blue-600"
            onMouseDown={(e) => e.stopPropagation()}
          />
          <div
            className="mt-1 text-xs text-slate-600 dark:text-slate-400"
            onMouseDown={(e) => e.stopPropagation()}
          >
            Press Ctrl+Enter to save, Esc to cancel
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!href.trim()}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              href.trim()
                ? "cursor-pointer bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                : "cursor-not-allowed bg-slate-400 text-white dark:bg-slate-700"
            }`}
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="cursor-pointer rounded-md bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export default LinkNodeView;
