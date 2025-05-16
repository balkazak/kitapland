import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const isAuthenticated = ref(false)
  const user = ref({ login: String, user_data: { firstname: String }, })

  return { isAuthenticated, user }
})
