import {defineStore} from 'pinia'
import {Ref, ref} from 'vue'

export const useDataStore = defineStore('dataStore',
  () => {
    const isFileUploaderShow: Ref<boolean> = ref(false)

    return {
      isFileUploaderShow,
    }
  })