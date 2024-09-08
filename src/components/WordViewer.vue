<template>
  <div class="word-sty">
    <vue-office-docx
        :src="srcValue"
        style="height: 95vh;"
        @rendered="renderedHandler"
        @error="errorHandler"
    />
  </div>
</template>

<script setup>
//引入VueOfficeDocx组件
import VueOfficeDocx from '@vue-office/docx'
//引入相关样式
import '@vue-office/docx/lib/index.css'

import {ref, watch} from 'vue'
import {RemoteApi as noteApi} from "../api/RemoteApi";
import {message} from "ant-design-vue";

const props = defineProps(['noteid'])

const srcValue = ref('')

watch(() => props.noteid, (noteidNew, noteidOld) => {
  noteApi.getNoteAndSite({id: noteidNew}).then(res => {
    const noteFile = res.data.datas.noteFile
    srcValue.value = noteFile.url
  }).catch(err => {
    message.error("获取word信息失败")
    console.error(err)
  })
}, {immediate: true})

const renderedHandler = () => {
  // message.error("word渲染完成")
}

const errorHandler = () => {
  message.error("word渲染失败")
}

</script>

<style scoped>
.word-sty {
  max-width: 100%;
}
</style>
