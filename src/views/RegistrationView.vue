<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import TempLoginView from './TempLoginView.vue'
import TempRegisterView from './TempRegisterView.vue'
import registrationPdf from '@/assets/registration_prepare.pdf?url'

const { t, locale } = useI18n()
const router = useRouter()
const showTempLogin = ref(false)
const showTempRegister = ref(false)
const videoDialog = ref(false)
const videoUrl = ref('https://www.youtube.com/embed/EXAMPLE')

const switchLocale = (newLocale: string) => {
  locale.value = newLocale
}

const goToLogin = () => {
  router.push({ name: 'login' })
}

const showTempLoginForm = () => {
  showTempLogin.value = true
}

const showTempRegisterForm = () => {
  showTempRegister.value = true
}

const downloadPreparationFile = () => {
  const link = document.createElement('a')
  link.href = registrationPdf
  link.download = 'Подготовка данных для регистрации.pdf'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const openVideoDialog = () => {
  videoDialog.value = true
}
</script>

<template>
  <div class="registration-wrapper">
    <div class="left-section">
      <img src="@/assets/logo-white.svg" alt="Qazaq Mura Logo" class="white-logo" />
      <div class="description-text">
        {{ t('library_description') }}
      </div>
      <div class="bottom-buttons">
        <v-btn color="white" variant="outlined" class="video-btn" @click="openVideoDialog">
          <v-icon start>mdi-play</v-icon>
          {{ t('registration_video') }}
        </v-btn>
        <v-btn
          color="white"
          variant="outlined"
          class="download-btn"
          @click="downloadPreparationFile"
        >
          <v-icon start>mdi-download</v-icon>
          {{ t('registration_data_preparation') }}
        </v-btn>
      </div>
    </div>

    <div class="right-section">
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

      <div class="content-container">
        <template v-if="!showTempLogin && !showTempRegister">
          <h1>{{ t('join_us') }}</h1>
          <p class="subtitle">{{ t('choose_path') }}</p>

          <div class="options-container">
            <v-card class="option-card" elevation="0" @click="showTempLoginForm">
              <div class="option-icon">
                <v-icon color="primary" size="32">mdi-account</v-icon>
              </div>
              <div class="option-content">
                <h3>{{ t('has_temp_account') }}</h3>
                <p>{{ t('for_full_registration') }}</p>
              </div>
              <v-icon color="primary">mdi-chevron-right</v-icon>
            </v-card>

            <v-card class="option-card" elevation="0" @click="showTempRegisterForm">
              <div class="option-icon">
                <v-icon color="primary" size="32">mdi-office-building</v-icon>
              </div>
              <div class="option-content">
                <h3>{{ t('no_temp_account') }}</h3>
                <p>{{ t('no_access_registration') }}</p>
              </div>
              <v-icon color="primary">mdi-chevron-right</v-icon>
            </v-card>
          </div>

          <div class="login-link">
            <span>{{ t('already_have_account') }} </span>
            <a href="#" @click.prevent="goToLogin">{{ t('login') }}</a>
          </div>
        </template>

        <TempLoginView v-else-if="showTempLogin" @back="showTempLogin = false" />
        <TempRegisterView v-else @back="showTempRegister = false" />
      </div>
    </div>

    <v-dialog v-model="videoDialog" width="800">
      <v-card>
        <v-card-title class="text-h6">
          {{ t('registration_video') }}
        </v-card-title>
        <v-card-text>
          <div class="video-container">
            <iframe
              :src="videoUrl"
              width="100%"
              height="450"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="videoDialog = false">
            {{ t('close') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.registration-wrapper {
  display: flex;
  min-height: 100vh;
}

.left-section {
  width: 40%;
  background-color: #3062d4e5;
  padding: 40px;
  display: flex;
  flex-direction: column;
  position: relative;
}

.white-logo {
  width: 200px;
  margin-bottom: 60px;
}

.description-text {
  color: white;
  font-size: 18px;
  line-height: 1.6;
  max-width: 600px;
  margin: auto;
}

.right-section {
  width: 60%;
  background-color: #f9fafb;
  position: relative;
  padding: 40px;
}

.language-switcher {
  position: absolute;
  top: 20px;
  right: 20px;
}

.lang-link {
  color: #1f2937;
  text-decoration: none;
  padding: 5px 10px;
  margin-left: 10px;
  font-size: 14px;
}

.lang-link.active {
  font-weight: bold;
}

.content-container {
  max-width: 460px;
  margin: 80px auto;
}

h1 {
  font-size: 30px;
  color: #1f2937;
  margin-bottom: 8px;
  font-weight: 500;
}

.subtitle {
  color: #6b7280;
  font-size: 16px;
  margin-bottom: 32px;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.option-card {
  display: flex;
  align-items: center;
  padding: 24px;
  border: 1px solid #e5e7eb !important;
  border-radius: 12px !important;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option-card:not(.disabled):hover {
  border-color: #3062d4 !important;
  background-color: #f8faff;
}

.option-card.disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.option-icon {
  background: #f8faff;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.option-content {
  flex: 1;
}

.option-content h3 {
  font-size: 16px;
  color: #1f2937;
  margin-bottom: 4px;
  font-weight: 500;
}

.option-content p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.login-link {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #6b7280;
}

.login-link a {
  color: #3062d4;
  text-decoration: none;
  font-weight: 500;
}

.login-link a:hover {
  text-decoration: underline;
}

.bottom-buttons {
  position: absolute;
  bottom: 40px;
  left: 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.download-btn,
.video-btn {
  color: white;
  border-color: white;
}

.download-btn:hover,
.video-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.video-container {
  position: relative;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
