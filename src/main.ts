import './assets/reset.css'
import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'

const app = createApp(App)

app.use(router)

// Mount only after isReady(): App.vue's immediate route watcher must see the resolved URL
router.isReady().then(() => app.mount('#app'))
