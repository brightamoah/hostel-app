<template>
  <UPageSection
    title="Get In Touch With Us"
    description="Have questions about accommodation, payments, or maintenance? We're here to help."
    :ui="{
      title: 'font-newsreader animate-fade-in-up capitalize italics',
      description: '-mt-0.5',
    }"
  >
    <template #headline>
      <div class="text-center animate-fade-in-up animation-delay-1600">
        <UBadge
          variant="subtle"
          class="justify-center items-center"
        >
          Contact Us
        </UBadge>
      </div>
    </template>

    <UCard class="mx-auto md:-mt-10 w-full max-w-4xl">
      <ContactForm />
    </UCard>
  </UPageSection>
</template>

<style scoped>

</style>
