<script lang="ts" setup>
import { useAPI } from '@/api'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const api = useAPI()

async function getAdmissions() {
  try {
    const response = await api.fetchData('/v1/book/school/admission')
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

const headers = [
  { key: 'number', title: '№' },
  { key: 'type', title: t('book_type') },
  { key: 'name', title: t('name') },
  { key: 'exemplar', title: t('copy') }
]

const items = [
  { number: 1, type: 'Художественная литература', name: 12, exemplar: 77 },
  { number: 2, type: 'Без отметки типа', name: 1, exemplar: 177 },
  { number: 3, type: 'Учебное пособие', name: 4, exemplar: 14 },
  { number: 4, type: 'Детские сказки ', name: 6, exemplar: 22 }
]

getAdmissions()
</script>

<template>
  <v-dialog max-width="640">
    <template v-slot:activator="{ props: activatorProps }">
      <v-btn
        color="primary"
        icon="mdi-chevron-right"
        v-bind="activatorProps"
        variant="flat"
      ></v-btn>
    </template>

    <template v-slot:default="{ isActive }">
      <v-card>
        <v-card-title>
          <div class="d-flex justify-space-between">
            <strong class="my-auto">{{t('library_fund')}}</strong>
            <v-btn icon="mdi-close" variant="text" @click="isActive.value = false"></v-btn>
          </div>
        </v-card-title>

        <v-card-text>
          <v-data-table :headers="headers" :items="items">
            <template v-slot:bottom></template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </template>
  </v-dialog>
</template>
