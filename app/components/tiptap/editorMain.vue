<script setup lang="ts">
import { TiptapExtensions } from "./extensions";

const announcementStore = useAnnouncementStore();
const { isMobile } = storeToRefs(announcementStore);

const content = defineModel<string>("content");

const editor = useEditor({
  editorProps: {
    attributes: {
      class:
        "bg-muted dark:prose-invert p-5 rounded-b-xl focus:outline-none w-full max-w-full min-h-60 max-h-160 overflow-y-auto prose-headings:font-newsreader font-normal text-default sm:prose-base prose prose-sm prose-neutral",
    },
  },

  content: content.value,
  extensions: [...TiptapExtensions],
  onUpdate: ({ editor }) => content.value = editor.getHTML(),
});

const tiptapButtonGroup = useTiptapButtonGroup(editor, isMobile);

const mainButtonGroup = computed(() => tiptapButtonGroup.value.filter(group => group.name !== "actions"));
const actionButtonGroup = computed(() => tiptapButtonGroup.value.find(group => group.name === "actions")!);

const charCount = computed(() => editor.value?.storage.characterCount.characters() || 0);

const charLimit = 5000;

const characterStatus = computed(() => {
  const percent = (charCount.value / charLimit) * 100;
  if (percent >= 100) return "error";
  if (percent >= 90) return "warning";
  return "normal";
});

onBeforeUnmount(() => {
  unref(editor)?.destroy();
});
</script>

<template>
  <div class="shadow-lg mx-auto border border-muted rounded-xl w-full">
    <section
      v-if="editor"
      class="flex justify-between items-center px-3 py-2 border-muted border-b rounded-t-xl w-full"
    >
      <div class="inline-flex flex-wrap items-center gap-x-px md:gap-x-0.5">
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
              :is-mobile
            />

            <TiptapLinkSelector
              v-else-if="button.name === 'link'"
              :editor
              :tooltip="button.tooltip"
              :icon="button.icon"
              :disabled="button.isDisabled?.()"
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
            class="mx-px md:mx-1.5 h-5"
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
            :is-mobile
          />
        </div>

        <UColorModeButton />
      </div>
    </section>

    <TiptapBubble
      v-if="editor"
      :editor
    />

    <TiptapEditorContent :editor />

    <div class="px-3 py-2 w-50">
      <div class="flex justify-between items-center">
        <UProgress
          v-model="charCount"
          :max="charLimit"
          :size="isMobile ? 'sm' : 'md'"
          :color="charCountMap[characterStatus].progress"
          class="flex-1"
        />

        <p
          class="ml-3 text-xs whitespace-nowrap"
          :class="`text-${charCountMap[characterStatus].description}`"
        >
          {{ charCount }} / {{ charLimit }}
        </p>
      </div>
    </div>
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
