<template>
  <div class="clip-full-data">
    <Transition name="fade">
      <div class="clip-full-wrapper" v-show="isShow">
        <div class="clip-full-operate-list">
          <template v-for="{ id, name } of btns">
            <div
              class="clip-full-operate-list-item"
              v-if="id !== 'word-split' || (id === 'word-split' && fullData.type !== 'file')"
              @click="handleBtnClick(id)"
            >
              {{ name }}
            </div>
          </template>
        </div>
        <template v-if="fullData.type === 'text'">
          <div class="clip-full-content" v-text="fullData.data"></div>
        </template>
        <div v-else class="clip-full-content">
          <FileList :data="JSON.parse(fullData.data)"></FileList>
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

const btns = [
  {
    id: 'copy-all',
    name: '📄 复制全部'
  },
  {
    id: 'word-split',
    name: '🎁 智慧分词'
  }
]
const handleBtnClick = (id) => {
  switch (id) {
    case 'copy-all':
      window.copy(props.fullData)
      emit('onOverlayClick') // 退出侧栏
      break
    case 'word-split':
      window.alert('增值服务 Comming Soon...')
      break
  }
}

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
