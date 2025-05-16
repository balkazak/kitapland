<script lang="ts" setup>
import HelpButton from '@/components/HelpButton.vue'
import { computed, ref, type Ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAPI } from '@/api'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const route = useRoute()
const api = useAPI()
const entities = ref([])
const page = ref(1)
const length = ref(1)
const itemLimit = ref(15)
const headers: Ref<{key: string, title: string}[]> = ref([])

const getEntities = async (entityName: string) => {
  const response = await api.fetchData<{ data: { items: [] }, meta: { last_page: number, per_page: number } }>(
    `/v1/${entityName}?page=${page.value}`
  )
  if (response.data) {
    entities.value = response.data.data.items

    headers.value = getHeaders(entities.value[0])

    if (response.data.meta) {
      length.value = response.data.meta.last_page
      itemLimit.value = response.data.meta.per_page
    } else {
      length.value = 1
      itemLimit.value = 15
    }
  }
}

const getHeaders = (item: never) => {
  let headers = []
  if (item) {
    let keys = Object.keys(item)
    keys.forEach((key) => {
      if (key === 'id') {
        headers.push({ key: 'id', title: 'ID' })
      }
      if (key === 'number') {
        headers.push({ key: 'number', title: 'Номер' })
      }
      if (key === 'title') {
        headers.push({ key: 'title', title: t('name') })
      }
      if (key === 'name') {
        headers.push({ key: 'name', title: t('full_name') })
      }
      if (key === 'label') {
        headers.push({ key: 'label', title: t('name') })
      }
      if (key === 'description') {
        headers.push({ key: 'description', title: 'Описание' })
      }
    })
  }
  headers.push({ key: 'actions', title: t('actions') })
  return headers
}

const entityTitle = computed(() => {
  switch (route.path) {
    case '/publisher':
      return t('publishers')
    case '/language':
      return t('language')
    case '/bookState':
      return t('book_condition')
    case '/author':
      return t('author')
    case '/categories':
      return t('classification')
    case '/bookAdmission':
      return t('reception')
    case '/genre':
      return t('genres')
    case '/ageCharacteristic':
      return t('age_characteristics')
    case '/binding':
      return t('binding')
    case '/contentType':
      return t('content_types')
    case '/copyrightSign':
      return t('copyright_sign')
    case '/organizationTypes':
      return t('organization_types')
    case '/userRoles':
      return t('user_roles')
    case '/country':
      return t('country')
    case '/educationLevel':
      return t('education_level')
    case '/bookType':
      return t('book_types')
    case '/tag':
      return t('keywords')
    case '/material':
      return t('material_designation')
    case '/discipline':
      return t('discipline')
    case '/qualification':
      return t('qualification')
    default:
      return ''
  }
})

watch(page, () => {
  getCurrentPage()
})

watch(route, () => {
  page.value = 1
  getCurrentPage()
})

const deleteEntity = async (id: number, isActive: Ref<boolean>) => {
  let url = '/v1/'
  switch (route.path) {
    case '/publisher':
      url += 'publisher'
      break
    case '/language':
      url += 'language'
      break
    case '/bookState':
      url += 'book/state'
      break
    case '/author':
      url += 'author'
      break
    case '/categories':
      url += 'category'
      break
    case '/bookAdmission':
      url += 'book/admission'
      break
    case '/genre':
      url += 'genre'
      break
    case '/ageCharacteristic':
      url += 'age/characteristic'
      break
    case '/binding':
      url += 'binding'
      break
    case '/contentType':
      url += 'content/type'
      break
    case '/copyrightSign':
      url += 'copyright/sign'
      break
    case '/organizationTypes':
      url += 'organization'
      break
    case '/userRoles':
      url += 'role'
      break
    default:
      break
  }
  url += `/${id}`
  await api.deleteData(url)
  isActive.value = false
  getCurrentPage()
}

const editEntity = async (entity: any, isActive: Ref<boolean>) => {
  let url = '/v1/'
  switch (route.path) {
    case '/publisher':
      url += 'publisher'
      break
    case '/language':
      url += 'language'
      break
    case '/bookState':
      url += 'book/state'
      break
    case '/author':
      url += 'author'
      break
    case '/categories':
      url += 'publisher'
      break
    case '/bookAdmission':
      url += 'book/admission'
      break
    case '/genre':
      url += 'genre'
      break
    case '/ageCharacteristic':
      url += 'age/characteristic'
      break
    case '/binding':
      url += 'binding'
      break
    case '/contentType':
      url += 'content/type'
      break
    case '/copyrightSign':
      url += 'copyright/sign'
      break
    case '/organizationTypes':
      url += 'organization'
      break
    case '/userRoles':
      url += 'role'
      break
    case '/country':
      url += 'country'
      break
    case '/educationLevel':
      url += 'education/level'
      break
    case '/bookType':
      url += 'type'
      break
    case '/tag':
      url += 'tag'
      break
    case '/material':
      url += 'material'
      break
    case '/discipline':
      url += 'discipline'
      break
    case '/qualification':
      url += 'qualification'
      break
    default:
      break
  }
  url += `/${entity.id}`
  await api.putData(url, entity)
  isActive.value = false
  getCurrentPage()
}

const getCurrentPage = () => {
  switch (route.path) {
    case '/publisher':
      getEntities('publisher')
      break
    case '/language':
      getEntities('language')
      break
    case '/bookState':
      getEntities('book/state')
      break
    case '/author':
      getEntities('author')
      break
    case '/categories':
      getEntities('category')
      break
    case '/bookAdmission':
      getEntities('book/admission')
      break
    case '/genre':
      getEntities('genre')
      break
    case '/ageCharacteristic':
      getEntities('age/characteristic')
      break
    case '/binding':
      getEntities('binding')
      break
    case '/contentType':
      getEntities('content/type')
      break
    case '/copyrightSign':
      getEntities('copyright/sign')
      break
    case '/organizationTypes':
      getEntities('organization')
      break
    case '/userRoles':
      getEntities('role')
      break
    case '/country':
      getEntities('country')
      break
    case '/educationLevel':
      getEntities('education/level')
      break
    case '/bookType':
      getEntities('type')
      break
    case '/tag':
      getEntities('tag')
      break
    case '/material':
      getEntities('material')
      break
    case '/discipline':
      getEntities('discipline')
      break
    case '/qualification':
      getEntities('qualification')
      break
    default:
      break
  }
}

interface Item {
  title: string
  description: string
  number: string
  name?: string
}

const newItem = ref<Item>({ title: '', description: '', number: '' })

const createEntity = async (isActive: Ref<boolean>) => {
  let url = '/v1/'
  const entity: { title?: string, description?: string, name?: string, label?: string, number?: string } = {}
  switch (route.path) {
    case '/publisher':
      url += 'publisher'
      entity['title'] = newItem.value.title
      break
    case '/language':
      url += 'language'
      entity['title'] = newItem.value.title
      break
    case '/bookState':
      url += 'book/state'
      entity['title'] = newItem.value.title
      entity['description'] = newItem.value.description
      break
    case '/author':
      url += 'author'
      entity['name'] = newItem.value.title
      break
    case '/categories':
      url += 'category'
      entity['title'] = newItem.value.title
      break
    case '/bookAdmission':
      url += 'book/admission'
      entity['title'] = newItem.value.title
      break
    case '/genre':
      url += 'genre'
      entity['title'] = newItem.value.title
      break
    case '/ageCharacteristic':
      url += 'age/characteristic'
      entity['title'] = newItem.value.title
      break
    case '/binding':
      url += 'binding'
      entity['title'] = newItem.value.title
      break
    case '/contentType':
      url += 'content/type'
      entity['title'] = newItem.value.title
      entity['number'] = newItem.value.number
      break
    case '/copyrightSign':
      url += 'copyright/sign'
      entity['title'] = newItem.value.title
      entity['number'] = newItem.value.number
      break
    case '/organizationTypes':
      url += 'organization'
      entity['label'] = newItem.value.title
      break
    case '/userRoles':
      url += 'role'
      entity['title'] = newItem.value.title
      break
    case '/country':
      url += 'country'
      entity['title'] = newItem.value.title
      break
    case '/educationLevel':
      url += 'education/level'
      entity['title'] = newItem.value.title
      break
    case '/bookType':
      url += 'type'
      entity['title'] = newItem.value.title
      break
    case '/tag':
      url += 'tag'
      entity['label'] = newItem.value.title
      break
    case '/material':
      url += 'material'
      entity['label'] = newItem.value.title
      break
    case '/discipline':
      url += 'discipline'
      entity['title'] = newItem.value.title
      break
    case '/qualification':
      url += 'qualification'
      entity['title'] = newItem.value.title
      break
    default:
      break
  }
  await api.postData(url, entity)
  isActive.value = false
  newItem.value = {
    title: '',
    name: '',
    description: '',
    number: ''
  }
  getCurrentPage()
}

getCurrentPage()
</script>

<template>
  <v-container fluid>
    <v-app-bar>
      <template v-slot:title>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">{{ entityTitle }}</span>
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
              >{{t('add')}}
            </v-btn>
          </template>

          <template v-slot:default="{ isActive }">
            <v-card :title="t('add')">
              <v-card-text>
                <v-text-field
                  v-model="newItem.title"
                  :label="entityTitle === 'Авторы' ? 'Имя' : t('name')"
                ></v-text-field>
                <v-text-field
                  v-if="entityTitle === 'Виды содержания' || entityTitle === 'Авторский знак'"
                  v-model="newItem.number"
                  label="Номер"
                ></v-text-field>
                <v-textarea
                  v-if="entityTitle === 'Состояния книг'"
                  v-model="newItem.description"
                  label="Описание"
                ></v-textarea>
              </v-card-text>
              <v-card-actions>
                <v-btn
                  class="ml-auto"
                  color="primary"
                  variant="flat"
                  @click="createEntity(isActive)"
                  >{{t('yes')}}
                </v-btn>
                <v-btn class="mr-auto" variant="tonal" @click="isActive.value = false">{{ t('cancel') }}</v-btn>
              </v-card-actions>
            </v-card>
          </template>
        </v-dialog>
      </template>
    </v-app-bar>

    <v-row>
      <v-col cols="12">
        <v-data-table :headers="headers" :items="entities" :items-per-page="itemLimit">
          <template v-slot:[`item.actions`]="{ item }">
            <v-dialog width="600">
              <template v-slot:activator="{ props }">
                <v-btn icon="mdi-pencil" size="small" v-bind="props" variant="text"></v-btn>
              </template>

              <template v-slot:default="{ isActive }">
                <v-card title="Изменение">
                  <v-card-text>
                    <v-text-field
                      v-if="item.label"
                      v-model="item.label"
                      :label="t('name')"
                    ></v-text-field>
                    <v-text-field
                      v-if="item.title"
                      v-model="item.title"
                      :label="t('name')"
                    ></v-text-field>
                    <v-text-field v-if="item.name" v-model="item.name" :label="t('full_name')"></v-text-field>
                  </v-card-text>

                  <v-card-actions>
                    <v-btn
                      class="ml-auto"
                      color="primary"
                      variant="flat"
                      @click="editEntity(item, isActive)"
                      >{{t('edit')}}
                    </v-btn>
                    <v-btn class="mr-auto" variant="tonal" @click="isActive.value = false"
                      >Отмена
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </template>
            </v-dialog>

            <v-dialog width="600">
              <template v-slot:activator="{ props }">
                <v-btn
                  color="red"
                  icon="mdi-delete"
                  size="small"
                  v-bind="props"
                  variant="text"
                ></v-btn>
              </template>

              <template v-slot:default="{ isActive }">
                <v-card class="text-center" title="Удаление">
                  <v-card-text class="text-center">
                    Вы уверены что хотите удалить {{ item.label ? item.label : '' }}
                    {{ item.title ? item.title : '' }}
                    {{ item.name ? item.name : '' }}?
                  </v-card-text>
                  <v-card-actions>
                    <v-btn
                      class="ml-auto"
                      color="primary"
                      variant="flat"
                      @click="deleteEntity(item.id, isActive)"
                      >{{t('yes')}}
                    </v-btn>
                    <v-btn class="mr-auto" variant="tonal" @click="isActive.value = false"
                      >Отмена
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </template>
            </v-dialog>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <v-row class="mt-4">
      <v-col cols="12">
        <v-pagination
          v-model="page"
          :length="length"
          :total-visible="6"
          active-color="primary"
          class="ml-auto mr-2"
          size="small"
          variant="flat"
        ></v-pagination>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped></style>
