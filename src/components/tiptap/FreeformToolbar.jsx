import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Highlighter,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  Image as ImageIcon,
  Minus,
  Table as TableIcon,
  Columns,
  Rows,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Compact, reference-styled formatting toolbar for the Freeform editor. It is
// rendered inside a TipTap BubbleMenu (see FreeformSection.jsx), which floats it
// near the caret and keeps it visible while the editor is focused — including on
// long blocks where a top-pinned toolbar would otherwise scroll out of view.
//
// Lean set + the essentials restored from the old TiptapMenuBar: strikethrough,
// text/background colour, divider and table. The editor keeps every extension and
// the renderer is untouched, so existing content still renders and edits fine.

function ToolbarBtn({ active, onClick, title, disabled, children }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      // Keep editor focus (and selection) when pressing a button.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        active
          ? "bg-[#1A1A1A] text-[#F0EDE7] dark:bg-[#F0EDE7] dark:text-[#1A1A1A]"
          : "text-[#7A736C] hover:bg-black/5 hover:text-[#1A1A1A] dark:text-[#9E9893] dark:hover:bg-white/5 dark:hover:text-[#F0EDE7]"
      )}
    >
      {children}
    </button>
  );
}

const Divider = () => <div className="mx-0.5 h-4 w-px shrink-0 bg-black/10 dark:bg-white/10" />;

const ICON = { size: 14, strokeWidth: 2.25 };

export default function FreeformToolbar({ editor, onImageUpload }) {
  const { resolvedTheme } = useTheme();
  const fileInputRef = useRef(null);
  const wrapperRef = useRef(null);
  const [showColor, setShowColor] = useState(false);
  // Re-render on editor changes so active-state highlighting stays in sync.
  const [, force] = useState(0);

  // Dismiss the colour popover when clicking anywhere outside the toolbar.
  useEffect(() => {
    if (!showColor) return;
    const onDown = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setShowColor(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [showColor]);

  useEffect(() => {
    if (!editor) return;
    const rerender = () => force((n) => n + 1);
    // The BubbleMenu hides via CSS visibility rather than unmounting us, so a
    // popover left open on blur would otherwise still be "open" the next time
    // the menu reappears — close it explicitly.
    const onBlur = () => setShowColor(false);
    editor.on("transaction", rerender);
    editor.on("selectionUpdate", rerender);
    editor.on("blur", onBlur);
    return () => {
      editor.off("transaction", rerender);
      editor.off("selectionUpdate", rerender);
      editor.off("blur", onBlur);
    };
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href;
    const url = window.prompt("Link URL", previous || "https://");
    if (url === null) return; // cancelled
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const handleImageFile = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file || !editor) return;
      try {
        const {
          file: { key, url },
        } = await onImageUpload(file);
        editor.chain().focus().insertContent({ type: "resizableImage", attrs: { key, url } }).run();
      } catch {
        /* silent — matches the drag/drop upload path */
      }
    },
    [editor, onImageUpload]
  );

  if (!editor) return null;

  const isDark = resolvedTheme === "dark";
  const inTable = editor.isActive("table");
  const activeTextColor = editor.getAttributes("textStyle").color || null;
  const activeHighlight = editor.getAttributes("highlight").color || null;

  // Same palettes/commands as the old TiptapMenuBar.
  const textColors = [
    { name: "Default", value: null, display: "#000000", isDefault: true },
    { name: isDark ? "Black" : "White", value: isDark ? "#000000" : "#ffffff" },
    { name: "Purple", value: "#9333ea" },
    { name: "Red", value: "#dc2626" },
    { name: "Orange", value: "#ea580c" },
    { name: "Blue", value: "#2563eb" },
    { name: "Green", value: "#16a34a" },
    { name: "Pink", value: "#db2777" },
  ];

  const backgroundColors = [
    { name: "None", value: null, bgColor: "transparent", isDefault: true },
    {
      name: isDark ? "White" : "Black",
      value: isDark ? "#ffffff" : "#000000",
      bgColor: isDark ? "#ffffff" : "#000000",
      textColor: isDark ? "#000000" : "#ffffff",
    },
    { name: "Purple", value: "#e9d5ff", bgColor: "#e9d5ff" },
    { name: "Red", value: "#fecaca", bgColor: "#fecaca" },
    { name: "Yellow", value: "#fef08a", bgColor: "#fef08a" },
    { name: "Blue", value: "#bfdbfe", bgColor: "#bfdbfe" },
    { name: "Green", value: "#bbf7d0", bgColor: "#bbf7d0" },
    { name: "Orange", value: "#fed7aa", bgColor: "#fed7aa" },
    { name: "Pink", value: "#fbcfe8", bgColor: "#fbcfe8" },
    { name: "Gray", value: "#e5e7eb", bgColor: "#e5e7eb" },
  ];

  const applyTextColor = (value) => {
    if (value) editor.chain().focus().setColor(value).run();
    else editor.chain().focus().unsetColor().run();
    setShowColor(false);
  };

  const applyHighlight = (value) => {
    if (value) editor.chain().focus().setHighlight({ color: value }).run();
    else editor.chain().focus().unsetHighlight().run();
    setShowColor(false);
  };

  return (
    <div
      ref={wrapperRef}
      // Keep the editor focused when interacting with any part of the toolbar.
      onMouseDown={(e) => e.preventDefault()}
      className="relative z-20 w-fit max-w-full"
    >
      <div
        className={cn(
          "flex max-w-full items-center gap-0.5 overflow-x-auto rounded-xl border border-black/[0.08] bg-white p-1.5 shadow-sm dark:border-white/[0.08] dark:bg-[#2A2520]",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        )}
      >
        <ToolbarBtn
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <Bold {...ICON} />
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <Italic {...ICON} />
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline"
        >
          <UnderlineIcon {...ICON} />
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
        >
          <Strikethrough {...ICON} />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn
          active={activeTextColor !== null || activeHighlight !== null}
          onClick={() => setShowColor((v) => !v)}
          title="Text & background colour"
        >
          <Highlighter {...ICON} />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading"
        >
          <Heading2 {...ICON} />
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Sub-heading"
        >
          <Heading3 {...ICON} />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet list"
        >
          <List {...ICON} />
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered list"
        >
          <ListOrdered {...ICON} />
        </ToolbarBtn>
        <ToolbarBtn
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Quote"
        >
          <Quote {...ICON} />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Divider"
        >
          <Minus {...ICON} />
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive("link")} onClick={setLink} title="Link">
          <Link2 {...ICON} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => fileInputRef.current?.click()} title="Insert image">
          <ImageIcon {...ICON} />
        </ToolbarBtn>
        <ToolbarBtn
          active={inTable}
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
          title="Insert table"
        >
          <TableIcon {...ICON} />
        </ToolbarBtn>

        {/* Contextual table tools — only while the caret is inside a table. */}
        {inTable && (
          <>
            <Divider />
            <ToolbarBtn
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              title="Add column"
            >
              <Columns {...ICON} />
            </ToolbarBtn>
            <ToolbarBtn
              onClick={() => editor.chain().focus().deleteColumn().run()}
              title="Delete column"
            >
              <Minus {...ICON} style={{ transform: "rotate(90deg)" }} />
            </ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().addRowAfter().run()} title="Add row">
              <Rows {...ICON} />
            </ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().deleteRow().run()} title="Delete row">
              <Minus {...ICON} />
            </ToolbarBtn>
            <ToolbarBtn
              onClick={() => editor.chain().focus().deleteTable().run()}
              title="Delete table"
            >
              <Trash2 {...ICON} className="text-red-500" />
            </ToolbarBtn>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageFile}
        />
      </div>

      {/* Colour picker — rendered outside the scrollable row so it is never clipped. */}
      {showColor && (
        <div className="absolute top-full left-0 z-[200] mt-2 w-[248px] rounded-xl border border-black/[0.08] bg-white p-3 shadow-lg dark:border-white/[0.08] dark:bg-[#2A2520]">
          <div className="mb-1.5 text-[11px] font-medium tracking-wide text-[#9E9893] uppercase">
            Text
          </div>
          <div className="flex flex-wrap gap-1.5">
            {textColors.map((color) => {
              const isActive = color.isDefault
                ? activeTextColor === null
                : activeTextColor === color.value;
              return (
                <button
                  key={color.name}
                  type="button"
                  title={color.name}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyTextColor(color.value)}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg border border-black/10 text-[13px] font-bold dark:border-white/10",
                    isActive && "ring-2 ring-[#1A1A1A] ring-offset-1 dark:ring-[#F0EDE7]"
                  )}
                >
                  <span
                    style={{ color: color.isDefault ? undefined : color.value || undefined }}
                    className={color.isDefault ? "text-[#1A1A1A] dark:text-[#F0EDE7]" : ""}
                  >
                    A
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 mb-1.5 text-[11px] font-medium tracking-wide text-[#9E9893] uppercase">
            Background
          </div>
          <div className="flex flex-wrap gap-1.5">
            {backgroundColors.map((color) => {
              const isActive = color.isDefault
                ? activeHighlight === null
                : activeHighlight === color.value;
              return (
                <button
                  key={color.name}
                  type="button"
                  title={color.name}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyHighlight(color.value)}
                  style={{ backgroundColor: color.bgColor }}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg border border-black/10 text-[13px] font-bold dark:border-white/10",
                    isActive && "ring-2 ring-[#1A1A1A] ring-offset-1 dark:ring-[#F0EDE7]"
                  )}
                >
                  <span style={color.textColor ? { color: color.textColor } : undefined}>A</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
