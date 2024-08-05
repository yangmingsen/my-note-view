<template>
  <v-md-editor v-model="dataText" height="900px"></v-md-editor>
</template>

<script setup>
import {ref, watch, onBeforeUnmount } from 'vue'
import { message  } from 'ant-design-vue'
import {RemoteApi as noteApi} from "../api/RemoteApi"
import {hex_md5} from '../store/encryptionAlgorithm.js'

const props = defineProps(['noteid'])

//数据
const dataText = ref('')

// 组件销毁时
onBeforeUnmount(() => {
  //退出前保存
  saveContent({id: props.noteid, content: dataText.value})
})

watch(() => props.noteid, (noteidNew, noteidOld) => {
  noteApi.noteContentGet({id: noteidNew}).then(res => {
    if (noteidOld != undefined) {
      const id = noteidOld;
      const oldData = dataText.value;
      const latestVersion =  hex_md5(oldData)
      //如果没有修改过就不同步
      if (latestVersion != serverDataVersion) {
        const para = {id: id, content: oldData}
        noteApi.noteContentAddAndUpdate(para).then(res => {
          message.success("md同步成功")
        }).catch(err => {
          message.error("md同步失败")
          console.error(err)
        })
      } else {
        message.warning("md版本相同不同步")
      }
    }

    const resData = res.data.datas
    if (resData == null || resData.content == undefined || resData.content.trim().length == 0) {
      message.warning("获取md内容为空")
      dataText.value = ''
    } else {
      dataText.value = resData.content
      serverDataVersion = hex_md5(dataText.value)
    }
  }).catch(err => {
    message.error("获取md内容出错")
    console.error(err)
  })

},{immediate: true})




//保存服务器最新版本号
let serverDataVersion = '';
const saveContent = (info) => {
  const noteId = info.id
  const syncData = info.content
  const latestVersion =  hex_md5(syncData)
  console.log(latestVersion+"----"+serverDataVersion)
  //如果没有修改过就不同步
  if (latestVersion == serverDataVersion) {
    message.warning("md版本相同不同步")
    //版本相同不同步
    return
  }
  const para = {id: noteId, content: syncData}
  noteApi.noteContentAddAndUpdate(para).then(res => {
    message.success("md同步成功")
  }).catch(err => {
    message.error("md同步失败")
    console.error(err)
  })
}


</script>

<style scoped>

</style>
