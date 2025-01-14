<script setup lang="ts">
import { useDataStore } from '@/stores/dataStore'

const dataStore = useDataStore()

const emits = defineEmits(['save', 'cancel'])

// #region 数据预览

const { sheet } = storeToRefs(dataStore)

// #endregion

// #region 数据类型选择

const dataType: Ref<'point' | 'od'> = ref('point')

const requiredFields: Ref<Record<string, string>> = ref([
  { name: 'lng', label: '经度', description: '点的经度' },
  { name: 'lat', label: '纬度', description: '点的纬度' },
])

const handleDataTypeChange = (type: 'point' | 'od'): void => {
  selectedFields.value = {}
  if (type === 'point') {
    requiredFields.value = [
      { name: 'lng', label: '经度', description: '点的经度' },
      { name: 'lat', label: '纬度', description: '点的纬度' },
    ]
  } else {
    requiredFields.value = [
      { name: 'oLng', label: '起点经度', description: 'OD数据的起点经度' },
      { name: 'oLat', label: '起点纬度', description: 'OD数据的起点纬度' },
      { name: 'dLng', label: '终点经度', description: 'OD数据的终点经度' },
      { name: 'dLat', label: '终点纬度', description: 'OD数据的终点纬度' },
    ]
  }
}

// #endregion

// #region 字段选择

const selectedFields: Record<string, string> = ref({})

const clearSelectedFields = (): void => selectedFields.value = {}

// #endregion

// #region 保存数据

const handleSave = (): void => {
  const selectedFieldsValues = Object.keys(selectedFields.value)
  const requiredFieldsNames = requiredFields.value.map(field => field.name)

  const lengthFlag = selectedFieldsValues.length === requiredFieldsNames.length
  const nameFlag = requiredFieldsNames.every(name => selectedFieldsValues.includes(name))

  if (lengthFlag && nameFlag) {
    // Pass in the mapping of Excel headers and required fields to match the data
    dataStore.saveData(selectedFields.value, dataType.value)
    emits('save')
  } else {
    ElMessage({
      type: 'error',
      message: '请为所有字段选择对应的表头',
    })
  }
}

// #endregion

defineExpose({
  clearSelectedFields
})

</script>

<template>
  <el-divider content-position="left">部分数据预览</el-divider>
  <el-table :data="sheet.content.slice(0, 3)" style="width: 100%">
    <el-table-column v-for="(header, index) in sheet.headers" :key="index" :prop="header" :label="header" />
  </el-table>

  <el-divider content-position="left">选择正确的字段</el-divider>


  <el-radio-group v-model="dataType" @change="handleDataTypeChange">
    <el-radio-button label="点数据" value="point" />
    <el-radio-button label="OD数据" value="od" />
  </el-radio-group>

  <el-form :model="selectedFields" label-width="auto" style="max-width: 600px">
    <el-form-item v-for="(field, index) in requiredFields" :key="index" :label="field.label">
      <el-select v-model="selectedFields[field.name]" :placeholder="`请选择${field.label}字段`">
        <el-option v-for="(header, index) in sheet.headers" :key="index" :label="header" :value="header" />
      </el-select>
    </el-form-item>

    <div class="button-group">
      <el-button type="primary" @click="handleSave">保存</el-button>
      <el-button @click="emits('cancel')">取消</el-button>
    </div>
  </el-form>

</template>

<style scoped lang="less">
.el-radio-group {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.button-group {
  display: flex;
  margin-top: 20px;
  flex-direction: row-reverse;

  >* {
    margin-left: 10px;
  }
}
</style>