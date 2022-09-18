<template>
  <div class="setting">
    <el-card class="setting-card">
      <template #header> 设置 </template>
      <div class="setting-card-content"></div>
      <el-button @click="emit('back')">返回</el-button>
      <el-button type="primary">保存</el-button>
    </el-card>
  </div>
</template>

<script setup>
import { ElButton } from 'element-plus'
const emit = defineEmits(['back'])
</script>

<style lang="less" scoped>
@import '../style';
</style>
