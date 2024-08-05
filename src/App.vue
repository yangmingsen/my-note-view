<script setup>
import MenuList from './components/MenuList.vue'
import FileList from './components/FileList.vue'
import MarkdownEditorPanel from './components/MarkdownEditorPanel.vue'
import WangEditor from './components/WangEditor.vue'
import NotSupportEditor from './components/NotSupportEditor.vue'
import ImageViewer from './components/ImageViewer.vue'
import PdfViewer from './components/PdfViewer.vue'
import {ref} from 'vue'

const mdNoteId = ref('')
const werNoteId = ref ('')
const imgNoteId = ref('')
const pdfNoteId = ref('')

const editorFlag = {
  markdwon: 0, wangEditor: 1,  blank: 2, notSupport: 3, img: 4,
  pdf: 5
}
//当前选中的editor, 默认markdown
const editorSelected = ref(editorFlag.blank)


const chooseEditor = (info) => {
  if (info.isile == '0') {
    editorSelected.value = editorFlag.blank
  } else {
    if (info.type == 'md') {
      editorSelected.value = editorFlag.markdwon
      mdNoteId.value = info.id
    } else if (info.type == 'wer') {
      werNoteId.value = info.id
      editorSelected.value = editorFlag.wangEditor
    } else if (
        info.type == 'jpg'  ||
        info.type == 'jpeg' ||
        info.type == 'png') {
      imgNoteId.value = info.id
      editorSelected.value = editorFlag.img
    } else if(info.type == 'pdf') {
      pdfNoteId.value = info.id
      editorSelected.value = editorFlag.pdf
    }
    else {
      editorSelected.value = editorFlag.notSupport
    }
  }

}

</script>

<template>
  <div class="container">
    <div class="menu">
      <MenuList></MenuList>
    </div>
    <div class="file">
      <FileList @choose-note="(info) => {chooseEditor(info)}"></FileList>
    </div>
    <div class="content">
      <MarkdownEditorPanel
          :noteid="mdNoteId"
          v-if="editorSelected == editorFlag.markdwon">

      </MarkdownEditorPanel>
      <WangEditor
          :noteid="werNoteId"
          v-if="editorSelected == editorFlag.wangEditor">
      </WangEditor>
      <ImageViewer
          :noteid="imgNoteId"
          v-if="editorSelected == editorFlag.img">
      </ImageViewer>
      <PdfViewer
          :noteid="pdfNoteId"
          v-if="editorSelected == editorFlag.pdf">
      </PdfViewer>
      <NotSupportEditor v-if="editorSelected == editorFlag.notSupport"></NotSupportEditor>
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
  -webkit-user-select: none;
  -moz-user-select: none;
  -o-user-select: none;
  user-select: none;

}

</style>
