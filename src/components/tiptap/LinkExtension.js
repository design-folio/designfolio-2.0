import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import LinkNodeView from './LinkNodeView';

export const LinkNode = Node.create({
  name: 'linkNode',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      href: {
        default: '',
      },
      text: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-link-node]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-link-node': '' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(LinkNodeView);
  },
});
