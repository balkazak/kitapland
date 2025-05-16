<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useAPI } from '@/api'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const api = useAPI()

interface Genre {
  id: number
  title: string
  children?: GenreChild[]
}

interface GenreChild {
  parent_id: number
  child_id: number
  depth: number
  child_genre: {
    id: number
    title: string
  }
}

const emit = defineEmits<{
  (e: 'finish', value: Genre[]): void
}>()

const dialog = ref(false)
const selectedGenres = ref<Genre[]>([])
const genres = ref<Genre[]>([])
const genreLevels = ref<GenreChild[][]>([])
const selectedGenreLevels = ref<(GenreChild | null)[]>([])

const props = defineProps({
  size: {
    type: String,
    default: 'small'
  }
})
async function getGenres(search = null) {
  try {
    let request = `/v1/genre`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: Genre[] } }>(request)
    if (response.data) genres.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getSubGenres(parentId: number, level: number) {
  try {
    const response = await api.fetchData<{ children: GenreChild[] }>(`/v1/genre/${parentId}`)
    if (response.data?.children && response.data.children.length > 0) {
      // Filter out items with depth 0 as they can't have children
      const validChildren = response.data.children.filter((child) => child.depth > 0)
      if (validChildren.length > 0) {
        genreLevels.value[level] = validChildren
        // Clear all subsequent levels
        genreLevels.value.splice(level + 1)
        selectedGenreLevels.value.splice(level + 1)
      }
    }
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

watch(
  () => selectedGenreLevels.value[selectedGenreLevels.value.length - 1],
  async (newValue) => {
    if (newValue && newValue.depth > 0) {
      const currentLevel = selectedGenreLevels.value.length - 1
      await getSubGenres(newValue.child_genre.id, currentLevel + 1)
    }
  }
)

function updateSelectedGenres() {
  // Only use the deepest selected genre
  const lastSelectedGenre = selectedGenreLevels.value[selectedGenreLevels.value.length - 1]

  if (lastSelectedGenre) {
    // If we have a subgenre selected, use that
    selectedGenres.value = [
      {
        id: lastSelectedGenre.child_genre.id,
        title: lastSelectedGenre.child_genre.title
      }
    ]
  } else if (selectedParentGenre.value) {
    // If only parent genre is selected, use that
    selectedGenres.value = [selectedParentGenre.value]
  } else {
    selectedGenres.value = []
  }
}

const selectedParentGenre = ref<Genre | null>(null)

watch(selectedParentGenre, async (newValue) => {
  if (newValue) {
    genreLevels.value = []
    selectedGenreLevels.value = []
    await getSubGenres(newValue.id, 0)
  }
})

function handleFinish() {
  updateSelectedGenres()
  if (selectedGenres.value.length > 0) {
    emit('finish', selectedGenres.value)
  }
  dialog.value = false
  selectedParentGenre.value = null
  genreLevels.value = []
  selectedGenreLevels.value = []
}

function handleOpen() {
  dialog.value = true
  getGenres()
}
</script>

<template>
  <v-btn color="primary" variant="outlined" block @click="handleOpen" :size="size">{{ t('select_genre') }}</v-btn>

  <v-dialog v-model="dialog" max-width="500">
    <v-card>
      <v-card-title>{{ t('select_genres') }}</v-card-title>

      <v-card-text class="pb-0">
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-select
                v-model="selectedParentGenre"
                :items="genres"
                :label="t('parent_genre')"
                return-object
                variant="outlined"
                hide-details
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <!-- {{ item.raw.title }} -->
                  </v-list-item>
                </template>
              </v-select>
            </v-col>
          </v-row>

          <template v-for="(level, index) in genreLevels" :key="index">
            <v-row v-if="level.length">
              <v-col cols="12">
                <v-select
                  v-model="selectedGenreLevels[index]"
                  :items="level"
                  :label="t('sub_genre')"
                  return-object
                  item-title="child_genre.title"
                  item-value="child_genre.id"
                  variant="outlined"
                  hide-details
                >
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props">
                      <!-- {{ item.raw.child_genre.title }} -->
                    </v-list-item>
                  </template>
                  <template v-slot:selection="{ item }">
                    {{ item.raw.child_genre.title }}
                  </template>
                </v-select>
              </v-col>
            </v-row>
          </template>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-btn color="primary" variant="flat" @click="handleFinish">{{ t('select_genre') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
