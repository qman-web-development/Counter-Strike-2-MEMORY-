import { defineStore } from "pinia";
import createDeck from "../features/createDeck";
import createGame from "../features/createGame";
import weapons from "../data/weapons.json";

export const useGameStore = defineStore("GameStore", {
  state: () => {
    const { cardList } = createDeck(weapons);
    const {
      player,
      startGame,
      restartGame,
      matchesFound,
      movementsFound,
      timeGame,
      timeStart,
      timePause,
      timeReset,
      stepGame,
      level,
      character,
      createData,
      resetData,
      saveRanking,
      status,
      checkpointList,
      timeContinue,
      gameDataUpdate,
      checkpoint,
    } = createGame(cardList);

    return {
      cardList,
      player,
      startGame,
      restartGame,
      matchesFound,
      movementsFound,
      timeGame,
      timeStart,
      timePause,
      timeReset,
      stepGame,
      level,
      character,
      createData,
      resetData,
      saveRanking,
      status,
      checkpointList,
      timeContinue,
      gameDataUpdate,
      checkpoint,
    };
  },
});
