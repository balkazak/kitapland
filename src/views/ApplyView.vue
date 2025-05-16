<script lang="ts" setup>
import logo from '@/assets/logo.svg'
import { type Ref, ref, watch, onMounted, computed } from 'vue'
import { useAPI } from '@/api'
import complete from '@/assets/complete.svg'
import { useI18n } from 'vue-i18n'
import { useToastStore } from '@/stores/toast'
import { useRouter } from 'vue-router'

const { t, locale } = useI18n()
const step = ref(1)
const api = useAPI()
const toast = useToastStore()
const router = useRouter()
const userEmail = ref('')

onMounted(() => {
  const tempUser = localStorage.getItem('tempUser')
  if (tempUser) {
    const userData = JSON.parse(tempUser)
    userEmail.value = userData.email
  }
})

const organizationTypes = ref([
  { organization_id: 1, label: 'Школа' },
  // { organization_id: 2, label: 'Частная школа' },
  { organization_id: 3, label: 'Колледж' }
  // { organization_id: 4, label: 'Библиотека' }
])

const organization = ref({
  bin: '',
  address: '',
  email: '',
  phone: '',
  postIndex: '',
  title: '',
  organization_id: null as number | null
})

const responsiblePerson = ref({
  email: '',
  fathername: '',
  lastname: '',
  name: '',
  phone: '',
  position: ''
})

const library = ref({
  ID: '',
  email: '',
  fathername: '',
  lastname: '',
  name: '',
  phone: ''
})

const formatPhoneNumber = (entity: 'organization' | 'responsiblePerson' | 'library') => {
  let value = ''

  // Get current value based on entity
  if (entity === 'organization') {
    value = organization.value.phone
  } else if (entity === 'responsiblePerson') {
    value = responsiblePerson.value.phone
  } else {
    value = library.value.phone
  }

  // Remove all non-digits
  let formatted = value.replace(/\D/g, '')

  // Limit to 11 digits
  formatted = formatted.substring(0, 11)

  // Format only if we have digits
  if (formatted.length > 0) {
    let result = ''

    if (formatted.length > 0) {
      result = '+7'
    }
    if (formatted.length > 1) {
      result += '(' + formatted.substring(1, 4)
    }
    if (formatted.length > 4) {
      result += ')' + formatted.substring(4, 7)
    }
    if (formatted.length > 7) {
      result += '-' + formatted.substring(7, 9)
    }
    if (formatted.length > 9) {
      result += '-' + formatted.substring(9, 11)
    }

    formatted = result
  }

  if (entity === 'organization') {
    organization.value.phone = formatted
  } else if (entity === 'responsiblePerson') {
    responsiblePerson.value.phone = formatted
  } else {
    library.value.phone = formatted
  }
}

const getEntries = (item: object) => {
  const entries = Object.entries(item)
  const orderedEntries: [string, any][] = []
  const remainingEntries: [string, any][] = []

  const keysOrder = ['lastname', 'name', 'fathername']

  entries.forEach(([key, value]) => {
    if (keysOrder.includes(key)) {
      const index = keysOrder.indexOf(key)
      orderedEntries[index] = [key, value]
    } else {
      remainingEntries.push([key, value])
    }
  })

  return [...orderedEntries.filter(Boolean), ...remainingEntries]
}

const goToMain = () => {
  router.push({ name: 'temporary' })
  // window.location.href = 'https://qazaqmura.kz'
}

const getOrganizationLabel = (id: number | null) => {
  if (!id) return ''
  const org = organizationTypes.value.find((org) => org.organization_id === id)
  return org ? org.label : ''
}

const getTitle = (key: string) => {
  switch (key) {
    case 'title':
      return t('full_organization_name')
    case 'bin':
      return 'БИН'
    case 'phone':
      return t('phone_number')
    case 'address':
      return t('school_address')
    case 'city':
      return t('city_and_region')
    case 'postIndex':
      return t('postal_code')
    case 'lastname':
      return t('surname')
    case 'name':
      return t('first_name')
    case 'fathername':
      return t('middle_name')
    case 'position':
      return t('position')
    case 'email':
      return t('email')
    case 'ID':
      return t('iin')
    case 'organization_id':
      return 'Тип организации'
    default:
      return ''
  }
}

const checkID = async () => {
  try {
    const response = await api.postData('/v1/online/apply/bin', {
      id: organization.value.bin
    })
    if (response.data.success) {
      toast.success(response.data.message)
      return true
    }
  } catch (error: any) {
    let errorMessage = error?.message || 'Ошибка при проверке БИН'
    toast.error(errorMessage)
    console.error('Error:', error)
  }
  return false
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
  } catch (e: any) {
    toast.error('Ошибка при загрузке списка регионов')
    console.error('Error:', e)
  }
}

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

const cleanPhoneNumber = (phone: string) => {
  const digits = phone.replace(/\D/g, '')
  return digits ? `+${digits}` : ''
}

const sendApply = async () => {
  try {
    const tempUser = localStorage.getItem('tempUser')
    if (!tempUser) {
      toast.error('Необходима авторизация')
      return
    }

    const { token } = JSON.parse(tempUser)

    const request = {
      organization: {
        ID: organization.value.bin,
        title: organization.value.title,
        phone: cleanPhoneNumber(organization.value.phone),
        email: organization.value.email,
        address: organization.value.address,
        postIndex: organization.value.postIndex,
        organization_id: organization.value.organization_id
      },
      regionId: regionId.value,
      responsiblePerson: {
        name: responsiblePerson.value.name,
        lastname: responsiblePerson.value.lastname,
        fathername: responsiblePerson.value.fathername,
        position: responsiblePerson.value.position,
        phone: cleanPhoneNumber(responsiblePerson.value.phone),
        email: responsiblePerson.value.email
      },
      library: {
        name: library.value.name,
        lastname: library.value.lastname,
        fathername: library.value.fathername,
        ID: library.value.ID,
        phone: cleanPhoneNumber(library.value.phone),
        email: library.value.email
      }
    }

    const response = await fetch(import.meta.env.VITE_APP_API + '/v1/temp-user/add-temp-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(request)
    })

    const data = await response.json()

    if (response.ok) {
      toast.success(data.message || 'Заявка успешно отправлена')
      step.value = 5
    } else {
      throw new Error(data.message || 'Ошибка при отправке заявки')
    }
  } catch (error: any) {
    let errorMessage = error.message || 'Ошибка при отправке заявки'
    toast.error(errorMessage)
  }
}

const goBack = () => {
  router.push({ name: 'temporary' })
}

const showHelp = () => {
  window.open('https://wa.me/77052509606', '_blank')
}

const logout = () => {
  localStorage.removeItem('tempUser')

  router.push({ name: 'login' })
}

const isStep1Valid = computed(() => {
  return (
    organization.value.title &&
    organization.value.organization_id &&
    organization.value.bin &&
    organization.value.phone &&
    organization.value.email &&
    organization.value.address &&
    regionId.value &&
    organization.value.postIndex
  )
})

const isStep2Valid = computed(() => {
  return (
    responsiblePerson.value.lastname &&
    responsiblePerson.value.name &&
    responsiblePerson.value.position &&
    responsiblePerson.value.phone &&
    responsiblePerson.value.email
  )
})

const isStep3Valid = computed(() => {
  return (
    library.value.lastname &&
    library.value.name &&
    library.value.ID &&
    library.value.phone &&
    library.value.email
  )
})

const rules = {
  required: (v: string) => !!v || 'Поле обязательно для заполнения',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Неверный формат email',
  phone: (v: string) => /^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/.test(v) || 'Неверный формат телефона',
  bin: (v: string) => /^\d{12}$/.test(v) || 'БИН должен содержать 12 цифр',
  iin: (v: string) => /^\d{12}$/.test(v) || 'ИИН должен содержать 12 цифр'
}

getRegions()
</script>

<template>
  <div class="apply-view">
    <div class="top-bar">
      <div class="account-info">
        <v-icon color="primary" size="32" class="account-icon">mdi-account-circle</v-icon>
        <span class="account-text">Временный аккаунт</span>
        <span class="account-email">{{ userEmail }}</span>
      </div>
      <v-btn color="primary" variant="text" @click="logout">
        <v-icon>mdi-logout</v-icon>
        Выйти
      </v-btn>
    </div>

    <div class="main-content">
      <div class="side-bar">
        <div class="logo-container">
          <img src="@/assets/logo.svg" alt="Qazaq Mura Logo" class="logo" />
        </div>
        <v-list>
          <v-list-item
            prepend-icon="mdi-file-document-outline"
            title="Заявки"
            color="primary"
            active
            @click="goBack"
          />
          <v-list-item prepend-icon="mdi-help-circle-outline" title="Поддержка" @click="showHelp" />
        </v-list>
      </div>

      <div class="content">
        <div class="back-bar">
          <div class="back-section">
            <v-btn variant="text" color="primary" @click="goBack" class="back-btn">
              <v-icon>mdi-arrow-left</v-icon>
              Назад к списку
            </v-btn>
            <v-btn variant="text" class="help-btn" @click="showHelp">
              <v-icon>mdi-help-circle-outline</v-icon>
              Помощь
            </v-btn>
          </div>
        </div>

        <v-container>
          <v-row justify="center">
            <v-col cols="12" md="8">
              <v-row>
                <v-col cols="12">
                  <div class="text-h5 font-weight-bold text-center">
                    {{ t('fill_online_application') }}
                  </div>
                  <div class="text-medium-emphasis text-center">
                    {{ t('fill_instructions') }}
                  </div>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12">
                  <v-stepper
                    v-model="step"
                    :items="['1', '2', '3', '4', '5']"
                    class="rounded-lg elevation-0"
                    mobile
                    next-text="Следующий"
                    prev-text="Предыдущий"
                  >
                    <template v-slot:[`item.1`]>
                      <div class="font-weight-bold text-h6">{{ t('organization_data') }}</div>
                      <v-form class="mt-4">
                        <v-text-field
                          v-model="organization.title"
                          label="Полное название организации"
                          placeholder="Напишите название"
                          variant="outlined"
                          :rules="[rules.required]"
                        ></v-text-field>
                        <v-select
                          v-model="organization.organization_id"
                          :items="organizationTypes"
                          item-title="label"
                          item-value="organization_id"
                          label="Тип организации"
                          placeholder="Выберите тип организации"
                          variant="outlined"
                        ></v-select>
                        <v-text-field
                          v-model="organization.bin"
                          label="БИН"
                          placeholder="БИН"
                          variant="outlined"
                          :rules="[rules.required, rules.bin]"
                        >
                          <template v-slot:append-inner>
                            <v-btn color="primary" variant="flat" @click="checkID"
                              >Проверить БИН</v-btn
                            >
                          </template>
                        </v-text-field>
                        <v-text-field
                          v-model="organization.phone"
                          label="Номер телефона организации"
                          placeholder="Напишите номер"
                          variant="outlined"
                          :rules="[rules.required, rules.phone]"
                          @input="formatPhoneNumber('organization')"
                        ></v-text-field>
                        <v-text-field
                          v-model="organization.email"
                          label="Электронная почта организации"
                          placeholder="Напишите почту"
                          variant="outlined"
                          :rules="[rules.required, rules.email]"
                        ></v-text-field>
                        <v-text-field
                          v-model="organization.address"
                          label="Адрес организации"
                          placeholder="Напишите адрес"
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
                                  <v-btn
                                    color="primary"
                                    variant="flat"
                                    @click="chooseRegion(isActive)"
                                    >Выбрать
                                  </v-btn>
                                  <v-btn variant="tonal" @click="isActive.value = false"
                                    >Отмена</v-btn
                                  >
                                </div>
                              </v-card-actions>
                            </v-card>
                          </template>
                        </v-dialog>

                        <v-text-field
                          v-model="organization.postIndex"
                          label="Почтовый индекс"
                          placeholder="Напишите индекс"
                          variant="outlined"
                        ></v-text-field>
                      </v-form>
                    </template>

                    <template v-slot:[`item.2`]>
                      <div class="font-weight-bold text-h6">{{ t('director_or_accountant') }}</div>
                      <v-form class="mt-4">
                        <v-text-field
                          v-model="responsiblePerson.lastname"
                          label="Фамилия"
                          placeholder="Напишите фамилию"
                          variant="outlined"
                        ></v-text-field>
                        <v-text-field
                          v-model="responsiblePerson.name"
                          label="Имя"
                          placeholder="Напишите имя"
                          variant="outlined"
                        >
                        </v-text-field>
                        <v-text-field
                          v-model="responsiblePerson.fathername"
                          label="Отчество"
                          placeholder="Напишите отчество"
                          variant="outlined"
                        ></v-text-field>
                        <v-text-field
                          v-model="responsiblePerson.position"
                          label="Должность"
                          placeholder="Напишите должность"
                          variant="outlined"
                        ></v-text-field>
                        <v-text-field
                          v-model="responsiblePerson.phone"
                          :label="t('phone_number')"
                          placeholder="Напишите номер"
                          variant="outlined"
                          :rules="[rules.required, rules.phone]"
                          @input="formatPhoneNumber('responsiblePerson')"
                        ></v-text-field>
                        <v-text-field
                          v-model="responsiblePerson.email"
                          label="Электронная почта"
                          placeholder="Напишите почту"
                          variant="outlined"
                          :rules="[rules.required, rules.email]"
                        ></v-text-field>
                      </v-form>
                    </template>

                    <template v-slot:[`item.3`]>
                      <div class="font-weight-bold text-h6">{{ t('librarian_data') }}</div>
                      <v-form class="mt-4">
                        <v-text-field
                          v-model="library.lastname"
                          label="Фамилия"
                          placeholder="Напишите фамилию"
                          variant="outlined"
                        ></v-text-field>
                        <v-text-field
                          v-model="library.name"
                          label="Имя"
                          placeholder="Напишите имя"
                          variant="outlined"
                        >
                        </v-text-field>
                        <v-text-field
                          v-model="library.fathername"
                          label="Отчество"
                          placeholder="Напишите отчество"
                          variant="outlined"
                        ></v-text-field>
                        <v-text-field
                          v-model="library.ID"
                          :label="t('iin')"
                          variant="outlined"
                          :rules="[rules.required, rules.iin]"
                        ></v-text-field>
                        <v-text-field
                          v-model="library.phone"
                          :label="t('phone_number')"
                          placeholder="Напишите номер"
                          variant="outlined"
                          :rules="[rules.required, rules.phone]"
                          @input="formatPhoneNumber('library')"
                        ></v-text-field>
                        <v-text-field
                          v-model="library.email"
                          label="Электронная почта"
                          placeholder="Напишите почту"
                          variant="outlined"
                          :rules="[rules.required, rules.email]"
                        ></v-text-field>
                      </v-form>
                    </template>
                    <template v-slot:[`item.4`]>
                      <div class="font-weight-bold text-h6">{{ t('data_to_send') }}</div>
                      <div class="border rounded mt-3 py-2 px-3">
                        <div class="font-weight-bold text-h6">Данные организации</div>
                        <v-data-table :items="[...getEntries(organization), ['city', regionTitle]]">
                          <template v-slot:headers></template>
                          <template v-slot:bottom></template>
                          <template v-slot:[`item.0`]="{ item }">{{ getTitle(item[0]) }}</template>
                          <template v-slot:[`item.1`]="{ item }">
                            {{
                              item[0] === 'organization_id'
                                ? getOrganizationLabel(item[1])
                                : item[1]
                            }}
                          </template>
                        </v-data-table>
                      </div>
                      <div class="border rounded mt-3 py-2 px-3">
                        <div class="font-weight-bold text-h6">Директор или бухгалтер</div>
                        <v-data-table :items="getEntries(responsiblePerson)">
                          <template v-slot:headers></template>
                          <template v-slot:bottom></template>
                          <template v-slot:[`item.0`]="{ item }">{{ getTitle(item[0]) }}</template>
                        </v-data-table>
                      </div>
                      <div class="border rounded mt-3 py-2 px-3">
                        <div class="font-weight-bold text-h6">Данные библиотекаря</div>
                        <v-data-table :items="getEntries(library)">
                          <template v-slot:headers></template>
                          <template v-slot:bottom></template>
                          <template v-slot:[`item.0`]="{ item }">{{ getTitle(item[0]) }}</template>
                        </v-data-table>
                      </div>
                    </template>

                    <template v-slot:[`item.5`]>
                      <div class="w-100 mt-10 text-center justify-center">
                        <v-img :src="complete" class="mx-auto mb-2" width="144"></v-img>
                        <div class="text-h6 font-weight-bold">{{ t('request_accepted') }}</div>
                        <div class="mx-16 mt-3 mb-8">{{ t('manager_contact') }}</div>
                      </div>
                    </template>

                    <template v-slot:actions>
                      <div class="d-flex w-100 px-6 pb-10">
                        <v-btn
                          v-if="step > 1 && step !== 5"
                          color="primary"
                          variant="outlined"
                          @click="step--"
                        >
                          {{ t('previous') }}
                        </v-btn>
                        <v-btn
                          v-if="step < 4"
                          class="ml-auto"
                          color="primary"
                          :disabled="
                            (step === 1 && !isStep1Valid) ||
                            (step === 2 && !isStep2Valid) ||
                            (step === 3 && !isStep3Valid)
                          "
                          @click="step++"
                        >
                          {{ t('next') }}
                        </v-btn>
                        <v-btn
                          v-else-if="step === 4"
                          class="ml-auto"
                          color="primary"
                          @click="sendApply"
                        >
                          {{ t('send') }}
                        </v-btn>
                        <v-btn
                          v-else
                          class="mx-auto"
                          color="primary"
                          @click="goToMain"
                        >
                          {{ t('to_main') }}
                        </v-btn>
                      </div>
                    </template>
                  </v-stepper>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-container>
      </div>
    </div>
  </div>
</template>

<style scoped>
.apply-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.top-bar {
  height: 64px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e5e7eb;
  background-color: white;
}

.account-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.account-text {
  font-weight: 500;
  color: #1f2937;
}

.account-email {
  color: #6b7280;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.side-bar {
  width: 280px;
  background-color: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.logo-container {
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.logo {
  height: 32px;
}

.content {
  flex: 1;
  overflow: auto;
  background-color: #f9fafb;
}

.back-bar {
  padding: 16px 24px;
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
}

.back-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  font-weight: 500;
}

.help-btn {
  color: #6b7280;
}

.v-container {
  max-width: 1200px;
  margin: 0 auto;
}

:deep(.v-stepper) {
  box-shadow: none;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: white;
}

:deep(.v-field) {
  border-radius: 8px !important;
}

:deep(.v-field__outline) {
  color: #e5e7eb !important;
}
</style>
