<template>
  <div class="clip-float-btn">
    <div @click="restoreDataBase">🧭</div>
  </div>
</template>

<script setup>
// const emit = defineEmits(['onBtnClick'])
// const handleBtnClick = () => emit('onBtnClick')
const restoreDataBase = () => {
  // 清空数据库
  const flag = window.confirm('确定要清空剪贴板记录吗?')
  if (flag) {
    window.db.emptyDataBase()
    updateShowList('all')
  }
}
</script>
