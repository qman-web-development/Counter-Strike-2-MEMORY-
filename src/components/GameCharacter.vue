<template>
  <div>
    <div v-if="modalValidate" class="overlay" />
    <div class="character-box">
      <div
        id="terrorist"
        class="container"
        @click="selectCharacter('terrorist')"
      >
        <div class="silhouette" id="Terrorist">
          <div class="cover" />
        </div>
        <div class="card-character">
          <h1>terrorist</h1>
          <div class="information" id="terroristInfo">
            <h1 id="terroristName">terrorist</h1>
          </div>
        </div>
      </div>
      <div id="ct" class="container" @click="selectCharacter('ct')">
        <div class="silhouette" id="Ct">
          <div class="cover" />
        </div>
        <div class="card-character">
          <h1>ct</h1>
          <div class="information" id="CtInfo">
            <h1 id="CtName">Ct</h1>
          </div>
        </div>
      </div>
    </div>
    <div class="instructions">CHOOSE A CHARACTER</div>
    <div class="name-box">
      <p>Your name:</p>
      <input v-model="name" placeholder="e.g. John Wick Junior" />
    </div>
    <PlayButton
      key="1"
      @choose-configuration="chooseConfiguration"
      :label="'CHOOSE THE LEVEL'"
    />
    <div v-if="modalValidate" class="modal">
      <p>
        You must choose the character and give a minimum of 3 characters in the
        "Your name" field to go on!
      </p>
      <button class="close" @click="modalValidate = false">X</button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import PlayButton from "@/components/GameButton.vue";
import gsap from "gsap";
import { useGameStore } from "../stores/GameStore";
import { storeToRefs } from "pinia";

const gameStore = useGameStore();
const { player, character } = storeToRefs(gameStore);
const name = ref("");
const modalValidate = ref(false);
const emits = defineEmits(["choose-configuration"]);
const selectCharacter = (characterSelected) => {
  const choose = document.getElementById(characterSelected);
  const containers = document.querySelectorAll(".container");
  character.value = characterSelected;

  containers.forEach((container) => {
    container.classList.remove("selected");
  });

  choose.classList.add("selected");
};

const chooseConfiguration = () => {
  const containers = document.querySelectorAll(".container");
  const character = Array.from(containers).filter((container) =>
    container.classList.contains("selected")
  ).length;

  if (name.value.length > 2 && character) {
    player.value = name.value;
    emits("choose-configuration", "/sound/select_game.mp3");
  } else {
    modalValidate.value = true;
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
@use "@/assets/scss/GameCharacter.scss";
</style>
