import React, { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { FigmaExtension } from './tiptap/FigmaExtension';
import { LinkNode } from './tiptap/LinkExtension';
import { YoutubeNode } from './tiptap/YoutubeExtension';
import { ResizableImage } from './tiptap/ResizableImage';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

const TiptapRenderer = ({ content }) => {
  const [fullscreenImageSrc, setFullscreenImageSrc] = useState(null);

  const handleContentClick = useCallback((e) => {
    const img = e.target.closest?.('img');
    if (img?.src) {
      e.preventDefault();
      setFullscreenImageSrc(img.src);
    }
  }, []);

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
            class: 'list-disc pl-5',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal pl-5',
          },
        },
      }),
      Underline,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-blue-500 underline cursor-pointer',
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'cursor-pointer',
        },
      }),
      ResizableImage,
      Youtube.configure({
        controls: true,
        nocookie: true,
        HTMLAttributes: {
          class: 'w-full aspect-video rounded-[20px] mt-6 md:mt-8',
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
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'tiptap-table-row',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'tiptap-table-cell',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'tiptap-table-header',
        },
      }),
      FigmaExtension,
      LinkNode,
      YoutubeNode,
    ],
    content: content,
    editable: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none max-w-none',
      },
    },
  });

  return (
    <>
      <div
        className={cn("bg-df-section-card-bg-color shadow-df-section-card-shadow rounded-[24px] p-4 lg:p-[32px] break-words project-editor")}
        onClick={handleContentClick}
        role="presentation"
      >
        <EditorContent editor={editor} />
      </div>

      {fullscreenImageSrc && (
        <button
          type="button"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 outline-none"
          onClick={() => setFullscreenImageSrc(null)}
          aria-label="Close fullscreen image"
        >
          <img
            src={fullscreenImageSrc}
            alt="Fullscreen"
            className="max-h-full max-w-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />
          <span className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors">
            <X className="w-6 h-6" />
          </span>
        </button>
      )}
    </>
  );
};

export default TiptapRenderer;
