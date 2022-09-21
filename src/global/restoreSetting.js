import defaultSetting from '../data/setting.json'
import { pointToObj } from '../utils'

const SEP = utools.isWindows() ? '\\' : '/'
const defaultPath = `${
  utools.isMacOs() ? utools.getPath('userData') : utools.getPath('home')
}${SEP}_utools_clipboard_manager_storage`

export default function restoreSetting() {
  // 将defaultSetting的key点语法转换为对象
  const setting = pointToObj(defaultSetting)
  setting.database.path = defaultPath
  utools.dbStorage.setItem('setting', setting)
  return setting
}
