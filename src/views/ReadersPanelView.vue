<script lang="ts" setup>
import { useAuth } from '@/auth/index'
import { ref, computed, type Ref, watch, onMounted } from 'vue'
import { useAPI } from '@/api'
import { useI18n } from 'vue-i18n'
import returned from '@/assets/return.svg'

const { t } = useI18n()
const auth = useAuth()
const api = useAPI()

const page = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)
const subscription = ref([])
const newDate = ref('')
const maskedIin = ref(true)

const subscriptionHeaders = [
  { key: 'id', title: 'ID' },
  { key: 'name', title: t('book') },
  { key: 'activity', title: t('activity') },
  { key: 'logs', title: t('history') },
  { key: 'actions', title: t('actions') }
]

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

function formatDateTime(date: string) {
  if (!date) return ''
  return new Date(date).toLocaleString()
}

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

watch(page, () => {
  getSubscription()
})

onMounted(() => {
  getSubscription()
})
</script>

<template>
  <v-container>
    <v-row>
        <v-col>
          <v-banner bg-color="#2752E7" rounded>
            <template v-slot:prepend>
              <v-avatar color="white" icon="mdi-hand-wave"></v-avatar>
            </template>

            <v-banner-text>
              <div class="text-h6">
                {{ t('welcome') }},
                {{ auth.user.value ? auth.user.value.user_data.firstname : '' }}
              </div>
              <p>{{ t('digital_library_system') }}</p>
            </v-banner-text>
          </v-banner>
        </v-col>
      </v-row>
    <v-card class="mt-4" elevation="1">
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

    <v-row class="mt-4">
      <v-col cols="12">
        <v-data-table
          :headers="subscriptionHeaders"
          :items="subscription"
          :items-per-page="itemsPerPage"
          :page="page"
          :items-length="totalItems"
          @update:page="page = $event"
        >
          <template v-slot:[`item.logs`]="{ item }">
            <div v-if="item.logs && item.logs.length > 0">
              <div v-for="log in item.logs" :key="log.id" class="mb-2">
                <v-chip
                  :color="log.type === 1 ? 'primary' : 'success'"
                  variant="outlined"
                  size="small"
                  class="mb-1"
                >
                  {{ log.type === 1 ? 'Выдал' : 'Принял' }}
                </v-chip>
                <div class="text-caption">{{ log.fullname }}</div>
              </div>
            </div>
          </template>

          <template v-slot:[`item.name`]="{ item }">
            <div class="mt-2">{{ item.book.title }}</div>
            <div class="text-medium-emphasis mt-2">
              {{ t('year_of_publication') }}: {{ item.book.year }}
            </div>
            <div class="text-medium-emphasis">
              Инвентарный номер: {{ item.book_inventory?.inventory }}
            </div>
            <div class="my-2">
              <v-chip
                v-for="author in item.book.book_author_main"
                :key="author.id"
                color="primary"
                variant="outlined"
              >
                {{ author.name }}
              </v-chip>
            </div>
            <div class="my-2">
              <v-chip
                v-for="publisher in item.book.book_publisher"
                :key="publisher.id"
                color="green"
                variant="flat"
              >
                {{ t('publisher') }}: {{ publisher.title }}
              </v-chip>
            </div>
          </template>

          <template v-slot:[`item.activity`]="{ item }">
            <div class="mb-2">
              <v-chip v-if="item.status === 'return'" color="primary" variant="outlined">
                {{ t('returned') }}
              </v-chip>
              <v-chip v-if="item.status === 'request'" color="primary" variant="outlined">
                На выдаче
              </v-chip>
              <v-chip color="primary" variant="outlined" v-if="item.status === 'reader'">
                Читательский зал
              </v-chip>
            </div>
            <div>{{ t('issue_date') }}: {{ formatDateTime(item.created_at) }}</div>
            <div>{{ t('return_date') }}: {{ formatDateTime(item.return_date) }}</div>
            <div v-if="item.status == 'return'">
              Дата возврата в фонд: {{ formatDateTime(item.returned_at) }}
            </div>
          </template>

          <template v-slot:[`item.actions`]="{ item }">
            <div v-if="item.status !== 'return'" class="d-flex flex-column my-2">
              <v-btn color="#384352" variant="flat" @click="activateReturn(item.id)"
                >Сделать возврат
              </v-btn>
              <v-dialog v-if="item.status !== 'reader'" max-width="50vw">
                <template v-slot:activator="{ props }">
                  <v-btn class="mt-2" color="primary" v-bind="props" variant="flat"
                    >Изменить дату
                  </v-btn>
                </template>

                <template v-slot:default="{ isActive }">
                  <v-card>
                    <v-card-title>
                      <div class="d-flex justify-space-between">
                        <span class="font-weight-bold">{{ t('change_return_date') }}</span>
                        <v-btn
                          icon="mdi-close"
                          variant="text"
                          @click="isActive.value = false"
                        ></v-btn>
                      </div>
                    </v-card-title>

                    <v-card-text>
                      <div class="d-flex justify-space-between">
                        <v-text-field
                          :label="t('from')"
                          type="date"
                          variant="outlined"
                        ></v-text-field>
                        <v-text-field
                          v-model="newDate"
                          class="ml-4"
                          :label="t('to')"
                          type="date"
                          variant="outlined"
                        ></v-text-field>
                      </div>
                    </v-card-text>

                    <v-card-actions class="pb-4">
                      <v-btn class="ml-4 mr-2" variant="tonal" @click="isActive.value = false"
                        >{{ t('close') }}
                      </v-btn>
                      <v-btn color="primary" variant="flat" @click="changeDate(item.id)"
                        >{{ t('edit') }}
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </template>
              </v-dialog>
            </div>
            <div v-else class="d-flex align-center text-center w-100">
              <img :src="returned" alt="returned" class="mx-auto" width="60" />
            </div>
          </template>

          <template v-slot:bottom>
            <div class="d-flex align-center justify-end pt-4">
              <v-pagination
                v-model="page"
                :length="Math.ceil(totalItems / itemsPerPage)"
                rounded="circle"
              ></v-pagination>
            </div>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.status-chip {
  background-color: #e8f5e9 !important;
  color: #2e7d32 !important;
  font-weight: 500 !important;
  letter-spacing: 0.5px;
  padding: 0 12px !important;
  height: 24px !important;
  border: 1px solid #a5d6a7 !important;
}

.status-chip:hover {
  background-color: #c8e6c9 !important;
  transition: background-color 0.2s ease;
}
</style> 