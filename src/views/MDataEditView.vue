<script lang="ts" setup>
import { ref, type Ref } from 'vue'
import { useAPI } from '@/api'
import HelpButton from '@/components/HelpButton.vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const api = useAPI()

interface Form {
  author_id: number[] | null
  author_id_main: number[] | null
  bbk_id: number | null
  udk_id: number | null
  category_id: number | null
  annotation: string
  genre_id: number[] | null
  ISBN: string
  language_id: number[] | null
  pages: number | null
  publisher_id: number | null
  quotes: string
  title: string
  title2: string
  city_id: number
  type_id: number | null
  year: number | null
  book_classroom: number | null
  book_classroom_language_id: number | null
  country_id: number | null
  amount: number | null
  copyright_sign_id: number | null
  content_type_id: number | null
  age_characteristic_id: number | null
  binding_id: number | null
  education_level_id: number | null
  reprint_book_id: number[] | null
  reprint_publisher_id: number[] | null
  titles: { language_id: number; title: string }[]
  tags: number[] | null
  part: number | null
  volume: number | null
  materials: number[] | null
  link: { URL: string; title: string }
  subject_heading_id: number | null
}

interface BookAdmission {
  amount: number
  book_id: number
  book_state_id: number | null
  price: number
  admission_at: string
  contractor_id: number | null
  book_admission_id: number | null
}

interface Author {
  id: number
  name: string
}

interface Publisher {
  id: number
  title: string
}

interface Material {
  id: number
  label: string
}

interface Contractor {
  address: string
  company_ID: string
  id: number
  system: boolean
  title: string
}

const valid: Ref<boolean> = ref(false)
const showAdditionalData: Ref<boolean> = ref(false)
const showFundData: Ref<boolean> = ref(false)
const authors: Ref<Author[]> = ref([])
const publishers: Ref<Publisher[]> = ref([])
const cities: Ref<Publisher[]> = ref([])
const types: Ref<Publisher[]> = ref([])
const languages: Ref<Publisher[]> = ref([])
const additionalAuthors: Ref<boolean> = ref(false)
const contractors: Ref<Contractor[]> = ref([])
const states: Ref<Publisher[]> = ref([])
const admissions: Ref<Publisher[]> = ref([])
const materials: Ref<Material[]> = ref([])
const subjectHeading: Ref<Author[]> = ref([])
const ageCharacteristics: Ref<Author[]> = ref([])
const bindings: Ref<Publisher[]> = ref([])
const genres: Ref<Publisher[]> = ref([])
const contentTypes: Ref<Publisher[]> = ref([])
const parts = [
  {
    id: 1,
    title: 'Часть'
  },
  {
    id: 1,
    title: 'Том'
  }
]
const form: Ref<Form> = ref({
  author_id: [],
  author_id_main: [],
  bbk_id: null,
  udk_id: null,
  category_id: null,
  annotation: '',
  genre_id: [],
  city_id: null,
  ISBN: '',
  language_id: [],
  pages: null,
  publisher_id: null,
  quotes: '',
  title: '',
  title2: '',
  type_id: null,
  year: null,
  book_classroom: null,
  book_classroom_language_id: null,
  country_id: null,
  amount: null,
  copyright_sign_id: null,
  content_type_id: null,
  age_characteristic_id: null,
  binding_id: null,
  education_level_id: null,
  reprint_book_id: [],
  reprint_publisher_id: [],
  titles: [],
  tags: [],
  part: null,
  volume: null,
  materials: [],
  link: { URL: '', title: '' },
  subject_heading_id: null
})
const admission: Ref<BookAdmission> = ref({
  amount: 0,
  book_id: 0,
  book_state_id: null,
  price: 0,
  admission_at: '',
  contractor_id: null,
  book_admission_id: null
})
const language: Ref<number> = ref(1)
const newItem: Ref<{
  name: string
  title: string
  active: boolean
  label: string
  itemType: 'author' | 'publisher' | 'genre' | 'subjectHeading' | 'contractor' | null
  companyId?: string
  address?: string
}> = ref({
  name: '',
  active: false,
  title: '',
  label: '',
  itemType: null
})

async function getAuthors(search = null) {
  try {
    let request = `/v1/author`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: Author[] } }>(request)
    if (response.data) authors.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function addNewItem(
  itemType: 'author' | 'publisher' | 'genre' | 'subjectHeading' | 'contractor',
  isActive: Ref<boolean>
) {
  const requestBody: { name?: string; title?: string; company_ID?: string; address?: string } = {}
  if (itemType === 'subjectHeading' || itemType === 'author') {
    requestBody.name = newItem.value.name
  } else if (itemType === 'contractor') {
    requestBody.title = newItem.value.name
    requestBody.company_ID = newItem.value.companyId
    requestBody.address = newItem.value.address
  } else {
    requestBody.title = newItem.value.name
  }

  isActive.value = false
}

async function getPublishers(search = null) {
  try {
    let request = `/v1/publisher`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: Publisher[] } }>(request)
    if (response.data) publishers.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getCities(search = null) {
  try {
    let request = `/v1/city`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: Publisher[] } }>(request)
    if (response.data) cities.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getTypes(search = null) {
  try {
    let request = `/v1/type`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: Publisher[] } }>(request)
    if (response.data) types.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getLanguages(search = null) {
  try {
    let request = `/v1/language`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: Publisher[] } }>(request)
    if (response.data) languages.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getContractors(search = null) {
  try {
    let request = `/v1/contractor`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: Contractor[] } }>(request)
    if (response.data) contractors.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getStates(search = null) {
  try {
    let request = `/v1/book/state`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: Publisher[] } }>(request)
    if (response.data) states.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getAdmissions(search = null) {
  try {
    let request = `/v1/book/admission`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: Publisher[] } }>(request)
    if (response.data) admissions.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getMaterials(search = null) {
  try {
    let request = `/v1/material`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: Material[] } }>(request)
    if (response.data) materials.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getSubjectHeadings(search = null) {
  try {
    let request = `/v1/subject/heading`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: Author[] } }>(request)
    if (response.data) subjectHeading.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getAgeCharacteristics(search = null) {
  try {
    let request = `/v1/age/characteristic`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: Author[] } }>(request)
    if (response.data) ageCharacteristics.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getBindings(search = null) {
  try {
    let request = `/v1/binding`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: Publisher[] } }>(request)
    if (response.data) bindings.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getGenres(search = null) {
  try {
    let request = `/v1/genre`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: Publisher[] } }>(request)
    if (response.data) genres.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getContentTypes(search = null) {
  try {
    let request = `/v1/content/type`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: Publisher[] } }>(request)
    if (response.data) contentTypes.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

function removeNullOrEmptyFields(obj: any): any {
  const newObj: any = {}
  for (const key in obj) {
    const value = obj[key]
    if (
      value !== null &&
      value !== undefined &&
      !(Array.isArray(value) && value.length === 0) &&
      !(typeof value === 'string' && value.trim() === '')
    ) {
      newObj[key] = value
    }
  }
  return newObj
}

function formatDate(dateToFormat: string) {
  const date = new Date(dateToFormat)
  const day = date.getDate().toString().length > 1 ? date.getDate() : '0' + date.getDate()
  const month =
    (date.getMonth() + 1).toString().length > 1 ? date.getMonth() + 1 : '0' + date.getMonth()
  return `${day}.${month}.${date.getFullYear()}`
}

function setNewItem(itemType: 'author' | 'publisher' | 'genre' | 'subjectHeading' | 'contractor') {
  if (itemType === 'author') {
    newItem.value.title = 'Добавление автора'
    newItem.value.label = 'Имя автора'
  } else if (itemType === 'publisher') {
    newItem.value.title = 'Добавление издателя'
    newItem.value.label = 'Название издателя'
  } else if (itemType === 'genre') {
    newItem.value.title = 'Добавление жанра'
    newItem.value.label = 'Название жанра'
  } else if (itemType === 'subjectHeading') {
    newItem.value.title = 'Добавление предметной рубрики'
    newItem.value.label = 'Название предметной рубрики'
  } else if (itemType === 'contractor') {
    newItem.value.title = 'Добавление контрагента'
    newItem.value.label = 'Название контрагента'
  }

  newItem.value.name = ''
  newItem.value.itemType = itemType
  newItem.value.active = true
}

async function sendBookData() {
  const body = removeNullOrEmptyFields(form.value)
  body.author_id_main = [body.author_id_main]
  body.materials = [body.materials]
  try {
    const response = await api.putData<Form, { id: number }>(`/v1/book/${route.params.id}`, body)
    if (response.data && showFundData.value) {
      const id = response.data.id
      const admissionForm = { ...admission.value }
      admissionForm.book_id = id
      admissionForm.admission_at = formatDate(admission.value.admission_at)
      await api.postData<{ books: BookAdmission[] }, {}>('/v1/book/school/link', {
        books: [admissionForm]
      })
    }
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

const route = useRoute()

const getItem = async () => {
  const response = await api.fetchData(`/v1/book/${route.params.id}`)
  if (response.data) {
    form.value = response.data
  }
}

getAuthors()
getPublishers()
getCities()
getTypes()
getLanguages()
getContractors()
getStates()
getAdmissions()
getMaterials()
getSubjectHeadings()
getAgeCharacteristics()
getGenres()
getBindings()
getContentTypes()
getItem()
</script>

<template>
  <v-container fluid>
    <v-app-bar>
      <template v-slot:title>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">M-DATA</span>
          <span class="text-subtitle-2 text-medium-emphasis"
            >{{t('database_by_rk')}}</span
          >
        </div>
      </template>

      <template v-slot:append>
        <!-- <help-button class="mr-3" /> -->
        <v-btn color="primary" prepend-icon="mdi-plus" to="/m-data/add" variant="flat"
          >{{t('add')}}
        </v-btn>
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
          <v-card-title> Основные данные</v-card-title>

          <v-card-subtitle> 1/2</v-card-subtitle>

          <v-card-text>
            <v-form v-model="valid">
              <v-container fluid>
                <v-row>
                  <v-col>
                    <v-text-field
                      v-model="form.title"
                      :label="t('name')"
                      placeholder="Напишите название"
                      required
                      variant="outlined"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col>
                    <v-text-field
                      v-model="form.title2"
                      label="Доп заголовок"
                      placeholder="Напишите название"
                      variant="outlined"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-row v-for="item in form.titles" :key="item.title">
                  <v-col cols="8">
                    <v-text-field
                      v-model="item.title"
                      label="Другое название"
                      placeholder="Напишите название"
                      variant="outlined"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4">
                    <v-select
                      v-model="item.language_id"
                      :items="languages"
                      item-value="id"
                      :label="t('language')"
                      variant="outlined"
                    ></v-select>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="item.title2"
                      label="Доп заголовок"
                      variant="outlined"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col>
                    <v-btn
                      color="primary"
                      prepend-icon="mdi-plus"
                      variant="outlined"
                      @click="form.titles.push({ title: '', language_id: language++ })"
                      >Другое название
                    </v-btn>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col>
                    <v-textarea
                      v-model="form.annotation"
                      label="Аннотация"
                      placeholder="Напишите более 15 слов"
                      variant="outlined"
                    ></v-textarea>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col>
                    <v-text-field
                      v-model="form.pages"
                      label="Страницы"
                      placeholder="Укажите"
                      type="number"
                      variant="outlined"
                    ></v-text-field>
                  </v-col>

                  <v-col>
                    <v-text-field
                      v-model="form.year"
                      :label="t('year_of_publication')"
                      placeholder="Укажите"
                      prepend-inner-icon="mdi-magnify"
                      type="number"
                      variant="outlined"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="8" offset="2">
        <v-card>
          <v-card-title> Основные данные</v-card-title>

          <v-card-subtitle> 2/2</v-card-subtitle>

          <v-card-text>
            <v-container fluid>
              <v-row>
                <v-col>
                  <v-autocomplete
                    v-model="form.author_id_main"
                    :items="authors"
                    item-title="name"
                    item-value="id"
                    label="Основной автор"
                    placeholder="Укажите автора"
                    variant="outlined"
                    @update:search="getAuthors"
                  >
                    <template v-slot:no-data>
                      <div class="px-4 d-flex justify-space-between align-center">
                        <span>Данного автора нет в списке</span>
                        <v-btn color="primary" variant="flat" @click="setNewItem('author')"
                          >{{t('add')}}
                        </v-btn>
                      </div>
                    </template>
                  </v-autocomplete>
                </v-col>
              </v-row>

              <v-row v-if="additionalAuthors">
                <v-col>
                  <v-autocomplete
                    v-model="form.author_id"
                    :items="authors"
                    item-title="name"
                    item-value="id"
                    label="Другие авторы"
                    multiple
                    placeholder="Укажите автора"
                    variant="outlined"
                    @update:search="getAuthors"
                  >
                    <template v-slot:no-data>
                      <div class="px-4 d-flex justify-space-between align-center">
                        <span>Данного автора нет в списке</span>
                        <v-btn color="primary" variant="flat" @click="setNewItem('author')"
                          >{{t('add')}}
                        </v-btn>
                      </div>
                    </template>
                  </v-autocomplete>
                </v-col>
              </v-row>

              <v-row v-if="!additionalAuthors">
                <v-col>
                  <v-btn
                    color="primary"
                    prepend-icon="mdi-plus"
                    variant="outlined"
                    @click="additionalAuthors = true"
                  >
                    Добавить других авторов
                  </v-btn>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-text-field
                    label="Квалификация"
                    placeholder="Поиск"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-text-field
                    v-model="form.ISBN"
                    label="ISBN"
                    placeholder="Укажите ISBN"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="3">
                  <strong> Раздел произведения: </strong>
                </v-col>
                <v-col>
                  <v-select
                    v-model="form.part"
                    :items="parts"
                    item-value="id"
                    label="Произведение"
                    placeholder="Укажите произведение"
                    variant="outlined"
                  ></v-select>
                </v-col>
                <v-col>
                  <v-select
                    v-model="form.volume"
                    :items="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]"
                    label="Цифра"
                    placeholder="Выберите цифру"
                    variant="outlined"
                  ></v-select>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-btn color="primary" prepend-icon="mdi-plus" variant="outlined">
                    ISBN дополнительный
                  </v-btn>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-autocomplete
                    v-model="form.publisher_id"
                    :items="publishers"
                    item-value="id"
                    :label="t('publisher')"
                    placeholder="Укажите издателя"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    @update:search="getPublishers"
                  >
                    <template v-slot:no-data>
                      <div class="px-4 d-flex justify-space-between align-center">
                        <span>Данного издателя нет в списке</span>
                        <v-btn color="primary" variant="flat" @click="setNewItem('publisher')"
                          >{{t('add')}}
                        </v-btn>
                      </div>
                    </template>
                  </v-autocomplete>
                </v-col>
                <v-col>
                  <v-autocomplete
                    v-model="form.city_id"
                    :items="cities"
                    item-value="id"
                    label="Город"
                    placeholder="Поиск"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    @update:search="getCities"
                  ></v-autocomplete>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-text-field
                    v-model="form.amount"
                    label="Тираж"
                    placeholder="Поиск"
                    type="number"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
                <v-col>
                  <v-autocomplete
                    v-model="form.type_id"
                    :items="types"
                    item-value="id"
                    :label="t('type')"
                    placeholder="Поиск"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                  ></v-autocomplete>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-autocomplete
                    v-model="form.language_id"
                    :items="languages"
                    item-value="id"
                    :label="t('language')"
                    multiple
                    placeholder="Поиск"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                  ></v-autocomplete>
                </v-col>
                <v-col>
                  <v-autocomplete
                    v-model="form.materials"
                    :items="materials"
                    chips
                    item-title="label"
                    item-value="id"
                    label="Обозначение материала"
                    placeholder="Поиск"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                  ></v-autocomplete>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="showAdditionalData">
      <v-col cols="8" offset="2">
        <v-card>
          <v-card-title>Дополнительные данные</v-card-title>

          <v-card-text>
            <v-container fluid>
              <v-row>
                <v-col>
                  <v-autocomplete
                    v-model="form.subject_heading_id"
                    :items="subjectHeading"
                    item-title="name"
                    item-value="id"
                    label="Предметная рубрика"
                    placeholder="Поиск"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                  >
                    <template v-slot:no-data>
                      <div class="px-4 d-flex justify-space-between align-center">
                        <span>Данной рубрики нет в списке</span>
                        <v-btn color="primary" variant="flat" @click="setNewItem('subjectHeading')"
                          >{{t('add')}}
                        </v-btn>
                      </div>
                    </template>
                  </v-autocomplete>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-text-field
                    label="Ключевые слова"
                    placeholder="Поиск"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <div class="d-flex">
                    <div class="d-flex flex-column">
                      <span class="mb-2">ББК</span>
                      <v-btn color="primary" variant="outlined">Выбрать ББК</v-btn>
                    </div>
                    <div class="d-flex flex-column ml-4">
                      <span class="mb-2">УДК</span>
                      <v-btn color="primary" variant="outlined">Выбрать УДК</v-btn>
                    </div>
                  </div>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-text-field
                    label="Авторский знак"
                    placeholder="Поиск"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-autocomplete
                    v-model="form.content_type_id"
                    :items="contentTypes"
                    item-value="id"
                    label="Виды содержания"
                    placeholder="Поиск"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                  ></v-autocomplete>
                </v-col>
                <v-col>
                  <v-autocomplete
                    v-model="form.age_characteristic_id"
                    :items="ageCharacteristics"
                    item-value="id"
                    label="Возрастная характеристика"
                    placeholder="Поиск"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                  ></v-autocomplete>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-autocomplete
                    v-model="form.binding_id"
                    :items="bindings"
                    item-value="id"
                    label="Переплет"
                    placeholder="Поиск"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                  ></v-autocomplete>
                </v-col>
                <v-col>
                  <v-autocomplete
                    v-model="form.genre_id"
                    :items="genres"
                    item-value="id"
                    label="Жанры"
                    multiple
                    placeholder="Поиск"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                  >
                    <template v-slot:no-data>
                      <div class="px-4 d-flex justify-space-between align-center">
                        <span>Данного жанра нет в списке</span>
                        <v-btn color="primary" variant="flat" @click="setNewItem('genre')"
                          >{{t('add')}}
                        </v-btn>
                      </div>
                    </template>
                  </v-autocomplete>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-switch
                    color="primary"
                    label="Укажите для какого класса , если это учебник"
                  ></v-switch>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-text-field
                    label="Класс"
                    placeholder="Укажите класс"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
                <v-col>
                  <v-text-field
                    label="Страна"
                    placeholder="Поиск"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <div class="d-flex">
                    <div class="d-flex flex-column">
                      <span class="mb-2">Обложка</span>
                      <v-btn color="primary" variant="outlined">Выбрать файл</v-btn>
                    </div>
                    <div class="d-flex flex-column ml-4">
                      <span class="mb-2">EPUB</span>
                      <v-btn color="primary" variant="outlined">Выбрать файл</v-btn>
                    </div>
                  </div>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-text-field
                    v-model="form.link.title"
                    label="Ссылка"
                    :placeholder="t('name')"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
                <v-col>
                  <v-text-field
                    v-model="form.link.URL"
                    placeholder="URL"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col class="text-center">
        <v-btn
          v-if="!showAdditionalData"
          class="mr-2"
          color="primary"
          prepend-icon="mdi-plus"
          variant="flat"
          @click="showAdditionalData = true"
          >Добавить дополнительные параметры
        </v-btn>

        <v-btn color="green" prepend-icon="mdi-plus" variant="flat" @click="sendBookData"
          >Добавить запись
        </v-btn>
      </v-col>
    </v-row>

    <v-dialog v-model="newItem.active" max-width="500">
      <template v-slot:default="{ isActive }">
        <v-card :title="newItem.title">
          <v-card-text>
            <v-form>
              <v-text-field
                v-model="newItem.name"
                :label="newItem.label"
                variant="outlined"
              ></v-text-field>
              <v-text-field
                v-if="newItem.itemType === 'contractor'"
                v-model="newItem.companyId"
                label="БИН"
                variant="outlined"
              ></v-text-field>
              <v-text-field
                v-if="newItem.itemType === 'contractor'"
                v-model="newItem.address"
                :label="t('address')"
                variant="outlined"
              ></v-text-field>
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-btn variant="outlined" @click="isActive.value = false">Отмена</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="primary" variant="flat" @click="addNewItem(newItem.itemType, isActive)"
              >{{t('add')}}
            </v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>

    <v-row></v-row>
  </v-container>
</template>
