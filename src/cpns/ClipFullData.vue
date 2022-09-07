<template>
  <div class="clip-full-data">
    <Transition name="fade">
      <div class="clip-full-wrapper" v-show="isShow">
        <div class="clip-full-operate-list">
          <template v-for="{ id, name } of btns">
            <div
              class="clip-full-operate-list-item"
              v-if="id !== 'word-split' || (id === 'word-split' && fullData.type !== 'file')"
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
        <ClipWordBreak :words="splitWords"></ClipWordBreak>
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
const onOverlayClick = () => emit('onOverlayClick')

const btns = [
  {
    id: 'copy-all',
    name: '📄 复制全部'
  },
  {
    id: 'word-split',
    name: '🎁 智慧分词'
  }
]
const handleBtnClick = (id) => {
  switch (id) {
    case 'copy-all':
      window.copy(props.fullData)
      emit('onOverlayClick') // 退出侧栏
      break
    case 'word-split':
      // TODO: 限制文字长度 (前后端都限制)
      // TODO: 限制请求频率 (前后端都限制)
      fetchWordBreakResult(props.fullData.data)
      break
  }
}

const splitWords = ref([])

const fetchUserInfo = async () => {
  return utools.fetchUserServerTemporaryToken().then(({ token, expired_at }) => {
    return {
      token,
      expired_at
    }
  })
}

const fetchWordBreakResult = async (origin) => {
  const baseUrl = 'https://service-a0pyrkub-1304937021.sh.apigw.tencentcs.com/release'
  const url = baseUrl + '/v1/word-break'
  const info = await fetchUserInfo()
  console.log(info)
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
        console.log(msg)
      } else {
        splitWords.value = data.splitWord.filter(
          (w) => w !== '' && w !== ' ' && w.indexOf('\n') === -1
        )
        console.log(data.splitWord)
        console.log(data.extractWord)
      }
    })
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
