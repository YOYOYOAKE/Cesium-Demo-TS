<script setup lang="ts">
import { useShpStore } from '@/stores/shpStore'
import { readFileAsync } from '@/utils/fileReader'
import * as shapeFile from 'shapefile'

const shpStore = useShpStore()

const { shpList } = shpStore

const selectedShp: Ref<Array<string>> = ref([])

watch(selectedShp, (newValue, oldValue) => {
  const [added] = newValue.filter(item => !oldValue.includes(item))
  const [removed] = oldValue.filter(item => !newValue.includes(item))

  if (added) shpStore.addShp(added)
  if (removed) shpStore.removeShp(removed)
})

const isAllowShpUpload: Ref<boolean> = ref(false)

const uploadShpName: Ref<string> = ref('')

const handleShpUpload = async (elFile): void => {
  const shpFile = elFile.raw
  uploadShpName.value = uploadShpName.value || shpFile.name

  try {
    shpList.forEach(shp => {
      if (shp.name === uploadShpName.value) {
        uploadShpName.value = ''
        throw new Error('与现有Shp图层名称重复')
      }
    })

    const buffer: ArrayBuffer = await readFileAsync(shpFile)

    shapeFile.read(buffer).then(geoJson => {
      shpStore.createShp({
        name: uploadShpName.value,
        geoJson: geoJson,
      })
      uploadShpName.value = ''
    })
  } catch (error) {
    ElMessage.error(error.message)
  }
}
</script>

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

<style lang="less" scoped>
.el-select {
  width: 240px;
  margin-right: 8px;
}
</style>
