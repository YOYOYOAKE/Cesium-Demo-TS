<script setup lang="ts">
import FileUploader from './FileUploader.vue'
import BaseManagement from '@/components/MapController/BaseManagement.vue'
import ShpManagement from '@/components/MapController/ShpManagement.vue'
import DataManagement from '@/components/MapController/DataManagement.vue'

const isDrawerOpen: Ref<boolean> = ref(false)

const isSubDrawerOpen: Ref<boolean> = ref(false)

const openFileUploader = (): void => {
  isDrawerOpen.value = true
  isSubDrawerOpen.value = true
}

const handleSubDrawerClose = (done: () => void): void => {
  ElMessageBox.confirm(
    '确定要关闭字段选择吗？已加载的数据将不会保存。',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      done()
    })
    .catch(() => {
    })
}

</script>

<template>
  <el-drawer v-model="isDrawerOpen" title="Cesium Demo" direction="ltr" size="35%">
    <el-divider content-position="left">底图管理</el-divider>
    <BaseManagement />
    <el-divider content-position="left">Shp图层管理</el-divider>
    <ShpManagement />
    <el-divider content-position="left" v-if="false">数据管理</el-divider>
    <DataManagement v-if="false" @openFileUploader="openFileUploader" />

    <!-- 二级抽屉 -->
    <div>
      <el-drawer v-model="isSubDrawerOpen" title="字段选择" direction="ltr" :beforeClose="handleSubDrawerClose" size="30%">
        <FileUploader />
      </el-drawer>
    </div>

  </el-drawer>

  <el-button id="drawer-switch" type="primary" circle size="large" @click="isDrawerOpen = true">
    <el-icon size="24px">
      <i-ep-Tools />
    </el-icon>
  </el-button>
</template>

<style scoped>
#drawer-switch {
  position: absolute;
  top: 24px;
  left: 24px;
}
</style>
