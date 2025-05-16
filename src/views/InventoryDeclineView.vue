<script lang="ts" setup>
import { useAPI } from '@/api'
import { ref, type Ref, watch } from 'vue'
import FilterBlock from '@/components/FilterBlock.vue'
import HelpButton from '@/components/HelpButton.vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
interface Inventory {
  amount: any
  id: number
  book: {
    year: number
    title: string
    book_author_main: { id: string; title: string; name: string }[]
  }
  price: number
  book_school_id: number
  book_inventory: any[]
  admission_at: string
}

const bottomItems = ref([{ label: 'Выбрано из списанных', value: 0 }])

const headers = [
  { title: t('inventory'), key: 'inventory.number' },
  { title: t('book'), key: 'book' },
  { title: t('reception'), key: 'admission' },
  { title: t('status'), key: 'invent' },
  { title: '', key: 'actions', sortable: false }
]

interface SearchItem {
  amount: number
  author_main: { id: number; name: string }
  book_school_id: number
  title: string
}

const inventorySearch: Ref<SearchItem[]> = ref([])
const loading: Ref<boolean> = ref(false)
const page: Ref<number> = ref(1)
const length: Ref<number> = ref(0)
const items: Ref<Inventory[]> = ref([])
const search: Ref<string | null> = ref(null)
const drawer: Ref<boolean> = ref(false)
const book: Ref<Inventory | null> = ref(null)
const inventories: Ref<Number[]> = ref([])

const api = useAPI()

async function getContractors() {
  loading.value = true
  try {
    const request = `/v2/inventory?active=0&page=${page.value}`
    const response = await api.fetchData<{
      data: { items: Inventory[] }
      meta: { last_page: number }
    }>(request)
    if (response.data) {
      length.value = response.data.meta.last_page
      loading.value = false
      items.value = response.data.data
    }
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function addToInventory(inventories: Number[]) {
  const bookSchoolId = book.value ? book.value.book_school_id : null
  try {
    const response = await api.postData('/v1/book/inventory', {
      book_school_id: bookSchoolId,
      inventories: inventories
    })
  } catch (error) {
    console.error('Error:', error)
  }
  closeInventory()
}

async function getInventorySearch(search: string | null = null) {
  const request = search
    ? `/v1/book/school/inventory/search?search=${search}`
    : '/v1/book/school/inventory/search'
  try {
    const response = await api.fetchData<SearchItem[]>(request)
    if (response.data) {
      inventorySearch.value = response.data
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

function closeInventory() {
  book.value = null
  drawer.value = false
}

getContractors()
getInventorySearch()

watch(book, (value) => {
  if (value) {
    inventories.value = []
    const length = value.amount - value.book_inventory.length
    inventories.value = new Array(length).fill(undefined)
  }
})

interface Filter {
  search: string
  languageId: number | null
  authorId: number | null
  publisherId: number | null
  year: number | null
  epub: boolean
}

const filters: Ref<Filter> = ref({
  search: '',
  languageId: null,
  authorId: null,
  publisherId: null,
  year: null,
  epub: false
})

const selected = ref([])

const restoreItems = async () => {
  const body = {
    book_school_id: items.value[0].book_school_id,
    inventories: selected.value.map((obj) => {
      return String(obj)
    })
  }
  const response = await api.patchData('/v1/book/inventory/restore', body)
  if (response.data) {
    snackbar.value = true
    snackbarText.value = response.data.message
  }
  await getContractors()
}

const snackbar = ref(false)
const snackbarText = ref('')

watch(page, () => {
  getContractors()
})
watch(search, () => {
  getContractors()
})
watch(selected, (value) => {
  bottomItems.value = [{ label: 'Выбрано из списанных', value: value.length }]
})
</script>

<template>
  <v-container fluid>
    <v-snackbar v-model="snackbar" :timeout="10000">{{ snackbarText }}</v-snackbar>
    <v-navigation-drawer v-model="drawer" location="right" temporary width="400">
      <v-list-item>
        <span class="font-weight-bold">Инвентаризация книги</span>
      </v-list-item>
      <v-divider></v-divider>
      <v-list-item>
        <v-autocomplete
          v-model="book"
          :items="inventorySearch"
          class="pt-10"
          item-title="title"
          :label="t('book')"
          placeholder="Напишите название"
          return-object
          variant="outlined"
          @update:search="getInventorySearch"
        ></v-autocomplete>
      </v-list-item>
      <div v-if="book">
        <v-list-item><strong>{{t('inventory_numbers')}}</strong></v-list-item>
        <v-list-item v-for="n in book.amount - book.book_inventory.length" :key="n">
          <v-text-field
            v-model="inventories[n - 1]"
            label="Инвентарный номер"
            placeholder="Напишите номер"
            type="number"
            variant="outlined"
          ></v-text-field>
        </v-list-item>
        <v-list-item>
          <v-btn class="mr-3" variant="tonal" @click="closeInventory">{{t('close')}}</v-btn>
          <v-btn color="primary" variant="flat" @click="addToInventory(inventories)"
            >{{t('add')}}
          </v-btn>
        </v-list-item>
      </div>
    </v-navigation-drawer>

    <v-app-bar>
      <template v-slot:title>
        <v-btn :to="{ name: 'inventory' }" prepend-icon="mdi-arrow-left" variant="text">
          К инвентарному учету
        </v-btn>
      </template>

      <template v-slot:append>
        <help-button class="mr-3" />
      </template>
    </v-app-bar>

    <v-row>
      <v-col cols="12">
        <FilterBlock
          v-model="filters"
          :bottom-items="bottomItems"
          :mdata="false"
          :one-line="false"
          :users="false"
          inventory
        >
          <template v-slot:actions>
            <v-btn class="my-auto mr-4" color="primary" variant="flat" @click="restoreItems"
              >{{t('rollback')}}
            </v-btn>
          </template>
        </FilterBlock>
      </v-col>
    </v-row>

    <v-data-table
      v-model="selected"
      :headers="headers"
      :items="items"
      class="mt-2"
      item-value="inventory.number"
      show-select
    >
      <template v-slot:[`item.book`]="{ item }">
        <div class="mt-3">{{ item.title }}</div>
        <div class="text-subtitle-2 text-medium-emphasis">{{t('year_of_publication')}}: {{ item.year }}</div>
        <div class="mb-3">
          <v-chip
            v-for="author in item.author"
            :key="author"
            color="primary"
            size="x-small"
            variant="outlined"
            >{{ author }}
          </v-chip>
        </div>
      </template>

      <template v-slot:[`item.admission`]="{ item }">
        <div class="mt-3">
          <v-chip color="primary" size="x-small" variant="outlined">Новая</v-chip>
        </div>
        <div>Дата: {{ item.admission_at }}</div>
        <div>{{t('price')}}: {{ item.price }}</div>
      </template>

      <template v-slot:[`item.invent`]="{ item }">
        <div class="text-subtitle-2 text-medium-emphasis">
          <v-chip v-if="item.inventory.status === 1" size="x-small" variant="flat">
            {{t('status')}}: в фонде
          </v-chip>
          <v-chip v-if="item.inventory.status === 0" color="red" size="x-small" variant="flat">
            {{t('status')}}: списано
          </v-chip>
        </div>
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
