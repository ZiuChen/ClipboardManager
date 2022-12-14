<template>
  <div class="clip-item-list">
    <div
      class="clip-item"
      v-for="(item, index) in showList"
      :key="item.createTime"
      @click.left="handleItemClick($event, item)"
      @click.right="handleItemClick($event, item)"
      @mouseenter.prevent="handleMouseOver(index)"
      :class="{
        active: !isMultiple && index === activeIndex,
        'multi-active': isMultiple && index === activeIndex,
        select: selectItemList.indexOf(item) !== -1
      }"
    >
      <div class="clip-info">
        <div class="clip-time">
          <span class="relative-date" :title="new Date(item.updateTime).toLocaleString()">{{
            dateFormat(item.updateTime)
          }}</span>
        </div>
        <div class="clip-data">
          <template v-if="item.type === 'text'">
            <div
              :class="{ 'clip-over-sized-content': isOverSizedContent(item) }"
              :title="item.data"
            >
              {{ item.data.split(`\n`).slice(0, 6).join(`\n`).trim() }}
            </div>
          </template>
          <template v-if="item.type === 'image'">
            <img class="clip-data-image" :src="item.data" alt="Image" />
          </template>
          <template v-if="item.type === 'file'">
            <div
              :class="{ 'clip-over-sized-content': isOverSizedContent(item) }"
              :title="
                JSON.parse(item.data)
                  .map((item) => item.path)
                  .join('\n')
              "
            >
              <FileList :data="JSON.parse(item.data).slice(0, 6)" />
            </div>
          </template>
        </div>
      </div>
      <ClipOperate
        v-show="!isMultiple && activeIndex === index"
        :item="item"
        @onDataChange="() => emit('onDataChange', item)"
        @onDataRemove="() => emit('onDataRemove')"
      ></ClipOperate>
      <div class="clip-count" v-show="isMultiple || activeIndex !== index">
        {{ index + 1 }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import FileList from './FileList.vue'
import ClipOperate from './ClipOperate.vue'
import { dateFormat } from '../utils'
const props = defineProps({
  showList: {
    type: Array,
    required: true
  },
  fullData: {
    type: Object,
    required: true
  },
  isMultiple: {
    type: Boolean,
    required: true
  },
  currentActiveTab: {
    type: String,
    required: true
  },
  isSearchPanelExpand: {
    type: Boolean,
    required: true
  }
})
const emit = defineEmits([
  'onDataChange',
  'onDataRemove',
  'onMultiCopyExecute',
  'toggleMultiSelect'
])
const isOverSizedContent = (item) => {
  const { type, data } = item
  if (type === 'text') {
    // ????????????????????????????????????????????????
    return data.split(`\n`).length - 1 > 6 || data.length > 255
  } else if (type === 'file') {
    return JSON.parse(item.data).length >= 6
  }
}
const isShiftDown = ref(false)
const selectItemList = ref([])
const emptySelectItemList = () => (selectItemList.value = [])
defineExpose({
  selectItemList, // ????????? Main/Switch?????????????????????????????????
  emptySelectItemList
})
watch(
  () => props.isMultiple,
  (val) => {
    if (!val) {
      emptySelectItemList() // ?????????????????? ????????????
    }
  }
)
const handleItemClick = (ev, item) => {
  if (props.isMultiple === true) {
    const i = selectItemList.value.indexOf(item) // ??????????????????????????????
    const index = props.showList.indexOf(item) // ???????????????????????????
    activeIndex.value = index
    if (selectItemList.value.length !== 0 && isShiftDown.value) {
      // ??????????????? ??? Shift?????? ??????
      // ??????selectList????????????????????????
      // ??????index???????????????/??????????????? ??????????????????????????????????????????
      // ??????????????????
      const tmpArray = selectItemList.value
        .filter((item) =>
          props.currentActiveTab === 'all' ? true : item.type === props.currentActiveTab
        )
        .sort((a, b) => selectItemList.value.indexOf(a) - selectItemList.value.indexOf(b))
      const h = props.showList.indexOf(tmpArray[0]) // ????????????index????????? ?????????index????????????
      const l = props.showList.indexOf(tmpArray[tmpArray.length - 1]) // ????????????????????? ?????????index????????????
      if (index < h) {
        // ??????: index???0????????????
        // selectItemList.value = []
        for (let i = index; i <= h; i++) {
          selectItemList.value.push(props.showList[i])
        }
        // ????????????
        selectItemList.value = selectItemList.value.filter(function (item, index) {
          return selectItemList.value.indexOf(item) === index
        })
      } else if (index > l) {
        // ??????
        // selectItemList.value = []
        for (let i = h; i <= index; i++) {
          selectItemList.value.push(props.showList[i])
        }
        // ????????????
        selectItemList.value = selectItemList.value.filter(function (item, index) {
          return selectItemList.value.indexOf(item) === index
        })
      } else if (index <= l && index >= h) {
        // ???????????? ?????????????????????
        if (i !== -1) {
          selectItemList.value.splice(i, 1) // ???????????? ????????????
        } else {
          selectItemList.value.push(item) // ????????????????????????
        }
      }
    } else {
      // Shift????????? ??????
      if (i !== -1) {
        selectItemList.value.splice(i, 1) // ???????????? ????????????
      } else {
        selectItemList.value.push(item) // ????????????????????????
      }
    }
  } else {
    const { button } = ev
    if (button === 0) {
      // ?????? ???????????????
      window.copy(item)
      window.paste()
    } else if (button === 2) {
      // ?????? ?????????
      window.copy(item)
      ElMessage({
        message: '????????????',
        type: 'success'
      })
    }
  }
}
const activeIndex = ref(0)
const handleMouseOver = (index) => {
  if (!props.isMultiple) {
    activeIndex.value = index
  }
}
// ?????????????????????????????????????????? ????????? getter??????
watch(
  () => props.showList,
  () => (activeIndex.value = 0)
)

const keyDownCallBack = (e) => {
  const { key, ctrlKey, metaKey, altKey } = e
  const isArrowUp = key === 'ArrowUp'
  const isArrowDown = key === 'ArrowDown'
  const isEnter = key === 'Enter'
  const isCopy = (ctrlKey || metaKey) && (key === 'C' || key === 'c')
  const isNumber = parseInt(key) <= 9 && parseInt(key) >= 0
  const isShift = key === 'Shift'
  const isSpace = key === ' '
  const activeNode = !props.isMultiple
    ? document.querySelector('.clip-item.active' + (isArrowDown ? '+.clip-item' : ''))
    : document.querySelector('.clip-item.multi-active' + (isArrowDown ? '+.clip-item' : ''))
  if (isArrowUp) {
    if (activeIndex.value === 1) window.toTop()
    if (activeIndex.value > 0) {
      activeIndex.value--
      activeNode.previousElementSibling.previousElementSibling.scrollIntoView({
        block: 'nearest',
        inline: 'nearest'
      })
    }
  } else if (isArrowDown) {
    if (activeIndex.value < props.showList.length - 1) {
      activeIndex.value++
      activeNode.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    }
  } else if (isCopy) {
    if (!props.fullData.data) {
      // ???????????????????????? ???????????????????????? ???????????????
      if (!props.isMultiple) {
        window.copy(props.showList[activeIndex.value])
        ElMessage({
          message: '????????????',
          type: 'success'
        })
      } else {
        emit('onMultiCopyExecute', false)
      }
    }
  } else if (isEnter) {
    if (!props.isMultiple) {
      console.log('isEnter')
      window.copy(props.showList[activeIndex.value])
      window.paste()
    } else {
      emit('onMultiCopyExecute', true)
    }
  } else if ((ctrlKey || metaKey || altKey) && isNumber) {
    window.copy(props.showList[parseInt(key) - 1])
    window.paste()
    selectItemList.value = []
  } else if (isShift) {
    if (props.isMultiple) {
      isShiftDown.value = true
    }
  } else if (isSpace) {
    if (props.isSearchPanelExpand) {
      // ????????????????????? ???????????????
      return
    }
    if (!props.isMultiple) {
      emit('toggleMultiSelect') // ???????????????????????? ????????????????????????
    }
    e.preventDefault()
    const i = selectItemList.value.findIndex((item) => item === props.showList[activeIndex.value])
    if (i !== -1) {
      selectItemList.value.splice(i, 1) // ??????????????? ???????????????
    } else {
      selectItemList.value.push(props.showList[activeIndex.value]) // ??????????????? ?????????
      activeIndex.value++
      document
        .querySelector('.clip-item.multi-active+.clip-item')
        .scrollIntoView({ block: 'nearest', inline: 'nearest' })
    }
  }
}
const keyUpCallBack = (e) => {
  const { key } = e
  const isShift = key === 'Shift'
  if (isShift) {
    if (props.isMultiple) {
      isShiftDown.value = false
    }
  }
}

onMounted(() => {
  // ??????????????????
  document.addEventListener('keydown', keyDownCallBack)
  document.addEventListener('keyup', keyUpCallBack)
})

onUnmounted(() => {
  document.removeEventListener('keydown', keyDownCallBack)
  document.removeEventListener('keyup', keyUpCallBack)
})
</script>

<style lang="less" scoped>
@import '../style';
</style>
