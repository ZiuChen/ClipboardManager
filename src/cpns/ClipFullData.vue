<template>
  <div class="clip-full-data">
    <Transition name="fade">
      <div class="clip-full-wrapper" v-show="isShow">
        <div class="clip-full-operate-list">
          <template v-for="{ id, name } of btns">
            <div
              class="clip-full-operate-list-item"
              v-if="
                (id !== 'word-split' && id !== 'copy-select' && id !== 'clear-select') ||
                (id === 'word-split' &&
                  fullData.type !== 'file' &&
                  fullData?.data?.length <= '\u0035\u0030\u0030' &&
                  splitWords.length === 0) ||
                (id === 'copy-select' &&
                  splitWords.filter((item) => item.checked !== false).length !== 0) ||
                (id === 'clear-select' &&
                  splitWords.filter((item) => item.checked !== false).length !== 0)
              "
              @click="handleBtnClick(id)"
            >
              {{ name }}
            </div>
          </template>
        </div>
        <template v-if="fullData.type === 'text'">
          <div class="clip-full-content" v-text="fullData.data"></div>
        </template>
        <div v-else-if="fullData.type === 'file'" class="clip-full-content">
          <FileList :data="JSON.parse(fullData.data)"></FileList>
        </div>
        <ClipWordBreak
          v-if="fullData.type === 'text' && splitWords.length !== 0"
          :words="splitWords"
        ></ClipWordBreak>
      </div>
    </Transition>
    <div class="clip-overlay" v-show="isShow" @click="onOverlayClick"></div>
  </div>
</template>

<script setup>
import FileList from './FileList.vue'
import ClipWordBreak from './ClipWordBreak.vue'
import { ref, onMounted } from 'vue'

const props = defineProps({
  isShow: {
    type: Boolean,
    required: true
  },
  fullData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['onOverlayClick'])

const btns = [
  {
    id: 'copy-all',
    name: '📄 复制全部'
  },
  {
    id: 'word-split',
    name: '🎁 智慧分词'
  },
  {
    id: 'copy-select',
    name: '📑 复制选中'
  },
  {
    id: 'clear-select',
    name: '💣 清空选中'
  }
]

const splitWords = ref([])

const handleBtnClick = (id) => {
  switch (id) {
    case 'copy-all':
      window.copy(props.fullData)
      emit('onOverlayClick') // 退出侧栏
      window.toTop()
      break
    case 'word-split':
      // TODO: 限制请求频率 (前后端都限制)
      const key = 'word-break-daily-used'
      const val = utools.dbStorage.getItem(key)
      if (val >= '\u0035') {
        window.showNotify(
          '今日使用次数已达5次, 请明日再使用此功能 新插件`超级分词`即将上线, 敬请期待'
        )
      } else {
        fetchWordBreakResult(props.fullData.data)
      }

      break
    case 'copy-select':
      const checkedList = splitWords.value.filter((item) => item.checked !== false)
      if (checkedList.length !== 0) {
        window.copy({
          type: 'text',
          data: checkedList.map((item) => item.value).join('')
        })
        emit('onOverlayClick')
        window.toTop()
      } else {
        window.showNotify('尚未选中任何内容')
      }
      break
    case 'clear-select':
      splitWords.value.map((item) => (item.checked = false))
      break
  }
}

const fetchUserInfo = async () => {
  return window.fetchToken().then(({ token, expired_at }) => {
    return {
      token,
      expired_at
    }
  })
}

const fetchWordBreakResult = async (origin) => {
  const baseUrl = 'https://service-nlkfov43-1304937021.sh.apigw.tencentcs.com/release'
  // const baseUrl = 'http://localhost:9000'
  const url = baseUrl + '/v1/word-break'
  const info = await fetchUserInfo()
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      word: origin,
      ...info
    })
  })
    .then((res) => res.json())
    .then(({ code, data, msg }) => {
      if (code !== 0) {
        window.showNotify(msg)
      } else {
        // 请求成功 才算一次
        const valueKey = 'word-break-daily-used'
        const timeKey = 'last-update'
        const val = utools.dbStorage.getItem(valueKey)
        utools.dbStorage.setItem(valueKey, val === null ? 1 : val + 1)
        if (new Date(utools.dbStorage.getItem(timeKey)).getDay() !== new Date().getDay()) {
          // 新的一天 重置本地次数
          utools.dbStorage.setItem(valueKey, 0)
        }
        utools.dbStorage.setItem(timeKey, new Date().valueOf())
        splitWords.value = data.splitWord
          .filter((w) => w !== '' && w !== ' ' && w.indexOf('\n') === -1)
          .map((item) => ({
            value: item,
            checked: false
          }))
      }
    })
}

const onOverlayClick = () => {
  emit('onOverlayClick')
  splitWords.value = []
}

onMounted(() => {
  document.addEventListener('keydown', (e) => {
    const { key } = e
    if (key === 'Escape' && props.fullData.data) {
      // 有值时执行退出 Overlay
      emit('onOverlayClick')
      e.stopPropagation()
    }
  })
})
</script>

<style lang="less" scoped>
@import '../style';
.fade-enter-active,
.fade-leave-active {
  transition: all 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  width: 0px;
  opacity: 0;
}
</style>
