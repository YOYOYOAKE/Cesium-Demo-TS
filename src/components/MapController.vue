<script setup lang="ts">
import {Ref, ref, watch} from 'vue'
import {useViewerStore} from '../stores/viewerStore'
import * as shapeFile from 'shapefile'
import * as xlsx from 'XLSX'

const viewerStore = useViewerStore()

// region Drawer Open/Close

const isDrawerOpen: Ref<boolean> = ref(false)

// endregion

// region Base Layer

const baseMapList = [
  {name: '高德矢量地图', provider: 'AMap', style: 'elec'},
  {name: '高德影像地图', provider: 'AMap', style: 'img'},
]

const selectedMap: Ref<'img' | 'elec'> = ref('elec')

// For annotation layer switch. The switch will be displayed when mapStyle is 'img', hidden when 'elec'.
const isShowAnnoSwitch: Ref<boolean> = ref(false)

const updateLayer = (mapStyle: 'img' | 'elec'): void => {
  // When base layer is changed, remove the old base layer, include the annotation layer, since base layer and annotation layer are same in Cesium viewer.
  viewerStore.removeAllMap()
  viewerStore.addBaseMap(mapStyle)
  isShowAnnoSwitch.value = (mapStyle === 'img')
}

// endregion

// region Annotation Layer

const isShowAnnoLayer: Ref<boolean> = ref(false)

const updateAnnoLayer = (): void => {
  // Not the same with base layer, the change of annotation layer will not remove current base layer.
  if (isShowAnnoLayer.value) {
    viewerStore.addAnnoMap()
  } else {
    viewerStore.removeAnnoMap()
  }
}

// endregion

// region Shp Management

const {shpList} = viewerStore

const selectedShp: Ref<Array<string>> = ref([])

watch(selectedShp, (newValue, oldValue) => {
  const added = newValue.filter(item => !oldValue.includes(item))
  if (added.length > 0) {
    viewerStore.addShp(added[0])
  }

  const removed = oldValue.filter(item => !newValue.includes(item))
  if (removed.length > 0) {
    viewerStore.removeShp(removed[0])
  }
})

const isAllowShpUpload: Ref<boolean> = ref(false)

const uploadShpName: Ref<string> = ref('')

const handleShpUpload = (shpFile: { raw: File, [key: string]: any }): void => {

  if (uploadShpName.value === '') {
    uploadShpName.value = shpFile.raw.name
  }

  try {
    shpList.forEach((shp) => {
      if (shp.name === uploadShpName.value) {
        throw new Error('与现有Shp图层名称重复')
      }
    })
    const fileReader = new FileReader()
    fileReader.readAsArrayBuffer(shpFile.raw)
    fileReader.onload = (ev) => {
      shapeFile.read(ev.target?.result as ArrayBuffer).then((geoJson) => {
        viewerStore.createShp({
          name: uploadShpName.value,
          geoJson: geoJson,
        })
        uploadShpName.value = ''
      })
    }
  } catch (error) {
    uploadShpName.value = ''
    ElMessage.error('与现有Shp图层名称重复')
  }
}

// endregion

// region GeoData Management

const {dataList} = viewerStore

const selectedData: Ref<Array<string>> = ref([])

watch(selectedData, (newValue, oldValue) => {
  const added = newValue.filter(item => !oldValue.includes(item))
  if (added.length > 0) {
    viewerStore.addData(added[0])
  }

  const removed = oldValue.filter(item => !newValue.includes(item))
  if (removed.length > 0) {
    viewerStore.removeData(removed[0])
  }
})

const isAllowDataUpload: Ref<boolean> = ref(false)

const uploadDataName: Ref<string> = ref('')

const handleDataUpload = (dataFile: { raw: File, [key: string]: any }): void => {

  if (uploadDataName.value === '') {
    uploadDataName.value = dataFile.raw.name
  }

  try {
    dataList.forEach((data) => {
      if (data.name === uploadDataName.value) {
        throw new Error('与现有数据名称重复')
      }
    })

    // ElMessage.info('正在读取文件')

    const loadingMessage = ElMessage({
      message: '正在读取文件',
      type:'info',
      duration: 0,
    })

    const fileReader = new FileReader()

    fileReader.readAsArrayBuffer(dataFile.raw)
    fileReader.onload = (ev) => {
      const workbook = xlsx.read(ev.target?.result, {type: 'array'})
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const data = xlsx.utils.sheet_to_json(worksheet, {header: 1})
      console.log(data)
      loadingMessage.close()
      ElMessage.success('文件读取完成')

    }


  } catch (error) {
    uploadShpName.value = ''
    ElMessage.error('与现有数据名称重复')
  }
}


// endregion

</script>

<template>

  <el-drawer v-model="isDrawerOpen"
             title="Cesium Demo"
             direction="ltr">

    <!-- 底图管理 -->
    <el-divider content-position="left">底图管理</el-divider>
    <div>
      <el-select v-model="selectedMap"
                 placeholder="请选择地图样式"
                 size="large"
                 @change="updateLayer(selectedMap)">
        <el-option v-for="(style,index) in baseMapList"
                   :key="index"
                   :label="style.name"
                   :value="style.style"/>
      </el-select>

      <el-switch v-if="isShowAnnoSwitch"
                 v-model="isShowAnnoLayer"
                 size="large"
                 inline-prompt
                 active-text="注记显示"
                 inactive-text="注记隐藏"
                 @change="updateAnnoLayer"/>
    </div>

    <!-- Shp图层 -->
    <el-divider content-position="left">Shp图层管理</el-divider>
    <div>
      <el-select v-model="selectedShp"
                 multiple collapse-tags collapse-tags-tooltip
                 :max-collapse-tags="1"
                 size="large"
                 placeholder="加载或添加Shp图层">
        <el-option v-for="(shp,index) in shpList"
                   :key="index"
                   :label="shp.name"
                   :value="shp.name"/>

        <template #footer>
          <el-button v-if="!isAllowShpUpload"
                     text bg size="small"
                     @click="()=>{isAllowShpUpload = true}">
            添加
          </el-button>

          <template v-else>
            <el-input style="margin-bottom: 8px"
                      v-model="uploadShpName"
                      class="option-input"
                      placeholder="Shp图层名（不填则默认为文件名）"
                      size="small"/>
            <el-upload action="null"
                       :before-upload="()=>false"
                       :on-change="handleShpUpload"
                       accept=".shp">
              <el-button type="primary" size="small">添加</el-button>
              <el-button size="small" @click="()=>{isAllowShpUpload = false}">取消</el-button>
            </el-upload>
          </template>
        </template>
      </el-select>
    </div>

    <!-- 数据管理 -->
    <el-divider v-if="false" content-position="left">数据管理</el-divider>
    <div v-if="false">
      <el-select v-model="selectedShp"
                 size="large"
                 placeholder="加载或添加数据">
        <el-option v-for="(data,index) in dataList"
                   :key="index"
                   :label="data.name"
                   :value="data.name"/>

        <template #footer>
          <el-button v-if="!isAllowDataUpload"
                     text bg size="small"
                     @click="()=>{isAllowDataUpload = true}">
            添加
          </el-button>

          <template v-else>
            <el-input style="margin-bottom: 8px"
                      v-model="uploadDataName"
                      class="option-input"
                      placeholder="数据名（不填则默认为文件名）"
                      size="small"/>
            <el-upload action="null"
                       :before-upload="()=>false"
                       :on-change="handleDataUpload"
                       accept=".xls,.xlsx">
              <el-button type="primary" size="small">添加</el-button>
              <el-button size="small" @click="()=>{isAllowDataUpload = false}">取消</el-button>
            </el-upload>
          </template>
        </template>
      </el-select>
    </div>


  </el-drawer>

  <el-button id="drawer-switch"
             type="primary"
             circle
             size="large"
             @click="isDrawerOpen = true">
    <el-icon size="24px">
      <i-ep-Tools/>
    </el-icon>
  </el-button>


</template>

<style scoped>
#drawer-switch {
  position: absolute;
  top: 24px;
  left: 24px;
}

.el-select {
  width: 240px;
  margin-right: 8px;
}

</style>