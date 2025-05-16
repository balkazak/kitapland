<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useToastStore } from '@/stores/toast'
import registrationPdf from '@/assets/registration_prepare.pdf?url'

// Define application interface to fix type errors
interface Application {
  id: number
  status: number
  comment?: string
  organization: {
    title: string
    ID: string
    phone: string
    address: string
    postIndex: string
  }
  region: {
    id: number
    title: string
  }
  library: {
    lastname: string
    name: string
    fathername: string
    ID: string
    phone: string
    email: string
  }
  responsiblePerson: {
    lastname: string
    name: string
    fathername: string
    position: string
    phone: string
    email: string
  }
}

const { t } = useI18n()
const router = useRouter()
const toast = useToastStore()
const userEmail = ref('')

const loading = ref(false)
const applications = ref<Application[]>([])
const page = ref(1)
const totalPages = ref(1)
const itemsPerPage = ref(15)

const fetchApplications = async () => {
  try {
    const tempUser = localStorage.getItem('tempUser')
    if (!tempUser) {
      toast.error('Необходима авторизация')
      return
    }

    const { token } = JSON.parse(tempUser)
    loading.value = true

    const response = await fetch(
      import.meta.env.VITE_APP_API + '/v1/temp-user/check-status?page=' + page.value,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    )

    const data = await response.json()

    if (response.ok) {
      applications.value = data.data
      totalPages.value = data.last_page
      itemsPerPage.value = data.per_page
    } else {
      throw new Error(data.message || 'Ошибка при загрузке заявок')
    }
  } catch (error: any) {
    toast.error(error?.message || 'Ошибка при загрузке заявок')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const tempUser = localStorage.getItem('tempUser')
  if (tempUser) {
    const userData = JSON.parse(tempUser)
    userEmail.value = userData.email
    fetchApplications()
  }
})

watch(page, () => {
  fetchApplications()
})

const drawer = ref(false)
const selectedApplication = ref<Application | null>(null)
const editMode = ref(false)

const formData = ref({
  organization: {
    fullName: '',
    type: '',
    bin: '',
    cityRegion: '',
    phone: '',
    schoolAddress: '',
    postalIndex: ''
  },
  director: {
    lastName: '',
    firstName: '',
    middleName: '',
    position: '',
    phone: '',
    email: ''
  },
  librarian: {
    lastName: '',
    firstName: '',
    middleName: '',
    iin: '',
    phone: '',
    email: ''
  }
})

const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return 'На рассмотрении'
    case 1:
      return 'Заявка принята'
    case 2:
      return 'Отклонено'
    default:
      return 'Неизвестный статус'
  }
}

const showDetails = (app: Application) => {
  selectedApplication.value = app
  editMode.value = false
  formData.value = {
    organization: {
      fullName: app.organization.title,
      type: app.region.title,
      bin: app.organization.ID,
      cityRegion: 'г. Алматы',
      phone: app.organization.phone,
      schoolAddress: app.organization.address,
      postalIndex: app.organization.postIndex
    },
    director: {
      lastName: app.responsiblePerson.lastname,
      firstName: app.responsiblePerson.name,
      middleName: app.responsiblePerson.fathername,
      position: app.responsiblePerson.position,
      phone: app.responsiblePerson.phone,
      email: app.responsiblePerson.email
    },
    librarian: {
      lastName: app.library.lastname,
      firstName: app.library.name,
      middleName: app.library.fathername,
      iin: app.library.ID,
      phone: app.library.phone,
      email: app.library.email
    }
  }
  drawer.value = true
}

const editApplication = (app: Application) => {
  showDetails(app)
  editMode.value = true
}

const saveChanges = async () => {
  if (!selectedApplication.value) return

  try {
    loading.value = true
    const tempUser = localStorage.getItem('tempUser')
    if (!tempUser) {
      toast.error('Необходима авторизация')
      return
    }

    const { token } = JSON.parse(tempUser)

    const updatedData = {
      comment: '',
      id: selectedApplication.value.id,
      organization: {
        title: formData.value.organization.fullName,
        ID: formData.value.organization.bin,
        phone: formData.value.organization.phone,
        address: formData.value.organization.schoolAddress,
        postIndex: formData.value.organization.postalIndex,
        email: formData.value.director.email
      },
      regionId: selectedApplication.value.region.id || null,
      library: {
        lastname: formData.value.librarian.lastName,
        name: formData.value.librarian.firstName,
        fathername: formData.value.librarian.middleName,
        ID: formData.value.librarian.iin,
        phone: formData.value.librarian.phone,
        email: formData.value.librarian.email
      },
      responsiblePerson: {
        lastname: formData.value.director.lastName,
        name: formData.value.director.firstName,
        fathername: formData.value.director.middleName,
        position: formData.value.director.position,
        phone: formData.value.director.phone,
        email: formData.value.director.email
      }
    }

    const response = await fetch(
      import.meta.env.VITE_APP_API + '/v1/temp-user/update/' + selectedApplication.value.id,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      }
    )

    const data = await response.json()

    if (response.ok) {
      toast.success('Заявка успешно обновлена')
      drawer.value = false
      fetchApplications()
    } else {
      throw new Error(data.message || 'Ошибка при обновлении заявки')
    }
  } catch (error: any) {
    toast.error(error?.message || 'Ошибка при обновлении заявки')
  } finally {
    loading.value = false
  }
}

const videoDialog = ref(false)
const videoUrl = ref('https://www.youtube.com/embed/EXAMPLE') // Replace with actual URL

const showHelp = () => {
  window.open('https://wa.me/77052509606', '_blank')
}

const openVideoHelp = () => {
  videoDialog.value = true
}

const downloadHelp = () => {
  const link = document.createElement('a')
  link.href = registrationPdf
  link.download = 'Подготовка данных для регистрации.pdf'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const createApplication = () => {
  router.push({ name: 'apply' })
}

const logout = () => {
  localStorage.removeItem('tempUser')
  router.push({ name: 'login' })
}

const formatPhone = (phone: string): string => {
  if (!phone) return ''

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')

  // Format as +7 (XXX) XXX XX XX
  if (digits.length === 11) {
    return `+7 (${digits.substring(1, 4)}) ${digits.substring(4, 7)} ${digits.substring(7, 9)} ${digits.substring(9, 11)}`
  }

  // Return original if not in expected format
  return phone
}

const downloadPdf = async (applicationId: number) => {
  try {
    const tempUser = localStorage.getItem('tempUser')
    if (!tempUser) {
      toast.error('Необходима авторизация')
      return
    }

    const { token } = JSON.parse(tempUser)

    const response = await fetch(import.meta.env.VITE_APP_API + '/v1/temp-user/sign-up/pdf', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('Ошибка при скачивании PDF')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `application-${applicationId}.pdf`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error: any) {
    toast.error(error?.message || 'Ошибка при скачивании PDF')
  }
}
</script>

<template>
  <div class="temporary-view">
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
          />
          <v-list-item prepend-icon="mdi-help-circle-outline" title="Поддержка" @click="showHelp" />
        </v-list>
      </div>

      <div class="content">
        <div class="header">
          <div class="title-section">
            <h1>Заявки для добавление</h1>
            <p class="subtitle">
              Окно заявок предназначено для регистрации организации и библиотекарей, а также для
              подтверждения (модерации). Здесь вы можете подать заявку.
            </p>
          </div>
          <div class="actions">
            <v-btn color="default" variant="text" class="help-btn" @click="openVideoHelp">
              <v-icon>mdi-play</v-icon>
              Помощь
            </v-btn>
            <v-btn color="primary" prepend-icon="mdi-plus" @click="createApplication">Заявка</v-btn>
          </div>
        </div>

        <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>

        <v-table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Организация</th>
              <th>Библиотекарь</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="app in applications" :key="app.id">
              <td>{{ app.id }}</td>
              <td>
                <div class="org-info">
                  <p class="org-name">{{ app.organization.title }}</p>
                  <p class="org-address">{{ app.organization.address }}</p>
                  <div class="d-flex align-center mt-1 mb-1">
                    <v-chip size="small" variant="outlined" class="bin-chip">
                      БИН: {{ app.organization.ID }}
                    </v-chip>
                  </div>
                  <p class="org-phone">{{ formatPhone(app.organization.phone) }}</p>
                </div>
              </td>
              <td>
                <div class="librarian-info">
                  <p class="librarian-name">
                    {{ app.library.lastname }} {{ app.library.name }} {{ app.library.fathername }}
                  </p>
                  <p class="librarian-iin">ИИН: {{ app.library.ID }}</p>
                  <p class="librarian-phone">{{ formatPhone(app.library.phone) }}</p>
                  <div class="d-flex align-center mt-1">
                    <v-chip size="small" variant="outlined" class="email-chip">
                      {{ app.library.email }}
                    </v-chip>
                  </div>
                </div>
              </td>
              <td>
                <div class="status-cell">
                  <v-chip
                    :color="app.status === 1 ? 'success' : app.status === 2 ? 'error' : 'primary'"
                    :text="getStatusText(app.status)"
                    size="small"
                  />
                  <v-chip
                    v-if="app.status === 2"
                    color="warning"
                    variant="outlined"
                    class="comment-chip mt-2"
                    prepend-icon="mdi-comment-text-outline"
                  >
                    <span v-if="app.comment">Комментарий: {{ app.comment }}</span>
                    <span v-else class="no-comment">Нет комментария</span>
                  </v-chip>
                </div>
              </td>
              <td>
                <div class="actions-cell">
                  <v-btn variant="text" color="primary" size="small" @click="showDetails(app)"
                    >Подробнее</v-btn
                  >
                  <v-btn
                    v-if="app.status === 1"
                    variant="text"
                    color="primary"
                    size="small"
                    class="download-btn"
                    @click="downloadPdf(app.id)"
                  >
                    Скачать
                    <v-icon>mdi-chevron-right</v-icon>
                  </v-btn>
                  <v-btn
                    v-if="app.status === 2"
                    variant="text"
                    color="primary"
                    size="small"
                    class="edit-btn"
                    @click="editApplication(app)"
                  >
                    Перейти
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>

        <div v-if="!loading && applications.length === 0" class="text-center pa-4">
          {{ t('no_applications') }}
        </div>

        <div class="d-flex justify-center mt-4">
          <v-pagination
            v-if="totalPages > 1"
            v-model="page"
            :length="totalPages"
            :total-visible="7"
            rounded="lg"
          ></v-pagination>
        </div>
      </div>
    </div>

    <v-navigation-drawer v-model="drawer" location="right" width="600" temporary>
      <div class="drawer-content">
        <div class="drawer-header">
          <h2>{{ editMode ? 'Редактирование заявки' : 'Форма заявки' }}</h2>
          <v-btn icon="mdi-close" variant="text" @click="drawer = false" />
        </div>

        <div class="form-sections">
          <div class="form-section">
            <h3>Данные организации</h3>
            <div class="form-fields">
              <div class="form-field">
                <label>Полное название организации</label>
                <v-text-field
                  v-model="formData.organization.fullName"
                  :readonly="!editMode"
                  variant="outlined"
                  density="comfortable"
                  bg-color="white"
                  hide-details
                />
              </div>
              <div class="form-field">
                <label>Тип организаций</label>
                <v-text-field
                  v-model="formData.organization.type"
                  readonly
                  variant="outlined"
                  density="comfortable"
                  bg-color="white"
                  hide-details
                />
              </div>
              <div class="form-field">
                <label>БИН</label>
                <v-text-field
                  v-model="formData.organization.bin"
                  :readonly="!editMode"
                  variant="outlined"
                  density="comfortable"
                  bg-color="white"
                  hide-details
                />
              </div>
              <div class="form-field">
                <label>Город и регион</label>
                <v-text-field
                  v-model="formData.organization.cityRegion"
                  readonly
                  variant="outlined"
                  density="comfortable"
                  bg-color="white"
                  hide-details
                />
              </div>
              <div class="form-field">
                <label>Телефон</label>
                <v-text-field
                  v-model="formData.organization.phone"
                  :readonly="!editMode"
                  variant="outlined"
                  density="comfortable"
                  bg-color="white"
                  hide-details
                />
              </div>
              <div class="form-field">
                <label>Адрес школы</label>
                <v-text-field
                  v-model="formData.organization.schoolAddress"
                  :readonly="!editMode"
                  variant="outlined"
                  density="comfortable"
                  bg-color="white"
                  hide-details
                />
              </div>
              <div class="form-field">
                <label>Почтовый индекс</label>
                <v-text-field
                  v-model="formData.organization.postalIndex"
                  :readonly="!editMode"
                  variant="outlined"
                  density="comfortable"
                  bg-color="white"
                  hide-details
                />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Директор или бухгалтер</h3>
            <div class="form-fields">
              <div class="form-field">
                <label>Фамилия</label>
                <v-text-field
                  v-model="formData.director.lastName"
                  :readonly="!editMode"
                  variant="outlined"
                  density="comfortable"
                  bg-color="white"
                  hide-details
                />
              </div>
              <div class="form-field">
                <label>Имя</label>
                <v-text-field
                  v-model="formData.director.firstName"
                  :readonly="!editMode"
                  variant="outlined"
                  density="comfortable"
                  bg-color="white"
                  hide-details
                />
              </div>
              <div class="form-field">
                <label>Отчество</label>
                <v-text-field
                  v-model="formData.director.middleName"
                  :readonly="!editMode"
                  variant="outlined"
                  density="comfortable"
                  bg-color="white"
                  hide-details
                />
              </div>
              <div class="form-field">
                <label>Должность</label>
                <v-text-field
                  v-model="formData.director.position"
                  :readonly="!editMode"
                  variant="outlined"
                  density="comfortable"
                  bg-color="white"
                  hide-details
                />
              </div>
              <div class="form-field">
                <label>Телефон</label>
                <v-text-field
                  v-model="formData.director.phone"
                  :readonly="!editMode"
                  variant="outlined"
                  density="comfortable"
                  bg-color="white"
                  hide-details
                />
              </div>
              <div class="form-field">
                <label>Электронная почта</label>
                <v-text-field
                  v-model="formData.director.email"
                  :readonly="!editMode"
                  variant="outlined"
                  density="comfortable"
                  bg-color="white"
                  hide-details
                />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Данные библиотекаря</h3>
            <div class="form-fields">
              <div class="form-field">
                <label>Фамилия</label>
                <v-text-field
                  v-model="formData.librarian.lastName"
                  :readonly="!editMode"
                  variant="outlined"
                  density="comfortable"
                  bg-color="white"
                  hide-details
                />
              </div>
              <div class="form-field">
                <label>Имя</label>
                <v-text-field
                  v-model="formData.librarian.firstName"
                  :readonly="!editMode"
                  variant="outlined"
                  density="comfortable"
                  bg-color="white"
                  hide-details
                />
              </div>
              <div class="form-field">
                <label>Отчество</label>
                <v-text-field
                  v-model="formData.librarian.middleName"
                  :readonly="!editMode"
                  variant="outlined"
                  density="comfortable"
                  bg-color="white"
                  hide-details
                />
              </div>
              <div class="form-field">
                <label>ИИН</label>
                <v-text-field
                  v-model="formData.librarian.iin"
                  :readonly="!editMode"
                  variant="outlined"
                  density="comfortable"
                  bg-color="white"
                  hide-details
                />
              </div>
              <div class="form-field">
                <label>Телефон</label>
                <v-text-field
                  v-model="formData.librarian.phone"
                  :readonly="!editMode"
                  variant="outlined"
                  density="comfortable"
                  bg-color="white"
                  hide-details
                />
              </div>
              <div class="form-field">
                <label>Электронная почта</label>
                <v-text-field
                  v-model="formData.librarian.email"
                  :readonly="!editMode"
                  variant="outlined"
                  density="comfortable"
                  bg-color="white"
                  hide-details
                />
              </div>
            </div>
          </div>
        </div>

        <div class="drawer-footer">
          <v-btn v-if="!editMode" color="primary" variant="text" @click="drawer = false"
            >Закрыть</v-btn
          >
          <div v-else class="d-flex gap-3">
            <v-btn color="default" variant="text" @click="drawer = false">Отмена</v-btn>
            <v-btn color="primary" @click="saveChanges" :loading="loading">Сохранить</v-btn>
          </div>
        </div>
      </div>
    </v-navigation-drawer>

    <v-dialog v-model="videoDialog" width="800">
      <v-card>
        <v-card-title class="text-h6"> Видео о регистрации </v-card-title>
        <v-card-text>
          <div class="video-container">
            <iframe
              :src="videoUrl"
              width="100%"
              height="450"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="videoDialog = false">
            {{ t('close') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.temporary-view {
  min-height: 100vh;
  background-color: #f9fafb;
}

.top-bar {
  height: 64px;
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  margin-left: 8px;
}

.main-content {
  display: flex;
  height: calc(100vh - 64px);
}

.side-bar {
  width: 280px;
  background-color: white;
  border-right: 1px solid #e5e7eb;
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
  padding: 24px;
  overflow: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.title-section h1 {
  font-size: 24px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 8px;
}

.subtitle {
  color: #6b7280;
  font-size: 14px;
  max-width: 800px;
}

.actions {
  display: flex;
  gap: 12px;
}

.help-btn {
  color: #6b7280;
}

.v-table {
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

th {
  font-weight: 500 !important;
  color: #1f2937 !important;
  font-size: 14px !important;
  padding: 12px !important;
}

td {
  color: #1f2937;
  font-size: 14px;
  padding: 16px 12px !important;
  vertical-align: top;
}

.org-info {
  display: flex;
  flex-direction: column;
}

.org-name {
  font-weight: 500;
  color: #1f2937;
  margin: 0;
  line-height: 1.4;
}

.org-address {
  color: #4b5563;
  margin: 4px 0;
  font-size: 13px;
  line-height: 1.4;
}

.bin-chip {
  font-size: 12px !important;
  height: 24px !important;
}

.org-phone {
  color: #6b7280;
  font-size: 13px;
  margin: 0;
}

.librarian-info {
  display: flex;
  flex-direction: column;
}

.librarian-name {
  font-weight: 500;
  color: #1f2937;
  margin: 0;
  line-height: 1.4;
}

.librarian-iin {
  color: #4b5563;
  margin: 4px 0 0 0;
  font-size: 13px;
}

.librarian-phone {
  color: #6b7280;
  font-size: 13px;
  margin: 4px 0;
}

.email-chip {
  font-size: 12px !important;
  height: 24px !important;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-cell {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-comment {
  color: #6b7280;
  font-size: 12px;
  margin: 0;
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.download-btn,
.edit-btn {
  display: flex;
  align-items: center;
  gap: 4px;
}

.drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f9fafb;
}

.drawer-header {
  padding: 24px;
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.drawer-header h2 {
  font-size: 20px;
  font-weight: 500;
  color: #1f2937;
  margin: 0;
}

.form-sections {
  flex: 1;
  padding: 24px;
  overflow: auto;
}

.form-section {
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  padding: 24px;
  margin-bottom: 24px;
}

.form-section h3 {
  font-size: 16px;
  font-weight: 500;
  color: #1f2937;
  margin: 0 0 24px 0;
}

.form-fields {
  display: grid;
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field label {
  font-size: 14px;
  color: #1f2937;
}

.drawer-footer {
  padding: 16px 24px;
  background-color: white;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

:deep(.v-field) {
  border-radius: 8px !important;
  background-color: #f9fafb !important;
}

:deep(.v-field__input) {
  padding: 12px !important;
  font-size: 14px;
}

:deep(.v-field__outline) {
  color: #e5e7eb !important;
}

.comment-cell {
  max-width: 200px;
  white-space: normal;
  word-break: break-word;
  font-size: 12px;
  color: #6b7280;
}

.comment-chip {
  font-size: 12px;
  background-color: #fff3e0 !important;
  color: #e65100 !important;
  border-color: #ffcc80 !important;
  white-space: normal;
  height: auto !important;
  padding: 4px 8px;
}

.no-comment {
  font-size: 11px;
  font-style: italic;
  color: #9e9e9e;
}

.video-container {
  position: relative;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
