<template>
  <button class="btn neon-pulse" @click="enter(props.label)">
    <span>
      <slot>{{ props.label }}</slot>
    </span>
  </button>
</template>

<script setup>
import { defineProps } from "@vue/runtime-dom";

const props = defineProps({
  label: {
    type: String,
    default: "START GAME",
  },
});

const emits = defineEmits([
  "choose-character",
  "choose-configuration",
  "play-game",
]);

function enter(label) {
  if (label === "PLAY") {
    emits("play-game", false);
  } else if (label === "CHOOSE THE LEVEL") {
    emits("choose-configuration", false);
  } else {
    emits("choose-character", false);
  }
}
</script>

<style scoped lang="scss">
@use "@/assets/scss/GameButton.scss";
</style>
