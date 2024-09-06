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
import MindMapPanel from './components/MindMapPanel.vue'
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
const mindMapNoteId = ref('')

const fileType = constFlag.fileType

const editorFlag = {
  markdwon: 0, wangEditor: 1,  blank: 2, notSupport: 3, img: 4,
  pdf: 5, doc: 6, excel: 7, tiny: 8, textPreview: 9, mindmap: 10
}
//当前选中的editor, 默认markdown
const editorSelected = ref(editorFlag.blank)

//当前选中的父目录, 由FileList组件传入, 通知到MenuList组件
const treeSelectKeys = ref('')

const chooseEditor = (info) => {
  if (info.curMenuItemType === constFlag.itemList.delFiles) { //如果是menu组件选中的是删除item项,则不展示内容
    editorSelected.value = editorFlag.blank
    showNoteTitleName.value = false
    return
  }

  //更新选中的父目录
  if (treeSelectKeys.value !== info.parentId) {
    treeSelectKeys.value = info.parentId
  }

  const noteId = info.id
  noteTitleName.value = info.name //更新标题
  showNoteTitleName.value = true
  if (info.isile === '0') {
    editorSelected.value = editorFlag.blank
    showNoteTitleName.value = false
  } else {
    if (info.type === fileType.markdown) {
      editorSelected.value = editorFlag.markdwon
      mdNoteId.value = noteId
    } else if (info.type === fileType.wer) {
      werNoteId.value = noteId
      editorSelected.value = editorFlag.wangEditor
    } else if (
        info.type === fileType.jpeg ||
        info.type === fileType.jpg ||
        info.type === fileType.png ) {
      imgNoteId.value = noteId
      editorSelected.value = editorFlag.img
    } else if(info.type === fileType.pdf) {
      pdfNoteId.value = noteId
      editorSelected.value = editorFlag.pdf
    } else if (info.type === fileType.docx) {
      wordNoteId.value = noteId
      editorSelected.value = editorFlag.doc
    } else if (info.type === fileType.xlsx) {
      excelNoteId.value = noteId
      editorSelected.value = editorFlag.excel
    } else if (info.type === fileType.mindmap) {
      mindMapNoteId.value = noteId
      editorSelected.value = editorFlag.mindmap
    } else {
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

const noteTitleName = ref('')
const showNoteTitleName = ref(false)

</script>

<template>
  <div class="container">
    <div class="menu">
      <MenuList :up-select-key="treeSelectKeys"></MenuList>
    </div>
    <div class="file">
      <FileList @choose-note="(info) => {chooseEditor(info)}"></FileList>
    </div>
    <div class="content">
      <h2 v-if="showNoteTitleName">{{noteTitleName}}</h2>
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
      <MindMapPanel
          :noteid="mindMapNoteId"
          v-if="editorSelected === editorFlag.mindmap"></MindMapPanel>
      <NotSupportEditor v-if="editorSelected === editorFlag.notSupport"></NotSupportEditor>
    </div>
  </div>
</template>

<style scoped>

.container {
  display: grid;
  grid-template-columns: 1fr 1fr 4fr;
  background-image: url('http://api.note.yms.top/note/file/view?id=66d9c9fe1d085541cc962801');
  background-size: cover; /* 使图片覆盖整个区域 */
  min-height: 100vh;
}


.menu {
  background-color: rgba(255, 255, 255, 0.8); /* 半透明背景颜色 */
}

.file {
  /*background-color: #FAFAFA;*/
  background-color: rgba(250, 250, 250, 0.8); /* 半透明背景颜色 */
  -webkit-user-select: none;
  -moz-user-select: none;
  -o-user-select: none;
  user-select: none;
}

.content {
  background-color: rgba(255, 255, 255, 0.8); /* 半透明背景颜色 */
  /* 解决编辑面板x方向内容太多时, 造成的布局失效问题*/
  overflow-x: auto;
}

</style>
