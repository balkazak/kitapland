<template>
  <div class="register-page">
    <div class="register-container">
      <div class="info-section">
        <div class="logo-container">
          <h1>KITAP <br>LAND</h1>
        </div>

        <div class="info-content">
          <p class="info-text">
            KITAPLAND – это цифровая библиотека, обеспечивающая удобный доступ к книгам и
            автоматизирующая ключевые процессы библиотеки.
          </p>

          <div class="feature-block">
            <h3>Доступность в любом месте и в любое время</h3>
            <p>
              Платформа позволяет пользователям искать и бронировать книги онлайн, а также читать
              цифровые версии изданий 24/7.
            </p>
          </div>

          <div class="feature-block">
            <h3>Автоматизация библиотечных процессов</h3>
            <p>
              Платформа KITAPLAND значительно упрощает работу библиотекарей, автоматизируя выдачу,
              возврат и учет книг, снижая временные затраты и повышая точность учёта фонда.
            </p>
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="form-container">
          <h2>Регистрация</h2>
          <p class="form-subtitle">Получи читательский билет и доступ к базе книг по РК</p>

          <v-form @submit.prevent="register">
            <div class="form-field">
              <label>Ваша Фамилия*</label>
              <v-text-field
                v-model="registerForm.lastName"
                placeholder="Введите фамилию"
                variant="outlined"
                density="comfortable"
                hide-details
              ></v-text-field>
            </div>

            <div class="form-field">
              <label>Ваше Имя*</label>
              <v-text-field
                v-model="registerForm.firstName"
                placeholder="Введите имя"
                variant="outlined"
                density="comfortable"
                hide-details
              ></v-text-field>
            </div>

            <div class="form-field">
              <label>Ваше Отчество</label>
              <v-text-field
                v-model="registerForm.middleName"
                placeholder="Введите отчество"
                variant="outlined"
                density="comfortable"
                hide-details
              ></v-text-field>
            </div>

            <div class="form-field">
              <label>Ваша Email*</label>
              <v-text-field
                v-model="registerForm.email"
                placeholder="Введите вашу почту"
                variant="outlined"
                density="comfortable"
                hide-details
                type="email"
              ></v-text-field>
            </div>

            <div class="form-checkbox">
              <v-checkbox
                v-model="registerForm.consent"
                hide-details
                density="compact"
              ></v-checkbox>
              <span class="consent-text">Я согласен с условиями и положениями</span>
            </div>

            <v-btn
              type="submit"
              block
              color="#D47D1A"
              class="register-btn"
              :disabled="!isFormValid"
            >
              Получить пароль
            </v-btn>
          </v-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const registerForm = ref({
  lastName: '',
  firstName: '',
  middleName: '',
  email: '',
  consent: false
})

const isFormValid = computed(() => {
  return (
    registerForm.value.lastName.trim() !== '' &&
    registerForm.value.firstName.trim() !== '' &&
    registerForm.value.email.trim() !== '' &&
    registerForm.value.consent
  )
})

const register = () => {
  // Here you would handle the registration logic
  console.log('Registration form submitted:', registerForm.value)
  // In a real app, you would send this data to your backend
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: stretch;
}

.register-container {
  display: flex;
  width: 100%;
}

.info-section {
  flex: 1;
  background-color: #5ba4b6;
  color: white;
  padding: 40px;
  display: flex;
  flex-direction: column;
}

.logo-container {
  margin-bottom: 40px;
}

.logo {
  height: 40px;
}

.info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.info-text {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 40px;
}

.feature-block {
  margin-bottom: 30px;
}

.feature-block h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
}

.feature-block p {
  font-size: 14px;
  line-height: 1.6;
}

.form-section {
  flex: 1;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.form-container {
  width: 100%;
  max-width: 400px;
}

.form-container h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.form-subtitle {
  font-size: 14px;
  color: #666;
  margin-bottom: 30px;
}

.form-field {
  margin-bottom: 20px;
}

.form-field label {
  display: block;
  font-size: 14px;
  margin-bottom: 8px;
}

.form-checkbox {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.consent-text {
  font-size: 12px;
  color: #666;
  margin-left: 8px;
}

.register-btn {
  height: 48px;
  font-size: 16px;
  text-transform: none;
}

@media (max-width: 768px) {
  .register-container {
    flex-direction: column;
  }

  .info-section {
    padding: 20px;
  }

  .form-section {
    padding: 20px;
  }
}
</style>
