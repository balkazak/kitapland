<script lang="ts" setup>
import { useAPI } from '@/api'
import type { Ref } from 'vue'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const api = useAPI()

const headers = [
  { title: t('book_title'), key: 'title' },
  { title: t('author'), key: 'author' },
  { title: t('book_types'), key: 'bookType' },
  { title: t('year_of_publication') },
  { title: t('numbers'), key: 'count' }
]

interface Subscription {
  title: string
  status: string
  count: number
  book_author_main: string[]
  book_type: string[]
}

interface Publisher {
  id: number
  title: string
}

const items: Ref<Subscription[]> = ref([])
const subscriptionStatus: Ref<number | null> = ref(null)
const bookTypes: Ref<Publisher[]> = ref([])
const bookType: Ref<number | null> = ref(null)
const loading: Ref<boolean> = ref(false)

async function getItems() {
  loading.value = true
  try {
    let request = '/v1/book/apply/history'
    if (subscriptionStatus.value) request += `?status=${subscriptionStatus.value}`
    if (subscriptionStatus.value && bookType.value) request += `&type_id=${bookType.value}`
    else if (!subscriptionStatus.value && bookType.value) request += `?type_id=${bookType.value}`
    const response = await api.fetchData<{
      data: { items: Subscription[] }
    }>(request)
    if (response.data) items.value = response.data.data.items
    loading.value = false
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getTypes(search = null) {
  try {
    let request = `/v1/type`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: Publisher[] } }>(request)
    if (response.data) bookTypes.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}



getItems()
getTypes()

watch(subscriptionStatus, () => {
  getItems()
})

watch(bookType, () => {
  getItems()
})
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col cols="4">
        <v-autocomplete
          v-model="bookType"
          :items="bookTypes"
          clearable
          item-value="id"
          :label="t('book_types')"
          variant="outlined"
        ></v-autocomplete>
        <v-select
          v-model="subscriptionStatus"
          :items="[
            { title: 'Выдача', value: 1 },
            { title: 'Возврат', value: 2 }
          ]"
          clearable
          :label="t('issue_return')"
          variant="outlined"
        >
        </v-select>
        <v-text-field
          label="Фильтр по дате"
          prepend-inner-icon="mdi-calendar"
          type="date"
          variant="outlined"
        ></v-text-field>
      </v-col>
      <v-col>
        <v-window>
          <v-window-item>
            <v-data-table :headers="headers" :items="items" :loading="loading" color="primary">
              <template v-slot:[`item.author`]="{ item }">
                {{ item.book_author_main ? item.book_author_main.join(', ') : '' }}
              </template>

              <template v-slot:[`item.type`]="{ item }">
                {{ item.book_type ? item.book_type.join(', ') : '' }}
              </template>
            </v-data-table>
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </v-container>
</template>
