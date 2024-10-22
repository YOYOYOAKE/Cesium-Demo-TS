<script setup lang="ts">
// import {useDataStore} from '../stores/dataStore'
// import {storeToRefs} from 'pinia'
import { ref } from 'vue'

// const dataStore = useDataStore()

// const {isFileUploaderShow} = storeToRefs(dataStore)

const isFileUploaderShow = ref(false)

const closeDialog = () => {
  isFileUploaderShow.value = false
}

const handleUpload = () => {
  console.log('上传数据')
  closeDialog()
}

const handleCancel = () => {
  console.log('取消上传')
  closeDialog()
}

const childData = ref('childData')
const childMethod = () => {
  console.log('Child method called')
}

defineExpose({
  childData,
  childMethod,
})

</script>

<template>

  <el-dialog :v-model="isFileUploaderShow" title="Tips" width="500" :before-close="handleCancel">
    <span>This is a message</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleUpload">上传</el-button>
      </div>
    </template>
  </el-dialog>

</template>

<style scoped></style>