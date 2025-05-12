<template>
  <div  style="border: 1px solid #ccc;">
    <Toolbar
        style="border-bottom: 1px solid #ccc"
        :editor="editorRef"
        :defaultConfig="toolbarConfig"
        :mode="mode"
    />
    <Editor
        style="height: 95vh; overflow-y: hidden;"
        v-model="valueHtml"
        :defaultConfig="editorConfig"
        :mode="mode"
        @onCreated="handleCreated"
    />
  </div>
</template>

<script setup>
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import {onBeforeUnmount, ref, shallowRef, onMounted, watch} from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { message  } from 'ant-design-vue';
import {RemoteApi as noteApi} from "../api/RemoteApi";
import {hex_md5} from '../js/encryptionAlgorithm.js'
import {ConstansFlag as constansFlag, ConstansFlag as constFlag} from '../js/ConstansFlag.js'
import {useNotifySaveStore} from "../store/useNotifySaveStore";

const props = defineProps(['noteid'])

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()
// 内容 HTML
const valueHtml = ref('')

let taskRef = undefined;
//组件挂载后
onMounted(() => {
  taskRef = setInterval(() => {
    saveContent({id: props.noteid, content: getCurContent()})
  }, 60*1000)
})


const notifySave = () => {
  saveContent({id: props.noteid, content: getCurContent(), op: 1})
}

//监听保存
const notifySaveStore = useNotifySaveStore();
notifySaveStore.$subscribe((mutation, state) => {
  notifySave()
})

const toolbarConfig = {}
const editorConfig = {placeholder: '请输入内容...',  MENU_CONF: {}}
const mode = ref('default') // 或 'simple'

// const customPaste = (editor, event) => {
//   const html = event.clipboardData.getData('text/html') // 获取粘贴的 html
//
//   const text = event.clipboardData.getData('text/plain') // 获取粘贴的纯文本
//   // editor.dangerouslyInsertHtml(html)
//
//   // 阻止默认的粘贴行为
//   // event.preventDefault()
//   return true
// }

// 修改 uploadImage 菜单配置
editorConfig.MENU_CONF['uploadImage'] = {
  server: constFlag.apiUrl+'/file/upload',
  fieldName: 'file',
  // 继续写其他配置...
  // 单个文件的最大体积限制，默认为 2M
  maxFileSize: 2 * 1024 * 1024, // 1M

  // 最多可上传几个文件，默认为 100
  maxNumberOfFiles: 10,

  // 选择文件时的类型限制，默认为 ['image/*'] 。如不想限制，则设置为 []
  allowedFileTypes: [],

  // 自定义上传参数，例如传递验证的 token 等。参数会被添加到 formData 中，一起上传到服务端。
  meta: {
    // token: 'xxx',
    id: props.noteid
  },

  // 将 meta 拼接到 url 参数中，默认 false
  // metaWithUrl: false,

  // 自定义增加 http  header
  headers: {
    // Accept: 'text/x-json',
    token: localStorage.getItem("token"),
    Authorization: localStorage.getItem("token"),
  },

  // 跨域是否传递 cookie ，默认为 false
  withCredentials: true,

  // 超时时间，默认为 10 秒
  timeout: 5 * 1000, // 5 秒

  //【注意】不需要修改的不用写，wangEditor 会去 merge 当前其他配置
  // 上传之前触发
  // onBeforeUpload(file: File) { // TS 语法
  onBeforeUpload(file) {    // JS 语法
    // file 选中的文件，格式如 { key: file }
    return file

    // 可以 return
    // 1. return file 或者 new 一个 file ，接下来将上传
    // 2. return false ，不上传这个 file
  },

  // 上传进度的回调函数
  // onProgress(progress: number) {  // TS 语法
  onProgress(progress) {       // JS 语法
                               // progress 是 0-100 的数字
    console.log('progress', progress)
  },

  // 单个文件上传成功之后
  // onSuccess(file: File, res: any) {  // TS 语法
  onSuccess(file, res) {          // JS 语法
    console.log(`${file.name} 上传成功`, res)
  },

  // 单个文件上传失败
  // onFailed(file: File, res: any) {   // TS 语法
  onFailed(file, res) {           // JS 语法
    console.log(`${file.name} 上传失败`, res)
  },

  // 上传错误，或者触发 timeout 超时
  // onError(file: File, err: any, res: any) {  // TS 语法
  onError(file, err, res) {               // JS 语法
    console.log(`${file.name} 上传出错`, err, res)
  },
}

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  //退出前保存
  saveContent({id: props.noteid, content: getCurContent()})
  //取消定时任务
  clearInterval(taskRef)
  //销毁组件
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

const handleCreated = (editor) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}

const getCurContent = () => {
  const editor = editorRef.value
  const htmlContent = editor.getHtml()
  return htmlContent
}
const getTextContent = () => {
  const editor = editorRef.value
  const textContent = editor.getText()
  return textContent
}

watch(() => props.noteid,  (noteidNew, noteidOld) => {
  const param = {id: noteidNew};
  const tmpToken = localStorage.getItem(constansFlag.tmpToken);
  if (tmpToken !== undefined && tmpToken !== null) {
    param.tmpToken = tmpToken
    localStorage.removeItem(constansFlag.tmpToken)
  }
  noteApi.noteContentGet(param).then(res => {
    if (noteidOld !== undefined) {
      const id = noteidOld
      const oldData = getCurContent()
      const textContent = getTextContent()
      const latestVersion =  hex_md5(oldData)
      //如果没有修改过就不同步
      if (latestVersion !== serverDataVersion) {
        const para = {id: id, content: oldData, textContent: textContent, type: "wer"}
        noteApi.noteContentAddAndUpdate(para).then(res => {
          message.success("同步成功")
        }).catch(err => {
          message.error("同步失败")
          console.error(err)
        })
      }
    }

    const resData = res.data.datas
    if (resData == null || resData.content === undefined || resData.content.trim().length === 0) {
      message.warning("获取内容为空")
      valueHtml.value = ''
    } else {
      valueHtml.value = ''
      valueHtml.value = resData.content
      serverDataVersion = hex_md5(resData.content)
    }

  }).catch(err => {
    message.error("获取内容出错")
    console.error(err)
  })
},{immediate: true})

//保存服务器最新版本号
let serverDataVersion = '';


const saveContent = (info) => {
  const noteId = info.id
  const syncData = getCurContent()
  const textContent = getTextContent();
  const latestVersion =  hex_md5(syncData)
  //如果没有修改过就不同步
  if (latestVersion === serverDataVersion) {
    //版本相同不同步
    if (info.op !== undefined && info.op === 1) {
      message.warning("版本相同不同步")
    }
    return
  }
  serverDataVersion = latestVersion
  const para = {id: noteId, content: syncData, textContent: textContent, type: "wer"}
  noteApi.noteContentAddAndUpdate(para).then(res => {
    message.success("同步成功")
  }).catch(err => {
    message.error("同步失败")
    console.error(err)
  })
}

</script>

<style scoped>

</style>
