<template>
  <div class="app">
    <main>
      <!-- Hero Section -->
      <section class="hero">
        <div class="container">
          <img src="@/assets/banner.png" alt="Travel illustration" />
        </div>
      </section>

      <!-- Search Section - Desktop -->
      <section class="search-section" v-if="!isMobileView">
        <div class="container">
          <v-card class="search-card">
            <v-card-text>
              <div class="search-form">
                <v-text-field
                  v-model="searchQuery"
                  variant="outlined"
                  placeholder="Введите ваш запрос"
                  density="compact"
                  hide-details
                  prepend-inner-icon="mdi-magnify"
                  class="search-input"
                  @keyup.enter="performSearch"
                ></v-text-field>

                <v-select
                  v-model="selectedCategory"
                  variant="outlined"
                  :items="categories"
                  placeholder="Категория"
                  density="compact"
                  hide-details
                  class="category-input"
                ></v-select>

                <v-btn color="#61A3B4" class="search-btn" @click="performSearch"> Найти </v-btn>

                <v-btn variant="outlined" class="action-btn" prepend-icon="mdi-heart-outline">
                  Избранное
                </v-btn>

                <v-btn variant="outlined" class="action-btn" prepend-icon="mdi-account">
                  Кабинет читателя
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </section>

      <!-- Search Section - Mobile -->
      <section class="search-section-mobile" v-if="isMobileView">
        <div class="container">
          <v-card class="search-card-mobile">
            <v-card-text>
              <div class="search-form-mobile">
                <div class="search-row">
                  <v-text-field
                    v-model="searchQuery"
                    variant="outlined"
                    placeholder="Введите ваш запрос"
                    density="compact"
                    hide-details
                    prepend-inner-icon="mdi-magnify"
                    class="search-input-mobile"
                    @keyup.enter="performSearch"
                  ></v-text-field>
                  <v-btn color="#61A3B4" class="search-btn-mobile" @click="performSearch">
                    Найти
                  </v-btn>
                </div>

                <div class="filter-row">
                  <v-select
                    v-model="selectedCategory"
                    variant="outlined"
                    :items="categories"
                    placeholder="Категория"
                    density="compact"
                    hide-details
                    class="category-input-mobile"
                  ></v-select>
                </div>

                <div class="actions-row">
                  <v-btn
                    variant="outlined"
                    class="action-btn-mobile"
                    prepend-icon="mdi-heart-outline"
                  >
                    Избранное
                  </v-btn>
                  <v-btn variant="outlined" class="action-btn-mobile" prepend-icon="mdi-account">
                    Кабинет читателя
                  </v-btn>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </section>

      <!-- Events Section with Modern Slider -->
      <section class="section">
        <div class="container">
          <v-card class="section-card">
            <v-card-text>
              <div class="section-header">
                <h2>События в библиотеках</h2>
                <div class="slider-controls">
                  <button
                    class="slider-dot"
                    v-for="i in Math.ceil(events.length / eventsVisibleItems)"
                    :key="i"
                    :class="{ active: Math.floor(eventsSlideOffset) === i - 1 }"
                    @click="goToSlide('events', i - 1)"
                  ></button>
                  <div class="slider-arrows">
                    <button
                      class="slider-arrow-modern"
                      @click="slidePrev('events')"
                      :disabled="eventsSlideOffset === 0"
                    >
                      <v-icon>mdi-chevron-left</v-icon>
                    </button>
                    <button
                      class="slider-arrow-modern"
                      @click="slideNext('events')"
                      :disabled="eventsSlideOffset >= calculateMaxOffset('events', events.length)"
                    >
                      <v-icon>mdi-chevron-right</v-icon>
                    </button>
                  </div>
                </div>
              </div>

              <div class="modern-slider-container">
                <div
                  class="modern-slider"
                  :style="{ transform: `translateX(-${eventsSlideOffset * eventWidth}px)` }"
                  @mousedown="startDrag($event, 'events')"
                  @touchstart="startDrag($event, 'events')"
                >
                  <div
                    class="modern-slide"
                    v-for="event in events"
                    :key="event.id"
                    :class="{ 'active-slide': isActiveSlide(event.id, 'events') }"
                  >
                    <div class="event-card">
                      <div class="event-image">
                        <img src="@/assets/kitapland/main1.png" :alt="event.title" />
                        <span class="event-badge">{{ event.badge }}</span>
                      </div>
                      <div class="event-content">
                        <span class="event-type">{{ event.type }}</span>
                        <h3>{{ event.title }}</h3>
                        <p class="event-time">{{ event.time }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="show-all-container">
                <a href="#" class="show-all">Показать все →</a>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </section>

      <!-- Books Section -->
      <section class="section">
        <div class="container">
          <v-card class="section-card">
            <v-card-text>
              <div class="section-header">
                <h2>Интересная / Классика и не только</h2>
                <div class="slider-controls">
                  <button
                    class="slider-dot"
                    v-for="i in Math.ceil(books.length / booksVisibleItems)"
                    :key="i"
                    :class="{ active: Math.floor(booksSlideOffset) === i - 1 }"
                    @click="goToSlide('books', i - 1)"
                  ></button>
                  <div class="slider-arrows">
                    <button
                      class="slider-arrow-modern"
                      @click="slidePrev('books')"
                      :disabled="booksSlideOffset === 0"
                    >
                      <v-icon>mdi-chevron-left</v-icon>
                    </button>
                    <button
                      class="slider-arrow-modern"
                      @click="slideNext('books')"
                      :disabled="booksSlideOffset >= calculateMaxOffset('books', books.length)"
                    >
                      <v-icon>mdi-chevron-right</v-icon>
                    </button>
                  </div>
                </div>
              </div>

              <div class="modern-slider-container">
                <div
                  class="modern-slider"
                  :style="{ transform: `translateX(-${booksSlideOffset * bookWidth}px)` }"
                  @mousedown="startDrag($event, 'books')"
                  @touchstart="startDrag($event, 'books')"
                >
                  <div
                    class="modern-slide"
                    v-for="book in books"
                    :key="book.id"
                    :class="{ 'active-slide': isActiveSlide(book.id, 'books') }"
                    @click="navigateToBookDetail(book.id || 1)"
                  >
                    <div class="book-card">
                      <div class="book-cover">
                        <BookCover />
                      </div>
                      <div class="book-content">
                        <div class="book-author">{{ book.author }}</div>
                        <h3 class="book-title">{{ book.title }}</h3>
                        <div class="book-subtitle">{{ book.subtitle }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="show-all-container">
                <a href="#" class="show-all">Показать все →</a>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </section>

      <!-- Books Section -->
      <section class="section">
        <div class="container">
          <v-card class="section-card">
            <v-card-text>
              <div class="section-header">
                <h2>Новые поступление</h2>
                <div class="slider-controls">
                  <button
                    class="slider-dot"
                    v-for="i in Math.ceil(books.length / booksVisibleItems)"
                    :key="i"
                    :class="{ active: Math.floor(booksSlideOffset) === i - 1 }"
                    @click="goToSlide('books', i - 1)"
                  ></button>
                  <div class="slider-arrows">
                    <button
                      class="slider-arrow-modern"
                      @click="slidePrev('books')"
                      :disabled="booksSlideOffset === 0"
                    >
                      <v-icon>mdi-chevron-left</v-icon>
                    </button>
                    <button
                      class="slider-arrow-modern"
                      @click="slideNext('books')"
                      :disabled="booksSlideOffset >= calculateMaxOffset('books', books.length)"
                    >
                      <v-icon>mdi-chevron-right</v-icon>
                    </button>
                  </div>
                </div>
              </div>

              <div class="modern-slider-container">
                <div
                  class="modern-slider"
                  :style="{ transform: `translateX(-${booksSlideOffset * bookWidth}px)` }"
                  @mousedown="startDrag($event, 'books')"
                  @touchstart="startDrag($event, 'books')"
                >
                  <div
                    class="modern-slide"
                    v-for="book in books"
                    :key="book.id"
                    :class="{ 'active-slide': isActiveSlide(book.id, 'books') }"
                    @click="navigateToBookDetail(book.id || 1)"
                  >
                    <div class="book-card">
                      <div class="book-cover">
                        <BookCover />
                      </div>
                      <div class="book-content">
                        <div class="book-author">{{ book.author }}</div>
                        <h3 class="book-title">{{ book.title }}</h3>
                        <div class="book-subtitle">{{ book.subtitle }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="show-all-container">
                <a href="#" class="show-all">Показать все →</a>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </section>

      <!-- Literature Section -->
      <section class="section">
        <div class="container">
          <v-card class="section-card">
            <v-card-text>
              <div class="section-header">
                <h2>Литература по категориям</h2>
                <div class="slider-controls">
                  <a href="#" class="show-all">Показать все →</a>
                </div>
              </div>
              <div class="literature-categories-grid">
                <div
                  class="literature-category-card"
                  v-for="(category, index) in literatureCategories"
                  :key="index"
                >
                  <div class="category-image" :style="{ backgroundColor: category.color }">
                    <img src="@/assets/kitapland/main2.png" :alt="category.title" />
                  </div>
                  <div class="category-content">
                    <h3>{{ category.title }}</h3>
                    <p>{{ category.count }} книг</p>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </section>

      <!-- Educational Section -->
      <section class="section">
        <div class="container">
          <v-card class="section-card">
            <v-card-text>
              <div class="section-header">
                <h2>Подборки на любой вкус</h2>
                <div class="slider-controls">
                  <a href="#" class="show-all">Показать все →</a>
                </div>
              </div>
              <div class="collections-grid">
                <div
                  class="collection-card"
                  v-for="(collection, index) in bookCollections"
                  :key="index"
                >
                  <div class="collection-image" :style="{ backgroundColor: collection.color }">
                    <img src="@/assets/kitapland/main3.png" :alt="collection.title" />
                    <span class="collection-count">{{ collection.count }} подборок</span>
                  </div>
                  <div class="collection-content">
                    <h3>{{ collection.title }}</h3>
                    <p>{{ collection.description }}</p>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </section>

      <!-- Library Benefits Section -->
      <section class="section">
        <div class="container">
          <v-card class="section-card">
            <v-card-text>
              <h2 class="section-title">Книги в библиотеках Казахстана</h2>
              <div class="library-benefits-grid">
                <div class="library-benefit-item">
                  <div class="benefit-icon">
                    <img src="@/assets/nobooks.png" alt="Книги" />
                  </div>
                  <div class="benefit-content">
                    <h3>Все библиотечные книги — в одном сервисе</h3>
                    <p>
                      "Библиотеки Москвы" - это онлайн-витрина, где собраны все книги городских
                      библиотек. Найдите нужный экземпляр, закажите и заберите в течение трёх дней.
                      Всё просто.
                    </p>
                  </div>
                </div>

                <div class="library-benefit-item">
                  <div class="benefit-icon">
                    <img src="@/assets/nobooks.png" alt="Читательский билет" />
                  </div>
                  <div class="benefit-content">
                    <h3>Единый читательский билет</h3>
                    <p>
                      Теперь не нужно получать и хранить пластиковые читательские билеты библиотек.
                      Просто оформите его онлайн, и в личном кабинете появится единый читательский
                      билет со штрихкодом.
                    </p>
                  </div>
                </div>

                <div class="library-benefit-item">
                  <div class="benefit-icon">
                    <img src="@/assets/nobooks.png" alt="Личный кабинет" />
                  </div>
                  <div class="benefit-content">
                    <h3>Информация о ваших книгах — в личном кабинете</h3>
                    <p>
                      Личный кабинет - это онлайн-полка для заказов, где можно хранить до 15 книг.
                      Здесь собраны ваши книги из разных библиотек города. В личном кабинете вы
                      можете увидеть информацию о месте, где можно забрать книгу, сколько дней она
                      будет находиться в пункте выдачи, и куда её вернуть после прочтения.
                    </p>
                  </div>
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
import { useRouter } from 'vue-router'
import BookCover from '@/components/icons/BookCover.vue'

// Add router
const router = useRouter()

// Search functionality
const searchQuery = ref('')
const selectedCategory = ref(null)

const performSearch = () => {
  router.push({
    name: 'search-results',
    query: {
      q: searchQuery.value,
      category: selectedCategory.value
    }
  })
}

// Mobile view detection
const windowWidth = ref(window.innerWidth)
const isMobileView = computed(() => windowWidth.value <= 768)

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth
}

// Slider controls
const toursSlideOffset = ref(0)
const newOffersSlideOffset = ref(0)
const itemWidth = ref(216) // card width (200px) + gap (16px)
const visibleItems = ref(4) // number of items visible at once
const eventsSlideOffset = ref(0)
const eventWidth = ref(316) // card width (300px) + gap (16px)
const eventsVisibleItems = ref(3) // Show 3 items at once for events
const booksSlideOffset = ref(0)
const bookWidth = ref(200) // Width of each book card + gap
const booksVisibleItems = ref(5) // Show 5 books at once

// Add these new variables and functions
const dragStartX = ref(0)
const isDragging = ref(false)
const currentSlider = ref('')
const autoplayInterval = ref(null)

// Data
const categories = [
  'Все категории',
  'Художественная литература',
  'Научная литература',
  'Детская литература',
  'Учебная литература'
]

const navItems = ['Новости', 'Туризм в Казахстане', 'Билеты на транспорт', 'Прочее']

const literatureCategories = [
  { id: 1, color: '#E8EAF6', title: 'Классика', count: 11, image: '@/assets/nobooks.png' },
  { id: 2, color: '#FFF3E0', title: 'Классика', count: 14, image: '@/assets/nobooks.png' },
  { id: 3, color: '#E3F2FD', title: 'Text', count: 17, image: '@/assets/nobooks.png' },
  { id: 4, color: '#E8F5E9', title: 'Text', count: 13, image: '@/assets/nobooks.png' },
  { id: 5, color: '#FFF8E1', title: 'Text', count: 11, image: '@/assets/nobooks.png' },
  { id: 6, color: '#F3E5F5', title: 'Text', count: 24, image: '@/assets/nobooks.png' }
]

const publicationItems = [
  { color: '#FFF3E0', title: 'Традиционная культура' },
  { color: '#F3E5F5', title: 'Исторические места' },
  { color: '#E3F2FD', title: 'Природные парки' },
  { color: '#E8F5E9', title: 'Экологический туризм' },
  { color: '#FFFDE7', title: 'Национальная кухня' }
]

const benefits = [
  {
    title: 'Богатое культурное наследие',
    description:
      'Казахстан имеет богатую историю и культуру, которая отражается в архитектуре, музыке, кухне и традициях. Посетители могут познакомиться с уникальным наследием кочевых народов.'
  },
  {
    title: 'Разнообразные ландшафты',
    description:
      'От величественных гор до бескрайних степей и пустынь - природа Казахстана поражает своим разнообразием и красотой. Здесь каждый найдет что-то по душе.'
  },
  {
    title: 'Гостеприимство и комфорт',
    description:
      'Казахстан славится своим гостеприимством. Современная инфраструктура и высокий уровень сервиса обеспечивают комфортное пребывание для всех туристов.'
  }
]

const appStores = ['App Store', 'Google Play', 'App Gallery', 'RuStore']

// Add events data
const events = [
  {
    id: 1,
    type: 'Концерт',
    title: '«Он сказал: "Поехали!"»',
    time: 'Сегодня, 17:00',
    badge: 'Бесплатно'
  },
  {
    id: 2,
    type: 'Концерт',
    title: '«Он сказал: "Поехали!"»',
    time: 'Завтра, 12:00',
    badge: 'Бесплатно'
  },
  {
    id: 3,
    type: 'Лекция',
    title: 'Искусство',
    time: 'Завтра, 12:00',
    badge: 'Бесплатно'
  },
  {
    id: 4,
    type: 'Концерт',
    title: '«Он сказал: "Поехали!"»',
    time: 'Сегодня, 17:00',
    badge: 'Бесплатно'
  },
  {
    id: 5,
    type: 'Лекция',
    title: 'Искусство',
    time: 'Завтра, 12:00',
    badge: 'Бесплатно'
  }
]

// Add books data
const books = [
  {
    id: 1,
    author: 'Попова Татьяна',
    title: 'По Москве',
    subtitle: 'с Московской',
    age: '6'
  },
  {
    id: 2,
    author: 'Шалашов Евгений Васильевич',
    title: 'Эдгар',
    subtitle: 'По в России: роман',
    age: '12'
  },
  {
    id: 3,
    author: 'Захарова Оксана Юрьевна',
    title: 'История балов',
    subtitle: 'императорской России',
    age: '16'
  },
  {
    id: 4,
    author: 'Нечипоренко Юрий Дмитриевич',
    title: 'Рассказы',
    subtitle: 'о Ломоносове',
    age: '6'
  },
  {
    id: 5,
    author: 'Жебрак Михаил Юрьевич',
    title: 'Подмосковье',
    subtitle: 'с Михаилом Жебраком',
    age: '12'
  },
  {
    id: 6,
    author: 'Рой Олег Юрьевич',
    title: 'Азбука Арктики',
    subtitle: 'и Дальнего Востока',
    age: '6'
  }
]

const bookCollections = [
  {
    color: '#FFF3E0',
    title: 'Тематические подборки',
    count: 47,
    description: 'Интересная Россия / О России и не только, Защитники Отечества...',
    image: '@/assets/nobooks.png'
  },
  {
    color: '#FFEBEE',
    title: 'Литература для внеклассного чтения',
    count: 9,
    description: '6 класс, 7 класс, 8 класс',
    image: '@/assets/nobooks.png'
  },
  {
    color: '#E0F7FA',
    title: 'Нехудожественная литература',
    count: 8,
    description: 'Публицистика, Философия, Путешествия',
    image: '@/assets/nobooks.png'
  },
  {
    color: '#E8EAF6',
    title: 'Зарубежные классики',
    count: 12,
    description: 'Произведения Томаса Манна, Произведения Германа Гессе,...',
    image: '@/assets/nobooks.png'
  },
  {
    color: '#FFF8E1',
    title: 'Авторы русской классики',
    count: 12,
    description: 'Книги Валентина Пикуля, Книги братьев Стругацких, Книги Владимира Набокова',
    image: '@/assets/nobooks.png'
  }
]

// Calculate total slides needed
const calculateMaxOffset = (
  slider: 'tours' | 'offers' | 'events' | 'books',
  totalItems: number
) => {
  if (slider === 'events') {
    return Math.max(0, totalItems - eventsVisibleItems.value)
  } else if (slider === 'books') {
    return Math.max(0, totalItems - booksVisibleItems.value)
  } else {
    return Math.max(0, totalItems - visibleItems.value)
  }
}

// Slider navigation methods
const slideNext = (slider: 'tours' | 'offers' | 'events' | 'books') => {
  if (slider === 'events') {
    eventsSlideOffset.value = Math.min(
      eventsSlideOffset.value + 1,
      calculateMaxOffset('events', events.length)
    )
  } else if (slider === 'tours') {
    toursSlideOffset.value = Math.min(toursSlideOffset.value + 1, calculateMaxOffset('tours', 6))
  } else if (slider === 'offers') {
    newOffersSlideOffset.value = Math.min(
      newOffersSlideOffset.value + 1,
      calculateMaxOffset('offers', 6)
    )
  } else {
    booksSlideOffset.value = Math.min(
      booksSlideOffset.value + 1,
      calculateMaxOffset('books', books.length)
    )
  }
}

const slidePrev = (slider: 'tours' | 'offers' | 'events' | 'books') => {
  if (slider === 'events') {
    eventsSlideOffset.value = Math.max(0, eventsSlideOffset.value - 1)
  } else if (slider === 'tours') {
    toursSlideOffset.value = Math.max(0, toursSlideOffset.value - 1)
  } else if (slider === 'offers') {
    newOffersSlideOffset.value = Math.max(0, newOffersSlideOffset.value - 1)
  } else {
    booksSlideOffset.value = Math.max(0, booksSlideOffset.value - 1)
  }
}

// Update visible items based on screen width
const updateVisibleItems = () => {
  if (window.innerWidth <= 480) {
    visibleItems.value = 1
  } else if (window.innerWidth <= 768) {
    visibleItems.value = 2
  } else {
    visibleItems.value = 4
  }
}

// Function to handle drag start
const startDrag = (e, slider) => {
  isDragging.value = true
  currentSlider.value = slider
  dragStartX.value = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX

  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('touchmove', handleDrag)
  document.addEventListener('mouseup', endDrag)
  document.addEventListener('touchend', endDrag)
}

// Function to handle drag
const handleDrag = (e) => {
  if (!isDragging.value) return

  const currentX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX
  const diff = dragStartX.value - currentX

  if (Math.abs(diff) > 50) {
    if (diff > 0) {
      slideNext(currentSlider.value)
    } else {
      slidePrev(currentSlider.value)
    }
    endDrag()
  }
}

// Function to end drag
const endDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('touchmove', handleDrag)
  document.removeEventListener('mouseup', endDrag)
  document.removeEventListener('touchend', endDrag)
}

// Function to go to a specific slide
const goToSlide = (slider, index) => {
  if (slider === 'events') {
    eventsSlideOffset.value = index
  } else if (slider === 'tours') {
    toursSlideOffset.value = index
  } else if (slider === 'offers') {
    newOffersSlideOffset.value = index
  } else {
    booksSlideOffset.value = index
  }
}

// Function to check if a slide is active
const isActiveSlide = (id, slider) => {
  if (slider === 'events') {
    const visibleStart = eventsSlideOffset.value
    const visibleEnd = visibleStart + eventsVisibleItems.value - 1
    const index = events.findIndex((event) => event.id === id)
    return index >= visibleStart && index <= visibleEnd
  } else if (slider === 'books') {
    const visibleStart = booksSlideOffset.value
    const visibleEnd = visibleStart + booksVisibleItems.value - 1
    const index = books.findIndex((book) => book.id === id)
    return index >= visibleStart && index <= visibleEnd
  } else if (slider === 'tours') {
    const visibleStart = toursSlideOffset.value
    const visibleEnd = visibleStart + visibleItems.value - 1
    return id - 1 >= visibleStart && id - 1 <= visibleEnd
  } else if (slider === 'offers') {
    const visibleStart = newOffersSlideOffset.value
    const visibleEnd = visibleStart + visibleItems.value - 1
    return id - 1 >= visibleStart && id - 1 <= visibleEnd
  }
  return false
}

// Start autoplay
const startAutoplay = () => {
  autoplayInterval.value = setInterval(() => {
    // Events slider
    if (eventsSlideOffset.value >= calculateMaxOffset('events', events.length)) {
      eventsSlideOffset.value = 0
    } else {
      slideNext('events')
    }

    // Tours slider (less frequent)
    if (Math.random() > 0.7) {
      if (toursSlideOffset.value >= calculateMaxOffset('tours', 6)) {
        toursSlideOffset.value = 0
      } else {
        slideNext('tours')
      }
    }

    // Offers slider (less frequent)
    if (Math.random() > 0.7) {
      if (newOffersSlideOffset.value >= calculateMaxOffset('offers', 6)) {
        newOffersSlideOffset.value = 0
      } else {
        slideNext('offers')
      }
    }
  }, 5000)
}

// Navigation function
const navigateToBookDetail = (bookId: number) => {
  router.push({ name: 'book-detail', params: { id: bookId } })
}

// Setup and cleanup
onMounted(() => {
  updateVisibleItems()
  window.addEventListener('resize', updateVisibleItems)
  window.addEventListener('resize', updateWindowWidth)
  startAutoplay()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateVisibleItems)
  window.removeEventListener('resize', updateWindowWidth)
  if (autoplayInterval.value) {
    clearInterval(autoplayInterval.value)
  }
})
</script>

<style scoped>
/* Base Styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 15px;
}

img {
  max-width: 100%;
}

a {
  text-decoration: none;
  color: #008080;
}

button {
  cursor: pointer;
}

/* Hero Section */
.hero {
  padding: 32px 0;
  color: white;
}

.hero-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.hero-text {
  flex: 1;
  min-width: 300px;
}

.hero-text h1 {
  font-size: 28px;
  margin-bottom: 8px;
}

.hero-text p {
  font-size: 18px;
}

.hero-image {
  flex: 1;
  text-align: right;
  min-width: 300px;
}

/* Search Section - Desktop */
.search-section {
  margin-top: -24px;
  margin-bottom: 24px;
}

.search-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

.search-form {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-input {
  width: 400px;
}

.category-input {
  width: 200px;
}

.action-btn {
  height: 40px;
  border: 1px solid #e0e0e0 !important;
  text-transform: none;
  letter-spacing: normal;
  font-weight: normal;
}

.search-btn {
  text-transform: none;
}

/* Search Section - Mobile */
.search-section-mobile {
  margin-top: -24px;
  margin-bottom: 24px;
}

.search-card-mobile {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

.search-form-mobile {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-row {
  display: flex;
  gap: 8px;
}

.search-input-mobile {
  flex-grow: 1;
}

.search-btn-mobile {
  text-transform: none;
  height: 40px;
}

.filter-row {
  width: 100%;
}

.category-input-mobile {
  width: 100%;
}

.actions-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn-mobile {
  flex: 1;
  min-width: 140px;
  height: 40px;
  border: 1px solid #e0e0e0 !important;
  text-transform: none;
  letter-spacing: normal;
  font-weight: normal;
  font-size: 12px;
}

:deep(.v-field) {
  border-radius: 4px !important;
}

/* Section Card Styles */
.section-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  margin-bottom: 24px;
}

.section {
  padding: 16px 0;
  border-bottom: none;
}

/* Adjust spacing in v-card-text */
:deep(.v-card-text) {
  padding: 24px;
}

/* Remove box-shadow from inner cards */
.destination-card,
.tour-card,
.literature-card,
.publication-card {
  box-shadow: none;
}

/* Section Styles */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 20px;
  font-weight: 600;
}

.slider-header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.show-all {
  color: #0066cc;
  text-decoration: none;
  font-size: 14px;
  white-space: nowrap;
}

.show-all:hover {
  text-decoration: underline;
}

/* Events Grid */
.modern-slider-container {
  position: relative;
  overflow: hidden;
  margin: 0 -16px;
  padding: 16px;
}

.modern-slider {
  display: flex;
  gap: 16px;
  transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
  will-change: transform;
  cursor: grab;
}

.modern-slider:active {
  cursor: grabbing;
}

.modern-slide {
  flex: 0 0 300px;
  transition: all 0.3s ease;
  transform-origin: center center;
}

.active-slide {
  transform: scale(1.02);
  z-index: 2;
}

.event-card {
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  height: 100%;
}

.event-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  transform: translateY(-5px);
}

.event-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.event-card:hover .event-image img {
  transform: scale(1.05);
}

.event-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  background: #ff6b00;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 10px rgba(255, 107, 0, 0.3);
}

.event-content {
  padding: 20px;
}

.event-type {
  color: #ff6b00;
  font-size: 14px;
  font-weight: 500;
  display: block;
  margin-bottom: 8px;
}

.event-content h3 {
  font-size: 18px;
  margin-bottom: 12px;
  font-weight: 600;
  transition: color 0.3s ease;
}

.event-card:hover .event-content h3 {
  color: #ff6b00;
}

.event-time {
  color: #666;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.event-time::before {
  content: '';
  display: inline-block;
  width: 14px;
  height: 14px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23666' d='M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z'/%3E%3C/svg%3E");
  background-size: contain;
  margin-right: 6px;
}

/* Slider Controls */
.slider-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.slider-dots {
  display: flex;
  gap: 8px;
}

.slider-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #e0e0e0;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.slider-dot.active {
  background-color: #ff6b00;
  transform: scale(1.2);
}

.slider-arrows {
  display: flex;
  gap: 8px;
}

.slider-arrow-modern {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: white;
  border: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.slider-arrow-modern:hover {
  background-color: #ff6b00;
  border-color: #ff6b00;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 107, 0, 0.2);
}

.slider-arrow-modern:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Tour Slider */
.tour-slider {
  position: relative;
  overflow: hidden;
  padding: 0 40px;
}

.tours-grid {
  display: flex;
  gap: 16px;
  transition: transform 0.3s ease;
  width: max-content;
}

.tour-card {
  flex: 0 0 200px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  overflow: hidden;
}

.tour-image {
  height: 120px;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-circle {
  width: 64px;
  height: 64px;
  background-color: #e0e0e0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 14px;
}

.tour-content {
  padding: 12px;
}

.tour-content h3 {
  font-size: 14px;
  margin-bottom: 4px;
}

.tour-content p {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.tour-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tour-price {
  font-size: 12px;
  font-weight: bold;
  color: #f57c00;
}

.buy-btn {
  padding: 4px 8px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  background: none;
  font-size: 12px;
}

/* Literature Grid */
.literature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

.literature-card {
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  overflow: hidden;
}

.literature-image {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.literature-image img {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

.literature-title {
  padding: 12px;
  text-align: center;
}

.literature-title h3 {
  font-size: 14px;
}

/* Publications Grid */
.publications-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.publication-card {
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  overflow: hidden;
}

.publication-image {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.publication-image img {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

.publication-content {
  padding: 12px;
}

.publication-content h3 {
  font-size: 14px;
  margin-bottom: 4px;
}

.publication-content p {
  font-size: 12px;
  color: #666;
}

/* Benefits Section */
.benefits-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 24px;
}

.benefits-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 768px) {
  .benefits-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.benefit-item {
  display: flex;
  gap: 16px;
}

.benefit-icon {
  width: 48px;
  height: 48px;
  background-color: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.benefit-content h3 {
  font-size: 16px;
  margin-bottom: 8px;
}

.benefit-content p {
  font-size: 14px;
  color: #666;
}

/* Responsive Adjustments */
@media (max-width: 1200px) {
  .event-card {
    flex: 0 0 280px;
  }
}

@media (max-width: 768px) {
  .main-nav {
    display: none;
  }

  .register-btn {
    display: none;
  }

  .hero-image {
    margin-top: 20px;
    text-align: center;
  }

  .hero-image img {
    max-width: 250px;
  }

  .tour-slider {
    padding: 0 20px;
  }

  .tour-card {
    flex: 0 0 160px;
  }

  .modern-slide {
    flex: 0 0 260px;
  }

  .event-image {
    height: 180px;
  }

  .event-content {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .tours-grid {
    grid-template-columns: repeat(1, 1fr);
  }
}

/* Book Card Styles */
.book-card {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  height: 100%;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.book-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(255, 107, 0, 0.1);
  border-bottom: 2px solid #ff6b00;
}

.book-cover {
  position: relative;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.book-card:hover .book-cover img {
  transform: scale(1.05);
}

.book-age {
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: #ff6b00;
  color: white;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(255, 107, 0, 0.2);
}

.book-content {
  padding: 12px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.book-author {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.book-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
  transition: color 0.3s ease;
}

.book-card:hover .book-title {
  color: #ff6b00;
}

.book-subtitle {
  font-size: 12px;
  color: #666;
}

/* Slider Navigation */
.slider-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  border: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.slider-nav:hover {
  background: #f5f5f5;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.slider-nav:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slider-prev {
  left: 10px;
}

.slider-next {
  right: 10px;
}

@media (max-width: 768px) {
  .book-cover {
    height: 160px;
  }

  .modern-slide {
    flex: 0 0 180px;
  }
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

.literature-categories-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

@media (max-width: 768px) {
  .literature-categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .literature-categories-grid {
    grid-template-columns: 1fr;
  }
}

.literature-category-card {
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.literature-category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.category-image {
  height: 140px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.category-image img {
  max-width: 60%;
  max-height: 80%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.literature-category-card:hover .category-image img {
  transform: scale(1.1);
}

.category-content {
  padding: 16px;
  text-align: center;
}

.category-content h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.category-content p {
  font-size: 14px;
  color: #666;
}

.collections-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

@media (max-width: 992px) {
  .collections-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .collections-grid {
    grid-template-columns: 1fr;
  }
}

.collection-card {
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.collection-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.collection-image {
  height: 160px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.collection-image img {
  max-width: 60%;
  max-height: 80%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.collection-card:hover .collection-image img {
  transform: scale(1.1);
}

.collection-count {
  position: absolute;
  bottom: 12px;
  left: 12px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
}

.collection-content {
  padding: 16px;
}

.collection-content h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.collection-content p {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 32px;
}

.library-benefits-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
}

.library-benefit-item {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.benefit-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.benefit-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.benefit-content h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.benefit-content p {
  font-size: 16px;
  line-height: 1.5;
  color: #555;
}

@media (max-width: 768px) {
  .library-benefit-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .benefit-icon {
    margin-bottom: 16px;
  }
}

/* Add this to your existing styles */
.literature-card,
.book-card {
  cursor: pointer;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.literature-card:hover,
.book-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}
</style>
