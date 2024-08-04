<script setup>
import MenuList from './components/MenuList.vue'
import FileList from './components/FileList.vue'
import EditorPanel from './components/EditorPanel.vue'
</script>

<template>
  <div class="container">
    <div class="menu">
      <MenuList></MenuList>
    </div>
    <div class="file">
      <FileList></FileList>
    </div>
    <div class="content">
      <EditorPanel></EditorPanel>
    </div>
  </div>
</template>

<style scoped>

.container {
  display: grid;
  grid-template-columns: 1fr 1fr 4fr;
  height: 910px;
}

.file {
  background-color: #FAFAFA;
}

</style>
