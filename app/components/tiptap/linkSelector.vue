<script lang="ts" setup>
import type { TiptapEditor } from "#imports";

const { editor, tooltip, icon, disabled } = defineProps<{
  editor: TiptapEditor;
  icon?: string;
  tooltip?: string;
  disabled?: boolean;
}>();

const state = reactive<LinkSchema>({
  link: "",
  isOpen: false,
});

watch([() => editor.getAttributes("link").href, () => state.isOpen], ([newHref, isOpen]) => {
  if (isOpen) {
    state.link = newHref || "";
  }
});

function submitLink() {
  const url = state.link.trim();

  state.isOpen = false;

  if (!url) editor.chain().focus().extendMarkRange("link").unsetLink().run();

  editor
    .chain()
    .focus()
    .extendMarkRange("link")
    .setLink({ href: url })
    .run();
}

function removeLink() {
  state.isOpen = false;
  editor.chain().focus().unsetLink().run();
}
</script>

<template>
  <UPopover
    v-model:open="state.isOpen"
    :content="{ side: 'bottom', align: 'center', sideOffset: 2 }"
    arrow
  >
    <UTooltip
      :text="tooltip"
      :prevent="!tooltip"
      :ui="{
        content: 'dark:bg-neutral-950',
        text: 'text-xs',
        arrow: 'dark:before:bg-neutral-950',
      }"
      arrow
    >
      <UButton
        variant="ghost"
        color="neutral"
        size="xs"
        :icon="icon || 'i-lucide-link'"
        :disabled
        :class="{
          'text-primary': editor.isActive('link'),
        }"
        class="flex items-center space-x-2 px-3 py-1.5 h-full font-medium text-sm transition-colors duration-150"
      />
    </UTooltip>

    <template #content>
      <UForm
        :state
        :schema="linkSchema"
        class="p-4 w-full"
        @submit.prevent="submitLink"
      >
        <UFormField
          required
          size="md"
          name="link"
          class="w-full"
        >
          <UFieldGroup>
            <UInput
              v-model="state.link"
              placeholder="https://example.com"
              class="flex-1 w-full"
              autofocus
            />

            <UButton
              v-if="editor.getAttributes('link').href"
              icon="i-lucide-trash-2"
              variant="subtle"
              color="neutral"
              size="md"
              class="cursor-pointer shrink-0"
              @click="removeLink"
            />

            <UButton
              v-else
              icon="i-lucide-check"
              variant="subtle"
              color="neutral"
              size="md"
              class="cursor-pointer shrink-0"
              type="submit"
            />
          </UFieldGroup>
        </UFormField>
      </UForm>
    </template>
  </UPopover>
</template>

<style scoped>

</style>
