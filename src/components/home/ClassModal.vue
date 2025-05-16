<script setup lang="ts">
import { ref, type Ref } from 'vue';
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { useAPI } from '@/api'
interface Class {
  name: string,
  mark: number,
  amount: number,
}

const api = useAPI()

const classesHeaders = [
  { key: 'classroom', title: t('classes') },
  { key: 'marks', title: 'Маркировка' },
  { key: 'pupils', title: t('quantity') }
]

const readers = ref<{ classroom: number, marks: number, pupils: number }[]>([])

const getReaders = async () => {
  try {
    const response = await api.fetchData<{classroom: number, marks: number, pupils: number}[]>('/v1/dashboard/classroom/pupils')
    if (response.data)
      readers.value = response.data
  } catch (e) {
    console.error('Error:', e)
  }
}

getReaders()

</script>

<template>
  <v-dialog max-width="640">
    <template v-slot:activator="{ props: activatorProps }">
      <v-btn v-bind="activatorProps" variant="flat" color="primary">{{ t('details') }}</v-btn>
    </template>

    <template v-slot:default="{ isActive }">
      <v-card>
        <v-card-title>
          <div class="d-flex justify-space-between">
            <strong class="my-auto">{{ t('classes_by_number_of_readers') }}</strong>
            <v-btn variant="text" icon="mdi-close" @click="isActive.value = false"></v-btn>
          </div>
        </v-card-title>

        <v-card-text>
          <v-data-table :headers="classesHeaders" :items="readers">
            <template v-slot:bottom></template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </template>
  </v-dialog>
</template>