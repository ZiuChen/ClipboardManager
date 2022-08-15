<template>
  <div class="clip-full-data">
    <div class="clip-full" v-show="isShow">
      <div v-if="fullData.type === 'text'">
        <div v-text="fullData.data"></div>
      </div>
      <div v-else>
        <FileList :data="fullData.data"></FileList>
      </div>
    </div>
  </div>
  <div class="clip-overlay" v-show="isShow" @click="onOverlayClick"></div>
</template>

<script setup>
import FileListVue from './FileList.vue'

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
</script>

<style lang="less" scoped>
@import '../style/cpns/clip-full-data.less';
</style>
