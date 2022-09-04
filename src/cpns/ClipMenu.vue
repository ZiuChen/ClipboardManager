<template>
  <div class="clip-menu" v-show="isMenuShow">
    <div class="clip-menu-title">设置</div>
    <div class="clip-menu-config-list">
      <div class="clip-menu-config-list-item">
        <span>清空剪贴板</span>
        <div class="clip-btn">🧹</div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isMenuShow: {
    type: Boolean,
    default: false
  }
})
</script>

<style lang="less" scoped>
@import '../style';
</style>
