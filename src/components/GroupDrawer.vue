<script lang="ts" setup>
import { ref, computed, type Ref, watch } from 'vue'
import { useAPI } from '@/api'
import { useAuth } from '@/auth'
import { useToastStore } from '@/stores/toast'

const api = useAPI()
const auth = useAuth()
const toast = useToastStore()

interface Group {
  id: number
  title: string
  name_kz?: string
  name_ru?: string
}

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const drawer = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const groupItems: Ref<Group[]> = ref([])
const loading = ref(false)

const groupHeaders = [
  { title: 'ID', key: 'id', align: 'start', sortable: true },
  { title: 'Название', key: 'name_ru', align: 'start', sortable: true },
  { title: 'Действия', key: 'actions', align: 'end', sortable: false }
]

const groupDialog = ref(false)
const newGroupRu = ref('')
const newGroupKz = ref('')
const editingGroup = ref<Group | null>(null)
const isEditing = ref(false)

async function fetchGroups() {
  loading.value = true
  try {
    const response = await api.fetchData('/v1/department-group')
    if (response.data) {
      groupItems.value = response.data.data.items
    }
  } catch (e) {
    console.error('Error:', e)
    toast.error('Ошибка при загрузке групп')
  } finally {
    loading.value = false
  }
}

function openAddGroupDialog() {
  isEditing.value = false
  newGroupRu.value = ''
  newGroupKz.value = ''
  groupDialog.value = true
}

function openEditGroupDialog(group: Group) {
  isEditing.value = true
  editingGroup.value = group
  newGroupRu.value = group.name_ru || group.title
  newGroupKz.value = group.name_kz || group.title
  groupDialog.value = true
}

async function saveGroup() {
  if (newGroupRu.value.trim() === '' || newGroupKz.value.trim() === '') {
    toast.error('Заполните оба поля')
    return
  }

  try {
    if (isEditing.value && editingGroup.value) {
      await api.putData(`/v1/department-group/${editingGroup.value.id}`, {
        name_kz: newGroupKz.value,
        name_ru: newGroupRu.value
      })
      toast.success('Группа успешно обновлена')
    } else {
      await api.postData('/v1/department-group', {
        name_kz: newGroupKz.value,
        name_ru: newGroupRu.value
      })
      toast.success('Группа успешно добавлена')
    }

    groupDialog.value = false
    newGroupRu.value = ''
    newGroupKz.value = ''
    await fetchGroups()
  } catch (error) {
    console.error('Error saving group:', error)
    toast.error('Ошибка при сохранении группы')
  }
}

async function deleteGroup(id: number) {
  try {
    await api.deleteData(`/v1/department-group/${id}`)
    toast.success('Группа успешно удалена')
    await fetchGroups()
  } catch (error) {
    console.error('Error deleting group:', error)
    toast.error('Ошибка при удалении группы')
  }
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      fetchGroups()
    }
  }
)
</script>

<template>
  <v-navigation-drawer v-model="drawer" location="right" temporary width="600">
    <v-list-item>
      <div class="d-flex justify-space-between align-center w-100">
        <span class="font-weight-bold">Группа</span>
        <v-btn color="primary" variant="text" @click="openAddGroupDialog">
          <v-icon>mdi-plus</v-icon> Добавить
        </v-btn>
      </div>
    </v-list-item>
    <v-divider></v-divider>
    <v-container fluid>
      <v-data-table
        :headers="groupHeaders"
        :items="groupItems"
        :loading="loading"
        class="elevation-1"
      >
        <template v-slot:[`item.actions`]="{ item }">
          <div class="d-flex justify-end">
            <v-btn
              icon="mdi-pencil"
              variant="text"
              density="comfortable"
              class="mr-2"
              @click="openEditGroupDialog(item)"
            ></v-btn>
            <v-btn
              icon="mdi-delete"
              variant="text"
              density="comfortable"
              color="error"
              @click="deleteGroup(item.id)"
            ></v-btn>
          </div>
        </template>
      </v-data-table>
    </v-container>
  </v-navigation-drawer>

  <v-dialog v-model="groupDialog" max-width="500px">
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ isEditing ? 'Редактировать' : 'Добавить' }} группу</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="newGroupRu"
                label="Название группы (Русский)"
                required
                variant="outlined"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="newGroupKz"
                label="Название группы (Казахский)"
                required
                variant="outlined"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="groupDialog = false">
          Отмена
        </v-btn>
        <v-btn color="blue-darken-1" variant="text" @click="saveGroup">
          Сохранить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template> 