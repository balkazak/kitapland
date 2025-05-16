<template>
  <v-container class="h-100">
    <v-app-bar>
      <v-app-bar-title>{{ t('reference') }}</v-app-bar-title>
    </v-app-bar>

    <v-row>
      <v-col cols="12" class="pa-0 my-3">
        <v-card class="rounded-lg" elevation="1">
          <v-card-text>
            <v-row align="center">
              <v-col cols="8">
                <v-text-field
                  v-model="search"
                  :loading="loading"
                  clearable
                  hide-details
                  :placeholder="t('search_by_title')"
                  prepend-inner-icon="mdi-magnify"
                  single-line
                  variant="outlined"
                  density="compact"
                  bg-color="white"
                  @keydown="handleKeydown"
                ></v-text-field>
              </v-col>
              <v-col cols="2" class="d-flex search-buttons">
                <v-btn
                  color="primary"
                  :loading="loading"
                  variant="elevated"
                  elevation="1"
                  @click="handleSearch"
                >
                  {{ t('search') }}
                </v-btn>
                <v-btn variant="elevated" elevation="1" @click="handleClear">
                  {{ t('reset') }}
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-for="book in books" :key="book.id" class="border rounded-lg bg-white my-3 py-3">
      <v-col cols="2">
        <v-img height="25vh" :src="getImageURL(book.book_cover)" class="rounded" responsive></v-img>
      </v-col>
      <v-col cols="10">
        <v-row>
          <v-col cols="10">
            <v-chip v-if="book.book_type[0]" color="primary" variant="flat">{{
              book.book_type[0].title
            }}</v-chip>
          </v-col>
          <v-col cols="2">
            <v-chip color="green" variant="flat"
              >{{ t('quotes') }}: {{ book.book_quote.length }}</v-chip
            >
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="8">
            <div class="text-h6 font-weight-bold">{{ book.title }}</div>
            <div>{{ book.annotation }}</div>
            <div class="mt-3">
              <v-chip
                v-for="author in book.book_author_main"
                :key="author.id"
                color="primary"
                variant="outlined"
                >{{ author.name }}</v-chip
              >
            </div>
          </v-col>
          <v-col cols="4">
            <div class="rounded-lg bg-grey-lighten-2 w-100">
              <div class="d-flex flex-column mx-3">
                <div class="d-flex flex-row my-2">
                  <div class="d-flex flex-column w-50">
                    <div class="font-weight-bold">{{ t('publisher') }}:</div>
                    <div>{{ book.book_publisher[0] ? book.book_publisher[0].title : '' }}</div>
                  </div>
                  <div class="d-flex flex-column w-50">
                    <div class="font-weight-bold">{{ t('year_of_publication') }}:</div>
                    <div>{{ book.year }}</div>
                  </div>
                </div>
                <div class="d-flex flex-row my-2">
                  <div class="d-flex flex-column w-50">
                    <div class="font-weight-bold">{{ t('pages') }}:</div>
                    <div>{{ book.pages }}</div>
                  </div>
                  <div class="d-flex flex-column w-50">
                    <div class="font-weight-bold">{{ t('language') }}:</div>
                    <div>{{ book.book_language[0] ? book.book_language[0].title : '' }}</div>
                  </div>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" class="text-right">
            <v-btn
              class="mr-3"
              variant="flat"
              color="primary"
              @click="showQuotes(book.book_quote)"
              >{{ t('all_quotes') }}</v-btn
            >
            <v-btn class="mr-3" variant="flat" color="green" @click="addQuote(book.id)">{{
              t('add_quote')
            }}</v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-pagination
          color="primary"
          :total-visible="7"
          v-model="page"
          :length="length"
        ></v-pagination>
      </v-col>
    </v-row>
  </v-container>

  <v-dialog max-width="60vw" v-model="showDialog">
    <v-card>
      <v-card-title>{{ t('about_book_and_quotes') }}</v-card-title>
      <v-card-text>
        <div class="my-3" v-for="quote in selectedQuotes" :key="quote.id">
          <v-card variant="outlined">
            <v-card-title>{{ quote.name }}</v-card-title>
            <v-card-text>
              {{ quote.content }}
            </v-card-text>
            <v-card-text>
              <v-chip class="rounded-sm" prepend-icon="mdi-magnify"
                >{{ t('page') }}: {{ quote.page }}</v-chip
              >
            </v-card-text>
            <v-card-actions class="bg-grey-lighten-3">
              {{ t('note') }}: {{ quote.note }}
            </v-card-actions>
          </v-card>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-dialog max-width="60vw" v-model="showAdd">
    <v-card>
      <v-card-title>{{ t('add_quote') }}</v-card-title>
      <v-card-text>
        <v-container fluid>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="newQuote.name"
                variant="outlined"
                hide-details
                :label="t('full_name')"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="newQuote.content"
                variant="outlined"
                hide-details
                :label="t('quote_or_info')"
              ></v-textarea>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model="newQuote.page"
                variant="outlined"
                hide-details
                :label="t('page')"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="newQuote.note"
                variant="outlined"
                hide-details
                :label="t('note')"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-btn variant="tonal" class="ml-auto mr-2" @click="showAdd = !showAdd">{{
          t('close')
        }}</v-btn>
        <v-btn variant="flat" color="primary" @click="createQuote()">{{ t('save') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { useAPI } from '@/api'
import { useI18n } from 'vue-i18n'

export default {
  name: 'QuotesView',
  data: () => {
    return {
      page: 1,
      length: null,
      books: [],
      showDialog: false,
      showAdd: false,
      selectedQuotes: [],
      newQuote: {
        book_id: null,
        name: '',
        content: '',
        page: '',
        note: ''
      },
      // New search-related data properties
      search: '',
      loading: false,
      searchQuery: ''
    }
  },
  setup() {
    const api = useAPI()
    const { t } = useI18n()
    return { api, t }
  },
  methods: {
    async fetchBooks() {
      this.loading = true
      try {
        let url = `/v1/book?page=${this.page}&quote=1`
        if (this.searchQuery) {
          url += `&title=${this.searchQuery}`
        }
        const response = await this.api.fetchData(url)
        const { data, meta } = response.data

        this.books = data.items
        if (!this.length) this.length = meta.last_page
      } catch (e) {
        console.error('Error:', e.message)
      } finally {
        this.loading = false
      }
    },

    // New search-related methods
    handleSearch() {
      this.searchQuery = this.search
      this.page = 1
      this.fetchBooks()
    },

    handleClear() {
      this.search = ''
      this.searchQuery = ''
      this.page = 1
      this.fetchBooks()
    },

    handleKeydown(event) {
      if (event.key === 'Enter') {
        this.handleSearch()
      }
    },

    getImageURL(url) {
      if (url) return import.meta.env.VITE_APP_API + '/storage/covers/' + url.value
      else return '/src/assets/no-book-cover.svg'
    },
    showQuotes(quotes) {
      this.selectedQuotes = quotes
      this.showDialog = true
    },
    addQuote(book_id) {
      this.newQuote.book_id = book_id
      this.showAdd = true
    },
    async createQuote() {
      try {
        await this.api.postData('/v1/quotes', this.newQuote)
        this.showAdd = false
        this.newQuote = {
          name: '',
          content: '',
          page: '',
          note: ''
        }
        this.fetchBooks()
      } catch (e) {
        console.error(e.message)
      }
    }
  },
  watch: {
    page() {
      this.fetchBooks()
    }
  },
  mounted() {
    this.fetchBooks()
  }
}
</script>

<style scoped>
.search-buttons {
  gap: 8px;
}

/* Add any other styles from OnlineLibrary.vue that might be needed */
</style>
