<template>
  <div
    class="relative flex justify-center items-center opacity-75 px-4 border border-accented border-dashed rounded-sm overflow-hidden"
  >
    <svg
      class="absolute inset-0 stroke-inverted/10 w-full h-full"
      fill="none"
    >
      <defs>
        <pattern
          id="pattern-5c1e4f0e-62d5-498b-8ff0-cf77bb448c8e"
          x="0"
          y="0"
          width="10"
          height="10"
          patternUnits="userSpaceOnUse"
        >
          <path d="M-3 13 15-5M-5 5l18-18M-1 21 17 3" />
        </pattern>
      </defs>
      <rect
        stroke="none"
        fill="url(#pattern-5c1e4f0e-62d5-498b-8ff0-cf77bb448c8e)"
        width="100%"
        height="100%"
      />
    </svg>

    <slot />
  </div>
</template>
