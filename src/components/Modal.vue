<template>
    <div
      v-if="modelValue"
      class="modal"
    >
      <div class="modal__mask">
        <div
          class="modal__body"
          :style="{width: `${width}px`}"
        >
            <slot name="title" />
            <slot name="body" />
            <slot name="actions" />
        </div>
      </div>
    </div>
</template>

<script setup>
  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false
    },
    width: {
      type: String,
      default: '500'
    }
  })

</script>

<style lang="scss" scoped>
  .modal {
    position: fixed;
    width: 100vw;
    height: 100vh;
    top: 0;

    &__mask {
        @include opacity-background-modifier($black, 0.5);
        display: flex;
        z-index: 10;
        top: 0;
        justify-content: center;
        align-items: center;
        height: 100vh;
    }

    &__body {
        background: $white;
        padding: 20px;
        -webkit-box-shadow: 2px 2px 12px -3px rgba(0,0,0,0.75);
        -moz-box-shadow: 2px 2px 12px -3px rgba(0,0,0,0.75);
        box-shadow: 2px 2px 12px -3px rgba(0,0,0,0.75);
        font-family: $font-secondary;
    }
  }
</style>