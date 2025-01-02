<template>

  <div>
    <el-select v-model="selectedShp" multiple collapse-tags collapse-tags-tooltip :max-collapse-tags="1" size="large"
      placeholder="加载或添加Shp图层">
      <el-option v-for="(shp, index) in shpList" :key="index" :label="shp.name" :value="shp.name" />

      <template #footer>
        <el-button v-if="!isAllowShpUpload" text bg size="small" @click="isAllowShpUpload = true">
          添加
        </el-button>

        <template v-else>
          <el-input style="margin-bottom: 8px" v-model="uploadShpName" class="option-input"
            placeholder="Shp图层名（不填则默认为文件名）" size="small" />
          <el-upload action="null" :before-upload="() => false" :on-change="handleShpUpload" accept=".shp">
            <el-button type="primary" size="small">添加</el-button>
            <el-button size="small" @click="isAllowShpUpload = false">
              取消
            </el-button>
          </el-upload>
        </template>
      </template>
    </el-select>
  </div>
</template>

<script setup lang="ts">
import { useShpStore } from '@/stores/shpStore'
import * as shapeFile from 'shapefile'
const shpStore = useShpStore()


const { shpList } = shpStore

const selectedShp: Ref<Array<string>> = ref([])

watch(selectedShp, (newValue, oldValue) => {
  const added = newValue.filter(item => !oldValue.includes(item))
  if (added.length > 0) {
    shpStore.addShp(added[0])
  }

  const removed = oldValue.filter(item => !newValue.includes(item))
  if (removed.length > 0) {
    shpStore.removeShp(removed[0])
  }
})

const isAllowShpUpload: Ref<boolean> = ref(false)

const uploadShpName: Ref<string> = ref('')

const handleShpUpload = (shpFile): void => {
  if (uploadShpName.value === '') {
    uploadShpName.value = shpFile.raw.name
  }

  try {
    shpList.forEach(shp => {
      if (shp.name === uploadShpName.value) {
        throw new Error('与现有Shp图层名称重复')
      }
    })
    const fileReader = new FileReader()
    fileReader.readAsArrayBuffer(shpFile.raw)
    fileReader.onload = ev => {
      shapeFile.read(ev.target?.result as ArrayBuffer).then(geoJson => {
        shpStore.createShp({
          name: uploadShpName.value,
          geoJson: geoJson,
        })
        uploadShpName.value = ''
      })
    }
  } catch (error) {
    console.log(error)
    uploadShpName.value = ''
    ElMessage.error('与现有Shp图层名称重复')
  }
}
</script>

<style lang="less" scoped>
.el-select {
  width: 240px;
  margin-right: 8px;
}
</style>
