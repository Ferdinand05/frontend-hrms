<script lang="ts" setup>
import { computed } from "vue";
import Dialog from "../ui/dialog/Dialog.vue";
import DialogContent from "../ui/dialog/DialogContent.vue";
import DialogDescription from "../ui/dialog/DialogDescription.vue";
import DialogFooter from "../ui/dialog/DialogFooter.vue";
import DialogHeader from "../ui/dialog/DialogHeader.vue";
import DialogTitle from "../ui/dialog/DialogTitle.vue";

const props = defineProps<{
  title: string;
  description?: string;
  open: boolean;
  modalClass?: string;
}>();

const model = computed({
  get: () => props.open,
  set: (value) => emit("update:open", value),
});

const emit = defineEmits(["update:open"]);
</script>

<template>
  <Dialog v-model:open="model">
    <DialogContent :class="['w-full ', modalClass]">
      <DialogHeader>
        <DialogTitle>{{ props.title }}</DialogTitle>
        <DialogDescription>
          {{ props.description }}
        </DialogDescription>
      </DialogHeader>
      <main class="w-full">
        <slot></slot>
      </main>
      <DialogFooter class="w-full">
        <slot name="footer"> </slot>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
