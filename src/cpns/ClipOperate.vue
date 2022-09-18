<template>
  <div class="clip-operate">
    <template v-for="o of operation">
      <div
        v-if="filterOperate(o, item, isFullData)"
        :class="o.id"
        :title="o.title"
        @click.stop="handleOperateClick(o, item)"
      >
        {{ o.icon }}
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import defaultOperation from '../data/operation.json'
import setting from '../global/readSetting'
import useClipOperate from '../hooks/useClipOperate'

const emit = defineEmits(['onDataChange', 'onDataRemove', 'onOperateExecute'])
const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  isFullData: {
    type: Boolean,
    default: false
  }
})

const operation = computed(() => [...defaultOperation, ...setting.operation.custom])

const { handleOperateClick, filterOperate } = useClipOperate({ emit })
</script>

<style lang="less" scoped>
@import '../style';
</style>
