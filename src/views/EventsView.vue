<script lang="ts" setup>
import { useAPI } from '@/api'
import { ref, type Ref, watch, onMounted, computed } from 'vue'
import HelpButton from '@/components/HelpButton.vue'
import { useAuth } from '@/auth'
import { useI18n } from 'vue-i18n'
import { useToastStore } from '@/stores/toast'
const { t, locale } = useI18n()

interface Event {
  id: number
  date: string
  time: string
  color?: string
  status?: string
  title_ru: string
  title_kz: string
  description_ru: string
  description_kz: string
}

const newEvent: Ref<{ 
  date: string
  time: string
  title_ru: string
  title_kz: string
  description_ru: string
  description_kz: string
}> = ref({
  date: '',
  time: '',
  title_ru: '',
  title_kz: '',
  description_ru: '',
  description_kz: ''
})

// Use computed property for headers to update when language changes
const headers = computed(() => [
  { title: 'ID', key: 'id' },
  { title: t('event_title'), key: locale.value === 'kk' ? 'title_kz' : 'title_ru' },
  { title: t('event_description'), key: locale.value === 'kk' ? 'description_kz' : 'description_ru' },
  { title: t('event_date'), key: 'date' },
  { title: t('status'), key: 'status' },
  { title: '', key: 'actions' }
])

const loading: Ref<boolean> = ref(false)
const page: Ref<number> = ref(1)
const length: Ref<number> = ref(0)
const items: Ref<Event[]> = ref([])
const search: Ref<string | null> = ref(null)
const drawer: Ref<boolean> = ref(false)
const api = useAPI()
const auth = useAuth()
const itemsPerPage: Ref<number> = ref(10)

// Add form validation
const form = ref(null)
const titleRules = [(v: string) => !!v || t('rules.required')]
const descriptionRules = [(v: string) => !!v || t('rules.required')]
const dateRules = [(v: string) => !!v || t('rules.required')]

const toast = useToastStore()

// Add these refs for edit mode
const isEditMode = ref(false)
const editingItem = ref<Event | null>(null)

// Add these refs for delete confirmation dialog
const deleteDialog = ref(false)
const itemToDelete = ref<Event | null>(null)

// Add a new ref for read-only mode
const isReadOnly = ref(false)

// Add a computed property for filtered items
const filteredItems = computed(() => {
  if (!search.value) return items.value
  
  const searchTerm = search.value.toLowerCase()
  return items.value.filter(item => {
    return (
      (item.title_ru && item.title_ru.toLowerCase().includes(searchTerm)) ||
      (item.title_kz && item.title_kz.toLowerCase().includes(searchTerm)) ||
      (item.description_ru && item.description_ru.toLowerCase().includes(searchTerm)) ||
      (item.description_kz && item.description_kz.toLowerCase().includes(searchTerm)) ||
      (item.date && item.date.includes(searchTerm))
    )
  })
})

// Update the counts based on filtered items
const activeCount = computed(() => {
  return filteredItems.value.filter(item => item.status === 'active').length
})

const pastCount = computed(() => {
  return filteredItems.value.filter(item => item.status === 'past').length
})

// Modify getEvents to not use search parameter
async function getEvents() {
  loading.value = true
  try {
    const request = `/v1/event?page=${page.value}&per_page=${itemsPerPage.value}`
    const response = await api.fetchData<{
      data: Event[]
      meta: { last_page: number; total: number }
    }>(request)
    
    if (response && response.data) {
      const eventData = Array.isArray(response.data) ? response.data : 
                      (response.data.data && Array.isArray(response.data.data) ? response.data.data : [])
      
      items.value = eventData.map((item, index) => {
        const colors = ['#0095FF', '#FF5252', '#4CAF50', '#9C27B0']
        const today = new Date()
        const eventDate = parseDate(item.date)
        const status = eventDate > today ? 'active' : 'past'
        
        return {
          ...item,
          color: status === 'active' ? colors[index % colors.length] : '#757575',
          status
        }
      })
      
      const meta = response.data.meta || response.meta || { last_page: 1, total: items.value.length }
      length.value = meta.last_page || 1
    }
  } catch (error: any) {
    console.error('Error fetching events:', error)
    if (error?.response?.status !== 200) {
      const errorMessage = error?.response?.data?.message || 'Error loading events'
      toast.error(errorMessage)
    }
  } finally {
    loading.value = false
  }
}

function parseDate(dateStr: string) {
  const [day, month, year] = dateStr.split('/').map(Number)
  return new Date(year, month - 1, day)
}

function formatDate(date: Date) {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

async function createEvent() {
  if (!newEvent.value.title_ru || !newEvent.value.description_ru || !newEvent.value.date) {
    return
  }
  
  try {
    const payload = {
      title_ru: newEvent.value.title_ru,
      title_kz: newEvent.value.title_kz,
      description_ru: newEvent.value.description_ru,
      description_kz: newEvent.value.description_kz,
      date: newEvent.value.date,
      time: newEvent.value.time
    }
    
    await api.postData('/v1/event', payload)
    
    toast.success('Event created successfully')
    
    newEvent.value = {
      date: '',
      time: '',
      title_ru: '',
      title_kz: '',
      description_ru: '',
      description_kz: ''
    }
    
    drawer.value = false
    getEvents()
  } catch (error: any) {
    const errorMessage = error?.message || 'Error creating event'
    toast.error(errorMessage)
    console.error('Error:', error)
  }
}

// Function to open drawer in edit mode
function openEditDrawer(item: Event) {
  isEditMode.value = true
  editingItem.value = item

  newEvent.value = {
    date: item.date,
    time: item.time,
    title_ru: item.title_ru || '',
    title_kz: item.title_kz || '',
    description_ru: item.description_ru || '',
    description_kz: item.description_kz || ''
  }

  drawer.value = true
}

// Function to update event
async function updateEvent() {
  if (!editingItem.value) return

  const payload = {
    title_ru: newEvent.value.title_ru,
    title_kz: newEvent.value.title_kz,
    description_ru: newEvent.value.description_ru,
    description_kz: newEvent.value.description_kz,
    date: newEvent.value.date,
    time: newEvent.value.time
  }

  try {
    await api.putData(`/v1/event/${editingItem.value.id}`, payload)
    
    toast.success('Event updated successfully')
    
    drawer.value = false
    isEditMode.value = false
    editingItem.value = null
    
    getEvents()
  } catch (error: any) {
    const errorMessage = error?.message || 'Error updating event'
    toast.error(errorMessage)
    console.error('Error:', error)
  }
}

// Function to confirm delete
function confirmDelete(item: Event) {
  itemToDelete.value = item
  deleteDialog.value = true
}

// Function to delete event
async function deleteEvent() {
  if (!itemToDelete.value) return

  try {
    await api.deleteData(`/v1/event/${itemToDelete.value.id}`)
    
    toast.success('Event deleted successfully')
    
    deleteDialog.value = false
    itemToDelete.value = null
    
    getEvents()
  } catch (error: any) {
    const errorMessage = error?.message || 'Error deleting event'
    toast.error(errorMessage)
    console.error('Error:', error)
  }
}

// Function to handle form submission based on mode
async function validateAndSubmit() {
  if (!form.value) return
  
  const { valid } = await form.value.validate()
  
  if (valid) {
    if (isEditMode.value) {
      updateEvent()
    } else {
      createEvent()
    }
  }
}

function handleDate() {
  let value = newEvent.value.date.replace(/\D/g, '')
  if (value.length >= 3) {
    value = value.slice(0, 2) + '/' + value.slice(2)
  }
  if (value.length >= 6) {
    value = value.slice(0, 5) + '/' + value.slice(5)
  }
  if (value.length >= 10) {
    value = value.slice(0, 10)
  }
  newEvent.value.date = value
}

function handleTime() {
  let value = newEvent.value.time.replace(/\D/g, '')
  if (value.length >= 3) {
    value = value.slice(0, 2) + ':' + value.slice(2)
  }
  if (value.length >= 5) {
    value = value.slice(0, 5)
  }
  newEvent.value.time = value
}

watch(page, () => {
  getEvents()
})

watch(itemsPerPage, () => {
  page.value = 1
  getEvents()
})

watch(search, () => {
  page.value = 1
  getEvents()
})

onMounted(() => {
  getEvents()
})

async function generateEventJournal() {
  try {
    const response = await api.postData('/v1/event/journal', {}, { responseType: 'blob' })
    
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'event_journal.pdf')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('Journal generated successfully')
  } catch (error: any) {
    const errorMessage = error?.message || 'Error generating journal'
    toast.error(errorMessage)
    console.error('Error:', error)
  }
}

// Function to open drawer in view mode (read-only)
function openViewDrawer(item: Event) {
  isEditMode.value = false
  isReadOnly.value = true
  editingItem.value = item

  newEvent.value = {
    date: item.date,
    time: item.time,
    title_ru: item.title_ru || '',
    title_kz: item.title_kz || '',
    description_ru: item.description_ru || '',
    description_kz: item.description_kz || ''
  }

  drawer.value = true
}

// Update the viewEventDetails function to handle the correct response structure
async function viewEventDetails(id: number) {
  try {
    const response = await api.fetchData<Event>(`/v1/event/${id}`)
    
    // Check if we have a valid response
    if (response && response.data) {
      // The event details might be directly in response.data
      const eventDetails = response.data.data || response.data
      
      // Make sure we have a valid event object before opening the drawer
      if (eventDetails && eventDetails.date) {
        openViewDrawer(eventDetails)
      } else {
        console.error('Invalid event data structure:', eventDetails)
        toast.error('Error: Invalid event data received')
      }
    }
  } catch (error: any) {
    const errorMessage = error?.message || 'Error fetching event details'
    toast.error(errorMessage)
    console.error('Error fetching event details:', error)
  }
}

// Update the drawer close function to reset read-only mode
function closeDrawer() {
  drawer.value = false
  isReadOnly.value = false
  isEditMode.value = false
  editingItem.value = null
}
</script>

<template>
  <v-container fluid>
    <v-navigation-drawer v-model="drawer" location="right" temporary width="500">
      <v-card flat>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>
            {{ isReadOnly ? t('details') : isEditMode ? t('edit') : t('add_event') }}
          </span>
          <v-btn icon="mdi-close" variant="text" @click="closeDrawer"></v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text>
          <!-- Edit/Add Form -->
          <v-form v-if="!isReadOnly" ref="form" @submit.prevent="validateAndSubmit">
            <v-text-field
              v-model="newEvent.title_ru"
              :label="t('event_title') + ' (Russian)'"
              :rules="titleRules"
              variant="outlined"
              class="mb-4"
            ></v-text-field>

            <v-textarea
              v-model="newEvent.description_ru"
              :label="t('event_description') + ' (Russian)'"
              :rules="descriptionRules"
              variant="outlined"
              class="mb-4"
            ></v-textarea>

            <v-text-field
              v-model="newEvent.title_kz"
              :label="t('event_title') + ' (Kazakh)'"
              variant="outlined"
              class="mb-4"
            ></v-text-field>

            <v-textarea
              v-model="newEvent.description_kz"
              :label="t('event_description') + ' (Kazakh)'"
              variant="outlined"
              class="mb-4"
            ></v-textarea>

            <v-text-field
              v-model="newEvent.date"
              :label="t('event_date')"
              :rules="dateRules"
              variant="outlined"
              class="mb-4"
              placeholder="DD/MM/YYYY"
              @input="handleDate"
            ></v-text-field>

            <v-text-field
              v-model="newEvent.time"
              :label="t('event_time')"
              variant="outlined"
              class="mb-4"
              placeholder="HH:MM"
              @input="handleTime"
            ></v-text-field>
          </v-form>

          <!-- View Mode -->
          <div v-else class="view-event-details">
            <v-card class="mb-4 pa-4 rounded-lg" elevation="0" color="#f5f7fa">
              <div class="d-flex align-center mb-2">
                <v-icon color="primary" class="mr-2">mdi-calendar</v-icon>
                <span class="text-h6 font-weight-medium">{{ newEvent.date }}</span>
                <span class="ml-2 text-body-1">{{ newEvent.time }}</span>
              </div>
            </v-card>

            <v-card class="mb-4 pa-4 rounded-lg" elevation="0">
              <div class="mb-3">
                <div class="text-caption text-medium-emphasis mb-1">{{ t('event_title') }} (RU)</div>
                <div class="text-h6 font-weight-medium">{{ newEvent.title_ru }}</div>
              </div>
              
              <div class="mb-3">
                <div class="text-caption text-medium-emphasis mb-1">{{ t('event_description') }} (RU)</div>
                <div class="text-body-1">{{ newEvent.description_ru }}</div>
              </div>
            </v-card>

            <v-card class="mb-4 pa-4 rounded-lg" elevation="0">
              <div class="mb-3">
                <div class="text-caption text-medium-emphasis mb-1">{{ t('event_title') }} (KZ)</div>
                <div class="text-h6 font-weight-medium">{{ newEvent.title_kz }}</div>
              </div>
              
              <div>
                <div class="text-caption text-medium-emphasis mb-1">{{ t('event_description') }} (KZ)</div>
                <div class="text-body-1">{{ newEvent.description_kz }}</div>
              </div>
            </v-card>
          </div>
        </v-card-text>

        <v-card-actions class="px-4 pb-4">
          <v-btn 
            v-if="!isReadOnly" 
            color="primary" 
            block 
            variant="flat" 
            @click="validateAndSubmit"
          >
            {{ isEditMode ? t('save') : t('add') }}
          </v-btn>
          <v-btn 
            v-else 
            color="primary" 
            block 
            variant="flat" 
            @click="closeDrawer"
          >
            {{ t('close') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-navigation-drawer>

    <v-app-bar>
      <template v-slot:title>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">{{ t('events') }}</span>
  
        </div>
      </template>

      <template v-slot:append>
        <help-button video-id="events"></help-button>
        <v-btn
          class="ml-3 mr-2"
          color="info"
          prepend-icon="mdi-file-pdf-box"
          variant="flat"
          @click="generateEventJournal"
        >
          {{ t('generate_journal') }}
        </v-btn>
        <v-btn
          class="ml-2"
          color="primary"
          prepend-icon="mdi-plus"
          variant="flat"
          @click="drawer = true"
        >
          {{ t('add_event') }}
        </v-btn>
      </template>
    </v-app-bar>

    <v-data-table :headers="headers" :items="filteredItems" :loading="loading" class="mt-2">
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
            <span class="mr-2">{{ activeCount }}</span>
            <span class="text-caption text-grey">{{ t('active') }}</span>
          </v-col>

          <v-col cols="3" class="d-flex align-center justify-center pa-2">
            <span class="mr-2">{{ pastCount }}</span>
            <span class="text-caption text-grey">{{ t('past') }}</span>
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
            :key="column.key || ''"
            class="bg-[#E7EAEE] text-subtitle-1 font-weight-bold"
          >
            {{ column.title }}
          </th>
        </tr>
      </template>

      <template v-slot:[`item.title_ru`]="{ item }">
        <div class="d-flex flex-column">
          <strong :style="{ color: item.color }">
            {{ locale === 'kk' ? item.title_kz : item.title_ru }}
          </strong>
        </div>
      </template>

      <template v-slot:[`item.title_kz`]="{ item }">
        <div class="d-flex flex-column">
          <strong :style="{ color: item.color }">
            {{ locale === 'kk' ? item.title_kz : item.title_ru }}
          </strong>
        </div>
      </template>

      <template v-slot:[`item.description_ru`]="{ item }">
        <div>
          {{ locale === 'kk' ? item.description_kz : item.description_ru }}
        </div>
      </template>

      <template v-slot:[`item.description_kz`]="{ item }">
        <div>
          {{ locale === 'kk' ? item.description_kz : item.description_ru }}
        </div>
      </template>

      <template v-slot:[`item.date`]="{ item }">
        <div class="d-flex flex-column">
          <strong>{{ item.date }}</strong>
          <span>{{ item.time }}</span>
        </div>
      </template>

      <template v-slot:[`item.status`]="{ item }">
        <v-chip
          :color="item.status === 'active' ? '#47ADFF' : 'grey'"
          variant="flat"
        >
          {{ t(item.status || '') }}
        </v-chip>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <div class="d-flex justify-center">
          <v-btn icon="mdi-eye" variant="text" @click="viewEventDetails(item.id)"></v-btn>
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
    <!-- Temporarily commented out pagination
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
    -->

    <!-- Delete confirmation dialog -->
    <v-dialog v-model="deleteDialog" max-width="450" content-class="delete-dialog">
      <v-card>
        <v-card-text class="text-center pt-6 pb-4">
          <v-icon color="error" size="x-large" class="mb-4">mdi-alert-circle-outline</v-icon>
          <h3 class="text-h5 font-weight-medium mb-4">{{ t('deletion') }}</h3>
          <p class="text-body-1">{{ t('confirm_delete_event') }}</p>
        </v-card-text>

        <v-card-actions class="pa-4 pt-0">
          <v-row>
            <v-col cols="6">
              <v-btn color="primary" variant="flat" block height="44" @click="deleteEvent">
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