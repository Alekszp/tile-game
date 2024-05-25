<template>
  <button
    v-bind="$attrs"
    class="base-button"
    @click="$emit('onclick')"
  >
     {{ text }}
  </button>
</template>

<script setup>
   const props = defineProps({
    text: {
      type: String,
      required: true
    },
  })
</script>

<style lang="scss" scoped>
  .base-button {
    font-family: $font-secondary;
      font-size: 20px;
      background: linear-gradient(
        90deg,
        rgba(2, 0, 36, 1) 0%,
        rgba(125, 30, 97, 0.7763480392156863) 69%,
        rgba(0, 212, 255, 1) 100%
      );
      color: $white;
      border: none;
      padding: 5px 25px;
      cursor: pointer;

      &:disabled {
        cursor: no-drop;
      }
  }
</style>