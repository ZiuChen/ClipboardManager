import restoreSetting from './restoreSetting'
import defaultSetting from '../data/setting.json'
import { pointToObj } from '../utils'

defaultSetting = pointToObj(defaultSetting)

// 比较默认设置与当前设置
function compareSetting() {
  const setting = utools.dbStorage.getItem('setting') || restoreSetting()
  // 如果默认设置中新增了某个设置项，为本地设置添加该项
  for (const key in defaultSetting) {
    if (setting[key] === undefined) {
      setting[key] = defaultSetting[key]
    }
  }
  // 如果默认设置中删除了某个设置项，删除本地设置中的该项
  for (const key in setting) {
    if (defaultSetting[key] === undefined) {
      delete setting[key]
    }
  }
  return setting
}

const setting = compareSetting()

export default setting
