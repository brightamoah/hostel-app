<script lang="ts" setup>
interface Props {
  tooltip?: string;
  options: ButtonOption[];
  defaultIcon?: ButtonOption["icon"];
  position?: "left" | "right" | "center";
}

const {
  tooltip = "Headings",
  options,
  defaultIcon,
  position = "center",
} = defineProps<Props>();

const isOpen = ref(false);

const currentOption = computed(() => {
  try {
    const activeOption = options.find(option => typeof option.isActive === "function" && option.isActive());

    if (activeOption && activeOption.icon)
      return activeOption.icon;

    if (defaultIcon)
      return defaultIcon;

    return "i-lucide-menu";
  }
  catch (error) {
    console.error("Error in dropdown currentOption:", error);
    return "i-lucide-menu";
  }
});

function getPositionClasses() {
  switch (position) {
    case "left":
      return "right-0";
    case "right":
      return "left-0";
    case "center":
      return "left-1/2 transform -translate-x-1/2";
    default:
      return "left-1/2 transform -translate-x-1/2";
  }
}

function toggleDropdown() {
  isOpen.value = !isOpen.value;
}

function selectOption(option: ButtonOption) {
  if (!option.isDisabled || !option.isDisabled()) {
    option.action();
    isOpen.value = false;
  }
}

function handleBlur(event: FocusEvent) {
  // Close dropdown when focus leaves the component
  setTimeout(() => {
    if (
      !event.relatedTarget
      || !(event.currentTarget as Element)?.contains(event.relatedTarget as Node)
    ) {
      isOpen.value = false;
    }
  }, 100);
}

function closeDropdown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    isOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener("keydown", closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", closeDropdown);
});
</script>

<template>
  <div class="inline-block relative">
    <UTooltip
      :text="tooltip"
      :delay-duration="100"
      :content="{
        align: 'center',
        side: 'top',
        sideOffset: 8,
      }"
      arrow
    >
      <UButton
        variant="ghost"
        color="neutral"
        size="xs"
        class="flex items-center gap-1 py-1 rounded-xl font-medium text-sm transition-colors"
        :class="{ 'bg-elevated': isOpen }"
        @click="toggleDropdown"
        @blur="handleBlur"
      >
        <UIcon
          :name="currentOption as string"
          class="size-4"
        />

        <UIcon
          class="size-3 transition-transform duration-200 ease-in-out"
          name="i-lucide-chevron-down"
          :class="{ 'rotate-180': isOpen }"
        />
      </UButton>
    </UTooltip>

    <div
      v-if="isOpen"
      class="top-full z-50 absolute bg-default shadow-lg mt-1 px-2 py-1 border border-accented rounded-xl"
      :class="getPositionClasses()"
      @mousedown.prevent
    >
      <template
        v-for="option in options"
        :key="option.name"
      >
        <UTooltip
          v-if="option.tooltip"
          :text="option.tooltip"
          :delay-duration="100"
          :content="{
            align: 'start',
            side: 'top',
            sideOffset: 8,
          }"
          :kbds="option.keyboard"
          arrow
        >
          <UButton
            variant="ghost"
            color="neutral"
            size="sm"
            :title="option.tooltip"
            :disabled="option.isDisabled?.()"
            class="flex items-center gap-3 disabled:opacity-50 px-3 py-2 focus:outline-none w-full hover:text-highlighted text-sm transition-colors disabled:cursor-not-allowed"
            :class="{
              'bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary':
                option.isActive?.(),
              'text-toned': !option.isActive?.(),
            }"
            @click="selectOption(option)"
          >
            <UIcon
              :name="option.icon"
              class="size-4"
            />

            <span class="text-sm text-nowrap">{{ option.label }}</span>
          </UButton>
        </UTooltip>
      </template>
    </div>
  </div>
</template>

<style scoped>

</style>
