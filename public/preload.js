// /*
// 	name: clipboard_manager
// 	author: Github @ZiuChen
// 	desc: 监听剪贴板 读写本地文件
// */

const fs = require('fs')
const crypto = require('crypto')
const { clipboard } = require('electron')

const homePath = utools.getPath('home')
const userDataPath = utools.getPath('userData')
const dbName = '_utools_clipboard_manager_storage'

const isMacOs = utools.isMacOs()
const isWindows = utools.isWindows()
const DBPath = `${isMacOs ? userDataPath : homePath}${isWindows ? '\\' : '/'}${dbName}`

let globalImageOversize = false
let globalTimmerSet = false

class DB {
  constructor(path) {
    const d = new Date()
    this.path = path
    this.dataBase = {}
    this.createTime = d.getTime()
    this.updateTime = d.getTime()
  }
  init() {
    const isExist = fs.existsSync(this.path)
    if (isExist) {
      const data = fs.readFileSync(this.path, {
        encoding: 'utf8'
      })
      try {
        // 读取磁盘记录到内存
        const dataBase = JSON.parse(data)
        this.dataBase = dataBase
        // 将超过14天的数据删除
        const now = new Date().getTime()
        const deleteTime = now - '\u0031\u0034' * '\u0032\u0034' * 60 * 60 * 1000 // unicode
        this.dataBase.data = this.dataBase.data.filter((item) => item.updateTime > deleteTime)
        this.updateDataBaseLocal()
      } catch (err) {
        utools.showNotification('读取剪切板出错' + err)
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
    fs.writeFileSync(this.path, JSON.stringify(dataBase || this.dataBase), (err) => {
      if (err) {
        utools.showNotification('写入剪切板出错' + err)
        return
      }
    })
  }
  addItem(cItem) {
    this.dataBase.data.unshift(cItem)
    this.updateDataBase()
    // unicode
    if (this.dataBase.data.length > '\u0035\u0030\u0030') {
      // 达到条数限制
      this.dataBase.data.pop()
      // 仍然大于: 超出了不止一条
      if (this.dataBase.data.length > '\u0035\u0030\u0030') {
        this.dataBase.data = this.dataBase.data.splice(0, 499)
      }
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

const pbpaste = async () => {
  return new Promise((res) => {
    // file
    const files = utools.getCopyedFiles() // null | Array
    if (files) {
      res({
        type: 'file',
        data: JSON.stringify(files)
      })
    }
    // text
    const text = clipboard.readText()
    if (text.trim()) res({ type: 'text', data: text })
    // image
    const image = clipboard.readImage() // 大图卡顿来源
    const data = image.toDataURL()
    globalImageOversize = data.length > 4e5
    if (!image.isEmpty()) {
      res({
        type: 'image',
        data: data
      })
    }
  })
}

const watchClipboard = async (db, fn) => {
  let prev = db.dataBase.data[0] || {}
  return setInterval(() => {
    pbpaste().then((item) => {
      item.id = crypto.createHash('md5').update(item.data).digest('hex')
      if (item && prev.id != item.id) {
        // 剪切板元素 与最近一次复制内容不同
        prev = item
        fn(item)
      } else {
        // 剪切板元素 与上次复制内容相同
      }
    })
  }, 250)
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

const db = new DB(DBPath)
db.init()

const remove = (item) => db.removeItemViaId(item.id)

const select = () => document.querySelector('.clip-search input').select()
const focus = () => {
  document.querySelector('.clip-search-input').style.display !== 'none'
    ? document.querySelector('.clip-search-input')?.focus()
    : (document.querySelector('.clip-search-btn')?.click(),
      document.querySelector('.clip-search-input')?.focus())
}
const toTop = () => (document.scrollingElement.scrollTop = 0)
const resetNav = () => document.querySelectorAll('.clip-switch-item')[0]?.click()

let timmer = watchClipboard(db, (item) => {
  // 此函数不断执行
  if (!item) return
  if (db.updateItemViaId(item.id)) {
    // 在库中 由 updateItemViaId 更新 updateTime
    return
  }
  // 不在库中 由 addItem 添加
  item.createTime = new Date().getTime()
  item.updateTime = new Date().getTime()
  db.addItem(item)
})

globalTimmerSet = true // 计时器成功添加

utools.onPluginEnter(() => {
  if (globalImageOversize) {
    utools.copyText('ImageOverSized')
    globalImageOversize = false
  }
  if (!globalTimmerSet) {
    // 定时器被清除了 重新添加计时器
    // same to code above
    timmer = watchClipboard(db, (item) => {
      if (!item) return
      if (db.updateItemViaId(item.id)) {
        return
      }
      item.createTime = new Date().getTime()
      item.updateTime = new Date().getTime()
      db.addItem(item)
    })
  }
  focus()
  select() // 进入插件将搜索框内容全选
  toTop()
  resetNav()
})

utools.onPluginOut((processExit) => {
  // 卡顿来源: 似乎插件每次启动 uTools不会清除插件设置的 interval定时器
  // 插件重复进入/退出会产生多个计时器导致插件卡退
  // 插件退出 清除计时器 插件隐藏后台 不清除
  processExit ? (clearInterval(timmer), (globalTimmerSet = false)) : (globalTimmerSet = true)
})

window.db = db
window.copy = copy
window.paste = paste
window.remove = remove
window.openFile = utools.shellOpenPath
window.openFileFolder = utools.shellShowItemInFolder
window.getIcon = utools.getFileIcon
window.focus = focus
window.toTop = toTop
