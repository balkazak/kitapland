<script setup lang="ts">
import { useToastStore } from '@/stores/toast'
import { storeToRefs } from 'pinia'

const store = useToastStore()
const { toasts } = storeToRefs(store)

const getColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'green'
    case 'error':
      return 'red'
    case 'info':
      return 'info'
    default:
      return 'primary'
  }
}

const getIcon = (type: string) => {
  switch (type) {
    case 'success':
      return 'mdi-check-circle'
    case 'error':
      return 'mdi-alert-circle'
    case 'info':
      return 'mdi-information'
    default:
      return 'mdi-bell'
  }
}
</script>

<template>
  <div class="toast-container">
    <v-snackbar
      v-for="toast in toasts"
      :key="toast.id"
      :modelValue="true"
      :color="getColor(toast.type)"
      location="top right"
      :timeout="toast.timeout"
      :multi-line="true"
      class="custom-toast"
    >
      <div class="d-flex align-center">
        <v-icon :icon="getIcon(toast.type)" class="mr-2" />
        {{ toast.message }}
      </div>
    </v-snackbar>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  pointer-events: none;
}

.v-snackbar {
  pointer-events: auto;
}
</style>
