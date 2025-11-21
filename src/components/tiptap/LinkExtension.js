import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import LinkNodeView from "./LinkNodeView";

export const LinkNode = Node.create({
  name: "linkNode",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      href: {
        default: "",
      },
      text: {
        default: "",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-link-node]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-link-node": "" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(LinkNodeView, {
      stopEvent: (event) => {
        // Prevent ProseMirror from handling events in the node view
        const tagName = event.target?.tagName?.toUpperCase();
        if (
          tagName &&
          ["INPUT", "TEXTAREA", "BUTTON", "SELECT"].includes(tagName)
        ) {
          return true;
        }
        // Stop all keyboard events within the node view
        if (
          event.type === "keydown" ||
          event.type === "keyup" ||
          event.type === "keypress"
        ) {
          return true;
        }
        return false;
      },
    });
  },
});
