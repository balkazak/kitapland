<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const headers = [
  { key: 'age', title: t('name')  },
  { key: 'percent', title: 'Показатели' }
]

const items = [
  { age: t('name'), percent: 77 },
  { age: t('copy'), percent: 120 },
  { age: 'Сумма:', percent: '300 000 тг' }
]
</script>

<template>
  <v-dialog max-width="640">
    <template v-slot:activator="{ props: activatorProps }">
      <v-btn v-bind="activatorProps" color="primary" variant="flat" icon="mdi-chevron-right"></v-btn>
    </template>

    <template v-slot:default="{ isActive }">
      <v-card>
        <v-card-title>
          <div class="d-flex justify-space-between">
            <strong class="my-auto">Списанные книги</strong>
            <v-btn variant="text" icon="mdi-close" @click="isActive.value = false"></v-btn>
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