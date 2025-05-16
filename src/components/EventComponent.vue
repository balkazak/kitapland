<script>
import { VCalendar } from 'vuetify/labs/VCalendar'
import { useAPI } from '@/api'
import { useAuth } from '@/auth/index'
import { useI18n } from 'vue-i18n'

export default {
  components: { VCalendar },
  setup() {
    const { t } = useI18n()
    return { t }
  },
  data: () => ({
    tab: 0,
    dates: [],
    events: [],
    newEvent: {
      title: '',
      description: '',
      date: '',
      time: ''
    },
    headers: [
      { key: 'title', title: 'Название' },
      { key: 'description', title: 'Описание' },
      { key: 'start', title: 'Начало' },
      { key: 'end', title: 'Конец' },
    ],
  }),
  mounted() {
    this.getEvents()
  },
  methods: {
    async createEvent() {
      try {
        const api = useAPI()
        const auth = useAuth()
        this.newEvent.school_id = auth.userData.value.school.id
        await api.postData('/v1/event', this.newEvent)
        this.newEvent = {
          title: '',
          description: '',
          date: '',
          time: ''
        }
        this.getEvents()
      } catch (e) {
        console.error(e)
      }
    },
    async getEvents() {
      this.events = []
      try {
        const api = useAPI()
        const response = await api.fetchData('/v1/event')
        response.data.data.items.forEach((element) => {
          const [day, month, year] = element.date.split('.').map(Number); 
          this.events.push({
            title: element.title,
            start: new Date(year, month - 1, day),
            end: new Date(year, month - 1, day),
            color: 'red',
            description: element.description
          })
        })
      } catch (e) {
        console.error(e)
      }
    },
    formatDate(dateToFormat) {
      const date = dateToFormat
      const day = date.getDate().toString().length > 1 ? date.getDate() : '0' + date.getDate()
      const month =
        (date.getMonth() + 1).toString().length > 1 ? date.getMonth() + 1 : '0' + date.getMonth()
      return `${day}.${month}.${date.getFullYear()}`
    },
    async downloadJournal() {
      try {
        const api = useAPI()
        const auth = useAuth()
        const response = await api.fetchFile(
          `/v1/event/journal?school_id=${auth.userData.value.school.id}`
        )
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
    },
    handleDate() {
      let value = this.newEvent.date.replace(/\D/g, '')
      if (value.length >= 3) {
        value = value.slice(0, 2) + '.' + value.slice(2)
      }
      if (value.length >= 6) {
        value = value.slice(0, 5) + '.' + value.slice(5)
      }
      if (value.length >= 10) {
        value = value.slice(0, 10)
      }
      this.newEvent.date = value
    },
    handleTime() {
      let value = this.newEvent.time.replace(/\D/g, '')
      if (value.length >= 3) {
        value = value.slice(0, 2) + ':' + value.slice(2)
      }
      this.newEvent.time = value
    }
  }
}
</script>

<template>
  <v-card>
    <v-card-title>{{ t('events') }}</v-card-title>
    <v-card-text>
      <v-tabs v-model="tab" color="primary">
        <v-tab :value="0">{{ t('basic') }}</v-tab>
        <v-tab :value="1">{{ t('other') }}</v-tab>
      </v-tabs>

      <v-tabs-window v-model="tab">
        <v-tabs-window-item :value="0">
          <v-container fluid>
            <v-row>
              <v-col>
                <v-calendar type="month" height="430" :events="events" color="primary">
                  <template #event="{ event }">
                    <div class="bordered mx-auto text-center">
                      <div class="font-weight-bold">{{ event.title }}</div>
                      <div>{{ event.description }}</div>
                    </div>
                  </template>
                </v-calendar>
              </v-col>
              <v-col cols="3">
                <v-card>
                  <v-card-title>{{ t('add_event') }}</v-card-title>
                  <v-card-text>
                    <v-form>
                      <v-text-field
                        v-model="newEvent.title"
                        density="compact"
                        variant="outlined"
                        hide-details
                        :label="t('event_title')"
                      />
                      <v-textarea
                        v-model="newEvent.description"
                        density="compact"
                        class="my-3"
                        variant="outlined"
                        hide-details
                        :label="t('event_description')"
                      />
                      <v-text-field
                        v-model="newEvent.date"
                        class="mb-3"
                        type="text"
                        density="compact"
                        variant="outlined"
                        hide-details
                        :label="t('event_date')"
                        @input="handleDate()"
                      />
                      <v-text-field
                        v-model="newEvent.time"
                        density="compact"
                        type="text"
                        variant="outlined"
                        hide-details
                        :label="t('event_time')"
                        @input="handleTime()"
                      />
                    </v-form>
                  </v-card-text>
                  <v-card-actions>
                    <v-btn color="primary" @click="createEvent">{{ t('add') }}</v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-list class="overflow-auto" height="430" color="primary" lines="two">
                  <v-list-item
                    v-for="event in events"
                    class="mb-4"
                    :key="event.id"
                    :value="event"
                    rounded="xl"
                    :title="event.title"
                  >
                    <v-list-item-subtitle>
                      <div>
                        {{ formatDate(event.start) }}
                      </div>
                      <div>{{ event.description }}</div>
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </v-container>
        </v-tabs-window-item>
        <v-tabs-window-item :value="1">
          <v-container fluid>
            <v-data-table :items="events.filter((event) => { return event.end > new Date() })" :headers="headers">
              <template v-slot:[`item.start`]="{ item }">
                {{ formatDate(item.start) }}
              </template>
              <template v-slot:[`item.end`]="{ item }">
                {{ formatDate(item.end) }}
              </template>
            </v-data-table>
          </v-container>
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" @click="downloadJournal">{{ t('download_event_journal') }}</v-btn>
    </v-card-actions>
  </v-card>
</template>
