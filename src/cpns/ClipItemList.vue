<template>
  <div class="clip-item-list">
    <div
      class="clip-item"
      v-for="(item, index) in showList"
      :key="item.createTime"
      @click.left="handleItemClick($event, item)"
      @click.right="handleItemClick($event, item)"
      @mouseover="handleMouseOver(index)"
      :class="{ active: index === activeIndex }"
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
            <div>{{ item.data.slice(0, 500).trim() }}</div>
          </template>
          <template v-if="item.type === 'image'">
            <img class="clip-data-image" :src="item.data" alt="Image" />
            <div class="clip-data-status">{{ item.size }}</div>
          </template>
          <template v-if="item.type === 'file'">
            <div
              class="clip-data-status"
              v-if="JSON.parse(item.data).length >= 8"
              @click.stop="handleDataClick(item)"
            >
              查看全部
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
import { ref, onMounted, watch } from 'vue'
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
const activeIndex = ref(0)
const handleMouseOver = (index) => (activeIndex.value = index)
// 父组件中改变了引用类型的地址 故要用 getter返回
watch(
  () => props.showList,
  () => (activeIndex.value = 0)
)
onMounted(() => {
  // 监听键盘事件
  document.addEventListener('keydown', (e) => {
    const { key, ctrlKey } = e
    const isArrowUp = key === 'ArrowUp'
    const isArrowDown = key === 'ArrowDown'
    const isEnter = key === 'Enter'
    const isCopy = ctrlKey && (key === 'C' || key === 'c')
    if (isArrowUp) {
      if (activeIndex.value > 0) {
        activeIndex.value--
        const activeNode = document.querySelector('.clip-item.active')
        if (activeIndex.value === 1) {
          window.toTop()
        } else {
          activeNode?.previousElementSibling?.previousElementSibling?.scrollIntoView({
            block: 'nearest',
            inline: 'nearest'
          })
        }
      }
    } else if (isArrowDown) {
      if (activeIndex.value < props.showList.length - 1) {
        activeIndex.value++
        document
          .querySelector('.clip-item.active+.clip-item')
          ?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
      }
    } else if (isCopy) {
      window.copy(props.showList[activeIndex.value])
    } else if (isEnter) {
      window.copy(props.showList[activeIndex.value])
      window.paste()
    }
  })
})
</script>

<style lang="less" scoped>
@import '../style';
</style>
