import React, { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Placeholder from "@tiptap/extension-placeholder";
import { FigmaExtension } from "./tiptap/FigmaExtension";
import { LinkNode } from "./tiptap/LinkExtension";
import { YoutubeNode } from "./tiptap/YoutubeExtension";
import { ResizableImage } from "./tiptap/ResizableImage";
import { SelectAllExtension } from "./tiptap/SelectAllExtension";
import TiptapMenuBar from "./tiptap/TiptapMenuBar";
import { _updateProject, _uploadImage } from "@/network/post-request";
import { useGlobalContext } from "@/context/globalContext";
import { useRouter } from "next/router";
import Compressor from "compressorjs";
import queryClient from "@/network/queryClient";

// Ensure Table extensions are properly loaded
if (!Table || !TableRow || !TableCell || !TableHeader) {
  console.error("Table extensions not loaded properly");
}

const TiptapEditor = ({ projectDetails, userDetails }) => {
  const router = useRouter();
  const { setWordCount, setProjectValue } = useGlobalContext();
  const saveTimeoutRef = useRef(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const editorContainerRef = useRef(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      TextStyle,
      Color,
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4, 5, 6],
        },
        bulletList: {
          HTMLAttributes: {
            class: "list-disc pl-5",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal pl-5",
          },
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline",
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      ResizableImage,
      Youtube.configure({
        controls: true,
        nocookie: true,
        HTMLAttributes: {
          class: "w-full aspect-video rounded-[20px] mt-6 md:mt-8",
        },
      }),
      Table.extend({
        renderHTML({ HTMLAttributes }) {
          return [
            "div",
            { class: "tableWrapper" },
            ["table", HTMLAttributes, ["tbody", 0]],
          ];
        },
      }).configure({
        HTMLAttributes: {
          class: "tiptap-table",
        },
        resizable: true,
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: "tiptap-table-row",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "tiptap-table-cell",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "tiptap-table-header",
        },
      }),
      Placeholder.configure({
        placeholder: "Start writing here...",
        emptyEditorClass: "is-editor-empty",
        emptyNodeClass: "is-empty",
        showOnlyCurrent: true,
      }),
      FigmaExtension,
      LinkNode,
      YoutubeNode,
      SelectAllExtension,
    ],
    content:
      projectDetails?.tiptapContent &&
      Object.keys(projectDetails.tiptapContent).length > 0
        ? projectDetails.tiptapContent
        : "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none max-w-none",
      },
    },
    onUpdate: ({ editor }) => {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Debounce save to avoid too many API calls
      saveTimeoutRef.current = setTimeout(() => {
        const html = editor.getHTML();
        const json = editor.getJSON();

        _updateProject(router.query.id, {
          tiptapContent: json,
          contentVersion: 2,
        }).then((res) => {
          if (userDetails) {
            const updatedProjects = userDetails?.projects?.map((item) =>
              item._id === router.query.id
                ? { ...item, tiptapContent: json, contentVersion: 2 }
                : item
            );
            queryClient.setQueriesData(
              { queryKey: ["userDetails"] },
              (oldData) => {
                return {
                  user: { ...oldData?.user, projects: updatedProjects },
                };
              }
            );
          }
        });

        // Update word count
        const text = editor.getText();
        setProjectValue(text.trim());
        setWordCount(
          text
            .trim()
            .split(/\s+/)
            .filter((word) => word.length > 0).length
        );
      }, 1000);
    },
  });

  // Sync content when projectDetails loads
  useEffect(() => {
    if (editor && projectDetails?.tiptapContent) {
      const isEditorEmpty = editor.isEmpty;
      // Only update if editor is empty and we have content to show
      if (
        isEditorEmpty &&
        Object.keys(projectDetails.tiptapContent).length > 0
      ) {
        editor.commands.setContent(projectDetails.tiptapContent);
      }
    }
  }, [editor, projectDetails]);

  // Image upload handler
  const handleImageUpload = async (file) => {
    return new Promise(async (resolve, reject) => {
      try {
        let compressedFile;

        if (file?.type === "image/gif") {
          compressedFile = file;
        } else {
          compressedFile = await new Promise(
            (resolveCompression, rejectCompression) => {
              new Compressor(file, {
                quality: 0.8,
                mimeType: "image/webp",
                maxHeight: 3840,
                success(result) {
                  resolveCompression(result);
                },
                error(error) {
                  rejectCompression(error);
                },
              });
            }
          );
        }

        const reader = new FileReader();
        reader.onload = function (e) {
          const base64 = e.target.result.split(",")[1];

          _uploadImage({
            file: {
              key: "data:image/png;base64," + base64,
              originalName: compressedFile.name,
              extension: compressedFile.type,
            },
          })
            .then((result) => {
              resolve(result.data.file.url);
            })
            .catch((error) => reject(error));
        };

        reader.readAsDataURL(compressedFile);
      } catch (compressionError) {
        reject(compressionError);
      }
    });
  };

  // Add image upload on paste/drop
  useEffect(() => {
    if (!editor || !editor.view || !editor.view.dom) return;

    const handleDrop = async (event) => {
      const files = event.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      if (!file.type.startsWith("image/")) return;

      event.preventDefault();

      try {
        const url = await handleImageUpload(file);
        editor
          .chain()
          .focus()
          .insertContent({
            type: "resizableImage",
            attrs: { src: url },
          })
          .run();
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    };

    const handlePaste = async (event) => {
      const files = event.clipboardData?.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      if (!file.type.startsWith("image/")) return;

      event.preventDefault();

      try {
        const url = await handleImageUpload(file);
        editor
          .chain()
          .focus()
          .insertContent({
            type: "resizableImage",
            attrs: { src: url },
          })
          .run();
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    };

    editor.view.dom.addEventListener("drop", handleDrop);
    editor.view.dom.addEventListener("paste", handlePaste);

    return () => {
      if (editor.view && editor.view.dom) {
        editor.view.dom.removeEventListener("drop", handleDrop);
        editor.view.dom.removeEventListener("paste", handlePaste);
      }
    };
  }, [editor]);

  // Handle click outside to hide toolbar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        editorContainerRef.current &&
        !editorContainerRef.current.contains(event.target)
      ) {
        setShowToolbar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="project-editor-container" ref={editorContainerRef}>
      {/* Editor Content */}
      <div
        className="project-editor bg-df-section-card-bg-color"
        onClick={() => {
          setShowToolbar(true);
          if (editor && !editor.isFocused) {
            editor.chain().focus().run();
          }
        }}
      >
        <div className="tiptap-editor-wrapper p-[16px] md:p-[32px]">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Fixed Bottom Toolbar - Shows only when editor is active */}
      <TiptapMenuBar editor={editor} showToolbar={showToolbar} />
    </div>
  );
};

export default TiptapEditor;
