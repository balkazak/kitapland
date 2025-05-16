<template>
  <div style="height: 100vh">
    <v-app-bar>
      <template v-slot:title>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">MURA GUIDE</span>
          <span class="text-subtitle-2 text-medium-emphasis">{{ t('guide_description') }}</span>
        </div>
      </template>

      <template v-slot:append>
        <v-menu v-if="auth.user.value && auth.user.value.roles.some((role) => role.id === 1)">
          <template v-slot:activator="{ props }">
            <v-btn color="primary" v-bind="props" variant="flat" class="mr-3">
              {{ t('add') }}
            </v-btn>
          </template>
          <v-list>
            <v-list-item>
              <v-btn
                prepend-icon="mdi-help-circle-outline"
                variant="flat"
                @click="router.push('/guide/entries')"
              >
                {{ t('new_entry') }}
              </v-btn>
            </v-list-item>
            <v-list-item>
              <v-btn
                prepend-icon="mdi-help-circle-outline"
                variant="flat"
                @click="router.push('/guide/categories')"
              >
                {{ t('category') }}
              </v-btn>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </v-app-bar>

    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </div>

    <div v-else class="search-container">
      <v-container>
        <div class="search-box rounded-lg">
          <v-text-field
            v-model="searchQuery"
            :loading="loading"
            prepend-inner-icon="mdi-magnify"
            :label="t('search_by_name')"
            hide-details
            variant="outlined"
            density="comfortable"
            class="search-field"
            color="primary"
          ></v-text-field>

          <v-select
            v-model="selectedCategory"
            :items="categories"
            :item-title="locale === 'kk' ? 'name_kz' : 'name_ru'"
            item-value="id"
            :label="locale === 'kk' ? 'Санат' : 'Категория'"
            hide-details
            variant="outlined"
            density="comfortable"
            class="category-select"
            :placeholder="locale === 'kk' ? 'Санатты таңдаңыз' : 'Выберите категорию'"
            color="#afb6bc"
            clearable
          />

          <v-btn color="primary" class="search-btn" :loading="loading" @click="search">
            {{ t('find') }}
          </v-btn>

          <v-btn variant="tonal" class="reset-btn" @click="resetSearch">
            {{ t('reset') }}
          </v-btn>
        </div>
      </v-container>
    </div>

    <v-container v-if="showResults" class="mt-6">
      <h2 class="text-h6 mb-4">
        {{
          searchQuery
            ? locale === 'kk'
              ? `"${searchQuery}" іздеу нәтижелері`
              : `Результаты поиска для "${searchQuery}"`
            : locale === 'kk'
              ? 'Барлық жазбалар'
              : 'Все записи'
        }}
        {{
          selectedCategory
            ? locale === 'kk'
              ? `санатында "${getLocalizedText(categories.find((c) => c.id === selectedCategory) || {}, 'name')}"`
              : `в категории "${getLocalizedText(categories.find((c) => c.id === selectedCategory) || {}, 'name')}"`
            : ''
        }}
      </h2>

      <v-data-table
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :headers="tableHeaders"
        :items="searchResults"
        :loading="loading"
        :no-data-text="t('no_data')"
        :items-length="totalItems"
        class="elevation-1 rounded-lg"
      >
        <template v-slot:item.categoryName="{ item }">
          {{ item.categoryName }}
        </template>

        <template v-slot:item.is_active="{ item }">
          <v-chip
            :color="item.is_active ? 'success' : 'error'"
            :text="item.is_active ? t('active') : t('inactive')"
            size="small"
          ></v-chip>
        </template>

        <template v-slot:item.updated_at="{ item }">
          {{ new Date(item.updated_at).toLocaleDateString('ru-RU') }}
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn icon variant="text" size="small" :to="`/guide/${item.id}/edit`">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
        </template>
      </v-data-table>

      <div v-if="searchResults.length" class="guide-pagination">
        <v-pagination v-model="page" :length="totalPages" :total-visible="5" rounded />
      </div>
    </v-container>

    <v-container v-else>
      <div v-if="categorizedSections.length" class="guide-grid">
        <v-card v-for="category in categorizedSections" :key="category.id" class="guide-card" flat>
          <div class="card-header">
            <div class="card-icon">
              <v-img :src="getItemPreview(category.image)" size="24"></v-img>
            </div>
            <div class="card-title">{{ getLocalizedText(category, 'name') }}</div>
          </div>

          <v-list density="compact" nav class="guide-list">
            <v-list-item v-for="item in category.entries" :key="item.id" :to="`/guide/${item.id}`">
              <template v-slot:prepend>
                <v-icon size="small" icon="mdi-file-document-outline"></v-icon>
              </template>
              {{ getLocalizedText(item, 'name') }}
            </v-list-item>
            <v-list-item v-if="getCategoryItemsCount(category.id) > 4" class="ellipsis-item">
              <template v-slot:prepend>
                <v-icon size="small" icon="mdi-dots-horizontal"></v-icon>
              </template>
              {{ t('and_more', { count: getCategoryItemsCount(category.id) - 4 }) }}
            </v-list-item>
          </v-list>

          <v-btn
            variant="text"
            color="primary"
            class="view-all-btn"
            :to="
              category.entries && category.entries.length > 0
                ? `/guide/${category.entries[0].id}`
                : ''
            "
            :disabled="!category.entries || category.entries.length === 0"
          >
            {{ t('view_all') }}
          </v-btn>
        </v-card>
      </div>

      <v-card v-else class="pa-4 text-center">
        <v-card-text>
          <div class="text-h6 text-medium-emphasis">{{ t('no_data') }}</div>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAPI } from '@/api'
import { useToastStore } from '@/stores/toast'
import { useAuth } from '@/auth/index'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const api = useAPI()
const toast = useToastStore()
const auth = useAuth()
const { t, locale } = useI18n()

const searchQuery = ref('')
const selectedCategory = ref<number | null>(null)
const page = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)
const showResults = ref(false)
const sections = ref<GuideEntry[]>([])
const loading = ref(false)
const itemsPerPage = ref(10)

interface Category {
  id: number
  name_ru: string
  name_kz: string
  image: string
  entries?: GuideEntry[]
}

const categories = ref<Category[]>([])

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
  categoryName?: string
}

interface ApiResponse {
  data: {
    items: GuideEntry[]
  }
  meta: {
    last_page: number
    total: number
  }
}

interface CategoryResponse {
  data: {
    items: Category[]
  }
}

const tableHeaders = computed(() => [
  { title: 'ID', key: 'id', align: 'start', sortable: true },
  {
    title: t('name'),
    key: locale.value === 'kk' ? 'name_kz' : 'name_ru',
    align: 'start',
    sortable: true
  },
  { title: t('category'), key: 'categoryName', align: 'start', sortable: true },
  { title: t('status'), key: 'is_active', align: 'center', sortable: true },
  { title: t('update_date'), key: 'updated_at', align: 'start', sortable: true },
  { title: t('actions'), key: 'actions', align: 'end', sortable: false }
]) as const

const searchResults = ref<GuideEntry[]>([])

const categorizedSections = computed(() => {
  const result: Category[] = JSON.parse(JSON.stringify(categories.value))

  result.forEach((category) => {
    category.entries = sections.value
      .filter((section) => section.category_id === category.id)
      .slice(0, 4) // Limit to 4 entries per category for display
  })

  return result.filter((category) => category.entries && category.entries.length > 0)
})

async function fetchSections() {
  loading.value = true
  try {
    const response = await api.fetchData('/v1/guide')
    const typedResponse = response.data as ApiResponse
    sections.value = typedResponse.data.items
    totalPages.value = typedResponse.meta.last_page
    totalItems.value = typedResponse.meta.total
  } catch (error: any) {
    let errorMessage = error?.message || t('error_loading_sections')
    toast.error(errorMessage)
  } finally {
    loading.value = false
  }
}

async function fetchCategories() {
  try {
    const response = await api.fetchData('/v1/dictionaries-guide-category')
    const typedResponse = response.data as CategoryResponse
    categories.value = typedResponse.data.items
  } catch (error: any) {
    let errorMessage = error?.message || t('error_loading_categories')
    toast.error(errorMessage)
  }
}

async function searchGuide() {
  loading.value = true
  try {
    let url = `/v1/guide?page=${page.value}`

    if (searchQuery.value) {
      if (locale.value === 'kk') {
        url += `&name_kz=${searchQuery.value}`
      } else {
        url += `&name_ru=${searchQuery.value}`
      }
    }
    if (selectedCategory.value) {
      url += `&category_id=${selectedCategory.value}`
    }

    const response = await api.fetchData(url)
    const typedResponse = response.data as ApiResponse
    searchResults.value = typedResponse.data.items.map((item: GuideEntry) => ({
      ...item,
      categoryName: getLocalizedName(
        categories.value.find((c) => c.id === item.category_id) || {},
        'name'
      )
    }))
    totalPages.value = typedResponse.meta.last_page
    totalItems.value = typedResponse.meta.total
  } catch (error: any) {
    let errorMessage = error?.message || 'Ошибка при поиске'
    toast.error(errorMessage)
  } finally {
    loading.value = false
  }
}

const search = () => {
  showResults.value = true
  page.value = 1
  searchGuide()
}

const resetSearch = () => {
  searchQuery.value = ''
  selectedCategory.value = null
  showResults.value = false
  page.value = 1
}

function getCategoryColorClass(categoryId: number) {
  const colorClasses = ['bg-light-green', 'bg-light-blue', 'bg-light-pink', 'bg-light-orange']
  return colorClasses[categoryId % colorClasses.length]
}

function getCategoryIcon(categoryId: number) {
  const icons = [
    'mdi-play-circle-outline',
    'mdi-view-grid-outline',
    'mdi-note-text-outline',
    'mdi-apps'
  ]
  return icons[categoryId % icons.length]
}

watch([page], () => {
  if (showResults.value) {
    searchGuide()
  }
})

watch(locale, () => {
  if (showResults.value) {
    searchResults.value = searchResults.value.map((item: GuideEntry) => ({
      ...item,
      categoryName: getLocalizedName(
        categories.value.find((c) => c.id === item.category_id) || {},
        'name'
      )
    }))
  }
})

onMounted(() => {
  fetchCategories()
  fetchSections()
})

const getCategoryById = (categoryId: number) => {
  return categories.value.find((category) => category.id === categoryId)
}

function getItemPreview(preview: string | undefined) {
  if (!preview) return ''
  return `${import.meta.env.VITE_APP_API}/storage/guide_image/${preview}`
}

function getLocalizedName(item: any, field: string) {
  if (locale.value === 'kk') {
    return item[`${field}_kz`] || item[field + '_ru'] || 'Белгісіз'
  }
  return item[field + '_ru'] || item[field + '_kz'] || 'Неизвестно'
}

function getLocalizedText(item: any, field: string) {
  return locale.value === 'kk' ? item[`${field}_kz`] : item[`${field}_ru`]
}

function getCategoryItemsCount(categoryId: number): number {
  return sections.value.filter((section) => section.category_id === categoryId).length
}
</script>

<style scoped>
.search-container {
  padding: 16px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.search-box {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 16px;
}

.search-field {
  flex-grow: 1;
}

.category-select {
  min-width: 200px;
  margin: 0 16px;
}

.search-btn {
  margin-right: 8px;
}

.guide-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.guide-card {
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  min-height: 300px;
  position: relative;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
}

.guide-list {
  padding: 0;
  margin-bottom: 48px;
  flex: 1;
}

.view-all-btn {
  position: absolute;
  bottom: 24px;
  left: 24px;
}

.guide-pagination {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.bg-light-green {
  background-color: #e8f5e9;
}

.bg-light-blue {
  background-color: #e3f2fd;
}

.bg-light-pink {
  background-color: #fce4ec;
}

.bg-light-orange {
  background-color: #fff3e0;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 64px); /* Subtract app bar height */
}

.ellipsis-item {
  opacity: 0.6;
  font-style: italic;
}
</style>
