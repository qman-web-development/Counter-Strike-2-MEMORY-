<template>
  <div class="card-game" :class="flippedStyles" @click="selectCard">
    <div class="card-face is-front" :class="value">
      <img
        class="card-image"
        :srcset="`/images/weapons/${value}@2x.webp 2x, /images/weapons/${value}.webp 1x`"
        :src="`/images/weapons/${value}.webp`"
        :alt="value"
      />
      <img v-if="matched" src="/images/checkmark.webp" class="icon-checkmark" />
    </div>
    <div class="card-face is-back" />
  </div>
</template>

<script setup>
import { defineProps } from "@vue/runtime-dom";
import { computed } from "vue";

const props = defineProps({
  matched: {
    type: Boolean,
    default: false,
  },
  position: {
    type: Number,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  visible: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(["select-card"]);
const flippedStyles = computed(() => {
  if (props.visible) {
    return "is-flipped";
  } else {
    return false;
  }
});

const selectCard = () => {
  if (!props.matched) {
    emits("select-card", {
      position: props.position,
      faceValue: props.value,
    });
  }
};
</script>
<style scoped lang="scss">
@use "@/assets/scss/GameCard.scss";
</style>
