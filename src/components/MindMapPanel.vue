<template>
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
import {useNotifySaveStore} from "../store/useNotifySaveStore";


const props = defineProps(['noteid'])

const data = ref([{name: '新建标题01', children: []}])

const reLoadF = ref(false)

watch(() => props.noteid, (noteidNew, noteidOld) => {
  reLoadF.value = false
  noteApi.noteContentGet({id: noteidNew}).then(res => {
    const resData = res.data
    if (resData.respCode === 0) {
      let jsObj = JSON.parse(resData.datas.content)
      data.value = jsObj.content
      reLoadF.value = true
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

const notifySaveStore = useNotifySaveStore();
notifySaveStore.$subscribe((mutation, state) => {
  saveData()
})

</script>

<style scoped>

.mind-map {
  height: 90vh;
}

</style>
