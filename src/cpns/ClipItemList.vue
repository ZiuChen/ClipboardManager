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
          <template v-if="item.type === 'text'">
            <span
              class="clip-data-status"
              v-if="item.data.split(`\n`).length - 1 > 7"
              @click.stop="handleDataClick(item)"
            >
              查看全部
            </span>
            <span v-else>{{ dateFormat(item.updateTime) }}</span>
          </template>
          <template v-if="item.type === 'image'">
            <span>{{ dateFormat(item.updateTime) }}</span>
          </template>
          <template v-if="item.type === 'file'">
            <span
              class="clip-data-status"
              v-if="JSON.parse(item.data).length >= 7"
              @click.stop="handleDataClick(item)"
            >
              查看全部
            </span>
            <span v-else>{{ dateFormat(item.updateTime) }}</span>
          </template>
        </div>
        <div class="clip-data">
          <template v-if="item.type === 'text'">
            <div>{{ item.data.split(`\n`).slice(0, 7).join(`\n`).trim() }}</div>
          </template>
          <template v-if="item.type === 'image'">
            <img class="clip-data-image" :src="item.data" alt="Image" />
          </template>
          <template v-if="item.type === 'file'">
            <FileList :data="JSON.parse(item.data)" />
          </template>
        </div>
      </div>
      <div class="clip-operate" v-show="activeIndex === index">
        <template v-for="{ id, title, icon } of operation">
          <div
            v-if="
              (id !== 'collect' && id !== 'view' && id !== 'open-folder' && id !== 'un-collect') ||
              (id === 'collect' && item.collect !== true) ||
              (id === 'view' && item.type !== 'image') ||
              (id === 'open-folder' && item.type === 'file') ||
              (id === 'un-collect' && item.collect === true)
            "
            :class="id"
            :title="title"
            @click.stop="handleOperateClick({ id, item })"
          >
            {{ icon }}
          </div>
        </template>
      </div>
      <div class="clip-count" v-show="activeIndex !== index">
        {{ index + 1 }}
      </div>
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
  },
  fullData: {
    type: Object,
    required: true
  }
})
const emit = defineEmits(['onDataChange', 'onDataRemove'])
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
const operation = [
  { id: 'copy', title: '复制', icon: '📄' },
  { id: 'view', title: '查看全部', icon: '💬' },
  { id: 'open-folder', title: '打开文件夹', icon: '📁' },
  { id: 'collect', title: '收藏', icon: '⭐' },
  { id: 'un-collect', title: '取消收藏', icon: '📤' },
  { id: 'remove', title: '删除', icon: '❌' }
]
const handleOperateClick = ({ id, item }) => {
  switch (id) {
    case 'copy':
      window.copy(item, false)
      break
    case 'view':
      emit('onDataChange', item)
      break
    case 'open-folder':
      const { data } = item
      const fl = JSON.parse(data)
      window.openFileFolder(fl[0].path) // 取第一个文件的路径打开
      break
    case 'collect':
      item.collect = true
      window.db.updateDataBaseLocal(db)
      break
    case 'un-collect':
      item.collect = undefined
      window.db.updateDataBaseLocal(db)
      break
    case 'remove':
      window.remove(item)
      emit('onDataRemove')
      break
  }
}
// 父组件中改变了引用类型的地址 故要用 getter返回
watch(
  () => props.showList,
  () => (activeIndex.value = 0)
)
onMounted(() => {
  // 监听键盘事件
  document.addEventListener('keydown', (e) => {
    const { key, ctrlKey, metaKey, altKey } = e
    const isArrowUp = key === 'ArrowUp'
    const isArrowDown = key === 'ArrowDown'
    const isEnter = key === 'Enter'
    const isCopy = (ctrlKey || metaKey) && (key === 'C' || key === 'c')
    const isNumber = parseInt(key) <= 9 && parseInt(key) >= 0
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
      if (props.fullData.data === '') {
        // 如果侧栏中有数据 证明侧栏是打开的 不执行复制
        window.copy(props.showList[activeIndex.value])
      }
    } else if (isEnter) {
      window.copy(props.showList[activeIndex.value])
      window.paste()
    } else if ((ctrlKey || metaKey || altKey) && isNumber) {
      window.copy(props.showList[parseInt(key) - 1])
      window.paste()
    }
  })
})
</script>

<style lang="less" scoped>
@import '../style';
</style>
