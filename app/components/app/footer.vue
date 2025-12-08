<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const items: NavigationMenuItem[] = [
  {
    label: "Home",
    to: { name: "index" },
  },
  {
    label: "About",
    to: { name: "about" },
  },
  {
    label: "Contact",
    to: { name: "contact" },
  },
  {
    label: "FAQ",
    to: { name: "faq" },
  },
];
</script>

<template>
  <UFooter>
    <template #left>
      <p class="text-muted text-sm">
        Developed by Bright Amoah, Copyright © {{ new Date().getFullYear() }}
      </p>
    </template>

    <UNavigationMenu
      :items="items"
      variant="link"
    />

    <template #right>
      <UButton
        icon="i-lucide-linkedin"
        color="neutral"
        variant="ghost"
        to="https://www.linkedin.com/in/bright-kweku-amoah-59767a249"
        target="_blank"
        aria-label="Discord"
      />

      <UButton
        icon="i-lucide-mail"
        color="neutral"
        variant="ghost"
        to="mailto:kingshostelmgt@gmail.com"
        aria-label="Email"
      />

      <UButton
        icon="i-lucide-github"
        color="neutral"
        variant="ghost"
        to="https://github.com/brightamoah/hostel-app"
        target="_blank"
        aria-label="GitHub"
      />
    </template>
  </UFooter>
</template>
