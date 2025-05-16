<template>
  <div>
    <v-app-bar>
      <template v-slot:title>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">{{ title }}</span>
        </div>
      </template>

      <template v-slot:append>
        <v-btn
          v-if="auth.user.value && auth.user.value.roles.some((role) => role.id === 1)"
          color="primary"
          variant="flat"
          class="mr-3"
          prepend-icon="mdi-pencil"
          :to="`/guide/${route.params.id}/edit`"
        >
          Редактировать
        </v-btn>
        <v-btn
          variant="flat"
          class="mr-3"
          prepend-icon="mdi-arrow-left"
          @click="router.push('/guide')"
        >
          {{ t('back') }}
        </v-btn>
      </template>
    </v-app-bar>

    <!-- Loading state -->
    <div
      v-if="initialLoading"
      class="d-flex justify-center align-center"
      style="height: calc(100vh - 64px)"
    >
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </div>

    <!-- Content (only show when not initially loading) -->
    <div v-else>
      <!-- Search container -->
      <div class="search-container">
        <v-container>
          <div class="search-box rounded-lg">
            <v-text-field
              v-model="searchQuery"
              :loading="loading"
              prepend-inner-icon="mdi-magnify"
              :label="t('search_by_content')"
              hide-details
              variant="outlined"
              density="comfortable"
              class="search-field"
            ></v-text-field>

            <v-btn color="primary" class="search-btn" :loading="loading" @click="search">
              {{ t('find') }}
            </v-btn>

            <v-btn variant="tonal" class="reset-btn" @click="clearSearch">
              {{ t('reset') }}
            </v-btn>
          </div>

          <v-row>
            <v-col cols="3">
              <v-card>
                <v-list>
                  <div v-if="sidebarLoading" class="d-flex justify-center pa-4">
                    <v-progress-circular
                      indeterminate
                      color="primary"
                      size="24"
                    ></v-progress-circular>
                  </div>
                  <v-list-subheader v-else-if="categories.length && guideItem">
                    {{ getCategoryName(guideItem.category_id) }}
                  </v-list-subheader>

                  <v-list-item
                    v-for="item in sidebarItems"
                    :key="item.id"
                    :value="item"
                    :to="item.link"
                    :active="item.id.toString() === route.params.id.toString()"
                    active-color="primary"
                    @click="handleItemClick(item.id)"
                  >
                    <template v-slot:prepend>
                      <v-icon :icon="item.icon" />
                    </template>
                    <v-list-item-title>{{ getItemTitle(item) }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>

            <!-- Main content -->
            <v-col cols="9">
              <v-card>
                <v-card-text>
                  <div class="content-section">
                    <div class="d-flex align-center mb-4">
                      <div>
                        <h2 class="text-h5 mb-2">{{ title }}</h2>
                      </div>
                    </div>
                    <div class="mt-6 html-content">
                      <div v-html="description"></div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAPI } from '@/api'
import { useAuth } from '@/auth'
import { useToastStore } from '@/stores/toast'
import { useI18n } from 'vue-i18n'
import logoUrl from '@/assets/guide1.png'

const route = useRoute()
const router = useRouter()
const api = useAPI()
const auth = useAuth()
const toast = useToastStore()
const { locale, t } = useI18n()

const searchQuery = ref('')
const loading = ref(false)
const initialLoading = ref(true)
const sidebarLoading = ref(true)

const title = ref('QAZAQMURA')
const description = ref('Цифровая библиотечная система')
const contentImage = ref(logoUrl)
const videoUrl = ref('https://www.youtube.com/embed/your-video-id')

interface GuideItem {
  id: number
  name_ru: string
  name_kz: string
  description_ru: string
  description_kz: string
  category_id: number
  image?: string
  video_url?: string
}

interface Category {
  id: number
  name_ru: string
  name_kz: string
}

interface ApiResponse<T> {
  data: {
    items: T[]
  }
}

const guideItem = ref<GuideItem | null>(null)
const categoryItems = ref<GuideItem[]>([])
const categories = ref<Category[]>([])

const sidebarItems = computed(() => {
  if (!guideItem.value || !guideItem.value.category_id || sidebarLoading.value) return []

  return categoryItems.value
    .filter((item) => item.category_id === guideItem.value.category_id)
    .map((item) => ({
      title: item.name_ru,
      title_kz: item.name_kz,
      icon: 'mdi-file-document-outline',
      link: `/guide/${item.id}`,
      id: item.id
    }))
})

function getItemTitle(item: any) {
  return locale.value === 'kk' ? item.title_kz : item.title
}

function getCategoryName(categoryId: number) {
  const category = categories.value.find((c) => c.id === categoryId)
  return locale.value === 'kk' ? category?.name_kz : category?.name_ru || 'Категория'
}

function updateContent() {
  if (!guideItem.value) return

  if (locale.value === 'kk') {
    title.value = guideItem.value.name_kz || 'QAZAQMURA'
    description.value = guideItem.value.description_kz || 'Цифровая библиотечная система'
  } else {
    title.value = guideItem.value.name_ru || 'QAZAQMURA'
    description.value = guideItem.value.description_ru || 'Цифровая библиотечная система'
  }
}

async function fetchGuideItem(id: string | string[]) {
  loading.value = true
  try {
    const response = await api.fetchData(`/v1/guide/${id}`)
    if (response.data) {
      guideItem.value = response.data as GuideItem
      updateContent()

      if (guideItem.value.image) {
        contentImage.value = getItemPreview(guideItem.value.image)
      }

      if (guideItem.value.video_url) {
        videoUrl.value = guideItem.value.video_url
      }
    }
  } catch (error: any) {
    const errorMessage = error?.message || t('error_loading_guide')
    toast.error(errorMessage)
    console.error('Error:', error)
  } finally {
    loading.value = false
    initialLoading.value = false
  }
}

async function fetchCategoryItems() {
  try {
    sidebarLoading.value = true
    const response = await api.fetchData('/v1/guide')
    if (response.data) {
      const apiResponse = response.data as ApiResponse<GuideItem>
      categoryItems.value = apiResponse.data.items || []
    }
  } catch (error: any) {
    console.error('Error fetching guide items:', error)
  } finally {
    sidebarLoading.value = false
  }
}

async function fetchCategories() {
  try {
    const response = await api.fetchData('/v1/guide/category')
    if (response.data) {
      const apiResponse = response.data as ApiResponse<Category>
      categories.value = apiResponse.data.items || []
    }
  } catch (error: any) {
    console.error('Error fetching categories:', error)
  }
}

function getItemPreview(preview: string | undefined) {
  if (!preview) return ''
  return `${import.meta.env.VITE_APP_API}/storage/guide_image/${preview}`
}

function clearSearch() {
  searchQuery.value = ''
}

function handleItemClick(id: number) {
  sidebarLoading.value = true
  fetchGuideItem(id.toString()).then(() => {
    if (guideItem.value) {
      const categoryId = guideItem.value.category_id
      sidebarItems.value = categoryItems.value
        .filter((item) => item.category_id === categoryId)
        .map((item) => ({
          title: item.name_ru,
          title_kz: item.name_kz,
          id: item.id,
          icon: 'mdi-file-document-outline',
          link: `/guide/${item.id}`
        }))
    }
    sidebarLoading.value = false
  }).catch(error => {
    console.error('Error in handleItemClick:', error)
    sidebarLoading.value = false
  })
}

// Watch for language changes from App.vue
watch(locale, () => {
  updateContent()
})

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      sidebarLoading.value = true
      fetchGuideItem(newId)
    }
  }
)

onMounted(async () => {
  const guideId = route.params.id
  if (guideId) {
    initialLoading.value = true
    sidebarLoading.value = true
    try {
      await Promise.all([fetchCategories(), fetchCategoryItems(), fetchGuideItem(guideId)])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      initialLoading.value = false
      sidebarLoading.value = false
    }
  }
})
</script>

<style>
.html-content {
  overflow: auto;
}
/* Global styles for images in HTML content */
.html-content img {
  width: 100% !important;
  margin: 16px 0;
}

/* Style for figures in HTML content */
.html-content figure {
  margin: 16px 0;
  padding-bottom: 0 !important;
}

.html-content iframe {
  width: 100% !important;
  height: 600px !important;
}

/* Style for lists in HTML content */
.html-content ul,
.html-content ol {
  margin-left: 20px !important;
  padding-left: 20px !important;
}
</style>

<style scoped>
.content-image {
  max-width: 200px;
  height: auto;
}

.content-section :deep(h3) {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 500;
}

.content-section :deep(ul) {
  padding-left: 24px;
  margin-bottom: 16px;
}

.content-section :deep(p) {
  margin-bottom: 16px;
  line-height: 1.6;
}

/* Add search styles from GuideView */
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
  margin-bottom: 32px;
}

.search-field {
  flex-grow: 1;
}

.search-btn {
  margin-right: 8px;
  margin-left: 16px;
}

/* Add highlight style for search results */
.content-section :deep(.search-highlight) {
  background-color: #ffeb3b;
  padding: 2px 0;
  border-radius: 2px;
}

:global(.v-main) {
  height: 100vh;
}
:global(html) {
  background-color: #f2f2f2;
}
</style>
