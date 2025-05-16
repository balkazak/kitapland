// api.ts
import axios, { type AxiosResponse } from 'axios'
import { ref, type Ref } from 'vue'
import { useAuth } from '@/auth/index'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
const host = import.meta.env.VITE_APP_API

interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export function useAPI() {
  const { token } = useAuth()
  const router = useRouter()

  function handleError(err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      router.push('/login')
      return new Error('Не авторизован')
    }
    if (axios.isAxiosError(err)) {
      return new Error(err.response?.data?.message || err.message)
    }
    return new Error('Произошла ошибка')
  }

  async function postData<T, U>(url: string, postData: T, blob?: boolean): Promise<ApiResponse<U>> {
    const data: Ref<U | null> = ref(null)
    const error: Ref<string | null> = ref(null)

    try {
      const config: any = {}
      if (blob) {
        config.responseType = 'blob'
      }
      config.headers = {
        'Content-Type': postData instanceof FormData ? 'multipart/form-data' : 'application/json',
        ...(token.value ? { Authorization: `Bearer ${token.value.token}` } : {})
      }
      const response: AxiosResponse<U> = await axios.post(host + url, postData, config)
      data.value = response.data
    } catch (err) {
      throw handleError(err)
    }

    return { data: data.value, error: error.value }
  }

  async function fetchData<T>(url: string): Promise<ApiResponse<T>> {
    const data: Ref<T | null> = ref(null)
    const error: Ref<string | null> = ref(null)

    try {
      const config = token.value
        ? { headers: { Authorization: `Bearer ${token.value.token}`, 'Accept-Language': 'ru' } }
        : { 'Accept-Language': 'ru' }
      const response: AxiosResponse<T> = await axios.get(host + url, config)
      data.value = response.data
    } catch (err) {
      throw handleError(err)
    }

    return { data: data.value, error: error.value }
  }

  async function fetchFile(url: string, body = {}) {
    try {
      const response = await axios({
        url: host + url,
        method: 'POST',
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token.value?.token}` },
        data: body
      })

      return response
    } catch (error) {
      console.error('Error downloading the PDF:', error)
    }
  }

  async function fetchFileGet(url: string) {
    try {
      const response = await axios({
        url: host + url,
        method: 'GET',
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token.value?.token}` }
      })

      return response
    } catch (error) {
      console.error('Error downloading the PDF:', error)
    }
  }

  async function deleteData<U>(url: string): Promise<ApiResponse<U>> {
    const data: Ref<U | null> = ref(null)
    const error: Ref<string | null> = ref(null)

    try {
      const config = token.value
        ? { headers: { Authorization: `Bearer ${token.value.token}`, 'Accept-Language': 'ru' } }
        : { 'Accept-Language': 'ru' }
      const response: AxiosResponse<U> = await axios.delete(host + url, config)
      data.value = response.data
    } catch (err) {
      error.value = 'Error posting data'
      console.error('Error posting data:', err)
    }

    return { data: data.value, error: error.value }
  }

  async function patchData<T, U>(url: string, patchData: T): Promise<ApiResponse<U>> {
    const data = ref<U | null>(null)
    const error = ref<string | null>(null)

    try {
      const config = token.value
        ? { headers: { Authorization: `Bearer ${token.value.token}`, 'Accept-Language': 'ru' } }
        : { 'Accept-Language': 'ru' }
      const response: AxiosResponse<U> = await axios.patch(host + url, patchData, config)
      data.value = response.data
    } catch (err) {
      throw handleError(err)
    }

    return { data: data.value, error: error.value }
  }

  async function putData<T, U>(url: string, putData: T): Promise<ApiResponse<U>> {
    const data = ref<U | null>(null)
    const error = ref<string | null>(null)

    try {
      const config = token.value
        ? { headers: { Authorization: `Bearer ${token.value.token}`, 'Accept-Language': 'ru' } }
        : { 'Accept-Language': 'ru' }
      const response: AxiosResponse<U> = await axios.put(host + url, putData, config)
      data.value = response.data
    } catch (err) {
      throw handleError(err)
    }

    return { data: data.value, error: error.value }
  }

  // async function postData<T, R>(url: string, data: T | FormData): Promise<AxiosResponse<R>> {
  //   const headers =
  //     data instanceof FormData
  //       ? { 'Content-Type': 'multipart/form-data' }
  //       : { 'Content-Type': 'application/json' }

  //   return await axios.post(`${host}${url}`, data, { headers })
  // }

  return {
    fetchData,
    postData,
    deleteData,
    patchData,
    putData,
    fetchFile,
    fetchFileGet
  }
}
