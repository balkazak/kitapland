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
    let request = '/v1/dashboard/subscription-modal?1=1'
    if (subscriptionStatus.value) request += `&status=${subscriptionStatus.value}`
    if (subscriptionStatus.value && bookType.value) request += `&type_id=${bookType.value}`
    if (startDate.value.length === 10) {
      const startDateToFormat = startDate.value.split('.')
      request += `&start_date=${startDateToFormat[2]}-${startDateToFormat[1]}-${startDateToFormat[0]}`
    }
    if (endDate.value.length === 10) {
      const endDateToFormat = startDate.value.split('.')
      request += `&start_date=${endDateToFormat[2]}-${endDateToFormat[1]}-${endDateToFormat[0]}`
    }
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

const startDate = ref('')
const endDate = ref('')

const handleStartDate = () => {
  let value = startDate.value.replace(/\D/g, '')
  if (value.length >= 3) {
    value = value.slice(0, 2) + '.' + value.slice(2)
  }
  if (value.length >= 6) {
    value = value.slice(0, 5) + '.' + value.slice(5)
  }
  if (value.length >= 10) {
    value = value.slice(0, 10)
  }
  startDate.value = value
}

const handleEndDate = () => {
  let value = endDate.value.replace(/\D/g, '')
  if (value.length >= 3) {
    value = value.slice(0, 2) + '.' + value.slice(2)
  }
  if (value.length >= 6) {
    value = value.slice(0, 5) + '.' + value.slice(5)
  }
  if (value.length >= 10) {
    value = value.slice(0, 10)
  }
  endDate.value = value
}


getItems()
getTypes()

watch(subscriptionStatus, () => {
  getItems()
})

watch(bookType, () => {
  getItems()
})

watch(startDate, () => {
  getItems()
})

watch(endDate, () => {
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
          label="Дата начала"
          prepend-inner-icon="mdi-calendar"
          type="text"
          variant="outlined"
          v-model="startDate"
          @input="handleStartDate"
        ></v-text-field>
        <v-text-field
          label="Дата конца"
          prepend-inner-icon="mdi-calendar"
          type="text"
          v-model="endDate"
          variant="outlined"
          @input="handleEndDate"
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
