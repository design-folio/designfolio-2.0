import React, { useState, useEffect, useRef, startTransition } from "react";
import { NodeViewWrapper } from "@tiptap/react";

const YoutubeNodeView = ({ node, updateAttributes, editor, getPos }) => {
  const [isEditing, setIsEditing] = useState(!node.attrs.src);
  const [url, setUrl] = useState(node.attrs.src || "");
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!node.attrs.src) {
      startTransition(() => setIsEditing(true));
    }
  }, [node.attrs.src]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [isEditing]);

  const handleSave = () => {
    if (url.trim()) {
      updateAttributes({ src: url.trim() });
      setIsEditing(false);
    } else {
      handleCancel();
    }
  };

  const handleCancel = () => {
    const pos = getPos();
    if (typeof pos === "number") {
      const tr = editor.state.tr.delete(pos, pos + node.nodeSize);
      editor.view.dispatch(tr);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      handleCancel();
    }
  };

  const extractVideoId = (url) => {
    if (!url) return null;

    // Match various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const videoId = extractVideoId(node.attrs.src);

  // Show editing form
  if (isEditing) {
    return (
      <NodeViewWrapper as="div" className="youtube-tool">
        <div
          ref={wrapperRef}
          contentEditable={false}
          className="my-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900"
          onClick={(e) => {
            e.stopPropagation();
            if (inputRef.current && e.target !== inputRef.current) {
              inputRef.current.focus();
            }
          }}
        >
          <div className="mb-3">
            <input
              ref={inputRef}
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter YouTube URL"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              autoFocus
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-slate-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-blue-600"
            />
            <div
              className="mt-2 text-xs text-slate-600 dark:text-slate-400"
              onClick={(e) => e.stopPropagation()}
            >
              <strong>Supported formats:</strong>
              <ul className="mt-1 list-disc pl-5">
                <li>https://www.youtube.com/watch?v=VIDEO_ID</li>
                <li>https://youtu.be/VIDEO_ID</li>
                <li>https://www.youtube.com/embed/VIDEO_ID</li>
              </ul>
              Press Enter to save, Esc to cancel
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              disabled={!url.trim()}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                url.trim()
                  ? "cursor-pointer bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                  : "cursor-not-allowed bg-slate-400 text-white dark:bg-slate-700"
              }`}
            >
              Save
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleCancel();
              }}
              className="cursor-pointer rounded-md bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

  // Show YouTube embed
  return (
    <NodeViewWrapper className="youtube-tool">
      <div className="relative my-4">
        {videoId ? (
          <iframe
            className="aspect-video w-full rounded-lg"
            src={`https://www.youtube-nocookie.com/embed/${videoId}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="YouTube Video"
          />
        ) : (
          <div className="flex h-[450px] w-full items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            No valid YouTube URL provided.
          </div>
        )}
        {editor.isEditable && (
          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-2 right-2 cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Edit
          </button>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export default YoutubeNodeView;
