<template>
  <div>
    <v-app-bar flat>
      <div class="d-flex flex-column pl-4">
        <span class="text-h5 font-weight-bold">Категории</span>
        <span class="text-subtitle-2 text-medium-emphasis">
          Управление категориями базы знаний
        </span>
      </div>
      
      <v-spacer></v-spacer>
      
      <v-btn variant="text" @click="$router.back()" class="text-none">
        <v-icon start>mdi-arrow-left</v-icon>
        Назад к списку
      </v-btn>
    </v-app-bar>

    <v-main class="bg-grey-lighten-4 pa-0">
      <div class="d-flex justify-center align-center" style="min-height: calc(100vh - 64px)">
        <v-card class="mx-auto my-8" style="width: 90%; max-width: 1000px; border-radius: 8px;">
          <div class="pa-4 d-flex align-center">
            <div class="search-container d-flex align-center flex-grow-1">
              <v-icon class="mr-2">mdi-magnify</v-icon>
              <input 
                v-model="categorySearch" 
                type="text" 
                placeholder="Поиск" 
                class="search-input"
              />
            </div>
            
            <v-btn 
              color="primary" 
              prepend-icon="mdi-plus" 
              @click="showAddDialog = true"
              class="ml-4"
            >
              ДОБАВИТЬ
            </v-btn>
          </div>
          
          <v-divider></v-divider>
          
          <table class="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Название на русском</th>
                <th>Название на казахском</th>
                <th>Изображение</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in categoryItems" :key="item.id">
                <td>{{ item.id }}</td>
                <td>{{ item.name_ru }}</td>
                <td>{{ item.name_kz }}</td>
                <td class="text-center">
                  <!-- {{ getImageURL(item.image) }} -->
                  <v-img
                    v-if="item.image"
                    :src="getImageURL(item.image)"
                    height="40"
                    width="40"
                    cover
                    class="mx-auto"
                  ></v-img>
                  <v-icon v-else>mdi-image-off</v-icon>
                </td>
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
    </v-main>

    <!-- Add Category Dialog -->
    <v-dialog v-model="showAddDialog" max-width="500px">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center pa-4">
          <span>Добавить категорию</span>
          <v-btn icon variant="text" @click="showAddDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-4">
          <v-form ref="form" v-model="valid">
            <v-text-field
              v-model="newCategory.name_kz"
              label="КАЗ:"
              required
              :rules="[(v) => !!v || 'Обязательное поле']"
            ></v-text-field>

            <v-text-field
              v-model="newCategory.name_ru"
              label="РУС:"
              required
              :rules="[(v) => !!v || 'Обязательное поле']"
            ></v-text-field>

            <v-btn
              color="primary"
              variant="flat"
              class="mt-4"
              block
              @click="uploadIcon"
              prepend-icon="mdi-upload"
            >
              {{ newCategory.image ? 'Иконка выбрана' : 'Загрузить иконку' }}
            </v-btn>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showAddDialog = false">Закрыть</v-btn>
          <v-btn color="primary" variant="flat" @click="saveNewCategory">Добавить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useAPI } from '@/api'
import { useToastStore } from '@/stores/toast'
import { useRouter } from 'vue-router'

const api = useAPI()
const toast = useToastStore()
const router = useRouter()

const loading = ref(false)
const categorySearch = ref('')
const itemsPerPage = ref(20)
const showAddDialog = ref(false)
const valid = ref(false)
const form = ref(null)
const page = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)

interface Category {
  id: number
  name_ru: string
  name_kz: string
  image: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

const newCategory = ref({
  name_kz: '',
  name_ru: '',
  image: null as File | null
})

const headers = [
  { title: 'ID', key: 'id', align: 'start', sortable: true },
  { title: 'Название на русском', key: 'name_ru', align: 'start', sortable: true },
  { title: 'Название на казахском', key: 'name_kz', align: 'start', sortable: true },
  { title: 'Изображение', key: 'image', align: 'center', sortable: false },
  { title: '', key: 'actions', align: 'end', sortable: false }
]

const categoryItems = ref<Category[]>([])

const getImageURL = (image: string) => {
  return `${import.meta.env.VITE_APP_API}/storage/guide_image/${image}`
}

async function fetchCategories() {
  loading.value = true
  try {
    let url = `/v1/dictionaries-guide-category?page=${page.value}`
    if (categorySearch.value) {
      url += `&search=${categorySearch.value}`
    }

    const response = await api.fetchData(url)
    const { data, meta } = response.data
    categoryItems.value = data.items
    totalPages.value = meta.last_page
    totalItems.value = meta.total
  } catch (error: any) {
    let errorMessage = error?.message || 'Ошибка при загрузке категорий'
    toast.error(errorMessage)
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

const editItem = async (item: Category) => {
  try {
  } catch (error: any) {
    let errorMessage = error?.message || 'Ошибка при редактировании категории'
    toast.error(errorMessage)
  }
}

const deleteItem = async (item: Category) => {
  try {
    await api.deleteData(`/v1/dictionaries-guide-category/${item.id}`)
    toast.success('Категория успешно удалена')
    fetchCategories()
  } catch (error: any) {
    let errorMessage = error?.message || 'Ошибка при удалении категории'
    toast.error(errorMessage)
  }
}

const uploadIcon = () => {
  // Create hidden file input
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'

  input.onchange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      newCategory.value.image = file
    }
  }

  input.click()
}

const saveNewCategory = async () => {
  if (!valid.value) return

  try {
    const formData = new FormData()
    formData.append('name_kz', newCategory.value.name_kz)
    formData.append('name_ru', newCategory.value.name_ru)
    if (newCategory.value.image) {
      formData.append('image', newCategory.value.image)
    }

    await api.postData('/v1/dictionaries-guide-category', formData)
    toast.success('Категория успешно добавлена')
    showAddDialog.value = false
    newCategory.value = {
      name_kz: '',
      name_ru: '',
      image: null
    }
    fetchCategories()
  } catch (error: any) {
    let errorMessage = error?.message || 'Ошибка при добавлении категории'
    toast.error(errorMessage)
  }
}

watch([page, categorySearch], () => {
  fetchCategories()
})

onMounted(() => {
  fetchCategories()
})
</script>

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
</style>
