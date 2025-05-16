<script lang="ts" setup>
import { useAPI } from '@/api'
import { useAuth } from '@/auth';
import { onMounted, ref, type Ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const api = useAPI()
const auth = useAuth()
const isCollege = ref(false);
watch(auth.userData, (value) => {
  if (value && value?.school?.organization && value?.school?.organization?.label === 'Колледж') {
    isCollege.value = true;
  }
})
interface Props {
  bottomItems: { label: string; value: number }[]
  oneLine: boolean
  mdata: boolean
  inventory: boolean
  users: boolean
  modelValue: Filter
}
 
interface Item {
  id: number
  title: string
}

interface Filter {
  search: string
  languageId: number | null
  authorId: number | null
  publisherId: number | null
  year: number | null
  epub: boolean
  promiser: boolean
  status: boolean
  class: number | null
  teacher: number | null
  isActive: boolean
  role_id: number | null
  inventoryStatus: number | null
  fundBooks: number | null
  book_type_id: number | null
}

interface Author {
  id: number
  name: string
}

const languages: Ref<Item[]> = ref([])
const authors: Ref<Author[]> = ref([])
const publishers: Ref<Item[]> = ref([])
const selectedBookType: Ref<{ id: number; title: string }> = ref({ id: 0, title: t('book_type') })

const props = defineProps<Props>()

const internalValue: Ref<Filter> = ref(props.modelValue)

const updateValue = () => {
  emit('update:modelValue', internalValue.value)
}

watch(
  () => props.modelValue,
  (newValue) => {
    internalValue.value = newValue
  }
)

async function getLanguages(search = null) {
  try {
    let request = `/v1/language`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: Item[] } }>(request)
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
    const response = await api.fetchData<{ data: { items: Item[] } }>(request)
    if (response.data) publishers.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

onMounted(() => {
  internalValue.value = props.modelValue
})

const emit = defineEmits('search')

const startSearch = () => {
  emit('search')
}

const resetFilters = () => {
  internalValue.value = {
    authorId: null,
    class: null,
    epub: false,
    languageId: null,
    promiser: false,
    isActive: false,
    publisherId: null,
    search: '',
    status: false,
    teacher: null,
    year: null,
    role_id: null,
    inventoryStatus: null,
    fundBooks: null,
    book_type_id: null
  }
  selectedType.value = { id: 0, label: t('user_type'), name: '' }
  selectedBookType.value = { id: 0, title: t('book_type') }
  updateValue()
  emit('search')
}

const teachers: Ref<{ id: number; user_data: { firstname: string; lastname: string } }[]> = ref([])
const selectedType: Ref<{ id: number; label: string }> = ref({ id: 0, label: t('user_type') })

async function getTeachers(search = null) {
  let request = '/v1/user?teacher=1&page=1'
  if (search) {
    request += `&search=${search}`
  }
  try {
    const response = await api.fetchData<{
      data: {
        items: { id: number; user_data: { firstname: string; lastname: string } }[]
      }
    }>(request)
    if (response.data) teachers.value = response.data.data.items
  } catch (e) {
    console.error('Error:', e)
  }
}

const types: Ref<Publisher[]> = ref([])

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

getTypes()

const setUserType = (user: { id: number; label: string }) => {
  selectedType.value = user
  internalValue.value.role_id = user.id
  updateValue()
}

const setBookType = (bookType: { id: number; title: string }) => {
  selectedBookType.value = bookType
  internalValue.value.book_type_id = bookType.id
  updateValue()
}

interface Role {
  id: number
  name: string
  title: string
  label?: string
}

const roles: Ref<Role[]> = ref([])

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

if (props.users) {
  getTeachers()
  getRoles()
}

if (props.mdata) {
  getLanguages()
  getAuthors()
  getPublishers()
  getPublishers()
}

if (props.inventory) {
  getAuthors()
  getPublishers()
}
</script>

<template>
  <v-card>
    <v-card-text>
      <div class="d-flex flex-column">
        <v-row class="mb-2">
          <v-col class="d-flex" cols="9">
            <v-text-field
              v-model="internalValue.search"
              density="compact"
              hide-details
              :placeholder="t('search_by_title')"
              prepend-inner-icon="mdi-magnify"
              rounded
              variant="outlined"
              @input="updateValue"
            >
              <template v-if="users || inventory || mdata" v-slot:append>
                <v-menu v-if="users">
                  <template v-slot:activator="{ props }">
                    <v-btn append-icon="mdi-chevron-down" v-bind="props" variant="outlined"
                      >{{ selectedType.label }}
                    </v-btn>
                  </template>

                  <v-list>
                    <v-list-item
                      v-for="item in roles"
                      :key="item.id"
                      :value="item.id"
                      @click="setUserType({id: item.id, label: item.label})"
                    >
                      {{ item.label }}
                    </v-list-item>
                  </v-list>
                </v-menu>
                <v-menu v-if="inventory || mdata">
                  <template v-slot:activator="{ props }">
                    <v-btn append-icon="mdi-chevron-down" v-bind="props" variant="outlined"
                      >{{ selectedBookType.title }}
                    </v-btn>
                  </template>

                  <v-list>
                    <v-list-item
                      v-for="item in types"
                      :key="item.id"
                      :value="item.id"
                      @click="setBookType(item)"
                      >{{ item.title }}
                    </v-list-item>
                  </v-list>
                </v-menu>
              </template>
            </v-text-field>
          </v-col>
          <v-col class="d-flex justify-space-around">
            <v-btn color="primary" variant="flat" @click="startSearch">{{ t('search') }}</v-btn>
            <v-btn variant="tonal" @click="resetFilters">{{ t('reset') }}</v-btn>
          </v-col>
        </v-row>
        <v-row class="mb-2">
          <v-col v-if="mdata" cols="2">
            <v-autocomplete
              v-model="internalValue.languageId"
              :items="languages"
              clearable
              item-title="title"
              item-value="id"
              :label="t('language')"
              variant="solo-filled"
              @input="updateValue"
            ></v-autocomplete>
          </v-col>
          <v-col v-if="mdata || inventory" cols="2">
            <v-autocomplete
              v-model="internalValue.authorId"
              :items="authors"
              clearable
              item-title="name"
              item-value="id"
              :label="t('author')"
              variant="solo-filled"
              @input="updateValue"
              @update:search="getAuthors"
            ></v-autocomplete>
          </v-col>
          <v-col v-if="mdata || inventory" cols="2">
            <v-autocomplete
              v-model="internalValue.publisherId"
              :items="publishers"
              clearable
              item-title="title"
              item-value="id"
              :label="t('publisher')"
              variant="solo-filled"
              @input="updateValue"
              @update:search="getPublishers"
            ></v-autocomplete>
          </v-col>
          <v-col v-if="mdata" cols="2">
            <v-text-field
              v-model="internalValue.year"
              clearable
              :label="t('year_of_publication')"
              type="number"
              variant="solo-filled"
              @input="updateValue"
            ></v-text-field>
          </v-col>
          <v-col v-if="(!mdata && !inventory && !isCollege) || users && !isCollege" cols="2">
            <v-select
              v-model="internalValue.class"
              :items="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]"
              clearable
              label="Класс"
              variant="solo-filled"
            >
              <template v-slot:item="{ props, item }">
                <v-list-item :subtitle="item.raw.letter" v-bind="props"></v-list-item>
              </template>
            </v-select>
          </v-col>
          <v-col v-if="users" cols="3">
            <v-autocomplete
              v-model="internalValue.teacher"
              :items="teachers"
              clearable
              item-title="user_data.lastname"
              item-value="id"
              :label="isCollege ? 'Куратор' : t('class_teacher')"
              variant="solo-filled"
              @update:search="getTeachers"
            >
              <template v-slot:item="{ props, item }">
                <v-list-item :subtitle="item.raw.user_data.firstname" v-bind="props"></v-list-item>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col v-else-if="mdata">
            <v-switch
              v-model="internalValue.epub"
              color="primary"
              :label="t('ebook')"
              @input="updateValue"
            ></v-switch>
          </v-col>
          <v-col v-if="inventory" cols="2">
            <v-switch
              v-model="internalValue.inventoryStatus"
              color="primary"
              :label="t('written_off')"
            ></v-switch>
          </v-col>
          <v-col v-if="inventory" cols="3">
            <v-switch
              v-model="internalValue.fundBooks"
              color="primary"
              :label="t('only_fund_books')"
            ></v-switch>
          </v-col>
          <v-col v-if="users" cols="2">
            <v-switch
              v-model="internalValue.status"
              color="primary"
              :label="t('inactive')"
              @input="updateValue"
            ></v-switch>
          </v-col>
          <v-col v-if="users" cols="3">
            <v-switch
              v-model="internalValue.promiser"
              color="primary"
              :label="t('debtors')"
              @input="updateValue"
            ></v-switch>
          </v-col>
        </v-row>
        <v-divider v-if="!oneLine"></v-divider>
        <v-row v-if="!oneLine" class="py-3">
          <v-col class="d-flex">
            <div v-for="item in props.bottomItems" :key="item.label" class="mr-8">
              <div>
                <strong>{{ item.value }}</strong>
              </div>
              <div>
                <span class="text-subtitle-2 text-medium-emphasis">{{ item.label }}</span>
              </div>
            </div>
          </v-col>
          <slot name="actions"></slot>
        </v-row>
      </div>
    </v-card-text>
  </v-card>
</template>
