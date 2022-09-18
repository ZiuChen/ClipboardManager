import { createApp } from 'vue'
import App from './App.vue'
import less from 'less'
import registerElement from './global/registerElement'

const app = createApp(App)

app.use(less).use(registerElement)

app.mount('#app')
