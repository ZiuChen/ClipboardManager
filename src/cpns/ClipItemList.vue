<template>
  <div class="clip-item-list">
    <div
      class="clip-item"
      v-for="(item, index) in showList"
      :key="item.createTime"
      @click="executeCopy(item)"
    >
      <div class="clip-info">
        <div class="clip-time">
          <span>{{ dateFormat(item.updateTime) }}</span>
        </div>
        <div class="clip-data">
          <template v-if="item.type === 'text'">
            {{ item.data.slice(0, 500).trim() }}
          </template>
          <template v-if="item.type === 'image'">
            <img :src="item.data" alt="Image" />
            <div class="clip-image-size">{{ item.size }}</div>
          </template>
          <template v-if="item.type === 'file'">
            <FileList :data="JSON.parse(item.data)" />
          </template>
        </div>
      </div>
      <div class="clip-count">{{ index + 1 }}</div>
      <div
        class="clip-more"
        v-if="
          (item.type === 'text' && item.data.length >= 500) ||
          (item.type === 'file' && JSON.parse(item.data).length >= 8)
        "
        @click.stop="onDataChange(item)"
      >
        📃
      </div>
    </div>
  </div>
</template>

<script setup>
import FileList from './FileList.vue'
import { dateFormat } from '../utils'
const props = defineProps({
  showList: {
    type: Array,
    required: true
  }
})
const emit = defineEmits(['onDataChange'])
const executeCopy = (item) => window.copy(item)
const onDataChange = (item) => {
  console.log(item)
  emit('onDataChange', item)
}
</script>

<style lang="less" scoped>
@import '../style';
</style>
