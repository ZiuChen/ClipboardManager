<template>
  <div class="notify">
    <ClipCard>
      <template #header>
        <div class="notify-header">
          <div class="notify-header-title">通知</div>
        </div>
      </template>
      <div class="notify-content">
        <div class="notify-content-title">通知标题</div>
        <div class="notify-content-text">通知内容</div>
      </div>
      <template #footer>
        <div class="notify-footer">
          <div class="notify-footer-btn">知道了</div>
        </div>
      </template>
    </ClipCard>
  </div>
</template>

<script setup>
import ClipCard from '../cpns/ClipCard.vue'
</script>

<style lang="less" scoped>
@import '../style';
</style>
