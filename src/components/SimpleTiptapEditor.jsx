import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import { _uploadImage } from "@/network/post-request";
import Compressor from "compressorjs";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Highlighter, List } from "lucide-react";
import { cn } from "@/lib/utils";

const SimpleTiptapEditor = ({
    mode = "review",
    enableBulletList = false,
    content = "",
    onChange,
    placeholder = "Start typing...",
    className = "",
}) => {
    // Normalize content - ensure it's a valid Tiptap JSON or empty
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

    const normalizedContent = normalizeContent(content);

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
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-blue-500 underline",
                },
            }),
            Image.configure({
                inline: false,
                allowBase64: true,
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: normalizedContent,
        editorProps: {
            attributes: {
                class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none max-w-none tiptap-${mode}-mode`,
                style: "color: var(--input-text-color);",
            },
        },
        onUpdate: ({ editor }) => {
            // Use JSON format (Tiptap's native format)
            onChange(editor.getJSON());
        },
    });

    // Image upload handler
    const handleImageUpload = async (file) => {
        return new Promise(async (resolve, reject) => {
            try {
                let compressedFile;

                if (file?.type === "image/gif") {
                    compressedFile = file;
                } else {
                    try {
                        compressedFile = await new Promise((resolveCompression, rejectCompression) => {
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
                        });
                    } catch (e) {
                        return reject(e);
                    }
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
                            resolve(result.data);
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
                const response = await handleImageUpload(file);
                const { key, url } = response.file;
                editor
                    .chain()
                    .focus()
                    .insertContent({
                        type: "image",
                        attrs: { src: url || key, alt: file.name },
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
                const response = await handleImageUpload(file);
                const { key, url } = response.file;
                editor
                    .chain()
                    .focus()
                    .insertContent({
                        type: "image",
                        attrs: { src: url || key, alt: file.name },
                    })
                    .run();
            } catch (error) {
                console.error("Error uploading image:", error);
            }
        };

        const editorDom = editor.view.dom;
        editorDom.addEventListener("drop", handleDrop);
        editorDom.addEventListener("paste", handlePaste);

        return () => {
            editorDom.removeEventListener("drop", handleDrop);
            editorDom.removeEventListener("paste", handlePaste);
        };
    }, [editor]);

    // Update content when prop changes
    useEffect(() => {
        if (!editor) return;

        const normalizedContent = normalizeContent(content);
        const currentJSON = editor.getJSON();
        const contentChanged = JSON.stringify(normalizedContent) !== JSON.stringify(currentJSON);

        if (contentChanged) {
            editor.commands.setContent(normalizedContent);
        }
    }, [content, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div
            className={cn(
                "tiptap-input-wrapper rounded-[30px] p-0 overflow-hidden transition-all duration-150",
                className
            )}
        >
            {/* Toolbar */}
            <div
                className="flex items-center gap-1 px-3 py-2 border-b tiptap-toolbar"
            >
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    title="Bold"
                    data-testid="button-bold"
                >
                    <Bold className="w-4 h-4" />
                </Button>
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    title="Italic"
                    data-testid="button-italic"
                >
                    <Italic className="w-4 h-4" />
                </Button>
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    title="Highlight"
                    data-testid="button-highlight"
                >
                    <Highlighter className="w-4 h-4" />
                </Button>
                {enableBulletList && (
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        title="Bullet List"
                        data-testid="button-bullet-list"
                    >
                        <List className="w-4 h-4" />
                    </Button>
                )}
            </div>
            {/* Editor Content */}
            <div className="simple-tiptap-editor-wrapper" >
                <EditorContent editor={editor} />
            </div>
        </div>
    );
};

export default SimpleTiptapEditor;

