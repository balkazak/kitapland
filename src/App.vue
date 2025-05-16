<script lang="ts" setup>
import { RouterView, useRoute, useRouter } from 'vue-router'
import logo from '@/assets/logo.svg'
import avatar from '@/assets/image-ava.svg'
import { computed, reactive, ref, onMounted } from 'vue'
import { useAuth } from '@/auth/index'
import qrcode from '@/assets/qrcode.pdf'
import { useI18n } from 'vue-i18n'
import Toast from '@/components/Toast.vue'
import { useToastStore } from '@/stores/toast'
import { useAPI } from '@/api'
import fileDownload from 'js-file-download'
import Header from '@/components/ui/Header.vue'
import Footer from '@/components/ui/Footer.vue'
const { t, locale } = useI18n()
const toast = useToastStore()

const menu = ref(false)
const helpMenu = ref(false)
const route = useRoute()
const auth = useAuth()
const router = useRouter()

const api = useAPI()

const platformIntroVideo = computed(() => {
  return locale.value === 'kk' ? '8O-ypRY7GlI' : 'getting_to_know_the_platform'
})

const navigation = computed(() => [
  {
    title: t('dashboard'),
    value: 1,
    props: { prependIcon: 'mdi-view-dashboard', to: { name: 'home' } }
  },
  {
    title: t('subscription'),
    value: 2,
    props: {
      appendIcon: 'mdi-chevron-right',
      prependIcon: 'mdi-card-account-details',
      to: { name: 'users' }
    }
  },
  {
    title: 'M-DATA',
    value: 3,
    props: {
      prependIcon: 'mdi-book-open-blank-variant',
      appendIcon: 'mdi-chevron-right',
      to: { name: 'm-data' }
    }
  },
  {
    title: t('fund'),
    value: 5,
    props: {
      prependIcon: 'mdi-book-multiple',
      appendIcon: 'mdi-chevron-right',
      to: { name: 'fund' }
    }
  },
  {
    title: t('events'),
    value: 4,
    props: {
      prependIcon: 'mdi-calendar-text',
      appendIcon: 'mdi-chevron-right',
      to: { name: 'events' }
    }
  },
  {
    title: 'Справочник',
    value: 20,
    props: {
      prependIcon: 'mdi-library',
      appendIcon: 'mdi-chevron-right',
      to: { name: 'quotes' }
    }
  },
  {
    title: 'Онлайн библиотека',
    value: 11,
    props: {
      prependIcon: 'mdi-library',
      appendIcon: 'mdi-chevron-right',
      to: { name: 'online-library' }
    }
  },
  {
    title: 'Эл. книги для библиотекаря',
    value: 13,
    props: {
      prependIcon: 'mdi-book-open-page-variant',
      appendIcon: 'mdi-chevron-right',
      to: { name: 'e-books-main' }
    }
  },
  {
    title: 'Отчеты',
    value: 10,
    props: {
      prependIcon: 'mdi-file-chart',
      appendIcon: 'mdi-chevron-right',
      to: { name: 'reports' }
    }
  },
  {
    title: t('counterparty'),
    value: 6,
    props: {
      prependIcon: 'mdi-office-building',
      appendIcon: 'mdi-chevron-right',
      to: { name: 'contractor' }
    }
  },
  {
    title: t('inventory_management'),
    value: 7,
    props: { prependIcon: 'mdi-abacus', appendIcon: 'mdi-chevron-right', to: { name: 'inventory' } }
  },
  // {
  //   title: t('book_requests'),
  //   value: 7,
  //   props: {
  //     prependIcon: 'mdi-library-shelves',
  //     appendIcon: 'mdi-chevron-right',
  //     to: { name: 'applies' }
  //   }
  // },
  // {
  //   title: t('book_order'),
  //   value: 8,
  //   props: {
  //     prependIcon: 'mdi-invoice-list',
  //     appendIcon: 'mdi-chevron-right',
  //     to: { name: 'purchase' }
  //   }
  // },
  {
    title: 'MURA GUIDE',
    value: 12,
    props: {
      prependIcon: 'mdi-help-circle-outline',
      appendIcon: 'mdi-chevron-right',
      to: { name: 'guide' }
    }
  }
  // {
  //   title: 'Конкурс',
  //   value: 9,
  //   props: {
  //     prependIcon: 'mdi-library',
  //     appendIcon: 'mdi-chevron-right',
  //     to: { name: 'contest' }
  //   }
  // }
])

const publisherNavigation = computed(() => [
  {
    title: t('dashboard'),
    value: 1,
    props: { prependIcon: 'mdi-view-dashboard', to: { name: 'home' } }
  },
  {
    title: 'M-DATA',
    value: 3,
    props: {
      prependIcon: 'mdi-book-open-blank-variant',
      appendIcon: 'mdi-chevron-right',
      to: { name: 'm-data' }
    }
  },
  {
    title: t('counterparty'),
    value: 5,
    props: {
      prependIcon: 'mdi-office-building',
      appendIcon: 'mdi-chevron-right',
      to: { name: 'contractor' }
    }
  }
])

const switchLocale = (newLocale: string) => {
  locale.value = newLocale
}

const classroomNavigation = computed(() => [
  {
    title: t('dashboard'),
    value: 1,
    props: { prependIcon: 'mdi-view-dashboard', to: { name: 'home' } }
  },
  {
    title: t('subscription'),
    value: 2,
    props: {
      appendIcon: 'mdi-chevron-right',
      prependIcon: 'mdi-card-account-details',
      to: { name: 'users' }
    }
  }
])

const showLayout = computed(() => {
  const noLayoutPages = ['/login', '/apply', '/registration', '/temporary', '/']
  return !noLayoutPages.includes(route.path)
})

const navigationDrawerItems = computed(() => {
  if (auth.user.value && auth.user.value.roles.some((obj) => obj.id === 3 || obj.id === 10)) {
    return navigation.value
  } else if (
    auth.user.value &&
    auth.user.value.roles.some((obj) => obj.id === 4 || obj.id === 11)
  ) {
    return classroomNavigation.value
  } else if (auth.user.value && auth.user.value.roles.some((obj) => obj.id === 7)) {
    return publisherNavigation.value
  } else if (auth.user.value && auth.user.value.roles.some((obj) => obj.id === 5)) {
    return [
      {
        title: 'Панель читателя',
        value: 1,
        props: {
          prependIcon: 'mdi-account-details',
          to: { name: 'readers-panel' }
        }
      },
      {
        title: 'Онлайн библиотека',
        value: 11,
        props: {
          prependIcon: 'mdi-library',
          appendIcon: 'mdi-chevron-right',
          to: { name: 'online-library' }
        }
      }
    ]
  } else if (auth.user.value && auth.user.value.roles.some((obj) => obj.id === 2)) {
    return [
      {
        title: 'M-DATA',
        value: 3,
        props: {
          prependIcon: 'mdi-book-open-blank-variant',
          appendIcon: 'mdi-chevron-right',
          to: { name: 'm-data' }
        }
      },
      {
        title: 'Онлайн библиотека',
        value: 11,
        props: {
          prependIcon: 'mdi-library',
          appendIcon: 'mdi-chevron-right',
          to: { name: 'online-library' }
        }
      }
    ]
  }
  return []
})

const navigationActive = computed(() => {
  switch (route.name) {
    case 'home':
      return 1
    case 'users':
      return 2
    case 'm-data':
      return 3
    case 'fund':
      return 5
    case 'contractor':
      return 6
    case 'inventory':
      return 7
    case 'applies':
      return 8
    case 'purchase':
      return 9
    case 'entity':
      return 14
    case 'quotes':
      return 20
    case 'reports':
      return 10
    case 'online-library':
      return 11
    case 'guide':
    case 'guide-item':
    case 'guide-entries':
    case 'guide-categories':
      return 12
    case 'e-books-main':
      return 13
    case 'events':
      return 4
    default:
      return 0
  }
})

function logoutUser() {
  auth.logout()
  router.push({ name: 'login' })
}

async function downloadPDF() {
  try {
    const response = await api.fetchFileGet('/v1/school/qr')
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'qrcode.pdf'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    toast.success('QR код успешно скачан')
  } catch (e) {
    toast.error(t('qr_generation_error'))
    console.error('Error:', e)
  }
}

const goToHelp = () => {
  window.open('https://wa.me/77052509606', '_blank')
}

const goToGuide = () => {
  window.open('https://guide.qazaqmura.kz/', '_blank')
}

const guideItems = [
  {
    term: 'M-DATA',
    meaning:
      'база данных по РК (библиографических записей). База является коллективной и централизованной'
  },
  {
    term: t('fund'),
    meaning:
      'фонд организации, упорядоченная совокупность книг, других произведений печати, рукописей, видеозаписей, звукозаписей и иных материалов, формируемая библиотекой. В состав фонда, как правило, входят непериодические, периодические и продолжающиеся издания, рукописи, аудиовизуальные материалы и электронные документы'
  },
  {
    term: t('reception'),
    meaning:
      'поступление в фонд, пополнение фонда библиотеки в результате получения обязательного экземпляра, покупки, подписки, дарения, обмена или любого другого способа'
  },
  {
    term: t('counterparty'),
    meaning: 'поставщиками книг или организаций с которого была куплена книга'
  },
  {
    term: t('inventory_management'),
    meaning: 'учет, c оценкой и учетом изменений в инвентаризационных активах\n'
  },
  {
    term: 'Библиотечный абонемент',
    meaning: 'учет, c оценкой и учетом изменений в инвентаризационных активах\n'
  },
  {
    term: t('book_requests'),
    meaning:
      'форма библиотечного обслуживания, предусматривающая выдачу-возврат на-определенных-условиях для использования вне библиотеки. Так же контроль записей\n'
  },
  {
    term: t('dashboard'),
    meaning:
      'инструмент для визуализации и анализа информации о фонде. Данные, выводимые на панель индикаторов, обычно представлены в виде ключевых показателей эффективности\n'
  },
  {
    term: t('mura_guide'),
    meaning: 'интернет ресурс где расписан инструкция по системе QAZAQMURA'
  }
]
</script>

<template>
  <v-layout class="app-background">
    <Toast />
    <Header />

    <!-- <v-navigation-drawer
      v-if="showLayout && !(auth.user.value && auth.user.value.roles.some((obj) => obj.id === 8))"
      color="#F9F9F9"
      expand-on-hover
      permanent
      rail
      width="400">
      <v-list
        v-if="!(auth.user.value && auth.user.value.roles.some((obj) => obj.id === 1))"
        :items="navigationDrawerItems"
        :lines="false"
        color="primary"
        nav
      >
      </v-list>
      <v-list v-else :selected="[navigationActive]" color="primary" nav>
        <v-list-item
          :to="{ name: 'home' }"
          :value="1"
          prepend-icon="mdi-view-dashboard"
          :title="t('dashboard')"
        ></v-list-item>
        <v-list-group :value="2">
          <template v-slot:activator="{ props }">
            <v-list-item
              prepend-icon="mdi-card-account-details"
              title="Клиенты"
              v-bind="props"
            ></v-list-item>
          </template>

          <v-list-item :value="3" title="Организации" to="/organizations"></v-list-item>
          <v-list-item :value="4" title="Тип организации" to="/organizationTypes"></v-list-item>
          <v-list-item :value="5" :title="t('requests')" to="/organizationApplies"></v-list-item>
          <v-list-item
            :value="6"
            title="Запросы на получение"
            to="/organizationRequests"
          ></v-list-item>
        </v-list-group>
        <v-list-group :value="7">
          <template v-slot:activator="{ props }">
            <v-list-item
              prepend-icon="mdi-card-account-details"
              :title="t('users')"
              v-bind="props"
            ></v-list-item>
          </template>

          <v-list-item :value="8" title="Роли пользователей" to="/userRoles"></v-list-item>
          <v-list-item :value="9" title="Реестр пользователей" to="/users"></v-list-item>
        </v-list-group>
        <v-list-item
          :to="{ name: 'm-data' }"
          :value="10"
          append-icon="mdi-chevron-right"
          prepend-icon="mdi-library"
          title="M-DATA"
        ></v-list-item>
        <v-list-item
          :to="{ name: 'online-library' }"
          :value="11"
          append-icon="mdi-chevron-right"
          prepend-icon="mdi-library"
          title="Онлайн библиотека"
        ></v-list-item>

        <v-list-item
          :to="{ name: 'contractor' }"
          :value="12"
          append-icon="mdi-chevron-right"
          prepend-icon="mdi-bank"
          :title="t('counterparty')"
        ></v-list-item>
        <v-list-group :value="12">
          <template v-slot:activator="{ props }">
            <v-list-item
              :value="13"
              prepend-icon="mdi-book-multiple"
              title="Атрибуты и типы"
              v-bind="props"
            ></v-list-item>
          </template>

          <v-list-item :to="{ name: 'publisher' }" :value="14" title="Издатели"></v-list-item>
          <v-list-item :to="{ name: 'language' }" :value="15" title="Языки"></v-list-item>
          <v-list-item :to="{ name: 'bookState' }" :value="16" title="Состоянии книг"></v-list-item>
          <v-list-item :to="{ name: 'bbk' }" :value="17" title="ББК"></v-list-item>
          <v-list-item :to="{ name: 'udk' }" :value="18" title="УДК"></v-list-item>
          <v-list-item :to="{ name: 'author' }" :value="19" title="Авторы"></v-list-item>
          <v-list-item :to="{ name: 'categories' }" :value="20" title="Классификация"></v-list-item>
          <v-list-item
            :to="{ name: 'bookAdmission' }"
            :value="21"
            :title="t('reception')"
          ></v-list-item>
          <v-list-item :to="{ name: 'genre' }" :value="22" title="Жанры"></v-list-item>
          <v-list-item
            :to="{ name: 'ageCharacteristic' }"
            :value="23"
            title="Возрастная характеристика"
          ></v-list-item>
          <v-list-item :to="{ name: 'binding' }" :value="24" title="Переплет"></v-list-item>
          <v-list-item
            :to="{ name: 'contentType' }"
            :value="25"
            title="Виды содержания"
          ></v-list-item>
          <v-list-item
            :to="{ name: 'copyrightSign' }"
            :value="26"
            :title="t('copyright_sign')"
          ></v-list-item>
          <v-list-item :to="{ name: 'country' }" :title="t('country')"></v-list-item>
          <v-list-item :to="{ name: 'educationLevel' }" :title="t('education_level')"></v-list-item>
          <v-list-item :to="{ name: 'bookType' }" :title="t('type')"></v-list-item>
          <v-list-item :to="{ name: 'tag' }" :title="t('keywords')"></v-list-item>
          <v-list-item :to="{ name: 'material' }" :title="t('material')"></v-list-item>
          <v-list-item :to="{ name: 'discipline' }" :title="t('discipline')"></v-list-item>
          <v-list-item :to="{ name: 'qualification' }" :title="t('qualification')"></v-list-item>
        </v-list-group>
        <v-list-item
          :value="27"
          append-icon="mdi-chevron-right"
          prepend-icon="mdi-bank"
          :title="t('regions')"
          to="/regions"
        ></v-list-item>
        <v-list-group :value="28">
          <template v-slot:activator="{ props }">
            <v-list-item
              :value="29"
              prepend-icon="mdi-library-shelves"
              :title="t('libraries')"
              v-bind="props"
            ></v-list-item>
          </template>

          <v-list-item :value="30" :title="t('inventory_management')" to="/inventory"></v-list-item>
          <v-list-item :title="t('book_requests')" to="/applies"></v-list-item>
          <v-list-item :value="33" title="Запросы от библиотекарей"></v-list-item>
        </v-list-group>
        <v-list-item
          :value="34"
          append-icon="mdi-chevron-right"
          prepend-icon="mdi-list-box"
          title="Фронт сайта"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-help-circle-outline"
          :value="40"
          title="Гид по системе"
          to="/guide"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer> -->

    <v-main>
      <RouterView></RouterView>
    </v-main>
    <Footer />
  </v-layout>
</template>

<style>
body {
  font-family: 'Inter', sans-serif;
}

.app-border {
  border-bottom: 1px solid #ececec;
}

.app-background {
  background-color: #f2f2f2;
  flex-direction: column;
}

/* Global styles */
.v-card {
  border-radius: 24px !important;
  overflow: hidden;
  padding: 12px 20px !important;
}

/* Global styles to ensure menus are visible */
.v-overlay__content {
  z-index: 1000 !important;
}

.v-menu__content {
  z-index: 1000 !important;
}

/* You can add more global styles here */
</style>
