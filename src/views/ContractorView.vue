<script lang="ts" setup>
import { useAPI } from '@/api'
import { ref, type Ref, watch, computed } from 'vue'
import HelpButton from '@/components/HelpButton.vue'
import { useAuth } from '@/auth'
import fileDownload from 'js-file-download'
import { useI18n } from 'vue-i18n'
import { useToastStore } from '@/stores/toast'
const { t, locale } = useI18n()

interface Contractor {
  id: number
  system: boolean
  title: string
  address: string
  company_ID: string
  feature?: string
  book?: number
  book_amount?: number
}

const newItem: Ref<{ address: string; company_ID: string; title: string }> = ref({
  address: '',
  company_ID: '',
  title: ''
})

const systemType = ref('normal')

const headers = [
  { title: 'ID', key: 'id' },
  { title: t('name_and_bin'), key: 'name' },
  { title: t('reception'), key: 'amount' },
  { title: t('address'), key: 'address' },
  { title: t('system'), key: 'system' },
  { title: '', key: 'actions' }
]

const loading: Ref<boolean> = ref(false)
const page: Ref<number> = ref(1)
const length: Ref<number> = ref(0)
const items: Ref<Contractor[]> = ref([])
const search: Ref<string | null> = ref(null)
const drawer: Ref<boolean> = ref(false)
const api = useAPI()
const auth = useAuth()
const itemsPerPage: Ref<number> = ref(10)
const systemCount = ref(0)
const libraryCount = ref(0)
const feature = ref(null)
const featureItems = [
  { title: t('closed_liquidated'), value: 'closed' },
  { title: t('unknown'), value: 'unknown' },
  { title: t('foreign'), value: 'foreign' }
]

// Add form validation
const form = ref(null)
const nameRules = [(v: string) => !!v || t('rules.required')]

const toast = useToastStore()

// Add these refs for edit mode
const isEditMode = ref(false)
const editingItem = ref<Contractor | null>(null)

// Add these refs for delete confirmation dialog
const deleteDialog = ref(false)
const itemToDelete = ref<Contractor | null>(null)

const helpVideoLink = computed(() => {
  return locale.value === 'kk'
    ? 'I3B-VzWt2bs'
    : 'Nhx_qLJMbKg'
})

async function getContractors() {
  loading.value = true
  try {
    let request = `/v1/contractor`
    
    // Add parameters based on whether we're searching or not
    if (search.value) {
      // Check if search value contains only numbers
      const isNumeric = /^\d+$/.test(search.value)
      
      if (isNumeric) {
        // When searching with numbers only, use bin parameter
        request += `?bin=${search.value}`
      } else {
        // When searching with text, use search parameter
        request += `?search=${search.value}`
      }
    } else {
      // Only include pagination when not searching
      request += `?page=${page.value}&per_page=${itemsPerPage.value}`
    }
    
    const response = await api.fetchData<{
      data: { items: Contractor[] }
      meta: { last_page: number; total: number }
    }>(request)
    
    if (response.data) {
      items.value = response.data.data.items
      length.value = response.data.meta.last_page

      systemCount.value = items.value.filter((item) => item.system).length
      libraryCount.value = items.value.filter((item) => !item.system).length
    }
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || t('error_loading_contractors')
    toast.error(errorMessage)
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

async function createContractor() {
  const requestObject: {
    title: string
    company_ID?: string
    address?: string
    system?: boolean
    feature?: string
  } = {
    title: newItem.value.title,
    system: systemType.value === 'system'
  }
  if (newItem.value.address.length > 0) requestObject.address = newItem.value.address
  if (newItem.value.company_ID.length > 0) requestObject.company_ID = newItem.value.company_ID
  if (feature.value) requestObject.feature = feature.value

  try {
    await api.postData('/v1/contractor', requestObject)

    toast.success(t('contractor_created_successfully'))

    await getContractors()
    drawer.value = false
    newItem.value = { title: '', company_ID: '', address: '' }
    systemType.value = 'normal'
    feature.value = null
  } catch (error: any) {
    const errorMessage = error?.message || t('error_creating_contractor')
    toast.error(errorMessage)
    console.error('Error:', error)
  }
}

const downloadList = async () => {
  try {
    const response = await api.postData(`/v1/book/school/contractor/pdf`, null, true)
    if (response.data) {
      fileDownload(response.data as Blob, 'Список контрагентов.pdf')
      toast.success(t('pdf_downloaded_successfully'))
    }
  } catch (error: any) {
    const errorMessage = error?.message || t('error_downloading_pdf')
    toast.error(errorMessage)
    console.error('Error:', error)
  }
}

// Function to open drawer in edit mode
function openEditDrawer(item: Contractor) {
  isEditMode.value = true
  editingItem.value = item

  // Populate the form with the item's data
  newItem.value = {
    title: item.title,
    company_ID: item.company_ID || '',
    address: item.address || ''
  }

  // Set system type
  systemType.value = item.system ? 'system' : 'normal'

  // Set feature if it exists
  feature.value = item.feature || null

  // Open the drawer
  drawer.value = true
}

// Function to update contractor
async function updateContractor() {
  if (!editingItem.value) return

  const requestObject: {
    title: string
    company_ID?: string
    address?: string
    system?: boolean
    feature?: string
  } = {
    title: newItem.value.title,
    system: systemType.value === 'system'
  }

  if (newItem.value.address.length > 0) requestObject.address = newItem.value.address
  if (newItem.value.company_ID.length > 0) requestObject.company_ID = newItem.value.company_ID
  if (feature.value) requestObject.feature = feature.value

  try {
    await api.putData(`/v1/contractor/${editingItem.value.id}`, requestObject)

    toast.success(t('contractor_updated_successfully'))

    await getContractors()
    resetForm()
  } catch (error: any) {
    const errorMessage = error?.message || t('error_updating_contractor')
    toast.error(errorMessage)
    console.error('Error:', error)
  }
}

// Function to reset form
function resetForm() {
  drawer.value = false
  newItem.value = { title: '', company_ID: '', address: '' }
  systemType.value = 'normal'
  feature.value = null
  isEditMode.value = false
  editingItem.value = null
}

// Function to handle form submission based on mode
async function validateAndSubmit() {
  const { valid } = await form.value.validate()

  if (valid) {
    if (isEditMode.value) {
      updateContractor()
    } else {
      createContractor()
    }
  }
}

// Update drawer close to use resetForm
function closeDrawer() {
  resetForm()
}

// Function to open delete confirmation dialog
function confirmDelete(item: Contractor) {
  itemToDelete.value = item
  deleteDialog.value = true
}

// Function to delete contractor
async function deleteContractor() {
  if (!itemToDelete.value) return

  try {
    await api.deleteData(`/v1/contractor/${itemToDelete.value.id}`)

    toast.success(t('contractor_deleted_successfully'))

    await getContractors()
    deleteDialog.value = false
    itemToDelete.value = null
  } catch (error: any) {
    const errorMessage = error?.message || t('error_deleting_contractor')
    toast.error(errorMessage)
    console.error('Error:', error)
  }
}

getContractors()

watch(page, () => {
  getContractors()
})
watch(search, () => {
  // Reset to page 1 when searching
  if (search.value) {
    page.value = 1
  }
  getContractors()
})
watch(itemsPerPage, () => {
  getContractors()
})
</script>

<template>
  <v-container fluid>
    <v-navigation-drawer v-model="drawer" location="right" temporary width="600">
      <v-card flat>
        <v-card-title class="d-flex align-center py-3 px-4">
          <span class="text-h6">{{
            isEditMode ? t('edit_counterparty') : t('add_counterparty')
          }}</span>
          <v-spacer></v-spacer>
          <v-btn icon variant="text" @click="closeDrawer">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-4">
          <div class="text-subtitle-1 font-weight-bold mb-4">{{ t('main') }}</div>

          <v-form ref="form" @submit.prevent="validateAndSubmit">
            <v-text-field
              v-model="newItem.title"
              :label="t('name') + ' *'"
              variant="outlined"
              class="mb-3"
              :rules="nameRules"
              required
            ></v-text-field>

            <v-text-field
              v-model="newItem.company_ID"
              :label="t('bin_optional')"
              variant="outlined"
              class="mb-3"
            ></v-text-field>

            <v-text-field
              v-model="newItem.address"
              :label="t('address_optional')"
              variant="outlined"
              class="mb-3"
            ></v-text-field>

            <v-select
              v-model="feature"
              :label="t('feature_optional')"
              variant="outlined"
              class="mb-3"
              :items="featureItems"
            ></v-select>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeDrawer">{{ t('cancel') }}</v-btn>
          <v-btn color="primary" variant="flat" @click="validateAndSubmit">
            {{ isEditMode ? t('save') : t('add') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-navigation-drawer>

    <v-app-bar>
      <template v-slot:title>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">{{ t('counterparty') }}</span>
          <span class="text-subtitle-2 text-medium-emphasis">{{
            t('organization_name_where_you_buy_books')
          }}</span>
        </div>
      </template>

      <template v-slot:append>
        <!-- <v-btn class="mr-3" color="primary" variant="flat" @click="downloadList">{{ t('download_pdf') }}</v-btn> -->
        <help-button :video-id="helpVideoLink"></help-button>
        <v-btn
          class="ml-3"
          color="primary"
          prepend-icon="mdi-plus"
          variant="flat"
          @click="drawer = true"
          >{{ t('add') }}
        </v-btn>
      </template>
    </v-app-bar>

    <v-data-table :headers="headers" :items="items" :loading="loading" class="mt-2" show-select>
      <template v-slot:top>
        <v-row class="px-4 py-2 ma-0">
          <v-col cols="3" class="d-flex align-center pa-2">
            <v-text-field
              v-model="search"
              :label="t('search')"
              prepend-inner-icon="mdi-magnify"
              hide-details
              variant="outlined"
              density="compact"
              class="w-[200px]"
            ></v-text-field>
          </v-col>

          <v-col cols="3" class="d-flex align-center justify-center pa-2">
            <span class="mr-2">{{ systemCount }}</span>
            <span class="text-caption text-grey">{{ t('system') }}</span>
          </v-col>

          <v-col cols="3" class="d-flex align-center justify-center pa-2">
            <span class="mr-2">{{ libraryCount }}</span>
            <span class="text-caption text-grey">{{ t('libraries') }}</span>
          </v-col>

          <v-col cols="3" class="d-flex align-center justify-end pa-2">
            <v-select
              v-model="itemsPerPage"
              density="compact"
              hide-details
              variant="outlined"
              :items="[10, 20, 50]"
              class="w-[150px]"
              :label="t('show_per_page')"
            ></v-select>
          </v-col>
        </v-row>
      </template>

      <template v-slot:headers="{ columns }">
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            class="bg-[#E7EAEE] text-subtitle-1 font-weight-bold"
          >
            {{ column.title }}
          </th>
        </tr>
      </template>

      <template v-slot:[`item.name`]="{ item }">
        <div class="d-flex flex-column">
          <strong>{{ item.title }}</strong>
          <span>{{ item.company_ID }}</span>
        </div>
      </template>

      <template v-slot:[`item.amount`]="{ item }">
        <div class="d-flex flex-column my-2">
          <v-chip class="mb-2" color="info" variant="flat">
            {{ t('name_default') }}: {{ item.book || 0 }}
          </v-chip>
          <v-chip color="info" variant="flat">
            {{ t('copies') }}: {{ item.book_amount || 0 }}
          </v-chip>
        </div>
      </template>

      <template v-slot:[`item.system`]="{ item }">
        <v-chip v-if="item.system" color="info" variant="flat">{{ t('yes') }}</v-chip>
        <v-chip v-else color="secondary" variant="flat">{{ t('no') }}</v-chip>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <div
          v-if="
            !item.system || (auth.user.value && auth.user.value.roles.some((obj) => obj.id === 1))
          "
          class="d-flex justify-center"
        >
          <v-btn icon="mdi-pencil" variant="text" @click="openEditDrawer(item)"></v-btn>
          <v-btn
            color="error"
            icon="mdi-trash-can-outline"
            variant="text"
            @click="confirmDelete(item)"
          ></v-btn>
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

    <!-- Delete confirmation dialog -->
    <v-dialog v-model="deleteDialog" max-width="450" content-class="delete-dialog">
      <v-card>
        <v-card-text class="text-center pt-6 pb-4">
          <v-icon color="error" size="x-large" class="mb-4">mdi-alert-circle-outline</v-icon>
          <h3 class="text-h5 font-weight-medium mb-4">{{ t('deletion') }}</h3>
          <p class="text-body-1">{{ t('confirm_delete_contractor') }}</p>
        </v-card-text>

        <v-card-actions class="pa-4 pt-0">
          <v-row>
            <v-col cols="6">
              <v-btn color="primary" variant="flat" block height="44" @click="deleteContractor">
                {{ t('yes_delete') }}
              </v-btn>
            </v-col>
            <v-col cols="6">
              <v-btn variant="outlined" block height="44" @click="deleteDialog = false">
                {{ t('cancel') }}
              </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
:deep(.v-data-table__tr--header) {
  background-color: #e7eaee !important;
}

:deep(.v-data-table-header) {
  background-color: #e7eaee !important;
}

:deep(.delete-dialog .v-card) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.v-btn--size-default) {
  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 0.5px;
}
</style>
