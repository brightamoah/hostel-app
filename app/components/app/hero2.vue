<script setup lang="ts">
const isMobile = inject("isMobile") as ComputedRef<boolean>;

const description = computed(() => {
  return isMobile.value
    ? `Seamless Hostel Management for Everyone.
Easily book rooms, manage tenants, and track payments all in one place.`
    : `Seamless Hostel Management for Everyone.
Easily book rooms, manage tenants, and track payments. Whether you're a resident or an admin, our system keeps everything organized and hassle-free!`;
});

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
  <div class="relative flex flex-col items-center space-y-4 bg-transparent mx-auto mt-2 w-full h-full overflow-hidden">
    <!-- <SvgsLine1 class="-z-10 absolute inset-0 opacity-15 w-full h-full text-primary" /> -->

    <UPageHero
      title="Transform Your Hostel Management Experience"
      :description
      :ui="{
        container: 'py-8 sm:py-12 lg:py-13',
        title: 'font-newsreader text-3xl sm:text-5xl font-semibold',
        description: 'animate-fade-in-up animation-delay-600 mt-2.5',
        links: 'animate-fade-in-up animation-delay-1000 cursor-pointer',
        footer: 'mt-5',
      }"
    >
      <template #links>
        <UButton
          label="Get Started"
          icon="i-lucide-rocket"
          variant="solid"
          color="primary"
          size="xl"
          class="cursor-pointer"
          @click="$router.push({ name: 'auth-signup' })"
        />
      </template>

      <UColorModeImage
        light="https://res.cloudinary.com/eves-oasis/image/upload/v1757872068/hostel-no-bg_l8uurx.png"
        dark="/images/hostel-dark.jpeg"
        class="-mt-10 w-full"
      />
    </UPageHero>

    <UPageSection
      title="Everything you need for efficient hostel administration"
      description="Our comprehensive hostel management system streamlines operations for both administrators and residents."
      class="-mt-5 md:-mt-40"
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

      <!-- <AppStarsEffect /> -->
    </UPageSection>

    <div class="linebreak" />

    <AppFaq
      id="faq"
      class="md:-mt-20"
    />
  </div>
</template>

<style scoped>

</style>
