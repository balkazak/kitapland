<script lang="ts" setup>
import { useAPI } from '@/api'
import { ref, type Ref, watch, watchEffect, computed } from 'vue'
import FilterBlock from '@/components/FilterBlock.vue'
import HelpButton from '@/components/HelpButton.vue'
import { useAuth } from '@/auth'
import fileDownload from 'js-file-download'
import { useI18n } from 'vue-i18n'
import { useToastStore } from '@/stores/toast'
const { t, locale } = useI18n()
import QRCode from 'qrcode'
const toast = useToastStore()

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

const bottomItems = ref([
  { label: t('inventoried_books'), value: 0 },
  { label: t('written_off'), value: 0 },
  { label: t('not_inventoried'), value: 0 }
])

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
const drawer: Ref<boolean> = ref(false)
const book: Ref<Inventory | null> = ref(null)
const inventories: Ref<Number[]> = ref([])

const api = useAPI()

const showQR = ref(false)

const helpVideoLink = computed(() => {
  return locale.value === 'kk'
    ? 'dJlb6jSYc7I'
    : 'gWi5QPlcyLY'
})

async function addToInventory(inventories: Number[]) {
  const bookSchoolId = book.value ? book.value.book_school_id : null
  try {
    const response = await api.postData('/v1/book/inventory', {
      book_school_id: bookSchoolId,
      inventories: inventories
    })
    toast.success('Инвентарные номера успешно добавлены')
    closeInventory()
  } catch (error: any) {
    let errorMessage = error?.message || 'Ошибка при добавлении инвентарных номеров'
    toast.error(errorMessage)
    console.error('Error:', error)
  }
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
  } catch (error: any) {
    toast.error('Ошибка при поиске книг')
    console.error('Error:', error)
  }
}

function closeInventory() {
  book.value = null
  drawer.value = false
}

async function downloadPDF(mode: 1 | 2) {
  try {
    if (mode === 1) {
      const response = await api.postData(`/v1/book/school/inventory/pdf`, null, true)
      if (response.data) {
        fileDownload(response.data, `${t('inventory_list')}.pdf`)
        toast.success('Список инвентаризации успешно скачан')
      }
    } else {
      const response = await api.postData(
        `/v1/book/school/inventory/decommissioned/pdf`,
        null,
        true
      )
      if (response.data) {
        fileDownload(response.data, `${t('list_of_written_off_books')}.pdf`)
        toast.success('Список списанных книг успешно скачан')
      }
    }
  } catch (error: any) {
    toast.error('Ошибка при скачивании документа')
    console.error('Error:', error)
  }
}

const info: Ref<any | null> = ref(null)

async function getBookInfo(bookSchoolId: number) {
  try {
    const response = await api.fetchData(`/v1/book/school/${bookSchoolId}`)
    info.value = response.data
  } catch (e) {
    toast.error('Ошибка при загрузке информации о книге')
    console.error('Error:', e)
  }
}

getContractors()
getInventorySearch()

watch(book, (value) => {
  if (value) {
    inventories.value = []
    const length = value.amount - value.book_inventory.length
    inventories.value = new Array(length).fill(undefined)
    getBookInfo(value.book_school_id)
  }
})

interface Filter {
  search: string
  authorId: number | null
  publisherId: number | null
  inventoryStatus: number | null
  fundBooks: boolean
  book_type_id: number | null
}

const filters: Ref<Filter> = ref({
  search: '',
  authorId: null,
  publisherId: null,
  inventoryStatus: null,
  fundBooks: false,
  book_type_id: null
})

const auth = useAuth()

const getInventoryCount = async (id: number) => {
  const response = await api.fetchData(`/v1/book/inventory/count?school_id=${id}`)
  if (response.data) {
    bottomItems.value = [
      { label: t('inventoried_books'), value: response.data.active },
      { label: t('written_off'), value: response.data.deprecated },
      { label: t('not_inventoried'), value: response.data.uninventoried }
    ]
  }
}

const sort = ref(0)

if (auth.user.value && auth.user.value.roles.some((obj) => obj.id === 3 || obj.id === 10)) {
  getInventoryCount(auth.userData.value.school.id)
}

async function getContractors() {
  loading.value = true
  try {
    let request = `/v2/inventory?page=${page.value}`

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

async function searchContractors() {
  loading.value = true
  try {
    let request = `/v2/inventory?page=${page.value}`

    if (filters.value.search.length > 0) {
      request += `&search=${filters.value.search}`
    }
    if (filters.value.authorId) {
      request += `&author_id=${filters.value.authorId}`
    }
    if (filters.value.publisherId) {
      request += `&publisher_id=${filters.value.publisherId}`
    }
    if (filters.value.inventoryStatus) {
      request += `&active=0`
    }

    if (filters.value.book_type_id) {
      request += `&type_id=${filters.value.book_type_id}`
    }

    if (filters.value.fundBooks) {
      request += `&active=1`
    }

    if (sort.value === 0) {
      request += '&sort_by=title&order_by=asc'
    } else if (sort.value === 1) {
      request += '&sort_by=title&order_by=desc'
    } else if (sort.value === 2) {
      request += '&sort_by=inventory&order_by=asc'
    } else if (sort.value === 3) {
      request += '&sort_by=inventory&order_by=desc'
    } else if (sort.value === 4) {
      request += '&sort_by=created&order_by=asc'
    } else if (sort.value === 5) {
      request += '&sort_by=created&order_by=desc'
    }

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

const turnOnEditMode = (item) => {
  item.editMode = true
  item.numberDouble = item.inventory.number
}

const editInvent = async (item) => {
  try {
    const body = {
      id: item.inventory.id,
      book_school_id: item.book_school_id,
      inventory: item.numberDouble
    }
    await api.putData(`/v1/book/inventory/${item.inventory.id}`, body)
    await searchContractors()
    toast.success('Инвентарный номер успешно обновлен')
    item.editMode = false
  } catch (error: any) {
    let errorMessage = error?.message || 'Ошибка при обновлении инвентарного номера'
    toast.error(errorMessage)
    console.error('Error:', error)
  }
}

const qrCodeDataUrl = ref('')
const qrCanvas = ref(null)
const qrText = ref('')

const generateQR = async (item: any) => {
  try {
    const response = await api.fetchFile('/v1/book/inventory/qr', { book_id: item.book_school_id })
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'qrcode.pdf'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    toast.success('QR код успешно скачан')
  } catch (e) {
    toast.error('Ошибка при генерации QR кода')
    console.error(e.message)
  }
}

const generateListQR = async () => {
  try {
    const response = await api.fetchFile('/v1/book/inventory/qr/list', {
      school_id: auth.userData.value.school.id
    })
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'qrcode-list.pdf'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    toast.success('Список QR кодов успешно скачан')
  } catch (e) {
    toast.error('Ошибка при генерации списка QR кодов')
    console.error(e.message)
  }
}

watch(page, () => {
  searchContractors()
})

watch(sort, () => {
  searchContractors()
})

const downloadExcel = async () => {
  try {
    const response = await api.postData(
      '/v1/book/school/un/inventory/report',
      { format: 'excel' },
      true
    )
    if (response.data) {
      fileDownload(response.data, 'inventory.xlsx')
      toast.success('Файл успешно скачан')
    }
  } catch (error: any) {
    toast.error('Ошибка при скачивании файла')
    console.error('Error:', error)
  }
}
</script>

<template>
  <v-container fluid>
    <v-navigation-drawer v-model="drawer" location="right" temporary width="600">
      <v-list-item>
        <span class="font-weight-bold">Инвентаризация книги</span>
      </v-list-item>
      <v-divider></v-divider>
      <v-list-item v-if="book">
        <div class="mt-4 font-weight-bold text-h6">{{ book.title }} / {{ book.amount }}</div>
        <div class="mt-2">
          <v-chip
            v-for="author in book.author"
            :key="author.id"
            class="mr-2"
            color="primary"
            size="small"
            variant="outlined"
          >
            {{ author.name }}
          </v-chip>
        </div>
        <div class="d-flex w-50 mt-2">
          <div class="d-flex w-50 flex-column">
            <strong>{{ t('language') }}</strong>
            <span></span>
          </div>
          <div class="d-flex w-50 flex-column">
            <strong>{{ t('year_of_publication') }}</strong>
            <span>{{ info ? info.book.year : '' }}</span>
          </div>
        </div>
        <div class="d-flex w-50 mt-2">
          <div class="d-flex w-50 flex-column">
            <strong>{{ t('publisher') }}</strong>
            <div></div>
          </div>
          <div class="d-flex w-50 flex-column">
            <strong>ББК</strong>
          </div>
        </div>
      </v-list-item>
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
        <v-list-item
          ><strong>{{ t('inventory_numbers') }}</strong></v-list-item
        >
        <v-list-item v-for="n in book.amount - book.book_inventory.length" :key="n">
          <v-text-field
            v-model="inventories[n - 1]"
            class="mt-2"
            label="Инвентарный номер"
            placeholder="Напишите номер"
            type="number"
            variant="outlined"
          ></v-text-field>
        </v-list-item>
        <v-list-item>
          <v-btn class="mr-3" variant="tonal" @click="closeInventory">{{ t('close') }}</v-btn>
          <v-btn color="primary" variant="flat" @click="addToInventory(inventories)"
            >{{ t('add') }}
          </v-btn>
        </v-list-item>
      </div>
    </v-navigation-drawer>

    <v-app-bar>
      <template v-slot:title>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">{{ t('inventory_management') }}</span>
          <span class="text-subtitle-2 text-medium-emphasis">{{
            t('online_inventory_of_books')
          }}</span>
        </div>
      </template>

      <template v-slot:append>
       
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn class="mr-3" prepend-icon="mdi-chevron-down" v-bind="props" variant="tonal"
              >{{ t('sorting') }}
            </v-btn>
          </template>

          <v-list>
            <v-list-item @click="sort = 0">Cортировать от А до Я</v-list-item>
            <v-list-item @click="sort = 1">Cортировать от Я до А</v-list-item>
            <v-list-item @click="sort = 2">Cортировать по возрастанию</v-list-item>
            <v-list-item @click="sort = 3">Cортировать по убыванию</v-list-item>
            <v-list-item @click="sort = 4">Cортировать от старых к новым</v-list-item>
            <v-list-item @click="sort = 5">Cортировать от новых к старым</v-list-item>
          </v-list>
        </v-menu>

        <v-menu>
          <template v-slot:activator="{ props }">
            <!-- <v-btn
              class="mr-3"
              color="primary"
              prepend-icon="mdi-chevron-down"
              v-bind="props"
              variant="flat"
              >{{ t('download_pdf') }}
            </v-btn> -->
          </template>

          <v-list>
            <v-list-item @click="downloadPDF(1)">{{ t('inventory_list') }}</v-list-item>
            <v-list-item @click="downloadPDF(2)">{{ t('list_of_written_off_books') }}</v-list-item>
          </v-list>
        </v-menu>

        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn class="mr-3" prepend-icon="mdi-chevron-down" v-bind="props" variant="flat" color="primary"
              >{{ t('actions') }}
            </v-btn>
          </template>

          <v-list>
            <v-list-item @click="downloadExcel">Не инвентаризованные книги</v-list-item>
            <v-list-item @click="drawer = true"> Инвентаризация</v-list-item>
            <v-list-item :to="{ name: 'inventoryWriteOff' }"> {{ t('write_off') }}</v-list-item>
            <v-list-item :to="{ name: 'inventoryDecline' }"> {{ t('rollback') }}</v-list-item>
            <v-list-item @click="generateListQR()">QR номера</v-list-item>
          </v-list>
        </v-menu>

        <help-button :video-id="helpVideoLink" class="mr-3" />
      </template>
    </v-app-bar>

    <v-row>
      <v-col cols="12">
        <FilterBlock
          v-model="filters"
          :bottom-items="
            auth.user.value && auth.user.value.roles.some((obj) => obj.id === 1) ? [] : bottomItems
          "
          :mdata="false"
          :one-line="false"
          :users="false"
          inventory
          @search="searchContractors"
        >
        </FilterBlock>
      </v-col>
    </v-row>

    <v-data-table
      :headers="headers"
      :items="
        items.filter((item) => {
          return item.inventory
        })
      "
      :items-per-page="items.length"
      class="mt-2"
    >
      <template v-slot:[`item.book`]="{ item }">
        <div class="mt-3">{{ item.title }}</div>
        <div class="text-subtitle-2 text-medium-emphasis">
          {{ t('year_of_publication') }}: {{ item.year }}
        </div>
        <div class="mb-3">
          <v-chip
            v-for="author in item.author"
            :key="author"
            class="mr-2"
            color="primary"
            size="x-small"
            variant="outlined"
            >{{ author }}
          </v-chip>
        </div>
        <div class="my-1">
          <v-chip
            v-for="pub in item.publisher"
            :key="pub"
            class="mr-2"
            color="green"
            size="small"
            variant="flat"
            >{{ t('publisher') }}: <span>{{ pub }}</span></v-chip
          >
        </div>
      </template>

      <template v-slot:[`item.inventory.number`]="{ item }">
        <span v-if="!item.editMode">{{ item.inventory.number }}</span>
        <v-text-field v-else v-model="item.numberDouble" density="compact"></v-text-field>
      </template>

      <template v-slot:[`item.admission`]="{ item }">
        <div class="mt-3">
          <v-chip color="primary" size="x-small" variant="outlined">Новая</v-chip>
        </div>
        <div>Дата: {{ item.admission_at }}</div>
        <div>{{ t('price') }}: {{ item.price }}</div>
      </template>

      <template v-slot:[`item.invent`]="{ item }">
        <div class="mt-3"></div>
        <div class="text-subtitle-2 text-medium-emphasis">
          <v-chip v-if="item.inventory.status === 1" size="x-small" variant="flat"
            >{{ t('status') }}: в фонде
          </v-chip>
          <v-chip v-else-if="item.inventory.status === 0" color="red" size="x-small" variant="flat"
            >{{ t('status') }}: списано
          </v-chip>
        </div>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-btn
          v-if="!item.editMode"
          icon="mdi-pencil"
          variant="flat"
          @click="turnOnEditMode(item)"
        ></v-btn>
        <div v-else>
          <v-btn color="green" variant="flat" @click="editInvent(item)">
            <v-icon icon="mdi-check"></v-icon>
          </v-btn>
          <v-btn class="ml-2" variant="outlined" @click="item.editMode = false">
            <v-icon icon="mdi-close"></v-icon>
          </v-btn>
        </div>
        <v-btn
          @click="generateQR(item)"
          v-if="!item.editMode"
          variant="flat"
          icon="mdi-download"
        ></v-btn>
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
