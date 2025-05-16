<script lang="ts" setup>
import { ref, type Ref } from 'vue'
import { useAPI } from '@/api'
import qazaqstan from '@/assets/flags/qazaqstan.svg'
import world from '@/assets/flags/world.svg'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
interface Country {
  amount: number
  country: string
  percent: string
}

const api = useAPI()

const countriesHeaders = [
  { key: 'country', title: 'Страна' },
  { key: 'amount', title: t('book_copies') }
]

const countries: Ref<Country[] | null> = ref(null)
const countriesLoading: Ref<boolean> = ref(false)

async function getCountries(): Promise<void> {
  countriesLoading.value = true
  try {
    const response = await api.fetchData<{ detailed: Country[] }>(`/v1/dashboard/country`)
    if (response.data) {
      countries.value = response.data.detailed
      countriesMini.value[0].progress = Number.parseFloat(response.data.general.qazaqstan)
      countriesMini.value[1].progress = Number.parseFloat(response.data.general.others)
    }
    countriesLoading.value = false
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

const countriesMini = ref([
  {
    id: 1,
    code: 'kz',
    flag: qazaqstan,
    name: 'Казахстан'
  },
  {
    id: 2,
    code: 'kz',
    flag: world,
    name: 'Зарубежные'
  }
])



getCountries()
</script>

<template>
  <v-card>
    <v-card-title>{{ t('books_by_country') }}</v-card-title>
    <v-card-text>
      <v-list>
        <v-list-item v-for="country in countriesMini" :key="country.id">
          <v-list-item-title>
            <div class="d-flex">
              <div class="w-25 mr-2 text-center">
                <v-img :src="country.flag" class="rounded"></v-img>
              </div>
              <div class="w-75">
                {{ country.name }}

                <v-progress-linear v-model="country.progress" color="primary"></v-progress-linear>

                <span class="font-weight-bold"> {{ country.progress }} %</span>
              </div>
            </div>
          </v-list-item-title>

          <v-list-item-subtitle></v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card-text>
    <v-card-actions>
      <v-dialog max-width="640">
        <template v-slot:activator="{ props: activatorProps }">
          <v-btn color="primary" v-bind="activatorProps" variant="flat">{{ t('details') }}</v-btn>
        </template>

        <template v-slot:default="{ isActive }">
          <v-card>
            <v-card-title>
              <div class="d-flex justify-space-between">
                <strong class="my-auto">{{ t('books_by_country') }}</strong>
                <v-btn icon="mdi-close" variant="text" @click="isActive.value = false"></v-btn>
              </div>
            </v-card-title>

            <v-card-text>
              <v-data-table :headers="countriesHeaders" :items="countries ? countries : []">
              </v-data-table>
            </v-card-text>
          </v-card>
        </template>
      </v-dialog>
    </v-card-actions>
  </v-card>
</template>
