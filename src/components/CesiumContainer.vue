<script setup>
import * as Cesium from 'cesium'
import MapController from '@/components/MapController/Index.vue'
import { AMapImageryProvider } from '@cesium-china/cesium-map'

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

  // 设置相机的最小和最大距离
  viewer.scene.screenSpaceCameraController.minimumZoomDistance = 350
  viewer.scene.screenSpaceCameraController.maximumZoomDistance = 300000

  // 是否开启抗锯齿
  const isEnableFxaa = JSON.parse(localStorage.getItem('YOYOGeoViewer-Options-isEnableFxaa'))

  if (isEnableFxaa ) {
    ElMessage.info('已开启抗锯齿')
    //判断是否支持图像渲染像素化处理
    if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
      viewer.resolutionScale = window.devicePixelRatio
    }
    viewer.scene.fxaa = true
    viewer.scene.postProcessStages.fxaa.enabled = true
  }



  // 将CesiumViewer实例挂在到window全局对象上
  window.CesiumViewer = viewer
})
</script>

<template>
  <div id="cesium-container"></div>
  <MapController />
</template>

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