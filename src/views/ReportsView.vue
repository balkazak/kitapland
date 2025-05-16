<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAPI } from '@/api'
import fileDownload from 'js-file-download'
import report1 from '@/assets/reports/1.png'
import report2 from '@/assets/reports/2.png'
import report3 from '@/assets/reports/3.png'
import report4 from '@/assets/reports/4.png'
import report5 from '@/assets/reports/5.png'
import report6 from '@/assets/reports/6.png'
import report7 from '@/assets/reports/7.png'
import report8 from '@/assets/reports/8.png'
import report9 from '@/assets/reports/9.png'
import report10 from '@/assets/reports/10.png'
import report11 from '@/assets/reports/11.png'
import report12 from '@/assets/reports/12.png'
const { t } = useI18n()
import { vMaska } from "maska/vue"

const page = ref(1)
const length = ref(4)
const pageInput = ref(1)
const selectedImage = ref('')
const showImageDialog = ref(false)
const fromDate = ref('')
const toDate = ref('')
const selectedPeriod = ref('all')

const periodOptions = [
  { value: 'all', title: 'За весь период' },
  { value: 'custom', title: 'Произвольный' },
  { value: 'monthly', title: 'Ежемесячный' },
  { value: 'quarterly', title: 'Ежеквартальный' },
  { value: 'yearly', title: 'Ежегодный' }
]

const updateDatesByPeriod = (useCustomToDate = false) => {
  let endDate
  
  if (selectedPeriod.value === 'custom') {
    return
  }
  
  if (useCustomToDate && toDate.value) {
    const parts = toDate.value.split('.')
    if (parts.length === 3) {
      endDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]))
      if (isNaN(endDate.getTime())) {
        endDate = new Date()
      }
    } else {
      endDate = new Date()
    }
  } else {
    endDate = new Date()
    toDate.value = formatDate(endDate)
  }
  
  if (selectedPeriod.value === 'monthly') {
    const startDate = new Date(endDate)
    startDate.setMonth(endDate.getMonth() - 1)
    fromDate.value = formatDate(startDate)
  } else if (selectedPeriod.value === 'quarterly') {
    const startDate = new Date(endDate)
    startDate.setMonth(endDate.getMonth() - 3)
    fromDate.value = formatDate(startDate)
  } else if (selectedPeriod.value === 'yearly') {
    const startDate = new Date(endDate)
    startDate.setFullYear(endDate.getFullYear() - 1)
    fromDate.value = formatDate(startDate)
  }
}

const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}

watch(toDate, () => {
  if (toDate.value && toDate.value.length === 10 && selectedPeriod.value !== 'custom') {
    updateDatesByPeriod(true)
  }
})

watch(selectedPeriod, (newValue) => {
  if (newValue !== 'custom') {
    updateDatesByPeriod()
  }
})

watch(fromDate, () => {
  if (fromDate.value && fromDate.value.length === 10 && selectedPeriod.value !== 'custom') {
    calculateEndDate()
  }
})

const calculateEndDate = () => {
  if (selectedPeriod.value === 'custom') {
    return
  }
  
  if (fromDate.value) {
    const parts = fromDate.value.split('.')
    if (parts.length === 3) {
      const startDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]))
      if (!isNaN(startDate.getTime())) {
        if (selectedPeriod.value === 'monthly') {
          const endDate = new Date(startDate)
          endDate.setMonth(startDate.getMonth() + 1)
          toDate.value = formatDate(endDate)
        } else if (selectedPeriod.value === 'quarterly') {
          const endDate = new Date(startDate)
          endDate.setMonth(startDate.getMonth() + 3)
          toDate.value = formatDate(endDate)
        } else if (selectedPeriod.value === 'yearly') {
          const endDate = new Date(startDate)
          endDate.setFullYear(startDate.getFullYear() + 1)
          toDate.value = formatDate(endDate)
        }
      }
    }
  }
}

const reports = ref([
  {
    id: 1,
    title: 'fund_publisher_report',
    subtitle: 'description',
    image: report1
  },
  {
    id: 2,
    title: 'fund_admission_list',
    subtitle: 'description',
    image: report2
  },
  {
    id: 3,
    title: 'fund_list',
    subtitle: 'description',
    image: report3
  },
  {
    id: 4,
    title: 'fund_main_list',
    subtitle: 'description',
    image: report4
  },
  {
    id: 5,
    title: 'fund_textbook_list',
    subtitle: 'description',
    image: report5
  },
  {
    id: 6,
    title: 'contractor',
    subtitle: 'description',
    image: report6
  },
  {
    id: 7,
    title: 'subscription_full_list',
    subtitle: 'description',
    image: report7
  },
  {
    id: 8,
    title: 'subscription_class_teacher',
    subtitle: 'description',
    image: report8
  },
  {
    id: 9,
    title: 'subscription_students',
    subtitle: 'description',
    image: report9
  },
  {
    id: 10,
    title: 'subscription_school_staff',
    subtitle: 'description',
    image: report10
  },
  {
    id: 11,
    title: 'inventory_list',
    subtitle: 'description',
    image: report11
  },
  {
    id: 12,
    title: 'inventory_written_off_list',
    subtitle: 'description',
    image: report12
  }
])

const api = useAPI()

function goToPage() {
  const pageNum = Number(pageInput.value)
  if (pageNum >= 1 && pageNum <= length.value) {
    page.value = pageNum
  } else {
    pageInput.value = page.value
  }
}

const downloadReport = async (type: 'excel' | 'pdf', reportId: number) => {
  try {
    const params: any = { format: type }
    if (selectedPeriod.value !== 'all') {
      if (fromDate.value) params.from = fromDate.value
      if (toDate.value) params.to = toDate.value
    }

    if (reportId === 1) {
      const response = await api.postData(
        '/v1/book/school/publisher/report',
        params,
        true
      )
      if (response.data) {
        if (type === 'excel') {
          fileDownload(response.data as Blob, `Фонд: Отчет по издателям.xlsx`)
        } else {
          fileDownload(response.data as Blob, `Фонд: Отчет по издателям.pdf`)
        }
      }
    } else if (reportId === 2) {
      const response = await api.postData(
        '/v1/book/school/admission/report',
        params,
        true
      )
      if (response.data) {
        if (type === 'excel') {
          fileDownload(response.data as Blob, `Фонд: Список поступлений.xlsx`)
        } else {
          fileDownload(response.data as Blob, `Фонд: Список поступлений.pdf`)
        }
      }
    } else if (reportId === 3) {
      const response = await api.postData('/v1/book/school/book/report', params, true)
      if (response.data) {
        if (type === 'excel') {
          fileDownload(response.data as Blob, `Фонд: Список фонда.xlsx`)
        } else {
          fileDownload(response.data as Blob, `Фонд: Список фонда.pdf`)
        }
      }
    } else if (reportId === 4) {
      const response = await api.postData(
        '/v1/book/school/book/report?type_id=17',
        params,
        true
      )
      if (response.data) {
        if (type === 'excel') {
          fileDownload(response.data as Blob, `Фонд: Список основного фонда.xlsx`)
        } else {
          fileDownload(response.data as Blob, `Фонд: Список основного фонда.pdf`)
        }
      }
    } else if (reportId === 5) {
      const response = await api.postData(
        '/v1/book/school/book/report?type_id=1',
        params,
        true
      )
      if (response.data) {
        if (type === 'excel') {
          fileDownload(response.data as Blob, `Фонд: Список учебников.xlsx`)
        } else {
          fileDownload(response.data as Blob, `Фонд: Список учебников.pdf`)
        }
      }
    } else if (reportId === 6) {
      const response = await api.postData(
        '/v1/book/school/contractor/report',
        params,
        true
      )
      if (response.data) {
        if (type === 'excel') {
          fileDownload(response.data as Blob, `Контрагент.xlsx`)
        } else {
          fileDownload(response.data as Blob, `Контрагент.pdf`)
        }
      }
    } else if (reportId === 7) {
      const response = await api.postData('/v1/user/user/report', params, true)
      if (response.data) {
        if (type === 'excel') {
          fileDownload(response.data as Blob, `Абонемент: Весь список.xlsx`)
        } else {
          fileDownload(response.data as Blob, `Абонемент: Весь список.pdf`)
        }
      }
    } else if (reportId === 8) {
      const response = await api.postData('/v1/user/user/report?role_id=4', params, true)
      if (response.data) {
        if (type === 'excel') {
          fileDownload(response.data as Blob, `Абонемент: Классный руководитель.xlsx`)
        } else {
          fileDownload(response.data as Blob, `Абонемент: Классный руководитель.pdf`)
        }
      }
    } else if (reportId === 9) {
      const response = await api.postData('/v1/user/user/report?role_id=5', params, true)
      if (response.data) {
        if (type === 'excel') {
          fileDownload(response.data as Blob, `Абонемент: Школьники.xlsx`)
        } else {
          fileDownload(response.data as Blob, `Абонемент: Школьники.pdf`)
        }
      }
    } else if (reportId === 10) {
      const response = await api.postData('/v1/user/user/report?role_id=6', params, true)
      if (response.data) {
        if (type === 'excel') {
          fileDownload(response.data as Blob, `Абонемент: Сотрудники школы.xlsx`)
        } else {
          fileDownload(response.data as Blob, `Абонемент: Сотрудники школы.pdf`)
        }
      }
    } else if (reportId === 11) {
      const response = await api.postData(
        '/v1/book/school/inventory/report',
        params,
        true
      )
      if (response.data) {
        if (type === 'excel') {
          fileDownload(response.data as Blob, `Инвентарный учет: Список инвентаризации.xlsx`)
        } else {
          fileDownload(response.data as Blob, `Инвентарный учет: Список инвентаризации.pdf`)
        }
      }
    } else if (reportId === 12) {
      const response = await api.postData(
        '/v1/book/school/inventory/decommissioned/report',
        params,
        true
      )
      if (response.data) {
        if (type === 'excel') {
          fileDownload(response.data as Blob, `Инвентарный учет: Список списанных книг.xlsx`)
        } else {
          fileDownload(response.data as Blob, `Инвентарный учет: Список списанных книг.pdf`)
        }
      }
    }
  } catch (error) {
    console.error('Error downloading report:', error)
  }
}

const openImageDialog = (image: string) => {
  selectedImage.value = image
  showImageDialog.value = true
}

const initializeDates = () => {
  if (selectedPeriod.value === 'custom') {
    // For custom period, leave dates empty initially
    fromDate.value = ''
    toDate.value = ''
  } else {
    updateDatesByPeriod()
  }
}

const showDateInputs = computed(() => selectedPeriod.value !== 'all')

initializeDates()
</script>

<template>
  <v-container class="pa-0" fluid>
    <!-- Image Dialog -->
    <v-dialog v-model="showImageDialog" max-width="800">
      <v-card>
        <v-card-text class="pa-0">
          <v-img :src="selectedImage" contain height="80vh" class="bg-grey-lighten-2"></v-img>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="showImageDialog = false">{{
            t('close')
          }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-app-bar class="px-4 mb-4" color="white" flat>
      <template v-slot:title>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">{{ t('document_generation') }}</span>
          <span class="text-subtitle-2 text-medium-emphasis">{{
            t('fund_report_generation')
          }}</span>
        </div>
      </template>

      <template v-slot:append>
        <div class="d-flex align-center gap-2">
          <h5 class="text-subtitle-2 text-medium-emphasis">{{ t('reports_date_title') }}</h5>
          <v-select
            v-model="selectedPeriod"
            :items="periodOptions"
            item-title="title"
            item-value="value"
            variant="outlined"
            density="compact"
            hide-details
            style="width: 180px"
            @update:model-value="updateDatesByPeriod"
          ></v-select>
          <template v-if="showDateInputs">
            <v-text-field
              v-model="fromDate"
              :label="t('from_date')"
              variant="outlined"
              density="compact"
              hide-details
              style="width: 150px"
              v-maska="'##.##.####'"
              placeholder="дд.мм.гггг"
            ></v-text-field>
            <v-text-field
              v-model="toDate"
              :label="t('to_date')"
              variant="outlined"
              density="compact"
              hide-details
              style="width: 150px"
              v-maska="'##.##.####'"
              placeholder="дд.мм.гггг"
            ></v-text-field>
          </template>
          <v-btn class="ml-2" color="primary" prepend-icon="mdi-help-circle-outline" variant="flat">
            {{ t('help') }}
          </v-btn>
        </div>
      </template>
    </v-app-bar>

    <v-card class="mx-4 my-4" flat>
      <v-card-text>
        <v-row>
          <v-col v-for="report in reports" :key="report.id" cols="12" md="6">
            <v-sheet class="d-flex my-2 report-item" height="120" rounded="lg" border>
              <v-img
                class="bg-grey-lighten-2 rounded-lg cursor-pointer"
                width="160"
                height="120"
                cover
                style="min-width: 160px; max-width: 160px"
                :src="report.image"
                @click="openImageDialog(report.image)"
              ></v-img>
              <div class="d-flex flex-column flex-grow-1 justify-space-between pl-4">
                <div class="mb-auto">
                  <div class="text-h6 font-weight-bold">{{ t(report.title) }}</div>
                  <div class="text-subtitle-2 text-grey mt-1">{{ t(report.subtitle) }}</div>
                </div>
                <div class="d-flex gap-2">
                  <v-btn
                    density="comfortable"
                    prepend-icon="mdi-microsoft-excel"
                    variant="flat"
                    class="bg-grey-lighten-4 text-capitalize"
                    @click="downloadReport('excel', report.id)"
                  >
                    {{ t('download_excel') }}
                  </v-btn>
                  <v-btn
                    density="comfortable"
                    prepend-icon="mdi-file-pdf-box"
                    variant="flat"
                    class="bg-grey-lighten-4 text-capitalize"
                    @click="downloadReport('pdf', report.id)"
                  >
                    {{ t('download_pdf') }}
                  </v-btn>
                </div>
              </div>
            </v-sheet>
          </v-col>
        </v-row>

        <!-- <v-row class="mt-4">
          <v-pagination
            v-model="page"
            :length="length"
            :total-visible="6"
            active-color="primary"
            class="ml-auto"
            size="small"
            variant="flat"
          ></v-pagination>

          <div class="d-flex align-center mr-2">
            <v-text-field
              v-model="pageInput"
              :min="1"
              :max="length"
              density="compact"
              hide-details
              class="mx-2"
              style="width: 120px"
              variant="outlined"
            >
              <template v-slot:append>
                <v-tooltip
                  :model-value="pageInput < 1 || pageInput > length"
                  location="bottom"
                  :text="`Введите число от 1 до ${length}`"
                >
                  <template v-slot:activator="{ props }">
                    <v-icon
                      v-bind="props"
                      color="error"
                      icon="mdi-alert-circle"
                      v-show="pageInput < 1 || pageInput > length"
                    ></v-icon>
                  </template>
                </v-tooltip>
              </template>
            </v-text-field>
            <v-btn
              icon="mdi-magnify"
              size="small"
              variant="flat"
              @click="goToPage"
              class="rounded-0"
            ></v-btn>
          </div>
        </v-row> -->
      </v-card-text>
    </v-card>
  </v-container>
</template>

<style scoped>
.gap-2 {
  gap: 16px;
}

.cursor-pointer {
  cursor: pointer;
}

.report-item {
  border: 1px solid #e0e0e0 !important;
  transition: all 0.2s ease-in-out;
  padding: 16px 8px;
}

.report-item:hover {
  border-color: #1976d2 !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
