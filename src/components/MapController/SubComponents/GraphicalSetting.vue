<script setup lang="ts">

const isEnableFxaa: Ref<boolean> = ref(JSON.parse(localStorage.getItem('YOYOGeoViewer-Options-isEnableFxaa') || 'false'))

const isCancelling = ref(false)

watch(isEnableFxaa, (newValue, oldValue) => {
  const enableFxaa = () => {
    isEnableFxaa.value = true
    localStorage.setItem('YOYOGeoViewer-Options-isEnableFxaa', JSON.stringify(true))
  }

  const disableFxaa = () => {
    isEnableFxaa.value = false
    localStorage.setItem('YOYOGeoViewer-Options-isEnableFxaa', JSON.stringify(false))
  }

  if (newValue && !oldValue) {
    ElMessageBox.confirm(
      '开启抗锯齿会降低性能，是否继续？',
      '警告',
      {
        confirmButtonText: '确定（将刷新页面）',
        cancelButtonText: '取消',
        type: 'warning',
      })
      .then(() => {
        enableFxaa()
        window.location.reload()
      })
      .catch(() => {
        isCancelling.value = true
        disableFxaa()
      })
  } else if (oldValue && !isCancelling.value) {
    disableFxaa()
    window.location.reload()
  }
})

</script>

<template>
  <div class="graphical-setting">
    <div class="graphical-setting-item">
      <span>高清显示</span>
      <el-switch v-model="isEnableFxaa" inline-prompt active-text="开" inactive-text="关" />
    </div>
  </div>
</template>

<style scoped>
.graphical-setting {
  display: flex;
  padding-left: 16px;
  flex-direction: column;

  .graphical-setting-item {
    display: flex;
    align-items: center;

    .el-switch {
      margin-left: 8px;
    }
  }
}
</style>