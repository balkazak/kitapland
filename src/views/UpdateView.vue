<script setup>
import { computed, ref, watch } from 'vue'
import { useAuth } from '@/auth'
import { useAPI } from '@/api'
import { useI18n } from 'vue-i18n'
import { useToastStore } from '@/stores/toast'

const { t, locale } = useI18n()
const toast = useToastStore()

const auth = useAuth()
const api = useAPI()

const role = computed(() => {
  return auth.user.value && auth.user.value.roles[0] ? auth.user.value.roles[0].id : 0
})

const news = ref([])
const newsCategories = ref([])
const page = ref(1)
const length = ref(1)
const newUpdate = ref({
  title: '',
  text: '',
  description: '',
  preview: null,
  news_category_id: null,
  author: ''
})
const previewFile = ref(null)

const updateMode = ref(false)

async function getNews() {
  const response = await api.fetchData(`/v1/news?page=${page.value}`)
  if (response.data) {
    news.value = response.data.data.items
    length.value = response.data.meta.last_page
  }
}

async function getNewsCategories() {
  const response = await api.fetchData(`/v1/news/category`)
  if (response.data) {
    newsCategories.value = response.data.data.items
  }
}

async function createUpdate() {
  const formData = new FormData()
  if (previewFile.value) {
    formData.append('preview', previewFile.value[0])
  }
  formData.append('text', newUpdate.value.text)
  formData.append('title', newUpdate.value.title)
  formData.append('description', newUpdate.value.description)
  formData.append('news_category_id', newUpdate.value.news_category_id)

  await api.postData('/v1/news', formData)

  newUpdate.value = {
    text: '',
    title: '',
    description: '',
    news_category_id: null
  }

  previewFile.value = null

  updateMode.value = false
  getNews()
}

function getPreviewImage(previewFile) {
  return URL.createObjectURL(previewFile[0])
}

function getItemPreview(preview) {
  return `${import.meta.env.VITE_APP_API}/storage/news/${preview}`
}

function getCategoryName(category_id) {
  const category = newsCategories.value.find((item) => item.id === category_id)
  return category ? category.title : 'Категория'
}

const selectedNews = ref({
  title: '',
  text: '',
  preview: null,
  news_category_id: 1
})
const detailDrawer = ref(false)

async function openNewsDetail(item) {
  try {
    const response = await api.fetchData(`/v1/news/${item.id}`)
    if (response.data) {
      selectedNews.value = {
        id: response.data.id,
        title: response.data.title,
        text: response.data.text,
        description: response.data.description,
        preview: response.data.preview,
        news_category_id: response.data.news_category_id
      }
      detailDrawer.value = true
    } else {
      toast.error(t('error_loading_news'))
    }
  } catch (error) {
    toast.error(error?.response?.data?.message || t('error_loading_news'))
  }
}

function formatDate(dateString) {
  if (!dateString) return t('date_not_specified')

  try {
    return new Date(dateString).toLocaleDateString(locale.value === 'kk' ? 'kk-KZ' : 'ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch (e) {
    return t('date_not_specified')
  }
}

getNews()
getNewsCategories()

watch(page, () => getNews())
</script>

<template>
  <v-container class="d-flex flex-column h-screen">
    <v-app-bar>
      <v-app-bar-title>
        <div class="text-h6 font-weight-bold">{{ t('updates') }}</div>
        <div class="text-subtitle-2 text-medium-emphasis">{{ t('updates_subtitle') }}</div>
      </v-app-bar-title>

      <template #append>
        <v-responsive v-if="role === 1" max-width="10vw">
          <v-btn
            @click="updateMode = true"
            block
            variant="flat"
            color="primary"
            :text="t('add')"
          ></v-btn>
        </v-responsive>
      </template>
    </v-app-bar>

    <v-row class="flex-grow-1">
      <v-col cols="12" sm="6" md="3" v-for="item in news" :key="item.id">
        <v-card class="h-100" elevation="0" color="transparent" @click="openNewsDetail(item)">
          <v-img
            :src="getItemPreview(item.preview)"
            class="rounded-lg mb-4"
            height="200"
            cover
          ></v-img>

          <div class="text-category">{{ t('category') }}</div>

          <v-card-title
            class="px-0 text-h6 text-wrap py-0 d-flex align-center justify-space-between"
          >
            {{ item.title }}
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M5.75 1.5C5.33579 1.5 5 1.16421 5 0.75C5 0.335786 5.33579 0 5.75 0H11.25C11.6642 0 12 0.335786 12 0.75V6.25C12 6.66421 11.6642 7 11.25 7C10.8358 7 10.5 6.66421 10.5 6.25V2.56066L1.28033 11.7803C0.987437 12.0732 0.512563 12.0732 0.21967 11.7803C-0.0732233 11.4874 -0.0732233 11.0126 0.21967 10.7197L9.43934 1.5H5.75Z"
                fill="#101828"
              />
            </svg>
          </v-card-title>

          <v-card-text class="px-0">
            {{ item.text }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-auto">
      <v-col cols="2">
        <v-select
          v-model="perPage"
          :items="[10, 20, 50, 100]"
          :label="t('records_per_page')"
          density="compact"
          hide-details
        />
      </v-col>
      <v-col cols="10" class="d-flex justify-end">
        <v-pagination
          v-model="page"
          :length="length"
          size="small"
          variant="flat"
          active-color="primary"
          :total-visible="7"
        ></v-pagination>
      </v-col>
    </v-row>
  </v-container>

  <v-navigation-drawer v-model="detailDrawer" location="right" temporary width="500">
    <v-toolbar>
      <v-toolbar-title>{{ t('details') }}</v-toolbar-title>
      <template v-slot:append>
        <v-btn icon="mdi-close" variant="text" @click="detailDrawer = false"></v-btn>
      </template>
    </v-toolbar>

    <div class="d-flex flex-column" style="height: 90%">
      <v-card-text class="flex-grow-1">
        <v-chip color="primary" variant="flat" class="mb-4" size="small">
          {{ getCategoryName(selectedNews.news_category_id) }}
        </v-chip>

        <div class="text-h5 mb-4">{{ selectedNews.title }}</div>

        <div class="d-flex align-center mb-6">
          <v-avatar size="32" class="mr-3">
            <v-img :src="selectedNews.avatar" alt="Avatar"></v-img>
          </v-avatar>
          <div>
            <div class="text-subtitle-2">{{ selectedNews.author }}</div>
            <div class="text-caption text-medium-emphasis">
              {{ formatDate(selectedNews.created_at) }}
            </div>
          </div>
        </div>
        <v-img
          :src="getItemPreview(selectedNews.preview)"
          class="rounded-lg mb-4"
          height="200"
          cover
        ></v-img>
        <div class="text-body-1 overflow-y-auto" style="max-height: 215px">
          {{ selectedNews.text }}
        </div>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-btn block variant="tonal" @click="detailDrawer = false">{{ t('close') }}</v-btn>
      </v-card-actions>
    </div>
  </v-navigation-drawer>

  <v-navigation-drawer v-model="updateMode" location="right" temporary width="500">
    <v-toolbar>
      <v-toolbar-title>{{ t('add_update') }}</v-toolbar-title>
      <template v-slot:append>
        <v-btn icon="mdi-close" variant="text" @click="updateMode = false"></v-btn>
      </template>
    </v-toolbar>

    <div class="pa-4">
      <v-select
        v-model="newUpdate.news_category_id"
        :items="newsCategories"
        item-value="id"
        :label="t('category')"
        variant="outlined"
        class="mb-4"
        hide-details
      />

      <v-text-field
        v-model="newUpdate.title"
        :label="t('write_title')"
        variant="outlined"
        class="mb-4"
        hide-details
        :placeholder="t('write_title')"
      />

      <v-card
        class="mb-4 border-dashed d-flex align-center justify-center"
        height="200"
        variant="outlined"
      >
        <div v-if="!previewFile" class="text-center">
          <v-icon size="40" icon="mdi-cloud-upload" class="mb-2"></v-icon>
          <div>{{ t('drag_file') }}</div>
          <div class="text-caption text-medium-emphasis">{{ t('max_file_size') }}</div>
        </div>
        <v-img v-else :src="getPreviewImage(previewFile)" cover height="200"></v-img>
        <input
          type="file"
          class="file-input"
          @change="(e) => (previewFile = e.target.files)"
          accept="image/*"
        />
      </v-card>

      <v-textarea
        v-model="newUpdate.text"
        :label="t('write_text')"
        variant="outlined"
        class="mb-4"
        hide-details
        :placeholder="t('write_text')"
        rows="5"
      />

      <v-text-field
        v-model="newUpdate.author"
        :label="t('author')"
        variant="outlined"
        class="mb-4"
        hide-details
        :placeholder="t('author')"
      />

      <div class="d-flex justify-end gap-2">
        <v-btn variant="tonal" @click="updateMode = false">{{ t('close') }}</v-btn>
        <v-btn color="primary" @click="createUpdate" class="ml-4">{{ t('add') }}</v-btn>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<style scoped>
.v-card {
  transition: transform 0.2s;
  cursor: pointer;
}

.v-card:hover {
  transform: translateY(-4px);
}

/* Remove background color and hover effects */
:deep(.v-card) {
  background-color: transparent !important;
}

:deep(.v-card:hover) {
  background-color: transparent !important;
}

:deep(.v-card__overlay) {
  display: none !important;
}

/* Remove ripple effect */
:deep(.v-ripple__container) {
  display: none !important;
}

.v-card-title {
  color: #101828;
  font-size: 24px;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
}

.v-card-text {
  color: #667085;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.text-category {
  color: #6941c6;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
}
.border-dashed {
  border-style: dashed !important;
  cursor: pointer;
  position: relative;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}
</style>
