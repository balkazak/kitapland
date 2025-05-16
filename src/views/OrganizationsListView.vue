<script lang="ts" setup>
import { type Ref, ref, watch, computed } from 'vue'
import { useAPI } from '@/api'
import { useI18n } from 'vue-i18n'
import { useAuth } from '@/auth'
import { useToastStore } from '@/stores/toast'

const { t } = useI18n()
const api = useAPI()
const auth = useAuth()
const toast = useToastStore()

const isAdmin = computed(() => auth.user.value?.roles[0].id === 1)

const headers = [
  { title: 'ID', key: 'id' },
  {
    title: t('name'),
    key: 'name'
  },
  { title: t('status'), key: 'status' },
  { title: t('address'), key: 'address' },
  { title: t('quantity'), key: 'quantity' },
  { title: '', sortable: false, key: 'actions' }
]

interface OrganizationType {
  id: number
  label: string
}

const page = ref(1)
const organizationDrawer = ref(false)
const organizations = ref([])
const length = ref(0)
const search = ref('')
const organizationTypes = ref<OrganizationType[]>([])
const subscriptions = [
  { id: 0, title: 'Тестовый' },
  { id: 1, title: 'Договор' }
]
const subscriptionTypes = [
  { id: 1, title: '1 месяц' },
  { id: 2, title: '2 месяца' },
  { id: 3, title: '3 месяца' },
  { id: 4, title: '4 месяца' },
  { id: 5, title: '5 месяца' },
  { id: 6, title: '6 месяца' },
  { id: 7, title: '7 месяцев' },
  { id: 8, title: '8 месяцев' },
  { id: 9, title: '9 месяцев' },
  { id: 10, title: '10 месяцев' },
  { id: 11, title: '11 месяцев' },
  { id: 12, title: '12 месяцев' }
]
const getOrganizations = async () => {
  let request = `/v1/school?page=${page.value}`
  if (search.value.length > 0) {
    request += `&search=${search.value}`
  }
  const response = await api.fetchData(request)
  if (response.data) {
    organizations.value = response.data.data.items
    length.value = response.data.meta.last_page
  }
}

const getOrganizationTypes = async () => {
  const response = await api.fetchData<{ data: { items: OrganizationType[] } }>('/v1/organization')
  if (response.data) {
    organizationTypes.value = response.data.data.items
  }
}

interface Region {
  id: number
  parent_id: number | null
  number: string
  title: string
}

const parentRegions: Ref<Region[]> = ref([])
const childrenRegions: Ref<Region[]> = ref([])
const thirdRegions: Ref<Region[]> = ref([])
const parentRegion: Ref<Region | null> = ref(null)
const childRegion: Ref<Region | null> = ref(null)
const thirdRegion: Ref<Region | null> = ref(null)
const regionId: Ref<number | null> = ref(null)
const regionTitle: Ref<string> = ref('')

const requestBody = ref({
  name: '',
  bin: '',
  address: '',
  zip_code: '',
  region_id: null,
  organization_id: null,
  subscription: {
    period: null,
    type: null,
    activated_at: null
  }
})

const getRegions = async (parentId: number | null = null) => {
  try {
    let request = '/v1/region/open'
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

const chooseRegion = (isActive: Ref<boolean>) => {
  if (parentRegion.value && childRegion.value && thirdRegion.value) {
    requestBody.value.region_id = thirdRegion.value.id
    regionTitle.value = `${parentRegion.value.title} / ${childRegion.value.title} / ${thirdRegion.value.title}`
  } else if (parentRegion.value && childRegion.value) {
    requestBody.value.region_id = childRegion.value.id
    regionTitle.value = `${parentRegion.value.title} / ${childRegion.value.title}`
  } else if (parentRegion.value) {
    requestBody.value.region_id = parentRegion.value.id
    regionTitle.value = `${parentRegion.value.title}`
  }
  isActive.value = false
}

function formatDate(dateToFormat: string) {
  const parts = dateToFormat.split('-')
  const year = parts[0]
  const month = parts[1]
  const day = parts[2]

  return `${day}.${month}.${year}`
}

const createSchool = async () => {
  requestBody.value.subscription.activated_at = formatDate(
    requestBody.value.subscription.activated_at
  )
  await api.postData('/v1/school', requestBody.value)
  requestBody.value = {
    name: '',
    bin: '',
    address: '',
    zip_code: '',
    region_id: null,
    organization_id: null,
    subscription: {
      period: null,
      type: null,
      activated_at: null
    }
  }
  organizationDrawer.value = false
}

watch(parentRegion, async (value) => {
  if (value) await getRegions(value.id)
})

watch(childRegion, async (value) => {
  if (value) await getRegions(value.id)
})

getRegions()
getOrganizations()
getOrganizationTypes()

watch(page, () => {
  getOrganizations()
})

watch(search, () => {
  getOrganizations()
})

const deleteDialog = ref(false)
const organizationToDelete = ref<number | null>(null)

const deleteOrganization = async (id: number) => {
  organizationToDelete.value = id
  deleteDialog.value = true
}

const confirmDelete = async () => {
  try {
    if (!organizationToDelete.value) return

    await api.deleteData(`/v1/school/${organizationToDelete.value}`)
    toast.success('Организация успешно удалена')
    getOrganizations()
    deleteDialog.value = false
  } catch (error) {
    toast.error('Ошибка при удалении организации')
    console.error(error)
  }
}
</script>

<template>
  <v-container fluid>
    <v-app-bar>
      <template v-slot:title>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">Организации</span>
          <span class="text-subtitle-2 text-medium-emphasis"
            >{{ t('online_library_card_registration') }}
          </span>
        </div>
      </template>

      <template v-slot:append>
        <v-btn variant="tonal">Регион</v-btn>
        <v-btn class="ml-3" variant="tonal">{{ t('type') }}</v-btn>
        <v-btn class="ml-3" variant="tonal">{{ t('class_teacher') }}</v-btn>
        <v-btn
          class="ml-3"
          color="primary"
          prepend-icon="mdi-plus"
          variant="flat"
          @click="organizationDrawer = true"
          >{{ t('add') }}
        </v-btn>
      </template>
    </v-app-bar>

    <v-navigation-drawer v-model="organizationDrawer" location="right" temporary width="700">
      <v-list-item>
        <span class="font-weight-bold">Добавить организацию</span>
      </v-list-item>
      <v-divider></v-divider>
      <v-list-item class="my-2">
        <span class="font-weight-bold">{{ t('basic') }}</span>
      </v-list-item>

      <v-list-item>
        <v-text-field
          v-model="requestBody.name"
          class="mt-1"
          :label="t('name')"
          variant="outlined"
        ></v-text-field>
        <v-text-field v-model="requestBody.bin" label="БИН" variant="outlined"></v-text-field>
        <v-textarea
          v-model="requestBody.address"
          :label="t('address')"
          variant="outlined"
        ></v-textarea>
        <v-select
          v-model="requestBody.organization_id"
          :items="organizationTypes"
          item-title="label"
          item-value="id"
          label="Тип организации"
          variant="outlined"
        ></v-select>
        <v-text-field
          v-model="requestBody.zip_code"
          label="Почтовый индекс"
          variant="outlined"
        ></v-text-field>
        <v-dialog width="700">
          <template v-slot:activator="{ props }">
            <v-text-field
              v-model="regionTitle"
              label="Город и регион"
              placeholder="Выберите"
              v-bind="props"
              variant="outlined"
            ></v-text-field>
          </template>

          <template v-slot:default="{ isActive }">
            <v-card title="Выберите регион">
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
                <div class="d-flex w-100 justify-space-between px-3 pb-3">
                  <v-btn color="primary" variant="flat" @click="chooseRegion(isActive)"
                    >Выбрать
                  </v-btn>
                  <v-btn variant="tonal" @click="isActive.value = false">Отмена</v-btn>
                </div>
              </v-card-actions>
            </v-card>
          </template>
        </v-dialog>
        <v-select
          v-model="requestBody.subscription.period"
          :items="subscriptionTypes"
          item-value="id"
          label="Подписка"
          variant="outlined"
        ></v-select>
        <v-select
          v-model="requestBody.subscription.type"
          :items="subscriptions"
          item-value="id"
          label="Тип подписки"
          variant="outlined"
        ></v-select>
        <v-text-field
          v-model="requestBody.subscription.activated_at"
          label="Дата подключения"
          type="date"
          variant="outlined"
        ></v-text-field>
      </v-list-item>

      <v-list-item class="mt-2 mb-6 text-center">
        <v-btn class="mr-10" variant="tonal" @click="organizationDrawer = false">{{
          t('close')
        }}</v-btn>
        <v-btn color="primary" variant="flat" @click="createSchool">{{ t('add') }}</v-btn>
      </v-list-item>
    </v-navigation-drawer>

    <v-row>
      <v-col>
        <v-data-table :headers="headers" :items="organizations" :items-per-page="15">
          <template v-slot:top>
            <v-row>
              <v-col cols="4">
                <v-text-field
                  v-model="search"
                  class="rounded my-2 ml-2"
                  density="compact"
                  :label="t('search_by_name_and_bin')"
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                ></v-text-field>
              </v-col>
            </v-row>
          </template>
          <template v-slot:bottom></template>

          <template v-slot:[`item.status`]="{ item }">
            <v-chip
              :color="item.activated === 1 ? 'green' : 'red'"
              class="ml-1"
              size="small"
              variant="flat"
            >
              {{ item.activated ? t('active') : 'Не активен' }}
            </v-chip>
          </template>

          <template v-slot:[`item.address`]="{ item }">
            <div class="text-medium-emphasis">
              {{ t('address') }}: {{ item.description.address }}
            </div>
            <div class="text-medium-emphasis">Индекс: {{ item.description.zip_code }}</div>
          </template>

          <template v-slot:[`item.quantity`]="{ item }">
            <div class="mt-2 mb-1">
              <v-chip color="primary" variant="flat">M-Data: {{ item.book_count }}</v-chip>
            </div>
            <div class="mb-2">
              <v-chip variant="flat">{{ t('fund') }}: {{ item.book_school_count }}</v-chip>
            </div>
          </template>

          <template v-slot:[`item.name`]="{ item }">
            <div class="font-weight-bold mt-3 mb-1">{{ item.name }}</div>
            <div class="mb-3">
              <v-chip color="primary" size="small" variant="outlined"
                >БИН: {{ item.description.bin }}
              </v-chip>
            </div>
          </template>

          <template v-slot:[`item.actions`]="{ item }">
            <v-btn
              :to="`/organizations/${item.id}`"
              append-icon="mdi-arrow-right"
              variant="outlined"
            >
              {{ t('go_to') }}
            </v-btn>
            <div v-if="isAdmin" class="d-inline-flex ml-2">
              <v-btn class="mr-2" icon="mdi-download" variant="flat"></v-btn>
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                @click="deleteOrganization(item.id)"
              ></v-btn>
            </div>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-pagination
          v-model="page"
          :length="length"
          :total-visible="6"
          active-color="primary"
          class="ml-auto mr-2"
          size="small"
          variant="flat"
        ></v-pagination>
      </v-col>
    </v-row>
  </v-container>

  <v-dialog v-model="deleteDialog" max-width="400">
    <v-card>
      <v-card-title class="text-h6"> Подтверждение удаления </v-card-title>
      <v-card-text>
        Вы действительно хотите удалить организацию?
        <br />
        <span class="text-red">Это действие нельзя отменить.</span>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="text" @click="deleteDialog = false">
          {{ t('cancel') }}
        </v-btn>
        <v-btn color="error" variant="flat" @click="confirmDelete">
          {{ t('delete') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped></style>
