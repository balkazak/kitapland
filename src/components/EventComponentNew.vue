<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAPI } from '@/api'
import { useAuth } from '@/auth/index'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t, locale } = useI18n()
const api = useAPI()
const auth = useAuth()
const router = useRouter()

interface Event {
  id: number
  date: string
  time: string
  title_ru: string
  title_kz: string
  description_ru: string
  description_kz: string
  status?: string
  color?: string
}

const events = ref<Event[]>([])
const loading = ref(true)
const activeTab = ref('active')

// Get events from API
async function getEvents() {
  loading.value = true
  try {
    const response = await api.fetchData<{
      data: Event[]
      meta: { last_page: number; total: number }
    }>('/v1/event?per_page=4')
    
    if (response && response.data) {
      const eventData = Array.isArray(response.data) ? response.data : 
                      (response.data.data && Array.isArray(response.data.data) ? response.data.data : []);
      
      events.value = eventData.map((item, index) => {
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
    }
  } catch (error) {
    console.error('Error fetching events:', error)
  } finally {
    loading.value = false
  }
}

function parseDate(dateStr: string) {
  const [day, month, year] = dateStr.split('/').map(Number)
  return new Date(year, month - 1, day)
}

// Filter events by status
const filteredEvents = computed(() => {
  return events.value.filter(event => event.status === activeTab.value)
})

// Navigate to events page for more details
function viewAllEvents() {
  router.push('/events')
}

onMounted(() => {
  getEvents()
})
</script>

<template>
  <v-card>
    <v-card-title>{{ t('events') }}</v-card-title>
    
    <v-card-text>
      <div class="d-flex mb-4">
        <v-tabs v-model="activeTab" color="primary">
          <v-tab value="active">{{ t('active') }}</v-tab>
          <v-tab value="past">{{ t('past') }}</v-tab>
        </v-tabs>
      </div>
      
      <v-progress-circular v-if="loading" indeterminate color="primary" class="d-flex mx-auto my-6"></v-progress-circular>
      
      <div v-else-if="filteredEvents.length === 0" class="text-center py-8 text-medium-emphasis">
        {{ t('no_events') }}
      </div>
      
      <div v-else>
        <div v-for="event in filteredEvents" :key="event.id" class="mb-4">
          <div class="d-flex">
            <div class="event-date mr-4 text-center" :style="{backgroundColor: '#f5f7fa'}">
              <div class="text-body-1 font-weight-bold">{{ event.date }}</div>
              <div class="text-caption">{{ event.time }}</div>
            </div>
            
            <div class="event-content" :style="{borderLeftColor: event.color, borderLeftWidth: '4px', borderLeftStyle: 'solid', paddingLeft: '16px'}">
              <div class="text-subtitle-1 font-weight-bold">
                {{ locale === 'kk' ? event.title_kz : event.title_ru }}
              </div>
              <div class="text-body-2 text-truncate">
                {{ locale === 'kk' ? event.description_kz : event.description_ru }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </v-card-text>
    
    <v-card-actions>
      <v-btn 
        color="primary" 
        variant="flat" 
        block
        @click="viewAllEvents"
      >
        {{ t('details') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.event-date {
  min-width: 80px;
  padding: 8px;
  border-radius: 4px;
}

.event-content {
  flex: 1;
  overflow: hidden;
}
</style> 