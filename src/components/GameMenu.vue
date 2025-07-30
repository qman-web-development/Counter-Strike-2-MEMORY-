<template>
  <div class="game-menu">
    <button class="btn neon-pulse" @click="rankingCard">RANKING</button>
    <GameButton key="1" @choose-character="chooseCharacter" />
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useGameStore } from "../stores/GameStore";
import GameButton from "@/components/GameButton.vue";

const emits = defineEmits([
  "choose-character",
  "choose-configuration",
  "play-game",
  "ranking-card",
  "data-checkpoint",
]);
const gameStore = useGameStore();
const {
  cardList,
  movementsFound,
  stepGame,
  character,
  level,
  player,
  timeGame,
  checkpoint,
} = storeToRefs(gameStore);

const chooseCharacter = (checkpoint) => {
  emits("choose-character", checkpoint);
};

const rankingCard = () => {
  let ranking = sessionStorage.getItem("ranking");
  let dataRanking = JSON.parse(ranking) ?? false;
  let data = dataRanking ? dataRanking : false;

  emits("ranking-card", data);
};

onMounted(() => {
  let gameData = sessionStorage.getItem("gameData");
  let dataCheckpoint = JSON.parse(gameData) ?? false;

  const stepsValue = {
    character_step: "choose-character",
    configurations_step: "choose-configuration",
    play_step: "play-game",
  };

  if (dataCheckpoint && dataCheckpoint.length) {
    dataCheckpoint = dataCheckpoint[0];

    if (dataCheckpoint.cardList.length) {
      checkpoint.value = true;
    } else {
      checkpoint.value = false;
    }

    cardList.value = dataCheckpoint.cardList;
    movementsFound.value = dataCheckpoint.movments;
    stepGame.value = dataCheckpoint.step;
    character.value = dataCheckpoint.character;
    level.value = dataCheckpoint.level;
    player.value = dataCheckpoint.name;
    timeGame.value = dataCheckpoint.time;

    emits("data-checkpoint");
    emits(stepsValue[dataCheckpoint.step], true);
  }
});
</script>

<style scoped lang="scss">
@use "@/assets/scss/GameMenu.scss";
</style>
