<script setup lang="ts">
import { useIntersectionObserver, useWindowScroll } from "@vueuse/core";

import { useAuthStore } from "~/stores/authStore";
import { generateUserColor } from "~/utils/generateUserColor";

const authStore = useAuthStore();
const { user, isLoggedIn } = storeToRefs(authStore);
const { signout } = authStore;

const avatarBgColor = generateUserColor(user.value?.id || "default");
const activeSection = ref("home");

const items = ref<NavItem[]>([
  {
    label: "Home",
    to: { name: "index", hash: "#home" },
    icon: "i-lucide-home",
    id: "home",
  },
  {
    label: "Features",
    to: { name: "index", hash: "#features" },
    icon: "i-lucide-sparkles",
    id: "features",
  },
  {
    label: "FAQ",
    to: { name: "index", hash: "#faq" },
    icon: "i-lucide-message-circle-question-mark",
    id: "faq",
  },
  {
    label: "Contact",
    to: { name: "index", hash: "#contact" },
    icon: "i-lucide-phone",
    id: "contact",
  },
]);

const { y } = useWindowScroll();

onMounted(() => {
  items.value.forEach((item) => {
    const element = document.getElementById(item.id);
    if (element) {
      useIntersectionObserver(
        element,
        ([entry]) => {
          if (entry?.isIntersecting) {
            activeSection.value = item.id;
          }
        },
        { rootMargin: "-50% 0px -50% 0px" },
      );
    }
  });
});

watch(y, (newY) => {
  if (newY < 50) activeSection.value = "home";
});
</script>

<template>
  <nav
    class="top-0 right-0 left-0 z-50 sticky flex justify-between items-center backdrop-blur-xl mx-auto mt-6 md:p-4 px-4 py-2.5 border border-muted rounded-4xl w-[95%] max-w-5xl transition-all duration-200"
    :class="{
      'bg-white/20 dark:bg-black/20 shadow-md backdrop-blur-xl border-white/10 ':
        y > 0,
      'bg-transparent': y === 0,
    }"
  >
    <section class="flex items-center gap-2">
      <NavMobileToggle
        :items
        :is-logged-in
        :user
        :active-section
      />

      <NuxtLink
        :to="{ name: 'index' }"
        class="flex items-center gap-2"
      >
        <AppLogo class="size-6 md:size-8" />

        <h2 class="hidden md:block font-newsreader font-semibold text-2xl">
          Kings Hostel
        </h2>
      </NuxtLink>
    </section>

    <section class="hidden md:flex items-center gap-5">
      <ULink
        v-for="item in items"
        :key="item.id"
        :to="item.to"
        class="flex items-center gap-2 font-normal transition-colors duration-200"
        :class="[
          activeSection === item.id ? 'text-primary' : 'text-highlighted/70 hover:text-default',
        ]"
        exact-hash
        raw
      >
        <UIcon
          :name="item.icon"
          class="size-5"
        />

        <span>{{ item.label }}</span>
      </ULink>
    </section>

    <section class="flex items-center gap-2">
      <AppThemeToggle />

      <NavUserButton
        :avatar-bg-color
        :is-logged-in
        :user
        :handle-sign-out="signout"
      />
    </section>
  </nav>
</template>

<style scoped></style>
