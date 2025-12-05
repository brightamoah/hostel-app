<script lang="ts" setup>
import type { TiptapEditor } from "#imports";

const { editor, label } = defineProps<{
  editor: TiptapEditor;
  label?: string;
}>();

const state = reactive<LinkSchema>({
  link: editor.getAttributes("link").href,
});

function submitLink() {
  const url = state.link.trim();
  if (url) {
    editor.chain().focus().setLink({ href: url }).run();
  }
}
</script>

<template>
  <UPopover
    arrow
    :content="{ side: 'bottom', align: 'center' }"
  >
    <UButton
      icon="i-lucide-link"
      variant="ghost"
      color="neutral"
      size="sm"
      :label
      class="flex items-center space-x-2 px-3 py-1.5 h-full font-medium text-sm"
    />

    <template #content>
      <UForm
        :state
        :schema="linkSchema"
        class="p-4"
        @submit.prevent="submitLink"
      >
        <UFormField
          required
          name="link"
          class="w-full"
        >
          <div class="flex items-center gap-2">
            <UInput
              v-model="state.link"
              size="sm"
              placeholder="Paste or type a link"
              class="w-full"
            />

            <UButton
              v-if="editor.getAttributes('link').href"
              icon="i-lucide-trash-2"
              variant="subtle"
              color="neutral"
              size="xs"
              class="shrink-0"
              @click="editor.chain().focus().unsetLink().run()"
            />

            <UButton
              v-else
              icon="i-lucide-check"
              variant="subtle"
              color="neutral"
              size="xs"
              class="shrink-0"
              type="submit"
            />
          </div>
        </UFormField>
      </UForm>
    </template>
  </UPopover>
</template>

<style scoped>

</style>
