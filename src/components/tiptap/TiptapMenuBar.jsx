import React, { useRef, useState, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code2,
  Code,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image,
  Youtube,
  Link2,
  Table as TableIcon,
  Minus,
  Undo2,
  Redo2,
  Figma,
  TableProperties,
  Trash2,
  ArrowLeftToLine,
  ArrowRightToLine,
  ArrowUpToLine,
  ArrowDownToLine
} from 'lucide-react';

const TiptapMenuBar = ({ editor }) => {
  const fileInputRef = useRef(null);
  const [isInTable, setIsInTable] = useState(false);
  const [activeNodes, setActiveNodes] = useState({
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    heading2: false,
    heading3: false,
    bulletList: false,
    orderedList: false,
    blockquote: false,
    codeBlock: false,
    code: false,
    highlight: false,
    alignLeft: false,
    alignCenter: false,
    alignRight: false,
    image: false,
    youtube: false,
    youtubeNode: false,
    link: false,
    linkNode: false,
    figma: false,
    table: false,
    horizontalRule: false,
  });

  useEffect(() => {
    if (!editor) return;

    const updateState = () => {
      setIsInTable(editor.isActive('table'));
      setActiveNodes({
        bold: editor.isActive('bold'),
        italic: editor.isActive('italic'),
        underline: editor.isActive('underline'),
        strike: editor.isActive('strike'),
        heading2: editor.isActive('heading', { level: 2 }),
        heading3: editor.isActive('heading', { level: 3 }),
        bulletList: editor.isActive('bulletList'),
        orderedList: editor.isActive('orderedList'),
        blockquote: editor.isActive('blockquote'),
        codeBlock: editor.isActive('codeBlock'),
        code: editor.isActive('code'),
        highlight: editor.isActive('highlight'),
        alignLeft: editor.isActive({ textAlign: 'left' }),
        alignCenter: editor.isActive({ textAlign: 'center' }),
        alignRight: editor.isActive({ textAlign: 'right' }),
        image: editor.isActive('image') || editor.isActive('resizableImage'),
        youtube: editor.isActive('youtube'),
        youtubeNode: editor.isActive('youtubeNode'),
        link: editor.isActive('link'),
        linkNode: editor.isActive('linkNode'),
        figma: editor.isActive('figma'),
        table: editor.isActive('table'),
        horizontalRule: editor.isActive('horizontalRule'),
      });
    };

    // Update immediately
    updateState();

    // Listen to selection updates
    editor.on('selectionUpdate', updateState);
    editor.on('update', updateState);

    return () => {
      editor.off('selectionUpdate', updateState);
      editor.off('update', updateState);
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  const addImage = () => {
    // Trigger file input
    fileInputRef.current?.click();
  };

  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64 for display
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result;
      editor.chain().focus().insertContent({
        type: 'resizableImage',
        attrs: { src: url },
      }).run();
    };
    reader.readAsDataURL(file);

    // Reset file input
    e.target.value = '';
  };

  const addFigmaEmbed = () => {
    editor.chain().focus().insertContent({
      type: 'figma',
      attrs: { embedCode: '' },
    }).run();
  };

  const addYoutube = () => {
    editor.chain().focus().insertContent({
      type: 'youtubeNode',
      attrs: { src: '' },
    }).run();
  };

  const addLink = () => {
    editor.chain().focus().insertContent({
      type: 'linkNode',
      attrs: { href: '', text: '' },
    }).run();
  };

  const addTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  return (
    <div className="tiptap-menu-bar">
      {/* Text Formatting */}
      <div className="menu-group">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={activeNodes.bold ? 'is-active' : ''}
          title="Bold (Ctrl+B)"
        >
          <Bold size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={activeNodes.italic ? 'is-active' : ''}
          title="Italic (Ctrl+I)"
        >
          <Italic size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={activeNodes.underline ? 'is-active' : ''}
          title="Underline (Ctrl+U)"
        >
          <Underline size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={activeNodes.strike ? 'is-active' : ''}
          title="Strikethrough"
        >
          <Strikethrough size={18} />
        </button>
      </div>

      {/* Headings */}
      <div className="menu-group">
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={activeNodes.heading2 ? 'is-active' : ''}
          title="Heading 2"
        >
          <Heading2 size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={activeNodes.heading3 ? 'is-active' : ''}
          title="Heading 3"
        >
          <Heading3 size={18} />
        </button>
      </div>

      {/* Lists */}
      <div className="menu-group">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={activeNodes.bulletList ? 'is-active' : ''}
          title="Bullet List"
        >
          <List size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={activeNodes.orderedList ? 'is-active' : ''}
          title="Numbered List"
        >
          <ListOrdered size={18} />
        </button>
      </div>

      {/* Other */}
      <div className="menu-group">
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={activeNodes.blockquote ? 'is-active' : ''}
          title="Quote"
        >
          <Quote size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={activeNodes.codeBlock ? 'is-active' : ''}
          title="Code Block"
        >
          <Code2 size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={activeNodes.code ? 'is-active' : ''}
          title="Inline Code"
        >
          <Code size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={activeNodes.highlight ? 'is-active' : ''}
          title="Highlight"
        >
          <Highlighter size={18} />
        </button>
      </div>

      {/* Alignment */}
      <div className="menu-group">
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={activeNodes.alignLeft ? 'is-active' : ''}
          title="Align Left"
        >
          <AlignLeft size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={activeNodes.alignCenter ? 'is-active' : ''}
          title="Align Center"
        >
          <AlignCenter size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={activeNodes.alignRight ? 'is-active' : ''}
          title="Align Right"
        >
          <AlignRight size={18} />
        </button>
      </div>

      {/* Insert */}
      <div className="menu-group">
        <button 
          onClick={addImage} 
          className={activeNodes.image ? 'is-active' : ''}
          title="Insert Image"
        >
          <Image size={18} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageFile}
          style={{ display: 'none' }}
        />
        <button
          onClick={addYoutube}
          className={activeNodes.youtube || activeNodes.youtubeNode ? 'is-active' : ''}
          title="Insert YouTube Video"
        >
          <Youtube size={18} />
        </button>
        <button
          onClick={addLink}
          className={activeNodes.link || activeNodes.linkNode ? 'is-active' : ''}
          title="Insert Link"
        >
          <Link2 size={18} />
        </button>
        <button 
          onClick={addFigmaEmbed} 
          className={activeNodes.figma ? 'is-active' : ''}
          title="Insert Figma Embed"
        >
          <Figma size={18} />
        </button>
        <button 
          onClick={addTable} 
          className={activeNodes.table ? 'is-active' : ''}
          title="Insert Table"
        >
          <TableIcon size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={activeNodes.horizontalRule ? 'is-active' : ''}
          title="Horizontal Line"
        >
          <Minus size={18} />
        </button>
      </div>

      {/* Table Controls - Show when cursor is in a table */}
      {isInTable && (
        <div className="menu-group">
          <button
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            title="Add Column Before (Left)"
          >
            <ArrowLeftToLine size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            title="Add Column After (Right)"
          >
            <ArrowRightToLine size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().deleteColumn().run()}
            disabled={!editor.can().deleteColumn()}
            title="Delete Column"
          >
            <Trash2 size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().addRowBefore().run()}
            title="Add Row Before (Above)"
          >
            <ArrowUpToLine size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().addRowAfter().run()}
            title="Add Row After (Below)"
          >
            <ArrowDownToLine size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().deleteRow().run()}
            disabled={!editor.can().deleteRow()}
            title="Delete Row"
          >
            <Trash2 size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().deleteTable().run()}
            title="Delete Table"
            style={{ color: '#ef4444' }}
          >
            <TableProperties size={18} />
          </button>
        </div>
      )}

      {/* Undo/Redo */}
      <div className="menu-group">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo2 size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default TiptapMenuBar;
