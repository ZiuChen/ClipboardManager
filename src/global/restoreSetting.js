import defaultSetting from '../data/setting.json'
import { pointToObj, getNativeId } from '../utils'
const { utools } = window.exports

const defaultPath = `${utools.isMacOs() ? utools.getPath('userData') : utools.getPath('home')}${
  window.exports.sep
}_utools_clipboard_manager_storage`

const nativeId = getNativeId()

export default function restoreSetting() {
  // 将defaultSetting的key点语法转换为对象
  const setting = pointToObj(defaultSetting)
  setting.database.path[nativeId] = defaultPath // 根据不同设备设置不同的默认路径
  utools.dbStorage.setItem('setting', setting)
  return setting
}

export { defaultPath }
