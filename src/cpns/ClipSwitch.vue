<template>
  <div class="clip-switch">
    <div class="clip-switch-items">
      <template v-for="tab of tabs">
        <div
          :class="{ 'clip-switch-item': true, active: activeTab === tab.type }"
          @click="toggleNav(tab.type)"
        >
          <component :is="tab.icon"></component>
          {{ tab.name }}
        </div>
      </template>
    </div>
    <slot name="SidePanel"></slot>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Menu, Tickets, Picture, Document, Collection } from '@element-plus/icons-vue'

const tabs = [
  { name: '全部', type: 'all', icon: Menu },
  { name: '文字', type: 'text', icon: Tickets },
  { name: '图片', type: 'image', icon: Picture },
  { name: '文件', type: 'file', icon: Document },
  { name: '收藏', type: 'collect', icon: Collection }
]
const activeTab = ref('all')
const toggleNav = (type) => (activeTab.value = type)
defineExpose({
  tabs,
  activeTab,
  toggleNav
})
</script>

<style lang="less" scoped>
@import '../style';
</style>
