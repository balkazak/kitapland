<script lang="ts" setup>
import { useAPI } from '@/api'
import { ref, watch, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
interface Item {
  id: number
  title: string
  fullname: string
  date: string
  amount: number
  type: { id: number; title: string }
}

const api = useAPI()

const page: Ref<number> = ref(1)
const length: Ref<number> = ref(1)
const loading: Ref<boolean> = ref(false)
const items: Ref<Item[]> = ref([])
const books: Ref<any[]> = ref([])

const headers = [
  { key: 'id', title: 'ID' },
  { key: 'book', title: t('book') },
  { key: 'ordered', title: t('order') },
  { key: 'status', title: t('status') },
  { key: 'actions', title: t('actions') }
]

const drawer: Ref<boolean> = ref(false)

async function getItems() {
  loading.value = true
  try {
    const response = await api.fetchData<{
      meta: { last_page: number }
      data: { items: Item[] }
    }>(`/v1/purchase/book/query?page=${page.value}`)
    if (response.data) {
      length.value = response.data.meta.last_page
      items.value = response.data.data.items
    }
    loading.value = false
  } catch (error) {
    console.error('Error:', error)
  }
}

const searchPage = ref(1)
const searchLength = ref(1)

async function getBooks() {
  try {
    const response = await api.fetchData<{
      meta: { last_page: number }
      data: { items: any[] }
    }>(`/v2/book/purchase?page=${searchPage.value}`)
    if (response.data) {
      books.value = response.data.data
      searchLength.value = response.data.meta.last_page
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

watch(searchPage, () => getBooks())

async function orderBooks(id: number, amount: number) {
  try {
    const body = {
      purchase_book_id: id,
      amount: amount
    }
    await api.postData('/v1/purchase/book/query', body)
    await getItems()
    drawer.value = false
  } catch (e) {
    console.error('Error:', e)
  }
}

getItems()
getBooks()
</script>

<template>
  <v-container fluid>
    <v-navigation-drawer v-model="drawer" location="right" temporary width="700">
      <v-list>
        <v-list-item>
          <div class="font-weight-bold">Заказ книги</div>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item v-for="book in books" :key="book.id">
          <v-card :title="book.title" class="border">
            <v-card-text>
              <v-row>
                <v-col cols="5">
                  <div class="d-flex flex-column">
                    <div>
                      <v-chip
                        class="mr-2"
                        color="primary"
                        size="small"
                        variant="outlined"
                        >{{ book.authors }}
                      </v-chip>
                      <v-chip
                        class="mr-2"
                        color="primary"
                        size="small"
                        variant="outlined"
                        >{{ book.genres }}
                      </v-chip>
                    </div>
                    <table class="w-100 pt-2">
                      <tr>
                        <td>
                          <div class="font-weight-bold">{{t('language')}}</div>
                          <div>{{ book.language }}</div>
                        </td>
                        <td>
                          <div class="font-weight-bold">{{t('year_of_publication')}}</div>
                          <div>{{ book.year }}</div>
                        </td>
                      </tr>
                      <tr>
                        <td class="pt-2">
                          <div class="font-weight-bold">Возрастная характеристика</div>
                          <div>{{ book.age }}</div>
                        </td>
                      
                      </tr>
                    </table>
                  </div>
                </v-col>
                <v-col cols="7">
                  <span>{{ book.description }}</span>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="book.amount"
                    hide-details
                    label="Кол-во"
                    type="number"
                    variant="outlined"
                  >
                    <template v-slot:append-inner>
                      <v-btn
                        color="primary"
                        variant="outlined"
                        @click="orderBooks(book.id, book.amount)"
                        >Заказать
                      </v-btn>
                    </template>
                  </v-text-field>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-list-item>
        <v-list-item>
          <v-pagination color="primary" v-model="searchPage" :length="searchLength"></v-pagination>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar>
      <template v-slot:title>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">{{t('book_order')}}</span>
          <span class="text-subtitle-2 text-medium-emphasis"
            >{{t('convenient_and_effective_way_to_order_books')}}</span
          >
        </div>
      </template>

      <template v-slot:append>
        <!-- <help-button></help-button> -->
        <v-btn
          class="ml-3"
          color="primary"
          prepend-icon="mdi-plus"
          variant="flat"
          @click="drawer = true"
          >{{t('add')}}
        </v-btn>
      </template>
    </v-app-bar>

    <v-data-table :headers="headers" :items="items" :loading="loading">
      <template v-slot:[`item.book`]="{ item }">
        <div class="mt-3">{{ item.title }}</div>
        <div>
          <small class="text-medium-emphasis font-weight-bold">{{t('year_of_publication')}}: 2018</small>
        </div>
        <div class="mb-1">
          <v-chip
            v-for="author in item.authors_main"
            :key="author.id"
            color="primary"
            size="x-small"
            variant="outlined"
          >
            {{ author.name }}
          </v-chip>
        </div>
        <div class="mb-3">
          <v-chip color="green" size="x-small" variant="flat">
            {{t('publisher')}}: Oxford University Press
          </v-chip>
        </div>
      </template>

      <template v-slot:[`item.ordered`]="{ item }">
        <div>
          <v-chip color="primary" size="small" variant="outlined">{{ item.amount }} экз.</v-chip>
          <div class="font-weight-bold my-1">{{ item.fullname }}</div>
          <div>Дата подачи: {{ item.date }}</div>
        </div>
      </template>

      <template v-slot:[`item.status`]>
        <div>
          <v-chip color="green" size="small" variant="flat">Принято в обработку</v-chip>
        </div>
        <div class="mt-2">
          <v-chip color="grey" size="small" variant="flat">Заявка: УО</v-chip>
        </div>
      </template>

      <template v-slot:[`item.actions`]>
        <v-btn icon="mdi-pencil" variant="flat"></v-btn>
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
