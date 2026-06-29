import { NodeViewWrapper } from "@tiptap/react";
import { useState, useEffect, useRef, startTransition } from "react";

export default function FigmaNodeView({ node, updateAttributes, editor, getPos }) {
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
      startTransition(() => setIsEditing(true));
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
          className="my-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900"
          onClick={(e) => {
            e.stopPropagation();
            if (textareaRef.current && e.target !== textareaRef.current) {
              textareaRef.current.focus();
            }
          }}
        >
          <textarea
            ref={textareaRef}
            className="w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-slate-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-blue-600"
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
            className="mt-2 mb-3 text-xs text-slate-600 dark:text-slate-400"
            onClick={(e) => e.stopPropagation()}
          >
            <strong>Instructions:</strong>
            <ul className="mt-1 list-disc pl-5">
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
              className="cursor-pointer rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
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
              className="cursor-pointer rounded-md bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
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
            className="h-[450px] w-full rounded-lg border border-gray-200 dark:border-gray-700"
            src={src}
            allowFullScreen
            title="Figma Embed"
          />
        ) : (
          <div className="flex h-[450px] w-full items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            No Figma URL provided.
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
}
