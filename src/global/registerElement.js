import 'element-plus/theme-chalk/base.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'element-plus/theme-chalk/el-overlay.css'
import 'element-plus/theme-chalk/el-button.css'
import 'element-plus/theme-chalk/el-message-box.css'
import 'element-plus/theme-chalk/el-message.css'
import 'element-plus/theme-chalk/el-card.css'
import 'element-plus/theme-chalk/el-input.css'
import 'element-plus/theme-chalk/el-select.css'
import 'element-plus/theme-chalk/el-option.css'
import 'element-plus/theme-chalk/el-scrollbar.css'
import 'element-plus/theme-chalk/el-tag.css'
import {
  ElButton,
  ElMessageBox,
  ElMessage,
  ElCard,
  ElInput,
  ElSelect,
  ElOption,
  ElScrollbar,
  ElTag
} from 'element-plus'

const components = [
  ElButton,
  ElMessageBox,
  ElMessage,
  ElCard,
  ElInput,
  ElSelect,
  ElOption,
  ElScrollbar,
  ElTag
]

document.querySelector('html').className = utools.isDarkColors() ? 'dark' : ''

export default function registerElement(app) {
  components.forEach((c) => {
    let name = transferCamel(c.name)
    app.component(name, c)
  })
}

function transferCamel(camel) {
  return camel
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .slice(1)
}
