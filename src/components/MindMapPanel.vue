<template>
  <button @click="clickShow">ClickMe</button>
  <button @click="saveData">保存</button>
  <div class="mind-map">
    <mindmap
        v-if="reLoadF"
        v-model="data"
        :edit="true"
        :ctm="true"
        :zoom="true"
        :fit-btn="true"
        :download-btn="true"
        :timetravel="true"
        :center-btn="true"
        :drag="true"
        :branch="1"
        :x-gap="30"
        :y-gap="10"
    >

    </mindmap>
  </div>
</template>

<script setup>
import mindmap from 'vue3-mindmap'
import 'vue3-mindmap/dist/style.css'
import {ref, watch} from 'vue'
import {RemoteApi as noteApi} from '../api/RemoteApi'
import {message} from "ant-design-vue";


const props = defineProps(['noteid'])

const data = ref([{name: '新建标题01', children: []}])

const reLoadF = ref(false)

watch(() => props.noteid, (noteidNew, noteidOld) => {
  noteApi.noteContentGet({id: noteidNew}).then(res => {
    const resData = res.data
    if (resData.respCode === 0) {
      reLoadF.value = false
      let jsObj = JSON.parse(resData.datas.content)
      data.value = []
      for (let dt of jsObj.content) {
        data.value.push(dt)
      }
      reLoadF.value = true
      console.log(jsObj)
    }
  }).catch(err => {
    message.error("获取预览内容信息失败")
    console.error(err)
  })
}, {immediate: true})

const clickShow = () => {
  console.log(data.value)
}


const saveData = () => {
  const subData = {id: props.noteid, content: data.value}
  noteApi.mindMapSave({id: props.noteid, content: JSON.stringify(subData)}).then(res => {
    const resData = res.data
    if (resData.respCode === 0) {
      message.success("save成功")
    }
  }).catch(err => {
    message.error("报错mindMap失败")
    console.error(err)
  })
}

</script>

<style scoped>

.mind-map {
  height: 100vh;
}

</style>
