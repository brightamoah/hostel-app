<script lang="ts" setup>
import type { TiptapEditor } from "#imports";

import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/vue-3/menus";

const { editor } = defineProps<{
  editor: TiptapEditor;
}>();

const items = [
  {
    name: "bold",
    isActive: () => editor?.isActive("bold"),
    command: () => editor?.chain().focus().toggleBold().run(),
    icon: "i-lucide-bold",
  },
  {
    name: "italic",
    isActive: () => editor?.isActive("italic"),
    command: () => editor?.chain().focus().toggleItalic().run(),
    icon: "i-lucide-italic",
  },
  {
    name: "underline",
    isActive: () => editor?.isActive("underline"),
    command: () => editor?.chain().focus().toggleUnderline().run(),
    icon: "i-lucide-underline",
  },
  {
    name: "strike",
    isActive: () => editor?.isActive("strike"),
    command: () => editor?.chain().focus().toggleStrike().run(),
    icon: "i-lucide-strikethrough",
  },
  {
    name: "code",
    isActive: () => editor?.isActive("code"),
    command: () => editor?.chain().focus().toggleCode().run(),
    icon: "i-lucide-code",
  },
];
</script>

<template>
  <TiptapBubbleMenu
    :editor
    plugin-key="bubbleMenu"
    class="flex bg-default shadow border border-accented rounded-lg w-fit"
  >
    <div class="flex divide-x divide-accented">
      <TiptapNodeSelector :editor />

      <TiptapLinkSelector :editor />

      <div>
        <UButton
          v-for="item in items"
          :key="item.name"
          :icon="item.icon"
          :class="{
            'text-primary': item.isActive(),
          }"
          variant="ghost"
          color="neutral"
          class="hover:bg-accented p-2 rounded cursor-pointer"
          @click="item.command()"
        />
      </div>

      <TiptapColorSelector :editor />
    </div>
  </TiptapBubbleMenu>
</template>

<style scoped>

</style>
