<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToastStore } from '@/stores/toast'
import { useAPI } from '@/api'

const { t } = useI18n()
const toast = useToastStore()
const api = useAPI()
const emit = defineEmits(['back'])

const form = ref({
  email: '',
  position: ''
})

const isAgreed = ref(false)
const loading = ref(false)

const register = async () => {
  if (!form.value.email || !form.value.position) {
    toast.error(t('please_fill_fields'))
    return
  }

  if (!isAgreed.value) {
    toast.error(t('must_agree_terms'))
    return
  }

  loading.value = true
  try {
    const response = await api.postData('/v1/temp-user/register', {
      email: form.value.email
    })
    if (response.data.success) {
      toast.success(response.data.message)
      emit('back')
    }
  } catch (error: any) {
    console.log(error)
    toast.error(error?.message || t('registration_error'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="temp-register-container">
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
    <h1>{{ t('your_mail') }}</h1>
    <p class="subtitle">
      {{ t('mail_position_description') }}
    </p>

    <form @submit.prevent="register" class="register-form">
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
        <label>{{ t('your_position') }}*</label>
        <v-text-field
          v-model="form.position"
          :placeholder="t('enter_position')"
          variant="outlined"
          density="comfortable"
          bg-color="white"
          hide-details
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
        :disabled="!form.email || !form.position || !isAgreed"
        color="primary"
        block
        size="large"
        class="submit-btn"
      >
        {{ t('get_password') }}
      </v-btn>
    </form>
  </div>
</template>

<style scoped>
.temp-register-container {
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

.register-form {
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
