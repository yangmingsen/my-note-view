<template>
  <v-md-editor
      v-model="dataText"
      :mode="editorMode"
      height="95vh"
      :disabled-menus="[]"
      @save="manualSave"
      @upload-image="handleUploadImage"
  ></v-md-editor>
  <a-float-button-group
      v-if="showPreviewFun"
      trigger="click" type="primary" :style="{ right: '94px' }">
    <a-float-button @click="doEditor">
      <template #icon>
        <EditOutlined />
      </template>
    </a-float-button>
  </a-float-button-group>
</template>

<script setup>
import {ref, watch, onBeforeUnmount, onMounted } from 'vue'
import { message  } from 'ant-design-vue'
import { EditOutlined, CompressOutlined } from '@ant-design/icons-vue';
import {RemoteApi as noteApi} from "../api/RemoteApi"
import {hex_md5} from '../js/encryptionAlgorithm.js'
import {useNotifySaveStore} from "../store/useNotifySaveStore";

//props变量
const props = defineProps(['noteid'])



const editorModeConst = {edit: 'edit', editable: 'editable', preview: 'preview'}
//模式, 默认预览
const editorMode = ref(editorModeConst.preview)

// 是否显示预览模式下的按钮
const showPreviewFun = ref(true)

const doEditor = () => {
  editorMode.value = editorModeConst.editable
  showPreviewFun.value = false
}

//数据
const dataText = ref('')

let taskRef = undefined;
//组件挂载后
onMounted(() => {
  taskRef = setInterval(() => {
      saveContent({id: props.noteid, content: dataText.value})
  }, 90*1000)
})

// 组件销毁时
onBeforeUnmount(() => {
  //退出前保存
  saveContent({id: props.noteid, content: dataText.value})

  //取消定时任务
  clearInterval(taskRef)
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
        // message.warning("md版本相同不同步")
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

//处理文件上传
const handleUploadImage = (event, insertImage, files) => {
  // 拿到 files 之后上传到文件服务器，然后向编辑框中插入对应的内容
  const file = files[0]
  noteApi.fileUpload({file: file, id: props.noteid}).then(res => {
    const resData = res.data;
    if (resData.respCode === 0) {
      // 此处只做示例
      insertImage({
        url: resData.datas.url,
        desc: resData.datas.alt,
        // width: 'auto',
        // height: 'auto',
      });
    }
  }).catch(err => {
    console.error(err)
    message.error("上传文件错误..")
  })

}

//保存服务器最新版本号
let serverDataVersion = '';
const saveContent = (info) => {
  const noteId = info.id
  const syncData = info.content
  const latestVersion =  hex_md5(syncData)
  //如果没有修改过就不同步
  if (latestVersion === serverDataVersion) {
    // message.warning("md版本相同不同步")
    //版本相同不同步
    if (info.op !== undefined && info.op === 1) {
      message.warning("版本相同不同步")
    }
    return
  }
  const para = {id: noteId, content: syncData}
  noteApi.noteContentAddAndUpdate(para).then(res => {
    message.success("md同步成功")
    serverDataVersion = latestVersion
  }).catch(err => {
    message.error("md同步失败")
    console.error(err)
  })
}


//手动保存
const manualSave = (text, html) => {
  saveContent({id: props.noteid, content: text, op: 1})
}

//自动保存
const autoSave = () => {
  saveContent({id: props.noteid, content: dataText.value})
}

const notifySave = () => {
  saveContent({id: props.noteid, content: dataText.value, op: 1})
}

//监听保存
const notifySaveStore = useNotifySaveStore();
notifySaveStore.$subscribe((mutation, state) => {
  notifySave()
})




</script>

<style scoped>

</style>
