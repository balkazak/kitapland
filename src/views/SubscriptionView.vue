<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const headers = [
  { title: 'ID', key: 'id' },
  { title: 'ФИО', key: 'name' },
  { title: 'Посещение', key: 'data' },
  { title: 'Читательский зал', key: 'role' },
  { title: t('status'), key: 'status' },
  { title: '', key: 'actions', sortable: false }
]

const items = [
  { id: 1, name: 'Фамилия Имя', data: '', role: '-', status: t('active') },
  { id: 2, name: 'Фамилия Имя', data: '', role: '-', status: t('active') },
  { id: 3, name: 'Фамилия Имя', data: '', role: '-', status: t('active') },
  { id: 4, name: 'Фамилия Имя', data: '', role: '-', status: t('active') },
  { id: 5, name: 'Фамилия Имя', data: '', role: '-', status: t('active') },
  { id: 6, name: 'Фамилия Имя', data: '', role: '-', status: t('active') },
  { id: 7, name: 'Фамилия Имя', data: '', role: '-', status: t('active') },
  { id: 8, name: 'Фамилия Имя', data: '', role: '-', status: t('active') }
]
</script>

<template>
  <v-container fluid>
    <v-app-bar>
      <template v-slot:title>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">{{t('subscription')}} MURA</span>
          <span class="text-subtitle-2 text-medium-emphasis">{{t('online_library_card_registration')}}</span>
        </div>
      </template>

      <template v-slot:append>
        <v-btn variant="tonal" class="mr-3" append-icon="mdi-chevron-down">Класс</v-btn>
        <v-btn variant="tonal" class="mr-3" append-icon="mdi-chevron-down">{{t('type')}}</v-btn>
        <v-btn variant="tonal" class="mr-3" append-icon="mdi-chevron-down">{{t('class_teacher')}}</v-btn>
        <v-btn variant="flat" color="primary" prepend-icon="mdi-plus">{{t('add')}}</v-btn>
      </template>
    </v-app-bar>

    <v-data-table show-select :headers="headers" :items="items" class="mt-2">
      <template v-slot:top>
        <div class="d-flex my-3 mx-4">
          <v-text-field label="Поиск по ИИН / ФИО" density="compact" variant="outlined" flat single-line hide-details
            class="rounded-xl" prepend-inner-icon="mdi-magnify"></v-text-field>
          <v-spacer></v-spacer>
          <v-select value="Показывать по 10" :items="['Показывать по 10']" density="compact" flat single-line
            hide-details></v-select>
        </div>
      </template>

      <template v-slot:[`item.status`]="{ item }">
        <v-chip v-if="item.status" color="green" variant="flat">t('active')</v-chip>
        <v-chip v-else color="error" variant="flat">Не активен</v-chip>
      </template>

      <template v-slot:[`item.actions`]="{ }">
        <div class="d-flex justify-center">
          <v-btn variant="outlined" append-icon="mdi-arrow-right">{{t('go_to')}}</v-btn>
        </div>
      </template>

      <template v-slot:bottom> </template>
    </v-data-table>
    <v-row class="mt-4">
      <v-pagination class="ml-auto mr-2" :length="4" size="small" variant="flat" active-color="primary"></v-pagination>
    </v-row>
  </v-container>
</template>
