import React, { useRef, useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Type,
  List,
  ListOrdered,
  Quote,
  Code,
  Highlighter,
  AlignLeft,
  Image,
  Link2,
  Table as TableIcon,
  Undo2,
  Redo2,
  MoreHorizontal,
  ChevronDown,
  Heading2,
  Heading3,
  AlignCenter,
  AlignRight,
  Code2,
  Youtube,
  Figma,
  Minus,
  Trash2,
  ArrowLeftToLine,
  ArrowRightToLine,
  ArrowUpToLine,
  ArrowDownToLine,
  Palette,
  Columns,
  Rows,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const MenuButton = ({
  onClick,
  onMouseDown,
  isActive,
  disabled,
  title,
  children,
  className,
  style,
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        onClick={onClick}
        onMouseDown={onMouseDown}
        disabled={disabled}
        className={`${isActive ? "is-active" : ""} ${className || ""}`.trim()}
        style={style}
      >
        {children}
      </button>
    </TooltipTrigger>
    <TooltipContent side="top" className="bg-white dark:bg-[#262A34] border-none">
      <p>{title}</p>
    </TooltipContent>
  </Tooltip>
);

const TiptapMenuBar = ({ editor, showToolbar, onImageUpload }) => {
  const { resolvedTheme } = useTheme();
  const fileInputRef = useRef(null);
  const toolbarRef = useRef(null);
  const [isInTable, setIsInTable] = useState(false);
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const [showAlignMenu, setShowAlignMenu] = useState(false);
  const [showInsertMenu, setShowInsertMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showListMenu, setShowListMenu] = useState(false);

  // Close all dropdowns when toolbar is hidden
  useEffect(() => {
    if (!showToolbar) {
      setShowHeadingMenu(false);
      setShowAlignMenu(false);
      setShowInsertMenu(false);
      setShowMoreMenu(false);
      setShowColorMenu(false);
      setShowListMenu(false);
    }
  }, [showToolbar]);

  const textColors = [
    { name: "Default", value: null, display: "#000000", isDefault: true },
    {
      name: resolvedTheme === "dark" ? "Black" : "White",
      value: resolvedTheme === "dark" ? "#000000" : "#ffffff",
      display: resolvedTheme === "dark" ? "#000000" : "#ffffff",
      isDefault: false,
    },
    { name: "Purple", value: "#9333ea", display: "#9333ea", isDefault: false },
    { name: "Red", value: "#dc2626", display: "#dc2626", isDefault: false },
    { name: "Orange", value: "#ea580c", display: "#ea580c", isDefault: false },
    { name: "Blue", value: "#2563eb", display: "#2563eb", isDefault: false },
    { name: "Green", value: "#16a34a", display: "#16a34a", isDefault: false },
    { name: "Pink", value: "#db2777", display: "#db2777", isDefault: false },
  ];

  const backgroundColors = [
    { name: "None", value: null, bgColor: "transparent", isDefault: true },
    {
      name: resolvedTheme === "dark" ? "White" : "Black",
      value: resolvedTheme === "dark" ? "#ffffff" : "#000000",
      bgColor: resolvedTheme === "dark" ? "#ffffff" : "#000000",
      isDefault: false,
      textColor: resolvedTheme === "dark" ? "#000000" : "#ffffff",
    },
    { name: "Purple", value: "#e9d5ff", bgColor: "#e9d5ff", isDefault: false },
    { name: "Red", value: "#fecaca", bgColor: "#fecaca", isDefault: false },
    { name: "Yellow", value: "#fef08a", bgColor: "#fef08a", isDefault: false },
    { name: "Blue", value: "#bfdbfe", bgColor: "#bfdbfe", isDefault: false },
    { name: "Green", value: "#bbf7d0", bgColor: "#bbf7d0", isDefault: false },
    { name: "Orange", value: "#fed7aa", bgColor: "#fed7aa", isDefault: false },
    { name: "Pink", value: "#fbcfe8", bgColor: "#fbcfe8", isDefault: false },
    { name: "Gray", value: "#e5e7eb", bgColor: "#e5e7eb", isDefault: false },
  ];

  // Function to close all dropdowns
  const closeAllDropdowns = () => {
    setShowHeadingMenu(false);
    setShowAlignMenu(false);
    setShowInsertMenu(false);
    setShowMoreMenu(false);
    setShowColorMenu(false);
    setShowListMenu(false);
  };

  // Function to toggle a specific dropdown and close others
  const toggleDropdown = (dropdown) => {
    switch (dropdown) {
      case "heading":
        const newHeadingState = !showHeadingMenu;
        closeAllDropdowns();
        setShowHeadingMenu(newHeadingState);
        break;
      case "align":
        const newAlignState = !showAlignMenu;
        closeAllDropdowns();
        setShowAlignMenu(newAlignState);
        break;
      case "insert":
        const newInsertState = !showInsertMenu;
        closeAllDropdowns();
        setShowInsertMenu(newInsertState);
        break;
      case "more":
        const newMoreState = !showMoreMenu;
        closeAllDropdowns();
        setShowMoreMenu(newMoreState);
        break;
      case "color":
        const newColorState = !showColorMenu;
        closeAllDropdowns();
        setShowColorMenu(newColorState);
        break;
      case "list":
        const newListState = !showListMenu;
        closeAllDropdowns();
        setShowListMenu(newListState);
        break;
    }
  };

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
    canMerge: false,
    canSplit: false,
    textColor: null,
    highlightColor: null,
  });

  useEffect(() => {
    if (!editor) return;

    const updateState = () => {
      setIsInTable(editor.isActive("table"));
      setActiveNodes({
        bold: editor.isActive("bold"),
        italic: editor.isActive("italic"),
        underline: editor.isActive("underline"),
        strike: editor.isActive("strike"),
        heading2: editor.isActive("heading", { level: 2 }),
        heading3: editor.isActive("heading", { level: 3 }),
        bulletList: editor.isActive("bulletList"),
        orderedList: editor.isActive("orderedList"),
        blockquote: editor.isActive("blockquote"),
        codeBlock: editor.isActive("codeBlock"),
        code: editor.isActive("code"),
        highlight: editor.isActive("highlight"),
        alignLeft: editor.isActive({ textAlign: "left" }),
        alignCenter: editor.isActive({ textAlign: "center" }),
        alignRight: editor.isActive({ textAlign: "right" }),
        image: editor.isActive("image") || editor.isActive("resizableImage"),
        youtube: editor.isActive("youtube"),
        youtubeNode: editor.isActive("youtubeNode"),
        link: editor.isActive("link"),
        linkNode: editor.isActive("linkNode"),
        figma: editor.isActive("figma"),
        table: editor.isActive("table"),
        horizontalRule: editor.isActive("horizontalRule"),
        canMerge: editor.can().mergeCells(),
        canSplit: editor.can().splitCell(),
        textColor: editor.getAttributes("textStyle").color || null,
        highlightColor: editor.getAttributes("highlight").color || null,
      });
    };

    // Update immediately
    updateState();

    // Listen to selection updates
    editor.on("selectionUpdate", updateState);
    editor.on("update", updateState);
    editor.on("transaction", updateState);

    return () => {
      editor.off("selectionUpdate", updateState);
      editor.off("update", updateState);
      editor.off("transaction", updateState);
    };
  }, [editor]);

  // Auto-scroll to table tools when table is active
  useEffect(() => {
    if (isInTable && toolbarRef.current) {
      setTimeout(() => {
        toolbarRef.current.scrollTo({
          left: toolbarRef.current.scrollWidth,
          behavior: "smooth",
        });
      }, 100);
    }
  }, [isInTable]);

  // Close dropdowns when clicking outside the toolbar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target)) {
        closeAllDropdowns();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!editor) {
    return null;
  }

  const addImage = () => {
    // Trigger file input
    fileInputRef.current?.click();
  };

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (onImageUpload) {
      try {
        const response = await onImageUpload(file);
        const { key, url } = response.file;
        editor
          .chain()
          .focus()
          .insertContent({
            type: "resizableImage",
            attrs: { key, url },
          })
          .run();
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    } else {
      // Fallback to base64 if no upload handler provided
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result;
        editor
          .chain()
          .focus()
          .insertContent({
            type: "resizableImage",
            attrs: { src: url },
          })
          .run();
      };
      reader.readAsDataURL(file);
    }

    // Reset file input
    e.target.value = "";
  };

  const addFigmaEmbed = () => {
    editor
      .chain()
      .focus()
      .insertContent({
        type: "figma",
        attrs: { embedCode: "" },
      })
      .run();
    closeAllDropdowns();
  };

  const addYoutube = () => {
    editor
      .chain()
      .focus()
      .insertContent({
        type: "youtubeNode",
        attrs: { src: "" },
      })
      .run();
    closeAllDropdowns();
  };

  const addLink = () => {
    editor
      .chain()
      .focus()
      .insertContent({
        type: "linkNode",
        attrs: { href: "", text: "" },
      })
      .run();
    closeAllDropdowns();
  };

  const addTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
    closeAllDropdowns();
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div
        ref={toolbarRef}
        className={`tiptap-menu-bar ${showToolbar ? "toolbar-visible" : "toolbar-hidden"
          }`}
      >
        {/* Primary Text Formatting */}
        <div className="menu-group">
          <MenuButton
            onClick={() => {
              editor.chain().focus().toggleBold().run();
              closeAllDropdowns();
            }}
            onMouseDown={(e) => e.preventDefault()}
            isActive={activeNodes.bold}
            title="Bold"
          >
            <Bold size={18} />
          </MenuButton>
          <MenuButton
            onClick={() => {
              editor.chain().focus().toggleItalic().run();
              closeAllDropdowns();
            }}
            onMouseDown={(e) => e.preventDefault()}
            isActive={activeNodes.italic}
            title="Italic"
          >
            <Italic size={18} />
          </MenuButton>
          <MenuButton
            onClick={() => {
              editor.chain().focus().toggleStrike().run();
              closeAllDropdowns();
            }}
            onMouseDown={(e) => e.preventDefault()}
            isActive={activeNodes.strike}
            title="Strikethrough"
          >
            <Strikethrough size={18} />
          </MenuButton>
          <MenuButton
            onClick={() => {
              editor.chain().focus().toggleUnderline().run();
              closeAllDropdowns();
            }}
            onMouseDown={(e) => e.preventDefault()}
            isActive={activeNodes.underline}
            title="Underline"
          >
            <Underline size={18} />
          </MenuButton>
        </div>

        {/* Color Picker Dropdown */}
        <div className="menu-group menu-dropdown">
          <MenuButton
            isActive={activeNodes.textColor !== null || activeNodes.highlightColor !== null}
            onClick={() => toggleDropdown("color")}
            title="Text & Background Color"
          >
            <Highlighter size={18} />
          </MenuButton>
          {showColorMenu && (
            <div className="dropdown-menu color-picker-menu">
              {/* Text Color Section */}
              <div className="color-section">
                <div className="color-section-title">Color</div>
                <div className="color-row">
                  {textColors.map((color, index) => {
                    const isActive = color.isDefault
                      ? activeNodes.textColor === null
                      : activeNodes.textColor === color.value;
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          if (color.value) {
                            editor.chain().focus().setColor(color.value).run();
                          } else {
                            editor.chain().focus().unsetColor().run();
                          }
                          closeAllDropdowns();
                        }}
                        className={`color-button ${color.isDefault
                          ? "color-default text-color-default"
                          : ""
                          } ${isActive ? "is-active" : ""}`}
                        style={{ border: "none" }}
                        title={color.name}
                      >
                        <span
                          className="color-letter"
                          style={{
                            color: color.display,
                            WebkitTextStroke:
                              (resolvedTheme === "dark" &&
                                color.display === "#000000") ||
                                (resolvedTheme !== "dark" &&
                                  color.display === "#ffffff")
                                ? `0.5px ${resolvedTheme === "dark"
                                  ? "#ffffff"
                                  : "#000000"
                                }`
                                : "unset",
                          }}
                        >
                          A
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Background Color Section */}
              <div className="color-section">
                <div className="color-section-title">Background</div>
                <div className="color-row">
                  {backgroundColors.map((color, index) => {
                    const isActive = color.isDefault
                      ? activeNodes.highlightColor === null
                      : activeNodes.highlightColor === color.value;
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          if (color.value) {
                            editor
                              .chain()
                              .focus()
                              .setHighlight({ color: color.value })
                              .run();
                          } else {
                            editor.chain().focus().unsetHighlight().run();
                          }
                          closeAllDropdowns();
                        }}
                        className={`color-button ${color.isDefault ? "color-default" : ""
                          } ${isActive ? "is-active" : ""}`}
                        style={{
                          backgroundColor: color.bgColor,
                          borderColor: color.isDefault
                            ? undefined
                            : color.bgColor,
                        }}
                        title={color.name}
                      >
                        <span
                          className="color-letter"
                          style={
                            color.textColor
                              ? { color: color.textColor }
                              : undefined
                          }
                        >
                          A
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Headings */}
        <div className="menu-group">
          <MenuButton
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 2 }).run();
              closeAllDropdowns();
            }}
            onMouseDown={(e) => e.preventDefault()}
            isActive={activeNodes.heading2}
            title="Heading 2"
          >
            <span className="font-bold text-sm">H2</span>
          </MenuButton>
          <MenuButton
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 3 }).run();
              closeAllDropdowns();
            }}
            onMouseDown={(e) => e.preventDefault()}
            isActive={activeNodes.heading3}
            title="Heading 3"
          >
            <span className="font-bold text-sm">H3</span>
          </MenuButton>
        </div>

        {/* Media Group */}
        <div className="menu-group">
          <MenuButton
            onClick={() => addImage()}
            onMouseDown={(e) => e.preventDefault()}
            isActive={activeNodes.image}
            title="Image"
          >
            <Image size={18} />
          </MenuButton>
          <MenuButton
            onClick={() => addLink()}
            onMouseDown={(e) => e.preventDefault()}
            isActive={activeNodes.link}
            title="Link"
          >
            <Link2 size={18} />
          </MenuButton>
          <MenuButton
            onClick={() => addFigmaEmbed()}
            onMouseDown={(e) => e.preventDefault()}
            isActive={activeNodes.figma}
            title="Figma"
          >
            <Figma size={18} />
          </MenuButton>
          <MenuButton
            onClick={() => addYoutube()}
            onMouseDown={(e) => e.preventDefault()}
            isActive={activeNodes.youtube}
            title="YouTube"
          >
            <Youtube size={18} />
          </MenuButton>
          <MenuButton
            onClick={() => {
              editor.chain().focus().toggleCode().run();
              closeAllDropdowns();
            }}
            onMouseDown={(e) => e.preventDefault()}
            isActive={activeNodes.code}
            title="Inline Code"
          >
            <Code size={18} />
          </MenuButton>
          <MenuButton
            onClick={() => {
              editor.chain().focus().setHorizontalRule().run();
              closeAllDropdowns();
            }}
            onMouseDown={(e) => e.preventDefault()}
            title="Divider"
          >
            <Minus size={18} />
          </MenuButton>
        </div>

        {/* Lists */}
        <div className="menu-group menu-dropdown">
          <MenuButton
            onClick={() => toggleDropdown("list")}
            isActive={activeNodes.bulletList || activeNodes.orderedList}
            title="Lists"
          >
            <List size={18} />
            <ChevronDown size={14} className="dropdown-icon" />
          </MenuButton>
          {showListMenu && (
            <div className="dropdown-menu">
              <button
                onClick={() => {
                  editor.chain().focus().toggleBulletList().run();
                  closeAllDropdowns();
                }}
                className={activeNodes.bulletList ? "is-active" : ""}
              >
                <List size={18} />
                <span>Bullet List</span>
              </button>
              <button
                onClick={() => {
                  editor.chain().focus().toggleOrderedList().run();
                  closeAllDropdowns();
                }}
                className={activeNodes.orderedList ? "is-active" : ""}
              >
                <ListOrdered size={18} />
                <span>Numbered List</span>
              </button>
            </div>
          )}
        </div>

        {/* Quote */}
        <div className="menu-group">
          <MenuButton
            onClick={() => {
              editor.chain().focus().toggleBlockquote().run();
              closeAllDropdowns();
            }}
            onMouseDown={(e) => e.preventDefault()}
            isActive={activeNodes.blockquote}
            title="Quote"
          >
            <Quote size={18} />
          </MenuButton>
        </div>

        {/* Table */}
        <div className="menu-group">
          <MenuButton
            onClick={() => addTable()}
            onMouseDown={(e) => e.preventDefault()}
            isActive={activeNodes.table}
            title="Insert Table"
          >
            <TableIcon size={18} />
          </MenuButton>
        </div>

        {/* Hidden Image Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageFile}
          style={{ display: "none" }}
        />

        {/* Table Tools Animation Wrapper */}
        <div className={`table-tools-wrapper ${isInTable ? "visible" : ""}`}>
          {/* Add Column */}
          <div className="menu-group">
            <MenuButton
              onClick={() => {
                editor.chain().focus().addColumnAfter().run();
                closeAllDropdowns();
              }}
              title="Add Column"
            >
              <Columns size={18} />
            </MenuButton>
          </div>

          {/* Delete Column */}
          <div className="menu-group">
            <MenuButton
              onClick={() => {
                editor.chain().focus().deleteColumn().run();
                closeAllDropdowns();
              }}
              title="Delete Column"
            >
              <Minus size={18} style={{ transform: "rotate(90deg)" }} />
            </MenuButton>
          </div>

          {/* Add Row */}
          <div className="menu-group">
            <MenuButton
              onClick={() => {
                editor.chain().focus().addRowAfter().run();
                closeAllDropdowns();
              }}
              title="Add Row"
            >
              <Rows size={18} />
            </MenuButton>
          </div>

          {/* Delete Row */}
          <div className="menu-group">
            <MenuButton
              onClick={() => {
                editor.chain().focus().deleteRow().run();
                closeAllDropdowns();
              }}
              title="Delete Row"
            >
              <Minus size={18} />
            </MenuButton>
          </div>

          {/* Delete Table */}
          <div className="menu-group">
            <MenuButton
              onClick={() => {
                editor.chain().focus().deleteTable().run();
                closeAllDropdowns();
              }}
              title="Delete Table"
              className="text-red-500 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={18} />
            </MenuButton>
          </div>
        </div>

        {/* Undo/Redo */}
        <div className="menu-group">
          <MenuButton
            onClick={() => {
              editor.chain().focus().undo().run();
              closeAllDropdowns();
            }}
            onMouseDown={(e) => e.preventDefault()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo2 size={18} />
          </MenuButton>
          <MenuButton
            onClick={() => {
              editor.chain().focus().redo().run();
              closeAllDropdowns();
            }}
            onMouseDown={(e) => e.preventDefault()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo2 size={18} />
          </MenuButton>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default TiptapMenuBar;
