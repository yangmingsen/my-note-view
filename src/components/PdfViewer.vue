<template>
  <div class="pdf-sty">
    <VuePdfEmbed annotation-layer text-layer :source="pdfSource" />
  </div>
</template>

<script setup>
//https://www.chinatax.gov.cn/download/pdf/bszn/21.pdf
import VuePdfEmbed from 'vue-pdf-embed'
// optional styles
import 'vue-pdf-embed/dist/styles/annotationLayer.css'
import 'vue-pdf-embed/dist/styles/textLayer.css'

import {ref, onMounted, watch} from "vue";
import {RemoteApi as noteApi} from "../api/RemoteApi";
import {message} from "ant-design-vue";

// either URL, Base64, binary, or document proxy
const pdfSource = ref('')

const props = defineProps(['noteid'])


watch(() => props.noteid, (noteidNew, noteidOld) => {
  noteApi.getNoteAndSite({id: noteidNew}).then(res => {
    const noteFile = res.data.datas.noteFile
    pdfSource.value = noteFile.url
  }).catch(err => {
    message.error("获取pdf信息失败")
    console.error(err)
  })
}, {immediate: true})


</script>

<style scoped>
 .pdf-sty {
    max-width: 100%;
    height: 900px;
    overflow-y: auto;
 }
</style>
