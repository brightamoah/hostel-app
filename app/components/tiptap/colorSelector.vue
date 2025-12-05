<script lang="ts" setup>
import type { TiptapEditor } from "#imports";

const { editor } = defineProps<{
  editor: TiptapEditor;
}>();

const TEXT_COLORS = [
  {
    name: "Default",
    color: "var(--text-default)",
  },
  {
    name: "Purple",
    color: "#9333EA",
  },
  {
    name: "Red",
    color: "#E00000",
  },
  {
    name: "Yellow",
    color: "#EAB308",
  },
  {
    name: "Blue",
    color: "#2563EB",
  },
  {
    name: "Green",
    color: "#008A00",
  },
  {
    name: "Orange",
    color: "#FFA500",
  },
  {
    name: "Pink",
    color: "#BA4081",
  },
  {
    name: "Gray",
    color: "#A8A29E",
  },
];

const HIGHLIGHT_COLORS = [
  {
    name: "Default",
    color: "var(--highlight-default)",
  },
  {
    name: "Purple",
    color: "var(--highlight-purple)",
  },
  {
    name: "Red",
    color: "var(--highlight-red)",
  },
  {
    name: "Yellow",
    color: "var(--highlight-yellow)",
  },
  {
    name: "Blue",
    color: "var(--highlight-blue)",
  },
  {
    name: "Green",
    color: "var(--highlight-green)",
  },
  {
    name: "Orange",
    color: "var(--highlight-orange)",
  },
  {
    name: "Pink",
    color: "var(--highlight-pink)",
  },
  {
    name: "Gray",
    color: "var(--highlight-gray)",
  },
];

const activeColorItem = computed(() =>
  TEXT_COLORS.find(({ color }) => editor.isActive("textStyle", { color })),
);

const activeHighlightItem = computed(() =>
  HIGHLIGHT_COLORS.find(({ color }) =>
    editor.isActive("highlight", { color }),
  ),
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
    >
      <span
        class="px-1 rounded-sm"
        :style="{
          color: activeColorItem?.color,
          backgroundColor: activeHighlightItem?.color,
        }"
      >
        A
      </span>
    </UButton>

    <template #content="{ close }">
      <div class="my-1 px-2 text-toned text-sm">
        Color
      </div>

      <UButton
        v-for="textColor in TEXT_COLORS"
        :key="textColor.name"
        variant="ghost"
        color="neutral"
        size="sm"
        class="flex items-center font-medium text-sm"
        @click="
          () => {
            editor.commands.unsetColor();
            textColor.name !== 'Default'
              && editor
                .chain()
                .focus()
                .setColor(textColor.color || '')
                .run();
            close();
          }
        "
      >
        <div class="flex items-center space-x-2">
          <div
            class="px-1 py-px border border-muted rounded-sm font-medium"
            :style="{ color: textColor.color }"
          >
            A
          </div>

          <span>{{ textColor.name }}</span>
        </div>

        <UIcon
          v-if="editor.isActive('textStyle', { color: textColor.color })"
          name="i-lucide-check"
          class="size-4"
        />
      </UButton>

      <div class="mt-2 mb-1 px-2 text-toned text-sm">
        Background
      </div>

      <UButton
        v-for="highlightColor in HIGHLIGHT_COLORS"
        :key="highlightColor.name"
        variant="ghost"
        color="neutral"
        size="sm"
        class="flex items-center font-medium text-sm"
        @click="
          () => {
            if (highlightColor.name === 'Default') editor.chain().focus().unsetHighlight().run();

            else editor.chain().focus().setHighlight({ color: highlightColor.color }).run();

            close();
          }
        "
      >
        <div class="flex items-center space-x-2">
          <div
            class="px-1 py-px border border-muted rounded-sm font-medium"
            :style="{ backgroundColor: highlightColor.color }"
          >
            A
          </div>

          <span>{{ highlightColor.name }}</span>
        </div>

        <UIcon
          v-if="editor.isActive('highlight', { color: highlightColor.color })"
          name="i-lucide-check"
          class="size-4"
        />
      </UButton>
    </template>
  </UPopover>
</template>

<style scoped></style>
