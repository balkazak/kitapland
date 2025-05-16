import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
  timeout?: number
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])
  let nextId = 0

  const show = (message: string, type: ToastType = 'info', timeout: number = 3000) => {
    const id = nextId++
    const toast: Toast = {
      id,
      message,
      type,
      timeout
    }
    toasts.value.push(toast)

    if (timeout) {
      setTimeout(() => {
        remove(id)
      }, timeout)
    }
  }

  const remove = (id: number) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (message: string, timeout?: number) => show(message, 'success', timeout)
  const error = (message: string, timeout?: number) => show(message, 'error', timeout)
  const info = (message: string, timeout?: number) => show(message, 'info', timeout)

  return {
    toasts,
    show,
    remove,
    success,
    error,
    info
  }
}) 