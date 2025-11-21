import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import YoutubeNodeView from "./YoutubeNodeView";

export const YoutubeNode = Node.create({
  name: "youtubeNode",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: {
        default: "",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-youtube-node]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-youtube-node": "" }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(YoutubeNodeView, {
      stopEvent: () => true,
    });
  },
});
