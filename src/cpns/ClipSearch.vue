<template>
  <div class="clip-search">
    <span class="clip-search-btn" v-show="!filterText && !isFocus" @click="toggleFocusStatus(true)"
      >🔍</span
    >
    <input
      class="clip-search-input"
      @focusout="toggleFocusStatus(false)"
      v-show="filterText || isFocus"
      v-model="filterText"
      type="text"
      :placeholder="itemCount ? `🔍 在${itemCount}条历史中检索...` : '🔍 检索剪贴板历史...'"
    />
    <span v-show="filterText" @click="clear" class="clip-search-suffix">✖</span>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  itemCount: {
    type: Number
  }
})

const isFocus = ref(true)
const toggleFocusStatus = (status) =>
  status ? ((isFocus.value = status), nextTick(() => window.focus())) : (isFocus.value = status)

const filterText = ref('')
const emit = defineEmits(['update:modelValue'])
// filterText变了 通知父组件修改 modelValue的值
watch(filterText, (val) => emit('update:modelValue', val))

// modelValue变了 更新 filterText的值
watch(
  () => props.modelValue,
  (val) => (filterText.value = val)
)

const clear = () => emit('update:modelValue', '')
</script>

<style lang="less" scoped>
@import '../style';
</style>
