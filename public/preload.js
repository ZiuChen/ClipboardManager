// /*
// 	name: clipboard_manager
// 	author: Github @ZiuChen
// 	lastUpdate: v1.0.0 2022/08/14
// 	desc: 监听剪贴板 读写本地文件
// */

const fs = require('fs')
const crypto = require('crypto')
const { clipboard } = require('electron')
const nativeImage = require('electron').nativeImage

const home = utools.getPath('home')

const dbName = '_utools_clipboard_manager_storage'

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
        const dataBase = JSON.parse(data)
        this.dataBase = dataBase
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
    this.updateDataBaseLocal()
  }
  emptyDataBase() {
    this.dataBase.data = []
    this.updateDataBase()
    this.updateDataBaseLocal()
  }
  filterDataBaseViaData(key) {
    // 过滤展示数据
    // TODO: 添加文件/目录名筛选
    const filterValue = key.toLowerCase()
    const textItems = this.dataBase.data.filter((item) => item.type === 'text')
    return textItems.filter((item) => item.data.toLowerCase().indexOf(filterValue) !== -1)
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
}

// inu1255: pbpaste & watchClipboard
const pbpaste = () => {
  const files = utools.getCopyedFiles() // null | Array
  if (files) {
    return {
      type: 'file',
      data: JSON.stringify(files)
    }
  }
  const image = clipboard.readImage()
  if (!image.isEmpty())
    return {
      type: 'image',
      size: `${image.getSize().width}x${image.getSize().height}`,
      data: image.toDataURL()
    }
  const text = clipboard.readText()
  if (text.trim()) return { type: 'text', data: text }
}

const watchClipboard = (db, fn) => {
  let prev = db.dataBase.data[0] || {}
  setInterval(() => {
    const item = pbpaste()
    item.id = crypto.createHash('md5').update(item.data).digest('hex')
    if (item && prev.id != item.id) {
      // 剪切板元素 与最近一次复制内容不同
      prev = item
      fn(item)
    } else {
      // 剪切板元素 与上次复制内容相同
      // 无更新
    }
  }, 500)
}

const copy = (item) => {
  switch (item.type) {
    case 'text':
      clipboard.writeText(item.data)
      break
    case 'image':
      const nImg = nativeImage.createFromDataURL(item.data)
      clipboard.writeImage(nImg)
      break
    case 'file':
      const paths = JSON.parse(item.data).map((file) => file.path)
      utools.copyFile(paths)
      break
  }
  utools.outPlugin()
  utools.hideMainWindow()
}

const path = `${home}\\${dbName}`
const db = new DB(path)
db.init()

watchClipboard(db, (item) => {
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

window.db = db
window.copy = copy
window.openFile = utools.shellOpenPath
window.getIcon = utools.getFileIcon
