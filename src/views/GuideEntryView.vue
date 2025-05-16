<template>
  <div>
    <v-app-bar flat>
      <div class="d-flex flex-column pl-4">
        <span class="text-h5 font-weight-bold">Записи</span>
        <span class="text-subtitle-2 text-medium-emphasis"> Управление записями базы знаний </span>
      </div>

      <v-spacer></v-spacer>

      <v-btn variant="text" @click="router.back()" class="text-none">
        <v-icon start>mdi-arrow-left</v-icon>
        Назад к списку
      </v-btn>
    </v-app-bar>

    <v-main class="bg-grey-lighten-4 pa-0">
      <div
        v-if="!isAdding"
        class="d-flex justify-center align-center"
        style="min-height: calc(100vh - 64px)"
      >
        <v-card class="mx-auto my-8" style="width: 90%; max-width: 1000px; border-radius: 8px">
          <div class="pa-4 d-flex align-center">
            <div class="search-container d-flex align-center flex-grow-1">
              <v-icon class="mr-2">mdi-magnify</v-icon>
              <input v-model="searchQuery" type="text" placeholder="Поиск" class="search-input" />
            </div>

            <v-btn color="primary" prepend-icon="mdi-plus" @click="isAdding = true" class="ml-4">
              ДОБАВИТЬ
            </v-btn>
          </div>

          <v-divider></v-divider>

          <table class="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Название</th>
                <th>Категория</th>
                <th>Статус</th>
                <th>Дата изменения</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in entries" :key="item.id">
                <td>{{ item.id }}</td>
                <td>{{ item.name_ru }}</td>
                <td>{{ getCategoryName(item.category_id) }}</td>
                <td>
                  <v-chip
                    :color="item.is_active ? 'success' : 'error'"
                    :text="item.is_active ? 'Активный' : 'Неактивный'"
                    size="small"
                  ></v-chip>
                </td>
                <td>{{ new Date(item.updated_at).toLocaleDateString('ru-RU') }}</td>
                <td class="text-right">
                  <v-btn icon variant="text" size="small" color="primary" @click="editItem(item)">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn icon variant="text" size="small" color="error" @click="deleteItem(item)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="d-flex align-center justify-space-between pa-4">
            <div>
              Items per page:
              <v-select
                v-model="itemsPerPage"
                :items="[10, 20, 50]"
                variant="plain"
                density="compact"
                style="width: 80px; display: inline-block"
                hide-details
              ></v-select>
            </div>

            <div>1-{{ Math.min(itemsPerPage, totalItems) }} of {{ totalItems }}</div>

            <div class="d-flex">
              <v-btn icon variant="text" :disabled="page === 1" @click="page = 1">
                <v-icon>mdi-page-first</v-icon>
              </v-btn>
              <v-btn icon variant="text" :disabled="page === 1" @click="page--">
                <v-icon>mdi-chevron-left</v-icon>
              </v-btn>
              <v-btn icon variant="text" :disabled="page >= totalPages" @click="page++">
                <v-icon>mdi-chevron-right</v-icon>
              </v-btn>
              <v-btn icon variant="text" :disabled="page >= totalPages" @click="page = totalPages">
                <v-icon>mdi-page-last</v-icon>
              </v-btn>
            </div>
          </div>
        </v-card>
      </div>

      <!-- Add Entry Form -->
      <div v-else class="d-flex justify-center">
        <v-card class="mx-auto my-8" style="width: 90%; max-width: 1000px; border-radius: 8px">
          <v-tabs v-model="activeTab">
            <v-tab value="kz">На казахском</v-tab>
            <v-tab value="ru">На русском</v-tab>
          </v-tabs>

          <v-card-text class="pa-4">
            <v-form ref="form" v-model="valid" class="mt-4">
              <!-- KZ inputs -->
              <div v-show="activeTab === 'kz'">
                <v-text-field
                  v-model="newEntry.name_kz"
                  label="Название на казахском"
                  required
                  :rules="[(v) => !!v || 'Обязательное поле']"
                ></v-text-field>
              </div>

              <!-- RU inputs -->
              <div v-show="activeTab === 'ru'">
                <v-text-field
                  v-model="newEntry.name_ru"
                  label="Название на русском"
                  required
                  :rules="[(v) => !!v || 'Обязательное поле']"
                ></v-text-field>
              </div>

              <!-- Common inputs -->
              <v-select
                v-model="newEntry.category_id"
                :items="categories"
                item-title="name_ru"
                item-value="id"
                label="Категория"
                required
                :rules="[(v) => !!v || 'Обязательное поле']"
                class="mt-4"
              ></v-select>

              <v-checkbox
                v-model="newEntry.is_active"
                :label="`Активная запись`"
                :true-value="1"
                :false-value="0"
                class="mt-4"
              ></v-checkbox>

              <!-- Description Editor -->
              <div class="editor-container mt-6" v-show="activeTab === 'kz'">
                <div ref="editorKz"></div>
              </div>
              <div class="editor-container mt-6" v-show="activeTab === 'ru'">
                <div ref="editorRu"></div>
              </div>
            </v-form>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions class="pa-4">
            <v-btn variant="text" @click="isAdding = false">Отмена</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="primary" variant="flat" @click="saveNewEntry">Добавить</v-btn>
          </v-card-actions>
        </v-card>
      </div>
    </v-main>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5 pa-4">Подтверждение</v-card-title>
        <v-card-text class="pa-4">
          Вы действительно хотите удалить запись "{{ itemToDelete?.name_ru }}"?
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showDeleteDialog = false">Отмена</v-btn>
          <v-btn color="error" variant="flat" @click="confirmDelete">Удалить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useAPI } from '@/api'
import { useToastStore } from '@/stores/toast'
import { useRouter } from 'vue-router'
import 'suneditor/dist/css/suneditor.min.css'
import suneditor from 'suneditor'
import plugins from 'suneditor/src/plugins'

const api = useAPI()
const toast = useToastStore()
const router = useRouter()

const loading = ref(false)
const searchQuery = ref('')
const itemsPerPage = ref(20)
const isAdding = ref(false)
const valid = ref(false)
const form = ref(null)
const activeTab = ref('kz')
const page = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)

// Editor references
const editorKz = ref(null)
const editorRu = ref(null)
let sunEditorKz: any = null
let sunEditorRu: any = null

interface GuideEntry {
  id: number
  category_id: number
  name_ru: string
  name_kz: string
  description_ru: string
  description_kz: string
  is_active: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

const newEntry = ref({
  name_kz: '',
  name_ru: '',
  description_kz: '',
  description_ru: '',
  category_id: null as number | null,
  is_active: 1
})

const headers = [
  { title: 'ID', key: 'id', align: 'start', sortable: true },
  { title: 'Название', key: 'name_ru', align: 'start', sortable: true },
  { title: 'Категория', key: 'category', align: 'start', sortable: true },
  { title: 'Статус', key: 'is_active', align: 'center', sortable: true },
  { title: 'Дата изменения', key: 'updated_at', align: 'start', sortable: true },
  { title: '', key: 'actions', align: 'end', sortable: false }
]

const categories = ref<{ id: number; name_ru: string; name_kz: string }[]>([])
const entries = ref<GuideEntry[]>([])

const showDeleteDialog = ref(false)
const itemToDelete = ref<GuideEntry | null>(null)

// SunEditor options
const editorOptions = {
  plugins: plugins,
  height: '300px',
  buttonList: [
    ['undo', 'redo'],
    ['font', 'fontSize', 'formatBlock'],
    ['paragraphStyle', 'blockquote'],
    ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
    ['fontColor', 'hiliteColor', 'textStyle'],
    ['removeFormat'],
    ['outdent', 'indent'],
    ['align', 'horizontalRule', 'list', 'lineHeight'],
    ['table', 'link', 'image', 'video'],
    ['fullScreen', 'showBlocks', 'codeView'],
    ['preview', 'print']
  ]
}

// Initialize SunEditor instances
function initEditors() {
  if (editorKz.value && !sunEditorKz) {
    sunEditorKz = suneditor.create(editorKz.value, {
      ...editorOptions,
      placeholder: 'Введите описание на казахском...'
    })

    // Set initial content if available
    if (newEntry.value.description_kz) {
      sunEditorKz.setContents(newEntry.value.description_kz)
    }

    // Update model when editor changes
    sunEditorKz.onChange = function (contents: string) {
      newEntry.value.description_kz = contents
    }
  }

  if (editorRu.value && !sunEditorRu) {
    sunEditorRu = suneditor.create(editorRu.value, {
      ...editorOptions,
      placeholder: 'Введите описание на русском...'
    })

    // Set initial content if available
    if (newEntry.value.description_ru) {
      sunEditorRu.setContents(newEntry.value.description_ru)
    }

    // Update model when editor changes
    sunEditorRu.onChange = function (contents: string) {
      newEntry.value.description_ru = contents
    }
  }
}

// Destroy editor instances to prevent memory leaks
function destroyEditors() {
  if (sunEditorKz) {
    sunEditorKz.destroy()
    sunEditorKz = null
  }

  if (sunEditorRu) {
    sunEditorRu.destroy()
    sunEditorRu = null
  }
}

async function fetchCategories() {
  try {
    const response = await api.fetchData('/v1/dictionaries-guide-category')
    categories.value = response.data.data.items
  } catch (error: any) {
    let errorMessage = error?.message || 'Ошибка при загрузке категорий'
    toast.error(errorMessage)
  }
}

async function fetchEntries() {
  loading.value = true
  try {
    let url = `/v1/guide?page=${page.value}`
    if (searchQuery.value) {
      url += `&search=${searchQuery.value}`
    }

    const response = await api.fetchData(url)
    const { data, meta } = response.data
    entries.value = data.items.map((item: GuideEntry) => ({
      ...item,
      category: categories.value.find((c) => c.id === item.category_id) || {
        id: item.category_id,
        name_ru: 'Неизвестно',
        name_kz: 'Белгісіз'
      }
    }))
    totalPages.value = meta.last_page
    totalItems.value = meta.total
  } catch (error: any) {
    let errorMessage = error?.message || 'Ошибка при загрузке записей'
    toast.error(errorMessage)
  } finally {
    loading.value = false
  }
}

const editItem = async (item: GuideEntry) => {
  try {
    router.push(`/guide/${item.id}/edit`)
  } catch (error: any) {
    let errorMessage = error?.message || 'Ошибка при редактировании записи'
    toast.error(errorMessage)
  }
}

const confirmDelete = async () => {
  if (!itemToDelete.value) return

  try {
    await api.deleteData(`/v1/guide/${itemToDelete.value.id}`)
    toast.success('Запись успешно удалена')
    fetchEntries()
  } catch (error: any) {
    let errorMessage = error?.message || 'Ошибка при удалении записи'
    toast.error(errorMessage)
  } finally {
    showDeleteDialog.value = false
    itemToDelete.value = null
  }
}

const deleteItem = (item: GuideEntry) => {
  itemToDelete.value = item
  showDeleteDialog.value = true
}

const saveNewEntry = async () => {
  if (!valid.value) return

  try {
    // Simplified validation - just check if the required fields are filled
    if (!newEntry.value.name_kz) {
      toast.error('Заполните название на казахском языке')
      activeTab.value = 'kz'
      return
    }

    if (!newEntry.value.name_ru) {
      toast.error('Заполните название на русском языке')
      activeTab.value = 'ru'
      return
    }

    // Get the latest content from the editors
    if (sunEditorKz) {
      newEntry.value.description_kz = sunEditorKz.getContents()
    }

    if (sunEditorRu) {
      newEntry.value.description_ru = sunEditorRu.getContents()
    }

    const data = {
      category_id: newEntry.value.category_id,
      name_kz: newEntry.value.name_kz,
      name_ru: newEntry.value.name_ru,
      description_kz: newEntry.value.description_kz || '',
      description_ru: newEntry.value.description_ru || '',
      is_active: newEntry.value.is_active
    }

    await api.postData('/v1/guide', data)
    toast.success('Запись успешно добавлена')
    isAdding.value = false
    newEntry.value = {
      name_kz: '',
      name_ru: '',
      description_kz: '',
      description_ru: '',
      category_id: null,
      is_active: 1
    }

    // Destroy editors when closing the form
    destroyEditors()

    fetchEntries()
  } catch (error: any) {
    let errorMessage = error?.message || 'Ошибка при добавлении записи'
    toast.error(errorMessage)
  }
}

function getCategoryName(categoryId: number): string {
  const category = categories.value.find((c) => c.id === categoryId)
  return category ? category.name_ru : 'Неизвестно'
}

watch([page, searchQuery], () => {
  fetchEntries()
})

// Initialize editors when the tab changes or when adding mode is activated
watch([activeTab, isAdding], () => {
  if (isAdding.value) {
    nextTick(() => {
      initEditors()
    })
  } else {
    destroyEditors()
  }
})

onMounted(() => {
  fetchCategories()
  fetchEntries()
})
</script>

<style>
/* SunEditor custom styles */
.sun-editor {
  border-radius: 4px !important;
}

.sun-editor .se-toolbar {
  outline: none !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12) !important;
}

.sun-editor .se-wrapper {
  min-height: 300px !important;
}
</style>

<style scoped>
.search-container {
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 8px 12px;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
}

.custom-table th {
  text-align: left;
  padding: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.custom-table td {
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.custom-table tr:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.editor-container {
  border-radius: 4px;
}
</style>
