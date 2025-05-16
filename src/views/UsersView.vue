<script lang="ts" setup>
import { useAPI } from '@/api'
import { computed, type Ref, ref, watch, onMounted } from 'vue'
import FilterBlock from '@/components/FilterBlock.vue'
import HelpButton from '@/components/HelpButton.vue'
import { useAuth } from '@/auth'
import fileDownload from 'js-file-download'
import { useI18n } from 'vue-i18n'
import { useToastStore } from '@/stores/toast'
import { getRoleLabel } from '@/utils/roleMapping'
import DepartmentDrawer from '@/components/DepartmentDrawer.vue'
import schoolExcel from '@/assets/user-list-school.xlsx?url'
import collegeExcel from '@/assets/user-list-college.xlsx?url'
import GroupDrawer from '@/components/GroupDrawer.vue'

const { t } = useI18n()
const auth = useAuth()
const toast = useToastStore()

interface User {
  id: number
  firstname: string
  lastname: string
  fathername: string
  login: string
  phone: string
  email: string
  activated_at: string
  last_used_at: string
  status: boolean
  roles: { id: number; title: string }[]
  user_id: number
  classroom?: string
  subscription?: {
    request: string
    return: string
  }
}

interface RequestBody {
  birthday: string
  document_ID: string
  email: string
  fathername: string
  firstname: string
  lastname: string
  phone: string
  role: { id: number }
  school_id: number
  sex: number
  account: {
    login: string
    password: string
  }
  relation: {
    firstname: string
    lastname: string
    phone: string
    user_relative_id: number
  }
  region_id: number
}

interface Filter {
  search: string
  class_id: number | null
  classroom_id: number | null
  isActive: boolean
  promiser: boolean
  status: boolean
  class: number | null
  teacher: number | null
  role_id: number | null
}

const filters: Ref<Filter> = ref({
  search: '',
  class_id: null,
  classroom_id: null,
  isActive: false,
  promiser: false,
  status: false,
  class: null,
  teacher: null,
  role_id: null
})

const requiredRules = [(v: string) => !!v || 'Обязательное поле']

const requestBody: Ref<RequestBody> = ref({
  birthday: '',
  document_ID: '',
  email: '',
  fathername: '',
  firstname: '',
  lastname: '',
  phone: '',
  role: null,
  school_id: 0,
  sex: 0,
  account: {
    login: '',
    password: ''
  },
  relation: {
    firstname: '',
    lastname: '',
    phone: '',
    user_relative_id: 0
  },
  region_id: 0
})

const showExtendedData = ref(false)

const phoneNumberRules = computed(() => {
  return [(v) => /^\+\d\(\d{3}\)\d{3}-\d{2}-\d{2}$/.test(v) || 'Неправильный формат телефона']
})

const formatPhoneNumber = () => {
  let formatted = requestBody.value.phone.replace(/\D/g, '')
  if (formatted.length > 0) {
    formatted =
      '+7(' +
      formatted.substring(1, 4) +
      ')' +
      formatted.substring(4, 7) +
      '-' +
      formatted.substring(7, 9) +
      '-' +
      formatted.substring(9, 11)
  }
  requestBody.value.phone = formatted
}

const handleBackspace = (event) => {
  if (
    event.target.selectionStart === event.target.selectionEnd &&
    event.target.selectionStart === 0
  ) {
    requestBody.value.phone = ''
    event.preventDefault()
  }
}

const api = useAPI()

const headers = [
  { title: 'ID', key: 'id' },
  { title: t('full_name'), key: 'name' },
  { title: t('data'), key: 'data' },
  { title: t('status'), key: 'status' },
  { title: '', key: 'actions', sortable: false }
]
const loading: Ref<boolean> = ref(false)
const page: Ref<number> = ref(1)
const length: Ref<number> = ref(1)
const items: Ref<User[]> = ref([])
const drawer: Ref<boolean> = ref(false)
const importFile: Ref<File | null> = ref(null)
const fileInput: Ref<HTMLInputElement | null> = ref(null)
const createDrawer: Ref<boolean> = ref(false)
const addContactPerson: Ref<boolean> = ref(false)
const specialties = ref([])
const isCollege = ref(false)
watch(auth.userData, (value) => {
  if (auth.userData.value?.school?.organization?.label === 'Колледж') {
    isCollege.value = true
  }
})
const addStructure: Ref<boolean> = ref(false)
const userRelative: Ref<{ id: number; title: string }[]> = ref([])
const roles: Ref<{ id: number; title: string }[]> = ref([])
const groups = ref<{ id: number; name_ru: string }[]>([])

async function getRelatives() {
  try {
    const response = await api.fetchData('/v1/user/relative')
    if (response.data) {
      userRelative.value = response.data.data.items
    }
  } catch (e) {
    console.error('Error:', e)
  }
}

async function getSpecialties() {
  try {
    const response = await api.fetchData('/v1/specialty')
    if (response.data) {
      specialties.value = response.data.data.items
    }
  } catch (e) {
    console.error('Error:', e)
  }
}

async function getRoles() {
  try {
    const response = await api.fetchData('/v1/role')
    if (response.data) {
      if (isCollege.value) {
        const newRoles = response.data.data.items.map(role => {
          if (role.id === 5) {
            return {
              ...role,
              label: 'Студент'
            }
          }
          if (role.id === 4) {
            return {
              ...role,
              label: 'Куратор'
            }
          }
          if (role.id === 6) {
            return {
              ...role,
              label: 'Сотрудник колледжа'
            }
          }
          return null
        }).filter(Boolean)
        
        roles.value = newRoles
      } else {
        roles.value = response.data.data.items.map(role => ({
          ...role,
          label: role.label
        }))
      }
    }
  } catch (e) {
    console.error('Error:', e)
  }
}


async function getUsers() {
  loading.value = true
  try {
    let request = `/v2/user?page=${page.value}`
    if (filters.value.search.length > 0) request += `&search=${filters.value.search}`
    if (filters.value.promiser) request += '&promiser=1'
    if (filters.value.status) request += '&status=0'
    if (filters.value.class) request += `&classroom=${filters.value.class}`
    if (filters.value.teacher) request += `&teacher_id=${filters.value.teacher}`
    if (filters.value.role_id) request += `&role_id=${filters.value.role_id}`
    const response = await api.fetchData<{
      data: User[]
      meta: { last_page: number }
    }>(request)
    if (response.data) {
      items.value = response.data.data
      length.value = response.data.meta.last_page
    }
    loading.value = false
  } catch (error: any) {
    let errorMessage = error?.message || 'Ошибка при загрузке пользователей'
    toast.error(errorMessage)
    console.error('Error:', error)
  }
}

const snackbar = ref(false)

const handleFileUpload = () => {
  fileInput.value?.click()
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    importFile.value = target.files[0]
  }
}

const isUploading = ref(false)

const importUsers = async () => {
  try {
    if (!importFile.value) {
      toast.error('Выберите файл для импорта')
      return
    }

    isUploading.value = true
    const formData = new FormData()
    formData.append('file', importFile.value)
    const response = await api.postData('/v2/user/excel', formData)
    if (response.data && response.data.success) {
      snackbar.value = true
      drawer.value = false
      await getUsers()
      toast.success('Пользователи успешно импортированы')
    }
  } catch (error: any) {
    toast.error(error.message || 'Ошибка при импорте пользователей')
  } finally {
    isUploading.value = false
    importFile.value = null
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

function downloadExcel() {
  const link = document.createElement('a')
  link.href = isCollege.value ? collegeExcel : schoolExcel
  link.download = isCollege.value ? 'user-list-college.xlsx' : 'user-list-school.xlsx'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const subscriptionBlock: Ref<{ label: string; value: string }[]> = ref([])

async function getSubscriptionBlock() {
  try {
    const response = await api.fetchData<{
      promisers: string
      requests: string
      returns: string
    }>('/v1/dashboard/subscriptions')
    if (response.data) {
      subscriptionBlock.value = [
        { label: t('issues'), value: response.data.requests },
        {
          label: t('returns'),
          value: response.data.returns
        },
        { label: t('debtors'), value: response.data.promisers }
      ]
    }
  } catch (e) {
    console.error('Error:', e)
  }
}

const letters: Ref<string[]> = ref([])
const numbers: Ref<number[]> = ref([])

interface Classroom {
  number: number | null
  letter: string | null
  user_id: number | null
  pupil_id: number | null
}

const classroom: Ref<Classroom> = ref({
  number: null,
  letter: null,
  user_id: null,
  pupil_id: null,
})

const department: Ref<{ id: number; title: string } | null> = ref(null)
const departments: Ref<{ id: number; title: string }[]> = ref([])

const getLettersAndNumbers = async () => {
  try {
    const response = await api.fetchData<{
      data: {
        items: { id: number; letter: string; number: number }[]
      }
    }>('/v1/classroom/letters?full=1')
    if (response.data) {
      numbers.value = response.data.numbers
      letters.value = response.data.letters
    }
    numbers.value = [...new Set(numbers.value)].sort()
    letters.value = [...new Set(letters.value)].sort()
  } catch (e) {
    console.error('Error:', e)
  }
}

const getDepartments = async () => {
  try {
    const response = await api.fetchData('/v1/department')
    if (response.data) {
      departments.value = response.data.data.items
    }
  } catch (e) {
    console.error('Error:', e)
  }
}

const getGroups = async () => {
  try {
    const response = await api.fetchData('/v1/department-group')
    if (response.data?.data?.items) {
      groups.value = response.data.data.items
    }
  } catch (error) {
    console.error('Error fetching groups:', error)
    toast.error('Ошибка при загрузке групп')
  }
}

getUsers()
getRelatives()
getRoles()
getSpecialties()
getSubscriptionBlock()
getLettersAndNumbers()
getDepartments()
getGroups()

watch(page, () => {
  getUsers()
})

function formatDate(dateToFormat: string) {
  const parts = dateToFormat.split('-')
  const year = parts[0]
  const month = parts[1]
  const day = parts[2]

  return `${day}.${month}.${year}`
}

const createUser = async () => {
  try {
    if (!requestBody.value.firstname || !requestBody.value.lastname || !requestBody.value.role) {
      toast.error('Заполните обязательные поля')
      return
    }

    if (requestBody.value.role.id === 5) {
      if (!classroom.value.number || !classroom.value.letter) {
        if (isCollege.value) {
          toast.error('Для студента необходимо указать группу')
        } else {
          toast.error('Для школьника необходимо указать класс')
        }
        return
      }
    }

    const request: Record<string, any> = {
      firstname: requestBody.value.firstname.trim(),
      lastname: requestBody.value.lastname.trim(),
      role_id: requestBody.value.role.id
    }

    const optionalFields = {
      fathername: requestBody.value.fathername?.trim(),
      birthday: requestBody.value.birthday ? formatDate(requestBody.value.birthday) : null,
      sex: requestBody.value.sex || null,
      email: requestBody.value.email?.trim(),
      phone: requestBody.value.phone?.trim(),
      document_ID: requestBody.value.document_ID?.trim()
    }

    Object.entries(optionalFields).forEach(([key, value]) => {
      if (value) {
        request[key] = value
      }
    })

    if (addContactPerson.value && requestBody.value.relation) {
      const relation = requestBody.value.relation
      if (
        relation.firstname?.trim() ||
        relation.lastname?.trim() ||
        relation.phone?.trim() ||
        relation.user_relative_id
      ) {
        request.relation = {
          ...(relation.firstname?.trim() && { firstname: relation.firstname.trim() }),
          ...(relation.lastname?.trim() && { lastname: relation.lastname.trim() }),
          ...(relation.phone?.trim() && { phone: relation.phone.trim() }),
          ...(relation.user_relative_id && { user_relative_id: relation.user_relative_id })
        }
      }
    }

    if (regionId.value) {
      request.region_id = regionId.value
    }
    if (organization.value?.id) {
      request.school_id = organization.value.id
    }

    if (isCollege.value) {
      request.department_id = department.value
    }

    const response = await api.postData('/v1/user', request)
    if (response.data && addStructure.value) {
      classroom.value.pupil_id = response.data.id
      classroom.value.user_id = auth.user.value.id
      classroom.value.role_id = requestBody.value.role.id
      
      if (isCollege.value) {
        const selectedGroup = groups.value.find(g => g.name_ru === classroom.value.letter)
        if (selectedGroup) {
          classroom.value.letter = selectedGroup.name_ru
        }
        if (isCollege.value) {
          classroom.value.department_id = department.value
        }
      }

      await api.postData('/v1/classroom/user', classroom.value)
      toast.success('Пользователь успешно добавлен')
      createDrawer.value = false
      classroom.value = {
        number: null,
        letter: null,
        user_id: null,
        pupil_id: null,
      }
      
      await getUsers()

      requestBody.value = {
        birthday: null,
        document_ID: null,
        email: null,
        fathername: null,
        firstname: null,
        lastname: null,
        phone: null,
        role: null,
        school_id: 0,
        sex: 0,
        account: {
          login: null,
          password: null
        },
        relation: {
          firstname: null,
          lastname: null,
          phone: null,
          user_relative_id: 0
        },
        region_id: 0
      }
    }
    createDrawer.value = false
  } catch (e: any) {
    let errorMessage = 'Ошибка при создании пользователя'
    if (e.response?.data?.message) {
      errorMessage = e.response.data.message
    }
    toast.error(errorMessage)
    console.error('Error:', e)
  }
}

const structureDrawer: Ref<boolean> = ref(false)
const structure: Ref<
  {
    id: number
    school_id: number
    title: string
  }[]
> = ref([])

const schools: Ref<any[]> = ref([])
const getSchools = async () => {
  try {
    const response = await api.fetchData<{
      data: { items: { id: number; school_id: number; title: string }[] }
    }>(`/v1/school?page=1`)
    if (response.data) schools.value = response.data.data.items
    schools.value.forEach(async (item) => {
      item.structure = await getStructure(item.id)
      item.structure.forEach(async (structureItem) => {
        structureItem.classrooms = await getClassroom(structureItem.id)
      })
    })
  } catch (e: any) {
    toast.error('Ошибка при загрузке списка школ')
    console.error('Error:', e)
  }
}
const getStructure = async (id: number) => {
  try {
    const response = await api.fetchData<{
      data: { items: { id: number; school_id: number; title: string }[] }
    }>(`/v1/school/structure?school_id=${id}`)
    return response.data.data.items
  } catch (e) {
    console.error('Error:', e)
  }
}

const getClassroom = async (id: number) => {
  try {
    const response = await api.fetchData<{
      data: { items: { id: number; school_id: number; title: string }[] }
    }>(`/v1/classroom?school_structure_id=${id}`)
    return response.data.data.items
  } catch (e) {
    console.error('Error:', e)
  }
}

const role = computed(() => {
  return auth.user.value?.roles
})

const downloadList = async (id?: number) => {
  try {
    let url = '/v1/user/user/pdf'
    if (id) url += `?role_id=${id}`
    const response = await api.postData(url, null, true)
    if (response.data) {
      fileDownload(response.data, 'users.pdf')
      toast.success('Список пользователей успешно скачан')
    }
  } catch (error: any) {
    toast.error('Ошибка при скачивании списка пользователей')
    console.error('Error:', error)
  }
}

const getFilterSearch = () => {
  page.value = 1
  getUsers()
}

const getRegions = async (parentId: number | null = null) => {
  try {
    let request = '/v1/region'
    if (parentId) request += `?parent_id=${parentId}`
    const response = await api.fetchData<{ data: { items: Region[] } }>(request)
    if (response.data) {
      if (parentRegion.value && childRegion.value) thirdRegions.value = response.data.data.items
      else if (parentRegion.value) childrenRegions.value = response.data.data.items
      else parentRegions.value = response.data.data.items
    }
  } catch (e) {
    console.error('Error:', e)
  }
}

const downloadUser = async (id: number, name: string) => {
  try {
    const response = await api.postData<{}, { path: string }>(`/v1/user/sign-up/pdf/${id}`, {})
    if (response.data) {
      const path = response.data.path
      const link = document.createElement('a')
      link.href = import.meta.env.VITE_APP_API + '/storage' + path
      link.target = '_blank'
      link.download = `${name}.pdf`
      link.click()
      document.body.removeChild(link)
    }
  } catch (e) {
    alert(e)
  }
}

interface Region {
  id: number
  parent_id: number | null
  number: string
  title: string
}

interface Organization {
  id: number
  label: string
}

const organization = ref<Organization | null>(null)
const organizations = ref<Organization[]>([])

const getOrganizations = async (search?: string) => {
  let request = '/v1/school'
  if (search) {
    request += `?search=${search}`
  }
  const response = await api.fetchData<{ data: { items: Organization[] } }>(request)
  if (response.data) {
    organizations.value = response.data.data.items
  }
}

const parentRegions: Ref<Region[]> = ref([])
const childrenRegions: Ref<Region[]> = ref([])
const thirdRegions: Ref<Region[]> = ref([])
const parentRegion: Ref<Region | null> = ref(null)
const childRegion: Ref<Region | null> = ref(null)
const thirdRegion: Ref<Region | null> = ref(null)
const regionId: Ref<number | null> = ref(null)
const regionTitle: Ref<string> = ref('')

const chooseRegion = (isActive: Ref<boolean>) => {
  if (parentRegion.value && childRegion.value && thirdRegion.value) {
    regionId.value = thirdRegion.value.id
    regionTitle.value = `${parentRegion.value.title} / ${childRegion.value.title} / ${thirdRegion.value.title}`
  } else if (parentRegion.value && childRegion.value) {
    regionId.value = childRegion.value.id
    regionTitle.value = `${parentRegion.value.title} / ${childRegion.value.title}`
  } else if (parentRegion.value) {
    regionId.value = parentRegion.value.id
    regionTitle.value = `${parentRegion.value.title}`
  }
  isActive.value = false
}

watch(parentRegion, async (value) => {
  if (value) await getRegions(value.id)
})

watch(childRegion, async (value) => {
  if (value) await getRegions(value.id)
})

getSchools()
getRegions()
getOrganizations()

const fileName = computed(() => importFile.value?.name || '')

watch(
  () => requestBody.value.role,
  (newRole) => {
    if (newRole?.id === 5) {
      addStructure.value = true
    }
    if (!newRole || (newRole.id !== 11 && newRole.id !== 12)) {
      department.value = null
    }
  }
)

function getMappedRole(role: string) {
  const organizationType = auth.userData.value?.school?.organization?.label || null
  return getRoleLabel(role, organizationType)
}

const departmentDrawerOpen = ref(false)
const groupDrawerOpen = ref(false)
const structureDialog = ref(false)
const selectedUser = ref<User | null>(null)

function openStructureDialog(item: User) {
  selectedUser.value = item
  structureDialog.value = true
}

async function saveStructure() {
  try {
    if (!selectedUser.value) return

    let request
    if (isCollege.value) {
      if (!department.value) {
        toast.error('Выберите кафедру')
        return
      }
      request = {
        pupil_id: selectedUser.value?.user_id,
        user_id: auth.userData.value?.id,
        department_id: department.value,
        role_id: selectedUser.value?.role_id,
        number: classroom.value.number,
        letter: classroom.value.letter
      }
    } else {
      if (!classroom.value.number || !classroom.value.letter) {
        toast.error('Выберите класс и букву')
        return
      }
      request = {
        pupil_id: selectedUser.value?.user_id,
        user_id: auth.userData.value?.id,
        role_id: selectedUser.value?.role_id,
        number: classroom.value.number,
        letter: classroom.value.letter
      }
    }

    await api.postData('/v1/classroom/user', request)
    toast.success('Структура успешно добавлена')
    structureDialog.value = false
    await getUsers()
  } catch (error: any) {
    toast.error(error.message || 'Ошибка при добавлении структуры')
  }
}

// Add these refs after other refs
const deleteDialog = ref(false)
const userToDelete = ref<User | null>(null)

// Update the deleteUser function
const deleteUser = async (item: User) => {
  userToDelete.value = item
  deleteDialog.value = true
}

// Add new function to handle confirmed deletion
const confirmDelete = async () => {
  try {
    if (!userToDelete.value) return
    
    await api.deleteData(`/v1/user/${userToDelete.value.user_id}`)
    toast.success('Пользователь успешно удален')
    await getUsers()
    deleteDialog.value = false
    userToDelete.value = null
  } catch (error: any) {
    toast.error(error.message || 'Ошибка при удалении пользователя')
  }
}

watch(createDrawer, (newValue) => {
  if (newValue && isCollege.value) {
    getGroups()
  }
})

onMounted(() => {
  getUsers()
  getRelatives()
  getSpecialties()
  getRoles()
  getDepartments()
})

const formatClassroom = (item: User) => {
  if (!item.classroom) return ''
  return item.classroom.replaceAll('/', ' ')
}

// Add this function after other functions
async function downloadAccess() {
  try {
    const payload: Record<string, any> = {}
    
    if (accessForm.value.role?.id) {
      payload.role_id = accessForm.value.role.id
    }
    
    if (accessForm.value.number) {
      payload.number = accessForm.value.number
    }
    
    if (accessForm.value.letter) {
      if (isCollege.value) {
        const selectedGroup = groups.value.find(g => g.name_ru === accessForm.value.letter)
        if (selectedGroup) {
          payload.letter = selectedGroup.name_ru
        }
      } else {
        payload.letter = accessForm.value.letter
      }
    }

    if (isCollege.value && accessForm.value.department) {
      payload.department_id = accessForm.value.department
    }

    if (Object.keys(payload).length === 0) {
      toast.error('Выберите хотя бы один параметр')
      return
    }

    const response = await api.postData<{}, Blob>('/v1/user/password/user-list', payload, true)
    if (response.data) {
      fileDownload(response.data, 'access-list.xlsx')
      toast.success('Список доступов успешно скачан')
      accessDialog.value = false
    }
  } catch (error: any) {
    toast.error(error.message || 'Ошибка при скачивании списка доступов')
  }
}

// Add these refs near the top with other refs
const accessDialog = ref(false)
const accessForm = ref({
  role: null,
  number: null,
  letter: null,
  department: null
})

// Add this to onMounted or where other initialization happens
onMounted(() => {
  getUsers()
  getRoles()
  if (isCollege.value) {
    getDepartments()
    getGroups()
  }
})

// Add this watch to clear form when dialog closes
watch(accessDialog, (newValue) => {
  if (!newValue) {
    // Reset all form fields when dialog closes
    accessForm.value = {
      role: null,
      number: null,
      letter: null,
      department: null
    }
  }
})

</script>

<template>
  <v-container fluid>
    <v-overlay
      v-model="isUploading"
      class="align-center justify-center"
    >
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
      ></v-progress-circular>
    </v-overlay>
    <v-snackbar v-model="snackbar" :timeout="10000" color="primary"
      >Список учеников добавлен в систему
    </v-snackbar>
    <v-navigation-drawer v-model="drawer" location="right" temporary width="400">
      <v-list-item>
        <span class="font-weight-bold">Импорт пользователя</span>
      </v-list-item>
      <v-divider></v-divider>
      <v-list-item class="my-2">
        <span
          >Библиотечная система при загрузке файла пользователей предоставляет эффективный и удобный
          способ организации информации. Загрузка файла позволяет пользователям быстро добавлять
          множество записей в библиотеку, повышая её функциональность.</span
        >
      </v-list-item>
      <v-list-item>
        <div class="d-flex flex-column">
          <div v-if="fileName" class="text-body-1 mb-2">{{ fileName }}</div>
          <input
            ref="fileInput"
            accept=".xlsx, .xls"
            style="display: none"
            type="file"
            @input="handleFileChange"
          />
          <div class="d-flex align-center">
            <v-btn color="primary" variant="outlined" class="mr-2" @click="handleFileUpload">
              {{ t('select_file') }}
            </v-btn>
            <small>Максимальный размер файла: 300 MB</small>
          </div>
          <small class="font-weight-bold mt-2"
            >Перетащите файл сюда или нажмите, чтобы загрузить</small
          >
        </div>
      </v-list-item>
      <v-list-item class="mt-2 text-center">
        <v-btn color="primary" variant="flat" :disabled="!importFile" @click="importUsers">
          {{ t('send') }}
        </v-btn>
      </v-list-item>
    </v-navigation-drawer>

    <v-navigation-drawer v-model="createDrawer" location="right" temporary width="700">
      <v-list-item>
        <span class="font-weight-bold">Добавить пользователя</span>
      </v-list-item>
      <v-divider></v-divider>
      <v-list-item class="my-2">
        <span class="font-weight-bold">{{ t('basic') }}</span>
      </v-list-item>

      <v-list-item>
        <v-form class="mt-4">
          <v-text-field
            v-model="requestBody.lastname"
            label="Фамилия *"
            :rules="requiredRules"
            variant="outlined"
          ></v-text-field>
          <v-text-field
            v-model="requestBody.firstname"
            label="Имя *"
            :rules="requiredRules"
            variant="outlined"
          ></v-text-field>
          <v-text-field
            v-model="requestBody.fathername"
            label="Отчество (необязательно)"
            variant="outlined"
          ></v-text-field>
          <v-autocomplete
            v-model="requestBody.role"
            :items="roles"
            item-title="label"
            item-value="id"
            label="Роль *"
            :rules="requiredRules"
            return-object
            variant="outlined"
          ></v-autocomplete>
          <v-autocomplete
            v-if="
              requestBody.role &&
              (requestBody.role.id === 3 || requestBody.role.id === 10) &&
              role &&
              role.some((item) => {
                return item.id === 1
              })
            "
            v-model="organization"
            :items="organizations"
            item-title="name"
            label="Организация"
            return-object
            variant="outlined"
            @update:search="getOrganizations"
          ></v-autocomplete>

          <v-dialog v-if="requestBody.role && requestBody.role.id === 8" width="65vw">
            <template v-slot:activator="{ props }">
              <v-text-field
                :model-value="regionTitle"
                label="Регион"
                placeholder="Выберите регион"
                v-bind="props"
                variant="outlined"
              ></v-text-field>
            </template>

            <template v-slot:default="{ isActive }">
              <v-card>
                <v-card-title>
                  <div class="d-flex justify-space-between align-center w-100">
                    <span class="text-h6 font-weight-bold">Выбрать регион</span>
                    <v-btn icon="mdi-close" variant="text" @click="isActive.value = false"></v-btn>
                  </div>
                </v-card-title>
                <v-card-text>
                  <v-select
                    v-model="parentRegion"
                    :items="parentRegions"
                    item-value="id"
                    label="Регион"
                    placeholder="Выберите регион"
                    return-object
                    variant="outlined"
                  ></v-select>
                  <v-select
                    v-if="childrenRegions.length > 0"
                    v-model="childRegion"
                    :items="childrenRegions"
                    item-value="id"
                    label="Регион"
                    placeholder="Выберите регион"
                    return-object
                    variant="outlined"
                  ></v-select>
                  <v-select
                    v-if="thirdRegions.length > 0"
                    v-model="thirdRegion"
                    :items="thirdRegions"
                    item-value="id"
                    label="Регион"
                    placeholder="Выберите регион"
                    return-object
                    variant="outlined"
                  ></v-select>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn variant="tonal" @click="isActive.value = false">{{ t('close') }}</v-btn>
                  <v-btn color="primary" variant="flat" @click="chooseRegion(isActive)"
                    >Выбрать
                  </v-btn>
                  <v-spacer></v-spacer>
                </v-card-actions>
              </v-card>
            </template>
          </v-dialog>
        </v-form>
      </v-list-item>

      <v-list-item>
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-title>
              {{ t('extended_data') }}
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-text-field
                v-model="requestBody.document_ID"
                :label="t('iin')"
                variant="outlined"
              ></v-text-field>

              <div class="d-flex mt-4 align-center">
                <v-text-field
                  v-model="requestBody.birthday"
                  :label="t('date_of_birth')"
                  type="date"
                  variant="outlined"
                ></v-text-field>
                <v-radio-group v-model="requestBody.sex" class="ml-4" color="primary" inline>
                  <v-radio :value="1" :label="t('male')"></v-radio>
                  <v-radio :value="2" :label="t('female')"></v-radio>
                </v-radio-group>
              </div>

              <div class="d-flex mt-4 align-center">
                <v-text-field
                  v-model="requestBody.email"
                  label="Email"
                  variant="outlined"
                ></v-text-field>
                <v-text-field
                  v-model="requestBody.phone"
                  class="ml-4"
                  :label="t('phone_number')"
                  maxlength="16"
                  variant="outlined"
                  @input="formatPhoneNumber"
                ></v-text-field>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-list-item>

      <v-list-item>
        <v-switch
          v-model="addContactPerson"
          class="ml-2"
          color="primary"
          label="Добавить контактное лицо"
        ></v-switch>
        <v-switch
          v-model="addStructure"
          class="ml-2"
          color="primary"
          :label="t('structure')"
          :disabled="requestBody.role?.id === 5"
          @update:model-value="
            (val) => {
              if (requestBody.role?.id === 5) {
                addStructure = true
              }
            }
          "
        ></v-switch>
        <!-- <v-switch v-model="isCollege" class="ml-2" color="primary" label="Колледж"></v-switch> -->
      </v-list-item>

      <v-list-item v-if="addContactPerson">
        <div class="font-weight-bold">Контакное лицо</div>
        <v-text-field
          v-model="requestBody.relation.firstname"
          label="Имя"
          variant="outlined"
        ></v-text-field>
        <v-text-field
          v-model="requestBody.relation.lastname"
          label="Фамилия"
          variant="outlined"
        ></v-text-field>
        <div class="d-flex">
          <v-text-field
            v-model="requestBody.relation.phone"
            :label="t('phone_number')"
            type="tel"
            variant="outlined"
          ></v-text-field>
          <v-autocomplete
            v-model="requestBody.relation.user_relative_id"
            :items="userRelative"
            class="ml-4"
            item-title="title"
            item-value="id"
            label="Кем приходится для пользователя"
            variant="outlined"
          ></v-autocomplete>
        </div>
      </v-list-item>

      <v-list-item v-if="addStructure">
        <div class="font-weight-bold">{{ t('structure') }}</div>
        <div v-if="!isCollege" class="d-flex">
          <v-select
            v-model="classroom.number"
            :items="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]"
            class="mt-2"
            clearable
            :rules="requestBody.role?.id === 5 ? requiredRules : undefined"
            label="Цифра класса"
            variant="outlined"
          ></v-select>
          <v-select
            v-model="classroom.letter"
            :items="['А', 'Ә', 'Б', 'В', 'Г', 'Ғ', 'Д', 'Е', 'Ж', 'З', 'И', 'К', 'Қ', 'Л', 'М', 'Н', 'Ң', 'О', 'Ө', 'П', 'Р', 'С', 'Т', 'У', 'Ұ', 'Ү', 'Ф', 'Х', 'Һ', 'Ц', 'Ч', 'Ш', 'Щ', 'Ы', 'І', 'Э', 'Ю', 'Я']"
            class="ml-4 mt-2"
            clearable
            :rules="requestBody.role?.id === 5 ? requiredRules : undefined"
            label="Буква класса"
            variant="outlined"
          ></v-select>
        </div>
        <div v-if="isCollege" class="d-flex align-center mt-4" style="gap: 10px">
          <v-select
            v-model="department"
            :items="departments"
            item-title="name_ru"
            item-value="id"
            label="Кафедра"
            variant="outlined"
          ></v-select>
          <v-select
            v-model="classroom.number"
            clearable
            :items="[1, 2, 3, 4]"
            label="Курс"
            variant="outlined"
          ></v-select>
          <v-select
            v-model="classroom.letter"
            :items="groups"
            item-title="name_ru"
            clearable
            label="Группа"
            variant="outlined"
          ></v-select>
        </div>
      </v-list-item>

      <v-list-item class="mt-2 mb-6 text-center">
        <v-btn class="mr-10" variant="tonal" @click="createDrawer = false">{{ t('close') }}</v-btn>
        <v-btn color="primary" variant="flat" @click="createUser">{{ t('add') }}</v-btn>
      </v-list-item>
    </v-navigation-drawer>

    <v-navigation-drawer v-model="structureDrawer" location="right" temporary width="600">
      <v-list-item>
        <span class="font-weight-bold">{{ t('structure') }}</span>
      </v-list-item>
      <v-divider></v-divider>
      <v-list-item>
        <v-data-table
          :headers="[
            { key: 'id', title: 'ID' },
            { key: 'name', title: t('name') }
          ]"
          :items="schools"
          :items-per-page="15"
          show-expand
        >
          <template v-slot:expanded-row="{ columns, item }">
            <tr>
              <td :colspan="columns.length">
                <v-data-table
                  :headers="[
                    { key: 'id', title: 'ID' },
                    { key: 'title', title: t('name') }
                  ]"
                  :items="item.structure"
                  show-expand
                >
                  <template v-slot:headers></template>
                  <template v-slot:expanded-row="{ columns, item }">
                    <tr>
                      <td :colspan="columns.length">
                        <v-data-table
                          :headers="[
                            { key: 'id', title: 'ID' },
                            { key: 'title', title: t('name') }
                          ]"
                          :items="item.classrooms"
                          show-expand
                        >
                          <template v-slot:headers></template>
                          <template v-slot:[`item.title`]="{ item }">
                            <span>{{ item.number }} {{ item.letter }}</span>
                          </template>

                          <template v-slot:expanded-row="{ columns, item }">
                            <tr>
                              <td :colspan="columns.length">
                                <v-data-table
                                  v-if="item.pupils.length > 0"
                                  :headers="[
                                    { key: 'id', title: 'ID' },
                                    { key: 'name', title: 'Имя' }
                                  ]"
                                  :items="item.pupils"
                                >
                                  <template v-slot:headers></template>
                                  <template v-slot:[`item.name`]="{ item }">
                                    <span
                                      >{{ item.user_data.lastname }} {{ item.user_data.firstname }}
                                      {{ item.user_data.fathername }}</span
                                    >
                                  </template>
                                  <template v-slot:bottom></template>
                                </v-data-table>
                                <v-data-table
                                  :headers="[
                                    { key: 'id', title: 'ID' },
                                    { key: 'name', title: 'Имя' }
                                  ]"
                                  :items="[item.teacher]"
                                >
                                  <template v-slot:headers></template>
                                  <template v-slot:[`item.name`]="{ item }">
                                    <span
                                      >{{ item.user_data.lastname }} {{ item.user_data.firstname }}
                                      {{ item.user_data.fathername }}</span
                                    >
                                  </template>
                                  <template v-slot:bottom></template>
                                </v-data-table>
                              </td>
                            </tr>
                          </template>

                          <template v-slot:bottom></template>
                        </v-data-table>
                      </td>
                    </tr>
                  </template>
                  <template v-slot:bottom></template>
                </v-data-table>
              </td>
            </tr>
          </template>

          <template v-slot:[`item.name`]="{ item }">
            <v-btn color="primary" variant="text" @click="getStructure(item.id)"
              >{{ item.name }}
            </v-btn>
          </template>
          <template v-slot:bottom></template>
        </v-data-table>
      </v-list-item>
    </v-navigation-drawer>

    <DepartmentDrawer v-model="departmentDrawerOpen" />
    <GroupDrawer v-model="groupDrawerOpen" />
    <v-app-bar>
      <template v-slot:title>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">{{ t('subscription') }}</span>
          <span class="text-subtitle-2 text-medium-emphasis"
            >{{ t('online_library_card_registration') }}
          </span>
        </div>
      </template>

      <template v-slot:append>
        <v-btn
          v-if="
            isCollege && auth.userData.value?.roles.some((role) => role.id === 10 || role.id === 3)
          "
          class="mr-3"
          variant="tonal"
          @click="departmentDrawerOpen = true"
        >
          Кафедра
        </v-btn>
        <v-btn
          v-if="
            isCollege && auth.userData.value?.roles.some((role) => role.id === 10 || role.id === 3)
          "
          class="mr-3"
          variant="tonal"
          @click="groupDrawerOpen = true"
        >
          Группа
        </v-btn>
        <v-btn v-if="!isCollege" class="mr-3" variant="tonal" @click="structureDrawer = true">{{
          t('structure')
        }}</v-btn>

        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              append-icon="mdi-chevron-down"
              class="mr-3"
              color="primary"
              v-bind="props"
              variant="flat"
              >{{ t('actions') }}
            </v-btn>
          </template>

          <v-list>
            <v-list-item :value="1" @click="downloadExcel">{{
              t('download_import_template')
            }}</v-list-item>
            <v-list-item :value="2" @click="drawer = true">{{ t('import') }}</v-list-item>
            <v-list-item :value="3" @click="createDrawer = true"
              >{{ t('add_individually') }}
            </v-list-item>
            <v-list-item v-if="auth.userData.value?.roles.some((role) => role.id === 3)" :value="4" @click="accessDialog = true">{{ t('download_access') }}</v-list-item>
          </v-list>
        </v-menu>

        <help-button video-id="6jm7naQux44" />
      </template>
    </v-app-bar>

    <v-row>
      <v-col cols="12">
        <FilterBlock
          v-model="filters"
          :bottom-items="subscriptionBlock"
          :inventory="false"
          :mdata="false"
          :oneLine="false"
          users
          @search="getFilterSearch"
        >
        </FilterBlock>
      </v-col>
    </v-row>

    <v-data-table
      :headers="headers"
      :items="items"
      :items-per-page="15"
      :loading="loading"
      class="mt-2"
      show-select
    >
      <template v-slot:[`item.name`]="{ item }">
        <div class="d-flex flex-column my-2">
          <div class="d-flex align-center">
            <div>
              {{ item.lastname }} {{ item.firstname }} {{ item.fathername }}
              <v-chip v-if="item.classroom" size="small" variant="flat" color="info" class="ml-2">
                {{ formatClassroom(item) }}
              </v-chip>
            </div>
            <div
              class="ml-2"
              v-if="!item.classroom && ['Школьники', 'Классный руководитель'].includes(item.role)"
            >
              <v-btn
                color="primary"
                size="small"
                variant="tonal"
                prepend-icon="mdi-plus"
                @click="openStructureDialog(item)"
              >
                Добавить структуру
              </v-btn>
            </div>
          </div>

          <div>
            <span class="text-subtitle-2 text-medium-emphasis"
              >{{ t('first_activity') }}: {{ item.activated_at }}</span
            >
          </div>
          <div>
            <span class="text-subtitle-2 text-medium-emphasis"
              >{{ t('last_activity') }}: {{ item.last_used_at }}</span
            >
          </div>
          <div class="my-2">
            <v-chip v-if="item.role" class="mr-2" color="primary" size="small" variant="outlined">
              {{ getMappedRole(item.role) }}
            </v-chip>
            <v-chip v-if="item.status" color="green" size="small" variant="flat">{{
              t('active')
            }}</v-chip>
            <v-chip v-else color="error" size="small" variant="flat">Не активен</v-chip>
          </div>
        </div>
      </template>

      <template v-slot:[`item.id`]="{ item }">
        <div class="font-weight-bold">ID: {{ item.user_id }}</div>
        <div class="text-medium-emphasis">{{ item.id_ }}</div>
      </template>

      <template v-slot:[`item.data`]="{ item }">
        <div class="font-weight-bold">{{ item.login }}</div>
        <div class="d-flex flex-column">
          <span class="text-subtitle-2 text-medium-emphasis">{{ item.email }}</span>
          <span class="text-subtitle-2 text-medium-emphasis">{{ item.phone }}</span>
        </div>
      </template>

      <template v-slot:[`item.status`]="{ item }">
        <div v-if="item.subscription" class="d-flex flex-column align-center">
          <v-chip class="mb-2" color="primary" size="small" variant="flat"
            >Выдача: {{ item.subscription.request }}
          </v-chip>
          <v-chip size="small" variant="flat">Возврат: {{ item.subscription.return }}</v-chip>
        </div>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <div class="d-flex align-center">
          <v-btn
            :to="`/users/${item.user_id}`"
            append-icon="mdi-arrow-right"
            class="mr-2"
            variant="outlined"
            >{{ t('go_to') }}
          </v-btn>
          <v-btn
            @click="downloadUser(item.id_, `${item.lastname} ${item.firstname} ${item.fathername}`)"
            icon="mdi-download"
            variant="text"
          ></v-btn>
          <v-btn v-if="role.some((role) => role.id === 1) || (role.some((role) => role.id === 3) && item.role_id !== 3 && item.role_id !== 1)" icon="mdi-delete" variant="text" @click="deleteUser(item)"></v-btn>
        </div>
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

    <v-dialog v-model="structureDialog" max-width="500">
      <v-card>
        <v-card-title>Добавить структуру</v-card-title>
        <v-card-text>
          <div v-if="!isCollege" class="d-flex">
          <v-select
            v-model="classroom.number"
            :items="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]"
            class="mt-2"
            clearable
            :rules="requestBody.role?.id === 5 ? requiredRules : undefined"
            label="Цифра класса"
            variant="outlined"
          ></v-select>
          <v-select
            v-model="classroom.letter"
            :items="[
              'А',
              'Ә',
              'Б',
              'В',
              'Г',
              'Ғ',
              'Д',
              'Е',
              'Ж',
              'З',
              'И',
              'К',
              'Қ',
              'Л',
              'М',
              'Н',
              'Ң',
              'О',
              'Ө',
              'П',
              'Р',
              'С',
              'Т',
              'У',
              'Ұ',
              'Ү',
              'Ф',
              'Х',
              'Һ',
              'Ц',
              'Ч',
              'Ш',
              'Щ',
              'Ы',
              'І',
              'Э',
              'Ю',
              'Я'
            ]"
            class="ml-4 mt-2"
            clearable
            :rules="requestBody.role?.id === 5 ? requiredRules : undefined"
            label="Буква класса"
            variant="outlined"
          ></v-select>
        </div>
        <div v-else class="d-flex align-center mt-4" style="gap: 10px">
          <v-select
            v-model="department"
            :items="departments"
            item-title="name_ru"
            item-value="id"
            label="Кафедра"
            variant="outlined"
          ></v-select>
          <v-select
            v-model="classroom.number"
            clearable
            :items="[1, 2, 3, 4]"
            label="Курс"
            variant="outlined"
          ></v-select>
          <v-select
            v-model="classroom.letter"
            :items="groups"
            item-title="name_ru"
            clearable
            label="Группа"
            variant="outlined"
          ></v-select>
        </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="structureDialog = false">
            {{ t('cancel') }}
          </v-btn>
          <v-btn color="primary" variant="flat" @click="saveStructure">
            {{ t('save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="accessDialog" max-width="500">
      <v-card>
        <v-card-title>Скачать список доступов</v-card-title>
        <v-card-text>
          <v-autocomplete
            v-model="accessForm.role"
            :items="roles"
            item-title="label"
            item-value="id"
            label="Роль"
            return-object
            variant="outlined"
          ></v-autocomplete>

          <div v-if="!isCollege" class="d-flex">
            <v-select
              v-model="accessForm.number"
              :items="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]"
              class="mt-2"
              clearable
              label="Цифра класса"
              variant="outlined"
            ></v-select>
            <v-select
              v-model="accessForm.letter"
              :items="[
                'А', 'Ә', 'Б', 'В', 'Г', 'Ғ', 'Д', 'Е', 'Ж', 'З', 'И', 
                'К', 'Қ', 'Л', 'М', 'Н', 'Ң', 'О', 'Ө', 'П', 'Р', 'С', 
                'Т', 'У', 'Ұ', 'Ү', 'Ф', 'Х', 'Һ', 'Ц', 'Ч', 'Ш', 'Щ', 
                'Ы', 'І', 'Э', 'Ю', 'Я'
              ]"
              class="ml-4 mt-2"
              clearable
              label="Буква класса"
              variant="outlined"
            ></v-select>
          </div>

          <div v-else class="d-flex align-center mt-4" style="gap: 10px">
            <v-select
              v-model="accessForm.department"
              :items="departments"
              item-title="name_ru"
              item-value="id"
              label="Кафедра"
              variant="outlined"
            ></v-select>
            <v-select
              v-model="accessForm.number"
              clearable
              :items="[1, 2, 3, 4]"
              label="Курс"
              variant="outlined"
            ></v-select>
            <v-select
              v-model="accessForm.letter"
              :items="groups"
              item-title="name_ru"
              clearable
              label="Группа"
              variant="outlined"
            ></v-select>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="accessDialog = false">
            {{ t('cancel') }}
          </v-btn>
          <v-btn color="primary" variant="flat" @click="downloadAccess">
            {{ t('download') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          Подтверждение удаления
        </v-card-title>
        <v-card-text>
          Вы действительно хотите удалить пользователя {{ userToDelete?.lastname }} {{ userToDelete?.firstname }}?
          <br>
          <span class="text-red">Это действие нельзя отменить.</span>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="deleteDialog = false"
          >
            {{ t('cancel') }}
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            @click="confirmDelete"
          >
            {{ t('delete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
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
