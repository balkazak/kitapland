<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/auth/index'
import router from '@/router'
import { useI18n } from 'vue-i18n'
import { useToastStore } from '@/stores/toast'

const { t, locale } = useI18n()
const toast = useToastStore()
const user = ref({ login: '', password: '', device: 'web' })

const loading = ref(false)
const showPassword = ref(false)
const isAgreed = ref(false)

const switchLocale = (newLocale: string) => {
  locale.value = newLocale
}

const signIn = async function () {
  if (!user.value.login || !user.value.password) {
    toast.error(t('please_fill_all_fields'))
    return
  }

  loading.value = true
  const auth = useAuth()

  try {
    const response = await auth.login(user.value)
    loading.value = false

    if (!response) {
      toast.error(t('login_failed'))
      return
    }

    toast.success(t('login_successful'))
    setTimeout(() => {
      router.push({ name: 'home' })
    }, 1000)
  } catch (error: any) {
    loading.value = false
    const errorMessage = error?.response?.data?.message || t('login_failed')
    toast.error(errorMessage)
    console.error('Error:', error)
  }
}
</script>

<template>
  <div class="page-wrapper">
    <div class="language-switcher">
      <a
        href="#"
        class="lang-link"
        :class="{ active: locale === 'kk' }"
        @click.prevent="switchLocale('kk')"
        >Қаз</a
      >
      <a
        href="#"
        class="lang-link"
        :class="{ active: locale === 'ru' }"
        @click.prevent="switchLocale('ru')"
        >Рус</a
      >
    </div>
    <main class="login-page">
      <v-card :loading="loading" class="login-container" elevation="0">
        <h1>{{ t('authorization') }}</h1>
        <p class="subtitle">{{ t('login_using_username_password') }}</p>
        <form @submit.prevent="signIn" class="login-form">
          <div class="form-group">
            <v-text-field
              v-model="user.login"
              label="Логин"
              placeholder="Введите логин"
              variant="outlined"
              density="comfortable"
              bg-color="white"
              hide-details
            ></v-text-field>
          </div>
          <div class="form-group">
            <v-text-field
              v-model="user.password"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              :type="showPassword ? 'text' : 'password'"
              :label="t('password')"
              placeholder="Введите пароль"
              variant="outlined"
              density="comfortable"
              bg-color="white"
              hide-details
              @click:append-inner="showPassword = !showPassword"
            ></v-text-field>
          </div>
          <v-checkbox v-model="isAgreed" hide-details color="primary">
            <template v-slot:label>
              <span>{{ t('i_agree_to_processing_personal_data') }}</span>
            </template>
          </v-checkbox>
          <a href="#" class="forgot-password">{{ t('forgot_password') }}</a>
          <v-btn
            type="submit"
            :disabled="!isAgreed"
            color="primary"
            block
            size="large"
            variant="flat"
            class="text-uppercase"
            >{{ t('login') }}</v-btn
          >
        </form>
        <v-btn
          color="primary"
          variant="text"
          class="text-none blue-link"
          @click="router.push({ name: 'registration' })"
        >
          Зарегистрировать новую организацию
        </v-btn>
        <div class="logo">
          <img src="@/assets/logo.svg" alt="Qazaq Mura Logo" />
        </div>
      </v-card>
    </main>
  </div>
</template>

<style scoped>
.page-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  min-height: 100vh;
  background: url('@/assets/login-bg.png') center/cover no-repeat;
  display: flex;
  flex-direction: column;
}

.page-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.language-switcher {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 2;
}

.lang-link {
  color: white;
  text-decoration: none;
  padding: 5px 10px;
  margin-left: 10px;
  font-size: 14px;
}

.lang-link.active {
  font-weight: bold;
}

.login-page {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  padding: 20px;
}

.login-container {
  padding: 40px;
  border-radius: 12px !important;
  width: 100%;
  max-width: 460px;
  background: white !important;
}

h1 {
  font-size: 24px;
  color: #1f2937;
  margin-bottom: 8px;
  text-align: center;
  font-weight: 500;
}

.subtitle {
  color: #6b7280;
  text-align: center;
  margin-bottom: 32px;
  font-size: 14px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

:deep(.v-field) {
  border-radius: 8px !important;
  color: #9ca3af;
}

:deep(.v-field__input) {
  padding-top: 8px !important;
  padding-bottom: 8px !important;
  font-size: 14px;
}

:deep(.v-field__outline) {
  color: #e5e7eb !important;
}

:deep(.v-label) {
  font-size: 14px;
  color: #1f2937;
  opacity: 1;
}

:deep(.v-field__append-inner) {
  padding-top: 8px !important;
}

:deep(.v-field__append-inner i) {
  color: #6b7280;
  font-size: 20px;
}

:deep(.v-checkbox) {
  color: #6b7280;
}

:deep(.v-checkbox label) {
  font-size: 14px;
}

.forgot-password {
  color: #2563eb;
  text-decoration: none;
  text-align: center;
  font-size: 14px;
  display: block;
}

.blue-link {
  color: #2563eb;
  text-decoration: none;
  font-size: 14px;
  display: block;
  text-align: center;
  margin-top: 16px;
}

.logo {
  text-align: center;
  margin-top: 32px;
}

.logo img {
  height: 40px;
  width: auto;
  object-fit: contain;
}

:deep(.v-btn) {
  text-transform: none;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0;
}

:deep(.v-btn--size-large) {
  padding: 12px 24px;
}
</style>
