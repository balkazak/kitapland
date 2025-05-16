<!-- eslint-disable vue/valid-v-slot -->

<script lang="ts" setup>
import { useAuth } from '@/auth/index'
import { ArcElement, Chart as ChartJS, Legend, Tooltip, Title, DoughnutController } from 'chart.js'
import { Doughnut, Pie } from 'vue-chartjs'
import StatisticsList from '@/components/home/StatisticsList.vue'
import SubscriptionTable from '@/components/home/SubscriptionTable.vue'
import { computed, type Ref, ref, watch, onMounted } from 'vue'
import { useAPI } from '@/api'
import PublishersModal from '@/components/home/PublishersModal.vue'
import CountryModal from '@/components/home/CountryModal.vue'
import ClassModalVue from '@/components/home/ClassModal.vue'
import FundModalVue from '@/components/home/FundModal.vue'
import publisherPDF from '@/assets/publisherPDF.pdf'
import AgesModal from '@/components/home/AgesModal.vue'
import HistoryTable from '@/components/home/HistoryTable.vue'
import InventoryTable from '@/components/home/InventoryTable.vue'
import spros from '@/assets/spros.pdf'
import report from '@/assets/report.pdf'
import ministryReport from '@/assets/fund-performance.pdf'
import fileDownload from 'js-file-download'
import qazaqstan from '@/assets/flags/qazaqstan.svg'
import world from '@/assets/flags/world.svg'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import returned from '@/assets/return.svg'
import { useRouter } from 'vue-router'
import EventComponentNew from '@/components/EventComponentNew.vue'
import LibraryStateCard from '@/components/home/LibraryStateCard.vue'
const { t } = useI18n()
const auth = useAuth()
const api = useAPI()
const router = useRouter()

const doughnut = {
  labels: [t('annual'), t('issue'), t('return')],
  datasets: [
    {
      backgroundColor: ['#0095FF', '#00E096', '#884DFF'],
      data: [68, 10, 22]
    }
  ]
}

const options = {
  responsive: true,
  maintainAspectRatio: false
}

interface BookState {
  id?: number
  title: string
  amount: number
}

interface Publisher {
  publisher_id: number
  publisher: string
  amount: string
  books: number
}

interface UserAge {
  age: string
  count: number
  percent: string
}

const isCollege = ref(false)
watch(auth.userData, (value) => {
  if (value && value.school.organization && value.school.organization.label === 'Колледж') {
    isCollege.value = true
  }
})

async function getFundState(): Promise<void> {
  fundLoading.value = true
  try {
    const response = await api.fetchData<BookState[]>('/v1/dashboard/book/state')
    fund.value = response.data
    if (fund.value) {
      fund.value.forEach((item) => {
        const bookState = bookStates.value.find((state) => {
          return state.title === item.title
        })
        if (bookState && bookState.id) {
          item.id = bookState.id
        }
      })
    }
    fundLoading.value = false
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

const classroomHeaders: { key: string; title: string }[] = [
  { key: 'name', title: t('full_name') },
  { key: 'books', title: t('books') },
  { key: 'amount', title: t('form') },
  { key: 'actions', title: '' }
]

const classroomItems: { name: string; books: number; amount: number }[] = [
  { name: 'Новое', books: 25, amount: 100 },
  { name: 'Новое', books: 25, amount: 100 },
  { name: 'Новое', books: 25, amount: 100 },
  { name: 'Новое', books: 25, amount: 100 },
  { name: 'Новое', books: 25, amount: 100 },
  { name: 'Новое', books: 25, amount: 100 }
]

async function getPublishers(school_id = null): Promise<void> {
  let request = '/v1/dashboard/publisher'
  if (school_id) {
    request += `?school_id=${school_id}`
  }
  publishersLoading.value = true
  try {
    const response = await api.fetchData<Publisher[]>(request)
    publishers.value = response.data
    publishersLoading.value = false
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

const readers = ref<{ classroom: number; marks: number; pupils: number }[]>([])

const getReaders = async (school_id = null) => {
  let request = '/v1/dashboard/classroom/pupils'
  if (school_id) {
    request += `?school_id=${school_id}`
  }
  try {
    const response =
      await api.fetchData<{ classroom: number; marks: number; pupils: number }[]>(request)
    if (response.data) readers.value = response.data
  } catch (e) {
    console.error('Error:', e)
  }
}

getReaders()

const headers = [
  { key: 'classroom', title: t('classes') },
  { key: 'marks', title: t('marking') },
  { key: 'pupils', title: t('quantity') }
]

const publisherTableHeaders = [
  { key: 'title', title: t('regions') },
  {
    key: 'amount',
    title: t('quantity')
  }
]

const publisherTableItems = [
  { title: 'Регионы 1', amount: 25 },
  { title: 'Регионы 2', amount: 25 },
  { title: 'Регионы 3', amount: 25 },
  { title: 'Регионы 4', amount: 25 }
]

const countries = [
  {
    id: 1,
    code: 'kz',
    flag: qazaqstan,
    name: t('kazakhstan'),
    progress: 68.42
  },
  {
    id: 2,
    code: 'kz',
    flag: world,
    name: t('foreign'),
    progress: 10.52
  }
]

const fundHeaders = [
  { key: 'title', title: t('name') },
  { key: 'books', title: t('book_titles') },
  { key: 'amount', title: t('book_copies') },
  { key: 'actions', title: '' }
]

const userAges: Ref<UserAge[]> = ref([])

async function getUserAges(school_id = null) {
  let request = '/v1/dashboard/user/age'
  if (school_id) {
    request += `?school_id=${school_id}`
  }
  try {
    const response = await api.fetchData<UserAge[]>(request)
    if (response.data) userAges.value = response.data
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

const fund: Ref<BookState[] | null> = ref(null)

const fundLoading: Ref<boolean> = ref(false)

const publisherHeaders = [
  { key: 'publisher', title: t('name') },
  { key: 'books', title: t('book_titles') },
  { key: 'amount', title: t('book_copies') }
]

const publishers: Ref<Publisher[] | null> = ref(null)

const publishersLoading: Ref<boolean> = ref(false)

ChartJS.register(ArcElement, Tooltip, Legend, Title, DoughnutController)

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%',
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 20,
        usePointStyle: true,
        pointStyle: 'circle',
        font: {
          size: 12
        }
      }
    }
  }
}

const agesChartData = computed(() => {
  return {
    labels: userAges.value.map((user) => user.age),
    datasets: [
      {
        backgroundColor: ['#0095FF', '#00E096', 'red', '#884DFF'],
        data: userAges.value.map((user) => Number.parseFloat(user.percent))
      }
    ]
  }
})

const pieChartData = computed(() => {
  return {
    labels: [t('copies'), 'Наименований'],
    datasets: [
      {
        backgroundColor: ['#0095FF', '#00E096'],
        data: [bookSchools.value.amount, bookSchools.value.books]
      }
    ]
  }
})

const clsData = ref({
  labels: ['Новые', 'Старые', 'Как новые', 'Плохое', 'Отличное', 'Приемлимое'],
  datasets: [
    {
      backgroundColor: ['#0095FF', '#00E096', '#884DFF', '#E81600', '#E8C300', '#F86300'],
      data: [456, 150, 10, 120, 210, 47]
    }
  ]
})

const tab = ref(1)

const role = computed(() => {
  return auth.user.value && auth.user.value.roles[0] ? auth.user.value.roles[0].id : 0
})

const librarianStatistics = ref([
  { subtitle: 'М-DATA', color: '#0161F2', title: 0, route: '/m-data' },
  { subtitle: t('school_fund'), color: '#6900C7', title: 0, route: '/fund' },
  { subtitle: t('book_titles'), color: '#F86300', title: 0, name: 'admission' },
  { subtitle: t('amount_received'), color: '#05AC69', title: 0 },
  { subtitle: t('written_off_from_fund'), color: '#E81600', title: 0, name: 'refund' }
])

const classroomStatistics = ref([
  { subtitle: 'Читатели', color: '#0161F2', title: 0 },
  { subtitle: t('issues'), color: '#6900C7', title: 0 },
  { subtitle: t('returns'), color: '#F86300', title: 0 },
  { subtitle: t('requests'), color: '#05AC69', title: 0 }
])

const publisherStatistics = ref([
  { subtitle: 'Количество книг в базе', color: '#0161F2', title: 0 },
  { subtitle: 'Количество книг по фонду', color: '#6900C7', title: 0 },
  { subtitle: 'Количество экз. по фонду', color: '#F86300', title: 0 }
])

const ministryStatistics = ref([
  { subtitle: 'Количество школ в базе', color: '#0161F2', title: 0 },
  { subtitle: 'Количество записей в системе', color: '#6900C7', title: 0 },
  { subtitle: 'Количество библиотекарей в системе', color: '#F86300', title: 0 },
  { subtitle: t('amount_received'), color: '#05AC69', title: 0 },
  { subtitle: 'Количество читателей', color: '#E81600', title: 0 },
  { subtitle: 'Электронные книги', color: '#E8C300', title: 0 }
])

const statistics = computed(() => {
  if (auth.user.value && auth.user.value.roles.some((obj) => obj.id === 3 || obj.id === 10)) {
    return librarianStatistics.value
  } else if (auth.user.value && auth.user.value.roles.some((obj) => obj.id === 4)) {
    return classroomStatistics.value
  } else if (auth.user.value && auth.user.value.roles.some((obj) => obj.id === 7)) {
    return publisherStatistics.value
  } else if (
    auth.user.value &&
    (auth.user.value.roles.some((obj) => obj.id === 8) ||
      auth.user.value.roles.some((obj) => obj.id === 1))
  ) {
    return ministryStatistics.value
  }
  return []
})

const organizationTypes: Ref<any[]> = ref([])
const selectedOrganizationType: Ref<number | null> = ref(null)

const getOrganizationTypes = async () => {
  const response = await api.fetchData<{ data: { items: any[] } }>('/v1/organization')
  if (response.data) {
    organizationTypes.value = response.data.data.items
  }
}

getOrganizationTypes()

async function downloadPDF(id: any) {
  const response = await api.postData(
    `/v1/book/school/book-state/pdf?book_state_id=${id}`,
    null,
    true
  )
  if (response.data) fileDownload(response.data, `${t('fund_status')}.pdf`)
}

async function downloadMinistryReport(item: any) {
  try {
    const response = await api.fetchFile(`/v1/dashboard/report?school_id=${item.id}`)
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = 'downloaded-file.pdf'
    document.body.appendChild(a)
    a.click()

    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (e) {
    console.error(e)
  }
}

const bookTypesData = ref<{ labels: string[]; data: number[] }>({
  labels: [],
  data: []
})

async function getBookTypes(school_id = null) {
  let request = '/v1/dashboard/book/type'
  if (school_id) {
    request += `?school_id=${school_id}`
  }
  const response = await api.fetchData<{ title: string; amount: number; books: string }[]>(request)
  if (response.data) {
    let labels: string[] = []
    let data: number[] = []
    response.data.forEach((item) => {
      labels.push(`${item.title} (Экземпляров: ${item.amount} / Наименований: ${item.books})`)
      data.push(item.amount)
    })
    bookTypesData.value.labels = labels
    bookTypesData.value.data = data
  }
}

const typesChartData = computed(() => {
  return {
    labels: bookTypesData.value.labels,
    datasets: [
      {
        backgroundColor: ['#0095FF', '#00E096', 'red', '#884DFF', 'orange'],
        data: bookTypesData.value.data
      }
    ]
  }
})

const requests: Ref<any[]> = ref([])

async function getRequests(page = 1) {
  try {
    const response = await api.fetchData<{ data: { items: any[] } }>(
      `/v1/purchase/book/query/school-list?page=${page}`
    )
    if (response.data) {
      requests.value = response.data.data.items
    }
  } catch (e) {
    console.error('Error:', e)
  }
}

function downloadPublisher() {
  const link = document.createElement('a')
  link.href = publisherPDF
  link.download = 'document.pdf'
  link.click()
  document.body.removeChild(link)
}

const downloadSpros = async () => {
  try {
    let regionId = null
    if (selectedRegion.value) regionId = selectedRegion.value.id
    if (selectedChildRegion.value) regionId = selectedChildRegion.value.id
    if (selectedThirdRegion.value) regionId = selectedThirdRegion.value.id
    const response = await api.fetchFile(`/v1/dashboard/ministry/readers?region_id=${regionId}`)
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = 'spros.pdf'
    document.body.appendChild(a)
    a.click()

    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (e) {
    console.error(e)
  }
}

const downloadReport = async () => {
  try {
    let regionId = null
    if (selectedRegion.value) regionId = selectedRegion.value.id
    if (selectedChildRegion.value) regionId = selectedChildRegion.value.id
    if (selectedThirdRegion.value) regionId = selectedThirdRegion.value.id
    const response = await api.fetchFile(`/v1/dashboard/ministry/report?region_id=${regionId}`)
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = 'report.pdf'
    document.body.appendChild(a)
    a.click()

    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (e) {
    console.error(e)
  }
}

const downloadRegionReport = async () => {
  try {
    let regionId = null
    if (selectedRegion.value) regionId = selectedRegion.value.id
    if (selectedChildRegion.value) regionId = selectedChildRegion.value.id
    if (selectedThirdRegion.value) regionId = selectedThirdRegion.value.id
    const response = await api.fetchFile(
      `/v1/dashboard/ministry/regionReport?region_id=${regionId}`
    )
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `regionReport.pdf`
    document.body.appendChild(a)
    a.click()

    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (e) {
    console.error(e)
  }
}

const getClassroomStatistics = async () => {
  try {
    const response = await api.fetchData('/v1/dashboard/classroom/book/apply')
    if (response.data) {
      const { applies, readers, requests, returns } = response.data
      classroomStatistics.value[0].title = readers.value
      classroomStatistics.value[1].title = requests.value
      classroomStatistics.value[2].title = returns.value
      classroomStatistics.value[3].title = applies.value
    }
  } catch (e) {
    console.error(e)
  }
}

interface Purchase {
  id: number
  title: string
  year: number
  description: string
  type: {
    id: number
    title: string
  }
  authors_main: {
    id: number
    name: string
  }[]
  authors: {
    id: number
    name: string
  }[]
  genres: {
    id: number
    title: string
  }[]
  language: {
    id: number
    title: string
  }
  publisher: {
    id: number
    title: string
  }
}

getBookTypes()

const handleDate = () => {
  if (returnDate.value) {
    let value = returnDate.value.replace(/\D/g, '')
    if (value.length >= 3) {
      value = value.slice(0, 2) + '.' + value.slice(2)
    }
    if (value.length >= 6) {
      value = value.slice(0, 5) + '.' + value.slice(5)
    }
    if (value.length >= 10) {
      value = value.slice(0, 10)
    }
    returnDate.value = value
  }
}

const purchases: Ref<Purchase[]> = ref([])

const getBookPurchase = async () => {
  try {
    const response = await api.fetchData<{
      data: { items: Purchase[] }
    }>('/v1/purchase/book')
    if (response.data) {
      purchases.value = response.data.data.items
    }
  } catch (e) {
    console.error('Error:', e)
  }
}

const regionDetails: Ref<
  { key: string; modal: boolean; title: string; value: number | string; sub?: any[] }[]
> = ref([])
const dashboardLanguages: Ref<any[]> = ref([])
const popularBooks: Ref<any[]> = ref([])
const bookTypes: Ref<any[]> = ref([])
const ratings: Ref<any[]> = ref([])
const organizations: Ref<any[]> = ref([])
const bookSchools = ref({
  amount: 0,
  books: 0
})

async function getRegionDetails() {
  regionDetailsLoaded.value = false
  try {
    let url = '/v1/dashboard/ministry/details?1=1'
    if (selectedThirdRegion.value) {
      url += `&region_id=${selectedThirdRegion.value.id}`
    } else if (selectedChildRegion.value) {
      url += `&region_id=${selectedChildRegion.value.id}`
    } else if (selectedRegion.value) {
      url += `&region_id=${selectedRegion.value.id}`
    }

    if (selectedOrganizationType.value) {
      url += `&organization_type=${selectedOrganizationType.value}`
    }

    const response =
      await api.fetchData<
        { key: string; modal: boolean; title: string; value: string; sub?: any[] }[]
      >(url)
    if (response.data) {
      regionDetails.value = response.data
      dashboardLanguages.value = response.data[4].sub ? response.data[4].sub : []
      popularBooks.value = response.data[9].sub ? response.data[9].sub : []
      bookTypes.value = response.data[5].sub ? response.data[5].sub : []
      ratings.value = response.data[11].sub ? response.data[11].sub : []

      if (response.data[10].sub) {
        response.data[10].sub.forEach((item) => {
          let parts = item.value.split('/')
          const value = {
            title: item.title,
            request: parts[0],
            return: parts[1]
          }
          organizations.value.push(value)
        })
      }

      ministryStatistics.value[0].title = Number(response.data[0].value)
      ministryStatistics.value[1].title = Number(response.data[1].value)
      ministryStatistics.value[2].title = Number(response.data[2].value)
      ministryStatistics.value[3].title = Number(response.data[7].value)
      ministryStatistics.value[4].title = Number(response.data[8].value.split('/')[0])
      ministryStatistics.value[5].title = Number(response.data[6].value)

      const bookSchoolData = response.data[3].value.split('/')
      bookSchools.value.amount = parseInt(bookSchoolData[0])
      bookSchools.value.books = parseInt(bookSchoolData[1])

      regionDetailsLoaded.value = true
    }
  } catch (e) {
    console.error('Error:', e)
  }
}

interface Region {
  id: number
  parent_id: number | null
  number: string
  title: string
  region_type: { id: number; title: string }
}

const selectedRegion: Ref<Region | null> = ref(null)
const regions: Ref<Region[]> = ref([])

const selectedChildRegion: Ref<Region | null> = ref(null)
const childRegions: Ref<Region[]> = ref([])

const selectedThirdRegion: Ref<Region | null> = ref(null)
const thirdRegions: Ref<Region[]> = ref([])

const getRegions = async () => {
  try {
    let url = '/v1/region'
    if (selectedChildRegion.value) url += `?parent_id=${selectedChildRegion.value.id}`
    else if (selectedRegion.value) url += `?parent_id=${selectedRegion.value.id}`

    const response = await api.fetchData<{ data: { items: Region[] } }>(url)
    if (response.data) {
      if (regions.value.length === 0) regions.value = response.data.data.items
      else if (childRegions.value.length === 0) childRegions.value = response.data.data.items
      else thirdRegions.value = response.data.data.items
    }
  } catch (e) {
    console.error('Error:', e)
  }
}

const selectPreview = async (school_id: null | string) => {
  await getBookStates(school_id)
  await getUserAges(school_id)
  await getInventory(school_id)
  await getPublishers(school_id)
  await getBookTypes(school_id)
  await getDashboard(school_id)
  await getReaders(school_id)
}

const schools: Ref<any[]> = ref([])
const schoolPage = ref(1)
const schoolLength = ref(1)
const schoolSearch = ref(null)
const schoolSearchName = ref(null)
const getSchools = async (search: string | null = null, name: string | null = null) => {
  try {
    let request = `/v1/school?page=${schoolPage.value}`
    if (search) {
      request += `&document_ID=${search}`
    }
    if (name) {
      request += `&search=${name}`
    }
    if (selectedThirdRegion.value) request += `&region_id=${selectedThirdRegion.value.id}`
    else if (selectedChildRegion.value) request += `&region_id=${selectedChildRegion.value.id}`
    else if (selectedRegion.value) request += `&region_id=${selectedRegion.value.id}`

    if (selectedOrganizationType.value)
      request += `&organization_id=${selectedOrganizationType.value}`

    const response = await api.fetchData<{ data: { items: any[] }; meta: { last_page: number } }>(
      request
    )
    if (response.data) {
      schools.value = response.data.data.items
      schoolLength.value = response.data.meta.last_page
    }
  } catch (e) {
    console.error('Error:', e)
  }
}

watch(schoolPage, () => {
  getSchools(schoolSearch.value, schoolSearchName.value)
})

watch(schoolSearch, (value) => {
  getSchools(value, schoolSearchName.value)
})

watch(schoolSearchName, (value) => {
  getSchools(schoolSearch.value, value)
})

const regionDetailsLoaded: Ref<boolean> = ref(false)  
const dashboard: Ref<any> = ref(null)

const getDashboard = async (school_id = null) => {
  let request = '/v1/dashboard'
  if (school_id) {
    request += `?school_id=${school_id}`
  }
  try {
    const response = await api.fetchData<{
      books: { base: number; fund: number; items: number; amount: number; decommissioned: number }
    }>('/v1/dashboard')
    if (response.data) {
      dashboard.value = response.data
      librarianStatistics.value[0].title = response.data.books['base']
      librarianStatistics.value[1].title = response.data.books['fund']
      librarianStatistics.value[2].title = response.data.books['items']
      librarianStatistics.value[3].title = response.data.books['amount']
      librarianStatistics.value[4].title = response.data.books['decommissioned']
    }
  } catch (e) {
    console.error('Error:', e)
  }
}

const subscriptions: Ref<any[]> = ref([])
const searchItems: Ref<any[]> = ref([])
const searchSubscription: Ref<string | null> = ref(null)
const userId = ref('')

const searchSubscriptions = async (search: string = '') => {
  let url = `/v1/subscription?search=${search}`
  const response = await api.fetchData<{ data: { items: any[] } }>(url)
  if (response.data) searchItems.value = response.data.data.items
}
const getSubscriptions = async () => {
  let url = '/v1/subscription'
  if (searchSubscription.value && searchSubscription.value.length > 0)
    url += `?search=${searchSubscription.value}`
  const response = await api.fetchData<{ data: { items: any[] } }>(url)
  if (response.data) subscriptions.value = response.data.data.items
}

const drawer: Ref<boolean> = ref(false)

const autocompleteRef = ref(null)
const selectItem = (item: any) => {
  searchSubscription.value =
    item.user.user_data.lastname +
    ' ' +
    item.user.user_data.firstname +
    ' ' +
    item.user.user_data.fathername
      ? item.user.user_data.fathername
      : ''
  userId.value = item.user_id
  autocompleteRef.value.blur()
}

const startRequest = async (item: any) => {
  drawer.value = true
  searchSubscription.value =
    item.user.user_data.lastname +
    ' ' +
    item.user.user_data.firstname +
    ' ' +
    item.user.user_data.fathername
      ? item.user.user_data.fathername
      : ''
}

const inventory = ref([])
const selectedInventory = ref(null)
const selectedUnit = ref(null)
const returnDate: Ref<string | null> = ref(null)
const bookStates: Ref<any[]> = ref([])
const showAdditionalData = ref(false)
const inventoryLoading = ref(false)
const getBookStates = async (school_id = null) => {
  let request = '/v1/book/state'
  if (school_id) {
    request += `&school_id=${school_id}`
  }
  try {
    const response = await api.fetchData<{ data: { items: any[] } }>(request)
    if (response.data) bookStates.value = response.data.data.items
  } catch (e) {
    console.error('Error:', e)
  }
}

const quarter = ref(null)
const requestAmount = ref(0)

const getInventory = async (school_id: undefined) => {
  inventoryLoading.value = true
  let request = '/v1/book/school?book_inventory=1'
  if (school_id) {
    request += `&school_id=${school_id}`
  }
  try {
    const response = await api.fetchData(request)
    if (response.data) {
      inventory.value = response.data.data.items
    }
    inventoryLoading.value = false
  } catch (e) {
    console.error('Error:', e)
  }
}

const closeDrawer = () => {
  searchSubscription.value = ''
  drawer.value = false
}

function formatDate(dateToFormat: string) {
  const date = new Date(dateToFormat)
  const day = date.getDate().toString().length > 1 ? date.getDate() : '0' + date.getDate()
  const month =
    (date.getMonth() + 1).toString().length > 1 ? date.getMonth() + 1 : '0' + date.getMonth()
  return `${day}.${month}.${date.getFullYear()}`
}

const errorText = ref('')
const snackbar = ref(false)

const createRequest = async () => {
  try {
    const requestBody = {
      user_id: userId.value,
      book_school_id: selectedInventory.value.id,
      book_inventory_id: selectedUnit.value.id,
      return_date: returnDate.value
    }

    if (requestAmount.value && requestAmount.value > 0) {
      requestBody['amount'] = requestAmount.value
    }

    if (quarter.value) {
      requestBody['quarter'] = quarter.value
    }

    await api.postData('/v1/subscription/request', requestBody)
  } catch (e) {
    snackbar.value = true
    errorText.value = String(e)
  }

  searchSubscription.value = ''
  selectedInventory.value = null
  selectedUnit.value = null
  returnDate.value = null
  requestAmount.value = null
  quarter.value = null

  drawer.value = false
}

const getPublisherDashboard = async (publisherId: number) => {
  try {
    const response = await api.fetchData(
      `/v1/dashboard/publisher/list?publisher_id=${auth.user.value?.id}`
    )
    if (response.data) {
      const { fundCount, totalAmount, bookCount } = response.data
      publisherStatistics.value[0].title = bookCount
      publisherStatistics.value[1].title = fundCount
      publisherStatistics.value[2].title = totalAmount
    }
  } catch (e) {
    console.log(e)
  }
}

if (role.value === 8 || role.value === 1) {
  getBookPurchase()
  getRequests()
  getSchools()
  getRegions()
  getDashboard()
}

if (role.value === 7) {
  getPublisherDashboard(2)
}

watch(selectedRegion, () => {
  getRegions()
  getSchools()
  getRegionDetails()
})

watch(selectedChildRegion, () => {
  getRegions()
  getSchools()
  getRegionDetails()
})

watch(selectedThirdRegion, () => {
  getSchools()
  getRegionDetails()
})

watch(selectedOrganizationType, () => {
  getRegions()
  getSchools()
  getRegionDetails()
})

if (role.value === 3 || role.value === 10) {
  getDashboard()
}

if (role.value === 4 || role.value === 11) {
  getClassroomStatistics()
}

getBookStates()
getFundState()
getPublishers()
getUserAges()
getSubscriptions()
getInventory()

// Add these refs at the top of the script section
const page = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)
const subscription = ref([])

// Add these functions
async function getSubscription() {
  try {
    const response = await api.fetchData(
      `/v1/subscription/user/${auth.user.value?.id}?page=${page.value}&per_page=${itemsPerPage.value}`
    )
    if (response.data) {
      subscription.value = response.data.data.items
      totalItems.value = response.data.data.total
    }
  } catch (e) {
    console.error('Error:', e)
  }
}

watch(page, () => {
  getSubscription()
})

onMounted(() => {
  getSubscription()
  if (role.value === 5) {
    router.push({ name: 'readers-panel' })
  }
})

const subscriptionHeaders = [
  { key: 'id', title: 'ID' },
  { key: 'name', title: t('book') },
  { key: 'activity', title: t('activity') },
  { key: 'logs', title: t('history') },
  { key: 'actions', title: t('actions') }
]

// Add the table markup after the profile card

function formatDateTime(date: string) {
  if (!date) return ''
  return new Date(date).toLocaleString()
}

const newDate = ref('')

function formatDateForReturn(dateToFormat: string) {
  const parts = dateToFormat.split('-')
  const year = parts[0]
  const month = parts[1]
  const day = parts[2]
  return `${day}.${month}.${year}`
}

const changeDate = async (subscriptionId: number) => {
  try {
    const returnDateBody = {
      subscription_id: subscriptionId,
      return_date: formatDateForReturn(newDate.value)
    }
    await api.putData('/v1/subscription/return-date', returnDateBody)
    await getSubscription()
  } catch (e) {
    console.error('Error:', e)
  }
}

const activateReturn = async (id: number) => {
  try {
    await api.postData('/v1/subscription/return', {
      subscription_id: id,
      user_id: auth.user.value?.id
    })
    await getSubscription()
  } catch (e) {
    console.error('Error:', e)
  }
}

const maskedIin = ref(true)

const toggleIinVisibility = () => {
  maskedIin.value = !maskedIin.value
}

const formatIin = (iin: string | undefined) => {
  if (!iin) return ''
  return maskedIin.value ? iin.replace(/(\d{6})(\d{6})/, '******$2') : iin
}

const issuedReturnedCount = computed(() => {
  if (!subscription.value) return { issued: 0, returned: 0 }

  return subscription.value.reduce(
    (acc, item) => {
      if (item.status === 'return') {
        acc.returned++
      } else if (item.status === 'request') {
        acc.issued++
      }
      return acc
    },
    { issued: 0, returned: 0 }
  )
})
</script>

<template>
  <main>
    <v-container :fluid="role === 8 || role === 1">
      <v-snackbar
        v-model="snackbar"
        :text="errorText"
        :timeout="10000"
        color="primary"
      ></v-snackbar>
      <v-navigation-drawer v-model="drawer" location="right" temporary width="600">
        <v-list-item>
          <span class="font-weight-bold">{{ t('issue_of_book') }}</span>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item>
          <v-autocomplete
            v-model="selectedInventory"
            :items="inventory"
            class="mt-4"
            item-title="book.title"
            :label="t('book')"
            :placeholder="t('select_book')"
            return-object
            variant="outlined"
          ></v-autocomplete>
        </v-list-item>
        <v-list-item>
          <v-autocomplete
            v-model="selectedUnit"
            :disabled="!selectedInventory"
            :items="selectedInventory ? selectedInventory.book_inventory : []"
            class="mt-2"
            item-title="inventory"
            :label="t('inventory')"
            return-object
            variant="outlined"
          ></v-autocomplete>
        </v-list-item>
        <v-list-item>
          <v-text-field
            v-model="returnDate"
            class="mt-4"
            :label="t('return_date')"
            :placeholder="t('select_date')"
            type="text"
            @input="handleDate"
            variant="outlined"
          ></v-text-field>
        </v-list-item>
        <v-list-item>
          <v-btn
            :append-icon="showAdditionalData ? 'mdi-minus' : 'mdi-plus'"
            class="mt-2"
            color="primary"
            variant="text"
            @click="showAdditionalData = !showAdditionalData"
            >{{ t('extended_data') }}
          </v-btn>
        </v-list-item>
        <v-list-item v-if="showAdditionalData">
          <v-select
            v-model="quarter"
            :items="[
              { value: 1, title: t('first_quarter') },
              { value: 2, title: t('second_quarter') },
              { value: 3, title: t('third_quarter') },
              { value: 4, title: t('fourth_quarter') }
            ]"
            :label="t('quarter')"
            variant="outlined"
          >
          </v-select>
        </v-list-item>
        <v-list-item v-if="showAdditionalData">
          <v-text-field
            v-model="requestAmount"
            class="mt-2"
            :label="t('quantity')"
            type="number"
            variant="outlined"
          ></v-text-field>
        </v-list-item>
        <v-list-item class="mt-3">
          <v-btn class="mr-3" variant="tonal" @click="closeDrawer">{{ t('close') }}</v-btn>
          <v-btn color="primary" variant="flat" @click="createRequest">{{ t('issue') }}</v-btn>
        </v-list-item>
      </v-navigation-drawer>

      <v-row>
        <v-col>
          <div class="text-h5 font-weight-bold">{{ t('dashboard') }}</div>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <v-banner v-if="role !== 8" bg-color="#2752E7" rounded>
            <template v-slot:prepend>
              <v-avatar color="white" icon="mdi-hand-wave"></v-avatar>
            </template>

            <v-banner-text>
              <div class="text-h6">
                {{ t('welcome') }},
                {{ auth.user.value ? auth.user.value.user_data.firstname : '' }}
              </div>
              <p>{{ t('digital_library_system') }}</p>
              <div class="white-line"></div>
              <p>{{ dashboard?.school?.name }}</p>
            </v-banner-text>
          </v-banner>
          <v-banner v-else bg-color="white" rounded>
            <v-row>
              <v-col>
                <div class="text-h6">
                  {{ t('welcome') }},
                  {{ auth.user.value ? auth.user.value.user_data.firstname : '' }}
                </div>
              </v-col>
              <v-col>
                <div class="w-100 d-flex justify-center">
                  <v-dialog max-width="80vw">
                    <template v-slot:activator="{ props }">
                      <v-btn size="small" v-bind="props" variant="tonal">{{ t('requests') }}</v-btn>
                    </template>

                    <template v-slot:default>
                      <v-card :title="t('requests')">
                        <v-data-table
                          :headers="[
                            { key: 'id', title: 'ID' },
                            { key: 'school.title', title: t('name') },
                            { key: 'school.bin', title: 'БИН' },
                            { key: 'school.address', title: t('address') },
                            { key: 'user', title: t('request_and_book_titles') }
                          ]"
                          :items="requests"
                        >
                          <template v-slot:[`item.user`]="{ item }">
                            <div class="d-flex flex-row align-center justify-space-between">
                              <div class="d-flex flex-column">
                                <span>{{ item.user.fullname }}</span>
                                <span>{{ item.user.email }}</span>
                                <span>{{ item.user.phone }}</span>
                              </div>
                              <v-btn color="warning" disabled size="x-small" variant="flat"
                                >{{ t('fund_request') }} {{ item.amount }}
                              </v-btn>
                            </div>
                          </template>

                          <template v-slot:bottom></template>
                        </v-data-table>
                      </v-card>
                    </template>
                  </v-dialog>

                  <v-dialog max-width="80vw">
                    <template v-slot:activator="{ props }">
                      <v-btn class="mx-3" size="small" v-bind="props" variant="tonal"
                        >Список книг
                      </v-btn>
                    </template>

                    <template v-slot:default>
                      <v-card :title="t('book_list')">
                        <v-card-text>
                          <v-data-table
                            :headers="[
                              { key: 'id', title: 'ID' },
                              { key: 'book', title: t('name') },
                              { key: 'info', title: `${t('author')}/${t('genre')}` },
                              { key: 'year', title: t('year_of_publication') },
                              { key: 'publisherType', title: `${t('publisher')}/${t('type')}` }
                            ]"
                            :items="purchases"
                          >
                            <template v-slot:[`item.book`]="{ item }">
                              <div class="font-weight-bold mt-2">{{ item.title }}</div>
                              <div class="my-2">{{ item.description }}</div>
                              <div class="mb-2">
                                <v-chip size="small">{{ item.language.title }}</v-chip>
                              </div>
                            </template>

                            <template v-slot:[`item.info`]="{ item }">
                              <div>
                                <v-chip
                                  v-for="author in item.authors_main"
                                  :key="author.id"
                                  color="primary"
                                  variant="outlined"
                                >
                                  {{ author.name }}
                                </v-chip>
                              </div>
                              <div class="mt-2">
                                <v-chip
                                  v-for="genre in item.genres"
                                  :key="genre.id"
                                  color="red"
                                  size="small"
                                  variant="flat"
                                >
                                  {{ genre.title }}
                                </v-chip>
                              </div>
                            </template>

                            <template v-slot:[`item.publisherType`]="{ item }">
                              <div>{{ item.publisher.title }}</div>
                              <div class="mt-2">
                                <v-chip color="red" size="small" variant="flat"
                                  >{{ item.type.title }}
                                </v-chip>
                              </div>
                            </template>

                            <template v-slot:bottom></template>
                          </v-data-table>
                        </v-card-text>
                      </v-card>
                    </template>
                  </v-dialog>

                  <v-dialog max-width="80vw">
                    <template v-slot:activator="{ props }">
                      <v-btn size="small" v-bind="props" variant="tonal"
                        >Добавить книгу в список
                      </v-btn>
                    </template>

                    <template v-slot:default>
                      <v-card title="Добавление книги">
                        <v-data-table>
                          <template v-slot:bottom></template>
                        </v-data-table>
                      </v-card>
                    </template>
                  </v-dialog>
                </div>
              </v-col>
              <v-col cols="5">
                <v-btn size="small" variant="outlined" @click="downloadSpros"
                  >Читательский спрос
                </v-btn>
                <v-btn
                  class="ml-3"
                  color="primary"
                  size="small"
                  variant="flat"
                  @click="downloadReport"
                  >Отчет по региону</v-btn
                >
                <v-btn
                  class="ml-3"
                  color="primary"
                  size="small"
                  variant="flat"
                  @click="downloadRegionReport"
                  >Отчет по району</v-btn
                >
              </v-col>
            </v-row>
          </v-banner>
        </v-col>
      </v-row>

      <v-card v-if="role === 8 || role === 1" class="my-4">
        <v-card-text>
          <v-row>
            <v-col cols="4">
              <v-select
                v-model="selectedRegion"
                :items="regions"
                label="Выберите регион"
                return-object
                variant="outlined"
              ></v-select>
            </v-col>
            <v-col cols="4">
              <v-select
                v-if="selectedRegion"
                v-model="selectedChildRegion"
                :items="childRegions"
                label="Выберите регион"
                return-object
                variant="outlined"
              ></v-select>
            </v-col>
            <v-col cols="4">
              <v-select
                v-if="selectedChildRegion"
                v-model="selectedThirdRegion"
                :items="thirdRegions"
                label="Выберите регион"
                return-object
                variant="outlined"
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-card v-if="role === 8 || role === 1" class="my-4">
        <v-card-text>
          <v-row>
            <v-col>
              <v-select
                v-model="selectedOrganizationType"
                item-title="label"
                item-value="id"
                label="Выберите тип организации"
                :items="organizationTypes"
                hide-details
                variant="outlined"
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-row v-if="(role === 8 || role === 1) && regionDetailsLoaded">
        <v-col cols="3">
          <StatisticsList :statistics="statistics"></StatisticsList>
        </v-col>
        <v-col cols="9">
          <v-row>
            <v-col cols="7">
              <v-card title="Количество книг в фонде">
                <v-card-text>
                  <v-row>
                    <v-col cols="6">
                      <Pie :data="pieChartData" :options="options"></Pie>
                    </v-col>
                    <v-col cols="6">
                      <div class="d-flex flex-column">
                        <div class="font-weight-bold">
                          {{ t('copies') }}: {{ bookSchools.amount }}
                        </div>
                        <v-progress-linear
                          :model-value="bookSchools.amount"
                          color="#0095FF"
                        ></v-progress-linear>
                        <div class="mt-4 font-weight-bold">
                          Наименований: {{ bookSchools.books }}
                        </div>
                        <v-progress-linear
                          :model-value="bookSchools.books"
                          color="#00E096"
                        ></v-progress-linear>
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="5">
              <v-card title="Количество экземпляров по языкам">
                <v-card-text>
                  <v-data-table
                    :headers="[
                      {
                        key: 'title',
                        title: t('language')
                      },
                      { key: 'value', title: 'Экз./наим.' }
                    ]"
                    :items="dashboardLanguages"
                    items-per-page="3"
                  >
                    <template v-slot:bottom></template>
                  </v-data-table>
                </v-card-text>
                <v-card-actions>
                  <v-dialog max-width="70vw">
                    <template v-slot:activator="{ props }">
                      <v-btn color="primary" v-bind="props" variant="flat">{{
                        t('details')
                      }}</v-btn>
                    </template>

                    <template v-slot:default>
                      <v-card title="Количество экземпляров по языкам">
                        <v-card-text>
                          <v-data-table
                            :headers="[
                              {
                                key: 'title',
                                title: t('language')
                              },
                              { key: 'value', title: 'Экз./наим.' }
                            ]"
                            :items="dashboardLanguages"
                            items-per-page="50"
                          >
                            <template v-slot:bottom></template>
                          </v-data-table>
                        </v-card-text>
                      </v-card>
                    </template>
                  </v-dialog>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="4">
              <v-card title="Наименования по типу книг">
                <v-card-text>
                  <v-data-table
                    :headers="[
                      {
                        key: 'title',
                        title: t('book_type')
                      },
                      { key: 'value', title: t('quantity') }
                    ]"
                    :items="bookTypes"
                    items-per-page="3"
                  >
                    <template v-slot:bottom></template>
                  </v-data-table>
                </v-card-text>
                <v-card-actions color="primary" variant="flat">
                  <v-dialog max-width="70vw">
                    <template v-slot:activator="{ props }">
                      <v-btn color="primary" v-bind="props" variant="flat">{{
                        t('details')
                      }}</v-btn>
                    </template>

                    <template v-slot:default>
                      <v-card title="Наименования по типу книг">
                        <v-card-text>
                          <v-data-table
                            :headers="[
                              {
                                key: 'title',
                                title: t('book_type')
                              },
                              { key: 'value', title: t('quantity') }
                            ]"
                            :items="bookTypes"
                            items-per-page="50"
                          >
                            <template v-slot:bottom></template>
                          </v-data-table>
                        </v-card-text>
                      </v-card>
                    </template>
                  </v-dialog>
                </v-card-actions>
              </v-card>
            </v-col>
            <v-col cols="8">
              <v-card title="Популярные книги">
                <v-card-text>
                  <v-data-table
                    :headers="[
                      {
                        key: 'title',
                        title: t('name')
                      },
                      { key: 'value', title: t('quantity') }
                    ]"
                    :items="popularBooks"
                    items-per-page="3"
                  >
                    <template v-slot:bottom></template>
                  </v-data-table>
                </v-card-text>
                <v-card-actions>
                  <v-dialog max-width="70vw">
                    <template v-slot:activator="{ props }">
                      <v-btn color="primary" v-bind="props" variant="flat">{{
                        t('details')
                      }}</v-btn>
                    </template>

                    <template v-slot:default>
                      <v-card title="Популярные книги">
                        <v-card-text>
                          <v-data-table
                            :headers="[
                              {
                                key: 'title',
                                title: t('name')
                              },
                              { key: 'value', title: t('quantity') }
                            ]"
                            :items="popularBooks"
                            items-per-page="50"
                          >
                            <template v-slot:bottom></template>
                          </v-data-table>
                        </v-card-text>
                      </v-card>
                    </template>
                  </v-dialog>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-row v-if="(role === 8 || role === 1) && regionDetailsLoaded">
        <v-col>
          <v-card title="Организации по выдаче">
            <v-card-text>
              <v-data-table
                :headers="[
                  {
                    key: 'title',
                    title: 'Организация'
                  },
                  { key: 'request', title: 'Выдача' },
                  { key: 'return', title: 'Возврат' }
                ]"
                :items="organizations"
                items-per-page="3"
              >
                <template v-slot:bottom></template>
              </v-data-table>
            </v-card-text>
            <v-card-actions>
              <v-dialog max-width="70vw">
                <template v-slot:activator="{ props }">
                  <v-btn color="primary" v-bind="props" variant="flat">{{ t('details') }}</v-btn>
                </template>

                <template v-slot:default>
                  <v-card title="Организации по выдаче">
                    <v-card-text>
                      <v-data-table
                        :headers="[
                          {
                            key: 'title',
                            title: 'Организация'
                          },
                          { key: 'request', title: 'Выдача' },
                          { key: 'return', title: 'Возврат' }
                        ]"
                        :items="organizations"
                        items-per-page="50"
                      >
                        <template v-slot:bottom></template>
                      </v-data-table>
                    </v-card-text>
                  </v-card>
                </template>
              </v-dialog>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col>
          <v-card title="Списанные книги по рейтингу">
            <v-card-text>
              <v-data-table
                :headers="[
                  {
                    key: 'title',
                    title: t('name')
                  },
                  { key: 'value', title: t('quantity') }
                ]"
                :items="ratings"
                items-per-page="3"
              >
                <template v-slot:bottom></template>
              </v-data-table>
            </v-card-text>
            <v-card-actions>
              <v-dialog max-width="70vw">
                <template v-slot:activator="{ props }">
                  <v-btn color="primary" v-bind="props" variant="flat">{{ t('details') }}</v-btn>
                </template>

                <template v-slot:default>
                  <v-card title="Списанные книги по рейтингу">
                    <v-card-text>
                      <v-data-table
                        :headers="[
                          {
                            key: 'title',
                            title: t('name')
                          },
                          { key: 'value', title: t('quantity') }
                        ]"
                        :items="ratings"
                        items-per-page="50"
                      >
                        <template v-slot:bottom></template>
                      </v-data-table>
                    </v-card-text>
                  </v-card>
                </template>
              </v-dialog>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-if="role !== 8 && role !== 1">
        <v-col cols="3">
          <StatisticsList :statistics="statistics"></StatisticsList>
        </v-col>
        <v-col v-if="role === 3 || role === 10" cols="6">
          <!-- <v-card>
            <v-card-title>{{ t('issue_return_statistics') }}</v-card-title>
            <v-card-subtitle>{{ t('easy_to_track_statistics') }}</v-card-subtitle>

            <v-card-text>
              <v-container fluid>
                <v-row>
                  <v-col>
                    <Doughnut :data="doughnut" :options="options"></Doughnut>
                  </v-col>
                  <v-col>
                    <v-list>
                      <v-list-item>
                        <v-list-item-title>
                          <strong>Показатели</strong>
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title>
                          <div class="d-flex flex-column">
                            <strong>Годовой</strong>
                          </div>
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title>
                          <div class="d-flex flex-column">
                            <strong>Годовой</strong>
                          </div>
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title>
                          <div class="d-flex flex-column">
                            <strong>Выдача</strong>
                          </div>
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
          </v-card> -->
          <v-card style="height: 450px">
            <v-card-title>Фонд библиотеки</v-card-title>

            <v-card-text>
              <v-container fluid>
                <v-row>
                  <v-col cols="12">
                    <div>
                      <Doughnut
                        style="height: 350px"
                        :data="typesChartData"
                        :options="chartOptions"
                      />
                    </div>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col v-if="role === 3 || role === 10" cols="3">
          <v-card style="height: 450px; overflow: auto">
            <v-card-title>{{ t('reception') }}</v-card-title>
            <v-card-subtitle>{{ t('last_fund_updates') }}</v-card-subtitle>

            <v-card-text>
              <InventoryTable :inventory="inventory" :loading="inventoryLoading"></InventoryTable>
              <!-- <v-autocomplete
                ref="autocompleteRef"
                v-model="searchSubscription"
                :items="searchItems"
                :label="t('enter_iin')"
                no-filter
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                @update:search="searchSubscriptions"
              ></v-autocomplete>
              <v-data-table
                :headers="[
                  { title: t('full_name'), key: 'name' },
                  { title: t('quantity'), key: 'amount' }
                ]"
                :items="subscriptions"
                items-per-page="5"
              >
                <template v-slot:[`item.name`]="{ item }">
                  <small>
                    {{ item.user.user_data.lastname }} {{ item.user.user_data.firstname }}
                    {{ item.user.user_data.fathername }}
                  </small>
                </template>
                <template v-slot:[`item.amount`]="{ item }">
                  <small>
                    {{
                      parseInt(item.subscriptions.requests) + parseInt(item.subscriptions.returns)
                    }}
                  </small>
                </template>
                <template v-slot:bottom></template>
              </v-data-table> -->
            </v-card-text>
          </v-card>
        </v-col>

        <v-col v-if="role === 4 || role === 11">
          <v-card title="Список">
            <v-card-text>
              <v-data-table :headers="classroomHeaders" :items="classroomItems">
                <template v-slot:[`item.actions`]="{}">
                  <v-btn append-icon="mdi-chevron-right" color="primary" variant="text"
                    >{{ t('details') }}
                  </v-btn>
                </template>
                <template v-slot:bottom></template>
              </v-data-table>
            </v-card-text>

            <v-card-actions>
              <v-btn color="primary" variant="flat">{{ t('details') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col v-if="role === 4 || role === 11" cols="3">
          <v-card>
            <v-card-title>Заявки на класс</v-card-title>
            <v-card-subtitle>Выдача на класс</v-card-subtitle>

            <v-card-text>
              <v-autocomplete label="Для кого" variant="outlined"></v-autocomplete>
              <v-autocomplete
                :label="t('book')"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
              ></v-autocomplete>
              <v-text-field
                :label="t('issue_date')"
                prepend-inner-icon="mdi-magnify"
                type="date"
                variant="outlined"
              ></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" variant="flat">Заявка</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col v-if="role === 7" cols="4">
          <v-card :title="t('written_off')">
            <v-card-text>
              <v-data-table :headers="publisherTableHeaders" :items="publisherTableItems">
                <template v-slot:bottom></template>
              </v-data-table>
            </v-card-text>

            <v-card-actions>
              <v-btn color="primary" variant="flat">{{ t('details') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-if="role === 7">
        <v-col>
          <v-card title="По регионам">
            <v-card-text>
              <v-data-table
                :headers="[
                  { key: 'title', title: t('name') },
                  { key: 'count', title: t('book_titles') },
                  { key: 'amount', title: t('book_copies') },
                  { key: 'actions' }
                ]"
                :items="[
                  { title: 'Алматы', count: 234, amount: 7523 },
                  { title: 'Астана', count: 53, amount: 1035 },
                  { title: 'Шымкент', count: 0, amount: 0 },
                  { title: 'ВКО', count: 0, amount: 0 },
                  { title: 'СКО', count: 9, amount: 324 },
                  { title: 'Актау', count: 0, amount: 0 }
                ]"
              >
                <template v-slot:[`item.actions`]>
                  <v-btn append-icon="mdi-chevron-right" color="primary" variant="text"
                    >{{ t('details') }}
                  </v-btn>
                </template>
                <template v-slot:bottom></template>
              </v-data-table>
            </v-card-text>

            <v-card-actions>
              <v-btn color="primary" variant="flat" @click="downloadPublisher">{{
                t('details')
              }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col>
          <v-card title="Соотношение по выдачу и возрату">
            <v-card-text>
              <v-data-table
                :headers="[
                  { key: 'title', title: t('name') },
                  { key: 'requests', title: 'На выдаче' },
                  { key: 'returns', title: 'Читательный зал' }
                ]"
                :items="[
                  { title: 'Школа 1', requests: 25, returns: 100 },
                  { title: 'Школа 2', requests: 25, returns: 100 },
                  { title: 'Школа 3', requests: 25, returns: 100 },
                  { title: 'Школа 4', requests: 25, returns: 100 },
                  { title: 'Школа 5', requests: 25, returns: 100 },
                  { title: 'Школа 6', requests: 25, returns: 100 }
                ]"
              >
                <template v-slot:bottom></template>
              </v-data-table>
            </v-card-text>

            <v-card-actions>
              <v-btn color="primary" variant="flat">{{ t('details') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-if="role === 7">
        <v-col>
          <v-card :title="t('issue_return')">
            <v-card-text>
              <PublisherTable></PublisherTable>
            </v-card-text>

            <v-card-actions>
              <v-btn color="primary" variant="flat">{{ t('details') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-if="role === 3 || role === 10">
        <v-col cols="3">
          <CountryModal></CountryModal>
        </v-col>
        <v-col>
          <v-card>
            <v-card-title>{{ t('readers_by_age') }}</v-card-title>

            <v-card-text>
              <Pie :data="agesChartData" :options="options" />
            </v-card-text>

            <v-card-actions>
              <AgesModal></AgesModal>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="4" v-if="!isCollege">
          <v-card>
            <v-card-title> {{ t('classes_by_number_of_readers') }}</v-card-title>

            <v-card-text>
              <v-data-table items-per-page="5" :headers="headers" :items="readers">
                <template v-slot:[`item.classroom`]="{ item }">
                  {{ item.classroom }} класс
                </template>
                <template v-slot:bottom></template>
              </v-data-table>
            </v-card-text>

            <v-card-actions>
              <ClassModalVue></ClassModalVue>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
      <v-row v-if="role === 3 || role === 10">
        <v-col cols="12">
          <LibraryStateCard />
        </v-col>
      </v-row>
      <v-row v-if="role === 3 || role === 10">
        <v-col>
          <v-card>
            <v-card-title>{{ t('fund_status') }}</v-card-title>

            <v-card-text>
              <v-data-table :headers="fundHeaders" :items="fund ? fund : []" :loading="fundLoading">
                <template v-slot:bottom></template>

                <template v-slot:[`item.actions`]="{ item }">
                  <v-btn color="primary" variant="text" @click="downloadPDF(item.id)">
                    {{ t('details') }}
                    <template v-slot:append>
                      <v-icon color="primary" icon="mdi-chevron-right"></v-icon>
                    </template>
                  </v-btn>
                </template>
              </v-data-table>
            </v-card-text>

            <v-card-actions>
              <FundModalVue></FundModalVue>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col>
          <v-card>
            <v-card-title>{{ t('publishers') }}</v-card-title>

            <v-card-text>
              <v-data-table
                :headers="publisherHeaders"
                :items="publishers ? publishers : []"
                :loading="publishersLoading"
              >
                <template v-slot:bottom></template>
              </v-data-table>
            </v-card-text>

            <v-card-actions>
              <PublishersModal></PublishersModal>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-if="role === 4 || role === 11">
        <v-col>
          <v-card>
            <v-card-title>История заявок</v-card-title>
            <v-card-text>
              <HistoryTable></HistoryTable>
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" variant="flat">{{ t('details') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- <v-row v-if="role === 3 || role === 7">
        <v-col>
          <v-card>
            <v-card-title>{{ t('issue_return') }}</v-card-title>

            <v-card-text>
              <SubscriptionTable></SubscriptionTable>
            </v-card-text>

            <v-card-actions>
              <v-btn color="primary" variant="flat">{{ t('details') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row> -->

      <v-row v-if="role === 8 || role === 1">
        <v-col cols="12">
          <v-card>
            <v-card-text>
              <v-data-table
                :headers="[
                  { key: 'id', title: 'ID' },
                  { key: 'name', title: t('name') },
                  { key: 'description.bin', title: 'БИН' },
                  { key: 'description.address', title: t('address') },
                  { key: 'organization.label', title: 'Тип организации' },
                  { key: 'report', title: 'Отчет' },
                  { key: 'actions', title: '' }
                ]"
                :items="schools"
              >
                <template v-slot:[`item.report`]="{ item }">
                  <!-- <v-btn
                    class="rounded"
                    color="primary"
                    prepend-icon="mdi-download"
                    variant="flat"
                    @click="downloadMinistryReport(item)"
                  >
                    {{ t('download_pdf') }}
                  </v-btn> -->
                </template>
                <template v-slot:[`item.actions`]="{ item }">
                  <v-dialog max-width="90vw">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        @click="selectPreview(item.id)"
                        prepend-icon="mdi-arrow-right"
                        v-bind="props"
                        variant="outlined"
                        >{{ t('go_to') }}
                      </v-btn>
                    </template>

                    <template v-slot:default>
                      <v-card>
                        <v-card-text>
                          <v-tabs v-model="tab" color="primary">
                            <v-tab :value="1">Данные по библиотеке</v-tab>
                            <v-tab :value="2">Данные поступлениям</v-tab>
                          </v-tabs>
                          <v-window v-model="tab">
                            <v-window-item :value="1">
                              <v-container fluid>
                                <v-row>
                                  <v-col cols="3">
                                    <StatisticsList
                                      :statistics="librarianStatistics"
                                      class="border"
                                    ></StatisticsList>
                                  </v-col>
                                  <v-col cols="6">
                                    <v-card>
                                      <v-card-title>Фонд библиотеки</v-card-title>

                                      <v-card-text>
                                        <v-container fluid>
                                          <v-row>
                                            <v-col cols="12">
                                              <Pie :data="typesChartData"></Pie>
                                            </v-col>
                                          </v-row>
                                        </v-container>
                                      </v-card-text>
                                    </v-card>
                                  </v-col>
                                </v-row>

                                <v-row>
                                  <v-col cols="3">
                                    <CountryModal class="border"></CountryModal>
                                  </v-col>
                                  <v-col>
                                    <v-card>
                                      <v-card-title>{{ t('readers_by_age') }}</v-card-title>

                                      <v-card-text>
                                        <Pie :data="agesChartData" :options="options" />
                                      </v-card-text>

                                      <v-card-actions>
                                        <AgesModal></AgesModal>
                                      </v-card-actions>
                                    </v-card>
                                  </v-col>
                                  <v-col cols="4">
                                    <v-card class="border">
                                      <v-card-title>
                                        {{ t('classes_by_number_of_readers') }}</v-card-title
                                      >

                                      <v-card-text>
                                        <v-data-table
                                          :headers="headers"
                                          :items="readers"
                                          items-per-page="5"
                                          hide-footer
                                        >
                                          <template v-slot:bottom></template>
                                        </v-data-table>
                                      </v-card-text>

                                      <v-card-actions>
                                        <ClassModalVue></ClassModalVue>
                                      </v-card-actions>
                                    </v-card>
                                  </v-col>
                                </v-row>
                                <v-row>
                                  <v-col>
                                    <v-card title="Состояние библиотеки">
                                      <v-card-text>
                                        <v-row>
                                          <v-col cols="4">
                                            <Pie :data="clsData" :options="options"></Pie>
                                          </v-col>
                                          <v-col cols="8">
                                            <v-row>
                                              <v-col cols="6">
                                                <div>
                                                  <div class="font-weight-bold">Новые</div>
                                                  <div class="d-flex flex-column">
                                                    <div>
                                                      <v-progress-linear
                                                        color="#0095FF"
                                                        height="8"
                                                        max="993"
                                                        model-value="456"
                                                      ></v-progress-linear>
                                                    </div>
                                                    <div>
                                                      <small class="font-weight-bold">
                                                        {{
                                                          String((456 / 993) * 100).substring(0, 5)
                                                        }}% </small
                                                      ><br />
                                                      <small class="font-weight-bold"
                                                        >Кол-во: 456</small
                                                      >
                                                    </div>
                                                  </div>
                                                </div>
                                                <div class="my-6">
                                                  <div class="font-weight-bold">Старые</div>
                                                  <div class="d-flex flex-column">
                                                    <div>
                                                      <v-progress-linear
                                                        color="#00E096"
                                                        height="8"
                                                        max="993"
                                                        model-value="150"
                                                      ></v-progress-linear>
                                                    </div>
                                                    <div>
                                                      <small class="font-weight-bold">
                                                        {{
                                                          String((150 / 993) * 100).substring(0, 5)
                                                        }}% </small
                                                      ><br />
                                                      <small class="font-weight-bold"
                                                        >Кол-во: 150</small
                                                      >
                                                    </div>
                                                  </div>
                                                </div>
                                                <div>
                                                  <div class="font-weight-bold">Как новые</div>
                                                  <div class="d-flex flex-column">
                                                    <div>
                                                      <v-progress-linear
                                                        color="#884DFF"
                                                        height="8"
                                                        max="993"
                                                        model-value="10"
                                                      ></v-progress-linear>
                                                    </div>
                                                    <div>
                                                      <small class="font-weight-bold">
                                                        {{
                                                          String((10 / 993) * 100).substring(0, 5)
                                                        }}% </small
                                                      ><br />
                                                      <small class="font-weight-bold"
                                                        >Кол-во: 10</small
                                                      >
                                                    </div>
                                                  </div>
                                                </div>
                                              </v-col>
                                              <v-col cols="6">
                                                <div>
                                                  <div class="font-weight-bold">Плохое</div>
                                                  <div class="d-flex flex-column">
                                                    <div>
                                                      <v-progress-linear
                                                        color="#E81600"
                                                        height="8"
                                                        max="993"
                                                        model-value="120"
                                                      ></v-progress-linear>
                                                    </div>
                                                    <div>
                                                      <small class="font-weight-bold">
                                                        {{
                                                          String((120 / 993) * 100).substring(0, 5)
                                                        }}% </small
                                                      ><br />
                                                      <small class="font-weight-bold"
                                                        >Кол-во: 120</small
                                                      >
                                                    </div>
                                                  </div>
                                                </div>
                                                <div class="my-6">
                                                  <div class="font-weight-bold">Отличное</div>
                                                  <div class="d-flex flex-column">
                                                    <div>
                                                      <v-progress-linear
                                                        color="#E8C300"
                                                        height="8"
                                                        max="993"
                                                        model-value="210"
                                                      ></v-progress-linear>
                                                    </div>
                                                    <div>
                                                      <small class="font-weight-bold">
                                                        {{
                                                          String((210 / 993) * 100).substring(0, 5)
                                                        }}% </small
                                                      ><br />
                                                      <small class="font-weight-bold"
                                                        >Кол-во: 210</small
                                                      >
                                                    </div>
                                                  </div>
                                                </div>
                                                <div>
                                                  <div class="font-weight-bold">Приемлимое</div>
                                                  <div class="d-flex flex-column">
                                                    <div>
                                                      <v-progress-linear
                                                        color="#F86300"
                                                        height="8"
                                                        max="993"
                                                        model-value="47"
                                                      ></v-progress-linear>
                                                    </div>
                                                    <div>
                                                      <small class="font-weight-bold">
                                                        {{
                                                          String((47 / 993) * 100).substring(0, 5)
                                                        }}% </small
                                                      ><br />
                                                      <small class="font-weight-bold"
                                                        >Кол-во: 47</small
                                                      >
                                                    </div>
                                                  </div>
                                                </div>
                                              </v-col>
                                            </v-row>
                                          </v-col>
                                        </v-row>
                                      </v-card-text>
                                      <v-card-actions>
                                        <v-dialog>
                                          <template v-slot:activator="{ props }">
                                            <v-btn color="primary" v-bind="props" variant="flat"
                                              >Подробнее</v-btn
                                            >
                                          </template>
                                        </v-dialog>
                                      </v-card-actions>
                                    </v-card>
                                  </v-col>
                                </v-row>
                                <v-row>
                                  <v-col>
                                    <v-card class="border">
                                      <v-card-title>{{ t('fund_status') }}</v-card-title>

                                      <v-card-text>
                                        <v-data-table
                                          :headers="fundHeaders"
                                          :items="fund ? fund : []"
                                          :loading="fundLoading"
                                        >
                                          <template v-slot:bottom></template>

                                          <template v-slot:[`item.actions`]="{}">
                                            <v-btn
                                              color="primary"
                                              variant="text"
                                              @click="downloadPDF()"
                                            >
                                              {{ t('details') }}
                                              <template v-slot:append>
                                                <v-icon
                                                  color="primary"
                                                  icon="mdi-chevron-right"
                                                ></v-icon>
                                              </template>
                                            </v-btn>
                                          </template>
                                        </v-data-table>
                                      </v-card-text>

                                      <v-card-actions>
                                        <FundModalVue></FundModalVue>
                                      </v-card-actions>
                                    </v-card>
                                  </v-col>

                                  <v-col>
                                    <v-card>
                                      <v-card-title>{{ t('publishers') }}</v-card-title>

                                      <v-card-text>
                                        <v-data-table
                                          :headers="publisherHeaders"
                                          :items="publishers ? publishers : []"
                                          :loading="publishersLoading"
                                        >
                                          <template v-slot:bottom></template>
                                        </v-data-table>
                                      </v-card-text>

                                      <v-card-actions>
                                        <PublishersModal></PublishersModal>
                                      </v-card-actions>
                                    </v-card>
                                  </v-col>
                                </v-row>
                                <v-row>
                                  <v-col>
                                    <v-card class="border">
                                      <v-card-title>{{ t('issue_return') }}</v-card-title>

                                      <v-card-text>
                                        <SubscriptionTable></SubscriptionTable>
                                      </v-card-text>

                                      <v-card-actions>
                                        <v-btn color="primary" variant="flat">{{
                                          t('details')
                                        }}</v-btn>
                                      </v-card-actions>
                                    </v-card>
                                  </v-col>
                                </v-row>
                              </v-container>
                            </v-window-item>
                            <v-window-item :value="2">
                              <v-container fluid>
                                <v-row>
                                  <v-col cols="12">
                                    <v-card class="border">
                                      <v-row>
                                        <v-col cols="6">
                                          <div class="my-2 ml-3 d-flex justify-space-between">
                                            <div class="d-flex flex-column">
                                              <strong>42</strong>
                                              <span class="text-medium-emphasis">{{
                                                t('book_title')
                                              }}</span>
                                            </div>
                                            <div class="d-flex flex-column">
                                              <strong>300</strong>
                                              <span class="text-medium-emphasis"
                                                >Количество книг</span
                                              >
                                            </div>
                                            <div class="d-flex flex-column">
                                              <strong>300 000 000</strong>
                                              <span class="text-medium-emphasis">{{
                                                t('amount_received')
                                              }}</span>
                                            </div>
                                          </div>
                                        </v-col>
                                        <v-col cols="6"></v-col>
                                      </v-row>
                                    </v-card>
                                  </v-col>
                                </v-row>
                                <v-row>
                                  <v-col cols="12">
                                    <v-card class="border">
                                      <v-data-table
                                        :headers="[
                                          { key: 'title', title: t('name') },
                                          { key: 'author', title: t('author') },
                                          { key: 'year', title: t('year_of_publication') },
                                          { key: 'admissionDate', title: t('reception_date') },
                                          { key: 'price', title: t('price') },
                                          { key: 'amount', title: t('quantity') }
                                        ]"
                                        :items="[
                                          {
                                            title: 'Қазақтың салт-дәстүрлері мен әдет-ғұрыптары',
                                            author: 'Сейіт Кенжеахметұлы',
                                            year: '2013',
                                            admissionDate: '2013-04-06 ',
                                            price: '2781',
                                            amount: '1'
                                          },
                                          {
                                            title: 'Қазақтың салт-дәстүрлері мен әдет-ғұрыптары',
                                            author: 'Сейіт Кенжеахметұлы',
                                            year: '2013',
                                            admissionDate: '2013-04-06 ',
                                            price: '2781',
                                            amount: '1'
                                          }
                                        ]"
                                      >
                                        <template v-slot:bottom></template>
                                      </v-data-table>
                                    </v-card>
                                  </v-col>
                                </v-row>
                              </v-container>
                            </v-window-item>
                          </v-window>
                        </v-card-text>
                      </v-card>
                    </template>
                  </v-dialog>
                </template>
                <template v-slot:bottom></template>

                <template v-slot:top>
                  <v-row>
                    <v-col>
                      <v-text-field
                        v-model="schoolSearch"
                        label="Поиск по БИН"
                        prepend-inner-icon="mdi-magnify"
                        variant="outlined"
                      ></v-text-field>
                    </v-col>
                    <v-col>
                      <v-text-field
                        v-model="schoolSearchName"
                        :label="t('search_by_title')"
                        prepend-inner-icon="mdi-magnify"
                        variant="outlined"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-if="role === 8 || role === 1">
        <v-col>
          <v-pagination
            v-model="schoolPage"
            :length="schoolLength"
            :total-visible="6"
            active-color="primary"
            class="ml-auto mr-2"
            size="small"
            variant="flat"
          ></v-pagination>
        </v-col>
      </v-row>

      <v-row v-if="role === 3 || role === 10">
        <v-col>
          <EventComponentNew></EventComponentNew>
        </v-col>
      </v-row>

      <v-card class="mt-4" elevation="1" v-if="role === 5">
        <v-row class="d-flex justify-space-between align-center">
          <v-col cols="2" class="d-flex flex-column align-center">
            <v-avatar v-if="auth.user.value?.user_data.avatar" class="ma-4" size="100">
              <v-img :src="auth.user.value?.user_data.avatar" alt="Profile"></v-img>
            </v-avatar>
            <v-avatar v-else class="ma-4 bg-grey-lighten-1" size="100">
              <v-icon>mdi-account</v-icon>
            </v-avatar>

            <div class="text-center">
              <v-chip color="success" size="small" class="status-chip" variant="flat">
                {{ t('active') }}
              </v-chip>
            </div>
          </v-col>
          <v-col cols="10">
            <div class="pa-4">
              <div class="d-flex justify-space-between align-center mb-4">
                <div>
                  <div class="text-h6">
                    {{ auth.user.value?.user_data.lastname }}
                    {{ auth.user.value?.user_data.firstname }}
                    {{ auth.user.value?.user_data.fathername }}
                  </div>
                  <div class="text-subtitle-2 text-medium-emphasis mt-1">
                    <span>{{ t('iin') }}:</span>
                    {{ formatIin(auth.user.value?.user_data.document_ID) }}
                    <v-icon
                      size="small"
                      class="mx-1"
                      :icon="maskedIin ? 'mdi-eye' : 'mdi-eye-off'"
                      @click="toggleIinVisibility"
                    ></v-icon>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-caption text-medium-emphasis">{{ t('issued_returned') }}</div>
                  <div class="text-h6">
                    {{ issuedReturnedCount.issued }} / {{ issuedReturnedCount.returned }}
                  </div>
                </div>
              </div>

              <v-divider class="mb-4"></v-divider>

              <div class="mb-4">
                <div class="text-caption text-medium-emphasis">{{ t('institution') }}</div>
                <div class="text-body-1">{{ t('institution_name') }}</div>
              </div>

              <v-row>
                <v-col cols="3">
                  <div class="text-caption text-medium-emphasis">{{ t('birth_date') }}</div>
                  <div class="text-body-1">{{ auth.user.value?.user_data.birthday }}</div>
                </v-col>
                <v-col cols="3">
                  <div class="text-caption text-medium-emphasis">{{ t('email') }}</div>
                  <div class="text-body-1">{{ auth.user.value?.email }}</div>
                </v-col>
                <v-col cols="3">
                  <div class="text-caption text-medium-emphasis">{{ t('phone_number') }}</div>
                  <div class="text-body-1">{{ auth.user.value?.user_data.phone }}</div>
                </v-col>
                <v-col cols="3">
                  <div class="text-caption text-medium-emphasis">{{ t('gender') }}</div>
                  <div class="text-body-1">
                    {{ auth.user.value?.user_data.sex === 2 ? t('male') : t('female') }}
                  </div>
                </v-col>
              </v-row>

              <v-row class="mt-2">
                <v-col cols="3">
                  <div class="text-caption text-medium-emphasis">{{ t('role') }}</div>
                  <div class="text-body-1">{{ auth.user.value?.roles[0].label.toLowerCase() }}</div>
                </v-col>
                <v-col cols="3">
                  <div class="text-caption text-medium-emphasis">{{ t('login') }}</div>
                  <div class="text-body-1">{{ auth.user.value?.login }}</div>
                </v-col>
              </v-row>
            </div>
          </v-col>
        </v-row>
      </v-card>
    </v-container>
  </main>
</template>

<style scoped>
.position-relative {
  position: relative;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 100;
  max-height: 300px;
  overflow-y: auto;
  background: white;
}

.custom-list-item {
  white-space: normal;
  padding: 12px 16px;
}

.custom-subtitle {
  white-space: normal;
  overflow: visible;
}

.gap-2 {
  gap: 8px;
}

:deep(.v-list-item-subtitle) {
  white-space: normal !important;
  overflow: visible !important;
}

:deep(.v-list-item__content) {
  overflow: visible !important;
}

.text-primary {
  color: #1867c0 !important;
}

.font-weight-medium {
  font-weight: 500 !important;
}

.text-grey-darken-1 {
  color: rgba(0, 0, 0, 0.6) !important;
}

.text-grey-darken-2 {
  color: rgba(0, 0, 0, 0.7) !important;
}

/* Add smooth transitions */
.v-icon {
  transition: all 0.2s ease-in-out;
}

.v-icon:hover {
  opacity: 0.8;
  cursor: pointer;
}

/* Add subtle hover effect to the card */
.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}

/* Add these styles to your existing <style> section */

.status-chip {
  background-color: #e8f5e9 !important; /* Light green background */
  color: #2e7d32 !important; /* Darker green text */
  font-weight: 500 !important;
  letter-spacing: 0.5px;
  padding: 0 12px !important;
  height: 24px !important;
  border: 1px solid #a5d6a7 !important; /* Light green border */
}

.status-chip:hover {
  background-color: #c8e6c9 !important; /* Slightly darker on hover */
  transition: background-color 0.2s ease;
}

.white-line {
  width: 54%;
  height: 1px;
  background-color: #e0e0e0;
  margin: 5px 0;
}
</style>
