<template>
  <div class="clip-file-list">
    <div class="clip-file" v-for="file of data.slice(0, 8)" @click.stop="openFile(file.path)">
      <img class="clip-file-icon" :src="getIcon(file.path)" alt="icon" />
      {{ file.name }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'fileList',
  props: {
    data: {
      type: Array,
      required: true
    }
  },
  methods: {
    openFile(path) {
      window.openFile(path)
    },
    getIcon(path) {
      return window.getIcon(path)
    }
  }
}
</script>

<style scoped>
.clip-file {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  cursor: pointer;
}
.clip-file:hover {
  font-weight: 600;
}
.clip-file:hover::after {
  content: '📤';
}
.clip-file-icon {
  width: 15px;
  height: 15px;
}
</style>
