<template>
  <div class="excel-sty">
    <vue-office-excel
        :src="excelSrc"
        :options="excelOption"
        style="height: 100vh;"
        @rendered="renderedHandler"
        @error="errorHandler"
    />
  </div>
</template>

<script setup>
//引入VueOfficeExcel组件
import VueOfficeExcel from '@vue-office/excel'
//引入相关样式
import '@vue-office/excel/lib/index.css'

import {ref, watch} from 'vue'
import {message} from "ant-design-vue";
import {RemoteApi as noteApi} from "../api/RemoteApi";

const excelOption = {
  xls: false,       //预览xlsx文件设为false；预览xls文件设为true
  minColLength: 0,  // excel最少渲染多少列，如果想实现xlsx文件内容有几列，就渲染几列，可以将此值设置为0.
  minRowLength: 0,  // excel最少渲染多少行，如果想实现根据xlsx实际函数渲染，可以将此值设置为0.
  widthOffset: 10,  //如果渲染出来的结果感觉单元格宽度不够，可以在默认渲染的列表宽度上再加 Npx宽
  heightOffset: 10, //在默认渲染的列表高度上再加 Npx高
  beforeTransformData: (workbookData) => {return workbookData}, //底层通过exceljs获取excel文件内容，通过该钩子函数，可以对获取的excel文件内容进行修改，比如某个单元格的数据显示不正确，可以在此自行修改每个单元格的value值。
  transformData: (workbookData) => {return workbookData}, //将获取到的excel数据进行处理之后且渲染到页面之前，可通过transformData对即将渲染的数据及样式进行修改，此时每个单元格的text值就是即将渲染到页面上的内容
}

const excelSrc = ref('')

const props = defineProps(['noteid'])

watch(() => props.noteid, (noteidNew, noteidOld) => {
  noteApi.getNoteAndSite({id: noteidNew}).then(res => {
    const noteFile = res.data.datas.noteFile
    excelSrc.value = noteFile.url
  }).catch(err => {
    message.error("获取excel信息失败")
    console.error(err)
  })
}, {immediate: true})

const renderedHandler = () => {
  // message.error("excel渲染完成")
}

const errorHandler = () => {
  message.error("excel渲染失败")
}

</script>

<style scoped>
.excel-sty {
  max-width: 100%;
}
</style>
