import restoreSetting from './restoreSetting'
import { defaultPath } from './restoreSetting'
import { getNativeId } from '../utils'

const setting = utools.dbStorage.getItem('setting') || restoreSetting()
const nativeId = getNativeId()

// 旧版本的setting中path是字符串，新版本的path是对象
if (typeof setting.database.path === 'string') {
  setting.database.path = {
    [nativeId]: setting.database.path
  }
} else {
  // 新版本的setting中path是对象，但是没有当前平台的路径
  if (!setting.database.path[nativeId]) {
    setting.database.path[nativeId] = defaultPath
  }
}

// 将设置更新到数据库
utools.dbStorage.setItem('setting', setting)

export default setting
