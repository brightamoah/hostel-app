<script setup lang="ts">
import type { User } from "#auth-utils";

const { items, isLoggedIn, user, activeSection } = defineProps<{
  items: NavItem[];
  isLoggedIn: boolean;
  user: User | null;
  activeSection: string;
}>();

const isMobile = inject("isMobile") as ComputedRef<boolean>;
const route = useRoute();
const isMobileMenuOpen = ref(false);

const navItems = computed(() =>
  items.map((item) => {
    const isActive = item.id === activeSection;

    return {
      ...item,
      active: isActive,
      onSelect: async () => {
        await new Promise(resolve => setTimeout(resolve, 350));
        isMobileMenuOpen.value = false;
      },
    };
  }),
);

watch(() => route.path, () => {
  if (isMobile.value) isMobileMenuOpen.value = false;
});
</script>

<template>
  <ClientOnly>
    <USlideover
      v-if="isMobile"
      v-model:open="isMobileMenuOpen"
      description="Hostel Management Made Easy"
      side="left"
      inset
      :content="{
        onCloseAutoFocus: (e) => e.preventDefault(),
      }"
      :ui="{
        content: 'left-0 w-[65vw] max-w-none',
        close: 'cursor-pointer',
      }"
      class="md:hidden"
    >
      <UButton
        :icon="isMobileMenuOpen ? 'i-lucide-x' : 'i-lucide-menu'"
        color="neutral"
        variant="ghost"
        class="transition-transform duration-300 cursor-pointer"
      />

      <template #title>
        <NuxtLink
          :to="{ name: 'index' }"
          class="flex justify-center items-center gap-2"
        >
          <AppLogo class="size-8 shrink-0" />

          <h2 class="font-newsreader font-semibold text-2xl">
            Kings Hostel
          </h2>
        </NuxtLink>
      </template>

      <template #body>
        <UNavigationMenu
          :items="navItems"
          orientation="vertical"
          :ui="{
            item: 'py-2 last:py-0 last:mt-2',
            linkLabel: 'text-base',
            linkLeadingIcon: 'size-5',
          }"
        />
      </template>

      <template #footer>
        <UserMenu v-if="isLoggedIn && user" />

        <div
          v-else
          class="gap-2.5 grid grid-cols-1 w-full"
        >
          <UButton
            label="Login"
            color="primary"
            icon="i-lucide-log-in"
            class="w-full"
            :to="{ name: 'auth-login' }"
            block
          />

          <UButton
            label="Signup"
            color="neutral"
            variant="subtle"
            icon="i-lucide-user-plus"
            class="w-full"
            :to="{ name: 'auth-signup' }"
            block
          />
        </div>
      </template>
    </USlideover>
  </ClientOnly>
</template>
