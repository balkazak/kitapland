<script lang="ts" setup>
import AdmissionModalVue from './AdmissionModal.vue'
import RefundModal from './RefundModal.vue'

interface Props {
  statistics: {
    subtitle: string
    color: string
    title: number
    route?: string
    name?: string
  }[]
}

const props = defineProps<Props>()
</script>

<template>
  <v-list class="py-0 rounded elevated" lines="two">
    <v-list-item
      v-for="(item, index) in props.statistics"
      :key="index"
      :style="{ borderLeft: `8px solid ${item.color}` }"
      class="list-border"
    >
      <v-list-item-title class="px-4 my-2">
        <div class="d-flex flex-column items-center">
          <strong>{{ item.title }}</strong>
          <strong :style="{ color: item.color }" class="text-wrap">{{ item.subtitle }}</strong>
        </div>
      </v-list-item-title>

      <template v-slot:append>
        <v-btn
          v-if="!item.name"
          :to="item.route"
          color="primary"
          icon="mdi-chevron-right"
          variant="flat"
        ></v-btn>
        <AdmissionModalVue v-if="item.name === 'admission'"></AdmissionModalVue>
        <RefundModal v-else-if="item.name === 'refund'"></RefundModal>
      </template>
    </v-list-item>
  </v-list>
</template>

<style scoped>
.list-border {
  border-bottom: 2px solid #f2f4f3;
}
</style>
