<template>
  <div class="search-results-page">
    <main>
      <!-- Search Card -->
      <section class="search-section">
        <div class="container">
          <v-card class="search-card">
            <div class="search-card-content">
              <div class="search-input-container">
                <v-text-field
                  v-model="searchQuery"
                  placeholder="Введите ваш запрос"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-magnify"
                  hide-details
                  class="search-input"
                  @keyup.enter="performSearch"
                ></v-text-field>
                <v-btn color="#002D96" class="search-btn" @click="performSearch">Найти</v-btn>
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

      <!-- Results Section -->
      <section class="section">
        <div class="container">
          <v-card class="main-card">
            <v-card-text>
              <div class="results-header">
                <h1>Найдено {{ searchResults.length }} вариантов</h1>
                <v-select
                  v-model="sortOption"
                  :items="['Сначала релевантные', 'По популярности', 'По новизне', 'По алфавиту']"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="sort-select"
                ></v-select>
              </div>

              <div class="results-container">
                <!-- Filters Sidebar -->
                <div class="filters-sidebar">
                  <div class="filter-group filter-checkboxes">
                    <v-checkbox
                      v-model="filters.inStock"
                      label="В наличии"
                      hide-details
                      density="compact"
                    ></v-checkbox>
                    <v-checkbox
                      v-model="filters.onlineReservation"
                      label="Онлайн-бронирование"
                      hide-details
                      density="compact"
                    ></v-checkbox>
                  </div>

                  <div class="map-preview" @click="showLibraryMap = true">
                    <img
                      src="@/assets/kitapland/main1.png"
                      alt="Карта библиотек"
                      class="map-image"
                    />
                    <div class="map-overlay">
                      <v-btn variant="text" class="map-btn" prepend-icon="mdi-map-marker">
                        Выбрать библиотеки
                      </v-btn>
                    </div>
                  </div>

                  <div class="filter-group">
                    <h3>Автор</h3>
                    <v-select
                      v-model="filters.author"
                      :items="['Все авторы', 'Абай', 'Федор Достоевский', 'Лев Толстой']"
                      variant="outlined"
                      density="compact"
                      hide-details
                      class="filter-select"
                    ></v-select>
                  </div>

                  <div class="filter-group">
                    <h3>Серия</h3>
                    <v-select
                      v-model="filters.series"
                      :items="['Все серии', 'Классика', 'Современная литература']"
                      variant="outlined"
                      density="compact"
                      hide-details
                      class="filter-select"
                    ></v-select>
                  </div>

                  <div class="filter-group">
                    <h3>Издательство</h3>
                    <v-select
                      v-model="filters.publisher"
                      :items="['Любое', 'Издательство Московского университета', 'Русская книга']"
                      variant="outlined"
                      density="compact"
                      hide-details
                      class="filter-select"
                    ></v-select>
                  </div>

                  <div class="filter-group">
                    <h3>Год издания</h3>
                    <div class="year-range">
                      <v-text-field
                        v-model="filters.yearFrom"
                        variant="outlined"
                        density="compact"
                        hide-details
                        placeholder="От"
                        class="year-input"
                      ></v-text-field>
                      <span class="year-separator">-</span>
                      <v-text-field
                        v-model="filters.yearTo"
                        variant="outlined"
                        density="compact"
                        hide-details
                        placeholder="До"
                        class="year-input"
                      ></v-text-field>
                    </div>
                  </div>

                  <div class="filter-group">
                    <h3>Тип издания</h3>
                    <v-select
                      v-model="filters.type"
                      :items="['Любое', 'Книга', 'Журнал', 'Учебник']"
                      variant="outlined"
                      density="compact"
                      hide-details
                      class="filter-select"
                    ></v-select>
                  </div>

                  <div class="filter-group">
                    <h3>Тематика</h3>
                    <v-select
                      v-model="filters.theme"
                      :items="['Любая', 'Поэзия', 'Проза', 'История']"
                      variant="outlined"
                      density="compact"
                      hide-details
                      class="filter-select"
                    ></v-select>
                  </div>

                  <div class="filter-group">
                    <h3>Язык</h3>
                    <v-select
                      v-model="filters.language"
                      :items="['Любой', 'Русский', 'Казахский', 'Английский']"
                      variant="outlined"
                      density="compact"
                      hide-details
                      class="filter-select"
                    ></v-select>
                  </div>

                  <div class="filter-group">
                    <h3>Возрастное ограничение</h3>
                    <v-select
                      v-model="filters.ageRestriction"
                      :items="['Все', '0+', '6+', '12+', '16+', '18+']"
                      variant="outlined"
                      density="compact"
                      hide-details
                      class="filter-select"
                    ></v-select>
                  </div>
                </div>

                <!-- Search Results -->
                <div class="search-results">
                  <div v-for="(result, index) in searchResults" :key="index" class="result-item">
                    <div class="result-card-inner">
                      <div class="result-image">
                        <BookCover />
                      </div>
                      <div class="result-content">
                        <div class="result-category">{{ result.category }}</div>
                        <h3 class="result-title" @click="reserveBook(result.id)">
                          {{ result.title }}
                        </h3>
                        <div class="result-author">{{ result.author }}</div>
                        <div class="result-publisher">{{ result.publisher }}</div>
                        <div class="result-availability">
                          <v-icon color="#4caf50" size="small" class="availability-icon"
                            >mdi-check-circle</v-icon
                          >
                          В наличии в {{ result.libraryCount }} библиотеках
                        </div>
                        <div class="result-actions">
                          <v-btn
                            color="#61A3B4"
                            class="reserve-btn"
                            @click="reserveBook(result.id)"
                          >
                            Забронировать
                          </v-btn>
                          <v-btn variant="text" icon class="favorite-btn">
                            <v-icon>mdi-heart-outline</v-icon>
                          </v-btn>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="pagination-container">
                    <v-pagination
                      v-model="currentPage"
                      :length="totalPages"
                      :total-visible="7"
                    ></v-pagination>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </section>
    </main>

    <!-- Library Map Dialog -->
    <v-dialog v-model="showLibraryMap" max-width="800">
      <v-card>
        <v-card-title class="map-dialog-title">
          <span>Выберите библиотеки</span>
          <v-btn icon @click="showLibraryMap = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <div class="library-map-container">
            <iframe
              src="https://yandex.ru/map-widget/v1/?um=constructor%3A4a6931b7-fc60-43b6-b7bc-681046d12701&amp;source=constructor"
              width="100%"
              height="400"
              frameborder="0"
            ></iframe>
          </div>
          <div class="library-list-container">
            <div
              v-for="(library, index) in libraries"
              :key="index"
              class="library-item"
              :class="{ selected: selectedLibraries.includes(library.id) }"
              @click="toggleLibrary(library.id)"
            >
              <div class="library-checkbox">
                <v-checkbox
                  v-model="selectedLibraries"
                  :value="library.id"
                  hide-details
                  density="compact"
                ></v-checkbox>
              </div>
              <div class="library-info">
                <div class="library-name">{{ library.name }}</div>
                <div class="library-address">{{ library.address }}</div>
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="#61A3B4" @click="applyLibraryFilter">Применить</v-btn>
          <v-btn variant="text" @click="showLibraryMap = false">Отмена</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BookCover from '@/components/icons/BookCover.vue'

const route = useRoute()
const router = useRouter()

// Search query
const searchQuery = ref('')

// Pagination
const currentPage = ref(1)
const itemsPerPage = 10
const totalPages = computed(() => Math.ceil(searchResults.value.length / itemsPerPage))

// Filters
const filters = ref({
  inStock: true,
  onlineReservation: true,
  author: 'Все авторы',
  series: 'Все серии',
  publisher: 'Любое',
  yearFrom: '',
  yearTo: '',
  type: 'Любое',
  theme: 'Любая',
  language: 'Любой',
  ageRestriction: 'Все'
})

// Sort options with proper format
const sortOption = ref('Сначала релевантные')

// Library map dialog
const showLibraryMap = ref(false)
const selectedLibraries = ref([])

// Libraries data
const libraries = ref([
  {
    id: 1,
    name: 'Библиотека №129 на Ташкентской',
    address: 'город Москва, Ташкентская улица, дом 18, корпус 1',
    coordinates: [55.7046, 37.8147]
  },
  {
    id: 2,
    name: 'Центральная детская библиотека №104',
    address: 'город Москва, Рязанский проспект, дом 95, корпус 2',
    coordinates: [55.7158, 37.7965]
  },
  {
    id: 3,
    name: 'Библиотека №105',
    address: 'город Москва, улица Ташкентская, дом 18, корпус 1',
    coordinates: [55.7046, 37.8147]
  },
  {
    id: 4,
    name: 'Жамбыл атындағы жасөспірімдер кітапханасы',
    address: 'Алматы, Казахстан',
    coordinates: [43.268825, 76.944709]
  }
])

// Toggle library selection
const toggleLibrary = (id) => {
  const index = selectedLibraries.value.indexOf(id)
  if (index === -1) {
    selectedLibraries.value.push(id)
  } else {
    selectedLibraries.value.splice(index, 1)
  }
}

// Apply library filter
const applyLibraryFilter = () => {
  showLibraryMap.value = false
  // In a real app, you would filter results based on selected libraries
}

// Mock search results based on the image
const searchResults = ref([
  {
    id: 1,
    title: 'Стихотворения и поэмы',
    author: 'Абай',
    category: 'Стихотворения и поэмы',
    publisher: 'Советский писатель',
    libraryCount: 12
  },
  {
    id: 2,
    title: 'Стихотворения. Поэмы. Слова назидания',
    author: 'Абай',
    category: 'Стихотворения. Поэмы. Слова назидания',
    publisher: 'Издательство Московского университета',
    libraryCount: 2
  },
  {
    id: 3,
    title: 'Стихи; Слова назидания : пер. с казах.',
    author: 'Абай',
    category: 'Стихи; Слова назидания : пер. с казах.',
    publisher: 'Русская книга',
    libraryCount: 2
  },
  {
    id: 4,
    title: 'Стихи : слова назидания : пер. с каз.',
    author: 'Абай',
    category: 'Стихи : слова назидания : пер. с каз.',
    publisher: 'Русская книга',
    libraryCount: 25
  }
])

// Initialize search query from route
onMounted(() => {
  if (route.query.q) {
    searchQuery.value = route.query.q
    // In a real app, you would fetch results based on the query here
  }
})

// Watch for route changes to update search
watch(
  () => route.query.q,
  (newQuery) => {
    if (newQuery) {
      searchQuery.value = newQuery
      // In a real app, you would fetch results based on the query here
    }
  }
)

// Perform search
const performSearch = () => {
  router.push({
    name: 'search-results',
    query: { q: searchQuery.value }
  })
  // In a real app, you would fetch results from an API here
}

// Reserve book
const reserveBook = (bookId) => {
  router.push({ name: 'book-detail', params: { id: bookId } })
}
</script>

<style scoped>
.search-results-page {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 40px;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

/* Search Card Styles */
.search-section {
  padding: 24px 0;
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

/* Main Card */
.section {
  padding: 0 0 24px 0;
}

.main-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Results Header */
.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.results-header h1 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.sort-select {
  width: 160px;
  max-width: 260px;
}

/* Results Container */
.results-container {
  display: flex;
  gap: 24px;
}

/* Filters Sidebar */
.filters-sidebar {
  width: 280px;
  flex-shrink: 0;
}

.filter-group {
  margin-bottom: 24px;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.filter-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.filter-select {
  width: 100%;
}

.year-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.year-input {
  flex: 1;
}

.year-separator {
  color: #666;
}

/* Map Preview */
.map-preview {
  position: relative;
  height: 160px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 24px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.map-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.map-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-btn {
  color: white;
  font-weight: 500;
}

/* Search Results */
.search-results {
  flex: 1;
}

.result-item {
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  background-color: white;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.result-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.result-card-inner {
  display: flex;
  background: white;
}

.result-image {
  width: 120px;
  height: 160px;
  flex-shrink: 0;
  background: #f5f6f7;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.result-content {
  padding: 16px;
  flex: 1;
}

.result-category {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.result-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  cursor: pointer;
  transition: color 0.2s ease;
}

.result-title:hover {
  color: #61a3b4;
}

.result-author {
  font-size: 14px;
  color: #ff6b00;
  margin-bottom: 4px;
  font-weight: 500;
}

.result-publisher {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.result-availability {
  font-size: 14px;
  color: #4caf50;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.availability-icon {
  margin-right: 4px;
}

.result-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reserve-btn {
  text-transform: none;
  font-weight: 500;
  color: white;
}

.favorite-btn {
  color: #666;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

/* Library Map Dialog */
.map-dialog-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}

.library-list-container {
  margin-top: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.library-item {
  display: flex;
  padding: 12px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.library-item:hover {
  background-color: #f5f5f5;
}

.library-item.selected {
  background-color: rgba(97, 163, 180, 0.1);
}

.library-checkbox {
  margin-right: 8px;
}

.library-info {
  flex: 1;
}

.library-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.library-address {
  font-size: 14px;
  color: #666;
}

/* Responsive Adjustments */
@media (max-width: 992px) {
  .results-container {
    flex-direction: column;
  }

  .filters-sidebar {
    width: 100%;
    order: 2;
  }

  .search-results {
    order: 1;
  }
}

@media (max-width: 768px) {
  .result-card-inner {
    flex-direction: column;
  }

  .result-image {
    width: 100%;
    height: 200px;
  }
}

/* Add this to ensure select menus are visible */
.v-menu__content {
  z-index: 1000 !important;
}
</style>
