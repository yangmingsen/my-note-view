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
      <Editor
          v-if="showType === editorFlag.wangEditor"
          style="height: 95vh; overflow-y: hidden;"
          v-model="noteContent"
          :defaultConfig="editorConfig"
          :mode="mode"
          @onCreated="handleCreated"
      />
    </div>
  </div>
</template>

<script setup>
import {useRoute, useRouter} from 'vue-router'
import {onMounted, ref, shallowRef} from "vue";
import {RemoteApi as noteApi} from '../api/RemoteApi'
import {message} from "ant-design-vue";
import {ConstansFlag as constFlag} from '../js/ConstansFlag.js'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

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

const canShowSuffix = 'cpp,txt,java,xml,go,html,css,js,ts,vue,json,c,scala,yml,cpp,py,bash,conf,ini,sql,cnf,iml,.gitignore'

const canShow = (curType) => {
  const c = canShowSuffix.indexOf(curType)
  if (c >= 0) {
    return true
  } else {
    return false
  }
}

const getReqUrl = () => {
  const hostname = window.location.hostname
  const port = window.location.port
  let realPort = undefined
  if (port === 5173 || port === '5173') {
    realPort = '9103' //dev port
  }
  if (port === 9090 || port === '9090') {
    realPort = '9003' // prov port
  }
  const reqUrl = `http://${hostname}:${realPort}/note`
  // console.log(reqUrl)
  return reqUrl
}

//加载数据
const loadNoteData = () => {
  const reqUrl = getReqUrl()
  noteApi.shareNoteGet(reqUrl, {noteId: noteId}).then(res => {
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
      if (curNoteType === constFlag.fileType.wer) {
        showType.value = editorFlag.wangEditor
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

//wang editor
const editorConfig = {placeholder: '',  MENU_CONF: {},  readOnly: true}

const mode = ref('simple') // 或 'simple' / 'default'

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

const handleCreated = (editor) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}


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