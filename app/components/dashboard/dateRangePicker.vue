<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone, today } from "@internationalized/date";

const df = new DateFormatter("en-US", {
  dateStyle: "medium",
});

const selected = defineModel<RangeType>({ required: true });

const ranges = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 14 days", days: 14 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 3 months", months: 3 },
  { label: "Last 6 months", months: 6 },
  { label: "Last year", years: 1 },
];

function toCalendarDate(date: Date) {
  return new CalendarDate(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );
}

const calendarRange = computed({
  get: () => ({
    start: selected.value.start ? toCalendarDate(selected.value.start) : undefined,
    end: selected.value.end ? toCalendarDate(selected.value.end) : undefined,
  }),
  set: (newValue: { start: CalendarDate | null; end: CalendarDate | null }) => {
    selected.value = {
      start: newValue.start ? newValue.start.toDate(getLocalTimeZone()) : new Date(),
      end: newValue.end ? newValue.end.toDate(getLocalTimeZone()) : new Date(),
    };
  },
});

function isRangeSelected(range: { days?: number; months?: number; years?: number }) {
  if (!selected.value.start || !selected.value.end) return false;

  const currentDate = today(getLocalTimeZone());
  let startDate = currentDate.copy();

  if (range.days) startDate = startDate.subtract({ days: range.days });

  else if (range.months) startDate = startDate.subtract({ months: range.months });

  else if (range.years) startDate = startDate.subtract({ years: range.years });

  const selectedStart = toCalendarDate(selected.value.start);
  const selectedEnd = toCalendarDate(selected.value.end);

  return selectedStart.compare(startDate) === 0 && selectedEnd.compare(currentDate) === 0;
}

function selectRange(range: { days?: number; months?: number; years?: number }) {
  const endDate = today(getLocalTimeZone());
  let startDate = endDate.copy();

  if (range.days) startDate = startDate.subtract({ days: range.days });

  else if (range.months) startDate = startDate.subtract({ months: range.months });

  else if (range.years) startDate = startDate.subtract({ years: range.years });

  selected.value = {
    start: startDate.toDate(getLocalTimeZone()),
    end: endDate.toDate(getLocalTimeZone()),
  };
}
</script>

<template>
  <UPopover
    :content="{ align: 'start' }"
    :modal="true"
  >
    <UButton
      color="neutral"
      variant="ghost"
      icon="i-lucide-calendar"
      class="group data-[state=open]:bg-elevated cursor-pointer"
    >
      <span class="truncate">
        <template v-if="selected.start">
          <template v-if="selected.end">
            {{ df.format(selected.start) }} - {{ df.format(selected.end) }}
          </template>

          <template v-else>
            {{ df.format(selected.start) }}
          </template>
        </template>

        <template v-else>
          Pick a date
        </template>
      </span>

      <template #trailing>
        <UIcon
          name="i-lucide-chevron-down"
          class="size-5 text-dimmed group-data-[state=open]:rotate-180 transition-transform duration-200 shrink-0"
        />
      </template>
    </UButton>

    <template #content>
      <div class="flex items-stretch sm:divide-x divide-default">
        <div class="hidden sm:flex flex-col justify-center cursor-pointer">
          <UButton
            v-for="(range, index) in ranges"
            :key="index"
            :label="range.label"
            color="neutral"
            variant="ghost"
            class="px-4 rounded-none cursor-pointer"
            :class="[isRangeSelected(range) ? 'bg-elevated' : 'hover:bg-elevated/50']"
            truncate
            @click="selectRange(range)"
          />
        </div>

        <UCalendar
          v-model="calendarRange"
          class="p-2 cursor-pointer"
          :number-of-months="2"
          range
        />
      </div>
    </template>
  </UPopover>
</template>
