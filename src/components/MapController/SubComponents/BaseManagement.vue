<template>
  <div>
    <el-select v-model="selectedMap" placeholder="请选择地图样式" size="large" @change="updateLayer(selectedMap)">
      <el-option v-for="(style, index) in baseMapList" :key="index" :label="style.name" :value="style.style" />
    </el-select>

    <el-switch v-if="isShowAnnoSwitch" v-model="isShowAnnoLayer" size="large" inline-prompt active-text="注记显示"
      inactive-text="注记隐藏" @change="updateAnnoLayer" />
  </div>


</template>

<script setup lang="ts">
import { useViewerStore } from '@/stores/viewerStore'

const viewerStore = useViewerStore()

const baseMapList = [
  { name: '高德矢量地图', provider: 'AMap', style: 'elec' },
  { name: '高德影像地图', provider: 'AMap', style: 'img' },
]

const selectedMap: Ref<'img' | 'elec'> = ref('elec')

// For annotation layer switch. The switch will be displayed when mapStyle is 'img', hidden when 'elec'.
const isShowAnnoSwitch: Ref<boolean> = ref(false)

const updateLayer = (mapStyle: 'img' | 'elec'): void => {
  // When base layer is changed, remove the old base layer, include the annotation layer, since base layer and annotation layer are same in Cesium viewer.
  viewerStore.removeAllMap()
  viewerStore.addBaseMap(mapStyle)
  isShowAnnoSwitch.value = mapStyle === 'img'
}

const isShowAnnoLayer: Ref<boolean> = ref(false)

const updateAnnoLayer = (): void => {
  // Not the same with base layer, the change of annotation layer will not remove current base layer.
  if (isShowAnnoLayer.value) {
    viewerStore.addAnnoMap()
  } else {
    viewerStore.removeAnnoMap()
  }
}
</script>

<style lang="less" scoped>
.el-select {
  width: 240px;
  margin-right: 8px;
}
</style>
