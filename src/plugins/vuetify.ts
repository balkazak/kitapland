import { createVuetify, type ThemeDefinition } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'

import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import LuxonAdapter from '@date-io/luxon'

const luxon = new LuxonAdapter({ locale: 'ru' })

const customTheme: ThemeDefinition = {
  dark: false,
  colors: {
    background: '#F2F2F2',
    primary: '#125CFA',
    secondary: '#0D121C',
    error: '#D82D21',
    success: '#93370E',
    warning: '#DC6903'
  }
}

export default createVuetify({
  components,
  directives,
  date: {
    adapter: luxon
  },
  theme: {
    defaultTheme: 'customTheme',
    themes: {
      customTheme
    }
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi
    }
  }
})
