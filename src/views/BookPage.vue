<template>
  <book-reader v-if="bookUrl" :src="bookUrl" :start-page="startPage"></book-reader>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useAPI } from '@/api'
import { ref, watch } from 'vue'
import BookReader from '@/components/BookReader.vue'

const route = useRoute()
const api = useAPI()
const book = ref(null)
const bookUrl = ref('')
const startPage = ref(1)

const getBook = async () => {
  try {
    const response = await api.fetchData(`/v1/book/${route.params.id}`)
    book.value = response.data
    if (book.value?.book_epub?.value) {
      bookUrl.value = `${import.meta.env.VITE_APP_API}/storage/epub/${book.value.book_epub.value}`
    }
    // Get the start page from query params or last read position
    startPage.value = parseInt(route.query.page) || 1
  } catch (error) {
    console.error('Error loading book:', error)
  }
}

watch(() => route.params.id, getBook, { immediate: true })
</script>
