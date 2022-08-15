<template>
  <div class="main">
    <div class="clip-restore" @click="restoreDataBase">🧺</div>
    <ClipFullData
      :isShow="fullDataShow"
      :fullData="fullData"
      @onOverlayClick="toggleFullData('')"
    ></ClipFullData>
    <ClipSwitch ref="ClipSwitchRef" @onNavClick="updateShowList">
      <template #SidePanel>
        <ClipSearch v-model="filterText"></ClipSearch>
      </template>
    </ClipSwitch>
    <div class="clip-break"></div>
    <div class="clip-empty-status" v-if="showList.length === 0">📪 无记录</div>
    <ClipItemList :showList="showList" @onDataChange="toggleFullData"> </ClipItemList>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import ClipItemList from '../cpns/ClipItemList.vue'
import ClipFullData from '../cpns/ClipFullData.vue'
import ClipSearch from '../cpns/ClipSearch.vue'
import ClipSwitch from '../cpns/ClipSwitch.vue'

const GAP = 15 // 懒加载 每次添加的条数
const offset = ref(0) // 懒加载 偏移量
const filterText = ref('') // 搜索框绑定值
const list = ref([]) // 全部数据
const showList = ref([]) // 展示的数据

const updateShowList = (type) => {
  // 更新显示列表
  if (type === 'all') {
    if (filterText.value) {
      // 有过滤词 则过滤掉图片
      showList.value = list.value
        .filter((item) => item.type !== 'image')
        .filter((item) => item.data.indexOf(filterText.value) !== -1)
        .slice(0, GAP)
    } else {
      // 无过滤词 直接更新
      showList.value = list.value
        .filter((item) => item.data.indexOf(filterText.value) !== -1)
        .slice(0, GAP)
    }
  } else if (type === 'image') {
    // 排除掉对图片 DataURL的筛选
    showList.value = list.value.filter((item) => item.type === type).slice(0, GAP)
  } else {
    // `file`类型 在stringify的data里搜
    // `text`类型 在data里搜
    showList.value = list.value
      .filter((item) => item.type === type)
      .filter((item) => item.data.indexOf(filterText.value) !== -1)
      .slice(0, GAP)
  }
  document.scrollingElement.scrollTop = 0
}

const fullData = ref({ type: 'text', data: '' })
const fullDataShow = ref(false)
const toggleFullData = (item) => {
  // 是否显示全部数据 (查看全部)
  const { type, data } = item
  // type: 'text' | 'file'
  if (type === 'text') {
    fullData.value.type = 'text'
    fullData.value.data = data
  } else if (type === 'file') {
    fullData.value.type = 'file'
    fullData.value.data = JSON.parse(data)
  }
  fullDataShow.value = !fullDataShow.value
}

const restoreDataBase = () => {
  // 情况数据库
  const flag = window.confirm('确定要清空剪贴板记录吗?')
  if (flag) {
    window.db.emptyDataBase()
    updateShowList('all')
  }
}

const ClipSwitchRef = ref()
onMounted(() => {
  // 获取挂载的导航组件 Ref
  const activeTab = computed(() => ClipSwitchRef.value.activeTab)

  // 初始化数据
  list.value = window.db.dataBase.data
  showList.value = list.value.slice(0, GAP) // 最初展示 10条
  updateShowList(activeTab.value)

  // 定期检查更新
  let prev = {}
  setInterval(() => {
    const now = window.db.dataBase.data[0]
    if (prev?.id === now?.id) {
    } else {
      // 有更新
      list.value = window.db.dataBase.data
      updateShowList(activeTab.value)
      prev = now
    }
  }, 500)

  // 监听搜索框
  watch(filterText, (val) => updateShowList(activeTab.value))

  // 列表懒加载
  document.addEventListener('scroll', (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target.scrollingElement
    if (scrollTop + clientHeight + 20 >= scrollHeight) {
      offset.value += GAP + 1
      let addition = []
      if (activeTab.value !== 'all') {
        addition = list.value.filter((item) => item.type === activeTab.value)
      } else {
        addition = list.value
      }
      addition = addition.slice(offset.value, offset.value + GAP)
      if (addition.length) {
        showList.value.push(...addition)
      }
    }
  })

  // 监听键盘事件
  document.addEventListener('keydown', (e) => {
    const { key, ctrlKey } = e
    const isTab = key === 'Tab'
    const isSearch =
      key === '/' ||
      (ctrlKey && (key === 'F' || key === 'f')) ||
      (ctrlKey && (key === 'L' || key === 'l'))
    const isExit = key === 'Escape'
    if (isTab) {
      const list = ['all', 'text', 'image', 'file']
      const index = list.indexOf(activeTab.value)
      const target = index === list.length - 1 ? list[0] : list[index + 1]
      updateShowList(target)
    } else if (isSearch) {
      document.querySelector('input').focus()
    } else if (isExit) {
      filterText.value = ''
    }
  })
})
</script>

<style lang="less" scoped>
@import '../style';
.clip-restore {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  bottom: 10px;
  right: 10px;
  height: 50px;
  width: 50px;
  cursor: pointer;
  border-radius: 50%;
  font-size: 20px;
  background-color: rgb(232, 232, 232);
  user-select: none;
  &:hover {
    // background-color: @primary-color;
    transition: all 0.15s;
  }
}
.clip-break {
  height: 55px;
}
.clip-empty-status {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 50px;
}
</style>
