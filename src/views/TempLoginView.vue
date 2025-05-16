<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToastStore } from '@/stores/toast'
import { useRouter } from 'vue-router'
import { useAPI } from '@/api'

const { t } = useI18n()
const toast = useToastStore()
const router = useRouter()
const api = useAPI()
const emit = defineEmits(['back'])

const form = ref({
  email: '',
  password: ''
})

const showPassword = ref(false)
const isAgreed = ref(false)
const loading = ref(false)

const login = async () => {
  if (!form.value.email || !form.value.password) {
    toast.error(t('please_fill_fields'))
    return
  }

  if (!isAgreed.value) {
    toast.error(t('must_agree_terms'))
    return
  }

  loading.value = true
  try {
    const response = await api.postData('/v1/temp-user/login', {
      email: form.value.email,
      password: form.value.password
    })

    if (response.data) {
      // Save response data to localStorage
      localStorage.setItem(
        'tempUser',
        JSON.stringify({
          id: response.data.id,
          email: response.data.email,
          login: response.data.login,
          role_id: response.data.role_id,
          token: response.data.token,
          token_expired: response.data.token_expired
        })
      )

      toast.success(t('login_successful'))
      try {
        await router.push({ name: 'temporary' })
      } catch (navigationError) {
        toast.error(t('navigation_error'))
      }
    }
  } catch (error: any) {
    toast.error(error?.message || t('login_error'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="temp-login-container">
    <div class="back-button">
      <v-btn
        variant="text"
        color="primary"
        class="text-none"
        prepend-icon="mdi-arrow-left"
        @click="emit('back')"
      >
        {{ t('back') }}
      </v-btn>
    </div>
    <h1>{{ t('temp_login') }}</h1>
    <p class="subtitle">
      {{ t('temp_account_description') }}
    </p>

    <form @submit.prevent="login" class="login-form">
      <div class="form-group">
        <label>{{ t('your_email') }}*</label>
        <v-text-field
          v-model="form.email"
          :placeholder="t('enter_email')"
          variant="outlined"
          density="comfortable"
          bg-color="white"
          hide-details
        ></v-text-field>
      </div>

      <div class="form-group">
        <label>{{ t('your_password') }}*</label>
        <v-text-field
          v-model="form.password"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          :type="showPassword ? 'text' : 'password'"
          :placeholder="t('enter_password')"
          variant="outlined"
          density="comfortable"
          bg-color="white"
          hide-details
          @click:append-inner="showPassword = !showPassword"
        ></v-text-field>
      </div>

      <v-checkbox v-model="isAgreed" hide-details color="primary" class="terms-checkbox">
        <template v-slot:label>
          <span>{{ t('agree_terms') }}</span>
        </template>
      </v-checkbox>

      <v-btn
        type="submit"
        :loading="loading"
        :disabled="!form.email || !form.password || !isAgreed"
        color="primary"
        block
        size="large"
        class="submit-btn"
      >
        {{ t('login') }}
      </v-btn>
    </form>
  </div>
</template>

<style scoped>
.temp-login-container {
  max-width: 460px;
  margin: 0 auto;
  padding: 40px;
}

h1 {
  font-size: 24px;
  color: #1f2937;
  margin-bottom: 8px;
  font-weight: 500;
}

.subtitle {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 32px;
  line-height: 1.5;
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

.form-group label {
  font-size: 14px;
  color: #1f2937;
}

:deep(.v-field) {
  border-radius: 8px !important;
}

:deep(.v-field__input) {
  padding: 12px !important;
  font-size: 14px;
}

:deep(.v-field__outline) {
  color: #e5e7eb !important;
}

.terms-checkbox {
  margin-top: -8px;
}

:deep(.terms-checkbox .v-label) {
  font-size: 14px;
  color: #6b7280;
}

.submit-btn {
  margin-top: 8px;
  text-transform: none;
  font-weight: 500;
  font-size: 14px;
}

.back-button {
  margin-bottom: 24px;
}

:deep(.back-button .v-btn) {
  padding-left: 0;
  font-size: 14px;
}
</style>
