import { Extension } from "@tiptap/core";

export const SelectAllExtension = Extension.create({
  name: "selectAll",

  addKeyboardShortcuts() {
    return {
      "Mod-a": () => {
        return this.editor.commands.selectAll();
      },
    };
  },
});
