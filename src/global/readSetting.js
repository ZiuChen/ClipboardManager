import defaultSetting from '../data/setting.json'

const sep = utools.isWindows() ? '\\' : '/'
const defaultPath = `${
  utools.isMacOs() ? utools.getPath('userData') : utools.getPath('home')
}${sep}_utools_clipboard_manager_storage`

let setting = utools.dbStorage.getItem('setting')
if (!setting) {
  // 将defaultSetting的key点语法转换为对象
  setting = {}
  for (const key in defaultSetting) {
    const keys = key.split('.')
    let obj = setting
    for (let i = 0; i < keys.length; i++) {
      if (i === keys.length - 1) {
        obj[keys[i]] = defaultSetting[key]
      } else {
        if (!obj[keys[i]]) obj[keys[i]] = {}
        obj = obj[keys[i]]
      }
    }
  }
  setting.database.path = defaultPath
  utools.dbStorage.setItem('setting', setting)
}

export default setting
