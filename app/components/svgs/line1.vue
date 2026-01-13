<script setup lang="ts">

</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
  >
    <defs>
      <pattern
        id="a"
        width="20"
        height="20"
        patternTransform="scale(2)"
        patternUnits="userSpaceOnUse"
      >
        <rect
          width="100%"
          height="100%"
          fill="none"
        />

        <path
          fill="none"
          stroke="var(--color-primary)"
          stroke-linecap="square"
          d="M3.25 10h13.5M10 3.25v13.5"
        />
      </pattern>
    </defs>

    <rect
      width="800%"
      height="800%"
      fill="url(#a)"
    />
  </svg>
</template>

<style scoped></style>
