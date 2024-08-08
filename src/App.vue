<script setup>
import MenuList from './components/MenuList.vue'
import FileList from './components/FileList.vue'
import MarkdownEditorPanel from './components/MarkdownEditorPanel.vue'
import WangEditor from './components/WangEditor.vue'
import NotSupportEditor from './components/NotSupportEditor.vue'
import ImageViewer from './components/ImageViewer.vue'
import PdfViewer from './components/PdfViewer.vue'
import WordViewer from './components/WordViewer.vue'
import ExcelViewer from './components/ExcelViewer.vue'
import TinyMCEPanel from './components/TinyMCEPanel.vue'
import MarkdownPreview from './components/MarkdownPreview.vue'

import {RemoteApi as noteApi} from "./api/RemoteApi"
import {ConstansFlag as constFlag} from './js/ConstansFlag.js'
import {ref} from 'vue'

const mdNoteId = ref('')
const werNoteId = ref ('')
const imgNoteId = ref('')
const pdfNoteId = ref('')
const wordNoteId = ref('')
const excelNoteId = ref('')
const textNoteId = ref('')

const editorFlag = {
  markdwon: 0, wangEditor: 1,  blank: 2, notSupport: 3, img: 4,
  pdf: 5, doc: 6, excel: 7, tiny: 8, textPreview: 9
}
//当前选中的editor, 默认markdown
const editorSelected = ref(editorFlag.blank)

const chooseEditor = (info) => {
  if (info.curMenuItemType === constFlag.itemList.delFiles) { //如果是menu组件选中的是删除item项,则不展示内容
    editorSelected.value = editorFlag.blank
    return
  }

  const noteId = info.id
  if (info.isile === '0') {
    editorSelected.value = editorFlag.blank
  } else {
    if (info.type === 'md') {
      editorSelected.value = editorFlag.markdwon
      mdNoteId.value = noteId
    } else if (info.type === 'wer') {
      werNoteId.value = noteId
      editorSelected.value = editorFlag.wangEditor
    } else if (
        info.type === 'jpg'  ||
        info.type === 'jpeg' ||
        info.type === 'png') {
      imgNoteId.value = noteId
      editorSelected.value = editorFlag.img
    } else if(info.type === 'pdf') {
      pdfNoteId.value = noteId
      editorSelected.value = editorFlag.pdf
    } else if (info.type === 'docx') {
      wordNoteId.value = noteId
      editorSelected.value = editorFlag.doc
    } else if (info.type === 'xlsx') {
      excelNoteId.value = noteId
      editorSelected.value = editorFlag.excel
    }
    else {
      // editorSelected.value = editorFlag.notSupport

      noteApi.noteContentCanPreview({id: noteId}).then(res => {
        const data = res.data
        if (data.success === true) {
          textNoteId.value = noteId
          editorSelected.value = editorFlag.textPreview
          return
        }
        editorSelected.value = editorFlag.notSupport
      }).catch(err => {
        editorSelected.value = editorFlag.notSupport
      })
    }
  }

}


const setContainerHeight = () => {
  const windowHeight = window.innerHeight
  const divHeight = document.querySelector(".container")
  divHeight.style.height = windowHeight + 'px'
}
window.onload = setContainerHeight
window.onresize = setContainerHeight

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
          v-if="editorSelected === editorFlag.markdwon">
      </MarkdownEditorPanel>
      <WangEditor
          :noteid="werNoteId"
          v-if="editorSelected === editorFlag.wangEditor">
      </WangEditor>
      <ImageViewer
          :noteid="imgNoteId"
          v-if="editorSelected === editorFlag.img">
      </ImageViewer>
      <PdfViewer
          :noteid="pdfNoteId"
          v-if="editorSelected === editorFlag.pdf">
      </PdfViewer>
      <WordViewer
          :noteid="wordNoteId"
          v-if="editorSelected === editorFlag.doc"></WordViewer>
      <ExcelViewer
          :noteid="excelNoteId"
          v-if="editorSelected === editorFlag.excel"></ExcelViewer>
      <TinyMCEPanel
          v-if="editorSelected === editorFlag.tiny"></TinyMCEPanel>
      <MarkdownPreview
          :noteid="textNoteId"
          v-if="editorSelected === editorFlag.textPreview"></MarkdownPreview>
      <NotSupportEditor v-if="editorSelected === editorFlag.notSupport"></NotSupportEditor>
    </div>
  </div>
</template>

<style scoped>

.container {
  display: grid;
  grid-template-columns: 1fr 1fr 4fr;
}

.file {
  background-color: #FAFAFA;
  -webkit-user-select: none;
  -moz-user-select: none;
  -o-user-select: none;
  user-select: none;

}

</style>
