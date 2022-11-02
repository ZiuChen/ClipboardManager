const {
  utools,
  existsSync,
  readFileSync,
  writeFileSync,
  watch,
  crypto,
  listener,
  clipboard,
  time
} = window.exports
import { copy, paste, createFile, getNativeId } from '../utils'
import setting from './readSetting'

export default function initPlugin() {
  class DB {
    constructor(path) {
      const d = new Date()
      this.path = path
      this.dataBase = {}
      this.createTime = d.getTime()
      this.updateTime = d.getTime()
      this.defaultDB = {
        data: [],
        createTime: this.createTime,
        updateTime: this.updateTime
      }
    }
    init() {
      const isExist = existsSync(this.path)
      if (isExist) {
        const data = readFileSync(this.path, {
          encoding: 'utf8'
        })
        try {
          // 读取磁盘记录到内存
          const dataBase = JSON.parse(data)
          this.dataBase = dataBase
          // 将超过14天的数据删除 排除掉收藏
          const now = new Date().getTime()
          const deleteTime = now - setting.database.maxage * 24 * 60 * 60 * 1000 // unicode
          this.dataBase.data = this.dataBase.data?.filter(
            (item) => item.updateTime > deleteTime || item.collect
          )
          this.updateDataBaseLocal()
          this.watchDataBaseUpdate()
        } catch (err) {
          utools.showNotification('读取剪切板出错: ' + err)
          return
        }
        return
      }
      this.dataBase = this.defaultDB
      this.updateDataBaseLocal(this.defaultDB)
    }
    watchDataBaseUpdate() {
      watch(this.path, (eventType, filename) => {
        if (eventType === 'change') {
          // 更新内存中的数据
          const data = readFileSync(this.path, {
            encoding: 'utf8'
          })
          try {
            const dataBase = JSON.parse(data)
            this.dataBase = dataBase
            window.db.dataBase = dataBase // 更新内存中数据
            listener.emit('view-change') // 触发视图更新
          } catch (err) {
            utools.showNotification('读取剪切板出错: ' + err)
            return
          }
        }
      })
    }
    updateDataBase() {
      // 更新内存数据
      this.dataBase.updateTime = new Date().getTime()
    }
    updateDataBaseLocal(dataBase) {
      // 更新文件数据
      writeFileSync(this.path, JSON.stringify(dataBase || this.dataBase), (err) => {
        if (err) {
          utools.showNotification('写入剪切板出错: ' + err)
          return
        }
      })
    }
    addItem(cItem) {
      this.dataBase.data.unshift(cItem)
      this.updateDataBase()
      const exceedCount = this.dataBase.data.length - setting.database.maxsize
      if (exceedCount > 0) {
        // 达到条数限制 在收藏条数限制内遍历非收藏历史并删除
        // 所有被移除的 item都存入tempList
        const tmpList = []
        for (let i = 0; i < exceedCount; i++) {
          const item = this.dataBase.data.pop()
          tmpList.push(item)
        }
        tmpList.forEach((item) => !item.collect || this.dataBase.data.push(item)) // 收藏内容 重新入栈
      }
      this.updateDataBaseLocal()
    }
    emptyDataBase() {
      this.dataBase.data = []
      window.db.dataBase.data = []
      this.updateDataBaseLocal(this.defaultDB)
      listener.emit('view-change')
    }
    filterDataBaseViaId(id) {
      return this.dataBase.data.filter((item) => item.id === id)
    }
    updateItemViaId(id) {
      for (const item of this.dataBase.data) {
        if (item.id === id) {
          item.updateTime = new Date().getTime()
          this.sortDataBaseViaTime()
          return true
        }
      }
      return false
    }
    sortDataBaseViaTime() {
      this.dataBase.data = this.dataBase.data.sort((a, b) => {
        return b.updateTime - a.updateTime
      })
      this.updateDataBaseLocal()
    }
    removeItemViaId(id) {
      for (const item of this.dataBase.data) {
        if (item.id === id) {
          this.dataBase.data.splice(this.dataBase.data.indexOf(item), 1)
          this.updateDataBaseLocal()
          return true
        }
      }
      return false
    }
  }

  const pbpaste = () => {
    // file
    const files = utools.getCopyedFiles() // null | Array
    if (files) {
      return {
        type: 'file',
        data: JSON.stringify(files)
      }
    }
    // text
    const text = clipboard.readText()
    if (text.trim()) return { type: 'text', data: text }
    // image
    const image = clipboard.readImage() // 大图卡顿来源
    const data = image.toDataURL()
    if (!image.isEmpty()) {
      return {
        type: 'image',
        data: data
      }
    }
  }

  // 根据当前设备id读取不同路径 若为旧版本则迁移数据
  const nativeId = getNativeId()
  console.log(setting.database.path[nativeId])
  const db = new DB(setting.database.path[nativeId] || setting.database.path)
  db.init()

  const remove = (item) => db.removeItemViaId(item.id)

  const focus = (isBlur = false) => {
    return document.querySelector('.clip-search').style.display !== 'none'
      ? isBlur
        ? document.querySelector('.clip-search-input')?.blur()
        : document.querySelector('.clip-search-input')?.focus()
      : (document.querySelector('.clip-search-btn')?.click(),
        document.querySelector('.clip-search-input')?.focus())
  }
  const toTop = () => (document.scrollingElement.scrollTop = 0)
  const resetNav = () => document.querySelectorAll('.clip-switch-item')[0]?.click()

  const handleClipboardChange = (item = pbpaste()) => {
    if (!item) return
    item.id = crypto.createHash('md5').update(item.data).digest('hex')
    if (db.updateItemViaId(item.id)) {
      // 在库中 由 updateItemViaId 更新 updateTime
      return
    }
    // 不在库中 由 addItem 添加
    item.createTime = new Date().getTime()
    item.updateTime = new Date().getTime()
    db.addItem(item)
  }

  const addCommonListener = () => {
    let prev = db.dataBase.data[0] || {}
    function loop() {
      time.sleep(300).then(loop)
      const item = pbpaste()
      if (!item) return
      item.id = crypto.createHash('md5').update(item.data).digest('hex')
      if (item && prev.id != item.id) {
        // 剪切板元素 与最近一次复制内容不同
        prev = item
        handleClipboardChange(item)
      } else {
        // 剪切板元素 与上次复制内容相同
      }
    }
    loop()
  }

  const registerClipEvent = (listener) => {
    const exitHandler = () => {
      utools.showNotification('剪贴板监听异常退出 请重启插件以开启监听')
      utools.outPlugin()
    }
    const errorHandler = (error) => {
      // const info = '请到设置页检查剪贴板监听程序状态'
      // utools.showNotification('启动剪贴板监听程序启动出错: ' + error + info)
      addCommonListener()
    }
    listener
      .on('change', handleClipboardChange)
      .on('close', exitHandler)
      .on('exit', exitHandler)
      .on('error', (error) => errorHandler(error))
  }

  // 首次启动插件 即开启监听
  // 如果监听程序异常退出 则会在errorHandler中开启常规监听
  registerClipEvent(listener)
  listener.startListening(setting.database.path[nativeId])

  utools.onPluginEnter(() => {
    if (!listener.listening) {
      // 进入插件后 如果监听已关闭 则重新开启监听
      registerClipEvent(listener)
      listener.startListening(setting.database.path[nativeId])
    }
    toTop()
    resetNav()
  })

  window.db = db
  window.copy = copy
  window.paste = paste
  window.remove = remove
  window.createFile = createFile
  window.focus = focus
  window.toTop = toTop
  window.listener = listener
}
