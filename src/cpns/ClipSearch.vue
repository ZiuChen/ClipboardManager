<template>
  <div class="clip-search">
    <input v-model="filterText" autofocus type="text" placeholder="🔍" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const filterText = ref('')
const props = defineProps({
  modelValue: {
    type: String,
    required: true
  }
})
const emit = defineEmits(['update:modelValue'])
watch(filterText, (val) => emit('update:modelValue', val))
</script>

<style lang="less" scoped>
@import '../style';
</style>
