import React from 'react';
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
import { FigmaExtension } from './tiptap/FigmaExtension';
import { LinkNode } from './tiptap/LinkExtension';
import { YoutubeNode } from './tiptap/YoutubeExtension';
import { ResizableImage } from './tiptap/ResizableImage';

const TiptapRenderer = ({ content }) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
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
      Image.configure({
        inline: false,
      }),
      ResizableImage,
      Table.configure({
        HTMLAttributes: {
          class: 'tiptap-table',
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
      Underline,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-blue-500 underline cursor-pointer',
        },
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
        HTMLAttributes: {
          class: 'w-full aspect-video rounded-[20px] mt-6 md:mt-8',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        HTMLAttributes: {
          class: 'bg-yellow-200 dark:bg-yellow-600',
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
    <div className="bg-df-section-card-bg-color shadow-df-section-card-shadow rounded-[24px] p-4 lg:p-[32px] break-words project-editor">
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapRenderer;
