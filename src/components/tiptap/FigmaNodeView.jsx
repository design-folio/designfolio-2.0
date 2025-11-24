import { NodeViewWrapper } from "@tiptap/react";
import { useState, useEffect, useRef } from "react";

export default function FigmaNodeView({
  node,
  updateAttributes,
  editor,
  getPos,
}) {
  const [isEditing, setIsEditing] = useState(!node.attrs.embedCode);
  const [embedCode, setEmbedCode] = useState(node.attrs.embedCode || "");
  const textareaRef = useRef(null);
  const wrapperRef = useRef(null);

  const extractSrc = (code) => {
    const srcRegex = /src="([^"]*)"/;
    const match = srcRegex.exec(code);
    return match ? match[1] : code;
  };

  const handleDelete = () => {
    const pos = getPos();
    if (typeof pos === "number") {
      const tr = editor.state.tr.delete(pos, pos + node.nodeSize);
      editor.view.dispatch(tr);
    }
  };

  const handleSave = () => {
    if (embedCode.trim()) {
      updateAttributes({ embedCode: embedCode.trim() });
      setIsEditing(false);
    } else {
      handleDelete();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      handleDelete();
    }
  };

  useEffect(() => {
    if (!node.attrs.embedCode) {
      setIsEditing(true);
    }
  }, [node.attrs.embedCode]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <NodeViewWrapper as="div" className="figma-tool">
        <div
          ref={wrapperRef}
          contentEditable={false}
          className="rounded-lg p-4 my-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
          onClick={(e) => {
            e.stopPropagation();
            if (textareaRef.current && e.target !== textareaRef.current) {
              textareaRef.current.focus();
            }
          }}
        >
          <textarea
            ref={textareaRef}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md text-sm font-mono resize-y bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
            placeholder="Paste your Figma embed code here"
            value={embedCode}
            onChange={(e) => setEmbedCode(e.target.value)}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            autoFocus
            rows={6}
          />
          <div
            className="text-xs text-slate-600 dark:text-slate-400 mt-2 mb-3"
            onClick={(e) => e.stopPropagation()}
          >
            <strong>Instructions:</strong>
            <ul className="mt-1 pl-5 list-disc">
              <li>Click Share on Figma</li>
              <li>Click Get embed code</li>
              <li>Copy and paste here</li>
            </ul>
            <div className="mt-2">Press Ctrl+Enter to save, Esc to cancel</div>
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
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md text-sm font-medium cursor-pointer transition-colors"
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
                handleDelete();
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

  const src = extractSrc(node.attrs.embedCode);

  return (
    <NodeViewWrapper className="figma-tool">
      <div className="relative my-4">
        {src ? (
          <iframe
            className="w-full h-[450px] border border-gray-200 dark:border-gray-700 rounded-lg"
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
