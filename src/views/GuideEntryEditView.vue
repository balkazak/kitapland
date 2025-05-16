<template>
  <div>
    <v-app-bar>
      <template v-slot:title>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">Редактирование записи</span>
          <span class="text-subtitle-2 text-medium-emphasis">
            Редактирование записи базы знаний
          </span>
        </div>
      </template>

      <template v-slot:append>
        <v-btn variant="text" @click="router.back()" class="text-none">
          <v-icon start>mdi-arrow-left</v-icon>
          Назад к списку
        </v-btn>
      </template>
    </v-app-bar>

    <v-main class="bg-grey-lighten-4">
      <v-container>
        <v-card>
          <v-card-text class="pa-4">
            <v-skeleton-loader v-if="loading || !entry" type="article"></v-skeleton-loader>

            <template v-else>
              <v-tabs v-model="activeTab">
                <v-tab value="kz">На казахском</v-tab>
                <v-tab value="ru">На русском</v-tab>
              </v-tabs>

              <v-form ref="form" v-model="valid" class="mt-4">
                <!-- KZ inputs -->
                <div v-show="activeTab === 'kz'">
                  <v-text-field
                    v-model="entry.name_kz"
                    label="Название на казахском"
                    required
                    :rules="[(v) => !!v || 'Обязательное поле']"
                  ></v-text-field>
                </div>

                <!-- RU inputs -->
                <div v-show="activeTab === 'ru'">
                  <v-text-field
                    v-model="entry.name_ru"
                    label="Название на русском"
                    required
                    :rules="[(v) => !!v || 'Обязательное поле']"
                  ></v-text-field>
                </div>

                <!-- Common inputs -->
                <v-select
                  v-model="entry.category_id"
                  :items="categories"
                  item-title="name_ru"
                  item-value="id"
                  label="Категория"
                  required
                  :rules="[(v) => !!v || 'Обязательное поле']"
                  class="mt-4"
                ></v-select>
                <v-checkbox
                  v-model="entry.is_active"
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
            </template>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions class="pa-4">
            <v-btn variant="text" @click="router.back()" :disabled="loading">Отмена</v-btn>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              variant="flat"
              :loading="loading"
              :disabled="loading"
              @click="saveEntry"
            >
              Сохранить
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-container>
    </v-main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import { useAPI } from '@/api'
import { useToastStore } from '@/stores/toast'
import { useRouter, useRoute } from 'vue-router'
import 'suneditor/dist/css/suneditor.min.css'
import suneditor from 'suneditor'
import plugins from 'suneditor/src/plugins'

const api = useAPI()
const toast = useToastStore()
const router = useRouter()
const route = useRoute()

const loading = ref(false)
const valid = ref(false)
const form = ref(null)
const activeTab = ref('kz')

// Editor references
const editorKz = ref(null)
const editorRu = ref(null)
let sunEditorKz: any = null
let sunEditorRu: any = null

// Add a flag to track if data is loaded
const dataLoaded = ref(false)

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

interface EntryForm {
  name_kz: string
  name_ru: string
  description_kz: string
  description_ru: string
  category_id: number | null
  is_active: number
}

const entry = ref<EntryForm>({
  name_kz: '',
  name_ru: '',
  description_kz: '',
  description_ru: '',
  category_id: null,
  is_active: 1
})

const categories = ref<{ id: number; name_ru: string; name_kz: string }[]>([])

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
  console.log('Initializing editors', {
    editorKzExists: !!editorKz.value,
    editorRuExists: !!editorRu.value,
    sunEditorKzExists: !!sunEditorKz,
    sunEditorRuExists: !!sunEditorRu
  })

  if (editorKz.value && !sunEditorKz) {
    sunEditorKz = suneditor.create(editorKz.value, {
      ...editorOptions,
      placeholder: 'Введите описание на казахском...'
    })

    // Set initial content if available
    if (entry.value.description_kz) {
      sunEditorKz.setContents(entry.value.description_kz)
    }

    // Update model when editor changes
    sunEditorKz.onChange = function (contents: string) {
      entry.value.description_kz = contents
    }
  }

  if (editorRu.value && !sunEditorRu) {
    sunEditorRu = suneditor.create(editorRu.value, {
      ...editorOptions,
      placeholder: 'Введите описание на русском...'
    })

    // Set initial content if available
    if (entry.value.description_ru) {
      sunEditorRu.setContents(entry.value.description_ru)
    }

    // Update model when editor changes
    sunEditorRu.onChange = function (contents: string) {
      entry.value.description_ru = contents
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

async function fetchEntry() {
  loading.value = true
  try {
    const response = await api.fetchData(`/v1/guide/${route.params.id}`)
    const data = response.data as GuideEntry

    if (!data) {
      throw new Error('Запись не найдена')
    }

    // Update entry with all fields from API
    entry.value = {
      name_kz: data.name_kz || '',
      name_ru: data.name_ru || '',
      description_kz: data.description_kz || '',
      description_ru: data.description_ru || '',
      category_id: data.category_id,
      is_active: data.is_active
    }

    // Set the data loaded flag
    dataLoaded.value = true
  } catch (error: any) {
    let errorMessage = error?.message || 'Ошибка при загрузке записи'
    toast.error(errorMessage)
    router.back()
  } finally {
    loading.value = false
  }
}

async function saveEntry() {
  if (!valid.value) return

  // Get the latest content from the editors
  if (sunEditorKz) {
    entry.value.description_kz = sunEditorKz.getContents()
  }

  if (sunEditorRu) {
    entry.value.description_ru = sunEditorRu.getContents()
  }

  // Validate both languages
  if (!entry.value.name_kz || !entry.value.description_kz) {
    toast.error('Заполните поля на казахском языке')
    activeTab.value = 'kz'
    return
  }

  if (!entry.value.name_ru || !entry.value.description_ru) {
    toast.error('Заполните поля на русском языке')
    activeTab.value = 'ru'
    return
  }

  loading.value = true
  try {
    await api.putData(`/v1/guide/${route.params.id}`, entry.value)
    toast.success('Запись успешно обновлена')
    destroyEditors()
    router.back()
  } catch (error: any) {
    let errorMessage = error?.message || 'Ошибка при обновлении записи'
    toast.error(errorMessage)
  } finally {
    loading.value = false
  }
}

// Watch for data loaded and initialize editors
watch(dataLoaded, (newValue) => {
  if (newValue) {
    nextTick(() => {
      initEditors()
    })
  }
})

// Initialize editors when the tab changes
watch(activeTab, () => {
  if (dataLoaded.value) {
    nextTick(() => {
      initEditors()
    })
  }
})

onMounted(() => {
  fetchCategories()
  fetchEntry()
})

// Clean up editors when component is unmounted
onBeforeUnmount(() => {
  destroyEditors()
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
.v-data-table {
  background: white;
}

.editor-container {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  overflow: hidden;
}
</style>
