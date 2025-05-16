<script lang="ts" setup>
import { ref, type Ref } from 'vue'
import { useAPI } from '@/api'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const api = useAPI()

interface BookState {
  title: string
  amount: string
  books: number
}

const fundHeaders = [
  { key: 'title', title: t('name') },
  { key: 'books', title: t('book_titles') },
  { key: 'amount', title: t('book_copies') },
  { key: 'actions', title: '' }
]

const fund: Ref<BookState[] | null> = ref(null)

const fundLoading: Ref<boolean> = ref(false)

async function getBookState(): Promise<void> {
  fundLoading.value = true
  try {
    const response = await api.fetchData<BookState[]>('/v1/dashboard/book/state')
    fund.value = response.data
    fundLoading.value = false
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

getBookState()
</script>

<template>
  <v-dialog max-width="640">
    <template v-slot:activator="{ props: activatorProps }">
      <v-btn color="primary" v-bind="activatorProps" variant="flat">{{ t('details') }}</v-btn>
    </template>

    <template v-slot:default="{ isActive }">
      <v-card>
        <v-card-title>
          <div class="d-flex justify-space-between">
            <strong class="my-auto">Состояние книг по фонду</strong>
            <v-btn icon="mdi-close" variant="text" @click="isActive.value = false"></v-btn>
          </div>
        </v-card-title>

        <v-card-text>
          <v-data-table :headers="fundHeaders" :items="fund ? fund : []"></v-data-table>
        </v-card-text>
      </v-card>
    </template>
  </v-dialog>
</template>
