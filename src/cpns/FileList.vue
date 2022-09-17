<template>
  <div class="clip-file-list">
    <div
      class="clip-file"
      v-for="file of data.slice(0, 8)"
      @click.stop="openFile(file.path)"
      :title="file.path"
    >
      <img class="clip-file-icon" :src="getIcon(file.path)" alt="icon" />
      {{ file.name }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  data: {
    type: Array,
    required: true
  }
})
const openFile = (path) => utools.shellOpenPath(path)
const getIcon = (path) => utools.getFileIcon(path)
</script>

<style lang="less" scoped>
@import '../style';
</style>
