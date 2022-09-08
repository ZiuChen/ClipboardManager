<template>
  <div class="clip-word-break">
    <div class="clip-word-break-content">
      <template v-for="w of words">
        <div
          @click="handleItemClick(w)"
          :class="{ 'clip-word-break-content-item': true, active: w.checked }"
        >
          {{ w.value }}
        </div>
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

const handleItemClick = (item) => {
  item.checked = !item.checked
}
</script>

<style lang="less" scoped>
@import '../style/index.less';
</style>
