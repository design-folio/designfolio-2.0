import React, { useState, useEffect, useRef } from "react";
import { NodeViewWrapper } from "@tiptap/react";

const YoutubeNodeView = ({ node, updateAttributes, editor, getPos }) => {
  const [isEditing, setIsEditing] = useState(!node.attrs.src);
  const [url, setUrl] = useState(node.attrs.src || "");
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!node.attrs.src) {
      setIsEditing(true);
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
          className="rounded-lg p-4 my-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
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
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
            />
            <div
              className="text-xs text-slate-600 dark:text-slate-400 mt-2"
              onClick={(e) => e.stopPropagation()}
            >
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
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              disabled={!url.trim()}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                url.trim()
                  ? "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white cursor-pointer"
                  : "bg-slate-400 dark:bg-slate-700 text-white cursor-not-allowed"
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
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-sm font-medium cursor-pointer transition-colors"
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
            className="w-full aspect-video rounded-lg"
            src={`https://www.youtube-nocookie.com/embed/${videoId}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="YouTube Video"
          />
        ) : (
          <div className="w-full h-[450px] bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400">
            No valid YouTube URL provided.
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
};

export default YoutubeNodeView;
