import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import FigmaNodeView from "./FigmaNodeView";

export const FigmaExtension = Node.create({
  name: "figma",

  group: "block",

  atom: true,

  addAttributes() {
    return {
      embedCode: {
        default: "",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="figma"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "figma" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FigmaNodeView, {
      stopEvent: () => true,
    });
  },
});
