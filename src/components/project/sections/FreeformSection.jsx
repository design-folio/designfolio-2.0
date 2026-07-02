import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import Highlight from "@tiptap/extension-highlight";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import Compressor from "compressorjs";
import { FigmaExtension } from "@/components/tiptap/FigmaExtension";
import { YoutubeNode } from "@/components/tiptap/YoutubeExtension";
import { LinkNode } from "@/components/tiptap/LinkExtension";
import { ResizableImage } from "@/components/tiptap/ResizableImage";
import { SelectAllExtension } from "@/components/tiptap/SelectAllExtension";
import TiptapMenuBar from "@/components/tiptap/TiptapMenuBar";
import TiptapRenderer from "@/components/tiptapRenderer";
import { _uploadImage } from "@/network/post-request";

// Mirrors the upload flow from tiptapEditor.jsx (compress → upload → return S3 url)
async function uploadImage(file) {
  const compressedFile = await new Promise((resolve, reject) => {
    if (file.type === "image/gif") return resolve(file);
    new Compressor(file, {
      quality: 0.8,
      mimeType: "image/webp",
      maxHeight: 3840,
      success: resolve,
      error: reject,
    });
  });

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result.split(",")[1];
      _uploadImage({
        file: {
          key: "data:image/png;base64," + base64,
          originalName: compressedFile.name,
          extension: compressedFile.type,
        },
      })
        .then((res) => resolve(res.data))
        .catch(reject);
    };
    reader.readAsDataURL(compressedFile);
  });
}

export default function FreeformSection({ section, onChange, mode }) {
  const saveTimeoutRef = useRef(null);
  const editorContainerRef = useRef(null);
  const [showToolbar, setShowToolbar] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      TextStyle,
      Color,
      StarterKit.configure({
        heading: { levels: [2, 3, 4, 5, 6] },
        bulletList: { HTMLAttributes: { class: "list-disc pl-5" } },
        orderedList: { HTMLAttributes: { class: "list-decimal pl-5" } },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-500 underline" },
      }),
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Youtube.configure({
        controls: true,
        nocookie: true,
        HTMLAttributes: { class: "w-full aspect-video rounded-[20px] mt-6 md:mt-8" },
      }),
      Table.extend({
        renderHTML({ HTMLAttributes }) {
          return ["div", { class: "tableWrapper" }, ["table", HTMLAttributes, ["tbody", 0]]];
        },
      }).configure({ HTMLAttributes: { class: "tiptap-table" }, resizable: true }),
      TableRow.configure({ HTMLAttributes: { class: "tiptap-table-row" } }),
      TableCell.configure({ HTMLAttributes: { class: "tiptap-table-cell" } }),
      TableHeader.configure({ HTMLAttributes: { class: "tiptap-table-header" } }),
      Placeholder.configure({
        placeholder: "Start writing here...",
        emptyEditorClass: "is-editor-empty",
        emptyNodeClass: "is-empty",
        showOnlyCurrent: true,
      }),
      FigmaExtension,
      LinkNode,
      YoutubeNode,
      ResizableImage,
      SelectAllExtension,
    ],
    content: section.content?.tiptapContent || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg focus:outline-none max-w-none [overflow-wrap:anywhere]",
      },
    },
    onUpdate: ({ editor }) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        onChange({ tiptapContent: editor.getJSON() });
      }, 800);
    },
  });

  // Hide toolbar on click outside the editor container
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (editorContainerRef.current && !editorContainerRef.current.contains(e.target)) {
        setShowToolbar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Drag-and-drop image upload into the editor
  useEffect(() => {
    if (!editor?.view?.dom) return;
    const handleDrop = async (e) => {
      const file = e.dataTransfer?.files?.[0];
      if (!file?.type.startsWith("image/")) return;
      e.preventDefault();
      try {
        const {
          file: { key, url },
        } = await uploadImage(file);
        editor.chain().focus().insertContent({ type: "resizableImage", attrs: { key, url } }).run();
      } catch {
        /* silent */
      }
    };
    const handlePaste = async (e) => {
      const file = e.clipboardData?.files?.[0];
      if (!file?.type.startsWith("image/")) return;
      e.preventDefault();
      try {
        const {
          file: { key, url },
        } = await uploadImage(file);
        editor.chain().focus().insertContent({ type: "resizableImage", attrs: { key, url } }).run();
      } catch {
        /* silent */
      }
    };
    editor.view.dom.addEventListener("drop", handleDrop);
    editor.view.dom.addEventListener("paste", handlePaste);
    return () => {
      if (editor.view?.dom) {
        editor.view.dom.removeEventListener("drop", handleDrop);
        editor.view.dom.removeEventListener("paste", handlePaste);
      }
    };
  }, [editor]);

  if (mode !== "editor") {
    return (
      <div className="mx-auto max-w-[880px] px-6 py-8 md:px-10">
        <TiptapRenderer
          content={section.content?.tiptapContent}
          className="!rounded-none !bg-transparent !p-0 !shadow-none lg:!p-0"
        />
      </div>
    );
  }

  return (
    <div
      ref={editorContainerRef}
      className="project-editor-container mx-auto max-w-[880px] overflow-x-hidden px-6 py-8 md:px-10"
      onClick={() => {
        setShowToolbar(true);
        if (editor && !editor.isFocused) editor.chain().focus().run();
      }}
    >
      <EditorContent editor={editor} />
      <TiptapMenuBar editor={editor} showToolbar={showToolbar} onImageUpload={uploadImage} />
    </div>
  );
}
