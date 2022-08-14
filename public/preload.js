// /*
// 	name: powerful_clipboard_manager
// 	author: Github @ZiuChen
// 	lastUpdate: v0.0.1 2022/08/14
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
  setItem(cItem) {
    this.dataBase.data.unshift(cItem)
    this.updateDataBase()
    this.updateDataBaseLocal()
  }
  emptyDataBase() {
    this.dataBase.data = []
    this.updateDataBase()
    this.updateDataBaseLocal()
  }
  filterDataBase(key) {
    // 过滤展示数据
    // TODO: 添加文件/目录名筛选
    const filterValue = key.toLowerCase()
    const textItems = this.dataBase.data.filter((item) => item.type === 'text')
    return textItems.filter((item) => item.data.toLowerCase().indexOf(filterValue) !== -1)
  }
}

// inu1255: pbpaste & watchClipboard
function pbpaste() {
  // let file;
  // if (file) return {type: "file", data: file};
  const image = clipboard.readImage()
  if (!image.isEmpty())
    return {
      type: 'image',
      size: `${image.getSize().width}x${image.getSize().height}`,
      data: image.toDataURL()
    }
  let text = clipboard.readText()
  if (text.trim()) return { type: 'text', data: text }
}

function watchClipboard(fn) {
  let prev = {}
  setInterval(() => {
    const item = pbpaste()
    console.log(item)
    // 比较前后两次剪切板内容的哈希值是否相同 如果相同则不更新
    item._id = crypto.createHash('md5').update(item).digest('hex')
    if (item && prev._id != item._id) {
      // 剪切板有更新
      prev = item
      fn(item)
    }
  }, 500)
}

function copy(item) {
  switch (item.type) {
    case 'text':
      clipboard.writeText(item.data)
      break
    case 'image':
      const nImg = nativeImage.createFromDataURL(item.data)
      clipboard.writeImage(nImg)
      break
    case 'file':
      clipboard.writeText(item.data)
      break
  }
}

const path = `${home}\\${dbName}`
const db = new DB(path)
db.init()

watchClipboard((item) => {
  if (!item) return
  item.id = crypto.createHash('md5').update(item.data).digest('hex')
  item.createTime = new Date().getTime()
  db.setItem(item)
})

window.db = db
window.copy = copy
