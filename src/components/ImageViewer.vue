<template>
  <div class="img-cls">
    <viewer :images="images">
      <img v-for="src in images" :key="src" :src="src" class="img-sty">
    </viewer>
  </div>
</template>

<script setup>
import {ref, watch} from 'vue'
import { api as viewerApi } from "v-viewer"
import { message  } from 'ant-design-vue'
import {RemoteApi as noteApi} from "../api/RemoteApi"

const props = defineProps(['noteid'])


watch(() => props.noteid, (noteidNew, noteidOld) => {
    noteApi.getNoteAndSite({id: noteidNew}).then(res => {
      const noteFile = res.data.datas.noteFile
      images.value = []
      images.value.push(noteFile.url)
      console.log(images.value)
    }).catch(err => {
      message.error("获取img信息失败")
      console.error(err)
    })
}, {immediate: true})

const  images = ref([
   "https://picsum.photos/200/200",
 ])




const show = () => {
  viewerApi({
    images: images.value,
  })
}

</script>

<style scoped>
.img-cls {
  height: 900px;
  overflow-y: hidden;
}

.img-sty {
  max-width: 100%;
}

</style>
