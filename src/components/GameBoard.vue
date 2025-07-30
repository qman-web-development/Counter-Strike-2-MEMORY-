<template>
  <div class="box">
    <div v-if="open" class="overlay" />
    <div class="box-game">
      <div class="stats">
        <div>
          <h2 class="time">Time: {{ timeGame }}</h2>
        </div>
        <div>
          <h2 class="movements">Movements: {{ props.movementsFound }}</h2>
        </div>
        <div>
          <h2 class="status">Matches: {{ props.status }}</h2>
        </div>
      </div>
      <br />
      <transition-group tag="section" class="game-board" name="shuffle-card">
        <WeaponCard
          v-for="card in props.cardList"
          :key="`${card.value}-${card.variant}`"
          :matched="card.matched"
          :value="card.value"
          :visible="card.visible"
          :position="card.position"
          @select-card="selectCard"
        />
      </transition-group>
      <div class="btn-box-code">
        <button class="btn code-generate" @click="open = true">
          GENERATE THE CODE OF CARDS CONFIGURATION
        </button>
        <div v-if="open" class="modal">
          <p>Click the button to copy the code of cards configuration!</p>
          <button class="btn copy neon-pulse" @click="coyCode">Copy</button>
          <button class="close" @click="open = false">X</button>
        </div>
      </div>
      <div class="btn-box">
        <button class="btn neon-pulse" @click="quitGame">QUIT GAME</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import WeaponCard from "@/components/GameCard.vue";
import { onMounted, ref } from "vue";

import { useGameStore } from "../stores/GameStore";
import { storeToRefs } from "pinia";

const gameStore = useGameStore();
const { player, level, timeGame, checkpoint } = storeToRefs(gameStore);
const emits = defineEmits(["flip-card", "quit-game", "play-game", "copy-code"]);
const open = ref(false);
const props = defineProps({
  cardList: {
    type: Array,
    required: true,
  },
  status: {
    type: Number,
    required: true,
  },
  movementsFound: {
    type: Number,
    required: true,
  },
});

const startNewGame = () => {
  if (player.value) {
    gameStore.startGame();
  } else {
    gameStore.timePause();

    gameStore.restartGame();
    emits("play-game", false);
  }
};

const coyCode = () => {
  emits("copy-code");
};

const selectCard = (payload) => {
  emits("flip-card", payload);
};

const quitGame = () => {
  gameStore.timeReset();
  gameStore.timePause();

  checkpoint.value = false;
  emits("quit-game", "sound/select_game.mp3");
};

onMounted(() => {
  const app = document.getElementById("app");
  const body = document.querySelector("body");

  app.style.backgroundImage = `url("/images/maps/${level.value}.webp")`;
  body.style.backgroundColor = "rgb(49 43 43 / 70%)";
  body.className = "";
  body.classList.add(level.value);

  startNewGame();
});
</script>

<style scoped lang="scss">
@use "@/assets/scss/GameBoard.scss";
</style>
