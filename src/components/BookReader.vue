<script setup>
import ePub from 'epubjs'
import { ref, onMounted, defineProps, nextTick } from 'vue'
import { useAPI } from '@/api'
import { useToastStore } from '@/stores/toast'
import { useRoute } from 'vue-router'

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  startPage: {
    type: Number,
    default: 1
  }
})

const api = useAPI()
const toast = useToastStore()
const route = useRoute()
const progress = ref(1)
const total = ref(0)
const book = ref(null)
const rendition = ref(null)
const tableOfContents = ref([])
const isLoading = ref(false)
const isBookLoading = ref(true)
let navigationTimeout = null
const readerRef = ref(null)

const updateProgress = async (pageNumber) => {
  try {
    await api.postData('/v1/book-progress', {
      book_id: route.params.id,
      last_page: pageNumber
    })
  } catch (error) {
    console.error('Error updating progress:', error)
  }
}

const handleNavigation = (direction) => {
  if (isLoading.value) return
  isLoading.value = true
  if (navigationTimeout) clearTimeout(navigationTimeout)
  
  navigationTimeout = setTimeout(async () => {
    try {
      if (direction === 'next') {
        await rendition.value.next()
      } else {
        await rendition.value.prev()
      }
    } catch (error) {
      console.error('Navigation error:', error)
    } finally {
      isLoading.value = false
      navigationTimeout = null
    }
  }, 300)
}

const loadBook = async () => {
  try {
    isBookLoading.value = true
    console.log('Starting book load with startPage:', props.startPage)
    book.value = ePub(props.src)
    
    // Set up pagination
    await book.value.ready
    console.log('Book ready')
    
    const locations = book.value.locations
    await locations.generate(1024)
    total.value = locations.total
    console.log('Locations generated, total:', total.value)

    // Wait for the template to update and element to be available
    await nextTick()

    rendition.value = book.value.renderTo(readerRef.value, {
      width: '90vw',
      height: '88vh',
      allowScriptedContent: true,
      flow: 'paginated',
      spread: 'both',
      minSpreadWidth: 800,
      manager: 'continuous'
    })

    // Go to the last read page if provided
    if (props.startPage > 1) {
      console.log('Attempting to go to page:', props.startPage)
      const cfi = book.value.locations.cfiFromLocation(props.startPage)
      console.log('Generated CFI:', cfi)
      if (cfi) {
        await rendition.value.display(cfi)
      } else {
        console.log('CFI generation failed, falling back to first page')
        await rendition.value.display()
      }
    } else {
      console.log('Starting from first page')
      await rendition.value.display()
    }

    // Get table of contents
    const navigation = await book.value.loaded.navigation
    tableOfContents.value = navigation.toc

    // Track page changes
    rendition.value.on('relocated', (location) => {
      if (isLoading.value) return
      
      const currentLocation = book.value.locations.locationFromCfi(location.start.cfi)
      progress.value = currentLocation
      updateProgress(currentLocation)
    })

    // Add keyboard navigation
    document.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft') handleNavigation('prev')
      if (e.key === 'ArrowRight') handleNavigation('next')
    })
  } catch (error) {
    console.error('Error loading book:', error)
    toast.error('Error loading book')
  } finally {
    isBookLoading.value = false
  }
}

const goToPage = async (href, isActive) => {
  try {
    isLoading.value = true
    await rendition.value.display(href)
    isActive.value = false
    setTimeout(() => {
      isLoading.value = false
    }, 300)
  } catch (error) {
    console.error('Error navigating to page:', error)
    toast.error('Error navigating to page')
    isLoading.value = false
  }
}

onMounted(() => {
  loadBook()
})
</script>

<template>
  <v-container class="bg-grey h-screen" fluid>
    <v-overlay
      v-model="isBookLoading"
      class="align-center justify-center"
      persistent
      scrim="white"
    >
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
      ></v-progress-circular>
    </v-overlay>

    <div ref="readerRef" class="reader-container"></div>

    <template v-if="!isBookLoading">
      <v-system-bar dense window>
        <v-spacer></v-spacer>
        <v-dialog width="700">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              size="x-small"
              icon="mdi-format-list-bulleted"
              variant="text"
              class="mr-3"
            ></v-btn>
          </template>
          <template v-slot:default="{ isActive }">
            <v-card>
              <v-list color="primary">
                <v-list-item><strong>Оглавление</strong></v-list-item>
                <v-divider></v-divider>
                <v-list-item
                  v-for="item in tableOfContents"
                  :key="item.id"
                  @click="goToPage(item.href, isActive)"
                >{{ item.label }}</v-list-item>
              </v-list>
            </v-card>
          </template>
        </v-dialog>
      </v-system-bar>

      <v-row>
        <v-col class="d-flex">
          <div 
            @click="() => handleNavigation('prev')" 
            class="navigation-btn h-100 cursor-pointer d-flex flex-column align-center"
            :class="{ 'disabled': isLoading }"
          >
            <v-icon class="my-auto" color="white" icon="mdi-chevron-left" size="x-large"></v-icon>
          </div>
          <div ref="readerRef" class="reader-container"></div>
          <div 
            @click="() => handleNavigation('next')" 
            class="navigation-btn h-100 cursor-pointer d-flex flex-column align-center"
            :class="{ 'disabled': isLoading }"
          >
            <v-icon class="my-auto" color="white" icon="mdi-chevron-right" size="x-large"></v-icon>
          </div>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="10" offset="1">
          <v-progress-linear v-model="progress" :max="total" color="primary" :height="25">
            <strong>{{ progress }} / {{ total }}</strong>
          </v-progress-linear>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<style scoped>
.navigation-btn {
  width: 5vw;
}

.navigation-btn:hover:not(.disabled) {
  opacity: 0.5;
}

.navigation-btn.disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.reader-container {
  flex: 1;
  background: white;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}
</style>
