<script lang="ts" setup>
import { ref, type Ref } from 'vue'
import { useAPI } from '@/api'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToastStore } from '@/stores/toast'
import GenreDialog from '@/components/GenreDialog.vue'

const { t } = useI18n()
const api = useAPI()
const toast = useToastStore()
const router = useRouter()

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
  ebook_type_id: number | null
}

const form: Ref<Form> = ref({
  title: '',
  author_id: [],
  author_id_main: [],
  language_id: [],
  link: { URL: '', title: '' },
  materials: [],
  type_id: null,
  year: '',
  genre_id: [],
  ebook_type_id: null
})

const authors: Ref<{ id: number; name: string }[]> = ref([])
const types: Ref<{ id: number; title: string }[]> = ref([])
const languages: Ref<{ id: number; title: string }[]> = ref([])
const materials: Ref<{ id: number; label: string }[]> = ref([])

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

const selectedGenres = ref<{ id: number; title: string }[]>([])

const ebookTypes: Ref<{ id: number; title: string }[]> = ref([])

// Add these refs for loading states
const coverUploading = ref(false)
const epubUploading = ref(false)

// Replace button loading states with a single page loader
const isUploading = ref(false)

async function getAuthors(search = '') {
  try {
    const response = await api.fetchData<{ data: { items: { id: number; name: string }[] } }>(
      `/v1/author?search=${search}`
    )
    if (response.data) {
      authors.value = [...response.data.data.items].sort((a, b) => {
        const nameA = a.name.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
        const nameB = b.name.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
        return nameA.localeCompare(nameB, 'ru')
      })
    }
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
    coverUploading.value = true
    try {
      const file = target.files[0]
      coverPreview.value = URL.createObjectURL(file)
      coverValid.value = true
      coverError.value = false
    } catch (error) {
      toast.error('Ошибка при загрузке обложки')
      coverValid.value = false
      coverError.value = true
    } finally {
      coverUploading.value = false
    }
  }
}

function handleEpubUpload(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    epubUploading.value = true
    try {
      epubFile.value = target.files[0]
      epubValid.value = true
      epubError.value = false
    } catch (error) {
      toast.error('Ошибка при загрузке EPUB файла')
      epubValid.value = false
      epubError.value = true
    } finally {
      epubUploading.value = false
    }
  }
}

// Add this helper function to filter out empty values
function removeEmptyValues(obj: any) {
  const filtered: any = {}

  for (const [key, value] of Object.entries(obj)) {
    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length > 0) {
        filtered[key] = value
      }
      continue
    }

    // Handle objects (like link)
    if (value && typeof value === 'object') {
      const subFiltered = removeEmptyValues(value)
      if (Object.keys(subFiltered).length > 0) {
        filtered[key] = subFiltered
      }
      continue
    }

    // Handle primitive values
    if (value !== null && value !== undefined && value !== '') {
      filtered[key] = value
    }
  }

  return filtered
}

// Modify sendBookData function
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

    const isValid = titleValid.value && epubValid.value && coverValid.value

    if (!isValid) {
      toast.error('Пожалуйста, заполните все обязательные поля')
      return
    }

    const filteredForm = removeEmptyValues(form.value)
    const response = await api.postData('/v1/book', filteredForm)
    const id = (response.data as { id: number }).id

    if (cover.value?.files?.[0]) {
      const coverFormData = new FormData()
      coverFormData.append('cover', cover.value.files[0])
      coverFormData.append('book_id', id.toString())
      await api.postData('/v1/book/cover', coverFormData)
    }

    if (epubFile.value) {
      const epubFormData = new FormData()
      epubFormData.append('epub', epubFile.value)
      epubFormData.append('book_id', id.toString())
      await api.postData('/v1/book/epub', epubFormData)
    }

    toast.success('Запись успешно добавлена')
    router.push('/m-data')
  } catch (error: any) {
    let errorMessage = error.message || 'Произошла ошибка при добавлении записи. Попробуйте еще раз'
    toast.error(errorMessage)
    console.error('Error:', error.message)
  } finally {
    isUploading.value = false
  }
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

async function loadAuthors({ done }: { done: (status: string) => void }) {
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

    const sortedItems = [...response.data.data.items].sort((a, b) => {
      const nameA = a.name.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
      const nameB = b.name.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
      return nameA.localeCompare(nameB, 'ru')
    })

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

async function loadMainAuthors({ done }: { done: (status: string) => void }) {
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

    const sortedItems = [...response.data.data.items].sort((a, b) => {
      const nameA = a.name.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
      const nameB = b.name.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
      return nameA.localeCompare(nameB, 'ru')
    })

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
    const result = await loadAuthors({ done: () => {} })
    if (result === 'empty') {
      authorItems.value = []
    }
  }
}

async function searchMainAuthor(searchText: string) {
  mainAuthorSearch.value = searchText
  authorPage.value = 1
  mainAuthorItems.value = []
  hasMoreMainItems.value = true

  if (searchText) {
    const result = await loadMainAuthors({ done: () => {} })
    if (result === 'empty') {
      mainAuthorItems.value = []
    }
  }
}

function selectAuthor(author: { id: number; name: string }) {
  if (!form.value.author_id.includes(author.id)) {
    form.value.author_id.push(author.id)

    if (!authors.value.some((a) => a.id === author.id)) {
      authors.value.push(author)
    }
  }
  authorSearch.value = ''
  authorItems.value = []
}

function selectMainAuthor(author: { id: number; name: string }) {
  form.value.author_id_main = [author.id]
  authorMainValid.value = true
  authorMainError.value = false

  if (!authors.value.some((a) => a.id === author.id)) {
    authors.value.push(author)
  }

  mainAuthorSearch.value = ''
  mainAuthorItems.value = []
}

function removeAuthor(authorId: number) {
  form.value.author_id = form.value.author_id.filter((id) => id !== authorId)
}

function removeMainAuthor() {
  form.value.author_id_main = []
  authorMainValid.value = false
  authorMainError.value = true
}

function handleMainAuthorEnter(event: KeyboardEvent) {
  if (mainAuthorSearch.value && mainAuthorItems.value.length > 0) {
    selectMainAuthor(mainAuthorItems.value[0])
  } else if (mainAuthorSearch.value) {
    toast.error('Автор не найден')
  }
}

function handleAuthorInputFocus() {
  if (!authorSearch.value) {
    authorPage.value = 1
    authorItems.value = []
    hasMoreItems.value = true
    loadAuthors({ done: () => {} })
  }
}

function handleMainAuthorInputFocus() {
  if (!mainAuthorSearch.value) {
    authorPage.value = 1
    mainAuthorItems.value = []
    hasMoreMainItems.value = true
    loadMainAuthors({ done: () => {} })
  }
}

const handleGenreSelect = (genres: { id: number; title: string }[]) => {
  selectedGenres.value = genres
  form.value.genre_id = genres.map((g) => g.id)
}

async function getEbookTypes() {
  try {
    const response = await api.fetchData<{ data: { items: { id: number; title: string }[] } }>(
      '/v1/ebook-type'
    )
    if (response.data) ebookTypes.value = response.data.data.items
  } catch (error: any) {
    console.error('Error fetching ebook types:', error)
    toast.error('Ошибка при загрузке типов электронных книг')
  }
}

getAuthors()
getTypes()
getLanguages()
getMaterials()
getEbookTypes()
</script>

<template>
  <v-container fluid>
    <v-overlay :model-value="isUploading" class="align-center justify-center">
      <v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
    </v-overlay>

    <v-app-bar>
      <template v-slot:title>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">M-DATA</span>
          <span class="text-subtitle-2 text-medium-emphasis">{{ t('database_by_rk') }}</span>
        </div>
      </template>
    </v-app-bar>

    <v-row>
      <v-col>
        <v-btn prepend-icon="mdi-arrow-left" to="/m-data" variant="text">Назад</v-btn>
      </v-col>
    </v-row>

    <v-row class="mt-6">
      <v-col cols="8" offset="2">
        <v-card>
          <v-card-title>Основные данные</v-card-title>
          <v-card-text>
            <v-form>
              <v-container fluid>
                <v-row>
                  <v-col>
                    <v-text-field
                      v-model="form.title"
                      :label="t('book_title') + ' *'"
                      :placeholder="t('enter_book_title')"
                      :rules="[rules.required]"
                      :error="titleError"
                      @update:model-value="titleValid = $event?.length > 0"
                      required
                      variant="outlined"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col>
                    <div class="d-flex flex-column">
                      <span class="mb-2">{{ t('author') }}</span>

                      <div v-if="!form.author_id_main.length" class="position-relative">
                        <v-text-field
                          v-model="mainAuthorSearch"
                          :placeholder="t('search')"
                          variant="outlined"
                          @input="searchMainAuthor($event.target.value)"
                          @focus="handleMainAuthorInputFocus"
                          @keydown.enter="handleMainAuthorEnter"
                        ></v-text-field>

                        <v-card
                          v-if="mainAuthorSearch && mainAuthorItems.length > 0"
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

                      <div v-if="form.author_id_main.length" class="mt-2">
                        <v-chip closable @click:close="removeMainAuthor">
                          {{ authors.find((a) => a.id === form.author_id_main[0])?.name }}
                        </v-chip>
                      </div>
                    </div>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col>
                    <div class="d-flex flex-column">
                      <span class="mb-2">{{ t('other_authors') }}</span>
                      <div class="position-relative">
                        <v-text-field
                          v-model="authorSearch"
                          :placeholder="t('search')"
                          variant="outlined"
                          @input="searchAuthors($event.target.value)"
                          @focus="handleAuthorInputFocus"
                        ></v-text-field>

                        <v-card
                          v-if="authorSearch && authorItems.length > 0"
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

                      <div v-if="form.author_id.length" class="mt-2">
                        <v-chip
                          v-for="authorId in form.author_id"
                          :key="authorId"
                          class="ma-1"
                          closable
                          @click:close="removeAuthor(authorId)"
                        >
                          {{ authors.find((a) => a.id === authorId)?.name }}
                        </v-chip>
                      </div>
                    </div>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col>
                    <v-autocomplete
                      v-model="form.type_id"
                      :items="types"
                      item-title="title"
                      item-value="id"
                      label="Тип"
                      variant="outlined"
                    ></v-autocomplete>
                  </v-col>
                  <v-col>
                    <v-autocomplete
                      v-model="form.ebook_type_id"
                      :items="ebookTypes"
                      item-title="name"
                      item-value="id"
                      label="Тип электронных книг"
                      variant="outlined"
                    ></v-autocomplete>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col>
                    <v-autocomplete
                      v-model="form.language_id"
                      :items="languages"
                      item-title="title"
                      item-value="id"
                      label="Язык"
                      multiple
                      variant="outlined"
                    ></v-autocomplete>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col>
                    <v-text-field
                      v-model="form.year"
                      :label="t('year_of_publication')"
                      placeholder="Укажите"
                      type="number"
                      variant="outlined"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col>
                    <v-autocomplete
                      v-model="form.materials[0]"
                      :items="materials"
                      item-title="label"
                      item-value="id"
                      label="Обозначение материала"
                      @update:model-value="handleMaterialSelect"
                      variant="outlined"
                    ></v-autocomplete>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col>
                    <div class="d-flex justify-space-between">
                      <div class="d-flex flex-column">
                        <span class="mb-2">Обложка *</span>
                        <v-img v-if="coverPreview" :src="coverPreview"></v-img>
                        <v-btn
                          color="primary"
                          variant="outlined"
                          @click="handleUpload"
                          :error="coverError"
                        >
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
                        <v-btn
                          color="primary"
                          variant="outlined"
                          @click="handleEpub"
                          :error="epubError"
                        >
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
                          <div class="text-caption">
                            {{ (epubFile.size / (1024 * 1024)).toFixed(2) }} MB
                          </div>
                        </div>
                      </div>
                    </div>
                  </v-col>
                  <v-col>
                    <div class="d-flex flex-column">
                      <div class="d-flex align-items-center gap-4">
                        <span class="mb-2 mr-2">Жанр</span>
                        <div v-if="selectedGenres.length" class="d-flex flex-wrap gap-2 mb-2">
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
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col class="text-center">
        <v-btn color="primary" variant="flat" @click="sendBookData">
          {{ t('save') }}
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.error-text {
  color: rgb(var(--v-theme-error)) !important;
}

.author-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 100;
  max-height: 300px;
  overflow-y: auto;
}

.v-list-item {
  cursor: pointer;
}

.v-list-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
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
</style>
