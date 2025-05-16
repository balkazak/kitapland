<template>
  <div class="news-detail-page">
    <main>
      <!-- Page Header -->
      <section class="page-header">
        <div class="container d-flex justify-space-between">
          <div>
            <h1>{{ news.title }}</h1>
            <div class="breadcrumbs">
              <router-link to="/">Главная</router-link> / 
              <router-link to="/news">Новости</router-link> / 
              <span>{{ news.title }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- News Detail Section -->
      <section class="section">
        <div class="container">
          <v-card class="section-card">
            <v-card-text>
              <div class="news-meta">
                <div class="news-date">{{ news.date }}</div>
                <div class="news-type">{{ news.type }}</div>
                <div class="news-location">{{ news.location }}</div>
              </div>

              <div class="news-content">
                <div class="news-image">
                  <img :src="getNewsImage()" :alt="news.title" class="main-image" />
                </div>
                
                <div class="news-text">
                  <p class="news-description">{{ news.description }}</p>
                  
                  <div class="news-details" v-html="news.content"></div>
                  
                  <div class="news-info" v-if="news.info">
                    <h3>Информация о мероприятии</h3>
                    <div class="info-grid">
                      <div class="info-item" v-if="news.info.date">
                        <div class="info-label">Дата проведения:</div>
                        <div class="info-value">{{ news.info.date }}</div>
                      </div>
                      <div class="info-item" v-if="news.info.time">
                        <div class="info-label">Время:</div>
                        <div class="info-value">{{ news.info.time }}</div>
                      </div>
                      <div class="info-item" v-if="news.info.location">
                        <div class="info-label">Место проведения:</div>
                        <div class="info-value">{{ news.info.location }}</div>
                      </div>
                      <div class="info-item" v-if="news.info.organizer">
                        <div class="info-label">Организатор:</div>
                        <div class="info-value">{{ news.info.organizer }}</div>
                      </div>
                      <div class="info-item" v-if="news.info.contact">
                        <div class="info-label">Контакты:</div>
                        <div class="info-value">{{ news.info.contact }}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="news-actions">
                    <v-btn color="#61A3B4" class="register-btn">Зарегистрироваться</v-btn>
                  </div>
                </div>
              </div>
              
              <!-- Gallery Section -->
              <div class="news-gallery" v-if="news.gallery && news.gallery.length > 1">
                <h3>Галерея</h3>
                <div class="gallery-grid">
                  <div 
                    v-for="(image, index) in news.gallery" 
                    :key="index"
                    class="gallery-item"
                    @click="openGallery(index)"
                  >
                    <img :src="image" :alt="`Изображение ${index + 1}`" />
                    <div class="image-overlay">
                      <v-icon color="white" size="large">mdi-magnify-plus</v-icon>
                    </div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
          
          <!-- Related News Section -->
          <div class="related-news">
            <h2>Похожие новости</h2>
            <div class="related-news-grid">
              <v-card 
                v-for="item in relatedNews" 
                :key="item.id"
                class="related-news-card"
                :to="`/news/${item.id}`"
              >
                <div class="related-news-image">
                  <img :src="item.image" :alt="item.title" />
                  <span v-if="item.badge" class="related-news-badge">{{ item.badge }}</span>
                </div>
                <v-card-text>
                  <div class="related-news-type">{{ item.type }}</div>
                  <h3 class="related-news-title">{{ item.title }}</h3>
                  <div class="related-news-details">
                    <div class="related-news-time">{{ item.time }}</div>
                    <div class="related-news-location">{{ item.location }}</div>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Replace the v-dialog with a custom fullscreen overlay -->
    <div v-if="galleryDialog" class="custom-gallery-overlay">
      <div class="gallery-header">
        <button class="close-btn" @click="galleryDialog = false">
          <v-icon color="white" size="large">mdi-close</v-icon>
        </button>
      </div>
      
      <div class="gallery-content">
        <button class="nav-btn prev-btn" @click="prevImage" v-if="news.gallery.length > 1">
          <v-icon color="white" size="large">mdi-chevron-left</v-icon>
        </button>
        
        <div class="gallery-image-container">
          <img :src="currentImage" :alt="`Изображение ${galleryIndex + 1}`" class="gallery-image" />
        </div>
        
        <button class="nav-btn next-btn" @click="nextImage" v-if="news.gallery.length > 1">
          <v-icon color="white" size="large">mdi-chevron-right</v-icon>
        </button>
      </div>
      
      <div class="gallery-counter" v-if="news.gallery.length > 1">
        {{ galleryIndex + 1 }} / {{ news.gallery.length }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const newsId = route.params.id

// Gallery state
const galleryDialog = ref(false)
const galleryIndex = ref(0)

// Computed property for current image
const currentImage = computed(() => {
  return news.value.gallery[galleryIndex.value]
})

// Gallery navigation
const nextImage = () => {
  if (galleryIndex.value < news.value.gallery.length - 1) {
    galleryIndex.value++
  } else {
    galleryIndex.value = 0 // Loop back to the first image
  }
}

const prevImage = () => {
  if (galleryIndex.value > 0) {
    galleryIndex.value--
  } else {
    galleryIndex.value = news.value.gallery.length - 1 // Loop to the last image
  }
}

// Handle keyboard navigation
const handleKeyDown = (e: KeyboardEvent) => {
  if (!galleryDialog.value) return
  
  if (e.key === 'Escape') {
    galleryDialog.value = false
  } else if (e.key === 'ArrowRight') {
    nextImage()
  } else if (e.key === 'ArrowLeft') {
    prevImage()
  }
}

// Open gallery at specific index
const openGallery = (index: number) => {
  galleryIndex.value = index
  galleryDialog.value = true
  // Prevent body scrolling when gallery is open
  document.body.style.overflow = 'hidden'
}

// Setup and cleanup event listeners
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  // Restore scrolling
  document.body.style.overflow = ''
})

// Mock data for the news detail
const news = ref({
  id: newsId,
  title: 'Литературный вечер "Классики современности"',
  date: '15 мая 2023',
  type: 'Мероприятие',
  location: 'Центральная библиотека им. А.С. Пушкина',
  description: 'Приглашаем всех любителей литературы на вечер, посвященный современным авторам, чьи произведения уже стали классикой нашего времени. Вы сможете узнать больше о творчестве известных писателей, обсудить их произведения и поделиться своими впечатлениями.',
  content: `
    <p>15 мая в Центральной библиотеке им. А.С. Пушкина состоится литературный вечер "Классики современности", посвященный авторам, чьи произведения уже при жизни стали классикой современной литературы.</p>
    
    <p>В программе вечера:</p>
    <ul>
      <li>Обзор творчества современных писателей</li>
      <li>Дискуссия о тенденциях в современной литературе</li>
      <li>Чтение отрывков из произведений</li>
      <li>Викторина с призами для знатоков современной литературы</li>
    </ul>
    
    <p>Мероприятие проводится в рамках городской программы "Читающий город" и направлено на популяризацию чтения среди жителей всех возрастов.</p>
    
    <p>Приглашаем всех желающих! Вход свободный.</p>
  `,
  info: {
    date: '15 мая 2023 г.',
    time: '18:00 - 20:00',
    location: 'Центральная библиотека им. А.С. Пушкина, ул. Литературная, 42',
    organizer: 'Городское управление культуры',
    contact: 'Тел.: +7 (123) 456-78-90, Email: library@example.com'
  },
  gallery: [
    new URL('../assets/kitapland/news1.png', import.meta.url).href,
    new URL('../assets/kitapland/news2.png', import.meta.url).href,
    new URL('../assets/kitapland/main1.png', import.meta.url).href
  ]
})

// Function to get the main news image
const getNewsImage = () => {
  return news.value.gallery && news.value.gallery.length > 0 
    ? news.value.gallery[0] 
    : new URL('../assets/kitapland/news1.png', import.meta.url).href
}

// Mock data for related news
const relatedNews = ref([
  {
    id: '2',
    title: 'Мастер-класс по каллиграфии',
    type: 'Мастер-класс',
    time: '20 мая 2023, 15:00',
    location: 'Библиотека №3',
    image: new URL('../assets/kitapland/news2.png', import.meta.url).href,
    badge: 'Новое'
  },
  {
    id: '3',
    title: 'Выставка редких книг',
    type: 'Выставка',
    time: '1-10 июня 2023',
    location: 'Центральная библиотека',
    image: new URL('../assets/kitapland/main1.png', import.meta.url).href
  },
  {
    id: '4',
    title: 'Встреча с автором: Иван Петров',
    type: 'Встреча',
    time: '25 мая 2023, 17:00',
    location: 'Литературное кафе',
    image: new URL('../assets/kitapland/news1.png', import.meta.url).href
  }
])

// In a real application, you would fetch the news data based on the ID
onMounted(() => {
  console.log('News detail page loaded with ID:', newsId)
  // Here you would typically fetch the news data from an API
})
</script>

<style scoped>
.news-detail-page {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  background-color: white;
  padding: 32px 0;
  border-bottom: 1px solid #e0e0e0;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.breadcrumbs {
  font-size: 14px;
  color: #666;
}

.breadcrumbs a {
  color: #0066cc;
  text-decoration: none;
}

.section {
  padding: 32px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.section-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  margin-bottom: 32px;
}

.news-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.news-date, .news-type, .news-location {
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
}

.news-type {
  background-color: #e3f2fd;
  color: #0066cc;
  padding: 4px 12px;
  border-radius: 16px;
}

.news-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.news-image {
  position: relative;
}

.main-image {
  width: 100%;
  height: auto;
  object-fit: cover;
}

.news-description {
  font-size: 18px;
  line-height: 1.6;
  color: #333;
  font-weight: 500;
  margin-bottom: 24px;
}

.news-details {
  font-size: 16px;
  line-height: 1.6;
  color: #333;
}

.news-details p {
  margin-bottom: 16px;
}

.news-info {
  margin-top: 32px;
  padding: 24px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.news-info h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 14px;
  color: #666;
}

.info-value {
  font-size: 16px;
  color: #333;
}

.news-actions {
  margin-top: 32px;
  display: flex;
  justify-content: center;
}

.register-btn {
  padding: 0 32px;
  height: 48px;
  font-size: 16px;
  text-transform: none;
}

.news-gallery {
  margin-top: 48px;
}

.news-gallery h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.gallery-item {
  position: relative;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 16/9;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.news-image:hover .image-overlay,
.gallery-item:hover .image-overlay {
  opacity: 1;
}

.share-section {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

.share-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.share-buttons {
  display: flex;
  gap: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.related-news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.related-news {
  margin-top: 48px;
}

.related-news h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #333;
}

.related-news-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.related-news-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.related-news-image {
  position: relative;
  height: 200px;
}

.related-news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.related-news-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: #ff5252;
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}

.related-news-type {
  display: inline-block;
  background-color: #e3f2fd;
  color: #0066cc;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  margin-bottom: 8px;
}

.related-news-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  line-height: 1.4;
}

.related-news-details {
  font-size: 14px;
  color: #666;
}

.custom-gallery-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.95);
  z-index: 9999;
  display: flex;
  flex-direction: column;
}

.gallery-header {
  padding: 16px;
  display: flex;
  justify-content: flex-end;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
}

.gallery-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gallery-image-container {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.gallery-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
}

.nav-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 16px;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.nav-btn:hover {
  opacity: 1;
}

.gallery-counter {
  text-align: center;
  color: white;
  padding: 16px;
  font-size: 16px;
}

@media (min-width: 768px) {
  .news-content {
    flex-direction: row;
  }

  .news-image {
    flex: 0 0 50%;
  }

  .news-text {
    flex: 1;
  }

  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 767px) {
  .page-header h1 {
    font-size: 24px;
  }

  .news-description {
    font-size: 16px;
  }

  .related-news-grid {
    grid-template-columns: 1fr;
  }
}
</style> 