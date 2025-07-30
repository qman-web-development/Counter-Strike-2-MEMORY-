import _ from "lodash";
import { computed, ref, watchEffect } from "vue";
import { useStopwatch } from "vue-timer-hook";

export default function createGame(deck) {
  const player = ref(true);
  const movementsFound = ref(0);
  const timeGame = ref("00:00:00");
  const stepGame = ref("");
  const level = ref("");
  const character = ref("");
  const checkpointList = ref([]);
  const checkpoint = ref(false);
  let stopwatch = useStopwatch();

  stopwatch.pause();

  const unitTime = ref({
    seconds: "",
    minutes: "",
    hours: "",
  });

  const timeContinue = (time) => {
    stopwatch.reset(time);
  };

  const timeGameStore = () => {
    timeGame.value = `${unitTime.value.hours + stopwatch.hours.value}:${
      unitTime.value.minutes + stopwatch.minutes.value
    }:${unitTime.value.seconds + stopwatch.seconds.value}`;
  };

  watchEffect(() => {
    if ((stopwatch.seconds, stopwatch.minutes, stopwatch.hours)) {
      if (stopwatch.seconds.value < 10) {
        unitTime.value.seconds = "0";
      } else {
        unitTime.value.seconds = "";
      }

      if (stopwatch.minutes.value < 10) {
        unitTime.value.minutes = "0";
      } else {
        unitTime.value.minutes = "";
      }

      if (stopwatch.hours.value < 10) {
        unitTime.value.hours = "0";
      } else {
        unitTime.value.hours = "";
      }

      timeGameStore();

      if (stepGame.value === "play_step") {
        createData();
      } else {
        if (stepGame.value === "start_step") {
          checkpointList.value = [];
        } else {
          setTimeout(() => {
            if (
              stepGame.value === "character_step" ||
              stepGame.value === "configurations_step" ||
              stepGame.value === ""
            ) {
              timeReset();
            }
          }, 100);
        }
      }
    }
  });

  const timePause = () => {
    stopwatch.pause();
    timeGameStore();
  };

  const timeReset = () => {
    stopwatch.reset();
    timeGameStore();
  };

  const timeStart = () => {
    stopwatch.start();

    setTimeout(() => {
      timeGameStore();
    }, 1000);
  };

  const startGame = () => {
    restartGame();
  };

  const restartGame = () => {
    if (checkpoint.value) {
      deck.value = checkpointList.value.map((card, index) => {
        return {
          ...card,
          matched: card.matched,
          position: index,
          visible: card.visible,
        };
      });
    } else {
      deck.value = _.shuffle(deck.value);
      deck.value = deck.value.map((card, index) => {
        return {
          ...card,
          matched: false,
          position: index,
          visible: false,
        };
      });
    }
  };

  const gameDataUpdate = (data) => {
    const date = new Date().toJSON().slice(0, 10);
    let checkData = data;

    if (!checkData) {
      checkData = [
        {
          id: Math.random().toString(16).slice(2),
          name: player.value,
          character: character.value,
          level: level.value,
          time: timeGame.value,
          movments: movementsFound.value,
          matches: status.value,
          date: date,
          step: stepGame.value,
          cardList: checkpointList.value,
        },
      ];
    }

    sessionStorage.setItem("gameData", JSON.stringify(checkData));
  };

  const resetData = () => {
    player.value = false;
    (character.value = ""),
      (level.value = ""),
      (timeGame.value = "00:00:00"),
      (movementsFound.value = 0);

    timeReset();
    timePause();
    sessionStorage.setItem("gameData", JSON.stringify([]));
  };

  const saveRanking = (data) => {
    let ranking = sessionStorage.getItem("ranking");
    ranking = JSON.parse(ranking);

    if (ranking) {
      timePause();
      timeGame.value = data[0].time;

      if (
        ranking[ranking.length - 1].time === data[0].time &&
        ranking[ranking.length - 1].name === data[0].name
      ) {
        console.log();
      } else {
        ranking.push(data[0]);
      }

      sessionStorage.setItem("ranking", JSON.stringify(ranking));
    } else {
      sessionStorage.setItem("ranking", JSON.stringify(data));
    }
  };

  const createData = () => {
    const date = new Date().toJSON().slice(0, 10);
    const data = [
      {
        id: Math.random().toString(16).slice(2),
        name: player.value,
        character: character.value,
        level: level.value,
        time: timeGame.value,
        movments: movementsFound.value,
        matches: status.value,
        date: date,
        step: stepGame.value,
        cardList: checkpointList.value,
      },
    ];

    switch (data[0].level) {
      case "dust_2":
        if (data[0].matches === 6) {
          saveRanking(data);
        } else {
          gameDataUpdate(data);
        }

        break;

      case "train":
        if (data[0].matches === 8) {
          saveRanking(data);
        } else {
          gameDataUpdate(data);
        }

        break;

      case "inferno":
        if (data[0].matches === 12) {
          saveRanking(data);
        } else {
          gameDataUpdate(data);
        }

        break;

      default:
        resetData();

        break;
    }
  };

  const status = computed(() => {
    return matchesFound.value;
  });

  const matchesFound = computed(() => {
    const matchedCards = deck.value.filter(
      (card) => card.matched === true
    ).length;

    return matchedCards / 2;
  });

  return {
    matchesFound,
    movementsFound,
    timeGame,
    stepGame,
    level,
    character,
    player,
    restartGame,
    startGame,
    timeStart,
    timePause,
    timeReset,
    createData,
    resetData,
    saveRanking,
    checkpointList,
    timeContinue,
    status,
    gameDataUpdate,
    checkpoint,
  };
}
