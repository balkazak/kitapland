<script lang="ts" setup>
import { useAPI } from '@/api'
import { ref, type Ref, watch, computed, onMounted } from 'vue'
import nocover from '@/assets/no-book-cover.svg'
import HelpButton from '@/components/HelpButton.vue'
import { useAuth } from '@/auth'
import { useI18n } from 'vue-i18n'
import { useToastStore } from '@/stores/toast'
import { useRouter } from 'vue-router'
import { useBookStore } from '@/stores/book'
import { useRoute } from 'vue-router'

const { t, locale } = useI18n()
const route = useRoute()
const api = useAPI()
const toast = useToastStore()
const router = useRouter()
const bookStore = useBookStore()

const helpVideoLink = computed(() => {
  return locale.value === 'kk'
    ? 'kLxuL47hxVk'
    : 'o1uPrDh8o5g'
})

interface Book {
  id: number
  volume: number
  part: number
  amount: number
  city_id: number | null
  title: string
  title2: string | null
  ISBN: string
  ISBN2: string | null
  year: number
  pages: number
  quotes: string[] | null
  annotation: string
  book_school: any
  book_author: { id: number; name: string }[]
  book_author_main: { id: number; name: string }[]
  book_category: any[]
  book_cover: any
  book_epub: any
  book_genre: any[]
  book_language: { id: number; title: string }[]
  book_publisher: { id: number; title: string }[]
  book_bbk: any[]
  book_classroom: any
  book_classroom_language: any
  book_type: { id: number; title: string }[]
  book_udk: any[]
  book_copyright_sign: any[]
  book_age_characteristic: any[]
  book_education_level: any[]
  book_country: any[]
  distribution?: string
  copyright_holder?: string
  creator_name?: string
  creation_date?: string
  marker_id?: string
  type_description_id?: string
  book_specials?: {
    sizes?: string
    material_info?: string
    additional_info?: string
  }
  book_areas?: {
    heading_id?: number
    additional_heading_id?: number
    additional_info?: string
    responsibility_info?: string
    first_info?: string
    next_info?: string
    ISSN?: string
    number?: string
  }
  book_addresses?: {
    country_id?: number
    city_id?: number
    postal_index?: string
    number?: string
    company_name?: string
    street_name?: string
  }
  content_type_id?: number
  binding_id?: number
  materials?: any[]
  book_quote?: any[]
  books_in_fund?: number
  book_log?: any[]
}

interface Contractor {
  address: string
  company_ID: string
  id: number
  system: boolean
  title: string
}

interface Publisher {
  id: number
  title: string
}

interface CopyrightSign {
  id: number
  number: string
  title: string
}

interface BookAdmission {
  amount: number
  book_id: number
  book_state_id: number | null
  price: number
  admission_at: string | null
  contractor_id: number | null
  book_admission_id: number | null
}

interface Author {
  id: number
  name: string
}

const languageId: Ref<number | null> = ref(null),
  authorId: Ref<number | null> = ref(null),
  publisherId: Ref<number | null> = ref(null),
  year: Ref<number | null> = ref(null),
  search: Ref<string | null> = ref(null),
  epub: Ref<boolean | null> = ref(null),
  genreId: Ref<number | null> = ref(null),
  ageCharacteristicId: Ref<number | null> = ref(null),
  countryId: Ref<number | null> = ref(null),
  copyrightSignId: Ref<number | null> = ref(null),
  bookClassroom: Ref<number | null> = ref(null),
  loading: Ref<boolean> = ref(false),
  items: Ref<Book[] | null> = ref(null),
  totalItems: Ref<number> = ref(0),
  itemsPerPage: Ref<number> = ref(10),
  page: Ref<number> = ref(1),
  length: Ref<number> = ref(0),
  message: Ref<string> = ref(''),
  contractors: Ref<Contractor[]> = ref([]),
  states: Ref<Publisher[]> = ref([]),
  admissions: Ref<Publisher[]> = ref([]),
  languages: Ref<Publisher[]> = ref([]),
  authors: Ref<Author[]> = ref([]),
  publishers: Ref<Publisher[]> = ref([]),
  selectedType: Ref<{ id: number; title: string }> = ref({ id: 0, title: t('book_type') }),
  types: Ref<Publisher[]> = ref([]),
  genres: Ref<Publisher[]> = ref([]),
  ageCharacteristics: Ref<Author[]> = ref([]),
  countries: Ref<Publisher[]> = ref([]),
  copyrightSigns: Ref<CopyrightSign[]> = ref([]),
  admission: Ref<BookAdmission> = ref({
    amount: 0,
    book_id: 0,
    book_state_id: null,
    price: 0,
    admission_at: null,
    contractor_id: null,
    book_admission_id: null
  }),
  pageInput: Ref<number> = ref(1),
  tab: Ref<string> = ref('one'),
  selectedItem: Ref<Book> = ref({
    id: 0,
    volume: 0,
    part: 0,
    amount: 0,
    city_id: null,
    title: '',
    title2: null,
    ISBN: '',
    ISBN2: null,
    year: 0,
    pages: 0,
    quotes: null,
    annotation: '',
    book_school: null,
    book_author: [],
    book_author_main: [],
    book_category: [],
    book_cover: null,
    book_epub: null,
    book_genre: [],
    book_language: [],
    book_publisher: [],
    book_bbk: [],
    book_classroom: null,
    book_classroom_language: null,
    book_type: [],
    book_udk: [],
    book_copyright_sign: [],
    book_age_characteristic: [],
    book_education_level: [],
    book_country: [],
    book_log: []
  })

const auth = useAuth()
const booksTotal = ref(0)

function goToPage() {
  const pageNum = Number(pageInput.value)
  if (pageNum >= 1 && pageNum <= length.value) {
    page.value = pageNum
  } else {
    pageInput.value = page.value // Reset to current page if invalid
  }
}

async function getBooks() {
  loading.value = true
  try {
    let requestString = `/v1/book?page=${page.value}`
    if (search.value) {
      requestString += `&title=${search.value}`
    }
    if (selectedType.value.id != 0) {
      requestString += `&type_id=${selectedType.value.id}`
    }
    if (languageId.value) {
      requestString += `&language_id=${languageId.value}`
    }
    if (authorId.value) {
      requestString += `&author_id=${authorId.value}`
    }
    if (publisherId.value) {
      requestString += `&publisher_id=${publisherId.value}`
    }
    if (year.value) {
      requestString += `&year=${year.value}`
    }
    if (epub.value) {
      requestString += `&epub=1`
    } else {
      requestString += `&epub=0`
    }
    if (genreId.value) {
      requestString += `&genre_id=${genreId.value}`
    }
    if (ageCharacteristicId.value) {
      requestString += `&age_characteristic_id=${ageCharacteristicId.value}`
    }
    if (countryId.value) {
      requestString += `&country_id=${countryId.value}`
    }
    if (copyrightSignId.value) {
      requestString += `&copyright_sign_id=${copyrightSignId.value}`
    }
    if (bookClassroom.value) {
      requestString += `&book_classroom=${bookClassroom.value}`
    }
    if (local.value) {
      requestString += '&local=1'
    }
    if (sorting.value) {
      requestString += `&sort=${sorting.value}`
    }

    const response = await api.fetchData<{
      data: { items: Book[] }
      meta: { last_page: number; total: number }
    }>(requestString)

    if (response.data) {
      items.value = response.data.data.items
      totalItems.value = response.data.meta.total
      length.value = response.data.meta.last_page
    }
  } catch (error: any) {
    let errorMessage = error?.message || 'Ошибка при загрузке книг'
    toast.error(errorMessage)
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

const downloadEPUB = (epub: { id: number; book_id: number; value: string }) => {
  const link = document.createElement('a')
  link.href = `${import.meta.env.VITE_APP_API}/storage/epub/${epub.value}`
  link.click()
  document.body.removeChild(link)
}

function resetFilters() {
  search.value = null
  selectedType.value = { id: 0, title: t('book_type') }
  languageId.value = null
  authorId.value = null
  publisherId.value = null
  year.value = null
  epub.value = null
  genreId.value = null
  ageCharacteristicId.value = null
  copyrightSignId.value = null
  countryId.value = null
  bookClassroom.value = null
  getBooks()
}

async function sendRequest(
  bookId: number,
  formMessage: string,
  type: number,
  isActive: Ref<boolean>
) {
  const form = { book_id: bookId, message: formMessage, type: type }
  try {
    await api.postData('/v1/user/request', form)
    isActive.value = false
    message.value = ''
    toast.success('Запрос успешно отправлен')
  } catch (error: any) {
    let errorMessage = 'Ошибка при отправке запроса'
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }
    toast.error(errorMessage)
    console.error('Error:', error.message)
  }
}

async function sendAdmission(admissionForm: BookAdmission, isActive: Ref<boolean>, id: number) {
  const form = { ...admissionForm }
  form.admission_at = admissionDate.value
  form.book_id = id
  try {
    await api.postData('/v1/book/school/link', { books: [form] })
    isActive.value = false
    toast.success('Книга успешно добавлена в фонд')
    admission.value = {
      amount: 0,
      book_id: 0,
      book_state_id: null,
      price: 0,
      admission_at: '',
      contractor_id: null,
      book_admission_id: null
    }
  } catch (error: any) {
    let errorMessage = 'Ошибка при добавлении книги в фонд'
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }
    toast.error(errorMessage)
    console.error('Error:', error)
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

function initiateQuote(item: any) {
  selectedItem.value = item
}

async function createQuote(isActive: Ref<boolean>) {
  try {
    newQuote.value.book_id = selectedItem.value.id
    await api.postData('/v1/quotes', newQuote.value)
    isActive.value = false
    newQuote.value = {
      name: '',
      content: '',
      page: '',
      note: '',
      book_id: 0
    }
  } catch (e: unknown) {
    console.error((e as Error).message)
  }
}

const admissionDate = ref('')

const handleDate = () => {
  let value = admissionDate.value.replace(/\D/g, '')
  if (value.length >= 3) {
    value = value.slice(0, 2) + '.' + value.slice(2)
  }
  if (value.length >= 6) {
    value = value.slice(0, 5) + '.' + value.slice(5)
  }
  if (value.length >= 10) {
    value = value.slice(0, 10)
  }
  admissionDate.value = value
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

async function getCountries(search = null) {
  try {
    let request = `/v1/country`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: Publisher[] } }>(request)
    if (response.data) countries.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getCopyrightSigns(search = null) {
  try {
    let request = `/v1/copyright/sign`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: CopyrightSign[] } }>(request)
    if (response.data) copyrightSigns.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

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

async function addNewItem(
  itemType: 'author' | 'publisher' | 'genre' | 'subjectHeading' | 'contractor',
  isActive: Ref<boolean>
) {
  const request = itemType === 'subjectHeading' ? 'subject/heading' : itemType
  const requestBody: { name?: string; title?: string; company_ID?: string; address?: string } = {}

  if (itemType === 'subjectHeading' || itemType === 'author') {
    requestBody.name = newItem.value.name
  } else if (itemType === 'contractor') {
    requestBody.title = newItem.value.name
    if (newItem.value.companyId) requestBody.company_ID = newItem.value.companyId
    if (newItem.value.address) requestBody.address = newItem.value.address
  } else {
    requestBody.title = newItem.value.name
  }

  try {
    await api.postData(`/v1/${request}`, requestBody)
  } catch (error: any) {
    let errorMessage = error.response?.data?.message || 'Ошибка при добавлении записи'
    toast.error(errorMessage)
    console.error('Error:', error)
  }
  isActive.value = false
}

const sorting: Ref<string | null> = ref(null)
const local: Ref<boolean> = ref(false)

const deleteItem = async (id: number, isActive: Ref<boolean>) => {
  try {
    await api.deleteData(`/v1/book/${id}`)
    await getBooks()
    toast.success('Книга успешно удалена')
  } catch (error: any) {
    toast.error('Ошибка при удалении книги')
    console.error('Error:', error.message)
  }
  isActive.value = false
}

const getImageURL = (url: string) => {
  return import.meta.env.VITE_APP_API + '/storage/covers/' + url
}

const newQuote = ref({
  name: '',
  content: '',
  page: '',
  note: '',
  book_id: 0
})

function handleAddToFund(option: number, item: Book) {
  if (option === 2) {
    bookStore.setBookData({
      title: item.title,
      title2: item.title2,
      annotation: item.annotation,
      pages: item.pages,
      year: item.year,
      author_id_main: item.book_author_main?.[0]?.id,
      author_id: item.book_author?.map(a => a.id),
      publisher_id: item.book_publisher?.[0]?.id,
      language_id: item.book_language?.map(l => l.id),
      type_id: item.book_type?.[0]?.id,
      ISBN: item.ISBN,
      genre_id: item.book_genre?.map(g => g.id),
      country_id: item.book_country?.[0]?.id,
      copyright_sign_id: item.book_copyright_sign?.[0]?.id,
      age_characteristic_id: item.book_age_characteristic?.[0]?.id,
      book_classroom: item.book_classroom,
      city_id: item.city_id,
      parent_id: item.id
    })
    router.push('/fund/add')
  }
}

const addToFund = (item: Book) => {
  bookStore.setBookData({
    id: item.id,
    title: item.title,
    title2: item.title2 || '',
    ISBN: item.ISBN || '',
    ISBN2: item.ISBN2 || '',
    year: item.year || null,
    pages: item.pages || null,
    annotation: item.annotation || '',
    author_id:
      item.book_author?.map((author) => ({
        id: author.id,
        name: author.name
      })) || [],
    author_id_main: item.book_author_main?.[0]
      ? {
          id: item.book_author_main[0].id,
          name: item.book_author_main[0].name
        }
      : null,
    bbk_id: item.book_bbk?.[0]?.id || null,
    udk_id: item.book_udk?.[0]?.id || null,
    category_id: item.book_category?.[0]?.id || null,
    genre_id: item.book_genre?.map((genre) => genre.id) || [],
    city_id: item.city_id || null,
    language_id: item.book_language?.map((lang) => lang.id) || [],
    publisher_id: item.book_publisher?.[0]?.id || null,
    type_id: item.book_type?.[0]?.id || null,
    book_classroom: item.book_classroom || null,
    book_classroom_language_id: item.book_classroom_language?.id || null,
    country_id: item.book_country?.[0]?.id || null,
    copyright_sign: item.book_copyright_sign?.[0]?.id || null,
    content_type_id: item.content_type_id || null,
    age_characteristic_id: item.book_age_characteristic?.[0]?.id || null,
    binding_id: item.binding_id || null,
    education_level_id: item.book_education_level?.[0]?.id || null,
    part: item.part || null,
    volume: item.volume || null,
    materials: item.materials?.map((material) => material.id) || [],
    quotes: item.quotes || ''
  })

  router.push({ name: 'fundAdd' })
}

function addAdminBook() {
  router.push('/m-data/admin-add')
}

const filteredItems = computed(() => {
  return items.value || []
})

const openEpubModal = () => {
  router.push('/m-data/admin-add')
}

const canAddEpub = computed(() => {
  return auth.user.value?.roles.some((role) => role.id === 1 || role.id === 2 || role.id === 3)
})

function copyBiographicalRecord() {
  const mainAuthor = selectedItem.value.book_author_main?.[0]?.name || ''
  const bbkCode = selectedItem.value.book_bbk?.[0]?.title || ''
  const isbn = selectedItem.value.ISBN || ''
  const year = selectedItem.value.year || ''
  const pages = selectedItem.value.pages || ''
  const publisher = selectedItem.value.book_publisher?.[0]?.title || ''
  const country = selectedItem.value.book_country?.[0]?.title || ''

  const bioRecord = `${selectedItem.value.id} ${bbkCode} ${selectedItem.value.title} [Текст] / ${mainAuthor} // ${publisher ? publisher + ', ' : ''}${country ? country + ', ' : ''}${year}${pages ? ' - ' + pages + ' с.' : ''}${isbn ? ' - ISBN ' + isbn : ''}`

  navigator.clipboard
    .writeText(bioRecord)
    .then(() => {
      toast.success('Биографическая запись скопирована в буфер обмена')
    })
    .catch((err) => {
      toast.error('Не удалось скопировать запись')
    })
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const readingRoomSubscriptions = ref([])
const loanSubscriptions = ref([])

async function getSubscriptionLists(bookId) {
  try {
    const response = await api.fetchData(`/v1/book-detail/subscription-list/${bookId}`)
    if (response.data) {
      // Separate subscriptions into reading room and loan lists
      readingRoomSubscriptions.value = response.data.filter(item => item.type === 'reading_room')
      loanSubscriptions.value = response.data.filter(item => item.type === 'loan')
    }
  } catch (error) {
    console.error('Error fetching subscription lists:', error)
  }
}

const bookStatusData = ref({
  subscription: { items: { requests: 0, returns: 0 } },
  schoolBooks: [],
  schoolLogs: []
})

async function getBookStatusData(bookId) {
  try {
    const [subscriptionRes, schoolBooksRes, schoolLogsRes] = await Promise.all([
      api.fetchData(`/v1/book-detail/subscription/${bookId}`),
      api.fetchData(`/v1/book-detail/book-school/${bookId}`),
      api.fetchData(`/v1/book-detail/book-school-log/${bookId}`)
    ])

    bookStatusData.value = {
      subscription: subscriptionRes.data || { items: { requests: 0, returns: 0 } },
      schoolBooks: schoolBooksRes.data || [],
      schoolLogs: schoolLogsRes.data || []
    }
  } catch (error) {
    console.error('Error fetching book status:', error)
  }
}

// Update the watch to include the new data fetch
watch([tab, selectedItem], async ([newTab, newItem]) => {
  if (newItem?.id) {
    if (newTab === 'three') {
      await getBookStatusData(newItem.id)
    } else if (newTab === 'four' || newTab === 'five') {
      await getSubscriptionLists(newItem.id)
    }
  }
})

getBooks()
getAdmissions()
getContractors()
getStates()
getLanguages()
getAuthors()
getPublishers()
getTypes()
getGenres()
getAgeCharacteristics()
getCountries()
getCopyrightSigns()

watch([page, sorting, local], () => {
  pageInput.value = page.value
  getBooks()
})

onMounted(() => {
  getBooks()
})
</script>

<template>
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
          <v-btn
            color="primary"
            variant="flat"
            @click="
              addNewItem(
                newItem.itemType as
                  | 'author'
                  | 'genre'
                  | 'publisher'
                  | 'subjectHeading'
                  | 'contractor',
                isActive
              )
            "
            >{{ t('add') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>

  <v-container fluid>
    <v-app-bar>
      <template v-slot:title>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">M-DATA</span>
          <span class="text-subtitle-2 text-medium-emphasis">{{ t('database_by_rk') }}</span>
        </div>
      </template>

      <template v-slot:append>
        <v-divider class="mr-6" inset vertical></v-divider>
        <div class="mr-4">
          <div>
            <span class="font-weight-bold">{{ booksTotal }}</span>
          </div>
          <div>
            <small class="text-medium-emphasis">{{ t('book_titles') }}</small>
          </div>
        </div>

        <v-switch
          v-model="local"
          class="my-auto mr-3"
          color="primary"
          :label="t('show_added_books')"
        ></v-switch>
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn append-icon="mdi-chevron-down" class="mr-6" v-bind="props" variant="tonal"
              >{{ t('sorting') }}
            </v-btn>
          </template>

          <v-list>
            <v-list-item @click="sorting = 'a-z'">{{ t('sort_a_to_z') }}</v-list-item>
            <v-list-item @click="sorting = 'z-a'">{{ t('sort_z_to_a') }}</v-list-item>
            <v-list-item @click="sorting = 'new'">{{ t('sort_old_to_new') }}</v-list-item>
            <v-list-item @click="sorting = 'old'">{{ t('sort_new_to_old') }}</v-list-item>
          </v-list>
        </v-menu>
        <help-button :video-id="helpVideoLink" />
        <v-btn class="ml-3" color="primary" prepend-icon="mdi-plus" to="m-data/add" variant="flat"
          >{{ t('add') }}
        </v-btn>
      </template>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" location="right" temporary width="1000">
      <v-list-item>
        <div class="d-flex justify-space-between align-center">
          <span class="font-weight-bold">{{ t('detailed_information') }}</span>
          <v-btn icon="mdi-close" variant="text" @click="drawer = false"></v-btn>
        </div>
      </v-list-item>
      <v-divider></v-divider>
      <v-list-item>
        <v-tabs v-model="tab" color="primary" grow>
          <v-tab value="one">{{ t('about_book') }}</v-tab>
          <v-tab value="three">
            <v-icon start>mdi-database</v-icon>
            {{ t('fund_status_info') }}
          </v-tab>
          <v-tab value="four">
            <v-icon start>mdi-desk</v-icon>
            {{ t('in_reading_room') }}
          </v-tab>
          <v-tab value="five">
            <v-icon start>mdi-book-arrow-right</v-icon>
            {{ t('on_loan') }}
          </v-tab>
          <v-tab value="two">
            <v-icon start>mdi-format-quote-close</v-icon>
            {{ t('quotes') }}
          </v-tab>
        </v-tabs>

        <v-window v-model="tab">
          <!-- About Book Tab -->
          <v-window-item value="one">
            <v-container fluid>
              <v-row>
                <v-col cols="4">
                  <v-img :src="nocover" class="rounded" fluid></v-img>
                  <div class="mt-2">
                    {{ t('creator') }}:
                    {{ selectedItem?.book_log?.[0]?.school?.name || t('no_data_available') }}
                  </div>
                </v-col>
                <v-col cols="8">
                  <v-row>
                    <v-chip
                      v-for="item in selectedItem.book_type"
                      :key="item.id"
                      color="primary"
                      variant="flat"
                    >
                      {{ item.title }}
                      <span v-if="item.id === 1 && item.book_classroom">
                        {{ item.book_classroom.classroom }}
                      </span>
                    </v-chip>
                    <v-chip class="ml-2" variant="tonal" v-if="selectedItem.part">
                      {{ selectedItem.part === 1 ? 'Часть' : 'Том' }} : {{ selectedItem?.volume }}
                    </v-chip>
                  </v-row>
                  <v-row class="mt-4">
                    <div class="font-weight-bold">{{ selectedItem.title }}</div>
                  </v-row>
                  <v-row>
                    <div class="text-medium-emphasis">{{ selectedItem.title2 }}</div>
                  </v-row>
                  <v-row class="mt-4">
                    <div>
                      <template
                        v-for="(author, index) in selectedItem.book_author_main"
                        :key="author.id"
                      >
                        <v-chip color="primary" variant="outlined">
                          {{ author.name }}
                        </v-chip>
                      </template>
                    </div>
                    <div class="mt-2">
                      <template
                        v-for="(author, index) in selectedItem.book_author"
                        :key="author.id"
                      >
                        <v-chip color="grey" variant="outlined" class="mr-1">
                          {{ author.name }}
                        </v-chip>
                      </template>
                    </div>
                  </v-row>
                  <v-row class="mt-4">
                    <div>{{ selectedItem.annotation }}</div>
                  </v-row>
                  <v-row class="mt-6">
                    <v-card class="w-100" variant="tonal">
                      <v-card-text>
                        <v-container fluid>
                          <v-row>
                            <v-col>
                              <div>
                                <strong>{{ t('publisher') }}:</strong>
                              </div>
                              <div>
                                {{
                                  selectedItem.book_publisher
                                    ? selectedItem.book_publisher.map((obj) => obj.title).join(', ')
                                    : ''
                                }}
                              </div>
                            </v-col>
                            <v-col>
                              <div>
                                <strong>{{ t('year_of_publication') }}:</strong>
                              </div>
                              <div>{{ selectedItem.year }}</div>
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col>
                              <div><strong>УДК:</strong></div>
                              <div>
                                {{
                                  selectedItem.book_udk
                                    ? selectedItem.book_udk.map((obj) => obj.number + ' ' + obj.title).join(', ')
                                    : ''
                                }}
                              </div>
                            </v-col>
                            <v-col>
                              <div>
                                <strong>{{ t('language') }}:</strong>
                              </div>
                              <div>
                                {{
                                  selectedItem.book_language
                                    ? selectedItem.book_language.map((obj) => obj.title).join(', ')
                                    : ''
                                }}
                              </div>
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col>
                              <div><strong>ББК:</strong></div>
                              <div>
                                {{
                                  selectedItem.book_bbk
                                    ? selectedItem.book_bbk.map((obj) => obj.number + ' ' + obj.title).join(', ')
                                    : ''
                                }}
                              </div>
                            </v-col>
                            <v-col>
                              <div><strong>Жанр:</strong></div>
                              <div>
                                {{
                                  selectedItem.book_genre
                                    ? selectedItem.book_genre.map((obj) => obj.title).join(', ')
                                    : ''
                                }}
                              </div>
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col>
                              <div><strong>Страницы:</strong></div>

                              <div>
                                {{ selectedItem.pages }}
                              </div>
                            </v-col>

                            <v-col>
                              <div><strong>Год издания:</strong></div>

                              <div>
                                {{ selectedItem.year }}
                              </div>
                            </v-col>
                          </v-row>

                          <v-row>
                            <v-col>
                              <div><strong>ISBN:</strong></div>

                              <div>{{ selectedItem.ISBN }}</div>
                            </v-col>
                          </v-row>
                        </v-container>
                      </v-card-text>
                    </v-card>
                  </v-row>
                </v-col>
              </v-row>
              <v-row class="my-4">
                <v-col cols="4">
                  <div class="font-weight-bold">Ключевые слова:</div>
                </v-col>
                <v-col cols="8">
                  <v-chip v-for="item in selectedItem.quotes" :key="item" color="primary">
                    {{ item }}
                  </v-chip>
                </v-col>
              </v-row>
              <v-row class="my-4">
                <v-col cols="4">
                  <div class="font-weight-bold">Биографическая запись:</div>
                </v-col>
                <v-col cols="8">
                  <v-card variant="outlined" class="pa-2">
                    <div class="d-flex align-center">
                      <span class="text-body-2">
                        {{ selectedItem.id }}
                        {{ selectedItem.book_bbk?.[0]?.title || '' }}
                        {{ selectedItem.title }}
                        [Текст] /
                        {{ selectedItem.book_author_main?.[0]?.name || '' }} //
                        {{
                          selectedItem.book_publisher?.[0]?.title
                            ? selectedItem.book_publisher[0].title + ', '
                            : ''
                        }}
                        {{
                          selectedItem.book_country?.[0]?.title
                            ? selectedItem.book_country[0].title + ', '
                            : ''
                        }}
                        {{ selectedItem.year }}
                        {{ selectedItem.pages ? ' - ' + selectedItem.pages + ' с.' : '' }}
                        {{ selectedItem.ISBN ? ' - ISBN ' + selectedItem.ISBN : '' }}
                      </span>
                      <v-btn
                        icon="mdi-content-copy"
                        size="small"
                        density="compact"
                        variant="text"
                        class="ml-2"
                        @click="copyBiographicalRecord"
                      ></v-btn>
                    </div>
                  </v-card>

                  <v-card variant="tonal" class="mt-3 pa-3 bg-grey-lighten-3">
                    <v-row>
                      <v-col cols="6" v-if="selectedItem.book_addresses?.city_id">
                        <div><strong>Город:</strong></div>
                        <div>{{ selectedItem.book_addresses?.city_id }}</div>
                      </v-col>
                      <v-col cols="6" v-if="selectedItem.amount">
                        <div><strong>Тираж:</strong></div>
                        <div>{{ selectedItem.amount }}</div>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="6" v-if="selectedItem.book_category.length > 0">
                        <div><strong>Предметная рубрика:</strong></div>
                        <div>{{ selectedItem.book_category?.[0]?.title }}</div>
                      </v-col>
                      <v-col cols="6" v-if="selectedItem.content_type_id">
                        <div><strong>Виды содержания:</strong></div>
                        <div>{{ selectedItem.content_type_id }}</div>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="6" v-if="selectedItem.book_country.length > 0">
                        <div><strong>Страна:</strong></div>
                        <div>{{ selectedItem.book_country?.[0]?.title }}</div>
                      </v-col>
                      <v-col cols="6" v-if="selectedItem.creation_date">
                        <div><strong>Дата изготовления:</strong></div>
                        <div>{{ selectedItem.creation_date }}</div>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="6" v-if="selectedItem.book_language">
                        <div><strong>Язык:</strong></div>
                        <div>{{ selectedItem.book_language?.map((l) => l.title).join(', ') }}</div>
                      </v-col>
                      <v-col cols="6" v-if="selectedItem.book_genre.length > 0">
                        <div><strong>Жанр:</strong></div>
                        <div>{{ selectedItem.book_genre?.[0]?.title }}</div>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </v-window-item>

          <!-- Fund Status Info Tab -->
          <v-window-item value="three">
            <v-container fluid class="pa-4">
              <!-- Main Status Table -->
              <div class="overflow-y-auto" style="max-height: 200px;">
                <v-table fixed-header height="200">
                  <thead>
                    <tr>
                      <th class="text-left">ID</th>
                      <th class="text-left">{{ t('received_by') }}</th>
                      <th class="text-left">{{ t('book_condition') }}</th>
                      <th class="text-center">{{ t('amount') }}</th>
                      <th class="text-left">{{ t('date') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="!selectedItem.book_log.length">
                      <td colspan="5" class="text-center text-medium-emphasis">
                        Нет данных
                      </td>
                    </tr>
                    <tr v-else v-for="(log, index) in selectedItem.book_log" :key="index">
                      <td>{{ log.school?.id || '-' }}</td>
                      <td>{{ log.school?.name || '-' }}</td>
                      <td>{{ log.status?.title || '-' }}</td>
                      <td class="text-center">
                        <v-chip
                          size="small"
                          color="primary"
                          variant="flat"
                          class="px-2"
                        >
                          {{ log.amount?.[0]?.amount || '1' }}
                        </v-chip>
                      </td>
                      <td>{{ formatDate(log.school?.created_at) }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </div>

              <v-row class="mt-6">
                <!-- Condition Status Table -->
                <v-col cols="6">
                  <div class="d-flex align-center mb-3">
                    <span class="text-subtitle-1">{{ t('book_condition') }}</span>
                  </div>
                  <div class="overflow-y-auto" style="max-height: 300px;">
                    <v-table fixed-header>
                      <thead>
                        <tr>
                          <th class="text-left">#</th>
                          <th class="text-left">{{ t('book_condition') }}</th>
                          <th class="text-center">Экземпляров</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-if="!bookStatusData.schoolBooks.length">
                          <td colspan="3" class="text-center text-medium-emphasis">
                            {{ t('no_data') }}
                          </td>
                        </tr>
                        <template v-else>
                          <tr>
                            <td>1</td>
                            <td>{{ t('new') }}</td>
                            <td class="text-center">
                              <v-chip size="small" color="primary" variant="flat" class="px-2">20</v-chip>
                            </td>
                          </tr>
                          <tr>
                            <td>2</td>
                            <td>{{ t('as_new') }}</td>
                            <td class="text-center">
                              <v-chip size="small" color="primary" variant="flat" class="px-2">20</v-chip>
                            </td>
                          </tr>
                          <tr>
                            <td>3</td>
                            <td>{{ t('excellent') }}</td>
                            <td class="text-center">
                              <v-chip size="small" color="primary" variant="flat" class="px-2">20</v-chip>
                            </td>
                          </tr>
                          <tr>
                            <td>4</td>
                            <td>{{ t('good') }}</td>
                            <td class="text-center">
                              <v-chip size="small" color="primary" variant="flat" class="px-2">20</v-chip>
                            </td>
                          </tr>
                          <tr>
                            <td>5</td>
                            <td>{{ t('acceptable') }}</td>
                            <td class="text-center">
                              <v-chip size="small" color="primary" variant="flat" class="px-2">20</v-chip>
                            </td>
                          </tr>
                          <tr>
                            <td>6</td>
                            <td>{{ t('bad') }}</td>
                            <td class="text-center">
                              <v-chip size="small" color="primary" variant="flat" class="px-2">20</v-chip>
                            </td>
                          </tr>
                        </template>
                      </tbody>
                    </v-table>
                  </div>
                </v-col>

                <!-- Availability Status Table -->
                <v-col cols="6">
                  <div class="d-flex align-center mb-3">
                    <span class="text-subtitle-1">{{ t('availability') }}</span>
                  </div>
                  <div class="overflow-y-auto" style="max-height: 300px;">
                    <v-table fixed-header>
                      <thead>
                        <tr>
                          <th class="text-left">#</th>
                          <th class="text-left">Статус</th>
                          <th class="text-center">Экземпляров</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-if="!bookStatusData.subscription.items">
                          <td colspan="3" class="text-center text-medium-emphasis">
                            Нет данных
                          </td>
                        </tr>
                        <template v-else>
                          <tr>
                            <td>1</td>
                            <td>{{ t('in_reading_room') }}</td>
                            <td class="text-center">
                              <v-chip
                                size="small"
                                color="primary"
                                variant="flat"
                                class="px-2"
                              >
                                {{ bookStatusData.subscription.items.requests || 0 }}
                              </v-chip>
                            </td>
                          </tr>
                          <tr>
                            <td>2</td>
                            <td>{{ t('on_loan') }}</td>
                            <td class="text-center">
                              <v-chip
                                size="small"
                                color="primary"
                                variant="flat"
                                class="px-2"
                              >
                                {{ bookStatusData.subscription.items.returns || 0 }}
                              </v-chip>
                            </td>
                          </tr>
                        </template>
                      </tbody>
                    </v-table>
                  </div>
                </v-col>
              </v-row>
            </v-container>
          </v-window-item>

          <!-- Reading Room Tab (В читальном зале) -->
          <v-window-item value="four">
            <v-container fluid class="pa-4">
              <v-table>
                <thead>
                  <tr>
                    <th class="text-left">ID</th>
                    <th class="text-left">{{ t('status') }}</th>
                    <th class="text-center" width="100">{{ t('available') }}</th>
                    <th class="text-left">{{ t('date') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in readingRoomSubscriptions" :key="index">
                    <td>{{ item.id }}</td>
                    <td>{{ t('in_reading_room') }}</td>
                    <td class="text-center">
                      <v-chip
                        size="small"
                        :color="item.status ? 'success' : 'error'"
                        variant="flat"
                        class="px-2"
                      >
                        {{ item.status ? 'да' : 'нет' }}
                      </v-chip>
                    </td>
                    <td>{{ item.created_at }}</td>
                  </tr>
                </tbody>
              </v-table>
              <div v-if="!readingRoomSubscriptions.length" class="text-center pa-4">
                <v-icon size="64" color="grey" class="mb-4">mdi-desk</v-icon>
                <div class="text-h6">{{ t('no_data_available') }}</div>
              </div>
            </v-container>
          </v-window-item>

          <!-- On Loan Tab (На выдаче) -->
          <v-window-item value="five">
            <v-container fluid class="pa-4">
              <v-table>
                <thead>
                  <tr>
                    <th class="text-left">ID</th>
                    <th class="text-left">{{ t('status') }}</th>
                    <th class="text-center" width="100">{{ t('available') }}</th>
                    <th class="text-left">{{ t('date') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in loanSubscriptions" :key="index">
                    <td>{{ item.id }}</td>
                    <td>{{ t('on_loan') }}</td>
                    <td class="text-center">
                      <v-chip
                        size="small"
                        :color="item.status ? 'success' : 'error'"
                        variant="flat"
                        class="px-2"
                      >
                        {{ item.status ? 'да' : 'нет' }}
                      </v-chip>
                    </td>
                    <td>{{ item.created_at }}</td>
                  </tr>
                </tbody>
              </v-table>
              <div v-if="!loanSubscriptions.length" class="text-center pa-4">
                <v-icon size="64" color="grey" class="mb-4">mdi-book-arrow-right</v-icon>
                <div class="text-h6">{{ t('no_data_available') }}</div>
              </div>
            </v-container>
          </v-window-item>

          <!-- Quotes Tab -->
          <v-window-item value="two">
            <v-container fluid class="pa-4">
              <template v-if="selectedItem.book_quote && selectedItem.book_quote.length > 0">
                <div v-for="quote in selectedItem.book_quote" :key="quote.id" class="mb-4">
                  <v-card variant="outlined">
                    <v-card-title class="text-h6 font-weight-medium">{{ quote.name }}</v-card-title>
                    <v-card-text>
                      <div class="text-body-1 mb-4">{{ quote.content }}</div>
                      <v-chip color="primary" variant="tonal" class="mr-2">
                        <v-icon start>mdi-book-open-page-variant</v-icon>
                        {{ t('page') }}: {{ quote.page }}
                      </v-chip>
                    </v-card-text>
                    <v-card-text class="bg-grey-lighten-4">
                      <v-icon start color="grey">mdi-note-text</v-icon>
                      {{ quote.note }}
                    </v-card-text>
                  </v-card>
                </div>
              </template>
              <v-card v-else variant="outlined">
                <v-card-text class="text-center">
                  <v-icon size="64" color="grey" class="mb-4">mdi-format-quote-close</v-icon>
                  <div class="text-h6">{{ t('no_quotes_available') }}</div>
                </v-card-text>
              </v-card>
            </v-container>
          </v-window-item>
        </v-window>
      </v-list-item>
    </v-navigation-drawer>

    <v-row>
      <v-col class="mx-2">
        <v-card>
          <v-card-text>
            <div class="d-flex flex-column">
              <v-row class="mb-2">
                <v-col class="d-flex" cols="9">
                  <v-text-field
                    v-model="search"
                    density="compact"
                    hide-details
                    :placeholder="t('search_by_title')"
                    prepend-inner-icon="mdi-magnify"
                    rounded
                    variant="outlined"
                  >
                    <template v-slot:append>
                      <v-menu>
                        <template v-slot:activator="{ props }">
                          <v-btn append-icon="mdi-chevron-down" v-bind="props" variant="outlined"
                            >{{ selectedType.title }}
                          </v-btn>
                        </template>

                        <v-list>
                          <v-list-item
                            v-for="item in types"
                            :key="item.id"
                            :value="item.id"
                            @click="selectedType = item"
                            >{{ item.title }}
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </template>
                  </v-text-field>
                </v-col>
                <v-col class="d-flex justify-space-around">
                  <v-btn color="primary" variant="flat" @click="getBooks">{{ t('search') }}</v-btn>
                  <v-btn variant="tonal" @click="resetFilters">{{ t('reset') }}</v-btn>
                  <v-btn
                    v-if="auth.user.value && auth.user.value.roles.some((obj) => obj.id === 1 || obj.id === 2)"
                    color="primary"
                    variant="flat"
                    @click="addAdminBook"
                    >+</v-btn
                  >
                </v-col>
              </v-row>
              <v-row class="mb-2">
                <v-col cols="2">
                  <v-autocomplete
                    v-model="languageId"
                    :items="languages"
                    clearable
                    item-title="title"
                    item-value="id"
                    :label="t('language')"
                    variant="solo-filled"
                  ></v-autocomplete>
                </v-col>
                <v-col cols="2">
                  <v-autocomplete
                    v-model="authorId"
                    :items="authors"
                    clearable
                    item-title="name"
                    item-value="id"
                    :label="t('author')"
                    variant="solo-filled"
                    @update:search="getAuthors"
                  >
                    <template v-slot:no-data>
                      <div class="px-4 d-flex justify-space-between align-center">
                        <span>Данного автора нет в списке</span>
                        <v-btn color="primary" variant="flat" @click="setNewItem('author')"
                          >{{ t('add') }}
                        </v-btn>
                      </div>
                    </template>
                  </v-autocomplete>
                </v-col>
                <v-col cols="2">
                  <v-autocomplete
                    v-model="publisherId"
                    :items="publishers"
                    clearable
                    item-title="title"
                    item-value="id"
                    :label="t('publisher')"
                    variant="solo-filled"
                    @update:search="getPublishers"
                  >
                    <template v-slot:no-data>
                      <div class="px-4 d-flex justify-space-between align-center">
                        <span>Данного издателя нет в списке</span>
                        <v-btn color="primary" variant="flat" @click="setNewItem('publisher')"
                          >{{ t('add') }}
                        </v-btn>
                      </div>
                    </template>
                  </v-autocomplete>
                </v-col>
                <v-col cols="2">
                  <v-text-field
                    v-model="year"
                    :label="t('year_of_publication')"
                    type="number"
                    variant="solo-filled"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-expansion-panels>
                  <v-expansion-panel :title="t('advanced_search')">
                    <v-expansion-panel-text>
                      <v-row>
                        <v-col cols="2">
                          <v-autocomplete
                            v-model="genreId"
                            :items="genres"
                            item-value="id"
                            :label="t('book_genre')"
                            variant="solo-filled"
                          >
                            <template v-slot:no-data>
                              <div class="px-4 d-flex justify-space-between align-center">
                                <span>Данного жанра нет в списке</span>
                                <v-btn color="primary" variant="flat" @click="setNewItem('genre')"
                                  >{{ t('add') }}
                                </v-btn>
                              </div>
                            </template>
                          </v-autocomplete>
                        </v-col>
                        <v-col cols="2">
                          <v-text-field
                            v-model="year"
                            label="ББК"
                            type="number"
                            variant="solo-filled"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="2">
                          <v-text-field
                            v-model="year"
                            label="УДК"
                            type="number"
                            variant="solo-filled"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="2">
                          <v-autocomplete
                            v-model="copyrightSignId"
                            :items="copyrightSigns"
                            item-value="id"
                            label="Авторский знак"
                            variant="solo-filled"
                            @update:search="getCopyrightSigns"
                          >
                            <template v-slot:item="{ item, props }">
                              <v-list-item
                                :title="`${item.raw.number} - ${item.raw.title}`"
                                v-bind="props"
                              >
                              </v-list-item>
                            </template>
                          </v-autocomplete>
                        </v-col>
                        <v-col cols="3">
                          <v-autocomplete
                            v-model="ageCharacteristicId"
                            :items="ageCharacteristics"
                            item-value="id"
                            label="Возрастная характеристика"
                            type="number"
                            variant="solo-filled"
                          ></v-autocomplete>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="2">
                          <v-select
                            v-model="bookClassroom"
                            :items="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]"
                            label="Класс"
                            variant="solo-filled"
                          ></v-select>
                        </v-col>
                        <v-col cols="2">
                          <v-text-field
                            v-model="year"
                            label="Уровень образования"
                            type="number"
                            variant="solo-filled"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="3">
                          <v-autocomplete
                            v-model="countryId"
                            :items="countries"
                            item-value="id"
                            label="Страна издателя"
                            variant="solo-filled"
                            @update:search="getCountries"
                          ></v-autocomplete>
                        </v-col>
                        <v-col cols="2">
                          <v-text-field
                            v-model="year"
                            label="Квалификация"
                            type="number"
                            variant="solo-filled"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-row>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-for="item in filteredItems" :key="item.id" class="mx-2 my-3">
      <v-card class="w-100">
        <v-card-text>
          <v-container fluid>
            <v-row>
              <v-col cols="2">
                <v-img
                  :src="item.book_cover ? getImageURL(item.book_cover.value) : nocover"
                  class="rounded"
                  fluid
                ></v-img>
              </v-col>
              <v-col cols="10">
                <v-row>
                  <v-col cols="6">
                    <v-chip
                      v-for="bookType in item.book_type"
                      :key="bookType.id"
                      color="primary"
                      variant="flat"
                    >
                      {{ bookType.title }}
                      <span v-if="bookType.id === 1 && item.book_classroom">
                        {{ item.book_classroom.classroom }}
                      </span>
                    </v-chip>
                    <v-chip class="ml-2" variant="tonal"> ID: {{ item.id }} </v-chip>
                  </v-col>
                  <v-col class="text-right" cols="6">
                    <v-chip v-if="item.book_school" color="green" variant="flat"
                      >Добавлен в фонд
                    </v-chip>
                    <v-chip v-if="item.book_epub" class="ml-2" color="success" variant="flat"
                      >EPUB
                    </v-chip>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="6">
                    <div class="text-h6 font-weight-bold">
                      {{ item.title }}
                      <span
                        v-if="item.books_in_fund && item.books_in_fund > 0"
                        class="px-2 ml-2 border rounded"
                        >{{ item.books_in_fund }}</span
                      >
                    </div>

                    <div>{{ item.title2 }}</div>
                    <div class="mt-3">
                      <div>
                        <template v-for="(author, index) in item.book_author_main" :key="author.id">
                          <v-chip color="primary" variant="outlined">
                            {{ author.name }}
                          </v-chip>
                        </template>
                      </div>
                      <div class="mt-2">
                        <template v-for="(author, index) in item.book_author" :key="author.id">
                          <v-chip color="grey" variant="outlined" class="mr-1">
                            {{ author.name }}
                          </v-chip>
                        </template>
                      </div>
                    </div>
                    <div class="mt-3">{{ item.annotation }}</div>
                    <div>
                      <v-btn
                        target="_blank"
                        :href="`/book/${item.id}`"
                        v-if="item.book_epub"
                        variant="tonal"
                        prepend-icon="mdi-book-open"
                        >Читать</v-btn
                      >
                    </div>
                  </v-col>
                  <v-col cols="6">
                    <v-card class="w-100" variant="tonal">
                      <v-card-text>
                        <v-container fluid>
                          <v-row>
                            <v-col>
                              <div>
                                <strong>{{ t('publisher') }}:</strong>
                              </div>
                              <div>
                                {{
                                  item.book_publisher
                                    ? item.book_publisher.map((obj) => obj.title).join(', ')
                                    : ''
                                }}
                              </div>
                            </v-col>
                            <v-col>
                              <div>
                                <strong>{{ t('year_of_publication') }}:</strong>
                              </div>
                              <div>{{ item.year }}</div>
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col>
                              <div><strong>УДК:</strong></div>
                              <div>
                                {{
                                  item.book_udk
                                    ? item.book_udk.map((obj) => obj.number + ' ' + obj.title).join(', ')
                                    : ''
                                }}
                              </div>
                            </v-col>
                            <v-col>
                              <div>
                                <strong>{{ t('language') }}:</strong>
                              </div>
                              <div>
                                {{
                                  item.book_language
                                    ? item.book_language.map((obj) => obj.title).join(', ')
                                    : ''
                                }}
                              </div>
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col>
                              <div><strong>ББК:</strong></div>
                              <div>
                                {{
                                  item.book_bbk
                                    ? item.book_bbk.map((obj) => obj.number + ' ' + obj.title).join(', ')
                                    : ''
                                }}
                              </div>
                            </v-col>
                            <v-col>
                              <div><strong>Жанр:</strong></div>
                              <div>
                                {{
                                  item.book_genre
                                    ? item.book_genre.map((obj) => obj.title).join(', ')
                                    : ''
                                }}
                              </div>
                            </v-col>
                          </v-row>
                        </v-container>
                      </v-card-text>
                    </v-card>
                    <v-row class="mt-3 align-center">
                      <v-col cols="5">
                        <v-btn
                          color="primary"
                          size="small"
                          variant="flat"
                          :to="`/book-detail/${item.id}`"
                          >{{ t('details') }}
                        </v-btn>
                      </v-col>
                      <v-col cols="3">
                        <v-menu>
                          <template v-slot:activator="{ props }">
                            <v-btn
                              append-icon="mdi-chevron-down"
                              color="primary"
                              size="small"
                              v-bind="props"
                              variant="flat"
                              >{{ t('actions') }}
                            </v-btn>
                          </template>

                          <v-list>
                            <v-dialog max-width="650">
                              <template v-slot:activator="{ props }">
                                <v-list-item :value="1" v-bind="props"
                                  >Дополнить или исправить
                                </v-list-item>
                              </template>

                              <template v-slot:default="{ isActive }">
                                <v-card>
                                  <v-card-title>Запрос на дополнение/исправление</v-card-title>

                                  <v-card-text>
                                    <v-container fluid>
                                      <v-row>
                                        <v-col cols="4">
                                          <v-img
                                            :src="
                                              item.book_cover
                                                ? `/storage/covers/${item.book_cover.storage}`
                                                : nocover
                                            "
                                            class="rounded"
                                            fluid
                                          ></v-img>
                                        </v-col>
                                        <v-col cols="6">
                                          <div class="text-h6 font-weight-bold">
                                            {{ item.title }}
                                          </div>
                                          <div class="mt-3">
                                            <div>
                                              <template
                                                v-for="(author, index) in item.book_author_main"
                                                :key="author.id"
                                              >
                                                <v-chip color="primary" variant="outlined">
                                                  {{ author.name }}
                                                </v-chip>
                                              </template>
                                            </div>
                                            <div class="mt-2">
                                              <template
                                                v-for="(author, index) in item.book_author"
                                                :key="author.id"
                                              >
                                                <v-chip
                                                  color="grey"
                                                  variant="outlined"
                                                  class="mr-1"
                                                >
                                                  {{ author.name }}
                                                </v-chip>
                                              </template>
                                            </div>
                                          </div>
                                          <v-row class="mt-2">
                                            <v-col>
                                              <div>
                                                <strong>{{ t('language') }}:</strong>
                                              </div>
                                              <div>
                                                {{
                                                  item.book_language
                                                    ? item.book_language
                                                        .map((obj) => obj.title)
                                                        .join(', ')
                                                    : ''
                                                }}
                                              </div>
                                            </v-col>
                                            <v-col>
                                              <div>
                                                <strong>{{ t('year_of_publication') }}:</strong>
                                              </div>
                                              <div>{{ item.year }}</div>
                                            </v-col>
                                          </v-row>
                                          <v-row>
                                            <v-col>
                                              <div>
                                                <strong>{{ t('publisher') }}:</strong>
                                              </div>
                                              <div>
                                                {{
                                                  item.book_publisher
                                                    ? item.book_publisher
                                                        .map((obj) => obj.title)
                                                        .join(', ')
                                                    : ''
                                                }}
                                              </div>
                                            </v-col>
                                            <v-col>
                                              <div><strong>ББК:</strong></div>
                                              <div>
                                                {{
                                                  item.book_bbk
                                                    ? item.book_bbk
                                                        .map((obj) => obj.number + ' ' + obj.title)
                                                        .join(', ')
                                                    : ''
                                                }}
                                              </div>
                                            </v-col>
                                          </v-row>
                                        </v-col>
                                      </v-row>
                                      <v-row>
                                        <v-textarea
                                          v-model="message"
                                          label="Информация для дополнения записи"
                                          placholder="Пропишите пункты, которые нужно исправить или дополнить"
                                          variant="outlined"
                                        ></v-textarea>
                                      </v-row>
                                    </v-container>
                                  </v-card-text>

                                  <v-card-actions>
                                    <v-btn
                                      class="ml-auto mr-auto mr-3"
                                      variant="tonal"
                                      @click="isActive.value = false"
                                      >{{ t('cancel') }}
                                    </v-btn>
                                    <v-btn
                                      class="mr-auto"
                                      color="primary"
                                      variant="flat"
                                      @click="sendRequest(item.id, message, 2, isActive)"
                                      >{{ t('send') }}
                                    </v-btn>
                                  </v-card-actions>
                                </v-card>
                              </template>
                            </v-dialog>

                            <v-dialog max-width="650">
                              <template v-slot:activator="{ props }">
                                <v-list-item @click="initiateQuote(item)" v-bind="props"
                                  ><span>Данные для справочника</span></v-list-item
                                >
                              </template>

                              <template v-slot:default="{ isActive }">
                                <v-card title="Данные для справочника">
                                  <v-card-text>
                                    <v-container fluid>
                                      <v-row>
                                        <v-col cols="4">
                                          <v-img
                                            :src="
                                              item.book_cover
                                                ? getImageURL(item.book_cover.value)
                                                : nocover
                                            "
                                            class="rounded"
                                            fluid
                                          ></v-img>
                                        </v-col>
                                        <v-col cols="8">
                                          <div>
                                            <v-chip
                                              v-if="selectedItem.book_type[0]"
                                              density="compact"
                                              color="primary"
                                              variant="flat"
                                            >
                                              {{ selectedItem.book_type[0].title }}
                                              <span
                                                v-if="
                                                  selectedItem.book_type[0].id === 1 &&
                                                  selectedItem.book_classroom
                                                "
                                              >
                                                {{ selectedItem.book_classroom.classroom }}
                                              </span>
                                            </v-chip>
                                          </div>
                                          <div class="font-weight-bold text-h6">
                                            {{ selectedItem.title }}
                                          </div>
                                          <div>
                                            <v-chip
                                              v-if="selectedItem.book_author_main[0]"
                                              color="primary"
                                              variant="outlined"
                                              density="compact"
                                            >
                                              {{
                                                selectedItem.book_author_main[0]
                                                  ? selectedItem.book_author_main[0].name
                                                  : ''
                                              }}
                                            </v-chip>
                                          </div>
                                        </v-col>
                                      </v-row>
                                    </v-container>
                                  </v-card-text>
                                  <v-card-text>
                                    <v-container fluid>
                                      <v-row>
                                        <v-col cols="12">
                                          <v-text-field
                                            v-model="newQuote.name"
                                            variant="outlined"
                                            hide-details
                                            label="ФИО"
                                          ></v-text-field>
                                        </v-col>
                                      </v-row>
                                      <v-row>
                                        <v-col cols="12">
                                          <v-textarea
                                            v-model="newQuote.content"
                                            variant="outlined"
                                            hide-details
                                            label="Цитата или информация"
                                          ></v-textarea>
                                        </v-col>
                                      </v-row>
                                      <v-row>
                                        <v-col cols="6">
                                          <v-text-field
                                            v-model="newQuote.page"
                                            variant="outlined"
                                            hide-details
                                            label="Страница"
                                          ></v-text-field>
                                        </v-col>
                                        <v-col cols="6">
                                          <v-text-field
                                            v-model="newQuote.note"
                                            variant="outlined"
                                            hide-details
                                            label="Заметка"
                                          ></v-text-field>
                                        </v-col>
                                      </v-row>
                                    </v-container>
                                  </v-card-text>
                                  <v-card-actions>
                                    <v-btn
                                      variant="tonal"
                                      class="ml-auto mr-2"
                                      @click="isActive.value = !isActive.value"
                                      >Закрыть</v-btn
                                    >
                                    <v-btn
                                      variant="flat"
                                      color="primary"
                                      @click="createQuote(isActive)"
                                      >Сохранить</v-btn
                                    >
                                  </v-card-actions>
                                </v-card>
                              </template>
                            </v-dialog>

                            <v-dialog max-width="650">
                              <template v-slot:activator="{ props }">
                                <v-list-item :value="2" v-bind="props"
                                  ><span class="text-success">Запрос удаления</span></v-list-item
                                >
                              </template>

                              <template v-slot:default="{ isActive }">
                                <v-card>
                                  <v-card-title>Запрос на удаление</v-card-title>

                                  <v-card-text>
                                    <v-container fluid>
                                      <v-row>
                                        <v-col cols="4">
                                          <v-img
                                            :src="
                                              item.book_cover
                                                ? `/storage/covers/${item.book_cover.storage}`
                                                : nocover
                                            "
                                            class="rounded"
                                            fluid
                                          ></v-img>
                                        </v-col>
                                        <v-col cols="6">
                                          <div class="text-h6 font-weight-bold">
                                            {{ item.title }}
                                          </div>
                                          <div class="mt-3">
                                            <div>
                                              <template
                                                v-for="(author, index) in item.book_author_main"
                                                :key="author.id"
                                              >
                                                <v-chip color="primary" variant="outlined">
                                                  {{ author.name }}
                                                </v-chip>
                                              </template>
                                            </div>
                                          </div>
                                          <v-row class="mt-2">
                                            <v-col>
                                              <div>
                                                <strong>{{ t('language') }}:</strong>
                                              </div>
                                              <div>
                                                {{
                                                  item.book_language
                                                    ? item.book_language
                                                        .map((obj) => obj.title)
                                                        .join(', ')
                                                    : ''
                                                }}
                                              </div>
                                            </v-col>
                                            <v-col>
                                              <div>
                                                <strong>{{ t('year_of_publication') }}:</strong>
                                              </div>
                                              <div>{{ item.year }}</div>
                                            </v-col>
                                          </v-row>
                                          <v-row>
                                            <v-col>
                                              <div>
                                                <strong>{{ t('publisher') }}:</strong>
                                              </div>
                                              <div>
                                                {{
                                                  item.book_publisher
                                                    ? item.book_publisher
                                                        .map((obj) => obj.title)
                                                        .join(', ')
                                                    : ''
                                                }}
                                              </div>
                                            </v-col>
                                            <v-col>
                                              <div><strong>ББК:</strong></div>
                                              <div>
                                                {{
                                                  item.book_bbk
                                                    ? item.book_bbk
                                                        .map((obj) => obj.number + ' ' + obj.title)
                                                        .join(', ')
                                                    : ''
                                                }}
                                              </div>
                                            </v-col>
                                          </v-row>
                                        </v-col>
                                      </v-row>
                                      <v-row>
                                        <v-textarea
                                          v-model="message"
                                          label="Причина"
                                          placholder="Укажите причину удаления из базы"
                                          variant="outlined"
                                        ></v-textarea>
                                      </v-row>
                                    </v-container>
                                  </v-card-text>

                                  <v-card-actions>
                                    <v-btn
                                      class="ml-auto mr-3"
                                      variant="tonal"
                                      @click="isActive.value = false"
                                      >{{ t('cancel') }}
                                    </v-btn>
                                    <v-btn
                                      class="mr-auto"
                                      color="primary"
                                      variant="flat"
                                      @click="sendRequest(item.id, message, 1, isActive)"
                                      >{{ t('send') }}
                                    </v-btn>
                                  </v-card-actions>
                                </v-card>
                              </template>
                            </v-dialog>
                          </v-list>
                        </v-menu>
                      </v-col>
                      <v-menu
                        v-if="auth.user.value && auth.user.value.roles.some((obj) => obj.id !== 1)"
                      >
                        <template v-slot:activator="{ props }">
                          <v-btn color="green" size="small" v-bind="props" variant="flat">
                            {{ t('add_to_fund') }}
                          </v-btn>
                        </template>

                        <v-list>
                          <v-dialog width="800">
                            <template v-slot:activator="{ props }">
                              <v-list-item v-bind="props" class="cursor-pointer" hover>
                                <v-list-item-title
                                  >Добавить без редактирования записи</v-list-item-title
                                >
                              </v-list-item>
                              <v-list-item class="cursor-pointer" hover @click="addToFund(item)">
                                <v-list-item-title
                                  >Добавить запись с редактированием</v-list-item-title
                                >
                              </v-list-item>
                            </template>

                            <template v-slot:default="{ isActive }">
                              <v-card class="pa-3">
                                <v-card-title>{{ t('add_to_fund') }}</v-card-title>
                                <v-card-text>
                                  <v-container fluid>
                                    <v-row>
                                      <v-col cols="4">
                                        <v-img
                                          height="200"
                                          :src="
                                            item.book_cover
                                              ? `/storage/covers/${item.book_cover.storage}`
                                              : nocover
                                          "
                                          class="rounded"
                                          fluid
                                        ></v-img>
                                      </v-col>
                                      <v-col cols="6">
                                        <div class="text-h6 font-weight-bold">
                                          {{ item.title }}
                                        </div>
                                        <div class="mt-3">
                                          <v-chip
                                            v-for="author in item.book_author_main"
                                            :key="author.id"
                                            color="primary"
                                            variant="outlined"
                                          >
                                            {{ author.name }}
                                          </v-chip>
                                        </div>
                                        <v-row class="mt-2">
                                          <v-col>
                                            <div>
                                              <strong>{{ t('language') }}:</strong>
                                            </div>
                                            <div>
                                              {{
                                                item.book_language
                                                  ? item.book_language
                                                      .map((obj) => obj.title)
                                                      .join(', ')
                                                  : ''
                                              }}
                                            </div>
                                          </v-col>
                                          <v-col>
                                            <div>
                                              <strong>{{ t('year_of_publication') }}:</strong>
                                            </div>
                                            <div>{{ item.year }}</div>
                                          </v-col>
                                        </v-row>
                                        <v-row>
                                          <v-col>
                                            <div>
                                              <strong>{{ t('publisher') }}:</strong>
                                            </div>
                                            <div>
                                              {{
                                                item.book_publisher
                                                  ? item.book_publisher
                                                      .map((obj) => obj.title)
                                                      .join(', ')
                                                  : ''
                                              }}
                                            </div>
                                          </v-col>
                                          <v-col>
                                            <div><strong>ББК:</strong></div>
                                            <div>
                                              {{
                                                item.book_bbk
                                                  ? item.book_bbk.map((obj) => obj.number + ' ' + obj.title).join(', ')
                                                  : ''
                                              }}
                                            </div>
                                          </v-col>
                                        </v-row>
                                      </v-col>
                                    </v-row>
                                    <v-row>
                                      <v-col>
                                        <v-autocomplete
                                          v-model="admission.book_admission_id"
                                          :items="admissions"
                                          item-value="id"
                                          :label="t('reception')"
                                          placeholder="Выберите"
                                          variant="outlined"
                                        ></v-autocomplete>
                                      </v-col>
                                      <v-col>
                                        <v-text-field
                                          v-model="admissionDate"
                                          label="Дата поступления"
                                          type="text"
                                          variant="outlined"
                                          @input="handleDate"
                                        ></v-text-field>
                                      </v-col>
                                    </v-row>

                                    <v-row>
                                      <v-col>
                                        <v-autocomplete
                                          v-model="admission.contractor_id"
                                          :items="contractors"
                                          item-value="id"
                                          :label="t('counterparty')"
                                          placeholder="Укажите"
                                          variant="outlined"
                                          @update:search="getContractors"
                                        >
                                          <template v-slot:no-data>
                                            <div
                                              class="px-4 d-flex justify-space-between align-center"
                                            >
                                              <span>Данного контрагента нет в списке</span>
                                              <v-btn
                                                color="primary"
                                                variant="flat"
                                                @click="
                                                  setNewItem(
                                                    'contractor' as
                                                      | 'author'
                                                      | 'genre'
                                                      | 'publisher'
                                                      | 'subjectHeading'
                                                  )
                                                "
                                                >{{ t('add') }}
                                              </v-btn>
                                            </div>
                                          </template>
                                        </v-autocomplete>
                                      </v-col>
                                    </v-row>

                                    <v-row>
                                      <v-col>
                                        <v-text-field
                                          v-model="admission.amount"
                                          :label="t('quantity')"
                                          placeholder="Выберите"
                                          type="number"
                                          variant="outlined"
                                        ></v-text-field>
                                      </v-col>
                                      <v-col>
                                        <v-text-field
                                          v-model="admission.price"
                                          :label="t('price')"
                                          placeholder="0,00"
                                          step="0.01"
                                          type="number"
                                          variant="outlined"
                                        ></v-text-field>
                                      </v-col>
                                    </v-row>

                                    <v-row>
                                      <v-col>
                                        <v-autocomplete
                                          v-model="admission.book_state_id"
                                          :items="states"
                                          item-value="id"
                                          :label="t('book_condition')"
                                          placeholder="Выберите"
                                          variant="outlined"
                                        ></v-autocomplete>
                                      </v-col>
                                    </v-row>
                                  </v-container>
                                </v-card-text>

                                <v-card-actions>
                                  <v-btn
                                    class="ml-auto mr-3"
                                    variant="tonal"
                                    @click="isActive.value = false"
                                    >{{ t('cancel') }}
                                  </v-btn>
                                  <v-btn
                                    class="mr-auto"
                                    color="primary"
                                    variant="flat"
                                    @click="sendAdmission(admission, isActive, item.id)"
                                    >{{ t('send') }}
                                  </v-btn>
                                </v-card-actions>
                              </v-card>
                            </template>
                          </v-dialog>

                          <v-dialog
                            v-if="
                              auth.user.value && auth.user.value.roles.some((obj) => obj.id === 1)
                            "
                            width="600"
                          >
                            <template v-slot:activator="{ props }">
                              <v-btn
                                class="mr-3"
                                color="red"
                                size="small"
                                v-bind="props"
                                variant="flat"
                              >
                                <v-icon icon="mdi-delete"></v-icon>
                              </v-btn>
                            </template>

                            <template v-slot:default="{ isActive }">
                              <v-card
                                class="text-center"
                                text="Вы уверены что хотите библиографическию запись?"
                                title="Удаление"
                              >
                                <v-card-actions>
                                  <v-btn
                                    class="ml-auto mr-3"
                                    color="primary"
                                    variant="flat"
                                    @click="deleteItem(item.id, isActive)"
                                    >{{ t('yes') }}
                                  </v-btn>
                                  <v-btn
                                    class="mr-auto"
                                    variant="tonal"
                                    @click="isActive.value = false"
                                    >Отмена
                                  </v-btn>
                                </v-card-actions>
                              </v-card>
                            </template>
                          </v-dialog>

                          <v-btn
                            v-if="
                              auth.user.value && auth.user.value.roles.some((obj) => obj.id === 1)
                            "
                            :to="`/m-data/edit/${item.id}`"
                            class="rounded"
                            color="green"
                            size="small"
                            variant="flat"
                          >
                            <v-icon icon="mdi-pencil"></v-icon>
                          </v-btn>
                        </v-list>
                      </v-menu>

                      <v-dialog
                        v-if="auth.user.value && auth.user.value.roles.some((obj) => obj.id === 1)"
                        width="600"
                      >
                        <template v-slot:activator="{ props }">
                          <v-btn
                            class="mr-3"
                            color="red"
                            size="small"
                            v-bind="props"
                            variant="flat"
                          >
                            <v-icon icon="mdi-delete"></v-icon>
                          </v-btn>
                        </template>

                        <template v-slot:default="{ isActive }">
                          <v-card
                            class="text-center"
                            text="Вы уверены что хотите библиографическию запись?"
                            title="Удаление"
                          >
                            <v-card-actions>
                              <v-btn
                                class="ml-auto mr-3"
                                color="primary"
                                variant="flat"
                                @click="deleteItem(item.id, isActive)"
                                >{{ t('yes') }}
                              </v-btn>
                              <v-btn class="mr-auto" variant="tonal" @click="isActive.value = false"
                                >Отмена
                              </v-btn>
                            </v-card-actions>
                          </v-card>
                        </template>
                      </v-dialog>

                      <v-btn
                        v-if="auth.user.value && auth.user.value.roles.some((obj) => obj.id === 1)"
                        :to="`/m-data/edit/${item.id}`"
                        class="rounded"
                        color="green"
                        size="small"
                        variant="flat"
                      >
                        <v-icon icon="mdi-pencil"></v-icon>
                      </v-btn>
                    </v-row>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-row>

    <v-row class="mt-4 mx-1">
      <v-pagination
        v-model="page"
        :length="length"
        :total-visible="6"
        active-color="primary"
        class="ml-auto"
        size="small"
        variant="flat"
      ></v-pagination>

      <div class="d-flex align-center mr-2">
        <v-text-field
          variant="outlined"
          v-model="pageInput"
          :min="1"
          :max="length"
          density="compact"
          hide-details
          class="mx-2"
          style="width: 120px"
        >
          <template v-slot:append>
            <v-tooltip
              :model-value="pageInput < 1 || pageInput > length"
              location="bottom"
              :text="`Введите число от 1 до ${length}`"
            >
              <template v-slot:activator="{ props }">
                <v-icon
                  v-bind="props"
                  color="error"
                  icon="mdi-alert-circle"
                  v-show="pageInput < 1 || pageInput > length"
                ></v-icon>
              </template>
            </v-tooltip>
          </template>
        </v-text-field>
        <v-btn
          icon="mdi-magnify"
          size="small"
          variant="flat"
          @click="goToPage"
          class="rounded-0"
        ></v-btn>
      </div>
    </v-row>
  </v-container>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
