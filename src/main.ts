import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'

import ru from './locales/ru.json'
import kk from './locales/kk.json'

import App from './App.vue'
import router from './router'

import 'vuetify/styles'
import vuetify from './plugins/vuetify'

const app = createApp(App)

const i18n = createI18n({
  legacy: false,
  locale: 'ru',
  messages: {
    ru,
    kk
  }
})

app.use(createPinia())
app.use(router)
app.use(vuetify)
app.use(i18n)

app.mount('#app')
