<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useAPI } from '@/api'
import { Pie } from 'vue-chartjs'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const api = useAPI()

interface BookState {
  amount: string
  books: number
  title: string
}

const bookStates = ref<BookState[]>([])
const loading = ref(false)

const chartData = computed(() => ({
  labels: bookStates.value.map(state => state.title),
  datasets: [{
    backgroundColor: ['#0095FF', '#00E096', '#884DFF', '#E81600', '#FFB547', '#FF6B6B'],
    data: bookStates.value.map(state => state.amount)
  }]
}))

const options = {
  responsive: true,
  maintainAspectRatio: false
}

const getBookStates = async () => {
  loading.value = true
  try {
    const response = await api.fetchData<BookState[]>('/v1/dashboard/book/state')
    if (response.data) {
      bookStates.value = response.data
    }
  } catch (error) {
    console.error('Error fetching book states:', error)
  } finally {
    loading.value = false
  }
}

getBookStates()
</script>

<template>
  <v-card title="Состояние библиотеки">
    <v-card-text>
      <v-row>
        <v-col cols="4">
          <Pie :data="chartData" :options="options"></Pie>
        </v-col>
        <v-col cols="8">
          <v-row>
            <v-col cols="6">
              <template v-for="(state, index) in bookStates" :key="index">
                <div v-if="index < 3" class="mb-6">
                  <div class="font-weight-bold">{{ state.title }}</div>
                  <div class="d-flex flex-column">
                    <div>
                      <v-progress-linear
                        :color="['#0095FF', '#00E096', '#884DFF'][index]"
                        height="8"
                        :max="bookStates.reduce((acc, curr) => acc + Number(curr.amount), 0)"
                        :model-value="Number(state.amount)"
                      ></v-progress-linear>
                    </div>
                    <div>
                      <small class="font-weight-bold">
                        {{ ((Number(state.amount) / bookStates.reduce((acc, curr) => acc + Number(curr.amount), 0)) * 100).toFixed(1) }}%
                      </small><br />
                      <small class="font-weight-bold">Кол-во: {{ state.amount }}</small>
                    </div>
                  </div>
                </div>
              </template>
            </v-col>
            <v-col cols="6">
              <template v-for="(state, index) in bookStates" :key="index">
                <div v-if="index >= 3" class="mb-6">
                  <div class="font-weight-bold">{{ state.title }}</div>
                  <div class="d-flex flex-column">
                    <div>
                      <v-progress-linear
                        :color="['#E81600', '#FFB547', '#FF6B6B'][index - 3]"
                        height="8"
                        :max="bookStates.reduce((acc, curr) => acc + Number(curr.amount), 0)"
                        :model-value="Number(state.amount)"
                      ></v-progress-linear>
                    </div>
                    <div>
                      <small class="font-weight-bold">
                        {{ ((Number(state.amount) / bookStates.reduce((acc, curr) => acc + Number(curr.amount), 0)) * 100).toFixed(1) }}%
                      </small><br />
                      <small class="font-weight-bold">Кол-во: {{ state.amount }}</small>
                    </div>
                  </div>
                </div>
              </template>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template> 