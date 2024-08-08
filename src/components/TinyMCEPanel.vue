<template>
<div  class="tmce-sty">
  <Editor
      api-key="7hbn9u44kz2ed373h9d2w0kljy6el4bpr9f3tuef7ixrohrm"
      :init="{
        plugins: 'lists link image table code help wordcount'
      }"
      initial-value="Welcome to TinyMCE!"
  />
</div>
</template>

<script setup>
import Editor from '@tinymce/tinymce-vue'

</script>

<style scoped>
.tmce-sty {
  max-width: 100%;
}
</style>
