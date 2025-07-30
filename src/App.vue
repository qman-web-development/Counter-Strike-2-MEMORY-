<template>
  <div id="wrapper">
    <div class="crosshair" />
    <div class="sound-effect" @click="playMusic">
      <img
        v-if="sound_off"
        src="/images/sound_off.webp"
        class="icon-checkmark"
      />
      <img v-else src="/images/sound_on.webp" class="icon-checkmark" />
    </div>
    <transition name="fade" mode="out-in">
      <GameMenu
        v-if="steps.start_step"
        :cardList="cardList"
        :status="status"
        @choose-character="chooseCharacter"
        @choose-configuration="chooseConfiguration"
        @play-game="playGame"
        @ranking-card="rankingCard"
        @data-checkpoint="dataCheckpoint"
      />
    </transition>
    <transition name="fade" mode="out-in">
      <GameBoard
        v-if="steps.play_step"
        :cardList="cardList"
        :status="status"
        :movementsFound="movementsFound"
        @flip-card="flipCard"
        @quit-game="quitGame"
        @play-game="playGame"
        @copy-code="copyDecryptCode"
      />
    </transition>
    <transition name="fade" mode="out-in">
      <GameLogo
        v-if="
          (!steps.start_step && steps.character_step) ||
          steps.configurations_step
        "
      />
    </transition>
    <transition name="fade" mode="out-in">
      <GameCharacter
        v-if="steps.character_step"
        @choose-configuration="chooseConfiguration"
      />
    </transition>
    <transition name="fade" mode="out-in">
      <GameConfiguration
        v-if="steps.configurations_step"
        :maps="allLevels[0]"
        @play-game="playGame"
        @copy-code="copyDecryptCode"
      />
    </transition>
    <div v-if="ranking" class="modal modal-ranking">
      <button class="close" @click="ranking = false">X</button>
      <div class="header">
        <GameLogo />
        <h1>RANKING</h1>
      </div>
      <div clsass="ranking-box">
        <h2 v-if="!rankingData">
          The ranking is empty <br />
          Let's play!
        </h2>
        <div v-if="rankingData" class="table">
          <div class="tr thead-table">
            <div class="th">name</div>
            <div class="th">movments</div>
            <div class="th">level</div>
            <div class="th">character</div>
            <div class="th">time</div>
            <div class="th">date</div>
          </div>
          <div v-for="(row, key) in rankingData" :key="key" class="tr">
            <div class="td name">{{ row.name }}</div>
            <div class="td movments">{{ row.movments }}</div>
            <div :class="`td ` + `${row.level}`">{{ row.level }}</div>
            <div :class="`td ` + `${row.character}`">{{ row.character }}</div>
            <div class="td time">{{ row.time }}</div>
            <div class="td date">{{ row.date }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, inject } from "vue";
import { storeToRefs } from "pinia";
import { useGameStore } from "./stores/GameStore";
import { launchConfetti } from "@/utilities/confetti";

import GameLogo from "@/components/GameLogo.vue";
import GameMenu from "@/components/GameMenu.vue";
import GameCharacter from "@/components/GameCharacter.vue";
import GameConfiguration from "@/components/GameConfiguration.vue";
import GameBoard from "@/components/GameBoard.vue";

// import NewGameButton from "@/components/NewGameButton.vue";

import { useWindowSize } from "@vueuse/core";
import { useSound } from "@vueuse/sound";
import allLevels from "@/data/levels.json";

import gsap from "gsap";

const { width } = useWindowSize();

const gameStore = useGameStore();
const {
  cardList,
  matchesFound,
  movementsFound,
  status,
  stepGame,
  character,
  level,
  checkpointList,
  timeGame,
  checkpoint,
} = storeToRefs(gameStore);

const steps = ref({
  start_step: true,
  character_step: false,
  configurations_step: false,
  play_step: false,
});

const sound_off = ref(true);
const ranking = ref(false);
const rankingData = ref();

function dataCheckpoint() {
  const wrapper = document.getElementById("wrapper");

  steps.value.start_step = false;
  wrapper.style.backgroundColor = "rgb(49 43 43 / 95%)";
}

const rankingCard = (data) => {
  rankingData.value = data;
  ranking.value = !ranking.value;
};

function playSound(parameters) {
  sound.value = [parameters];

  if (sound_off.value) {
    stop();
  } else {
    setTimeout(() => {
      play();
    }, 200);
  }
}

function playMusic() {
  if (sound_off.value) {
    sound_off.value = false;

    if (steps.value.start_step) {
      playSound(`/sound/main.mp3`);
    }

    if (steps.value.character_step || steps.value.configurations_step) {
      playSound(`/sound/choose_settings.mp3`);
    }
  } else {
    stop();
    sound_off.value = true;
  }
}

onMounted(() => {
  gsap.set(".crosshair", { xPercent: -50, yPercent: -50 });

  let xSetter = gsap.quickSetter(".crosshair", "x", "px"); //apply it to the #id element's x property and append a "px" unit
  let ySetter = gsap.quickSetter(".crosshair", "y", "px"); //apply it to the #id element's x property and append a "px" unit

  window.addEventListener("mousemove", (e) => {
    xSetter(e.x);
    ySetter(e.y);
  });
});

const sound = ref([""]);
const { play, stop } = useSound(sound);
const userSelection = ref([]);
const userCanFlipCard = ref(true);
const cryptojs = inject("cryptojs");

function copyDecryptCode(encryptedText = false) {
  if (encryptedText) {
    const decryptedText = JSON.parse(
      cryptojs.AES.decrypt(encryptedText.value, "Secret Passphrase").toString(
        cryptojs.enc.Utf8
      )
    );

    if (decryptedText.length === 12) {
      level.value = "dust_2";
    }

    if (decryptedText.length === 16) {
      level.value = "train";
    }

    if (decryptedText.length === 24) {
      level.value = "inferno";
    }

    const newList = decryptedText.map((card, index) => {
      return {
        ...card,
        matched: false,
        position: index,
        visible: false,
      };
    });

    cardList.value = newList;
    checkpoint.value = true;
  } else {
    const codeList = cardList.value;
    const configString = JSON.stringify(codeList);
    const encryptedText = cryptojs.AES.encrypt(
      configString,
      "Secret Passphrase"
    ).toString();
    navigator.clipboard.writeText(encryptedText);
  }
}

const chooseCharacter = () => {
  const wrapper = document.getElementById("wrapper");

  stop();
  playSound("/sound/select_game.mp3");
  steps.value.start_step = false;
  setTimeout(() => {
    wrapper.style.backgroundColor = "rgb(49 43 43 / 95%)";
    steps.value.character_step = true;
    stepGame.value = "character_step";

    playSound("sound/choose_settings.mp3");

    gameStore.gameDataUpdate(false);
  }, 500);
};

const chooseConfiguration = (checkpoint) => {
  steps.value.character_step = false;

  if (checkpoint) {
    const wrapper = document.getElementById("wrapper");

    steps.start_step = false;
    wrapper.style.backgroundColor = "rgb(49 43 43 / 95%)";
  }

  stop();
  playSound("/sound/select_game.mp3");
  setTimeout(() => {
    steps.value.configurations_step = true;
    stepGame.value = "configurations_step";

    playSound("sound/choose_settings.mp3");

    gameStore.gameDataUpdate(false);
  }, 500);
};

const playGame = () => {
  steps.value.configurations_step = false;

  if (checkpoint) {
    const getTime = timeGame.value.split(":");
    const sec =
      Number(getTime[0]) * 3600 + Number(getTime[1]) * 60 + Number(getTime[2]);

    gameStore.timeContinue(sec);
  }

  if (checkpoint.value) {
    checkpointList.value = cardList.value;
  }

  stop();
  playSound("sound/select_game.mp3");
  setTimeout(() => {
    steps.value.play_step = true;
    stepGame.value = "play_step";

    setTimeout(() => {
      playSound("sound/go_go_go.mp3");
    }, 1000);
  }, 500);
};

const quitGame = (sound) => {
  const app = document.getElementById("app");
  const wrapper = document.getElementById("wrapper");

  gameStore.resetData();
  steps.value.play_step = false;

  stop();
  playSound(sound);
  setTimeout(() => {
    if (width.value < 1024) {
      app.style.backgroundImage = `url("/images/cs2_bg_mobile.webp")`;
    } else {
      app.style.backgroundImage = `url("/images/cs2_bg.webp")`;
    }

    wrapper.style.backgroundColor = "transparent";
    steps.value.start_step = true;
    stepGame.value = "start_step";

    playSound(`/sound/main.mp3`);
  }, 500);
};

const flipCard = (payload) => {
  setTimeout(() => {
    if (userCanFlipCard.value) {
      cardList.value[payload.position].visible = true;
      playSound(`/sound/weapons/${payload.faceValue}_draw.mp3`);
      movementsFound.value++;
      checkpointList.value = cardList.value;

      if (userSelection.value[0]) {
        if (
          userSelection.value[0].position === payload.position &&
          userSelection.value[0].faceValue === payload.faceValue
        ) {
          return;
        } else {
          const matchValue = matchesFound.value;

          userSelection.value[1] = payload;

          setTimeout(() => {
            const newMatchValue = matchesFound.value;

            if (matchValue !== newMatchValue) {
              setTimeout(() => {
                playSound(`/sound/weapons/${payload.faceValue}_shoot.mp3`);
              }, 500);
            }
          }, 100);
        }
      } else {
        userSelection.value[0] = payload;
      }
    } else {
      return;
    }
  }, 100);
};

watch(matchesFound, (currentValue) => {
  if (currentValue === allLevels[0][level.value]["pair"]) {
    gameStore.createData();
    gameStore.timePause();

    setTimeout(() => {
      launchConfetti();
      playSound(`/sound/${character.value}_win.mp3`);
    }, 1500);
  }
});

watch(
  userSelection,
  (currentValue) => {
    if (currentValue.length === 2) {
      const cardOne = currentValue[0];
      const cardTwo = currentValue[1];
      // Disable ability to flip cards
      userCanFlipCard.value = false;

      if (cardOne.faceValue === cardTwo.faceValue) {
        cardList.value[cardOne.position].matched = true;
        cardList.value[cardTwo.position].matched = true;
        userCanFlipCard.value = true;
      } else {
        setTimeout(() => {
          cardList.value[cardOne.position].visible = false;
          cardList.value[cardTwo.position].visible = false;
          // Allow user to flip a new card
          userCanFlipCard.value = true;
        }, 1200);
      }

      userSelection.value.length = 0;
    }
  },
  { deep: true }
);
</script>

<style lang="scss">
@use "./assets/scss/App.scss";
</style>
