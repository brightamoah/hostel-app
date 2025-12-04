<script lang="ts" setup>
import type { DropdownMenuItem } from "@nuxt/ui";

interface Props {
  tooltip?: string;
  options: (ButtonOption | Button)[];
  defaultIcon?: ButtonOption["icon"];
  isMobile: MaybeRef<boolean>;
}

const {
  tooltip = "Headings",
  options,
  defaultIcon,
  isMobile,
} = defineProps<Props>();

const currentOption = computed(() => {
  try {
    const activeOption = options.find(option => typeof option.isActive === "function" && option.isActive());

    if (activeOption && activeOption.icon) return activeOption.icon;

    if (defaultIcon) return defaultIcon;

    return "i-lucide-menu";
  }
  catch (error) {
    console.error("Error in dropdown currentOption:", error);
    return "i-lucide-menu";
  }
});

const items = computed(() => {
  return options.map(option => ({
    label: getOptionLabel(option),
    icon: option.icon,
    disabled: option.isDisabled?.(),
    kbds: option.keyboard,
    ...(option.isActive?.() && {
      color: "primary" as const,
      class: "bg-primary/10 text-primary",
    }),
    onSelect: () => selectOption(option),
  })) satisfies DropdownMenuItem[];
});

function getOptionLabel(option: ButtonOption | Button) {
  return "label" in option ? option.label : option.name;
}

function selectOption(option: (ButtonOption | Button)) {
  if (!option.isDisabled?.()) {
    option.action?.();
  }
}
</script>

<template>
  <UTooltip
    :text="tooltip"
    :delay-duration="100"
    :content="{
      align: 'center',
      side: 'top',
      sideOffset: 8,
    }"
    :ui="{
      content: 'w-(--reka-dropdown-menu-trigger-width)',
    }"
    arrow
  >
    <UDropdownMenu
      :items
      :size="isMobile ? 'sm' : 'md'"
      :content="{
        align: 'center',
      }"
      arrow
    >
      <UButton
        variant="ghost"
        color="neutral"
        trailing-icon="i-lucide-chevron-down"
        class="flex items-center gap-1 py-1 rounded-xl font-medium text-sm transition-colors"
        :size="isMobile ? 'xs' : 'sm'"
        :icon="currentOption"
        :ui="{
          trailingIcon: 'size-3',
          leadingIcon: 'size-4',
        }"
      />
    </UDropdownMenu>
  </UTooltip>
</template>

<style scoped>

</style>
