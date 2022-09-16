<template>
  <div class="main">
    <ClipFloatBtn :icon="'🧭'" @onBtnClick="restoreDataBase"></ClipFloatBtn>
    <ClipFullData
      :isShow="fullDataShow"
      :fullData="fullData"
      @onDataRemove="handleDataRemove"
      @onOverlayClick="toggleFullData({ type: 'text', data: '' })"
    ></ClipFullData>
    <ClipSwitch ref="ClipSwitchRef" @onNavClick="handleNavClick">
      <template #SidePanel>
        <div class="clip-switch-btn-list" v-show="!isSearchPanelExpand">
          <span class="clip-switch-btn clip-select-count" v-show="isMultiple">
            {{ selectCount }}
          </span>
          <span class="clip-switch-btn" v-show="isMultiple" @click="handleMultiCopyBtnClick(false)"
            >📄 复制</span
          >
          <span class="clip-switch-btn" v-show="isMultiple" @click="handleMultiCopyBtnClick(true)"
            >📑 粘贴</span
          >
          <span class="clip-switch-btn" @click="handleMultiBtnClick">{{
            isMultiple ? '❌ 退出多选' : '👆'
          }}</span>
          <span
            class="clip-switch-btn clip-search-btn"
            v-show="!isMultiple"
            @click="handleSearchBtnClick"
          >
            🔍
          </span>
        </div>
        <ClipSearch
          v-show="isSearchPanelExpand"
          @onPanelHide="isSearchPanelExpand = false"
          v-model="filterText"
          :itemCount="list.length"
        ></ClipSearch>
      </template>
    </ClipSwitch>
    <div class="clip-break"></div>
    <div class="clip-empty-status" v-if="showList.length === 0">📪 无记录</div>
    <ClipItemList
      ref="ClipItemListRef"
      :showList="showList"
      :fullData="fullData"
      :isMultiple="isMultiple"
      :currentActiveTab="outSideActiveTab"
      @onMultiCopyExecute="handleMultiCopyBtnClick"
      @onDataChange="toggleFullData"
      @onDataRemove="handleDataRemove"
    >
    </ClipItemList>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed, nextTick } from 'vue'
import ClipItemList from '../cpns/ClipItemList.vue'
import ClipFullData from '../cpns/ClipFullData.vue'
import ClipSearch from '../cpns/ClipSearch.vue'
import ClipSwitch from '../cpns/ClipSwitch.vue'
import ClipFloatBtn from '../cpns/ClipFloatBtn.vue'

const isMultiple = ref(false)

const handleMultiBtnClick = () => {
  isMultiple.value = !isMultiple.value
}

const isSearchPanelExpand = ref(false)

const handleSearchBtnClick = () => {
  // 展开搜索框
  isSearchPanelExpand.value = true
  nextTick(() => window.focus())
}

const ClipItemListRef = ref(null)
const selectCount = ref(0)
const handleMultiCopyBtnClick = (isPaste) => {
  const itemList = ClipItemListRef.value.selectItemList
  // 如果包含了图片/文件 则转为文件合并 否则仅合并文本
  const isMergeFile =
    itemList.filter((item) => item.type === 'image' || item.type === 'file').length !== 0
  if (isMergeFile) {
    const filePathArray = []
    itemList.map((item) => {
      const { type } = item
      if (type === 'text') {
        const textFile = window.createFile(item)
        filePathArray.push({
          path: textFile
        })
      } else if (type === 'image') {
        const imageFile = window.createFile(item)
        filePathArray.push({
          path: imageFile
        })
      } else {
        // file
        const files = JSON.parse(item.data)
        filePathArray.push(...files)
      }
    })
    window.copy({
      type: 'file',
      data: JSON.stringify(filePathArray)
    })
  } else {
    const result = itemList.map((item) => item.data).join('\n')
    window.copy({
      type: 'text',
      data: result
    })
  }
  isPaste && window.paste()
  ClipItemListRef.value.emptySelectItemList()
  isMultiple.value = false
}

const GAP = 15 // 懒加载 每次添加的条数
const offset = ref(0) // 懒加载 偏移量
const filterText = ref('') // 搜索框绑定值
const list = ref([]) // 全部数据
const showList = ref([]) // 展示的数据

const textFilterCallBack = (item) => {
  // filterText & item
  if (filterText.value.trim()) {
    if (filterText.value.trim().indexOf(' ') !== -1) {
      // 有过滤词 有空格
      const hitArray = []
      for (const f of filterText.value.trim().split(' ')) {
        hitArray.push(item.data.toLowerCase().indexOf(f.toLowerCase()) !== -1)
      }
      // 只返回全命中的 只要存在 false即不返回
      return hitArray.indexOf(false) === -1
    } else {
      // 有过滤词 无空格 不区分大小写检索
      return item.data.toLowerCase().indexOf(filterText.value.trim().toLowerCase()) !== -1
    }
  } else {
    // 无过滤词 返回全部
    return true
  }
}

const updateShowList = (type) => {
  // 更新显示列表
  showList.value = list.value
    .filter((item) =>
      type === 'collect' ? item.collect === true : type === 'all' ? item : item.type === type
    ) // 是 collect则返回所有收藏 否则按照 type返回
    .filter((item) => (filterText.value ? item.type !== 'image' : item)) // 有过滤词 排除掉图片 DataURL
    .filter((item) => textFilterCallBack(item))
    .slice(0, GAP) // 重新切分懒加载列表
  window.toTop()
}

const restoreDataBase = () => {
  // 清空数据库
  const flag = window.confirm('确定要清空剪贴板记录吗?')
  if (flag) {
    window.db.emptyDataBase()
    updateShowList('all')
  }
}

const handleNavClick = (type) => {
  updateShowList(type)
  offset.value = 0 // 重置懒加载偏移量
}

const fullData = ref({ type: 'text', data: '' })
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

const outSideActiveTab = ref('all')

onMounted(() => {
  // 获取挂载的导航组件 Ref
  const activeTab = computed(() => ClipSwitchRef.value.activeTab)
  const toggleNav = ClipSwitchRef.value.toggleNav
  const tabs = ClipSwitchRef.value.tabs

  watch(activeTab, (val) => (outSideActiveTab.value = val))

  // 已选择的条数
  selectCount.value = computed(() => ClipItemListRef.value?.selectItemList?.length)

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
  }, 800)

  // 监听搜索框
  watch(filterText, (val) => updateShowList(activeTab.value))

  // 列表懒加载
  document.addEventListener('scroll', (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target.scrollingElement
    if (scrollTop + clientHeight + 5 >= scrollHeight) {
      offset.value += GAP
      let addition = []
      if (activeTab.value !== 'all') {
        addition = list.value
          .filter((item) => item.type === activeTab.value)
          .filter((item) => textFilterCallBack(item))
      } else {
        addition = list.value.filter((item) => textFilterCallBack(item))
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
    const isArrow = key === 'ArrowDown' || key === 'ArrowUp'
    const isEnter = key === 'Enter'
    const isShift = key === 'Shift'
    const isAlt = key === 'Alt'
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
        // 有筛选词 先清空筛选词
        filterText.value = ''
        window.focus()
        e.stopPropagation()
      } else if (isSearchPanelExpand.value) {
        // 移除焦点 隐藏搜索框
        window.focus(true)
        e.stopPropagation()
      } else if (isMultiple.value) {
        // 退出多选状态
        handleMultiBtnClick()
      } else {
        // 无上述情况 执行默认: 隐藏uTools主窗口
      }
    } else if (isShift) {
      // Shift: 多选操作
      if (!isMultiple.value) {
        handleMultiBtnClick()
      }
    } else if (isArrow || isEnter) {
      e.preventDefault()
    } else if (ctrlKey || metaKey || isAlt) {
      // Ctrl: utools模拟执行粘贴时触发
      // Alt:
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
