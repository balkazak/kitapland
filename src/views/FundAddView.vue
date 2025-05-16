<script lang="ts" setup>
import { computed, ref, type Ref, onUnmounted } from 'vue'
import { useAPI } from '@/api'
import HelpButton from '@/components/HelpButton.vue'
import { useAuth } from '@/auth'
import BkDialog from '@/components/bkDialog.vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToastStore } from '@/stores/toast'
import { useBookStore } from '@/stores/book'
const { t } = useI18n()
const api = useAPI()
const toast = useToastStore()
const route = useRoute()
const bookStore = useBookStore()
interface Author {
  id: number
  name: string
}

interface Form {
  author_id: Author[]
  author_id_main: Author | null
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
  city_id: string | null
  type_id: number | null
  year: number | null
  book_classroom: BookClassroom | null
  book_classroom_language_id: number | null
  country_id: number | null
  amount: number | null
  copyright_sign: string | null
  content_type_id: number | null
  age_characteristic_id: number | null
  binding_id: number | null
  education_level_id: number | null
  reprint_book_id: number[] | null
  reprint_publisher_id: number[] | null
  titles: TitleItem[]
  tags: Tag[] | null
  part: number | null
  volume: number | null
  materials: number[]
  link: { URL: string; title: string }
  subject_heading_id: number | null
  discipline_id: number | null
  qualification_id: number | null
  profession_id: number | null
  specialty_id: number | null
  distribution: string
  copyright_holder: string
  creator_name: string
  creation_date: string
  marker_id: string
  type_description_id: string
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
    city_id?: string
    postal_index?: string
    number?: string
    company_name?: string
    street_name?: string
  }
}

interface Tag {
  id: number
  label: string
}

const hasClass = ref(false)

interface BookAdmission {
  amount: number
  book_id: number
  book_state_id: number | null
  price: number
  admission_at: string
  contractor_id: number | null
  book_admission_id: number | null
  condition?: number
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
const showAdditionalData: Ref<boolean> = ref(true)
const showFundData: Ref<boolean> = ref(true)
const authors: Ref<Author[]> = ref([])
const publishers: Ref<Publisher[]> = ref([])
const cities: Ref<Publisher[]> = ref([])
const types: Ref<Publisher[]> = ref([])
const languages: Ref<Publisher[]> = ref([])
const additionalAuthors: Ref<boolean> = ref(false)
const contractors: Ref<Contractor[]> = ref([])
const qualifications: Ref<any[]> = ref([])
const specialties: Ref<any[]> = ref([])
const professions: Ref<any[]> = ref([])
const disciplines: Ref<any[]> = ref([])
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
const auth = useAuth()
const form: Ref<Form> = ref({
  author_id: [],
  author_id_main: null,
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
  book_classroom: { classroom: null },
  book_classroom_language_id: null,
  country_id: null,
  amount: null,
  copyright_sign: null,
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
  subject_heading_id: null,
  distribution: '',
  copyright_holder: '',
  creator_name: '',
  creation_date: '',
  marker_id: '',
  type_description_id: '',
  book_specials: {},
  book_areas: {},
  book_addresses: {},
  discipline_id: null,
  qualification_id: null,
  profession_id: null,
  specialty_id: null
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
  itemType: 'author' | 'publisher' | 'genre' | 'subjectHeading' | 'contractor' | 'tag' | null
  companyId?: string
  address?: string
}> = ref({
  name: '',
  active: false,
  title: '',
  label: '',
  itemType: null
})

const showAdditionalParams = ref(false)
const distribution = ref('')
const distributionTypes = ['Общественное достояние', 'Правообладатель']
const copyrightHolder = ref('')
const manufacturer = ref('')
const manufacturingDate = ref('')
const recordMarker = ref('')
const descriptionLevel = ref('')

const showManufacturerAddress = ref(false)
const showMaterialSpecs = ref(false)
const showSeriesArea = ref(false)

const manufacturerAddress = ref({
  country: null,
  city: null,
  postalCode: '',
  street: '',
  houseNumber: '',
  company: ''
})

const materialSpecs = ref({
  size: '',
  accompanyingMaterial: '',
  otherPhysicalDetails: ''
})

const seriesArea = ref({
  mainTitle: '',
  parallelTitle: '',
  titleInfo: '',
  issueNumber: '',
  responsibilityInfo: {
    first: '',
    subsequent: ''
  },
  issn: ''
})

const epubFileInfo = computed(() => {
  if (epubFile.value) {
    return {
      name: epubFile.value.name,
      size: (epubFile.value.size / (1024 * 1024)).toFixed(2) + ' MB'
    }
  }
  return null
})

const handleCountrySelect = async () => {
  await getCountries(null, true)
}

const handleCitySelect = async () => {
  await getCities(null, true)
}

const authorSearch = ref('')
const authorPage = ref(1)
const authorLoading = ref(false)
const authorItems = ref<Author[]>([])
const hasMoreItems = ref(true)

const mainAuthorSearch = ref('')
const mainAuthorItems = ref<Author[]>([])
const mainAuthorLoading = ref(false)
const hasMoreMainItems = ref(true)

const contractorSearch = ref('')
const contractorLoading = ref(false)
const contractorPage = ref(1)
const contractorItems = ref<Contractor[]>([])
const hasMoreContractors = ref(true)
const contractorFocused = ref(false)

async function loadAuthors({ done }) {
  if (authorLoading.value || !hasMoreItems.value) {
    done('ok')
    return
  }

  try {
    authorLoading.value = true
    const response = await api.fetchData<{ data: { items: Author[]; total: number } }>(
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

    // Sort items alphabetically by name, ignoring case, spaces, and special characters
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

async function loadMainAuthors({ done }) {
  if (mainAuthorLoading.value || !hasMoreMainItems.value) {
    done('ok')
    return
  }

  try {
    mainAuthorLoading.value = true
    const response = await api.fetchData<{ data: { items: Author[]; total: number } }>(
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

    // Sort items alphabetically by name, ignoring case, spaces, and special characters
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

function selectAuthor(author: Author) {
  if (!form.value.author_id.some((a) => a.id === author.id)) {
    form.value.author_id.push(author)
  }
  authorSearch.value = ''
  authorItems.value = []
}

function selectMainAuthor(author: Author) {
  form.value.author_id_main = author
  authorMainValid.value = true
  mainAuthorSearch.value = ''
  mainAuthorItems.value = []
}

function removeAuthor(author: Author) {
  form.value.author_id = form.value.author_id.filter((a) => a.id !== author.id)
}

function removeMainAuthor() {
  form.value.author_id_main = null
  authorMainValid.value = false
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
    toast.error('Ошибка при загрузке списка издателей')
    console.error('Error:', error.message)
  }
}

async function getCities(search = null, forceRefresh = false) {
  try {
    let request = `/v1/city`
    if (search || forceRefresh) {
      request += `?search=${search || ''}`
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
    toast.error('Ошибка при загрузке списка контрагентов')
    console.error('Error:', error.message)
  }
}

async function getProfessions(search = null) {
  try {
    let request = `/v1/profession`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: Contractor[] } }>(request)
    if (response.data) professions.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getSpecialties(search = null) {
  try {
    let request = `/v1/specialty`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: Contractor[] } }>(request)
    if (response.data) specialties.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getDisciplines(search = null) {
  try {
    let request = '/v1/discipline'
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: any[] } }>(request)
    if (response.data) disciplines.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getQualifications(search = null) {
  try {
    let request = '/v1/qualification'
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: any[] } }>(request)
    if (response.data) qualifications.value = response.data.data.items
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

const tags: Ref<Tag[]> = ref([])

async function getTags(search = null) {
  try {
    let request = `/v1/tag`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: Tag[] } }>(request)
    if (response.data) tags.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

const countries: Ref<Author[]> = ref([])
const copyrightSigns: Ref<Author[]> = ref([])

async function getCountries(search = null, forceRefresh = false) {
  try {
    let request = `/v1/country`
    if (search || forceRefresh) {
      request += `?search=${search || ''}`
    }
    const response = await api.fetchData<{ data: { items: Author[] } }>(request)
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
    const response = await api.fetchData<{ data: { items: Author[] } }>(request)
    if (response.data) copyrightSigns.value = response.data.data.items
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

interface BkItem {
  id: number
  title: string
}

const bbk: Ref<BkItem[] | null> = ref(null)
const udk: Ref<BkItem[] | null> = ref(null)

const handleFinish = (value: BkItem[], mode: 'bbk' | 'udk') => {
  if (mode === 'bbk') {
    bbk.value = value
  } else {
    udk.value = value
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

function setNewItem(
  itemType: 'author' | 'publisher' | 'genre' | 'subjectHeading' | 'contractor' | 'tag'
) {
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
  } else if (itemType === 'tag') {
    newItem.value.title = 'Добавление ключевого слова'
    newItem.value.label = 'Ключевое слово'
  }

  newItem.value.name = ''
  newItem.value.itemType = itemType
  newItem.value.active = true
}

const router = useRouter()

const tagIds = computed(() => {
  return form.value.tags?.map((tag) => tag.id) || []
})

// Add at the top of script section
const isUploading = ref(false)

// Modify sendBookData function
async function sendBookData() {
  try {
    isUploading.value = true
    const body = {
      ...form.value,
      author_id: form.value.author_id.map((author) => author.id),
      author_id_main: form.value.author_id_main ? [form.value.author_id_main.id] : [],
      bbk_id: bbk.value?.[bbk.value.length - 1]?.id || null,
      udk_id: udk.value?.[udk.value.length - 1]?.id || null,
      tags: tagIds.value
    }

    if (body.id) {
      body.parent_id = body.id
      delete body.id
    }

    // Remove empty arrays and null values
    Object.keys(body).forEach((key) => {
      if (Array.isArray(body[key]) && body[key].length === 0) {
        delete body[key]
      } else if (body[key] === null || body[key] === '') {
        delete body[key]
      } else if (typeof body[key] === 'object' && body[key] !== null) {
        // Handle nested objects
        const isEmpty =
          Object.keys(body[key]).length === 0 ||
          Object.values(body[key]).every((v) => v === null || v === '')
        if (isEmpty) {
          delete body[key]
        }
      }
    })

    if (body.book_classroom) {
      body.book_classroom = body.book_classroom.classroom
    }

    if (body.materials) {
      body.materials = Array.isArray(body.materials) ? body.materials : [body.materials]
    }

    const bookId = form.value.id

    await api.postData<Form, { id: number }>(`/v1/book`, body)

    toast.success('Запись успешно обновлена')
    router.push('/m-data')
  } catch (error: any) {
    let errorMessage = error?.message || 'Ошибка при обновлении записи'
    toast.error(errorMessage)
    console.error('Error:', error)
  } finally {
    isUploading.value = false
  }
}

const cover = ref<HTMLInputElement | null>(null)
const epub = ref<HTMLInputElement | null>(null)
const file = ref<File | null>(null)
const epubFile = ref<File | null>(null)

const handleUpload = () => {
  cover.value?.click()
}

const handleEpub = () => {
  epub.value?.click()
}

const handleEpubUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    epubFile.value = target.files[0]
  }
}

const handleFile = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    file.value = target.files[0]
  }
}

const coverPreview = computed(() => {
  if (file.value) {
    return URL.createObjectURL(file.value)
  }
  return null
})

function initializeFromStore() {
  if (bookStore.bookData) {
    form.value = {
      ...form.value,
      ...bookStore.bookData
    }
  }
}

async function getAuthors(search = null, forceRefresh = false) {
  try {
    let request = `/v1/author`
    if (search || forceRefresh) {
      request += `?search=${search || ''}`
    }
    const response = await api.fetchData<{ data: { items: Author[] } }>(request)
    if (response.data) {
      // Sort items alphabetically by name, ignoring case, spaces, and special characters
      authors.value = [...response.data.data.items].sort((a, b) => {
        const nameA = a.name.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
        const nameB = b.name.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
        return nameA.localeCompare(nameB, 'ru')
      })
    }
  } catch (error: any) {
    toast.error('Ошибка при загрузке списка авторов')
    console.error('Error:', error.message)
  }
}

async function addNewItem(
  itemType: 'author' | 'publisher' | 'genre' | 'subjectHeading' | 'contractor' | 'tag',
  isActive: Ref<boolean>
) {
  const request = itemType === 'subjectHeading' ? 'subject/heading' : itemType
  const requestBody: {
    name?: string
    title?: string
    company_ID?: string
    address?: string
    label?: string
  } = {}
  if (itemType === 'subjectHeading' || itemType === 'author') {
    requestBody.name = newItem.value.name
  } else if (itemType === 'contractor') {
    requestBody.title = newItem.value.name
    requestBody.company_ID = newItem.value.companyId
    requestBody.address = newItem.value.address
  } else if (itemType === 'tag') {
    requestBody.label = newItem.value.name
  } else {
    requestBody.title = newItem.value.name
  }
  try {
    const response = await api.postData(`/v1/${request}`, requestBody)
    if (itemType === 'author') {
      await getAuthors()
      toast.success('Автор успешно добавлен')
    } else if (itemType === 'publisher') {
      await getPublishers()
      toast.success('Издатель успешно добавлен')
    } else if (itemType === 'contractor') {
      await getContractors()
      toast.success('Контрагент успешно добавлен')
    } else if (itemType === 'tag') {
      await getTags()
      toast.success('Ключевое слово успешно добавлено')
    } else if (itemType === 'genre') {
      await getGenres()
      toast.success('Жанр успешно добавлен')
    } else if (itemType === 'subjectHeading') {
      await getSubjectHeadings()
      toast.success('Предметная рубрика успешно добавлена')
    }
    isActive.value = false
  } catch (error: any) {
    let errorMessage = 'Произошла ошибка при добавлении. Попробуйте еще раз'

    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.response?.data?.errors) {
      const errors = error.response.data.errors
      const firstError = Object.values(errors)[0]
      if (Array.isArray(firstError) && firstError.length > 0) {
        errorMessage = firstError[0]
      }
    }

    toast.error(errorMessage)
    console.error('Error:', error.message)
  }
}

getAuthors()
getPublishers()
getCities()
getTypes()
getLanguages()
getContractors()
getDisciplines()
getQualifications()
getStates()
getAdmissions()
getMaterials()
getSubjectHeadings()
getTags()
getCountries()
getCopyrightSigns()
getAgeCharacteristics()
getGenres()
getBindings()
getContentTypes()
initializeFromStore()
getTypeDescriptions()

onUnmounted(() => {
  bookStore.clearBookData()
})

const handleNewTag = async (event: KeyboardEvent) => {
  const target = event.target as HTMLInputElement
  const value = target.value.trim()
  if (value) {
    try {
      const response = await api.postData<{ label: string }, Tag>('/v1/tag', { label: value })
      if (response.data) {
        tags.value.push(response.data)
        form.value.tags = [...(form.value.tags || []), response.data]
      }
    } catch (error) {
      console.error('Error creating tag:', error)
    }
    target.value = ''
  }
}

const showClassSelect = computed(() => form.value.type_id === 1)

const classroomValid = ref(false)
const classroomError = computed(
  () => formSubmitted.value && showClassSelect.value && !classroomValid.value
)

const formSubmitted = ref(false)

interface TitleItem {
  language_id: number
  title: string
  title2?: string
}

const rules = {
  required: (v: any) => !!v || t('rules.required')
}

const handleMainAuthorEnter = async (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    const input = event.target as HTMLInputElement
    const authorName = input.value.trim()

    if (authorName) {
      try {
        const response = await api.postData<any, { id: number; name: string }>('/v1/author', {
          name: authorName
        })

        if (response.data) {
          const newAuthor = {
            id: response.data.id,
            name: authorName
          }

          authors.value.push(newAuthor)
          form.value.author_id_main = newAuthor

          toast.success('Автор успешно добавлен')
          input.value = ''
        }
      } catch (error: any) {
        let errorMessage = 'Произошла ошибка при добавлении автора'
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        }
        toast.error(errorMessage)
      }
    }
  }
}

const handleMainAuthorSelect = async (author: Author) => {
  if (author) {
    form.value.author_id_main = author
    await getAuthors()
  }
}

async function handleNewAuthor(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault()
    const input = event.target as HTMLInputElement
    const authorName = input.value.trim()

    if (authorName) {
      try {
        const response = await api.postData<any, { id: number; name: string }>('/v1/author', {
          name: authorName
        })

        if (response.data) {
          const newAuthor = {
            id: response.data.id,
            name: authorName
          }

          authors.value.push(newAuthor)
          form.value.author_id = [...form.value.author_id, newAuthor]

          toast.success('Автор успешно добавлен')
          input.value = ''
        }
      } catch (error: any) {
        let errorMessage = 'Произошла ошибка при добавлении автора'
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        }
        toast.error(errorMessage)
      }
    }
  }
}

interface BookClassroom {
  id?: number
  book_id?: number
  classroom: number
}

const handleClassroomSelect = (classroom: number) => {
  if (classroom) {
    const existingData = form.value.book_classroom || {}
    form.value.book_classroom = {
      ...existingData,
      classroom: classroom
    }
  } else {
    form.value.book_classroom = null
  }
}

// Add these functions to handle input focus
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

const handleClassroomChange = () => {
  classroomValid.value = form.value.book_classroom && form.value.book_classroom.classroom !== null
}

// Add this computed property
const classroomValue = computed({
  get: () => form.value.book_classroom?.classroom || null,
  set: (val) => {
    if (!form.value.book_classroom) {
      form.value.book_classroom = { classroom: null }
    }
    form.value.book_classroom.classroom = val
    handleClassroomChange()
  }
})

async function loadContractors({
  done
}: {
  done: (status: 'ok' | 'empty' | 'complete' | 'error') => void
}) {
  if (contractorLoading.value || (!hasMoreContractors.value && !contractorSearch.value)) {
    done('ok')
    return
  }

  try {
    contractorLoading.value = true
    let request = `/v1/contractor`

    if (contractorSearch.value) {
      // When searching, don't include pagination and disable infinite scroll
      const isNumeric = /^\d+$/.test(contractorSearch.value)
      if (isNumeric) {
        request += `?bin=${contractorSearch.value}`
      } else {
        request += `?search=${contractorSearch.value}`
      }
      hasMoreContractors.value = false // Disable infinite scroll during search
    } else {
      // Only add pagination when not searching
      request += `?page=${contractorPage.value}&per_page=30`
      hasMoreContractors.value = true // Enable infinite scroll when not searching
    }

    const response = await api.fetchData<{ data: { items: Contractor[] } }>(request)

    // Sort items alphabetically by title
    const sortedItems = [...(response.data?.data?.items || [])].sort((a, b) =>
      a.title.toLowerCase().localeCompare(b.title.toLowerCase(), 'ru')
    )

    if (contractorSearch.value) {
      // When searching, replace the entire list
      contractorItems.value = sortedItems
    } else {
      // When not searching, append to the list
      contractorItems.value = [...contractorItems.value, ...sortedItems]
      contractorPage.value++
    }

    done(sortedItems.length ? 'ok' : 'empty')
  } catch (error) {
    console.error('Error loading contractors:', error)
    done('error')
  } finally {
    contractorLoading.value = false
  }
}

async function searchContractors(searchText: string) {
  contractorSearch.value = searchText
  contractorPage.value = 1
  contractorItems.value = []
  hasMoreContractors.value = true

  if (searchText) {
    await loadContractors({
      done: (status) => {
        if (status === 'empty') {
          contractorItems.value = []
        }
      }
    })
  }
}

function handleContractorInputFocus() {
  contractorFocused.value = true
  contractorPage.value = 1
  contractorItems.value = []
  hasMoreContractors.value = true
  loadContractors({ done: () => {} })
}

function handleContractorInputBlur() {
  setTimeout(() => {
    contractorFocused.value = false
  }, 200)
}

function selectContractor(contractor: Contractor) {
  admission.value.contractor_id = contractor.id
  selectedContractor.value = contractor
  contractorSearch.value = ''
  contractorItems.value = []
}

const removeContractor = () => {
  admission.value.contractor_id = null
  selectedContractor.value = null
}

const selectedContractor: Ref<Contractor | null> = ref(null)

const typeDescriptions: Ref<Publisher[]> = ref([])

async function getTypeDescriptions(search = null) {
  try {
    let request = `/v1/type/description`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: Publisher[] } }>(request)
    if (response.data) typeDescriptions.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

// Add a computed property to get the selected state description
const selectedStateDescription = computed(() => {
  if (!admission.value.book_state_id || !states.value.length) return ''
  
  const selectedState = states.value.find(state => state.id === admission.value.book_state_id)
  return selectedState ? selectedState.description : ''
})

// Add these variables for publisher handling
const publisherSearch = ref('')
const publisherFocused = ref(false)
const publisherItems = ref([])
const publisherPage = ref(1)
const publisherLoading = ref(false)
const hasMorePublishers = ref(true)
const isAddingPublisher = ref(false)

// Function to load publishers with search and pagination
async function loadPublishers({ done }) {
  if (publisherLoading.value || !hasMorePublishers.value) {
    done('ok')
    return
  }

  publisherLoading.value = true
  try {
    const response = await api.fetchData(
      `/v1/publisher?page=${publisherPage.value}&search=${publisherSearch.value}`
    )

    if (response.data && response.data.data.items.length > 0) {
      publisherItems.value = [...publisherItems.value, ...response.data.data.items]
      publisherPage.value++
      done('ok')
    } else {
      hasMorePublishers.value = false
      done(publisherItems.value.length ? 'complete' : 'empty')
    }
  } catch (error) {
    console.error('Error loading publishers:', error)
    done('error')
  } finally {
    publisherLoading.value = false
  }
}

// Function to search publishers
async function searchPublishers(searchText) {
  publisherSearch.value = searchText
  publisherPage.value = 1
  publisherItems.value = []
  hasMorePublishers.value = true

  if (searchText) {
    await loadPublishers({ done: () => {} })
  }
}

// Function to handle publisher input focus
function handlePublisherInputFocus() {
  publisherFocused.value = true
  publisherPage.value = 1
  publisherItems.value = []
  hasMorePublishers.value = true
  loadPublishers({ done: () => {} })
}

// Function to handle publisher input blur
function handlePublisherInputBlur() {
  setTimeout(() => {
    publisherFocused.value = false
  }, 200)
}

// Function to select a publisher
function selectPublisher(publisher) {
  form.value.publisher_id = publisher.id
  publisherSearch.value = publisher.title
  publisherItems.value = []
}

// Function to add a new publisher on Enter key
async function addNewPublisher(event) {
  if (event.key === 'Enter' && publisherSearch.value.trim() && !form.value.publisher_id) {
    event.preventDefault()
    
    // Show loader
    isAddingPublisher.value = true
    
    try {
      const response = await api.postData('/v1/publisher', {
        title: publisherSearch.value.trim()
      })
      
      if (response.data) {
        form.value.publisher_id = response.data.id
        // Set the publisher search value to the newly added publisher name
        publisherSearch.value = publisherSearch.value.trim()
        toast.success(t('publisher_added'))
        
        // Close the publisher list
        publisherFocused.value = false
        
        // Refresh publishers list
        await getPublishers()
      }
    } catch (error) {
      console.error('Error adding publisher:', error)
      toast.error(t('error_adding_publisher'))
    } finally {
      // Hide loader
      isAddingPublisher.value = false
    }
  }
}
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

      <template v-slot:append>
        <help-button video-id="8vUsW7Fs5M8 " class="mr-3" />
        <v-btn color="primary" prepend-icon="mdi-plus" to="/m-data/add" variant="flat"
          >{{ t('add') }}
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
                <v-row>
                <v-col>
                  <v-select
                    v-model="form.type_description_id"
                    :items="typeDescriptions"
                    item-value="id"
                    item-title="title"
                    :label="t('description_level')"
                    :placeholder="t('search')"
                    variant="outlined"
                  ></v-select>
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
                  <div class="d-flex flex-column">
                    <span class="mb-2">{{ t('main_author') }}</span>

                    <div v-if="!form.author_id_main" class="position-relative">
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

                    <div v-if="form.author_id_main" class="mt-2">
                      <v-chip closable @click:close="removeMainAuthor">
                        {{ form.author_id_main.name }}
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

                      <v-card v-if="authorSearch && authorItems.length > 0" class="author-results">
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
                        v-for="author in form.author_id"
                        :key="author.id"
                        class="ma-1"
                        closable
                        @click:close="removeAuthor(author)"
                      >
                        {{ author.name }}
                      </v-chip>
                    </div>
                  </div>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-autocomplete
                    v-model="form.qualification_id"
                    :items="qualifications"
                    item-title="title"
                    item-value="id"
                    label="Квалификация"
                    placeholder="Поиск"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    @update:search="getQualifications"
                  ></v-autocomplete>
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
                  <div class="position-relative">
                    <v-text-field
                      v-model="publisherSearch"
                      :label="t('publisher')"
                      variant="outlined"
                      @focus="handlePublisherInputFocus"
                      @blur="handlePublisherInputBlur"
                      @input="searchPublishers($event.target.value)"
                      @keydown="addNewPublisher"
                      :loading="isAddingPublisher"
                    >
                      <template v-slot:append>
                        <v-icon v-if="form.publisher_id && !isAddingPublisher" @click="form.publisher_id = null; publisherSearch = ''">
                          mdi-close
                        </v-icon>
                      </template>
                    </v-text-field>
                    
                    <v-card v-if="publisherFocused && publisherItems.length > 0" class="author-results">
                      <v-list>
                        <v-infinite-scroll
                          :items="publisherItems"
                          :loading="publisherLoading"
                          :disabled="!hasMorePublishers"
                          @load="loadPublishers"
                        >
                          <template v-for="(publisher, index) in publisherItems" :key="publisher.id">
                            <v-list-item
                              :class="['pa-2', index % 2 === 0 ? 'bg-grey-lighten-2' : '']"
                              @click="selectPublisher(publisher)"
                            >
                              {{ publisher.title }}
                            </v-list-item>
                          </template>
                        </v-infinite-scroll>
                      </v-list>
                    </v-card>
                    
                    <v-sheet v-if="publisherFocused && publisherSearch && !publisherItems.length" class="author-results pa-2">
                      <div class="text-center py-2">
                        {{ t('press_enter_to_add_new_publisher') }}
                      </div>
                    </v-sheet>
                  </div>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-text-field
                    v-model="form.city_id"
                    :label="t('city')"
                    :placeholder="t('city')"
                    variant="outlined"
                  ></v-text-field>
                  <!-- <v-autocomplete
                    v-model="form.city_id"
                    :items="cities"
                    item-value="id"
                    label="Город"
                    placeholder="Поиск"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    @update:search="getCities"
                  ></v-autocomplete> -->
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
                <v-col class="d-flex">
                  <v-autocomplete
                    v-model="form.type_id"
                    :items="types"
                    item-value="id"
                    :label="t('type')"
                    placeholder="Поиск"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    class="flex-grow-1"
                  ></v-autocomplete>
                  <v-select
                    v-if="showClassSelect"
                    v-model="classroomValue"
                    :items="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]"
                    label="Класс *"
                    placeholder="Класс"
                    variant="outlined"
                    style="max-width: 100px; margin-left: 8px"
                    density="compact"
                    :rules="[rules.required]"
                    :error="classroomError"
                    required
                  ></v-select>
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
                          >{{ t('add') }}
                        </v-btn>
                      </div>
                    </template>
                  </v-autocomplete>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-autocomplete
                    v-model="form.tags"
                    :items="tags"
                    chips
                    item-title="label"
                    item-value="id"
                    :label="t('keywords')"
                    multiple
                    placeholder="Поиск"
                    variant="outlined"
                    return-object
                    @update:search="getTags"
                    @keydown.enter="handleNewTag"
                  >
                    <template v-slot:selection="{ item }">
                      <v-chip>{{ item.raw.label }}</v-chip>
                    </template>

                    <template v-slot:no-data>
                      <div class="px-4">
                        <span>Нажмите Enter для добавления</span>
                      </div>
                    </template>
                  </v-autocomplete>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <div class="d-flex">
                    <div class="d-flex flex-column w-50">
                      <span class="mb-2">ББК</span>
                      <bk-dialog mode="bbk" @finish="handleFinish($event, 'bbk')"></bk-dialog>
                      <div v-if="bbk" class="mt-2 font-weight-bold">
                        {{ bbk.map((item) => item.title).join(', ') }}
                      </div>
                    </div>
                    <div class="d-flex flex-column ml-4 w-50">
                      <span class="mb-2">УДК</span>
                      <bk-dialog mode="udk" @finish="handleFinish($event, 'udk')"></bk-dialog>
                      <div v-if="udk" class="mt-2 font-weight-bold">
                        {{ udk.map((item) => item.title).join(', ') }}
                      </div>
                    </div>
                  </div>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-text-field
                    v-model="form.copyright_sign"
                    :label="t('copyright_sign')"
                    placeholder="Введите авторский знак"
                    variant="outlined"
                  ></v-text-field>
                  <!-- <v-autocomplete
                    :items="copyrightSigns"
                    label="Авторский знак"
                    placeholder="Поиск"
                    prepend-inner-icon="mdi-magnify"
                    return-object
                    variant="outlined"
                    @update:search="getCopyrightSigns"
                  >
                    <template v-slot:selection="{ item }">
                      {{ item.raw.number }} - {{ item.raw.title }}
                    </template>
                    <template v-slot:item="{ props, item }">
                      <v-list-item :subtitle="item.raw.number" v-bind="props"
                        >{{ item.raw.number }} - {{ item.raw.title }}
                      </v-list-item>
                    </template>
                  </v-autocomplete> -->
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-autocomplete
                    v-model="form.content_type_id"
                    :items="contentTypes"
                    item-value="id"
                    :label="t('content_types')"
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
                    :label="t('age_characteristic')"
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
                    :label="t('binding')"
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
                    :label="t('genre')"
                    multiple
                    :placeholder="t('search')"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                  >
                    <template v-slot:no-data>
                      <div class="px-4 d-flex justify-space-between align-center">
                        <span>{{ t('no_genre') }}</span>
                        <v-btn color="primary" variant="flat" @click="setNewItem('genre')"
                          >{{ t('add') }}
                        </v-btn>
                      </div>
                    </template>
                  </v-autocomplete>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-autocomplete
                    :items="countries"
                    item-title="title"
                    :label="t('country')"
                    :placeholder="t('search')"
                    prepend-inner-icon="mdi-magnify"
                    return-object
                    variant="outlined"
                    @update:search="getCountries"
                    @update:model-value="handleCountrySelect"
                  ></v-autocomplete>
                </v-col>
              </v-row>

              <!-- <v-row>
                <v-col>
                  <div class="d-flex justify-space-between">
                    <div class="d-flex flex-column">
                      <span class="mb-2">{{ t('cover') }}</span>
                      <v-img v-if="coverPreview" :src="coverPreview"></v-img>
                      <v-btn color="primary" variant="outlined" @click="handleUpload"
                        >{{ t('select_file') }}
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
                      <span class="mb-2">EPUB</span>
                      <v-btn color="primary" variant="outlined" @click="handleEpub">
                        {{ t('select_file') }}
                      </v-btn>
                      <input
                        ref="epub"
                        accept=".epub"
                        style="display: none"
                        type="file"
                        @input="handleEpubUpload"
                      />
                      <div v-if="epubFileInfo" class="mt-2">
                        <div class="text-body-2">{{ epubFileInfo.name }}</div>
                        <div class="text-caption">{{ epubFileInfo.size }}</div>
                      </div>
                    </div>
                  </div>
                </v-col>
              </v-row> -->

              <v-row>
                <v-col>
                  <v-autocomplete
                    v-model="form.discipline_id"
                    :items="disciplines"
                    item-value="id"
                    variant="outlined"
                    :label="t('discipline')"
                    @update:search="getDisciplines"
                  />
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-autocomplete
                    v-model="form.profession_id"
                    :items="professions"
                    item-value="id"
                    variant="outlined"
                    :label="t('profession')"
                    @update:search="getProfessions"
                  />
                </v-col>
                <v-col>
                  <v-autocomplete
                    v-model="form.specialty_id"
                    :items="specialties"
                    item-value="id"
                    variant="outlined"
                    :label="t('specialty')"
                    @update:search="getSpecialties"
                  />
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-text-field
                    v-model="form.link.title"
                    :label="t('link')"
                    :placeholder="t('name')"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
                <v-col>
                  <v-text-field
                    v-model="form.link.URL"
                    :label="t('url')"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-select
                    v-model="form.distribution"
                    :items="distributionTypes"
                    :label="t('distribution')"
                    variant="outlined"
                  ></v-select>
                </v-col>
              </v-row>

              <v-row v-if="form.distribution === 'Правообладатель'">
                <v-col>
                  <v-text-field
                    v-model="form.copyright_holder"
                    :label="t('copyright_holder')"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-text-field
                    v-model="form.creator_name"
                    :label="t('creator_name')"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-text-field
                    v-model="form.creation_date"
                    :label="t('creation_date')"
                    type="date"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-text-field
                    v-model="form.marker_id"
                    :label="t('marker_id')"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-checkbox
                    v-model="showManufacturerAddress"
                    :label="t('manufacturer_address')"
                  ></v-checkbox>

                  <v-expand-transition>
                    <div v-if="showManufacturerAddress">
                      <v-row>
                        <v-col>
                          <v-autocomplete
                            v-model="manufacturerAddress.country"
                            :items="countries"
                            item-title="title"
                            item-value="id"
                            :label="t('country')"
                            :placeholder="t('search')"
                            variant="outlined"
                            @update:search="getCountries"
                            @update:model-value="handleCountrySelect"
                          ></v-autocomplete>
                        </v-col>
                        <v-col>
                          <v-autocomplete
                            v-model="manufacturerAddress.city"
                            :items="cities"
                            item-title="title"
                            item-value="id"
                            :label="t('city')"
                            :placeholder="t('search')"
                            variant="outlined"
                            @update:search="getCities"
                            @update:model-value="handleCitySelect"
                          ></v-autocomplete>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col>
                          <v-text-field
                            v-model="manufacturerAddress.postalCode"
                            :label="t('postal_index')"
                            variant="outlined"
                          ></v-text-field>
                        </v-col>
                        <v-col>
                          <v-text-field
                            v-model="manufacturerAddress.street"
                            :label="t('street')"
                            variant="outlined"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col>
                          <v-text-field
                            v-model="manufacturerAddress.houseNumber"
                            :label="t('house_number')"
                            variant="outlined"
                          ></v-text-field>
                        </v-col>
                        <v-col>
                          <v-text-field
                            v-model="manufacturerAddress.company"
                            :label="t('company')"
                            variant="outlined"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </div>
                  </v-expand-transition>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-checkbox v-model="showMaterialSpecs" :label="t('material_specs')"></v-checkbox>

                  <v-expand-transition>
                    <div v-if="showMaterialSpecs">
                      <v-text-field
                        v-model="materialSpecs.size"
                        :label="t('size')"
                        variant="outlined"
                      ></v-text-field>
                      <v-text-field
                        v-model="materialSpecs.accompanyingMaterial"
                        :label="t('accompanying_material')"
                        variant="outlined"
                      ></v-text-field>
                      <v-textarea
                        v-model="materialSpecs.otherPhysicalDetails"
                        :label="t('other_physical_details')"
                        variant="outlined"
                      ></v-textarea>
                    </div>
                  </v-expand-transition>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-checkbox v-model="showSeriesArea" :label="t('series_area')"></v-checkbox>

                  <v-expand-transition>
                    <div v-if="showSeriesArea">
                      <v-text-field
                        v-model="seriesArea.mainTitle"
                        :label="t('main_title')"
                        variant="outlined"
                      ></v-text-field>
                      <v-text-field
                        v-model="seriesArea.parallelTitle"
                        :label="t('parallel_title')"
                        variant="outlined"
                      ></v-text-field>
                      <v-text-field
                        v-model="seriesArea.titleInfo"
                        :label="t('title_info')"
                        variant="outlined"
                      ></v-text-field>
                      <v-text-field
                        v-model="seriesArea.issueNumber"
                        :label="t('issue_number')"
                        variant="outlined"
                      ></v-text-field>
                      <v-text-field
                        v-model="seriesArea.responsibilityInfo.first"
                        :label="t('first_info')"
                        variant="outlined"
                      ></v-text-field>
                      <v-text-field
                        v-model="seriesArea.responsibilityInfo.subsequent"
                        :label="t('subsequent_info')"
                        variant="outlined"
                      ></v-text-field>
                      <v-text-field
                        v-model="seriesArea.issn"
                        :label="t('issn')"
                        variant="outlined"
                      ></v-text-field>
                    </div>
                  </v-expand-transition>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="showFundData">
      <v-col cols="8" offset="2">
        <v-card>
          <v-card-title>Данные для фонда</v-card-title>

          <v-card-text>
            <v-container fluid>
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
                  <div class="position-relative">
                    <v-text-field
                      v-if="!selectedContractor"
                      v-model="contractorSearch"
                      :label="t('counterparty')"
                      :placeholder="t('specify')"
                      variant="outlined"
                      @input="searchContractors($event.target.value)"
                      @focus="handleContractorInputFocus"
                      @blur="handleContractorInputBlur"
                    ></v-text-field>

                    <div v-if="selectedContractor" class="mt-2">
                      <h4 class="mb-2">{{ t('counterparty') }}</h4>
                      <v-chip closable @click:close="removeContractor">
                        {{ selectedContractor.title }}
                      </v-chip>
                    </div>

                    <v-card
                      v-if="(contractorSearch || contractorItems.length > 0) && contractorFocused && !selectedContractor"
                      class="author-results"
                    >
                      <template v-if="contractorSearch">
                        <v-list max-height="300" class="overflow-y-auto">
                          <template v-for="(contractor, index) in contractorItems" :key="contractor.id">
                            <v-list-item
                              :class="['pa-2', index % 2 === 0 ? 'bg-grey-lighten-2' : '']"
                              @click="selectContractor(contractor)"
                            >
                              {{ contractor.title }}
                            </v-list-item>
                          </template>
                        </v-list>
                      </template>
                      <template v-else>
                        <v-infinite-scroll
                          :height="300"
                          :items="contractorItems"
                          :loading="contractorLoading"
                          :disabled="!hasMoreContractors"
                          @load="loadContractors"
                        >
                          <template v-for="(contractor, index) in contractorItems" :key="contractor.id">
                            <v-list-item
                              :class="['pa-2', index % 2 === 0 ? 'bg-grey-lighten-2' : '']"
                              @click="selectContractor(contractor)"
                            >
                              {{ contractor.title }}
                            </v-list-item>
                          </template>
                        </v-infinite-scroll>
                      </template>
                    </v-card>
                  </div>
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
                    :placeholder="t('enter_price')"
                    type="number"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-select
                    v-model="admission.book_state_id"
                    :items="[...states]"
                    item-value="id"
                    item-title="title"
                    :label="t('book_condition')"
                    variant="outlined"
                  ></v-select>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-sheet 
                    class="px-2 py-2" 
                    color="#FFE4AF" 
                    rounded
                    v-if="selectedStateDescription"
                  >
                    <span>{{ selectedStateDescription }}</span>
                  </v-sheet>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col class="text-center">
        <v-btn color="green" prepend-icon="mdi-plus" variant="flat" @click="sendBookData"
          >{{ t('add_to_fund') }}
        </v-btn>
      </v-col>
    </v-row>

    <v-dialog v-model="newItem.active" max-width="500">
      <template v-slot:default="{ isActive }">
        <v-card :title="t('add') + ' ' + (t(newItem.itemType || '') || '')">
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
            <v-btn variant="outlined" @click="isActive.value = false">
              {{ t('cancel') }}
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              variant="flat"
              @click="newItem.itemType && addNewItem(newItem.itemType, isActive)"
              >{{ t('add') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>
  </v-container>
</template>

<style scoped>
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
</style>
