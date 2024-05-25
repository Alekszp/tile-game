<template>
  <div class="container">
    <main class="game-canvas" :style="gameWidth">
      <h1 class="game-canvas__title">catch your tile</h1>

      <div class="game-canvas__settings">
        <div class="game-canvas__field">
          <label for="timeDelay"><b>Set time</b></label>
          <input
            id="timeDelay"
            type="number"
            v-model.number="timeDelay"
            :min="0"
            :disabled="isGameStart"
          />
          <label for="timeDelay">ms</label>
        </div>
        <span class="error">{{ error }}</span>
      </div>

      <div class="game-canvas__start">
        <BaseButton
          @onclick="startGame"
          :disabled="!isStartAvailable || isGameStart"
          :title="buttonTitle"
          :text="isSomebodyWin ? 'restart' : 'start'"
        />
      </div>

      <!-- <div class="game-canvas__start">
        <button
          @click="startGame"
          :disabled="!isStartAvailable || isGameStart"
          :title="buttonTitle"
        >{{  isSomebodyWin ? 're': '' }}start</button>
      </div> -->

      <div class="game-canvas__score">
        <b>score:</b> player <b>{{ playerScore }}</b> / computer
        <b>{{ computerScore }}</b>
      </div>

      <div class="game-canvas__board" ref="boardContainer">
        <div
          v-for="{ id, color } in board"
          :key="id"
          class="game-canvas__tile"
          :style="{ 'background-color': color }"
          @click="clickOnTile(id)"
        />
      </div>
    </main>

    <Modal v-model="isModal" width="600">
      <template v-slot:title>
        <h3 class="modal__title">Results</h3>
      </template>
      <template v-slot:body>
        <div class="modal__body">
          <p class="message pulsate">
            {{ playerScore === 10 ? "You" : "Computer" }} win
          </p>
          <p class="score">
            <b>score:</b> player <b>{{ playerScore }}</b> / computer
            <b>{{ computerScore }}</b>
          </p>
        </div>
      </template>
      <template v-slot:actions>
        <div class="modal__actions">
          <BaseButton
            @onclick="isModal = false"
            :disabled="!isStartAvailable || isGameStart"
            :title="buttonTitle"
            text="ok"
          />
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { Factory as TileFactory, DefaultTile } from "@/helpers/tileFactory";
import tileTypes from "@/const/tileTypes";
import { ref, reactive, onMounted, computed, watch } from "vue";

import Modal from "@/components/Modal.vue";
import BaseButton from "@/components/BaseButton.vue";

let board = reactive([]);
const playerScore = ref(0);
const computerScore = ref(0);
const timeDelay = ref(1500);
const isGameStart = ref(false);
const boardContainer = ref(null);
const gameUsedIndexes = new Set();
let gameId = ref(null);
const isModal = ref(false);

const buttonTitle = computed(() => {
  return error ? "Set time for delay first" : "";
});
const isStartAvailable = computed(() => {
  return Boolean(timeDelay.value) && timeDelay.value > 0;
});
const error = computed(() => {
  return typeof timeDelay.value !== "number" || timeDelay.value < 1
    ? "Time must be a positive number more than 0"
    : "";
});
const isSomebodyWin = computed(() => {
  return playerScore.value === 10 || computerScore.value === 10;
});
const gameWidth = computed(() => {
  if ((playerScore.value === 0 && computerScore.value === 0 && !isGameStart.value) || isSomebodyWin.value) {
    const width = `${boardContainer.value?.clientWidth}px`;
    return { width };
  }
});

watch(playerScore, () => {
  if (playerScore.value === 10) {
    stop();
    isGameStart.value = false;
    isModal.value = true;
  }
});
watch(computerScore, () => {
  if (computerScore.value === 10) {
    stop();
    isGameStart.value = false;
    isModal.value = true;
    board[getLastSetValue(gameUsedIndexes)].setTileType = tileTypes.DEFAULT;
  }
});
onMounted(() => {
  createBoard();
});

const createBoard = () => {
  const factory = new TileFactory();

  for (let i = 0; i < 100; i++) {
    board.push(factory.createInstance(tileTypes.DEFAULT));
  }
};

const scrollToBoard = () => {
  boardContainer.value.scrollIntoView({ behavior: "smooth" });
};

const randomizeNumber = () => {
  const min = 0;
  const max = 100;

  return Math.floor(Math.random() * (max - min)) + min;
};

const addRandomTileIndex = () => {
  let randomNumber = randomizeNumber();

  if (gameUsedIndexes.has(randomNumber)) {
    return addRandomTileIndex();
  }

  gameUsedIndexes.add(randomNumber);

  return randomNumber;
};

const intervalAction = () => {
  const newIndex = addRandomTileIndex();
  board[newIndex].setTileType = tileTypes.PLAYING;
  const gameUsedIndexesArray = Array.from(gameUsedIndexes);
  const penultimateIndex = gameUsedIndexesArray[gameUsedIndexesArray.length - 2];

  if (board[penultimateIndex].getTileType !== tileTypes.SUCCESS) {
    board[penultimateIndex].setTileType = tileTypes.LOSE;
    computerScore.value++;
  }
};

const resetBoard = () => {
  board = reactive([]);
  gameUsedIndexes.clear();
  createBoard();
  playerScore.value = 0;
  computerScore.value = 0;
};

const startGame = () => {
  resetBoard();
  isGameStart.value = true;
  scrollToBoard();
  const firstTile = randomizeNumber();
  gameUsedIndexes.add(firstTile);
  board[firstTile].setTileType = tileTypes.PLAYING;

  gameId = setInterval(intervalAction, timeDelay.value);
};

const stop = () => {
  clearInterval(gameId);
};

const getLastSetValue = (set) => {
  let value;
  for (value of set);
  return value;
};

const clickOnTile = (id) => {
  const clickedTile = board.find(
    (t, index) => t.id === id && index === getLastSetValue(gameUsedIndexes)
  );

  if (Boolean(clickedTile) && clickedTile.getTileType === tileTypes.PLAYING) {
    clickedTile.setTileType = tileTypes.SUCCESS;
    playerScore.value++;
  }
};
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;

  .game-canvas {
    &__title {
      font-family: $font-primary;
      font-size: 50px;
      line-height: 50px;
      margin-top: unset;

      @media only screen and (max-width: 420px) {
        font-size: 36px;
        line-height: 36px;
      }
    }

    &__score {
      font-family: $font-secondary;
    }

    &__settings {
      margin: 20px auto;
      display: flex;
      flex-direction: column;

      .error {
        font-size: 10px;
        color: $error;
        font-family: Arial, Helvetica, sans-serif;
      }
    }

    &__field {
      display: flex;
      align-items: center;

      input {
        font-family: $font-secondary;
        max-width: 60px;
        margin-right: 10px;
        border-radius: unset;
      }

      label {
        font-family: $font-secondary;
        margin-right: 10px;
      }
    }

    &__start {
      margin: 20px auto;
    }

    &__board {
      display: grid;
      grid-template-columns: $board-size;
      grid-template-rows: $board-size;
      gap: 1px 1px;
      grid-auto-flow: row;
      grid-template-areas:
        ". . . . . . . . . .."
        ". . . . . . . . . ."
        ". . . . . . . . . ."
        ". . . . . . . . . ."
        ". . . . . . . . . ."
        ". . . . . . . . . ."
        ". . . . . . . . . ."
        ". . . . . . . . . ."
        ". . . . . . . . . ."
        ". . . . . . . . . .";

        @media only screen and (max-width: 420px) {
          grid-template-columns: $board-size-mobile;
          grid-template-rows: $board-size-mobile;
        }
    }

    &__tile {
      width: $tile-side-size;
      height: $tile-side-size;
      cursor: pointer;

      @media only screen and (max-width: 420px) {
        width: $tile-side-size-mobile;
        height: $tile-side-size-mobile;
      }
    }
  }

  .modal {
    &__title {
      margin: unset;
    }

    &__body {
      .message {
        font-size: 52px;
        font-weight: bold;
        text-align: center;
        margin-bottom: 20px;

        &.pulsate {
          animation: pulsate-text 3s ease-out;
          animation-iteration-count: infinite;
          -webkit-animation: pulsate-text 3s ease-out;
          -webkit-animation-iteration-count: infinite;
        }
      }

      .score {
        text-align: center;
        font-size: 22px;

        @media only screen and (max-width: 420px) {
          font-size: 18px;
        }
      }
    }

    &__actions {
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
