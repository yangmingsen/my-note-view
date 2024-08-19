<template>
  <a-result status="warning" title="暂时不支持该文件内容的展示." >
    <template #extra>
      <a-button key="console" type="primary">Go Console</a-button>
    </template>
  </a-result>
</template>

<script setup>

</script>

<style scoped>
 .not-support-editor {
   background-color: gainsboro;
 }
</style>
