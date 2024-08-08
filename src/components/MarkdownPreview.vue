<template>
  <div class="text-preview">
    <v-md-preview
        :text="previewText"
    ></v-md-preview>
  </div>

</template>

<script setup>
import {ref, watch, onMounted} from 'vue'
import {RemoteApi as noteApi} from '../api/RemoteApi'
import {message} from "ant-design-vue";
const props = defineProps(['noteid'])
const previewText = ref('')

watch(() => props.noteid, (noteidNew, noteidOld) => {
  noteApi.noteContentGet({id: noteidNew}).then(res => {
    const resData = res.data.datas
    previewText.value = resData.content
  }).catch(err => {
    message.error("获取预览内容信息失败")
    console.error(err)
  })
}, {immediate: true})



onMounted(() => {
  setContainerHeight()
})

const setContainerHeight = () => {
  const windowHeight = window.innerHeight
  const divHeight = document.querySelector(".text-preview")
  divHeight.style.height = windowHeight + 'px'
}
// window.onload = setContainerHeight
// window.onresize = setContainerHeight

</script>

<style scoped>
.text-preview {
  overflow-y: auto;
}
</style>
