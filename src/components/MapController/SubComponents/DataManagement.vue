<script setup lang="ts">
import { useDataStore } from '@/stores/dataStore'
const emit = defineEmits(['openFileUploader'])
const dataStore = useDataStore()

const selectedData: Ref<string> = ref('')

watch(selectedData, (added) => {
  if (added !== '') dataStore.updateData(added)
})

const isAllowDataUpload: Ref<boolean> = ref(false)

const uploadDataName: Ref<string> = ref('')

const readFileAsync = (file): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = (ev) => resolve(ev.target.result as ArrayBuffer)
    fileReader.onerror = (error) => reject(error)
    fileReader.readAsArrayBuffer(file)
  })
}

const { dataList } = dataStore
const dataSelectRef = useTemplateRef('dataSelectRef')

const uploadData = async (elFile): Promise<void> => {
  const nativeFile = elFile.raw
  uploadDataName.value = uploadDataName.value || nativeFile.name

  try {
    dataList.forEach(data => {
      if (data.name === uploadDataName.value) {
        uploadDataName.value = ''
        throw new Error('与现有数据名称重复')
      }
    })

    const loadingMessage = ElNotification({
      title: `正在读取文件“${uploadDataName.value}”`,
      message: '等待过程中您可进行其他操作，读取完成后会在此处通知',
      duration: 0,
    })

    const buffer: ArrayBuffer = await readFileAsync(nativeFile)
    const worker = new Worker(new URL('@/utils/excelWorker.ts', import.meta.url), { type: 'module' })

    worker.onmessage = (event) => {
      loadingMessage.close()
      ElNotification({
        title: `文件“${uploadDataName.value}”读取完成`,
        message: '请继续选择字段',
        type: 'success',
      })

      const { data: { header, content } } = event

      dataStore.setSheet(uploadDataName.value, header, content)

      dataSelectRef.value.focus()
      dataSelectRef.value.blur()
      emit('openFileUploader')

      uploadDataName.value = ''
    }

    worker.postMessage(buffer)

  } catch (error) {
    ElMessage.error(error.message)
  }
}

</script>

<template>
  <div>
    <el-select ref="dataSelectRef" v-model="selectedData" size="large" placeholder="加载或添加数据">
      <el-option v-for="(data, index) in dataList" :key="index" :label="data.name" :value="data.name" />

      <template #footer>
        <el-button v-if="!isAllowDataUpload" text bg size="small" @click="isAllowDataUpload = true">
          添加
        </el-button>

        <template v-else>
          <el-input style="margin-bottom: 8px" v-model="uploadDataName" class="option-input"
            placeholder="数据名（不填则默认为文件名）" size="small" />
          <el-upload action="null" :before-upload="() => false" :on-change="uploadData" accept=".xls,.xlsx">
            <el-button type="primary" size="small">添加</el-button>
            <el-button size="small" @click="isAllowDataUpload = false">
              取消
            </el-button>
          </el-upload>
        </template>
      </template>
    </el-select>
  </div>
</template>

<style lang="less" scoped>
.el-select {
  width: 240px;
  margin-right: 8px;
}
</style>
