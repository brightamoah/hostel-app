<script setup lang="ts">
import type { AccordionItem } from "@nuxt/ui";

const faqItems = ref<AccordionItem[]>([
  {
    label: "How do I apply for hostel accommodation?",
    content: `To apply for hostel accommodation, log in to your student portal and navigate to the "Accommodation" section. Fill out the application form with your details and room preferences. Once submitted, you'll receive a confirmation email with instructions for the next steps, including payment details for securing your room.`,
  },
  {
    label: "How do I report maintenance issues in my room?",
    content: `For maintenance issues, log into your student portal, go to the "Maintenance" section, and submit a new request. Describe the problem in detail and attach photos if possible. Our maintenance team will review your request and respond within 24-48 hours. You'll receive notifications about the status of your request via email and can track progress through your portal.`,
  },
  {
    label: "What payment methods are accepted for hostel fees?",
    content: `We accept multiple payment methods for your convenience. You can pay your hostel fees through online bank transfers, credit/debit cards, and mobile payment platforms. All payments are processed securely through our integrated payment gateway. After payment, you'll receive an automatic receipt via email, and your payment history will be available in your student portal for future reference.`,
  },
  {
    label: "How do I register visitors to the hostel?",
    content: `To register visitors, log into your student portal and go to the "Visitor Management" section. Fill out the visitor request form with your visitor's details at least 24 hours before their arrival. Once approved, you'll receive a visitor pass that must be presented at the security desk. Visitors must check in and out at the security desk, and all visits are subject to hostel regulations regarding visiting hours.`,
  },
  {
    label: "How do I view and respond to hostel announcements?",
    content: `All important hostel announcements are displayed in the "Announcements" section of your student portal. You'll receive email notifications for urgent announcements. To mark an announcement as read, simply click the "Mark as Read" button after viewing it. For announcements that require responses or actions, follow the instructions provided in the announcement details.`,
  },
  {
    label: "What happens if I need to leave the hostel before my contract ends?",
    content:
      "If you need to leave before your contract ends, submit an early departure request through your student portal at least 30 days before your intended departure date. The administration will review your request and inform you about any applicable refunds or fees according to our early departure policy. You'll need to schedule a room inspection and complete the checkout process to finalize your departure.",
  },
]);
</script>

<template>
  <UPageSection
    title="Frequently Asked Questions"
    description="Browse through these FAQs to find answers to commonly asked questions about our hostel management system."
    :ui="{
      title: 'font-newsreader animate-fade-in-up capitalize italics',
      description: 'animate-fade-in-up animation-delay-600 -mt-0.5',
    }"
  >
    <template #headline>
      <div class="text-center animate-fade-in-up animation-delay-1600">
        <UBadge
          variant="subtle"
          class="justify-center items-center"
        >
          FAQs
        </UBadge>
      </div>
    </template>

    <UAccordion
      multiple
      class="mx-auto md:-mt-10 max-w-4xl"
      trailing-icon="i-lucide-plus"
      :items="faqItems"
      :ui="{
        item: 'mb-2 group px-4 transform-gpu rounded-xl border-2 transition duration-500 will-change-transform bg-muted/20 ',
        trailingIcon:
          'group-data-[state=closed]:rotate-0 group-data-[state=open]:rotate-135',
      }"
    />
  </UPageSection>
</template>

<style scoped></style>
