<script setup lang="ts">
type ButtonProps = {
  as?: string;
  rounded?: boolean;
  animate?: boolean;
  transparent?: boolean;
};

const props = withDefaults(defineProps<ButtonProps>(), {
  as: "button",
  rounded: false,
  animate: true,
  transparent: false,
});
</script>

<template>
  <component
    :is="props.as"
    class="group relative inline-flex items-center overflow-hidden transition"
    :class="[
      props.rounded ? 'rounded-full' : 'rounded-md px-8 py-1',
      props.transparent
        ? ''
        : 'bg-white text-zinc-800 border border-zinc-300 dark:bg-zinc-800 dark:text-white dark:border-none',
    ]"
  >
    <!-- Spinner animation background -->
    <div
      v-if="props.animate"
      class="absolute inset-0 flex items-center [container-type:inline-size]"
    >
      <div
        class="absolute bg-[conic-gradient(from_0_at_50%_50%,rgba(0,0,0,0.2)_0deg,transparent_60deg,transparent_300deg,rgba(0,0,0,0.2)_360deg)] dark:bg-[conic-gradient(from_0_at_50%_50%,rgba(255,255,255,0.5)_0deg,transparent_60deg,transparent_300deg,rgba(255,255,255,0.5)_360deg)] opacity-0 group-hover:opacity-100 size-[100cqw] transition animate-spin duration-300"
      />
    </div>

    <!-- Button overlay background -->
    <div
      class="absolute inset-0.5 sm:backdrop-blur-md"
      :class="[
        props.transparent ? '' : 'bg-white/90 dark:bg-zinc-900/80',
        props.rounded ? 'rounded-full' : 'rounded-md',
      ]"
    />

    <!-- Subtle glow on hover -->
    <div
      class="bottom-0 left-1/2 absolute group-hover:opacity-100 blur-md w-4/5 h-1/3 group-hover:h-2/3 transition-all -translate-x-1/2 duration-500 bg-black/10 dark:bg-white/10 opacity-30 dark:opacity-50"
      :class="[
        props.rounded ? 'rounded-full' : 'rounded-md',
      ]"
    />

    <slot />
  </component>
</template>
