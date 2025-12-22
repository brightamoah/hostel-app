<script lang="ts" setup>
import type { TiptapEditor } from "#imports";

const { editor } = defineProps<{
  editor: TiptapEditor;
}>();

const items = [
  {
    name: "Paragraph",
    icon: "i-material-symbols-format-paragraph-rounded",
    command: () =>
      editor.chain().focus().toggleNode("paragraph", "paragraph").run(),
    isActive: () =>
      editor.isActive("paragraph")
      && !editor.isActive("bulletList")
      && !editor.isActive("orderedList"),
  },
  {
    name: "Heading 1",
    icon: "i-lucide-heading-1",
    command: () =>
      editor.chain().focus().toggleNode("heading", "heading", { level: 1 }).run(),
    isActive: () => editor.isActive("heading", { level: 1 }),
  },
  {
    name: "Heading 2",
    icon: "i-lucide-heading-2",
    command: () =>
      editor.chain().focus().toggleNode("heading", "heading", { level: 2 }).run(),
    isActive: () => editor.isActive("heading", { level: 2 }),
  },
  {
    name: "Heading 3",
    icon: "i-lucide-heading-3",
    command: () =>
      editor.chain().focus().toggleNode("heading", "heading", { level: 3 }).run(),
    isActive: () => editor.isActive("heading", { level: 3 }),
  },
  {
    name: "To-do List",
    icon: "i-lucide-list-check",
    command: () => editor.chain().focus().toggleTaskList().run(),
    isActive: () => editor.isActive("taskItem"),
  },
  {
    name: "Bullet List",
    icon: "i-lucide-list",
    command: () => editor.chain().focus().toggleBulletList().run(),
    isActive: () => editor.isActive("bulletList"),
  },
  {
    name: "Numbered List",
    icon: "i-lucide-list-ordered",
    command: () => editor.chain().focus().toggleOrderedList().run(),
    isActive: () => editor.isActive("orderedList"),
  },
  {
    name: "Quote",
    icon: "i-lucide-quote",
    command: () =>
      editor
        .chain()
        .focus()
        .toggleNode("paragraph", "paragraph")
        .toggleNode("blockquote", "blockquote")
        .run(),
    isActive: () => editor.isActive("blockquote"),
  },
  {
    name: "Code",
    icon: "i-lucide-square-code",
    command: () => editor.chain().focus().toggleCodeBlock().run(),
    isActive: () => editor.isActive("codeBlock"),
  },
];

const activeItem = computed(
  () =>
    items.filter(item => item.isActive()).pop() ?? {
      name: "Multiple",
    },
);
</script>

<template>
  <UPopover
    :content="{ side: 'bottom', align: 'start', sideOffset: 2 }"
    :ui="{
      content: 'w-48 flex-col overflow-hidden overflow-y-auto rounded border border-muted bg-default p-1 shadow animate-in fade-in slide-in-from-top-1 my-1 flex max-h-80',
    }"
  >
    <UButton
      trailing-icon="i-lucide-chevron-down"
      variant="ghost"
      color="neutral"
      size="sm"
      class="flex items-center font-medium text-sm"
      :label="activeItem.name"
    />

    <template #content="{ close }">
      <UButton
        v-for="item in items"
        :key="item.name"
        :class="{
          'text-primary': activeItem.name === item.name,
        }"
        variant="ghost"
        color="neutral"
        class="group flex justify-between items-center hover:bg-elevated p-2 px-2 py-1 rounded-xl cursor-pointer"
        @click="item.command(); close()"
      >
        <div class="flex items-center space-x-2">
          <div class="px-0.5 border border-muted group-[.text-primary]:border-primary rounded-sm group-[.text-primary]:text-primary">
            <UIcon
              :name="item.icon"
              class="size-3.5"
            />
          </div>

          <span class="text-muted group-[.text-primary]:text-primary">{{ item.name }}</span>
        </div>

        <UIcon
          v-if="activeItem.name === item.name"
          name="i-lucide-check"
          class="size-4"
        />
      </UButton>
    </template>
  </UPopover>
</template>

<style scoped>

</style>
