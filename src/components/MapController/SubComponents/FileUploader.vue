<script setup lang="ts">
import { useDataStore } from '@/stores/dataStore'

const dataStore = useDataStore()

const emits = defineEmits(['save', 'cancel'])

const { headers: sheetHeaders, content: sheetContent } = dataStore.getSheet()

const previewSheetContent = sheetContent.slice(0, 3)

const selectedFields = ref({})

const clearSelectedFields = (): void => {
  selectedFields.value = {}
}

const requiredFields = ref([
  { name: 'lng', label: '经度', description: '点的经度' },
  { name: 'lat', label: '纬度', description: '点的纬度' },
])

const handleSave = (): void => {
  const selectedFieldsValues = Object.keys(selectedFields.value)
  const requiredFieldsNames = requiredFields.value.map(field => field.name)

  const lengthFlag = selectedFieldsValues.length === requiredFieldsNames.length
  const nameFlag = requiredFieldsNames.every(name => selectedFieldsValues.includes(name))

  if (lengthFlag && nameFlag) {
    dataStore.saveData(selectedFields.value)
    emits('save')
  } else {
    ElMessage({
      type: 'error',
      message: '请为所有字段选择对应的表头',
    })
  }
}

defineExpose({
  clearSelectedFields
})

</script>

<template>
  <el-divider content-position="left">部分数据预览</el-divider>
  <el-table :data="previewSheetContent" style="width: 100%">
    <el-table-column v-for="(header, index) in sheetHeaders" :key="index" :prop="header" :label="header" />
  </el-table>

  <el-divider content-position="left">字段选择</el-divider>
  <el-form :model="selectedFields" label-width="auto" style="max-width: 600px">

    <el-form-item v-for="(field, index) in requiredFields" :key="index" :label="field.label">
      <el-select v-model="selectedFields[field.name]" :placeholder="`请选择${field.label}字段`">
        <el-option v-for="(header, index) in sheetHeaders" :key="index" :label="header" :value="header" />
      </el-select>
    </el-form-item>

    <div class="button-group">
      <el-button type="primary" @click="handleSave">保存</el-button>
      <el-button @click="emits('cancel')">取消</el-button>
    </div>


  </el-form>

</template>

<style scoped lang="less">
.button-group {
  display: flex;
  margin-top: 20px;
  flex-direction: row-reverse;

  >* {
    margin-left: 10px;
  }
}
</style>