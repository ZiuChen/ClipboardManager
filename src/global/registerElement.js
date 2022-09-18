import 'element-plus/theme-chalk/base.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'element-plus/theme-chalk/el-overlay.css'
import { ElButton, ElMessageBox, ElMessage, ElCard } from 'element-plus'

const components = [ElButton, ElMessageBox, ElMessage, ElCard]

export default function registerElement(app) {
  components.forEach((c) => {
    let name = transferCamel(c.name)
    if (c.name === 'MessageBox') name = 'el-message-box'
    if (c.name === 'message') name = 'el-message'
    require(`element-plus/theme-chalk/${name}.css`)
    app.component(name, c)
  })
}

function transferCamel(camel) {
  return camel
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .slice(1)
}
