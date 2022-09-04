<template>
  <div class="clip-full-data">
    <Transition name="fade">
      <div class="clip-full" v-show="isShow">
        <div v-if="fullData.type === 'text'">
          <div v-text="fullData.data"></div>
        </div>
        <div v-else>
          <FileList :data="fullData.data"></FileList>
        </div>
      </div>
    </Transition>
    <div class="clip-overlay" v-show="isShow" @click="onOverlayClick"></div>
  </div>
</template>

<script setup>
import FileList from './FileList.vue'
import { onMounted } from 'vue'

const props = defineProps({
  isShow: {
    type: Boolean,
    required: true
  },
  fullData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['onOverlayClick'])
const onOverlayClick = () => emit('onOverlayClick')

onMounted(() => {
  document.addEventListener('keydown', (e) => {
    const { key } = e
    if (key === 'Escape' && props.fullData.data) {
      // 有值时执行退出 Overlay
      emit('onOverlayClick')
      e.stopPropagation()
    }
  })
})
</script>

<style lang="less" scoped>
@import '../style';
.fade-enter-active,
.fade-leave-active {
  transition: all 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  width: 0px;
  opacity: 0;
}
</style>
