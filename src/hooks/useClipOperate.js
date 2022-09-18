import { ElMessage } from 'element-plus'
import setting from '../global/readSetting'

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
          data: item.type === 'file' ? JSON.parse(item.data).map((f) => f.path) : item.data
        })
      } else if (id === 'remove') {
        window.remove(item)
        emit('onDataRemove')
      } else if (id.indexOf('custom') !== -1) {
        const a = operation.command.split(':')
        if (a[0] === 'redirect') {
          utools.redirect(a[1], {
            type: typeMap[item.type],
            data: item.type === 'file' ? JSON.parse(item.data).map((f) => f.path) : item.data
          })
        }
      }
      emit('onOperateExecute')
    },
    filterOperate: (operation, item, isFullData) => {
      const { id } = operation
      if (!isFullData) {
        // 在非预览页 只展示配置在shown中的功能按钮 大小为 4
        for (const sid of setting.operation.shown) {
          if (id === sid) return true
        }
        return false
      } else {
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
          return true
        } else if (id === 'remove') {
          return true
        } else if (id.indexOf('custom') !== -1) {
          // 如果匹配到了自定义的操作 则展示
          for (const m of operation.match) {
            if (typeof m === 'string') {
              if (item.type === m) {
                return true
              }
            } else if (typeof m === 'object') {
              // 根据正则匹配内容
              const r = new RegExp(m.regex)
              if (item.type === 'file') {
                const fl = JSON.parse(item.data)
                for (const f of fl) {
                  if (r.test(f.name)) {
                    return true
                  }
                }
              } else {
                if (r.test(item.data)) {
                  return true
                }
              }
            }
          }
          return false
        }
      }
    }
  }
}
