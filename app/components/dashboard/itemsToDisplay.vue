<script lang="ts" setup>
interface ItemsToDisplay {
  itemsToDisplay: {
    label: Capitalize<any>;
    type: "checkbox";
    checked: any;
    onUpdateChecked: (checked: boolean) => void;
    onSelect: (e?: Event | undefined) => void;
  }[] | undefined;
}

const { itemsToDisplay } = defineProps<ItemsToDisplay>();
</script>

<template>
  <UDropdownMenu
    arrow
    :items="itemsToDisplay"
    :content="{ align: 'end' }"
  >
    <UButton
      label="Display"
      color="neutral"
      variant="outline"
      trailing-icon="i-lucide-settings-2"
      size="lg"
      class="justify-center items-center w-full sm:w-auto cursor-pointer"
    />
  </UDropdownMenu>
</template>

<style scoped>

</style>
