<template>
  <div class="clip-switch">
    <div class="clip-switch-items">
      <template v-for="tab of tabs">
        <div
          :class="{ 'clip-switch-item': true, active: activeTab === tab.type }"
          @click="onNavClick(tab.type)"
        >
          {{ tab.name }}
        </div>
      </template>
    </div>
    <slot name="SidePanel"></slot>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const tabs = ref([
  { name: '📚 全部', type: 'all' },
  { name: '📋 文字', type: 'text' },
  { name: '⛺ 图片', type: 'image' },
  { name: '📂 文件', type: 'file' }
])
const activeTab = ref('all')
const emit = defineEmits(['onNavClick'])
const toggleNav = (type) => (activeTab.value = type)
const onNavClick = (type) => {
  toggleNav(type)
  emit('onNavClick', type)
}
defineExpose({
  tabs,
  activeTab,
  toggleNav
})
</script>

<style lang="less" scoped>
@import '../style/cpns/clip-switch.less';
</style>
