<script lang="ts" setup>
import { useAPI } from '@/api'
import { ref, type Ref, watch } from 'vue'
import HelpButton from '@/components/HelpButton.vue'
import { useI18n } from 'vue-i18n'
import { useToastStore } from '@/stores/toast'
const { t } = useI18n()
const toast = useToastStore()

interface Book {
  id: number
  volume: string | null
  part: string | null
  amount: number | null
  title: string
  ISBN: string
  ISBN2: string | null
  year: number
  pages: number
  quotes: string
  annotation: string | null
}

interface Apply {
  id: number
  status: number
  take_at: string
  book: Book
  user: User
}

interface UserData {
  id: number
  sex: string | null
  document_ID: string
  birthday: string | null
  fathername: string | null
  firstname: string
  lastname: string
  phone: string
  nationality: string | null
}

interface Classroom {
  id: number
  number: string
  letter: string
}

interface User {
  id: number
  status: boolean
  login: string
  email: string
  avatar: string | null
  user_data: UserData
  classrooms: Classroom[]
}

const headers = [
  { title: t('user'), key: 'name' },
  { title: t('book_title'), key: 'book.title' },
  { title: t('issue_date'), key: 'take_at' },
  { title: '', key: 'actions', sortable: false }
]

const loading: Ref<boolean> = ref(false)
const page: Ref<number> = ref(1)
const length: Ref<number> = ref(0)
const items: Ref<Apply[]> = ref([])

const api = useAPI()

async function getApplies() {
  loading.value = true
  try {
    const request = `/v1/classroom/book/apply?page=${page.value}`
    const response = await api.fetchData<{ data: { items: Apply[] }; meta: { last_page: number } }>(
      request
    )
    if (response.data) {
      items.value = response.data.data.items
      length.value = response.data.meta.last_page
      loading.value = false
    }
  } catch (error: any) {
    let errorMessage = error?.message || t('error_loading_requests')
    toast.error(errorMessage)
    console.error('Error:', error)
  }
}

const drawer: Ref<boolean> = ref(false)

getApplies()

watch(page, () => {
  getApplies()
})
</script>

<template>
  <v-container fluid>
    <v-navigation-drawer v-model="drawer" location="right" temporary width="600">
      <v-list-item>
        <span class="font-weight-bold">{{ t('book_order_title') }}</span>
      </v-list-item>
      <v-divider></v-divider>
    </v-navigation-drawer>
    <v-app-bar>
      <template v-slot:title>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">{{ t('book_requests') }}</span>
          <span class="text-subtitle-2 text-medium-emphasis"
            >{{ t('requests_for_books_from_readers') }}
          </span>
        </div>
      </template>

      <template v-slot:append>
        <!-- <help-button /> -->
        <v-btn
          class="ml-3"
          color="primary"
          prepend-icon="mdi-plus"
          variant="flat"
          @click="drawer = true"
          >{{ t('add') }}
        </v-btn>
      </template>
    </v-app-bar>

    <v-data-table :headers="headers" :items="items" :loading="loading" class="mt-2" show-select>
      <template v-slot:[`item.name`]="{ item }">
        <span>{{ item.user.user_data.firstname + ' ' + item.user.user_data.lastname }}</span>
      </template>

      <template v-slot:[`item.actions`]="{}">
        <div class="d-flex justify-center">
          <v-btn icon="mdi-refresh" variant="text" :title="t('refresh')"></v-btn>
          <v-btn icon="mdi-eye-outline" variant="text" :title="t('view')"></v-btn>
          <v-btn icon="mdi-tray-arrow-down" variant="text" :title="t('download')"></v-btn>
          <v-btn
            color="error"
            icon="mdi-trash-can-outline"
            variant="text"
            :title="t('delete')"
          ></v-btn>
        </div>
      </template>

      <template v-slot:no-data>
        <div>{{ t('no_data_available') }}</div>
      </template>

      <template v-slot:bottom></template>
    </v-data-table>
    <v-row class="mt-4">
      <v-pagination
        v-model="page"
        :length="length"
        :total-visible="6"
        active-color="primary"
        class="ml-auto mr-2"
        size="small"
        variant="flat"
      ></v-pagination>
    </v-row>
  </v-container>
</template>
