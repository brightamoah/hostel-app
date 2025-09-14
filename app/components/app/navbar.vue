<script setup lang="ts">
import { useWindowScroll } from "@vueuse/core";

import type { NavItem } from "~/types";

const items = ref<NavItem[]>([
  {
    label: "Home",
    to: { name: "index" },
    icon: "i-lucide-home",
  },
  {
    label: "About",
    to: { name: "about" },
    icon: "i-lucide-info",
  },
  {
    label: "Contact",
    to: { name: "contact" },
    icon: "i-lucide-phone",
  },
  {
    label: "FAQ",
    to: { name: "faq" },
    icon: "i-lucide-help-circle",
  },
  {
    label: "Signup",
    to: { name: "auth-signup" },
    icon: "i-lucide-log-out",
  },
]);

const { y } = useWindowScroll();
</script>

<template>
  <nav
    class="top-0 right-0 left-0 z-50 sticky flex justify-between items-center backdrop-blur-xl mx-auto mt-6 md:p-4 px-4 py-2.5 border border-muted rounded-4xl max-w-5xl transition-all duration-300"
    :class="{
      'bg-white/20 dark:bg-black/20 shadow-md backdrop-blur-xl border-white/10 ':
        y > 0,
      'bg-transparent': y === 0,
    }"
  >
    <section class="flex items-center gap-2">
      <NavMobileToggle />
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

    <section>
      <ul class="hidden md:flex gap-6">
        <li
          v-for="item in items"
          :key="item.label"
          class="items-center hover:text-primary cursor-pointer"
          @click="$router.push(item.to)"
        >
          <ULink
            :to="item.to"
            class="flex items-center gap-2"
            active-class="font-semibold text-primary"
            inactive-class="font-normal text-highlighted/70"
          >
            <UIcon
              :name="item.icon"
              class="size-5"
            />
            <span>{{ item.label }}</span>
          </ULink>
        </li>
      </ul>
    </section>

    <section class="flex items-center gap-2">
      <UColorModeButton />

      <!-- <NavUserButton
          :is-logged-in
          :user="user! "
          :handle-sign-out="signout"
        /> -->
    </section>
  </nav>
</template>

<style scoped></style>
