const { utools, existsSync, readFileSync, writeFileSync, mkdirSync, crypto, clipboard, time } =
  window.exports
import setting from './readSetting'

export default function initPlugin() {
  const SEP = utools.isWindows() ? '\\' : '/'
  class DB {
    constructor(path) {
      const d = new Date()
      this.path = path
      this.dataBase = {}
      this.createTime = d.getTime()
      this.updateTime = d.getTime()
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
        } catch (err) {
          utools.showNotification('读取剪切板出错: ' + err)
          return
        }
        return
      }
      const defaultDB = {
        data: [],
        createTime: this.createTime,
        updateTime: this.updateTime
      }
      this.dataBase = defaultDB
      this.updateDataBaseLocal(defaultDB)
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
      this.updateDataBase()
      this.updateDataBaseLocal()
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

  const copy = (item, isHideMainWindow = true) => {
    switch (item.type) {
      case 'text':
        utools.copyText(item.data)
        break
      case 'image':
        utools.copyImage(item.data)
        break
      case 'file':
        const paths = JSON.parse(item.data).map((file) => file.path)
        utools.copyFile(paths)
        break
    }
    isHideMainWindow && utools.hideMainWindow()
  }

  const paste = () => {
    if (utools.isMacOs()) utools.simulateKeyboardTap('v', 'command')
    else utools.simulateKeyboardTap('v', 'ctrl')
  }

  const createFile = (item) => {
    const tempPath = utools.getPath('temp')
    const folderPath = tempPath + SEP + 'utools-clipboard-manager'
    if (!existsSync(folderPath)) {
      try {
        mkdirSync(folderPath)
      } catch (err) {
        utools.showNotification('创建临时文件夹出错: ' + err)
      }
    }
    const { type } = item
    if (type === 'image') {
      const base64Data = item.data.replace(/^data:image\/\w+;base64,/, '') // remove the prefix
      const buffer = Buffer.from(base64Data, 'base64') // to Buffer
      const filePath = folderPath + SEP + new Date().valueOf() + '.png'
      writeFileSync(filePath, buffer)
      return filePath
    } else if (type === 'text') {
      const filePath = folderPath + SEP + new Date().valueOf() + '.txt'
      writeFileSync(filePath, item.data)
      return filePath
    }
  }

  const db = new DB(setting.database.path)
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

  utools.onPluginEnter(() => {
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
}
