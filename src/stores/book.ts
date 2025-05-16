import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBookStore = defineStore('book', () => {
  const bookData = ref({
    title: '',
    title2: '',
    annotation: '',
    pages: null,
    year: null,
    author_id_main: null,
    author_id: [],
    publisher_id: null,
    language_id: [],
    type_id: null,
    ISBN: '',
    genre_id: [],
    country_id: null,
    copyright_sign_id: null,
    age_characteristic_id: null,
    book_classroom: null,
    city_id: null,
    parent_id: null
  })

  function setBookData(data: any) {
    bookData.value = {
      ...bookData.value,
      ...data
    }
  }

  function clearBookData() {
    bookData.value = {
      title: '',
      title2: '',
      annotation: '',
      pages: null,
      year: null,
      author_id_main: null,
      author_id: [],
      publisher_id: null,
      language_id: [],
      type_id: null,
      ISBN: '',
      genre_id: [],
      country_id: null,
      copyright_sign_id: null,
      age_characteristic_id: null,
      book_classroom: null,
      city_id: null,
      parent_id: null
    }
  }

  return {
    bookData,
    setBookData,
    clearBookData
  }
}) 