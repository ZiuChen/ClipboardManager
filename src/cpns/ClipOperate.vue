<template>
  <div class="clip-operate">
    <template v-for="{ id, title, icon } of operation">
      <div
        v-if="
          (id !== 'collect' &&
            id !== 'view' &&
            id !== 'open-folder' &&
            id !== 'un-collect' &&
            id !== 'word-break' &&
            id !== 'save-file') ||
          (id === 'collect' && item.collect !== true) ||
          (id === 'view' && !isFullData) ||
          (id === 'open-folder' && item.type === 'file') ||
          (id === 'un-collect' && item.collect === true) ||
          (id === 'save-file' && isFullData && item.type !== 'file') ||
          (id === 'word-break' &&
            isFullData &&
            item.type === 'text' &&
            item.data.length <= 500 &&
            item.data.length >= 2)
        "
        :class="id"
        :title="title"
        @click.stop="handleOperateClick({ id, item })"
      >
        {{ icon }}
      </div>
    </template>
  </div>
</template>

<script setup>
const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  isFullData: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['onDataChange', 'onDataRemove', 'onOperateExecute'])
const operation = [
  { id: 'copy', title: '复制', icon: '📄' },
  { id: 'view', title: '查看全部', icon: '💬' },
  { id: 'open-folder', title: '打开文件夹', icon: '📁' },
  { id: 'collect', title: '收藏', icon: '⭐' },
  { id: 'un-collect', title: '取消收藏', icon: '📤' },
  { id: 'word-break', title: '分词', icon: '💣' },
  { id: 'save-file', title: '保存', icon: '💾' },
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
    case 'word-break':
      utools.redirect('超级分词', item.data)
      break
    case 'save-file':
      const typeMap = {
        text: 'text',
        file: 'files',
        image: 'img'
      }
      utools.redirect('收集文件', {
        type: typeMap[item.type],
        data: item.data
      })
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
  emit('onOperateExecute')
}
</script>

<style lang="less" scoped>
@import '../style';
</style>
