<template>
  <div class="app">
    <Main @show-setting="settingShown = true" v-show="!settingShown"></Main>
    <Setting v-show="settingShown"></Setting>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Main from './views/Main.vue'
import Setting from './views/Setting.vue'

const settingShown = ref(false)
</script>
