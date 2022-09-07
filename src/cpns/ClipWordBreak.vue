<template>
  <div class="clip-word-break">
    <div class="clip-word-break-content">
      <template v-for="w of words">
        <div class="clip-word-break-content-item">{{ w }}</div>
      </template>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  words: {
    type: Array,
    required: true
  }
})
</script>

<style lang="less" scoped>
@import '../style/index.less';
</style>
