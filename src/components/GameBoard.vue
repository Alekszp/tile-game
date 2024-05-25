<template>
  <main class="game-canvas">
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
        >
        <label for="timeDelay">ms</label>
      </div>
      <span class="error">{{ error }}</span>
    </div>

    <div class="game-canvas__start">
      <button
        @click="startGame"
        :disabled="!isStartAvailable || isGameStart"
        :title="buttonTitle"
      >{{  isSomebodyWin ? 're': '' }}start</button>
    </div>

    <div class="game-canvas__score">
      <b>score:</b> player <b>{{ playerScore }}</b> / computer <b>{{ computerScore }}</b>
    </div>

    <div
      class="game-canvas__board"
      ref="boardContainer"
    >
      <div class="tiles">
        <div
          v-for="{ id, color } in board"
          :key="id"
          class="game-canvas__tile"
          :style="{ 'background-color': color }"
          @click="clickOnTile(id)"
        />
      </div>
      <div
        class="game-canvas__board-results-mask"
        :style="maskDimensions"
      >
      <span
        v-if="isSomebodyWin"
        class="game-canvas__board-results-message pulsate"
      >
        {{ playerScore === 10 ? "You" : "Computer" }} win
    </span>
    </div>
    </div>
  </main>
</template>

<script setup>
  import {Factory as TileFactory, DefaultTile} from '@/helpers/tileFactory'
  import tileTypes from '@/const/tileTypes'
  import { ref, reactive, onMounted, computed, watch } from 'vue'

  let board = reactive([])
  const playerScore = ref(0)
  const computerScore = ref(0)
  const timeDelay = ref(1500)
  const isGameStart = ref(false)
  const boardContainer = ref(null)
  const gameUsedIndexes = new Set()
  let gameId = ref(null)

  const buttonTitle = computed(() => {
    return error ? 'Set time for delay first' : ''
  })
  const isStartAvailable = computed(() => {
    return Boolean(timeDelay.value) && timeDelay.value > 0
  })
  const error = computed(() => {    
    return typeof timeDelay.value !== 'number' || timeDelay.value < 1 ? 'Time must be a positive number more than 0' : ''
  })
  const isSomebodyWin = computed(() => {
    return playerScore.value === 10 || computerScore.value === 10
  })
  const maskDimensions = computed(() => {
    if ((playerScore.value === 0 && computerScore.value === 0 && !isGameStart.value) || isSomebodyWin.value) {
      const width = `${boardContainer.value?.clientWidth}px`
      const height = `${boardContainer.value?.clientHeight}px`
      return { width, height }
    }
  })
  
  
  watch(playerScore, () => {
    if (playerScore.value === 10) {
      stop()
      isGameStart.value = false
    }
  })
  watch(computerScore, () => {
    if (computerScore.value === 10) {
      stop()
      isGameStart.value = false
      board[getLastValue(gameUsedIndexes)].setTileType = tileTypes.DEFAULT
    }
  })
  onMounted(() => {
    createBoard()
  });  

  const createBoard = () => {
    const factory = new TileFactory()

    for(let i = 0; i < 100; i++) {
      board.push(factory.createInstance(tileTypes.DEFAULT))
    }
  }

  const scrollToBoard = () => {
    boardContainer.value.scrollIntoView({ behavior: 'smooth' })
  }

  const randomizeNumber = () => {
    const min = 0
    const max = 100

    return Math.floor(Math.random() * (max - min)) + min
  }

  const addRandomTileIndex = () => {    
    let randomNumber = randomizeNumber()

    if (gameUsedIndexes.has(randomNumber)) {
      return addRandomTileIndex()
    }
    
    gameUsedIndexes.add(randomNumber)

    return randomNumber
  }

  const intervalAction = () => {
    const newIndex = addRandomTileIndex()
    board[newIndex].setTileType = tileTypes.PLAYING
    const gameUsedIndexesArray = Array.from(gameUsedIndexes)
    const penultimateIndex = gameUsedIndexesArray[gameUsedIndexesArray.length - 2]

    if (board[penultimateIndex].getTileType !== tileTypes.SUCCESS) {
      board[penultimateIndex].setTileType = tileTypes.LOSE
      computerScore.value++
    }
  }

  const resetBoard = () => {
    board = reactive([])
    gameUsedIndexes.clear()
    createBoard()
    playerScore.value = 0
    computerScore.value = 0
  }

  const startGame = () => {
    resetBoard()
    isGameStart.value = true
    scrollToBoard()
    const firstTile = randomizeNumber()
    gameUsedIndexes.add(firstTile)
    board[firstTile].setTileType = tileTypes.PLAYING

    gameId = setInterval(intervalAction, timeDelay.value)
  }

  const stop = () => {
    clearInterval(gameId)
  }

  const getLastValue = (set) => {
    let value;
    for(value of set);
    return value;
  }

  const clickOnTile = (id) => {
    const clickedTile = board.find((t, index) => t.id === id && index === getLastValue(gameUsedIndexes))

    if (Boolean(clickedTile) && clickedTile.getTileType === tileTypes.PLAYING) {
      clickedTile.setTileType = tileTypes.SUCCESS
      playerScore.value++
    }
  }

  
</script>

<style lang="scss" scoped>
  body {
    position: relative;
  }
  .game-canvas {
    &__title {
      font-family: $font-primary;
      font-size: 50px;
      line-height: 50px;
    }

    &__score {
      font-family: $font-secondary;
    }

    &__settings {
      margin: 20px auto;
      display: flex;
      flex-direction: column;

      .error {
        font-size: 12px;
        color: $error;
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

      button {
        font-family: $font-secondary;
        font-size: 20px;
        background: linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(125,30,97,0.7763480392156863) 69%, rgba(0,212,255,1) 100%);
        color: $white;
        border: none;
        width: 100px;
        padding: 5px;
        cursor: pointer;
      }

      button:disabled {
        background-color: $disabled;
        cursor: no-drop;
      }
    }

    &__board {
      width: fit-content;

      .tiles {
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
        }
        position: relative;
      

      &-results {
        &-mask {
          @include opacity-background-modifier($black, 0.8);
          position: absolute;
          display: flex;
          z-index: 10;
          top: 0;
          justify-content: center;
          align-items: center;
        }

        &-message {
          font-family: $font-secondary;
          font-size: 52px;
          font-weight: bold;
          color: $white;

          &.pulsate {
            animation: pulsate-text 3s ease-out;
            animation-iteration-count: infinite;
            -webkit-animation: pulsate-text 3s ease-out;
            -webkit-animation-iteration-count: infinite;
          }
        }
      }
    }

    &__tile {
      width: $tile-side-size;
      height: $tile-side-size;
      cursor: pointer;
    }
  }
</style>
