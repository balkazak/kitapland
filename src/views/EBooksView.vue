<script setup lang="ts">
import { useAPI } from '@/api'
import { useI18n } from 'vue-i18n'
import { ref, onMounted, watch } from 'vue'
import nocover from '@/assets/no-book-cover.svg'
import { useToastStore } from '@/stores/toast'
import { useRouter } from 'vue-router'
import GenreDialog from '@/components/GenreDialog.vue'
import { useAuth } from '@/auth/index'

const { t } = useI18n()
const api = useAPI()
const toast = useToastStore()
const router = useRouter()
const auth = useAuth()

interface Form {
  title: string
  author_id: number[]
  author_id_main: number[]
  language_id: number[]
  link: { URL: string; title: string }
  materials: number[]
  type_id: number | null
  year: string
  genre_id: number[]
}

const page = ref(1)
const length = ref(1)
const books = ref([])
const loading = ref(false)
const drawer = ref(false)

const form = ref<Form>({
  title: '',
  author_id: [],
  author_id_main: [],
  language_id: [],
  link: { URL: '', title: '' },
  materials: [],
  type_id: null,
  year: '',
  genre_id: []
})

const authors = ref<{ id: number; name: string }[]>([])
const types = ref<{ id: number; title: string }[]>([])
const languages = ref<{ id: number; title: string }[]>([])
const materials = ref<{ id: number; label: string }[]>([])

const cover = ref<HTMLInputElement | null>(null)
const epub = ref<HTMLInputElement | null>(null)
const coverPreview = ref('')
const epubFile = ref<File | null>(null)

const titleValid = ref(false)
const authorMainValid = ref(false)
const epubValid = ref(false)
const coverValid = ref(false)

const titleError = ref(false)
const authorMainError = ref(false)
const epubError = ref(false)
const coverError = ref(false)

const formSubmitted = ref(false)

const deleteDialog = ref(false)
const bookToDelete = ref<any>(null)

const selectedGenres = ref<{ id: number; title: string }[]>([])

const rules = {
  required: (value: any) => !!value || 'Поле обязательно для заполнения'
}

const authorSearch = ref('')
const authorPage = ref(1)
const authorLoading = ref(false)
const authorItems = ref<{ id: number; name: string }[]>([])
const hasMoreItems = ref(true)

const mainAuthorSearch = ref('')
const mainAuthorItems = ref<{ id: number; name: string }[]>([])
const mainAuthorLoading = ref(false)
const hasMoreMainItems = ref(true)

const authorFocused = ref(false)
const mainAuthorFocused = ref(false)

const selectedMainAuthor = ref<{ id: number; name: string } | null>(null)
const selectedAuthors = ref<{ id: number; name: string }[]>([])

// Add these refs for the PDF document
const pdf = ref<HTMLInputElement | null>(null)
const pdfFile = ref<File | null>(null)
const pdfValid = ref(false)
const pdfError = ref(false)

const isUploading = ref(false)

function getImageURL(url: string) {
  return (
    import.meta.env.VITE_APP_API +
    '/storage/OrganizationMedia/' +
    auth.userData.value?.school.id +
    '/covers/' +
    url
  )
}

function getAuthor(book: any) {
  return book.book_author_main?.[0]?.name || ''
}

function getYear(book: any) {
  return book.year || t('not_specified')
}

async function getAuthors(search = '') {
  try {
    const response = await api.fetchData<{ data: { items: { id: number; name: string }[] } }>(
      `/v1/author?search=${search}`
    )
    if (response.data) authors.value = response.data.data.items
  } catch (error: any) {
    toast.error('Ошибка при загрузке списка авторов')
  }
}

async function getTypes(search = null) {
  try {
    let request = `/v1/type`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: { id: number; title: string }[] } }>(
      request
    )
    if (response.data) types.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error)
  }
}

async function getLanguages(search = null) {
  try {
    let request = `/v1/language`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: { id: number; title: string }[] } }>(
      request
    )
    if (response.data) languages.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error)
  }
}

async function getMaterials(search = null) {
  try {
    let request = `/v1/material`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: { id: number; label: string }[] } }>(
      request
    )
    if (response.data) materials.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error)
  }
}

function handleUpload() {
  cover.value?.click()
}

function handleEpub() {
  epub.value?.click()
}

function handleFile(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    coverPreview.value = URL.createObjectURL(file)
    coverValid.value = true
    coverError.value = false
  }
}

function handleEpubUpload(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    epubFile.value = target.files[0]
    epubValid.value = true
    epubError.value = false
  }
}

function handlePdf() {
  pdf.value?.click()
}

function handlePdfUpload(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    pdfFile.value = target.files[0]
    pdfValid.value = true
    pdfError.value = false
  }
}

function openEditDrawer(book: any) {
  form.value = {
    title: book.title || '',
    author_id:
      book.book_author_other?.map((a: any) => a.id) ||
      book.book_author?.map((a: any) => a.id) ||
      [],
    author_id_main: book.book_author_main?.length
      ? [book.book_author_main[0].id]
      : book.book_author?.length
        ? [book.book_author[0].id]
        : [],
    language_id: book.language_id || book.book_language?.map((l: any) => l.id) || [],
    link: { URL: '', title: '' },
    materials: book.materials?.map((m: any) => m.id) || [],
    type_id: book.type?.id || (book.book_type?.length ? book.book_type[0].id : null),
    year: book.year || '',
    genre_id: book.genre_id || []
  }

  selectedGenres.value = book.genre
    ? book.genre.map((g: any) => ({ id: g.id, title: g.title }))
    : book.book_genre
      ? book.book_genre.map((g: any) => ({ id: g.id, title: g.title }))
      : []

  if (book.book_author_main?.length) {
    selectedMainAuthor.value = {
      id: book.book_author_main[0].id,
      name: book.book_author_main[0].name
    }
    authorMainValid.value = true
    authorMainError.value = false
  } else if (book.book_author?.length) {
    selectedMainAuthor.value = {
      id: book.book_author[0].id,
      name: book.book_author[0].name
    }
    authorMainValid.value = true
    authorMainError.value = false
  } else {
    selectedMainAuthor.value = null
    authorMainValid.value = false
    authorMainError.value = false
  }

  selectedAuthors.value =
    book.book_author_other?.map((a: any) => ({
      id: a.id,
      name: a.name
    })) ||
    book.book_author?.map((a: any) => ({
      id: a.id,
      name: a.name
    })) ||
    []

  drawer.value = true
  getAuthors()
  getTypes()
  getLanguages()
  getMaterials()
}

const handleMainAuthorSelect = async (value: number) => {
  if (value) {
    form.value.author_id_main = [value]
    authorMainValid.value = true
    authorMainError.value = false
    await getAuthors('')
  }
}

const handleAdditionalAuthorSelect = async (value: number[]) => {
  if (value) {
    form.value.author_id = value
    await getAuthors('')
  }
}

const handleMaterialSelect = (value: number) => {
  if (value) {
    form.value.materials = [value]
  }
}

function handleGenreSelect(genres: { id: number; title: string }[]) {
  selectedGenres.value = genres
  form.value.genre_id = genres.map((g) => g.id)
}

async function sendBookData() {
  try {
    isUploading.value = true
    formSubmitted.value = true

    titleValid.value = !!form.value.title
    authorMainValid.value = form.value.author_id_main.length > 0
    epubValid.value = !!epubFile.value
    coverValid.value = !!coverPreview.value

    titleError.value = !titleValid.value
    authorMainError.value = !authorMainValid.value
    epubError.value = !epubValid.value
    coverError.value = !coverValid.value

    const isValid = titleValid.value && authorMainValid.value && epubValid.value && coverValid.value

    if (!isValid) {
      toast.error('Пожалуйста, заполните все обязательные поля')
      return
    }

    const payload = {
      title: form.value.title,
      author_id_main: form.value.author_id_main,
      for_school: 1,
      ...(form.value.author_id.length > 0 && { author_id: form.value.author_id }),
      ...(form.value.language_id.length > 0 && { language_id: form.value.language_id }),
      ...(form.value.materials.length > 0 && { materials: form.value.materials }),
      ...(form.value.type_id && { type_id: form.value.type_id }),
      ...(form.value.year && { year: form.value.year }),
      ...(form.value.link?.URL && form.value.link?.title && { link: form.value.link }),
      ...(form.value.genre_id.length > 0 && { genre_id: form.value.genre_id })
    }

    const response = await api.postData('/v1/book', payload)
    const bookId = (response.data as { id: number }).id

    if (cover.value?.files?.[0]) {
      const coverFormData = new FormData()
      coverFormData.append('cover', cover.value.files[0])
      coverFormData.append('book_id', bookId.toString())
      coverFormData.append('for_school', '1')
      await api.postData('/v1/book/cover', coverFormData)
    }

    if (epubFile.value) {
      const epubFormData = new FormData()
      epubFormData.append('epub', epubFile.value)
      epubFormData.append('book_id', bookId.toString())
      epubFormData.append('for_school', '1')
      await api.postData('/v1/book/epub', epubFormData)
    }

    if (pdfFile.value) {
      const pdfFormData = new FormData()
      pdfFormData.append('document', pdfFile.value)
      pdfFormData.append('book_id', bookId.toString())
      pdfFormData.append('for_school', '1')
      await api.postData('/v1/book/document', pdfFormData)
    }

    toast.success('Запись успешно добавлена')
    drawer.value = false
    getBooks()
  } catch (error: any) {
    let errorMessage = error?.message || 'Ошибка при добавлении книги'
    toast.error(errorMessage)
    console.error('Error:', error)
  } finally {
    isUploading.value = false
  }
}

async function getBooks() {
  loading.value = true
  try {
    const url = `/v1/book?page=${page.value}&epub=1&for_school=1`
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

function openDeleteDialog(book: any) {
  bookToDelete.value = book
  deleteDialog.value = true
}

async function deleteBook() {
  try {
    await api.fetchDelete(`/v1/book/${bookToDelete.value.id}`)
    toast.success('Книга успешно удалена')
    deleteDialog.value = false
    bookToDelete.value = null
    getBooks()
  } catch (error: any) {
    let errorMessage = error?.message || 'Ошибка при удалении книги'
    toast.error(errorMessage)
    console.error('Error:', error)
  }
}

watch(page, () => {
  getBooks()
})

onMounted(() => {
  getBooks()
})

async function loadAuthors({ done }) {
  if (authorLoading.value || !hasMoreItems.value) {
    done('ok')
    return
  }

  try {
    authorLoading.value = true
    const response = await api.fetchData<{
      data: { items: { id: number; name: string }[]; total: number }
    }>(
      `/v1/author?page=${authorPage.value}&per_page=30${
        authorSearch.value ? `&search=${authorSearch.value}` : ''
      }`
    )

    if (authorPage.value === 1) {
      hasMoreItems.value = true
    }

    if (authorPage.value === 1 && !response.data?.data?.items?.length) {
      authorItems.value = []
      hasMoreItems.value = false
      done('empty')
      return
    }

    if (!response.data?.data?.items?.length) {
      hasMoreItems.value = false
      done('complete')
      return
    }

    const sortedItems = [...response.data.data.items].sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase(), 'ru')
    )

    authorItems.value = [...authorItems.value, ...sortedItems]
    authorPage.value++
    done('ok')
  } catch (error) {
    console.error('Error loading authors:', error)
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

  try {
    mainAuthorLoading.value = true
    const response = await api.fetchData<{
      data: { items: { id: number; name: string }[]; total: number }
    }>(
      `/v1/author?page=${authorPage.value}&per_page=30${
        mainAuthorSearch.value ? `&search=${mainAuthorSearch.value}` : ''
      }`
    )

    if (authorPage.value === 1) {
      hasMoreMainItems.value = true
    }

    if (authorPage.value === 1 && !response.data?.data?.items?.length) {
      mainAuthorItems.value = []
      hasMoreMainItems.value = false
      done('empty')
      return
    }

    if (!response.data?.data?.items?.length) {
      hasMoreMainItems.value = false
      done('complete')
      return
    }

    const sortedItems = [...response.data.data.items].sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase(), 'ru')
    )

    mainAuthorItems.value = [...mainAuthorItems.value, ...sortedItems]
    authorPage.value++
    done('ok')
  } catch (error) {
    console.error('Error loading authors:', error)
    done('error')
  } finally {
    mainAuthorLoading.value = false
  }
}

async function searchAuthors(searchText: string) {
  authorSearch.value = searchText
  authorPage.value = 1
  authorItems.value = []
  hasMoreItems.value = true

  if (searchText) {
    await loadAuthors({ done: () => {} })
  }
}

async function searchMainAuthor(searchText: string) {
  mainAuthorSearch.value = searchText
  authorPage.value = 1
  mainAuthorItems.value = []
  hasMoreMainItems.value = true

  if (searchText) {
    await loadMainAuthors({ done: () => {} })
  }
}

function selectAuthor(author: { id: number; name: string }) {
  if (!selectedAuthors.value.some((a) => a.id === author.id)) {
    selectedAuthors.value.push(author)
    form.value.author_id.push(author.id)
  }
  authorSearch.value = ''
  authorItems.value = []
}

function selectMainAuthor(author: { id: number; name: string }) {
  selectedMainAuthor.value = author
  form.value.author_id_main = [author.id]
  authorMainValid.value = true
  authorMainError.value = false
  mainAuthorSearch.value = ''
  mainAuthorItems.value = []
}

function handleAuthorInputFocus() {
  authorFocused.value = true
  authorPage.value = 1
  authorItems.value = []
  hasMoreItems.value = true
  loadAuthors({ done: () => {} })
}

function handleMainAuthorInputFocus() {
  mainAuthorFocused.value = true
  authorPage.value = 1
  mainAuthorItems.value = []
  hasMoreMainItems.value = true
  loadMainAuthors({ done: () => {} })
}

function handleAuthorInputBlur() {
  setTimeout(() => {
    authorFocused.value = false
  }, 200)
}

function handleMainAuthorInputBlur() {
  setTimeout(() => {
    mainAuthorFocused.value = false
  }, 200)
}

function clearMainAuthor() {
  selectedMainAuthor.value = null
  form.value.author_id_main = []
  authorMainValid.value = false
}

function removeAuthor(author: { id: number; name: string }) {
  selectedAuthors.value = selectedAuthors.value.filter((a) => a.id !== author.id)
  form.value.author_id = form.value.author_id.filter((id) => id !== author.id)
}

function downloadPdf(filename: string, bookTitle: string) {
  const downloadUrl = `${import.meta.env.VITE_APP_API}/storage/documents/${filename}`

  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = `${bookTitle || 'document'}.pdf`
  link.target = '_blank'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4" elevation="0">
          <v-toolbar color="surface">
            <div class="d-flex justify-space-between w-100 align-center">
              <div class="d-flex align-center gap-2">
                <v-btn icon="mdi-arrow-left" variant="text" to="/e-books-main"></v-btn>
                <v-toolbar-title>Назад к списку</v-toolbar-title>
              </div>
              <div>
                <v-btn color="primary" variant="text" @click="openEditDrawer({})">
                  <v-icon>mdi-plus</v-icon>
                  Добавить книгу
                </v-btn>
              </div>
            </div>
          </v-toolbar>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="books.length === 0 && !loading">
      <v-col class="text-center">
        <span class="text-medium-emphasis">{{ t('no_data_available') }}</span>
      </v-col>
    </v-row>

    <v-row>
      <v-col v-for="book in books" :key="book.id" cols="12">
        <v-card variant="flat" color="white" class="mb-2">
          <div class="d-flex">
            <div class="book-image pa-3">
              <v-img
                :src="book.book_cover ? getImageURL(book.book_cover.value) : nocover"
                :width="70"
                :height="100"
                class="rounded"
              ></v-img>
            </div>

            <div class="book-content flex-grow-1">
              <div class="d-flex align-center gap-2 mb-3 mt-3">
                <v-chip color="error" size="x-small" class="text-uppercase">EPUB</v-chip>
                <span class="text-grey-darken-1 text-caption">
                  {{ book.book_type?.[0]?.title || book.type?.title || t('not_specified') }}
                </span>
                <v-tooltip v-if="book.book_document" location="top" text="PDF документ доступен">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-file-pdf-box"
                      size="small"
                      color="error"
                      variant="text"
                      class="ml-2"
                      @click="downloadPdf(book.book_document.value, book.title)"
                    ></v-btn>
                  </template>
                </v-tooltip>
              </div>

              <div class="text-subtitle-2 mb-3 book-title">{{ book.title }}</div>

              <div class="d-flex align-center flex-wrap gap-x-4 gap-y-1 mb-3">
                <div class="d-flex align-center">
                  <v-icon size="small" color="grey">mdi-account</v-icon>
                  <span class="text-caption text-grey-darken-1 ms-1">
                    {{ getAuthor(book) || t('not_specified') }}
                  </span>
                </div>
                <div class="d-flex align-center">
                  <v-icon size="small" color="grey">mdi-calendar</v-icon>
                  <span class="text-caption text-grey-darken-1 ms-1">
                    {{ getYear(book) }}
                  </span>
                </div>
                <div class="d-flex align-center">
                  <v-icon size="small" color="grey">mdi-translate</v-icon>
                  <span class="text-caption text-grey-darken-1 ms-1">
                    {{
                      book.book_language?.[0]?.title || book.language?.title || t('not_specified')
                    }}
                  </span>
                </div>
              </div>
            </div>

            <div class="d-flex gap-2 pa-3 actions align-self-center">
              <v-btn
                color="primary"
                size="small"
                variant="text"
                density="compact"
                @click="openEditDrawer(book)"
              >
                Изменить данные
              </v-btn>
              <v-btn
                color="error"
                size="small"
                variant="text"
                density="compact"
                @click="openDeleteDialog(book)"
              >
                Удалить из фонда
              </v-btn>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-pagination
          v-model="page"
          :length="length"
          :total-visible="6"
          active-color="primary"
          variant="flat"
        />
      </v-col>
    </v-row>

    <v-navigation-drawer v-model="drawer" location="right" temporary width="600">
      <v-overlay :model-value="isUploading" class="align-center justify-center">
        <v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
      </v-overlay>
      <v-toolbar color="surface">
        <v-toolbar-title>Загрузить книгу</v-toolbar-title>
        <template v-slot:append>
          <v-btn icon="mdi-close" variant="text" @click="drawer = false"></v-btn>
        </template>
      </v-toolbar>

      <v-container class="pa-4">
        <v-form>
          <v-text-field
            v-model="form.title"
            :label="t('book_title') + ' *'"
            :placeholder="t('enter_book_title')"
            :rules="[rules.required]"
            :error="titleError"
            @update:model-value="titleValid = $event?.length > 0"
            required
            variant="outlined"
            density="compact"
            class="mb-1"
          ></v-text-field>

          <div class="d-flex flex-column">
            <span class="mb-2">{{ t('main_author') }} *</span>
            <div class="position-relative">
              <v-text-field
                v-model="mainAuthorSearch"
                :placeholder="t('search')"
                variant="outlined"
                density="compact"
                :error="authorMainError"
                @input="searchMainAuthor($event.target.value)"
                @focus="handleMainAuthorInputFocus"
                @blur="handleMainAuthorInputBlur"
                hide-details
              ></v-text-field>

              <v-card
                v-if="(mainAuthorSearch || mainAuthorItems.length > 0) && mainAuthorFocused"
                class="author-results"
              >
                <v-infinite-scroll
                  :height="300"
                  :items="mainAuthorItems"
                  :loading="mainAuthorLoading"
                  :disabled="!hasMoreMainItems"
                  @load="loadMainAuthors"
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
            <div v-if="selectedMainAuthor" class="d-flex flex-wrap gap-2 mt-2">
              <v-chip
                color="primary"
                variant="outlined"
                size="small"
                closable
                @click:close="clearMainAuthor"
              >
                {{ selectedMainAuthor.name }}
              </v-chip>
            </div>
          </div>

          <div class="d-flex flex-column">
            <span class="mb-2">{{ t('other_authors') }}</span>
            <div class="position-relative">
              <v-text-field
                v-model="authorSearch"
                :placeholder="t('search')"
                variant="outlined"
                density="compact"
                @input="searchAuthors($event.target.value)"
                @focus="handleAuthorInputFocus"
                @blur="handleAuthorInputBlur"
                hide-details
              ></v-text-field>

              <v-card
                v-if="(authorSearch || authorItems.length > 0) && authorFocused"
                class="author-results"
              >
                <v-infinite-scroll
                  :height="300"
                  :items="authorItems"
                  :loading="authorLoading"
                  :disabled="!hasMoreItems"
                  @load="loadAuthors"
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
            <div v-if="selectedAuthors.length" class="d-flex flex-wrap gap-2 mt-2">
              <v-chip
                v-for="author in selectedAuthors"
                :key="author.id"
                color="primary"
                variant="outlined"
                size="small"
                closable
                @click:close="removeAuthor(author)"
              >
                {{ author.name }}
              </v-chip>
            </div>
          </div>

          <div class="d-flex justify-space-between mb-3">
            <div class="d-flex flex-column">
              <span class="mb-2">Обложка *</span>
              <v-img
                v-if="coverPreview"
                :src="coverPreview"
                width="70"
                height="100"
                class="mb-2"
              ></v-img>
              <v-btn color="primary" variant="outlined" @click="handleUpload" :error="coverError">
                Выбрать файл
              </v-btn>
              <input
                ref="cover"
                accept="image/png, image/jpg, image/jpeg"
                style="display: none"
                type="file"
                @input="handleFile"
              />
              <small>до 5 MB в соотношении 70×100, формата png, jpg, jpeg</small>
            </div>
            <div class="d-flex flex-column ml-4">
              <span class="mb-2">EPUB *</span>
              <v-btn color="primary" variant="outlined" @click="handleEpub" :error="epubError">
                Выбрать файл
              </v-btn>
              <input
                ref="epub"
                accept=".epub"
                style="display: none"
                type="file"
                @input="handleEpubUpload"
              />
              <div v-if="epubFile" class="mt-2">
                <div class="text-body-2">{{ epubFile.name }}</div>
                <div class="text-caption">{{ (epubFile.size / (1024 * 1024)).toFixed(2) }} MB</div>
              </div>
            </div>
            <div class="d-flex flex-column ml-4">
              <span class="mb-2">Документ</span>
              <v-btn color="primary" variant="outlined" @click="handlePdf" :error="pdfError">
                Выбрать файл
              </v-btn>
              <input
                ref="pdf"
                accept="application/pdf"
                style="display: none"
                type="file"
                @input="handlePdfUpload"
              />
              <div v-if="pdfFile" class="mt-2">
                <div class="text-body-2">{{ pdfFile.name }}</div>
                <div class="text-caption">{{ (pdfFile.size / (1024 * 1024)).toFixed(2) }} MB</div>
              </div>
              <small>PDF документ</small>
            </div>
          </div>

          <v-autocomplete
            v-model="form.type_id"
            :items="types"
            item-title="title"
            item-value="id"
            label="Тип"
            variant="outlined"
            density="compact"
            class="mb-1"
          ></v-autocomplete>

          <v-autocomplete
            v-model="form.language_id"
            :items="languages"
            item-title="title"
            item-value="id"
            label="Язык"
            multiple
            variant="outlined"
            density="compact"
            class="mb-1"
          ></v-autocomplete>

          <v-text-field
            v-model="form.year"
            :label="t('year_of_publication')"
            placeholder="Укажите"
            type="number"
            variant="outlined"
            density="compact"
            class="mb-1"
          ></v-text-field>

          <v-autocomplete
            v-model="form.materials[0]"
            :items="materials"
            item-title="label"
            item-value="id"
            label="Обозначение материала"
            @update:model-value="handleMaterialSelect"
            variant="outlined"
            density="compact"
            class="mb-1"
          ></v-autocomplete>

          <div class="mb-4">
            <div class="d-flex align-center gap-4 mb-2">
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
            <div>
              <GenreDialog @finish="handleGenreSelect" />
            </div>
          </div>

          <div class="d-flex justify-end gap-2 mt-3">
            <v-btn variant="outlined" size="small" @click="drawer = false">Закрыть</v-btn>
            <v-btn color="primary" size="small" @click="sendBookData">Добавить</v-btn>
          </div>
        </v-form>
      </v-container>
    </v-navigation-drawer>

    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5"> Подтверждение удаления </v-card-title>
        <v-card-text>
          Вы действительно хотите удалить книгу "{{ bookToDelete?.title }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="deleteDialog = false"> Отмена </v-btn>
          <v-btn color="error" variant="text" @click="deleteBook"> Удалить </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.gap-1 {
  gap: 4px;
}
.gap-2 {
  gap: 8px;
}
.gap-4 {
  gap: 16px;
}
.book-info {
  flex: 1;
  min-width: 0;
  max-width: calc(100% - 400px);
}
.book-image {
  width: 70px;
  height: 100px;
  flex-shrink: 0;
}
.book-content {
  min-width: 0;
  padding-right: 16px;
}
.book-title {
  word-break: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  line-height: 1.2;
}
.book-author {
  word-break: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}
.book-type {
  min-width: 200px;
  max-width: 200px;
}
.book-type-text {
  word-break: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}
.book-year {
  min-width: 200px;
  max-width: 200px;
}
.actions {
  display: flex;
  align-items: flex-start;
  flex-shrink: 0;
  margin-left: auto;
}
.file-input {
  width: 33.33%;
  min-width: 180px;
}

.file-input :deep(.v-field__input) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-input :deep(.v-field__input > .v-file-input__text) {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.book-language {
  min-width: 150px;
  max-width: 150px;
}

.book-language-text {
  word-break: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.gap-x-4 {
  column-gap: 16px;
}

.gap-y-1 {
  row-gap: 4px;
}

.mb-3 {
  margin-bottom: 12px;
}

.mt-3 {
  margin-top: 12px;
}

.author-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  margin-top: 4px;
}
</style>
