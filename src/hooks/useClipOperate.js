import { ElMessage } from 'element-plus'

export default function useClipOperate({ emit }) {
  return {
    handleOperateClick: (operation, item) => {
      const { id } = operation
      const typeMap = {
        text: 'text',
        file: 'files',
        image: 'img'
      }
      if (id === 'copy') {
        window.copy(item, false)
        ElMessage({
          message: '复制成功',
          type: 'success'
        })
      } else if (id === 'view') {
        emit('onDataChange', item)
      } else if (id === 'open-folder') {
        const { data } = item
        const fl = JSON.parse(data)
        utools.shellShowItemInFolder(fl[0].path) // 取第一个文件的路径打开
      } else if (id === 'collect') {
        utools.redirect('添加到「备忘快贴」', {
          type: typeMap[item.type],
          data: item.data
        })
      } else if (id === 'word-break') {
        utools.redirect('超级分词', item.data)
      } else if (id === 'save-file') {
        utools.redirect('收集文件', {
          type: typeMap[item.type],
          data: item.data
        })
      } else if (id === 'remove') {
        window.remove(item)
        emit('onDataRemove')
      } else if (id.indexOf('custom') !== -1) {
        console.log('custom')
      }
      emit('onOperateExecute')
    },

    filterOperate: (operation, item, isFullData) => {
      const { id } = operation
      if (id === 'copy') {
        return true
      } else if (id === 'view') {
        return !isFullData
      } else if (id === 'open-folder') {
        return item.type === 'file'
      } else if (id === 'collect') {
        return item.type !== 'file'
      } else if (id === 'word-break') {
        return item.type === 'text' && item.data.length <= 500 && item.data.length >= 2
      } else if (id === 'save-file') {
        return item.type === 'file'
      } else if (id === 'remove') {
        return true
      } else if (id.indexOf('custom') !== -1) {
        return true
      }
    }
  }
}
