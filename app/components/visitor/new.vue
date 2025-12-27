<script setup lang="ts">
const visitorStore = useVisitorStore();
const { registerVisitorState, isLoading } = storeToRefs(visitorStore);

const { submitVisitorForm } = visitorStore;

const form = useTemplateRef("form");
</script>

<template>
  <UModal
    title="Register New Visitor"
    description="Fill in the details below register visitor."
    :dismissible="false"
    :ui="{
      footer: 'justify-end',
      content: 'w-[90%] max-w-4xl  rounded-lg shadow-lg ring ring-default overflow-hidden',
      title: 'font-newsreader text-xl font-semibold',
      close: 'cursor-pointer',
    }"
  >
    <UButton
      variant="solid"
      color="primary"
      size="lg"
      label="Add New Visitor"
      icon="i-lucide-user-plus"
      class="justify-center items-center w-full sm:w-auto cursor-pointer"
    />

    <template #body>
      <VisitorForm
        ref="form"
        v-model:state="registerVisitorState as CreateVisitor"
        :schema="registerVisitorSchema.omit({ status: true, hostelId: true, studentId: true })"
        @submit="submitVisitorForm"
      />
    </template>

    <template #footer="{ close }">
      <div class="flex gap-2.5">
        <UButton
          label="Cancel"
          color="error"
          variant="outline"
          class="cursor-pointer"
          @click="close"
        />

        <UButton
          color="primary"
          icon="i-lucide-send"
          class="cursor-pointer"
          :label=" isLoading ? 'Submitting...' : 'Submit Visitor'"
          :loading="isLoading"
          @click="form?.visitorForm?.submit()"
        />
      </div>
    </template>
  </UModal>
</template>

<style scoped>

</style>
