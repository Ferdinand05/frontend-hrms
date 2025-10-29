<script setup lang="ts">
import type { DateRange } from "reka-ui";
import type { Ref } from "vue";

import { getLocalTimeZone, today } from "@internationalized/date";
import { CalendarIcon } from "lucide-vue-next";
import { ref } from "vue";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RangeCalendar } from "@/components/ui/range-calendar";
import { cn } from "@/lib/utils";

const emit = defineEmits(["updateDate"]);

const start = today(getLocalTimeZone());
const end = start.add({ days: 7 });

const value = ref({
  start,
  end,
}) as Ref<DateRange>;

const props = defineProps<{
  buttonStatus: boolean;
}>();
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        :class="
          cn('w-[218px] justify-start text-left font-normal', !value && 'text-muted-foreground')
        "
      >
        <CalendarIcon class="mr-2 h-4 w-4" />
        Date Picker
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0">
      <RangeCalendar
        v-model="value"
        initial-focus
        :number-of-months="1"
        @update:start-value="(startDate) => (value.start = startDate)"
      />

      <div class="flex items-center justify-center my-3">
        <Button
          :disabled="props.buttonStatus"
          size="sm"
          variant="outline"
          @click.prevent="emit('updateDate', value)"
          >Apply</Button
        >
      </div>
    </PopoverContent>
  </Popover>
</template>
