<script lang="ts" setup>
import { ref, computed, type Ref, watch } from 'vue'
import { useAPI } from '@/api'
import { useAuth } from '@/auth'
import { useToastStore } from '@/stores/toast'

const api = useAPI()
const auth = useAuth()
const toast = useToastStore()

interface Department {
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

const departmentItems: Ref<Department[]> = ref([])
const loading = ref(false)

const departmentHeaders = [
  { title: 'ID', key: 'id', align: 'start', sortable: true },
  { title: 'Название', key: 'name_ru', align: 'start', sortable: true },
  { title: 'Действия', key: 'actions', align: 'end', sortable: false }
]

const departmentDialog = ref(false)
const newDepartmentRu = ref('')
const newDepartmentKz = ref('')
const editingDepartment = ref<Department | null>(null)
const isEditing = ref(false)

async function fetchDepartments() {
  loading.value = true
  try {
    const response = await api.fetchData<{ data: { items: Department[] } }>(
      '/v1/department?school_id=' + auth.userData.value?.school?.id
    )
    if (response.data) {
      departmentItems.value = response.data.data.items
    }
  } catch (e) {
    console.error('Error:', e)
    toast.error('Ошибка при загрузке кафедр')
  } finally {
    loading.value = false
  }
}

function openAddDepartmentDialog() {
  isEditing.value = false
  newDepartmentRu.value = ''
  newDepartmentKz.value = ''
  departmentDialog.value = true
}

function openEditDepartmentDialog(department: Department) {
  isEditing.value = true
  editingDepartment.value = department
  newDepartmentRu.value = department.name_ru || department.title
  newDepartmentKz.value = department.name_kz || department.title
  departmentDialog.value = true
}

async function saveDepartment() {
  if (newDepartmentRu.value.trim() === '' || newDepartmentKz.value.trim() === '') {
    toast.error('Заполните оба поля')
    return
  }

  try {
    if (isEditing.value && editingDepartment.value) {
      // Edit existing department
      await api.putData(`/v1/department/${editingDepartment.value.id}`, {
        name_kz: newDepartmentKz.value,
        name_ru: newDepartmentRu.value,
        school_id: auth.userData.value?.school?.id
      })
      toast.success('Кафедра успешно обновлена')
    } else {
      // Add new department
      await api.postData('/v1/department', {
        name_kz: newDepartmentKz.value,
        name_ru: newDepartmentRu.value,
        school_id: auth.userData.value?.school?.id
      })
      toast.success('Кафедра успешно добавлена')
    }

    departmentDialog.value = false
    newDepartmentRu.value = ''
    newDepartmentKz.value = ''
    await fetchDepartments()
  } catch (error) {
    console.error('Error saving department:', error)
    toast.error('Ошибка при сохранении кафедры')
  }
}

async function deleteDepartment(id: number) {
  try {
    await api.deleteData(`/v1/department/${id}`)
    toast.success('Кафедра успешно удалена')
    await fetchDepartments()
  } catch (error) {
    console.error('Error deleting department:', error)
    toast.error('Ошибка при удалении кафедры')
  }
}

// Fetch departments when the drawer is opened
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      fetchDepartments()
    }
  }
)
</script>

<template>
  <v-navigation-drawer v-model="drawer" location="right" temporary width="600">
    <v-list-item>
      <div class="d-flex justify-space-between align-center w-100">
        <span class="font-weight-bold">Кафедра</span>
        <v-btn color="primary" variant="text" @click="openAddDepartmentDialog">
          <v-icon>mdi-plus</v-icon> Добавить
        </v-btn>
      </div>
    </v-list-item>
    <v-divider></v-divider>
    <v-container fluid>
      <v-data-table
        :headers="departmentHeaders"
        :items="departmentItems"
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
              @click="openEditDepartmentDialog(item)"
            ></v-btn>
            <v-btn
              icon="mdi-delete"
              variant="text"
              density="comfortable"
              color="error"
              @click="deleteDepartment(item.id)"
            ></v-btn>
          </div>
        </template>
      </v-data-table>
    </v-container>
  </v-navigation-drawer>

  <v-dialog v-model="departmentDialog" max-width="500px">
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ isEditing ? 'Редактировать' : 'Добавить' }} кафедру</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="newDepartmentRu"
                label="Название кафедры (Русский)"
                required
                variant="outlined"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="newDepartmentKz"
                label="Название кафедры (Казахский)"
                required
                variant="outlined"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="departmentDialog = false">
          Отмена
        </v-btn>
        <v-btn color="blue-darken-1" variant="text" @click="saveDepartment"> Сохранить </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
