<template>
  <div class="setting">
    <el-card class="setting-card">
      <div class="setting-card-content">
        <div class="setting-card-content-item">
          <span>数据库路径</span>
          <el-input class="path" v-model="path" disabled></el-input>
          <el-button type="primary" @click="handlePathBtnClick('modify')">修改</el-button>
          <el-button @click="handlePathBtnClick('open')" v-show="path">打开</el-button>
          <input type="file" id="database-path" :style="{ display: 'none' }" />
        </div>
        <div class="setting-card-content-item">
          <span>最大历史条数</span>
          <el-select v-model="maxsize" fit-input-width>
            <el-option v-for="n in [600, 800, 1000, 1200, 1400]" :key="n" :value="n" />
          </el-select>
          条
        </div>
        <div class="setting-card-content-item">
          <span>最长保存时间</span>
          <el-select v-model="maxage" fit-input-width>
            <el-option v-for="n in [10, 11, 12, 13, 14]" :key="n" :value="n" />
          </el-select>
          天
        </div>
      </div>
      <div class="setting-card-footer">
        <el-button @click="emit('back')">返回</el-button>
        <el-button @click="handleSaveBtnClick" type="primary">保存</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElButton, ElInput, ElMessage } from 'element-plus'
import setting from '../global/readSetting'

const emit = defineEmits(['back'])
const { database } = setting

const path = ref(database.path)
const maxsize = ref(database.maxsize)
const maxage = ref(database.maxage)

const handlePathBtnClick = (param) => {
  if (param === 'modify') {
    const file = document.getElementById('database-path')
    file.click()
    file.onchange = (e) => {
      const { files } = e.target
      if (files.length > 0) {
        path.value = files[0].path
      }
    }
  } else if (param === 'open') {
    utools.shellShowItemInFolder(path.value)
  }
}

const handleSaveBtnClick = () => {
  if (path.value === '') {
    ElMessage.error('数据库路径不能为空')
    return
  } else if (path.value.indexOf('_utools_clipboard_manager_storage') === -1) {
    ElMessage.error('数据库路径不正确')
    return
  }
  utools.dbStorage.setItem('setting', {
    ...setting,
    database: {
      path: path.value,
      maxsize: maxsize.value,
      maxage: maxage.value
    }
  })
  ElMessage({
    message: '保存成功 重启插件生效',
    type: 'success'
  })
}
</script>

<style lang="less" scoped>
@import '../style';
</style>
