<template>
  <div class="configuration-select">
    <div v-if="modalValidate" class="overlay" />
    <div class="configuration-box">
      <div
        v-for="(conf, name) in props.maps"
        :key="conf.pair"
        :id="name"
        class="container"
        @click="selectLevel(name)"
        :style="`background-image: url(/images/maps/${name}.webp`"
      >
        <div class="silhouette" :id="name.toUpperCase()">
          <div
            class="cover"
            :style="`background-image: url(/images/maps/${name}_shadow.webp`"
          />
        </div>
        <div class="card-configurations">
          <h1>{{ conf.level }}</h1>
          <div
            class="information"
            :id="`${name.toUpperCase()}_Info`"
            :style="`border-top: solid 10px ${conf.color}; border-bottom: solid 10px ${conf.color};`"
          >
            <h2
              :id="`${name.toUpperCase()}_Name`"
              :style="`border-bottom: dashed 2px ${conf.color};`"
            >
              {{ name }}
            </h2>
            <p>{{ conf.pair }} PAIR</p>
          </div>
        </div>
      </div>
      <div class="instructions">CHOOSE THE LEVEL</div>
      <div class="code-box">
        <p>Insert the code of cards configuration:</p>
        <textarea v-model="code" />
      </div>
    </div>
    <PlayButton key="1" @play-game="playGame" :label="'PLAY'" />
    <div v-if="modalValidate" class="modal">
      <p>You have to choose level to start the game!</p>
      <button class="close" @click="modalValidate = false">X</button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useGameStore } from "../stores/GameStore";
import { storeToRefs } from "pinia";
import PlayButton from "@/components/GameButton.vue";
import gsap from "gsap";
import allWeapons from "../data/weapons.json";
import createDeck from "../features/createDeck";

const gameStore = useGameStore();
const { cardList, level, checkpointList } = storeToRefs(gameStore);
const modalValidate = ref(false);
const emits = defineEmits(["play-game", "copy-code"]);
const code = ref("");
const props = defineProps({
  maps: {
    type: Object,
    required: true,
  },
});

function refreshLevel(weapons, cardList, count) {
  if (count === 12) {
    checkpointList.value = cardList.value;

    return cardList.value;
  } else {
    let customLevel = [];
    weapons.splice(count - weapons.length);
    weapons.forEach((weapon) => {
      cardList.value.forEach((card, key) => {
        if (card.value === weapon) {
          customLevel.push(cardList.value[key]);
        }
      });
    });

    checkpointList.value = customLevel;

    return customLevel;
  }
}

const selectLevel = (levelSelected) => {
  const choose = document.getElementById(levelSelected);
  const containers = document.querySelectorAll(".container");
  level.value = levelSelected;

  containers.forEach((container) => {
    container.classList.remove("selected");
  });

  choose.classList.add("selected");
};

const playGame = () => {
  if (level.value.length) {
    const weapons = allWeapons.map((item) => item);
    const levels = props.maps;

    cardList.value = [];

    createDeck(weapons);

    weapons.sort(function () {
      return 0.5 - Math.random();
    });

    cardList.value = refreshLevel(
      weapons,
      cardList,
      levels[level.value]["pair"]
    );
    gameStore.gameDataUpdate(false);

    emits("play-game", false);
  } else {
    if (code.value.length) {
      emits("copy-code", code);
      emits("play-game", false);
    } else {
      modalValidate.value = true;
    }
  }
};

onMounted(() => {
  gsap.set(".information", { yPercent: 100 });
  gsap.utils.toArray(".container").forEach((container) => {
    let info = container.querySelector(".information"),
      silhouette = container.querySelector(".silhouette .cover"),
      tl = gsap.timeline({ paused: true });

    tl.to(info, { yPercent: 0 }).to(silhouette, { opacity: 0 }, 0);

    container.addEventListener("mouseenter", () => tl.timeScale(1).play());
    container.addEventListener("mouseleave", () => tl.timeScale(3).reverse());
  });
});
</script>
<style scoped lang="scss">
@use "@/assets/scss/GameConfiguration.scss";
</style>
