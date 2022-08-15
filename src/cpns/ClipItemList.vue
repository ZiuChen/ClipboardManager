<template>
  <div class="clip-item-list">
    <div
      class="clip-item"
      v-for="(item, index) in showList"
      :key="item.createTime"
      @click.left="handleItemClick($event, item)"
      @click.right="handleItemClick($event, item)"
    >
      <div class="clip-info">
        <div class="clip-time">
          <span>{{ dateFormat(item.updateTime) }}</span>
        </div>
        <div class="clip-data">
          <template v-if="item.type === 'text'">
            <div
              class="clip-data-status"
              v-if="item.data.length >= 500"
              @click.stop="handleDataClick(item)"
            >
              查看全部
            </div>
            {{ item.data.slice(0, 500).trim() }}
          </template>
          <template v-if="item.type === 'image'">
            <img :src="item.data" alt="Image" />
            <div class="clip-data-status">{{ item.size }}</div>
          </template>
          <template v-if="item.type === 'file'">
            <div
              class="clip-data-status"
              v-if="JSON.parse(item.data).length >= 8"
              @click.stop="handleDataClick(item)"
            >
              点此查看全部>>
            </div>
            <FileList :data="JSON.parse(item.data)" />
          </template>
        </div>
      </div>
      <div class="clip-count">{{ index + 1 }}</div>
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
const handleItemClick = (ev, item) => {
  const { button } = ev
  if (button === 0) {
    // 左键 复制后粘贴
    window.copy(item)
    window.paste()
  } else if (button === 2) {
    // 右键 仅复制
    window.copy(item)
  }
}
const handleDataClick = (item) => emit('onDataChange', item)
</script>

<style lang="less" scoped>
@import '../style';
</style>
