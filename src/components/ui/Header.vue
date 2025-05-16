<template>
  <v-app-bar flat border>
    <div class="container">
      <div class="header-content">
        <div class="logo-container">
          <router-link to="/">
            <img src="@/assets/logo.svg" alt="KITAPLAND" class="logo" />
          </router-link>
        </div>

        <div class="search-container">
          <div v-if="selectedRegion" class="selected-region">
            <span class="region-name">{{ selectedRegion }}</span>
            <button class="clear-region" @click="clearRegion">
              <v-icon size="small" color="#0099FF">mdi-close</v-icon>
            </button>
          </div>
          <v-menu v-else offset-y>
            <template v-slot:activator="{ props }">
              <v-text-field
                v-bind="props"
                variant="outlined"
                placeholder="Регион"
                density="compact"
                hide-details
                readonly
                class="search-input"
                append-inner-icon="mdi-chevron-down"
              ></v-text-field>
            </template>
            <v-list>
              <v-list-item
                v-for="(region, index) in regions"
                :key="index"
                :value="region"
                @click="selectRegion(region)"
                class="region-list-item"
              >
                <v-list-item-title>{{ region }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>

        <div class="nav-links">
          <router-link to="/news" class="nav-link" active-class="active-link">Новости</router-link>
          <router-link to="/ticket" class="nav-link">Получить читательный билет</router-link>
          <router-link to="/libraries" class="nav-link">Добавление библиотеки</router-link>

          <v-menu offset-y>
            <template v-slot:activator="{ props }">
              <div class="dropdown-container" v-bind="props">
                <span class="nav-link with-dropdown">
                  Помощь
                  <v-icon size="small">mdi-chevron-down</v-icon>
                </span>
              </div>
            </template>
            <v-list>
              <v-list-item v-for="(item, index) in helpItems" :key="index" :to="item.link">
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>

        <div class="auth-container">
          <a href="#" class="auth-link" @click.prevent="showLoginDialog = true">
            <v-icon size="small" class="auth-icon">mdi-account</v-icon>
            Войти
          </a>

          <v-menu offset-y>
            <template v-slot:activator="{ props }">
              <div class="language-selector" v-bind="props">
                {{ selectedLanguage }}
                <v-icon size="small">mdi-chevron-down</v-icon>
              </div>
            </template>
            <v-list>
              <v-list-item
                v-for="(language, index) in languages"
                :key="index"
                :value="language"
                @click="selectedLanguage = language"
              >
                <v-list-item-title>{{ language }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>
    </div>
  </v-app-bar>

  <!-- Replace the v-dialog with a custom dialog implementation -->
  <div v-if="showLoginDialog" class="custom-login-overlay">
    <div class="custom-login-container">
      <v-card class="login-card">
        <div class="login-header">
          <button class="close-btn" @click="showLoginDialog = false">
            <v-icon>mdi-close</v-icon>
          </button>
        </div>

        <v-card-text class="login-content">
          <h2 class="login-title">Авторизация</h2>
          <p class="login-subtitle">Войдите используя логин и пароль</p>

          <v-form @submit.prevent="login">
            <v-text-field
              v-model="loginForm.email"
              label="Логин"
              variant="outlined"
              placeholder="alimabdullaev@gmail.com"
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model="loginForm.password"
              label="Введите пароль"
              variant="outlined"
              type="password"
              class="mb-2"
            ></v-text-field>

            <div class="login-options">
              <div class="checkbox-container">
                <v-checkbox
                  v-model="loginForm.rememberMe"
                  hide-details
                  density="compact"
                ></v-checkbox>
                <span class="ml-2 consent-text">Я согласен на обработку персональных данных</span>
              </div>

              <a href="#" class="forgot-password">Забыли пароль?</a>
            </div>

            <v-btn
              type="submit"
              block
              color="#D47D1A"
              class="login-btn mt-4"
              :disabled="!isFormValid"
            >
              ВОЙТИ
            </v-btn>
          </v-form>

          <div class="register-container">
            <p class="register-text">Еще нет аккаунта?</p>
            <router-link
              to="/register"
              class="register-link-dialog"
              @click="showLoginDialog = false"
            >
              Зарегистрироваться
            </router-link>
          </div>

          <div class="login-footer">
            <img src="@/assets/logo.svg" alt="KITAPLAND" height="32" />
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { watch } from 'vue'

const selectedRegion = ref('Алматы')
const regions = [
  'Алматы',
  'Астана',
  'Шымкент',
  'Караганда',
  'Актобе',
  'Тараз',
  'Павлодар',
  'Семей',
  'Атырау',
  'Костанай',
  'Кызылорда'
]

const selectRegion = (region: string) => {
  selectedRegion.value = region
}

const clearRegion = () => {
  selectedRegion.value = ''
}

const helpItems = [
  { title: 'Часто задаваемые вопросы', link: '/faq' },
  { title: 'Как пользоваться', link: '/how-to-use' },
  { title: 'Контакты', link: '/contacts' },
  { title: 'О проекте', link: '/about' }
]

const selectedLanguage = ref('Русский')
const languages = ['Русский', 'Қазақша', 'English']

// Логика авторизации
const showLoginDialog = ref(false)
const loginForm = ref({
  email: '',
  password: '',
  rememberMe: false
})

const isFormValid = computed(() => {
  return loginForm.value.email && loginForm.value.password && loginForm.value.rememberMe
})

const login = () => {
  if (isFormValid.value) {
    // Здесь будет логика авторизации
    console.log('Авторизация:', loginForm.value)
    showLoginDialog.value = false
  }
}

// Add this to handle body scrolling

// Watch for dialog state changes to manage body scrolling
watch(showLoginDialog, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// Clean up on component unmount
onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 16px;
}

.header-content {
  display: flex;
  align-items: center;
  height: 64px;
}

.logo-container {
  margin-right: 24px;
}

.logo {
  height: 32px;
}

.search-container {
  width: 160px;
  margin-right: 24px;
}

.search-input {
  font-size: 13px;
  cursor: pointer;
  height: 32px;
}

.search-input :deep(.v-field__input) {
  min-height: 32px;
  padding-top: 0;
  padding-bottom: 0;
}

.search-input :deep(.v-field__append-inner) {
  padding-top: 4px;
}

.search-input :deep(.v-field__outline) {
  color: #ccc;
}

.region-list-item {
  font-size: 13px;
  min-height: 36px;
}

.selected-region {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #0099ff;
  font-size: 13px;
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px solid #0099ff;
  background-color: #f0f8ff;
  cursor: default;
  max-width: 120px;
  white-space: nowrap;
  height: 32px;
}

.region-name {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
}

.clear-region {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-left: 4px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.nav-links {
  display: flex;
  flex-grow: 1;
}

.nav-link {
  color: #333;
  text-decoration: none;
  font-size: 14px;
  padding: 0 16px;
  white-space: nowrap;
}

.nav-link:hover {
  color: #0066cc;
}

.with-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.dropdown-container {
  display: inline-block;
}

.auth-container {
  display: flex;
  align-items: center;
}

.auth-link {
  color: #333;
  text-decoration: none;
  font-size: 14px;
  margin-right: 24px;
  display: flex;
  align-items: center;
}

.auth-icon {
  margin-right: 4px;
}

.language-selector {
  display: flex;
  align-items: center;
  font-size: 14px;
  cursor: pointer;
}

@media (max-width: 1024px) {
  .nav-links {
    display: none;
  }
}

/* Add these styles for the custom dialog */
.custom-login-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-login-container {
  width: 100%;
  max-width: 400px;
  margin: 0 16px;
}

.login-header {
  display: flex;
  justify-content: flex-end;
  padding: 8px;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
}

/* Keep your existing login styles */
.login-card {
  border-radius: 8px;
  padding: 16px;
}

.login-content {
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.login-title {
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-bottom: 24px;
}

.login-options {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

.forgot-password {
  color: #0066cc;
  text-decoration: none;
  font-size: 14px;
  text-align: center;
  margin-top: 16px;
}

.login-btn {
  text-transform: uppercase;
  font-weight: 500;
}

.login-footer {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.active-link {
  color: #0066cc;
  font-weight: 500;
  position: relative;
}

.active-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 16px;
  right: 16px;
  height: 2px;
  background-color: #0066cc;
}

/* Add this new style for the checkbox and text */
.checkbox-container {
  display: flex;
  align-items: center;
}

.consent-text {
  font-size: 12px;
  color: #666;
  margin-left: -8px; /* Adjust spacing between checkbox and text */
}

/* Add these styles for the registration link in the dialog */
.register-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 24px;
}

.register-text {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.register-link-dialog {
  color: #0066cc;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

/* Add this to ensure menus are visible */
:deep(.v-menu__content) {
  z-index: 1000 !important;
}
</style>
