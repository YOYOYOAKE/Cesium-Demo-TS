import { defineStore } from 'pinia'

export const useDataStore = defineStore('dataStore',
  () => {

    const sheetHeaders: Ref<Array<string>> = ref([])
    const sheetContent: Ref<Array<Array<string>>> = ref([])

    return {
      sheetHeaders,
      sheetContent
    }
  })