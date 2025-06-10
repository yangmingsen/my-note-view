<template>
  <div class="note-share">
    <div class="share-title">
      <h2>{{ title }}</h2>
    </div>
    <div class="share-content">
      <v-md-preview
          v-if="showType === editorFlag.markdwon"
          :text="noteContent"
      ></v-md-preview>
    </div>
  </div>
</template>

<script setup>
import {useRoute, useRouter} from 'vue-router'
import {onMounted, ref} from "vue";
import {RemoteApi as noteApi} from '../api/RemoteApi'
import {message} from "ant-design-vue";
import {ConstansFlag as constFlag} from '../js/ConstansFlag.js'

const editorFlag = constFlag.editorFlag

//当前路由
const route = useRoute()
const router = useRouter()
//当前路由笔记id
const noteId = route.params.noteId
//元数据
let noteMeta

//文章标题
const title = ref('')
//笔记数据
const noteContent = ref('')
//当前笔记类型
const showType = ref('')

const canShowSuffix = 'txt,cpp,txt,java,xml,go,html,css,js,ts,vue,json,c,scala,yml,cpp,py,bash,conf,ini,sql,cnf,iml,.gitignore'

const canShow = (curType) => {
  const c = canShowSuffix.indexOf(curType)
  if (c) {
    return true
  } else {
    return false
  }
}

//加载数据
const loadNoteData = () => {
  noteApi.shareNoteGet({noteId: noteId}).then(res => {
    const respData = res.data.datas
    if ( respData ) {
      noteMeta = respData.noteIndex
      title.value = noteMeta.name
      noteContent.value = respData.noteData.content
      //开启显示器
      const curNoteType = noteMeta.type
      if (curNoteType === constFlag.fileType.markdown) {
        showType.value = editorFlag.markdwon
      }
      if (canShow(curNoteType)) {
        showType.value = editorFlag.markdwon
      }
    }
  }).catch(err => {
    // message.error("获取分享数据失败")
    console.error(err)
  })
}

loadNoteData()


const setContainerHeight = () => {
  const windowHeight = window.innerHeight
  const divHeight = document.querySelector(".share-content")
  divHeight.style.height = windowHeight + 'px'
}

onMounted(() => {
  setContainerHeight()
})

</script>

<style scoped>

.note-share {
  min-height: 100vh;
}

.share-title {
  text-align: center;
}

.share-content {
  min-width: 100%;
  overflow-y: auto;
}
</style>