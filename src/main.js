import { createApp } from 'vue'
import App from './App.vue'
import less from 'less'

const app = createApp(App)

app.use(less)

app.mount('#app')
