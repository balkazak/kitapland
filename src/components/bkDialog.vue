<script lang="ts" setup>
import { ref, watch, type Ref } from 'vue'
import { useAPI } from '@/api'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

interface Props {
  mode: 'bbk' | 'udk'
}

interface BKItem {
  id: number
  number: string
  title: string
}

const componentProps = defineProps<Props>()
const api = useAPI()
const items = ref<BKItem[]>([])
const getItems = async () => {
  const response = await api.fetchData(`/v1/${componentProps.mode}`)
  if (response.data) {
    items.value = response.data.data.items
  }
}

const childItems = ref<BKItem[][]>([])
const parentItem = ref<BKItem | null>(null)
const selectedItems = ref<BKItem[]>([])

const selectItem = async (item: BKItem, index?: number) => {
  if (!index) {
    // Selecting parent item - clear everything
    parentItem.value = item
    childItems.value = []
    selectedItems.value = []
    level.value = 0
  } else {
    // Selecting child item - clear only items after the current selection
    selectedItems.value = selectedItems.value.slice(0, index)
    childItems.value = childItems.value.slice(0, index)
    // Set the selected item at the correct index (index - 1 since index starts from 1)
    selectedItems.value[index - 1] = item
  }

  // Get new child items for the selected item
  const response = await api.fetchData(`/v1/${componentProps.mode}?parent_id=${item.id}`)
  if (response.data?.data?.items?.length > 0) {
    if (!index) {
      // For parent selection, start fresh
      childItems.value = [response.data.data.items]
      level.value = 1
    } else {
      // For child selection, add to the existing list at the correct position
      childItems.value.push(response.data.data.items)
      level.value = index + 1
    }
  }
}

const level = ref(0)
const emit = defineEmits(['finish'])

const finishSelection = (isActive: { value: boolean }) => {
  if (selectedItems.value.length > 0) {
    emit('finish', [parentItem.value, ...selectedItems.value])
  } else if (parentItem.value) {
    emit('finish', [parentItem.value])
  } else if (searchItem.value) {
    emit('finish', [searchItem.value])
  }
  isActive.value = false
}

const tab = ref(1)

getItems()

const searchItems = ref<BKItem[]>([])
const searchItem = ref<BKItem | null>(null)

async function searchBk(title: string | null) {
  if (!title) return
  const response = await api.fetchData(`/v1/${componentProps.mode}?search=${title}`)
  if (response.data) {
    searchItems.value = response.data.data.items
  }
}
</script>

<template>
  <v-dialog width="700">
    <template v-slot:activator="{ props }">
      <v-btn color="primary" v-bind="props" variant="outlined">
        Выбрать {{ componentProps.mode === 'bbk' ? 'ББК' : 'УДК' }}
      </v-btn>
    </template>

    <template v-slot:default="{ isActive }">
      <v-card :title="componentProps.mode === 'bbk' ? 'Выбрать ББК' : 'Выбрать УДК'">
        <v-tabs v-model="tab">
          <v-tab :value="1">Структура</v-tab>
          <v-tab :value="2">Поиск</v-tab>
        </v-tabs>

        <v-window v-model="tab">
          <v-window-item :value="1">
            <v-card-text class="overflow-auto">
              <v-select
                v-model="parentItem"
                :items="items"
                :label="componentProps.mode === 'bbk' ? 'ББК' : 'УДК'"
                return-object
                variant="outlined"
              >
                <template v-slot:selection="{ item }">
                  <div>{{ item.raw.number }} - {{ item.raw.title }}</div>
                </template>
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props" @click="selectItem(item.raw)">
                    {{ item.raw.number }} - {{ item.raw.title }}
                  </v-list-item>
                </template>
              </v-select>

              <template v-for="(items, index) in childItems" :key="index">
                <v-select
                  v-model="selectedItems[index]"
                  :items="items"
                  return-object
                  variant="outlined"
                >
                  <template v-slot:selection="{ item }">
                    <div>{{ item.raw.number }} - {{ item.raw.title }}</div>
                  </template>
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props" @click="selectItem(item.raw, index + 1)">
                      {{ item.raw.number }} - {{ item.raw.title }}
                    </v-list-item>
                  </template>
                </v-select>
              </template>
            </v-card-text>
          </v-window-item>

          <v-window-item :value="2">
            <v-card-text>
              <v-autocomplete
                v-model="searchItem"
                @update:search="searchBk"
                :items="searchItems"
                :label="componentProps.mode === 'bbk' ? 'Поиск ББК' : 'Поиск УДК'"
                return-object
                variant="outlined"
              >
                <template v-slot:selection="{ item }">
                  <div>{{ item.raw.number }} - {{ item.raw.title }}</div>
                </template>
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    {{ item.raw.number }} - {{ item.raw.title }}
                  </v-list-item>
                </template>
              </v-autocomplete>
            </v-card-text>
          </v-window-item>
        </v-window>

        <v-card-actions>
          <div class="d-flex w-100 justify-space-between px-4 pb-4">
            <v-btn color="primary" variant="flat" @click="finishSelection(isActive)">Выбрать</v-btn>
            <v-btn variant="tonal" @click="isActive.value = false">Отмена</v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<style scoped></style>
