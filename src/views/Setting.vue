<template>
  <div class="setting">
    <el-card class="setting-card">
      <template #header>
        <el-button type="primary" @click="handleLinkClick(4)">💖 赞赏我</el-button>
        <el-button @click="handleLinkClick(0)">🚀 主页</el-button>
        <el-button @click="handleLinkClick(1)">⚡ 迁移数据 | 云同步 | 自定义功能</el-button>
        <el-button @click="handleLinkClick(2)">⭐ 开源代码</el-button>
        <el-button @click="handleLinkClick(3)">🎈 论坛发布页</el-button>
      </template>
      <div class="setting-card-content">
        <div class="setting-card-content-item">
          <span>剪贴板监听程序状态</span>
          <el-tag
            :type="listenStatus ? 'success' : 'warning'"
            @click="handleLinkClick(1)"
            title="手动安装剪贴板监听程序"
          >
            {{ listenStatus ? '已安装' : '未安装 点此查看安装方法' }}
          </el-tag>
        </div>
        <div class="setting-card-content-item">
          <span>数据库路径</span>
          <el-input class="path" v-model="path" :title="path" disabled></el-input>
          <el-button type="primary" @click="handlePathBtnClick('modify')">修改</el-button>
          <el-button @click="handlePathBtnClick('open')" v-show="path">打开</el-button>
          <input type="file" id="database-path" :style="{ display: 'none' }" />
        </div>
        <div class="setting-card-content-item">
          <span>最大历史条数</span>
          <el-select class="number-select" v-model="maxsize" fit-input-width>
            <el-option v-for="n in [500, 600, 700, 800, 900, 1000]" :key="n" :value="n" />
          </el-select>
          条
        </div>
        <div class="setting-card-content-item">
          <span>最长保存时间</span>
          <el-select class="number-select" v-model="maxage" fit-input-width>
            <el-option v-for="n in [1, 3, 5, 7, 14, 31]" :key="n" :value="n" />
          </el-select>
          天
        </div>
        <div class="setting-card-content-item">
          <span>展示在主界面的功能</span>
          <el-select
            class="operation-select"
            v-model="shown"
            multiple
            :multiple-limit="5"
            placeholder="请选择"
          >
            <el-option
              v-for="{ id, title, icon } in [
                ...defaultOperation,
                ...custom.map(({ id, title, icon }) => ({ id, title, icon }))
              ]"
              :key="id"
              :label="icon + ' ' + title"
              :value="id"
            />
          </el-select>
        </div>
        <div class="setting-card-content-item">
          <span>自定义功能</span>
          <el-input v-model="stringCustom" :rows="5" type="textarea" placeholder="Please input" />
        </div>
      </div>
      <div class="setting-card-footer">
        <el-button @click="handleRestoreBtnClick">重置</el-button>
        <el-button @click="emit('back')">返回</el-button>
        <el-button @click="handleSaveBtnClick" type="primary">保存</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import setting from '../global/readSetting'
import restoreSetting from '../global/restoreSetting'
import defaultOperation from '../data/operation.json'

const emit = defineEmits(['back'])
const { database, operation } = setting

const path = ref(database.path)
const maxsize = ref(database.maxsize)
const maxage = ref(database.maxage)

const shown = ref(operation.shown)
const custom = ref(operation.custom)
const stringCustom = ref(JSON.stringify(operation.custom))

const listenStatus = ref(false)

const handleLinkClick = (index) => {
  const links = [
    'https://ziuchen.gitee.io/project/ClipboardManager/',
    'https://ziuchen.gitee.io/project/ClipboardManager/guide/',
    'https://github.com/ZiuChen/ClipboardManager',
    'https://yuanliao.info/d/5722',
    'https://ziuchen.gitee.io/project/ClipboardManager/#%F0%9F%92%9D-%E6%84%9F%E8%B0%A2%E8%B5%9E%E8%B5%8F'
  ]
  utools.shellOpenExternal(links[index])
}

const handleSaveBtnClick = () => {
  // 校验格式
  if (path.value === '') {
    ElMessage.error('数据库路径不能为空')
    return
  } else if (path.value.indexOf('_utools_clipboard_manager_storage') === -1) {
    ElMessage.error('数据库路径不正确')
    return
  }
  if (stringCustom.value === '') {
    // 如果将全部清空 则默认为空数组
    stringCustom.value = '[]'
  }
  if (!/^\[.*\]$/.test(stringCustom.value)) {
    ElMessage.error('自定义功能格式不正确')
    return
  }
  try {
    custom.value = JSON.parse(stringCustom.value)
  } catch (error) {
    custom.value = operation.custom
    stringCustom.value = JSON.stringify(custom.value)
    ElMessage.error('自定义功能格式不正确')
    return
  }
  // 执行保存到utools本地数据库
  utools.dbStorage.setItem(
    'setting',
    JSON.parse(
      JSON.stringify({
        database: {
          path: path.value,
          maxsize: maxsize.value,
          maxage: maxage.value
        },
        operation: {
          shown: shown.value,
          custom: custom.value
        }
      })
    )
  )
  ElMessage.success('保存成功 重启插件生效')
}

const handlePathBtnClick = (param) => {
  if (param === 'modify') {
    const file = document.getElementById('database-path')
    file.click()
    file.onchange = (e) => {
      const { files } = e.target
      if (files.length > 0) {
        path.value = files[0].path
      }
      handleSaveBtnClick()
    }
  } else if (param === 'open') {
    utools.shellShowItemInFolder(path.value)
  }
}

const handleRestoreBtnClick = () => {
  ElMessageBox.confirm('确定要重置设置吗', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      restoreSetting()
      ElMessage({
        message: '重置成功 重启插件生效',
        type: 'success'
      })
    })
    .catch(() => {})
}

onMounted(() => {
  listenStatus.value = window.listener.listening
})
</script>

<style lang="less" scoped>
@import '../style';
</style>
