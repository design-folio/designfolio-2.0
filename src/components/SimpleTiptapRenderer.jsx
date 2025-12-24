import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import { cn } from "@/lib/utils";

const SimpleTiptapRenderer = ({
  content = "",
  mode = "review",
  enableBulletList = false,
  className = "",
}) => {
  // Normalize content - only accept Tiptap JSON format
  const normalizeContent = (content) => {
    if (!content) {
      return {
        type: 'doc',
        content: [{ type: 'paragraph', content: [] }]
      };
    }

    // If it's already a Tiptap JSON object, use it
    if (typeof content === 'object' && content !== null && content.type === 'doc') {
      return content;
    }

    // If it's not valid Tiptap JSON, return empty document
    return {
      type: 'doc',
      content: [{ type: 'paragraph', content: [] }]
    };
  };

  const editorContent = normalizeContent(content);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        code: false,
        orderedList: false, // Never allow ordered lists
        bulletList: enableBulletList ? {
          HTMLAttributes: {
            class: "list-disc pl-5",
          },
        } : false, // Only allow bullet lists if enabled
      }),
      Highlight.configure({
        multicolor: false,
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: "text-blue-500 underline cursor-pointer",
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
    ],
    content: editorContent,
    editable: false,
    editorProps: {
      attributes: {
        class: `prose prose-sm dark:prose-invert max-w-none focus:outline-none ${mode === "review" ? "tiptap-review-mode" : mode === "work" ? "tiptap-work-mode" : ""}`,
      },
    },
  });

  // Update content when prop changes
  useEffect(() => {
    if (!editor) return;

    const currentJSON = editor.getJSON();
    const contentChanged = JSON.stringify(editorContent) !== JSON.stringify(currentJSON);

    if (contentChanged) {
      editor.commands.setContent(editorContent);
    }
  }, [editorContent, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={cn(
      mode === "work"
        ? "break-words"
        : "bg-review-card-bg-color shadow-df-section-card-shadow rounded-[24px] break-words",
      className
    )}>
      <EditorContent editor={editor} />
    </div>
  );
};

export default SimpleTiptapRenderer;

