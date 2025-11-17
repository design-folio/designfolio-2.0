import React, { useRef } from 'react';
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
  Columns,
  Rows,
  Trash2
} from 'lucide-react';

const TiptapMenuBar = ({ editor }) => {
  const fileInputRef = useRef(null);

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
      editor.chain().focus().setImage({ src: url }).run();
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
          className={editor.isActive('bold') ? 'is-active' : ''}
          title="Bold (Ctrl+B)"
        >
          <Bold size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
          title="Italic (Ctrl+I)"
        >
          <Italic size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'is-active' : ''}
          title="Underline (Ctrl+U)"
        >
          <Underline size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'is-active' : ''}
          title="Strikethrough"
        >
          <Strikethrough size={18} />
        </button>
      </div>

      {/* Headings */}
      <div className="menu-group">
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
          title="Heading 2"
        >
          <Heading2 size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
          title="Heading 3"
        >
          <Heading3 size={18} />
        </button>
      </div>

      {/* Lists */}
      <div className="menu-group">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
          title="Bullet List"
        >
          <List size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
          title="Numbered List"
        >
          <ListOrdered size={18} />
        </button>
      </div>

      {/* Other */}
      <div className="menu-group">
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'is-active' : ''}
          title="Quote"
        >
          <Quote size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? 'is-active' : ''}
          title="Code Block"
        >
          <Code2 size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={editor.isActive('code') ? 'is-active' : ''}
          title="Inline Code"
        >
          <Code size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={editor.isActive('highlight') ? 'is-active' : ''}
          title="Highlight"
        >
          <Highlighter size={18} />
        </button>
      </div>

      {/* Alignment */}
      <div className="menu-group">
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
          title="Align Left"
        >
          <AlignLeft size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
          title="Align Center"
        >
          <AlignCenter size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
          title="Align Right"
        >
          <AlignRight size={18} />
        </button>
      </div>

      {/* Insert */}
      <div className="menu-group">
        <button onClick={addImage} title="Insert Image">
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
          title="Insert YouTube Video"
        >
          <Youtube size={18} />
        </button>
        <button
          onClick={addLink}
          className={editor.isActive('link') ? 'is-active' : ''}
          title="Insert Link"
        >
          <Link2 size={18} />
        </button>
        <button onClick={addFigmaEmbed} title="Insert Figma Embed">
          <Figma size={18} />
        </button>
        <button onClick={addTable} title="Insert Table">
          <TableIcon size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Line"
        >
          <Minus size={18} />
        </button>
      </div>

      {/* Table Controls - Show when cursor is in a table */}
      {editor.isActive('table') && (
        <div className="menu-group">
          <button
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            title="Add Column Before"
          >
            <Columns size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            title="Add Column After"
          >
            <Columns size={18} />
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
            title="Add Row Before"
          >
            <Rows size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().addRowAfter().run()}
            title="Add Row After"
          >
            <Rows size={18} />
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
