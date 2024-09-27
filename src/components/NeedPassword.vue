<template>
  <div class="pd-main">
    <div class="pd-content">
      <div class="pd-tips">
        <span v-if="showErrorTips"> 密码错误，请重新输入</span>
      </div>
      <div class="pd-container">
        <input type="password" v-model="authPass" class="pd-input" placeholder="请输入阅读密码">
        <button class="pd-button" @click="doPassAuth">确定</button>
      </div>
      <div><a href="#">取消阅读密码</a></div>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue'
import {RemoteApi as noteApi} from '../api/RemoteApi'
import {message} from "ant-design-vue";


const props = defineProps(['noteid'])

const emitT = defineEmits(['choose-note'])

const showErrorTips = ref(false)
const authPass = ref('')


const doPassAuth = () => {
  noteApi.notePasswordAuth({id: props.noteid, password: authPass.value}).then(res => {
    const resData = res.data
    if (resData.respCode === 0) {
      const noteIndex = resData.datas
      noteIndex.encrypted = '0'
      emitT('choose-note', noteIndex)
    } else {
      showErrorTips.value = true
    }
  }).catch(err => {
    message.error("认证失败")
    console.error(err)
  })
}

</script>

<style scoped>
.pd-main {
  display: grid;
  grid-template-columns: 2fr 1fr 2fr;
  grid-template-rows: 1fr 1fr 1fr;
  min-height: 100vh;
}

.pd-content {
  grid-column: 2 / 3;
  grid-row: 2 / 3;
}

.pd-container {
  width: 100%; /* 长方形的宽度 */
  height: 50px; /* 长方形的高度 */
  border: 1px solid #ccc;
  display: flex; /* 使用 flexbox 布局 */
  align-items: center; /* 垂直居中 */
  padding: 0; /* 去掉内边距 */
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
}
.pd-input {
  flex: 1; /* 输入框占据剩余空间 */
  border: none; /* 移除输入框的边框 */
  outline: none; /* 移除输入框的焦点样式 */
  padding: 0 5px; /* 设置左右内边距 */
  height: 100%; /* 输入框高度与外层相同 */
  font-size: 1rem;
}

.pd-button {
  padding: 0 10px; /* 按钮的内边距 */
  border: none; /* 移除按钮的边框 */
  cursor: pointer; /* 鼠标悬停时显示为指针 */
  height: 100%; /* 按钮高度与外层相同 */
  width: 30%;
  background-color: #5576BD; /* 默认按钮颜色 */
  transition: background-color 0.3s; /* 添加过渡效果 */
  color: white;
  font-size: small;
}
.pd-button:hover {
  background-color: #445E97; /* 鼠标悬停时的颜色 */
}
.pd-button:active {
  background-color: #b0b0b0; /* 点击时的颜色 */
}

.pd-tips {
  color: red;
  font-size: 1rem;
  height: 25px;
}
</style>
