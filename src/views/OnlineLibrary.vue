<script setup>
import { useAPI } from '@/api'
import nocover from '@/assets/logo-blue.svg'
import { useI18n } from 'vue-i18n'
import { ref, onMounted, watch, computed } from 'vue'
import { useToastStore } from '@/stores/toast'
import { useAuth } from '@/auth'
import GenreDialog from '@/components/GenreDialog.vue'

const toast = useToastStore()
const auth = useAuth()

const { t } = useI18n()
const api = useAPI()

const page = ref(1)
const length = ref(1)
const books = ref([])
const search = ref('')
const loading = ref(false)
const searchQuery = ref('')
const editDrawer = ref(false)
const selectedBook = ref(null)
const isAdmin = computed(() => auth.user.value?.roles[0].id === 1)
const isManager = computed(() => auth.user.value?.roles[0].id === 2)

// Add these refs for form handling
const authors = ref([])
const types = ref([])
const languages = ref([])
const materials = ref([])
const ebookTypes = ref([])

// Add these refs for author handling
const authorSearch = ref('')
const authorPage = ref(1)
const authorLoading = ref(false)
const authorItems = ref([])
const hasMoreItems = ref(true)

const mainAuthorSearch = ref('')
const mainAuthorItems = ref([])
const mainAuthorLoading = ref(false)
const hasMoreMainItems = ref(true)

// Add these refs for file handling
const cover = ref(null)
const epub = ref(null)
const coverPreview = ref('')
const epubFile = ref(null)

// Add these refs for genre handling
const selectedGenres = ref([])

// Add these refs
const mainAuthorFocused = ref(false)
const authorFocused = ref(false)

// Add this ref after other refs
const isUploading = ref(false)

// Add these refs
const historyDrawer = ref(false)
const readingHistory = ref([])
const historyLoading = ref(false)

// Add these refs for history pagination
const historyPage = ref(1)
const historyLength = ref(1)

const lastPage = ref(1)

async function getBooks() {
  loading.value = true
  try {
    let url = `/v1/book?page=${page.value}&epub=1`
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

function handleKeydown(event) {
  if (event.key === 'Enter') {
    handleSearch()
  }
}

function getBookSubtitle(book) {
  let subtitle = book.book_author_main[0] ? book.book_author_main[0].name : ''
  return subtitle
}

function getImageURL(url) {
  return import.meta.env.VITE_APP_API + '/storage/covers/' + url
}

async function editBook(book) {
  selectedBook.value = {
    id: book.id,
    title: book.title,
    year: book.year,
    author_id: book.book_author || [],
    author_id_main: book.book_author_main?.[0] || null,
    language_id: book.book_language?.map((l) => l.id) || [],
    type_id: book.type?.id || null,
    ebook_type_id: book.book_ebook_type?.id || null,
    materials: book.book_material?.map((m) => m.id) || [],
    genre_id: book.book_genre?.map((g) => g.id) || []
  }
  selectedGenres.value = book.book_genre || []

  if (book.book_cover) {
    coverPreview.value = getImageURL(book.book_cover.value)
  }

  if (book.book_epub) {
    epubFile.value = { name: book.book_epub.value }
  }

  editDrawer.value = true
}

async function deleteBook(book) {
  try {
    await api.deleteData(`/v1/book/${book.id}`)
    toast.success('Книга успешно удалена')
    getBooks()
  } catch (error) {
    toast.error('Ошибка при удалении книги')
    console.error(error)
  }
}

async function saveBook() {
  try {
    isUploading.value = true

    // Create update object only with filled fields
    const updateData = {}

    if (selectedBook.value.title) {
      updateData.title = selectedBook.value.title
    }

    if (selectedBook.value.year) {
      updateData.year = selectedBook.value.year
    }

    if (selectedBook.value.author_id?.length > 0) {
      updateData.author_id = selectedBook.value.author_id.map((a) => a.id)
    }

    if (selectedBook.value.author_id_main) {
      updateData.author_id_main = [selectedBook.value.author_id_main.id]
    }

    if (selectedBook.value.language_id?.length > 0) {
      updateData.language_id = selectedBook.value.language_id
    }

    if (selectedBook.value.type_id) {
      updateData.type_id = selectedBook.value.type_id
    }

    if (selectedBook.value.ebook_type_id) {
      updateData.ebook_type_id = selectedBook.value.ebook_type_id
    }

    if (selectedBook.value.materials?.length > 0) {
      updateData.materials = selectedBook.value.materials
    }

    if (selectedBook.value.genre_id?.length > 0) {
      updateData.genre_id = selectedBook.value.genre_id
    }

    // Send text data update only if there are changes
    if (Object.keys(updateData).length > 0) {
      await api.putData(`/v1/book/${selectedBook.value.id}`, updateData)
    }

    // Handle file uploads separately if needed
    if (cover.value?.files?.[0]) {
      const coverFormData = new FormData()
      coverFormData.append('cover', cover.value.files[0])
      coverFormData.append('book_id', selectedBook.value.id.toString())
      await api.postData(`/v1/book/cover`, coverFormData)
    }

    if (epub.value?.files?.[0]) {
      const epubFormData = new FormData()
      epubFormData.append('epub', epub.value.files[0])
      epubFormData.append('book_id', selectedBook.value.id.toString())
      await api.postData(`/v1/book/epub`, epubFormData)
    }

    toast.success('Книга успешно обновлена')
    editDrawer.value = false
    getBooks()
  } catch (error) {
    toast.error('Ошибка при обновлении книги')
    console.error(error)
  } finally {
    isUploading.value = false
  }
}

// Add functions to fetch data
async function getAuthors() {
  try {
    const response = await api.fetchData('/v1/author')
    if (response.data) {
      authors.value = response.data.data.items
    }
  } catch (error) {
    console.error(error)
  }
}

async function getTypes() {
  try {
    const response = await api.fetchData('/v1/type')
    if (response.data) {
      types.value = response.data.data.items
    }
  } catch (error) {
    console.error(error)
  }
}

async function getLanguages() {
  try {
    const response = await api.fetchData('/v1/language')
    if (response.data) {
      languages.value = response.data.data.items
    }
  } catch (error) {
    console.error(error)
  }
}

async function getMaterials() {
  try {
    const response = await api.fetchData('/v1/material')
    if (response.data) {
      materials.value = response.data.data.items
    }
  } catch (error) {
    console.error(error)
  }
}

async function getEbookTypes() {
  try {
    const response = await api.fetchData('/v1/ebook-type')
    if (response.data) {
      ebookTypes.value = response.data.data.items
    }
  } catch (error) {
    console.error(error)
  }
}

async function loadAuthors({ done }) {
  if (authorLoading.value || !hasMoreItems.value) {
    done('ok')
    return
  }

  authorLoading.value = true
  try {
    const response = await api.fetchData(
      `/v1/author?page=${authorPage.value}&per_page=30&search=${authorSearch.value}`
    )
    if (response.data) {
      const { items, current_page, last_page } = response.data.data
      authorItems.value = [...authorItems.value, ...items]
      hasMoreItems.value = current_page < last_page
      authorPage.value = current_page + 1
      done(items.length ? 'ok' : 'empty')
    }
  } catch (error) {
    console.error(error)
    done('error')
  } finally {
    authorLoading.value = false
  }
}

async function loadMainAuthors({ done }) {
  if (mainAuthorLoading.value || !hasMoreMainItems.value) {
    done('ok')
    return
  }

  mainAuthorLoading.value = true
  try {
    const response = await api.fetchData(
      `/v1/author?page=${authorPage.value}&per_page=30&search=${mainAuthorSearch.value}`
    )
    if (response.data) {
      const { items, current_page, last_page } = response.data.data
      mainAuthorItems.value = [...mainAuthorItems.value, ...items]
      hasMoreMainItems.value = current_page < last_page
      authorPage.value = current_page + 1
      done(items.length ? 'ok' : 'empty')
    }
  } catch (error) {
    console.error(error)
    done('error')
  } finally {
    mainAuthorLoading.value = false
  }
}

function searchMainAuthor(searchText) {
  authorPage.value = 1
  mainAuthorSearch.value = searchText
  hasMoreMainItems.value = true

  if (searchText) {
    mainAuthorItems.value = []
    api.fetchData(`/v1/author?search=${searchText}&per_page=30`).then((response) => {
      if (response.data) {
        const { items, current_page, last_page } = response.data.data
        mainAuthorItems.value = items
        hasMoreMainItems.value = current_page < last_page
        authorPage.value = current_page + 1
      }
    })
  } else {
    mainAuthorItems.value = []
  }
}

function searchAuthor(searchText) {
  authorPage.value = 1
  authorSearch.value = searchText
  hasMoreItems.value = true

  if (searchText) {
    authorItems.value = []
    api.fetchData(`/v1/author?search=${searchText}&per_page=30`).then((response) => {
      if (response.data) {
        const { items, current_page, last_page } = response.data.data
        authorItems.value = items
        hasMoreItems.value = current_page < last_page
        authorPage.value = current_page + 1
      }
    })
  } else {
    authorItems.value = []
  }
}

function selectMainAuthor(author) {
  selectedBook.value.author_id_main = author
  mainAuthorSearch.value = ''
  mainAuthorItems.value = []
}

function removeMainAuthor() {
  selectedBook.value.author_id_main = null
}

function selectAuthor(author) {
  if (!selectedBook.value.author_id) {
    selectedBook.value.author_id = []
  }

  // Check if author already exists
  if (!selectedBook.value.author_id.some((a) => a.id === author.id)) {
    selectedBook.value.author_id.push(author)
  }

  authorSearch.value = ''
}

function removeAuthor(author) {
  selectedBook.value.author_id = selectedBook.value.author_id.filter((a) => a.id !== author.id)
}

// Add focus handling
function handleMainAuthorInputFocus() {
  mainAuthorFocused.value = true
}

function handleMainAuthorInputBlur() {
  setTimeout(() => {
    mainAuthorFocused.value = false
  }, 200)
}

function handleAuthorInputFocus() {
  authorFocused.value = true
}

function handleAuthorInputBlur() {
  setTimeout(() => {
    authorFocused.value = false
  }, 200)
}

function handleGenreSelect(genres) {
  selectedBook.value.genre_id = genres.map((g) => g.id)
  selectedGenres.value = genres
}

// Add these functions for file handling that were accidentally removed
function handleCoverUpload() {
  cover.value?.click()
}

function handleCoverFile(event) {
  const file = event.target.files[0]
  if (file) {
    coverPreview.value = URL.createObjectURL(file)
  }
}

function handleEpubUpload() {
  epub.value?.click()
}

function handleEpubFile(event) {
  const file = event.target.files[0]
  if (file) {
    epubFile.value = file
  }
}

// Add these functions for handling Enter key
function handleMainAuthorEnter() {
  if (mainAuthorItems.value.length > 0) {
    selectMainAuthor(mainAuthorItems.value[0])
  }
}

function handleAuthorEnter() {
  if (authorItems.value.length > 0) {
    selectAuthor(authorItems.value[0])
  }
}

const genreDialog = ref(false)
const selectedBookId = ref(null)
const selectedGenreId = ref(null)
const selectBookTitle = ref(null)

const handleBook = (book) => {
  selectedBookId.value = book.id
  selectBookTitle.value = book.title
  console.log(selectedBookId.value)
}

const handleGenreSelectDialog = async (genres) => {
  selectedGenreId.value = genres[0].id
  console.log(selectedGenreId.value)

  await api.putData(`/v1/book/${selectedBookId.value}`, {
    genre_id: [selectedGenreId.value],
    title: selectBookTitle.value
  })
  getBooks()
  genreDialog.value = false
}

watch(page, () => {
  getBooks()
})

onMounted(() => {
  getBooks()
  getAuthors()
  getTypes()
  getLanguages()
  getMaterials()
  getEbookTypes()
})

// Update the getReadingHistory function to handle pagination
const getReadingHistory = async () => {
  historyLoading.value = true
  try {
    const response = await api.fetchData(`/v1/book-progress?page=${historyPage.value}`)
    if (response.data) {
      console.log(response.data)
      readingHistory.value = response.data.data.items
      historyLength.value = response.data.meta.last_page
    }
  } catch (error) {
    console.error('Error fetching reading history:', error)
    toast.error('Ошибка при загрузке истории чтения')
  } finally {
    historyLoading.value = false
  }
}

// Add watch for history page changes
watch(historyPage, () => {
  getReadingHistory()
})

// Add this function to handle drawer open
const openHistoryDrawer = () => {
  historyDrawer.value = true
  getReadingHistory()
}

// Add this function to get the last read page
const getLastReadPage = async (bookId) => {
  try {
    const response = await api.fetchData(`/v1/book-progress/${bookId}`)
    if (response.data) {
      return response.data.last_page || 1
    }
    return 1
  } catch (error) {
    console.error('Error fetching last read page:', error)
    return 1
  }
}

// Modify the router-link click handler
const handleBookClick = async (book) => {
  selectedBook.value = book
  lastPage.value = await getLastReadPage(book.id)
}
</script>

<template>
  <v-container class="h-100">
    <v-overlay v-model="isUploading" class="align-center justify-center">
      <v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
    </v-overlay>
    <v-row>
      <v-col cols="12">
        <v-card class="rounded-lg" elevation="1">
          <v-card-text>
            <v-row align="center">
              <v-col cols="6">
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
              <v-col cols="6" class="d-flex search-buttons">
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
                <v-btn
                  class="ml-auto"
                  color="primary"
                  variant="elevated"
                  elevation="1"
                  @click="openHistoryDrawer"
                >
                  {{ t('history_of_reading') }}
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col v-for="book in books" :key="book.id" cols="12" md="6">
        <v-card class="pa-4 h-100 custom-border" elevation="0" variant="outlined" @click="handleBookClick(book)">
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
                  <div class="text-primary mb-2">{{ getBookSubtitle(book) }}</div>
                  <div class="d-flex flex-wrap gap-2 mb-4">
                    <v-chip
                      v-for="genre in book.book_genre"
                      :key="genre.id"
                      color="primary"
                      variant="outlined"
                      size="small"
                      class="mr-1"
                    >
                      {{ genre.title }}
                    </v-chip>
                    <div @click="handleBook(book)">
                      <GenreDialog
                        :size="small"
                        v-if="!book.book_genre.length && (isManager || isAdmin)"
                        @finish="handleGenreSelectDialog"
                      />
                    </div>
                  </div>
                </div>
                <div class="d-flex flex-wrap align-center metadata-info mb-4">
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
                  <v-chip
                    v-if="book.book_ebook_type"
                    color="warning"
                    size="small"
                    variant="flat"
                    density="compact"
                    class="text-uppercase"
                  >
                    Тип: {{ book.book_ebook_type.name }}
                  </v-chip>
                  <v-chip
                    v-if="book.type"
                    color="info"
                    size="small"
                    variant="outlined"
                    density="compact"
                  >
                    {{ book.type.title }}
                  </v-chip>
                  <v-chip
                    v-for="lang in book.book_language"
                    :key="lang.id"
                    color="success"
                    size="small"
                    variant="outlined"
                    density="compact"
                  >
                    {{ lang.title }}
                  </v-chip>
                </div>
                <div class="d-flex w-100">
                  <v-btn
                    :href="`/book/${book.id}`"
                    target="_blank"
                    color="primary"
                    variant="elevated"
                    class="px-6 flex-grow-1"
                    size="small"
                  >
                    {{ t('read') }}
                  </v-btn>
                  <div v-if="isAdmin" class="d-flex ml-2">
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      variant="text"
                      @click.stop="editBook(book)"
                    ></v-btn>
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      color="error"
                      @click.stop="deleteBook(book)"
                    ></v-btn>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-if="books.length === 0 && !loading">
      <v-col class="text-center">
        <span class="text-medium-emphasis">{{ t('no_data_available') }}</span>
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

  <v-navigation-drawer v-model="editDrawer" location="right" width="600" temporary>
    <v-card-title class="d-flex justify-space-between align-center pa-4">
      <span>Редактировать книгу</span>
      <v-btn icon="mdi-close" variant="text" @click="editDrawer = false"></v-btn>
    </v-card-title>

    <v-card-text class="px-4 py-2">
      <v-form v-if="selectedBook" @submit.prevent="saveBook">
        <v-text-field
          v-model="selectedBook.title"
          label="Название"
          variant="outlined"
          class="mb-4"
        ></v-text-field>

        <div class="mb-4">
          <div v-if="!selectedBook.author_id_main" class="position-relative">
            <span class="mb-2">{{ t('main_author') }}</span>
            <v-text-field
              v-model="mainAuthorSearch"
              :placeholder="t('search')"
              variant="outlined"
              @input="searchMainAuthor($event.target.value)"
              @focus="handleMainAuthorInputFocus"
              @blur="handleMainAuthorInputBlur"
              @keydown.enter="handleMainAuthorEnter"
            ></v-text-field>

            <v-card
              v-if="(mainAuthorSearch || mainAuthorItems.length > 0) && mainAuthorFocused"
              class="author-results"
            >
              <v-infinite-scroll
                :height="300"
                :loading="mainAuthorLoading"
                :disabled="!hasMoreMainItems"
                @load="({ done }) => loadMainAuthors({ done })"
              >
                <template v-for="(author, index) in mainAuthorItems" :key="author.id">
                  <v-list-item
                    :class="['pa-2', index % 2 === 0 ? 'bg-grey-lighten-2' : '']"
                    @click="selectMainAuthor(author)"
                  >
                    {{ author.name }}
                  </v-list-item>
                </template>
              </v-infinite-scroll>
            </v-card>
          </div>

          <div v-if="selectedBook.author_id_main" class="mt-2">
            <v-chip closable @click:close="removeMainAuthor">
              {{ selectedBook.author_id_main.name }}
            </v-chip>
          </div>
        </div>

        <div class="mb-4">
          <div class="position-relative">
            <span class="mb-2">{{ t('other_authors') }}</span>
            <v-text-field
              v-model="authorSearch"
              :placeholder="t('search')"
              variant="outlined"
              @input="searchAuthor($event.target.value)"
              @focus="handleAuthorInputFocus"
              @blur="handleAuthorInputBlur"
              @keydown.enter="handleAuthorEnter"
            ></v-text-field>

            <v-card
              v-if="(authorSearch || authorItems.length > 0) && authorFocused"
              class="author-results"
            >
              <v-infinite-scroll
                :height="300"
                :loading="authorLoading"
                :disabled="!hasMoreItems"
                @load="({ done }) => loadAuthors({ done })"
              >
                <template v-for="(author, index) in authorItems" :key="author.id">
                  <v-list-item
                    :class="['pa-2', index % 2 === 0 ? 'bg-grey-lighten-2' : '']"
                    @click="selectAuthor(author)"
                  >
                    {{ author.name }}
                  </v-list-item>
                </template>
              </v-infinite-scroll>
            </v-card>
          </div>

          <div v-if="selectedBook.author_id?.length" class="mt-2 d-flex flex-wrap gap-2">
            <v-chip
              v-for="author in selectedBook.author_id"
              :key="author.id"
              closable
              @click:close="removeAuthor(author)"
            >
              {{ author.name }}
            </v-chip>
          </div>
        </div>

        <v-autocomplete
          v-model="selectedBook.type_id"
          :items="types"
          item-title="title"
          item-value="id"
          label="Тип"
          variant="outlined"
          class="mb-4"
        ></v-autocomplete>

        <v-autocomplete
          v-model="selectedBook.ebook_type_id"
          :items="ebookTypes"
          item-title="name"
          item-value="id"
          label="Тип электронных книг"
          variant="outlined"
          class="mb-4"
        ></v-autocomplete>

        <v-autocomplete
          v-model="selectedBook.language_id"
          :items="languages"
          item-title="title"
          item-value="id"
          label="Язык"
          multiple
          variant="outlined"
          class="mb-4"
        ></v-autocomplete>

        <v-text-field
          v-model="selectedBook.year"
          label="Год издания"
          type="number"
          variant="outlined"
          class="mb-4"
        ></v-text-field>
        <v-autocomplete
          v-model="selectedBook.materials"
          :items="materials"
          item-title="label"
          item-value="id"
          label="Обозначение материала"
          multiple
          variant="outlined"
          class="mb-4"
        ></v-autocomplete>
        <div class="mb-4">
          <div class="d-flex align-items-center gap-4 mb-2">
            <span>Жанр</span>
            <div v-if="selectedGenres.length" class="d-flex flex-wrap gap-2">
              <v-chip
                v-for="genre in selectedGenres"
                :key="genre.id"
                color="primary"
                variant="outlined"
                size="small"
              >
                {{ genre.title }}
              </v-chip>
            </div>
          </div>
          <GenreDialog @finish="handleGenreSelect" />
        </div>

        <div class="d-flex justify-space-between mb-4">
          <div class="d-flex flex-column">
            <span class="mb-2">Обложка *</span>
            <v-img
              v-if="coverPreview"
              :src="coverPreview"
              width="100"
              height="150"
              class="mb-2 rounded"
              cover
            ></v-img>
            <v-btn color="primary" variant="outlined" @click="handleCoverUpload">
              {{ coverPreview ? 'Изменить' : 'Выбрать файл' }}
            </v-btn>
            <input
              ref="cover"
              accept="image/png, image/jpg, image/jpeg"
              style="display: none"
              type="file"
              @input="handleCoverFile"
            />
            <small>до 5 MB в соотношении 70×100, формата png, jpg, jpeg</small>
          </div>

          <div class="d-flex flex-column">
            <span class="mb-2">EPUB *</span>
            <v-btn color="primary" variant="outlined" @click="handleEpubUpload">
              {{ epubFile ? 'Изменить' : 'Выбрать файл' }}
            </v-btn>
            <input
              ref="epub"
              accept=".epub"
              style="display: none"
              type="file"
              @input="handleEpubFile"
            />
            <div v-if="epubFile" class="mt-2">
              <div class="text-body-2">{{ epubFile.name }}</div>
            </div>
          </div>
        </div>

        <div class="d-flex justify-end mt-4">
          <v-btn color="grey" variant="text" class="mr-2" @click="editDrawer = false">
            Отмена
          </v-btn>
          <v-btn color="primary" type="submit"> Сохранить </v-btn>
        </div>
      </v-form>
    </v-card-text>
  </v-navigation-drawer>

  <v-navigation-drawer v-model="historyDrawer" location="right" temporary width="600">
    <v-toolbar :title="t('history_of_reading')">
      <v-btn icon="mdi-close" variant="text" @click="historyDrawer = false"></v-btn>
    </v-toolbar>

    <v-list>
      <v-list-item v-for="progress in readingHistory" :key="progress.id" class="mb-2">
        <v-card width="100%" variant="outlined" class="pa-2">
          <router-link
            :to="{
              path: `/book/${progress.book?.id}`,
              query: { page: progress.last_page }
            }"
            target="_blank"
            class="d-block text-decoration-none"
          >
            <div class="d-flex history-item">
              <!-- Book cover -->
              <v-img
                :src="
                  progress.book?.book_cover ? getImageURL(progress.book.book_cover.value) : nocover
                "
                class="image-cover"
                cover
              ></v-img>

              <!-- Book info -->
              <div class="ml-3 flex-grow-1">
                <div class="text-subtitle-1 font-weight-medium mb-1">
                  {{ progress.book?.title }}
                </div>
                <div class="text-subtitle-2 text-primary mb-1">
                  {{ progress.book?.book_author_main?.[0]?.name }}
                </div>

                <!-- Info chips -->
                <div class="d-flex align-center gap-2">
                  <v-chip
                    size="x-small"
                    color="grey-lighten-1"
                    variant="flat"
                    class="font-weight-medium"
                  >
                    {{ t('page') }}: {{ progress.last_page }}
                  </v-chip>
                  <v-chip
                    v-if="progress.book?.ebook_type_id"
                    size="x-small"
                    color="warning"
                    variant="flat"
                    class="font-weight-medium"
                  >
                    {{ ebookTypes.find((type) => type.id === progress.book.ebook_type_id)?.name }}
                  </v-chip>
                </div>
              </div>

              <!-- Continue button -->
              <v-btn color="primary" variant="flat" size="small" class="ml-2 align-self-center">
                {{ t('continue') }}
              </v-btn>
            </div>
          </router-link>
        </v-card>
      </v-list-item>
    </v-list>

    <!-- Update the pagination section in the history drawer -->
    <div v-if="historyLength > 1" class="pa-4">
      <v-pagination
        v-model="historyPage"
        :length="historyLength"
        :total-visible="5"
        active-color="primary"
        size="small"
        variant="flat"
      ></v-pagination>
    </div>

    <v-overlay v-model="historyLoading" class="align-center justify-center">
      <v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </v-navigation-drawer>
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

.gap-2 {
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

.author-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 100;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  margin-top: 4px;
  background: white;
}

.v-list-item {
  cursor: pointer;
}

.v-list-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.gap-4 {
  gap: 16px;
}

.v-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
}

.image-cover {
  max-height: 60px;
  max-width: 60px;
  border-radius: 4px;
}
</style>
