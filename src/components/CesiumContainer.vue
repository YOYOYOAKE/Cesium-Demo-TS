<template>
  <div id="cesium-container"></div>
  <MapController />
</template>

<script setup>
import * as Cesium from 'cesium'
import MapController from './MapController/Index.vue'
import { useViewerStore } from '../stores/viewerStore'
import { AMapImageryProvider } from '@cesium-china/cesium-map'

const viewerStore = useViewerStore()

onMounted(() => {
  const viewer = new Cesium.Viewer('cesium-container', {
    geocoder: false,
    homeButton: false,
    fullscreenButton: false,
    animation: false,
    sceneModePicker: false,
    timeline: false,
    navigationHelpButton: false,
    baseLayerPicker: false
  })
  viewer.imageryLayers.removeAll()

  viewer.imageryLayers.add(new Cesium.ImageryLayer(new AMapImageryProvider({
    style: 'elec',
    crs: 'WGS84'
  })))

  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(116.40, 39.92, 20000)
  })

  viewerStore.setCesiumViewer(markRaw(viewer))
})

</script>

<style lang="less" scoped>
#cesium-container {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;

  :deep(.cesium-viewer-bottom) {
    display: none !important;
  }
}
</style>