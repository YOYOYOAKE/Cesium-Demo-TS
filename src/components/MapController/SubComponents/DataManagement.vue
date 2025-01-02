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
          <el-upload action="null" :before-upload="() => false" :on-change="handleDataUpload" accept=".xls,.xlsx">
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

<script setup lang="ts">
import { useDataStore } from '@/stores/dataStore'
import { storeToRefs } from 'pinia'

const dataStore = useDataStore()

const { dataList } = dataStore

const selectedData: Ref<Array<string>> = ref([])

watch(selectedData, (newValue, oldValue) => {
  const added = newValue.filter(item => !oldValue.includes(item))
  const removed = oldValue.filter(item => !newValue.includes(item))

  if (added.length > 0) {
    dataStore.addData(added[0])
  }
  if (removed.length > 0) {
    dataStore.removeData(removed[0])
  }
})

const isAllowDataUpload: Ref<boolean> = ref(false)

const uploadDataName: Ref<string> = ref('')

const dataSelectRef = useTemplateRef('dataSelectRef')

const emit = defineEmits(['openFileUploader'])

const readFileAsync = (file): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = (ev) => resolve(ev.target.result as ArrayBuffer)
    fileReader.onerror = (error) => reject(error)
    fileReader.readAsArrayBuffer(file.raw)
  })
}

const handleDataUpload = async (dataFile): Promise<void> => {
  if (uploadDataName.value === '') {
    uploadDataName.value = dataFile.raw.name
  }
  try {
    dataList.forEach(data => {
      if (data.name === uploadDataName.value) {
        throw new Error('与现有数据名称重复')
      }
    })

    const loadingMessage = ElMessage({
      message: `正在读取文件“${uploadDataName.value}”`,
      type: 'info',
      duration: 0,
    })

    const buffer: ArrayBuffer = await readFileAsync(dataFile)
    const worker = new Worker(new URL('@/utils/excelWorker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = (event) => {
      const { data } = event

      loadingMessage.close()
      ElMessage.success('文件读取完成')

      const { sheetName, sheetHeaders, sheetContent } = storeToRefs(dataStore)

      sheetName.value = uploadDataName.value
      sheetHeaders.value = data.header
      sheetContent.value = data.content

      dataSelectRef.value.focus()
      dataSelectRef.value.blur()
      emit('openFileUploader')

      uploadDataName.value = ''
    }

    worker.postMessage(buffer)
  } catch (error) {
    console.log(error)
    uploadDataName.value = ''
    ElMessage.error('与现有数据名称重复')
  }
}

</script>

<style lang="less" scoped>
.el-select {
  width: 240px;
  margin-right: 8px;
}
</style>
