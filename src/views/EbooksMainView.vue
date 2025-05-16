<script setup lang="ts">
import { useAPI } from '@/api'
import nocover from '@/assets/no-book-cover.svg'
import nobooks from '@/assets/nobooks.png'
import { useI18n } from 'vue-i18n'
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/auth'

const { t } = useI18n()
const api = useAPI()
const router = useRouter()
const auth = useAuth()

const page = ref(1)
const length = ref(1)
const books = ref([])
const search = ref('')
const loading = ref(false)
const searchQuery = ref('')

async function getBooks() {
  loading.value = true
  try {
    let url = `/v1/book?page=${page.value}&epub=1&for_school=1`
    if (searchQuery.value) {
      url += `&title=${searchQuery.value}`
    }
    const response = await api.fetchData(url)
    const { data, meta } = response.data
    books.value = data.items
    length.value = meta.last_page
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  searchQuery.value = search.value
  page.value = 1
  getBooks()
}

function handleClear() {
  search.value = ''
  searchQuery.value = ''
  page.value = 1
  getBooks()
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    handleSearch()
  }
}

function getBookSubtitle(book: any) {
  let subtitle = book.book_author_main[0] ? book.book_author_main[0].name : ''
  return subtitle
}

function getImageURL(url: string) {
  return import.meta.env.VITE_APP_API + '/storage/OrganizationMedia/'+ auth.userData.value?.school.id + '/covers/' + url
}

function goToEditor() {
  router.push('/e-books')
}

watch(page, () => {
  getBooks()
})

onMounted(() => {
  getBooks()
})
</script>

<template>
  <v-container class="h-100">
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4" elevation="0">
          <v-toolbar color="surface">
            <div class="d-flex justify-space-between w-100 align-center">
              <div class="d-flex align-center gap-2">
                <v-btn icon="mdi-arrow-left" variant="text" to="/"></v-btn>
                <v-toolbar-title>На главную</v-toolbar-title>
              </div>
              <div>
                <v-btn color="primary" variant="text" @click="goToEditor">
                  <v-icon>mdi-pencil</v-icon>
                  Редактор фонда
                </v-btn>
              </div>
            </div>
          </v-toolbar>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
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

    <v-row>
      <v-col v-for="book in books" :key="book.id" cols="12" md="6">
        <v-card class="pa-4 h-100 custom-border" elevation="0" variant="outlined">
          <v-row>
            <v-col cols="auto">
              <v-img
                :src="book.book_cover ? getImageURL(book.book_cover.value) : nocover"
                height="150"
                width="100"
                class="rounded"
                cover
              ></v-img>
              
            </v-col>
            <v-col class="flex-grow-1">
              <div class="d-flex flex-column justify-space-between h-100">
                <div>
                  <h3 class="mb-1">{{ book.title }}</h3>
                  <div class="text-primary mb-4">{{ getBookSubtitle(book) }}</div>
                </div>
                <div class="d-flex flex-wrap align-center metadata-info">
                  <div class="text-caption text-grey">
                    {{ t('year_of_publication') }}: {{ book.year || t('not_specified') }}
                  </div>
                  <v-chip
                    color="error"
                    size="small"
                    variant="flat"
                    class="text-uppercase"
                    density="compact"
                  >
                    EPUB
                  </v-chip>
                </div>
                <div class="d-flex w-100">
                  <v-btn
                    :href="`/book/${book.id}`"
                    target="_blank"
                    color="primary"
                    variant="elevated"
                    class="px-6 w-100"
                    size="small"
                  >
                    {{ t('read') }}
                  </v-btn>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="books.length === 0 && !loading">
      <v-col class="text-center d-flex flex-column align-center">
        <img :src="nobooks" max-width="400" class="mb-6" />
        <div class="no-books-text">ЭЛЕКТРОННЫЕ КНИГИ<br />НЕ ЗАГРУЖЕНЫ</div>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-pagination
          :total-visible="6"
          active-color="primary"
          variant="flat"
          v-model="page"
          :length="length"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.custom-border {
  border-color: #a0a0a0 !important;
}

.search-buttons {
  gap: 8px;
}

.metadata-info {
  gap: 8px;
}

h3 {
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  margin: 0;
  font-size: 1.25rem;
  line-height: 1.5;
  letter-spacing: 0.0125em;
}

@media not all and (min-resolution: 0.001dpcm) {
  @supports (-webkit-appearance: none) {
    h3 {
      font-weight: 600 !important;
      color: rgba(0, 0, 0, 0.87) !important;
      -webkit-font-smoothing: antialiased;
    }
  }
}

@supports (-webkit-touch-callout: none) {
  h3 {
    font-weight: 600 !important;
    color: rgba(0, 0, 0, 0.87) !important;
    -webkit-font-smoothing: antialiased;
  }
}

.no-books-text {
  font-family: 'Roboto', sans-serif;
  font-size: 32px;
  color: #3062d4;
  text-transform: uppercase;
  line-height: 1.2;
  font-weight: 500;
  text-align: center;
}
</style>
