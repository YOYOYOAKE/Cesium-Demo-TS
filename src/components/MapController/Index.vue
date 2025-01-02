<script setup lang="ts">
import FileUploader from './SubComponents/FileUploader.vue'
import BaseManagement from '@/components/MapController/SubComponents/BaseManagement.vue'
import ShpManagement from '@/components/MapController/SubComponents/ShpManagement.vue'
import DataManagement from '@/components/MapController/SubComponents/DataManagement.vue'

defineOptions({
  name: 'MapController',
})

const isDrawerOpen: Ref<boolean> = ref(false)

const isSubDrawerOpen: Ref<boolean> = ref(false)

const openFileUploader = (): void => {
  isDrawerOpen.value = true
  isSubDrawerOpen.value = true
}

const fileUploaderRef = useTemplateRef('fileUploader')

const closeSubDrawer = (): void => {
  isSubDrawerOpen.value = false
  if (fileUploaderRef.value) {
    fileUploaderRef.value.clearSelectedFields()
  }
}

const handleSubDrawerCloseAfterSave = (): void => {
  closeSubDrawer()
  ElMessage({
    type: 'success',
    message: '已保存数据',
  })
}

const handleSubDrawerCloseAfterCancel = (): void => {
  ElMessageBox.confirm(
    '确定要取消字段选择吗？已加载的数据将不会被保存。',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => {
      closeSubDrawer()
      ElMessage({
        type: 'info',
        message: '已取消',
      })
    })
    .catch(() => {
      // do nothing
    })
}

</script>

<template>
  <el-drawer v-model="isDrawerOpen" title="Cesium Demo" direction="ltr" size="35%">
    <el-divider content-position="left">底图管理</el-divider>
    <BaseManagement />
    <el-divider content-position="left">Shp图层管理</el-divider>
    <ShpManagement />
    <el-divider content-position="left">数据管理</el-divider>
    <DataManagement @openFileUploader="openFileUploader" />

    <!-- 二级抽屉 -->
    <div>
      <el-drawer v-model="isSubDrawerOpen" title="预览并选择字段" direction="ltr"
        :beforeClose="handleSubDrawerCloseAfterCancel" size="30%">
        <FileUploader ref="fileUploader" @save="handleSubDrawerCloseAfterSave"
          @cancel="handleSubDrawerCloseAfterCancel" />
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
