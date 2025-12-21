import { InputRule } from "@tiptap/core";

export const TiptapExtensions = [
  TiptapStarterKit.configure({
    horizontalRule: false,
    dropcursor: {
      color: "#DBEAFE",
      width: 4,
    },
    gapcursor: false,
  }).extend() as any,
  TiptapHorizontalRule.extend({
    addInputRules() {
      return [
        new InputRule({
          find: /^(?:---|—-|___\s|\*\*\*\s)$/,
          handler: ({ state, range }) => {
            const attributes = {};

            const { tr } = state;
            const start = range.from;
            const end = range.to;

            tr.insert(start - 1, this.type.create(attributes)).delete(
              tr.mapping.map(start),
              tr.mapping.map(end),
            );
          },
        }),
      ];
    },
  }).configure({
    HTMLAttributes: {
      class: "border-t border-accented",
    },
  }),
  TiptapTextAlign.configure({
    types: ["heading", "paragraph", "blockquote"],
  }),
  TiptapPlaceholder.configure({
    emptyEditorClass: "is-editor-empty italic",
    placeholder: "Start typing your content here.....",
  }),
  TiptapHighlight.configure({
    multicolor: true,
  }),
  TiptapTextStyleKit,
  TiptapTaskList,
  TiptapTaskItem,
  TiptapCharacterCount.configure({
    limit: 5000,
  }),
];
