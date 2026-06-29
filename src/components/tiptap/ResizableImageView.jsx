import React, { useState, useRef, useEffect, startTransition } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import { Move, AlignLeft, AlignCenter, AlignRight } from "lucide-react";

const ResizableImageView = ({ node, updateAttributes, editor, selected }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [showAltInput, setShowAltInput] = useState(false);
  const [altText, setAltText] = useState(node.attrs.alt || "");
  const imageRef = useRef(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const inputRef = useRef(null);

  // Default alignment to 'left' if not set
  const alignment = node.attrs.alignment || "left";

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = imageRef.current?.offsetWidth || 0;
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const diff = e.clientX - startXRef.current;
      const newWidth = Math.max(100, startWidthRef.current + diff);

      if (imageRef.current) {
        updateAttributes({
          width: newWidth,
        });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, updateAttributes]);

  useEffect(() => {
    if (showAltInput) {
      startTransition(() => setAltText(node.attrs.alt || ""));
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [showAltInput, node.attrs.alt]);

  const handleAltSave = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    updateAttributes({ alt: altText });
    setShowAltInput(false);
    editor.commands.focus();
  };

  const handleAltCancel = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setAltText(node.attrs.alt || "");
    setShowAltInput(false);
    editor.commands.focus();
  };

  const setAlignment = (align) => {
    updateAttributes({ alignment: align });
  };

  const getWrapperAlignment = () => {
    if (alignment === "center") return "mx-auto";
    if (alignment === "right") return "ml-auto";
    return "mr-auto";
  };

  return (
    <NodeViewWrapper className="resizable-image-wrapper">
      <div
        className={`relative my-4 block ${getWrapperAlignment()}`}
        style={{
          maxWidth: "100%",
          width: node.attrs.width ? `${node.attrs.width}px` : "auto",
        }}
      >
        <img
          ref={imageRef}
          src={node.attrs.src || node.attrs.url || node.attrs.key}
          alt={node.attrs.alt || ""}
          title={node.attrs.title || ""}
          className={`block h-auto w-full rounded-lg ${selected ? "shadow-xl" : ""} ${!editor.isEditable ? "cursor-pointer" : ""}`}
          style={{
            cursor: isResizing ? "ew-resize" : editor.isEditable ? "default" : "pointer",
          }}
        />

        {editor.isEditable && selected && !showAltInput && (
          <>
            {/* Resize handle */}
            <div
              className="group absolute -right-3 -bottom-3 flex h-8 w-8 cursor-nwse-resize items-center justify-center rounded-full bg-blue-500 shadow-lg transition-colors hover:bg-blue-600"
              onMouseDown={handleMouseDown}
              style={{ border: "2px solid white" }}
            >
              <Move size={14} className="text-white" />
            </div>

            {/* Alignment buttons */}
            <div className="absolute top-2 right-2 flex gap-1 rounded-md border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <button
                onClick={() => setAlignment("left")}
                className={`rounded p-1.5 transition-colors ${
                  alignment === "left"
                    ? "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
                title="Align left"
              >
                <AlignLeft size={14} />
              </button>
              <button
                onClick={() => setAlignment("center")}
                className={`rounded p-1.5 transition-colors ${
                  alignment === "center"
                    ? "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
                title="Align center"
              >
                <AlignCenter size={14} />
              </button>
              <button
                onClick={() => setAlignment("right")}
                className={`rounded p-1.5 transition-colors ${
                  alignment === "right"
                    ? "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
                title="Align right"
              >
                <AlignRight size={14} />
              </button>
            </div>

            {/* Alt text button */}
            <button
              onClick={() => setShowAltInput(true)}
              className="absolute top-2 left-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-lg transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {node.attrs.alt ? "Edit Alt" : "Add Alt"}
            </button>
          </>
        )}

        {showAltInput && (
          <div
            className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4 backdrop-blur-sm"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800">
              <h3 className="mb-3 text-base font-semibold text-gray-900 dark:text-gray-100">
                Image Alt Text
              </h3>
              <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                Describe this image for accessibility and SEO
              </p>
              <input
                ref={inputRef}
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="e.g., Product screenshot showing dashboard..."
                className="mb-4 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-blue-600"
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Enter") handleAltSave(e);
                  if (e.key === "Escape") handleAltCancel(e);
                }}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleAltCancel}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAltSave}
                  className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export default ResizableImageView;
