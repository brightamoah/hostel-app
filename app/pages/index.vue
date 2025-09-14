<script lang="ts" setup>
import type { RouteLocationRaw } from "vue-router";

const title = ref("Transform Your Hostel Management Experience");
const description = ref(
  `Streamline operations, enhance resident satisfaction, and boost efficiency with our comprehensive hostel management platform. From seamless bookings to automated payments - everything you need in one powerful solution.`,
);

const links = ref([
  {
    label: "Get Started",
    to: { name: "auth-signup" } as RouteLocationRaw,
    icon: "i-lucide-rocket",
    size: "xl" as const,
    class: "rounded-full cursor-pointer",
  },
  {
    label: "Admin Dashboard",
    to: { name: "admin-dashboard" } as RouteLocationRaw,
    icon: "i-lucide-user",
    variant: "outline" as const,
    size: "xl" as const,
    class: "rounded-full cursor-pointer",
  },
]);

const features = ref([
  {
    icon: "i-lucide-bed",
    title: "Smart Room Management",
    description:
      "Intelligent room allocation, maintenance tracking, and occupancy optimization.",
  },
  {
    icon: "i-lucide-users",
    title: "Resident Portal",
    description:
      "Self-service portal for bookings, payments, and communication.",
  },
  {
    icon: "i-lucide-credit-card",
    title: "Automated Billing",
    description: "Seamless payment processing with multiple payment options.",
  },
  {
    icon: "i-lucide-bar-chart-3",
    title: "Analytics Dashboard",
    description:
      "Real-time insights and reporting for better decision making.",
  },
  {
    icon: "i-lucide-shield-check",
    title: "Secure & Reliable",
    description: "Bank-grade security with 99.9% uptime guarantee.",
  },
  {
    icon: "i-lucide-headphones",
    title: "24/7 Support",
    description: "Round-the-clock customer support whenever you need help.",
  },
]);
</script>

<template>
  <UMain>
    <UPageHero
      :title
      :description
      class="relative md:-mt-20 p-0"
      :ui="{
        title: 'font-newsreader animate-fade-in-up ',
        description: 'animate-fade-in-up animation-delay-600',
        links: 'animate-fade-in-up animation-delay-1000 cursor-pointer',
      }"
    >
      <template #top>
        <div
          class="left-1/2 absolute dark:bg-primary blur-[300px] rounded-full size-60 sm:size-80 -translate-x-1/2 -translate-y-80 transform"
        />

        <AppStarsEffect />

        <AppStarBg
          :star-count="1500"
          color="rgb(168, 85, 247)"
          :size="{ min: 1, max: 6 }"
        />
      </template>

      <template #links>
        <UButton
          v-for="button in links"
          :key="button.label"
          v-bind="button"
          class="rounded-full cursor-pointer"
        />
      </template>

      <div class="flex justify-center md:-mt-30 animate-fade-in-up animation-delay-1400">
        <div class="relative">
          <NuxtImg
            src="https://res.cloudinary.com/eves-oasis/image/upload/v1757872068/hostel-no-bg_l8uurx.png"
            alt="Kings Hostel Management System"
            class="z-10 relative drop-shadow-2xl hero-image"
          />
        </div>
      </div>
    </UPageHero>

    <!-- Features Section -->
    <UPageSection
      title="Everything you need for efficient hostel administration"
      description="Our comprehensive hostel management system streamlines operations for both administrators and residents."
      class="-mt-5 md:-mt-[10rem]"
      :ui="{
        title: 'font-newsreader animate-fade-in-up capitalize text-2xl md:text-3xl lg:text-4xl',
        description: 'animate-fade-in-up animation-delay-600 md:-mt-0.5',
      }"
    >
      <template #headline>
        <div class="text-center animate-fade-in-up animation-delay-1600">
          <div class="mb-6 linebreak" />
          <UBadge
            variant="subtle"
            class="justify-center items-center"
          >
            Hostel Management Features
          </UBadge>
        </div>
      </template>

      <UPageGrid>
        <UPageCard
          v-for="item in features"
          :key="item.title"
          v-bind="item"
          spotlight
        />
      </UPageGrid>
      <AppStarsEffect />
    </UPageSection>

    <div class="linebreak" />

    <AppFaq
      id="faq"
      class="md:-mt-20"
    />
  </UMain>
</template>

<style></style>
