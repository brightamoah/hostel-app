export function useTiptapButtonGroup(editor: TiptapEditorType, isMobile: MaybeRefOrGetter<boolean>) {
  const formattingButtons: Button[] = [
    {
      name: "bold",
      icon: "i-lucide-bold",
      tooltip: "Bold",
      keyboard: ["meta", "B"],
      action: () => editor.value?.chain().focus().toggleMark("bold").run(),
      isActive: () => editor.value?.isActive("bold"),
      isDisabled: () =>
        !editor.value?.can().chain().focus().toggleMark("bold").run(),
    },
    {
      name: "italic",
      icon: "i-lucide-italic",
      tooltip: "Italic",
      keyboard: ["meta", "I"],
      action: () => editor.value?.chain().focus().toggleMark("italic").run(),
      isActive: () => editor.value?.isActive("italic"),
      isDisabled: () =>
        !editor.value?.can().chain().focus().toggleMark("italic").run(),
    },
    {
      name: "strike",
      icon: "i-lucide-strikethrough",
      tooltip: "Strikethrough",
      keyboard: ["meta", "shift", "S"],
      action: () => editor.value?.chain().focus().toggleNode("strike", "strike").run(),
      isActive: () => editor.value?.isActive("strike"),
      isDisabled: () =>
        !editor.value?.can().chain().focus().toggleNode("strike", "strike").run(),
    },
    {
      name: "code",
      icon: "i-lucide-code",
      tooltip: "Inline Code",
      keyboard: ["meta", "E"],
      action: () => editor.value?.chain().focus().toggleMark("code").run(),
      isActive: () => editor.value?.isActive("code"),
      isDisabled: () =>
        !editor.value?.can().chain().focus().toggleMark("code").run(),
    },
    {
      name: "underline",
      icon: "i-lucide-underline",
      tooltip: "Underline",
      keyboard: ["meta", "U"],
      action: () => editor.value?.chain().focus().toggleUnderline().run(),
      isActive: () => editor.value?.isActive("underline"),
      isDisabled: () =>
        !editor.value?.can().chain().focus().toggleUnderline().run(),
    },
  ];

  const blockButtons: Button[] = [
    {
      name: "blockquote",
      icon: "i-lucide-quote",
      tooltip: "Quote",
      keyboard: ["meta", "shift", "B"],
      action: () => editor.value?.chain().focus().toggleNode("blockquote", "blockquote").run(),
      isActive: () => editor.value?.isActive("blockquote"),
    },
    {
      name: "code-block",
      icon: "i-lucide-square-code",
      tooltip: "Code Block",
      keyboard: ["meta", "alt", "C"],
      action: () => editor.value?.chain().focus().toggleCodeBlock().run(),
      isActive: () => editor.value?.isActive("codeBlock"),
    },
    {
      name: "link",
      icon: "i-lucide-link",
      tooltip: "Link",
      keyboard: ["meta", "K"],
      action: () => editor.value?.chain().focus().run(),
      isActive: () => editor.value?.isActive("link"),
    },
  ];

  const alignmentButtons: Button[] = [
    {
      name: "align-left",
      icon: "i-lucide-align-left",
      tooltip: "Align Left",
      keyboard: ["meta", "shift", "L"],
      action: () => editor.value?.chain().focus().setTextAlign("left").run(),
      isActive: () => editor.value?.isActive({ textAlign: "left" }),
      isDisabled: () =>
        !editor.value?.can().chain().focus().setTextAlign("left").run(),
    },
    {
      name: "align-center",
      icon: "i-lucide-align-center",
      tooltip: "Align Center",
      keyboard: ["meta", "shift", "E"],
      action: () =>
        editor.value?.chain().focus().setTextAlign("center").run(),
      isActive: () => editor.value?.isActive({ textAlign: "center" }),
      isDisabled: () =>
        !editor.value?.can().chain().focus().setTextAlign("center").run(),
    },
    {
      name: "align-right",
      icon: "i-lucide-align-right",
      tooltip: "Align Right",
      keyboard: ["meta", "shift", "R"],
      action: () => editor.value?.chain().focus().setTextAlign("right").run(),
      isActive: () => editor.value?.isActive({ textAlign: "right" }),
      isDisabled: () =>
        !editor.value?.can().chain().focus().setTextAlign("right").run(),
    },
    {
      name: "align-justify",
      icon: "i-lucide-align-justify",
      tooltip: "Justify Text",
      keyboard: ["meta", "shift", "J"],
      action: () =>
        editor.value?.chain().focus().setTextAlign("justify").run(),
      isActive: () => editor.value?.isActive({ textAlign: "justify" }),
      isDisabled: () =>
        !editor.value?.can().chain().focus().setTextAlign("justify").run(),
    },
  ];

  return computed(() => {
    const mobile = unref(isMobile);

    const tiptapButtonGroups: ButtonGroup[] = [
      {
        name: "history",
        buttons: [
          {
            name: "undo",
            icon: "i-lucide-undo-2",
            tooltip: "Undo",
            keyboard: ["meta", "Z"],
            action: () => editor.value?.chain().focus().undo().run(),
            isActive: () => false,
            isDisabled: () => !editor.value?.can().chain().focus().undo().run(),
          },
          {
            name: "redo",
            icon: "i-lucide-redo-2",
            tooltip: "Redo",
            keyboard: ["meta", "shift", "Z"],
            action: () => editor.value?.chain().focus().redo().run(),
            isActive: () => false,
            isDisabled: () => !editor.value?.can().chain().focus().redo().run(),
          },
        ],
      },
      {
        name: "headings",
        buttons: [
          {
            name: "heading-dropdown",
            icon: "i-lucide-heading",
            tooltip: "Headings",
            isDropdown: true,
            options: [
              {
                name: "paragraph",
                label: "Paragraph",
                icon: "i-material-symbols-format-paragraph-rounded",
                tooltip: "Paragraph",
                keyboard: ["meta", "alt", "0"],
                action: () => editor.value?.chain().focus().setNode("paragraph").run(),
                isActive: () => editor.value?.isActive("paragraph"),
              },
              {
                name: "heading-1",
                label: "Heading 1",
                icon: "i-lucide-heading-1",
                tooltip: "Heading 1",
                keyboard: ["meta", "alt", "1"],
                action: () =>
                  editor.value?.chain().focus().toggleNode("heading", "heading", { level: 1 }).run(),
                isActive: () => editor.value?.isActive("heading", { level: 1 }),
              },
              {
                name: "heading-2",
                label: "Heading 2",
                icon: "i-lucide-heading-2",
                tooltip: "Heading 2",
                keyboard: ["meta", "alt", "2"],
                action: () =>
                  editor.value?.chain().focus().toggleNode("heading", "heading", { level: 2 }).run(),
                isActive: () => editor.value?.isActive("heading", { level: 2 }),
              },
              {
                name: "heading-3",
                label: "Heading 3",
                icon: "i-lucide-heading-3",
                tooltip: "Heading 3",
                keyboard: ["meta", "alt", "3"],
                action: () =>
                  editor.value?.chain().focus().toggleNode("heading", "heading", { level: 3 }).run(),
                isActive: () => editor.value?.isActive("heading", { level: 3 }),
              },
            ],
          },
        ],
      },
      {
        name: "lists",
        buttons: [
          {
            name: "list-dropdown",
            tooltip: "Lists",
            icon: "i-lucide-list",
            isDropdown: true,
            options: [
              {
                name: "bullet-list",
                label: "Bullet List",
                icon: "i-lucide-list",
                tooltip: "Bullet List",
                keyboard: ["meta", "shift", "8"],
                action: () =>
                  editor.value?.chain().focus().toggleBulletList().run(),
                isActive: () => editor.value?.isActive("bulletList"),
              },
              {
                name: "task-list",
                label: "Task List",
                icon: "i-lucide-list-todo",
                tooltip: "Task List",
                keyboard: ["meta", "shift", "9"],
                action: () => editor.value?.chain().focus().toggleTaskList().run(),
                isActive: () => editor.value?.isActive("taskList"),
              },
              {
                name: "ordered-list",
                label: "Numbered",
                icon: "i-lucide-list-ordered",
                tooltip: "Numbered List",
                keyboard: ["meta", "shift", "7"],
                action: () =>
                  editor.value?.chain().focus().toggleOrderedList().run(),
                isActive: () => editor.value?.isActive("orderedList"),
              },
            ],
          },
        ],
      },

      mobile
        ? {
            name: "formatting",
            buttons: [
              {
                name: "format-dropdown",
                icon: "i-lucide-type",
                tooltip: "Formatting",
                isDropdown: true,
                options: formattingButtons,
              },
            ],
          }
        : {
            name: "formatting",
            buttons: formattingButtons,
          },

      mobile
        ? {
            name: "blocks",
            buttons: [
              {
                name: "block-dropdown",
                icon: "i-lucide-layout-panel-top",
                tooltip: "Blocks",
                isDropdown: true,
                options: blockButtons,
              },
            ],
          }
        : {
            name: "blocks",
            buttons: blockButtons,
          },

      mobile
        ? {
            name: "alignment",
            buttons: [
              {
                name: "alignment-dropdown",
                icon: "i-lucide-align-justify",
                tooltip: "Alignment",
                isDropdown: true,
                options: alignmentButtons,
              },
            ],
          }
        : {
            name: "alignment",
            buttons: alignmentButtons,
          },

      {
        name: "actions",
        buttons: [
          {
            name: "add",
            icon: "i-lucide-plus",
            tooltip: "Add",
            isDropdown: true,
            options: [
              {
                name: "horizontal-rule",
                label: "Horizontal Line",
                icon: "i-lucide-minus",
                tooltip: "Add horizontal rule",
                action: () =>
                  editor.value?.chain().focus().setNode("horizontalRule").run(),
              },
              {
                name: "hard-break",
                label: "Line Break",
                icon: "i-lucide-wrap-text",
                tooltip: "Add line break",
                action: () => editor.value?.chain().focus().setNode("hardBreak").run(),
              },
              {
                name: "clear-formatting",
                label: "Clear Formatting",
                icon: "i-lucide-remove-formatting",
                tooltip: "Remove all formatting",
                action: () =>
                  editor.value?.chain().focus().unsetAllMarks().clearNodes().run(), // .clearNodes() for block formats
              },
            ],
          },
        ],
      },
    ];

    return tiptapButtonGroups;
  });
}
