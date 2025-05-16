<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<script>
import { useAPI } from '@/api'

export default {
  name: 'BkView',
  computed: {
    title() {
      return this.$route.name === 'bbk' ? 'ББК' : 'УДК'
    }
  },
  data() {
    return {
      tableHeaders: [
        { title: 'Номер', key: 'number' },
        { title: t('name'), key: 'title' }
      ],
      tableItems: [],
      loading: true,
      serverItems: [],
      totalItems: 0,
      search: ''
    }
  },
  methods: {
    loadItems({ page }) {
      this.loading = true
      const api = useAPI()
      const requestPath = `/v1/${this.$route.name}?page=${page}`
      api.fetchData(requestPath).then((response) => {
        this.serverItems = response.data.data.items
        this.totalItems = response.data.meta.total
        this.loading = false
      })
    }
  }
}
</script>

<template>
  <v-container fluid class="h-100">
    <v-app-bar>
      <template v-slot:title>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">{{ title }}</span>
        </div>
      </template>

      <template v-slot:append>
        <help-button />
        <v-dialog width="600">
          <template v-slot:activator="{ props }">
            <v-btn
              class="ml-3"
              color="primary"
              prepend-icon="mdi-plus"
              v-bind="props"
              variant="flat"
              >Добавить
            </v-btn>
          </template>

          <template v-slot:default="{ isActive }">
            <v-card title="Добавление">
              <v-card-text>
                <v-text-field></v-text-field>
              </v-card-text>
              <v-card-actions>
                <v-btn class="ml-auto" color="primary" variant="flat">Да, создать </v-btn>
                <v-btn class="mr-auto" variant="tonal" @click="isActive.value = false"
                  >Отмена
                </v-btn>
              </v-card-actions>
            </v-card>
          </template>
        </v-dialog>
      </template>
    </v-app-bar>

    <v-data-table-server
      class="border-sm"
      :headers="tableHeaders"
      :items="serverItems"
      :items-per-page="50"
      :items-length="totalItems"
      :search="search"
      :loading="loading"
      @update:options="loadItems"
    ></v-data-table-server>
  </v-container>
</template>
