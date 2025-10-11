<template>
  <div>
    <UApp :toaster="{ position: 'bottom-right', duration: 5000 }">
      <NuxtRouteAnnouncer />

      <NuxtLoadingIndicator />

      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UApp>
  </div>
</template>

<style scoped>
/* .page-enter-active,
.page-leave-active {
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}

.page-enter,
.page-leave-to {
  opacity: 0;
  transform: translateY(20px);
} */

/* .page-enter-active,
.page-leave-active {
  transition:
    opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94),
    transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.page-enter-from {
  opacity: 0;
  transform: translateX(30px) scale(0.95);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-30px) scale(0.95);
} */
</style>
