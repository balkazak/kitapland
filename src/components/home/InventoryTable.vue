<script lang="ts" setup>
import { useAPI } from '@/api'
import type { Ref } from 'vue'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import InventoryBookIcon from '@/assets/icons/inventory_book.svg'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const api = useAPI()
const router = useRouter()

interface BookItem {
  id: number
  title: string
  date: string
  copies: number
  price: number
}

const items: Ref<BookItem[]> = ref([])

// Define props
const props = defineProps<{
  inventory?: any[]
      loading?: boolean   
}>()

// Watch for inventory changes and transform data
watch(
  () => props.inventory,
  (newInventory) => {
    if (newInventory) {
      items.value = newInventory.map((item) => ({
        id: item.id,
        title: item.book.title,
        date: new Date(item.admission_at).toLocaleDateString(),
        copies: item.amount,
        price: item.price || 32000
      }))
    }
  },
  { immediate: true }
)

</script>

<template>
  <div class="inventory-list">
    <div v-if="loading" class="loading-state">
      <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
    </div>
    <div v-else>
      <div v-for="item in items" :key="item.id" class="inventory-item">
        <div class="item-left">
          <div class="book-icon">
          <v-img :src="InventoryBookIcon" alt="book" width="24" height="24"></v-img>
        </div>
        <div class="item-details">
          <div class="item-title">{{ item.title }}</div>
          <div class="item-date">{{ item.date }}</div>
        </div>
      </div>
      <div class="item-right">
        <div class="price">{{ item.copies || 0 }} экз.</div>
        <div class="price-text">{{ item.price || 0 }}₸</div>
      </div>
    </div>
    <div class="more-details">
        <v-btn color="primary" block @click="router.push('/fund')">{{ t('details') }}</v-btn>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inventory-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.inventory-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 64px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.item-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.book-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 8px;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.item-title {
  font-weight: 500;
  color: #1a1d1f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.item-date {
  font-size: 12px;
  color: #6f767e;
}

.item-right {
  text-align: right;
  flex-shrink: 0;
  margin-left: 16px;
  min-width: 80px;
}

.price {
  color: #1a1d1f;
  font-size: 13px;
}

.price-text {
  color: #83bf6e;
  font-size: 13px;
  font-weight: 500;
}

.more-details {
  margin-top: 16px;
}
</style>
