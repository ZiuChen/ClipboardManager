<template>
  <div class="main">
    <ClipFloatBtn></ClipFloatBtn>
    <ClipFullData
      :isShow="fullDataShow"
      :fullData="fullData"
      @onOverlayClick="toggleFullData({ type: 'text', data: '' })"
    ></ClipFullData>
    <ClipSwitch ref="ClipSwitchRef" @onNavClick="handleNavClick">
      <template #SidePanel>
        <ClipSearch v-model="filterText" :itemCount="list.length"></ClipSearch>
      </template>
    </ClipSwitch>
    <div class="clip-break"></div>
    <div class="clip-empty-status" v-if="showList.length === 0">📪 无记录</div>
    <ClipItemList
      :showList="showList"
      :fullData="fullData"
      @onDataChange="toggleFullData"
      @onDataRemove="handleDataRemove"
    >
    </ClipItemList>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import ClipItemList from '../cpns/ClipItemList.vue'
import ClipFullData from '../cpns/ClipFullData.vue'
import ClipSearch from '../cpns/ClipSearch.vue'
import ClipSwitch from '../cpns/ClipSwitch.vue'
import ClipFloatBtn from '../cpns/ClipFloatBtn.vue'

const GAP = 15 // 懒加载 每次添加的条数
const offset = ref(0) // 懒加载 偏移量
const filterText = ref('') // 搜索框绑定值
const list = ref([]) // 全部数据
const showList = ref([]) // 展示的数据

const updateShowList = (type) => {
  // 更新显示列表
  showList.value = list.value
    .filter((item) =>
      type === 'collect' ? item.collect === true : type === 'all' ? item : item.type === type
    ) // 是 collect则返回所有收藏 否则按照 type返回
    .filter((item) => (filterText.value ? item.type !== 'image' : item)) // 有过滤词 排除掉图片 DataURL
    .filter(
      (item) =>
        filterText.value
          ? item.data.toLowerCase().indexOf(filterText.value.toLowerCase()) !== -1 // 有过滤词 不区分大小写检索
          : item // 无过滤词 返回全部
    )
    .slice(0, GAP) // 重新切分懒加载列表
  window.toTop()
}

const handleNavClick = (type) => {
  updateShowList(type)
  offset.value = 0 // 重置懒加载偏移量
}

const fullData = ref({ type: 'text' })
const fullDataShow = ref(false)
const toggleFullData = (item) => {
  // 是否显示全部数据 (查看全部)
  const { type } = item
  if (type === 'text' || type === 'file') {
    fullData.value = item
  }
  fullDataShow.value = !fullDataShow.value
}

const ClipSwitchRef = ref()

const handleDataRemove = () => {
  // 此函数须在挂载后执行
  list.value = window.db.dataBase.data
  updateShowList(ClipSwitchRef.value.activeTab)
}

onMounted(() => {
  // 获取挂载的导航组件 Ref
  const activeTab = computed(() => ClipSwitchRef.value.activeTab)
  const toggleNav = ClipSwitchRef.value.toggleNav
  const tabs = ClipSwitchRef.value.tabs

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
    if (scrollTop + clientHeight + 5 >= scrollHeight) {
      offset.value += GAP
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
    const { key, ctrlKey, metaKey } = e
    const isTab = key === 'Tab'
    const isSearch =
      (ctrlKey && (key === 'F' || key === 'f')) || (ctrlKey && (key === 'L' || key === 'l'))
    const isExit = key === 'Escape'
    if (isTab) {
      const tabTypes = tabs.map((item) => item.type)
      const index = tabTypes.indexOf(activeTab.value)
      const target = index === tabTypes.length - 1 ? tabTypes[0] : tabTypes[index + 1]
      toggleNav(target)
      updateShowList(activeTab.value)
    } else if (isSearch) {
      window.focus()
    } else if (isExit) {
      if (filterText.value) {
        filterText.value = ''
        e.stopPropagation()
      }
    } else if (ctrlKey || metaKey) {
      // 仅有 Ctrl时 什么也不执行
      // utools模拟执行粘贴时触发
    } else {
      window.focus() // 其他键盘事件 直接聚焦搜索框
    }
  })
})
</script>

<style lang="less" scoped>
@import '../style';
.clip-break {
  height: 60px;
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
