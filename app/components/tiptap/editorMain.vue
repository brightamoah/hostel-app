<script setup lang="ts">
const editor = useEditor({
  editorProps: {
    attributes: {
      class:
        "bg-muted p-6 focus:outline-none max-w-none min-h-[20rem] max-h-[40rem] overflow-y-auto rounded-b-xl prose prose-neutral dark:prose-invert prose-sm sm:prose-base w-full text-default prose-headings:text-highlighted prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-highlighted prose-code:text-primary prose-code:px-1 prose-code:py-0.5 prose-code:rounded-sm prose-code:bg-muted prose-blockquote:border-l-muted prose-blockquote:text-muted prose-blockquote:pl-4 prose-blockquote:not-italic",
    },
  },

  content: ``,
  extensions: [
    TiptapStarterKit,
    TiptapTextAlign.configure({
      types: ["heading", "paragraph", "blockquote"],
    }),
    TiptapPlaceholder.configure({
      emptyEditorClass: "is-editor-empty italic",
      placeholder: "Start typing your content here.....",
    }),
    TiptapHighlight,
    TiptapTaskList,
    TiptapTaskItem,
  ],
});

const tiptapButtonGroup = getTiptapButtonGroup(editor);

const mainButtonGroup = computed(() => tiptapButtonGroup.filter(group => group.name !== "actions"));
const actionButtonGroup = computed(() => tiptapButtonGroup.find(group => group.name === "actions")!);

onBeforeUnmount(() => {
  unref(editor)?.destroy();
});
</script>

<template>
  <div class="shadow-lg mx-auto my-8 border border-muted rounded-xl max-w-3xl">
    <section
      v-if="editor"
      class="flex justify-between items-center px-3 py-2 border-muted border-b rounded-t-xl w-full"
    >
      <div class="inline-flex flex-wrap items-center gap-x-0.5">
        <template
          v-for="(group, groupIndex) in mainButtonGroup"
          :key="group.name"
        >
          <template
            v-for="button in group.buttons"
            :key="button.name"
          >
            <TiptapDropdown
              v-if="button.isDropdown && button.options"
              :options="button.options"
              :tooltip="button.tooltip"
              :default-icon="button.icon"
            />

            <UTooltip
              v-else
              :text="button.tooltip!"
              :prevent="!button.tooltip"
              arrow
              :ui="{
                content: 'dark:bg-neutral-950',
                text: 'text-xs',
                arrow: 'dark:before:bg-neutral-950',
              }"
              :shortcuts="button.keyboard"
            >
              <UButton
                variant="ghost"
                color="neutral"
                size="xs"
                :icon="button.icon"
                :disabled="button.isDisabled?.()"
                :class="{
                  'rounded bg-transparent text-primary font-semibold': button.isActive?.(),
                }"
                class="transition-colors duration-150"
                @click="button.action"
              />
            </UTooltip>
          </template>

          <USeparator
            v-if="groupIndex < mainButtonGroup.length - 1"
            orientation="vertical"
            color="neutral"
            size="sm"
            class="mx-1.5 h-5"
          />
        </template>
      </div>

      <div class="flex items-center gap-x-0.5">
        <div
          v-for="button in actionButtonGroup.buttons"
          :key="button.name"
        >
          <TiptapDropdown
            v-if="button.isDropdown && button.options"
            :options="button.options"
            :tooltip="button.tooltip"
            :default-icon="button.icon"
          />
          <!-- If Add button is not a dropdown, render UButton here -->
        </div>

        <UTooltip
          text="Toggle theme"
          arrow
        >
          <UColorModeButton
            size="xs"
            class="cursor-pointer"
          />
        </UTooltip>
      </div>
    </section>

    <TiptapEditorContent :editor />
  </div>
</template>

<style>
  p.is-editor-empty:first-child::before {
  color: var(--ui-text-muted);
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
</style>
