<script setup lang="ts">
import { useDataStore } from '@/stores/dataStore'
import { storeToRefs } from 'pinia'

const dataStore = useDataStore()

const { sheetHeaders } = storeToRefs(dataStore)

const form = ref({})

const requiredFields = ref([
  { name: 'lng', label: '经度', description: '点的经度' },
  { name: 'lat', label: '纬度', description: '点的纬度' },
  { name: 'time', label: '时间', description: '点的时间' },
])

</script>

<template>
  <el-form :model="form" label-width="auto" style="max-width: 600px">

    <el-form-item v-for="(field, index) in requiredFields" :key="index" :label="field.label">
      <el-select v-model="form[field.name]" :placeholder="`请选择${field.label}字段`" >
        <el-option v-for="(header, index) in sheetHeaders" :key="index" :label="header" :value="header" />
      </el-select>
    </el-form-item>

  </el-form>

</template>

<style scoped></style>