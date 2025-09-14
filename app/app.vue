<template>
  <div>
    <UApp>
      <NuxtRouteAnnouncer />
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UApp>
  </div>
</template>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}

.page-enter,
.page-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
