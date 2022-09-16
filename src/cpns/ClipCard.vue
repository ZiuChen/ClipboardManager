<template>
  <div class="clip-card" v-show="isShow">
    <div class="clip-card-header">
      <slot name="header">
        <div class="clip-card-header-title">
          {{ title }}
        </div>
        <div class="clip-card-header-operate">
          <span class="clip-card-header-operate-btn" @click="handleCloseBtnClick">❌</span>
        </div>
      </slot>
    </div>
    <div class="clip-card-content">
      <slot>
        <template v-for="c of content.split('\n')">
          <div class="clip-card-content-item">
            {{ c }}
          </div>
        </template>
      </slot>
    </div>
    <div class="clip-card-footer"><slot name="footer"></slot></div>
  </div>
  <div class="clip-overlay" v-show="isShow"></div>
</template>

<script setup>
const emit = defineEmits(['onClose'])
const props = defineProps({
  isShow: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  version: {
    type: Number,
    default: 0
  }
})
const handleCloseBtnClick = () => {
  utools.dbStorage.setItem('notify', {
    title: props.title,
    content: props.content,
    version: props.version
  })
  emit('onClose')
}
</script>

<style lang="less" scoped>
@import '../style';
</style>
