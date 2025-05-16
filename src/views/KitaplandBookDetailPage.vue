<template>
  <div class="book-detail-page">
    <main>
      <!-- Search Card -->
      <section class="search-section">
        <div class="container">
          <v-card class="search-card">
            <div class="search-card-content">
              <div class="search-input-container">
                <v-text-field
                  placeholder="Введите ваш запрос"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-magnify"
                  hide-details
                  class="search-input"
                ></v-text-field>
                <v-btn color="#002D96" class="search-btn">Найти</v-btn>
              </div>

              <div class="action-buttons">
                <v-btn variant="text" prepend-icon="mdi-heart-outline" class="action-btn">
                  Избранное
                </v-btn>
                <v-btn variant="text" prepend-icon="mdi-account" class="action-btn">
                  Кабинет читателя
                </v-btn>
              </div>
            </div>
          </v-card>
        </div>
      </section>

      <!-- Book Detail Section -->
      <section class="section">
        <div class="container">
          <v-card class="section-card">
            <v-card-text>
              <div class="book-content">
                <div class="book-image-container"></div>

                <div class="book-info">
                  <div class="book-meta">
                    <div class="book-author">{{ book.author }}</div>
                    <div class="book-title-large">{{ book.title }}</div>
                    <div class="book-subtitle">{{ book.subtitle }}</div>
                  </div>

                  <div class="book-details">
                    <div class="detail-item">
                      <div class="detail-label">Тип издания:</div>
                      <div class="detail-value">{{ book.type }}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Издательство:</div>
                      <div class="detail-value">{{ book.publisher }}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Год издания:</div>
                      <div class="detail-value">{{ book.year }}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Количество страниц:</div>
                      <div class="detail-value">{{ book.pages }}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Язык издания:</div>
                      <div class="detail-value">{{ book.language }}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">ISBN:</div>
                      <div class="detail-value">{{ book.isbn }}</div>
                    </div>
                  </div>

                  <div class="book-actions">
                    <v-btn color="#61A3B4" class="reserve-btn">Забронировать</v-btn>
                    <v-btn variant="outlined" class="favorite-btn">
                      <v-icon>mdi-heart-outline</v-icon>
                      В избранное
                    </v-btn>
                  </div>
                </div>
              </div>

              <div class="book-description">
                <h3>Описание</h3>
                <p>{{ book.description }}</p>
              </div>

              <!-- Library Availability Section -->
              <div class="library-availability">
                <h3>Выберите библиотеку и издание</h3>

                <div class="library-map-container">
                  <div class="library-list">
                    <div
                      v-for="(library, index) in libraries"
                      :key="index"
                      class="library-item"
                      :class="{ active: selectedLibrary === index }"
                      @click="selectLibrary(index)"
                    >
                      <div class="library-name">{{ library.name }}</div>
                      <div class="library-address">{{ library.address }}</div>
                      <div
                        class="library-availability-status"
                        :class="library.status.toLowerCase()"
                      >
                        {{ library.status }}
                      </div>
                    </div>
                  </div>

                  <div class="map-container">
                    <iframe
                      :src="`https://yandex.ru/map-widget/v1/?um=constructor%3A4a6931b7-fc60-43b6-b7bc-681046d12701&amp;source=constructor&amp;ll=${currentMapCenter[1]}%2C${currentMapCenter[0]}&amp;z=14&amp;pt=${currentMapCenter[1]}%2C${currentMapCenter[0]}%2Cdm-${selectedLibrary === 3 ? 'rd' : 'bl'}`"
                      width="100%"
                      height="100%"
                      frameborder="0"
                      class="yandex-map-iframe"
                    ></iframe>
                  </div>
                </div>
              </div>

              <!-- Related Books Section -->
              <div class="related-books">
                <div class="section-header">
                  <h3>Похожие книги</h3>
                  <div class="slider-controls">
                    <button
                      class="slider-dot"
                      v-for="i in Math.ceil(relatedBooks.length / relatedBooksVisibleItems)"
                      :key="i"
                      :class="{ active: Math.floor(relatedBooksSlideOffset) === i - 1 }"
                      @click="goToSlide('relatedBooks', i - 1)"
                    ></button>
                    <div class="slider-arrows">
                      <button
                        class="slider-arrow-modern"
                        @click="slidePrev('relatedBooks')"
                        :disabled="relatedBooksSlideOffset === 0"
                      >
                        <v-icon>mdi-chevron-left</v-icon>
                      </button>
                      <button
                        class="slider-arrow-modern"
                        @click="slideNext('relatedBooks')"
                        :disabled="
                          relatedBooksSlideOffset >=
                          calculateMaxOffset('relatedBooks', relatedBooks.length)
                        "
                      >
                        <v-icon>mdi-chevron-right</v-icon>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="modern-slider-container">
                  <div
                    class="modern-slider"
                    :style="{
                      transform: `translateX(-${relatedBooksSlideOffset * relatedBookWidth}px)`
                    }"
                    @mousedown="startDrag($event, 'relatedBooks')"
                    @touchstart="startDrag($event, 'relatedBooks')"
                  >
                    <div
                      class="modern-slide"
                      v-for="(book, index) in relatedBooks"
                      :key="index"
                      :class="{ 'active-slide': isActiveSlide(index, 'relatedBooks') }"
                      @click="navigateToBookDetail(book.id || index + 1)"
                    >
                      <div class="book-card">
                        <div class="book-cover">
                          <img src="@/assets/kitapland/main2.png" :alt="book.title" />
                        </div>
                        <div class="book-content-column">
                          <div class="book-author">{{ book.author }}</div>
                          <div class="book-title">{{ book.title }}</div>
                          <div class="book-subtitle">{{ book.subtitle }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="show-all-container">
                  <a href="#" class="show-all">Показать все →</a>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// Map settings
const mapSettings = {
  apiKey: '4a6931b7-fc60-43b6-b7bc-681046d12701',
  lang: 'ru_RU',
  coordorder: 'latlong',
  enterprise: false,
  version: '2.1'
}

// Book data
const book = ref({
  id: 1,
  title: 'Рассказы о Ломоносове',
  subtitle: 'Для среднего школьного возраста',
  author: 'Нечипоренко Юрий Дмитриевич',
  coverImage: '@/assets/book-cover.jpg',
  type: 'Детская литература',
  publisher: 'Русский',
  year: '2022',
  pages: '72',
  language: 'Русский',
  isbn: '978-5-04-123456-7',
  description:
    'Михаил Васильевич Ломоносов (1711–1765) — первый русский учёный-естествоиспытатель мирового значения, энциклопедист, химик и физик, астроном, приборостроитель, географ, металлург, геолог, поэт, утвердивший основания современного русского литературного языка, художник, историк, поборник развития отечественного просвещения, науки и экономики. Разработал проект Московского университета, впоследствии названного в его честь. Открыл наличие атмосферы у планеты Венера. Действительный член Академии наук и художеств, профессор химии.'
})

// Libraries data
const libraries = ref([
  {
    id: 1,
    name: 'Библиотека №129 на Ташкентской',
    address: 'город Москва, Ташкентская улица, дом 18, корпус 1',
    status: 'Доступно',
    coordinates: [55.7046, 37.8147]
  },
  {
    id: 2,
    name: 'Центральная детская библиотека №104',
    address: 'город Москва, Рязанский проспект, дом 95, корпус 2',
    status: 'Недоступно',
    coordinates: [55.7158, 37.7965]
  },
  {
    id: 3,
    name: 'Библиотека №105',
    address: 'город Москва, улица Ташкентская, дом 18, корпус 1',
    status: 'Доступно',
    coordinates: [55.7046, 37.8147]
  },
  {
    id: 4,
    name: 'Жамбыл атындағы жасөспірімдер кітапханасы',
    address: 'Алматы, Казахстан',
    status: 'Доступно',
    coordinates: [43.268825, 76.944709]
  }
])

// Related books data
const relatedBooks = ref([
  {
    id: 1,
    title: 'Преступление и наказание',
    author: 'Федор Достоевский',
    subtitle: 'Роман',
    coverImage: '@/assets/kitapland/main2.png'
  },
  {
    id: 2,
    title: 'Мастер и Маргарита',
    author: 'Михаил Булгаков',
    subtitle: 'Роман',
    coverImage: '@/assets/kitapland/main2.png'
  },
  {
    id: 3,
    title: 'Анна Каренина',
    author: 'Лев Толстой',
    subtitle: 'Роман',
    coverImage: '@/assets/kitapland/main2.png'
  },
  {
    id: 4,
    title: 'Евгений Онегин',
    author: 'Александр Пушкин',
    subtitle: 'Роман в стихах',
    coverImage: '@/assets/kitapland/main2.png'
  },
  {
    id: 5,
    title: 'Идиот',
    author: 'Федор Достоевский',
    subtitle: 'Роман',
    coverImage: '@/assets/kitapland/main2.png'
  }
])

// Selected library
const selectedLibrary = ref(0)

// Slider functionality for related books
const relatedBooksSlideOffset = ref(0)
const relatedBooksVisibleItems = ref(4)
const relatedBookWidth = ref(220) // Width of each book card including margins

// Mobile view detection
const isMobile = ref(false)

// Dragging functionality
const isDragging = ref(false)
const startX = ref(0)
const startOffset = ref(0)
const currentSlider = ref('')

// For TypeScript
interface Window {
  ymaps?: any
}

const mapContainer = ref(null)
let map = null
let markers = []
const mapLoaded = ref(false)
const mapError = ref(false)

// For the map popup
const showMapPopup = ref(true)

// Computed property for current map center
const currentMapCenter = computed(() => {
  return libraries.value[selectedLibrary.value].coordinates
})

const loadYandexMapScript = () => {
  try {
    // Clear any existing script to avoid conflicts
    const existingScript = document.getElementById('yandex-maps-script')
    if (existingScript) {
      existingScript.remove()
    }

    // Create new script element
    const script = document.createElement('script')
    script.id = 'yandex-maps-script'
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=4a6931b7-fc60-43b6-b7bc-681046d12701&lang=ru_RU`
    script.async = true

    // Set up event handlers
    script.onload = () => {
      console.log('Yandex Maps script loaded')
      // Wait for the next tick to ensure Vue has updated the DOM
      setTimeout(() => {
        if (typeof window.ymaps !== 'undefined') {
          window.ymaps.ready(initMap)
        } else {
          console.error('ymaps not defined after script load')
          mapError.value = true
        }
      }, 500)
    }

    script.onerror = (e) => {
      console.error('Error loading Yandex Maps script:', e)
      mapError.value = true
    }

    // Add script to document
    document.head.appendChild(script)
  } catch (error) {
    console.error('Error in loadYandexMapScript:', error)
    mapError.value = true
  }
}

const initMap = () => {
  try {
    console.log('Initializing map')
    const mapElement = document.getElementById('yandex-map')

    if (!mapElement) {
      console.error('Map element not found')
      mapError.value = true
      return
    }

    // Create the map
    map = new window.ymaps.Map('yandex-map', {
      center: libraries.value[selectedLibrary.value].coordinates,
      zoom: 14,
      controls: ['zoomControl', 'fullscreenControl']
    })

    // Add markers for each library
    markers = []
    libraries.value.forEach((library, index) => {
      try {
        const marker = new window.ymaps.Placemark(
          library.coordinates,
          {
            hintContent: library.name,
            balloonContent: `
              <div><strong>${library.name}</strong></div>
              <div>${library.address}</div>
              <div>Статус: ${library.status}</div>
            `
          },
          {
            preset:
              index === selectedLibrary.value ? 'islands#blueBookIcon' : 'islands#grayBookIcon',
            iconColor: library.status === 'Доступно' ? '#4caf50' : '#f44336'
          }
        )

        map.geoObjects.add(marker)
        markers.push(marker)
      } catch (markerError) {
        console.error('Error creating marker:', markerError)
      }
    })

    mapLoaded.value = true
    console.log('Map initialized successfully')
  } catch (error) {
    console.error('Error initializing map:', error)
    mapError.value = true
  }
}

const selectLibrary = (index) => {
  selectedLibrary.value = index
  showMapPopup.value = true // Show popup when library is selected

  if (map && mapLoaded.value) {
    map.setCenter(libraries.value[index].coordinates, 14, {
      duration: 300
    })

    markers.forEach((marker, i) => {
      marker.options.set('preset', i === index ? 'islands#blueBookIcon' : 'islands#grayBookIcon')
    })
  }
}

// Check if device is mobile
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
  relatedBooksVisibleItems.value = isMobile.value ? 1 : 4
}

// Calculate maximum offset for slider
const calculateMaxOffset = (slider: string, itemsCount: number) => {
  const visibleItems = slider === 'relatedBooks' ? relatedBooksVisibleItems.value : 4
  return Math.max(0, itemsCount - visibleItems)
}

// Go to specific slide
const goToSlide = (slider: string, index: number) => {
  if (slider === 'relatedBooks') {
    relatedBooksSlideOffset.value = index
  }
}

// Slide to next item
const slideNext = (slider: string) => {
  if (slider === 'relatedBooks') {
    relatedBooksSlideOffset.value = Math.min(
      relatedBooksSlideOffset.value + 1,
      calculateMaxOffset('relatedBooks', relatedBooks.value.length)
    )
  }
}

// Slide to previous item
const slidePrev = (slider: string) => {
  if (slider === 'relatedBooks') {
    relatedBooksSlideOffset.value = Math.max(relatedBooksSlideOffset.value - 1, 0)
  }
}

// Check if slide is active
const isActiveSlide = (index: number, slider: string) => {
  if (slider === 'relatedBooks') {
    return (
      index >= relatedBooksSlideOffset.value &&
      index < relatedBooksSlideOffset.value + relatedBooksVisibleItems.value
    )
  }
  return false
}

// Start drag
const startDrag = (event: MouseEvent | TouchEvent, slider: string) => {
  isDragging.value = true
  currentSlider.value = slider

  const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX
  startX.value = clientX

  if (slider === 'relatedBooks') {
    startOffset.value = relatedBooksSlideOffset.value
  }

  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('touchmove', handleDrag)
  document.addEventListener('mouseup', endDrag)
  document.addEventListener('touchend', endDrag)
}

// Handle drag
const handleDrag = (event: MouseEvent | TouchEvent) => {
  if (!isDragging.value) return

  const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX
  const diff =
    (startX.value - clientX) /
    (currentSlider.value === 'relatedBooks' ? relatedBookWidth.value : 220)

  if (currentSlider.value === 'relatedBooks') {
    const newOffset = startOffset.value + diff
    relatedBooksSlideOffset.value = Math.max(
      0,
      Math.min(newOffset, calculateMaxOffset('relatedBooks', relatedBooks.value.length))
    )
  }
}

// End drag
const endDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('touchmove', handleDrag)
  document.removeEventListener('mouseup', endDrag)
  document.removeEventListener('touchend', endDrag)

  // Snap to nearest slide
  if (currentSlider.value === 'relatedBooks') {
    relatedBooksSlideOffset.value = Math.round(relatedBooksSlideOffset.value)
  }
}

// Navigation function
const navigateToBookDetail = (bookId: number) => {
  router.push({ name: 'book-detail', params: { id: bookId } })
}

// Setup and cleanup
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)

  // Load the map after a short delay to ensure DOM is ready
  setTimeout(loadYandexMapScript, 1000)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  if (map) {
    try {
      map.destroy()
    } catch (error) {
      console.error('Error destroying map:', error)
    }
  }
})
</script>

<style scoped>
.book-detail-page {
  background-color: #f5f5f5;
  padding-top: 24px;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

/* Search Card Styles */
.search-section {
  margin-bottom: 24px;
}

.search-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-card-content {
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 16px;
}

@media (min-width: 768px) {
  .search-card-content {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.search-input-container {
  display: flex;
  flex: 1;
  gap: 8px;
}

.search-input {
  flex: 1;
}

.search-btn {
  height: 40px;
  text-transform: none;
  font-weight: 500;
  color: white;
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.action-btn {
  text-transform: none;
  font-weight: 400;
  color: #333;
}

/* Book Title Heading */
.book-title-heading {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
}

/* Book Content */
.book-content {
  display: flex;
  flex-direction: column;
  margin-bottom: 32px;
}

@media (min-width: 768px) {
  .book-content {
    flex-direction: row;
  }
}

.book-image-container {
  flex: 0 0 auto;
  margin-bottom: 24px;
  text-align: center;
}

@media (min-width: 768px) {
  .book-image-container {
    margin-right: 32px;
    margin-bottom: 0;
    width: 250px;
  }
}

.book-cover-image {
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.book-info {
  flex: 1;
}

.book-meta {
  margin-bottom: 24px;
}

.book-author {
  font-size: 16px;
  color: #666;
  margin-bottom: 8px;
}

.book-title-large {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.book-subtitle {
  font-size: 16px;
  color: #666;
}

.book-details {
  margin-bottom: 24px;
}

.detail-item {
  display: flex;
  margin-bottom: 8px;
}

.detail-label {
  flex: 0 0 150px;
  font-weight: 500;
}

.detail-value {
  flex: 1;
}

.book-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.reserve-btn {
  text-transform: none;
  font-weight: 500;
}

.favorite-btn {
  text-transform: none;
  font-weight: 500;
}

/* Book Description */
.book-description {
  margin-bottom: 32px;
}

.book-description h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.book-description p {
  font-size: 16px;
  line-height: 1.6;
}

/* Library Availability */
.library-availability {
  margin-bottom: 32px;
}

.library-availability h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.library-map-container {
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .library-map-container {
    flex-direction: row;
  }
}

.library-list {
  flex: 1;
  margin-bottom: 24px;
}

@media (min-width: 768px) {
  .library-list {
    margin-right: 24px;
    margin-bottom: 0;
  }
}

.library-item {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.library-item:hover {
  border-color: #61a3b4;
}

.library-item.active {
  border-color: #61a3b4;
  background-color: rgba(97, 163, 180, 0.05);
}

.library-name {
  font-weight: 600;
  margin-bottom: 8px;
}

.library-address {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.library-availability-status {
  font-size: 14px;
  font-weight: 500;
}

.library-availability-status.доступно {
  color: #4caf50;
}

.library-availability-status.недоступно {
  color: #f44336;
}

.map-container {
  flex: 1;
  height: 300px;
  background-color: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.yandex-map-iframe {
  border: none;
  width: 100%;
  height: 100%;
}

/* Map Popup Styles */
.map-popup {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  width: calc(100% - 40px);
  max-width: 320px;
  z-index: 10;
  overflow: hidden;
}

.map-popup-content {
  padding: 0;
}

.map-popup-header {
  background-color: #f5f5f5;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
}

.map-popup-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.map-popup-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  padding: 0;
  margin: 0;
  line-height: 1;
}

.map-popup-body {
  padding: 16px;
}

.map-popup-body p {
  margin: 0 0 8px 0;
  font-size: 14px;
}

.map-popup-body .доступно {
  color: #4caf50;
  font-weight: 500;
}

.map-popup-body .недоступно {
  color: #f44336;
  font-weight: 500;
}

.map-popup-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

/* Related Books */
.related-books h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.related-books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.related-book-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.related-book-card:hover {
  transform: translateY(-5px);
}

.related-book-cover {
  height: 200px;
  overflow: hidden;
}

.related-book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.related-book-info {
  padding: 12px;
}

.related-book-author {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.related-book-title {
  font-size: 14px;
  font-weight: 500;
}

/* Add these styles for the related books section */

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.slider-controls {
  display: flex;
  align-items: center;
}

.slider-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #e0e0e0;
  margin-right: 8px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.slider-dot.active {
  background-color: #ff6b00;
}

.slider-arrows {
  display: flex;
  margin-left: 16px;
}

.slider-arrow-modern {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: white;
  border: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.slider-arrow-modern:hover {
  background-color: #f5f5f5;
  border-color: #ccc;
}

.slider-arrow-modern:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modern-slider-container {
  overflow: hidden;
  position: relative;
}

.modern-slider {
  display: flex;
  transition: transform 0.3s ease;
}

.modern-slide {
  flex: 0 0 260px;
  padding: 0 10px;
  margin-bottom: 16px;
}

.book-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.book-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.book-cover {
  height: 320px;
  overflow: hidden;
  background-color: #f5f6f7;
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-content-column {
  padding: 16px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.book-author {
  font-size: 14px;
  color: #ff6b00;
  margin-bottom: 8px;
  font-weight: 500;
}

.book-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  transition: color 0.3s ease;
  line-height: 1.3;
}

.book-subtitle {
  font-size: 14px;
  color: #666;
  margin-top: auto;
}

.show-all-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.show-all {
  color: #0066cc;
  text-decoration: none;
  font-size: 14px;
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.show-all:hover {
  background-color: #f5f5f5;
  border-color: #0066cc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
