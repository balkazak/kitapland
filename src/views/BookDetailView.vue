<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAPI } from '@/api'
import nocover from '@/assets/no-book-cover.svg'
import { useI18n } from 'vue-i18n'
import { useToastStore } from '@/stores/toast'
import HelpButton from '@/components/HelpButton.vue'

const { t } = useI18n()
const api = useAPI()
const route = useRoute()
const router = useRouter()
const toast = useToastStore()

const tab = ref('one')
const readingRoomSubscriptions = ref([])
const loanSubscriptions = ref([])
const bookStatusData = ref({
  subscription: { items: { requests: 0, returns: 0 } },
  schoolBooks: [],
  schoolLogs: []
})

const book = ref(null)
const loading = ref(true)

async function getBook() {
  try {
    loading.value = true
    const response = await api.fetchData(`/v1/book/${route.params.id}`)
    if (response.data) {
      book.value = response.data
    }
  } catch (error) {
    console.error('Error fetching book:', error)
    toast.error('Ошибка при загрузке книги')
  } finally {
    loading.value = false
  }
}

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

async function getSubscriptionLists(bookId) {
  try {
    const response = await api.fetchData(`/v1/book-detail/subscription-list/${bookId}`)
    if (response.data) {
      readingRoomSubscriptions.value = response.data.filter(item => item.type === 'reading_room')
      loanSubscriptions.value = response.data.filter(item => item.type === 'loan')
    }
  } catch (error) {
    console.error('Error fetching subscription lists:', error)
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getImageURL = (url: string) => {
  return import.meta.env.VITE_APP_API + '/storage/covers/' + url
}

function copyBiographicalRecord() {
  if (!book.value) return

  const mainAuthor = book.value.book_author_main?.[0]?.name || ''
  const bbkCode = book.value.book_bbk?.[0]?.title || ''
  const isbn = book.value.ISBN || ''
  const year = book.value.year || ''
  const pages = book.value.pages || ''
  const publisher = book.value.book_publisher?.[0]?.title || ''
  const country = book.value.book_country?.[0]?.title || ''

  const bioRecord = `${book.value.id} ${bbkCode} ${book.value.title} [Текст] / ${mainAuthor} // ${publisher ? publisher + ', ' : ''}${country ? country + ', ' : ''}${year}${pages ? ' - ' + pages + ' с.' : ''}${isbn ? ' - ISBN ' + isbn : ''}`

  navigator.clipboard
    .writeText(bioRecord)
    .then(() => {
      toast.success('Биографическая запись скопирована в буфер обмена')
    })
    .catch((err) => {
      toast.error('Не удалось скопировать запись')
    })
}

watch([tab, route], async ([newTab, newRoute]) => {
  if (newRoute.params.id) {
    if (newTab === 'three') {
      await getBookStatusData(newRoute.params.id)
    } else if (newTab === 'four' || newTab === 'five') {
      await getSubscriptionLists(newRoute.params.id)
    }
  }
})

// Initial data load
getBook()
</script>

<template>
  <v-container fluid>
    <v-app-bar>
      <v-btn
        icon="mdi-arrow-left"
        variant="text"
        @click="router.back()"
        class="mr-4"
      ></v-btn>
      
      <template v-slot:title>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">{{ book?.title || 'Детали книги' }}</span>
          <span class="text-subtitle-2 text-medium-emphasis">{{ t('database_by_rk') }}</span>
        </div>
      </template>

      <template v-slot:append>
        <v-divider class="mr-6" inset vertical></v-divider>
        <help-button video-id="o1uPrDh8o5g" />
      </template>
    </v-app-bar>

    <v-row v-if="loading">
      <v-col class="text-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-col>
    </v-row>

    <template v-else-if="book">
      <v-row>
        <v-col>
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
                    <v-img :src="book.book_cover ? getImageURL(book.book_cover.value) : nocover" class="rounded" fluid></v-img>
                    <div class="mt-2">
                      {{ t('creator') }}:
                      {{ book?.book_log?.[0]?.school?.name || t('no_data_available') }}
                    </div>
                  </v-col>
                  <v-col cols="8">
                    <v-row>
                      <v-chip
                        v-for="item in book.book_type"
                        :key="item.id"
                        color="primary"
                        variant="flat"
                      >
                        {{ item.title }}
                        <span v-if="item.id === 1 && item.book_classroom">
                          {{ item.book_classroom.classroom }}
                        </span>
                      </v-chip>
                      <v-chip class="ml-2" variant="tonal" v-if="book.part">
                        {{ book.part === 1 ? 'Часть' : 'Том' }} : {{ book?.volume }}
                      </v-chip>
                    </v-row>
                    <v-row class="mt-4">
                      <div class="font-weight-bold">{{ book.title }}</div>
                    </v-row>
                    <v-row>
                      <div class="text-medium-emphasis">{{ book.title2 }}</div>
                    </v-row>
                    <v-row class="mt-4">
                      <div class="mt-3">
                        <div>
                          <template v-for="(author, index) in book.book_author_main" :key="author.id">
                            <v-chip color="primary" variant="outlined">
                              {{ author.name }}
                            </v-chip>
                          </template>
                        </div>
                        <div class="mt-2">
                          <template v-for="(author, index) in book.book_author" :key="author.id">
                            <v-chip color="grey" variant="outlined" class="mr-1">
                              {{ author.name }}
                            </v-chip>
                          </template>
                        </div>
                      </div>
                    </v-row>
                    <v-row class="mt-4">
                      <div>{{ book.annotation }}</div>
                    </v-row>
                    <v-row class="mt-6">
                      <v-card class="w-100" variant="tonal">
                        <v-card-text>
                          <v-container fluid>
                            <v-row>
                              <v-col>
                                <div><strong>{{ t('publisher') }}:</strong></div>
                                <div>
                                  {{ book.book_publisher ? book.book_publisher.map((obj) => obj.title).join(', ') : '' }}
                                </div>
                              </v-col>
                              <v-col>
                                <div><strong>{{ t('year_of_publication') }}:</strong></div>
                                <div>{{ book.year }}</div>
                              </v-col>
                            </v-row>
                            <v-row>
                              <v-col>
                                <div><strong>УДК:</strong></div>
                                <div>
                                  {{ book.book_udk ? book.book_udk.map((obj) => obj.number + ' ' + obj.title).join(', ') : '' }}
                                </div>
                              </v-col>
                              <v-col>
                                <div><strong>{{ t('language') }}:</strong></div>
                                <div>
                                  {{ book.book_language ? book.book_language.map((obj) => obj.title).join(', ') : '' }}
                                </div>
                              </v-col>
                            </v-row>
                            <v-row>
                              <v-col>
                                <div><strong>ББК:</strong></div>
                                <div>
                                  {{ book.book_bbk ? book.book_bbk.map((obj) => obj.number + ' ' + obj.title).join(', ') : '' }}
                                </div>
                              </v-col>
                              <v-col>
                                <div><strong>Жанр:</strong></div>
                                <div>
                                  {{ book.book_genre ? book.book_genre.map((obj) => obj.title).join(', ') : '' }}
                                </div>
                              </v-col>
                            </v-row>
                            <v-row>
                              <v-col>
                                <div><strong>Страницы:</strong></div>
                                <div>{{ book.pages }}</div>
                              </v-col>
                              <v-col>
                                <div><strong>Год издания:</strong></div>
                                <div>{{ book.year }}</div>
                              </v-col>
                            </v-row>
                            <v-row>
                              <v-col>
                                <div><strong>ISBN:</strong></div>
                                <div>{{ book.ISBN }}</div>
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
                    <v-chip v-for="item in book.quotes" :key="item" color="primary">
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
                          {{ book.id }}
                          {{ book.book_bbk?.[0]?.title || '' }}
                          {{ book.title }}
                          [Текст] /
                          {{ book.book_author_main?.[0]?.name || '' }} //
                          {{ book.book_publisher?.[0]?.title ? book.book_publisher[0].title + ', ' : '' }}
                          {{ book.book_country?.[0]?.title ? book.book_country[0].title + ', ' : '' }}
                          {{ book.year }}
                          {{ book.pages ? ' - ' + book.pages + ' с.' : '' }}
                          {{ book.ISBN ? ' - ISBN ' + book.ISBN : '' }}
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
                      <tr v-if="!book.book_log.length">
                        <td colspan="5" class="text-center text-medium-emphasis">
                          Нет данных
                        </td>
                      </tr>
                      <tr v-else v-for="(log, index) in book.book_log" :key="index">
                        <td>{{ log.school?.id || '-' }}</td>
                        <td>{{ log.school?.name || '-' }}</td>
                        <td>{{ log.status?.title || '-' }}</td>
                        <td class="text-center">
                          <v-chip size="small" color="primary" variant="flat" class="px-2">
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
                                <v-chip size="small" color="primary" variant="flat" class="px-2">
                                  {{ bookStatusData.subscription.items.requests || 0 }}
                                </v-chip>
                              </td>
                            </tr>
                            <tr>
                              <td>2</td>
                              <td>{{ t('on_loan') }}</td>
                              <td class="text-center">
                                <v-chip size="small" color="primary" variant="flat" class="px-2">
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

            <!-- Reading Room Tab -->
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
                        <v-chip size="small" :color="item.status ? 'success' : 'error'" variant="flat" class="px-2">
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

            <!-- On Loan Tab -->
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
                        <v-chip size="small" :color="item.status ? 'success' : 'error'" variant="flat" class="px-2">
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
                <template v-if="book.book_quote && book.book_quote.length > 0">
                  <div v-for="quote in book.book_quote" :key="quote.id" class="mb-4">
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
        </v-col>
      </v-row>
    </template>
  </v-container>
</template> 